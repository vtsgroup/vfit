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

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

const GA_ID = 'G-XGXZ4R6JXH'

export function DeferredGA4() {
  useEffect(() => {
    let loaded = false

    function loadGA() {
      if (loaded) return
      loaded = true

      // Remove listeners immediately
      const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'] as const
      events.forEach(e => window.removeEventListener(e, loadGA, { capture: true }))

      // Inject gtag.js script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      script.async = true
      document.head.appendChild(script)

      // Initialize dataLayer + gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', GA_ID)
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

  return null
}
