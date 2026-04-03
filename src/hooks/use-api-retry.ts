/**
 * src/hooks/use-api-retry.ts
 *
 * Hook wrapper que integra withRetry() com chamadas API.
 * Útil para operações críticas (AI generation, payments) que precisam
 * de retry com backoff exponencial.
 *
 * @example
 * ```tsx
 * const generateWithRetry = useApiRetry(retryPresets.ai)
 *
 * const handleGenerate = async () => {
 *   const result = await generateWithRetry(() =>
 *     api.post<WorkoutPlan>('/workouts/generate', payload)
 *   )
 * }
 * ```
 */

'use client'

import { useCallback, useRef } from 'react'
import { withRetry, type RetryOptions } from '@/lib/retry'

// ============================================
// useApiRetry Hook
// ============================================

/**
 * Hook que cria uma função retry-aware para chamadas API.
 * O AbortController é gerenciado automaticamente (cancela no unmount).
 */
export function useApiRetry(defaultOptions?: Partial<RetryOptions>) {
  const abortRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const execute = useCallback(
    async <T>(fn: () => Promise<T>, overrides?: Partial<RetryOptions>): Promise<T> => {
      // Cancel any in-flight retry
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        return await withRetry(fn, {
          ...defaultOptions,
          ...overrides,
          signal: controller.signal,
        })
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
      }
    },
    [defaultOptions]
  )

  return { execute, cancel: cleanup }
}
