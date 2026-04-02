// ============================================
// use-effective-user-view.ts — Tipo efetivo de usuário com simulação admin
// ============================================
//
// O que faz:
//   Resolve o tipo efetivo de usuário considerando simulação ativa por
//   super_admin. Se super_admin estiver simulando personal ou student,
//   retorna o tipo simulado em vez do tipo real.
//
// Exports principais:
//   useEffectiveUserView() → { effectiveType, isSimulating, simulation }
//
// Hooks usados: useAuthStore, useAdminSimulationSession
// Auth: requer isHydrated no authStore
// ============================================
'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useAdminSimulationSession } from '@/hooks/use-admin'

export function useEffectiveUserView() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isSuperAdmin = user?.role === 'super_admin'
  const isAdmin = user?.role === 'admin'
  const canSimulate = isSuperAdmin || isAdmin
  const simulationQuery = useAdminSimulationSession()

  const simulation = canSimulate ? simulationQuery.data?.simulation : null
  const simulationMode = simulation?.mode || 'super_admin'

  const effectiveType = canSimulate
    ? (simulationMode === 'personal' || simulationMode === 'student'
      ? simulationMode
      : 'admin')
    : (user?.user_type || 'student')

  const hasAdminCapabilities = user?.role === 'admin' || user?.role === 'super_admin'

  return {
    isHydrated,
    isSuperAdmin,
    isAdmin,
    canSimulate,
    simulation,
    simulationMode,
    isSimulationActive: canSimulate && simulationMode !== 'super_admin',
    effectiveType,
    isPersonalView: effectiveType === 'personal' || effectiveType === 'admin',
    isStudentView: effectiveType === 'student',
    hasAdminCapabilities,
  }
}
