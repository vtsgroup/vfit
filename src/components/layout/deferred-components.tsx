/**
 * src/components/layout/deferred-components.tsx
 *
 * Deferred Components — client wrapper for dynamic imports
 *
 * Exports: DeferredComponents
 * Features: 'use client' · next/dynamic · ssr: false
 *
 * These components are invisible on first paint (return null or conditionally render).
 * Loading them dynamically reduces the initial JS bundle by ~800 lines.
 */

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// ServiceWorkerRegistration: returns null, delayed 1200ms
const ServiceWorkerRegistration = dynamic(
  () => import('@/components/pwa/sw-register').then(m => ({ default: m.ServiceWorkerRegistration })),
  { ssr: false }
)

// OfflineIndicator: returns null when online (99.9% of time)
const OfflineIndicator = dynamic(
  () => import('@/components/pwa/offline-indicator').then(m => ({ default: m.OfflineIndicator })),
  { ssr: false }
)

// PwaDebugPanel: 459 lines, only visible with ?pwa-debug=1
const PwaDebugPanel = dynamic(
  () => import('@/components/pwa/debug-panel').then(m => ({ default: m.PwaDebugPanel })),
  { ssr: false }
)

// ReferralCapture: returns null, just reads URL params
const ReferralCapture = dynamic(
  () => import('@/components/auth/referral-capture').then(m => ({ default: m.ReferralCapture })),
  { ssr: false }
)

// DemoModeBanner: returns null unless API is offline
const DemoModeBanner = dynamic(
  () => import('@/components/ui/demo-mode-banner').then(m => ({ default: m.DemoModeBanner })),
  { ssr: false }
)

// LoadingBar: invisible on initial load, only shows during navigation (imports framer-motion)
const LoadingBar = dynamic(
  () => import('@/components/ui/loading-bar').then(m => ({ default: m.LoadingBar })),
  { ssr: false }
)

export function DeferredComponents() {
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'] as const
    const handler = () => {
      setInteracted(true)
      events.forEach(e => window.removeEventListener(e, handler, { capture: true }))
    }
    events.forEach(e =>
      window.addEventListener(e, handler, { once: true, capture: true, passive: true } as AddEventListenerOptions)
    )
    // No fallback timer — LoadingBar only needed on navigation (user clicks first)
    return () => {
      events.forEach(e => window.removeEventListener(e, handler, { capture: true }))
    }
  }, [])

  return (
    <>
      <DemoModeBanner />
      {interacted && <LoadingBar />}
      <ReferralCapture />
      <PwaDebugPanel />
      <ServiceWorkerRegistration />
      <OfflineIndicator />
    </>
  )
}
