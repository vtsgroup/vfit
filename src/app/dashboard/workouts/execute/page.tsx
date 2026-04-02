/**
 * src/app/dashboard/workouts/execute/page.tsx
 *
 * Execute Workout Page — Treino Interativo
 *
 * Exports: ExecutePage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Execute Workout Page — Treino Interativo
// ============================================

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

  return <WorkoutPlayer workoutId={id} />
}

export default function ExecutePage() {
  return (
    <Suspense
      fallback={
        <WorkoutExecuteSkeleton />
      }
    >
      <ExecuteContent />
    </Suspense>
  )
}
