/**
 * workers/api/admin.ts
 *
 * admin.ts — Painel administrativo da plataforma
 *
 * Exports: adminRoutes
 * Features: DB: Neon
 */

// ============================================
// admin.ts — Painel administrativo da plataforma
// ============================================
//
// O que faz:
//   Endpoints exclusivos para admin e super_admin. Visão global da plataforma:
//   stats, gestão de usuários, transferências, saques manuais e simulação de
//   sessão (super_admin impersona personal/student via KV para depuração).
//
// Exports principais:
//   adminRoutes — Hono app montado em /api/v1/admin
//
// Auth: requireType('admin', 'super_admin'). super_admin tem acesso total;
//       admin pode ver/editar mas não pode deletar nem fazer saques.
// DB: users, personals, students, payments, affiliates, audit_log
// ============================================

import { Hono, type Context } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, paginated, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '@lib/errors'
import { signAccessToken, signRefreshToken, createSession } from '@lib/auth-helpers'
import {
  getOrCreateCustomer,
  createAsaasPayment,
  getPixQrCode,
  mapPaymentMethod,
  getBalance,
  getPaymentStatistics,
  createPixTransfer,
} from '@lib/asaas'
import { FEES } from '@config/constants'
import { createMiddleware } from 'hono/factory'
import { syncPendingPaymentsStatus } from './payments'
import { dispatchCalendarReminders } from '@lib/calendar-reminders'

// ============================================
// SUPER_ADMIN emails — NEVER deletable
// Primary: victor.duarte@vfit.app.br
// Legacy kept for safety during transition.
// ============================================
const PROTECTED_SUPER_ADMIN_EMAILS = new Set([
  'victor.duarte@vfit.app.br',
  'victor.duarte@personalia.com.br',   // legacy domain — keep for safety
  'victor.duarte@personalia.app.br',   // legacy domain — keep for safety
])

// ============================================
// Admin middleware — verifica role=admin|super_admin no DB
// Sets c.var.userRole for downstream permission checks
// ============================================
const requireAdmin = createMiddleware<AppContext>(async (c, next) => {
  const userId = c.get('userId')

  const user = await pgQueryOne<{ role: string; email: string }>(
    c.env,
    'SELECT role, email FROM users WHERE id = $1',
    [userId]
  )

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    throw new ForbiddenError('Acesso restrito a administradores')
  }

  // Store role in Hono variables (CF Workers headers are immutable!)
  c.set('userRole', user.role)

  await next()
})

// Helper to check if current user is super_admin
function isSuperAdmin(c: { get(key: 'userRole'): string | undefined }): boolean {
  return c.get('userRole') === 'super_admin'
}

type SimulationMode = 'super_admin' | 'personal' | 'student'

interface AdminSimulationSession {
  mode: SimulationMode
  target_user_id: string | null
  target_user_type: 'personal' | 'student' | null
  target_email: string | null
  actor_user_id: string
  updated_at: string
}

// ============================================
// Audit helper (best-effort)
// - grava em app_logs
// - NÃO inclui dados sensíveis (evitar PII/segredos)
// ============================================

async function auditAdminAction(
  c: Context<AppContext>,
  input: {
    action: string
    target_type?: 'user' | 'personal' | 'payment' | 'transfer' | 'workout' | 'config'
    target_id?: string
    level?: 'info' | 'warn' | 'error'
    context?: Record<string, unknown>
  }
): Promise<void> {
  const actorId = c.get('userId')
  const actorType = String(c.get('userType') || 'admin')
  const actorRole = String(c.get('userRole') || 'admin')
  const requestId = (c.get('requestId') as string | undefined) || null
  const ua = c.req.header('User-Agent') || 'unknown'

  const ctx = {
    action: input.action,
    target_type: input.target_type || null,
    target_id: input.target_id || null,
    ...(input.context || {}),
  }

  await pgQuery(
    c.env,
    `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, context, path, user_agent, request_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)`,
    [
      generateId(),
      actorId || null,
      actorType,
      actorRole,
      input.level || 'info',
      'admin.audit',
      input.action.slice(0, 2000),
      JSON.stringify(ctx),
      new URL(c.req.url).pathname.slice(0, 500),
      ua.slice(0, 500),
      requestId,
    ]
  )
}

// Middleware that REQUIRES super_admin
const requireSuperAdmin = createMiddleware<AppContext>(async (c, next) => {
  if (!isSuperAdmin(c)) {
    throw new ForbiddenError('Acesso restrito a super administradores')
  }
  await next()
})

// Middleware that allows admin OR super_admin (for simulation)
const requireAdminOrSuperAdmin = createMiddleware<AppContext>(async (c, next) => {
  const role = c.get('userRole')
  if (role !== 'admin' && role !== 'super_admin') {
    throw new ForbiddenError('Acesso restrito a administradores')
  }
  await next()
})

export const adminRoutes = new Hono<AppContext>()

// Todas as rotas admin exigem auth + admin
adminRoutes.use('*', authMiddleware)
adminRoutes.use('*', requireAdmin)

// ============================================
// POST /admin/smoke/tokens — emitir tokens para testes (super_admin only)
// - Evita depender de Turnstile no smoke automatizado
// - Use APENAS em janela operacional controlada
// - Não loga secrets; resposta contém tokens (sensível)
// ============================================

adminRoutes.post('/smoke/tokens', requireSuperAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))

  const users = Array.isArray(body?.users) ? body.users : []
  if (users.length === 0 || users.length > 5) {
    throw new BadRequestError('Informe users (1-5 itens)')
  }

  const out: Array<{
    user: { id: string; email: string; user_type: string; role: string }
    tokens: { access_token: string; refresh_token: string; token_type: 'Bearer'; expires_in: number }
    session_id: string
  }> = []

  for (const item of users) {
    const userId = typeof item?.user_id === 'string' ? item.user_id : null
    const email = typeof item?.email === 'string' ? item.email.toLowerCase().trim() : null
    if (!userId && !email) {
      throw new BadRequestError('Cada item precisa de user_id ou email')
    }

    const user = await pgQueryOne<{
      id: string
      email: string
      user_type: string
      role: string | null
      is_active: boolean
    }>(
      c.env,
      userId
        ? 'SELECT id, email, user_type, role, is_active FROM users WHERE id = $1 LIMIT 1'
        : 'SELECT id, email, user_type, role, is_active FROM users WHERE email = $1 LIMIT 1',
      [userId || email]
    )

    if (!user || !user.is_active) {
      throw new NotFoundError('Usuário não encontrado/ativo')
    }

    // JWT type do middleware é personal|student. Admin é controlado via role.
    const jwtType = user.user_type === 'student' ? 'student' : 'personal'
    const jwtRole = user.role || 'user'

    const accessToken = await signAccessToken(
      { sub: user.id, email: user.email, type: jwtType, role: jwtRole as 'admin' | 'super_admin' | 'user' },
      c.env.JWT_SECRET
    )
    const refreshToken = await signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET)

    const sessionId = generateId()
    await createSession(c.env.KV_SESSIONS, sessionId, {
      userId: user.id,
      userType: jwtType,
      email: user.email,
      ip: c.req.header('cf-connecting-ip') || undefined,
      userAgent: c.req.header('user-agent') || undefined,
      createdAt: new Date().toISOString(),
    })

    // best-effort audit (não inclui email)
    c.executionCtx?.waitUntil?.(
      auditAdminAction(c, {
        action: 'admin.smoke.tokens',
        target_type: 'user',
        target_id: user.id,
        context: { jwt_type: jwtType, role: jwtRole },
      }).catch(() => {})
    )

    out.push({
      user: {
        id: user.id,
        email: user.email,
        user_type: (jwtRole === 'admin' || jwtRole === 'super_admin') ? 'admin' : jwtType,
        role: jwtRole,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
      },
      session_id: sessionId,
    })
  }

  c.header('Cache-Control', 'no-store')
  return success({ issued: out.length, users: out })
})

// ============================================
// POST /admin/smoke/notifications — criar notificações de teste (super_admin only)
// Body: { notifications: [{ user_id, type, title, message, link? }] }
// Usa INSERT direto — NÃO dispara push/email (apenas in_app).
// ============================================

