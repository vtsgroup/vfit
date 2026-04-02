// ============================================
// use-scroll-lock.ts — Lock do scroll do body para modais/overlays
// ============================================
//
// O que faz:
//   Bloqueia o scroll do body quando um modal ou overlay está aberto.
//   Usa contador para suportar modais aninhados com segurança.
//   Preserva posição do scroll e previne iOS bounce.
//
// Exports principais:
//   useScrollLock(locked: boolean) → void
//
// Hooks usados: useEffect
// ============================================
import { useEffect } from 'react'

/**
 * Lock body scroll when a modal/overlay is open.
 * Uses counter to handle nested modals safely.
 * Preserves scroll position and prevents iOS bounce.
 */
let lockCount = 0

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    lockCount++
    const scrollY = window.scrollY

    // Apply lock styles
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'

    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [locked])
}
