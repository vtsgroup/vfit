/**
 * workers/api/users.ts
 *
 * users.ts — Dados base do usuário autenticado
 * Features: DB: Neon
 */

// ============================================
// users.ts — Dados base do usuário autenticado
// ============================================
//
// O que faz:
//   Endpoints do usuário logado: dados completos, atualização de perfil,
//   upload de foto (presigned URL para R2), exclusão LGPD-compliant
//   (anonimização) e exportação de dados pessoais (Art. 18, V LGPD).
//
// Exports principais:
//   usersRoutes — Hono app montado em /api/v1/users
//
// Auth: requireAuth em todas as rotas
// DB: users, personals ou students (conforme userType)
// Side effects: upload de foto para R2_IMAGES via presigned URL
// ============================================

import { Hono } from 'hono'
import { z } from 'zod'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { updateUserSchema, uploadPhotoSchema } from '@workers/schemas/users'
import { pgQuery, generateId } from '@lib/db'
import { success, noContent } from '@lib/response'
import { NotFoundError, BadRequestError } from '@lib/errors'

const users = new Hono<AppContext>()

const updateOnboardingSchema = z.object({
  has_completed_onboarding: z.boolean().optional(),
  current_step: z.number().int().min(1).max(4).optional(),
  completed_steps: z.array(z.number().int().min(1).max(4)).max(4).optional(),
  skipped_steps: z.array(z.number().int().min(1).max(4)).max(4).optional(),
})

const DEFAULT_PUBLIC_IMAGES_BASE = 'https://images.iapersonal.app.br'

