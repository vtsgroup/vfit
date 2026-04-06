/**
 * src/hooks/use-self-assessments.ts
 *
 * React Query hooks para auto-avaliações B2C
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ── Types ──────────────────────────────────────────────
export interface SelfAssessment {
  id: string
  weight_kg: number
  height_cm: number
  bmi: number
  bmi_category: string
  body_fat_percentage: number | null
  waist_cm: number | null
  hip_cm: number | null
  chest_cm: number | null
  arm_left_cm: number | null
  arm_right_cm: number | null
  thigh_left_cm: number | null
  thigh_right_cm: number | null
  calf_left_cm: number | null
  calf_right_cm: number | null
  activity_level: string | null
  goal: string | null
  notes: string | null
  created_at: string
}

export interface SelfAssessmentInput {
  weight_kg: number
  height_cm: number
  body_fat_percentage?: number
  waist_cm?: number
  hip_cm?: number
  chest_cm?: number
  arm_left_cm?: number
  arm_right_cm?: number
  thigh_left_cm?: number
  thigh_right_cm?: number
  calf_left_cm?: number
  calf_right_cm?: number
  activity_level?: string
  goal?: string
  notes?: string
}

// ── Hooks ──────────────────────────────────────────────
export function useSelfAssessments(limit = 20) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['self-assessments', limit],
    queryFn: async () => {
      const res = await api.get<SelfAssessment[]>(`/self-assessments?limit=${limit}`)
      return res.data
    },
    enabled: isReady,
  })
}

export function useSelfAssessmentDetail(id: string | null) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['self-assessment', id],
    queryFn: async () => {
      const res = await api.get<SelfAssessment>(`/self-assessments/${id}`)
      return res.data
    },
    enabled: isReady && !!id,
  })
}

export function useCreateSelfAssessment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: SelfAssessmentInput) => {
      const res = await api.post<SelfAssessment>('/self-assessments', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['self-assessments'] })
    },
  })
}

// ── Helpers ────────────────────────────────────────────
export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-400'
  if (bmi < 25) return 'text-brand-primary'
  if (bmi < 30) return 'text-yellow-400'
  return 'text-red-400'
}

export function getActivityLabel(level: string | null): string {
  switch (level) {
    case 'sedentary': return 'Sedentário'
    case 'light': return 'Levemente ativo'
    case 'moderate': return 'Moderadamente ativo'
    case 'active': return 'Ativo'
    case 'very_active': return 'Muito ativo'
    default: return 'Não informado'
  }
}

export function getGoalLabel(goal: string | null): string {
  switch (goal) {
    case 'lose_weight': return 'Perder peso'
    case 'gain_muscle': return 'Ganhar massa'
    case 'maintain': return 'Manter forma'
    case 'improve_health': return 'Melhorar saúde'
    default: return 'Não informado'
  }
}

/**
 * Auto-create self-assessment from onboarding data.
 * Call this on the home page — it fires once per session when:
 *   1) User has completed onboarding (user_onboarding exists)
 *   2) User has zero self_assessments
 * This bridges the gap: onboarding quiz → auto-avaliação.
 */
export function useAutoAssessmentFromOnboarding(
  hasOnboarding: boolean,
  assessmentsCount: number | undefined,
) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qc = useQueryClient()

  return useQuery({
    queryKey: ['auto-assessment-from-onboarding'],
    queryFn: async () => {
      const res = await api.post<{ assessment_id: string }>('/self-assessments/from-onboarding', {})
      // Invalidate assessments so the list refreshes
      qc.invalidateQueries({ queryKey: ['self-assessments'] })
      return res.data
    },
    enabled: isReady && hasOnboarding && assessmentsCount === 0,
    staleTime: Infinity, // Only fire once per session
    retry: false,
  })
}
