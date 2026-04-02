// ============================================
// Tests: lib/response.ts — API Response Helpers
// ============================================

import { describe, it, expect } from 'vitest'
import { success, paginated, error, created, noContent } from '@lib/response'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>

describe('success()', () => {
  it('deve retornar Response com status 200 por padrão', async () => {
    const res = success({ id: '1', name: 'Treino A' })
    expect(res.status).toBe(200)

    const body = await res.json() as Json
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: '1', name: 'Treino A' })
  })

  it('deve aceitar status custom', async () => {
    const res = success('ok', 202)
    expect(res.status).toBe(202)
  })

  it('deve retornar content-type application/json', () => {
    const res = success({})
    expect(res.headers.get('content-type')).toContain('application/json')
  })

  it('deve funcionar com array de dados', async () => {
    const data = [{ id: '1' }, { id: '2' }]
    const res = success(data)
    const body = await res.json() as Json
    expect(body.data).toHaveLength(2)
  })

  it('deve funcionar com null', async () => {
    const res = success(null)
    const body = await res.json() as Json
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })
})

describe('created()', () => {
  it('deve retornar Response com status 201', async () => {
    const res = created({ id: 'new_1' })
    expect(res.status).toBe(201)

    const body = await res.json() as Json
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 'new_1' })
  })
})

describe('noContent()', () => {
  it('deve retornar Response com status 204 e body null', () => {
    const res = noContent()
    expect(res.status).toBe(204)
    expect(res.body).toBeNull()
  })
})

describe('error()', () => {
  it('deve retornar Response de erro com status 500 padrão', async () => {
    const res = error('Algo deu errado')
    expect(res.status).toBe(500)

    const body = await res.json() as Json
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(body.error.message).toBe('Algo deu errado')
  })

  it('deve aceitar status e code custom', async () => {
    const res = error('Não encontrado', 404, 'NOT_FOUND')
    expect(res.status).toBe(404)

    const body = await res.json() as Json
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('deve incluir details quando fornecido', async () => {
    const details = { fields: ['email', 'name'] }
    const res = error('Validação falhou', 400, 'VALIDATION', details)

    const body = await res.json() as Json
    expect(body.error.details).toEqual(details)
  })

  it('não deve incluir details quando undefined', async () => {
    const res = error('Erro')
    const body = await res.json() as Json
    expect(body.error).not.toHaveProperty('details')
  })
})

describe('paginated()', () => {
  it('deve retornar dados com metadados de paginação', async () => {
    const data = [{ id: '1' }, { id: '2' }]
    const res = paginated(data, { page: 1, per_page: 20, total: 50 })
    expect(res.status).toBe(200)

    const body = await res.json() as Json
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.meta.page).toBe(1)
    expect(body.meta.per_page).toBe(20)
    expect(body.meta.total).toBe(50)
    expect(body.meta.total_pages).toBe(3) // ceil(50/20)
    expect(body.meta.timestamp).toBeDefined()
  })

  it('deve calcular total_pages corretamente', async () => {
    const res = paginated([], { page: 1, per_page: 10, total: 25 })
    const body = await res.json() as Json
    expect(body.meta.total_pages).toBe(3) // ceil(25/10)
  })

  it('deve funcionar com lista vazia', async () => {
    const res = paginated([], { page: 1, per_page: 20, total: 0 })
    const body = await res.json() as Json
    expect(body.data).toHaveLength(0)
    expect(body.meta.total).toBe(0)
    expect(body.meta.total_pages).toBe(0) // ceil(0/20)
  })

  it('timestamp deve ser ISO 8601 válido', async () => {
    const res = paginated([], { page: 1, per_page: 20, total: 0 })
    const body = await res.json() as Json
    const date = new Date(body.meta.timestamp)
    expect(date.toISOString()).toBe(body.meta.timestamp)
  })
})
