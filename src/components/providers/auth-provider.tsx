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

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { flushDebugQueue, initGlobalDebugLogging } from '@/lib/debug-logger'
import { initSentryClient } from '@/lib/sentry-client'
import { api, ApiClientError } from '@/lib/api-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [isSessionChecked, setIsSessionChecked] = useState(false)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setHydrated = useAuthStore((s) => s.setHydrated)
  const setSessionReady = useAuthStore((s) => s.setSessionReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const tokens = useAuthStore((s) => s.tokens)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    // Zustand persist fires onRehydrateStorage, but we also
    // set a timeout fallback to avoid infinite loading
    const timeout = setTimeout(() => {
      if (!isReady) {
        setHydrated()
        setIsReady(true)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [isReady, setHydrated])

  useEffect(() => {
    if (isHydrated) {
      setIsReady(true)
    }
  }, [isHydrated])

  // Validação estrutural da sessão persistida (cookie/localStorage):
  // se usuário foi deletado/desativado, derruba sessão local imediatamente.
  useEffect(() => {
    if (!isHydrated) return

    let cancelled = false
    setIsSessionChecked(false)
    setSessionReady(false)

    async function validatePersistedSession() {
      if (!isAuthenticated || !tokens?.access_token) {
        if (!cancelled) {
          setIsSessionChecked(true)
          setSessionReady()
        }
        return
      }

      try {
        await api.get('/auth/me')
      } catch (err) {
        const status = err instanceof ApiClientError ? err.status : 0
        // Sessão inválida estruturalmente (user deletado/inativo/token inválido)
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setIsSessionChecked(true)
          setSessionReady()
        }
      }
    }

    void validatePersistedSession()

    return () => {
      cancelled = true
    }
  }, [isHydrated, isAuthenticated, tokens?.access_token, tokens?.refresh_token, logout, setSessionReady])

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

  // Retorna null enquanto não rehydrated — a SplashScreen cobre essa fase.
  // Nunca renderizar spinner aqui, pois a splash já é o loading state visual.
  if (!isReady || !isSessionChecked) return null

  return <>{children}</>
}
