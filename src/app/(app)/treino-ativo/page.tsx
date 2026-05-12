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

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { RestTimer } from '@/components/treino/rest-timer'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { useCurrentPlan } from '@/hooks/use-plans'
import { useCompleteWorkout as useCompleteB2CWorkout } from '@/hooks/use-plans'
import { useExercises } from '@/hooks/use-exercises'
import { requestWakeLock, releaseWakeLock } from '@/lib/wake-lock'
import { isOnline, queueOfflineCompletion, type OfflineWorkoutCompletionPayload } from '@/lib/offline-workout'
import { hapticLight, hapticSuccess } from '@/lib/haptics'
import { cn } from '@/lib/utils'

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function normalizeWorkoutText(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function TreinoAtivoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const markWorkoutCompleted = useActiveWorkoutStore((s) => s.completeWorkout)
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout)
  const completeWorkoutMutation = useCompleteB2CWorkout()
  const { data: exerciseCatalog } = useExercises({ per_page: 300 })

  const [elapsed, setElapsed] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [editingCell, setEditingCell] = useState<{ ex: number; set: number; field: 'reps' | 'weight' } | null>(null)
  const [restTimer, setRestTimer] = useState<{ seconds: number } | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [finishState, setFinishState] = useState<'idle' | 'saving' | 'queued' | 'failed'>('idle')
  const [online, setOnline] = useState(() => isOnline())
  const inputRef = useRef<HTMLInputElement>(null)

  const exerciseMediaLookup = useMemo(() => {
    const map = new Map<string, NonNullable<typeof exerciseCatalog>['exercises'][number]>()
    for (const exercise of exerciseCatalog?.exercises ?? []) {
      map.set(exercise.id, exercise)
      map.set(normalizeWorkoutText(exercise.name), exercise)
      map.set(normalizeWorkoutText(exercise.name_pt), exercise)
    }
    return map
  }, [exerciseCatalog])

  // Wake lock
  useEffect(() => {
    requestWakeLock()
    return () => { releaseWakeLock() }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateOnline = () => setOnline(isOnline())
    updateOnline()
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
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
      const requestedDay = Number(searchParams.get('day'))
      const currentDay = (Number.isInteger(requestedDay) && requestedDay > 0
        ? plan.days.find((d) => d.day_number === requestedDay)
        : null) || plan.days.find((d) => d.day_number === plan.current_day) || plan.days[0]
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
  }, [workout, plan, searchParams, startWorkout])

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

  const buildCompletionPayload = useCallback((): OfflineWorkoutCompletionPayload | null => {
    if (!workout) return null
    const durationSeconds = Math.max(1, Math.floor((Date.now() - new Date(workout.started_at).getTime() - workout.total_pause_ms) / 1000))
    return {
      client_completion_id: workout.client_completion_id,
      plan_id: workout.plan_id,
      plan_day_id: workout.plan_day_id,
      day_number: workout.day_number,
      started_at: workout.started_at,
      duration_seconds: durationSeconds,
      exercises: workout.exercises.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        exercise_name: exercise.exercise_name,
        muscle_group: exercise.muscle_group,
        skipped: exercise.skipped,
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weight_kg: set.weight_kg,
          is_warmup: set.is_warmup,
          completed: set.completed,
        })),
      })),
    }
  }, [workout])

  const handleFinish = useCallback(async () => {
    if (!workout || finishState === 'saving') return
    const payload = buildCompletionPayload()
    if (!payload) return

    setFinishState('saving')
    if (!isOnline()) {
      const queued = await queueOfflineCompletion(payload)
      if (!queued) {
        setFinishState('failed')
        return
      }
      setFinishState('queued')
    } else {
      try {
        await completeWorkoutMutation.mutateAsync(payload)
      } catch {
        const queued = await queueOfflineCompletion(payload)
        if (!queued) {
          setFinishState('failed')
          return
        }
        setFinishState('queued')
      }
    }

    markWorkoutCompleted()
    releaseWakeLock()
    // Persist day completion for same-day blocking
    const today = new Date().toISOString().slice(0, 10)
    const key = `vfit_day_completed_${workout.plan_id}_${workout.day_number}`
    localStorage.setItem(key, today)
    router.push('/treino-ativo/concluido')
  }, [buildCompletionPayload, completeWorkoutMutation, finishState, markWorkoutCompleted, router, workout])

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
  const currentCatalogExercise = exerciseMediaLookup.get(currentEx.exercise_id || '')
    || exerciseMediaLookup.get(normalizeWorkoutText(currentEx.exercise_name))
  const demoVideoUrl = currentCatalogExercise?.video_url_vertical || currentCatalogExercise?.video_url_horizontal || null
  const demoPosterUrl = currentCatalogExercise?.thumbnail_url || undefined

  // Workout progress
  const totalExercises = workout.exercises.length
  const completedExercises = workout.exercises.filter(
    (ex) => ex.skipped || ex.sets.every((s) => s.completed)
  ).length
  const workoutProgressPercent = Math.max(4, Math.round((completedExercises / totalExercises) * 100))
  const currentExercisePercent = Math.round((completedSets / Math.max(totalSets, 1)) * 100)

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg overflow-hidden bg-slate-950 pb-36">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/96 px-4 py-3 text-white shadow-[0_18px_54px_-34px_rgba(2,6,23,0.95)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-200/55 to-transparent"
        />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Cancelar treino"
            onClick={() => setShowCancelConfirm(true)}
            className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/6 text-white/72 shadow-glass-inset-sm transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <DSIcon name="x" size={22} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200/60">
              Dia {workout.day_number} — {workout.day_name}
            </p>
            <p className="mt-0.5 text-[42px] font-black tabular-nums leading-none text-white">
              {formatTimer(elapsed)}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Tempo total</p>
          </div>
          <Button
            size="sm"
            onClick={handleFinish}
            loading={finishState === 'saving'}
            className="h-12 px-5 shadow-[0_6px_0_0_#064e3b,0_20px_34px_-24px_rgba(16,185,129,0.95)]"
          >
            Finalizar
          </Button>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full border border-white/6 bg-white/8">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-300 via-brand-primary to-lime-300 transition-all duration-500"
            style={{ width: `${workoutProgressPercent}%` }}
          />
        </div>
      </div>

      {/* ─── Exercise hero / video ─── */}
      <div className="relative bg-slate-950 px-4 pb-7 pt-3 text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-52 w-52 rounded-full bg-emerald-400/16 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-10 h-48 w-48 rounded-full bg-sky-400/12 blur-3xl" aria-hidden="true" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
          }}
        />
        <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/7 shadow-[0_24px_80px_-34px_rgba(16,185,129,0.62),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-100/70 to-transparent" aria-hidden="true" />
          <div className="relative aspect-16/10 bg-slate-900">
            {demoVideoUrl ? (
              <video
                className="h-full w-full object-cover"
                controls
                muted
                playsInline
                preload="metadata"
                poster={demoPosterUrl}
                src={demoVideoUrl}
              />
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center gap-4 bg-linear-to-b from-slate-800 via-slate-900 to-slate-950 text-center">
                <div className="pointer-events-none absolute inset-0 opacity-55" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(16,185,129,0.2), transparent 42%)' }} />
                <span className="relative flex h-17 w-17 items-center justify-center rounded-2xl border border-emerald-300/24 bg-emerald-300/11 text-emerald-300 shadow-[0_0_34px_rgba(16,185,129,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <DSIcon name="video" size={26} />
                </span>
                <div className="relative">
                  <p className="text-sm font-black text-white">Demonstração em breve</p>
                  <p className="mt-1 text-xs font-medium text-white/55">Execução guiada pelas séries abaixo.</p>
                </div>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
              {completedSets}/{totalSets} sets
            </div>
            <div className="absolute right-3 top-3 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100 backdrop-blur-md">
              Ex. {workout.current_exercise_index + 1}/{totalExercises}
            </div>
            <div className="absolute inset-x-3 bottom-3 rounded-card-lg border border-white/10 bg-slate-950/62 px-3 py-2 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200/66">Agora</p>
              <p className="mt-0.5 truncate text-sm font-black text-white">{currentEx.exercise_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8 bg-slate-950/78">
            <div className="px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/42">Progresso</p>
              <p className="mt-1 text-xl font-black tabular-nums text-white">{currentExercisePercent}%</p>
            </div>
            <div className="px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/42">Descanso</p>
              <p className="mt-1 text-xl font-black tabular-nums text-white">{currentEx.rest_seconds}s</p>
            </div>
            <div className="px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/42">Conexão</p>
              <p className={cn('mt-1 flex items-center gap-1.5 text-sm font-black', online ? 'text-emerald-300' : 'text-amber-300')}>
                <DSIcon name={online ? 'wifi' : 'wifiOff'} size={15} />
                {online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Exercise navigator ─── */}
      <div className="relative rounded-t-[34px] bg-white pt-4 shadow-[0_-26px_60px_-48px_rgba(16,185,129,0.9)]">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-1">
        {workout.exercises.map((ex, i) => {
          const isActive = i === workout.current_exercise_index
          const isDone = ex.skipped || ex.sets.every((s) => s.completed)
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => { goToExercise(i); hapticLight() }}
              className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-black transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-[0_5px_0_0_#166534,0_18px_30px_-22px_rgba(22,101,52,0.9)]'
                  : isDone
                    ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
                    : ex.skipped
                      ? 'bg-bg-secondary text-text-muted line-through'
                      : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100'
              }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* ─── Current exercise ─── */}
      <div className="px-4">
        <div className="relative mb-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_54px_-42px_rgba(15,23,42,0.9)]">
          <div className="pointer-events-none absolute inset-x-8 h-px bg-linear-to-r from-transparent via-slate-300/70 to-transparent" aria-hidden="true" />
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Exercício atual</p>
              <h2 className="mt-1 text-[27px] font-black leading-tight text-slate-950">{currentEx.exercise_name}</h2>
            </div>
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_5px_0_0_#0f172a]">
              <span className="text-[10px] font-black uppercase text-white/45">Set</span>
              <span className="text-lg font-black leading-none">{completedSets}/{totalSets}</span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-lime-300 transition-all duration-500" style={{ width: `${currentExercisePercent}%` }} />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">
            {currentEx.muscle_group || 'Grupo muscular'} · descanso {currentEx.rest_seconds}s
            {currentEx.notes && ` · ${currentEx.notes}`}
          </p>
          {currentEx.is_superset && (
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
              SUPER SET
            </span>
          )}
        </div>

        {/* ─── Sets table ─── */}
        {finishState === 'failed' && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-red-500/25 bg-red-500/8 px-3 py-3 text-sm font-semibold text-red-500">
            <DSIcon name="alertTriangle" size={18} className="mt-0.5 shrink-0" />
            <span>Nao foi possivel salvar agora. O treino continua nesta tela para voce tentar novamente.</span>
          </div>
        )}

        {finishState === 'queued' && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-3 py-3 text-sm font-semibold text-amber-600 dark:text-amber-300">
            <DSIcon name="wifiOff" size={18} className="mt-0.5 shrink-0" />
            <span>Treino guardado neste aparelho. Vamos sincronizar quando a conexao estabilizar.</span>
          </div>
        )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_1fr_48px] px-2 pb-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Set</span>
            <span className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Reps</span>
            <span className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Peso</span>
            <span className="text-right text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Ok</span>
          </div>

          {/* Sets */}
          {currentEx.sets.map((s, setIdx) => {
            const exIdx = workout.current_exercise_index
            const isEditingReps = editingCell?.ex === exIdx && editingCell.set === setIdx && editingCell.field === 'reps'
            const isEditingWeight = editingCell?.ex === exIdx && editingCell.set === setIdx && editingCell.field === 'weight'

            return (
              <div
                key={s.id}
                className={`mb-2 grid grid-cols-[48px_1fr_1fr_48px] items-center rounded-[18px] border px-3 py-2.5 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.65)] transition-all ${
                  s.completed ? 'border-emerald-500/22 bg-emerald-500/8' : 'border-slate-200 bg-white'
                }`}
              >
                {/* Set number / warmup */}
                <span className={`text-sm font-black ${s.is_warmup ? 'text-amber-500' : 'text-slate-950'}`}>
                  {s.is_warmup ? 'A' : s.id}
                </span>

                {/* Reps */}
                <div className="flex justify-center">
                  {isEditingReps ? (
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="numeric"
                      className="w-14 rounded-xl bg-slate-100 px-2 py-1 text-center text-sm font-black text-slate-950 outline-none ring-2 ring-brand-primary"
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
                      className="rounded-xl px-3 py-1 text-sm font-black text-slate-950 transition-colors hover:bg-slate-100"
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
                      className="w-16 rounded-xl bg-slate-100 px-2 py-1 text-center text-sm font-black text-slate-950 outline-none ring-2 ring-brand-primary"
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
                      className="rounded-xl px-3 py-1 text-sm font-black text-slate-950 transition-colors hover:bg-slate-100"
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
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      s.completed
                        ? 'scale-110 bg-brand-primary text-white shadow-[0_4px_0_0_#166534]'
                        : 'border border-slate-200 bg-slate-50 text-slate-400 hover:border-brand-primary'
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
          <Button
            variant="secondary"
            onClick={() => { addSet(workout.current_exercise_index); hapticLight() }}
            className="flex-1 shadow-[0_5px_0_0_#0f172a]"
          >
            <DSIcon name="plus" size={14} />
            Adicionar Set
          </Button>
          {!allCompleted && (
            <Button
              variant="secondary"
              onClick={() => { markAllSets(workout.current_exercise_index); hapticSuccess() }}
              className="flex-1 shadow-[0_5px_0_0_#0f172a]"
            >
              <DSIcon name="checkCheck" size={14} />
              Marcar Todos
            </Button>
          )}
        </div>

        {/* ─── Skip ─── */}
        <Button
          variant="ghost"
          onClick={() => { skipExercise(workout.current_exercise_index); hapticLight() }}
          className="mt-2 w-full text-text-muted hover:text-amber-500"
        >
          Pular exercício
        </Button>

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
              loading={finishState === 'saving'}
            >
              <DSIcon name="check" className="h-5 w-5" />
              Finalizar Treino
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
              <DSIcon name="dumbbell" size={30} className="text-red-500" />
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
