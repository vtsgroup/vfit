/**
 * src/stores/active-workout-store.ts
 *
 * Zustand store para treino ativo em progresso.
 * Persiste durante a sessão de treino (sessionStorage).
 *
 * Tracks: exercícios, sets completados, pesos, reps, timer.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Types ───

export interface WorkoutSet {
  id: number
  reps: number
  weight_kg: number
  is_warmup: boolean
  completed: boolean
  completed_at?: string
}

export interface WorkoutExercise {
  id: string
  exercise_id: string
  exercise_name: string
  muscle_group: string | null
  planned_sets: number
  planned_reps: string
  planned_weight_kg: number | null
  rest_seconds: number
  is_superset: boolean
  superset_group: string | null
  notes: string | null
  sets: WorkoutSet[]
  skipped: boolean
}

export interface ActiveWorkout {
  client_completion_id: string
  plan_id: string
  plan_day_id: string
  day_number: number
  day_name: string
  exercises: WorkoutExercise[]
  current_exercise_index: number
  started_at: string
  paused_at: string | null
  total_pause_ms: number
  status: 'active' | 'paused' | 'completed'
}

interface ActiveWorkoutState {
  workout: ActiveWorkout | null

  // Actions
  startWorkout: (data: {
    plan_id: string
    plan_day_id: string
    day_number: number
    day_name: string
    exercises: Array<{
      id: string
      exercise_id: string
      exercise_name: string
      muscle_group: string | null
      sets: number
      reps: string
      weight_kg: number | null
      rest_seconds: number
      is_superset: boolean
      superset_group: string | null
      notes: string | null
    }>
  }) => void

  completeSet: (exerciseIndex: number, setIndex: number, reps: number, weight_kg: number) => void
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void
  addSet: (exerciseIndex: number) => void
  updateSetReps: (exerciseIndex: number, setIndex: number, reps: number) => void
  updateSetWeight: (exerciseIndex: number, setIndex: number, weight_kg: number) => void

  goToExercise: (index: number) => void
  nextExercise: () => void
  prevExercise: () => void
  skipExercise: (index: number) => void

  pauseWorkout: () => void
  resumeWorkout: () => void
  completeWorkout: () => void
  cancelWorkout: () => void

  markAllSets: (exerciseIndex: number) => void
}

function parseReps(repsStr: string): number {
  // "8-12" → 10, "12" → 12, "8–10" → 9
  const match = repsStr.match(/(\d+)[-–](\d+)/)
  if (match) return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
  const num = parseInt(repsStr)
  return isNaN(num) ? 10 : num
}

function generateClientCompletionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      workout: null,

      startWorkout: (data) => {
        const exercises: WorkoutExercise[] = data.exercises.map((ex) => {
          const targetReps = parseReps(ex.reps)
          const sets: WorkoutSet[] = Array.from({ length: ex.sets }, (_, i) => ({
            id: i + 1,
            reps: targetReps,
            weight_kg: ex.weight_kg || 0,
            is_warmup: i === 0 && ex.sets > 3, // first set is warmup if 4+ sets
            completed: false,
          }))

          return {
            id: ex.id,
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            muscle_group: ex.muscle_group,
            planned_sets: ex.sets,
            planned_reps: ex.reps,
            planned_weight_kg: ex.weight_kg,
            rest_seconds: ex.rest_seconds,
            is_superset: ex.is_superset,
            superset_group: ex.superset_group,
            notes: ex.notes,
            sets,
            skipped: false,
          }
        })

        set({
          workout: {
            client_completion_id: generateClientCompletionId(),
            plan_id: data.plan_id,
            plan_day_id: data.plan_day_id,
            day_number: data.day_number,
            day_name: data.day_name,
            exercises,
            current_exercise_index: 0,
            started_at: new Date().toISOString(),
            paused_at: null,
            total_pause_ms: 0,
            status: 'active',
          },
        })
      },

      completeSet: (exerciseIndex, setIndex, reps, weight_kg) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        const sets = [...ex.sets]
        sets[setIndex] = {
          ...sets[setIndex],
          reps,
          weight_kg,
          completed: true,
          completed_at: new Date().toISOString(),
        }
        ex.sets = sets
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },

      uncompleteSet: (exerciseIndex, setIndex) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        const sets = [...ex.sets]
        sets[setIndex] = { ...sets[setIndex], completed: false, completed_at: undefined }
        ex.sets = sets
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },

      addSet: (exerciseIndex) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        const lastSet = ex.sets[ex.sets.length - 1]
        ex.sets = [
          ...ex.sets,
          {
            id: ex.sets.length + 1,
            reps: lastSet?.reps || 10,
            weight_kg: lastSet?.weight_kg || 0,
            is_warmup: false,
            completed: false,
          },
        ]
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },

      updateSetReps: (exerciseIndex, setIndex, reps) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        const sets = [...ex.sets]
        sets[setIndex] = { ...sets[setIndex], reps }
        ex.sets = sets
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },

      updateSetWeight: (exerciseIndex, setIndex, weight_kg) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        const sets = [...ex.sets]
        sets[setIndex] = { ...sets[setIndex], weight_kg }
        ex.sets = sets
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },

      goToExercise: (index) => {
        const w = get().workout
        if (!w) return
        if (index >= 0 && index < w.exercises.length) {
          set({ workout: { ...w, current_exercise_index: index } })
        }
      },

      nextExercise: () => {
        const w = get().workout
        if (!w) return
        const next = w.current_exercise_index + 1
        if (next < w.exercises.length) {
          set({ workout: { ...w, current_exercise_index: next } })
        }
      },

      prevExercise: () => {
        const w = get().workout
        if (!w) return
        const prev = w.current_exercise_index - 1
        if (prev >= 0) {
          set({ workout: { ...w, current_exercise_index: prev } })
        }
      },

      skipExercise: (index) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        exercises[index] = { ...exercises[index], skipped: true }
        // Move to next non-skipped
        let nextIdx = w.current_exercise_index
        if (index === nextIdx) {
          for (let i = index + 1; i < exercises.length; i++) {
            if (!exercises[i].skipped) { nextIdx = i; break }
          }
        }
        set({ workout: { ...w, exercises, current_exercise_index: nextIdx } })
      },

      pauseWorkout: () => {
        const w = get().workout
        if (!w || w.status !== 'active') return
        set({ workout: { ...w, status: 'paused', paused_at: new Date().toISOString() } })
      },

      resumeWorkout: () => {
        const w = get().workout
        if (!w || w.status !== 'paused' || !w.paused_at) return
        const pauseDuration = Date.now() - new Date(w.paused_at).getTime()
        set({
          workout: {
            ...w,
            status: 'active',
            paused_at: null,
            total_pause_ms: w.total_pause_ms + pauseDuration,
          },
        })
      },

      completeWorkout: () => {
        const w = get().workout
        if (!w) return
        set({ workout: { ...w, status: 'completed' } })
      },

      cancelWorkout: () => {
        set({ workout: null })
      },

      markAllSets: (exerciseIndex) => {
        const w = get().workout
        if (!w) return
        const exercises = [...w.exercises]
        const ex = { ...exercises[exerciseIndex] }
        ex.sets = ex.sets.map((s) => ({
          ...s,
          completed: true,
          completed_at: s.completed_at || new Date().toISOString(),
        }))
        exercises[exerciseIndex] = ex
        set({ workout: { ...w, exercises } })
      },
    }),
    {
      name: 'vfit-active-workout',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
