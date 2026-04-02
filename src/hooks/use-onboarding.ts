/**
 * src/hooks/use-onboarding.ts
 *
 * Onboarding hooks — personal first-login wizard
 *
 * Exports: OnboardingState, OnboardingResponse, UpdateOnboardingInput, useOnboardingStatus, useUpdateOnboarding
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, useOnboardingStatus, useUpdateOnboarding
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Onboarding hooks — personal first-login wizard
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

export interface OnboardingState {
  has_completed_onboarding: boolean
  current_step: number
  completed_steps: number[]
  skipped_steps: number[]
  completed_at: string | null
  updated_at: string | null
}

export interface OnboardingResponse {
  onboarding: OnboardingState
}

export interface UpdateOnboardingInput {
  has_completed_onboarding?: boolean
  current_step?: number
  completed_steps?: number[]
  skipped_steps?: number[]
}

export function useOnboardingStatus() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery<OnboardingResponse>({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const res = await api.get<OnboardingResponse>('/users/me/onboarding')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
  })
}

export function useUpdateOnboarding() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateOnboardingInput) => {
      if (!isReady) throw new Error('auth_not_ready')
      const res = await api.patch<OnboardingResponse>('/users/me/onboarding', input)
      return res.data
    },
    onSuccess: (data) => {
      qc.setQueryData(['onboarding', 'status'], data)
      void qc.invalidateQueries({ queryKey: ['onboarding', 'status'] })
    },
  })
}
