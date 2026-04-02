/**
 * src/lib/sentry-client.ts
 *
 * Sentry (Frontend) — inicialização/captura best-effort
 *
 * Exports: initSentryClient, captureClientException
 * Features: 'use client'
 */

// ============================================
// Sentry (Frontend) — inicialização/captura best-effort
// ============================================

'use client'

import * as Sentry from '@sentry/browser'

let sentryInitialized = false

function parseSampleRate(raw: string | undefined, fallback = 0): number {
  if (!raw) return fallback
  const n = Number(raw)
  if (!Number.isFinite(n)) return fallback
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

export function initSentryClient(): void {
  if (typeof window === 'undefined' || sentryInitialized) return

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0),
  })

  sentryInitialized = true
}

export function captureClientException(
  err: unknown,
  extras?: Record<string, unknown>
): void {
  if (!sentryInitialized) return

  try {
    Sentry.withScope((scope) => {
      if (extras) scope.setContext('context', extras)
      Sentry.captureException(err)
    })
  } catch {
    // noop
  }
}
