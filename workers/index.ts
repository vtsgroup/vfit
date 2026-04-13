/**
 * workers/index.ts
 *
 * index.ts — Entry point do Cloudflare Worker (API Gateway)
 * Features: DB: Neon
 */

// ============================================
// index.ts — Entry point do Cloudflare Worker (API Gateway)
// ============================================
//
// O que faz:
//   Inicializa o app Hono, registra todos os middlewares globais e monta
//   os 22 sub-routers da API. Implementa o error handler global, o handler
//   de cron (handleScheduled) e o consumer de filas (handleQueue).
//
// Exports principais:
//   default export — objeto { fetch, scheduled, queue } (Cloudflare Workers format)
//
// Auth: rotas /api/* exigem auth (cada sub-router aplica authMiddleware)
// Side effects: crons (calendar reminders, cache warm, XP), queues (email, PDF)
// Cron: 0 8 * * * (calendar reminders) | 0 3 * * * (cache warm + XP) | +2 TODO
// ============================================

import { Hono } from 'hono'
import { withSentry } from '@sentry/cloudflare'
import { sendEmailWithResend } from '@lib/email-resend'
import type { EmailPayload } from '@lib/email'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'

import type { AppContext } from './types'

// Middleware
import { corsMiddleware } from './middleware/cors'
import { rateLimitMiddleware } from './middleware/rate-limit'
import { analyticsMiddleware } from './middleware/analytics'
import { requestIdMiddleware } from './middleware/request-id'
import { requestLoggerMiddleware } from './middleware/request-logger'
import { authMiddleware } from './middleware/auth'
import { AppError } from '@lib/errors'
import { error } from '@lib/response'
import { APP_CONFIG } from '@config/constants'
import { pgQuery, generateId } from '@lib/db'
import { fetchAssessmentPdfData, generateAndStoreAssessmentPdf } from '@lib/assessment-pdf'
import { notifyEvent, notify } from '@lib/onesignal'
import { dispatchCalendarReminders } from '@lib/calendar-reminders'
import { handleXPExpiration } from './cron/xp-expiration'
import { captureWorkerException } from '@lib/sentry-worker'

// API Routes
import { authRoutes } from './api/auth'
import { oauthRoutes } from './api/oauth'
import { usersRoutes } from './api/users'
import { personalsRoutes } from './api/personals'
import { studentsRoutes } from './api/students'
import { workoutsRoutes } from './api/workouts'
import { workoutSessionsRoutes } from './api/workout-sessions'
import { assessmentsRoutes, getSharedAssessment } from './api/assessments'
import { reviewsRoutes } from './api/reviews'
import { notificationsRoutes } from './api/notifications'
import { paymentsRoutes } from './api/payments'
import { affiliatesRoutes } from './api/affiliates'
import { aiRoutes } from './api/ai'
import { adminRoutes } from './api/admin'
import { chatRoutes } from './api/chat'
import { passkeyRoutes } from './api/passkey'
import { feedbackRoutes } from './api/feedback'
import { debugRoutes } from './api/debug'
import { calendarRoutes } from './api/calendar'
import { exerciseMediaRoutes } from './api/exercise-media'
import { agentsRoutes } from './api/agents'
import { default as xpRoutes } from './api/xp'
import { searchRoutes } from './api/search'
import cpfRoutes from './api/cpf'
import { platformRoutes } from './api/platform'
import { onboardingRoutes } from './api/onboarding'
import { subscriptionRoutes } from './api/subscription'
import { plansRoutes } from './api/plans'
import { progressRoutes } from './api/progress'
import { measurementsRoutes } from './api/measurements'
import { selfAssessmentsRoutes } from './api/self-assessments'
import { workoutTemplatesRoutes } from './api/templates'
import { gamificationRoutes } from './api/gamification'
import { challengesRoutes } from './api/challenges'
import { vfitRoutes } from './api/vfit'
import { configRoutes } from './api/config'
import { nutritionistRoutes } from './api/nutritionist'

// ============================================
// APP INIT
// ============================================
const app = new Hono<AppContext>()

