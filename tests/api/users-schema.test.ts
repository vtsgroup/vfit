// ============================================
// Tests: Zod Schemas — Users & Students Validation
// ============================================

import { describe, it, expect } from 'vitest'
import {
  inviteStudentSchema,
  manualCreateStudentSchema,
  updateStudentStatusSchema,
  updateStudentSchema,
  quickInviteStudentSchema,
} from '@workers/schemas/users'

// ─── inviteStudentSchema ──────────────────────────────────────────────────────

describe('inviteStudentSchema', () => {
  const valid = {
    email: 'aluno@test.com',
    full_name: 'Maria Souza',
    student_type: 'personal_training' as const,
  }

  it('deve aceitar convite de personal_training válido', () => {
    expect(inviteStudentSchema.safeParse(valid).success).toBe(true)
  })

  it('deve aplicar default student_type = personal_training', () => {
    const result = inviteStudentSchema.safeParse({ email: valid.email, full_name: valid.full_name })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.student_type).toBe('personal_training')
    }
  })

  it('deve aceitar consultoria com preço definido', () => {
    const result = inviteStudentSchema.safeParse({
      ...valid,
      student_type: 'consultoria',
      consultation_price: 300,
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar consultoria sem preço', () => {
    expect(
      inviteStudentSchema.safeParse({ ...valid, student_type: 'consultoria' }).success
    ).toBe(false)
  })

  it('deve rejeitar consultoria com preço zero', () => {
    expect(
      inviteStudentSchema.safeParse({ ...valid, student_type: 'consultoria', consultation_price: 0 }).success
    ).toBe(false)
  })

  it('deve rejeitar email inválido', () => {
    expect(inviteStudentSchema.safeParse({ ...valid, email: 'nao-é-email' }).success).toBe(false)
  })

  it('deve rejeitar full_name < 2 chars', () => {
    expect(inviteStudentSchema.safeParse({ ...valid, full_name: 'A' }).success).toBe(false)
  })

  it('deve aceitar com campos opcionais (phone, notes)', () => {
    const result = inviteStudentSchema.safeParse({
      ...valid,
      phone: '11999998888',
      consultation_notes: 'Treino funcional 3x semana',
    })
    expect(result.success).toBe(true)
  })
})

// ─── quickInviteStudentSchema ─────────────────────────────────────────────────

describe('quickInviteStudentSchema', () => {
  it('deve aceitar convite vazio (sem email nem nome)', () => {
    expect(quickInviteStudentSchema.safeParse({}).success).toBe(true)
  })

  it('deve aceitar com email válido', () => {
    expect(quickInviteStudentSchema.safeParse({ email: 'aluno@test.com' }).success).toBe(true)
  })

  it('deve rejeitar email inválido quando fornecido', () => {
    expect(quickInviteStudentSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('deve aceitar consultoria com preço', () => {
    expect(
      quickInviteStudentSchema.safeParse({ student_type: 'consultoria', consultation_price: 200 }).success
    ).toBe(true)
  })

  it('deve rejeitar consultoria sem preço', () => {
    expect(
      quickInviteStudentSchema.safeParse({ student_type: 'consultoria' }).success
    ).toBe(false)
  })
})

// ─── manualCreateStudentSchema ────────────────────────────────────────────────

describe('manualCreateStudentSchema', () => {
  const valid = {
    full_name: 'Carlos Oliveira',
    cpf: '123.456.789-00',
    date_of_birth: '1990-05-15',
    gender: 'male' as const,
    phone: '11999998888',
    email: 'carlos@test.com',
  }

  it('deve aceitar cadastro manual válido', () => {
    expect(manualCreateStudentSchema.safeParse(valid).success).toBe(true)
  })

  it('deve aceitar todos os gêneros válidos', () => {
    const genders = ['male', 'female', 'other', 'prefer_not_to_say'] as const
    for (const gender of genders) {
      expect(manualCreateStudentSchema.safeParse({ ...valid, gender }).success).toBe(true)
    }
  })

  it('deve rejeitar CPF sem formatação (sem pontos/traço)', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, cpf: '12345678900' }).success).toBe(false)
  })

  it('deve rejeitar date_of_birth fora do formato YYYY-MM-DD', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, date_of_birth: '15/05/1990' }).success).toBe(false)
  })

  it('deve rejeitar gender inválido', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, gender: 'masculino' }).success).toBe(false)
  })

  it('deve rejeitar email inválido', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, email: 'nao-email' }).success).toBe(false)
  })

  it('deve rejeitar phone muito curto (< 10 chars)', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, phone: '1199' }).success).toBe(false)
  })

  it('deve rejeitar full_name < 3 chars', () => {
    expect(manualCreateStudentSchema.safeParse({ ...valid, full_name: 'AB' }).success).toBe(false)
  })
})

// ─── updateStudentStatusSchema ────────────────────────────────────────────────

describe('updateStudentStatusSchema', () => {
  it('deve aceitar todos os status válidos', () => {
    const statuses = ['active', 'blocked', 'inactive', 'churned'] as const
    for (const status of statuses) {
      expect(updateStudentStatusSchema.safeParse({ status }).success).toBe(true)
    }
  })

  it('deve aceitar com reason opcional', () => {
    expect(
      updateStudentStatusSchema.safeParse({ status: 'blocked', reason: 'Inadimplência' }).success
    ).toBe(true)
  })

  it('deve rejeitar status inválido', () => {
    expect(updateStudentStatusSchema.safeParse({ status: 'suspended' }).success).toBe(false)
  })

  it('deve rejeitar reason acima de 500 chars', () => {
    expect(
      updateStudentStatusSchema.safeParse({ status: 'blocked', reason: 'x'.repeat(501) }).success
    ).toBe(false)
  })
})

// ─── updateStudentSchema ──────────────────────────────────────────────────────

describe('updateStudentSchema', () => {
  it('deve aceitar update parcial (só height_cm)', () => {
    expect(updateStudentSchema.safeParse({ height_cm: 175 }).success).toBe(true)
  })

  it('deve rejeitar height_cm abaixo do mínimo (< 50)', () => {
    expect(updateStudentSchema.safeParse({ height_cm: 10 }).success).toBe(false)
  })

  it('deve rejeitar height_cm acima do máximo (> 300)', () => {
    expect(updateStudentSchema.safeParse({ height_cm: 400 }).success).toBe(false)
  })

  it('deve aceitar todos os fitness_level válidos', () => {
    const levels = ['beginner', 'intermediate', 'advanced'] as const
    for (const fitness_level of levels) {
      expect(updateStudentSchema.safeParse({ fitness_level }).success).toBe(true)
    }
  })

  it('deve rejeitar fitness_level inválido', () => {
    expect(updateStudentSchema.safeParse({ fitness_level: 'expert' }).success).toBe(false)
  })

  it('deve aceitar goals como array de strings', () => {
    expect(updateStudentSchema.safeParse({ goals: ['Emagrecer', 'Ganhar massa'] }).success).toBe(true)
  })

  it('deve rejeitar payment_status inválido', () => {
    expect(updateStudentSchema.safeParse({ payment_status: 'atrasado' }).success).toBe(false)
  })
})
