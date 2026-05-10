/**
 * src/hooks/use-progress.ts
 *
 * React Query hooks para Dashboard de Progresso B2C
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'

// ============================================
// Types
// ============================================

export interface ProgressKPIs {
  workouts: number
  exercises: number
  duration_min: number
  calories: number
  total_reps: number
  total_volume_kg: number
}

export interface ProgressSummary {
  period: string
  offset: number
  label: string
  date_range: { start: string | null; end: string | null }
  kpis: ProgressKPIs
}

export interface ChartDataPoint {
  label: string
  date: string
  workouts: number
  duration_min: number
  volume_kg: number
}

export interface ProgressChart {
  period: string
  offset: number
  data: ChartDataPoint[]
}

export interface StreakData {
  current_streak: number
  best_streak: number
  total_workout_days: number
}

// ============================================
// Hooks
// ============================================

function useProgressQueryEnabled() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const { isStudentView } = useEffectiveUserView()
  return isReady && isStudentView
}

function emptyProgressSummary(period: string, offset: number): ProgressSummary {
  return {
    period,
    offset,
    label: period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mês' : 'Este período',
    date_range: { start: null, end: null },
    kpis: {
      workouts: 0,
      exercises: 0,
      duration_min: 0,
      calories: 0,
      total_reps: 0,
      total_volume_kg: 0,
    },
  }
}

function emptyProgressChart(period: string, offset: number): ProgressChart {
  return { period, offset, data: [] }
}

function emptyStreak(): StreakData {
  return { current_streak: 0, best_streak: 0, total_workout_days: 0 }
}

export function useProgressSummary(period: string, offset: number) {
  const isReady = useProgressQueryEnabled()

  return useQuery<ProgressSummary>({
    queryKey: ['progress', 'summary', period, offset],
    queryFn: async () => {
      const res = await api.get<ProgressSummary>(
        `/progress/summary?period=${period}&offset=${offset}`
      )
      return res.data ?? emptyProgressSummary(period, offset)
    },
    enabled: isReady,
    staleTime: 2 * 60 * 1000, // 2 min
  })
}

export function useProgressChart(period: string, offset: number) {
  const isReady = useProgressQueryEnabled()

  return useQuery<ProgressChart>({
    queryKey: ['progress', 'chart', period, offset],
    queryFn: async () => {
      const res = await api.get<ProgressChart>(
        `/progress/chart?period=${period}&offset=${offset}`
      )
      return res.data ?? emptyProgressChart(period, offset)
    },
    enabled: isReady && ['week', 'month'].includes(period),
    staleTime: 2 * 60 * 1000,
  })
}

export function useStreak() {
  const isReady = useProgressQueryEnabled()

  return useQuery<StreakData>({
    queryKey: ['progress', 'streak'],
    queryFn: async () => {
      const res = await api.get<StreakData>('/progress/streak')
      return res.data ?? emptyStreak()
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

// ============================================
// Sprint 20 — Evolução por exercício
// ============================================

export interface ExerciseProgressPoint {
  date: string
  max_weight: number
  max_volume: number
  total_reps: number
}

export interface PersonalRecord {
  weight_kg: number
  reps: number
  set_type: string
  performed_at: string
}

export interface ExerciseStats {
  total_sessions: number
  total_sets: number
  total_reps: number
  max_weight: number
  max_volume: number
  avg_weight: number
}

export interface ExerciseProgress {
  exercise_id: string
  period: string
  weight_history: ExerciseProgressPoint[]
  personal_records: PersonalRecord[]
  stats: ExerciseStats
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface HeatmapData {
  days: HeatmapDay[]
}

export function useExerciseProgress(exerciseId: string | null, period: string = '3m') {
  const isReady = useProgressQueryEnabled()

  return useQuery<ExerciseProgress>({
    queryKey: ['progress', 'exercise', exerciseId, period],
    queryFn: async () => {
      const res = await api.get<ExerciseProgress>(
        `/progress/exercise/${exerciseId}?period=${period}`
      )
      return res.data
    },
    enabled: isReady && !!exerciseId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useHeatmap() {
  const isReady = useProgressQueryEnabled()

  return useQuery<HeatmapData>({
    queryKey: ['progress', 'heatmap'],
    queryFn: async () => {
      const res = await api.get<HeatmapData>('/progress/heatmap')
      return res.data
    },
    enabled: isReady,
    staleTime: 10 * 60 * 1000, // 10 min
  })
}

// ============================================
// Sprint 40 — S2.5: Top exercises for progression charts
// ============================================

export interface TopExercise {
  exercise_id: string
  exercise_name: string
  session_count: number
  max_weight: number | null
  last_performed: string
}

export function useTopExercises(limit = 5) {
  const isReady = useProgressQueryEnabled()

  return useQuery<{ exercises: TopExercise[] }>({
    queryKey: ['progress', 'top-exercises', limit],
    queryFn: async () => {
      const res = await api.get<{ exercises: TopExercise[] }>(`/progress/top-exercises?limit=${limit}`)
      return res.data ?? { exercises: [] }
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
  })
}
