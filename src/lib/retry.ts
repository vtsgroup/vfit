/**
 * src/lib/retry.ts
 *
 * Exponential backoff retry com jitter anti-thundering-herd.
 * Usado pelo api-client para requests críticos (IA, pagamentos).
 *
 * Padrão: 3 tentativas, base 1s, max 8s, jitter ±30%.
 */

// ============================================
// Retry com Exponential Backoff + Jitter
// ============================================

export interface RetryOptions {
  /** Número máximo de tentativas (incluindo a primeira). Default: 3 */
  maxAttempts?: number
  /** Delay base em ms. Default: 1000 */
  baseDelay?: number
  /** Delay máximo em ms (cap). Default: 8000 */
  maxDelay?: number
  /** Fator de jitter (0-1). Default: 0.3 (±30%) */
  jitter?: number
  /** Função para decidir se deve re-tentar baseado no erro. Default: retry em 5xx e network errors */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Callback chamado antes de cada retry (logging, UI feedback). */
  onRetry?: (error: unknown, attempt: number, delay: number) => void
  /** AbortSignal para cancelar retries. */
  signal?: AbortSignal
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'signal'>> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  jitter: 0.3,
  shouldRetry: defaultShouldRetry,
}

/**
 * Executa uma função com retry exponencial.
 *
 * @example
 * ```ts
 * const result = await withRetry(() => api.post('/plans/generate', payload), {
 *   maxAttempts: 3,
 *   onRetry: (err, attempt, delay) => console.log(`Retry ${attempt} in ${delay}ms`),
 * })
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      // Check abort before attempt
      if (opts.signal?.aborted) {
        throw new Error('Retry aborted')
      }

      return await fn()
    } catch (error) {
      lastError = error

      // Last attempt — don't retry
      if (attempt >= opts.maxAttempts) break

      // Check if we should retry this error
      if (!opts.shouldRetry(error, attempt)) break

      // Check abort before sleep
      if (opts.signal?.aborted) break

      // Calculate delay with exponential backoff + jitter
      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay, opts.jitter)

      // Notify callback
      opts.onRetry?.(error, attempt, delay)

      // Wait with abort support
      await sleep(delay, opts.signal)
    }
  }

  throw lastError
}

/**
 * Calcula delay com exponential backoff + jitter.
 *
 * Formula: min(maxDelay, baseDelay × 2^(attempt-1)) × (1 ± jitter)
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: number
): number {
  // Exponential: 1s → 2s → 4s → 8s
  const exponential = baseDelay * Math.pow(2, attempt - 1)

  // Cap at maxDelay
  const capped = Math.min(exponential, maxDelay)

  // Add jitter: ±jitter%
  const jitterRange = capped * jitter
  const randomJitter = (Math.random() * 2 - 1) * jitterRange

  return Math.round(capped + randomJitter)
}

/**
 * Sleep with abort support.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Retry aborted'))
      return
    }

    const timer = setTimeout(resolve, ms)

    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Retry aborted'))
    }, { once: true })
  })
}

/**
 * Default: retry em 5xx, 429 (rate limit), e network errors.
 * Não retenta em 4xx (exceto 429) — são erros do cliente.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function defaultShouldRetry(error: unknown, _attempt: number): boolean {
  // Network error (fetch failed, timeout, DNS, etc)
  if (error instanceof TypeError && error.message?.includes('fetch')) return true
  if (error instanceof DOMException && error.name === 'AbortError') return false

  // ApiClientError com status
  const status = (error as { status?: number })?.status
  if (typeof status === 'number') {
    // 429 Too Many Requests — retry after backoff
    if (status === 429) return true
    // 5xx Server Error — retry
    if (status >= 500) return true
    // 4xx Client Error — don't retry (except 429)
    return false
  }

  // Unknown error — retry
  return true
}

/**
 * Presets para cenários comuns.
 */
export const retryPresets = {
  /** Para geração IA (longo, tolerante). 3 tentativas, base 2s, max 15s */
  ai: {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 15000,
    jitter: 0.3,
  } satisfies RetryOptions,

  /** Para pagamentos (conservador). 2 tentativas, base 1s, max 4s */
  payment: {
    maxAttempts: 2,
    baseDelay: 1000,
    maxDelay: 4000,
    jitter: 0.2,
  } satisfies RetryOptions,

  /** Para queries normais (rápido). 3 tentativas, base 500ms, max 3s */
  query: {
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 3000,
    jitter: 0.25,
  } satisfies RetryOptions,

  /** Para sync D1 (tolerante a falhas). 4 tentativas, base 1s, max 10s */
  sync: {
    maxAttempts: 4,
    baseDelay: 1000,
    maxDelay: 10000,
    jitter: 0.3,
  } satisfies RetryOptions,
} as const