// ============================================
// GLOBAL MIDDLEWARE (ordem importa!)
// ============================================
app.use('*', requestIdMiddleware)
app.use('*', corsMiddleware)
app.use('*', secureHeaders({
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin',
  crossOriginOpenerPolicy: 'same-origin-allow-popups',
  permissionsPolicy: {
    camera: ['self'],
    microphone: [],
    geolocation: ['self'],
  },
}))
app.use('*', prettyJSON())
app.use('*', requestLoggerMiddleware)
app.use('*', analyticsMiddleware)

// Rate limit em rotas de API (não em health/public)
app.use('/api/*', rateLimitMiddleware)

// ============================================
// PUBLIC ROUTES (sem auth)
// ============================================

/**
 * GET / - Health check
 */
app.get('/', (c) => {
  return c.json({
    name: APP_CONFIG.name,
    version: APP_CONFIG.version,
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: c.env.JWT_SECRET ? 'production' : 'development',
  })
})

/**
 * GET /health - Health check detalhado
 */
app.get('/health', async (c) => {
  const checks: Record<string, string> = {}

  // D1 check
  try {
    await c.env.DB.prepare('SELECT 1').first()
    checks.d1 = 'ok'
  } catch {
    checks.d1 = 'error'
  }

  // KV check (não destrutivo): validar binding sem escrita em hot-path do health.
  // Escrita concorrente no probe pode gerar ruído/503 sob carga e não representa indisponibilidade real da API.
  checks.kv_cache = c.env.KV_CACHE ? 'ok' : 'missing'

  // R2 check (just verify binding exists)
  checks.r2_videos = c.env.R2_VIDEOS ? 'ok' : 'missing'
  checks.r2_images = c.env.R2_IMAGES ? 'ok' : 'missing'

  // Overall status
  const allOk = Object.values(checks).every((v) => v === 'ok')

  return c.json({
    status: allOk ? 'healthy' : 'degraded',
    version: APP_CONFIG.version,
    timestamp: new Date().toISOString(),
    checks,
    uptime: 'edge', // Workers are stateless
  }, allOk ? 200 : 503)
})

/**
 * GET /api/v1/exercises - Exercícios públicos (cold data D1)
 * Cached in KV for 7 days (exercises rarely change)
 */
