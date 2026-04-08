/**
 * src/components/assessments/health-indicators.tsx
 *
 * Health Indicators Section — S09-07
 *
 * Exports: HealthIndicatorsSection
 * Hooks: useMemo
 * Features: 'use client' · DSIcon
 */

// ============================================
// Health Indicators Section — S09-07
// Visual cards with icons and scores for assessment metrics
// ============================================

'use client'

import { useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import type { AssessmentDetail } from '@/hooks/use-assessments'

// ============================================
// Types
// ============================================

interface HealthIndicator {
  id: string
  icon: React.ReactNode
  label: string
  value: string | null
  unit: string
  score: 'good' | 'warning' | 'danger' | 'neutral'
  description: string
  color: string
}

// ============================================
// Score classification helpers
// ============================================

function classifyBMR(bmr: number | null): 'good' | 'warning' | 'danger' | 'neutral' {
  if (bmr == null) return 'neutral'
  if (bmr >= 1400) return 'good'
  if (bmr >= 1100) return 'warning'
  return 'danger'
}

function classifyWater(pct: number | null): 'good' | 'warning' | 'danger' | 'neutral' {
  if (pct == null) return 'neutral'
  if (pct >= 55) return 'good'
  if (pct >= 45) return 'warning'
  return 'danger'
}

function classifyVisceral(level: number | null): 'good' | 'warning' | 'danger' | 'neutral' {
  if (level == null) return 'neutral'
  if (level <= 9) return 'good'
  if (level <= 14) return 'warning'
  return 'danger'
}

function classifyMetabolicAge(
  metabolicAge: number | null,
): 'good' | 'warning' | 'danger' | 'neutral' {
  if (metabolicAge == null) return 'neutral'
  // Rough estimate — if metabolic age is less than calendar-based ~30 mark
  return metabolicAge <= 35 ? 'good' : metabolicAge <= 50 ? 'warning' : 'danger'
}

function classifyWHR(whr: number | null, classification: string | null): 'good' | 'warning' | 'danger' | 'neutral' {
  if (whr == null) return 'neutral'
  if (classification?.includes('Baixo') || classification?.includes('Normal')) return 'good'
  if (classification?.includes('Moderado') || classification?.includes('Alto')) return 'warning'
  if (classification?.includes('Muito Alto')) return 'danger'
  return whr <= 0.85 ? 'good' : whr <= 0.95 ? 'warning' : 'danger'
}

function classifyFat(pct: number | null): 'good' | 'warning' | 'danger' | 'neutral' {
  if (pct == null) return 'neutral'
  if (pct <= 20) return 'good'
  if (pct <= 30) return 'warning'
  return 'danger'
}

// ============================================
// Score colors & styles
// ============================================

const SCORE_STYLES = {
  good: {
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Bom',
  },
  warning: {
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'Atenção',
  },
  danger: {
    ring: 'ring-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Risco',
  },
  neutral: {
    ring: 'ring-white/10',
    bg: 'bg-white/5',
    text: 'text-text-muted',
    dot: 'bg-text-muted',
    label: '—',
  },
}

// ============================================
// Main Component
// ============================================

export function HealthIndicatorsSection({ assessment }: { assessment: AssessmentDetail }) {
  const indicators = useMemo<HealthIndicator[]>(() => {
    const items: HealthIndicator[] = []

    // BMR
    if (assessment.basal_metabolic_rate != null) {
      const score = classifyBMR(assessment.basal_metabolic_rate)
      items.push({
        id: 'bmr',
        icon: <DSIcon name="flame" size={20} />,
        label: 'Taxa Metabólica Basal',
        value: Math.round(assessment.basal_metabolic_rate).toString(),
        unit: 'kcal/dia',
        score,
        description: 'Energia gasta em repouso completo',
        color: 'orange',
      })
    }

    // TDE
    if (assessment.total_daily_expenditure != null) {
      items.push({
        id: 'tde',
        icon: <DSIcon name="zap" size={20} />,
        label: 'Gasto Energético Total',
        value: Math.round(assessment.total_daily_expenditure).toString(),
        unit: 'kcal/dia',
        score: 'neutral',
        description: 'Energia total diária estimada',
        color: 'yellow',
      })
    }

    // Body Fat %
    if (assessment.body_fat_percentage != null) {
      const score = classifyFat(assessment.body_fat_percentage)
      items.push({
        id: 'fat',
        icon: <DSIcon name="scale" size={20} />,
        label: 'Gordura Corporal',
        value: assessment.body_fat_percentage.toFixed(1),
        unit: '%',
        score,
        description: assessment.fat_classification || 'Percentual de gordura',
        color: 'red',
      })
    }

    // WHR
    if (assessment.waist_hip_ratio != null) {
      const score = classifyWHR(assessment.waist_hip_ratio, assessment.waist_hip_classification)
      items.push({
        id: 'whr',
        icon: <DSIcon name="activity" size={20} />,
        label: 'Relação Cintura/Quadril',
        value: assessment.waist_hip_ratio.toFixed(2),
        unit: '',
        score,
        description: assessment.waist_hip_classification || 'Risco cardiovascular',
        color: 'rose',
      })
    }

    // Water %
    if (assessment.water_percentage != null) {
      const score = classifyWater(assessment.water_percentage)
      items.push({
        id: 'water',
        icon: <DSIcon name="droplets" size={20} />,
        label: 'Hidratação Corporal',
        value: assessment.water_percentage.toFixed(1),
        unit: '%',
        score,
        description: score === 'good' ? 'Hidratação adequada' : 'Considerar aumentar ingestão hídrica',
        color: 'green',
      })
    }

    // Visceral fat
    if (assessment.visceral_fat_level != null) {
      const score = classifyVisceral(assessment.visceral_fat_level)
      items.push({
        id: 'visceral',
        icon: <DSIcon name="heart" size={20} />,
        label: 'Gordura Visceral',
        value: assessment.visceral_fat_level.toString(),
        unit: 'nível',
        score,
        description: score === 'good' ? 'Nível saudável' : score === 'warning' ? 'Nível elevado' : 'Nível de risco',
        color: 'pink',
      })
    }

    // Metabolic age
    if (assessment.metabolic_age != null) {
      const score = classifyMetabolicAge(assessment.metabolic_age)
      items.push({
        id: 'metaAge',
        icon: <DSIcon name="brain" size={20} />,
        label: 'Idade Metabólica',
        value: assessment.metabolic_age.toString(),
        unit: 'anos',
        score,
        description: 'Idade estimada pelo metabolismo',
        color: 'violet',
      })
    }

    // Ideal weight diff
    if (assessment.ideal_weight_kg != null && assessment.weight_kg != null) {
      const diff = assessment.weight_kg - assessment.ideal_weight_kg
      items.push({
        id: 'idealWeight',
        icon: <DSIcon name="trendingUp" size={20} />,
        label: 'Distância do Peso Ideal',
        value: diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1),
        unit: 'kg',
        score: Math.abs(diff) <= 3 ? 'good' : Math.abs(diff) <= 8 ? 'warning' : 'danger',
        description: `Peso ideal estimado: ${assessment.ideal_weight_kg.toFixed(1)}kg`,
        color: 'emerald',
      })
    }

    return items
  }, [assessment])

  // Don't render if no data
  if (indicators.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-text-primary">
        Indicadores de Saúde
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {indicators.map((ind) => {
          const style = SCORE_STYLES[ind.score]
          return (
            <div
              key={ind.id}
              className={cn(
                'relative rounded-xl border border-border-light p-3 ring-1 transition-all hover:ring-2',
                style.ring,
                'bg-bg-secondary'
              )}
            >
              {/* Score dot */}
              <div className="absolute right-2.5 top-2.5">
                <div className={cn('h-2 w-2 rounded-full', style.dot)} />
              </div>

              {/* Icon */}
              <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', style.bg, style.text)}>
                {ind.icon}
              </div>

              {/* Value */}
              <p className="text-lg font-bold text-text-primary leading-tight">
                {ind.value ?? '—'}
                <span className="ml-0.5 text-xs font-normal text-text-muted">{ind.unit}</span>
              </p>

              {/* Label */}
              <p className="mt-0.5 text-[11px] font-medium text-text-secondary">
                {ind.label}
              </p>

              {/* Description */}
              <p className="mt-1 text-[10px] text-text-muted leading-tight">
                {ind.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Somatotype badge */}
      {assessment.somatotype && (
        <div className="flex items-center gap-2 rounded-xl border border-border-light bg-bg-secondary px-4 py-3">
          <DSIcon name="dumbbell" size={20} className="text-brand-primary" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Somatotipo</p>
            <p className="text-xs text-text-muted capitalize">{assessment.somatotype}</p>
          </div>
        </div>
      )}
    </div>
  )
}
