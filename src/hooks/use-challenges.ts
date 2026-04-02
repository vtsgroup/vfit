/**
 * src/hooks/use-challenges.ts
 *
 * Sprint 34 — Hooks de streak e desafios semanais
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ── Tipos ──────────────────────────────────────────────
export interface StreakInfo {
  current_streak: number
  best_streak: number
  trained_today: boolean
  milestones: { days: number; reached: boolean; current: boolean }[]
  next_milestone: number | null
  days_to_next: number
}

export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  icon: string
  target: number
  current: number
  completed: boolean
  xp_reward: number
}

// ── Hooks ──────────────────────────────────────────────
export function useStreak() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['challenges', 'streak'],
    queryFn: async () => {
      const res = await api.get<StreakInfo>('/challenges/streak')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

export function useWeeklyChallenges() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['challenges', 'weekly'],
    queryFn: async () => {
      const res = await api.get<WeeklyChallenge[]>('/challenges/weekly')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}