app.get('/api/v1/exercises', async (c) => {
  const url = new URL(c.req.url)
  const muscleGroup = url.searchParams.get('muscle_group')
  const difficulty = url.searchParams.get('difficulty')
  const search = url.searchParams.get('q')
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  // KV cache key based on query params
  const cacheParams = [muscleGroup, difficulty, search, page, perPage].filter(Boolean).join(':')
  const cacheKey = `exercises:list:${cacheParams || 'all'}`

  // Try KV cache first (exercises change very rarely)
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) {
      return c.json(cached as Record<string, unknown>)
    }
  } catch { /* cache miss, continue */ }

  let whereClause = 'WHERE is_default = 1'
  const params: string[] = []

  if (muscleGroup) {
    whereClause += ' AND muscle_group_id = ?'
    params.push(muscleGroup)
  }
  if (difficulty) {
    whereClause += ' AND difficulty = ?'
    params.push(difficulty)
  }
  if (search) {
    whereClause += ' AND (name_pt LIKE ? OR name LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const countResult = await c.env.DB
    .prepare(`SELECT COUNT(*) as count FROM exercises ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>()

  const results = await c.env.DB
    .prepare(`SELECT * FROM exercises ${whereClause} ORDER BY muscle_group_id, name_pt LIMIT ? OFFSET ?`)
    .bind(...params, perPage, offset)
    .all()

  const response = {
    success: true,
    data: results.results,
    meta: {
      page,
      per_page: perPage,
      total: countResult?.count ?? 0,
      total_pages: Math.ceil((countResult?.count ?? 0) / perPage),
    },
  }

  // Cache for 7 days (604800s) — exercises are cold data
  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 604800 })
  )

  return c.json(response)
})

/**
 * GET /api/v1/exercises/:id - Detalhe de um exercício (D1)
 */
app.get('/api/v1/exercises/:id', async (c) => {
  const id = c.req.param('id')

  const cacheKey = `exercises:detail:${id}`
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) return c.json(cached as Record<string, unknown>)
  } catch { /* cache miss */ }

  const exercise = await c.env.DB
    .prepare('SELECT * FROM exercises WHERE id = ?')
    .bind(id)
    .first()

  if (!exercise) {
    return c.json({ success: false, error: 'Exercise not found' }, 404)
  }

  // Get muscle group info
  const muscleGroup = await c.env.DB
    .prepare('SELECT * FROM muscle_groups WHERE id = ?')
    .bind(exercise.muscle_group_id)
    .first()

  const response = {
    success: true,
    data: {
      ...exercise,
      muscle_group: muscleGroup || null,
    },
  }

  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 604800 })
  )

  return c.json(response)
})

/**
 * GET /api/v1/muscle-groups - Grupos musculares (cached 7d)
 */
app.get('/api/v1/muscle-groups', async (c) => {
  const cacheKey = 'muscle-groups:all'
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) return c.json(cached as Record<string, unknown>)
  } catch { /* cache miss */ }

  const results = await c.env.DB
    .prepare('SELECT * FROM muscle_groups ORDER BY display_order')
    .all()

  const response = { success: true, data: results.results }
  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 604800 })
  )
  return c.json(response)
})

/**
 * GET /api/v1/templates - Templates de treino (cached 12h)
 */
app.get('/api/v1/templates', async (c) => {
  const category = new URL(c.req.url).searchParams.get('category')

  const cacheKey = `templates:list:${category || 'all'}`
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) return c.json(cached as Record<string, unknown>)
  } catch { /* cache miss */ }

  let query = 'SELECT * FROM workout_templates WHERE is_default = 1'
  const params: string[] = []

  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }

  query += ' ORDER BY usage_count DESC'

  const results = await c.env.DB
    .prepare(query)
    .bind(...params)
    .all()

  const response = { success: true, data: results.results }
  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 43200 })
  )
  return c.json(response)
})

/**
 * GET /api/v1/series-types - Tipos de séries (cached 7d)
 */
app.get('/api/v1/series-types', async (c) => {
  const cacheKey = 'series-types:all'
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) return c.json(cached as Record<string, unknown>)
  } catch { /* cache miss */ }

  const results = await c.env.DB
    .prepare('SELECT * FROM series_types ORDER BY name_pt')
    .all()

  const response = { success: true, data: results.results }
  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 604800 })
  )
  return c.json(response)
})

/**
 * GET /api/v1/equipment-types - Tipos de equipamento (cached 7d)
 */
app.get('/api/v1/equipment-types', async (c) => {
  const cacheKey = 'equipment-types:all'
  try {
    const cached = await c.env.KV_CACHE.get(cacheKey, 'json')
    if (cached) return c.json(cached as Record<string, unknown>)
  } catch { /* cache miss */ }

  const results = await c.env.DB
    .prepare('SELECT * FROM equipment_types ORDER BY display_order')
    .all()

  const response = { success: true, data: results.results }
  c.executionCtx.waitUntil(
    c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 604800 })
  )
  return c.json(response)
})

// ============================================
// PUBLIC — Invitation Info (no auth required)
// Returns personal trainer info for invite registration page
// ============================================
app.get('/api/v1/invitations/:token/info', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 8) {
    return c.json({ success: false, error: 'Token inválido' }, 400)
  }

  try {
    const { rows } = await pgQuery<{
      personal_id: string
      personal_name: string
      personal_photo: string | null
      personal_cref: string | null
      personal_cref_state: string | null
      personal_cref_verified: boolean
      personal_specialties: string[] | null
      student_name: string | null
    }>(
      c.env,
      `SELECT
        s.personal_id,
        u.full_name AS personal_name,
        u.profile_photo_url AS personal_photo,
        p.cref AS personal_cref,
        p.cref_state AS personal_cref_state,
        p.cref_verified AS personal_cref_verified,
        p.specialties AS personal_specialties,
        su.full_name AS student_name
      FROM students s
      JOIN users u ON u.id = s.personal_id
      LEFT JOIN personals p ON p.id = s.personal_id
      LEFT JOIN users su ON su.id = s.id
      WHERE s.invitation_token = $1
      LIMIT 1`,
      [token]
    )

    if (!rows.length) {
      return c.json({ success: false, error: 'Convite não encontrado ou expirado' }, 404)
    }

    return c.json({ success: true, data: rows[0] })
  } catch {
    return c.json({ success: false, error: 'Erro ao buscar informações do convite' }, 500)
  }
})

// ============================================
// PUBLIC — Shared Assessment (no auth required)
// ============================================
app.get('/api/v1/assessments/share/:token', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ success: false, error: 'Token inválido' }, 400)
  }

  const assessment = await getSharedAssessment(c.env, token)
  if (!assessment) {
    return c.json({ success: false, error: 'Avaliação não encontrada ou link expirado' }, 404)
  }

  return c.json({ success: true, data: { assessment } })
})

// ============================================
// IMAGE CDN — images.vfit.app.br
// Serve binários do R2 (quando disponível) ou KV_IMAGES.
// GET /* — key = pathname sem a barra inicial
// GET /images/* — retrocompat com api.vfit.app.br/images/* (chave sem prefixo /images/)
// ============================================
app.use('*', async (c, next) => {
  const hostname = new URL(c.req.url).hostname
  if (hostname !== 'images.vfit.app.br') return next()

  const key = c.req.path.replace(/^\//, '')
  if (!key) return c.json({ error: 'Key obrigatória' }, 400)

  // R2 tem prioridade quando habilitado
  if (c.env.R2_IMAGES) {
    const obj = await c.env.R2_IMAGES.get(key)
    if (!obj) return c.json({ error: 'Imagem não encontrada' }, 404)
    return new Response(obj.body, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Fallback: KV_IMAGES
  const value = await c.env.KV_IMAGES.getWithMetadata<{ contentType: string }>(key, 'arrayBuffer')
  if (!value.value) return c.json({ error: 'Imagem não encontrada' }, 404)

  return new Response(value.value as ArrayBuffer, {
    headers: {
      'Content-Type': value.metadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
})

// Retrocompat: api.vfit.app.br/images/* (para URLs já salvas no DB com domínio antigo)
app.get('/images/*', async (c) => {
  const key = c.req.path.replace(/^\/images\//, '')
  if (!key) return c.json({ error: 'Key obrigatória' }, 400)
  const value = await c.env.KV_IMAGES.getWithMetadata<{ contentType: string }>(key, 'arrayBuffer')
  if (!value.value) return c.json({ error: 'Imagem não encontrada' }, 404)
  return new Response(value.value as ArrayBuffer, {
    headers: {
      'Content-Type': value.metadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
})

// ============================================
// AUTH ROUTES (public + protected)
// ============================================
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/auth/oauth', oauthRoutes)
app.route('/api/v1/auth', passkeyRoutes)

// ============================================
// USERS, PERSONALS, STUDENTS ROUTES
// ============================================
app.route('/api/v1/users', usersRoutes)
app.route('/api/v1/personals', personalsRoutes)
app.route('/api/v1/students', studentsRoutes)
app.route('/api/v1/workouts', workoutsRoutes)
app.route('/api/v1/workouts', workoutSessionsRoutes)
app.route('/api/v1/assessments', assessmentsRoutes)
app.route('/api/v1/reviews', reviewsRoutes)
app.route('/api/v1/notifications', notificationsRoutes)
app.route('/api/v1/payments', paymentsRoutes)
app.route('/api/v1/affiliates', affiliatesRoutes)
app.route('/api/v1/ai', aiRoutes)
app.route('/api/v1/admin', adminRoutes)
app.route('/api/v1/chat', chatRoutes)
app.route('/api/v1/xp', xpRoutes)
app.route('/api/v1/search', searchRoutes)
app.route('/api/v1/feedback', feedbackRoutes)
app.route('/api/v1/debug', debugRoutes)
app.route('/api/v1/calendar', calendarRoutes)
app.route('/api/v1/exercises', exerciseMediaRoutes)
app.route('/api/v1/agents', agentsRoutes)
app.route('/api/v1/cpf', cpfRoutes)
app.route('/api/v1/platform', platformRoutes)
app.route('/api/v1/onboarding', onboardingRoutes)
app.route('/api/v1/subscription', subscriptionRoutes)
app.route('/api/v1/plans', plansRoutes)
app.route('/api/v1/progress', progressRoutes)
app.route('/api/v1/measurements', measurementsRoutes)
app.route('/api/v1/self-assessments', selfAssessmentsRoutes)
app.route('/api/v1/workout-templates', workoutTemplatesRoutes)
app.route('/api/v1/gamification', gamificationRoutes)
app.route('/api/v1/challenges', challengesRoutes)
app.route('/api/v1/vfit', vfitRoutes)
app.route('/api/v1/config', configRoutes)
app.route('/api/v1/nutritionist', nutritionistRoutes)

// ============================================
// PROTECTED ROUTES (requerem auth — generic)
// ============================================

// Protected API routes usarão authMiddleware
const protectedApi = new Hono<AppContext>()
protectedApi.use('*', authMiddleware)

// Placeholder for future protected routes (workouts, payments, etc.)
protectedApi.get('/ping', (c) => {
  return c.json({
    success: true,
    data: {
      userId: c.get('userId'),
      userType: c.get('userType'),
      message: 'authenticated',
    },
  })
})

// Mount protected routes
app.route('/api/v1/protected', protectedApi)

// ============================================
// 404 HANDLER
// ============================================
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Rota ${c.req.method} ${new URL(c.req.url).pathname} não encontrada`,
      },
    },
    404
  )
})

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.onError((err, c) => {
  // Determine severity: 4xx/validation = warn, 5xx/unknown = error
  // Use both instanceof AND name-based check as fallback (instanceof can fail in edge cases with bundled code)
  const isAppError = err instanceof AppError || (err as AppError).code === 'NOT_FOUND' || (err as AppError).code === 'BAD_REQUEST' || (err as AppError).code === 'UNAUTHORIZED' || (err as AppError).code === 'FORBIDDEN' || (err as AppError).code === 'CONFLICT' || (err as AppError).code === 'RATE_LIMITED'
  const statusCode = (err as AppError).statusCode
  const isClientError =
    (isAppError && typeof statusCode === 'number' && statusCode < 500) ||
    (err.name === 'ZodError')
  const logLevel = isClientError ? 'warn' : 'error'

  if (isClientError) {
    console.warn(`[Warn] ${c.req.method} ${c.req.url}:`, err.message)
  } else {
    console.error(`[Error] ${c.req.method} ${c.req.url}:`, err)
  }

  // Only send 5xx / unknown errors to Sentry — skip expected client errors
  if (!isClientError) {
    captureWorkerException(c.env, err, {
      source: 'worker.onError',
      method: c.req.method,
      url: c.req.url,
      request_id: c.get('requestId') || null,
      user_id: c.get('userId') || null,
      user_type: c.get('userType') || null,
      user_role: c.get('userRole') || null,
    })
  }

  // Best-effort: persistir erro no Postgres para observabilidade.
  // Nunca pode falhar a resposta do endpoint.
  try {
    const url = new URL(c.req.url)
    const userId = c.get('userId') as string | undefined
    const userType = (c.get('userType') as string | undefined) || 'anonymous'
    const userRole = (c.get('userRole') as string | undefined) || 'anonymous'
    const requestId = (c.get('requestId') as string | undefined) || null

    const stack = (err as { stack?: string }).stack || null
    const message = (err as { message?: string }).message || 'Erro sem mensagem'
    const context = {
      kind: err?.name || 'Error',
      method: c.req.method,
      pathname: url.pathname,
      query: url.search,
      user_agent: c.req.header('User-Agent') || null,
    }

    c.executionCtx?.waitUntil?.(
      pgQuery(
        c.env,
        `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, stack, context, path, user_agent, request_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)`,
        [
          generateId(),
          userId || null,
          userType,
          userRole,
          logLevel,
          'worker.onError',
          String(message).slice(0, 2000),
          stack ? String(stack).slice(0, 6000) : null,
          JSON.stringify(context),
          url.pathname.slice(0, 500),
          (c.req.header('User-Agent') || 'unknown').slice(0, 500),
          requestId,
        ]
      ).then(() => {})
        .catch(() => {})
    )
  } catch {
    // noop
  }

  // Known app errors (instanceof + fallback by code/statusCode)
  if (err instanceof AppError) {
    return error(err.message, err.statusCode, err.code, err.details)
  }
  // Fallback: error has AppError shape but instanceof failed (bundling edge case)
  if (isAppError && typeof statusCode === 'number') {
    return error(
      (err as AppError).message,
      statusCode,
      (err as AppError).code || 'APP_ERROR',
      (err as AppError).details
    )
  }

  // Zod validation errors — include human-readable field messages
  if (err.name === 'ZodError' && 'issues' in err) {
    const issues = (err as { issues: Array<{ path?: string[]; message?: string }> }).issues
    const fieldMessages = issues
      .map((i) => {
        const field = i.path?.[0] || 'campo'
        return `${field}: ${i.message}`
      })
      .join('; ')
    return error(
      fieldMessages || 'Dados inválidos',
      400,
      'VALIDATION_ERROR',
      issues
    )
  }

  // Unknown errors — include sanitized message for debugging
  const safeMessage = err?.message
    ? `Erro interno: ${String(err.message).slice(0, 200)}`
    : 'Erro interno do servidor'
  return error(
    safeMessage,
    500,
    'INTERNAL_ERROR'
  )
})

