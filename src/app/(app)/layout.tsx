/**
 * src/app/(app)/layout.tsx
 *
 * Layout — VFIT B2C App (v4)
 *
 * Wrapper com StudentHeader (fixed top) + BottomNavigation + StudentFabMenu.
 * Requer autenticação (redireciona para /login se não autenticado).
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { StudentHeader } from '@/components/navigation/student-header'
import { BottomNavigation } from '@/components/navigation/bottom-navigation'
import { StudentFabMenu } from '@/components/navigation/student-fab-menu'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { OneSignalProvider } from '@/components/providers/onesignal-provider'
import { ToastContainer } from '@/components/layout/toast-container'
import { useAuthStore } from '@/stores/auth-store'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'

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
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const userType = useAuthStore((s) => s.user?.user_type)
  const [fabMenuOpen, setFabMenuOpen] = useState(false)

  // Use effective user view to support admin simulation
  const { effectiveType, isSimulationActive } = useEffectiveUserView()

  // Immersive routes: hide global header + bottom nav (active workout has its own dark sticky header)
  const isImmersiveRoute = pathname?.startsWith('/treino-ativo') ?? false

  // Check onboarding status — for students AND admins simulating as student
  const isEffectiveStudent = effectiveType === 'student'
  const { data: onboardingStatus, isLoading: onboardingLoading } = useB2COnboardingCompleted(
    isHydrated && isAuthenticated && isEffectiveStudent,
  )

  // Pull-to-refresh handler — invalida todas as queries
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries()
  }, [queryClient])

  // Migrate legacy keys before any reads
  useEffect(() => { migrateLocalStorageKeys() }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated) {
      // Check for guest mode
      const isGuest = typeof window !== 'undefined' && localStorage.getItem('vfit_guest_mode') === 'true'
      if (!isGuest) router.replace('/welcome')
      return
    }
    // T7.8 — Personal trainers should use the B2B dashboard, not the B2C app
    // BUT: if admin is simulating as student, stay in B2C app
    if (userType === 'personal' && !isSimulationActive) {
      router.replace('/dashboard')
    }
  }, [isHydrated, isAuthenticated, userType, isSimulationActive, router])

  // Force onboarding for students (or simulated students) who haven't completed the quiz
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !isEffectiveStudent) return
    if (onboardingLoading) return
    if (onboardingStatus?.completed) return
    // Don't redirect if already going to onboarding-related pages
    if (pathname === '/perfil/assinatura' || pathname === '/perfil/editar' || pathname === '/perfil/sobre') return
    router.replace('/onboarding')
  }, [isHydrated, isAuthenticated, isEffectiveStudent, onboardingLoading, onboardingStatus, pathname, router])

  return (
    <OneSignalProvider>
      <div className="min-h-screen bg-bg-primary">
        {/* Fixed Header (v4) — hidden on immersive routes */}
        {!isImmersiveRoute && <StudentHeader />}

        {/* Main content — padding for fixed header top + bottom nav (zeroed on immersive routes) */}
        <main className={isImmersiveRoute ? '' : 'pt-(--pt-student) pb-(--pb-nav)'}>
          <PullToRefresh onRefresh={handleRefresh}>
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </PullToRefresh>
        </main>

        {/* Bottom Navigation (v4) + FAB AI Menu — hidden on immersive routes */}
        {!isImmersiveRoute && (
          <>
            <BottomNavigation
              fabMenuOpen={fabMenuOpen}
              onFabPress={() => setFabMenuOpen((prev) => !prev)}
            />
            <StudentFabMenu
              open={fabMenuOpen}
              onClose={() => setFabMenuOpen(false)}
            />
          </>
        )}
        <ToastContainer />
      </div>
    </OneSignalProvider>
  )
}