adminRoutes.post('/smoke/notifications', requireSuperAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))

  const items = Array.isArray(body?.notifications) ? body.notifications : []
  if (items.length === 0 || items.length > 50) {
    throw new BadRequestError('Informe notifications (1-50 itens)')
  }

  const created_items: Array<{ id: string; user_id: string; type: string; title: string }> = []
  const now = new Date().toISOString()

  for (const item of items) {
    const userId = typeof item?.user_id === 'string' ? item.user_id.trim() : ''
    const type = typeof item?.type === 'string' ? item.type.trim() : ''
    const title = typeof item?.title === 'string' ? item.title.trim() : ''
    const message = typeof item?.message === 'string' ? item.message.trim() : ''
    const link = typeof item?.link === 'string' ? item.link.trim() : null

    if (!userId || !type || !title || !message) {
      throw new BadRequestError('Cada item precisa de user_id, type, title e message')
    }

    const id = generateId()

    await pgQuery(
      c.env,
      `INSERT INTO notifications (id, user_id, type, title, message, link, sent_via, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, '{in_app}', $7)`,
      [id, userId, type, title, message, link, now]
    )

    created_items.push({ id, user_id: userId, type, title })
  }

  return created({ created: created_items.length, notifications: created_items })
})

// ============================================
// DELETE /admin/smoke/notifications — limpar notificações de smoke (super_admin only)
// Body: { user_id, prefix?: string } — deleta notificações cujo title começa com prefix (default: "[SMOKE")
// ============================================

adminRoutes.delete('/smoke/notifications', requireSuperAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))

  const userId = typeof body?.user_id === 'string' ? body.user_id.trim() : ''
  if (!userId) {
    throw new BadRequestError('Informe user_id')
  }

  const prefix = typeof body?.prefix === 'string' ? body.prefix : '[SMOKE'

  const { rows } = await pgQuery<{ count: number }>(
    c.env,
    `DELETE FROM notifications WHERE user_id = $1 AND title LIKE $2 RETURNING 1`,
    [userId, `${prefix}%`]
  )

  return success({ deleted: rows.length, user_id: userId, prefix })
})

// ============================================
// POST /admin/cron/calendar-reminders — trigger manual (super_admin only)
// Body opcional: { windows_minutes?: number[], tolerance_minutes?: number }
// ============================================

adminRoutes.post('/cron/calendar-reminders', requireSuperAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))

  const windows = Array.isArray(body?.windows_minutes)
    ? body.windows_minutes.filter((n: unknown) => typeof n === 'number' && n > 0 && n <= 10080)
    : [1440, 60]
  const tolerance = typeof body?.tolerance_minutes === 'number' ? body.tolerance_minutes : 10

  const result = await dispatchCalendarReminders(c.env, {
    windowsMinutes: windows,
    toleranceMinutes: tolerance,
  })

  return success({ ok: true, result })
})

// ============================================
// GET /admin/infra/readiness — estado de prontidão infra (super_admin only)
// ============================================
adminRoutes.get('/infra/readiness', requireSuperAdmin, async (c) => {
  const queueBindings = {
    email_queue: Boolean(c.env.EMAIL_QUEUE),
    video_encode_queue: Boolean(c.env.VIDEO_ENCODE_QUEUE),
    pdf_queue: Boolean(c.env.PDF_QUEUE),
    ai_queue: Boolean(c.env.AI_QUEUE),
  }

  const recommendedCrons = [
    { cron: '0 3 * * *', purpose: 'XP expiration + cache warm-up' },
    { cron: '0 8 * * *', purpose: 'Calendar reminders' },
    { cron: '0 */4 * * *', purpose: 'Payment sync checks' },
    { cron: '0 2 * * 1', purpose: 'Affiliate weekly calc' },
  ]

  const allQueuesReady = Object.values(queueBindings).every(Boolean)

  return success({
    readiness: {
      queues: {
        all_ready: allQueuesReady,
        bindings: queueBindings,
      },
      crons: {
        configured_in_worker: true,
        recommended: recommendedCrons,
      },
      next_steps: [
        'Validar plano Workers Paid ativo na conta Cloudflare',
        'Descomentar blocos queues + triggers no wrangler.toml',
        'Executar gate e deploy controlado com rollback plan',
      ],
    },
  })
})

// ============================================
// GET /admin/simulation/session — estado atual da simulação (super_admin only)
// POST /admin/simulation/session — define modo de simulação (checkpoint Sprint B)
// Observação: sessão alimenta contexto efetivo fora de /admin.
// Role real de super_admin permanece para override/manual ops quando necessário.
// ============================================
adminRoutes.get('/simulation/session', requireAdminOrSuperAdmin, async (c) => {
  const actorId = c.get('userId')
  const key = `admin-simulation:${actorId}`
  const saved = await c.env.KV_SESSIONS.get(key, 'json') as AdminSimulationSession | null

  return success({
    simulation: saved || {
      mode: 'super_admin',
      target_user_id: null,
      target_user_type: null,
      target_email: null,
      actor_user_id: actorId,
      updated_at: new Date().toISOString(),
    },
    capabilities: {
      can_switch_modes: true,
      changes_permissions: true,
      checkpoint: 'sprint-f-simulation-effective-context',
    },
  })
})

