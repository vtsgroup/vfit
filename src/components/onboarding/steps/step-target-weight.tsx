/**
 * src/components/onboarding/steps/step-target-weight.tsx
 *
 * Onboarding Step 11 — Meta de Peso
 * Picker nativo mobile: slider (coarse) + steppers ±0.5kg (fino) com haptic — sem teclado.
 * Projeção de mudança % + estimativa de semanas.
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { hapticLight } from '@/lib/haptics'

const MIN_KG = 30
const MAX_KG = 300
const SLIDER_MIN = 40
const SLIDER_MAX = 160

export function StepTargetWeight() {
  const { data, updateData } = useOnboardingStore()
  const current = data.weight_kg
  const target = data.target_weight_kg ?? (current ? Math.round(current * 0.9 * 2) / 2 : 65)

  // Picker nativo: começa em uma meta sugerida (-10% do peso atual) — sem teclado
  useEffect(() => {
    if (data.target_weight_kg == null) {
      updateData({ target_weight_kg: current ? Math.round(current * 0.9 * 2) / 2 : 65 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTarget = useCallback(
    (v: number) => {
      const clamped = Math.min(MAX_KG, Math.max(MIN_KG, Math.round(v * 2) / 2))
      updateData({ target_weight_kg: clamped })
    },
    [updateData]
  )

  const step = useCallback(
    (delta: number) => {
      hapticLight()
      setTarget(target + delta)
    },
    [target, setTarget]
  )

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

  const display = target % 1 === 0 ? String(target) : target.toFixed(1)

  return (
    <div className="flex flex-col items-center space-y-7">
      {/* Current weight reference */}
      {current && (
        <div className="rounded-full bg-white/4 px-4 py-2 text-center">
          <span className="bc-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Peso atual </span>
          <span className="font-syne text-sm font-black text-white/80">{current} kg</span>
        </div>
      )}

      {/* Placar: steppers ±0.5 + número Syne */}
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-glass-inset-sm">
        <button
          type="button"
          onClick={() => step(-0.5)}
          disabled={target <= MIN_KG}
          aria-label="Diminuir 0,5 kg"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            target <= MIN_KG
              ? 'cursor-not-allowed border-white/5 text-white/15'
              : 'border-green-400/25 bg-green-400/6 text-green-300 hover:border-green-400/50 hover:bg-green-400/10 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex min-w-36 flex-col items-center">
          <span className="font-syne text-6xl font-black leading-none text-white tabular-nums">{display}</span>
          <span className="bc-mono mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">meta em quilos</span>
        </div>

        <button
          type="button"
          onClick={() => step(0.5)}
          disabled={target >= MAX_KG}
          aria-label="Aumentar 0,5 kg"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            target >= MAX_KG
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
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={0.5}
          value={Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, target))}
          onChange={(e) => setTarget(Number(e.target.value))}
          aria-label="Meta de peso em quilos"
          className="w-full accent-brand-primary"
        />
        <div className="bc-mono flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          <span>{SLIDER_MIN} kg</span>
          <span>{SLIDER_MAX} kg</span>
        </div>
      </div>

      {/* Projection card */}
      {diff && estimatedWeeks !== null && (
        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-white/10 bg-white/6 p-5 shadow-glass-inset-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">Mudança</p>
              <p
                className={`font-syne text-xl font-black tabular-nums ${
                  diff.direction === 'loss'
                    ? 'text-brand-primary'
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
              <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">Variação</p>
              <p className="font-syne text-lg font-black tabular-nums text-white/70">{diff.pct}%</p>
            </div>
          </div>

          {estimatedWeeks > 0 && (
            <div className="rounded-xl bg-white/4 px-4 py-3 text-center">
              <p className="text-xs text-white/50">
                Estimativa saudável:{' '}
                <span className="font-syne font-black text-brand-primary">
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
