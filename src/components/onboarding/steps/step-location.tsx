/**
 * src/components/onboarding/steps/step-location.tsx
 *
 * Onboarding Step 5 — Local de Treino
 * Academia Grande / Pequena / Casa / Corpo / Ar livre
 */

'use client'

import type { DSIconName } from '@/components/ui/ds-icon'
import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type LocationOption = {
  value: NonNullable<OnboardingData['training_location']>
  label: string
  subtitle: string
  icon: DSIconName
}

const LOCATION_OPTIONS: LocationOption[] = [
  {
    value: 'gym_large',
    label: 'Academia completa',
    subtitle: 'Com todos os equipamentos e máquinas',
    icon: 'dumbbell',
  },
  {
    value: 'gym_small',
    label: 'Academia pequena',
    subtitle: 'Equipamentos básicos (halteres, barra, cabos)',
    icon: 'dumbbell',
  },
  {
    value: 'home',
    label: 'Em casa',
    subtitle: 'Com alguns equipamentos (halteres, faixas)',
    icon: 'home',
  },
  {
    value: 'bodyweight',
    label: 'Peso corporal',
    subtitle: 'Sem nenhum equipamento, apenas corpo',
    icon: 'user',
  },
  {
    value: 'outdoor',
    label: 'Ao ar livre',
    subtitle: 'Parques, praças, trilhas',
    icon: 'sun',
  },
]

export function StepLocation() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {LOCATION_OPTIONS.map((opt) => {
        const isSelected = data.training_location === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ training_location: opt.value })}
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
