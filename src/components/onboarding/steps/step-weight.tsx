/**
 * src/components/onboarding/steps/step-weight.tsx
 *
 * Onboarding Step 10 — Peso (kg) + cálculo IMC inline
 * Picker nativo mobile: slider de arrasto (coarse) + steppers ±0.5kg (fino) com haptic.
 * Sem teclado — placar Syne no centro, IMC em card com faixa por categoria.
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { hapticLight } from '@/lib/haptics'

// ============================================
// BMI helpers
// ============================================

type BMICategory = {
  label: string
  icon: DSIconName
  message: string
  color: string
}

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) {
    return {
      label: 'Abaixo do peso',
      icon: 'wind',
      message: 'Vamos montar um plano focado em ganho saudável',
      color: 'text-brand-primary',
    }
  }
  if (bmi < 25) {
    return {
      label: 'Peso normal',
      icon: 'checkCircle',
      message: 'Ótimo ponto de partida para qualquer objetivo',
      color: 'text-brand-primary',
    }
  }
  if (bmi < 30) {
    return {
      label: 'Sobrepeso',
      icon: 'activity',
      message: 'Com consistência, resultados vêm rápido',
      color: 'text-amber-300',
    }
  }
  return {
    label: 'Obesidade',
    icon: 'target',
    message: 'Cada treino é uma vitória — vamos juntos',
    color: 'text-orange-400',
  }
}

const MIN_KG = 30
const MAX_KG = 300
const SLIDER_MIN = 40
const SLIDER_MAX = 160

// ============================================
// Component
// ============================================

export function StepWeight() {
  const { data, updateData } = useOnboardingStore()
  const weight = data.weight_kg ?? 70
  const height = data.height_cm

  // Picker nativo: começa em um default válido (70kg) — sem teclado, sem estado inválido
  useEffect(() => {
    if (data.weight_kg == null) updateData({ weight_kg: 70 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setWeight = useCallback(
    (v: number) => {
      const clamped = Math.min(MAX_KG, Math.max(MIN_KG, Math.round(v * 2) / 2))
      updateData({ weight_kg: clamped })
    },
    [updateData]
  )

  const step = useCallback(
    (delta: number) => {
      hapticLight()
      setWeight(weight + delta)
    },
    [weight, setWeight]
  )

  const bmi = useMemo(() => {
    if (!weight || !height) return null
    return weight / ((height / 100) ** 2)
  }, [weight, height])

  const bmiInfo = bmi ? getBMICategory(bmi) : null
  const display = weight % 1 === 0 ? String(weight) : weight.toFixed(1)

  return (
    <div className="flex flex-col items-center space-y-7">
      {/* Placar: steppers ±0.5 + número Syne */}
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <button
          type="button"
          onClick={() => step(-0.5)}
          disabled={weight <= MIN_KG}
          aria-label="Diminuir 0,5 kg"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            weight <= MIN_KG
              ? 'cursor-not-allowed border-white/5 text-white/15'
              : 'border-green-400/25 bg-green-400/6 text-green-300 hover:border-green-400/50 hover:bg-green-400/10 active:scale-95'
          }`}
        >
          <DSIcon name="minus" className="h-6 w-6" />
        </button>

        <div className="flex min-w-36 flex-col items-center">
          <span className="font-syne text-6xl font-black leading-none text-white tabular-nums">{display}</span>
          <span className="bc-mono mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">quilos</span>
        </div>

        <button
          type="button"
          onClick={() => step(0.5)}
          disabled={weight >= MAX_KG}
          aria-label="Aumentar 0,5 kg"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all ${
            weight >= MAX_KG
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
          value={Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, weight))}
          onChange={(e) => setWeight(Number(e.target.value))}
          aria-label="Peso em quilos"
          className="w-full accent-brand-primary"
        />
        <div className="bc-mono flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          <span>{SLIDER_MIN} kg</span>
          <span>{SLIDER_MAX} kg</span>
        </div>
      </div>

      {/* BMI Card */}
      {bmi && bmiInfo && (
        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-white/10 bg-white/6 p-5 shadow-glass-inset-sm">
          {/* BMI value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DSIcon name={bmiInfo.icon} className={`h-6 w-6 ${bmiInfo.color}`} />
              <div>
                <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">Seu IMC</p>
                <p className={`font-syne text-xl font-black ${bmiInfo.color}`}>
                  {bmi.toFixed(1)}
                </p>
              </div>
            </div>
            <span className={`bc-mono rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${bmiInfo.color} bg-white/6`}>
              {bmiInfo.label}
            </span>
          </div>

          {/* BMI bar visual */}
          <div className="space-y-1">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-brand-primary via-green-400 to-orange-400"
                style={{ width: '100%' }}
              />
              {/* Indicator */}
              <div
                className="absolute top-0 h-2 w-1 rounded-full bg-white shadow-sm"
                style={{
                  left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 2), 98)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/25">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          {/* Motivation */}
          <p className="text-center text-xs text-white/50">
            {bmiInfo.message}
          </p>
        </div>
      )}

      {/* No height hint */}
      {weight && !height ? (
        <p className="text-xs text-white/30">
          Informe sua altura no passo anterior para calcular o IMC
        </p>
      ) : null}
    </div>
  )
}
