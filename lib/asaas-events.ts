/**
 * lib/asaas-events.ts
 *
 * Normalização de eventos do webhook Asaas.
 *
 * Exports: normalizeAsaasEvent, ASAAS_EVENT_STATUS_MAP
 */

/**
 * A Asaas envia `event` com prefixo PAYMENT_ (PAYMENT_RECEIVED, PAYMENT_CONFIRMED,
 * PAYMENT_REFUNDED, PAYMENT_DELETED, PAYMENT_OVERDUE...), enquanto o campo aninhado
 * `payment.status` do mesmo payload usa a forma curta (RECEIVED, CONFIRMED).
 *
 * O handler de webhook compara contra a forma curta, então o evento precisa ser
 * normalizado antes de qualquer comparação. Sem isso nenhum evento casa e o
 * pagamento fica preso em `pending`.
 */
export function normalizeAsaasEvent(event: unknown): string {
  return typeof event === 'string' ? event.replace(/^PAYMENT_/, '') : ''
}

/** Evento Asaas (forma curta, pós-normalização) → status interno. */
export const ASAAS_EVENT_STATUS_MAP: Record<string, string> = {
  CONFIRMED: 'confirmed',
  RECEIVED: 'confirmed',
  OVERDUE: 'pending',
  REFUNDED: 'refunded',
  DELETED: 'cancelled',
  CREATED: 'pending',
}