function normalizePublicImagesBase(raw: string | undefined | null): string {
  const v = String(raw || '').trim()
  if (!v) return DEFAULT_PUBLIC_IMAGES_BASE

  // Add scheme if missing
  const withScheme = v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`

  try {
    const u = new URL(withScheme)

    // Guard against invalid hostnames like "profiles" (no dot) that break CSP + DNS.
    const host = u.hostname
    const isLocal = host === 'localhost' || host.endsWith('.localhost')
    const looksInvalid = !isLocal && !host.includes('.')

    if (looksInvalid) return DEFAULT_PUBLIC_IMAGES_BASE

    // Strip trailing slashes
    return `${u.origin}${u.pathname}`.replace(/\/+$/, '')
  } catch {
    return DEFAULT_PUBLIC_IMAGES_BASE
  }
}

async function insertAuditLog(
  env: Bindings,
  input: {
    actorUserId: string | null
    actorRole: string
    action: string
    targetType?: string
    targetId?: string
    metadata?: Record<string, unknown>
    ipAddress?: string | null
    userAgent?: string | null
    requestId?: string
  }
): Promise<void> {
  try {
    await pgQuery(
      env,
      `
        INSERT INTO audit_log (
          actor_user_id,
          actor_role,
          action,
          target_type,
          target_id,
          metadata,
          ip_address,
          user_agent,
          request_id
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
      `,
      [
        input.actorUserId,
        input.actorRole,
        input.action,
        input.targetType || null,
        input.targetId || null,
        JSON.stringify(input.metadata || {}),
        input.ipAddress || null,
        input.userAgent || null,
        input.requestId || null,
      ]
    )
  } catch (err) {
    // best-effort
    console.error('[Users] Failed to write audit_log:', err)
  }
}

// Todas rotas requerem auth
users.use('*', authMiddleware)

// ============================================
// GET /users/me — Dados completos (user + profile)
// ============================================
users.get('/me', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')

  const user = await findUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  let profile = null
  if (userType === 'personal') {
    profile = await findPersonalProfile(c.env, userId)
  } else {
    profile = await findStudentProfile(c.env, userId)
  }

  return success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      cpf: user.cpf,
      phone: user.phone,
      user_type: user.user_type,
      profile_photo_url: user.profile_photo_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    profile,
  })
})

// ============================================
// GET /users/me/onboarding — estado do onboarding (personal)
// ============================================
users.get('/me/onboarding', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')

  if (userType !== 'personal') {
    throw new BadRequestError('Onboarding disponível apenas para personal')
  }

  const user = await findUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  const onboarding = readOnboardingState(user.metadata)

  return success({ onboarding })
})

// ============================================
// PATCH /users/me/onboarding — atualizar estado onboarding (personal)
// ============================================
users.patch('/me/onboarding', async (c) => {
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const requestId = c.get('requestId')
  const userType = c.get('userType')
  const body = await c.req.json()
  const parsed = updateOnboardingSchema.parse(body)

  if (userType !== 'personal') {
    throw new BadRequestError('Onboarding disponível apenas para personal')
  }

  const fields = Object.entries(parsed).filter(([, value]) => value !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const user = await findUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  const now = new Date().toISOString()
  const current = readOnboardingState(user.metadata)

  const merged = {
    ...current,
    ...parsed,
    updated_at: now,
  }

  if (parsed.has_completed_onboarding === true && !current.completed_at) {
    merged.completed_at = now
    merged.current_step = 4
  }

  const metadataPatch = JSON.stringify({ onboarding: merged })

  await pgQuery(
    c.env,
    `UPDATE users
     SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
         updated_at = $2
     WHERE id = $3`,
    [metadataPatch, now, userId]
  )

  await insertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || userType,
    action: 'users.onboarding_updated',
    targetType: 'user',
    targetId: userId,
    metadata: {
      changed_fields: Object.keys(parsed),
      has_completed_onboarding: merged.has_completed_onboarding,
      current_step: merged.current_step,
    },
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({ onboarding: merged })
})

// ============================================
// PATCH /users/me — Atualizar dados base
// ============================================
users.patch('/me', async (c) => {
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const userType = c.get('userType')
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = updateUserSchema.parse(body)

  // Nada para atualizar?
  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  // Construir SET clause dinâmico
  const setClauses: string[] = []
  const params: unknown[] = []
  let paramIdx = 1

  for (const [key, value] of fields) {
    setClauses.push(`${key} = $${paramIdx}`)
    params.push(value)
    paramIdx++
  }

  setClauses.push(`updated_at = $${paramIdx}`)
  params.push(new Date().toISOString())
  paramIdx++

  params.push(userId) // WHERE id = $N

  await pgQuery(c.env, `
    UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIdx - 1 + 1}
  `.replace(`$${paramIdx - 1 + 1}`, `$${paramIdx}`), [...params.slice(0, -1), params[params.length - 1]])

  // Buscar user atualizado
  const updated = await findUserById(c.env, userId)

  await insertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || userType,
    action: 'users.profile_updated',
    targetType: 'user',
    targetId: userId,
    metadata: {
      changed_fields: fields.map(([key]) => key),
    },
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({
    user: {
      id: updated!.id,
      email: updated!.email,
      full_name: updated!.full_name,
      phone: updated!.phone,
      profile_photo_url: updated!.profile_photo_url,
      updated_at: updated!.updated_at,
    },
  })
})

// ============================================
// DELETE /users/me — LGPD-compliant account deletion
// Anonimiza dados pessoais (Art. 16 LGPD) mas mantém
// registros financeiros por 5 anos (obrigação fiscal)
// ============================================
users.delete('/me', async (c) => {
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const userType = c.get('userType')
  const requestId = c.get('requestId')
  const now = new Date().toISOString()
  const anonId = `anon_${generateId().slice(0, 8)}`

  // 1. Anonimizar dados do usuário (substituir PII)
  await pgQuery(c.env, `
    UPDATE users SET
      full_name = $1,
      email = $2,
      cpf = '000.000.000-00',
      phone = NULL,
      password_hash = NULL,
      profile_photo_url = NULL,
      is_active = false,
      metadata = jsonb_build_object(
        'lgpd_deleted', true,
        'deleted_at', $3,
        'original_type', user_type
      ),
      updated_at = $3
    WHERE id = $4
  `, [`Usuário Removido`, `${anonId}@deleted.iapersonal.app.br`, now, userId])

  // 2. Anonimizar dados de perfil
  if (userType === 'personal') {
    await pgQuery(c.env, `
      UPDATE personals SET
        cref = 'DELETED',
        cref_state = 'XX',
        bio = NULL,
        specialties = '{}',
        public_url_slug = NULL,
        is_public_profile = false,
        updated_at = $1
      WHERE id = $2
    `, [now, userId])
  } else {
    await pgQuery(c.env, `
      UPDATE students SET
        medical_restrictions = NULL,
        goals = '{}',
        status = 'inactive',
        updated_at = $1
      WHERE id = $2
    `, [now, userId])
  }

  // 3. Remover fotos do R2 (best-effort)
  try {
    const listed = await c.env.R2_IMAGES.list({ prefix: `profiles/${userId}/` })
    for (const obj of listed.objects) {
      await c.env.R2_IMAGES.delete(obj.key)
    }
  } catch { /* best-effort */ }

  // 4. Revogar sessões (KV)
  try {
    await c.env.KV_SESSIONS.delete(`session:${userId}`)
  } catch { /* best-effort */ }

  // 5. Log de exclusão LGPD (audit trail)
  await pgQuery(c.env, `
    INSERT INTO notifications (id, user_id, type, title, message, link, sent_via, read_at, created_at)
    VALUES ($1, $2, 'system', 'Conta excluída (LGPD)', 'Dados pessoais anonimizados conforme Art. 16 da LGPD', NULL, '{in_app}', $3, $3)
  `, [generateId(), userId, now])

  await insertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || userType,
    action: 'users.account_deleted_lgpd',
    targetType: 'user',
    targetId: userId,
    metadata: {
      anonymized: true,
      user_type: userType,
    },
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return noContent()
})

// ============================================
// GET /users/me/data-export — LGPD Data Portability (Art. 18, V)
// Retorna todos os dados do usuário em formato JSON estruturado
// ============================================
users.get('/me/data-export', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')

  const user = await findUserById(c.env, userId)
  if (!user) throw new NotFoundError('Usuário')

  // Dados base do usuário
  const exportData: Record<string, unknown> = {
    _meta: {
      exported_at: new Date().toISOString(),
      format: 'JSON',
      version: '1.0',
      legal_basis: 'LGPD Art. 18, V — Portabilidade de dados',
      controller: 'VFIT (Personal IA Tecnologia LTDA)',
      dpo_contact: 'dpo@iapersonal.app.br',
    },
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      user_type: user.user_type,
      profile_photo_url: user.profile_photo_url,
      email_verified: user.email_verified,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
  }

  // Perfil
  if (userType === 'personal') {
    const profile = await findPersonalProfile(c.env, userId)
    exportData.personal_profile = profile

    // Alunos do personal
    const { rows: students } = await pgQuery(c.env,
      'SELECT id, status, created_at FROM students WHERE personal_id = $1',
      [userId]
    )
    exportData.students = students

    // Treinos criados
    const { rows: workouts } = await pgQuery(c.env,
      'SELECT id, name, type, status, created_at FROM workouts WHERE personal_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    exportData.workouts_created = workouts

    // Avaliações criadas
    const { rows: assessments } = await pgQuery(c.env,
      'SELECT id, student_id, created_at FROM assessments WHERE personal_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    exportData.assessments_created = assessments

    // Pagamentos recebidos (sem dados sensíveis do Asaas)
    const { rows: payments } = await pgQuery(c.env,
      'SELECT id, amount, status, payment_method, created_at FROM payments WHERE recipient_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    exportData.payments = payments
  } else {
    const profile = await findStudentProfile(c.env, userId)
    exportData.student_profile = profile

    // Treinos do aluno
    const { rows: workouts } = await pgQuery(c.env,
      'SELECT id, name, type, status, created_at FROM workouts WHERE student_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    exportData.workouts = workouts

    // Logs de treino
    const { rows: logs } = await pgQuery(c.env,
      'SELECT id, workout_id, completed_at, duration_minutes, notes FROM workout_logs WHERE student_id = $1 ORDER BY completed_at DESC',
      [userId]
    )
    exportData.workout_logs = logs

    // Avaliações
    const { rows: assessments } = await pgQuery(c.env,
      `SELECT id, weight_kg, body_fat_percentage, notes, created_at
       FROM assessments WHERE student_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
    exportData.assessments = assessments

    // Badges
    const { rows: badges } = await pgQuery(c.env,
      'SELECT id, badge_type, earned_at FROM student_badges WHERE student_id = $1 ORDER BY earned_at DESC',
      [userId]
    )
    exportData.badges = badges

    // Pagamentos feitos
    const { rows: payments } = await pgQuery(c.env,
      'SELECT id, amount, status, payment_method, created_at FROM payments WHERE payer_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    exportData.payments = payments
  }

  // Notificações
  const { rows: notifications } = await pgQuery(c.env,
    'SELECT id, type, title, message, read_at, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    [userId]
  )
  exportData.notifications = notifications

  return success(exportData)
})

