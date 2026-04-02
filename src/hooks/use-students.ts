/**
 * src/hooks/use-students.ts
 *
 * Students hooks — TanStack Query
 *
 * Exports: Student, StudentListResponse, StudentListParams, useStudents, useStudent
 * Hooks: useMutation, useQuery, useQueryClient, useRouter, useAuthStore, useStudents
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Students hooks — TanStack Query
// ============================================

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { emitCacheEvent } from '@/lib/cache-events'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Types
// ============================================

export interface Student {
  id: string
  full_name: string
  email: string
  phone: string | null
  profile_photo_url: string | null
  status: string
  payment_status: string
  fitness_level: string | null
  goals: string[]
  total_workouts_completed: number
  current_streak: number
  longest_streak: number
  total_badges: number
  last_payment_date: string | null
  next_payment_date: string | null
  invited_at: string | null
  accepted_at: string | null
  created_at: string
  // Student type
  student_type: 'personal_training' | 'consultoria'
  consultation_price: number | null
  consultation_billing_cycle: string | null
  consultation_notes?: string | null
  // Extended fields from detail endpoint
  date_of_birth?: string | null
  gender?: string | null
  height_cm?: number | null
  medical_restrictions?: string | null
  training_frequency?: number | null
  preferred_training_time?: string | null
  monthly_fee?: number | null
}

export interface StudentListResponse {
  students: Student[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface StudentListParams {
  page?: number
  per_page?: number
  status?: string
  payment_status?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

// ============================================
// Query hooks
// ============================================

export function useStudents(params: StudentListParams = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.status) queryString.set('status', params.status)
  if (params.payment_status) queryString.set('payment_status', params.payment_status)
  if (params.search) queryString.set('search', params.search)
  if (params.sort) queryString.set('sort', params.sort)
  if (params.order) queryString.set('order', params.order)

  const qs = queryString.toString()

  return useQuery<StudentListResponse>({
    queryKey: ['students', params],
    queryFn: async () => {
      const res = await api.get<StudentListResponse>(`/students${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    placeholderData: keepPreviousData,
    ...APP_QUERY_CACHE.list,
  })
}

export function useStudent(id: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const isPrivileged = useAuthStore((s) => s.user?.role === 'admin' || s.user?.role === 'super_admin')
  return useQuery<Student>({
    queryKey: ['students', id],
    queryFn: async () => {
      const endpoint = isPrivileged ? `/admin/students/${id}` : `/students/${id}`
      const res = await api.get<{ student: Student }>(endpoint)
      return res.data.student
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
  })
}

// ============================================
// Mutation hooks
// ============================================

export interface InviteStudentInput {
  email: string
  full_name: string
  student_type?: 'personal_training' | 'consultoria'
  consultation_price?: number
  consultation_billing_cycle?: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  consultation_notes?: string
}

export interface QuickInviteStudentInput {
  email?: string
  full_name?: string
  phone?: string
  student_type?: 'personal_training' | 'consultoria'
  consultation_price?: number
  consultation_billing_cycle?: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  consultation_notes?: string
}

export interface QuickInviteResultData {
  invitation_token: string
  invitation_url: string
  email: string | null
  full_name: string | null
  personal_name: string
  email_sent: boolean
  mode: 'qr' | 'email'
  message: string
}

export interface ManualCreateStudentInput {
  full_name: string
  cpf: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  phone: string
  email: string
}

export interface ManualCreateStudentResultData {
  student_id: string
  full_name: string
  email: string
  phone: string
  cpf: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  invitation_token: string
  invitation_url: string
  personal_name: string
  email_sent: boolean
  whatsapp_sent: boolean
  message: string
}

export function useInviteStudent() {
  return useMutation({
    mutationFn: (data: InviteStudentInput) =>
      api.post('/students/invite', data),
    onSuccess: () => {
      emitCacheEvent({ type: 'students:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar convite')
    },
  })
}

export function useQuickInviteStudent() {
  return useMutation<{ data: QuickInviteResultData }, Error, QuickInviteStudentInput | void>({
    mutationFn: (data) => api.post('/students/invite/quick', data || {}),
    onSuccess: () => {
      emitCacheEvent({ type: 'students:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao gerar convite rápido')
    },
  })
}

export function useManualCreateStudent() {
  return useMutation<{ data: ManualCreateStudentResultData }, Error, ManualCreateStudentInput>({
    mutationFn: (data) => api.post('/students/manual-create', data),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Aluno cadastrado com sucesso')
      emitCacheEvent({ type: 'students:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao cadastrar aluno')
    },
  })
}

export function useUpdateStudent(id: string) {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/students/${id}`, data),
    onSuccess: () => {
      toast.success('Aluno atualizado!')
      emitCacheEvent({ type: 'student:detail:changed', entityId: id })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar aluno')
    },
  })
}

export function useUpdateStudentUser(id: string) {
  return useMutation({
    mutationFn: (data: { full_name?: string; phone?: string; profile_photo_url?: string | null }) =>
      api.patch(`/students/${id}/user`, data),
    onSuccess: () => {
      toast.success('Perfil atualizado!')
      emitCacheEvent({ type: 'student:detail:changed', entityId: id })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar perfil')
    },
  })
}

export function useUpdateStudentStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { status: string; reason?: string }) =>
      api.patch(`/students/${id}/status`, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['students', id] })

      const previousStudent = queryClient.getQueryData<Student>(['students', id])

      // Optimistic: atualizar status no cache
      if (previousStudent) {
        queryClient.setQueryData<Student>(['students', id], {
          ...previousStudent,
          status: newData.status,
        })
      }

      return { previousStudent }
    },
    onError: (err: Error, _, context) => {
      if (context?.previousStudent) {
        queryClient.setQueryData(['students', id], context.previousStudent)
      }
      toast.error(err.message || 'Erro ao atualizar status')
    },
    onSuccess: () => {
      toast.success('Status atualizado!')
    },
    onSettled: () => {
      emitCacheEvent({ type: 'student:detail:changed', entityId: id })
    },
  })
}

export function useDeleteStudent(id: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const userRole = useAuthStore((s) => s.user?.role)

  return useMutation({
    mutationFn: () => {
      if (userRole === 'super_admin') {
        return api.delete(`/admin/students/${id}`)
      }
      return api.delete(`/students/${id}`)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['students'] })

      const previousList = queryClient.getQueriesData<StudentListResponse>({ queryKey: ['students'] })

      // Optimistic: remover aluno de todas as queries de lista
      queryClient.setQueriesData<StudentListResponse>(
        { queryKey: ['students'] },
        (old) => {
          if (!old?.students) return old
          return {
            ...old,
            students: old.students.filter((s) => s.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          }
        }
      )

      return { previousList }
    },
    onError: (err: Error, _, context) => {
      if (context?.previousList) {
        for (const [queryKey, data] of context.previousList) {
          queryClient.setQueryData(queryKey, data)
        }
      }
      toast.error(err.message || 'Erro ao remover aluno')
    },
    onSuccess: () => {
      toast.success(userRole === 'super_admin' ? 'Aluno removido permanentemente' : 'Aluno removido')
      router.push('/dashboard/students')
    },
    onSettled: () => {
      emitCacheEvent({ type: 'students:changed' })
    },
  })
}

export function useCreateTestStudent() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ student_id: string; name: string; message: string }>('/students/test-setup', {})
      return res.data
    },
    onSuccess: (data: { student_id: string; name: string; message: string }) => {
      toast.success(data.message)
      emitCacheEvent({ type: 'students:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar aluno de teste')
    },
  })
}

// ============================================
// Batch invite (import)
// ============================================

export interface BatchInviteStudent {
  email: string
  full_name: string
  phone?: string
  student_type?: 'personal_training' | 'consultoria'
}

export interface BatchInviteResult {
  email: string
  full_name: string
  status: 'created' | 'skipped' | 'error'
  reason?: string
}

export interface BatchInviteResponse {
  message: string
  total: number
  created: number
  skipped: number
  errors: number
  results: BatchInviteResult[]
}

export function useBatchInviteStudents() {
  return useMutation<BatchInviteResponse, Error, BatchInviteStudent[]>({
    mutationFn: async (students) => {
      const res = await api.post<BatchInviteResponse>('/students/batch-invite', { students })
      return res.data
    },
    onSuccess: (data) => {
      emitCacheEvent({ type: 'students:changed' })
      if (data.created > 0) {
        toast.success(`${data.created} aluno(s) importado(s) com sucesso!`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao importar alunos')
    },
  })
}
