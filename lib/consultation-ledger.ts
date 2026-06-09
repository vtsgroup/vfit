/**
 * lib/consultation-ledger.ts
 *
 * Ledger append-only for consultation commerce.
 */

import { FEES } from '@config/constants'
import { generateId, pgQuery, pgQueryOne } from '@lib/db'
import type { Bindings } from '@workers/types'

export type ConsultationLedgerEventType =
  | 'order_paid'
  | 'fee_charged'
  | 'creator_settled'
  | 'refunded'
  | 'security_violation'

export type ConsultationLedgerDirection = 'credit' | 'debit'

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export async function appendConsultationLedgerEvent(
  env: Bindings,
  input: {
    orderId: string
    creatorId: string
    eventType: ConsultationLedgerEventType
    direction: ConsultationLedgerDirection
    amount: number
    accountType?: string
    idempotencyKey: string
    metadata?: Record<string, unknown>
    createdAt?: string
  }
): Promise<boolean> {
  if (!(input.amount > 0)) return false

  const now = input.createdAt || new Date().toISOString()
  const accountType = input.accountType || 'platform_clearing'

  const { rowCount } = await pgQuery(
    env,
    `
      INSERT INTO consultation_ledger_events (
        id,
        order_id,
        creator_id,
        event_type,
        account_type,
        direction,
        amount,
        idempotency_key,
        metadata,
        created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)
      ON CONFLICT (idempotency_key) DO NOTHING
    `,
    [
      generateId(),
      input.orderId,
      input.creatorId,
      input.eventType,
      accountType,
      input.direction,
      roundCurrency(input.amount),
      input.idempotencyKey,
      JSON.stringify(input.metadata || {}),
      now,
    ]
  )

  return rowCount > 0
}

export async function recordConsultationOrderPaid(
  env: Bindings,
  input: {
    orderId: string
    creatorId: string
    grossAmount: number
    paidAt?: string
    metadata?: Record<string, unknown>
  }
): Promise<{ grossAmount: number; feeAmount: number; netAmount: number }> {
  const grossAmount = roundCurrency(input.grossAmount)
  const feeAmount = roundCurrency((grossAmount * FEES.platform_fee_percentage) / 100)
  const netAmount = roundCurrency(grossAmount - feeAmount)

  const metadata = {
    ...input.metadata,
    platform_fee_percentage: FEES.platform_fee_percentage,
  }

  await appendConsultationLedgerEvent(env, {
    orderId: input.orderId,
    creatorId: input.creatorId,
    eventType: 'order_paid',
    direction: 'credit',
    accountType: 'platform_clearing',
    amount: grossAmount,
    idempotencyKey: `consult:${input.orderId}:order_paid`,
    metadata,
    createdAt: input.paidAt,
  })

  await appendConsultationLedgerEvent(env, {
    orderId: input.orderId,
    creatorId: input.creatorId,
    eventType: 'fee_charged',
    direction: 'credit',
    accountType: 'platform_revenue',
    amount: feeAmount,
    idempotencyKey: `consult:${input.orderId}:fee_charged`,
    metadata,
    createdAt: input.paidAt,
  })

  await appendConsultationLedgerEvent(env, {
    orderId: input.orderId,
    creatorId: input.creatorId,
    eventType: 'creator_settled',
    direction: 'credit',
    accountType: 'creator_payable',
    amount: netAmount,
    idempotencyKey: `consult:${input.orderId}:creator_settled`,
    metadata,
    createdAt: input.paidAt,
  })

  return { grossAmount, feeAmount, netAmount }
}

