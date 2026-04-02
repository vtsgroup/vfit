/**
 * workers/api/debug.ts
 *
 * debug.ts — Logs do cliente para observabilidade em produção
 *
 * Exports: debugRoutes
 * Features: DB: Neon
 */

// ============================================
// debug.ts — Logs do cliente para observabilidade em produção
// ============================================
//
// O que faz:
//   Permite que o frontend salve logs estruturados no servidor (níveis
//   debug/info/warn/error). Admin pode consultar logs de todos os usuários
//   com filtros avançados (scope=all, user_id, level, q busca textual).
//
// Exports principais:
//   debugRoutes — Hono app montado em /api/v1/debug
//
// Auth: requireAuth em todas as rotas
// DB: app_logs (user_id, level, source, message, context JSONB, path)
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { success, created, noContent } from '@lib/response'
import { BadRequestError } from '@lib/errors'
import { pgQuery, generateId } from '@lib/db'

type DebugLogLevel = 'debug' | 'info' | 'warn' | 'error'

type DebugLogEntry = {
  id: string
  timestamp: string
  level: DebugLogLevel
  source: string
  message: string
  stack?: string
  context?: unknown
  path?: string
  user_agent?: string
  request_id?: string
}

type DebugLogStatRow = {
  count: number
  source: string
  message: string
  path: string | null
  last_seen_at: string
}

const MAX_LOGS_PER_QUERY = 500
const VALID_LEVELS: DebugLogLevel[] = ['debug', 'info', 'warn', 'error']

export const debugRoutes = new Hono<AppContext>()

// Todas as rotas exigem auth
// Evita vazamento de dados de debug em ambiente público
// enquanto estamos em pré-produção.
debugRoutes.use('*', authMiddleware)

// ============================================
// POST /debug/logs
// ============================================
debugRoutes.post('/logs', async (c) => {
  const userId = c.get('userId')
  const userType = String(c.get('userType') || 'user')
  const userRole = String(c.get('userRole') || 'user')
  const requestId = c.get('requestId')

  const body = await c.req.json<{
    level?: DebugLogLevel
    source?: string
    message?: string
    stack?: string
    context?: unknown
    path?: string
  }>()

  const level = body.level ?? 'error'
  if (!VALID_LEVELS.includes(level)) {
    throw new BadRequestError('Nível de log inválido')
  }

  const source = (body.source ?? 'client').trim().slice(0, 120)
  const message = (body.message ?? '').trim().slice(0, 2000)
  const stack = body.stack?.slice(0, 6000)
  const path = body.path?.slice(0, 500)

  if (!message) {
    throw new BadRequestError('Mensagem do log é obrigatória')
  }

  const id = generateId()
  const ua = c.req.header('User-Agent') || 'unknown'
  const ts = new Date().toISOString()

  await pgQuery(
    c.env,
    `INSERT INTO app_logs
      (id, user_id, user_type, user_role, level, source, message, stack, context, path, user_agent, request_id, created_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13::timestamptz)`,
    [
      id,
      userId,
      userType,
      userRole,
      level,
      source || 'client',
      message,
      stack || null,
      body.context !== undefined ? JSON.stringify(body.context) : null,
      path || null,
      ua,
      requestId || null,
      ts,
    ]
  )

  return created({ id })
})

