/**
 * src/hooks/use-admin.ts
 *
 * Admin hooks — TanStack Query
 *
 * Exports: AdminStats, AdminUser, AdminUserDetail, AdminPersonal, AdminPayment
 * Hooks: useMutation, useQuery, useAuthStore, useIsAdminReady, useAdminStats, useAdminSimulationSession
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Admin hooks — TanStack Query
// Hooks para o painel de administração
// ============================================

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { emitCacheEvent } from '@/lib/cache-events'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'

function useIsAdminReady(): boolean {
  return useAuthStore((s) => {
    const role = s.user?.role
    const isAdminRole = role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isAdminRole
  })
}

// ============================================
// Types
// ============================================

export interface AdminStats {
  caller_role: 'admin' | 'super_admin'
  overview: {
    total_users: number
    total_personals: number
    total_students: number
    active_subscriptions: number
    new_signups_30d: number
  }
  payments: {
    total_payments: number
    total_confirmed: number
    total_pending: number
    total_revenue: number
    platform_fees: number
    total_commissions: number
  }
  asaas_balance: number | null
  asaas_statistics: {
    income: {
      estimated: number
      confirmed: number
      received: number
      overdue: number
    }
    expense: {
      estimated: number
      confirmed: number
    }
  } | null
  revenue_by_month: {
    month: string
    revenue: number
    count: number
    fees: number
  }[]
  top_personals: {
    personal_id: string
    full_name: string
    email: string
    revenue: number
    student_count: number
  }[]
}

export interface AdminUser {
  id: string
  full_name: string
  email: string
  user_type: 'personal' | 'student' | 'admin'
  role: string
  avatar_url: string | null
  phone: string | null
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminUserDetail {
  user: AdminUser
  profile: Record<string, unknown> | null
  recent_payments: {
    id: string
    amount: number
    status: string
    payment_method: string
    created_at: string
  }[]
}

export interface AdminPersonal {
  id: string
  personal_id: string // alias for id (backend returns u.id)
  full_name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  slug: string | null
  cref: string | null
  plan_type: string
  plan_expires_at: string | null
  specialties: string | null
  monthly_price: number | null
  max_students: number | null
  total_students: number
  student_count: number
  average_rating: number
  active_students: number
  total_revenue: number
}

export interface AdminPayment {
  id: string
  payer_id: string
  payer_name: string
  payer_email: string
  recipient_id: string
  recipient_name: string
  recipient_email: string
  amount: number
  platform_fee: number
  commission: number
  net_amount: number
  status: string
  payment_method: string
  due_date: string | null
  paid_at: string | null
  description: string | null
  asaas_payment_id: string | null
  invoice_url: string | null
  created_at: string
}

export interface AdminAffiliate {
  id: string
  full_name: string
  email: string
  referral_code: string
  total_referrals: number
  student_referrals: number
  total_earnings: number
  total_paid: number
  total_pending: number
}

export interface AdminTransfer {
  id: string
  personal_id: string
  personal_name: string
  personal_email: string
  pix_key: string
  pix_key_type: string
  amount: number
  fee: number
  net_amount: number
  status: string
  requested_at: string
  completed_at: string | null
}

export interface AdminSubscription {
  id: string
  payer_id: string
  payer_name: string
  recipient_id: string
  recipient_name: string
  amount: number
  billing_cycle: string
  payment_method: string
  status: string
  start_date: string
  end_date: string | null
  next_due_date: string | null
  created_at: string
}

interface PaginatedMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface UpdateUserInput {
  full_name?: string
  email?: string
  phone?: string | null
  user_type?: string
  role?: string
  email_verified?: boolean
}

export interface UpdatePersonalInput {
  plan_type?: string
  plan_expires_at?: string | null
  cref?: string | null
  specialties?: string | string[] | null
  bio?: string | null
  hourly_rate?: number | null
  monthly_price?: number | null
  max_students?: number | null
  full_name?: string
  email?: string
  role?: string
}

export interface CreateAdminPaymentInput {
  payer_id: string
  recipient_id: string
  amount: number
  payment_method?: string
  due_date?: string
  description?: string
  create_in_asaas?: boolean
}

export interface AdminPaymentResponse {
  id: string
  amount: number
  platform_fee: number
  net_amount: number
  status: string
  payment_method: string
  due_date: string
  asaas_payment_id: string | null
  invoice_url: string | null
  payer_name: string
  recipient_name: string
  pix: {
    qrCode?: string
    payload?: string
    expirationDate?: string
  } | null
}

export interface BonusInput {
  amount: number
  description?: string
  type?: string
}

export type AdminSimulationMode = 'super_admin' | 'personal' | 'student'

export interface AdminSimulationSession {
  mode: AdminSimulationMode
  target_user_id: string | null
  target_user_type: 'personal' | 'student' | null
  target_email: string | null
  actor_user_id: string
  updated_at: string
}

interface AdminSimulationResponse {
  simulation: AdminSimulationSession
  capabilities?: {
    can_switch_modes: boolean
    changes_permissions: boolean
    checkpoint: string
  }
}

export interface AdminAccountNote {
  id: string
  target_user_id: string
  note: string
  risk_level: 'none' | 'attention' | 'high'
  is_financial_risk: boolean
  updated_at: string
  updated_by: string
  updated_by_name?: string | null
}

// ============================================
// Query hooks
// ============================================

export function useAdminStats() {
  const isReady = useIsAdminReady()
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get<AdminStats>('/admin/stats')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

export function useAdminSimulationSession() {
  const isReady = useIsAdminReady()
  const canSimulate = useAuthStore((s) => s.user?.role === 'super_admin' || s.user?.role === 'admin')

  return useQuery<AdminSimulationResponse>({
    queryKey: ['admin', 'simulation', 'session'],
    queryFn: async () => {
      const res = await api.get<AdminSimulationResponse>('/admin/simulation/session')
      return res.data
    },
    enabled: isReady && canSimulate,
    staleTime: 30_000,
  })
}

export function useUpdateAdminSimulationSession() {
  return useMutation({
    mutationFn: async (payload: { mode: AdminSimulationMode; target_user_id?: string }) => {
      const res = await api.post<AdminSimulationResponse>('/admin/simulation/session', payload)
      return res.data
    },
    onSuccess: (_data, variables) => {
      toast.success('Sessão de simulação atualizada')
      emitCacheEvent({ type: 'admin:all:changed' })
      emitCacheEvent({ type: 'admin:users:changed' })
      // Ao trocar para student, resetar onboarding store para experiência "first time"
      if (variables.mode === 'student') {
        try {
          localStorage.removeItem('vfit-onboarding')
        } catch (_e) { /* ignore */ }
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar simulação')
    },
  })
}

