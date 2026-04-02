/**
 * src/components/pwa/update-banner.tsx
 *
 * PWA Update Banner — Prompts user to reload
 *
 * Exports: PwaUpdateBanner
 * Hooks: useState, useEffect, useRef
 * Features: 'use client' · DSIcon
 */

// ============================================
// PWA Update Banner — Prompts user to reload
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

export function PwaUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Ignore "updates" within first 15 seconds — these are just
            // OneSignal re-registering the SW with query params on page load
            const elapsed = Date.now() - mountedAt.current
            if (elapsed > 15_000) {
              setShowUpdate(true)
            }
          }
        })
      })
    })
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    // Reload after a brief delay to let SW activate
    setTimeout(() => window.location.reload(), 500)
  }

  if (!showUpdate) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-9998 animate-slide-down"
      style={{ top: 'calc(var(--demo-banner-offset, 0px) + 1rem)' }}
    >
      <div className="rounded-xl bg-bg-dark-secondary/95 backdrop-blur-2xl border border-white/8 px-4 py-3 shadow-[0_4px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20">
          <DSIcon name="refresh" size={16} className="text-brand-primary" />
        </div>
        <p className="text-sm text-white">
          Nova versão disponível!
        </p>
        <button
          onClick={handleUpdate}
          className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-bg-dark hover:bg-brand-primary-hover transition-colors"
        >
          Atualizar
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="p-1 text-zinc-500 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <DSIcon name="close" size={14} />
        </button>
      </div>
    </div>
  )
}
