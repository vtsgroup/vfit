/**
 * src/hooks/use-workouts.ts
 *
 * Workouts hooks — TanStack Query
 *
 * Exports: WorkoutExercise, WorkoutListItem, WorkoutDetail, WorkoutLog, WorkoutListResponse
 * Hooks: useMutation, useQuery, useQueryClient, useRouter, useAuthStore, useWorkouts
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Workouts hooks — TanStack Query
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

// ============================================
// Types
// ============================================

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  load: string | null
  order_index: number
  notes: string | null
  technique_tips: string | null
  custom_video_url: string | null
}

export interface WorkoutListItem {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string | null
  ai_generated: boolean
  is_template: boolean
  created_at: string
  student_name: string | null
  exercise_count: number
  cover_image_url: string | null
  primary_muscle: string | null
}

export interface WorkoutDetail {
  id: string
  student_id: string | null
  personal_id: string
  template_id: string | null
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string | null
  ai_generated: boolean
  ai_model_used: string | null
  is_template: boolean
  notes: string | null
  created_at: string
  updated_at: string
  student_name: string | null
  exercises: WorkoutExercise[]
  cover_image_url: string | null
  primary_muscle: string | null
}

export interface WorkoutLog {
  id: string
  workout_id: string
  student_id: string
  completed_at: string
  duration_minutes: number | null
  exercises_completed: unknown
  student_notes: string | null
  feeling: 'great' | 'good' | 'tired' | 'pain' | null
  created_at: string
  workout_name: string
  student_name: string
}

export interface WorkoutListResponse {
  workouts: WorkoutListItem[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface WorkoutDetailResponse {
  workout: WorkoutDetail
  logs: WorkoutLog[]
}

export interface WorkoutLogListResponse {
  logs: WorkoutLog[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface WorkoutListParams {
  page?: number
  per_page?: number
  student_id?: string
  status?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  is_template?: boolean
}

// D1 Exercise (cold data / biblioteca)
export interface D1Exercise {
  id: string
  name: string
  name_pt: string
  muscle_group_id: string
  description: string | null
  description_pt: string | null
  video_url_vertical: string | null
  video_url_horizontal: string | null
  thumbnail_url: string | null
  difficulty: string
  equipment_needed: string | null
  is_default: boolean
}

// D1 Workout Template
export interface D1Template {
  id: string
  name: string
  name_pt: string
  description: string | null
  category: string
  difficulty: string
  template_data: string // JSON string
  is_default: boolean
  usage_count: number
}

// ============================================
// Create / Update types
// ============================================

export interface CreateWorkoutInput {
  student_id?: string | null
  is_template?: boolean
  template_id?: string
  name: string
  description?: string | null
  start_date: string
  end_date?: string | null
  notes?: string | null
  exercises?: {
    exercise_id: string
    sets: number
    reps: string
    rest_seconds?: number
    load?: string | null
    notes?: string | null
    technique_tips?: string | null
    order_index: number
  }[]
}

export interface UpdateWorkoutInput {
  name?: string
  description?: string | null
  status?: 'active' | 'completed' | 'archived' | 'paused'
  start_date?: string
  end_date?: string | null
  notes?: string | null
}

export interface AddExerciseInput {
  exercise_id: string
  sets: number
  reps: string
  rest_seconds?: number
  load?: string | null
  order_index: number
  notes?: string | null
  technique_tips?: string | null
}

// ============================================
// Query hooks
// ============================================

export function useWorkouts(params: WorkoutListParams = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.student_id) queryString.set('student_id', params.student_id)
  if (params.status) queryString.set('status', params.status)
  if (params.search) queryString.set('search', params.search)
  if (params.sort) queryString.set('sort', params.sort)
  if (params.order) queryString.set('order', params.order)

  const qs = queryString.toString()

  return useQuery<WorkoutListResponse>({
    queryKey: ['workouts', params.page, params.per_page, params.student_id, params.status, params.search],
    queryFn: async () => {
      const res = await api.get<WorkoutListResponse>(`/workouts${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

// ============================================
// My Workouts (Student) — /workouts/my
// ============================================

export interface MyWorkoutListItem {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string
  end_date: string | null
  ai_generated: boolean
  notes: string | null
  created_at: string
  personal_name: string | null
  exercise_count: number
  times_completed: number
}

export interface MyWorkoutListResponse {
  workouts: MyWorkoutListItem[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export function useMyWorkouts(params: { page?: number; per_page?: number; status?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.status) queryString.set('status', params.status)

  const qs = queryString.toString()

  return useQuery<MyWorkoutListResponse>({
    queryKey: ['my-workouts', params.page, params.per_page, params.status],
    queryFn: async () => {
      const res = await api.get<MyWorkoutListResponse>(`/workouts/my${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useWorkout(id: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<WorkoutDetailResponse>({
    queryKey: ['workouts', id],
    queryFn: async () => {
      const res = await api.get<WorkoutDetailResponse>(`/workouts/${id}`)
      return res.data
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useWorkoutLogs(params: { page?: number; per_page?: number; student_id?: string; workout_id?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.student_id) queryString.set('student_id', params.student_id)
  if (params.workout_id) queryString.set('workout_id', params.workout_id)

  const qs = queryString.toString()

  return useQuery<WorkoutLogListResponse>({
    queryKey: ['workout-logs', params.page, params.per_page, params.student_id, params.workout_id],
    queryFn: async () => {
      const res = await api.get<WorkoutLogListResponse>(`/workouts/logs${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

// D1 muscle groups — cold data, very long cache
export interface D1MuscleGroup {
  id: string
  name: string
  name_pt: string
  icon_svg: string | null
  description: string | null
  display_order: number
  parent_id: string | null
  image_url?: string | null
  image_male_url?: string | null
  image_female_url?: string | null
}

export function useMuscleGroups() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<D1MuscleGroup[]>({
    queryKey: ['muscle-groups'],
    queryFn: async () => {
      const res = await api.get<D1MuscleGroup[]>('/muscle-groups')
      return res.data
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 60, // 1h — cold data
  })
}

// Limite máximo da biblioteca D1 (exercícios são dados frios — toda a lib é carregada de uma vez)
const EXERCISE_LIBRARY_PAGE_SIZE = 200

// D1 exercises library — cacheable, public, staleTime long
export function useExerciseLibrary(params: { muscle_group_id?: string; search?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.muscle_group_id) queryString.set('muscle_group_id', params.muscle_group_id)
  if (params.search) queryString.set('search', params.search)
  queryString.set('per_page', String(EXERCISE_LIBRARY_PAGE_SIZE))

  const qs = queryString.toString()

  return useQuery<D1Exercise[]>({
    queryKey: ['exercises', params],
    queryFn: async () => {
      const res = await api.get<D1Exercise[]>(`/exercises?${qs}`)
      return res.data
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 30, // 30 min — cold data
  })
}

export function useTemplates() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<D1Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await api.get<D1Template[]>('/templates')
      return res.data
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 30,
  })
}

/** Listar treinos-modelo do personal (marketplace templates) */
export function useMyTemplateWorkouts(params: { page?: number; search?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.search) queryString.set('search', params.search)
  const qs = queryString.toString()

  return useQuery<WorkoutListResponse>({
    queryKey: ['workouts', 'templates', params],
    queryFn: async () => {
      const res = await api.get<WorkoutListResponse>(`/workouts/templates${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useCreateWorkout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateWorkoutInput) =>
      api.post('/workouts', data),
    onSuccess: () => {
      toast.success('Treino criado com sucesso!')
      // Invalidate both personal workouts and student's assigned workouts
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['my-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['student', 'workouts'] })
      router.push('/dashboard/workouts')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar treino')
    },
  })
}

  export function useCreateWorkoutRaw() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (data: CreateWorkoutInput) =>
        api.post<{ workout: { id: string } }>('/workouts', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workouts'] })
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Erro ao criar treino')
      },
    })
  }

export function useUpdateWorkout(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateWorkoutInput) =>
      api.patch(`/workouts/${id}`, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['workouts', id] })

      const previousDetail = queryClient.getQueryData<WorkoutDetailResponse>(['workouts', id])

      // Optimistic: atualizar dados do treino na query de detalhe
      if (previousDetail) {
        queryClient.setQueryData<WorkoutDetailResponse>(['workouts', id], {
          ...previousDetail,
          workout: { ...previousDetail.workout, ...newData, updated_at: new Date().toISOString() },
        })
      }

      return { previousDetail }
    },
    onError: (err: Error, _, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['workouts', id], context.previousDetail)
      }
      toast.error(err.message || 'Erro ao atualizar treino')
    },
    onSuccess: () => {
      toast.success('Treino atualizado!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', id] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}

export function useDeleteWorkout(id: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.delete(`/workouts/${id}`),
    onMutate: async () => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['workouts'] })

      // Snapshot da lista anterior para rollback
      const previousList = queryClient.getQueriesData<WorkoutListResponse>({ queryKey: ['workouts'] })

      // Optimistic: remover treino de todas as queries de lista
      queryClient.setQueriesData<WorkoutListResponse>(
        { queryKey: ['workouts'] },
        (old) => {
          if (!old?.workouts) return old
          return {
            ...old,
            workouts: old.workouts.filter((w) => w.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          }
        }
      )

      return { previousList }
    },
    onError: (err: Error, _, context) => {
      // Rollback em caso de erro
      if (context?.previousList) {
        for (const [queryKey, data] of context.previousList) {
          queryClient.setQueryData(queryKey, data)
        }
      }
      toast.error(err.message || 'Erro ao excluir treino')
    },
    onSuccess: () => {
      toast.success('Treino excluído permanentemente')
      router.push('/dashboard/workouts')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}

export function useDuplicateWorkout(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post(`/workouts/${id}/duplicate`, {}),
    onSuccess: () => {
      toast.success('Treino duplicado!')
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao duplicar treino')
    },
  })
}

export function useAddExercise(workoutId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddExerciseInput) =>
      api.post(`/workouts/${workoutId}/exercises`, data),
    onSuccess: () => {
      toast.success('Exercício adicionado!')
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao adicionar exercício')
    },
  })
}

export function useRemoveExercise(workoutId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseId: string) =>
      api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`),
    onSuccess: () => {
      toast.success('Exercício removido!')
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover exercício')
    },
  })
}

export function useCloneTemplate() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { template_id: string; student_id: string; name?: string; start_date: string }) =>
      api.post('/workouts/clone-template', data),
    onSuccess: () => {
      toast.success('Treino criado a partir do template!')
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      router.push('/dashboard/workouts')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao clonar template')
    },
  })
}

