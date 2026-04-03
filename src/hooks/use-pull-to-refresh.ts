// ============================================
// use-pull-to-refresh.ts — Pull-to-refresh (T9.8)
// ============================================
//
// O que faz:
//   Hook que detecta gesto de pull-to-refresh em dispositivos touch.
//   Chama `onRefresh` quando o usuário puxa a tela para baixo com
//   distância >= threshold.
//
// Exports principais:
//   usePullToRefresh({ onRefresh, threshold?, disabled? })
//   → { isPulling, pullDistance }
//
// Uso:
//   const { isPulling } = usePullToRefresh({
//     onRefresh: () => queryClient.invalidateQueries({ queryKey: ['treinos'] }),
//   })
// ============================================

'use client'

import { useEffect, useRef, useState } from 'react'

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  /** Distância em px para disparar o refresh (padrão: 72) */
  threshold?: number
  /** Desabilita o gesto (ex: quando algum modal está aberto) */
  disabled?: boolean
}

export interface UsePullToRefreshResult {
  /** Se o usuário está puxando atualmente */
  isPulling: boolean
  /** Distância de arraste atual em px */
  pullDistance: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef(0)
  const isActiveRef = useRef(false)
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (disabled) return

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        startYRef.current = e.touches[0].clientY
        isActiveRef.current = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isActiveRef.current || refreshingRef.current) return
      const dist = e.touches[0].clientY - startYRef.current
      if (dist > 0) {
        // Dampen pull feel: full resistance after 2× threshold
        const damped = Math.min(dist * 0.5, threshold * 1.4)
        setPullDistance(damped)
        if (dist > 12) setIsPulling(true)
      } else {
        setPullDistance(0)
        setIsPulling(false)
      }
    }

    const onTouchEnd = async () => {
      if (!isActiveRef.current) return
      isActiveRef.current = false

      const currentDist = pullDistance
      setIsPulling(false)
      setPullDistance(0)

      if (currentDist >= threshold && !refreshingRef.current) {
        refreshingRef.current = true
        try {
          await onRefresh()
        } finally {
          refreshingRef.current = false
        }
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [disabled, threshold, onRefresh, pullDistance])

  return { isPulling, pullDistance }
}
