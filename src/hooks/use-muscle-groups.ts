// =============================================================================
// use-muscle-groups.ts — Admin CRUD hooks para muscle groups (super_admin only)
// Hooks públicos (useMuscleGroups) estão em use-exercises.ts
// =============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiClientError, api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { MuscleGroup } from './use-exercises'

export type { MuscleGroup }

// ---------------------------------------------------------------------------
// Admin — lista completa com sub-músculos (super_admin)
// ---------------------------------------------------------------------------

interface AdminMuscleGroupsResponse {
  muscle_groups: (MuscleGroup & { exercise_count: number })[]
  total: number
  source?: 'admin' | 'public-fallback'
}

export function useMuscleGroupsAdmin() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['admin', 'muscle-groups'],
    queryFn: async () => {
      try {
        const res = await api.get<AdminMuscleGroupsResponse>('/admin/muscle-groups')
        return {
          ...res.data,
          source: 'admin',
        } satisfies AdminMuscleGroupsResponse
      } catch (error) {
        if (!(error instanceof ApiClientError) || ![401, 403, 404].includes(error.status)) {
          throw error
        }

        const fallback = await api.get<MuscleGroup[]>('/muscle-groups')
        const muscleGroups = (fallback.data ?? []).map((group) => ({
          ...group,
          exercise_count: 0,
        }))

        return {
          muscle_groups: muscleGroups,
          total: muscleGroups.length,
          source: 'public-fallback',
        } satisfies AdminMuscleGroupsResponse
      }
    },
    enabled: isReady,
    staleTime: 30 * 1000,
  })
}

// PATCH /admin/muscle-groups/:id
export function useUpdateMuscleGroup() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Pick<MuscleGroup, 'name' | 'name_pt' | 'description' | 'image_url' | 'animation_url' | 'image_male_url' | 'image_female_url' | 'color_hex' | 'display_order' | 'parent_id'>>
    }) => api.patch<{ muscle_group: MuscleGroup }>(`/admin/muscle-groups/${id}`, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'muscle-groups'] })
      void qc.invalidateQueries({ queryKey: ['muscle-groups'] })
    },
  })
}

// POST /admin/muscle-groups/:id/image — upload raw File, ?type=male|female
export function useUploadMuscleGroupImage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      file,
      type = 'male',
    }: {
      id: string
      file: File
      type?: 'male' | 'female'
    }) => api.uploadFile<{ url: string; field: string }>(`/admin/muscle-groups/${id}/image?type=${type}`, file),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'muscle-groups'] })
      void qc.invalidateQueries({ queryKey: ['muscle-groups'] })
      // Bust KV cache on next request via admin update
      void qc.invalidateQueries({ queryKey: ['admin', 'muscle-groups', id] })
    },
  })
}

// POST /admin/muscle-groups — criar sub-músculo
export function useCreateMuscleGroup() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; name: string; name_pt: string; parent_id?: string; color_hex?: string }) =>
      api.post<{ muscle_group: MuscleGroup }>('/admin/muscle-groups', data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'muscle-groups'] })
      void qc.invalidateQueries({ queryKey: ['muscle-groups'] })
    },
  })
}

// DELETE /admin/muscle-groups/:id
export function useDeleteMuscleGroup() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/admin/muscle-groups/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'muscle-groups'] })
      void qc.invalidateQueries({ queryKey: ['muscle-groups'] })
    },
  })
}
