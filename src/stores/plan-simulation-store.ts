/**
 * src/stores/plan-simulation-store.ts
 *
 * Zustand micro-store para simulação visual de plano (super_admin only)
 *
 * Permite ao super_admin trocar o plano visualmente no dashboard inteiro
 * (badges, cards, comparações) sem afetar o banco de dados.
 *
 * NÃO persiste — reset a cada refresh (simulação é temporária).
 */

import { create } from 'zustand'

interface PlanSimulationState {
  /** Slug do plano simulado (null = usar valor real do perfil / 'max' para super_admin) */
  simulatedPlan: string | null
  /** Seta o plano simulado */
  setSimulatedPlan: (plan: string | null) => void
  /** Reset para default */
  resetSimulation: () => void
}

export const usePlanSimulationStore = create<PlanSimulationState>((set) => ({
  simulatedPlan: null,
  setSimulatedPlan: (plan) => set({ simulatedPlan: plan }),
  resetSimulation: () => set({ simulatedPlan: null }),
}))
