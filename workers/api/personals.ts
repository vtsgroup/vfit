/**
 * workers/api/personals.ts
 *
 * personals.ts — Perfil, configurações e stats do personal
 * Features: DB: Neon
 */

// ============================================
// personals.ts — Perfil, configurações e stats do personal
// ============================================
//
// O que faz:
//   Endpoints do personal autenticado: perfil completo, edição de dados
//   (bio, CREF, especialidades, foto), configurações, estatísticas do
//   dashboard e perfil público acessível por slug (sem autenticação).
//
// Exports principais:
//   personalsRoutes — Hono app montado em /api/v1/personals
//
// Auth: perfil/settings/stats exigem Bearer token. GET /:slug é público.
// DB: personals, users, students, payments (stats do dashboard)
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  updatePersonalSchema,
  updatePersonalSettingsSchema,
} from '@workers/schemas/users'
import { pgQuery } from '@lib/db'
import { success } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '@lib/errors'

const personals = new Hono<AppContext>()

// ============================================
// GET /personals/profile — Perfil completo (autenticado)
// ============================================
personals.get('/profile', authMiddleware, requireType('personal'), async (c) => {
  const userId = c.get('userId')

  const user = await findUserById(c.env, userId)
  const personal = await findPersonalById(c.env, userId)

  if (!user || !personal) {
    throw new NotFoundError('Personal')
  }

  return success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      cpf: user.cpf,
      phone: user.phone,
      profile_photo_url: user.profile_photo_url,
      email_verified: user.email_verified,
      created_at: user.created_at,
    },
    personal: {
      cref: personal.cref,
      cref_state: personal.cref_state,
      cref_verified: personal.cref_verified,
      specialties: personal.specialties,
      bio: personal.bio,
      public_url_slug: personal.public_url_slug,
      subscription_plan: personal.subscription_plan,
      subscription_status: personal.subscription_status,
      subscription_started_at: personal.subscription_started_at,
      subscription_expires_at: personal.subscription_expires_at,
      trial_ends_at: personal.trial_ends_at,
      referral_code: personal.referral_code,
      total_students: personal.total_students,
      active_students: personal.active_students,
      total_revenue: personal.total_revenue,
      is_public_profile: personal.is_public_profile,
      show_testimonials: personal.show_testimonials,
      show_transformations: personal.show_transformations,
      accepted_fee_percentage: personal.accepted_fee_percentage,
    },
  })
})

