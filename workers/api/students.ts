/**
 * workers/api/students.ts
 *
 * students.ts — Gestão de alunos do personal trainer
 * Features: DB: Neon
 */

// ============================================
// students.ts — Gestão de alunos do personal trainer
// ============================================
//
// O que faz:
//   CRUD completo de alunos vinculados ao personal autenticado. Convite por
//   email, convite rápido (QR/ao vivo) e importação em lote. Student acessa
//   apenas /me. Validação de ownership em todas as rotas /:id.
//
// Exports principais:
//   studentsRoutes — Hono app montado em /api/v1/students
//
// Auth: requireAuth. Personal gerencia seus alunos; student acessa /me.
// DB: students, users (JOIN para dados base), personals
// Side effects: email de convite via Resend, notificação in-app
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  inviteStudentSchema,
  quickInviteStudentSchema,
  manualCreateStudentSchema,
  updateUserSchema,
  updateStudentSchema,
  updateStudentStatusSchema,
  listStudentsQuerySchema,
  studentSelfUpdateSchema,
  linkStudentToPersonalSchema,
} from '@workers/schemas/users'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '@lib/errors'
import { sendStudentInvitationEmail } from '@lib/email'
import { sendEmailWithResend } from '@lib/email-resend'
import { notifyEvent, notifyNewStudent } from '@lib/onesignal'

const students = new Hono<AppContext>()

// Todas rotas requerem auth
students.use('*', authMiddleware)

// ============================================
// GET /students — Listar alunos do personal
// ============================================
students.get('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  // Back-compat: aceitar sort no formato "campo:direcao" (ex: created_at:desc)
  const sortRaw = url.searchParams.get('sort') || undefined
  let sort = sortRaw
  let order = url.searchParams.get('order') || undefined
  if (sortRaw && sortRaw.includes(':')) {
    const [field, dir] = sortRaw.split(':')
    sort = field || undefined
    if (!order && (dir === 'asc' || dir === 'desc')) order = dir
  }

  const query = listStudentsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    status: url.searchParams.get('status') || undefined,
    payment_status: url.searchParams.get('payment_status') || undefined,
    search: url.searchParams.get('search') || undefined,
    sort,
    order,
  })

  const offset = (query.page - 1) * query.per_page

  // Build WHERE clauses
  const conditions: string[] = ['s.personal_id = $1']
  const params: unknown[] = [personalId]
  let paramIdx = 2

  if (query.status) {
    conditions.push(`s.status = $${paramIdx}`)
    params.push(query.status)
    paramIdx++
  } else {
    // Por padrão, excluir alunos removidos (churned)
    conditions.push(`s.status != 'churned'`)
  }

  if (query.payment_status) {
    conditions.push(`s.payment_status = $${paramIdx}`)
    params.push(query.payment_status)
    paramIdx++
  }

  if (query.search) {
    conditions.push(`(u.full_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`)
    params.push(`%${query.search}%`)
    paramIdx++
  }

  const whereClause = conditions.join(' AND ')

  // Mapping de sort fields
  const sortMap: Record<string, string> = {
    full_name: 'u.full_name',
    created_at: 's.created_at',
    last_payment_date: 's.last_payment_date',
    total_workouts_completed: 's.total_workouts_completed',
    current_streak: 's.current_streak',
  }
  const sortField = sortMap[query.sort] || 's.created_at'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'

  // Count total
  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM students s JOIN users u ON u.id = s.id WHERE ${whereClause}`,
    params
  )
  const total = countRows[0]?.count ?? 0

  // Fetch students with user data
  const { rows: studentRows } = await pgQuery<StudentListRow>(
    c.env,
    `SELECT s.id, s.status, s.payment_status, s.fitness_level, s.goals,
            s.total_workouts_completed, s.current_streak, s.longest_streak,
            s.total_badges, s.last_payment_date, s.next_payment_date,
            s.invited_at, s.accepted_at, s.created_at,
            s.student_type, s.consultation_price, s.consultation_billing_cycle,
            u.full_name, u.email, u.phone, u.profile_photo_url
     FROM students s
     JOIN users u ON u.id = s.id
     WHERE ${whereClause}
     ORDER BY ${sortField} ${sortOrder} NULLS LAST
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    students: studentRows,
    meta: {
      page: query.page,
      per_page: query.per_page,
      total,
      total_pages: Math.ceil(total / query.per_page),
    },
  })
})

