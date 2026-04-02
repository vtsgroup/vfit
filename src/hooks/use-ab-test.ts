// ============================================
// use-ab-test.ts — Teste A/B com persistência em cookie/localStorage
// ============================================
//
// O que faz:
//   Atribui uma variante aleatória ao usuário e persiste entre sessões
//   via cookie + localStorage. Dispara evento GA4 com testId e variante.
//
// Exports principais:
//   useABTest({ testId, variants }) → string — variante ativa do usuário
//
// Hooks usados: useState, useEffect, useMemo
// ============================================
'use client'

import { useEffect, useMemo, useState } from 'react'

interface UseABTestParams {
  testId: string
  variants: readonly string[]
}

function pickVariant(variants: readonly string[]) {
  const idx = Math.floor(Math.random() * variants.length)
  return variants[idx] ?? variants[0]
}

export function useABTest({ testId, variants }: UseABTestParams): string {
  const key = useMemo(() => `ab_${testId}`, [testId])
  const [variant, setVariant] = useState<string>(variants[0] ?? 'A')

  useEffect(() => {
    if (typeof window === 'undefined' || variants.length === 0) return

    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${key}=`))
      ?.split('=')[1]

    const stored = cookieMatch || localStorage.getItem(key)
    const assigned = stored && variants.includes(stored) ? stored : pickVariant(variants)

    document.cookie = `${key}=${assigned}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`
    localStorage.setItem(key, assigned)
    setVariant(assigned)

    try {
      const gtag = (window as Window & {
        gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
      }).gtag

      if (typeof gtag === 'function') {
        gtag('event', 'ab_test_impression', {
          test_id: testId,
          variant: assigned,
          page_path: window.location.pathname,
          non_interaction: true,
        })
      }
    } catch {
      // best-effort analytics
    }
  }, [key, testId, variants])

  return variant
}
