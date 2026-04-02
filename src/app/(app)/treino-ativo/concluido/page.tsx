/**
 * src/app/(app)/treino-ativo/concluido/page.tsx
 *
 * Tela de conclusão do treino — Resumo + Records + XP
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { hapticSuccess } from '@/lib/haptics'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export default function TreinoConcluido() {
  const router = useRouter()
  const workout = useActiveWorkoutStore((s) => s.workout)
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout)
  const [records] = useState<Array<{ exercise_name: string; weight_kg: number }>>([])

  // Haptic on mount
  useEffect(() => {
    hapticSuccess()
  }, [])

  const summary = useMemo(() => {
    if (!workout) return null

    const startTime = new Date(workout.started_at).getTime()
    const durationSeconds = Math.floor((Date.now() - startTime - workout.total_pause_ms) / 1000)

    let totalSets = 0
    let totalReps = 0
    let totalVolume = 0
    let exercisesCompleted = 0

    for (const ex of workout.exercises) {
      if (ex.skipped) continue
      const completedSets = ex.sets.filter((s) => s.completed)
      if (completedSets.length > 0) exercisesCompleted++
      totalSets += completedSets.length
      totalReps += completedSets.reduce((sum, s) => sum + s.reps, 0)
      totalVolume += completedSets.reduce((sum, s) => sum + s.reps * s.weight_kg, 0)
    }

    const estimatedCalories = Math.round(totalSets * 5 + (durationSeconds / 60) * 3)

    return {
      duration_seconds: durationSeconds,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume_kg: Math.round(totalVolume),
      estimated_calories: estimatedCalories,
      exercises_completed: exercisesCompleted,
      exercises_skipped: workout.exercises.filter((e) => e.skipped).length,
    }
  }, [workout])

  if (!workout || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={() => router.push('/plano')}>Voltar ao plano</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-32 pt-8">
      {/* ─── Trophy ─── */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-primary/10">
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">Treino Concluído!</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workout.day_name} — Dia {workout.day_number}
        </p>
      </div>

      {/* ─── Stats grid ─── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard emoji="⏱️" label="Duração" value={formatDuration(summary.duration_seconds)} />
        <StatCard emoji="🔄" label="Sets" value={`${summary.total_sets}`} />
        <StatCard emoji="💪" label="Volume" value={`${summary.total_volume_kg}kg`} />
        <StatCard emoji="🔥" label="Calorias" value={`~${summary.estimated_calories}`} />
        <StatCard emoji="✅" label="Exercícios" value={`${summary.exercises_completed}`} />
        <StatCard emoji="⏭️" label="Pulados" value={`${summary.exercises_skipped}`} />
      </div>

      {/* ─── Personal Records ─── */}
      {records.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            🏆 Novos Records
          </h3>
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.exercise_name}
                className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
              >
                <span className="text-lg">🏅</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{r.exercise_name}</p>
                  <p className="text-xs text-amber-500 font-semibold">{r.weight_kg}kg — Novo recorde!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            cancelWorkout() // Clear session
            router.push('/plano')
          }}
        >
          <DSIcon name="home" className="h-5 w-5" />
          Voltar ao Plano
        </Button>
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border-primary bg-bg-secondary p-4 text-center">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-black text-text-primary">{value}</span>
      <span className="text-[10px] font-medium text-text-muted">{label}</span>
    </div>
  )
}
