/**
 * src/components/providers/auth-provider.tsx
 *
 * Auth Provider — hydration guard
 *
 * Exports: AuthProvider
 * Hooks: useEffect, useState, useAuthStore
 * Features: Auth: useAuthStore · 'use client'
 */

// ============================================
// Auth Provider — hydration guard
// Espera Zustand rehidratar do localStorage
// antes de renderizar children
// ============================================

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionBoot } from '@/hooks/use-session-boot'
import { flushDebugQueue, initGlobalDebugLogging } from '@/lib/debug-logger'
import { initSentryClient } from '@/lib/sentry-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Validação da sessão (hydration fallback + /auth/me) extraída para o hook —
  // roda também no SplashOrchestrator; guard por token garante 1 fetch por boot.
  useSessionBoot()

  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isSessionReady = useAuthStore((s) => s.isSessionReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Logger global (invisível): captura window errors/unhandledrejection.
  useEffect(() => {
    initSentryClient()
    initGlobalDebugLogging()
  }, [])

  // Flush best-effort quando auth/hydration estiver pronto.
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return
    void flushDebugQueue()

    const t = setInterval(() => {
      void flushDebugQueue()
    }, 30_000)

    return () => clearInterval(t)
  }, [isHydrated, isAuthenticated])

  // Retorna null enquanto não rehydrated/validado — a SplashScreen cobre essa fase.
  // Nunca renderizar spinner aqui, pois a splash já é o loading state visual.
  if (!isHydrated || !isSessionReady) return null

  return <>{children}</>
}
