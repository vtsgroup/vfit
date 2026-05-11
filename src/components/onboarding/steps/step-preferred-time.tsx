/**
 * src/components/onboarding/steps/step-preferred-time.tsx
 *
 * Onboarding Step — Horário preferido
 * Manhã / Tarde / Noite / Tanto faz
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type TimeOption = {
  value: NonNullable<OnboardingData['preferred_time']>
  label: string
  subtitle: string
  icon: DSIconName
}

const TIME_OPTIONS: TimeOption[] = [
  {
    value: 'morning',
    label: 'Manhã',
    subtitle: '6h - 12h · Mais energia e foco',
    icon: 'sun',
  },
  {
    value: 'afternoon',
    label: 'Tarde',
    subtitle: '12h - 18h · Pico de performance muscular',
    icon: 'zap',
  },
  {
    value: 'evening',
    label: 'Noite',
    subtitle: '18h - 22h · Alívio do estresse do dia',
    icon: 'moon',
  },
  {
    value: 'any',
    label: 'Tanto faz',
    subtitle: 'Flexível — treino quando der',
    icon: 'refresh',
  },
]

export function StepPreferredTime() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {TIME_OPTIONS.map((opt) => {
        const isSelected = data.preferred_time === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ preferred_time: opt.value })}
            selected={isSelected}
            label={opt.label}
            description={opt.subtitle}
            icon={opt.icon}
            tone={opt.value === 'morning' ? 'amber' : opt.value === 'evening' ? 'sky' : 'emerald'}
          />
        )
      })}
    </div>
  )
}
