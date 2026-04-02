// ============================================
// Tests: Auth Middleware — JWT verification logic
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// Mock verifyJWT before importing middleware
vi.mock('@lib/auth-helpers', () => ({
  verifyJWT: vi.fn(),
}))

import { verifyJWT } from '@lib/auth-helpers'
import { AppError } from '@lib/errors'
import { error } from '@lib/response'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'

const mockedVerifyJWT = vi.mocked(verifyJWT)

function createApp() {
  const app = new Hono<AppContext>()

  // Mock KV_SESSIONS binding
  app.use('*', async (c, next) => {
    c.env = {
      JWT_SECRET: 'test-secret',
      KV_SESSIONS: {
        get: vi.fn().mockResolvedValue(null), // Not blacklisted
      },
    } as unknown as AppContext['Bindings']
    await next()
  })

  // Error handler (mirrors workers/index.ts)
  app.onError((err) => {
    if (err instanceof AppError) {
      const appErr = err as AppError
      return error(appErr.message, appErr.statusCode, appErr.code, appErr.details)
    }
    return error('Erro interno', 500, 'INTERNAL_ERROR')
  })

  return app
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve rejeitar request sem Authorization header', async () => {
    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(401)
  })

  it('deve rejeitar request com header sem Bearer prefix', async () => {
    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Basic abc123' },
    })
    expect(res.status).toBe(401)
  })

  it('deve rejeitar token inválido', async () => {
    mockedVerifyJWT.mockRejectedValueOnce(new Error('Token inválido'))

    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    expect(res.status).toBe(401)
  })

  it('deve rejeitar token expirado com mensagem específica', async () => {
    mockedVerifyJWT.mockRejectedValueOnce(new Error('Token expirado'))

    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer expired-token' },
    })
    expect(res.status).toBe(401)
  })

  it('deve aceitar token válido e popular context vars', async () => {
    mockedVerifyJWT.mockResolvedValueOnce({
      sub: 'user-123',
      type: 'personal',
      iat: Date.now(),
      exp: Date.now() + 3600,
    })

    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', (c) => {
      return c.json({
        userId: c.get('userId'),
        userType: c.get('userType'),
      })
    })

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(200)

    const body = await res.json() as Record<string, unknown>
    expect(body.userId).toBe('user-123')
    expect(body.userType).toBe('personal')
  })

  it('deve rejeitar token blacklisted', async () => {
    mockedVerifyJWT.mockResolvedValueOnce({
      sub: 'user-123',
      type: 'personal',
      iat: Date.now(),
      exp: Date.now() + 3600,
    })

    const app = new Hono<AppContext>()
    app.use('*', async (c, next) => {
      c.env = {
        JWT_SECRET: 'test-secret',
        KV_SESSIONS: {
          get: vi.fn().mockResolvedValue('true'), // Blacklisted!
        },
      } as unknown as AppContext['Bindings']
      await next()
    })
    app.onError((err) => {
      if (err instanceof AppError) {
        const appErr = err as AppError
        return error(appErr.message, appErr.statusCode, appErr.code, appErr.details)
      }
      return error('Erro interno', 500, 'INTERNAL_ERROR')
    })
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer blacklisted-token' },
    })
    expect(res.status).toBe(401)
  })
})

describe('requireType()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedVerifyJWT.mockResolvedValue({
      sub: 'user-123',
      type: 'personal',
      iat: Date.now(),
      exp: Date.now() + 3600,
    })
  })

  it('deve permitir personal em rota personal', async () => {
    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', requireType('personal'), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(200)
  })

  it('deve rejeitar personal em rota student', async () => {
    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', requireType('student'), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(401)
  })

  it('deve permitir student em rota student', async () => {
    mockedVerifyJWT.mockResolvedValue({
      sub: 'student-456',
      type: 'student',
      iat: Date.now(),
      exp: Date.now() + 3600,
    })

    const app = createApp()
    app.use('*', authMiddleware)
    app.get('/test', requireType('student'), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(200)
  })
})
