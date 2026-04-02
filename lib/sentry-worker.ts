/**
 * lib/sentry-worker.ts
 *
 * Sentry (Worker) — inicialização/captura best-effort
 *
 * Exports: captureWorkerException
 */

// ============================================
// Sentry (Worker) — inicialização/captura best-effort
// ============================================

import * as Sentry from '@sentry/cloudflare'

export function captureWorkerException(
  env: { SENTRY_DSN_WORKER?: string },
  err: unknown,
  extras?: Record<string, unknown>
): void {
  if (!env.SENTRY_DSN_WORKER) return

  try {
    Sentry.withScope((scope) => {
      if (extras) {
        for (const [k, v] of Object.entries(extras)) {
          scope.setExtra(k, v as any)
        }
      }
      Sentry.captureException(err)
    })
  } catch {
    // noop
  }
}
