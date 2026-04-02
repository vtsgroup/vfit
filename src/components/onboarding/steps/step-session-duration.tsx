/**
 * src/components/onboarding/steps/step-session-duration.tsx
 *
 * Onboarding Step 14 — Tempo ideal de treino
 * Rápido(15min) / Curto(30min) / Médio(45min) / Longo(60min)
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type DurationOption = {
  value: NonNullable<OnboardingData['session_duration']>
  label: string
  time: string
  subtitle: string
  emoji: string
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    value: 'quick_15',
    label: 'Rápido',
    time: '~15 min',
    subtitle: 'Treinos express para dias corridos',
    emoji: '⚡',
  },
  {
    value: 'short_30',
    label: 'Curto',
    time: '~30 min',
    subtitle: 'Eficiente e focado — ideal para iniciantes',
    emoji: '🎯',
  },
  {
    value: 'medium_45',
    label: 'Médio',
    time: '~45 min',
    subtitle: 'Equilíbrio perfeito entre tempo e resultado',
    emoji: '💪',
  },
  {
    value: 'long_60',
    label: 'Longo',
    time: '~60 min',
    subtitle: 'Treino completo para máximos resultados',
    emoji: '🔥',
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
            className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
              isSelected
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10'
                : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/6 text-2xl transition-all duration-300 ${
                isSelected ? 'scale-110 bg-brand-primary/15' : 'group-hover:scale-105'
              }`}
            >
              {opt.emoji}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {opt.label}
                </p>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/50">
                  {opt.time}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/40">{opt.subtitle}</p>
            </div>

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
