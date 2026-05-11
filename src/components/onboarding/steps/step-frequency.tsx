/**
 * src/components/onboarding/steps/step-frequency.tsx
 *
 * Onboarding Step 3 — Frequência Atual de Treino
 * Regularmente / Inconsistente / Nunca
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type FrequencyOption = {
  value: NonNullable<OnboardingData['training_frequency']>
  label: string
  subtitle: string
  icon: DSIconName
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'regularly',
    label: 'Regularmente',
    subtitle: '3+ vezes por semana com consistência',
    icon: 'flame',
  },
  {
    value: 'inconsistently',
    label: 'De vez em quando',
    subtitle: 'Treino, paro, e volto sem regularidade',
    icon: 'activity',
  },
  {
    value: 'never',
    label: 'Nunca treinei',
    subtitle: 'Primeira vez buscando um plano de treino',
    icon: 'rocket',
  },
]

export function StepFrequency() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {FREQUENCY_OPTIONS.map((opt) => {
        const isSelected = data.training_frequency === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ training_frequency: opt.value })}
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
