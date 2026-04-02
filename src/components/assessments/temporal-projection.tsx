/**
 * src/components/assessments/temporal-projection.tsx
 *
 * Temporal Projection — S09-08
 *
 * Exports: TemporalProjection
 * Hooks: useMemo, useAssessmentHistory
 * Features: 'use client' · DSIcon
 */

// ============================================
// Temporal Projection — S09-08
// Visual timeline: current → 6m → 12m → 18m
// Based on assessment evolution trend
// ============================================

'use client'

import { useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { useAssessmentHistory, type AssessmentDetail } from '@/hooks/use-assessments'

// ============================================
// Types
// ============================================

interface ProjectionPoint {
  label: string
  months: number
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  isCurrent: boolean
}

// ============================================
// Helpers
// ============================================

function projectValue(
  current: number | null,
  monthlyRate: number,
  months: number
): number | null {
  if (current == null) return null
  return Math.round((current + monthlyRate * months) * 10) / 10
}

function calcMonthlyRate(
  evolution: Array<{ assessment_date: string; value: number | null }>,
  fallbackRate: number
): number {
  const valid = evolution.filter((e) => e.value != null) as Array<{ assessment_date: string; value: number }>
  if (valid.length < 2) return fallbackRate

  const first = valid[0]
  const last = valid[valid.length - 1]
  const daysDiff =
    (new Date(last.assessment_date).getTime() - new Date(first.assessment_date).getTime()) /
    (1000 * 60 * 60 * 24)
  if (daysDiff < 14) return fallbackRate // too short

  const monthsDiff = daysDiff / 30
  const totalChange = last.value - first.value
  return totalChange / monthsDiff
}

// ============================================
// Main Component
// ============================================

export function TemporalProjection({
  assessment,
  studentId,
}: {
  assessment: AssessmentDetail
  studentId: string
}) {
  const { data: history } = useAssessmentHistory(studentId)

  const projections = useMemo<ProjectionPoint[]>(() => {
    const assessments = history?.assessments ?? []

    // Calculate monthly rates from history data
    const weightRate = calcMonthlyRate(
      assessments.map((a) => ({
        assessment_date: a.assessment_date,
        value: a.weight_kg,
      })),
      0
    )

    const fatRate = calcMonthlyRate(
      assessments.map((a) => ({
        assessment_date: a.assessment_date,
        value: a.body_fat_percentage,
      })),
      0
    )

    const muscleRate = calcMonthlyRate(
      assessments.map((a) => ({
        assessment_date: a.assessment_date,
        value: a.muscle_mass_kg,
      })),
      0
    )

    // Clamp rates to realistic ranges
    const clampedWeightRate = Math.max(-2, Math.min(2, weightRate))
    const clampedFatRate = Math.max(-1.5, Math.min(1, fatRate))
    const clampedMuscleRate = Math.max(-0.5, Math.min(0.8, muscleRate))

    const MILESTONES = [
      { label: 'Atual', months: 0 },
      { label: '6 meses', months: 6 },
      { label: '12 meses', months: 12 },
      { label: '18 meses', months: 18 },
    ]

    return MILESTONES.map((m) => ({
      label: m.label,
      months: m.months,
      weight: projectValue(assessment.weight_kg, clampedWeightRate, m.months),
      bodyFat: projectValue(assessment.body_fat_percentage, clampedFatRate, m.months),
      muscleMass: projectValue(assessment.muscle_mass_kg, clampedMuscleRate, m.months),
      isCurrent: m.months === 0,
    }))
  }, [assessment, history])

  // Don't render if no data
  if (assessment.weight_kg == null && assessment.body_fat_percentage == null) return null

  const hasValidProjection = projections.some(
    (p) => !p.isCurrent && (p.weight != null || p.bodyFat != null || p.muscleMass != null)
  )
  if (!hasValidProjection) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DSIcon name="target" size={16} className="text-brand-primary" />
        <h3 className="text-base font-semibold text-text-primary">Projeção Realista</h3>
      </div>
      <p className="text-xs text-text-muted">
        Baseado na sua tendência de evolução das últimas avaliações
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-linear-to-r from-brand-primary/50 via-brand-primary/30 to-brand-primary/10" />

        <div className="grid grid-cols-4 gap-2">
          {projections.map((point, idx) => (
            <div key={point.label} className="relative">
              {/* Dot on timeline */}
              <div className="flex justify-center mb-3">
                <div
                  className={cn(
                    'relative z-10 flex h-3 w-3 items-center justify-center rounded-full ring-2',
                    point.isCurrent
                      ? 'bg-brand-primary ring-brand-primary/30'
                      : 'bg-bg-secondary ring-border-light'
                  )}
                >
                  {point.isCurrent && (
                    <div className="absolute h-5 w-5 animate-ping rounded-full bg-brand-primary/20" />
                  )}
                </div>
              </div>

              {/* Card */}
              <div
                className={cn(
                  'rounded-xl border p-2.5 text-center transition-all',
                  point.isCurrent
                    ? 'border-brand-primary/30 bg-brand-primary/5 ring-1 ring-brand-primary/10'
                    : 'border-border-light bg-bg-secondary hover:border-border-light/60'
                )}
              >
                {/* Label */}
                <p
                  className={cn(
                    'text-[10px] font-semibold',
                    point.isCurrent ? 'text-brand-primary' : 'text-text-muted'
                  )}
                >
                  {point.label}
                </p>

                {/* Values */}
                <div className="mt-2 space-y-1.5">
                  {point.weight != null && (
                    <MetricRow
                      label="Peso"
                      value={`${point.weight}kg`}
                      diff={idx > 0 ? (point.weight - (projections[0].weight ?? 0)) : null}
                      unit="kg"
                      isGood={point.weight <= (projections[0].weight ?? Infinity)}
                    />
                  )}
                  {point.bodyFat != null && (
                    <MetricRow
                      label="Gord."
                      value={`${point.bodyFat}%`}
                      diff={idx > 0 ? (point.bodyFat - (projections[0].bodyFat ?? 0)) : null}
                      unit="%"
                      isGood={point.bodyFat <= (projections[0].bodyFat ?? Infinity)}
                    />
                  )}
                  {point.muscleMass != null && (
                    <MetricRow
                      label="Musc."
                      value={`${point.muscleMass}kg`}
                      diff={idx > 0 ? (point.muscleMass - (projections[0].muscleMass ?? 0)) : null}
                      unit="kg"
                      isGood={point.muscleMass >= (projections[0].muscleMass ?? 0)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-text-muted/60 text-center">
        Projeções estimadas baseadas na tendência atual. Resultados reais podem variar conforme treino, dieta e genética.
      </p>
    </div>
  )
}

// ============================================
// Metric Row sub-component
// ============================================

function MetricRow({
  label,
  value,
  diff,
  unit,
  isGood,
}: {
  label: string
  value: string
  diff: number | null
  unit: string
  isGood: boolean
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="text-sm font-bold text-text-primary leading-none">{value}</p>
      {diff != null && diff !== 0 && (
        <div className="flex items-center justify-center gap-0.5">
          {isGood ? (
            <DSIcon name="arrowDown" size={10} className="text-emerald-400" />
          ) : (
            <DSIcon name="trendingUp" size={10} className="text-amber-400" />
          )}
          <span
            className={cn(
              'text-[10px] font-medium',
              isGood ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {diff > 0 ? '+' : ''}
            {diff.toFixed(1)}
            {unit}
          </span>
        </div>
      )}
    </div>
  )
}