// ============================================
// CRON HANDLER
// ============================================
async function handleScheduled(
  event: ScheduledEvent,
  env: AppContext['Bindings'],
  ctx: ExecutionContext
): Promise<void> {
  const cronExpression = event.cron

  console.log(`[Cron] Triggered: ${cronExpression} at ${new Date(event.scheduledTime).toISOString()}`)

  switch (cronExpression) {
    case '0 8 * * *':
      // Daily reminders at 8 AM BRT (11 UTC)
      ctx.waitUntil(
        dispatchCalendarReminders(env, {
          windowsMinutes: [1440, 60],
          toleranceMinutes: 10,
        })
          .then((r) => {
            console.log('[Cron] Calendar reminders result:', r)
          })
          .catch((err) => {
            console.error('[Cron] Calendar reminders failed:', err)
            captureWorkerException(env, err, {
              source: 'cron.calendar_reminders',
              cron: cronExpression,
            })
          })
      )
      break

    case '0 */4 * * *':
      // Payment checks every 4 hours
      console.log('[Cron] Payment checks - TODO: implement in LOTE 08')
      break

    case '0 2 * * 1':
      // Weekly affiliate commission calc (Monday 2 AM)
      console.log('[Cron] Affiliate commission calc - TODO: implement in LOTE 08')
      break

    case '0 3 * * *':
      // Cache warming at 3 AM + XP expiration
      ctx.waitUntil(warmCache(env))
      ctx.waitUntil(
        handleXPExpiration(env)
          .then((r) => {
            console.log(`[Cron] XP expiration: expired ${r.expiredCount} transactions`)
          })
          .catch((err) => {
            console.error('[Cron] XP expiration failed:', err)
            captureWorkerException(env, err, {
              source: 'cron.xp_expiration',
              cron: cronExpression,
            })
          })
      )
      break

    case '0 9 * * *':
      // T8.4 — Daily workout reminder at 9 AM BRT (12 UTC)
      ctx.waitUntil(
        sendDailyWorkoutReminders(env)
          .then((r) => console.log(`[Cron] Workout reminders sent: ${r}`))
          .catch((err) => {
            console.error('[Cron] Workout reminders failed:', err)
            captureWorkerException(env, err, { source: 'cron.workout_reminder', cron: cronExpression })
          })
      )
      break

    case '0 18 * * *':
      // T8.5 — Streak warning at 6 PM BRT (21 UTC)
      ctx.waitUntil(
        sendStreakWarnings(env)
          .then((r) => console.log(`[Cron] Streak warnings sent: ${r}`))
          .catch((err) => {
            console.error('[Cron] Streak warnings failed:', err)
            captureWorkerException(env, err, { source: 'cron.streak_warning', cron: cronExpression })
          })
      )
      break

    default:
      console.warn(`[Cron] Unknown cron expression: ${cronExpression}`)
  }
}

