/**
 * src/hooks/use-measurements.ts
 *
 * React Query hooks para tracking de medidas corporais
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Types
// ============================================

export interface BodyMeasurement {
  id: string
  measured_at: string
  weight_kg: number | null
  height_cm: number | null
  body_fat_percentage: number | null
  bmi: number | null
  chest_cm: number | null
  waist_cm: number | null
  hip_cm: number | null
  arm_left_cm: number | null
  arm_right_cm: number | null
  thigh_left_cm: number | null
  thigh_right_cm: number | null
  calf_left_cm: number | null
  calf_right_cm: number | null
  notes: string | null
  created_at: string
}

export interface MeasurementInput {
  weight_kg?: number
  height_cm?: number
  body_fat_percentage?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  arm_left_cm?: number
  arm_right_cm?: number
  thigh_left_cm?: number
  thigh_right_cm?: number
  calf_left_cm?: number
  calf_right_cm?: number
  notes?: string
  measured_at?: string
}

// ============================================
// Hooks
// ============================================

export function useMeasurementHistory(limit = 50) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<BodyMeasurement[]>({
    queryKey: ['measurements', 'history', limit],
    queryFn: async () => {
      const res = await api.get<BodyMeasurement[]>(`/measurements/history?limit=${limit}`)
      return res.data
    },
    enabled: isReady,
    staleTime: 2 * 60 * 1000,
  })
}

export function useLatestMeasurement() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<BodyMeasurement | null>({
    queryKey: ['measurements', 'latest'],
    queryFn: async () => {
      const res = await api.get<BodyMeasurement | null>('/measurements/latest')
      return res.data
    },
    enabled: isReady,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSaveMeasurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MeasurementInput) => {
      const res = await api.post<{ id: string; bmi: number | null }>('/measurements', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] })
    },
  })
}

// ============================================
// BMI helpers
// ============================================

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' }
  if (bmi < 25) return { label: 'Peso normal', color: 'text-brand-primary' }
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-400' }
  if (bmi < 35) return { label: 'Obesidade I', color: 'text-orange-400' }
  if (bmi < 40) return { label: 'Obesidade II', color: 'text-red-400' }
  return { label: 'Obesidade III', color: 'text-red-500' }
}
