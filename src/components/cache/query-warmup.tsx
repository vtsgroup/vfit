// ============================================
// query-warmup.tsx — Pré-aquecimento de queries TanStack Query no login
// ============================================
//
// O que faz:
//   Componente cliente que dispara prefetch de queries críticas após login.
//   Pré-aquece: lista de alunos, notificações, dados admin (se admin).
//   Roda uma única vez por sessão via useRef(false) para evitar duplicatas.
//   Renderiza null — montado em DashboardLayout após autenticação.
//
// Auth: lê useAuthStore (userId, userType)
//
// Exports principais:
//   QueryWarmup — componente de pré-aquecimento de cache (renderiza null)
'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import type { StudentListResponse } from '@/hooks/use-students'
import type { NotificationsResponse } from '@/hooks/use-student-app'
import type { AdminStats, AdminUser } from '@/hooks/use-admin'

interface WarmupPaginatedMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export function QueryWarmup() {
  const queryClient = useQueryClient()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const user = useAuthStore((s) => s.user)
  const warmedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isReady || !user) {
      warmedForRef.current = null
      return
    }

    const warmupId = `${user.id}:${user.user_type}:${user.role}`

    const runWarmup = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      void queryClient.prefetchQuery<{ unread_count: number }>({
        queryKey: ['notifications', 'unread'],
        queryFn: async () => {
          const res = await api.get<{ unread_count: number }>('/notifications/unread-count')
          return res.data
        },
        ...APP_QUERY_CACHE.realtime,
      })

      void queryClient.prefetchQuery<NotificationsResponse>({
        queryKey: ['notifications', { page: 1, per_page: 20 }],
        queryFn: async () => {
          const res = await api.get<NotificationsResponse>('/notifications?page=1&per_page=20')
          return res.data
        },
        ...APP_QUERY_CACHE.list,
      })

      if (user.user_type === 'personal') {
        void queryClient.prefetchQuery<StudentListResponse>({
          queryKey: ['students', {
            page: 1,
            per_page: 20,
            sort: 'created_at',
            order: 'desc',
          }],
          queryFn: async () => {
            const res = await api.get<StudentListResponse>('/students?page=1&per_page=20&sort=created_at&order=desc')
            return res.data
          },
          ...APP_QUERY_CACHE.list,
        })
      }

      if (user.user_type === 'admin' || user.role === 'admin' || user.role === 'super_admin') {
        void queryClient.prefetchQuery<AdminStats>({
          queryKey: ['admin', 'stats'],
          queryFn: async () => {
            const res = await api.get<AdminStats>('/admin/stats')
            return res.data
          },
          ...APP_QUERY_CACHE.stats,
        })

        void queryClient.prefetchQuery<{ users: AdminUser[]; meta: WarmupPaginatedMeta }>({
          queryKey: ['admin', 'users', { page: 1, per_page: 20 }],
          queryFn: async () => {
            const res = await api.get<{ users: AdminUser[]; meta: WarmupPaginatedMeta }>('/admin/users?page=1&per_page=20')
            return res.data
          },
          ...APP_QUERY_CACHE.list,
        })
      }
    }

    if (warmedForRef.current !== warmupId) {
      runWarmup()
      warmedForRef.current = warmupId
    }

    const handleOnline = () => runWarmup()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [isReady, user, queryClient])

  return null
}
