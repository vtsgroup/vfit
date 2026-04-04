/**
 * src/lib/debug-logger.ts
 *
 * Debug Logger (cliente) — pré-produção
 *
 * Exports: DebugLogInput, isDebugLoggingEnabled, setDebugLoggingEnabled, shouldEnableDebugFromUrl, getCurrentTestRunId
 * Hooks: useAuthStore
 * Features: Auth: useAuthStore
 */

// ============================================
// Debug Logger (cliente) — pré-produção
// Captura erros em mobile e envia para API/KV
// ============================================

import { useAuthStore } from '@/stores/auth-store'
// Sentry: dynamic import to avoid pulling @sentry/browser into public page bundles
let _captureClientException: typeof import('@/lib/sentry-client').captureClientException | null = null
const getSentryCapturer = async () => {
  if (!_captureClientException) {
    const mod = await import('@/lib/sentry-client')
    _captureClientException = mod.captureClientException
  }
  return _captureClientException
}

type DebugLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type DebugLogInput = {
  level?: DebugLogLevel
  source?: string
  message: string
  stack?: string
  context?: unknown
  path?: string
}

const DEBUG_QUEUE_KEY = 'pia_debug_queue_v1'
const DEBUG_ENABLED_KEY = 'pia_debug_enabled'
const DEBUG_TEST_RUN_KEY = 'pia_debug_test_run_id'
const DEBUG_SESSION_KEY = 'pia_debug_session_id'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'
// Controla se o debug mode fica sempre ativo independente do localStorage.
// Em produção, deve ser false (ou NEXT_PUBLIC_FORCE_DEBUG=false).
// Para ativar temporariamente em QA: NEXT_PUBLIC_FORCE_DEBUG=true no .env.local
const FORCE_DEBUG_ALWAYS_ON = process.env.NEXT_PUBLIC_FORCE_DEBUG === 'true'

let listenersAttached = false

function safeGetLocal(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // best-effort
  }
}

function safeGetSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // best-effort
  }
}

export function isDebugLoggingEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (FORCE_DEBUG_ALWAYS_ON) return true
  return safeGetLocal(DEBUG_ENABLED_KEY) === '1'
}

export function setDebugLoggingEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (FORCE_DEBUG_ALWAYS_ON) {
    safeSetLocal(DEBUG_ENABLED_KEY, '1')
    return
  }
  safeSetLocal(DEBUG_ENABLED_KEY, enabled ? '1' : '0')
}

export function shouldEnableDebugFromUrl(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.get('debugLogs') === '1'
}

export function getCurrentTestRunId(): string {
  if (typeof window === 'undefined') return 'run-server'
  const existing = safeGetLocal(DEBUG_TEST_RUN_KEY)
  if (existing) return existing

  const next = createRunId()
  safeSetLocal(DEBUG_TEST_RUN_KEY, next)
  return next
}

export function startNewTestRun(): string {
  if (typeof window === 'undefined') return 'run-server'
  const next = createRunId()
  safeSetLocal(DEBUG_TEST_RUN_KEY, next)
  return next
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'session-server'
  const existing = safeGetSession(DEBUG_SESSION_KEY)
  if (existing) return existing

  const next =
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  safeSetSession(DEBUG_SESSION_KEY, next)
  return next
}

export async function logClientIssue(input: DebugLogInput): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const sentryError = new Error(input.message || 'Erro sem mensagem')
    if (input.stack) sentryError.stack = input.stack
    const capture = await getSentryCapturer()
    capture(sentryError, {
      level: input.level ?? 'error',
      source: input.source ?? 'client',
      path: input.path || window.location.pathname,
      context: input.context,
    })

    const runId = getCurrentTestRunId()
    const sessionId = getSessionId()

    const baseContext =
      input.context && typeof input.context === 'object'
        ? (input.context as Record<string, unknown>)
        : {}

    const payload: DebugLogInput = {
      level: input.level ?? 'error',
      source: input.source ?? 'client',
      message: input.message?.slice(0, 2000) || 'Erro sem mensagem',
      ...(input.stack ? { stack: input.stack.slice(0, 6000) } : {}),
      context: {
        ...baseContext,
        test_run_id: runId,
        session_id: sessionId,
        user_agent: navigator.userAgent,
      },
      path: input.path || window.location.pathname,
    }

    queueLocal(payload)
    await flushDebugQueue()
  } catch {
    // NUNCA derrubar a UI por falha de logger
  }
}

export async function flushDebugQueue(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!isDebugLoggingEnabled()) return

  try {
    const queue = readQueue()
    if (queue.length === 0) return

    const token = useAuthStore.getState().getAccessToken()
    if (!token) return

    const remaining: DebugLogInput[] = []

    for (const item of queue) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/debug/logs`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        })

        if (!res.ok) {
          remaining.push(item)
        }
      } catch {
        remaining.push(item)
      }
    }

    writeQueue(remaining.slice(-200))
  } catch {
    // ignore
  }
}

export function initGlobalDebugLogging(): void {
  if (typeof window === 'undefined' || listenersAttached) return

  listenersAttached = true

  window.addEventListener('error', (event) => {
    void logClientIssue({
      level: 'error',
      source: 'window.error',
      message: event.message || 'Erro de runtime no navegador',
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string; stack?: string } | string | null
    const message = typeof reason === 'string'
      ? reason
      : reason?.message || 'Promise rejection sem mensagem'

    void logClientIssue({
      level: 'error',
      source: 'window.unhandledrejection',
      message,
      stack: typeof reason === 'string' ? undefined : reason?.stack,
    })
  })
}

function readQueue(): DebugLogInput[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = safeGetLocal(DEBUG_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as DebugLogInput[]
  } catch {
    return []
  }
}

function writeQueue(items: DebugLogInput[]): void {
  if (typeof window === 'undefined') return
  safeSetLocal(DEBUG_QUEUE_KEY, JSON.stringify(items))
}

function queueLocal(item: DebugLogInput): void {
  const queue = readQueue()
  queue.push(item)
  writeQueue(queue.slice(-200))
}

function createRunId(): string {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  return `run-${stamp}-${Math.random().toString(36).slice(2, 7)}`
}
