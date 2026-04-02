/**
 * src/components/providers/index.tsx
 *
 * Root Providers — composição LEVE para todas as rotas
 *
 * Exports: Providers
 * Features: 'use client'
 *
 * IMPORTANTE: Providers pesados (AuthProvider, OneSignalProvider, MotionConfig,
 * CacheEventListener, QueryWarmup) foram movidos para DashboardProviders
 * (src/components/providers/dashboard-providers.tsx) — carregados APENAS no /dashboard/*.
 *
 * Isso elimina ~50-60KB gzipped de JS desnecessário em páginas públicas
 * (/pricing, /, /blog, etc.) e remove o spinner de loading do AuthProvider
 * que bloqueava FCP/LCP em todas as rotas.
 */

// ============================================
// Root Providers — LEVE (QueryProvider + ThemeProvider + Cookie)
// ============================================

'use client'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import dynamic from 'next/dynamic'

// CookieConsentBanner: invisible until 1.5s delay, no first-paint impact
const CookieConsentBanner = dynamic(
  () => import('@/components/ui/cookie-consent').then(m => ({ default: m.CookieConsentBanner })),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        <CookieConsentBanner />
      </ThemeProvider>
    </QueryProvider>
  )
}
