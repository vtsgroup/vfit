import { describe, it, expect } from 'vitest'
import { normalizeAsaasEvent, ASAAS_EVENT_STATUS_MAP } from '@lib/asaas-events'

/**
 * Regressão: o handler `POST /payments/webhooks/asaas` comparava `body.event`
 * contra a forma curta (CONFIRMED, RECEIVED...), mas a Asaas envia o evento com
 * prefixo PAYMENT_. Nenhum evento casava, o statusMap caía no fallback
 * `payment.status` e a cobrança era regravada como `pending` para sempre —
 * a tela de PIX ficava em "Aguardando pagamento..." mesmo após o pagamento.
 */

// Espelha a resolução do handler: evento normalizado → status, com fallback
// para o status atual quando o evento não é mapeado.
const resolveStatus = (event: string, current = 'pending') =>
  ASAAS_EVENT_STATUS_MAP[normalizeAsaasEvent(event)] || current

describe('normalizeAsaasEvent', () => {
  it('remove o prefixo PAYMENT_ enviado pela Asaas', () => {
    expect(normalizeAsaasEvent('PAYMENT_RECEIVED')).toBe('RECEIVED')
    expect(normalizeAsaasEvent('PAYMENT_CONFIRMED')).toBe('CONFIRMED')
    expect(normalizeAsaasEvent('PAYMENT_OVERDUE')).toBe('OVERDUE')
    expect(normalizeAsaasEvent('PAYMENT_REFUNDED')).toBe('REFUNDED')
    expect(normalizeAsaasEvent('PAYMENT_DELETED')).toBe('DELETED')
    expect(normalizeAsaasEvent('PAYMENT_CREATED')).toBe('CREATED')
  })

  it('é idempotente para eventos já na forma curta', () => {
    expect(normalizeAsaasEvent('RECEIVED')).toBe('RECEIVED')
    expect(normalizeAsaasEvent('CONFIRMED')).toBe('CONFIRMED')
  })

  it('remove apenas o prefixo, não ocorrências no meio da string', () => {
    expect(normalizeAsaasEvent('PAYMENT_RECEIVED_IN_CASH_UNDONE')).toBe(
      'RECEIVED_IN_CASH_UNDONE'
    )
  })

  it('não quebra com event ausente ou não-string', () => {
    expect(normalizeAsaasEvent(undefined)).toBe('')
    expect(normalizeAsaasEvent(null)).toBe('')
    expect(normalizeAsaasEvent(42)).toBe('')
  })
})

describe('webhook Asaas → status interno', () => {
  it('confirma a cobrança quando o PIX é pago', () => {
    // Os dois eventos que a Asaas dispara em pagamento efetivado.
    expect(resolveStatus('PAYMENT_RECEIVED')).toBe('confirmed')
    expect(resolveStatus('PAYMENT_CONFIRMED')).toBe('confirmed')
  })

  it('NÃO deixa um pagamento confirmado cair no fallback pending', () => {
    // Este é o bug original: sem normalização o lookup dava undefined e o
    // status atual (pending) era regravado por cima de si mesmo.
    expect(resolveStatus('PAYMENT_RECEIVED', 'pending')).not.toBe('pending')
  })

  it('mapeia estorno, remoção e vencimento', () => {
    expect(resolveStatus('PAYMENT_REFUNDED')).toBe('refunded')
    expect(resolveStatus('PAYMENT_DELETED')).toBe('cancelled')
    expect(resolveStatus('PAYMENT_OVERDUE')).toBe('pending')
    expect(resolveStatus('PAYMENT_CREATED')).toBe('pending')
  })

  it('preserva o status atual em eventos não mapeados', () => {
    // Eventos que não devem mexer no status da cobrança.
    expect(resolveStatus('PAYMENT_BANK_SLIP_VIEWED', 'confirmed')).toBe('confirmed')
    expect(resolveStatus('PAYMENT_CHECKOUT_VIEWED', 'pending')).toBe('pending')
    expect(resolveStatus('PAYMENT_PARTIALLY_REFUNDED', 'confirmed')).toBe('confirmed')
  })
})
