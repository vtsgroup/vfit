/**
 * src/components/onboarding/steps/step-experience.tsx
 *
 * Onboarding Step 2 — Nível de Experiência
 * Iniciante / Intermediário / Avançado (com subtexto explicativo)
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type ExperienceOption = {
  value: NonNullable<OnboardingData['experience_level']>
  label: string
  subtitle: string
  icon: DSIconName
  emoji: string
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    value: 'beginner',
    label: 'Iniciante',
    subtitle: 'Nunca treinei ou treino há menos de 6 meses',
    icon: 'target',
    emoji: '🌱',
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    subtitle: 'Treino regularmente há mais de 6 meses',
    icon: 'trendingUp',
    emoji: '💪',
  },
  {
    value: 'advanced',
    label: 'Avançado',
    subtitle: 'Treino há mais de 2 anos com experiência sólida',
    icon: 'award',
    emoji: '🏆',
  },
]

export function StepExperience() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="space-y-3">
      {EXPERIENCE_OPTIONS.map((opt) => {
        const isSelected = data.experience_level === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => updateData({ experience_level: opt.value })}
            className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
              isSelected
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10'
                : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            {/* Emoji */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/6 text-2xl transition-all duration-300 ${
                isSelected ? 'scale-110 bg-brand-primary/15' : 'group-hover:scale-105'
              }`}
            >
              {opt.emoji}
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
