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
          className="h-28 w-44 rounded-2xl border border-white/10 bg-white/4 text-center text-5xl font-bold text-white placeholder:text-white/15 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          autoFocus
        />
        <span className="absolute right-4 bottom-3 text-sm text-white/30">cm</span>
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
          <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-white">{height} cm</p>
            <p className="text-xs text-white/40">Centímetros</p>
          </div>
          {ftIn && (
            <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-center">
              <p className="text-lg font-bold text-white/70">
                {ftIn.ft}&apos;{ftIn.inches}&quot;
              </p>
              <p className="text-xs text-white/40">Pés / pol</p>
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
