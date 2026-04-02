// ============================================
// xp-expiration.ts — Cron handler de expiração de XP
// ============================================
//
// O que faz:
//   Expira transações de XP com TTL vencido via lib/xp-service.ts.
//   Executado diariamente pelo cron às 3h (combinado com warmCache).
//   Pode ser acionado manualmente via POST /api/v1/xp/admin/expire.
//
// Exports principais:
//   handleXPExpiration(env) → { expiredCount, executedAt }
//
// Cron: 0 3 * * * — executado junto com warmCache em workers/index.ts
// DB: xp_transactions (marca transações expiradas via expireXPDaily)
// ============================================
import { expireXPDaily } from '@lib/xp-service'
import type { Bindings } from '@workers/types'

/**
 * Handle scheduled XP expiration
 * Call from cron handler or manual trigger
 */
export async function handleXPExpiration(env: Bindings): Promise<{
  expiredCount: number
  executedAt: string
}> {
  const startTime = Date.now()

  const result = await expireXPDaily(env)

  const executedAt = new Date().toISOString()
  const durationMs = Date.now() - startTime

  console.log(`[XP-EXPIRATION] Expired ${result.expiredCount} transactions in ${durationMs}ms`)

  return {
    expiredCount: result.expiredCount,
    executedAt,
  }
}
