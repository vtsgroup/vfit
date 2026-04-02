/**
 * src/stores/guest-store.ts
 *
 * Guest Store — Zustand + localStorage persistence
 *
 * Manages guest mode state: tracks actions performed,
 * limits usage, and persists data locally until account creation.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Guest limits (free tier without account) ───
const GUEST_LIMITS = {
  MAX_WORKOUT_VIEWS: 3,
  MAX_CALCULATOR_USES: 5,
  MAX_AI_MESSAGES: 0, // Requires account
  MAX_ASSESSMENTS: 0, // Requires account
} as const

interface GuestUsage {
  workoutViews: number
  calculatorUses: number
  aiMessages: number
  assessments: number
}

interface GuestState {
  // ─── State ───
  isGuest: boolean
  startedAt: string | null
  usage: GuestUsage

  // ─── Actions ───
  enterGuestMode: () => void
  exitGuestMode: () => void
  incrementUsage: (key: keyof GuestUsage) => void
  isLimitReached: (key: keyof GuestUsage) => boolean
  getLimit: (key: keyof GuestUsage) => number
  getRemainingUses: (key: keyof GuestUsage) => number
  resetUsage: () => void
}

const initialUsage: GuestUsage = {
  workoutViews: 0,
  calculatorUses: 0,
  aiMessages: 0,
  assessments: 0,
}

const LIMIT_MAP: Record<keyof GuestUsage, number> = {
  workoutViews: GUEST_LIMITS.MAX_WORKOUT_VIEWS,
  calculatorUses: GUEST_LIMITS.MAX_CALCULATOR_USES,
  aiMessages: GUEST_LIMITS.MAX_AI_MESSAGES,
  assessments: GUEST_LIMITS.MAX_ASSESSMENTS,
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ───
      isGuest: false,
      startedAt: null,
      usage: { ...initialUsage },

      // ─── Actions ───
      enterGuestMode: () =>
        set({
          isGuest: true,
          startedAt: new Date().toISOString(),
        }),

      exitGuestMode: () =>
        set({
          isGuest: false,
          startedAt: null,
          usage: { ...initialUsage },
        }),

      incrementUsage: (key) =>
        set((state) => ({
          usage: {
            ...state.usage,
            [key]: state.usage[key] + 1,
          },
        })),

      isLimitReached: (key) => {
        const state = get()
        return state.usage[key] >= LIMIT_MAP[key]
      },

      getLimit: (key) => LIMIT_MAP[key],

      getRemainingUses: (key) => {
        const state = get()
        return Math.max(0, LIMIT_MAP[key] - state.usage[key])
      },

      resetUsage: () =>
        set({ usage: { ...initialUsage } }),
    }),
    {
      name: 'vfit-guest',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isGuest: state.isGuest,
        startedAt: state.startedAt,
        usage: state.usage,
      }),
    }
  )
)

export { GUEST_LIMITS }
