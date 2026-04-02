/**
 * src/components/pwa/sw-register.tsx
 *
 * Service Worker Registration — Enhanced
 *
 * Exports: ServiceWorkerRegistration
 * Hooks: useEffect
 * Features: 'use client'
 */

// ============================================
// Service Worker Registration — Enhanced
// OneSignal SDK handles the actual registration of
// OneSignalSDKWorker.js — we only check for updates.
// ============================================

'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let visibilityHandler: (() => void) | null = null
    let revalidateInterval: ReturnType<typeof setInterval> | null = null

    const sendMessage = async (type: 'REVALIDATE_SHELL') => {
      const reg = await navigator.serviceWorker.getRegistration('/')
      const sw = reg?.active || navigator.serviceWorker.controller
      if (!sw) return

      const channel = new MessageChannel()
      const done = new Promise<void>((resolve) => {
        channel.port1.onmessage = () => resolve()
        setTimeout(() => resolve(), 1500)
      })

      sw.postMessage({ type }, [channel.port2])
      await done
    }

    const setupServiceWorker = async () => {
      try {
        // Prefer existing root registration; otherwise register explicitly.
        // This keeps offline/PWA working even if OneSignal page SDK is blocked.
        const existing = await navigator.serviceWorker.getRegistration('/')
        const reg =
          existing ||
          (await navigator.serviceWorker.register('/OneSignalSDKWorker.js', {
            scope: '/',
          }))

        console.log('[SW] Ready:', reg.scope)

        // Revalidação silenciosa inicial (best-effort)
        void sendMessage('REVALIDATE_SHELL')

        // Revalidação ao voltar foco para manter shell atual sem alerta visual
        visibilityHandler = () => {
          if (document.visibilityState === 'visible') {
            void sendMessage('REVALIDATE_SHELL')
          }
        }
        document.addEventListener('visibilitychange', visibilityHandler)

        // Revalidação leve periódica (6h)
        revalidateInterval = setInterval(() => {
          void sendMessage('REVALIDATE_SHELL')
        }, 6 * 60 * 60 * 1000)
      } catch (err) {
        console.warn('[SW] Setup failed:', err)
      }
    }

    const timer = setTimeout(setupServiceWorker, 1200)
    return () => {
      clearTimeout(timer)
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
      }
      if (revalidateInterval) {
        clearInterval(revalidateInterval)
      }
    }
  }, [])

  return null
}
