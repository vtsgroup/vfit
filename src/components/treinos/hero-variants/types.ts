/**
 * Contrato de props compartilhado pelas variantes de hero da home do aluno.
 * Toda variante é drop-in replacement do FirstWinCommandCenter.
 */

import type { CurrentPlan, PlanDay } from '@/hooks/use-plans'
import type { StreakResponse, DailyGoalResponse, XPBalance } from '@/hooks/use-xp'

export interface HeroVariantProps {
  userName?: string
  todayDay: PlanDay | null
  plan: CurrentPlan | null | undefined
  planPct: number
  totals: { calories: number; protein: number; carbs: number; fat: number }
  targets: { calories: number; protein: number; carbs: number; fat: number }
  streak: StreakResponse | undefined
  xpBalance: XPBalance | undefined
  dailyGoal: DailyGoalResponse | undefined
  workoutCount: number
}

export const MUSCLE_PT: Record<string, string> = {
  chest: 'Peito', back: 'Costas', shoulders: 'Ombros', biceps: 'Bíceps',
  triceps: 'Tríceps', legs: 'Pernas', quadriceps: 'Quadríceps', hamstrings: 'Isquiotibiais',
  glutes: 'Glúteos', calves: 'Panturrilhas', abs: 'Abdômen', core: 'Core',
  forearms: 'Antebraços', traps: 'Trapézio', full_body: 'Corpo Total',
  lats: 'Dorsais', rhomboids: 'Romboides', lower_back: 'Lombar',
  hip_flexors: 'Flexores do Quadril', adductors: 'Adutores',
}

export function translateMuscles(groups: string[], max = 3): string {
  return groups
    .slice(0, max)
    .map((m) => MUSCLE_PT[m.toLowerCase()] || MUSCLE_PT[m.toLowerCase().replace(/ /g, '_')] || m)
    .join(' · ')
}
