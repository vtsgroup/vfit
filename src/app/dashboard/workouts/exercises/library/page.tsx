// ============================================
// page.tsx — Biblioteca de exercícios
// ============================================
//
// O que faz:
//   Listagem da biblioteca de exercícios com busca e filtros por músculo/equipamento.
//   Busca via useExerciseLibrary com debounce no input de busca.
//   Cards de exercício com botão de adicionar ao treino e link para mídia.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   ExerciseLibraryPage — page component (client)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { MD3Input } from '@/components/ui/md3-input'
import { Button } from '@/components/ui/button'
import { useExerciseLibrary } from '@/hooks/use-workouts'

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useExerciseLibrary({ search: search || undefined })
  const exercises = data ?? []

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
              <DSIcon name="bookOpen" className="text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Biblioteca de exercícios</h1>
              <p className="text-sm text-text-muted">
                Pesquise exercícios e reaproveite direto na criação de treino ou no cadastro de mídias.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <MD3Input
              label="Buscar exercício"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício por nome..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="rounded-xl border border-white/6 bg-white/3 p-3 sm:p-4"><div className="space-y-2"><div className="h-4 w-40 animate-pulse rounded bg-white/8" /><div className="h-3 w-28 animate-pulse rounded bg-white/5" /></div></div>)}
            </div>
          ) : exercises.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhum exercício encontrado para este filtro.</p>
          ) : (
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="rounded-xl border border-border-light bg-bg-primary p-3 sm:p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary truncate">{exercise.name_pt || exercise.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {exercise.difficulty} · {exercise.muscle_group_id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/workouts/create?exercise_id=${exercise.id}`}>
                        <Button size="sm">Usar no treino</Button>
                      </Link>
                      <Link href={`/dashboard/workouts/media/library?exercise_id=${exercise.id}`}>
                        <Button variant="outline" size="sm">
                          <DSIcon name="playCircle" size={16} />
                          Ver mídias
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