// ============================================
// GET /students/export — Exportar alunos (CSV)
// ============================================
students.get('/export', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)
  const format = (url.searchParams.get('format') || 'csv').toLowerCase()

  if (format !== 'csv') {
    throw new BadRequestError('Formato inválido. Use: csv')
  }

  const { rows } = await pgQuery<{
    id: string
    full_name: string
    email: string
    phone: string | null
    status: string
    payment_status: string
    fitness_level: string | null
    total_workouts_completed: number
    current_streak: number
    last_payment_date: string | null
    next_payment_date: string | null
    created_at: string
  }>(
    c.env,
    `SELECT s.id,
            u.full_name,
            u.email,
            u.phone,
            s.status,
            s.payment_status,
            s.fitness_level,
            s.total_workouts_completed,
            s.current_streak,
            s.last_payment_date,
            s.next_payment_date,
            s.created_at
     FROM students s
     JOIN users u ON u.id = s.id
     WHERE s.personal_id = $1
       AND s.status != 'churned'
     ORDER BY s.created_at DESC
     LIMIT 5000`,
    [personalId]
  )

  const csv = buildStudentsCsv(rows)
  const dateLabel = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alunos-${dateLabel}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
})

// ============================================
// POST /students/invite — Convidar aluno
// ============================================
students.post('/invite', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = inviteStudentSchema.parse(body)

  // Verificar se email já tem convite pendente deste personal
  const { rows: existing } = await pgQuery<{ id: string }>(
    c.env,
    `SELECT s.id FROM students s
     JOIN users u ON u.id = s.id
     WHERE u.email = $1 AND s.personal_id = $2
     LIMIT 1`,
    [parsed.email.toLowerCase(), personalId]
  )

  if (existing.length > 0) {
    throw new ConflictError('Este aluno já está vinculado ao seu perfil')
  }

  // Verificar se email já existe como user
  const { rows: existingUsers } = await pgQuery<{ id: string; user_type: string }>(
    c.env,
    'SELECT id, user_type FROM users WHERE email = $1 LIMIT 1',
    [parsed.email.toLowerCase()]
  )

  const invitationToken = generateInvitationToken()
  const now = new Date().toISOString()

  if (existingUsers.length > 0) {
    if (existingUsers[0].user_type === 'personal') {
      throw new BadRequestError('Este email pertence a uma conta de personal trainer')
    }

    // User já existe como student — vincular ao personal
    const existingStudent = existingUsers[0]

    // Verificar se já tem personal
    const { rows: hasPersonal } = await pgQuery<{ personal_id: string }>(
      c.env,
      'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
      [existingStudent.id]
    )

    if (hasPersonal.length > 0) {
      throw new ConflictError('Este aluno já está vinculado a outro personal')
    }

    // Criar registro de student
    await pgQuery(c.env, `
      INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, consultation_price, consultation_billing_cycle, consultation_notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, $4, $4)
    `, [
      existingStudent.id, personalId, invitationToken, now,
      parsed.student_type || 'personal_training',
      parsed.student_type === 'consultoria' ? (parsed.consultation_price || null) : null,
      parsed.student_type === 'consultoria' ? (parsed.consultation_billing_cycle || 'MONTHLY') : null,
      parsed.student_type === 'consultoria' ? (parsed.consultation_notes || null) : null,
    ])
  } else {
    // User não existe — criar placeholder user + student record
    // O placeholder será atualizado no register/student quando o aluno aceitar o convite
    const placeholderId = generateId()

    // Criar placeholder user (is_active=false, sem password)
    await pgQuery(c.env, `
      INSERT INTO users (id, email, full_name, user_type, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, 'student', false, $4, $4)
    `, [placeholderId, parsed.email.toLowerCase(), parsed.full_name, now])

    // Criar student record vinculado ao placeholder
    await pgQuery(c.env, `
      INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, consultation_price, consultation_billing_cycle, consultation_notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'inactive', $5, $6, $7, $8, $4, $4)
    `, [
      placeholderId, personalId, invitationToken, now,
      parsed.student_type || 'personal_training',
      parsed.student_type === 'consultoria' ? (parsed.consultation_price || null) : null,
      parsed.student_type === 'consultoria' ? (parsed.consultation_billing_cycle || 'MONTHLY') : null,
      parsed.student_type === 'consultoria' ? (parsed.consultation_notes || null) : null,
    ])
  }

  // Buscar nome do personal para o email
  const { rows: personalRows } = await pgQuery<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
    [personalId]
  )
  const personalName = personalRows[0]?.full_name || 'Seu Personal'

  // Enviar email de convite via Resend
  const invitationUrl = `https://vfit.app.br/register/student?token=${invitationToken}`
  let emailSent = false

  try {
    if (c.env.RESEND_API_KEY) {
      await sendEmailWithResend(
        c.env.RESEND_API_KEY,
        {
          to: parsed.email.toLowerCase(),
          subject: `${personalName} te convidou para o VFIT`,
          template: 'invitation',
          data: {
            student_name: parsed.full_name,
            personal_name: personalName,
            invitation_url: invitationUrl,
          },
        },
        c.env.EMAIL_FROM || undefined
      )
      emailSent = true
    } else {
      // Fallback para queue (se disponível)
      await sendStudentInvitationEmail(
        c.env.EMAIL_QUEUE,
        parsed.email.toLowerCase(),
        parsed.full_name,
        personalName,
        invitationToken,
        'https://vfit.app.br',
        requestId
      )
      emailSent = true
    }
  } catch (err) {
    console.error('[Students] Failed to send invitation email:', err)
  }

  return created({
    invitation_token: invitationToken,
    invitation_url: invitationUrl,
    email: parsed.email.toLowerCase(),
    full_name: parsed.full_name,
    personal_name: personalName,
    email_sent: emailSent,
    message: emailSent ? 'Convite enviado com sucesso' : 'Convite criado. Compartilhe o link com seu aluno.',
  })
})

