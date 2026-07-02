/**
 * src/components/onboarding/steps/step-age.tsx
 *
 * Onboarding Step 8 — Idade
 * Picker nativo mobile: slider (coarse) + steppers ±1 ano (fino) com haptic — sem teclado.
 * Range 13-99 anos, feedback por faixa etária.
 */

'use client'

import { useCallback, useEffect } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { OnboardingInsight } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { hapticLight } from '@/lib/haptics'

const MIN_AGE = 13
const MAX_AGE = 99

export function StepAge() {
  const { data, updateData } = useOnboardingStore()
  const age = data.age ?? 25

  // Picker nativo: começa em um default válido — sem teclado, sem estado inválido
  useEffect(() => {
    if (data.age == null) updateData({ age: 25 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setAge = useCallback(
    (v: number) => {
      updateData({ age: Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(v))) })
    },
    [updateData]
  )

  const step = useCallback(
    (delta: number) => {
      hapticLight()
      setAge(age + delta)
    },
    [age, setAge]
  )

  return (
    <div className="flex flex-col items-center space-y-7">
      {/* Placar: steppers ±1 + número Syne */}
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-glass-inset-sm">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={age <= MIN_AGE}
          aria-label="Diminuir 1 ano"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            age <= MIN_AGE
              ? 'cursor-not-allowed border-white/5 text-white/15'
              : 'border-green-400/25 bg-green-400/6 text-green-300 hover:border-green-400/50 hover:bg-green-400/10 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex min-w-36 flex-col items-center">
          <span className="font-syne text-6xl font-black leading-none text-white tabular-nums">{age}</span>
          <span className="bc-mono mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">anos</span>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={age >= MAX_AGE}
          aria-label="Aumentar 1 ano"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            age >= MAX_AGE
              ? 'cursor-not-allowed border-white/5 text-white/15'
              : 'border-green-400/25 bg-green-400/6 text-green-300 hover:border-green-400/50 hover:bg-green-400/10 active:scale-95'
          }`}
        >
          <DSIcon name="plus" className="h-6 w-6" />
        </button>
      </div>

      {/* Slider — ajuste rápido por arrasto */}
      <div className="w-full max-w-xs space-y-2">
        <input
          type="range"
          min={MIN_AGE}
          max={MAX_AGE}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          aria-label="Idade em anos"
          className="w-full accent-brand-primary"
        />
        <div className="bc-mono flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          <span>{MIN_AGE} anos</span>
          <span>{MAX_AGE} anos</span>
        </div>
      </div>

      {/* Age group feedback */}
      <OnboardingInsight icon={age < 18 ? 'star' : age < 30 ? 'dumbbell' : age < 45 ? 'target' : age < 60 ? 'zap' : 'trophy'}>
        {age < 18
          ? 'Adaptamos o treino para jovens atletas'
          : age < 30
            ? 'Fase ideal para ganhos máximos'
            : age < 45
              ? 'Foco em performance e manutenção'
              : age < 60
                ? 'Treino adaptado para longevidade'
                : 'Exercícios seguros e eficientes'}
      </OnboardingInsight>
    </div>
  )
}
