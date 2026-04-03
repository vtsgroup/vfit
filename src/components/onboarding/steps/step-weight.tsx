/**
 * src/components/onboarding/steps/step-weight.tsx
 *
 * Onboarding Step 10 — Peso (kg) + cálculo IMC inline
 * Numeric input + IMC card com emoji + mensagem por faixa
 */

'use client'

import { useCallback, useMemo, useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

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
      color: 'text-blue-400',
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
      icon: 'dumbbell',
      message: 'Com consistência, resultados vêm rápido',
      color: 'text-yellow-400',
    }
  }
  return {
    label: 'Obesidade',
    icon: 'target',
    message: 'Cada treino é uma vitória — vamos juntos',
    color: 'text-orange-400',
  }
}

// ============================================
// Component
// ============================================

export function StepWeight() {
  const { data, updateData } = useOnboardingStore()
  const [input, setInput] = useState(data.weight_kg?.toString() ?? '')

  const handleChange = useCallback(
    (value: string) => {
      // Allow decimal (eg 72.5)
      const cleaned = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      setInput(cleaned)
      const num = parseFloat(cleaned)
      if (!isNaN(num) && num >= 30 && num <= 300) {
        updateData({ weight_kg: Math.round(num * 10) / 10 })
      } else {
        updateData({ weight_kg: null })
      }
    },
    [updateData]
  )

  const weight = data.weight_kg
  const height = data.height_cm

  const bmi = useMemo(() => {
    if (!weight || !height) return null
    return weight / ((height / 100) ** 2)
  }, [weight, height])

  const bmiInfo = bmi ? getBMICategory(bmi) : null

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Big input */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          maxLength={5}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="70"
          className="h-28 w-44 rounded-2xl border border-white/10 bg-white/4 text-center text-5xl font-bold text-white placeholder:text-white/15 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          autoFocus
        />
        <span className="absolute right-4 bottom-3 text-sm text-white/30">kg</span>
      </div>

      {/* Validation */}
      {input.length > 0 && !weight && (
        <p className="text-xs text-red-400/80">
          Peso deve ser entre 30 e 300 kg
        </p>
      )}

      {/* BMI Card */}
      {bmi && bmiInfo && (
        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-white/8 bg-white/4 p-5">
          {/* BMI value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DSIcon name={bmiInfo.icon} className={`h-6 w-6 ${bmiInfo.color}`} />
              <div>
                <p className="text-xs text-white/40">Seu IMC</p>
                <p className={`text-xl font-bold ${bmiInfo.color}`}>
                  {bmi.toFixed(1)}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bmiInfo.color} bg-white/6`}>
              {bmiInfo.label}
            </span>
          </div>

          {/* BMI bar visual */}
          <div className="space-y-1">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-blue-400 via-green-400 to-orange-400"
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
      {weight && !height && (
        <p className="text-xs text-white/30">
          Informe sua altura no passo anterior para calcular o IMC
        </p>
      )}
    </div>
  )
}
