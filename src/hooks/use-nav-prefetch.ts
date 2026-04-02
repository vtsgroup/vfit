// ============================================
// Hook: useNavPrefetch — prefetch de dados no hover dos links de navegação
// ============================================

'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api-client'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

// Mapeamento de rota → queries para prefetch.
// queryKey deve bater exatamente com o usado nos hooks TanStack Query da rota.
// prefetchQuery é no-op se os dados já estiverem frescos (staleTime).
const ROUTE_PREFETCH: Record<string, Array<{ queryKey: unknown[]; queryFn: () => Promise<unknown>; staleTime: number }>> = {
  '/dashboard/students': [
    {
      queryKey: ['students', {}],
      queryFn: () => api.get('/students').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.list.staleTime,
    },
  ],
  '/dashboard/workouts': [
    {
      queryKey: ['workouts', {}],
      queryFn: () => api.get('/workouts').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.list.staleTime,
    },
  ],
  '/dashboard/payments': [
    {
      queryKey: ['payments', {}],
      queryFn: () => api.get('/payments').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.list.staleTime,
    },
    {
      queryKey: ['payments', 'stats'],
      queryFn: () => api.get('/payments/stats').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.stats.staleTime,
    },
  ],
  '/dashboard/financeiro': [
    {
      queryKey: ['payments', 'stats'],
      queryFn: () => api.get('/payments/stats').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.stats.staleTime,
    },
  ],
  '/dashboard/assessments': [
    {
      queryKey: ['assessments', {}],
      queryFn: () => api.get('/assessments').then((r) => r.data),
      staleTime: APP_QUERY_CACHE.list.staleTime,
    },
  ],
}

export function useNavPrefetch() {
  const queryClient = useQueryClient()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useCallback(
    (href: string) => {
      if (!isReady) return
      const configs = ROUTE_PREFETCH[href]
      if (!configs) return
      for (const config of configs) {
        void queryClient.prefetchQuery(config)
      }
    },
    [queryClient, isReady],
  )
}