// ============================================
// Complete Workout (student)
// ============================================

export interface CompleteWorkoutPayload {
  duration_minutes?: number
  exercises_completed: Array<{
    exercise_id: string
    sets_done: number
    reps_done?: string
    load_used?: string
    completed: boolean
    notes?: string
  }>
  student_notes?: string | null
  feeling?: 'great' | 'good' | 'tired' | 'pain'
}

export interface WorkoutCompletionResult {
  log_id: string
  workout_id: string
  completed_at: string
  duration_minutes: number | null
  feeling: string | null
  stats: {
    total_workouts: number
    current_streak: number
    longest_streak: number
    xp_earned: number
  }
  new_badges: Array<{
    type: string
    name: string
    icon: string
  }>
}

export function useCompleteWorkout(workoutId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CompleteWorkoutPayload) => {
      const res = await api.post<WorkoutCompletionResult>(`/workouts/${workoutId}/complete`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Treino concluído!')
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['student'] })
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao finalizar treino')
    },
  })
}

// ============================================
// Export / Import Workouts
// ============================================

/** Exportar treino como JSON (download) */
export function useExportWorkout() {
  return useMutation({
    mutationFn: async (workoutId: string) => {
      const res = await api.get<{
        version: string
        exported_at: string
        source: string
        workout: {
          name: string
          exercises: unknown[]
        }
      }>(`/workouts/${workoutId}/export`)

      const data = res.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `treino-${data.workout.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return data
    },
    onSuccess: () => {
      toast.success('Treino exportado com sucesso!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao exportar treino')
    },
  })
}

/** Importar treino a partir de JSON */
export function useImportWorkout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text()
      const json = JSON.parse(text)

      // Aceitar formato VFIT ou formato { workout: { ... } }
      const payload = json.workout ? json : { workout: json }

      const res = await api.post<WorkoutDetail>('/workouts/import', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Treino importado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      router.push('/dashboard/workouts')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao importar treino. Verifique o formato do arquivo.')
    },
  })
}

// ============================================
// Exercise Progression — S08-07
// ============================================

interface ProgressPoint {
  date: string
  load: number
  reps_done?: string | null
  sets_done?: number | null
}

interface ExerciseProgressResponse {
  exercise_id: string
  exercise_name: string
  days: number
  points: ProgressPoint[]
  summary: {
    sessions_tracked: number
    unique_days: number
    current_load: number | null
    max_load: number | null
    min_load: number | null
  }
}

export function useExerciseProgress(exerciseId: string, days = 90) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<ExerciseProgressResponse>({
    queryKey: ['exercise-progress', exerciseId, days],
    queryFn: async () => {
      const res = await api.get<ExerciseProgressResponse>(
        `/workouts/history/progress?exercise_id=${exerciseId}&days=${days}`
      )
      return res.data
    },
    enabled: isReady && !!exerciseId,
    staleTime: 5 * 60_000, // 5 min
  })
}

// ============================================
// Assign Workout to Student — S07-07
// ============================================

// ============================================
// Upload Cover Image do Treino
// ============================================
export function useUploadWorkoutCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workoutId, file }: { workoutId: string; file: File }) => {
      const res = await api.uploadFile<{ cover_image_url: string }>(
        `/workouts/${workoutId}/cover-image`,
        file
      )
      return res.data
    },
    onSuccess: (_data, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      toast.success('Imagem de capa atualizada!')
    },
    onError: () => toast.error('Erro ao fazer upload da imagem'),
  })
}

export function useRemoveWorkoutCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const res = await api.delete<{ cover_image_url: null }>(`/workouts/${workoutId}/cover-image`)
      return res.data
    },
    onSuccess: (_data, workoutId) => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      toast.success('Imagem de capa removida')
    },
  })
}

// ============================================
// Upload Vídeo Customizado por Exercício do Treino
// ============================================
export function useUploadExerciseVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workoutId, exerciseRowId, file }: {
      workoutId: string
      exerciseRowId: string
      file: File
    }) => {
      const res = await api.uploadFile<{ custom_video_url: string }>(
        `/workouts/${workoutId}/exercises/${exerciseRowId}/video`,
        file
      )
      return res.data
    },
    onSuccess: (_data, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      toast.success('Vídeo do exercício atualizado!')
    },
    onError: () => toast.error('Erro ao fazer upload do vídeo'),
  })
}

export function useRemoveExerciseVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workoutId, exerciseRowId }: { workoutId: string; exerciseRowId: string }) => {
      const res = await api.delete<{ custom_video_url: null }>(
        `/workouts/${workoutId}/exercises/${exerciseRowId}/video`
      )
      return res.data
    },
    onSuccess: (_data, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      toast.success('Vídeo removido')
    },
  })
}

export function useAssignWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workoutId, studentId, startDate, endDate }: {
      workoutId: string
      studentId: string
      startDate?: string
      endDate?: string
    }) => {
      const res = await api.post<WorkoutDetail>(`/workouts/${workoutId}/duplicate`, {
        student_id: studentId,
        start_date: startDate,
        end_date: endDate,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Treino atribuído com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atribuir treino')
    },
  })
}
