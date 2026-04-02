/**
 * src/stores/onboarding-store.ts
 *
 * Onboarding Store — Zustand + localStorage persistence
 *
 * Tracks onboarding quiz state step-by-step,
 * persists locally, syncs to backend on completion.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface OnboardingData {
  gender: 'male' | 'female' | 'other' | 'prefer_not_say' | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  training_frequency: 'regularly' | 'inconsistently' | 'never' | null
  goal: 'lose_weight' | 'gain_muscle' | 'tone' | 'health' | 'strength' | 'flexibility' | null
  training_location: 'gym_large' | 'gym_small' | 'home' | 'bodyweight' | 'outdoor' | null
  target_muscles: string[]
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  target_weight_kg: number | null
  days_per_week: number
  session_duration: 'quick_15' | 'short_30' | 'medium_45' | 'long_60'
  injuries: string[]
  preferred_days: string[]
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'any'
}

interface OnboardingState {
  // ─── State ───
  currentStep: number
  totalSteps: number
  data: OnboardingData
  isCompleted: boolean

  // ─── Actions ───
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (partial: Partial<OnboardingData>) => void
  markCompleted: () => void
  reset: () => void
}

const initialData: OnboardingData = {
  gender: null,
  experience_level: null,
  training_frequency: null,
  goal: null,
  training_location: null,
  target_muscles: [],
  age: null,
  height_cm: null,
  weight_kg: null,
  target_weight_kg: null,
  days_per_week: 3,
  session_duration: 'medium_45',
  injuries: [],
  preferred_days: [],
  preferred_time: 'any',
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      totalSteps: 17,
      data: { ...initialData },
      isCompleted: false,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
      markCompleted: () => set({ isCompleted: true }),
      reset: () => set({ currentStep: 0, data: { ...initialData }, isCompleted: false }),
    }),
    {
      name: 'vfit-onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data,
        isCompleted: state.isCompleted,
      }),
    }
  )
)