adminRoutes.post('/simulation/session', requireAdminOrSuperAdmin, async (c) => {
  const actorId = c.get('userId')
  const body = await c.req.json().catch(() => ({})) as {
    mode?: SimulationMode
    target_user_id?: string
  }

  const mode = body?.mode
  if (mode !== 'super_admin' && mode !== 'personal' && mode !== 'student') {
    throw new BadRequestError('mode deve ser super_admin|personal|student')
  }

  let targetUserId: string | null = null
  let targetUserType: 'personal' | 'student' | null = null
  let targetEmail: string | null = null

  if (mode !== 'super_admin') {
    targetUserId = typeof body?.target_user_id === 'string' ? body.target_user_id : null

    // Super admins can simulate as any mode without target_user_id (uses self)
    // or with target_user_id pointing to themselves (bypass type check)
    if (!targetUserId) {
      // Default to self — super_admin can view as any role
      targetUserId = actorId
    }

    const target = await pgQueryOne<{ id: string; user_type: 'personal' | 'student'; email: string }>(
      c.env,
      `SELECT id, user_type, email
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [targetUserId]
    )

    if (!target) {
      throw new NotFoundError('Usuário alvo da simulação não encontrado')
    }

    // Allow super_admins to simulate as any type (self-simulation for auditing)
    // For non-super_admin admins, still enforce type match
    const actor = await pgQueryOne<{ role: string }>(
      c.env,
      `SELECT role FROM users WHERE id = $1 LIMIT 1`,
      [actorId]
    )
    const isSuperAdmin = actor?.role === 'super_admin'

    if (!isSuperAdmin && target.user_type !== mode) {
      throw new BadRequestError(`target_user_id deve ser do tipo ${mode}`)
    }

    // Validate that the target user has the required profile record
    // e.g. simulating as 'student' requires a row in the students table
    // Super admins bypass this check — they can simulate any view for auditing
    if (mode === 'student' && !isSuperAdmin) {
      const hasStudentRecord = await pgQueryOne(
        c.env,
        `SELECT id FROM students WHERE id = $1 LIMIT 1`,
        [targetUserId]
      )
      if (!hasStudentRecord) {
        throw new BadRequestError(
          'Usuário alvo não possui registro de aluno (tabela students). Não é possível simular como student.'
        )
      }
    }

    targetUserType = mode as 'personal' | 'student'
    targetEmail = target.email
  }

  const session: AdminSimulationSession = {
    mode,
    target_user_id: targetUserId,
    target_user_type: targetUserType,
    target_email: targetEmail,
    actor_user_id: actorId,
    updated_at: new Date().toISOString(),
  }

  const key = `admin-simulation:${actorId}`
  await c.env.KV_SESSIONS.put(key, JSON.stringify(session), { expirationTtl: 8 * 60 * 60 })

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.simulation.session_updated',
      target_type: 'config',
      target_id: actorId,
      context: {
        mode,
        target_user_id: targetUserId,
        target_user_type: targetUserType,
      },
    }).catch(() => {})
  )

  return success({
    simulation: session,
    message: 'Checkpoint Sprint B: sessão de simulação atualizada',
  })
})

// ============================================
// POST /admin/ops/fix-profile-photo-urls — repair legacy invalid URLs (super_admin only)
// Fixes: https://profiles/<userId>/<file> → https://images.vfit.app.br/profiles/<userId>/<file>
// ============================================

adminRoutes.post('/ops/fix-profile-photo-urls', requireSuperAdmin, async (c) => {
  const { rows } = await pgQuery<{ updated: number }>(
    c.env,
    `WITH updated AS (
      UPDATE users
      SET profile_photo_url = regexp_replace(profile_photo_url, '^https?://profiles/', 'https://images.vfit.app.br/profiles/')
      WHERE profile_photo_url LIKE 'http://profiles/%' OR profile_photo_url LIKE 'https://profiles/%'
      RETURNING 1
    )
    SELECT COUNT(*)::int AS updated FROM updated`,
    []
  )

  return success({ ok: true, updated: rows[0]?.updated ?? 0 })
})

// ============================================
// GET /admin/stats — Métricas da plataforma
// Returns caller_role so frontend can adapt UI
// ============================================
adminRoutes.get('/stats', async (c) => {
  const callerRole = c.get('userRole') || 'admin'

  // Queries paralelas para performance
  // Asaas balance + statistics (best-effort, don't block stats)
  let asaasBalance: number | null = null
  let asaasStatistics: { income: { estimated: number; confirmed: number; received: number; overdue: number }; expense: { estimated: number; confirmed: number } } | null = null
  try {
    if (c.env.ASAAS_API_KEY) {
      const [bal, stats] = await Promise.all([
        getBalance(c.env),
        getPaymentStatistics(c.env).catch(() => null),
      ])
      asaasBalance = bal.balance ?? null
      asaasStatistics = stats
    }
  } catch (err) {
    console.warn('[Admin Stats] Asaas balance fetch failed:', err)
  }

  const [
    usersCount,
    personalsCount,
    studentsCount,
    paymentsStats,
    subscriptionsCount,
    recentSignups,
    revenueByMonth,
    topPersonals,
  ] = await Promise.all([
    // Total de usuários
    pgQueryOne<{ count: number }>(c.env, 'SELECT COUNT(*)::int as count FROM users'),

    // Total de personals
    pgQueryOne<{ count: number }>(c.env, 'SELECT COUNT(*)::int as count FROM personals'),

    // Total de alunos
    pgQueryOne<{ count: number }>(c.env, 'SELECT COUNT(*)::int as count FROM students'),

    // Pagamentos: total, confirmados, pendentes, receita plataforma
    pgQueryOne<{
      total_payments: number
      total_confirmed: number
      total_pending: number
      total_revenue: number
      platform_fees: number
      total_commissions: number
    }>(c.env, `
      SELECT
        COUNT(*)::int as total_payments,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int as total_confirmed,
        COUNT(*) FILTER (WHERE status = 'pending')::int as total_pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0)::float as total_revenue,
        COALESCE(SUM(platform_fee) FILTER (WHERE status = 'confirmed'), 0)::float as platform_fees,
        COALESCE(SUM(commission_amount) FILTER (WHERE status = 'confirmed'), 0)::float as total_commissions
      FROM payments
    `),

    // Total de assinaturas ativas
    pgQueryOne<{ count: number }>(c.env,
      "SELECT COUNT(*)::int as count FROM payment_subscriptions WHERE status = 'active'"
    ),

    // Novos cadastros últimos 30 dias
    pgQueryOne<{ count: number }>(c.env,
      "SELECT COUNT(*)::int as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'"
    ),

    // Receita por mês (últimos 6 meses)
    pgQuery<{ month: string; revenue: number; count: number; fees: number }>(c.env, `
      SELECT
        TO_CHAR(paid_at, 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0)::float as revenue,
        COUNT(*)::int as count,
        COALESCE(SUM(platform_fee), 0)::float as fees
      FROM payments
      WHERE status = 'confirmed' AND paid_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
      ORDER BY month DESC
    `),

    // Top 10 personals por receita
    pgQuery<{ personal_id: string; full_name: string; email: string; revenue: number; student_count: number }>(c.env, `
      SELECT
        u.id as personal_id,
        u.full_name,
        u.email,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0)::float as revenue,
        (SELECT COUNT(*)::int FROM students s WHERE s.personal_id = u.id) as student_count
      FROM users u
      LEFT JOIN payments p ON p.recipient_id = u.id
      WHERE u.user_type = 'personal'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY revenue DESC
      LIMIT 10
    `),
  ])

  return success({
    caller_role: callerRole,
    overview: {
      total_users: usersCount?.count ?? 0,
      total_personals: personalsCount?.count ?? 0,
      total_students: studentsCount?.count ?? 0,
      active_subscriptions: subscriptionsCount?.count ?? 0,
      new_signups_30d: recentSignups?.count ?? 0,
    },
    payments: {
      total_payments: paymentsStats?.total_payments ?? 0,
      total_confirmed: paymentsStats?.total_confirmed ?? 0,
      total_pending: paymentsStats?.total_pending ?? 0,
      total_revenue: paymentsStats?.total_revenue ?? 0,
      platform_fees: paymentsStats?.platform_fees ?? 0,
      total_commissions: paymentsStats?.total_commissions ?? 0,
    },
    asaas_balance: asaasBalance,
    asaas_statistics: asaasStatistics,
    revenue_by_month: revenueByMonth.rows,
    top_personals: topPersonals.rows,
  })
})

// ============================================
// GET /admin/users — Listar todos os usuários
// ============================================
adminRoutes.get('/users', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const search = url.searchParams.get('search') || ''
  const userType = url.searchParams.get('user_type') || ''
  const role = url.searchParams.get('role') || ''
  const sort = url.searchParams.get('sort') || 'created_at'
  const order = url.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC'

  let whereClause = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (search) {
    whereClause += ` AND (u.full_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }
  if (userType) {
    whereClause += ` AND u.user_type = $${paramIdx}`
    params.push(userType)
    paramIdx++
  }
  if (role) {
    whereClause += ` AND u.role = $${paramIdx}`
    params.push(role)
    paramIdx++
  }

  const allowedSorts = ['created_at', 'full_name', 'email', 'user_type']
  const sortCol = allowedSorts.includes(sort) ? sort : 'created_at'

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM users u ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT u.id, u.full_name, u.email, u.user_type, u.role,
            u.profile_photo_url as avatar_url, u.phone, u.email_verified,
            u.is_active, u.created_at, u.updated_at
     FROM users u ${whereClause}
     ORDER BY u.${sortCol} ${order}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    users: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /admin/users/:id — Detalhes de um usuário
// ============================================
adminRoutes.get('/users/:id', async (c) => {
  const { id } = c.req.param()

  const user = await pgQueryOne(
    c.env,
    `SELECT u.id, u.full_name, u.email, u.user_type, u.role,
            u.profile_photo_url as avatar_url, u.phone, u.email_verified,
            u.is_active, u.created_at, u.updated_at
     FROM users u WHERE u.id = $1`,
    [id]
  )

  if (!user) throw new NotFoundError('Usuário não encontrado')

  // Buscar perfil associado
  let profile = null
  const userData = user as { user_type: string }
  if (userData.user_type === 'personal') {
    profile = await pgQueryOne(c.env,
      `SELECT * FROM personals WHERE id = $1`, [id])
  } else if (userData.user_type === 'student') {
    profile = await pgQueryOne(c.env,
      `SELECT s.*, u.full_name as personal_name
       FROM students s
       LEFT JOIN users u ON u.id = s.personal_id
       WHERE s.id = $1`, [id])
  }

  // Pagamentos do usuário
  const { rows: payments } = await pgQuery(c.env,
    `SELECT id, amount, status, payment_method, created_at
     FROM payments
     WHERE payer_id = $1 OR recipient_id = $1
     ORDER BY created_at DESC LIMIT 10`, [id])

  return success({ user, profile, recent_payments: payments })
})

// ============================================
// GET /admin/users/:id/note — Nota administrativa privada (admin/super_admin)
// PUT /admin/users/:id/note — Upsert da nota administrativa privada
// ============================================
adminRoutes.get('/users/:id/note', async (c) => {
  const { id } = c.req.param()

  const exists = await pgQueryOne<{ id: string }>(
    c.env,
    'SELECT id FROM users WHERE id = $1 LIMIT 1',
    [id]
  )

  if (!exists) throw new NotFoundError('Usuário não encontrado')

  const note = await pgQueryOne<{
    id: string
    target_user_id: string
    note: string
    risk_level: 'none' | 'attention' | 'high'
    is_financial_risk: boolean
    updated_at: string
    updated_by: string
    updated_by_name: string | null
  }>(
    c.env,
    `SELECT n.id,
            n.target_user_id,
            n.note,
            n.risk_level,
            n.is_financial_risk,
            n.updated_at,
            n.updated_by,
            u.full_name AS updated_by_name
       FROM admin_account_notes n
       LEFT JOIN users u ON u.id = n.updated_by
      WHERE n.target_user_id = $1
      LIMIT 1`,
    [id]
  )

  return success({ note: note || null })
})

adminRoutes.put('/users/:id/note', async (c) => {
  const { id } = c.req.param()
  const actorId = c.get('userId')
  const body = await c.req.json().catch(() => ({})) as {
    note?: string
    risk_level?: 'none' | 'attention' | 'high'
    is_financial_risk?: boolean
  }

  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (note.length === 0) {
    throw new BadRequestError('note é obrigatório')
  }
  if (note.length > 5000) {
    throw new BadRequestError('note excede limite de 5000 caracteres')
  }

  const riskLevel = body.risk_level || 'none'
  if (!['none', 'attention', 'high'].includes(riskLevel)) {
    throw new BadRequestError('risk_level deve ser none|attention|high')
  }

  const isFinancialRisk = body.is_financial_risk === true

  const exists = await pgQueryOne<{ id: string }>(
    c.env,
    'SELECT id FROM users WHERE id = $1 LIMIT 1',
    [id]
  )
  if (!exists) throw new NotFoundError('Usuário não encontrado')

  const upserted = await pgQueryOne<{
    id: string
    target_user_id: string
    note: string
    risk_level: 'none' | 'attention' | 'high'
    is_financial_risk: boolean
    updated_at: string
    updated_by: string
  }>(
    c.env,
    `INSERT INTO admin_account_notes (
        id,
        target_user_id,
        note,
        risk_level,
        is_financial_risk,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, NOW(), NOW())
      ON CONFLICT (target_user_id)
      DO UPDATE SET
        note = EXCLUDED.note,
        risk_level = EXCLUDED.risk_level,
        is_financial_risk = EXCLUDED.is_financial_risk,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING id, target_user_id, note, risk_level, is_financial_risk, updated_at, updated_by`,
    [generateId(), id, note, riskLevel, isFinancialRisk, actorId]
  )

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.users.note.upsert',
      target_type: 'user',
      target_id: id,
      context: {
        risk_level: riskLevel,
        is_financial_risk: isFinancialRisk,
      },
    }).catch(() => {})
  )

  return success({ note: upserted, message: 'Nota administrativa salva' })
})

