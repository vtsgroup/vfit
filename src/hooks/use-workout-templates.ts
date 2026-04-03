/**
 * src/hooks/use-workout-templates.ts
 *
 * React Query hooks para workout templates
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  total_days: number
  estimated_duration_min: number
  is_premium: boolean
  image_emoji: string
  exercises_count: number
}

export function useWorkoutTemplates(filters?: { difficulty?: string; category?: string }) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['workout-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.difficulty) params.set('difficulty', filters.difficulty)
      if (filters?.category) params.set('category', filters.category)
      const qs = params.toString()
      const res = await api.get<WorkoutTemplate[]>(`/workout-templates${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useWorkoutTemplateDetail(id: string | null) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['workout-template', id],
    queryFn: async () => {
      const res = await api.get<WorkoutTemplate & { days: unknown[] }>(`/workout-templates/${id}`)
      return res.data
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
  })
}

export function getDifficultyLabel(d: string): string {
  switch (d) {
    case 'beginner': return 'Iniciante'
    case 'intermediate': return 'Intermediário'
    case 'advanced': return 'Avançado'
    default: return d
  }
}

export function getDifficultyColor(d: string): string {
  switch (d) {
    case 'beginner': return 'text-emerald-400 bg-emerald-400/10'
    case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
    case 'advanced': return 'text-red-400 bg-red-400/10'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function getCategoryLabel(c: string): string {
  switch (c) {
    case 'hypertrophy': return 'Hipertrofia'
    case 'strength': return 'Força'
    case 'cardio': return 'Cardio'
    case 'general': return 'Geral'
    default: return c
  }
}
