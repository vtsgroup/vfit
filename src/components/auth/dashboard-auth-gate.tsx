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

  // Enquanto não hidratou → tela mínima de loading (sem sidebar/header)
  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" />
          </div>
          <p className="text-sm text-white/40 font-medium">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  // Não autenticado → mostra nada (redirect em andamento)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-brand-primary" />
          </div>
          <p className="text-sm text-white/40 font-medium">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
