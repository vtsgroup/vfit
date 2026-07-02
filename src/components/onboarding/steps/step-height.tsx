/**
 * src/components/onboarding/steps/step-height.tsx
 *
 * Onboarding Step 9 — Altura (cm)
 * Picker nativo mobile: slider (coarse) + steppers ±1cm (fino) com haptic — sem teclado.
 * Range 120-220 cm, conversão pés/pol inline.
 */

'use client'

import { useCallback, useEffect } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { hapticLight } from '@/lib/haptics'

const MIN_CM = 120
const MAX_CM = 220

export function StepHeight() {
  const { data, updateData } = useOnboardingStore()
  const height = data.height_cm ?? 170

  // Picker nativo: começa em um default válido — sem teclado, sem estado inválido
  useEffect(() => {
    if (data.height_cm == null) updateData({ height_cm: 170 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setHeight = useCallback(
    (v: number) => {
      updateData({ height_cm: Math.min(MAX_CM, Math.max(MIN_CM, Math.round(v))) })
    },
    [updateData]
  )

  const step = useCallback(
    (delta: number) => {
      hapticLight()
      setHeight(height + delta)
    },
    [height, setHeight]
  )

  // Convert to ft for display
  const ftIn = {
    ft: Math.floor(height / 30.48),
    inches: Math.round((height % 30.48) / 2.54),
  }

  return (
    <div className="flex flex-col items-center space-y-7">
      {/* Placar: steppers ±1 + número Syne */}
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-glass-inset-sm">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={height <= MIN_CM}
          aria-label="Diminuir 1 cm"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            height <= MIN_CM
              ? 'cursor-not-allowed border-white/5 text-white/15'
              : 'border-green-400/25 bg-green-400/6 text-green-300 hover:border-green-400/50 hover:bg-green-400/10 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex min-w-36 flex-col items-center">
          <span className="font-syne text-6xl font-black leading-none text-white tabular-nums">{height}</span>
          <span className="bc-mono mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">centímetros</span>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={height >= MAX_CM}
          aria-label="Aumentar 1 cm"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            height >= MAX_CM
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
          min={MIN_CM}
          max={MAX_CM}
          step={1}
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          aria-label="Altura em centímetros"
          className="w-full accent-brand-primary"
        />
        <div className="bc-mono flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          <span>{MIN_CM} cm</span>
          <span>{MAX_CM} cm</span>
        </div>
      </div>

      {/* Conversão */}
      <div className="flex gap-3">
        <div className="rounded-2xl border border-green-400/15 bg-white/3 px-4 py-2.5 text-center shadow-glass-inset-sm">
          <p className="font-syne text-lg font-black text-white">{height} cm</p>
          <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Centímetros</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/3 px-4 py-2.5 text-center shadow-glass-inset-sm">
          <p className="font-syne text-lg font-black text-white/70">
            {ftIn.ft}&apos;{ftIn.inches}&quot;
          </p>
          <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Pés / pol</p>
        </div>
      </div>
    </div>
  )
}
