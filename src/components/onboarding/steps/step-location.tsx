/**
 * src/components/onboarding/steps/step-location.tsx
 *
 * Onboarding Step 5 — Local de Treino
 * Academia Grande / Pequena / Casa / Corpo / Ar livre
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
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
          <button
            key={opt.value}
            onClick={() => updateData({ training_location: opt.value })}
            className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
              isSelected
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10'
                : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            {/* Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/6 transition-all duration-300 ${
                isSelected ? 'scale-110 bg-brand-primary/15' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon name={opt.icon} className={`h-6 w-6 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/60'}`} />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p
                className={`text-sm font-bold transition-colors ${
                  isSelected ? 'text-white' : 'text-white/80'
                }`}
              >
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs text-white/40">{opt.subtitle}</p>
            </div>

            {/* Check */}
            {isSelected && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                <DSIcon name="check" className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
