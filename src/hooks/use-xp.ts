/**
 * src/hooks/use-xp.ts
 *
 * React Query hooks para XP economy
 * - useXPBalance: saldo atual
 * - useXPHistory: histórico de transações
 * - useXPLimits: status de limites diários
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export interface XPBalance {
  balance: number
  level: number
  total_earned: number
  total_spent: number
  next_level_threshold: number
  last_transaction_at?: string
  transaction_count: number
}

export interface XPTransaction {
  id: string
  event_type: string
  amount: number
  direction: 'credit' | 'debit'
  created_at: string
  expires_at?: string
  notes?: string
  reference_type?: string
  metadata?: Record<string, unknown>
}

export interface XPHistoryResponse {
  transactions: XPTransaction[]
  pagination: {
    limit: number
    offset: number
  }
}

export interface XPLimit {
  event_type: string
  current_count: number
  limit: number
  allowed: boolean
  remaining: number
}

export interface XPLimitsResponse {
  limits: XPLimit[]
  reset_at: string
}

/**
 * Get current XP balance
 */
export function useXPBalance() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'balance'],
    queryFn: async () => {
      const response = await api.get<XPBalance>('/xp/balance')
      return response.data
    },
    enabled: isReady,
    staleTime: 60_000, // 1 minute (backend cached in KV for 5m)
    gcTime: 10 * 60_000, // 10 minutes
    placeholderData: (prev: XPBalance | undefined) => prev, // Keep old data while refetching
  })
}

/**
 * Get XP transaction history
 */
export function useXPHistory(limit = 50, offset = 0) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'history', { limit, offset }],
    queryFn: async () => {
      const response = await api.get<XPHistoryResponse>(
        `/xp/history?limit=${limit}&offset=${offset}`
      )
      return response.data
    },
    enabled: isReady,
    staleTime: 2 * 60_000, // 2 minutes
    gcTime: 10 * 60_000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Get daily limit status
 */
export function useXPLimits() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'limits'],
    queryFn: async () => {
      const response = await api.get<XPLimitsResponse>('/xp/limits')
      return response.data
    },
    enabled: isReady,
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 15 * 60_000, // 15 minutes
    refetchInterval: 60_000, // Refetch every 1 minute to update reset_at
  })
}

/**
 * Get student's XP balance (Personal only)
 */
export function useStudentXPBalance(studentId: string) {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery({
    queryKey: ['xp', 'student', studentId, 'balance'],
    queryFn: async () => {
      const response = await api.get<XPBalance>(`/xp/student/${studentId}/balance`)
      return response.data
    },
    enabled: isReady && !!studentId,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
  })
}

/**
 * Reverse a transaction (admin function)
 */
export function useReverseXPTransaction() {
  return useMutation({
    mutationFn: async (data: { transaction_id: string; reason: string }) => {
      const response = await api.post('/xp/admin/reverse', data)
      return response
    },
  })
}

// ============================================
// DAILY GOALS
// ============================================

export interface DailyGoalResponse {
  goal_date: string
  target_xp: number
  earned_xp: number
  progress: number
  completed: boolean
  completed_at: string | null
  workouts_target: number
  workouts_done: number
}

export interface GoalHistoryResponse {
  goals: Array<{
    goal_date: string
    target_xp: number
    earned_xp: number
    completed: boolean
    completed_at: string | null
    workouts_done: number
  }>
  summary: {
    days_tracked: number
    days_completed: number
    completion_rate: number
    total_xp_earned: number
  }
}

/**
 * Get today's daily goal
 */
export function useDailyGoal() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'goals', 'today'],
    queryFn: async () => {
      const response = await api.get<DailyGoalResponse>('/xp/goals/today')
      return response.data
    },
    enabled: isReady,
    staleTime: 15_000, // 15 seconds — changes often
    gcTime: 5 * 60_000,
    refetchInterval: 30_000, // Refetch every 30s to show live progress
    placeholderData: (prev: DailyGoalResponse | undefined) => prev, // Smooth updates
  })
}

/**
 * Get daily goal history (last N days)
 */
export function useGoalHistory(days = 7) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'goals', 'history', days],
    queryFn: async () => {
      const response = await api.get<GoalHistoryResponse>(`/xp/goals/history?days=${days}`)
      return response.data
    },
    enabled: isReady,
    staleTime: 2 * 60_000, // 2 minutes
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })
}

// ============================================
// STREAK
// ============================================

export interface StreakResponse {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_started_at: string | null
  freeze_count: number
  max_freezes: number
  next_milestone: number | null
  progress_to_next: number
  milestones: Array<{
    days: number
    achieved_at: string
    xp_awarded: number
  }>
}

/**
 * Get current streak info
 */
export function useStreak() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'streak'],
    queryFn: async () => {
      const response = await api.get<StreakResponse>('/xp/streak')
      return response.data
    },
    enabled: isReady,
    staleTime: 60_000, // 1 minute (backend cached in KV for 10m)
    gcTime: 10 * 60_000,
    placeholderData: (prev: StreakResponse | undefined) => prev,
  })
}

/**
 * Get student's streak (Personal only)
 */
export function useStudentStreak(studentId: string) {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery({
    queryKey: ['xp', 'student', studentId, 'streak'],
    queryFn: async () => {
      const response = await api.get<StreakResponse>(`/xp/student/${studentId}/streak`)
      return response.data
    },
    enabled: isReady && !!studentId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

// ============================================
// EXPIRATION
// ============================================

export interface ExpiringTransaction {
  id: string
  amount: number
  event_type: string
  expires_at: string
  days_until_expiry: number
}

export interface ExpiringXPResponse {
  expiring_transactions: ExpiringTransaction[]
  total_expiring_xp: number
  check_window_days: number
}

/**
 * Get XP expiring soon
 */
export function useExpiringXP(daysAhead = 7) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['xp', 'expiring', daysAhead],
    queryFn: async () => {
      const response = await api.get<ExpiringXPResponse>(`/xp/expiring?days=${daysAhead}`)
      return response.data
    },
    enabled: isReady,
    staleTime: 10 * 60_000, // 10 minutes — doesn't change often
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
}
