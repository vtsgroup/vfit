/**
 * src/stores/workout-store.ts
 *
 * Workout Store — Zustand
 *
 * Manages the active workout session state:
 * current exercise, sets, timer, rest periods.
 */

import { create } from 'zustand'

interface ExerciseSet {
  setNumber: number
  reps: number
  weightKg: number
  isCompleted: boolean
  isPersonalRecord: boolean
  rpe?: number
}

interface ActiveExercise {
  exerciseId: string
  exerciseName: string
  targetSets: number
  targetReps: string
  restSeconds: number
  sets: ExerciseSet[]
}

interface WorkoutState {
  // ─── State ───
  isActive: boolean
  sessionId: string | null
  planDayId: string | null
  exercises: ActiveExercise[]
  currentExerciseIndex: number
  startedAt: string | null
  isResting: boolean
  restTimeRemaining: number

  // ─── Actions ───
  startWorkout: (opts: {
    sessionId: string
    planDayId?: string
    exercises: ActiveExercise[]
  }) => void
  endWorkout: () => void
  completeSet: (exerciseIndex: number, set: ExerciseSet) => void
  nextExercise: () => void
  prevExercise: () => void
  startRest: (seconds: number) => void
  tickRest: () => void
  skipRest: () => void
  reset: () => void
}

export const useWorkoutStore = create<WorkoutState>()((set) => ({
  isActive: false,
  sessionId: null,
  planDayId: null,
  exercises: [],
  currentExerciseIndex: 0,
  startedAt: null,
  isResting: false,
  restTimeRemaining: 0,

  startWorkout: ({ sessionId, planDayId, exercises }) =>
    set({
      isActive: true,
      sessionId,
      planDayId: planDayId || null,
      exercises,
      currentExerciseIndex: 0,
      startedAt: new Date().toISOString(),
      isResting: false,
      restTimeRemaining: 0,
    }),

  endWorkout: () =>
    set({
      isActive: false,
      sessionId: null,
      planDayId: null,
      exercises: [],
      currentExerciseIndex: 0,
      startedAt: null,
      isResting: false,
      restTimeRemaining: 0,
    }),

  completeSet: (exerciseIndex, completedSet) =>
    set((state) => {
      const exercises = [...state.exercises]
      const exercise = { ...exercises[exerciseIndex] }
      exercise.sets = exercise.sets.map((s) =>
        s.setNumber === completedSet.setNumber ? completedSet : s
      )
      exercises[exerciseIndex] = exercise
      return { exercises }
    }),

  nextExercise: () =>
    set((s) => ({
      currentExerciseIndex: Math.min(s.currentExerciseIndex + 1, s.exercises.length - 1),
      isResting: false,
      restTimeRemaining: 0,
    })),

  prevExercise: () =>
    set((s) => ({
      currentExerciseIndex: Math.max(s.currentExerciseIndex - 1, 0),
      isResting: false,
      restTimeRemaining: 0,
    })),

  startRest: (seconds) =>
    set({ isResting: true, restTimeRemaining: seconds }),

  tickRest: () =>
    set((s) => {
      const remaining = s.restTimeRemaining - 1
      if (remaining <= 0) {
        return { isResting: false, restTimeRemaining: 0 }
      }
      return { restTimeRemaining: remaining }
    }),

  skipRest: () =>
    set({ isResting: false, restTimeRemaining: 0 }),

  reset: () =>
    set({
      isActive: false,
      sessionId: null,
      planDayId: null,
      exercises: [],
      currentExerciseIndex: 0,
      startedAt: null,
      isResting: false,
      restTimeRemaining: 0,
    }),
}))
