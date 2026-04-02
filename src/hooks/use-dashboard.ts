/**
 * src/hooks/use-dashboard.ts
 *
 * Dashboard hooks — TanStack Query
 *
 * Exports: PersonalStats, PaymentStats, RecentPayment, RecentStudent, NotificationCount
 * Hooks: useQuery, useAuthStore, usePersonalStats, usePaymentStats, useRecentPayments, useRecentStudents
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Dashboard hooks — TanStack Query
// ============================================

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

// ============================================
// Types
// ============================================

export interface PersonalStats {
  subscription: {
    plan: string
    status: string
    trial_ends_at: string | null
    expires_at: string | null
  }
  students: {
    total: number
    active: number
    by_status: Record<string, number>
    by_payment: Record<string, number>
  }
  revenue: {
    total: number
  }
  referral_code: string
  workouts_completed_by_students: number
  weekly_workouts: Array<{
    week: string
    created: number
    completed: number
  }>
}

export interface PaymentStats {
  summary: {
    total_revenue: number
    total_received: number
    total_pending: number
    total_overdue: number
    total_platform_fees: number
    total_commissions: number
    payment_count: number
  }
  monthly_revenue: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export interface RecentPayment {
  id: string
  amount: number
  status: string
  payment_method: string
  due_date: string | null
  paid_at: string | null
  description: string | null
  payer_name: string
  created_at: string
}

export interface RecentStudent {
  id: string
  full_name: string
  email: string
  profile_photo_url: string | null
  status: string
  payment_status: string
  created_at: string
}

export interface NotificationCount {
  count: number
}

// ============================================
// Hooks
// ============================================

export function usePersonalStats() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })
  return useQuery<PersonalStats>({
    queryKey: ['personal', 'stats'],
    queryFn: async () => {
      const res = await api.get<PersonalStats>('/personals/stats')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

export function usePaymentStats() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })
  return useQuery<PaymentStats>({
    queryKey: ['payments', 'stats'],
    queryFn: async () => {
      const res = await api.get<PaymentStats>('/payments/stats')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

export function useRecentPayments(limit = 5) {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })
  return useQuery<{ payments: RecentPayment[]; meta: { total: number } }>({
    queryKey: ['payments', 'recent', limit],
    queryFn: async () => {
      const res = await api.get<{ payments: RecentPayment[]; meta: { total: number } }>(
        `/payments?per_page=${limit}&sort=created_at&order=desc`
      )
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useRecentStudents(limit = 5) {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })
  return useQuery<{ students: RecentStudent[]; meta: { total: number } }>({
    queryKey: ['students', 'recent', limit],
    queryFn: async () => {
      const res = await api.get<{ students: RecentStudent[]; meta: { total: number } }>(
        `/students?per_page=${limit}&sort=created_at&order=desc`
      )
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useUnreadNotifications() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<NotificationCount>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get<NotificationCount>('/notifications/unread-count')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.realtime,
    refetchInterval: isReady ? 30_000 : false, // Poll every 30s only when authenticated
  })
}
