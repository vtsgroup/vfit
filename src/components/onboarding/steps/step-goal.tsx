/**
 * src/components/onboarding/steps/step-goal.tsx
 *
 * Onboarding Step 4 — Objetivo Principal
 * 6 cards com ícone: Perder peso, Ganhar massa, Definir, Saúde, Força, Flexibilidade
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type GoalOption = {
  value: NonNullable<OnboardingData['goal']>
  label: string
  subtitle: string
  icon: DSIconName
  color: string
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'lose_weight',
    label: 'Perder peso',
    subtitle: 'Queimar gordura e emagrecer',
    icon: 'flame',
    color: 'from-orange-500/20 to-red-500/5',
  },
  {
    value: 'gain_muscle',
    label: 'Ganhar massa',
    subtitle: 'Hipertrofia e volume muscular',
    icon: 'dumbbell',
    color: 'from-brand-primary/20 to-indigo-500/5',
  },
  {
    value: 'tone',
    label: 'Definir corpo',
    subtitle: 'Tonificar e marcar músculos',
    icon: 'sparkles',
    color: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    value: 'health',
    label: 'Saúde geral',
    subtitle: 'Melhorar qualidade de vida',
    icon: 'heart',
    color: 'from-pink-500/20 to-rose-500/5',
  },
  {
    value: 'strength',
    label: 'Força',
    subtitle: 'Ficar mais forte e resistente',
    icon: 'zap',
    color: 'from-yellow-500/20 to-amber-500/5',
  },
  {
    value: 'flexibility',
    label: 'Flexibilidade',
    subtitle: 'Mobilidade e alongamento',
    icon: 'wind',
    color: 'from-brand-primary/20 to-teal-500/5',
  },
]

export function StepGoal() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {GOAL_OPTIONS.map((opt) => {
        const isSelected = data.goal === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => updateData({ goal: opt.value })}
            className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-300 ${
              isSelected
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10 scale-[1.02]'
                : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            {/* Icon */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${opt.color} transition-all duration-300 ${
                isSelected ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon
                name={opt.icon}
                className={`h-6 w-6 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/60'}`}
              />
            </div>

            {/* Label */}
            <span
              className={`text-sm font-bold transition-colors ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}
            >
              {opt.label}
            </span>

            {/* Subtitle */}
            <span className="text-[11px] text-white/35 leading-tight">{opt.subtitle}</span>

            {/* Check */}
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                <DSIcon name="check" className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
