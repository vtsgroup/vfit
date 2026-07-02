/**
 * src/components/onboarding/steps/step-weight.tsx
 *
 * Onboarding Step 10 — Peso (kg) + cálculo IMC inline
 * Picker nativo mobile: slider (coarse) + steppers ±0.5kg (fino) com haptic — sem teclado.
 * IMC em telemetria: zonas segmentadas, só a faixa ativa acende na cor da categoria.
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { hapticLight } from '@/lib/haptics'

// ============================================
// BMI helpers
// ============================================

type BMIZone = {
  label: string
  from: number
  to: number
  hex: string
  icon: DSIconName
  message: string
}

const BMI_ZONES: BMIZone[] = [
  { label: 'Abaixo', from: 15, to: 18.5, hex: '#38bdf8', icon: 'wind', message: 'Vamos montar um plano focado em ganho saudável' },
  { label: 'Normal', from: 18.5, to: 25, hex: '#22c55e', icon: 'checkCircle', message: 'Ótimo ponto de partida para qualquer objetivo' },
  { label: 'Sobrepeso', from: 25, to: 30, hex: '#fbbf24', icon: 'activity', message: 'Com consistência, resultados vêm rápido' },
  { label: 'Obesidade', from: 30, to: 40, hex: '#fb923c', icon: 'target', message: 'Cada treino é uma vitória — vamos juntos' },
]

function getZoneIndex(bmi: number): number {
  if (bmi < 18.5) return 0
  if (bmi < 25) return 1
  if (bmi < 30) return 2
  return 3
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

  // Picker nativo: começa em um default válido — sem teclado, sem estado inválido
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

  const zone = bmi ? BMI_ZONES[getZoneIndex(bmi)] : null
  const display = weight % 1 === 0 ? String(weight) : weight.toFixed(1)

  return (
    <div className="flex flex-col items-center space-y-7">
      {/* Placar: steppers ±0.5 + número Syne */}
      <div className="flex w-full items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-4 py-6 shadow-glass-inset-sm">
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

      {/* IMC — telemetria com zona ativa acesa */}
      {bmi && zone && (
        <div
          className="w-full max-w-xs space-y-4 rounded-2xl border bg-white/3 p-5"
          style={{ borderColor: `${zone.hex}40`, boxShadow: `0 0 34px -14px ${zone.hex}66, inset 0 1px 0 rgba(255,255,255,0.06)` }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                style={{ color: zone.hex, borderColor: `${zone.hex}40`, background: `${zone.hex}1a` }}
              >
                <DSIcon name={zone.icon} size={17} />
              </span>
              <div>
                <p className="bc-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">Seu IMC</p>
                <p className="font-syne text-2xl font-black leading-none tabular-nums" style={{ color: zone.hex }}>
                  {bmi.toFixed(1)}
                </p>
              </div>
            </div>
            <span
              className="bc-mono shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: zone.hex, borderColor: `${zone.hex}40`, background: `${zone.hex}14` }}
            >
              {zone.label}
            </span>
          </div>

          {/* Zonas segmentadas — só a ativa acende */}
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {BMI_ZONES.map((z, i) => {
                const active = z === zone
                const pct = active ? Math.min(Math.max(((bmi - z.from) / (z.to - z.from)) * 100, 6), 94) : 0
                return (
                  <div
                    key={z.label}
                    className="relative h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((z.to - z.from) / 25) * 100}%`,
                      background: active ? z.hex : 'rgba(255,255,255,0.08)',
                      boxShadow: active ? `0 0 12px ${z.hex}80` : 'none',
                    }}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                        style={{ left: `${pct}%` }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="bc-mono flex justify-between text-[9px] font-bold text-white/25 tabular-nums">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          <p className="text-center text-xs leading-5 text-slate-400">{zone.message}</p>
        </div>
      )}

      {/* No height hint */}
      {weight && !height ? <p className="text-xs text-white/30">Informe sua altura no passo anterior para calcular o IMC</p> : null}
    </div>
  )
}
