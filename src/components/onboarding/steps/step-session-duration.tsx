/**
 * src/components/onboarding/steps/step-session-duration.tsx
 *
 * Onboarding Step 14 — Tempo ideal de treino
 * Rápido(15min) / Curto(30min) / Médio(45min) / Longo(60min)
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
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
          <button
            key={opt.value}
            onClick={() => updateData({ session_duration: opt.value })}
            className={`group relative flex min-h-24 w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
              isSelected
                ? 'border-emerald-300/55 bg-emerald-300/12 shadow-[0_22px_46px_-34px_rgba(34,197,94,0.62)]'
                : 'border-white/9 bg-white/5 hover:border-white/16 hover:bg-white/8'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 transition-all duration-300 ${
                isSelected ? 'scale-105 bg-emerald-300/16' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon name={opt.icon} className={`h-6 w-6 transition-colors ${isSelected ? 'text-emerald-200' : 'text-white/60'}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`text-[15px] font-black transition-colors ${
                    isSelected ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {opt.label}
                </p>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/50">
                  {opt.time}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium leading-5 text-white/45">{opt.subtitle}</p>
            </div>

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
