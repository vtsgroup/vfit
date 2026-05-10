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
            className={`group relative flex min-h-24 w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
              isSelected
                ? 'border-emerald-300/55 bg-emerald-300/12 shadow-[0_22px_46px_-34px_rgba(34,197,94,0.62)]'
                : 'border-white/9 bg-white/5 hover:border-white/16 hover:bg-white/8'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            {/* Icon */}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 transition-all duration-300 ${
                isSelected ? 'scale-105 bg-emerald-300/16' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon name={opt.icon} className={`h-6 w-6 transition-colors ${isSelected ? 'text-emerald-200' : 'text-white/60'}`} />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p
                className={`text-[15px] font-black transition-colors ${
                  isSelected ? 'text-white' : 'text-white/80'
                }`}
              >
                {opt.label}
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-white/45">{opt.subtitle}</p>
            </div>

            {/* Check */}
            {isSelected && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-bg-base shadow-[0_0_18px_rgba(134,239,172,0.45)]">
                <DSIcon name="check" className="h-3.5 w-3.5" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