/**
 * T8.4 — Envia lembrete de treino diário para alunos com push ativo
 * que ainda não registraram treino hoje.
 */
async function sendDailyWorkoutReminders(env: AppContext['Bindings']): Promise<number> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const result = await pgQuery<{ id: string }>(env, `
    SELECT u.id
    FROM users u
    JOIN notification_preferences np ON np.user_id = u.id
    WHERE u.user_type = 'student'
      AND np.push_enabled = TRUE
      AND np.workout_enabled = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM workout_logs wl
        WHERE wl.student_id = u.id
          AND wl.created_at::date = $1::date
      )
    LIMIT 500
  `, [today])

  let sent = 0
  for (const row of result.rows) {
    await notify(env, row.id, {
      type: 'workout.reminder',
      title: '🏋️ Hora do treino!',
      message: 'Você ainda não treinou hoje. Mantenha sua sequência!',
      link: '/treinos',
    }).catch(() => {})
    sent++
  }
  return sent
}

/**
 * T8.5 — Avisa alunos com streak ativo que ainda não treinaram hoje
 * (risco de quebrar a sequência).
 */
async function sendStreakWarnings(env: AppContext['Bindings']): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  // Alunos com streak >= 2 dias e que NÃO treinaram hoje
  const result = await pgQuery<{ id: string; streak: number }>(env, `
    SELECT u.id, COALESCE(xs.current_streak, 0) as streak
    FROM users u
    JOIN xp_stats xs ON xs.user_id = u.id
    JOIN notification_preferences np ON np.user_id = u.id
    WHERE u.user_type = 'student'
      AND xs.current_streak >= 2
      AND np.push_enabled = TRUE
      AND np.workout_enabled = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM workout_logs wl
        WHERE wl.student_id = u.id
          AND wl.created_at::date = $1::date
      )
    LIMIT 500
  `, [today])

  let sent = 0
  for (const row of result.rows) {
    await notify(env, row.id, {
      type: 'streak.warning',
      title: `🔥 ${row.streak} dias de sequência em risco!`,
      message: 'Treine hoje para não perder sua sequência. Você consegue!',
      link: '/treinos',
    }).catch(() => {})
    sent++
  }
  return sent
}

