// ============================================
// request-id.ts — Geração e propagação de X-Request-Id
// ============================================
//
// O que faz:
//   Gera ou propaga o header X-Request-Id para rastreamento de requests.
//   Reutiliza ID do header entrante se presente; gera UUID v4 se ausente.
//   Injeta em c.var('requestId') para uso nos handlers e no logger.
//
// Exports principais:
//   requestIdMiddleware — primeiro middleware global (app.use('*'))
// ============================================

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'

/**
 * Gera ou propaga X-Request-Id para rastreamento de requests.
 */
export const requestIdMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const requestId = c.req.header('X-Request-Id') || crypto.randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)
  await next()
})
