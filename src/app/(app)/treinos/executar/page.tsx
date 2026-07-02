/**
 * src/app/(app)/treinos/executar/page.tsx
 *
 * Execução de treino atribuído pelo personal (B2B) no app do aluno.
 * Reusa WorkoutPlayer (sessão guiada) com retorno para /treinos.
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WorkoutPlayer } from '@/components/workouts/workout-player'
import { WorkoutExecuteSkeleton } from '@/components/ui/page-skeletons'

function ExecuteContent() {
  const params = useSearchParams()
  const id = params.get('id') || ''

  if (!id) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">Nenhum treino selecionado.</p>
      </div>
    )
  }

  return <WorkoutPlayer workoutId={id} backHref="/treinos" />
}

export default function ExecutarTreinoPage() {
  return (
    <Suspense fallback={<WorkoutExecuteSkeleton />}>
      <ExecuteContent />
    </Suspense>
  )
}