export function useAdminAccountNote(userId?: string | null) {
  const isReady = useIsAdminReady()
  return useQuery<{ note: AdminAccountNote | null }>({
    queryKey: ['admin', 'users', userId, 'note'],
    queryFn: async () => {
      const res = await api.get<{ note: AdminAccountNote | null }>(`/admin/users/${userId}/note`)
      return res.data
    },
    enabled: isReady && !!userId,
    staleTime: 20_000,
  })
}

export function useUpsertAdminAccountNote() {
  return useMutation({
    mutationFn: async ({
      userId,
      note,
      risk_level,
      is_financial_risk,
    }: {
      userId: string
      note: string
      risk_level?: 'none' | 'attention' | 'high'
      is_financial_risk?: boolean
    }) => {
      const res = await api.put<{ note: AdminAccountNote; message: string }>(`/admin/users/${userId}/note`, {
        note,
        risk_level,
        is_financial_risk,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Nota administrativa salva')
      emitCacheEvent({ type: 'admin:users:changed' })
      emitCacheEvent({ type: 'admin:all:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar nota administrativa')
    },
  })
}

export function useAdminUsers(params: {
  page?: number
  per_page?: number
  search?: string
  user_type?: string
  role?: string
  sort?: string
  order?: string
  enabled?: boolean
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.search) qs.set('search', params.search)
  if (params.user_type) qs.set('user_type', params.user_type)
  if (params.role) qs.set('role', params.role)
  if (params.sort) qs.set('sort', params.sort)
  if (params.order) qs.set('order', params.order)

  return useQuery<{ users: AdminUser[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await api.get<{ users: AdminUser[]; meta: PaginatedMeta }>(
        `/admin/users${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady && (params.enabled !== false),
    placeholderData: keepPreviousData,
    ...APP_QUERY_CACHE.list,
  })
}

export function useAdminUser(id: string) {
  const isReady = useIsAdminReady()
  return useQuery<AdminUserDetail>({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await api.get<AdminUserDetail>(`/admin/users/${id}`)
      return res.data
    },
    enabled: isReady && !!id,
  })
}

export function useAdminPersonals(params: {
  page?: number
  per_page?: number
  search?: string
  plan_type?: string
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.search) qs.set('search', params.search)
  if (params.plan_type) qs.set('plan_type', params.plan_type)

  return useQuery<{ personals: AdminPersonal[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'personals', params],
    queryFn: async () => {
      const res = await api.get<{ personals: AdminPersonal[]; meta: PaginatedMeta }>(
        `/admin/personals${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminPayments(params: {
  page?: number
  status?: string
  payment_method?: string
  search?: string
  date_from?: string
  date_to?: string
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.status) qs.set('status', params.status)
  if (params.payment_method) qs.set('payment_method', params.payment_method)
  if (params.search) qs.set('search', params.search)
  if (params.date_from) qs.set('date_from', params.date_from)
  if (params.date_to) qs.set('date_to', params.date_to)

  return useQuery<{ payments: AdminPayment[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'payments', params],
    queryFn: async () => {
      const res = await api.get<{ payments: AdminPayment[]; meta: PaginatedMeta }>(
        `/admin/payments${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminSubscriptions(params: { page?: number } = {}) {
  const isReady = useIsAdminReady()
  return useQuery<{ subscriptions: AdminSubscription[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: async () => {
      const qs = params.page ? `?page=${params.page}` : ''
      const res = await api.get<{ subscriptions: AdminSubscription[]; meta: PaginatedMeta }>(
        `/admin/subscriptions${qs}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminAffiliates(params: { page?: number } = {}) {
  const isReady = useIsAdminReady()
  return useQuery<{ affiliates: AdminAffiliate[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'affiliates', params],
    queryFn: async () => {
      const qs = params.page ? `?page=${params.page}` : ''
      const res = await api.get<{ affiliates: AdminAffiliate[]; meta: PaginatedMeta }>(
        `/admin/affiliates${qs}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminTransfers(params: { page?: number } = {}) {
  const isReady = useIsAdminReady()
  return useQuery<{ transfers: AdminTransfer[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'transfers', params],
    queryFn: async () => {
      const qs = params.page ? `?page=${params.page}` : ''
      const res = await api.get<{ transfers: AdminTransfer[]; meta: PaginatedMeta }>(
        `/admin/transfers${qs}`)
      return res.data
    },
    enabled: isReady,
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useUpdateAdminUser() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      toast.success('Usuário atualizado!')
      emitCacheEvent({ type: 'admin:users:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar usuário')
    },
  })
}

export function useDeleteAdminUser() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success('Usuário deletado permanentemente')
      emitCacheEvent({ type: 'admin:all:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar usuário')
    },
  })
}

export function useAddBonus() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BonusInput }) =>
      api.post(`/admin/users/${userId}/bonus`, data),
    onSuccess: () => {
      toast.success('Bônus adicionado!')
      emitCacheEvent({ type: 'admin:all:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao adicionar bônus')
    },
  })
}

export function useUpdateAdminPersonal() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonalInput }) =>
      api.patch(`/admin/personals/${id}`, data),
    onSuccess: () => {
      toast.success('Personal atualizado!')
      emitCacheEvent({ type: 'admin:personals:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar personal')
    },
  })
}

export function useCreateAdminPayment() {
  return useMutation<{ data: AdminPaymentResponse }, Error, CreateAdminPaymentInput>({
    mutationFn: (data) =>
      api.post<AdminPaymentResponse>('/admin/payments', data),
    onSuccess: () => {
      toast.success('Cobrança criada!')
      emitCacheEvent({ type: 'admin:payments:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar cobrança')
    },
  })
}

export function useUpdateAdminPayment() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/admin/payments/${id}`, data),
    onSuccess: () => {
      toast.success('Pagamento atualizado!')
      emitCacheEvent({ type: 'admin:payments:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar pagamento')
    },
  })
}

// ============================================
// Admin Workouts
// ============================================

export interface AdminWorkout {
  id: string
  name: string
  status: string
  is_template: boolean
  ai_generated: boolean
  created_at: string
  updated_at: string
  personal_id: string
  student_id: string | null
  personal_name: string
  personal_email: string
  student_name: string | null
  student_email: string | null
  exercise_count: number
}

export function useAdminWorkouts(params: {
  page?: number
  per_page?: number
  search?: string
  status?: string
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)

  return useQuery<{ workouts: AdminWorkout[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'workouts', params],
    queryFn: async () => {
      const res = await api.get<{ workouts: AdminWorkout[]; meta: PaginatedMeta }>(
        `/admin/workouts${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminDeleteWorkout() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/workouts/${id}`),
    onSuccess: () => {
      toast.success('Treino deletado permanentemente')
      emitCacheEvent({ type: 'admin:workouts:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar treino')
    },
  })
}

// ============================================
// Admin Delete Payment
// ============================================

export function useAdminDeletePayment() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/payments/${id}`),
    onSuccess: () => {
      toast.success('Pagamento deletado permanentemente')
      emitCacheEvent({ type: 'admin:payments:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar pagamento')
    },
  })
}

// ============================================
// Admin Assessments
// ============================================

export interface AdminAssessment {
  id: string
  weight: number | null
  height: number | null
  body_fat: number | null
  notes: string | null
  created_at: string
  personal_id: string
  student_id: string
  personal_name: string
  student_name: string
}

export function useAdminAssessments(params: {
  page?: number
  search?: string
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.search) qs.set('search', params.search)

  return useQuery<{ assessments: AdminAssessment[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'assessments', params],
    queryFn: async () => {
      const res = await api.get<{ assessments: AdminAssessment[]; meta: PaginatedMeta }>(
        `/admin/assessments${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminDeleteAssessment() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/assessments/${id}`),
    onSuccess: () => {
      toast.success('Avaliação deletada permanentemente')
      emitCacheEvent({ type: 'admin:assessments:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar avaliação')
    },
  })
}

// ============================================
// Admin Students
// ============================================

export interface AdminStudent {
  id: string
  personal_id: string
  status: string
  student_type: string
  consultation_price: number | null
  created_at: string
  student_name: string
  student_email: string
  personal_name: string
  personal_email: string
}

export function useAdminStudents(params: {
  page?: number
  search?: string
} = {}) {
  const isReady = useIsAdminReady()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.search) qs.set('search', params.search)

  return useQuery<{ students: AdminStudent[]; meta: PaginatedMeta }>({
    queryKey: ['admin', 'students', params],
    queryFn: async () => {
      const res = await api.get<{ students: AdminStudent[]; meta: PaginatedMeta }>(
        `/admin/students${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useAdminDeleteStudent() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/students/${id}`),
    onSuccess: () => {
      toast.success('Aluno deletado permanentemente')
      emitCacheEvent({ type: 'admin:students:changed' })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao deletar aluno')
    },
  })
}
