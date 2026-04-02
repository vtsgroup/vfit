// ============================================
// page.tsx — Criar exercício personalizado
// ============================================
//
// O que faz:
//   Formulário para criar novo exercício personalizado na biblioteca do personal.
//   Campos: nome, músculo alvo, equipamento, instrução e upload de mídia opcional.
//   Submit via useCreateExercise → redireciona para biblioteca de exercícios.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   CreateExercisePage — page component (client)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { MD3Input } from '@/components/ui/md3-input'
import { Button } from '@/components/ui/button'
import { useExerciseLibrary } from '@/hooks/use-workouts'

export default function CreateExercisePage() {
  const [search, setSearch] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState('')

  const { data, isLoading } = useExerciseLibrary({ search: search || undefined })
  const exercises = data ?? []

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
              <DSIcon name="plusCircle" className="text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Crie seu Exercício</h1>
              <p className="text-sm text-text-muted">
                Fluxo guiado para escolher um exercício da base e acelerar montagem de treino + mídia.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <MD3Input
              label="Buscar exercício base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício base..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-14 w-full animate-pulse rounded-xl border border-white/6 bg-white/3" />)}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
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
                  <p className="text-sm font-medium text-text-primary">{exercise.name_pt || exercise.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {exercise.difficulty} · {exercise.muscle_group_id}
                  </p>
                </button>
              ))}

              {exercises.length === 0 && (
                <p className="text-sm text-text-muted">Nenhum exercício encontrado.</p>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-border-light bg-bg-primary p-4">
            <p className="text-sm font-medium text-text-primary">
              {selectedExercise ? `Selecionado: ${selectedExercise.name_pt || selectedExercise.name}` : 'Selecione um exercício para continuar'}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Próximo passo recomendado: abrir no criador de treino ou enviar mídia específica do exercício.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={selectedExerciseId ? `/dashboard/workouts/create?exercise_id=${selectedExerciseId}` : '/dashboard/workouts/create'}>
                <Button disabled={!selectedExerciseId}>
                  <DSIcon name="sparkles" size={16} />
                  Usar no treino
                </Button>
              </Link>
              <Link href={selectedExerciseId ? `/dashboard/workouts/media/library?exercise_id=${selectedExerciseId}` : '/dashboard/workouts/media/library'}>
                <Button variant="outline" disabled={!selectedExerciseId}>
                  <DSIcon name="video" size={16} />
                  Gerenciar mídia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