/**
 * Pré-aquece cache com dados mais acessados
 */
async function warmCache(env: AppContext['Bindings']): Promise<void> {
  console.log('[Cache] Starting warm-up...')

  try {
    // Cache muscle groups
    const muscleGroups = await env.DB
      .prepare('SELECT * FROM muscle_groups ORDER BY display_order')
      .all()
    await env.KV_CACHE.put('warm:muscle_groups', JSON.stringify(muscleGroups.results), {
      expirationTtl: 7 * 24 * 60 * 60, // 7 days
    })

    // Cache exercise count per muscle group
    const exerciseCounts = await env.DB
      .prepare('SELECT muscle_group_id, COUNT(*) as count FROM exercises WHERE is_default = 1 GROUP BY muscle_group_id')
      .all()
    await env.KV_CACHE.put('warm:exercise_counts', JSON.stringify(exerciseCounts.results), {
      expirationTtl: 7 * 24 * 60 * 60,
    })

    // Cache series types
    const seriesTypes = await env.DB
      .prepare('SELECT * FROM series_types ORDER BY name_pt')
      .all()
    await env.KV_CACHE.put('warm:series_types', JSON.stringify(seriesTypes.results), {
      expirationTtl: 7 * 24 * 60 * 60,
    })

    // Cache equipment types
    const equipmentTypes = await env.DB
      .prepare('SELECT * FROM equipment_types ORDER BY display_order')
      .all()
    await env.KV_CACHE.put('warm:equipment_types', JSON.stringify(equipmentTypes.results), {
      expirationTtl: 7 * 24 * 60 * 60,
    })

    console.log('[Cache] Warm-up complete: 4 keys cached')
  } catch (err) {
    console.error('[Cache] Warm-up error:', err)
    captureWorkerException(env, err, {
      source: 'cron.cache_warmup',
    })
  }
}

