// ============================================
// use-exercise-media.ts — Hooks TanStack Query para mídia de exercícios
// ============================================
//
// O que faz:
//   Centraliza data fetching e mutações de mídia vinculada a exercícios.
//   Invalida automaticamente o cache após criar/editar/remover.
//
// Exports principais:
//   useExerciseMedia(exerciseId) → lista vídeos/thumbnails do exercício
//   useCreateExerciseMedia() → mutation — cria mídia
//   useUpdateExerciseMedia() → mutation — atualiza mídia
//   useDeleteExerciseMedia() → mutation — remove mídia
//
// Hooks usados: useQuery, useMutation, useQueryClient, useAuthStore
// Auth: enabled: isReady && !!exerciseId
// ============================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

export interface ExerciseMediaItem {
  id: string
  exercise_id: string
  video_url: string
  thumbnail_url: string | null
  setup_notes: string | null
  duration_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ExerciseMediaListResponse {
  items: ExerciseMediaItem[]
}

interface UploadResponse {
  type: 'video' | 'thumbnail'
  key: string
  content_type: string
  size_bytes: number
  url: string
}

export interface CreateExerciseMediaInput {
  video_url: string
  thumbnail_url?: string | null
  setup_notes?: string | null
  duration_seconds?: number
  is_active?: boolean
}

export type UpdateExerciseMediaInput = Partial<CreateExerciseMediaInput>

export function useExerciseMedia(exerciseId: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<ExerciseMediaItem[]>({
    queryKey: ['exercise-media', exerciseId],
    queryFn: async () => {
      const res = await api.get<ExerciseMediaListResponse>(`/exercises/${exerciseId}/media`)
      return res.data.items || []
    },
    enabled: isReady && !!exerciseId,
    ...APP_QUERY_CACHE.detail,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  })
}

export function useCreateExerciseMedia(exerciseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExerciseMediaInput) => {
      const res = await api.post<ExerciseMediaItem>(`/exercises/${exerciseId}/media`, input)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-media', exerciseId] })
      toast.success('Mídia adicionada com sucesso')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao adicionar mídia')
    },
  })
}

export function useUpdateExerciseMedia(exerciseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateExerciseMediaInput & { id: string }) => {
      const res = await api.put<ExerciseMediaItem>(`/exercises/${exerciseId}/media/${id}`, input)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-media', exerciseId] })
      toast.success('Mídia atualizada')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar mídia')
    },
  })
}

export function useDeleteExerciseMedia(exerciseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/exercises/${exerciseId}/media/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-media', exerciseId] })
      toast.success('Mídia removida')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover mídia')
    },
  })
}

export function useUploadExerciseMedia(exerciseId: string) {
  const token = useAuthStore((s) => s.tokens?.access_token)

  return useMutation({
    mutationFn: async ({
      file,
      type,
      onProgress,
    }: {
      file: File
      type: 'video' | 'thumbnail'
      onProgress?: (progress: number) => void
    }) => {
      if (!token) throw new Error('Token não encontrado')

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.iapersonal.app.br'}/api/v1/exercises/${exerciseId}/media/upload?type=${type}`
      const xhr = new XMLHttpRequest()

      const response = await new Promise<UploadResponse>((resolve, reject) => {
        xhr.open('POST', url)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.setRequestHeader('Content-Type', file.type)

        xhr.upload.onprogress = (event) => {
          if (!onProgress || !event.lengthComputable) return
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }

        xhr.onerror = () => reject(new Error('Falha de rede no upload'))

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || '{}')
            if (xhr.status < 200 || xhr.status >= 300 || !json?.success) {
              reject(new Error(json?.error?.message || `Upload falhou (${xhr.status})`))
              return
            }
            resolve(json.data as UploadResponse)
          } catch {
            reject(new Error('Resposta inválida no upload'))
          }
        }

        xhr.send(file)
      })

      return response
    },
  })
}