// ============================================
// POST /users/me/photo — Presigned URL para R2
// ============================================
users.post('/me/photo', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = uploadPhotoSchema.parse(body)

  const ext = parsed.content_type.split('/')[1] || 'jpg'
  const key = `profiles/${userId}/${generateId()}.${ext}`

  // Gerar multipart upload para R2
  // Workers R2 não tem presigned URL nativo — usamos put direto
  // O frontend enviará o file via POST /users/me/photo/upload
  const uploadUrl = `${c.env.R2_IMAGES_URL || ''}/api/v1/users/me/photo/upload`

  return success({
    upload_url: uploadUrl,
    key,
    content_type: parsed.content_type,
    method: 'PUT',
    max_size_mb: 20,
    instructions: 'Envie o arquivo via PUT para o upload_url com header Content-Type correto',
  })
})

// ============================================
// PUT /users/me/photo/upload — Upload direto R2
// ============================================
users.put('/me/photo/upload', async (c) => {
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const userType = c.get('userType')
  const requestId = c.get('requestId')
  const contentType = c.req.header('content-type') || 'image/jpeg'
  const key = c.req.query('key')

  if (!key || !key.startsWith(`profiles/${userId}/`)) {
    throw new BadRequestError('Key inválida ou não autorizada')
  }

  const body = await c.req.arrayBuffer()
  if (body.byteLength > 20 * 1024 * 1024) {
    throw new BadRequestError('Arquivo excede 20MB')
  }

  // Upload para R2
  await c.env.R2_IMAGES.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: { userId, uploadedAt: new Date().toISOString() },
  })

  // Atualizar URL no perfil do user
  const publicBase = normalizePublicImagesBase(c.env.R2_IMAGES_URL)
  const photoUrl = `${publicBase}/${key}`

  await pgQuery(c.env, `
    UPDATE users SET profile_photo_url = $1, updated_at = $2 WHERE id = $3
  `, [photoUrl, new Date().toISOString(), userId])

  await insertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || userType,
    action: 'users.profile_photo_updated',
    targetType: 'user',
    targetId: userId,
    metadata: {
      key,
      content_type: contentType,
    },
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({
    profile_photo_url: photoUrl,
    key,
  })
})

