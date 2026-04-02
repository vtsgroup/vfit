// ============================================
// analytics.ts — Métricas via Cloudflare Analytics Engine
// ============================================
//
// O que faz:
//   Registra métricas de cada request no Cloudflare Analytics Engine:
//   método HTTP, path, status, latência, país, user agent, userId, userType.
//   Non-blocking (escrita após next()). Falhas silenciosas — nunca quebra requests.
//
// Exports principais:
//   analyticsMiddleware — aplicado globalmente em app.use('*')
//
// Side effects: escreve datapoint no binding ANALYTICS (Analytics Engine)
// ============================================

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'

/**
 * Middleware que registra métricas no Cloudflare Analytics Engine.
 * Captura: method, path, status, latência, user agent, país
 */
export const analyticsMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const start = Date.now()

  await next()

  // Non-blocking analytics write
  const latencyMs = Date.now() - start
  const url = new URL(c.req.url)

  try {
    c.env.ANALYTICS.writeDataPoint({
      // Blobs: textual data (max 20 blobs)
      blobs: [
        c.req.method,                                        // blob1: HTTP method
        url.pathname,                                        // blob2: path
        String(c.res.status),                                // blob3: status code
        c.req.header('CF-IPCountry') || 'XX',               // blob4: country
        c.req.header('User-Agent')?.substring(0, 100) || '', // blob5: user agent (truncated)
        c.get('userId') || 'anonymous',                      // blob6: user id
        c.get('userType') || 'none',                         // blob7: user type
        c.get('requestId') || '',                             // blob8: request id
      ],
      // Doubles: numeric data (max 20 doubles)
      doubles: [
        latencyMs,                                           // double1: latency in ms
        c.res.status,                                        // double2: status code (numeric for aggregation)
      ],
      // Indexes: for efficient querying (max 1 index)
      indexes: [
        url.pathname.split('/').slice(0, 3).join('/'),       // index: normalized path (e.g., /api/workouts)
      ],
    })
  } catch {
    // Analytics should never break the request
    // Silently fail
  }
})
