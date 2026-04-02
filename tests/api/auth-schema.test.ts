// ============================================
// Tests: Zod Schemas — Auth Validation
// ============================================

import { describe, it, expect } from 'vitest'
import {
  registerPersonalSchema,
  registerStudentSchema,
  loginSchema,
  refreshSchema,
} from '@workers/schemas/auth'

describe('loginSchema', () => {
  it('deve aceitar login válido', () => {
    const result = loginSchema.safeParse({
      identifier: 'user@example.com',
      password: 'Teste123!',
      turnstile_token: 'token-abc',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Teste123!',
      turnstile_token: 'token',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar senha vazia', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
      turnstile_token: 'token',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar sem turnstile_token', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Teste123!',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar turnstile_token vazio', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Teste123!',
      turnstile_token: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerPersonalSchema', () => {
  const validPayload = {
    email: 'personal@test.com',
    password: 'Teste123!',
    full_name: 'João Silva',
    cpf: '123.456.789-00',
    cref: '123456-G/SP',
    cref_state: 'SP',
    turnstile_token: 'token-abc',
  }

  it('deve aceitar registro válido de personal', () => {
    const result = registerPersonalSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('deve aceitar com campos opcionais', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      phone: '11999998888',
      specialties: ['Musculação', 'Funcional'],
      referral_code: 'REF123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.specialties).toEqual(['Musculação', 'Funcional'])
    }
  })

  it('deve aplicar default specialties = []', () => {
    const result = registerPersonalSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.specialties).toEqual([])
    }
  })

  it('deve rejeitar CPF sem formato correto', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      cpf: '12345678900',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar CREF muito curto (< 3 chars)', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      cref: 'AB',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar cref_state com mais de 2 chars', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      cref_state: 'São',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar senha < 8 caracteres', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar full_name < 2 chars', () => {
    const result = registerPersonalSchema.safeParse({
      ...validPayload,
      full_name: 'J',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerStudentSchema', () => {
  const validPayload = {
    email: 'aluno@test.com',
    password: 'Aluno123!',
    full_name: 'Maria Souza',
    cpf: '987.654.321-00',
    invitation_token: 'inv-token-123',
    turnstile_token: 'token-abc',
  }

  it('deve aceitar registro válido de student', () => {
    const result = registerStudentSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('deve aceitar sem invitation_token', () => {
    const { invitation_token: _unused, ...withoutToken } = validPayload
    void _unused
    const result = registerStudentSchema.safeParse(withoutToken)
    expect(result.success).toBe(true)
  })

  it('deve rejeitar invitation_token vazio', () => {
    const result = registerStudentSchema.safeParse({
      ...validPayload,
      invitation_token: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('refreshSchema', () => {
  it('deve aceitar refresh_token válido', () => {
    const result = refreshSchema.safeParse({
      refresh_token: 'some-refresh-token-value',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar refresh_token vazio', () => {
    const result = refreshSchema.safeParse({
      refresh_token: '',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar sem refresh_token', () => {
    const result = refreshSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
