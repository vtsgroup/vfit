/**
 * src/components/onboarding/steps/step-days-per-week.tsx
 *
 * Onboarding Step 13 — Dias por semana desejados
 * Counter +/- (1 a 7)
 */

'use client'

import { useCallback } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { OnboardingInsight } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'

const DAY_MESSAGES: Record<number, { icon: DSIconName; text: string }> = {
  1: { icon: 'target', text: 'Perfeito para começar — consistência é tudo' },
  2: { icon: 'lightbulb', text: 'Bom equilíbrio entre descanso e treino' },
  3: { icon: 'target', text: 'Recomendado para a maioria das pessoas' },
  4: { icon: 'dumbbell', text: 'Ótimo para resultados acelerados' },
  5: { icon: 'flame', text: 'Excelente para avançados' },
  6: { icon: 'zap', text: 'Intenso — inclua descanso ativo' },
  7: { icon: 'trophy', text: 'Atleta nato — cuidado com overtraining' },
}

export function StepDaysPerWeek() {
  const { data, updateData } = useOnboardingStore()
  const days = data.days_per_week

  const decrement = useCallback(() => {
    if (days > 1) updateData({ days_per_week: days - 1 })
  }, [days, updateData])

  const increment = useCallback(() => {
    if (days < 7) updateData({ days_per_week: days + 1 })
  }, [days, updateData])

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <button
          onClick={decrement}
          disabled={days <= 1}
          className={`flex h-14 w-14 items-center justify-center rounded-[18px] border transition-all ${
            days <= 1
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/12 bg-white/6 text-white/76 hover:bg-white/10 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-7xl font-black leading-none text-white tabular-nums">{days}</span>
          <span className="mt-1 text-sm font-medium text-slate-400">
            {days === 1 ? 'dia' : 'dias'} por semana
          </span>
        </div>

        <button
          onClick={increment}
          disabled={days >= 7}
          className={`flex h-14 w-14 items-center justify-center rounded-[18px] border transition-all ${
            days >= 7
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/12 bg-white/6 text-white/76 hover:bg-white/10 active:scale-95'
          }`}
        >
          <DSIcon name="plus" className="h-6 w-6" />
        </button>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i < days
                ? 'w-7 bg-emerald-300 shadow-[0_0_14px_rgba(134,239,172,0.28)]'
                : 'w-2.5 bg-white/10'
            }`}
          />
        ))}
      </div>

      <OnboardingInsight icon={(DAY_MESSAGES[days] || DAY_MESSAGES[3]).icon}>
        {(DAY_MESSAGES[days] || DAY_MESSAGES[3]).text}
      </OnboardingInsight>
    </div>
  )
}
