/**
 * src/app/(auth)/layout.tsx
 *
 * Auth Layout — Ultra-modern split screen
 *
 * Exports: metadata, AuthLayout
 */

// ============================================
// Auth Layout — Ultra-modern split screen
// Server component for metadata + client layout
// ============================================

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthLayoutClient } from './layout-client'
import { AuthPageProviders } from '@/components/providers/auth-page-providers'
import { SplashOrchestrator } from '@/components/layout/splash-orchestrator'
import { BootResolvedMarker } from '@/components/layout/boot-resolved-marker'

export const metadata: Metadata = {
  robots: 'index, follow',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Splash standalone-only FORA do AuthPageProviders (= AuthProvider, que renderiza
          null até a sessão validar): precisa montar no primeiro paint e existir no HTML
          pré-renderizado. Zustand é singleton global — não depende de Provider React.
          Cobre o hop biométrico welcome → /login?biometric=auto no TWA/PWA; em browser
          comum não participa (CSS pré-paint). Login/register são destinos terminais do
          boot → marker libera a splash. */}
      <SplashOrchestrator standaloneOnly />
      <BootResolvedMarker />
      <AuthPageProviders>
        <AuthLayoutClient>
          <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" /></div>}>
            {children}
          </Suspense>
        </AuthLayoutClient>
      </AuthPageProviders>
    </>
  )
}
