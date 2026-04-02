/**
 * src/components/onboarding/steps/step-preferred-time.tsx
 *
 * Onboarding Step — Horário preferido
 * Manhã / Tarde / Noite / Tanto faz
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type TimeOption = {
  value: NonNullable<OnboardingData['preferred_time']>
  label: string
  subtitle: string
  emoji: string
}

const TIME_OPTIONS: TimeOption[] = [
  {
    value: 'morning',
    label: 'Manhã',
    subtitle: '6h - 12h · Mais energia e foco',
    emoji: '🌅',
  },
  {
    value: 'afternoon',
    label: 'Tarde',
    subtitle: '12h - 18h · Pico de performance muscular',
    emoji: '☀️',
  },
  {
    value: 'evening',
    label: 'Noite',
    subtitle: '18h - 22h · Alívio do estresse do dia',
    emoji: '🌙',
  },
  {
    value: 'any',
    label: 'Tanto faz',
    subtitle: 'Flexível — treino quando der',
    emoji: '🔄',
  },
]

export function StepPreferredTime() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {TIME_OPTIONS.map((opt) => {
        const isSelected = data.preferred_time === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => updateData({ preferred_time: opt.value })}
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
              <p
                className={`text-sm font-bold transition-colors ${
                  isSelected ? 'text-white' : 'text-white/80'
                }`}
              >
                {opt.label}
              </p>
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
