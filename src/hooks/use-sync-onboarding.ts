/**
 * src/hooks/use-sync-onboarding.ts
 *
 * Hook que sincroniza dados do quiz de onboarding (localStorage)
 * com o backend após o usuário se autenticar.
 *
 * Fluxo: welcome → quiz (Zustand/localStorage) → signup/login → dashboard
 * → useSyncOnboarding detecta dados pendentes → POST /onboarding → limpa localStorage
 */

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api-client'

const STORAGE_KEY = 'vfit-onboarding'

export function useSyncOnboarding() {
  const hasSynced = useRef(false)
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  useEffect(() => {
    if (!isReady || hasSynced.current) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)
      const state = parsed?.state
      if (!state?.isCompleted || !state?.data) return

      // Marcar como synced para evitar duplicação
      hasSynced.current = true
      const data = state.data

      api
        .post('/onboarding', {
          gender: data.gender || 'prefer_not_say',
          experience_level: data.experience_level || 'beginner',
          training_frequency: data.training_frequency || 'never',
          goal: data.goal || 'health',
          training_location: data.training_location || 'gym_large',
          target_muscles: data.target_muscles || [],
          age: data.age || 25,
          height_cm: data.height_cm || 170,
          weight_kg: data.weight_kg || 70,
          target_weight_kg: data.target_weight_kg || data.weight_kg || 70,
          days_per_week: data.days_per_week || 3,
          session_duration: data.session_duration || 'medium_45',
          injuries: data.injuries || [],
          preferred_days: data.preferred_days || [],
          preferred_time: data.preferred_time || 'any',
        })
        .then(() => {
          localStorage.removeItem(STORAGE_KEY)
          console.log('[Onboarding] Synced to backend and cleared localStorage')
        })
        .catch((err) => {
          console.warn('[Onboarding] Sync failed, will retry:', err)
          hasSynced.current = false // Allow retry on next render
        })
    } catch {
      // ignore parse errors — corrupted localStorage data
    }
  }, [isReady])
}
