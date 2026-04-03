/**
 * src/hooks/use-platform-subscription.ts
 *
 * Platform Subscription Hooks
 *
 * Exports: usePlatformSubscription, useUpgradePlan, useDowngradePlan, useCurrentPlan, PlatformPlanSlug
 * Hooks: useQuery, useMutation, useQueryClient, useAuthStore
 * Features: Auth guard · React Query
 */

// ============================================
// Platform Subscription — Hooks
// Manages personal trainer platform plan subscriptions
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { PLANS } from '@config/constants'
import { getB2BPrices } from '@lib/pricing'

/* ─── Types ─── */
export type PlatformPlanSlug = 'trial' | 'pro' | 'profissional' | 'max'
export type BillingCycle = 'monthly' | 'annual'

export interface PlatformSubscription {
  id: string
  personal_id: string
  plan_slug: PlatformPlanSlug
  billing_cycle: BillingCycle
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  amount: number
  payment_method: 'pix' | 'credit_card' | 'boleto'
  asaas_subscription_id: string | null
  created_at: string
}

export interface UpgradePlanInput {
  plan_slug: PlatformPlanSlug
  billing_cycle: BillingCycle
  payment_method: 'pix' | 'credit_card' | 'boleto'
}

export interface CheckoutSession {
  checkout_url: string
  payment_id: string
  plan_slug: PlatformPlanSlug
  amount: number
  due_date: string
  pix_qr_code?: string
  pix_copy_paste?: string
  boleto_url?: string
}

/* ─── Plan metadata (derived from config/constants.ts) ─── */
export const PLAN_PRICES: Record<PlatformPlanSlug, { monthly: number; annual: number }> = {
  trial: getB2BPrices('trial'),
  pro: getB2BPrices('pro'),
  profissional: getB2BPrices('profissional'),
  max: getB2BPrices('max'),
}

export const PLAN_NAMES: Record<PlatformPlanSlug, string> = {
  trial: PLANS.trial.name,
  pro: PLANS.pro.name,
  profissional: PLANS.profissional.name,
  max: PLANS.max.name,
}

export const PLAN_ORDER: PlatformPlanSlug[] = ['trial', 'pro', 'profissional', 'max']

/* ─── Hooks ─── */

/**
 * Get current user's platform subscription details
 */
export function usePlatformSubscription() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<PlatformSubscription | null>({
    queryKey: ['platform-subscription'],
    queryFn: async () => {
      const res = await api.get<{ subscription: PlatformSubscription | null }>('/platform/subscription')
      return res.data.subscription
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

/**
 * Get the current plan info from auth store (no API call)
 */
export function useCurrentPlan() {
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const planSlug = (personalProfile?.plan_type || 'trial') as PlatformPlanSlug
  const planIndex = PLAN_ORDER.indexOf(planSlug)

  return {
    slug: planSlug,
    name: PLAN_NAMES[planSlug],
    prices: PLAN_PRICES[planSlug],
    index: planIndex,
    isFree: planSlug === 'trial',
    isMax: planSlug === 'max',
    canUpgrade: planSlug !== 'max',
    canDowngrade: planSlug !== 'trial',
    isUpgradeFrom: (otherSlug: PlatformPlanSlug) => PLAN_ORDER.indexOf(otherSlug) > planIndex,
    isDowngradeFrom: (otherSlug: PlatformPlanSlug) => PLAN_ORDER.indexOf(otherSlug) < planIndex,
  }
}

/**
 * Create checkout session for plan upgrade
 */
export function useCreateCheckout() {
  const queryClient = useQueryClient()

  return useMutation<CheckoutSession, Error, UpgradePlanInput>({
    mutationFn: async (data) => {
      const res = await api.post<{ checkout: CheckoutSession }>('/platform/checkout', data)
      return res.data.checkout
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      toast.success(`Checkout criado para o plano ${PLAN_NAMES[data.plan_slug]}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar checkout')
    },
  })
}

/**
 * Upgrade to a new plan
 */
export function useUpgradePlan() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { plan_slug: PlatformPlanSlug; billing_cycle: BillingCycle }>({
    mutationFn: async (data) => {
      const res = await api.post<{ success: boolean }>('/platform/upgrade', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(`Upgrade para ${PLAN_NAMES[variables.plan_slug]} realizado!`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fazer upgrade')
    },
  })
}

/**
 * Downgrade to a lower plan
 */
export function useDowngradePlan() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { plan_slug: PlatformPlanSlug }>({
    mutationFn: async (data) => {
      const res = await api.post<{ success: boolean }>('/platform/downgrade', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(`Plano alterado para ${PLAN_NAMES[variables.plan_slug]}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao alterar plano')
    },
  })
}

/**
 * Cancel subscription (keeps active until end of billing period)
 */
export function useCancelPlatformSubscription() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      const res = await api.post<{ success: boolean }>('/platform/subscription/cancel')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      toast.success('Assinatura cancelada. Acesso mantido até o fim do período.')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cancelar assinatura')
    },
  })
}
