/**
 * src/components/onboarding/steps/step-height.tsx
 *
 * Onboarding Step 9 — Altura (cm)
 * Numeric input with slider visual, range 120-220 cm
 */

'use client'

import { useCallback, useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function StepHeight() {
  const { data, updateData } = useOnboardingStore()
  const [input, setInput] = useState(data.height_cm?.toString() ?? '')

  const handleChange = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 3)
      setInput(digits)
      const num = Number(digits)
      if (num >= 120 && num <= 220) {
        updateData({ height_cm: num })
      } else {
        updateData({ height_cm: null })
      }
    },
    [updateData]
  )

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInput(val)
      updateData({ height_cm: Number(val) })
    },
    [updateData]
  )

  const height = data.height_cm

  // Convert to ft for display
  const ftIn = height
    ? {
        ft: Math.floor(height / 30.48),
        inches: Math.round((height % 30.48) / 2.54),
      }
    : null

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Big input */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={3}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="170"
          className="vfit-flow-field font-syne h-30 w-46 rounded-[28px] text-center text-5xl font-black text-white outline-none transition-all placeholder:text-white/15"
          autoFocus
        />
        <span className="bc-mono absolute right-4 bottom-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-green-300/50">cm</span>
      </div>

      {/* Slider */}
      <div className="w-full max-w-xs space-y-2">
        <input
          type="range"
          min={120}
          max={220}
          step={1}
          value={height ?? 170}
          onChange={handleSlider}
          className="w-full accent-brand-primary"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>120 cm</span>
          <span>220 cm</span>
        </div>
      </div>

      {/* Conversion + feedback */}
      {height && (
        <div className="flex gap-3">
          <div className="rounded-2xl border border-green-400/15 bg-white/[0.03] px-4 py-2.5 text-center shadow-glass-inset-sm">
            <p className="font-syne text-lg font-black text-white">{height} cm</p>
            <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Centímetros</p>
          </div>
          {ftIn && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center shadow-glass-inset-sm">
              <p className="font-syne text-lg font-black text-white/70">
                {ftIn.ft}&apos;{ftIn.inches}&quot;
              </p>
              <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Pés / pol</p>
            </div>
          )}
        </div>
      )}

      {/* Validation */}
      {input.length > 0 && !height && (
        <p className="text-xs text-red-400/80">
          Altura deve ser entre 120 e 220 cm
        </p>
      )}
    </div>
  )
}