// ============================================
// PATCH /admin/users/:id — Editar usuário
// admin: pode editar nome, email, phone, email_verified
// super_admin: pode editar TUDO incluindo role e user_type
// ============================================
adminRoutes.patch('/users/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const superAdmin = isSuperAdmin(c)

  // Admin pode editar campos básicos, super_admin pode editar tudo
  const allowed = superAdmin
    ? ['full_name', 'email', 'phone', 'user_type', 'role', 'email_verified', 'profile_photo_url', 'is_active']
    : ['full_name', 'email', 'phone', 'email_verified']

  // Admin não pode alterar role de ninguém
  if (!superAdmin && (body.role || body.user_type || body.is_active !== undefined)) {
    throw new ForbiddenError('Apenas super admins podem alterar role, tipo ou status')
  }

  const updates: string[] = []
  const params: unknown[] = []
  let paramIdx = 1

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates.push(`${key} = $${paramIdx}`)
      params.push(body[key])
      paramIdx++
    }
  }

  if (updates.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  updates.push(`updated_at = NOW()`)

  const result = await pgQueryOne(
    c.env,
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    [...params, id]
  )

  if (!result) throw new NotFoundError('Usuário não encontrado')

  const changedFields = allowed.filter((k) => body[k] !== undefined)
  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.users.patch',
      target_type: 'user',
      target_id: id,
      context: { changed_fields: changedFields },
    }).catch(() => {})
  )

  return success({ user: result, message: 'Usuário atualizado' })
})

// ============================================
// DELETE /admin/users/:id — HARD DELETE (super_admin only)
// Deletes user and ALL related data permanently
// super_admin cannot be deleted by anyone
// ============================================
adminRoutes.delete('/users/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()
  const adminId = c.get('userId')

  if (id === adminId) {
    throw new BadRequestError('Você não pode deletar sua própria conta')
  }

  // Check target user exists and is NOT super_admin
  const target = await pgQueryOne<{ id: string; full_name: string; email: string; role: string }>(
    c.env,
    'SELECT id, full_name, email, role FROM users WHERE id = $1',
    [id]
  )

  if (!target) throw new NotFoundError('Usuário não encontrado')

  if (
    target.role === 'super_admin'
    || PROTECTED_SUPER_ADMIN_EMAILS.has(String(target.email).toLowerCase())
  ) {
    throw new ForbiddenError('Super admins não podem ser deletados')
  }

  // HARD DELETE — cascade through all related tables
  // Order matters: delete child records first
  // BUG FIX: When deleting a personal, we must also clean up ALL records
  // for their students, because some FK constraints lack ON DELETE CASCADE
  // (e.g., workout_logs). Collect all affected user IDs first.

  // 1. Collect student IDs belonging to this personal (if target is a personal)
  const studentRows = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM students WHERE personal_id = $1',
    [id]
  )
  const studentIds = studentRows.rows.map((r) => r.id)

  // All user IDs to clean up: the target + all their students
  const allIds = [id, ...studentIds]
  const allIdsArray = `{${allIds.join(',')}}`

  // 2. Delete ALL child records for all affected users
  // Using ANY($1::uuid[]) for batch cleanup
  await pgQuery(c.env, 'DELETE FROM messages WHERE sender_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM conversations WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM notifications WHERE user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM student_badges WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM workout_logs WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM workout_exercises WHERE workout_id IN (SELECT id FROM workouts WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[]))', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM workouts WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM assessments WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM assessment_evolution WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM personal_reviews WHERE personal_id = ANY($1::uuid[]) OR student_id = ANY($1::uuid[])', [allIdsArray])
  // Affiliates must be cleaned before payments (affiliate_commissions references payments.id AND referrals.id)
  await pgQuery(c.env, `DELETE FROM affiliate_commissions WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = $1)
    OR referral_id IN (SELECT id FROM referrals WHERE referred_personal_id = $1)
    OR payment_id IN (SELECT id FROM payments WHERE payer_id = ANY($2::uuid[]) OR recipient_id = $1)`, [id, allIdsArray])
  await pgQuery(c.env, 'DELETE FROM referrals WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = $1) OR referred_personal_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM affiliates WHERE personal_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM payments WHERE payer_id = ANY($1::uuid[]) OR recipient_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM payment_subscriptions WHERE payer_id = ANY($1::uuid[]) OR recipient_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM pix_transfers WHERE personal_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM plan_purchases WHERE buyer_id = ANY($1::uuid[]) OR plan_id IN (SELECT id FROM workout_plans WHERE created_by = ANY($1::uuid[]))', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM workout_plans WHERE created_by = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM personal_settings WHERE id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM asaas_customers WHERE user_id = ANY($1::uuid[]) OR personal_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM ai_usage_logs WHERE user_id = ANY($1::uuid[])', [allIdsArray])

  // 3. Tables added after initial schema (were missing, causing FK violations)
  await pgQuery(c.env, 'DELETE FROM admin_account_notes WHERE target_user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM audit_log WHERE actor_user_id = ANY($1::uuid[]) OR target_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM user_passkeys WHERE user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM feedback_suggestions WHERE user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM feedback_replies WHERE user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM app_logs WHERE user_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM calendar_events WHERE personal_id = $1 OR student_id = ANY($2::uuid[])', [id, allIdsArray])
  await pgQuery(c.env, 'DELETE FROM workout_session_state WHERE user_id = ANY($1::text[])', [allIdsArray])

  // 4. XP Economy tables (all reference students ON DELETE CASCADE, but explicit is safer)
  await pgQuery(c.env, 'DELETE FROM xp_streak_milestones WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_deduplication WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_audit_log WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_daily_limits WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_transactions WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_balances WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM xp_streaks WHERE student_id = ANY($1::uuid[])', [allIdsArray])
  await pgQuery(c.env, 'DELETE FROM user_daily_goals WHERE student_id = ANY($1::uuid[])', [allIdsArray])

  // 5. Delete entity records (order: students → personals → users)
  await pgQuery(c.env, 'DELETE FROM students WHERE id = ANY($1::uuid[]) OR personal_id = $2', [allIdsArray, id])
  await pgQuery(c.env, 'DELETE FROM personals WHERE id = $1', [id])
  // Delete all affected users (the personal + their students)
  await pgQuery(c.env, 'DELETE FROM users WHERE id = ANY($1::uuid[])', [allIdsArray])

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.users.hard_delete',
      level: 'warn',
      target_type: 'user',
      target_id: id,
      context: { deleted: true },
    }).catch(() => {})
  )

  return success({ message: `Usuário ${target.full_name} (${target.email}) deletado permanentemente`, deleted: true })
})

