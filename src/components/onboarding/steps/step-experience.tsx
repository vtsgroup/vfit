/**
 * src/components/onboarding/steps/step-experience.tsx
 *
 * Onboarding Step 2 — Nível de Experiência
 * Iniciante / Intermediário / Avançado (com subtexto explicativo)
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type ExperienceOption = {
  value: NonNullable<OnboardingData['experience_level']>
  label: string
  subtitle: string
  icon: DSIconName
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    value: 'beginner',
    label: 'Iniciante',
    subtitle: 'Nunca treinei ou treino há menos de 6 meses',
    icon: 'target',
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    subtitle: 'Treino regularmente há mais de 6 meses',
    icon: 'trendingUp',
  },
  {
    value: 'advanced',
    label: 'Avançado',
    subtitle: 'Treino há mais de 2 anos com experiência sólida',
    icon: 'award',
  },
]

export function StepExperience() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {EXPERIENCE_OPTIONS.map((opt) => {
        const isSelected = data.experience_level === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ experience_level: opt.value })}
            selected={isSelected}
            label={opt.label}
            description={opt.subtitle}
            icon={opt.icon}
          />
        )
      })}
    </div>
  )
}
