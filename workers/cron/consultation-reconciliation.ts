/**
 * workers/cron/consultation-reconciliation.ts
 *
 * Daily/periodic reconciliation for consultation commerce ledger.
 */

import { generateId, pgQuery } from '@lib/db'
import {
  getConsultationLedgerReconciliationSummary,
} from '@lib/consultation-ledger'
import type { Bindings } from '@workers/types'

export async function runConsultationReconciliation(env: Bindings): Promise<{
  lookbackDays: number
  missingEntries: number
  severity: 'ok' | 'p2' | 'p1'
}> {
  const summary = await getConsultationLedgerReconciliationSummary(env, 2)
  let severity: 'ok' | 'p2' | 'p1' = 'ok'

  // P2: pending orders with stale payment webhook (> 30 min)
  const stalePending = await pgQuery<{ count: number }>(
    env,
    `
      SELECT COUNT(*)::int AS count
      FROM consultation_orders
      WHERE status = 'pending'
        AND asaas_payment_id IS NOT NULL
        AND created_at <= NOW() - INTERVAL '30 minutes'
    `
  )

  // P1: unauthorized premium attempts spike in the last hour
  const securityViolations = await pgQuery<{ count: number }>(
    env,
    `
      SELECT COUNT(*)::int AS count
      FROM consultation_ledger_events
      WHERE event_type = 'security_violation'
        AND created_at >= NOW() - INTERVAL '1 hour'
    `
  )

  const stalePendingCount = stalePending.rows[0]?.count ?? 0
  const securityViolationCount = securityViolations.rows[0]?.count ?? 0

  if (summary.missingEntries > 0 || securityViolationCount >= 10) {
    severity = 'p1'
  } else if (stalePendingCount >= 5) {
    severity = 'p2'
  }

  if (summary.missingEntries > 0) {
    await pgQuery(
      env,
      `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, context, path, user_agent, request_id)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, NULL)`,
      [
        generateId(),
        'system',
        'system',
        'warn',
        'cron.consultation_reconciliation',
        `Consultation ledger mismatch detected: ${summary.missingEntries} missing entries`,
        JSON.stringify(summary),
        '/cron/consultation-reconciliation',
        'cron',
      ]
    )
  }

  if (stalePendingCount >= 5) {
    await pgQuery(
      env,
      `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, context, path, user_agent, request_id)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, NULL)`,
      [
        generateId(),
        'system',
        'system',
        'warn',
        'alerts.consultation.p2.stale_pending_orders',
        `Consultation pending orders delayed webhook: ${stalePendingCount}`,
        JSON.stringify({ stalePendingCount, threshold: 5, lookbackMinutes: 30 }),
        '/cron/consultation-reconciliation',
        'cron',
      ]
    )
  }

  if (securityViolationCount >= 10) {
    await pgQuery(
      env,
      `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, context, path, user_agent, request_id)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, NULL)`,
      [
        generateId(),
        'system',
        'system',
        'error',
        'alerts.consultation.p1.unauthorized_premium_attempts',
        `Consultation unauthorized premium attempts spike: ${securityViolationCount}`,
        JSON.stringify({ securityViolationCount, threshold: 10, lookbackMinutes: 60 }),
        '/cron/consultation-reconciliation',
        'cron',
      ]
    )
  }

  return {
    lookbackDays: summary.lookbackDays,
    missingEntries: summary.missingEntries,
    severity,
  }
}
