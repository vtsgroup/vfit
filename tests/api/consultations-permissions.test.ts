// ============================================
// Tests: Consultation permissions regression
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

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

  app.use('*', async (c, next) => {
    c.env = {
      JWT_SECRET: 'test-secret',
      KV_SESSIONS: {
        get: vi.fn().mockResolvedValue(null),
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

  // Mirrors consultations route permissions
  app.post('/offers', requireType('personal', 'nutritionist', 'admin', 'super_admin'), (c) => c.json({ ok: true }))
  app.post('/orders', requireType('student'), (c) => c.json({ ok: true }))
  app.get('/admin/ledger/reconciliation', requireType('admin', 'super_admin'), (c) => c.json({ ok: true }))
  app.post('/sessions/start', requireType('personal', 'nutritionist', 'student', 'admin', 'super_admin'), (c) => c.json({ ok: true }))

  return app
}

function setJwt(type: 'personal' | 'student' | 'nutritionist', role: 'user' | 'admin' | 'super_admin' = 'user') {
  mockedVerifyJWT.mockResolvedValue({
    sub: `user-${type}-${role}`,
    type,
    role,
    iat: Date.now(),
    exp: Date.now() + 3600,
  })
}

describe('consultation permissions regression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite personal criar oferta e bloqueia checkout de student', async () => {
    setJwt('personal')
    const app = createApp()

    const offersRes = await app.request('/offers', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(offersRes.status).toBe(200)

    const ordersRes = await app.request('/orders', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(ordersRes.status).toBe(401)
  })

  it('permite student criar order e bloqueia rota admin', async () => {
    setJwt('student')
    const app = createApp()

    const ordersRes = await app.request('/orders', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(ordersRes.status).toBe(200)

    const adminRes = await app.request('/admin/ledger/reconciliation', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(adminRes.status).toBe(401)
  })

  it('permite nutritionist criar oferta e iniciar sessão', async () => {
    setJwt('nutritionist')
    const app = createApp()

    const offersRes = await app.request('/offers', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(offersRes.status).toBe(200)

    const startRes = await app.request('/sessions/start', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(startRes.status).toBe(200)
  })

  it('permite admin acessar reconciliação e iniciar sessão', async () => {
    setJwt('personal', 'admin')
    const app = createApp()

    const adminRes = await app.request('/admin/ledger/reconciliation', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(adminRes.status).toBe(200)

    const startRes = await app.request('/sessions/start', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(startRes.status).toBe(200)
  })

  it('permite super_admin universalmente', async () => {
    setJwt('student', 'super_admin')
    const app = createApp()

    const offersRes = await app.request('/offers', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(offersRes.status).toBe(200)

    const adminRes = await app.request('/admin/ledger/reconciliation', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(adminRes.status).toBe(200)
  })
})
