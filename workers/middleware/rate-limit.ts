// ============================================
// rate-limit.ts — Rate limiting por IP via Cloudflare KV
// ============================================
//
// O que faz:
//   Limita requisições por IP + path usando janelas deslizantes no KV.
//   Configurações de limite por rota em config/constants.ts (RATE_LIMITS).
//   Seta headers X-RateLimit-Limit/Remaining/Reset e Retry-After.
//   Falhas de KV não bloqueiam requests (graceful degradation).
//
// Exports principais:
//   rateLimitMiddleware — aplicado em app.use('/api/*')
//
// KV: KV_RATE_LIMIT (chaves: rl:{ip}:{path})
// ============================================

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'
import { RATE_LIMITS } from '@config/constants'
import { RateLimitError } from '@lib/errors'

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Rate limiting middleware usando KV.
 * Limita por IP + path. Configurações em config/constants.ts
 */
export const rateLimitMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const path = new URL(c.req.url).pathname
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'

  // Find matching rate limit config: exact match → longest prefix → default
  let config = RATE_LIMITS[path]
  if (!config) {
    const prefix = Object.keys(RATE_LIMITS)
      .filter((k) => k !== 'default' && path.startsWith(k))
      .sort((a, b) => b.length - a.length)[0]
    config = (prefix ? RATE_LIMITS[prefix] : undefined) ?? RATE_LIMITS['default']
  }
  if (!config) {
    await next()
    return
  }

  const key = `rl:${ip}:${path}`

  try {
    const existing = await c.env.KV_RATE_LIMIT.get<RateLimitEntry>(key, 'json')
    const now = Date.now()

    if (existing && now < existing.resetAt) {
      if (existing.count >= config.max) {
        const retryAfter = Math.ceil((existing.resetAt - now) / 1000)

        // Set standard rate limit headers
        c.header('X-RateLimit-Limit', String(config.max))
        c.header('X-RateLimit-Remaining', '0')
        c.header('X-RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)))
        c.header('Retry-After', String(retryAfter))

        throw new RateLimitError(retryAfter)
      }

      // Increment counter
      const updated: RateLimitEntry = {
        count: existing.count + 1,
        resetAt: existing.resetAt,
      }
      const ttl = Math.max(60, Math.ceil((existing.resetAt - now) / 1000))
      await c.env.KV_RATE_LIMIT.put(key, JSON.stringify(updated), {
        expirationTtl: ttl,
      })

      c.header('X-RateLimit-Limit', String(config.max))
      c.header('X-RateLimit-Remaining', String(config.max - updated.count))
      c.header('X-RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)))
    } else {
      // New window
      const entry: RateLimitEntry = {
        count: 1,
        resetAt: now + config.windowSeconds * 1000,
      }
      await c.env.KV_RATE_LIMIT.put(key, JSON.stringify(entry), {
        expirationTtl: config.windowSeconds,
      })

      c.header('X-RateLimit-Limit', String(config.max))
      c.header('X-RateLimit-Remaining', String(config.max - 1))
      c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))
    }
  } catch (err) {
    if (err instanceof RateLimitError) throw err
    // KV failure should not block requests - log and continue
    console.error('[RateLimit] KV error:', err)
  }

  await next()
})
