// ============================================
// workout-player.tsx — Player de execução de treino em tempo real
// ============================================
//
// O que faz:
//   Interface de execução de treino: série atual, rep/carga, timer de descanso.
//   Avança séries via useAdvanceSession. Loga reps/carga via useLogExercise.
//   Completa treino via useCompleteSession com celebração WorkoutCompletionCelebration.
//   Exibe ExerciseVideoPlayer para demonstração do exercício atual.
//
// Exports principais:
//   WorkoutPlayer — player completo de execução de treino
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { RestTimer } from './rest-timer'
import { Button } from '@/components/ui/button'
import { ExerciseVideoPlayer } from './exercise-video-player'
import { WorkoutCompletionCelebration } from './workout-completion'
import {
  useAdvanceSession,
  useCompleteSession,
  useLogSession,
  useResetSession,
  useWorkoutSession,
} from '@/hooks/use-workout-session'
import { WorkoutExecuteSkeleton } from '@/components/ui/page-skeletons'
import { cacheWorkoutForOffline } from '@/lib/offline-workout'

export function WorkoutPlayer({ workoutId }: { workoutId: string }) {
  const { data, isLoading } = useWorkoutSession(workoutId)
  const advance = useAdvanceSession(workoutId)
  const logMutation = useLogSession(workoutId)
  const complete = useCompleteSession(workoutId)
  const reset = useResetSession(workoutId)

  const [repsDone, setRepsDone] = useState('')
  const [loadUsed, setLoadUsed] = useState('')

  // S08-08: Pre-cache workout for offline use
  useEffect(() => {
    if (workoutId) {
      cacheWorkoutForOffline(workoutId).catch(() => {})
    }
  }, [workoutId])

  const exercises = useMemo(() => data?.exercises || [], [data?.exercises])
  const session = data?.session

  const currentExercise = session ? exercises[session.current_exercise_index] : undefined
  const nextExercise = session ? exercises[session.current_exercise_index + 1] : undefined

  if (isLoading) return <WorkoutExecuteSkeleton />
  if (!data || !session) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">Sessão não encontrada.</p>
      </div>
    )
  }

  const isBusy = advance.isPending || logMutation.isPending || complete.isPending || reset.isPending

  async function handleCompleteExercise() {
    if (!currentExercise) return

    await logMutation.mutateAsync({
      exercise_id: currentExercise.exercise_id,
      sets_done: 1,
      reps_done: repsDone || null,
      load_used: loadUsed || null,
      notes: null,
    })

    setRepsDone('')
    setLoadUsed('')
    await advance.mutateAsync({})
  }

  async function handleCompleteWorkout() {
    await complete.mutateAsync()
  }

  const progress = exercises.length > 0
    ? Math.min(100, Math.round(((session.current_exercise_index + (session.phase === 'completed' ? 1 : 0)) / exercises.length) * 100))
    : 0

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-4 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary">
        <DSIcon name="arrowLeft" size={16} />
        Voltar
      </Link>

      <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
          <span>{data.workout.name}</span>
          <span className="flex items-center gap-1"><DSIcon name="clock" size={12} />{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
          <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {session.phase === 'exercise' && currentExercise && (
        <div className="space-y-4 rounded-xl border border-border-light bg-bg-secondary p-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <DSIcon name="dumbbell" size={16} />
            Exercício {session.current_exercise_index + 1} de {Math.max(1, exercises.length)}
          </div>

          <h2 className="text-xl font-semibold text-text-primary">{currentExercise.exercise_id}</h2>

          <ExerciseVideoPlayer exerciseId={currentExercise.exercise_id} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <input
                value={repsDone}
                onChange={(e) => setRepsDone(e.target.value)}
                placeholder={`Reps (meta: ${currentExercise.reps})`}
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm"
              />
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setRepsDone(String(Math.max(0, Number(repsDone || currentExercise.reps || 0) - 1)))}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg border border-border-light bg-bg-tertiary text-xs font-medium text-text-muted transition-colors hover:bg-white/8 active:scale-95"
                >
                  −1 rep
                </button>
                <button
                  type="button"
                  onClick={() => setRepsDone(String(Number(repsDone || currentExercise.reps || 0) + 1))}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg border border-border-light bg-bg-tertiary text-xs font-medium text-text-muted transition-colors hover:bg-white/8 active:scale-95"
                >
                  +1 rep
                </button>
              </div>
            </div>
            <div>
              <input
                value={loadUsed}
                onChange={(e) => setLoadUsed(e.target.value)}
                placeholder="Carga usada (kg)"
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm"
              />
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLoadUsed(String(Math.max(0, Number(loadUsed || 0) - 2.5)))}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg border border-border-light bg-bg-tertiary text-xs font-medium text-text-muted transition-colors hover:bg-white/8 active:scale-95"
                >
                  −2.5kg
                </button>
                <button
                  type="button"
                  onClick={() => setLoadUsed(String(Number(loadUsed || 0) + 2.5))}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg border border-border-light bg-bg-tertiary text-xs font-medium text-text-muted transition-colors hover:bg-white/8 active:scale-95"
                >
                  +2.5kg
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button className="w-full" onClick={handleCompleteExercise} disabled={isBusy}>
              <DSIcon name="play" size={16} className="mr-2" />
              Concluir exercício
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => advance.mutate({ force_phase: 'next_preview' })} disabled={isBusy}>
              Pular para próximo
            </Button>
          </div>
        </div>
      )}

      {session.phase === 'rest' && (
        <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
          <RestTimer
            totalSeconds={Math.max(1, session.rest_remaining_seconds || 30)}
            onComplete={() => advance.mutate({})}
            onSkip={() => advance.mutate({ force_phase: 'next_preview' })}
            nextExerciseName={nextExercise?.exercise_id || 'Finalizando treino'}
          />
        </div>
      )}

      {session.phase === 'next_preview' && (
        <div className="space-y-3 rounded-xl border border-border-light bg-bg-secondary p-4">
          <p className="text-xs text-text-muted">Próximo exercício</p>
          <p className="text-lg font-semibold text-text-primary">{nextExercise?.exercise_id || 'Último bloco'}</p>
          <Button className="w-full" onClick={() => advance.mutate({})} disabled={isBusy}>
            <DSIcon name="play" size={16} className="mr-2" />
            Iniciar próximo
          </Button>
        </div>
      )}

      {session.phase === 'completed' && (
        <WorkoutCompletionCelebration
          xpEarned={complete.data?.xp_earned}
          xpBalance={complete.data?.xp_balance}
          streakMilestones={complete.data?.streak_milestones}
          onFinalize={handleCompleteWorkout}
          onReplay={() => reset.mutate()}
          isBusy={isBusy}
          isFinalized={!!complete.data}
        />
      )}
    </div>
  )
}
