/**
 * src/hooks/use-plans.ts
 *
 * React Query hooks for VFIT B2C workout plans
 *
 * Hooks: useCurrentPlan, useGeneratePlan, useSavePlan
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'

// ─── Types ───

export interface PlanExercise {
  id: string
  plan_day_id: string
  exercise_id: string
  sort_order: number
  sets: number
  reps: string
  weight_kg: number | null
  rest_seconds: number
  is_warmup: boolean
  is_superset: boolean
  superset_group: string | null
  notes: string | null
  exercise_name: string | null
  muscle_group: string | null
}

export interface PlanDay {
  id: string
  day_number: number
  name: string
  muscle_groups: string[]
  estimated_duration_min: number
  exercises: PlanExercise[]
}

export interface CurrentPlan {
  id: string
  name: string
  type: string
  status: string
  total_days: number
  current_day: number
  settings: Record<string, unknown>
  created_at: string
  days: PlanDay[]
}

export interface GeneratedPlanResult {
  plan: {
    plan_name: string
    description: string
    estimated_calories_per_session?: number
    days: Array<{
      day_number: number
      name: string
      focus: string
      exercises: Array<{
        name: string
        muscle_group: string
        sets: number
        reps: string
        rest_seconds: number
        weight_suggestion_kg?: number
        notes?: string
      }>
    }>
  }
  source: 'ai' | 'fallback'
  stats: {
    total_days: number
    total_exercises: number
    avg_exercises_per_day: number
    session_duration_minutes: number
    estimated_weekly_calories: number
  }
}

// ============================================
// GET /plans/current — Plano ativo do usuário
// ============================================
export function useCurrentPlan() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<CurrentPlan>({
    queryKey: ['plans', 'current'],
    queryFn: async () => {
      const res = await api.get<{ plan: CurrentPlan }>('/plans/current')
      return res.data.plan
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  })
}

// ============================================
// POST /plans/generate — Gerar plano via IA
// ============================================
export function useGeneratePlan() {
  return useMutation<GeneratedPlanResult, Error, Record<string, unknown>>({
    mutationFn: async (profile) => {
      const res = await api.post<GeneratedPlanResult>('/plans/generate', profile, { auth: false })
      return res.data
    },
  })
}

// ============================================
// POST /plans/save — Salvar plano no DB
// ============================================
export function useSavePlan() {
  return useMutation<{ plan_id: string }, Error, { plan: Record<string, unknown> }>({
    mutationFn: async (data) => {
      const res = await api.post<{ plan_id: string }>('/plans/save', data)
      return res.data
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar plano')
    },
  })
}

// ─── Settings Types ───

export interface PlanSettings {
  days_per_week?: number
  session_duration?: number
  rest_day_mode?: string
  goal?: string
  level?: string
  equipment?: string[]
}

// ============================================
// PATCH /plans/:id/settings — Atualizar configurações
// ============================================
export function useUpdatePlanSettings() {
  const queryClient = useQueryClient()

  return useMutation<{ settings: PlanSettings }, Error, { planId: string; settings: PlanSettings }>({
    mutationFn: async ({ planId, settings }) => {
      const res = await api.patch<{ settings: PlanSettings }>(`/plans/${planId}/settings`, settings)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar configurações')
    },
  })
}

// ============================================
// POST /plans/regenerate — Gerar novo plano
// ============================================
export function useRegeneratePlan() {
  const queryClient = useQueryClient()

  return useMutation<{ plan_id: string; plan_name: string }, Error, void>({
    mutationFn: async () => {
      const res = await api.post<{ plan_id: string; plan_name: string }>('/plans/regenerate')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao regenerar plano')
    },
  })
}

// ============================================
// POST /workouts/b2c/complete — Salvar treino completo
// ============================================
export function useCompleteWorkout() {
  const queryClient = useQueryClient()

  return useMutation<
    {
      workout_id: string
      summary: {
        duration_seconds: number
        total_sets: number
        total_reps: number
        total_volume_kg: number
        estimated_calories: number
        exercises_completed: number
        exercises_skipped: number
      }
      records: Array<{ exercise_name: string; weight_kg: number }>
    },
    Error,
    {
      plan_id: string
      plan_day_id: string
      day_number: number
      started_at: string
      duration_seconds: number
      exercises: Array<{
        exercise_id: string
        exercise_name: string
        muscle_group: string | null
        skipped: boolean
        sets: Array<{
          reps: number
          weight_kg: number
          is_warmup: boolean
          completed: boolean
        }>
      }>
    }
  >({
    mutationFn: async (data) => {
      const res = await api.post<{
        workout_id: string
        summary: {
          duration_seconds: number
          total_sets: number
          total_reps: number
          total_volume_kg: number
          estimated_calories: number
          exercises_completed: number
          exercises_skipped: number
        }
        records: Array<{ exercise_name: string; weight_kg: number }>
      }>('/workouts/b2c/complete', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    },
  })
}

export function useUpdatePlanExercises() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      planId: string
      dayId: string
      exercises: Array<{
        id?: string
        exercise_id: string
        sets: number
        reps: string
        weight_kg?: number | null
        rest_seconds?: number
        is_warmup?: boolean
        is_superset?: boolean
        superset_group?: string | null
        notes?: string | null
      }>
    }) => {
      const res = await api.patch<{ updated: number }>(`/plans/${data.planId}/days/${data.dayId}/exercises`, {
        exercises: data.exercises,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    },
  })
}

export function useRemovePlanExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { planId: string; dayId: string; exerciseId: string }) => {
      const res = await api.delete<{ deleted: boolean }>(`/plans/${data.planId}/days/${data.dayId}/exercises/${data.exerciseId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
    },
  })
}