// ============================================
// POST /students/invite/quick — Convite rápido (QR / ao vivo)
// - sem email: gera token + placeholder user (email dummy) + student record
// - com email: cria convite normal e tenta enviar email
// ============================================
students.post('/invite/quick', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const requestId = c.get('requestId')
  const body = await c.req.json().catch(() => ({}))
  const parsed = quickInviteStudentSchema.parse(body)

  const invitationToken = generateInvitationToken()
  const now = new Date().toISOString()

  // Buscar nome do personal para mensagem/email
  const { rows: personalRows } = await pgQuery<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
    [personalId]
  )
  const personalName = personalRows[0]?.full_name || 'Seu Personal'

  const invitationUrl = `https://vfit.app.br/register/student?token=${invitationToken}`

  // ===== Mode: QR ao vivo (sem email) =====
  if (!parsed.email) {
    const placeholderId = generateId()
    const dummyEmail = `invite+${invitationToken.slice(0, 28)}@vfit.app.br`.toLowerCase()
    const dummyName = parsed.full_name?.trim().slice(0, 255) || 'Aluno convidado'

    // Placeholder user (is_active=false, sem password) — será removido ao aceitar convite
    await pgQuery(
      c.env,
      `INSERT INTO users (id, email, full_name, user_type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'student', false, $4, $4)`,
      [placeholderId, dummyEmail, dummyName, now]
    )

    await pgQuery(
      c.env,
      `INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, consultation_price, consultation_billing_cycle, consultation_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'inactive', $5, $6, $7, $8, $4, $4)`,
      [
        placeholderId,
        personalId,
        invitationToken,
        now,
        parsed.student_type || 'personal_training',
        parsed.student_type === 'consultoria' ? (parsed.consultation_price || null) : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_billing_cycle || 'MONTHLY') : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_notes || null) : null,
      ]
    )

    return created({
      invitation_token: invitationToken,
      invitation_url: invitationUrl,
      email: null,
      full_name: null,
      personal_name: personalName,
      email_sent: false,
      mode: 'qr',
      message: 'Convite rápido criado. Peça para o aluno escanear o QR e concluir o cadastro.',
    })
  }

  // ===== Mode: com email (opcional nome) =====
  const email = parsed.email.toLowerCase().trim()
  const fullName = (parsed.full_name?.trim() || 'Seu aluno').slice(0, 255)

  // Verificar se email já tem vínculo com este personal
  const { rows: existing } = await pgQuery<{ id: string }>(
    c.env,
    `SELECT s.id FROM students s
     JOIN users u ON u.id = s.id
     WHERE u.email = $1 AND s.personal_id = $2
     LIMIT 1`,
    [email, personalId]
  )
  if (existing.length > 0) {
    throw new ConflictError('Este aluno já está vinculado ao seu perfil')
  }

  // Verificar se email já existe como user
  const { rows: existingUsers } = await pgQuery<{ id: string; user_type: string }>(
    c.env,
    'SELECT id, user_type FROM users WHERE email = $1 LIMIT 1',
    [email]
  )

  if (existingUsers.length > 0) {
    if (existingUsers[0].user_type === 'personal') {
      throw new BadRequestError('Este email pertence a uma conta de personal trainer')
    }

    const existingStudent = existingUsers[0]

    const { rows: hasPersonal } = await pgQuery<{ personal_id: string }>(
      c.env,
      'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
      [existingStudent.id]
    )
    if (hasPersonal.length > 0) {
      throw new ConflictError('Este aluno já está vinculado a outro personal')
    }

    await pgQuery(
      c.env,
      `INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, consultation_price, consultation_billing_cycle, consultation_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, $4, $4)`,
      [
        existingStudent.id,
        personalId,
        invitationToken,
        now,
        parsed.student_type || 'personal_training',
        parsed.student_type === 'consultoria' ? (parsed.consultation_price || null) : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_billing_cycle || 'MONTHLY') : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_notes || null) : null,
      ]
    )
  } else {
    const placeholderId = generateId()

    await pgQuery(
      c.env,
      `INSERT INTO users (id, email, full_name, user_type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'student', false, $4, $4)`,
      [placeholderId, email, fullName, now]
    )

    await pgQuery(
      c.env,
      `INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, consultation_price, consultation_billing_cycle, consultation_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'inactive', $5, $6, $7, $8, $4, $4)`,
      [
        placeholderId,
        personalId,
        invitationToken,
        now,
        parsed.student_type || 'personal_training',
        parsed.student_type === 'consultoria' ? (parsed.consultation_price || null) : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_billing_cycle || 'MONTHLY') : null,
        parsed.student_type === 'consultoria' ? (parsed.consultation_notes || null) : null,
      ]
    )
  }

  // Email (best-effort)
  let emailSent = false
  try {
    if (c.env.RESEND_API_KEY) {
      await sendEmailWithResend(
        c.env.RESEND_API_KEY,
        {
          to: email,
          subject: `${personalName} te convidou para o VFIT`,
          template: 'invitation',
          data: {
            student_name: fullName,
            personal_name: personalName,
            invitation_url: invitationUrl,
          },
        },
        c.env.EMAIL_FROM || undefined
      )
      emailSent = true
    } else {
      await sendStudentInvitationEmail(
        c.env.EMAIL_QUEUE,
        email,
        fullName,
        personalName,
        invitationToken,
        'https://vfit.app.br',
        requestId
      )
      emailSent = true
    }
  } catch (err) {
    console.error('[Students] Failed to send quick invitation email:', err)
  }

  return created({
    invitation_token: invitationToken,
    invitation_url: invitationUrl,
    email,
    full_name: fullName,
    personal_name: personalName,
    email_sent: emailSent,
    mode: 'email',
    message: emailSent ? 'Convite enviado com sucesso' : 'Convite criado. Compartilhe o link/QR com o aluno.',
  })
})

