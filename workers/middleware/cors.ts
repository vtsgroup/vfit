// ============================================
// cors.ts — CORS middleware manual multi-origin
// ============================================
//
// O que faz:
//   Implementa CORS manual (sem hono/cors nativo) para evitar edge cases
//   com origin undefined. Permite origens exatas, *.pages.dev previews
//   e localhost. Responde preflight OPTIONS com 204 + headers corretos.
//   Origins não permitidas recebem resposta sem headers (browser bloqueia).
//
// Exports principais:
//   corsMiddleware — MiddlewareHandler aplicado globalmente em app.use('*')
//
// Auth: público — aplicado antes de qualquer autenticação
// ============================================

import type { MiddlewareHandler } from 'hono'

// Origens exatas permitidas
const ALLOWED_ORIGINS = new Set([
  'https://iapersonal.app.br',
  'https://vfit.pages.dev',           // new Pages project (future)
  'https://evoluia.pages.dev',        // current Pages project
  'https://personaliai.pages.dev',    // legacy Pages (backward compat)
  'https://personal-ia-prod.pages.dev', // legacy fallback
])

/**
 * Verifica se a origin é permitida.
 * Retorna a origin string se permitida, null caso contrário.
 */
function isAllowedOrigin(origin: string | undefined | null): string | null {
  if (!origin) return null

  // Exact match
  if (ALLOWED_ORIGINS.has(origin)) return origin

  // Cloudflare Pages preview deployments (*.pages.dev)
  if (origin.endsWith('.vfit.pages.dev')) return origin
  if (origin.endsWith('.evoluia.pages.dev')) return origin
  if (origin.endsWith('.personaliai.pages.dev')) return origin   // legacy CF project
  if (origin.endsWith('.personal-ia-prod.pages.dev')) return origin // legacy CF project

  // Localhost para desenvolvimento
  if (origin.startsWith('http://localhost:')) return origin
  if (origin === 'http://localhost') return origin

  return null
}

// Headers CORS comuns
const CORS_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
const CORS_HEADERS = 'Content-Type, Authorization, X-Request-Id, X-Client-Version'
const CORS_EXPOSE = 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-Id'
const CORS_MAX_AGE = '86400' // 24 hours preflight cache

/**
 * CORS Middleware manual para VFIT.
 *
 * O hono/cors nativo tem edge cases que não setam Access-Control-Allow-Origin
 * quando a origin function retorna undefined. Este middleware garante:
 *  1. Preflight OPTIONS sempre responde 204 com headers corretos
 *  2. Requests normais recebem os headers CORS adequados
 *  3. Origins não permitidas recebem resposta sem headers CORS (browser bloqueia)
 */
export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('Origin')
  const allowed = isAllowedOrigin(origin)

  // ── Preflight (OPTIONS) ──────────────────────────
  if (c.req.method === 'OPTIONS') {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': CORS_METHODS,
      'Access-Control-Allow-Headers': CORS_HEADERS,
      'Access-Control-Max-Age': CORS_MAX_AGE,
      'Access-Control-Allow-Credentials': 'true',
    }

    if (allowed) {
      headers['Access-Control-Allow-Origin'] = allowed
      headers['Vary'] = 'Origin'
    }

    return new Response(null, { status: 204, headers })
  }

  // ── Requests normais ─────────────────────────────
  await next()

  if (allowed) {
    c.res.headers.set('Access-Control-Allow-Origin', allowed)
    c.res.headers.set('Access-Control-Allow-Credentials', 'true')
    c.res.headers.set('Access-Control-Expose-Headers', CORS_EXPOSE)
    c.res.headers.set('Vary', 'Origin')
  }
}
