// ============================================
// page.tsx — Biblioteca de mídia de exercícios
// ============================================
//
// O que faz:
//   Listagem de vídeos e thumbnails de exercícios cadastrados.
//   Filtragem por exercício via useSearchParams(?exerciseId=).
//   Upload de nova mídia via ExerciseMediaUpload.
//   Preview de vídeo inline com ExerciseVideoPlayer.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   MediaLibraryPage — page component (client)
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { MD3Input } from '@/components/ui/md3-input'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { useExerciseLibrary } from '@/hooks/use-workouts'
import { ExerciseVideoPlayer } from '@/components/workouts/exercise-video-player'
import { ExerciseMediaUpload } from '@/components/workouts/exercise-media-upload'

export default function MediaLibraryPage() {
  const searchParams = useSearchParams()
  const initialExerciseId = searchParams.get('exercise_id') || ''

  const [search, setSearch] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseId)

  const { data, isLoading } = useExerciseLibrary({ search: search || undefined })
  const exercises = data ?? []

  useEffect(() => {
    if (initialExerciseId) {
      setSelectedExerciseId(initialExerciseId)
    }
  }, [initialExerciseId])

  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId)

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6">
        <Link
          href="/dashboard/workouts"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para treinos
        </Link>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-xl bg-brand-primary/10 p-2 shrink-0">
              <DSIcon name="images" className="text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Biblioteca de mídias</h1>
              <p className="text-sm text-text-muted">
                Selecione um exercício, visualize a mídia atual e envie novos vídeos/imagens.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <MD3Input
              label="Buscar exercício"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício para gerenciar mídias..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-xl border border-white/6 bg-white/3" />)}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="space-y-2 max-h-115 overflow-auto pr-1">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setSelectedExerciseId(exercise.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedExerciseId === exercise.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-light bg-bg-primary hover:border-brand-primary/30'
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary line-clamp-1">{exercise.name_pt || exercise.name}</p>
                    <p className="text-xs text-text-muted mt-1">{exercise.difficulty}</p>
                  </button>
                ))}

                {exercises.length === 0 && (
                  <p className="text-sm text-text-muted">Nenhum exercício encontrado.</p>
                )}
              </div>

              <div className="space-y-4">
                {selectedExerciseId ? (
                  <>
                    <div className="rounded-xl border border-border-light bg-bg-primary p-3">
                      <p className="text-sm font-medium text-text-primary">
                        {selectedExercise?.name_pt || selectedExercise?.name || 'Exercício selecionado'}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">ID: {selectedExerciseId}</p>
                    </div>

                    <ExerciseVideoPlayer exerciseId={selectedExerciseId} />
                    <ExerciseMediaUpload exerciseId={selectedExerciseId} />
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border-light bg-bg-primary p-6 text-sm text-text-muted">
                    Selecione um exercício para gerenciar a biblioteca de mídias.
                  </div>
                )}

                <Link href="/dashboard/workouts/create">
                  <Button variant="outline">Abrir criador de treino</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
