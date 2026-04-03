/**
 * src/hooks/use-vfit-checkout.ts
 *
 * B2C Subscription checkout & management hooks
 * Sprint S4 — Payment Infrastructure
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'

// ============================================
// Types
// ============================================

export interface SubscriptionStatus {
  plan: string
  plan_type?: string
  is_premium: boolean
  renews_at: string | null
  canceled_at: string | null
  billing_cycle: string | null
  price_paid: number | null
  limits: {
    ai_plans_per_month: number
    workouts_per_week: number
    ai_chat_messages: number
    exercise_library: string
    streak_freezes?: number
  }
}

export interface CheckoutInput {
  plan: 'premium' | 'premium_annual'
  cpf: string
}

export interface CheckoutResult {
  subscription_id: string
  plan: string
  amount: number
  pix: {
    qr_code_base64: string
    copy_paste: string
    expiration: string
  }
  asaas_payment_id: string
}

// ============================================
// Hooks
// ============================================

/**
 * Get current B2C subscription status
 */
export function useSubscriptionStatus() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await api.get<SubscriptionStatus>('/subscription/status')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

/**
 * Create B2C checkout (PIX payment)
 */
export function useVfitCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const res = await api.post<CheckoutResult>('/subscription/checkout', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-status'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao processar pagamento')
    },
  })
}

/**
 * Cancel B2C subscription
 */
export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ canceled: boolean; canceled_at: string }>('/subscription/cancel', {})
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-status'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao cancelar assinatura')
    },
  })
}
