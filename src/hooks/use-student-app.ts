/**
 * src/hooks/use-student-app.ts
 *
 * Student Dashboard hooks — TanStack Query
 *
 * Exports: StudentProfile, StudentWorkoutItem, StudentWorkoutsResponse, StudentPaymentItem, StudentPaymentsResponse
 * Hooks: useQuery, useAuthStore, useStudentProfile, useStudentWorkouts, useStudentPayments, useStudentAssessments
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Student Dashboard hooks — TanStack Query
// ============================================

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Types
// ============================================

export interface StudentProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  profile_photo_url: string | null
  status: string
  fitness_level: string | null
  goals: string[]
  total_workouts_completed: number
  current_streak: number
  longest_streak: number
  total_badges: number
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  medical_restrictions: string | null
  training_frequency: number | null
  preferred_training_time: string | null
}

export interface StudentWorkoutItem {
  id: string
  name: string
  status: string
  exercise_count: number
  start_date: string | null
  end_date: string | null
  ai_generated: boolean
  created_at: string
}

export interface StudentWorkoutsResponse {
  workouts: StudentWorkoutItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface StudentPaymentItem {
  id: string
  amount: number
  status: string
  payment_method: string
  due_date: string | null
  paid_at: string | null
  invoice_url: string | null
  receipt_url: string | null
  description: string | null
  created_at: string
  recipient_name: string
}

export interface StudentPaymentsResponse {
  payments: StudentPaymentItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface StudentAssessmentsResponse {
  assessments: {
    id: string
    assessment_date: string
    weight_kg: number | null
    body_fat_percentage: number | null
    muscle_mass_kg: number | null
    photo_count: number
    created_at: string
    // v2 fields
    protocol: string | null
    bmi: number | null
    bmi_classification: string | null
    fat_classification: string | null
    lean_mass_kg: number | null
    fat_mass_kg: number | null
    notified_at: string | null
  }[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read_at: string | null
  sent_via?: string[]
  created_at: string
  data: Record<string, unknown> | null
}

export interface NotificationsResponse {
  notifications: NotificationItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface BadgeItem {
  id: string
  type: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export interface StudentTrainingHeatmapResponse {
  year: number
  total_days_trained: number
  total_workouts: number
  max_day_count: number
  days: Array<{ date: string; count: number; intensity: number }>
  months: Array<{ month: string; days_trained: number; total_workouts: number }>
}

export interface StudentExerciseProgressResponse {
  exercise_id: string
  exercise_name: string
  days: number
  points: Array<{ date: string; load: number; reps_done?: string | null; sets_done?: number | null }>
  summary: {
    sessions_tracked: number
    unique_days: number
    current_load: number | null
    max_load: number | null
    min_load: number | null
  }
}

// ============================================
// Student-specific hooks
// ============================================

export function useStudentProfile() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<StudentProfile>({
    queryKey: ['student', 'me'],
    queryFn: async () => {
      const res = await api.get<StudentProfile>('/students/me')
      return res.data
    },
    enabled: isReady,
  })
}

export function useStudentWorkouts(params: { page?: number; per_page?: number } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  const q = qs.toString()

  return useQuery<StudentWorkoutsResponse>({
    queryKey: ['student', 'workouts', params],
    queryFn: async () => {
      const res = await api.get<StudentWorkoutsResponse>(`/workouts/my${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useStudentPayments(params: { page?: number; per_page?: number } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  const q = qs.toString()

  return useQuery<StudentPaymentsResponse>({
    queryKey: ['student', 'payments', params],
    queryFn: async () => {
      const res = await api.get<StudentPaymentsResponse>(`/payments/my${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useStudentAssessments(params: { page?: number; per_page?: number } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  const q = qs.toString()

  return useQuery<StudentAssessmentsResponse>({
    queryKey: ['student', 'assessments', params],
    queryFn: async () => {
      const res = await api.get<StudentAssessmentsResponse>(`/assessments/my${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useStudentEvolution() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ assessments: { assessment_date: string; weight_kg: number | null; body_fat_percentage: number | null; muscle_mass_kg: number | null }[] }>({
    queryKey: ['student', 'evolution'],
    queryFn: async () => {
      const res = await api.get<{ assessments: { assessment_date: string; weight_kg: number | null; body_fat_percentage: number | null; muscle_mass_kg: number | null }[] }>('/assessments/my/evolution')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useStudentBadges() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ badges: BadgeItem[] }>({
    queryKey: ['student', 'badges'],
    queryFn: async () => {
      const res = await api.get<{ badges: BadgeItem[] }>('/assessments/badges')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useStudentTrainingHeatmap(year: number = new Date().getFullYear()) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<StudentTrainingHeatmapResponse>({
    queryKey: ['student', 'workouts', 'heatmap', year],
    queryFn: async () => {
      const res = await api.get<StudentTrainingHeatmapResponse>(`/workouts/history/heatmap?year=${year}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useStudentExerciseProgress(exerciseId: string | null, days = 180) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<StudentExerciseProgressResponse>({
    queryKey: ['student', 'workouts', 'progress', exerciseId, days],
    queryFn: async () => {
      const res = await api.get<StudentExerciseProgressResponse>(`/workouts/history/progress?exercise_id=${exerciseId}&days=${days}`)
      return res.data
    },
    enabled: isReady && !!exerciseId,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useNotifications(params: { page?: number; per_page?: number; unread_only?: boolean } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.unread_only) qs.set('unread_only', '1')
  const q = qs.toString()

  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const res = await api.get<NotificationsResponse>(`/notifications${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
    placeholderData: keepPreviousData,
    ...APP_QUERY_CACHE.list,
  })
}

export function useUnreadCount() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ unread_count: number }>({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await api.get<{ unread_count: number }>('/notifications/unread-count')
      // Update app badge count (PWA Badge API)
      const count = res.data?.unread_count ?? 0
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          navigator.setAppBadge(count).catch(() => {})
        } else {
          navigator.clearAppBadge().catch(() => {})
        }
      }
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.realtime,
    refetchInterval: isReady ? 60_000 : false,
  })
}
