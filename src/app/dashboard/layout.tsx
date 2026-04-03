// ============================================
// layout.tsx — Layout raiz do dashboard
// ============================================
//
// O que faz:
//   Layout de todas as rotas /dashboard/*. Monta DashboardLayout (sidebar + header).
//   Inclui PasskeyPrompt, IOSInstallGate e RoutePrefetch globais.
//   Monta DashboardProviders (AuthProvider, OneSignalProvider, MotionConfig,
//   CacheEventListener, QueryWarmup) — separados do root para performance.
//   Define metadata com robots NO_INDEX.
//
//   SplashOrchestrator fica FORA de DashboardProviders — Zustand é singleton global,
//   não precisa de Provider React. Isso garante que a splash apareça imediatamente,
//   antes mesmo do AuthProvider validar a sessão (que inclui request /auth/me),
//   cobrindo todo o loading state com uma única transição cinematográfica.
//
// Exports principais:
//   metadata — Metadata Next.js (robots: noindex)
//   DashboardRootLayout — layout raiz do dashboard
import type { Metadata } from 'next'
import { DashboardLayout } from '@/components/layout'
import { DashboardProviders } from '@/components/providers/dashboard-providers'
import { PwaInstallProvider } from '@/components/pwa/install-banner'
import { PasskeyPrompt } from '@/components/auth'
import { IOSInstallGate } from '@/components/pwa/ios-install-gate'
import { RoutePrefetch } from '@/components/cache/route-prefetch'
import { DashboardAuthGate } from '@/components/auth/dashboard-auth-gate'
import { SplashOrchestrator } from '@/components/layout/splash-orchestrator'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* SplashOrchestrator FORA de DashboardProviders — Zustand é singleton global,
          não precisa de Provider React. Isso garante que a splash apareça imediatamente,
          antes mesmo do AuthProvider validar a sessão, cobrindo todo o loading state. */}
      <SplashOrchestrator />
      <DashboardProviders>
        <DashboardAuthGate>
          <PwaInstallProvider>
            <DashboardLayout>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <PasskeyPrompt />
              <IOSInstallGate />
              <RoutePrefetch />
            </DashboardLayout>
          </PwaInstallProvider>
        </DashboardAuthGate>
      </DashboardProviders>
    </>
  )
}
