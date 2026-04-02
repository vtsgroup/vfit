// ============================================
// web-vitals-tracker.tsx — Coleta e envia Web Vitals para GA4
// ============================================
//
// O que faz:
//   Componente cliente que usa useReportWebVitals (Next.js) para capturar
//   métricas Core Web Vitals (CLS, FCP, FID, INP, LCP, TTFB) e enviá-las
//   ao Google Analytics via gtag('event', 'web_vitals').
//   Renderiza null — sem UI.
//
// Exports principais:
//   WebVitalsTracker — componente de coleta (renderiza null)
'use client'

import { useReportWebVitals } from 'next/web-vitals'

type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void

function sendWebVital(metric: {
  name: string
  value: number
  id: string
  delta: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
}) {
  try {
    const gtag = (window as Window & { gtag?: GtagFn }).gtag
    if (typeof gtag !== 'function') return

    gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating ?? 'unknown',
      metric_navigation_type: metric.navigationType ?? 'unknown',
      non_interaction: true,
    })
  } catch {
    // best-effort analytics
  }
}

export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    sendWebVital({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
    })
  })

  return null
}
