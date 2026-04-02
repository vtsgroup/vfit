/**
 * src/components/onboarding/steps/step-gender.tsx
 *
 * Onboarding Step 1 — Gênero
 * Cards: Masculino / Feminino / Outro / Prefiro não dizer
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type GenderOption = {
  value: NonNullable<OnboardingData['gender']>
  label: string
  icon: DSIconName
  color: string
}

const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Masculino', icon: 'user', color: 'from-blue-500/20 to-blue-600/5' },
  { value: 'female', label: 'Feminino', icon: 'user', color: 'from-pink-500/20 to-pink-600/5' },
  { value: 'other', label: 'Outro', icon: 'users', color: 'from-purple-500/20 to-purple-600/5' },
  { value: 'prefer_not_say', label: 'Prefiro não dizer', icon: 'shieldCheck', color: 'from-white/10 to-white/5' },
]

export function StepGender() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {GENDER_OPTIONS.map((opt) => {
        const isSelected = data.gender === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => updateData({ gender: opt.value })}
            className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-300 ${
              isSelected
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10 scale-[1.02]'
                : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
            }`}
          >
            {/* Icon */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${opt.color} transition-all duration-300 ${
                isSelected ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon
                name={opt.icon}
                className={`h-7 w-7 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/60'}`}
              />
            </div>

            {/* Label */}
            <span
              className={`text-sm font-semibold transition-colors ${
                isSelected ? 'text-white' : 'text-white/70'
              }`}
            >
              {opt.label}
            </span>

            {/* Check indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                <DSIcon name="check" className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
