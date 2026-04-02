/**
 * src/app/(app)/layout.tsx
 *
 * Layout — VFIT B2C App
 *
 * Wrapper com BottomNavigation para todas as rotas B2C.
 * Requer autenticação (redireciona para /login se não autenticado).
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNavigation } from '@/components/navigation/bottom-navigation'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Migrate legacy localStorage keys (evoluia_* → vfit_*) once per device.
 * Runs before any key read so guest mode / offline prefs are preserved.
 */
function migrateLocalStorageKeys() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('vfit_keys_migrated')) return

  const keyMap: Record<string, string> = {
    'evoluia_guest_mode': 'vfit_guest_mode',
    'evoluia_guest_started_at': 'vfit_guest_started_at',
    'evoluia_offline_mode': 'vfit_offline_mode',
    'evoluia_reduced_motion': 'vfit_reduced_motion',
    'evoluia_equipment': 'vfit_equipment',
  }

  for (const [oldKey, newKey] of Object.entries(keyMap)) {
    const val = localStorage.getItem(oldKey)
    if (val !== null) {
      localStorage.setItem(newKey, val)
      localStorage.removeItem(oldKey)
    }
  }

  // Zustand stores (persist middleware uses these names)
  const storeMap: Record<string, string> = {
    'evoluia-active-workout': 'vfit-active-workout',
    'evoluia-guest': 'vfit-guest',
    'evoluia-subscription': 'vfit-subscription',
    'evoluia-onboarding': 'vfit-onboarding',
    'personal-ia-auth': 'vfit-auth',
    'personal-ia-app': 'vfit-app',
  }

  for (const [oldKey, newKey] of Object.entries(storeMap)) {
    const val = localStorage.getItem(oldKey)
    if (val !== null) {
      localStorage.setItem(newKey, val)
      localStorage.removeItem(oldKey)
    }
  }

  localStorage.setItem('vfit_keys_migrated', '1')
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  // Migrate legacy keys before any reads
  useEffect(() => { migrateLocalStorageKeys() }, [])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      // Check for guest mode
      const isGuest = typeof window !== 'undefined' && localStorage.getItem('vfit_guest_mode') === 'true'
      if (!isGuest) {
        router.replace('/welcome')
      }
    }
  }, [isHydrated, isAuthenticated, router])

  return (
    <div className="vfit-theme min-h-screen bg-bg-dark">
      {/* Main content — padding bottom for nav bar + safe area */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