// ============================================
// PG QUERY HELPERS
// ============================================

interface UserRow {
  id: string
  email: string
  password_hash: string | null
  phone: string | null
  full_name: string
  cpf: string
  user_type: 'personal' | 'student'
  profile_photo_url: string | null
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  metadata: Record<string, unknown> | null
}

interface PersonalProfileRow {
  id: string
  cref: string
  cref_state: string
  cref_verified: boolean
  specialties: string[]
  bio: string | null
  public_url_slug: string | null
  subscription_plan: string
  subscription_status: string
  subscription_started_at: string | null
  subscription_expires_at: string | null
  trial_ends_at: string | null
  referral_code: string
  total_students: number
  active_students: number
  total_revenue: number
  is_public_profile: boolean
  show_testimonials: boolean
  show_transformations: boolean
  accepted_fee_percentage: number
  created_at: string
  updated_at: string
}

interface StudentProfileRow {
  id: string
  personal_id: string
  personal_name: string | null
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  goals: unknown
  medical_restrictions: string | null
  fitness_level: string | null
  status: string
  payment_status: string
  last_payment_date: string | null
  next_payment_date: string | null
  total_workouts_completed: number
  current_streak: number
  longest_streak: number
  total_badges: number
  photo_sharing_consent: boolean
  testimonial_consent: boolean
  created_at: string
  updated_at: string
}

interface OnboardingState {
  has_completed_onboarding: boolean
  current_step: number
  completed_steps: number[]
  skipped_steps: number[]
  completed_at: string | null
  updated_at: string | null
}

async function findUserById(env: Bindings, id: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(env, 'SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

async function findPersonalProfile(env: Bindings, id: string): Promise<PersonalProfileRow | null> {
  const { rows } = await pgQuery<PersonalProfileRow>(
    env,
    'SELECT * FROM personals WHERE id = $1 LIMIT 1',
    [id]
  )
  return rows[0] ?? null
}

async function findStudentProfile(env: Bindings, id: string): Promise<StudentProfileRow | null> {
  const { rows } = await pgQuery<StudentProfileRow>(
    env,
    `SELECT s.*, u.full_name as personal_name
     FROM students s
     LEFT JOIN users u ON u.id = s.personal_id
     WHERE s.id = $1 LIMIT 1`,
    [id]
  )
  return rows[0] ?? null
}

function readOnboardingState(metadata: Record<string, unknown> | null): OnboardingState {
  const onboarding = metadata && typeof metadata === 'object'
    ? (metadata.onboarding as Record<string, unknown> | undefined)
    : undefined

  return {
    has_completed_onboarding: onboarding?.has_completed_onboarding === true,
    current_step: Number(onboarding?.current_step) >= 1 && Number(onboarding?.current_step) <= 4
      ? Number(onboarding?.current_step)
      : 1,
    completed_steps: Array.isArray(onboarding?.completed_steps)
      ? onboarding!.completed_steps
        .map((step) => Number(step))
        .filter((step) => Number.isInteger(step) && step >= 1 && step <= 4)
      : [],
    skipped_steps: Array.isArray(onboarding?.skipped_steps)
      ? onboarding!.skipped_steps
        .map((step) => Number(step))
        .filter((step) => Number.isInteger(step) && step >= 1 && step <= 4)
      : [],
    completed_at: typeof onboarding?.completed_at === 'string' ? onboarding.completed_at : null,
    updated_at: typeof onboarding?.updated_at === 'string' ? onboarding.updated_at : null,
  }
}

export { users as usersRoutes }
