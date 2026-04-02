/**
 * src/hooks/use-affiliates.ts
 *
 * Affiliates hooks — TanStack Query
 *
 * Exports: AffiliateDashboard, AffiliateLink, ReferralItem, CommissionItem, ReferralListResponse
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, useAffiliateDashboard, useAffiliateLink
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Affiliates hooks — TanStack Query
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

// ============================================
// Types
// ============================================

export interface AffiliateDashboard {
  activated: boolean
  message?: string
  affiliate?: {
    id: string
    referral_code: string
    commission_tier: string
    tier_name: string
    commission_percentage: number
    total_referrals: number
    active_referrals: number
    churned_referrals: number
    total_earned: number
    available_balance: number
    withdrawn_total: number
    lifetime_earnings: number
    bonus_5_referrals_claimed: boolean
    free_plan_active: boolean
  }
  next_tier: {
    tier: string
    name: string
    referrals_needed: number
  } | null
  this_month: {
    total: number
    count: number
  }
  recent_commissions: {
    id: string
    amount: number
    status: string
    created_at: string
  }[]
}

export interface AffiliateLink {
  referral_code: string
  referral_link: string
  qr_code_url: string
}

export interface ReferralItem {
  id: string
  status: string
  referral_date: string
  first_payment_date: string | null
  last_payment_date: string | null
  commission_percentage: number
  total_payments: number
  total_commission_earned: number
  referred_name: string
}

export interface CommissionItem {
  id: string
  amount: number
  commission_percentage: number
  status: string
  paid_at: string | null
  created_at: string
  referred_name: string
}

export interface ReferralListResponse {
  referrals: ReferralItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface CommissionListResponse {
  commissions: CommissionItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

// ============================================
// Query hooks
// ============================================

export function useAffiliateDashboard() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AffiliateDashboard>({
    queryKey: ['affiliates', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<AffiliateDashboard>('/affiliates/dashboard')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

export function useAffiliateLink() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AffiliateLink>({
    queryKey: ['affiliates', 'link'],
    queryFn: async () => {
      const res = await api.get<AffiliateLink>('/affiliates/link')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useReferrals(params: { page?: number; per_page?: number; status?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.status) qs.set('status', params.status)
  const q = qs.toString()

  return useQuery<ReferralListResponse>({
    queryKey: ['affiliates', 'referrals', params],
    queryFn: async () => {
      const res = await api.get<ReferralListResponse>(`/affiliates/referrals${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useCommissions(params: { page?: number; per_page?: number; status?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.per_page) qs.set('per_page', String(params.per_page))
  if (params.status) qs.set('status', params.status)
  const q = qs.toString()

  return useQuery<CommissionListResponse>({
    queryKey: ['affiliates', 'commissions', params],
    queryFn: async () => {
      const res = await api.get<CommissionListResponse>(`/affiliates/commissions${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useActivateAffiliate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { custom_referral_code?: string } | void) =>
      api.post('/affiliates/activate', data || {}),
    onSuccess: () => {
      toast.success('Programa de afiliados ativado!')
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao ativar afiliado')
    },
  })
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { amount: number; pix_key: string }) =>
      api.post('/affiliates/withdraw', data),
    onSuccess: () => {
      toast.success('Saque solicitado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['affiliates'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao solicitar saque')
    },
  })
}
