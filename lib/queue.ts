/**
 * lib/queue.ts
 *
 * Queue Helpers — Retry/Backoff + Safe Fallback
 *
 * Exports: EnqueueOptions, EnqueueResult
 */

// ============================================
// Queue Helpers — Retry/Backoff + Safe Fallback
// ============================================

export interface EnqueueOptions {
  queueName: string
  requestId?: string
  maxAttempts?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
}

export interface EnqueueResult {
  queued: boolean
  attempts: number
  reason?: 'queue_unavailable' | 'send_failed'
  errorMessage?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function enqueueWithRetry<T extends Record<string, unknown>>(
  queue: Queue | undefined,
  message: T,
  options: EnqueueOptions
): Promise<EnqueueResult> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3)
  const baseBackoffMs = Math.max(50, options.baseBackoffMs ?? 150)
  const maxBackoffMs = Math.max(baseBackoffMs, options.maxBackoffMs ?? 1_000)

  if (!queue) {
    console.warn(
      `[Queue:${options.queueName}] unavailable`,
      JSON.stringify({ requestId: options.requestId || null })
    )
    return { queued: false, attempts: 0, reason: 'queue_unavailable' }
  }

  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await queue.send({
        ...message,
        queued_at: new Date().toISOString(),
      })

      if (attempt > 1) {
        console.warn(
          `[Queue:${options.queueName}] recovered`,
          JSON.stringify({ requestId: options.requestId || null, attempt })
        )
      }

      return { queued: true, attempts: attempt }
    } catch (err) {
      lastError = err
      const backoff = Math.min(maxBackoffMs, baseBackoffMs * 2 ** (attempt - 1))

      console.warn(
        `[Queue:${options.queueName}] send failed`,
        JSON.stringify({
          requestId: options.requestId || null,
          attempt,
          maxAttempts,
          backoffMs: backoff,
          error: err instanceof Error ? err.message : String(err),
        })
      )

      if (attempt < maxAttempts) {
        await sleep(backoff)
      }
    }
  }

  return {
    queued: false,
    attempts: maxAttempts,
    reason: 'send_failed',
    errorMessage: lastError instanceof Error ? lastError.message : String(lastError),
  }
}
