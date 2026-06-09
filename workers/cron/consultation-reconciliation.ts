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
}> {
  const summary = await getConsultationLedgerReconciliationSummary(env, 2)

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

  return {
    lookbackDays: summary.lookbackDays,
    missingEntries: summary.missingEntries,
  }
}
