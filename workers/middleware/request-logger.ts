// ============================================
// request-logger.ts — Logger estruturado JSON por request
// ============================================
//
// O que faz:
//   Emite um log JSON estruturado (console.log) após cada request com:
//   requestId, method, path, status, latencyMs, userId, userType, país, CF-Ray.
//   Level automático: info (2xx) | warn (4xx) | error (5xx).
//   Aplicado globalmente após requestIdMiddleware.
//
// Exports principais:
//   requestLoggerMiddleware — aplicado globalmente em app.use('*')
// ============================================

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'

/**
 * Logger estruturado JSON para padronizar observabilidade por request.
 */
export const requestLoggerMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const startedAt = Date.now()

  await next()

  const latencyMs = Date.now() - startedAt
  const url = new URL(c.req.url)
  const status = c.res.status
  const requestId = c.get('requestId') || c.req.header('X-Request-Id') || 'unknown'

  const level: 'info' | 'warn' | 'error' =
    status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event: 'http_request',
    requestId,
    method: c.req.method,
    path: url.pathname,
    status,
    latencyMs,
    userId: c.get('userId') || null,
    userType: c.get('userType') || null,
    userRole: c.get('userRole') || null,
    ipCountry: c.req.header('CF-IPCountry') || null,
    userAgent: c.req.header('User-Agent')?.slice(0, 120) || null,
    cfRay: c.req.header('CF-Ray') || null,
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload))
})