// ============================================
// GET /debug/logs
// ============================================
debugRoutes.get('/logs', async (c) => {
  const userId = c.get('userId')
  const userRole = String(c.get('userRole') || 'user')
  const userType = String(c.get('userType') || 'user')
  const url = new URL(c.req.url)

  const limit = Math.min(MAX_LOGS_PER_QUERY, Math.max(1, Number(url.searchParams.get('limit')) || 120))
  const scope = url.searchParams.get('scope') || 'self' // self | all
  const level = url.searchParams.get('level')
  const q = url.searchParams.get('q')
  const targetUserId = url.searchParams.get('user_id')

  const canSeeAll = userRole === 'super_admin' || userRole === 'admin' || userType === 'admin'
  const effectiveScope = canSeeAll && scope === 'all' ? 'all' : 'self'

  const where: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (effectiveScope === 'self') {
    where.push(`user_id = $${idx++}`)
    params.push(userId)
  } else if (targetUserId) {
    where.push(`user_id = $${idx++}`)
    params.push(targetUserId)
  }

  if (level && VALID_LEVELS.includes(level as DebugLogLevel)) {
    where.push(`level = $${idx++}`)
    params.push(level)
  }

  if (q) {
    where.push(`(message ILIKE $${idx} OR source ILIKE $${idx})`)
    params.push(`%${q}%`)
    idx++
  }

  params.push(limit)

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const { rows } = await pgQuery<{
    id: string
    created_at: string
    level: DebugLogLevel
    source: string
    message: string
    stack: string | null
    context: unknown | null
    path: string | null
    user_agent: string | null
    request_id: string | null
    user_id: string
    user_type: string
    user_role: string
  }>(
    c.env,
    `SELECT id, created_at, level, source, message, stack, context, path, user_agent, request_id, user_id, user_type, user_role
     FROM app_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${idx}`,
    params
  )

  const logs: DebugLogEntry[] = rows.map((r) => ({
    id: r.id,
    timestamp: r.created_at,
    level: r.level,
    source: r.source,
    message: r.message,
    ...(r.stack ? { stack: r.stack } : {}),
    ...(r.context !== null ? { context: r.context } : {}),
    ...(r.path ? { path: r.path } : {}),
    ...(r.user_agent ? { user_agent: r.user_agent } : {}),
    ...(r.request_id ? { request_id: r.request_id } : {}),
  }))

  // Total (aproximado) — evita count caro sem necessidade
  return success({ logs, total: logs.length })
})

// ============================================
// GET /debug/logs/stats
// - Ajuda a achar crashes recorrentes (agregado por source+message+path)
// - scope=self|all (admin)
// - path_prefix=/dashboard/settings (opcional)
// ============================================
debugRoutes.get('/logs/stats', async (c) => {
  const userId = c.get('userId')
  const userRole = String(c.get('userRole') || 'user')
  const userType = String(c.get('userType') || 'user')
  const url = new URL(c.req.url)

  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 25))
  const scope = url.searchParams.get('scope') || 'self' // self | all
  const targetUserId = url.searchParams.get('user_id')
  const level = url.searchParams.get('level')
  const pathPrefix = url.searchParams.get('path_prefix')

  const canSeeAll = userRole === 'super_admin' || userRole === 'admin' || userType === 'admin'
  const effectiveScope = canSeeAll && scope === 'all' ? 'all' : 'self'

  const where: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (effectiveScope === 'self') {
    where.push(`user_id = $${idx++}`)
    params.push(userId)
  } else if (targetUserId) {
    where.push(`user_id = $${idx++}`)
    params.push(targetUserId)
  }

  if (level && VALID_LEVELS.includes(level as DebugLogLevel)) {
    where.push(`level = $${idx++}`)
    params.push(level)
  }

  if (pathPrefix && pathPrefix.trim()) {
    where.push(`path ILIKE $${idx++}`)
    params.push(`${pathPrefix.trim()}%`)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  params.push(limit)

  const { rows } = await pgQuery<DebugLogStatRow>(
    c.env,
    `SELECT
      COUNT(*)::int AS count,
      source,
      LEFT(message, 220) AS message,
      path,
      MAX(created_at) AS last_seen_at
     FROM app_logs
     ${whereSql}
     GROUP BY source, LEFT(message, 220), path
     ORDER BY count DESC, last_seen_at DESC
     LIMIT $${idx}`,
    params
  )

  return success({ items: rows })
})

// ============================================
// DELETE /debug/logs
// ============================================
debugRoutes.delete('/logs', async (c) => {
  const userId = c.get('userId')
  await pgQuery(c.env, 'DELETE FROM app_logs WHERE user_id = $1', [userId])
  return noContent()
})
