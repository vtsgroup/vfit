/**
 * src/hooks/use-b2c-onboarding.ts
 *
 * Hook para verificar se o onboarding B2C (quiz VFIT) foi completado.
 * Usado pelo dashboard para redirecionar student para /welcome se ainda não fez o quiz.
 *
 * Endpoint: GET /api/v1/onboarding → { completed: boolean, data: ... | null }
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

interface B2COnboardingResponse {
  completed: boolean
  data: Record<string, unknown> | null
}

/**
 * Checa se o onboarding B2C foi completado.
 * @param enabled — passa `true` apenas quando effectiveType === 'student'
 */
export function useB2COnboardingCompleted(enabled: boolean) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery<B2COnboardingResponse>({
    queryKey: ['b2c-onboarding', 'status', userId || 'anonymous'],
    queryFn: async () => {
      const res = await api.get<B2COnboardingResponse>('/onboarding')
      return res.data
    },
    enabled: isReady && enabled && !!userId,
    staleTime: 30_000,
  })
}
