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
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { PLANS } from '@config/constants'
import { getB2BPrices } from '@lib/pricing'

const DEPRECATED_CREATOR_BILLING_MESSAGE =
  'Cobrança de planos para profissionais foi descontinuada. Use monetização por alunos e consultorias no VFIT.'

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
    queryFn: async () => null,
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
    canUpgrade: false,
    canDowngrade: false,
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
    mutationFn: async () => {
      throw new Error(DEPRECATED_CREATOR_BILLING_MESSAGE)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
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
    mutationFn: async () => {
      throw new Error(DEPRECATED_CREATOR_BILLING_MESSAGE)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
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
    mutationFn: async () => {
      throw new Error(DEPRECATED_CREATOR_BILLING_MESSAGE)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
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
      throw new Error(DEPRECATED_CREATOR_BILLING_MESSAGE)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-subscription'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cancelar assinatura')
    },
  })
}
