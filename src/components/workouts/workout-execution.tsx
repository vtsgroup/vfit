/**
 * src/components/workouts/workout-execution.tsx
 *
 * Workout Execution — Treino Interativo Step-by-Step
 *
 * Exports: WorkoutExecution
 * Hooks: useState, useMemo, useEffect, useCallback, useWorkout, useExerciseLibrary
 * Features: 'use client' · DSIcon
 */

// ============================================
// Workout Execution — Treino Interativo Step-by-Step
// ============================================

'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import {
  useWorkout,
  useExerciseLibrary,
  useCompleteWorkout,
} from '@/hooks/use-workouts'
import { Button } from '@/components/ui/button'
import { WorkoutExecuteSkeleton } from '@/components/ui/page-skeletons'
import { RestTimer } from './rest-timer'
import { XPEarnedBanner } from './gamification-card'

// ============================================
// Types
// ============================================

type Phase = 'overview' | 'active' | 'rest' | 'summary' | 'complete'

interface SetResult {
  reps: string
  load: string
  completed: boolean
}

interface ExerciseResult {
  exercise_id: string
  sets: SetResult[]
  notes: string
}

interface CompletionData {
  stats: {
    total_workouts: number
    current_streak: number
    longest_streak: number
    xp_earned: number
  }
  new_badges: Array<{ type: string; name: string; icon: string }>
  duration_minutes: number
}