// ============================================
// POST /students/manual-create — Cadastro manual completo (personal)
// Cria aluno e já vincula ao personal, com notificações e convite por canais.
// ============================================
students.post('/manual-create', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = manualCreateStudentSchema.parse(body)

  const normalizedCpf = normalizeCpf(parsed.cpf)
  if (!normalizedCpf || normalizedCpf.length !== 11) {
    throw new BadRequestError('CPF inválido')
  }
  const canonicalCpf = formatCpf(normalizedCpf)

  const email = parsed.email.trim().toLowerCase()
  const fullName = parsed.full_name.trim()
  const phone = parsed.phone.trim()
  const now = new Date().toISOString()
  const invitationToken = generateInvitationToken()
  const invitationUrl = `https://vfit.app.br/register/student?token=${invitationToken}`

  const { rows: existingEmail } = await pgQuery<{ id: string; user_type: string }>(
    c.env,
    'SELECT id, user_type FROM users WHERE email = $1 LIMIT 1',
    [email]
  )
  if (existingEmail.length > 0) {
    throw new ConflictError('Email já cadastrado')
  }

  const { rows: existingCpf } = await pgQuery<{ id: string }>(
    c.env,
    `SELECT id
       FROM users
      WHERE cpf IS NOT NULL
        AND regexp_replace(cpf, '\\D', '', 'g') = $1
      LIMIT 1`,
    [normalizedCpf]
  )
  if (existingCpf.length > 0) {
    throw new ConflictError('CPF já cadastrado')
  }

  const studentId = generateId()

  await pgQuery(
    c.env,
    `INSERT INTO users (id, email, full_name, cpf, phone, user_type, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'student', false, $6, $6)`,
    [studentId, email, fullName, canonicalCpf, phone, now]
  )

  await pgQuery(
    c.env,
    `INSERT INTO students (id, personal_id, invitation_token, invited_at, status, date_of_birth, gender, student_type, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'active', $5, $6, 'personal_training', $4, $4)`,
    [studentId, personalId, invitationToken, now, parsed.date_of_birth, parsed.gender]
  )

  await pgQuery(
    c.env,
    `UPDATE personals
     SET total_students = total_students + 1,
         active_students = active_students + 1,
         updated_at = $1
     WHERE id = $2`,
    [now, personalId]
  )

  const { rows: personalRows } = await pgQuery<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
    [personalId]
  )
  const personalName = personalRows[0]?.full_name || 'Seu Personal'

  let emailSent = false
  try {
    if (c.env.RESEND_API_KEY) {
      await sendEmailWithResend(
        c.env.RESEND_API_KEY,
        {
          to: email,
          subject: `${personalName} cadastrou você no VFIT`,
          template: 'invitation',
          data: {
            student_name: fullName,
            personal_name: personalName,
            invitation_url: invitationUrl,
          },
        },
        c.env.EMAIL_FROM || undefined
      )
      emailSent = true
    } else {
      await sendStudentInvitationEmail(
        c.env.EMAIL_QUEUE,
        email,
        fullName,
        personalName,
        invitationToken,
        'https://vfit.app.br',
        requestId
      )
      emailSent = true
    }
  } catch (err) {
    console.error('[Students] Failed to send manual-create invitation email:', err)
  }

  let whatsappSent = false
  try {
    whatsappSent = await sendStudentWelcomeWhatsApp(c.env, {
      phone,
      fullName,
      personalName,
      invitationUrl,
    })
  } catch (err) {
    console.error('[Students] Failed to send manual-create whatsapp:', err)
  }

  await notifyNewStudent(c.env, personalId, fullName).catch(() => {})
  await notifyEvent(c.env, studentId, 'welcome.student', {
    firstName: fullName.split(' ')[0] || 'aluno',
  }).catch(() => {})

  return created({
    student_id: studentId,
    full_name: fullName,
    email,
    phone,
    cpf: canonicalCpf,
    date_of_birth: parsed.date_of_birth,
    gender: parsed.gender,
    invitation_token: invitationToken,
    invitation_url: invitationUrl,
    personal_name: personalName,
    email_sent: emailSent,
    whatsapp_sent: whatsappSent,
    message: 'Aluno cadastrado e vinculado com sucesso',
  })
})

