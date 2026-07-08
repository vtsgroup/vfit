/**
 * src/hooks/use-session-boot.ts
 *
 * useSessionBoot — validação estrutural da sessão persistida no boot.
 *
 * Extraído do AuthProvider (plano splash-boot, 2026-07-08) para rodar também em
 * superfícies SEM AuthProvider (welcome/login via SplashOrchestrator). Vários
 * mounts simultâneos → UMA execução por token (guard em module-scope), mas o
 * token MUDAR (login/refresh/logout) revalida — semântica original preservada.
 *
 * O resultado vai para o store global (isSessionReady), nunca para estado local:
 * qualquer consumidor (splash, gates, providers) lê do mesmo lugar.
 *
 * Exports: useSessionBoot
 * Hooks: useEffect, useAuthStore
 * Features: 'use client'
 */

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api, ApiClientError } from '@/lib/api-client'

// Guard: chave do token já validado/em validação. Module-scope de propósito —
// AuthProvider + SplashOrchestrator montados juntos disparam 1 fetch, não 2.
let claimedKey: string | null = null

/** Reset do guard — apenas para testes. */
export function __resetSessionBootGuard() {
  claimedKey = null
}

export function useSessionBoot() {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.tokens?.access_token)

  // Fallback de hydration: onRehydrateStorage do zustand/persist pode não disparar
  // (storage bloqueado) — nunca prender o boot por isso.
  useEffect(() => {
    const t = setTimeout(() => {
      const s = useAuthStore.getState()
      if (!s.isHydrated) s.setHydrated()
    }, 1000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const key = accessToken || 'anon'
    if (claimedKey === key) return
    claimedKey = key

    const { setSessionReady, logout } = useAuthStore.getState()

    // Sem sessão persistida → pronto imediatamente (welcome/login não esperam rede)
    if (!isAuthenticated || !accessToken) {
      setSessionReady()
      return
    }

    // Token mudou → sessão volta a "não verificada" até o /auth/me responder
    setSessionReady(false)

    void (async () => {
      try {
        await api.get('/auth/me')
      } catch (err) {
        const status = err instanceof ApiClientError ? err.status : 0
        // Sessão estruturalmente inválida (user deletado/inativo/token inválido)
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          logout()
        }
        // Falha de rede/5xx → mantém sessão em cache (offline-first)
      } finally {
        // Só marca pronto se esta validação ainda é a corrente: se o token mudou
        // no meio do voo (login/refresh durante o boot), a validação NOVA já
        // resetou isSessionReady(false) e é ela quem deve concluir — sem este
        // guard, a validação antiga marcaria pronto prematuramente (race que o
        // `cancelled` do AuthProvider original prevenia).
        if (claimedKey === key) useAuthStore.getState().setSessionReady()
      }
    })()
  }, [isHydrated, isAuthenticated, accessToken])
}
