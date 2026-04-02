/**
 * src/components/cache/route-prefetch.tsx
 *
 * RoutePrefetch — Prefetch probable routes after idle
 *
 * Exports: RoutePrefetch
 * Hooks: useEffect, useAuthStore
 * Features: Auth: useAuthStore · 'use client'
 */

// ============================================
// RoutePrefetch — Prefetch probable routes after idle
// Uses requestIdleCallback to avoid blocking LCP
// ============================================

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// Routes most likely navigated to from dashboard (ordered by probability)
const PERSONAL_ROUTES = [
  '/dashboard/students',
  '/dashboard/workouts',
  '/dashboard/payments',
  '/dashboard/assessments',
  '/dashboard/financeiro',
  '/dashboard/messages',
]

const STUDENT_ROUTES = [
  '/dashboard/workouts',
  '/dashboard/assessments',
  '/dashboard/messages',
  '/dashboard/settings',
]

function prefetchRoute(href: string) {
  // Avoid duplicate prefetch links
  if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  link.as = 'document'
  document.head.appendChild(link)
}

export function RoutePrefetch() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const userType = useAuthStore((s) => s.user?.user_type)

  useEffect(() => {
    if (!isReady || !userType) return

    const routes = userType === 'personal' ? PERSONAL_ROUTES : STUDENT_ROUTES

    // Use requestIdleCallback to avoid blocking main thread during initial load
    const idle = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 2000)

    const id = idle(() => {
      // Only prefetch if user has fast connection
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
      if (connection?.saveData) return
      if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return

      routes.forEach(prefetchRoute)
    })

    return () => {
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(id as number)
      }
    }
  }, [isReady, userType])

  return null
}
