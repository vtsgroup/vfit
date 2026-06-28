/**
 * src/components/auth/dashboard-auth-gate.tsx
 *
 * Dashboard Auth Gate — Portão de autenticação no nível do layout
 *
 * Bloqueia TODA renderização do dashboard (sidebar, header, conteúdo)
 * até que a sessão esteja hidratada e autenticada.
 * Se não autenticado → redirect para /login sem mostrar UI alguma.
 *
 * Exports: DashboardAuthGate
 * Hooks: useEffect, useAuthStore, useRouter
 * Features: 'use client'
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useSyncOnboarding } from '@/hooks/use-sync-onboarding'

/**
 * Tela de transição calma durante hydration/redirect.
 *
 * Enquanto a splash não terminou (isSplashFinished=false) ela é o ÚNICO loading
 * visível e fica no topo do z-index → aqui retornamos `null` (invisível por baixo
 * da splash opaca). Depois que a splash sai, mostramos só um fundo on-brand com
 * o texto — SEM anel girando. Era o anel redondo aqui que aparecia como "loading
 * antigo por de trás" da nova splash.
 */
function GateFallback({ label }: { label: string }) {
  const isSplashFinished = useAuthStore((s) => s.isSplashFinished)
  if (!isSplashFinished) return null
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-dark">
      <p className="text-sm font-medium text-white/40">{label}</p>
    </div>
  )
}

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const userType = useAuthStore((s) => s.user?.user_type)

  // Sincronizar dados do onboarding quiz com backend (se pendentes)
  useSyncOnboarding()

  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    // Students should use B2C routes, not dashboard
    if (userType === 'student') {
      router.replace('/treinos')
    }
  }, [isAuthenticated, isHydrated, userType, router])

  // Enquanto não hidratou → coberto pela splash (null) ou fundo calmo pós-splash
  if (!isHydrated) return <GateFallback label="Verificando sessão..." />

  // Não autenticado → redirect em andamento
  if (!isAuthenticated) return <GateFallback label="Redirecionando..." />

  // Student autenticado vindo do PWA/start_url não deve ver shell do dashboard.
  if (userType === 'student') return <GateFallback label="Abrindo app do aluno..." />

  return <>{children}</>
}
