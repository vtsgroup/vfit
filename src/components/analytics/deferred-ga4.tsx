/**
 * src/components/analytics/deferred-ga4.tsx
 *
 * Deferred GA4 Loader — carrega gtag.js SOMENTE após 1ª interação do usuário
 *
 * Por quê: GoogleAnalytics do @next/third-parties injeta gtag.js (~150 KiB) eagerly,
 * causando 60+ KiB de "unused JS" no PSI. Deferindo até scroll/click/touchstart/mousemove,
 * eliminamos esse peso da métrica TBT/LCP sem perder pageview (99% dos usuários interagem).
 *
 * Exports: DeferredGA4
 */

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    __ga4Ready?: boolean
  }
}

const GA_ID = 'G-XGXZ4R6JXH'

export function DeferredGA4() {
  const pathname = usePathname()
  const lastTrackedPathRef = useRef<string | null>(null)

  useEffect(() => {
    let loaded = false

    function loadGA() {
      if (loaded) return
      loaded = true

      if (window.__ga4Ready) return

      // Remove listeners immediately
      const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'] as const
      events.forEach(e => window.removeEventListener(e, loadGA, { capture: true }))

      // Ensure queue is compatible with gtag.js replay (array commands only)
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer = window.dataLayer.filter((entry) => Array.isArray(entry))
      }

      // Inject gtag.js script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      script.async = true
      document.head.appendChild(script)

      // Initialize dataLayer + gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = (...args: unknown[]) => {
        window.dataLayer.push(args)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_ID)
      window.gtag('event', 'page_view', {
        page_path: `${window.location.pathname}${window.location.search || ''}`,
        page_location: window.location.href,
        page_title: document.title,
      })
      window.__ga4Ready = true
    }

    // Listen for first interaction
    const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'] as const
    events.forEach(e =>
      window.addEventListener(e, loadGA, { once: true, capture: true, passive: true })
    )

    // Fallback: load after 5 seconds idle (bots/users who don't interact)
    const timer = setTimeout(loadGA, 5000)

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, loadGA, { capture: true }))
    }
  }, [])

  useEffect(() => {
    const pagePath = `${pathname}${window.location.search || ''}`

    if (lastTrackedPathRef.current === pagePath) return
    lastTrackedPathRef.current = pagePath

    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return null
}
