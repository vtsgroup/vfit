// ============================================
// Tests: Zod Schemas — Payments Validation
// ============================================

import { describe, it, expect } from 'vitest'
import {
  createPaymentSchema,
  requestPixTransferSchema,
  checkoutPaySchema,
  createSubscriptionSchema,
  updatePaymentStatusSchema,
} from '@workers/schemas/payments'

// ─── createPaymentSchema ─────────────────────────────────────────────────────

describe('createPaymentSchema', () => {
  const valid = {
    payer_id: '550e8400-e29b-41d4-a716-446655440000',
    amount: 150.0,
    payment_method: 'pix' as const,
  }

  it('deve aceitar cobrança PIX válida', () => {
    expect(createPaymentSchema.safeParse(valid).success).toBe(true)
  })

  it('deve aceitar com due_date e description', () => {
    const result = createPaymentSchema.safeParse({
      ...valid,
      due_date: '2026-04-01',
      description: 'Mensalidade abril',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar todos os métodos de pagamento', () => {
    for (const method of ['pix', 'credit_card', 'boleto'] as const) {
      expect(createPaymentSchema.safeParse({ ...valid, payment_method: method }).success).toBe(true)
    }
  })

  it('deve aplicar default create_in_asaas = true', () => {
    const result = createPaymentSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.create_in_asaas).toBe(true)
    }
  })

  it('deve rejeitar payer_id inválido (não UUID)', () => {
    expect(createPaymentSchema.safeParse({ ...valid, payer_id: 'not-a-uuid' }).success).toBe(false)
  })

  it('deve rejeitar amount negativo', () => {
    expect(createPaymentSchema.safeParse({ ...valid, amount: -50 }).success).toBe(false)
  })

  it('deve rejeitar amount zero', () => {
    expect(createPaymentSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })

  it('deve rejeitar payment_method inválido', () => {
    expect(createPaymentSchema.safeParse({ ...valid, payment_method: 'dinheiro' }).success).toBe(false)
  })

  it('deve rejeitar due_date fora do formato YYYY-MM-DD', () => {
    expect(createPaymentSchema.safeParse({ ...valid, due_date: '01/04/2026' }).success).toBe(false)
  })

  it('deve rejeitar sem payer_id', () => {
    const { payer_id: _removed, ...withoutPayer } = valid
    void _removed
    expect(createPaymentSchema.safeParse(withoutPayer).success).toBe(false)
  })
})

// ─── requestPixTransferSchema ─────────────────────────────────────────────────

describe('requestPixTransferSchema', () => {
  const valid = { amount: 500, pix_key: '11999998888' }

  it('deve aceitar transferência PIX válida', () => {
    expect(requestPixTransferSchema.safeParse(valid).success).toBe(true)
  })

  it('deve aceitar com description', () => {
    expect(requestPixTransferSchema.safeParse({ ...valid, description: 'Saque mensal' }).success).toBe(true)
  })

  it('deve rejeitar amount negativo', () => {
    expect(requestPixTransferSchema.safeParse({ ...valid, amount: -100 }).success).toBe(false)
  })

  it('deve rejeitar amount zero', () => {
    expect(requestPixTransferSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })

  it('deve rejeitar pix_key vazia', () => {
    expect(requestPixTransferSchema.safeParse({ ...valid, pix_key: '' }).success).toBe(false)
  })

  it('deve rejeitar sem pix_key', () => {
    expect(requestPixTransferSchema.safeParse({ amount: 500 }).success).toBe(false)
  })
})

// ─── checkoutPaySchema ────────────────────────────────────────────────────────

describe('checkoutPaySchema', () => {
  it('deve aceitar checkout PIX sem dados de cartão', () => {
    expect(checkoutPaySchema.safeParse({ payment_method: 'pix' }).success).toBe(true)
  })

  it('deve aceitar checkout boleto sem dados de cartão', () => {
    expect(checkoutPaySchema.safeParse({ payment_method: 'boleto' }).success).toBe(true)
  })

  it('deve rejeitar credit_card sem dados do cartão nem token', () => {
    expect(checkoutPaySchema.safeParse({ payment_method: 'credit_card' }).success).toBe(false)
  })

  it('deve aceitar credit_card com token salvo', () => {
    const result = checkoutPaySchema.safeParse({
      payment_method: 'credit_card',
      credit_card_token: 'tok_abc123',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar credit_card com dados completos do cartão', () => {
    const result = checkoutPaySchema.safeParse({
      payment_method: 'credit_card',
      card_holder_name: 'JOAO SILVA',
      card_number: '4111111111111111',
      expiry_month: '12',
      expiry_year: '2027',
      ccv: '123',
      holder_name: 'João Silva',
      holder_cpf: '12345678900',
      holder_phone: '11999998888',
      holder_postal_code: '01310-100',
      holder_address_number: '123',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar installment_count acima de 12', () => {
    expect(checkoutPaySchema.safeParse({ payment_method: 'pix', installment_count: 13 }).success).toBe(false)
  })

  it('deve aceitar installment_count válido (1-12)', () => {
    expect(checkoutPaySchema.safeParse({ payment_method: 'pix', installment_count: 6 }).success).toBe(true)
  })
})

// ─── createSubscriptionSchema ─────────────────────────────────────────────────

describe('createSubscriptionSchema', () => {
  const valid = {
    payer_id: '550e8400-e29b-41d4-a716-446655440000',
    amount: 200,
    payment_method: 'pix' as const,
    start_date: '2026-04-01',
  }

  it('deve aceitar assinatura mensal válida', () => {
    expect(createSubscriptionSchema.safeParse(valid).success).toBe(true)
  })

  it('deve aplicar billing_cycle default = MONTHLY', () => {
    const result = createSubscriptionSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.billing_cycle).toBe('MONTHLY')
    }
  })

  it('deve aceitar todos os ciclos de cobrança', () => {
    const cycles = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY'] as const
    for (const cycle of cycles) {
      expect(createSubscriptionSchema.safeParse({ ...valid, billing_cycle: cycle }).success).toBe(true)
    }
  })

  it('deve aceitar com end_date opcional', () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, end_date: '2027-04-01' }).success).toBe(true)
  })

  it('deve rejeitar billing_cycle inválido', () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, billing_cycle: 'DAILY' }).success).toBe(false)
  })

  it('deve rejeitar start_date fora do formato YYYY-MM-DD', () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, start_date: '01/04/2026' }).success).toBe(false)
  })

  it('deve rejeitar amount negativo', () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, amount: -100 }).success).toBe(false)
  })
})

// ─── updatePaymentStatusSchema ────────────────────────────────────────────────

describe('updatePaymentStatusSchema', () => {
  it('deve aceitar todos os status válidos', () => {
    const statuses = ['pending', 'confirmed', 'failed', 'refunded', 'cancelled'] as const
    for (const status of statuses) {
      expect(updatePaymentStatusSchema.safeParse({ status }).success).toBe(true)
    }
  })

  it('deve aceitar confirmed com paid_at', () => {
    expect(
      updatePaymentStatusSchema.safeParse({
        status: 'confirmed',
        paid_at: '2026-04-01T12:00:00Z',
      }).success
    ).toBe(true)
  })

  it('deve rejeitar status inválido', () => {
    expect(updatePaymentStatusSchema.safeParse({ status: 'aprovado' }).success).toBe(false)
  })
})
