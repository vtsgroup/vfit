/**
 * src/components/onboarding/steps/step-session-duration.tsx
 *
 * Onboarding Step 14 — Tempo ideal de treino
 * Rápido(15min) / Curto(30min) / Médio(45min) / Longo(60min)
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type DurationOption = {
  value: NonNullable<OnboardingData['session_duration']>
  label: string
  time: string
  subtitle: string
  icon: DSIconName
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    value: 'quick_15',
    label: 'Rápido',
    time: '~15 min',
    subtitle: 'Treinos express para dias corridos',
    icon: 'zap',
  },
  {
    value: 'short_30',
    label: 'Curto',
    time: '~30 min',
    subtitle: 'Eficiente e focado — ideal para iniciantes',
    icon: 'target',
  },
  {
    value: 'medium_45',
    label: 'Médio',
    time: '~45 min',
    subtitle: 'Equilíbrio perfeito entre tempo e resultado',
    icon: 'dumbbell',
  },
  {
    value: 'long_60',
    label: 'Longo',
    time: '~60 min',
    subtitle: 'Treino completo para máximos resultados',
    icon: 'flame',
  },
]

export function StepSessionDuration() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {DURATION_OPTIONS.map((opt) => {
        const isSelected = data.session_duration === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ session_duration: opt.value })}
            selected={isSelected}
            label={opt.label}
            description={opt.subtitle}
            icon={opt.icon}
            meta={opt.time}
          />
        )
      })}
    </div>
  )
}
