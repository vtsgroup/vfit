/**
 * src/components/onboarding/steps/step-target-weight.tsx
 *
 * Onboarding Step 11 — Meta de Peso
 * Input numérico + projeção % change + mensagem motivacional
 */

'use client'

import { useCallback, useMemo, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function StepTargetWeight() {
  const { data, updateData } = useOnboardingStore()
  const [input, setInput] = useState(data.target_weight_kg?.toString() ?? '')

  const handleChange = useCallback(
    (value: string) => {
      const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      setInput(cleaned)
      const num = parseFloat(cleaned)
      if (!isNaN(num) && num >= 30 && num <= 300) {
        updateData({ target_weight_kg: Math.round(num * 10) / 10 })
      } else {
        updateData({ target_weight_kg: null })
      }
    },
    [updateData]
  )

  const current = data.weight_kg
  const target = data.target_weight_kg

  const diff = useMemo(() => {
    if (!current || !target) return null
    const change = target - current
    const pct = ((change / current) * 100).toFixed(1)
    return {
      kg: change,
      pct,
      direction: change > 0 ? 'gain' : change < 0 ? 'loss' : 'maintain',
    }
  }, [current, target])

  // Estimated weeks based on healthy rate (0.5-1kg/week loss, 0.25-0.5kg/week gain)
  const estimatedWeeks = useMemo(() => {
    if (!diff) return null
    const absChange = Math.abs(diff.kg)
    if (absChange < 0.5) return 0
    const ratePerWeek = diff.direction === 'loss' ? 0.75 : 0.35
    return Math.ceil(absChange / ratePerWeek)
  }, [diff])

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Current weight reference */}
      {current && (
        <div className="rounded-xl bg-white/4 px-4 py-2 text-center">
          <span className="text-xs text-white/40">Peso atual: </span>
          <span className="text-sm font-semibold text-white/70">{current} kg</span>
        </div>
      )}

      {/* Big input */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          maxLength={5}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={current ? String(Math.round(current * 0.9)) : '65'}
          className="h-28 w-44 rounded-2xl border border-white/10 bg-white/4 text-center text-5xl font-bold text-white placeholder:text-white/15 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          autoFocus
        />
        <span className="absolute right-4 bottom-3 text-sm text-white/30">kg</span>
      </div>

      {input.length > 0 && !target && (
        <p className="text-xs text-red-400/80">Meta entre 30 e 300 kg</p>
      )}

      {/* Projection card */}
      {diff && estimatedWeeks !== null && (
        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-white/8 bg-white/4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Mudança</p>
              <p
                className={`text-xl font-bold ${
                  diff.direction === 'loss'
                    ? 'text-blue-400'
                    : diff.direction === 'gain'
                      ? 'text-brand-primary'
                      : 'text-white/60'
                }`}
              >
                {diff.kg > 0 ? '+' : ''}
                {diff.kg.toFixed(1)} kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Variação</p>
              <p className="text-lg font-semibold text-white/70">{diff.pct}%</p>
            </div>
          </div>

          {estimatedWeeks > 0 && (
            <div className="rounded-xl bg-white/4 px-4 py-3 text-center">
              <p className="text-xs text-white/50">
                Estimativa saudável:{' '}
                <span className="font-semibold text-brand-primary">
                  {estimatedWeeks} {estimatedWeeks === 1 ? 'semana' : 'semanas'}
                </span>
              </p>
            </div>
          )}

          {estimatedWeeks === 0 && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/50">
              <DSIcon name="checkCircle" className="h-4 w-4 text-brand-primary shrink-0" />
              Meta muito próxima do peso atual — foco em manutenção!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