// ============================================
// QUEUE CONSUMER — Payload types
// ============================================
interface PdfJobPayload {
  type: 'assessment_pdf'
  assessment_id: string
  queued_at?: string
}

// ============================================
// QUEUE CONSUMER
// ============================================
async function handleQueue(
  batch: MessageBatch,
  env: AppContext['Bindings'],
  _ctx: ExecutionContext
): Promise<void> {
  const queueName = batch.queue

  console.log(`[Queue] Processing ${batch.messages.length} messages from ${queueName}`)

  for (const message of batch.messages) {
    try {
      switch (queueName) {
        case 'vfit-email-sender':
          if (!env.RESEND_API_KEY) {
            console.warn('[Queue] RESEND_API_KEY missing, skipping email')
            break
          }

          await sendEmailWithResend(
            env.RESEND_API_KEY,
            message.body as EmailPayload,
            env.EMAIL_FROM || undefined
          )
          break

        case 'vfit-video-encoder':
          // TODO: LOTE 07 - Video encoding
          console.log('[Queue] Video message received')
          break

        case 'vfit-pdf-generator':
          // PDF generation (Assessment)
          console.log('[Queue] PDF message received')

          if (!message.body || typeof message.body !== 'object') {
            console.warn('[Queue] PDF body inválido')
            break
          }

          if ((message.body as PdfJobPayload).type !== 'assessment_pdf') {
            console.warn('[Queue] PDF tipo desconhecido:', (message.body as PdfJobPayload).type)
            break
          }

          if (!(message.body as PdfJobPayload).assessment_id) {
            console.warn('[Queue] assessment_id ausente no PDF job')
            break
          }

          try {
            const assessmentId = String((message.body as PdfJobPayload).assessment_id)
            await generateAndStoreAssessmentPdf(env as any, assessmentId)

            // Notificar aluno (best-effort)
            const row = await fetchAssessmentPdfData(env as any, assessmentId)
            if (row.student_id) {
              await notifyEvent(env as any, row.student_id, 'assessment.pdf.ready', {
                assessmentId,
              }).catch(() => {})
            }
          } catch (err) {
            console.error('[Queue] PDF generation failed:', err)
            captureWorkerException(env, err, {
              source: 'queue.pdf_generation',
              queue: queueName,
              message_id: (message as { id?: string }).id || null,
            })
            throw err
          }
          break

        case 'vfit-ai-batch':
          // TODO: LOTE 09 - AI batch processing
          console.log('[Queue] AI batch message received')
          break

        default:
          console.warn(`[Queue] Unknown queue: ${queueName}`)
      }

      message.ack()
    } catch (err) {
      console.error(`[Queue] Error processing message:`, err)
      captureWorkerException(env, err, {
        source: 'queue.consumer',
        queue: queueName,
        message_id: (message as { id?: string }).id || null,
      })
      message.retry()
    }
  }
}

const sentryWrapped = withSentry(
  (env: AppContext['Bindings']) => ({
    dsn: env.SENTRY_DSN_WORKER,
    enabled: Boolean(env.SENTRY_DSN_WORKER),
    environment: env.SENTRY_ENVIRONMENT || 'production',
    release: env.SENTRY_RELEASE || APP_CONFIG.version,
    tracesSampleRate: (() => {
      const raw = Number(env.SENTRY_TRACES_SAMPLE_RATE || '0')
      if (!Number.isFinite(raw)) return 0
      if (raw < 0) return 0
      if (raw > 1) return 1
      return raw
    })(),
  }),
  {
    fetch: app.fetch,
    scheduled: handleScheduled as any,
    queue: handleQueue as any,
  } as any
)

export default sentryWrapped