const FEELINGS = [
  { value: 'great' as const, icon: 'smile' as const, label: 'Ótimo', color: 'text-success', bg: 'bg-success/10 border-success/30' },
  { value: 'good' as const, icon: 'smile' as const, label: 'Bom', color: 'text-info', bg: 'bg-info/10 border-info/30' },
  { value: 'tired' as const, icon: 'meh' as const, label: 'Cansado', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  { value: 'pain' as const, icon: 'frown' as const, label: 'Com dor', color: 'text-error', bg: 'bg-error/10 border-error/30' },
]

// ============================================
// Main Component
// ============================================

export function WorkoutExecution({ workoutId }: { workoutId: string }) {
  // Data hooks
  const { data, isLoading } = useWorkout(workoutId)
  const { data: exerciseLib } = useExerciseLibrary()
  const completeWorkout = useCompleteWorkout(workoutId)

  // Exercise library map
  const exerciseMap = useMemo(
    () => new Map((exerciseLib ?? []).map((ex) => [ex.id, ex])),
    [exerciseLib]
  )

  // Execution state
  const [phase, setPhase] = useState<Phase>('overview')
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [startTime, setStartTime] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [feeling, setFeeling] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const [repsInput, setRepsInput] = useState('')
  const [loadInput, setLoadInput] = useState('')

  // Sorted exercises
  const exercises = useMemo(
    () => [...(data?.workout.exercises ?? [])].sort((a, b) => a.order_index - b.order_index),
    [data]
  )

  const currentExercise = exercises[exerciseIdx]
  const exerciseInfo = currentExercise ? exerciseMap.get(currentExercise.exercise_id) : null
  const exerciseName = exerciseInfo?.name_pt ?? `Exercício ${exerciseIdx + 1}`

  // Elapsed time timer
  useEffect(() => {
    if (phase !== 'active' && phase !== 'rest') return
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, startTime])

  // Progress calculation
  const totalSetsInWorkout = exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const completedSets =
    results.reduce((sum, r) => sum + r.sets.filter((s) => s.completed).length, 0)
  const progressPercent =
    totalSetsInWorkout > 0 ? (completedSets / totalSetsInWorkout) * 100 : 0

  // Initialize results array when exercises load
  useEffect(() => {
    if (exercises.length > 0 && results.length === 0) {
      setResults(
        exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: Array.from({ length: ex.sets }, () => ({
            reps: '',
            load: '',
            completed: false,
          })),
          notes: '',
        }))
      )
    }
  }, [exercises, results.length])

  // Pre-fill inputs when switching exercise/set
  useEffect(() => {
    if (currentExercise && phase === 'active') {
      setRepsInput(currentExercise.reps || '')
      setLoadInput(currentExercise.load || '')
    }
  }, [exerciseIdx, setIdx, phase, currentExercise])

  // Format elapsed time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ============================================
  // Handlers
  // ============================================

  function handleStart() {
    setStartTime(Date.now())
    setPhase('active')
    if ('vibrate' in navigator) {
      try { navigator.vibrate(100) } catch {}
    }
  }

  function handleCompleteSet() {
    // Save set result
    setResults((prev) => {
      const updated = [...prev]
      if (updated[exerciseIdx]) {
        updated[exerciseIdx] = {
          ...updated[exerciseIdx],
          sets: updated[exerciseIdx].sets.map((s, i) =>
            i === setIdx ? { reps: repsInput, load: loadInput, completed: true } : s
          ),
        }
      }
      return updated
    })

    // Vibrate feedback
    if ('vibrate' in navigator) {
      try { navigator.vibrate(150) } catch {}
    }

    // Determine next step
    const isLastSet = setIdx >= (currentExercise?.sets ?? 1) - 1
    const isLastExercise = exerciseIdx >= exercises.length - 1

    if (isLastSet && isLastExercise) {
      setPhase('summary')
    } else {
      // Go to rest (works for both last-set-of-exercise and mid-exercise)
      setPhase('rest')
    }
  }

  const handleRestDone = useCallback(() => {
    const isLastSet = setIdx >= (currentExercise?.sets ?? 1) - 1

    if (isLastSet) {
      // Move to next exercise
      setExerciseIdx((prev) => prev + 1)
      setSetIdx(0)
    } else {
      // Next set of current exercise
      setSetIdx((prev) => prev + 1)
    }

    setPhase('active')
  }, [setIdx, currentExercise])

  function handleSkipExercise() {
    const isLastExercise = exerciseIdx >= exercises.length - 1
    if (isLastExercise) {
      setPhase('summary')
    } else {
      setExerciseIdx((prev) => prev + 1)
      setSetIdx(0)
    }
  }

  async function handleFinish() {
    const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000))

    const exercisesCompleted = results.map((r) => ({
      exercise_id: r.exercise_id,
      sets_done: r.sets.filter((s) => s.completed).length,
      reps_done:
        r.sets
          .filter((s) => s.completed)
          .map((s) => s.reps)
          .join(', ') || undefined,
      load_used: r.sets.find((s) => s.completed && s.load)?.load || undefined,
      completed: r.sets.some((s) => s.completed),
      notes: r.notes || undefined,
    }))

    try {
      const result = await completeWorkout.mutateAsync({
        duration_minutes: durationMinutes,
        exercises_completed: exercisesCompleted,
        student_notes: notes || null,
        feeling: (feeling as 'great' | 'good' | 'tired' | 'pain') || undefined,
      })

      setCompletionData({
        stats: result?.stats || {
          total_workouts: 0,
          current_streak: 0,
          longest_streak: 0,
          xp_earned: 50,
        },
        new_badges: result?.new_badges || [],
        duration_minutes: durationMinutes,
      })

      if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200, 100, 300]) } catch {}
      }
      setPhase('complete')
    } catch {
      // Even if API fails, show basic completion
      setCompletionData({
        stats: { total_workouts: 0, current_streak: 0, longest_streak: 0, xp_earned: 50 },
        new_badges: [],
        duration_minutes: durationMinutes,
      })
      setPhase('complete')
    }
  }

  // ============================================
  // Loading / Error states
  // ============================================

  if (isLoading) {
    return <WorkoutExecuteSkeleton />
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">Treino não encontrado.</p>
        <Link
          href="/dashboard"
          className="mt-2 inline-block text-sm text-brand-primary hover:underline"
        >
          Voltar ao dashboard
        </Link>
      </div>
    )
  }

  const { workout } = data

  // Only execute active workouts
  if (workout.status !== 'active') {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-tertiary">
          <DSIcon name="checkCircle2" size={32} className="text-text-muted" />
        </div>
        <p className="text-text-muted">
          {workout.status === 'completed'
            ? 'Este treino já foi concluído.'
            : 'Este treino não está ativo.'}
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-sm text-brand-primary hover:underline"
        >
          Voltar ao dashboard
        </Link>
      </div>
    )
  }

  // ============================================
  // PHASE: Overview
  // ============================================

  if (phase === 'overview') {
    const estimatedMinutes = exercises.reduce((sum, ex) => {
      return sum + ex.sets * 1.5 + (ex.sets * ex.rest_seconds) / 60
    }, 0)

    return (
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
            <DSIcon name="dumbbell" size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">{workout.name}</h2>
          {workout.description && (
            <p className="text-sm text-text-muted">{workout.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <DSIcon name="dumbbell" size={16} />
              {exercises.length} exercícios
            </span>
            <span className="flex items-center gap-1">
              <DSIcon name="clock" size={16} />
              ~{Math.round(estimatedMinutes)} min
            </span>
          </div>
        </div>

        {/* Exercise list preview */}
        <div className="space-y-2">
          {exercises.map((ex, idx) => {
            const info = exerciseMap.get(ex.exercise_id)
            return (
              <div
                key={ex.id}
                className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary">
                  {idx + 1}
                </div>
                {info?.thumbnail_url ? (
                  <Image
                    src={info.thumbnail_url}
                    alt={info.name_pt || info.name || 'Exercício'}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                    <DSIcon name="dumbbell" size={16} className="text-text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {info?.name_pt ?? `Exercício ${ex.exercise_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-text-muted">
                    {ex.sets} séries × {ex.reps} reps
                    {ex.load && ` • ${ex.load}`}
                  </p>
                </div>
                <DSIcon name="chevronRight" size={16} className="shrink-0 text-text-muted" />
              </div>
            )
          })}
        </div>

        {/* Start button */}
        <Button onClick={handleStart} size="lg" className="w-full gap-2 text-lg">
          <DSIcon name="play" size={20} />
          Começar Treino
        </Button>
      </div>
    )
  }

  // ============================================
  // PHASE: Active (Exercise)
  // ============================================

  if (phase === 'active' && currentExercise) {
    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
              <DSIcon name="dumbbell" size={14} />
              {exerciseIdx + 1} / {exercises.length}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-muted">
              <DSIcon name="clock" size={14} />
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-bg-tertiary shadow-inner">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 via-brand-primary to-emerald-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Exercise info */}
        <div className="space-y-3 text-center">
          {exerciseInfo?.thumbnail_url ? (
            <Image
              src={exerciseInfo.thumbnail_url}
              alt={exerciseName}
              width={160}
              height={160}
              unoptimized
              className="mx-auto h-40 w-40 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-brand-primary/10">
              <DSIcon name="dumbbell" size={48} className="text-brand-primary" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-text-primary">{exerciseName}</h3>
            {currentExercise.notes && (
              <p className="mt-1 text-xs text-text-muted">{currentExercise.notes}</p>
            )}
            {currentExercise.technique_tips && (
              <p className="mt-1 text-xs text-info">
                {currentExercise.technique_tips}
              </p>
            )}
          </div>
        </div>

        {/* Set indicator chips */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: currentExercise.sets }, (_, i) => (
            <div
              key={i}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                i < setIdx
                  ? 'bg-success text-white shadow-sm'
                  : i === setIdx
                    ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30 ring-offset-2 ring-offset-bg-primary scale-110'
                    : 'bg-bg-tertiary text-text-muted'
              )}
            >
              {i < setIdx ? (
                <DSIcon name="checkCircle2" size={16} />
              ) : (
                i + 1
              )}
            </div>
          ))}
        </div>

        {/* Current set info */}
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">
            Série {setIdx + 1} de {currentExercise.sets}
          </p>
          <p className="text-sm text-text-muted">
            Meta: {currentExercise.reps} reps
            {currentExercise.load ? ` × ${currentExercise.load}` : ''}
          </p>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Repetições
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder={currentExercise.reps}
              className="w-full rounded-xl border-2 border-border-light bg-bg-primary px-4 py-3.5 text-center text-xl font-bold text-text-primary placeholder:text-text-muted/40 shadow-sm transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary"
            />
            <div className="mt-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => setRepsInput(String(Math.max(0, Number(repsInput || currentExercise.reps || 0) - 1)))}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-border-light bg-bg-secondary text-xs font-semibold text-text-muted shadow-sm transition-all hover:bg-black/6 dark:hover:bg-white/8 hover:border-border-light active:scale-95"
              >
                −1 rep
              </button>
              <button
                type="button"
                onClick={() => setRepsInput(String(Number(repsInput || currentExercise.reps || 0) + 1))}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/8 text-xs font-semibold text-brand-primary shadow-sm transition-all hover:bg-brand-primary/15 hover:border-brand-primary/50 active:scale-95"
              >
                +1 rep
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Carga
            </label>
            <input
              type="text"
              value={loadInput}
              onChange={(e) => setLoadInput(e.target.value)}
              placeholder={currentExercise.load || 'kg'}
              className="w-full rounded-xl border-2 border-border-light bg-bg-primary px-4 py-3.5 text-center text-xl font-bold text-text-primary placeholder:text-text-muted/40 shadow-sm transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary"
            />
            <div className="mt-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => setLoadInput(String(Math.max(0, parseFloat(loadInput || '0') - 2.5)))}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-border-light bg-bg-secondary text-xs font-semibold text-text-muted shadow-sm transition-all hover:bg-black/6 dark:hover:bg-white/8 hover:border-border-light active:scale-95"
              >
                −2.5kg
              </button>
              <button
                type="button"
                onClick={() => setLoadInput(String(parseFloat(loadInput || '0') + 2.5))}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/8 text-xs font-semibold text-brand-primary shadow-sm transition-all hover:bg-brand-primary/15 hover:border-brand-primary/50 active:scale-95"
              >
                +2.5kg
              </button>
            </div>
          </div>
        </div>

        {/* Complete set button */}
        <Button
          onClick={handleCompleteSet}
          size="lg"
          className="w-full gap-2 text-lg"
        >
          <DSIcon name="checkCircle2" size={20} />
          Concluir Série
        </Button>

        {/* Skip exercise */}
        <Button
          variant="ghost"
          size="md"
          onClick={handleSkipExercise}
          className="w-full"
        >
          Pular exercício
          <DSIcon name="chevronRight" size={16} />
        </Button>
      </div>
    )
  }

  // ============================================
  // PHASE: Rest
  // ============================================

  if (phase === 'rest') {
    const isLastSet = setIdx >= (currentExercise?.sets ?? 1) - 1
    const nextExIdx = isLastSet ? exerciseIdx + 1 : exerciseIdx
    const nextEx = exercises[nextExIdx]
    const nextExInfo = nextEx ? exerciseMap.get(nextEx.exercise_id) : null
    const nextName = isLastSet
      ? nextExInfo?.name_pt ?? `Exercício ${nextExIdx + 1}`
      : exerciseName

    return (
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="h-2.5 overflow-hidden rounded-full bg-bg-tertiary shadow-inner">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-400 via-brand-primary to-emerald-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <RestTimer
          totalSeconds={currentExercise?.rest_seconds ?? 60}
          onComplete={handleRestDone}
          onSkip={handleRestDone}
          nextExerciseName={
            isLastSet
              ? `${nextName} (próximo exercício)`
              : `${nextName} — Série ${setIdx + 2}`
          }
        />
      </div>
    )
  }

  // ============================================
  // PHASE: Summary
  // ============================================

  if (phase === 'summary') {
    const totalCompletedSets = results.reduce(
      (sum, r) => sum + r.sets.filter((s) => s.completed).length,
      0
    )
    const durationMin = Math.max(
      1,
      Math.round((Date.now() - startTime) / 60000)
    )

    // Calculate total volume (sets × reps × load)
    const totalVolume = results.reduce((vol, r) => {
      return vol + r.sets
        .filter((s) => s.completed)
        .reduce((setVol, s) => {
          const reps = parseInt(s.reps) || 0
          const load = parseFloat(s.load) || 0
          return setVol + (reps * load)
        }, 0)
    }, 0)

    const totalReps = results.reduce((sum, r) => {
      return sum + r.sets
        .filter((s) => s.completed)
        .reduce((setSum, s) => setSum + (parseInt(s.reps) || 0), 0)
    }, 0)

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <DSIcon name="checkCircle2" size={32} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Treino Finalizado!
          </h2>
          <p className="text-sm text-text-muted">
            {totalCompletedSets} séries em {durationMin} minutos
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-3 text-center">
            <p className="text-lg font-bold text-brand-primary">{totalCompletedSets}</p>
            <p className="text-[10px] text-text-muted">Séries</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-3 text-center">
            <p className="text-lg font-bold text-success">{totalReps}</p>
            <p className="text-[10px] text-text-muted">Repetições</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-3 text-center">
            <p className="text-lg font-bold text-warning">{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : '—'}</p>
            <p className="text-[10px] text-text-muted">Volume</p>
          </div>
        </div>

        {/* Feeling selector */}
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-text-primary">
            Como você se sente?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {FEELINGS.map((f) => {
              const isSelected = feeling === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFeeling(f.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                    isSelected
                      ? f.bg
                      : 'border-border-light bg-bg-secondary hover:bg-bg-tertiary'
                  )}
                >
                  <DSIcon
                    name={f.icon}
                    className={cn(
                      isSelected ? f.color : 'text-text-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isSelected ? f.color : 'text-text-muted'
                    )}
                  >
                    {f.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como foi o treino? Alguma observação..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border-light bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary sm:text-sm"
          />
        </div>

        {/* Finish button */}
        <Button
          onClick={handleFinish}
          size="lg"
          className="w-full gap-2 text-lg"
          loading={completeWorkout.isPending}
        >
          <DSIcon name="trophy" size={20} />
          Finalizar Treino
        </Button>
      </div>
    )
  }

  // ============================================
  // PHASE: Complete (Celebration)
  // ============================================

  if (phase === 'complete' && completionData) {
    return (
      <div className="space-y-6 py-4">
        {/* Celebration header */}
        <div className="space-y-3 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10 border border-success/20"><DSIcon name="checkCircle2" size={32} className="text-success" /></div>
          <h2 className="text-2xl font-bold text-text-primary">Parabéns!</h2>
          <p className="text-text-secondary">
            Treino concluído em {completionData.duration_minutes} minutos
          </p>
        </div>

        {/* XP and badges */}
        <XPEarnedBanner
          xpEarned={completionData.stats.xp_earned}
          newBadges={completionData.new_badges}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-4 text-center">
            <DSIcon
              name="flame"
              className={cn(
                'mx-auto mb-1',
                completionData.stats.current_streak >= 7
                  ? 'text-error'
                  : 'text-warning'
              )}
            />
            <p className="text-2xl font-bold text-text-primary">
              {completionData.stats.current_streak}
            </p>
            <p className="text-xs text-text-muted">dias de streak</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-4 text-center">
            <DSIcon name="dumbbell" className="mx-auto mb-1 text-brand-primary" />
            <p className="text-2xl font-bold text-text-primary">
              {completionData.stats.total_workouts}
            </p>
            <p className="text-xs text-text-muted">treinos completos</p>
          </div>
        </div>

        {/* Back to dashboard */}
        <Link href="/dashboard">
          <Button variant="primary" size="lg" className="w-full gap-2">
            <DSIcon name="arrowRight" size={20} />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  // Fallback
  return null
}
