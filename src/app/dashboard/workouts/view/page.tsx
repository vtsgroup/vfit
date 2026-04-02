/**
 * src/app/dashboard/workouts/view/page.tsx
 *
 * Workout View Page — /dashboard/workouts/view?id=xxx
 *
 * Exports: WorkoutViewPage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Workout View Page — /dashboard/workouts/view?id=xxx
// ============================================

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import WorkoutDetailClient from '@/components/workouts/workout-detail'
import { WorkoutDetailSkeleton } from '@/components/ui/page-skeletons'

function WorkoutViewContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''

  if (!id) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">ID do treino não informado.</p>
        <a
          href="/dashboard/workouts"
          className="mt-2 inline-block text-sm text-brand-primary hover:underline"
        >
          Voltar para treinos
        </a>
      </div>
    )
  }

  return <WorkoutDetailClient id={id} />
}

export default function WorkoutViewPage() {
  return (
    <Suspense
      fallback={
        <WorkoutDetailSkeleton />
      }
    >
      <WorkoutViewContent />
    </Suspense>
  )
}