// ============================================
// POST /students/batch-invite — Importar múltiplos alunos de uma vez
// ============================================
students.post('/batch-invite', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()

  // Validar body
  const students_data = body.students
  if (!Array.isArray(students_data) || students_data.length === 0) {
    throw new BadRequestError('Lista de alunos é obrigatória')
  }
  if (students_data.length > 50) {
    throw new BadRequestError('Máximo de 50 alunos por importação')
  }

  // Buscar nome do personal
  const { rows: personalRows } = await pgQuery<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
    [personalId]
  )
  const personalName = personalRows[0]?.full_name || 'Seu Personal'

  const results: Array<{
    email: string
    full_name: string
    status: 'created' | 'skipped' | 'error'
    reason?: string
  }> = []

  for (const student of students_data) {
    const email = (student.email || '').trim().toLowerCase()
    const fullName = (student.full_name || '').trim()
    const phone = (student.phone || '').trim() || null
    const studentType = student.student_type || 'personal_training'

    // Validar campos obrigatórios
    if (!email || !fullName) {
      results.push({ email: email || '(vazio)', full_name: fullName || '(vazio)', status: 'skipped', reason: 'Nome e email são obrigatórios' })
      continue
    }

    // Validar formato email básico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.push({ email, full_name: fullName, status: 'skipped', reason: 'Email inválido' })
      continue
    }

    try {
      // Verificar se já tem vínculo
      const { rows: existing } = await pgQuery<{ id: string }>(
        c.env,
        `SELECT s.id FROM students s JOIN users u ON u.id = s.id WHERE u.email = $1 AND s.personal_id = $2 LIMIT 1`,
        [email, personalId]
      )

      if (existing.length > 0) {
        results.push({ email, full_name: fullName, status: 'skipped', reason: 'Já vinculado' })
        continue
      }

      // Verificar se user existe
      const { rows: existingUsers } = await pgQuery<{ id: string; user_type: string }>(
        c.env,
        'SELECT id, user_type FROM users WHERE email = $1 LIMIT 1',
        [email]
      )

      const invitationToken = generateInvitationToken()
      const now = new Date().toISOString()

      if (existingUsers.length > 0) {
        if (existingUsers[0].user_type === 'personal') {
          results.push({ email, full_name: fullName, status: 'skipped', reason: 'Conta de personal' })
          continue
        }

        const existingStudent = existingUsers[0]
        const { rows: hasPersonal } = await pgQuery<{ personal_id: string }>(
          c.env,
          'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
          [existingStudent.id]
        )

        if (hasPersonal.length > 0) {
          results.push({ email, full_name: fullName, status: 'skipped', reason: 'Vinculado a outro personal' })
          continue
        }

        await pgQuery(c.env, `
          INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'active', $5, $4, $4)
        `, [existingStudent.id, personalId, invitationToken, now, studentType])
      } else {
        // Criar placeholder
        const placeholderId = generateId()

        await pgQuery(c.env, `
          INSERT INTO users (id, email, full_name, phone, user_type, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'student', false, $5, $5)
        `, [placeholderId, email, fullName, phone, now])

        await pgQuery(c.env, `
          INSERT INTO students (id, personal_id, invitation_token, invited_at, status, student_type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'inactive', $5, $4, $4)
        `, [placeholderId, personalId, invitationToken, now, studentType])
      }

      // Enviar email (best-effort)
      const invitationUrl = `https://vfit.app.br/register/student?token=${invitationToken}`
      try {
        if (c.env.RESEND_API_KEY) {
          await sendEmailWithResend(
            c.env.RESEND_API_KEY,
            {
              to: email,
              subject: `${personalName} te convidou para o VFIT`,
              template: 'invitation',
              data: { student_name: fullName, personal_name: personalName, invitation_url: invitationUrl },
            },
            c.env.EMAIL_FROM || undefined
          )
        }
      } catch { /* best-effort */ }

      results.push({ email, full_name: fullName, status: 'created' })
    } catch (err) {
      console.error(`[Students] Batch invite error for ${email}:`, err)
      results.push({ email, full_name: fullName, status: 'error', reason: err instanceof Error ? err.message : 'Erro desconhecido' })
    }
  }

  const created_count = results.filter(r => r.status === 'created').length
  const skipped_count = results.filter(r => r.status === 'skipped').length
  const error_count = results.filter(r => r.status === 'error').length

  return success({
    message: `${created_count} aluno(s) importado(s), ${skipped_count} ignorado(s), ${error_count} erro(s)`,
    total: results.length,
    created: created_count,
    skipped: skipped_count,
    errors: error_count,
    results,
  })
})

