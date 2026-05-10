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
    gtag?: (...args: unknown[]) => void
  }
}

export const GA_ID = 'G-XGXZ4R6JXH'

type GA4Document = Pick<Document, 'createElement' | 'querySelector'> & {
  head: Pick<HTMLHeadElement, 'appendChild'>
}

type GA4Window = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export function installDeferredGA4Script(doc: GA4Document, win: GA4Window) {
  win.dataLayer = win.dataLayer || []
  win.gtag = win.gtag || function gtag(...args: unknown[]) {
    win.dataLayer?.push(args)
  }

  const existingScript = doc.querySelector<HTMLScriptElement>(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"]`
  )
  if (!existingScript) {
    const script = doc.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    doc.head.appendChild(script)
  }

  win.gtag('js', new Date())
  win.gtag('config', GA_ID)
}

export function DeferredGA4() {
  useEffect(() => {
    let loaded = false

    function loadGA() {
      if (loaded) return
      loaded = true

      // Remove listeners immediately
      const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'] as const
      events.forEach(e => window.removeEventListener(e, loadGA, { capture: true }))

      installDeferredGA4Script(document, window)
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
