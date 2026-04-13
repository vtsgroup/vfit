/**
 * src/hooks/use-exercises.ts
 *
 * Exercises Library — React Query hooks
 *
 * Exports: useExercises, useMuscleGroups, Exercise, MuscleGroup
 *
 * NOTE: No auth guard needed — these are PUBLIC endpoints serving cold data from D1.
 * The backend routes /exercises and /muscle-groups do NOT require authMiddleware.
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

// ============================================
// Types
// ============================================

export interface Exercise {
  id: string
  name: string
  name_pt: string
  muscle_group_id: string
  description: string | null
  description_pt: string | null
  video_url_vertical: string | null
  video_url_horizontal: string | null
  thumbnail_url: string | null
  transcription_pt: string | null
  transcription_en: string | null
  coaching_cues: string | null
  tags: string | null
  image_urls: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  equipment_needed: string // JSON array string
  is_default: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface MuscleGroup {
  id: string
  name: string
  name_pt: string
  icon_svg: string | null
  description: string | null
  display_order: number
  // Anatomy / media fields (added in migration 0003)
  image_url: string | null
  animation_url: string | null
  image_male_url: string | null
  image_female_url: string | null
  color_hex: string | null
  parent_id: string | null
  sub_muscles?: MuscleGroup[]
}

interface ExercisesResult {
  exercises: Exercise[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// ============================================
// Hooks
// ============================================

export function useExercises(params?: {
  muscle_group?: string
  difficulty?: string
  q?: string
  page?: number
  per_page?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.muscle_group) searchParams.set('muscle_group', params.muscle_group)
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty)
  if (params?.q) searchParams.set('q', params.q)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.per_page) searchParams.set('per_page', String(params.per_page))

  const qs = searchParams.toString()

  return useQuery<ExercisesResult>({
    queryKey: ['exercises', params?.muscle_group, params?.difficulty, params?.q, params?.page, params?.per_page],
    queryFn: async () => {
      const res = await api.get<Exercise[]>(`/exercises${qs ? `?${qs}` : ''}`)
      return { exercises: res.data, meta: res.meta as ExercisesResult['meta'] }
    },
    staleTime: 10 * 60 * 1000, // 10min — cold data
  })
}

export function useMuscleGroups() {
  return useQuery<MuscleGroup[]>({
    queryKey: ['muscle-groups'],
    queryFn: async () => {
      const res = await api.get<MuscleGroup[]>('/muscle-groups')
      return res.data
    },
    staleTime: 2 * 60 * 1000, // 2min — permite refletir updates de mídia sem delay longo
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export interface ExerciseDetail extends Exercise {
  muscle_group: MuscleGroup | null
}

export function useExerciseDetail(id: string | null) {
  return useQuery<ExerciseDetail>({
    queryKey: ['exercises', 'detail', id],
    queryFn: async () => {
      const res = await api.get<ExerciseDetail>(`/exercises/${id}`)
      return res.data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}
