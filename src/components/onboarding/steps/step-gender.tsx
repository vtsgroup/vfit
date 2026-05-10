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
  { value: 'male', label: 'Masculino', icon: 'user', color: 'from-brand-primary/20 to-emerald-600/5' },
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
            className={`group relative min-h-36 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
              isSelected
                ? 'border-emerald-300/55 bg-emerald-300/12 shadow-[0_22px_46px_-32px_rgba(34,197,94,0.68),inset_0_1px_0_rgba(255,255,255,0.14)]'
                : 'border-white/9 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/16 hover:bg-white/8'
            }`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${opt.color} opacity-70`} />
            <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            <div
              className={`relative z-10 mb-4 flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 transition-all duration-300 ${
                isSelected ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              <DSIcon
                name={opt.icon}
                className={`h-7 w-7 transition-colors ${isSelected ? 'text-brand-primary' : 'text-white/60'}`}
              />
            </div>

            <span
              className={`relative z-10 block text-sm font-black transition-colors ${
                isSelected ? 'text-white' : 'text-white/70'
              }`}
            >
              {opt.label}
            </span>
            <span className="relative z-10 mt-1 block text-[10px] font-semibold uppercase text-white/34">
              Personalização segura
            </span>

            {isSelected && (
              <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300 text-bg-base shadow-[0_0_18px_rgba(134,239,172,0.45)]">
                <DSIcon name="check" className="h-3 w-3" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
