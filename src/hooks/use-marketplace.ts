/**
 * src/hooks/use-marketplace.ts
 *
 * Marketplace hooks — TanStack Query
 *
 * Exports: WorkoutPlan, PlanCategory, PlanDifficulty, CreatePlanInput, UpdatePlanInput
 * Hooks: useMutation, useQuery, useQueryClient, useRouter, useAuthStore, useMarketplacePlans
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Marketplace hooks — TanStack Query
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

export interface WorkoutPlan {
  id: string
  created_by: string
  creator_name: string
  title: string
  description: string
  category: PlanCategory
  difficulty: PlanDifficulty
  duration_weeks: number
  workouts_per_week: number
  price_brl: number
  is_published: boolean
  is_featured: boolean
  total_sales: number
  total_revenue: number
  plan_content: Record<string, unknown>
  thumbnail_url: string | null
  preview_video_url: string | null
  created_at: string
  updated_at: string
}

export type PlanCategory = 'hipertrofia' | 'emagrecimento' | 'funcional' | 'cardio' | 'flexibilidade' | 'outro'
export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface CreatePlanInput {
  title: string
  description: string
  category: PlanCategory
  difficulty: PlanDifficulty
  duration_weeks: number
  workouts_per_week: number
  price_brl: number
  plan_content: Record<string, unknown>
  thumbnail_url?: string | null
  preview_video_url?: string | null
}

export interface UpdatePlanInput {
  title?: string
  description?: string
  category?: PlanCategory
  difficulty?: PlanDifficulty
  duration_weeks?: number
  workouts_per_week?: number
  price_brl?: number
  plan_content?: Record<string, unknown>
  is_published?: boolean
  thumbnail_url?: string | null
  preview_video_url?: string | null
}

export interface PlansListResponse {
  plans: WorkoutPlan[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface PlansFilters {
  page?: number
  per_page?: number
  category?: PlanCategory
  difficulty?: PlanDifficulty
  search?: string
  sort?: 'created_at' | 'price_brl' | 'total_sales' | 'title'
  order?: 'asc' | 'desc'
}

// ============================================
// Hooks
// ============================================

/** Listar planos publicados do marketplace */
export function useMarketplacePlans(filters: PlansFilters = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.per_page) params.set('per_page', String(filters.per_page))
  if (filters.category) params.set('category', filters.category)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.search) params.set('search', filters.search)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)

  const qs = params.toString()

  return useQuery<PlansListResponse>({
    queryKey: ['marketplace', 'plans', filters],
    queryFn: async () => {
      const res = await api.get<PlansListResponse>(`/payments/plans${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

/** Detalhes de um plano */
export function usePlanDetail(planId: string | null) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<{ plan: WorkoutPlan }>({
    queryKey: ['marketplace', 'plan', planId],
    queryFn: async () => {
      const res = await api.get<{ plan: WorkoutPlan }>(`/payments/plans/${planId}`)
      return res.data
    },
    enabled: isReady && !!planId,
    ...APP_QUERY_CACHE.detail,
  })
}

/** Criar plano de treino */
export function useCreatePlan() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: CreatePlanInput) => {
      const res = await api.post('/payments/plans', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Plano criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      router.push('/dashboard/marketplace')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar plano')
    },
  })
}

/** Atualizar plano */
export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePlanInput & { id: string }) => {
      const res = await api.patch(`/payments/plans/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Plano atualizado!')
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar plano')
    },
  })
}

/** Deletar plano */
export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/plans/${id}`)
    },
    onSuccess: () => {
      toast.success('Plano removido!')
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover plano')
    },
  })
}

/** Comprar plano */
export function useBuyPlan() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (planId: string) => {
      const res = await api.post(`/payments/plans/${planId}/buy`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Plano comprado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      router.push('/dashboard/marketplace')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao comprar plano')
    },
  })
}

/** Meus planos criados (personal) */
export function useMyPlans(page = 1) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<PlansListResponse>({
    queryKey: ['marketplace', 'my-plans', page],
    queryFn: async () => {
      const res = await api.get<PlansListResponse>(`/payments/plans/my-plans?page=${page}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

/** Meus planos comprados */
export function useMyPurchases(page = 1) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<{ purchases: PurchasedPlan[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>({
    queryKey: ['marketplace', 'my-purchases', page],
    queryFn: async () => {
      const res = await api.get(`/payments/plans/my-purchases?page=${page}`)
      return res.data as { purchases: PurchasedPlan[]; meta: { page: number; per_page: number; total: number; total_pages: number } }
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export interface PurchasedPlan {
  id: string
  plan_id: string
  amount_paid: number
  purchased_at: string
  status: string
  delivered: boolean
  cloned_workout_ids: string[]
  title: string
  description: string
  category: PlanCategory
  difficulty: PlanDifficulty
  duration_weeks: number
  workouts_per_week: number
  thumbnail_url: string | null
  plan_content: Record<string, unknown>
  creator_name: string
}

// ============================================
// Helpers
// ============================================

export const categoryLabels: Record<PlanCategory, string> = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  funcional: 'Funcional',
  cardio: 'Cardio',
  flexibilidade: 'Flexibilidade',
  outro: 'Outro',
}

export const categoryIcons: Record<PlanCategory, string> = {
  hipertrofia: '',
  emagrecimento: '',
  funcional: '',
  cardio: '',
  flexibilidade: '',
  outro: '',
}

export const difficultyLabels: Record<PlanDifficulty, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

export const difficultyColors: Record<PlanDifficulty, string> = {
  beginner: 'bg-success/10 text-success',
  intermediate: 'bg-warning/10 text-warning',
  advanced: 'bg-error/10 text-error',
}