// ============================================
// POST /admin/users/:id/bonus — Adicionar bônus
// ============================================
adminRoutes.post('/users/:id/bonus', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const { amount, description, type } = body

  if (!amount || amount <= 0) {
    throw new BadRequestError('Valor do bônus deve ser positivo')
  }

  // Verificar se usuário existe
  const user = await pgQueryOne<{ id: string; full_name: string; user_type: string }>(
    c.env,
    'SELECT id, full_name, user_type FROM users WHERE id = $1',
    [id]
  )
  if (!user) throw new NotFoundError('Usuário não encontrado')

  const bonusId = generateId()
  const adminId = c.get('userId')

  // Registrar bônus como pagamento especial
  await pgQuery(c.env,
    `INSERT INTO payments (id, payer_id, recipient_id, amount, platform_fee, commission_amount, net_amount,
      status, payment_method, description, paid_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 0, 0, $4, 'confirmed', 'pix', $5, NOW(), NOW(), NOW())`,
    [
      bonusId,
      adminId,
      id,
      amount,
      description || `Bônus: ${type || 'admin'} — R$ ${amount}`,
    ]
  )

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.users.bonus',
      target_type: 'user',
      target_id: id,
      context: { amount, bonus_type: type || 'admin' },
    }).catch(() => {})
  )

  return created({
    bonus_id: bonusId,
    user_id: id,
    user_name: user.full_name,
    amount,
    description,
    message: 'Bônus adicionado com sucesso',
  })
})

// ============================================
// GET /admin/personals — Listar personal trainers
// ============================================
adminRoutes.get('/personals', async (c) => {
  try {
    const url = new URL(c.req.url)
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
    const offset = (page - 1) * perPage
    const search = url.searchParams.get('search') || ''
    const planType = url.searchParams.get('plan_type') || ''

    let whereClause = "WHERE u.user_type = 'personal'"
    const params: unknown[] = []
    let paramIdx = 1

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }
    if (planType) {
      whereClause += ` AND p.subscription_plan = $${paramIdx}`
      params.push(planType)
      paramIdx++
    }

    console.log('[Admin Personals] Fetching count...')
    const countResult = await pgQueryOne<{ count: number }>(
      c.env,
      `SELECT COUNT(*)::int as count FROM users u
       LEFT JOIN personals p ON p.id = u.id
       ${whereClause}`,
      params
    )
    console.log('[Admin Personals] Count:', countResult?.count)

    console.log('[Admin Personals] Fetching rows...')
    const { rows } = await pgQuery(
      c.env,
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
              p.cref, p.subscription_plan as plan_type,
              p.subscription_status,
              p.specialties, p.total_students,
              p.accepted_fee_percentage,
              (SELECT COUNT(*)::int FROM students s WHERE s.personal_id = u.id) as student_count
       FROM users u
       LEFT JOIN personals p ON p.id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, perPage, offset]
    )
    console.log('[Admin Personals] Rows:', rows.length)

    return success({
      personals: rows,
      meta: {
        page,
        per_page: perPage,
        total: countResult?.count ?? 0,
        total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
      },
    })
  } catch (err) {
    console.error('[Admin Personals] ERROR:', err)
    throw err
  }
})

