/**
 * src/app/(app)/treino-ativo/page.tsx
 *
 * Tela de treino ativo — Core Tracking
 *
 * Features:
 * - Timer total do treino
 * - Exercício atual com tabela de sets (SET / REPS / PESO / ✓)
 * - Aquecimento diferenciado ("A")
 * - Checkbox animado ao completar set
 * - Adicionar set
 * - Marcar todos os sets
 * - Edição inline de reps e peso
 * - Navegação entre exercícios
 * - Preview do próximo exercício
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { RestTimer } from '@/components/treino/rest-timer'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { useCurrentPlan } from '@/hooks/use-plans'
import { requestWakeLock, releaseWakeLock } from '@/lib/wake-lock'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TreinoAtivoPage() {
  const router = useRouter()
  const { data: plan } = useCurrentPlan()
  const workout = useActiveWorkoutStore((s) => s.workout)
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout)
  const completeSet = useActiveWorkoutStore((s) => s.completeSet)
  const uncompleteSet = useActiveWorkoutStore((s) => s.uncompleteSet)
  const addSet = useActiveWorkoutStore((s) => s.addSet)
  const updateSetReps = useActiveWorkoutStore((s) => s.updateSetReps)
  const updateSetWeight = useActiveWorkoutStore((s) => s.updateSetWeight)
  const goToExercise = useActiveWorkoutStore((s) => s.goToExercise)
  const nextExercise = useActiveWorkoutStore((s) => s.nextExercise)
  const skipExercise = useActiveWorkoutStore((s) => s.skipExercise)
  const markAllSets = useActiveWorkoutStore((s) => s.markAllSets)
  const completeWorkout = useActiveWorkoutStore((s) => s.completeWorkout)
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout)

  const [elapsed, setElapsed] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [editingCell, setEditingCell] = useState<{ ex: number; set: number; field: 'reps' | 'weight' } | null>(null)
  const [restTimer, setRestTimer] = useState<{ seconds: number } | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Wake lock
  useEffect(() => {
    requestWakeLock()
    return () => { releaseWakeLock() }
  }, [])

  // Timer
  useEffect(() => {
    if (!workout || workout.status !== 'active') return
    const start = new Date(workout.started_at).getTime()
    const interval = setInterval(() => {
      setElapsed(Date.now() - start - workout.total_pause_ms)
    }, 1000)
    return () => clearInterval(interval)
  }, [workout])

  // Initialize from plan if no workout
  useEffect(() => {
    if (!workout && plan) {
      const currentDay = plan.days.find((d) => d.day_number === plan.current_day) || plan.days[0]
      if (currentDay) {
        startWorkout({
          plan_id: plan.id,
          plan_day_id: currentDay.id,
          day_number: currentDay.day_number,
          day_name: currentDay.name,
          exercises: currentDay.exercises.map((ex) => ({
            id: ex.id,
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name || 'Exercício',
            muscle_group: ex.muscle_group,
            sets: ex.sets,
            reps: ex.reps,
            weight_kg: ex.weight_kg,
            rest_seconds: ex.rest_seconds,
            is_superset: ex.is_superset,
            superset_group: ex.superset_group,
            notes: ex.notes,
          })),
        })
      }
    }
  }, [workout, plan, startWorkout])

  // Focus input
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleCompleteSet = useCallback((exIdx: number, setIdx: number) => {
    if (!workout) return
    const exercise = workout.exercises[exIdx]
    const s = exercise.sets[setIdx]
    if (s.completed) {
      uncompleteSet(exIdx, setIdx)
    } else {
      completeSet(exIdx, setIdx, s.reps, s.weight_kg)
      hapticSuccess()
      // Trigger rest timer if exercise has rest_seconds
      if (exercise.rest_seconds > 0) {
        setRestTimer({ seconds: exercise.rest_seconds })
      }
    }
  }, [workout, completeSet, uncompleteSet])

  const handleFinish = useCallback(() => {
    completeWorkout()
    releaseWakeLock()
    // Persist day completion for same-day blocking
    if (workout) {
      const today = new Date().toISOString().slice(0, 10)
      const key = `vfit_day_completed_${workout.plan_id}_${workout.day_number}`
      localStorage.setItem(key, today)
    }
    // TODO Sprint 15: navigate to completion screen
    router.push('/plano')
  }, [completeWorkout, router, workout])

  const handleCancel = useCallback(() => {
    cancelWorkout()
    releaseWakeLock()
    router.push('/plano')
  }, [cancelWorkout, router])

  // ─── No workout & no plan ───
  if (!workout && !plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <DSIcon name="dumbbell" size={48} className="mb-4 text-text-muted" />
        <p className="text-sm text-text-secondary">Nenhum treino em andamento.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/plano')}>
          Voltar ao plano
        </Button>
      </div>
    )
  }

  if (!workout) return null

  const currentEx = workout.exercises[workout.current_exercise_index]
  const nextEx = workout.exercises[workout.current_exercise_index + 1]
  const completedSets = currentEx.sets.filter((s) => s.completed).length
  const totalSets = currentEx.sets.length
  const allCompleted = currentEx.sets.every((s) => s.completed)

  // Workout progress
  const totalExercises = workout.exercises.length
  const completedExercises = workout.exercises.filter(
    (ex) => ex.skipped || ex.sets.every((s) => s.completed)
  ).length

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-bg-primary pb-32">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 border-b border-border-primary bg-bg-primary/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:text-red-400 transition-colors"
          >
            <DSIcon name="x" size={20} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase text-text-muted">
              Dia {workout.day_number} — {workout.day_name}
            </p>
            <p className="text-xl font-black tabular-nums text-text-primary">
              {formatTimer(elapsed)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-bold text-brand-primary"
          >
            Finalizar
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-500"
            style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* ─── Exercise navigator ─── */}
      <div className="flex gap-1.5 overflow-x-auto px-4 py-3">
        {workout.exercises.map((ex, i) => {
          const isActive = i === workout.current_exercise_index
          const isDone = ex.skipped || ex.sets.every((s) => s.completed)
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => { goToExercise(i); hapticLight() }}
              className={`flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-primary text-white'
                  : isDone
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : ex.skipped
                      ? 'bg-bg-secondary text-text-muted line-through'
                      : 'bg-bg-secondary text-text-secondary'
              }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* ─── Current exercise ─── */}
      <div className="px-4">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-lg font-bold text-text-primary">{currentEx.exercise_name}</h2>
          {currentEx.is_superset && (
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
              SUPER SET
            </span>
          )}
        </div>
        <p className="mb-4 text-xs text-text-muted">
          {currentEx.muscle_group || ''} · {completedSets}/{totalSets} sets
          {currentEx.notes && ` · ${currentEx.notes}`}
        </p>

        {/* ─── Sets table ─── */}
        <div className="overflow-hidden rounded-2xl border border-border-primary">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_1fr_48px] bg-bg-tertiary px-3 py-2">
            <span className="text-[10px] font-semibold uppercase text-text-muted">Set</span>
            <span className="text-center text-[10px] font-semibold uppercase text-text-muted">Reps</span>
            <span className="text-center text-[10px] font-semibold uppercase text-text-muted">Peso (kg)</span>
            <span className="text-right text-[10px] font-semibold uppercase text-text-muted">✓</span>
          </div>

          {/* Sets */}
          {currentEx.sets.map((s, setIdx) => {
            const exIdx = workout.current_exercise_index
            const isEditingReps = editingCell?.ex === exIdx && editingCell.set === setIdx && editingCell.field === 'reps'
            const isEditingWeight = editingCell?.ex === exIdx && editingCell.set === setIdx && editingCell.field === 'weight'

            return (
              <div
                key={s.id}
                className={`grid grid-cols-[48px_1fr_1fr_48px] items-center border-t border-border-primary px-3 py-2.5 transition-colors ${
                  s.completed ? 'bg-white/3' : 'bg-bg-secondary'
                }`}
              >
                {/* Set number / warmup */}
                <span className={`text-sm font-bold ${s.is_warmup ? 'text-amber-500' : 'text-text-primary'}`}>
                  {s.is_warmup ? 'A' : s.id}
                </span>

                {/* Reps */}
                <div className="flex justify-center">
                  {isEditingReps ? (
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="numeric"
                      className="w-14 rounded-lg bg-bg-tertiary px-2 py-1 text-center text-sm font-bold text-text-primary outline-none ring-2 ring-brand-primary"
                      defaultValue={s.reps}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val > 0) updateSetReps(exIdx, setIdx, val)
                        setEditingCell(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingCell({ ex: exIdx, set: setIdx, field: 'reps' })}
                      className="rounded-lg px-3 py-1 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      {s.reps}
                    </button>
                  )}
                </div>

                {/* Weight */}
                <div className="flex justify-center">
                  {isEditingWeight ? (
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      className="w-16 rounded-lg bg-bg-tertiary px-2 py-1 text-center text-sm font-bold text-text-primary outline-none ring-2 ring-brand-primary"
                      defaultValue={s.weight_kg}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val >= 0) updateSetWeight(exIdx, setIdx, val)
                        setEditingCell(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingCell({ ex: exIdx, set: setIdx, field: 'weight' })}
                      className="rounded-lg px-3 py-1 text-sm font-bold text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      {s.weight_kg}
                    </button>
                  )}
                </div>

                {/* Checkbox */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCompleteSet(exIdx, setIdx)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                      s.completed
                        ? 'bg-brand-primary text-white scale-110'
                        : 'border border-border-primary bg-bg-tertiary text-text-muted hover:border-brand-primary'
                    }`}
                  >
                    {s.completed && <DSIcon name="check" size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Actions ─── */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => { addSet(workout.current_exercise_index); hapticLight() }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-secondary py-2.5 text-xs font-medium text-text-secondary hover:text-brand-primary transition-colors"
          >
            <DSIcon name="plus" size={14} />
            Adicionar Set
          </button>
          {!allCompleted && (
            <button
              type="button"
              onClick={() => { markAllSets(workout.current_exercise_index); hapticSuccess() }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bg-secondary py-2.5 text-xs font-medium text-text-secondary hover:text-brand-primary transition-colors"
            >
              <DSIcon name="checkCheck" size={14} />
              Marcar Todos
            </button>
          )}
        </div>

        {/* ─── Skip ─── */}
        <button
          type="button"
          onClick={() => { skipExercise(workout.current_exercise_index); hapticLight() }}
          className="mt-2 w-full rounded-xl py-2 text-center text-xs font-medium text-text-muted hover:text-amber-500 transition-colors"
        >
          Pular exercício
        </button>

        {/* ─── Notes ─── */}
        {currentEx.notes && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              <DSIcon name="fileText" size={12} />
              {showNotes ? 'Ocultar notas' : 'Ver notas'}
            </button>
            {showNotes && (
              <p className="mt-2 rounded-xl bg-bg-secondary p-3 text-xs text-text-secondary">
                {currentEx.notes}
              </p>
            )}
          </div>
        )}

        {/* ─── Next exercise preview ─── */}
        {nextEx && (
          <div className="mt-6">
            <p className="mb-2 text-[10px] font-semibold uppercase text-text-muted">Próximo</p>
            <button
              type="button"
              onClick={() => { nextExercise(); hapticLight() }}
              className="flex w-full items-center gap-3 rounded-xl border border-border-primary bg-bg-secondary p-3 text-left hover:border-brand-primary/30 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                <span className="text-sm font-bold text-text-muted">{workout.current_exercise_index + 2}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{nextEx.exercise_name}</p>
                <p className="text-xs text-text-muted">
                  {nextEx.planned_sets}x{nextEx.planned_reps}
                  {nextEx.planned_weight_kg ? ` · ${nextEx.planned_weight_kg}kg` : ''}
                </p>
              </div>
              <DSIcon name="chevronRight" size={16} className="text-text-muted" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Floating CTA — Next exercise / Finish ─── */}
      <div className="fixed inset-x-0 bottom-4 z-30 px-4">
        <div className="mx-auto max-w-lg">
          {allCompleted && nextEx ? (
            <Button
              size="lg"
              className="w-full"
              onClick={() => { nextExercise(); hapticSuccess() }}
            >
              <DSIcon name="chevronRight" className="h-5 w-5" />
              Próximo Exercício
            </Button>
          ) : allCompleted && !nextEx ? (
            <Button
              size="lg"
              className="w-full"
              onClick={handleFinish}
            >
              <DSIcon name="check" className="h-5 w-5" />
              Finalizar Treino 🎉
            </Button>
          ) : null}
        </div>
      </div>

      {/* ─── Rest Timer ─── */}
      {restTimer && (
        <RestTimer
          seconds={restTimer.seconds}
          onComplete={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
          onAdjust={(delta) => setRestTimer((prev) => prev ? { seconds: Math.max(5, prev.seconds + delta) } : null)}
        />
      )}

      {/* ─── Cancel confirm modal ─── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-bg-primary p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <span className="text-3xl">🏋️</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Cancelar treino?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Seu progresso neste treino será perdido.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Continuar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancelar treino
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
