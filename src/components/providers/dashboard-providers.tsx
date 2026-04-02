/**
 * src/components/providers/dashboard-providers.tsx
 *
 * Dashboard Providers — providers pesados APENAS para /dashboard/*
 *
 * Exports: DashboardProviders
 * Features: 'use client' · Framer Motion · Auth · OneSignal · Cache
 *
 * Separado do Providers raiz para eliminar ~50-60KB gzipped
 * de JS desnecessário em páginas públicas (/pricing, /, /blog).
 *
 * Nesting:
 *   RootLayout → Providers (QueryProvider + ThemeProvider)
 *     └── DashboardLayout → DashboardProviders (Auth + OneSignal + Motion + Cache)
 */

'use client'

import { AuthProvider } from './auth-provider'
import { OneSignalProvider } from './onesignal-provider'
import { QueryWarmup } from '@/components/cache/query-warmup'
import { CacheEventListener } from '@/components/cache/cache-event-listener'
import { MotionConfig } from 'framer-motion'

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OneSignalProvider>
        <MotionConfig reducedMotion="user">
          <CacheEventListener />
          <QueryWarmup />
          {children}
        </MotionConfig>
      </OneSignalProvider>
    </AuthProvider>
  )
}