// ============================================
// PATCH /admin/personals/:id — Editar personal trainer
// ============================================
adminRoutes.patch('/personals/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const allowed = ['subscription_plan', 'subscription_expires_at', 'cref', 'specialties', 'bio']
  const updates: string[] = []
  const params: unknown[] = []
  let paramIdx = 1

  // Map frontend field names to DB columns
  const fieldMap: Record<string, string> = {
    plan_type: 'subscription_plan',
    plan_expires_at: 'subscription_expires_at',
  }

  for (const key of [...allowed, 'plan_type', 'plan_expires_at']) {
    if (body[key] !== undefined) {
      const dbCol = fieldMap[key] || key
      // avoid duplicates from mapping
      if (updates.some(u => u.startsWith(`${dbCol} =`))) continue
      if (key === 'specialties' && typeof body[key] === 'string') {
        updates.push(`${dbCol} = $${paramIdx}`)
        params.push(`{${body[key]}}`) // pg array format
      } else if (key === 'specialties' && Array.isArray(body[key])) {
        updates.push(`${dbCol} = $${paramIdx}`)
        params.push(`{${body[key].join(',')}}`)
      } else {
        updates.push(`${dbCol} = $${paramIdx}`)
        params.push(body[key])
      }
      paramIdx++
    }
  }

  if (updates.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  updates.push('updated_at = NOW()')

  const result = await pgQueryOne(
    c.env,
    `UPDATE personals SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    [...params, id]
  )

  if (!result) throw new NotFoundError('Personal não encontrado')

  const changed = updates
    .map((u) => u.split('=')[0]?.trim())
    .filter((k) => k && k !== 'updated_at')
  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.personals.patch',
      target_type: 'personal',
      target_id: id,
      context: { changed_fields: changed },
    }).catch(() => {})
  )

  // Se alterou plano, atualizar também user_type se necessário
  if (body.full_name || body.email || body.role) {
    const userUpdates: string[] = []
    const userParams: unknown[] = []
    let ui = 1
    if (body.full_name) { userUpdates.push(`full_name = $${ui}`); userParams.push(body.full_name); ui++ }
    if (body.email) { userUpdates.push(`email = $${ui}`); userParams.push(body.email); ui++ }
    if (body.role) { userUpdates.push(`role = $${ui}`); userParams.push(body.role); ui++ }
    if (userUpdates.length) {
      userUpdates.push('updated_at = NOW()')
      await pgQuery(c.env, `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${ui}`, [...userParams, id])
    }
  }

  return success({ personal: result, message: 'Personal atualizado' })
})

// ============================================
// GET /admin/payments — Todas as transações
// ============================================
adminRoutes.get('/payments', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const status = url.searchParams.get('status') || ''
  const method = url.searchParams.get('payment_method') || ''
  const search = url.searchParams.get('search') || ''
  const dateFrom = url.searchParams.get('date_from') || ''
  const dateTo = url.searchParams.get('date_to') || ''

  let whereClause = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (status) {
    whereClause += ` AND p.status = $${paramIdx}`
    params.push(status)
    paramIdx++
  }
  if (method) {
    whereClause += ` AND p.payment_method = $${paramIdx}`
    params.push(method)
    paramIdx++
  }
  if (search) {
    whereClause += ` AND (payer.full_name ILIKE $${paramIdx} OR recipient.full_name ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }
  if (dateFrom) {
    whereClause += ` AND p.created_at >= $${paramIdx}`
    params.push(dateFrom)
    paramIdx++
  }
  if (dateTo) {
    whereClause += ` AND p.created_at <= $${paramIdx}`
    params.push(dateTo + 'T23:59:59Z')
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count
     FROM payments p
     LEFT JOIN users payer ON payer.id = p.payer_id
     LEFT JOIN users recipient ON recipient.id = p.recipient_id
     ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT p.*,
            payer.full_name as payer_name, payer.email as payer_email,
            recipient.full_name as recipient_name, recipient.email as recipient_email
     FROM payments p
     LEFT JOIN users payer ON payer.id = p.payer_id
     LEFT JOIN users recipient ON recipient.id = p.recipient_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  // Sincronizar status de pagamentos pendentes com Asaas API
  await syncPendingPaymentsStatus(c.env, rows as any[])

  return success({
    payments: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// POST /admin/payments — Criar cobrança (admin)
// Pode criar cobrança de qualquer personal para qualquer aluno
// ============================================
adminRoutes.post('/payments', async (c) => {
  const body = await c.req.json()
  const { payer_id, recipient_id, amount, payment_method, due_date, description, create_in_asaas } = body

  if (!payer_id || !recipient_id || !amount || amount <= 0) {
    throw new BadRequestError('payer_id, recipient_id e amount são obrigatórios')
  }

  // Verificar se ambos existem
  const payer = await pgQueryOne<{ id: string; full_name: string; email: string }>(
    c.env, 'SELECT id, full_name, email FROM users WHERE id = $1', [payer_id])
  const recipient = await pgQueryOne<{ id: string; full_name: string }>(
    c.env, 'SELECT id, full_name FROM users WHERE id = $1', [recipient_id])

  if (!payer) throw new NotFoundError('Pagador não encontrado')
  if (!recipient) throw new NotFoundError('Recebedor não encontrado')

  const paymentId = generateId()
  const platformFee = Number((amount * (FEES.platform_fee_percentage / 100)).toFixed(2))
  const netAmount = Number((amount - platformFee).toFixed(2))
  const dueDateValue = due_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let asaasPaymentId: string | null = null
  let invoiceUrl: string | null = null
  let pixData: { qrCode?: string; payload?: string; expirationDate?: string } | null = null

  // Criar no Asaas se solicitado
  if (create_in_asaas !== false) {
    try {
      const customer = await getOrCreateCustomer(c.env, {
        name: payer.full_name,
        email: payer.email,
        cpfCnpj: '00000000000', // Admin test — CPF placeholder
        externalReference: payer_id,
      })

      const asaasPayment = await createAsaasPayment(c.env, {
        customer: customer.id,
        billingType: mapPaymentMethod(payment_method || 'pix'),
        value: amount,
        dueDate: dueDateValue,
        description: description || `Cobrança VFIT — ${recipient.full_name}`,
        externalReference: paymentId,
      })

      asaasPaymentId = asaasPayment.id
      invoiceUrl = asaasPayment.invoiceUrl || null

      if ((payment_method || 'pix') === 'pix' && asaasPaymentId) {
        try {
          const rawPix = await getPixQrCode(c.env, asaasPaymentId)
          pixData = {
            qrCode: rawPix.encodedImage,
            payload: rawPix.payload,
            expirationDate: rawPix.expirationDate,
          }
        } catch (e) {
          console.error('[Admin] PIX QR code error:', e)
        }
      }
    } catch (e) {
      console.error('[Admin] Asaas payment error:', e)
      // Continua sem Asaas
    }
  }

  // Inserir no DB
  await pgQuery(c.env,
    `INSERT INTO payments (id, payer_id, recipient_id, amount, platform_fee, commission_amount, net_amount,
      status, payment_method, due_date, description, asaas_payment_id, invoice_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 0, $6, 'pending', $7, $8, $9, $10, $11, NOW(), NOW())`,
    [paymentId, payer_id, recipient_id, amount, platformFee, netAmount,
     payment_method || 'pix', dueDateValue, description || null, asaasPaymentId, invoiceUrl]
  )

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.payments.create',
      target_type: 'payment',
      target_id: paymentId,
      context: {
        payer_id,
        recipient_id,
        amount,
        payment_method: payment_method || 'pix',
        create_in_asaas: create_in_asaas !== false,
      },
    }).catch(() => {})
  )

  return created({
    id: paymentId,
    amount,
    platform_fee: platformFee,
    net_amount: netAmount,
    status: 'pending',
    payment_method: payment_method || 'pix',
    due_date: dueDateValue,
    asaas_payment_id: asaasPaymentId,
    invoice_url: invoiceUrl,
    payer_name: payer.full_name,
    recipient_name: recipient.full_name,
    pix: pixData,
  })
})

// ============================================
// PATCH /admin/payments/:id — Atualizar pagamento
// ============================================
adminRoutes.patch('/payments/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const allowed = ['status', 'amount', 'payment_method', 'description', 'due_date', 'paid_at']
  const updates: string[] = []
  const params: unknown[] = []
  let paramIdx = 1

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates.push(`${key} = $${paramIdx}`)
      params.push(body[key])
      paramIdx++
    }
  }

  if (updates.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  // Recalcular valores se amount mudou
  if (body.amount) {
    const newAmount = body.amount
    const platformFee = Number((newAmount * (FEES.platform_fee_percentage / 100)).toFixed(2))
    const netAmount = Number((newAmount - platformFee).toFixed(2))
    updates.push(`platform_fee = $${paramIdx}`)
    params.push(platformFee)
    paramIdx++
    updates.push(`net_amount = $${paramIdx}`)
    params.push(netAmount)
    paramIdx++
  }

  updates.push('updated_at = NOW()')

  const result = await pgQueryOne(
    c.env,
    `UPDATE payments SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    [...params, id]
  )

  if (!result) throw new NotFoundError('Pagamento não encontrado')

  const changedFields = allowed.filter((k) => body[k] !== undefined)
  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.payments.patch',
      target_type: 'payment',
      target_id: id,
      context: { changed_fields: changedFields },
    }).catch(() => {})
  )

  return success({ payment: result, message: 'Pagamento atualizado' })
})

// ============================================
// GET /admin/subscriptions — Listar assinaturas
// ============================================
adminRoutes.get('/subscriptions', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const countResult = await pgQueryOne<{ count: number }>(
    c.env, 'SELECT COUNT(*)::int as count FROM payment_subscriptions')

  const { rows } = await pgQuery(
    c.env,
    `SELECT ps.*,
            payer.full_name as payer_name,
            recipient.full_name as recipient_name
     FROM payment_subscriptions ps
     LEFT JOIN users payer ON payer.id = ps.payer_id
     LEFT JOIN users recipient ON recipient.id = ps.recipient_id
     ORDER BY ps.created_at DESC
     LIMIT $1 OFFSET $2`,
    [perPage, offset]
  )

  return success({
    subscriptions: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /admin/affiliates — Comissões e afiliados
// ============================================
adminRoutes.get('/affiliates', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows } = await pgQuery(
    c.env,
    `SELECT
       a.id, u.full_name, u.email,
       p.referral_code,
       a.total_referrals,
       COUNT(su.id)::int as student_referrals,
       a.total_earned::float as total_earnings,
       a.withdrawn_total::float as total_paid,
       a.available_balance::float as total_pending
     FROM affiliates a
     JOIN personals p ON p.id = a.personal_id
     JOIN users u ON u.id = a.personal_id
     LEFT JOIN users su
       ON su.user_type = 'student'
      AND su.metadata->'affiliate_student'->>'affiliate_id' = a.id::text
      AND su.metadata->'affiliate_student'->>'referred_personal_id' = p.id::text
     GROUP BY a.id, u.full_name, u.email, p.referral_code, a.total_referrals, a.total_earned, a.withdrawn_total, a.available_balance
     ORDER BY a.total_earned DESC
     LIMIT $1 OFFSET $2`,
    [perPage, offset]
  )

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM affiliates`
  )

  return success({
    affiliates: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /admin/transfers — Todos os saques PIX
// ============================================
adminRoutes.get('/transfers', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const countResult = await pgQueryOne<{ count: number }>(
    c.env, 'SELECT COUNT(*)::int as count FROM pix_transfers')

  const { rows } = await pgQuery(
    c.env,
    `SELECT pt.id, pt.personal_id, pt.asaas_transfer_id, pt.pix_key, pt.pix_key_type,
            pt.amount::float, pt.fee::float, pt.net_amount::float,
            pt.status, pt.failed_reason, pt.requested_at, pt.completed_at,
            pt.created_at, pt.updated_at,
            u.full_name as personal_name, u.email as personal_email
     FROM pix_transfers pt
     LEFT JOIN users u ON u.id = pt.personal_id
     ORDER BY pt.created_at DESC
     LIMIT $1 OFFSET $2`,
    [perPage, offset]
  )

  return success({
    transfers: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// POST /admin/transfers — Criar saque manual (super_admin only)
// ============================================
adminRoutes.post('/transfers', requireSuperAdmin, async (c) => {
  const body = await c.req.json()
  const { personal_id, amount, pix_key, pix_key_type, description } = body

  if (!personal_id || !amount || amount <= 0) {
    throw new BadRequestError('personal_id e amount são obrigatórios')
  }

  const personal = await pgQueryOne<{ id: string; full_name: string }>(
    c.env, 'SELECT id, full_name FROM users WHERE id = $1', [personal_id])
  if (!personal) throw new NotFoundError('Personal não encontrado')

  const transferId = generateId()
  const fee = Number((amount * 0.01).toFixed(2)) // 1% fee
  const netAmount = Number((amount - fee).toFixed(2))

  // Try Asaas transfer if API key available
  let asaasTransferId: string | null = null
  if (c.env.ASAAS_API_KEY && pix_key) {
    try {
      const transfer = await createPixTransfer(c.env, {
        value: netAmount,
        pixAddressKey: pix_key,
        pixAddressKeyType: pix_key_type || 'EMAIL',
        description: description || `Saque manual — ${personal.full_name}`,
      })
      asaasTransferId = transfer.id || null
    } catch (e) {
      console.error('[Admin] Asaas transfer error:', e)
    }
  }

  await pgQuery(c.env,
    `INSERT INTO pix_transfers (id, personal_id, amount, fee, net_amount, pix_key, pix_key_type, status, asaas_transfer_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
    [transferId, personal_id, amount, fee, netAmount, pix_key || '', pix_key_type || 'EMAIL',
     asaasTransferId ? 'processing' : 'pending', asaasTransferId]
  )

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.transfers.create',
      target_type: 'transfer',
      target_id: transferId,
      context: { personal_id, amount, net_amount: netAmount },
    }).catch(() => {})
  )

  return created({
    id: transferId,
    personal_id,
    personal_name: personal.full_name,
    amount, fee, net_amount: netAmount,
    status: asaasTransferId ? 'processing' : 'pending',
    asaas_transfer_id: asaasTransferId,
    message: 'Saque criado com sucesso',
  })
})

// ============================================
// GET /admin/workouts — Listar TODOS os treinos da plataforma
// ============================================
adminRoutes.get('/workouts', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''

  let whereClause = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (search) {
    whereClause += ` AND (w.name ILIKE $${paramIdx} OR personal.full_name ILIKE $${paramIdx} OR student.full_name ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }
  if (status) {
    whereClause += ` AND w.status = $${paramIdx}`
    params.push(status)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count
     FROM workouts w
     LEFT JOIN users personal ON personal.id = w.personal_id
     LEFT JOIN users student ON student.id = w.student_id
     ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT w.id, w.name, w.status, w.is_template, w.ai_generated, w.created_at, w.updated_at,
            w.personal_id, w.student_id,
            personal.full_name as personal_name, personal.email as personal_email,
            student.full_name as student_name, student.email as student_email,
            (SELECT COUNT(*)::int FROM workout_exercises WHERE workout_id = w.id) as exercise_count
     FROM workouts w
     LEFT JOIN users personal ON personal.id = w.personal_id
     LEFT JOIN users student ON student.id = w.student_id
     ${whereClause}
     ORDER BY w.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    workouts: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// DELETE /admin/workouts/:id — HARD DELETE treino (super_admin only)
// ============================================
adminRoutes.delete('/workouts/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()

  const workout = await pgQueryOne<{ id: string; name: string; personal_id: string }>(
    c.env, 'SELECT id, name, personal_id FROM workouts WHERE id = $1', [id]
  )
  if (!workout) throw new NotFoundError('Treino não encontrado')

  // Hard delete: exercises → logs → workout
  await pgQuery(c.env, 'DELETE FROM workout_exercises WHERE workout_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM workout_logs WHERE workout_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM workouts WHERE id = $1', [id])

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.workouts.hard_delete',
      level: 'warn',
      target_type: 'workout',
      target_id: id,
    }).catch(() => {})
  )

  return success({ message: `Treino "${workout.name}" deletado permanentemente`, deleted: true })
})

// ============================================
// DELETE /admin/payments/:id — HARD DELETE pagamento (super_admin only)
// ============================================
adminRoutes.delete('/payments/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()

  const payment = await pgQueryOne<{ id: string; amount: number; payer_id: string }>(
    c.env, 'SELECT id, amount, payer_id FROM payments WHERE id = $1', [id]
  )
  if (!payment) throw new NotFoundError('Pagamento não encontrado')

  // FK safety atômico: remove dependências e o pagamento no mesmo statement.
  // Evita violação de FK em cenários concorrentes.
  await pgQuery(
    c.env,
    `WITH deleted_commissions AS (
       DELETE FROM affiliate_commissions WHERE payment_id = $1
     )
     DELETE FROM payments WHERE id = $1`,
    [id]
  )

  c.executionCtx?.waitUntil?.(
    auditAdminAction(c, {
      action: 'admin.payments.hard_delete',
      level: 'warn',
      target_type: 'payment',
      target_id: id,
      context: { amount: payment.amount },
    }).catch(() => {})
  )

  return success({ message: `Pagamento de R$ ${payment.amount} deletado permanentemente`, deleted: true })
})

// ============================================
// GET /admin/assessments — Listar TODAS as avaliações
// ============================================
adminRoutes.get('/assessments', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const search = url.searchParams.get('search') || ''

  let whereClause = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (search) {
    whereClause += ` AND (personal.full_name ILIKE $${paramIdx} OR student.full_name ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count
     FROM assessments a
     LEFT JOIN users personal ON personal.id = a.personal_id
     LEFT JOIN users student ON student.id = a.student_id
     ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT a.id, a.weight_kg, a.height_cm, a.body_fat_percentage, a.notes, a.created_at,
            a.personal_id, a.student_id,
            personal.full_name as personal_name,
            student.full_name as student_name
     FROM assessments a
     LEFT JOIN users personal ON personal.id = a.personal_id
     LEFT JOIN users student ON student.id = a.student_id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    assessments: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// DELETE /admin/assessments/:id — HARD DELETE avaliação (super_admin only)
// ============================================
adminRoutes.delete('/assessments/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()

  const assessment = await pgQueryOne<{ id: string; student_id: string }>(
    c.env, 'SELECT id, student_id FROM assessments WHERE id = $1', [id]
  )
  if (!assessment) throw new NotFoundError('Avaliação não encontrada')

  await pgQuery(c.env, 'DELETE FROM assessments WHERE id = $1', [id])

  return success({ message: 'Avaliação deletada permanentemente', deleted: true })
})

// ============================================
// GET /admin/students — Listar TODOS os alunos
// ============================================
adminRoutes.get('/students', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const search = url.searchParams.get('search') || ''

  let whereClause = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (search) {
    whereClause += ` AND (student_user.full_name ILIKE $${paramIdx} OR student_user.email ILIKE $${paramIdx} OR personal_user.full_name ILIKE $${paramIdx})`
    params.push(`%${search}%`)
    paramIdx++
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count
     FROM students s
     LEFT JOIN users student_user ON student_user.id = s.id
     LEFT JOIN users personal_user ON personal_user.id = s.personal_id
     ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT s.id, s.personal_id, s.status, s.student_type, s.consultation_price, s.created_at,
            student_user.full_name as student_name, student_user.email as student_email,
            personal_user.full_name as personal_name, personal_user.email as personal_email
     FROM students s
     LEFT JOIN users student_user ON student_user.id = s.id
     LEFT JOIN users personal_user ON personal_user.id = s.personal_id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    students: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /admin/students/:id — Detalhe de um aluno (admin/super_admin)
// ============================================
adminRoutes.get('/students/:id', async (c) => {
  const { id } = c.req.param()

  const student = await pgQueryOne(
    c.env,
    `SELECT s.*, u.full_name, u.email, u.phone, u.profile_photo_url, u.email_verified,
            u.cpf, u.created_at as user_created_at
     FROM students s
     JOIN users u ON u.id = s.id
     WHERE s.id = $1
     LIMIT 1`,
    [id]
  )

  if (!student) {
    throw new NotFoundError('Aluno')
  }

  return success({ student })
})

// ============================================
// DELETE /admin/students/:id — HARD DELETE aluno (super_admin only)
// Deletes student record + all related data, keeps user account
// ============================================
adminRoutes.delete('/students/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()

  const student = await pgQueryOne<{ id: string; personal_id: string }>(
    c.env, 'SELECT id, personal_id FROM students WHERE id = $1', [id]
  )
  if (!student) throw new NotFoundError('Aluno não encontrado')

  // Delete all related data for this student
  await pgQuery(c.env, 'DELETE FROM student_badges WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM workout_logs WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM workout_exercises WHERE workout_id IN (SELECT id FROM workouts WHERE student_id = $1)', [id])
  await pgQuery(c.env, 'DELETE FROM workouts WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM assessments WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM personal_reviews WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM payments WHERE payer_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM payment_subscriptions WHERE payer_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM messages WHERE sender_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM conversations WHERE student_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM notifications WHERE user_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM asaas_customers WHERE user_id = $1', [id])
  await pgQuery(c.env, 'DELETE FROM students WHERE id = $1', [id])

  return success({ message: 'Aluno e todos os dados relacionados deletados permanentemente', deleted: true })
})

// ============================================
// GET /admin/feedback — Listar todas as sugestões (com reply_count)
// ============================================
adminRoutes.get('/feedback', async (c) => {
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage
  const status = url.searchParams.get('status')
  const category = url.searchParams.get('category')

  let whereClause = 'WHERE 1=1'
  const params: (string | number)[] = []
  let paramIdx = 1

  if (status) {
    whereClause += ` AND f.status = $${paramIdx++}`
    params.push(status)
  }
  if (category) {
    whereClause += ` AND f.category = $${paramIdx++}`
    params.push(category)
  }

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*) as count FROM feedback_suggestions f ${whereClause}`,
    params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT f.id, f.user_id, f.category, f.title, f.description, f.status, f.admin_notes, f.priority,
            f.has_new_reply, f.created_at, f.updated_at, f.resolved_at,
            u.full_name as user_name, u.email as user_email, u.user_type,
            (SELECT COUNT(*) FROM feedback_replies fr WHERE fr.feedback_id = f.id) as reply_count,
            (SELECT fr2.message FROM feedback_replies fr2 WHERE fr2.feedback_id = f.id ORDER BY fr2.created_at DESC LIMIT 1) as last_reply,
            (SELECT fr3.sender_type FROM feedback_replies fr3 WHERE fr3.feedback_id = f.id ORDER BY fr3.created_at DESC LIMIT 1) as last_reply_type
     FROM feedback_suggestions f
     LEFT JOIN users u ON u.id = f.user_id
     ${whereClause}
     ORDER BY 
       CASE f.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
       f.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, perPage, offset]
  )

  return success({
    feedback: rows,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// PATCH /admin/feedback/:id — Atualizar status/priority/notes
// ============================================
adminRoutes.patch('/feedback/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json<{
    status?: string
    priority?: string
    admin_notes?: string
  }>()

  const existing = await pgQueryOne(
    c.env, 'SELECT id FROM feedback_suggestions WHERE id = $1', [id]
  )
  if (!existing) throw new NotFoundError('Sugestão não encontrada')

  const updates: string[] = []
  const params: (string | null)[] = []
  let paramIdx = 1

  if (body.status) {
    const validStatuses = ['pending', 'reviewing', 'planned', 'in_progress', 'done', 'declined']
    if (!validStatuses.includes(body.status)) {
      throw new BadRequestError('Status inválido')
    }
    updates.push(`status = $${paramIdx++}`)
    params.push(body.status)
    if (body.status === 'done' || body.status === 'declined') {
      updates.push(`resolved_at = NOW()`)
    }
  }
  if (body.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    if (!validPriorities.includes(body.priority)) {
      throw new BadRequestError('Prioridade inválida')
    }
    updates.push(`priority = $${paramIdx++}`)
    params.push(body.priority)
  }
  if (body.admin_notes !== undefined) {
    updates.push(`admin_notes = $${paramIdx++}`)
    params.push(body.admin_notes || null)
  }

  if (updates.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  updates.push('updated_at = NOW()')

  const updated = await pgQueryOne(
    c.env,
    `UPDATE feedback_suggestions SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    [...params, id]
  )

  return success(updated)
})

// ============================================
// GET /admin/feedback/:id — Detalhe + replies (admin)
// ============================================
adminRoutes.get('/feedback/:id', async (c) => {
  const { id } = c.req.param()

  const feedback = await pgQueryOne(
    c.env,
    `SELECT f.id, f.user_id, f.category, f.title, f.description, f.status, f.admin_notes, f.priority,
            f.has_new_reply, f.created_at, f.updated_at, f.resolved_at,
            u.full_name as user_name, u.email as user_email, u.user_type
     FROM feedback_suggestions f
     LEFT JOIN users u ON u.id = f.user_id
     WHERE f.id = $1`,
    [id]
  )
  if (!feedback) throw new NotFoundError('Sugestão não encontrada')

  const { rows: replies } = await pgQuery(
    c.env,
    `SELECT id, message, sender_type, sender_name, created_at
     FROM feedback_replies
     WHERE feedback_id = $1
     ORDER BY created_at ASC`,
    [id]
  )

  return success({ ...feedback, replies })
})

// ============================================
// POST /admin/feedback/:id/reply — Admin responde sugestão
// ============================================
adminRoutes.post('/feedback/:id/reply', async (c) => {
  const adminId = c.get('userId')
  const { id } = c.req.param()
  const body = await c.req.json<{ message: string }>()

  if (!body.message || body.message.trim().length < 2) {
    throw new BadRequestError('Mensagem deve ter pelo menos 2 caracteres')
  }

  const feedback = await pgQueryOne(
    c.env, 'SELECT id FROM feedback_suggestions WHERE id = $1', [id]
  )
  if (!feedback) throw new NotFoundError('Sugestão não encontrada')

  // Get admin name
  const admin = await pgQueryOne<{ full_name: string }>(
    c.env, 'SELECT full_name FROM users WHERE id = $1', [adminId]
  )

  const reply = await pgQueryOne(
    c.env,
    `INSERT INTO feedback_replies (feedback_id, user_id, message, sender_type, sender_name)
     VALUES ($1, $2, $3, 'admin', $4)
     RETURNING id, message, sender_type, sender_name, created_at`,
    [id, adminId, body.message.trim(), admin?.full_name || 'Victor']
  )

  // Mark as having new reply for the user + update status to 'reviewing' if still pending
  await pgQuery(
    c.env,
    `UPDATE feedback_suggestions 
     SET has_new_reply = true, updated_at = NOW(),
         status = CASE WHEN status = 'pending' THEN 'reviewing' ELSE status END
     WHERE id = $1`,
    [id]
  ).catch(() => {})

  return created(reply)
})

// ============================================
// DELETE /admin/feedback/:id — Deletar sugestão (super_admin)
// ============================================
adminRoutes.delete('/feedback/:id', requireSuperAdmin, async (c) => {
  const { id } = c.req.param()

  const existing = await pgQueryOne(
    c.env, 'SELECT id FROM feedback_suggestions WHERE id = $1', [id]
  )
  if (!existing) throw new NotFoundError('Sugestão não encontrada')

  await pgQuery(c.env, 'DELETE FROM feedback_suggestions WHERE id = $1', [id])

  return noContent()
})
