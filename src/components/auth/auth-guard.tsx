/**
 * src/components/auth/auth-guard.tsx
 *
 * Auth Guard — redireciona para login se não autenticado
 *
 * Exports: AuthGuard, GuestGuard
 * Hooks: useCallback, useEffect, useRouter, useAuthStore
 * Features: Auth: useAuthStore · 'use client'
 */

// ============================================
// Auth Guard — redireciona para login se não autenticado
// Usado como wrapper em páginas protegidas
// ============================================

'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { PageLoader } from '@/components/ui'

interface AuthGuardProps {
  children: React.ReactNode
  requiredType?: 'personal' | 'student' | 'admin'
}

export function AuthGuard({ children, requiredType }: AuthGuardProps) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)

  const hasRequiredAccess = useCallback(() => {
    if (!requiredType) return true

    if (requiredType === 'admin') {
      return user?.role === 'admin' || user?.role === 'super_admin'
    }

    const isPrivileged = user?.role === 'admin' || user?.role === 'super_admin'
    return user?.user_type === requiredType || isPrivileged
  }, [requiredType, user?.role, user?.user_type])

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // Admin e super_admin podem acessar qualquer tipo de página
    if (!hasRequiredAccess()) {
      // Students → /treinos (B2C home), others → /dashboard
      router.replace(user?.user_type === 'student' ? '/treinos' : '/dashboard')
    }
  }, [isAuthenticated, isHydrated, hasRequiredAccess, user?.user_type, router])

  if (!isHydrated) return <PageLoader />
  if (!isAuthenticated) return <PageLoader />
  if (!hasRequiredAccess()) return <PageLoader />

  return <>{children}</>
}

// ============================================
// Guest Guard — redireciona para dashboard se já autenticado
// Usado em páginas de auth (login, register)
// ============================================

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!isHydrated) return
    if (isAuthenticated) {
      const dest = user?.role === 'admin' || user?.role === 'super_admin' ? '/dashboard/admin' : '/dashboard'
      router.replace(dest)
    }
  }, [isAuthenticated, isHydrated, user, router])

  if (!isHydrated) return <PageLoader />
  if (isAuthenticated) return <PageLoader />

  return <>{children}</>
}
