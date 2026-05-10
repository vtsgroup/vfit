/**
 * src/components/onboarding/steps/step-age.tsx
 *
 * Onboarding Step 8 — Idade
 * Numeric input with validation (13-99)
 */

'use client'

import { useCallback, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function StepAge() {
  const { data, updateData } = useOnboardingStore()
  const [input, setInput] = useState(data.age?.toString() ?? '')

  const handleChange = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 2)
      setInput(digits)
      const num = Number(digits)
      if (num >= 13 && num <= 99) {
        updateData({ age: num })
      } else {
        updateData({ age: null })
      }
    },
    [updateData]
  )

  const age = data.age

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Big input */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="25"
            className="h-30 w-42 rounded-[28px] border border-emerald-300/18 bg-white/8 text-center text-5xl font-black text-white shadow-[0_26px_54px_-38px_rgba(34,197,94,0.58),inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition-all placeholder:text-white/15 focus:border-emerald-300/55 focus:ring-4 focus:ring-emerald-300/14"
            autoFocus
          />
          <span className="absolute right-4 bottom-3 text-sm text-white/30">anos</span>
        </div>

        {/* Validation message */}
        {input.length > 0 && !age && (
          <p className="text-xs text-red-400/80">
            Idade deve ser entre 13 e 99 anos
          </p>
        )}
      </div>

      {/* Age group feedback */}
      {age && (
        <div className="flex items-center gap-2.5 rounded-card-lg border border-white/10 bg-white/7 px-5 py-3 shadow-glass-inset-sm">
          <DSIcon
            name={age < 18 ? 'star' : age < 30 ? 'dumbbell' : age < 45 ? 'target' : age < 60 ? 'zap' : 'trophy'}
            className="h-5 w-5 shrink-0 text-brand-primary"
          />
          <p className="text-sm text-white/70">
            {age < 18
              ? 'Adaptamos o treino para jovens atletas'
              : age < 30
                ? 'Fase ideal para ganhos máximos'
                : age < 45
                  ? 'Foco em performance e manutenção'
                  : age < 60
                    ? 'Treino adaptado para longevidade'
                    : 'Exercícios seguros e eficientes'}
          </p>
        </div>
      )}
    </div>
  )
}
