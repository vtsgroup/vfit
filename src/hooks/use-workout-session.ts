// ============================================
// use-workout-session.ts — Hooks para sessão de treino ao vivo
// ============================================
//
// O que faz:
//   Centraliza data fetching e mutações da sessão de treino ativa do aluno.
//   Gerencia avanço de fase, log de exercício e finalização com crédito de XP.
//
// Exports principais:
//   useWorkoutSession(workoutId) → estado da sessão (fase, exercício atual)
//   useAdvanceSession() → mutation — avança exercise→rest→next_preview→completed
//   useLogExercise() → mutation — registra log (sets, reps, carga)
//   useCompleteSession() → mutation — finaliza sessão (ganha XP, streak)
//
// Hooks usados: useQuery, useMutation, useQueryClient, useAuthStore
// Auth: enabled: isReady && !!workoutId
// ============================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { toast } from '@/stores/app-store'

export type SessionPhase = 'exercise' | 'rest' | 'next_preview' | 'completed'

export interface WorkoutSessionExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
}

export interface WorkoutSessionState {
  id: string
  user_id: string
  workout_id: string
  current_exercise_index: number
  phase: SessionPhase
  rest_remaining_seconds: number
  next_exercise_id: string | null
  exercise_logs: unknown
  started_at: string
  updated_at: string
}

export interface WorkoutSessionPayload {
  workout: {
    id: string
    name: string
    student_id: string
    status: string
  }
  exercises: WorkoutSessionExercise[]
  session: WorkoutSessionState
}

interface SessionQueryResponse {
  workout: WorkoutSessionPayload['workout']
  exercises: WorkoutSessionExercise[]
  session: WorkoutSessionState
}

interface SessionUpdateResponse {
  session: WorkoutSessionState
}

interface SessionLogResponse {
  total_logs: number
  last_log: unknown
}

interface SessionCompleteResponse {
  workout_log_id: string
  session_id: string
  xp_earned: number
  xp_balance: number
  daily_goal: unknown
  streak_milestones: Array<{ days: number; xpAwarded: number }>
}

export function useWorkoutSession(workoutId: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<WorkoutSessionPayload>({
    queryKey: ['workout-session', workoutId],
    queryFn: async () => {
      const res = await api.get<SessionQueryResponse>(`/workouts/${workoutId}/session`)
      return {
        workout: res.data.workout,
        exercises: res.data.exercises,
        session: res.data.session,
      }
    },
    enabled: isReady && !!workoutId,
    ...APP_QUERY_CACHE.realtime,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  })
}

export function useAdvanceSession(workoutId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input?: { force_phase?: SessionPhase; rest_remaining_seconds?: number }) => {
      const res = await api.post<SessionUpdateResponse>(`/workouts/${workoutId}/session/advance`, input || {})
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] })
    },
  })
}

export function useLogSession(workoutId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      exercise_id: string
      sets_done: number
      reps_done?: string | null
      load_used?: string | null
      notes?: string | null
    }) => {
      const res = await api.post<SessionLogResponse>(`/workouts/${workoutId}/session/log`, input)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] })
    },
  })
}

export function useCompleteSession(workoutId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<SessionCompleteResponse>(`/workouts/${workoutId}/session/complete`, {})
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['xp-balance'] })
      toast.success('Treino concluído com sucesso')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao concluir sessão')
    },
  })
}

export function useResetSession(workoutId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/workouts/${workoutId}/session`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-session', workoutId] })
      toast.success('Sessão resetada')
    },
  })
}
