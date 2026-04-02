/**
 * src/hooks/use-gamification.ts
 *
 * Sprint 33 — Hooks de gamificação (XP, nível, badges)
 */

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ── Tipos ──────────────────────────────────────────────
export interface GamificationProfile {
  total_xp: number
  level: number
  xp_in_level: number
  xp_needed: number
  progress_percent: number
  total_workouts: number
  total_records: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
}

// ── Hooks ──────────────────────────────────────────────
export function useGamificationProfile() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['gamification', 'profile'],
    queryFn: async () => {
      const res = await api.get<GamificationProfile>('/gamification/profile')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

export function useBadges() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: async () => {
      const res = await api.get<Badge[]>('/gamification/badges')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

// ── Helpers ────────────────────────────────────────────
export function getLevelTitle(level: number): string {
  if (level <= 3) return 'Iniciante'
  if (level <= 6) return 'Intermediário'
  if (level <= 10) return 'Avançado'
  if (level <= 15) return 'Atleta'
  if (level <= 20) return 'Lenda'
  return 'Mestre'
}

export function getLevelEmoji(level: number): string {
  if (level <= 3) return '🌱'
  if (level <= 6) return '💪'
  if (level <= 10) return '🔥'
  if (level <= 15) return '⚡'
  if (level <= 20) return '🏆'
  return '👑'
}
