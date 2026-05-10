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
            className={`group relative min-h-38 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
              isSelected
                ? 'border-emerald-300/55 bg-emerald-300/12 shadow-[0_22px_46px_-34px_rgba(34,197,94,0.62)]'
                : 'border-white/9 bg-white/5 hover:border-white/16 hover:bg-white/8'
            }`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${opt.color} opacity-75`} />
            <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            <div
              className={`relative z-10 mb-4 flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 transition-all duration-300 ${
                isSelected ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon
                name={opt.icon}
                className={`h-6 w-6 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/60'}`}
              />
            </div>

            <span
              className={`relative z-10 block text-sm font-black transition-colors ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}
            >
              {opt.label}
            </span>

            <span className="relative z-10 mt-1 block text-[11px] font-medium leading-tight text-white/42">{opt.subtitle}</span>

            {isSelected && (
              <div className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300 text-bg-base shadow-[0_0_18px_rgba(134,239,172,0.45)]">
                <DSIcon name="check" className="h-3 w-3" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