export async function recordConsultationOrderRefunded(
  env: Bindings,
  input: {
    orderId: string
    creatorId: string
    grossAmount: number
    refundedAt?: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  await appendConsultationLedgerEvent(env, {
    orderId: input.orderId,
    creatorId: input.creatorId,
    eventType: 'refunded',
    direction: 'debit',
    accountType: 'platform_clearing',
    amount: roundCurrency(input.grossAmount),
    idempotencyKey: `consult:${input.orderId}:refunded`,
    metadata: input.metadata,
    createdAt: input.refundedAt,
  })
}

export async function getCreatorConsultationLedgerStatus(
  env: Bindings,
  creatorId: string
): Promise<{ totalPaidOrders: number; totalRefundedOrders: number; inconsistentOrders: number }> {
  const row = await pgQueryOne<{
    total_paid_orders: number
    total_refunded_orders: number
    inconsistent_orders: number
  }>(
    env,
    `
      WITH paid_orders AS (
        SELECT id
        FROM consultation_orders
        WHERE creator_id = $1 AND status = 'paid'
      ),
      paid_missing AS (
        SELECT p.id
        FROM paid_orders p
        WHERE NOT EXISTS (
          SELECT 1 FROM consultation_ledger_events le
          WHERE le.order_id = p.id AND le.event_type = 'order_paid'
        )
        OR NOT EXISTS (
          SELECT 1 FROM consultation_ledger_events le
          WHERE le.order_id = p.id AND le.event_type = 'fee_charged'
        )
        OR NOT EXISTS (
          SELECT 1 FROM consultation_ledger_events le
          WHERE le.order_id = p.id AND le.event_type = 'creator_settled'
        )
      ),
      refunded_orders AS (
        SELECT id
        FROM consultation_orders
        WHERE creator_id = $1 AND status = 'refunded'
      ),
      refunded_missing AS (
        SELECT r.id
        FROM refunded_orders r
        WHERE NOT EXISTS (
          SELECT 1 FROM consultation_ledger_events le
          WHERE le.order_id = r.id AND le.event_type = 'refunded'
        )
      )
      SELECT
        (SELECT COUNT(*)::int FROM paid_orders) AS total_paid_orders,
        (SELECT COUNT(*)::int FROM refunded_orders) AS total_refunded_orders,
        (
          (SELECT COUNT(*)::int FROM paid_missing) +
          (SELECT COUNT(*)::int FROM refunded_missing)
        ) AS inconsistent_orders
    `,
    [creatorId]
  )

  return {
    totalPaidOrders: row?.total_paid_orders ?? 0,
    totalRefundedOrders: row?.total_refunded_orders ?? 0,
    inconsistentOrders: row?.inconsistent_orders ?? 0,
  }
}

export async function getConsultationLedgerReconciliationSummary(
  env: Bindings,
  lookbackDays = 30
): Promise<{
  lookbackDays: number
  expectedPaidOrders: number
  expectedRefundedOrders: number
  ledgerPaidOrders: number
  ledgerFeeOrders: number
  ledgerSettledOrders: number
  ledgerRefundedOrders: number
  expectedGrossPaid: number
  expectedGrossRefunded: number
  ledgerGrossPaid: number
  ledgerGrossRefunded: number
  missingEntries: number
}> {
  const days = Math.min(180, Math.max(1, Math.floor(lookbackDays)))

  const row = await pgQueryOne<{
    expected_paid_orders: number
    expected_refunded_orders: number
    ledger_paid_orders: number
    ledger_fee_orders: number
    ledger_settled_orders: number
    ledger_refunded_orders: number
    expected_gross_paid: number
    expected_gross_refunded: number
    ledger_gross_paid: number
    ledger_gross_refunded: number
  }>(
    env,
    `
      WITH recent_orders AS (
        SELECT id, amount::float AS amount, status
        FROM consultation_orders
        WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      ),
      expected AS (
        SELECT
          COUNT(*) FILTER (WHERE status = 'paid')::int AS expected_paid_orders,
          COUNT(*) FILTER (WHERE status = 'refunded')::int AS expected_refunded_orders,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::float AS expected_gross_paid,
          COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0)::float AS expected_gross_refunded
        FROM recent_orders
      ),
      ledger AS (
        SELECT
          COUNT(DISTINCT order_id) FILTER (WHERE event_type = 'order_paid')::int AS ledger_paid_orders,
          COUNT(DISTINCT order_id) FILTER (WHERE event_type = 'fee_charged')::int AS ledger_fee_orders,
          COUNT(DISTINCT order_id) FILTER (WHERE event_type = 'creator_settled')::int AS ledger_settled_orders,
          COUNT(DISTINCT order_id) FILTER (WHERE event_type = 'refunded')::int AS ledger_refunded_orders,
          COALESCE(SUM(amount) FILTER (WHERE event_type = 'order_paid' AND direction = 'credit'), 0)::float AS ledger_gross_paid,
          COALESCE(SUM(amount) FILTER (WHERE event_type = 'refunded' AND direction = 'debit'), 0)::float AS ledger_gross_refunded
        FROM consultation_ledger_events
        WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
      )
      SELECT
        expected.expected_paid_orders,
        expected.expected_refunded_orders,
        ledger.ledger_paid_orders,
        ledger.ledger_fee_orders,
        ledger.ledger_settled_orders,
        ledger.ledger_refunded_orders,
        expected.expected_gross_paid,
        expected.expected_gross_refunded,
        ledger.ledger_gross_paid,
        ledger.ledger_gross_refunded
      FROM expected, ledger
    `,
    [days]
  )

  const expectedPaidOrders = row?.expected_paid_orders ?? 0
  const expectedRefundedOrders = row?.expected_refunded_orders ?? 0
  const ledgerPaidOrders = row?.ledger_paid_orders ?? 0
  const ledgerFeeOrders = row?.ledger_fee_orders ?? 0
  const ledgerSettledOrders = row?.ledger_settled_orders ?? 0
  const ledgerRefundedOrders = row?.ledger_refunded_orders ?? 0

  const missingEntries =
    Math.abs(expectedPaidOrders - ledgerPaidOrders) +
    Math.abs(expectedPaidOrders - ledgerFeeOrders) +
    Math.abs(expectedPaidOrders - ledgerSettledOrders) +
    Math.abs(expectedRefundedOrders - ledgerRefundedOrders)

  return {
    lookbackDays: days,
    expectedPaidOrders,
    expectedRefundedOrders,
    ledgerPaidOrders,
    ledgerFeeOrders,
    ledgerSettledOrders,
    ledgerRefundedOrders,
    expectedGrossPaid: row?.expected_gross_paid ?? 0,
    expectedGrossRefunded: row?.expected_gross_refunded ?? 0,
    ledgerGrossPaid: row?.ledger_gross_paid ?? 0,
    ledgerGrossRefunded: row?.ledger_gross_refunded ?? 0,
    missingEntries,
  }
}