// ============================================
// GET /students/me — Perfil do próprio aluno
// ============================================
students.get('/me', requireType('student'), async (c) => {
  const studentId = c.get('userId')

  const { rows } = await pgQuery<StudentDetailRow>(
    c.env,
    `SELECT s.*, u.full_name, u.email, u.phone, u.profile_photo_url, u.email_verified,
            u.metadata->'affiliate_student' as affiliate_student_referral,
            pu.full_name as personal_name, pu.profile_photo_url as personal_photo
     FROM students s
     JOIN users u ON u.id = s.id
     LEFT JOIN users pu ON pu.id = s.personal_id
     WHERE s.id = $1 LIMIT 1`,
    [studentId]
  )

  if (rows.length === 0) {
    // Se em modo de simulação, retornar erro descritivo (não é um bug real)
    const simulationMode = c.get('simulationMode')
    if (simulationMode && simulationMode !== 'super_admin') {
      throw new BadRequestError(
        'Simulação: este usuário não possui perfil de aluno na tabela students. Troque o modo de simulação ou selecione um aluno válido.'
      )
    }
    throw new NotFoundError('Aluno')
  }

  return success({ student: rows[0] })
})

// ============================================
// PATCH /students/me — Aluno atualiza próprio perfil
// ============================================
students.patch('/me', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const body = await c.req.json()
  const parsed = studentSelfUpdateSchema.parse(body)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    if (key === 'goals') {
      setClauses.push(`${key} = $${idx}::jsonb`)
    } else {
      setClauses.push(`${key} = $${idx}`)
    }
    params.push(key === 'goals' ? JSON.stringify(value) : value)
    idx++
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(studentId)

  await pgQuery(c.env, `
    UPDATE students SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  return success({ message: 'Perfil atualizado' })
})

// ============================================
// POST /students/me/link-personal — Aluno cria vínculo posterior com personal
// ============================================
students.post('/me/link-personal', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const body = await c.req.json()
  const parsed = linkStudentToPersonalSchema.parse(body)
  const now = new Date().toISOString()

  const { rows: studentRows } = await pgQuery<{ personal_id: string | null }>(
    c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1',
    [studentId]
  )

  if (studentRows.length === 0) {
    throw new NotFoundError('Aluno')
  }

  if (studentRows[0].personal_id) {
    throw new ConflictError('Você já está vinculado a um personal')
  }

  const { rows: personalRows } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM personals WHERE referral_code = $1 LIMIT 1',
    [parsed.referral_code.toUpperCase()]
  )

  if (personalRows.length === 0) {
    throw new NotFoundError('Código de referência inválido')
  }

  const personalId = personalRows[0].id

  const affiliateOwner = await pgQueryOne<{ id: string }>(
    c.env,
    'SELECT id FROM affiliates WHERE personal_id = $1 LIMIT 1',
    [personalId]
  )

  const affiliateStudentPayload = {
    affiliate_id: affiliateOwner?.id || null,
    referred_personal_id: personalId,
    referral_code: parsed.referral_code.toUpperCase(),
    linked_at: now,
  }

  await pgQuery(
    c.env,
    `UPDATE students
        SET personal_id = $1,
            accepted_at = COALESCE(accepted_at, $2),
            status = CASE WHEN status = 'churned' THEN 'active' ELSE status END,
            updated_at = $2
      WHERE id = $3`,
    [personalId, now, studentId]
  )

  await pgQuery(
    c.env,
    `UPDATE personals
        SET total_students = total_students + 1,
            active_students = active_students + 1,
            updated_at = $1
      WHERE id = $2`,
    [now, personalId]
  )

  await pgQuery(
    c.env,
    `UPDATE users
        SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('affiliate_student', $1::jsonb),
            updated_at = $2
      WHERE id = $3`,
    [JSON.stringify(affiliateStudentPayload), now, studentId]
  )

  return success({
    message: 'Vínculo com personal criado com sucesso',
    personal_id: personalId,
    affiliate_student_referral: affiliateStudentPayload,
  })
})

// ============================================
// GET /students/:id — Detalhes de um aluno (personal)
// ============================================
students.get('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')

  const { rows } = await pgQuery<StudentDetailRow>(
    c.env,
    `SELECT s.*, u.full_name, u.email, u.phone, u.profile_photo_url, u.email_verified,
            u.cpf, u.created_at as user_created_at
     FROM students s
     JOIN users u ON u.id = s.id
     WHERE s.id = $1 AND s.personal_id = $2 LIMIT 1`,
    [studentId, personalId]
  )

  if (rows.length === 0) {
    throw new NotFoundError('Aluno')
  }

  return success({ student: rows[0] })
})

// ============================================
// PATCH /students/:id — Atualizar aluno (personal)
// ============================================
students.patch('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateStudentSchema.parse(body)

  // Verificar ownership
  await ensureStudentOwnership(c.env, studentId, personalId)

  const fields = Object.entries(parsed).filter(([, v]) => v !== undefined)
  if (fields.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of fields) {
    if (key === 'goals') {
      setClauses.push(`${key} = $${idx}::jsonb`)
    } else {
      setClauses.push(`${key} = $${idx}`)
    }
    params.push(key === 'goals' ? JSON.stringify(value) : value)
    idx++
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(studentId)

  await pgQuery(c.env, `
    UPDATE students SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  return success({ message: 'Aluno atualizado' })
})

