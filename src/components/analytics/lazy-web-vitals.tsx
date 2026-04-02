// ============================================
// lazy-web-vitals.tsx — Lazy wrapper para WebVitalsTracker
// ============================================
//
// Perf: WebVitalsTracker renderiza null (side-effect only).
//       Lazy load com ssr:false para não impactar LCP/TBT.
'use client'

import dynamic from 'next/dynamic'

const WebVitalsTracker = dynamic(
  () =>
    import('@/components/analytics/web-vitals-tracker').then((m) => ({
      default: m.WebVitalsTracker,
    })),
  { ssr: false }
)

export function LazyWebVitals() {
  return <WebVitalsTracker />
}
