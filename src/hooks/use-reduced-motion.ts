/**
 * src/hooks/use-reduced-motion.ts
 *
 * Hook para detectar prefers-reduced-motion do sistema.
 * Reutilizável em qualquer componente que tenha animações.
 *
 * @example
 * ```tsx
 * const prefersReduced = useReducedMotion()
 * // Desabilitar animação ou usar duração 0
 * const duration = prefersReduced ? 0 : 300
 * ```
 */

'use client'

import { useEffect, useState } from 'react'

// ============================================
// useReducedMotion Hook
// ============================================

/**
 * Retorna `true` se o usuário prefere motion reduzido.
 * Reage a mudanças em tempo real (ex: usuário ativa/desativa nas configurações).
 *
 * SSR-safe: retorna `false` no servidor.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
