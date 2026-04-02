/**
 * src/components/onboarding/steps/step-days-per-week.tsx
 *
 * Onboarding Step 13 — Dias por semana desejados
 * Counter +/- (1 a 7)
 */

'use client'

import { useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

const DAY_MESSAGES: Record<number, string> = {
  1: '🌱 Perfeito para começar — consistência é tudo',
  2: '💡 Bom equilíbrio entre descanso e treino',
  3: '🎯 Recomendado para a maioria das pessoas',
  4: '💪 Ótimo para resultados acelerados',
  5: '🔥 Excelente para avançados',
  6: '⚡ Intenso — inclua descanso ativo',
  7: '🏆 Atleta nato — cuidado com overtraining',
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
      {/* Counter */}
      <div className="flex items-center gap-6">
        <button
          onClick={decrement}
          disabled={days <= 1}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all ${
            days <= 1
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/15 text-white/70 hover:bg-white/8 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-7xl font-bold text-white tabular-nums">{days}</span>
          <span className="text-sm text-white/40">
            {days === 1 ? 'dia' : 'dias'} por semana
          </span>
        </div>

        <button
          onClick={increment}
          disabled={days >= 7}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all ${
            days >= 7
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/15 text-white/70 hover:bg-white/8 active:scale-95'
          }`}
        >
          <DSIcon name="plus" className="h-6 w-6" />
        </button>
      </div>

      {/* Visual dots */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              i < days
                ? 'bg-brand-primary scale-110'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Message */}
      <div className="rounded-xl border border-white/8 bg-white/4 px-5 py-3 text-center">
        <p className="text-sm text-white/60">
          {DAY_MESSAGES[days] || DAY_MESSAGES[3]}
        </p>
      </div>
    </div>
  )
}