// ============================================
// PATCH /students/:id/user — Atualizar dados base do usuário aluno (personal)
// - Não altera email/senha (mantém seguro)
// ============================================
students.patch('/:id/user', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateUserSchema.parse(body)

  // Verificar ownership
  await ensureStudentOwnership(c.env, studentId, personalId)

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

  params.push(studentId)

  await pgQuery(c.env, `
    UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}
  `, params)

  return success({ message: 'Perfil base atualizado' })
})

// ============================================
// PATCH /students/:id/status — Mudar status
// ============================================
students.patch('/:id/status', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateStudentStatusSchema.parse(body)

  // Verificar ownership
  const student = await ensureStudentOwnership(c.env, studentId, personalId)
  const previousStatus = student.status
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    UPDATE students
    SET status = $1, updated_at = $2
    WHERE id = $3
  `, [
    parsed.status,
    now,
    studentId,
  ])

  // Atualizar contadores do personal
  if (parsed.status === 'active' && previousStatus !== 'active') {
    await pgQuery(c.env, `
      UPDATE personals SET active_students = active_students + 1, updated_at = $1 WHERE id = $2
    `, [now, personalId])
  } else if (parsed.status !== 'active' && previousStatus === 'active') {
    await pgQuery(c.env, `
      UPDATE personals SET active_students = GREATEST(active_students - 1, 0), updated_at = $1 WHERE id = $2
    `, [now, personalId])
  }

  return success({
    student_id: studentId,
    previous_status: previousStatus,
    new_status: parsed.status,
  })
})

// ============================================
// DELETE /students/:id — Remover vínculo
// ============================================
students.delete('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const studentId = c.req.param('id')
  const now = new Date().toISOString()

  // Verificar ownership
  const student = await ensureStudentOwnership(c.env, studentId, personalId)

  // Verificar se é placeholder (convite pendente, user sem senha)
  const { rows: userRows } = await pgQuery<{ is_active: boolean; password_hash: string | null }>(
    c.env,
    'SELECT is_active, password_hash FROM users WHERE id = $1 LIMIT 1',
    [studentId]
  )
  const isPlaceholder = userRows.length > 0 && !userRows[0].is_active && !userRows[0].password_hash

  if (isPlaceholder) {
    // Placeholder (convite pendente): hard delete student + user
    await pgQuery(c.env, 'DELETE FROM students WHERE id = $1 AND personal_id = $2', [studentId, personalId])
    await pgQuery(c.env, 'DELETE FROM users WHERE id = $1 AND is_active = false AND password_hash IS NULL', [studentId])
  } else {
    // Aluno real: soft delete (churned) — mantém conta do aluno intacta
    await pgQuery(c.env, `
      UPDATE students SET status = 'churned', updated_at = $1 WHERE id = $2 AND personal_id = $3
    `, [now, studentId, personalId])
  }

  // Decrementar contadores
  const wasActive = student.status === 'active'
  await pgQuery(c.env, `
    UPDATE personals
    SET total_students = GREATEST(total_students - 1, 0),
        active_students = CASE WHEN $3 THEN GREATEST(active_students - 1, 0) ELSE active_students END,
        updated_at = $1
    WHERE id = $2
  `, [now, personalId, wasActive])

  return noContent()
})

// ============================================
// HELPERS
// ============================================

function generateInvitationToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function normalizeCpf(value: string): string {
  return (value || '').replace(/\D/g, '')
}

function formatCpf(value: string): string {
  const digits = normalizeCpf(value)
  if (digits.length !== 11) return value
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function normalizePhoneForMatch(value: string): string {
  const digits = (value || '').replace(/\D/g, '')
  if (digits.length <= 11) return digits
  if (digits.length === 13 && digits.startsWith('55')) return digits.slice(2)
  return digits
}

async function sendStudentWelcomeWhatsApp(
  env: Bindings,
  input: { phone: string; fullName: string; personalName: string; invitationUrl: string }
): Promise<boolean> {
  const gatewayUrl = (env.WHATSAPP_GATEWAY_URL || 'https://whatsapp.vfit.app.br').replace(/\/+$/, '')
  const token = env.WHATSAPP_NOTIFY_TOKEN || env.WHATSAPP_ADMIN_AUTH_TOKEN
  if (!token) return false

  const targetDigits = normalizePhoneForMatch(input.phone)
  if (!targetDigits) return false

  const chatsRes = await fetch(`${gatewayUrl}/chats?q=${encodeURIComponent(targetDigits)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!chatsRes.ok) return false

  const chatsJson = await chatsRes.json() as {
    data?: {
      items?: Array<{ id: string; name: string }>
    }
  }
  const items = chatsJson.data?.items || []
  const chat = items.find((item) => {
    const nameDigits = normalizePhoneForMatch(item.name)
    return nameDigits.endsWith(targetDigits) || targetDigits.endsWith(nameDigits)
  })
  if (!chat?.id) return false

  const text = [
    `Olá ${input.fullName}! 👋`,
    '',
    `${input.personalName} cadastrou você no VFIT.`,
    'Complete seu acesso pelo link:',
    input.invitationUrl,
  ].join('\n')

  const sendRes = await fetch(`${gatewayUrl}/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chat.id,
      text,
    }),
  })

  return sendRes.ok
}

function toCsvValue(value: unknown): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildStudentsCsv(rows: Array<{
  id: string
  full_name: string
  email: string
  phone: string | null
  status: string
  payment_status: string
  fitness_level: string | null
  total_workouts_completed: number
  current_streak: number
  last_payment_date: string | null
  next_payment_date: string | null
  created_at: string
}>): string {
  const headers = [
    'id',
    'nome',
    'email',
    'telefone',
    'status',
    'status_pagamento',
    'nivel_fitness',
    'treinos_concluidos',
    'streak_atual',
    'ultimo_pagamento',
    'proximo_pagamento',
    'criado_em',
  ]

  const lines = rows.map((row) => [
    row.id,
    row.full_name,
    row.email,
    row.phone || '',
    row.status,
    row.payment_status,
    row.fitness_level || '',
    row.total_workouts_completed,
    row.current_streak,
    row.last_payment_date || '',
    row.next_payment_date || '',
    row.created_at,
  ].map(toCsvValue).join(','))

  return [headers.join(','), ...lines].join('\n')
}

async function ensureStudentOwnership(
  env: Bindings,
  studentId: string,
  personalId: string
): Promise<{ id: string; status: string }> {
  const { rows } = await pgQuery<{ id: string; status: string }>(
    env,
    'SELECT id, status FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [studentId, personalId]
  )

  if (rows.length === 0) {
    throw new NotFoundError('Aluno')
  }

  return rows[0]
}

// ============================================
// TYPES
// ============================================

interface StudentListRow {
  id: string
  full_name: string
  email: string
  phone: string | null
  profile_photo_url: string | null
  status: string
  payment_status: string
  fitness_level: string | null
  goals: unknown
  total_workouts_completed: number
  current_streak: number
  longest_streak: number
  total_badges: number
  last_payment_date: string | null
  next_payment_date: string | null
  invited_at: string | null
  accepted_at: string | null
  created_at: string
  student_type: string
  consultation_price: number | null
  consultation_billing_cycle: string | null
}

interface StudentDetailRow extends StudentListRow {
  personal_id: string | null
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  medical_restrictions: string | null
  photo_sharing_consent: boolean
  testimonial_consent: boolean
  email_verified: boolean
  personal_name?: string
  personal_photo?: string
  cpf?: string
  affiliate_student_referral?: unknown
  user_created_at?: string
  updated_at: string
}

// ============================================
// POST /students/test-setup — Criar aluno de teste (deletável)
// ============================================
students.post('/test-setup', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const testUserId = generateId() // Este será tanto user.id quanto student.id
  const now = new Date().toISOString()
  const testEmail = `test-${personalId.slice(0, 8)}-${Date.now()}@test.local`
  // CPF fake: sempre 14 chars (XXX.XXX.XXX-XX format)
  const testCpf = `999.999.999-${String(Math.random() * 100).padStart(2, '0').slice(0, 2)}`

  try {
    // 1. Criar user de teste
    await pgQuery(
      c.env,
      `INSERT INTO users (id, email, full_name, user_type, is_active, cpf, created_at, updated_at)
       VALUES ($1, $2, $3, 'student', true, $4, $5, $5)`,
      [testUserId, testEmail, '🧪 Aluno de Teste', testCpf, now]
    )

    // 2. Criar student de teste com MESMO ID do user (FK constraint)
    await pgQuery(
      c.env,
      `INSERT INTO students (id, personal_id, status, student_type, created_at, updated_at)
       VALUES ($1, $2, 'active', 'personal_training', $3, $3)`,
      [testUserId, personalId, now]
    )

    return created({
      message: '✅ Aluno de teste criado! Use na próxima avaliação e depois delete sem problema.',
      student_id: testUserId,
      name: '🧪 Aluno de Teste',
    })
  } catch (err) {
    console.error('[Students] Erro ao criar aluno de teste:', err)
    throw new BadRequestError(`Erro ao criar aluno de teste: ${err instanceof Error ? err.message : 'Desconhecido'}`)
  }
})

export { students as studentsRoutes }
