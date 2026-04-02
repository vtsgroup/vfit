// ============================================
// assessment-result.tsx — Preview e resultado calculado de avaliação física
// ============================================
//
// O que faz:
//   Calcula e exibe resultados de avaliação: IMC, classificação, % gordura, TMB.
//   buildAssessmentPreview() retorna objeto AssessmentResultPreview com cálculos.
//   AssessmentResult exibe o resultado em card com indicadores coloridos.
//
// Exports principais:
//   AssessmentResultPreview — interface com campos calculados
//   buildAssessmentPreview(data) → AssessmentResultPreview — cálculos IMC/gordura/TMB
//   AssessmentResult — card de exibição do resultado
'use client'

import type { ReactNode } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface AssessmentResultPreview {
  bmi: number | null
  bmiClassification: string
  bodyFatPercentage: number | null
  bmr: number | null
}

function bmiClassification(bmi: number | null): string {
  if (bmi == null) return '—'
  if (bmi < 18.5) return 'Abaixo do peso'
  if (bmi < 25) return 'Peso normal'
  if (bmi < 30) return 'Sobrepeso'
  if (bmi < 35) return 'Obesidade I'
  if (bmi < 40) return 'Obesidade II'
  return 'Obesidade III'
}

export function buildAssessmentPreview(input: {
  weightKg: number | null
  heightCm: number | null
  age: number | null
  gender: 'male' | 'female'
  skinfolds: number[]
}): AssessmentResultPreview {
  const { weightKg, heightCm, age, gender, skinfolds } = input
  const heightM = heightCm && heightCm > 0 ? heightCm / 100 : null
  const bmi = weightKg != null && heightM ? Number((weightKg / (heightM * heightM)).toFixed(2)) : null

  const bmr = weightKg != null && heightCm != null && age != null
    ? Number((
      gender === 'male'
        ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
        : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age)
    ).toFixed(0))
    : null

  let bodyFatPercentage: number | null = null
  if (age != null && skinfolds.length === 7 && skinfolds.every((v) => v > 0)) {
    const sum = skinfolds.reduce((acc, v) => acc + v, 0)
    const density = gender === 'male'
      ? 1.112 - (0.00043499 * sum) + (0.00000055 * sum * sum) - (0.00028826 * age)
      : 1.097 - (0.00046971 * sum) + (0.00000056 * sum * sum) - (0.00012828 * age)

    if (density > 0) {
      bodyFatPercentage = Number((((495 / density) - 450)).toFixed(2))
    }
  }

  return {
    bmi,
    bmiClassification: bmiClassification(bmi),
    bodyFatPercentage,
    bmr,
  }
}

export function AssessmentResult({ preview }: { preview: AssessmentResultPreview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DSIcon name="trendingUp" size={20} className="text-brand-primary" />
          Resultado prévio da avaliação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard icon={<DSIcon name="scale" size={16} />} label="IMC" value={preview.bmi} suffix="kg/m²" />
          <MetricCard icon={<DSIcon name="activity" size={16} />} label="% Gordura" value={preview.bodyFatPercentage} suffix="%" />
          <MetricCard icon={<DSIcon name="flame" size={16} />} label="TMB" value={preview.bmr} suffix="kcal/dia" digits={0} />
        </div>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Classificação IMC</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{preview.bmiClassification}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  digits = 2,
}: {
  icon: ReactNode
  label: string
  value: number | null
  suffix: string
  digits?: number
}) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
      <div className="flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-text-primary">
        {value == null ? '—' : value.toFixed(digits)}
        {value == null ? '' : <span className="ml-1 text-xs font-medium text-text-muted">{suffix}</span>}
      </p>
    </div>
  )
}
