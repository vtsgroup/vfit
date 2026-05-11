/**
 * src/components/onboarding/steps/step-goal.tsx
 *
 * Onboarding Step 4 — Objetivo Principal
 * 6 cards com ícone: Perder peso, Ganhar massa, Definir, Saúde, Força, Flexibilidade
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceCard } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type GoalOption = {
  value: NonNullable<OnboardingData['goal']>
  label: string
  subtitle: string
  icon: DSIconName
  tone: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose'
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'lose_weight',
    label: 'Perder peso',
    subtitle: 'Queimar gordura e emagrecer',
    icon: 'flame',
    tone: 'rose',
  },
  {
    value: 'gain_muscle',
    label: 'Ganhar massa',
    subtitle: 'Hipertrofia e volume muscular',
    icon: 'dumbbell',
    tone: 'emerald',
  },
  {
    value: 'tone',
    label: 'Definir corpo',
    subtitle: 'Tonificar e marcar músculos',
    icon: 'sparkles',
    tone: 'sky',
  },
  {
    value: 'health',
    label: 'Saúde geral',
    subtitle: 'Melhorar qualidade de vida',
    icon: 'heart',
    tone: 'rose',
  },
  {
    value: 'strength',
    label: 'Força',
    subtitle: 'Ficar mais forte e resistente',
    icon: 'zap',
    tone: 'amber',
  },
  {
    value: 'flexibility',
    label: 'Flexibilidade',
    subtitle: 'Mobilidade e alongamento',
    icon: 'wind',
    tone: 'violet',
  },
]

export function StepGoal() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {GOAL_OPTIONS.map((opt) => {
        const isSelected = data.goal === opt.value
        return (
          <OnboardingChoiceCard
            key={opt.value}
            onClick={() => updateData({ goal: opt.value })}
            selected={isSelected}
            label={opt.label}
            description={opt.subtitle}
            icon={opt.icon}
            tone={opt.tone}
          />
        )
      })}
    </div>
  )
}
