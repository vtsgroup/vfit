/**
 * src/app/dashboard/admin/exercises/page.tsx
 *
 * Admin Exercícios — Super Admin
 * Upload/substituição de imagem de thumbnail por exercício.
 * Invalida KV cache no backend após upload (T3.3, T3.7).
 *
 * Exports: AdminExercisesPage
 * Features: Auth: super_admin · listagem D1 · upload R2 · preview · search
 */

// ============================================
// Admin Exercícios — super_admin only
// ============================================

'use client'

import { useRef, useState, useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { MD3Input } from '@/components/ui/md3-input'
import { toast } from '@/stores/app-store'
import { useExercises, useMuscleGroups, type Exercise } from '@/hooks/use-exercises'
import { api } from '@/lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

// ─── Image Cell ─────────────────────────────────────────────────────────────

function ExerciseImageCell({
  exercise,
  onUploadDone,
}: {
  exercise: Exercise
  onUploadDone: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [removing, setRemoving] = useState(false)

  const currentImageUrl = (() => {
    if (exercise.image_urls) {
      try { return (JSON.parse(exercise.image_urls) as string[])[0] || null } catch { return null }
    }
    return exercise.thumbnail_url || null
  })()

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem excede 2MB')
      return
    }

    setUploading(true)
    try {
      await api.uploadFile(`/exercises/${exercise.id}/media/upload?type=thumbnail`, file)
      toast.success(`Imagem de "${exercise.name_pt}" atualizada`)
      onUploadDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!currentImageUrl) return
    setRemoving(true)
    try {
      await api.delete(`/exercises/${exercise.id}/media/image`)
      toast.success(`Imagem de "${exercise.name_pt}" removida`)
      onUploadDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover imagem')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="group relative flex h-14 w-14 shrink-0 items-center justify-center">
      {currentImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentImageUrl}
          alt={exercise.name_pt}
          className="h-14 w-14 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border-light bg-bg-tertiary">
          <DSIcon name="image" size={18} className="text-text-muted" />
        </div>
      )}

      {/* Remove button — only when image exists */}
      {currentImageUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void handleRemove()
          }}
          disabled={removing || uploading}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-red-700 disabled:opacity-40"
          title="Remover imagem"
        >
          {removing ? (
            <div className="h-2.5 w-2.5 animate-spin rounded-full border border-white border-t-transparent" />
          ) : (
            <DSIcon name="x" size={10} className="text-white" />
          )}
        </button>
      )}

      {/* Upload overlay */}
      <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <DSIcon name={currentImageUrl ? 'edit' : 'upload'} size={16} className="text-white" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminExercisesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: exercisesData, isLoading, refetch } = useExercises({
    q: search || undefined,
    muscle_group: muscleFilter || undefined,
    page,
    per_page: 50,
  })

  const { data: muscleGroups = [] } = useMuscleGroups()

  const muscleGroupMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const mg of muscleGroups) map.set(mg.id, mg.name_pt || mg.name)
    return map
  }, [muscleGroups])

  const exercises = exercisesData?.exercises ?? []
  const meta = exercisesData?.meta

  const withImage = exercises.filter((e) => {
    if (e.image_urls) { try { return (JSON.parse(e.image_urls) as string[]).length > 0 } catch { return false } }
    return !!e.thumbnail_url
  }).length

  function onUploadDone() {
    void refetch()
    queryClient.invalidateQueries({ queryKey: ['exercises'] })
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Imagens de Exercícios</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              Passe o mouse sobre a imagem para substituí-la · Cache invalidado automaticamente após upload
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <DSIcon name="image" size={16} className="text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500">
              {isLoading ? '–' : `${withImage}/${exercises.length}`} com imagem
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-52">
            <MD3Input
              label="Buscar exercício"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Nome em PT ou EN..."
            />
          </div>
          <div className="min-w-48">
            <select
              className="h-12 w-full rounded-xl border border-border-primary bg-bg-secondary px-3 text-sm text-text-primary"
              value={muscleFilter}
              onChange={(e) => { setMuscleFilter(e.target.value); setPage(1) }}
            >
              <option value="">Todos os músculos</option>
              {muscleGroups.filter((mg) => !mg.parent_id).map((mg) => (
                <option key={mg.id} value={mg.id}>{mg.name_pt || mg.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-bg-secondary" />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <DSIcon name="search" size={32} className="mb-3 text-text-muted" />
            <p className="text-text-secondary">Nenhum exercício encontrado</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-primary bg-bg-secondary overflow-hidden">
            <div className="divide-y divide-border-primary">
              {exercises.map((exercise) => {
                const mgName = muscleGroupMap.get(exercise.muscle_group_id) ?? exercise.muscle_group_id
                const hasImage = (() => {
                  if (exercise.image_urls) { try { return (JSON.parse(exercise.image_urls) as string[]).length > 0 } catch { return false } }
                  return !!exercise.thumbnail_url
                })()

                return (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-bg-tertiary transition-colors"
                  >
                    <ExerciseImageCell exercise={exercise} onUploadDone={onUploadDone} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{exercise.name_pt}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-text-muted">{mgName}</span>
                        <span className="text-[10px] text-text-muted">·</span>
                        <span className={cn(
                          'text-[10px] font-medium',
                          exercise.difficulty === 'beginner' ? 'text-emerald-500' :
                          exercise.difficulty === 'intermediate' ? 'text-amber-500' : 'text-red-400'
                        )}>
                          {exercise.difficulty === 'beginner' ? 'Iniciante' :
                           exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {hasImage ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                          <DSIcon name="check" size={10} />
                          Imagem
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-500">
                          Sem imagem
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {meta.total} exercícios · Página {meta.page}/{meta.total_pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <DSIcon name="chevronLeft" size={14} />
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.total_pages}
              >
                Próxima
                <DSIcon name="chevronRight" size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
