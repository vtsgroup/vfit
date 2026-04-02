// ============================================
// Tests: Rate Limit Middleware — prefix matching e sliding window
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { rateLimitMiddleware } from '@workers/middleware/rate-limit'
import { RATE_LIMITS } from '@config/constants'
import { AppError } from '@lib/errors'
import { error } from '@lib/response'
import type { AppContext } from '@workers/types'

// ─── KV mock factory ────────────────────────────────────────────────────────

function makeKv(existing?: { count: number; resetAt: number }) {
  return {
    get: vi.fn().mockResolvedValue(existing ?? null),
    put: vi.fn().mockResolvedValue(undefined),
  }
}

function createApp(kv: ReturnType<typeof makeKv>, ip = '1.2.3.4') {
  const app = new Hono<AppContext>()

  app.use('*', async (c, next) => {
    c.env = { KV_RATE_LIMIT: kv } as unknown as AppContext['Bindings']
    c.req.raw.headers.set('CF-Connecting-IP', ip)
    await next()
  })

  app.use('*', rateLimitMiddleware)
  app.get('*', (c) => c.json({ ok: true }))
  app.post('*', (c) => c.json({ ok: true }))

  app.onError((err, c) => {
    if (err instanceof AppError) {
      // Build response and forward any headers already set on context (e.g. Retry-After)
      const res = error(err.message, err.statusCode, err.code, err.details)
      c.res = new Response(res.body, { status: res.status, headers: res.headers })
      // Copy X-RateLimit-* headers from context into response
      ;['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'].forEach((h) => {
        const v = c.res?.headers.get(h) ?? null
        if (v) res.headers.set(h, v)
      })
      return res
    }
    return new Response('Internal Error', { status: 500 })
  })

  return app
}

// ─── Prefix matching ─────────────────────────────────────────────────────────

describe('rate-limit: prefix matching', () => {
  it('bate no config de /api/v1/auth/login (exact match)', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.status).toBe(200)
    // KV key deve conter o path exato
    const putCall = kv.put.mock.calls[0]
    expect(putCall[0]).toContain('/api/v1/auth/login')
    // TTL deve ser 900 (15 min — loginconfig)
    expect(putCall[2]).toEqual({ expirationTtl: 900 })
  })

  it('bate no config de /api/v1/auth/register via prefix match para /personal', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/register/personal', { method: 'POST' })
    expect(res.status).toBe(200)
    // TTL deve ser 3600 (1h — register config)
    const putCall = kv.put.mock.calls[0]
    expect(putCall[2]).toEqual({ expirationTtl: 3600 })
  })

  it('bate no config de /api/v1/auth/register para /student (mesmo prefix)', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    await app.request('http://api.test/api/v1/auth/register/student', { method: 'POST' })
    const putCall = kv.put.mock.calls[0]
    expect(putCall[2]).toEqual({ expirationTtl: 3600 })
  })

  it('rotas não configuradas caem no default (100/min)', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    await app.request('http://api.test/api/v1/students')
    const putCall = kv.put.mock.calls[0]
    expect(putCall[2]).toEqual({ expirationTtl: 60 })
  })

  it('/api/v1/auth/login tem prioridade sobre /api/v1/auth (mais específico)', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    const putCall = kv.put.mock.calls[0]
    // Login = 900s, não o genérico
    expect(putCall[2]).toEqual({ expirationTtl: 900 })
  })
})

// ─── Sliding window ──────────────────────────────────────────────────────────

describe('rate-limit: sliding window', () => {
  it('permite request quando abaixo do limite', async () => {
    const future = Date.now() + 60_000
    const kv = makeKv({ count: 3, resetAt: future }) // max=5, count=3 → ok
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.status).toBe(200)
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('1')
  })

  it('bloqueia request quando no limite (count >= max)', async () => {
    const future = Date.now() + 60_000
    const kv = makeKv({ count: 5, resetAt: future }) // max=5, count=5 → blocked
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.status).toBe(429)
    // KV.put não é chamado (request bloqueado antes de incrementar)
    expect(kv.put).not.toHaveBeenCalled()
    // Body contém código de erro
    const body = await res.json() as { error?: { code?: string } }
    expect(body.error?.code).toBe('RATE_LIMITED')
  })

  it('reseta janela quando resetAt já passou', async () => {
    const past = Date.now() - 1000
    const kv = makeKv({ count: 5, resetAt: past }) // janela expirada
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.status).toBe(200) // nova janela
    const putCall = kv.put.mock.calls[0]
    const entry = JSON.parse(putCall[1])
    expect(entry.count).toBe(1) // começa do zero
  })

  it('seta headers X-RateLimit corretamente', async () => {
    const kv = makeKv()
    const app = createApp(kv)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
    expect(res.headers.get('X-RateLimit-Reset')).toBeDefined()
  })

  it('graceful degradation: KV failure não bloqueia request', async () => {
    const kv = {
      get: vi.fn().mockRejectedValue(new Error('KV unavailable')),
      put: vi.fn().mockRejectedValue(new Error('KV unavailable')),
    }
    const app = createApp(kv as ReturnType<typeof makeKv>)
    const res = await app.request('http://api.test/api/v1/auth/login', { method: 'POST' })
    expect(res.status).toBe(200) // não bloqueia
  })
})

// ─── RATE_LIMITS config validation ───────────────────────────────────────────

describe('RATE_LIMITS: configuração', () => {
  it('login é mais restritivo que o default', () => {
    expect(RATE_LIMITS['/api/v1/auth/login'].max).toBeLessThan(RATE_LIMITS.default.max)
  })

  it('register tem window maior que login (anti-spam mais lento)', () => {
    expect(RATE_LIMITS['/api/v1/auth/register'].windowSeconds)
      .toBeGreaterThan(RATE_LIMITS['/api/v1/auth/login'].windowSeconds)
  })

  it('todos os paths específicos são strings /api/v1/...', () => {
    for (const key of Object.keys(RATE_LIMITS)) {
      if (key === 'default') continue
      expect(key.startsWith('/api/v1/')).toBe(true)
    }
  })
})
