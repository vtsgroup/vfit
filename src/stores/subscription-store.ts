/**
 * src/stores/subscription-store.ts
 *
 * VFIT B2C — Subscription state management
 * Tracks current plan, limits, premium status
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================
// Types
// ============================================

export interface SubscriptionLimits {
  ai_plans_per_month: number    // -1 = unlimited
  workouts_per_week: number     // -1 = unlimited
  ai_chat_messages: number      // -1 = unlimited
  exercise_library: 'basic' | 'full'
}

export interface SubscriptionUsage {
  ai_plans_used: number
  workouts_this_week: number
  ai_messages_used: number
}

export interface SubscriptionState {
  // State
  plan: 'free' | 'premium' | 'premium_annual'
  isPremium: boolean
  limits: SubscriptionLimits
  usage: SubscriptionUsage
  expiresAt: string | null
  isLoading: boolean
  lastFetchedAt: string | null

  // Actions
  setSubscription: (data: {
    plan: SubscriptionState['plan']
    isPremium: boolean
    limits: SubscriptionLimits
    usage?: Partial<SubscriptionUsage>
    expiresAt?: string | null
  }) => void
  setUsage: (usage: Partial<SubscriptionUsage>) => void
  incrementUsage: (key: keyof SubscriptionUsage) => void
  setLoading: (loading: boolean) => void
  canUseFeature: (feature: keyof Omit<SubscriptionLimits, 'exercise_library'>) => boolean
  hasFullLibrary: () => boolean
  reset: () => void
}

// ============================================
// Defaults
// ============================================

const DEFAULT_LIMITS: SubscriptionLimits = {
  ai_plans_per_month: 1,
  workouts_per_week: 3,
  ai_chat_messages: 10,
  exercise_library: 'basic',
}

const DEFAULT_USAGE: SubscriptionUsage = {
  ai_plans_used: 0,
  workouts_this_week: 0,
  ai_messages_used: 0,
}

// ============================================
// Store
// ============================================

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      plan: 'free',
      isPremium: false,
      limits: { ...DEFAULT_LIMITS },
      usage: { ...DEFAULT_USAGE },
      expiresAt: null,
      isLoading: false,
      lastFetchedAt: null,

      // Actions
      setSubscription: (data) =>
        set({
          plan: data.plan,
          isPremium: data.isPremium,
          limits: data.limits,
          usage: data.usage
            ? { ...DEFAULT_USAGE, ...data.usage }
            : get().usage,
          expiresAt: data.expiresAt ?? null,
          lastFetchedAt: new Date().toISOString(),
          isLoading: false,
        }),

      setUsage: (usage) =>
        set((state) => ({
          usage: { ...state.usage, ...usage },
        })),

      incrementUsage: (key) =>
        set((state) => ({
          usage: {
            ...state.usage,
            [key]: state.usage[key] + 1,
          },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      canUseFeature: (feature) => {
        const { limits, usage } = get()
        const limit = limits[feature]
        if (limit === -1) return true // unlimited

        const usageMap: Record<keyof Omit<SubscriptionLimits, 'exercise_library'>, keyof SubscriptionUsage> = {
          ai_plans_per_month: 'ai_plans_used',
          workouts_per_week: 'workouts_this_week',
          ai_chat_messages: 'ai_messages_used',
        }

        return usage[usageMap[feature]] < limit
      },

      hasFullLibrary: () => get().limits.exercise_library === 'full',

      reset: () =>
        set({
          plan: 'free',
          isPremium: false,
          limits: { ...DEFAULT_LIMITS },
          usage: { ...DEFAULT_USAGE },
          expiresAt: null,
          isLoading: false,
          lastFetchedAt: null,
        }),
    }),
    {
      name: 'vfit-subscription',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        plan: state.plan,
        isPremium: state.isPremium,
        limits: state.limits,
        usage: state.usage,
        expiresAt: state.expiresAt,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