// ============================================
// PATCH /personals/profile — Atualizar perfil
// ============================================
personals.patch('/profile', authMiddleware, requireType('personal'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = updatePersonalSchema.parse(body)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  // Se está tentando definir slug, verificar unicidade
  if (parsed.public_url_slug) {
    const existing = await findPersonalBySlug(c.env, parsed.public_url_slug)
    if (existing && existing.id !== userId) {
      throw new ConflictError('Este slug já está em uso')
    }
  }

  // Construir query dinâmico
  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    if (key === 'specialties') {
      // Array PostgreSQL
      setClauses.push(`${key} = $${idx}::text[]`)
    } else {
      setClauses.push(`${key} = $${idx}`)
    }
    params.push(value)
    idx++
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(userId)

  await pgQuery(c.env, `
    UPDATE personals SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  const updated = await findPersonalById(c.env, userId)

  return success({ personal: updated })
})

// ============================================
// PATCH /personals/settings — Configurações
// ============================================
personals.patch('/settings', authMiddleware, requireType('personal'), async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = updatePersonalSettingsSchema.parse(body)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    setClauses.push(`${key} = $${idx}`)
    params.push(value)
    idx++
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(userId)

  await pgQuery(c.env, `
    UPDATE personals SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  return success({ message: 'Configurações atualizadas' })
})

// ============================================
// GET /personals/stats — Dashboard stats
// ============================================
personals.get('/stats', authMiddleware, requireType('personal'), async (c) => {
  const userId = c.get('userId')

  // Stats do personal
  const personal = await findPersonalById(c.env, userId)
  if (!personal) {
    throw new NotFoundError('Personal')
  }

  // Students por status
  const { rows: statusCounts } = await pgQuery<{ status: string; count: number }>(
    c.env,
    `SELECT status, COUNT(*)::int as count FROM students WHERE personal_id = $1 GROUP BY status`,
    [userId]
  )

  // Students por payment_status
  const { rows: paymentCounts } = await pgQuery<{ payment_status: string; count: number }>(
    c.env,
    `SELECT payment_status, COUNT(*)::int as count FROM students WHERE personal_id = $1 GROUP BY payment_status`,
    [userId]
  )

  // Total workouts completed by students this month
  const { rows: monthlyWorkouts } = await pgQuery<{ total: number }>(
    c.env,
    `SELECT COALESCE(SUM(total_workouts_completed), 0)::int as total
     FROM students WHERE personal_id = $1 AND status = 'active'`,
    [userId]
  )

  // Treinos por semana (últimas 4 semanas) — criados vs concluídos
  const { rows: weeklyWorkouts } = await pgQuery<{ week_start: string; created: number; completed: number }>(
    c.env,
    `SELECT
       DATE_TRUNC('week', d.dt)::date::text as week_start,
       COALESCE(created_counts.cnt, 0)::int as created,
       COALESCE(completed_counts.cnt, 0)::int as completed
     FROM generate_series(
       DATE_TRUNC('week', NOW() - INTERVAL '3 weeks'),
       DATE_TRUNC('week', NOW()),
       '1 week'
     ) AS d(dt)
     LEFT JOIN (
       SELECT DATE_TRUNC('week', created_at) as wk, COUNT(*)::int as cnt
       FROM workouts WHERE personal_id = $1 AND created_at >= NOW() - INTERVAL '4 weeks'
       GROUP BY wk
     ) created_counts ON DATE_TRUNC('week', d.dt) = created_counts.wk
     LEFT JOIN (
       SELECT DATE_TRUNC('week', wl.completed_at) as wk, COUNT(*)::int as cnt
       FROM workout_logs wl
       JOIN workouts w ON w.id = wl.workout_id
       WHERE w.personal_id = $1 AND wl.completed_at >= NOW() - INTERVAL '4 weeks'
       GROUP BY wk
     ) completed_counts ON DATE_TRUNC('week', d.dt) = completed_counts.wk
     ORDER BY week_start ASC`,
    [userId]
  )

  // Formatar semanas para labels amigáveis
  const weekLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const weeklyData = weeklyWorkouts.map((w, i) => ({
    week: weekLabels[i] || `Sem ${i + 1}`,
    created: w.created,
    completed: w.completed,
  }))

  // Preencher até 4 semanas se necessário
  while (weeklyData.length < 4) {
    weeklyData.unshift({ week: weekLabels[4 - weeklyData.length - 1] || 'Sem', created: 0, completed: 0 })
  }

  return success({
    subscription: {
      plan: personal.subscription_plan,
      status: personal.subscription_status,
      trial_ends_at: personal.trial_ends_at,
      expires_at: personal.subscription_expires_at,
    },
    students: {
      total: personal.total_students,
      active: personal.active_students,
      by_status: Object.fromEntries(statusCounts.map((r) => [r.status, r.count])),
      by_payment: Object.fromEntries(paymentCounts.map((r) => [r.payment_status, r.count])),
    },
    revenue: {
      total: personal.total_revenue,
    },
    referral_code: personal.referral_code,
    workouts_completed_by_students: monthlyWorkouts[0]?.total ?? 0,
    weekly_workouts: weeklyData,
  })
})

// ============================================
// GET /personals/:slug — Perfil público (sem auth)
// ============================================
personals.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  // Buscar personal com perfil público
  const { rows } = await pgQuery<{
    id: string
    full_name: string
    profile_photo_url: string | null
    cref: string
    cref_state: string
    cref_verified: boolean
    specialties: string[]
    bio: string | null
    public_url_slug: string
    total_students: number
    show_testimonials: boolean
    show_transformations: boolean
  }>(
    c.env,
    `SELECT u.full_name, u.profile_photo_url,
            p.id, p.cref, p.cref_state, p.cref_verified, p.specialties,
            p.bio, p.public_url_slug, p.total_students,
            p.show_testimonials, p.show_transformations
     FROM personals p
     JOIN users u ON u.id = p.id
     WHERE p.public_url_slug = $1 AND p.is_public_profile = true AND u.is_active = true
     LIMIT 1`,
    [slug]
  )

  const personal = rows[0]
  if (!personal) {
    throw new NotFoundError('Perfil')
  }

  // Buscar reviews/testimonials se habilitado
  let testimonials: unknown[] = []
  if (personal.show_testimonials) {
    const { rows: reviews } = await pgQuery(
      c.env,
      `SELECT r.rating, r.review_text, r.created_at, u.full_name as student_name
       FROM personal_reviews r
       JOIN users u ON u.id = r.student_id
       WHERE r.personal_id = $1 AND r.is_public = true
       ORDER BY r.created_at DESC LIMIT 10`,
      [personal.id]
    )
    testimonials = reviews
  }

  return success({
    personal: {
      full_name: personal.full_name,
      profile_photo_url: personal.profile_photo_url,
      cref: personal.cref,
      cref_state: personal.cref_state,
      cref_verified: personal.cref_verified,
      specialties: personal.specialties,
      bio: personal.bio,
      slug: personal.public_url_slug,
      total_students: personal.total_students,
    },
    testimonials: personal.show_testimonials ? testimonials : [],
  })
})

// ============================================
// PG QUERY HELPERS
// ============================================

interface UserRow {
  id: string
  email: string
  full_name: string
  cpf: string
  phone: string | null
  profile_photo_url: string | null
  email_verified: boolean
  created_at: string
}

interface PersonalRow {
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

async function findUserById(env: Bindings, id: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(env, 'SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

async function findPersonalById(env: Bindings, id: string): Promise<PersonalRow | null> {
  const { rows } = await pgQuery<PersonalRow>(env, 'SELECT * FROM personals WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

async function findPersonalBySlug(env: Bindings, slug: string): Promise<{ id: string } | null> {
  const { rows } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM personals WHERE public_url_slug = $1 LIMIT 1',
    [slug]
  )
  return rows[0] ?? null
}

export { personals as personalsRoutes }
