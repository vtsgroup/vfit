/**
 * workers/middleware/auth.ts
 *
 * auth.ts (middleware) — Verificação JWT + injeção de contexto do usuário
 *
 * Exports: authMiddleware, requireType, optionalAuth
 */

// ============================================
// auth.ts (middleware) — Verificação JWT + injeção de contexto do usuário
// ============================================
//
// O que faz:
//   Verifica Bearer token JWT via Web Crypto API. Injeta userId, userType,
//   userRole e jwtPayload no contexto Hono (c.var). Suporta simulação de
//   usuário por super_admin (estado admin-simulation armazenado no KV).
//   Exporta helpers para restrição por tipo e auth opcional.
//
// Exports principais:
//   authMiddleware — verifica JWT, checa blacklist KV, injeta user no contexto
//   requireType(...types) — middleware factory que exige userType específico
//   optionalAuth — popula c.var se token presente, não bloqueia se ausente
//
// KV: KV_SESSIONS (blacklist:hash, admin-simulation:userId)
// Auth: este arquivo É a autenticação — não usa requireAuth internamente
// ============================================

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'
import { verifyJWT } from '@lib/auth-helpers'
import { UnauthorizedError } from '@lib/errors'

interface AdminSimulationSession {
  mode: 'super_admin' | 'personal' | 'student'
  target_user_id: string | null
  target_user_type: 'personal' | 'student' | null
}

/**
 * Middleware que exige autenticação JWT.
 * Extrai token do header Authorization: Bearer <token>
 * Popula c.var com userId, userType, jwtPayload
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de acesso necessário')
  }

  const token = authHeader.substring(7)

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET)

    // Check if token is blacklisted (forced logout)
    const tokenHash = await hashToken(token)
    const blacklisted = await c.env.KV_SESSIONS.get(`blacklist:${tokenHash}`)
    if (blacklisted) {
      throw new UnauthorizedError('Sessão encerrada')
    }

    const pathname = new URL(c.req.url).pathname
    const shouldApplySimulation = !pathname.startsWith('/api/v1/admin')

    let effectiveUserId = payload.sub
    let effectiveUserType = payload.type

    c.set('actorUserId', payload.sub)
    c.set('actorUserType', payload.type as 'personal' | 'student' | 'admin' | 'super_admin')
    c.set('simulationMode', 'super_admin')

    if ((payload.role === 'super_admin' || payload.role === 'admin') && shouldApplySimulation) {
      const simulationKey = `admin-simulation:${payload.sub}`
      const simulation = await c.env.KV_SESSIONS.get(simulationKey, 'json') as AdminSimulationSession | null

      if (
        simulation
        && simulation.mode !== 'super_admin'
        && simulation.target_user_id
        && simulation.target_user_type
      ) {
        effectiveUserId = simulation.target_user_id
        effectiveUserType = simulation.target_user_type
        c.set('simulationMode', simulation.mode)
      }
    }

    // Set context variables
    c.set('userId', effectiveUserId)
    c.set('userType', effectiveUserType)
    c.set('userRole', payload.role || 'user')
    c.set('jwtPayload', payload)

    await next()
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err
    throw new UnauthorizedError(
      err instanceof Error && err.message === 'Token expirado'
        ? 'Token expirado, faça refresh'
        : 'Token inválido'
    )
  }
})

/**
 * Middleware que exige tipo de usuário específico.
 * Aceita um ou mais tipos: requireType('personal') ou requireType('personal', 'admin', 'super_admin')
 * super_admin sempre é permitido (bypass).
 */
export function requireType(...types: Array<'personal' | 'student' | 'admin' | 'super_admin'>) {
  return createMiddleware<AppContext>(async (c, next) => {
    const userType = c.get('userType') as string
    const userRole = c.get('userRole') as string
    // super_admin tem acesso universal (via role no JWT)
    if (userRole === 'super_admin' || userType === 'super_admin') return next()
    if (!types.includes(userType as 'personal' | 'student' | 'admin' | 'super_admin')) {
      throw new UnauthorizedError(`Acesso restrito`)
    }
    await next()
  })
}

/**
 * Middleware opcional de auth - não bloqueia, mas popula vars se token presente
 */
export const optionalAuth = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const payload = await verifyJWT(token, c.env.JWT_SECRET)
      c.set('userId', payload.sub)
      c.set('userType', payload.type)
      c.set('jwtPayload', payload)
    } catch {
      // Token inválido em rota opcional - ignora silenciosamente
    }
  }

  await next()
})

/**
 * Hash rápido para identificar tokens (SHA-256 truncado)
 */
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hash)
  return Array.from(bytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
