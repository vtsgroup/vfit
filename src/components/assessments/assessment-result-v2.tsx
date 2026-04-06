/**
 * src/components/assessments/assessment-result-v2.tsx
 *
 * Assessment Result v2 — Scorecard WOW
 *
 * Exports: AssessmentResultV2
 * Hooks: useMemo, useAssessmentEvolution, useAssessmentInterpretation, useNotifyAssessment, useSendAssessmentEmail
 * Features: 'use client' · DSIcon
 */

// ============================================
// Assessment Result v2 — Scorecard WOW
// VFIT — v2.0
// ============================================

'use client'

import { useMemo } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useAssessmentEvolution,
  useAssessmentInterpretation,
  useNotifyAssessment,
  useSendAssessmentEmail,
  type AssessmentDetail,
  type EvolutionDiff,
} from '@/hooks/use-assessments'

interface AssessmentResultV2Props {
  assessment: AssessmentDetail
}

function toSafeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeAssessment(assessment: AssessmentDetail): AssessmentDetail {
  return {
    ...assessment,
    weight_kg: toSafeNumber(assessment.weight_kg),
    height_cm: toSafeNumber(assessment.height_cm),
    bmi: toSafeNumber(assessment.bmi),
    body_fat_percentage: toSafeNumber(assessment.body_fat_percentage),
    muscle_mass_kg: toSafeNumber(assessment.muscle_mass_kg),
    body_density: toSafeNumber(assessment.body_density),
    fat_mass_kg: toSafeNumber(assessment.fat_mass_kg),
    lean_mass_kg: toSafeNumber(assessment.lean_mass_kg),
    lean_mass_percentage: toSafeNumber(assessment.lean_mass_percentage),
    muscle_mass_percentage: toSafeNumber(assessment.muscle_mass_percentage),
    bone_mass_kg: toSafeNumber(assessment.bone_mass_kg),
    residual_mass_kg: toSafeNumber(assessment.residual_mass_kg),
    sum_of_skinfolds: toSafeNumber(assessment.sum_of_skinfolds),
    waist_hip_ratio: toSafeNumber(assessment.waist_hip_ratio),
    ideal_weight_kg: toSafeNumber(assessment.ideal_weight_kg),
    weight_to_lose_kg: toSafeNumber(assessment.weight_to_lose_kg),
    basal_metabolic_rate: toSafeNumber(assessment.basal_metabolic_rate),
    total_daily_expenditure: toSafeNumber(assessment.total_daily_expenditure),
    water_percentage: toSafeNumber(assessment.water_percentage),
    visceral_fat_level: toSafeNumber(assessment.visceral_fat_level),
    metabolic_age: toSafeNumber(assessment.metabolic_age),
  }
}

// ============================================
// Classification color helpers
// ============================================

function bmiColor(classification: string | null): string {
  switch (classification) {
    case 'Peso normal': return 'text-success'
    case 'Sobrepeso': return 'text-warning'
    case 'Abaixo do peso': return 'text-info'
    default: return classification?.includes('Obesidade') ? 'text-error' : 'text-text-muted'
  }
}

function fatColor(classification: string | null): string {
  if (!classification) return 'text-text-muted'
  if (classification.includes('Atleta') || classification.includes('Essencial')) return 'text-info'
  if (classification.includes('Bom') || classification.includes('Fitness')) return 'text-success'
  if (classification.includes('Média') || classification.includes('Aceitável')) return 'text-warning'
  return 'text-error'
}

function waistColor(risk: string | null): string {
  if (!risk) return 'text-text-muted'
  if (risk === 'Normal') return 'text-success'
  if (risk.includes('Elevado')) return 'text-warning'
  return 'text-error'
}

function ffmiColor(label: string | null): string {
  if (!label) return 'text-text-muted'
  if (label.includes('Abaixo')) return 'text-warning'
  if (label.includes('Média') || label === 'Média') return 'text-info'
  if (label.includes('Acima') || label.includes('Excelente')) return 'text-success'
  if (label.includes('Superior')) return 'text-brand-primary'
  if (label.includes('limite')) return 'text-error'
  return 'text-text-muted'
}

// ============================================
// Main Component
// ============================================

export default function AssessmentResultV2({ assessment }: AssessmentResultV2Props) {
  const { data: evolution } = useAssessmentEvolution(assessment.id)
  const { data: interpretation } = useAssessmentInterpretation(assessment.id)
  const notifyMutation = useNotifyAssessment()
  const sendEmailMutation = useSendAssessmentEmail()

  const a = useMemo(() => normalizeAssessment(assessment), [assessment])

  // Extract FFMI from body_composition JSON
  const ffmi = useMemo(() => {
    if (!a.body_composition) return null
    const bc = a.body_composition as Record<string, unknown>
    const ffmiData = bc.ffmi as Record<string, unknown> | undefined
    if (!ffmiData) {
      // Fallback: calculate from lean_mass and height
      if (a.lean_mass_kg && a.height_cm) {
        const heightM = a.height_cm / 100
        const value = a.lean_mass_kg / (heightM * heightM)
        const normalized = value + 6.1 * (1.8 - heightM)
        return { value: Math.round(normalized * 10) / 10, label: null }
      }
      return null
    }
    return {
      value: (ffmiData.ffmiNormalized as number) ?? (ffmiData.ffmi as number) ?? null,
      label: (ffmiData.label as string) ?? null,
    }
  }, [a])

  // Composition breakdown for ring chart
  const composition = useMemo(() => {
    if (!a.body_fat_percentage) return null
    const fatPct = a.body_fat_percentage
    const leanPct = a.lean_mass_percentage ?? (100 - fatPct)
    const musclePct = a.muscle_mass_percentage ?? null
    return { fatPct, leanPct, musclePct }
  }, [a])

  return (
    <div className="space-y-5">
      {/* Hero Scorecard */}
      <HeroScorecard assessment={a} />

      {/* Body Composition Gauges */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {a.bmi != null && (
          <GaugeCard
            icon="scale"
            label="IMC"
            value={a.bmi}
            unit="kg/m²"
            classification={a.bmi_classification}
            colorClass={bmiColor(a.bmi_classification)}
            min={15}
            max={40}
          />
        )}
        {a.body_fat_percentage != null && (
          <GaugeCard
            icon="droplets"
            label="% Gordura"
            value={a.body_fat_percentage}
            unit="%"
            classification={a.fat_classification}
            colorClass={fatColor(a.fat_classification)}
            min={3}
            max={45}
          />
        )}
        {a.waist_hip_ratio != null && (
          <GaugeCard
            icon="heart"
            label="Relação C/Q"
            value={a.waist_hip_ratio}
            unit=""
            classification={a.waist_hip_classification}
            colorClass={waistColor(a.waist_risk)}
            min={0.6}
            max={1.2}
          />
        )}
        {ffmi?.value != null && (
          <GaugeCard
            icon="dumbbell"
            label="FFMI"
            value={ffmi.value}
            unit=""
            classification={ffmi.label}
            colorClass={ffmiColor(ffmi.label)}
            min={14}
            max={28}
          />
        )}
      </div>

      {/* Body Composition Breakdown */}
      {composition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="activity" size={20} className="text-brand-primary" />
              Composição Corporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CompositionStat
                label="Massa Gorda"
                value={a.fat_mass_kg}
                unit="kg"
                pct={composition.fatPct}
                color="bg-orange-500"
              />
              <CompositionStat
                label="Massa Magra"
                value={a.lean_mass_kg}
                unit="kg"
                pct={composition.leanPct}
                color="bg-blue-500"
              />
              <CompositionStat
                label="Massa Muscular"
                value={a.muscle_mass_kg}
                unit="kg"
                pct={composition.musclePct}
                color="bg-emerald-500"
              />
              <CompositionStat
                label="Massa Óssea"
                value={a.bone_mass_kg}
                unit="kg"
                pct={null}
                color="bg-slate-400"
              />
            </div>

            {/* Visual bar */}
            <div className="mt-4 flex h-5 w-full overflow-hidden rounded-full">
              <div
                className="bg-orange-500 transition-all duration-700"
                style={{ width: `${composition.fatPct}%` }}
                title={`Gordura: ${composition.fatPct.toFixed(1)}%`}
              />
              <div
                className="bg-blue-500 transition-all duration-700"
                style={{ width: `${composition.leanPct}%` }}
                title={`Magra: ${composition.leanPct.toFixed(1)}%`}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Gordura {composition.fatPct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Magra {composition.leanPct.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metabolic Data */}
      {(a.basal_metabolic_rate || a.total_daily_expenditure || a.ideal_weight_kg) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="flame" size={20} className="text-brand-primary" />
              Dados Metabólicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {a.basal_metabolic_rate != null && (
                <MetricBox
                  icon="flame"
                  label="TMB"
                  sublabel="Taxa Metabólica Basal"
                  value={`${Math.round(a.basal_metabolic_rate)}`}
                  unit="kcal/dia"
                />
              )}
              {a.total_daily_expenditure != null && (
                <MetricBox
                  icon="flame"
                  label="GET"
                  sublabel="Gasto Energético Total"
                  value={`${Math.round(a.total_daily_expenditure)}`}
                  unit="kcal/dia"
                />
              )}
              {a.ideal_weight_kg != null && (
                <MetricBox
                  icon="target"
                  label="Peso Ideal"
                  sublabel={
                    a.weight_to_lose_kg != null && a.weight_to_lose_kg > 0
                      ? `${a.weight_to_lose_kg.toFixed(1)} kg a perder`
                      : a.weight_to_lose_kg != null && a.weight_to_lose_kg < 0
                        ? `${Math.abs(a.weight_to_lose_kg).toFixed(1)} kg a ganhar`
                        : 'No peso ideal!'
                  }
                  value={`${a.ideal_weight_kg.toFixed(1)}`}
                  unit="kg"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Somatotype */}
      {a.somatotype && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <DSIcon name="dumbbell" size={20} className="text-brand-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Somatotipo</p>
                <p className="text-lg font-bold text-brand-primary">{a.somatotype}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution vs Previous */}
      {evolution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="trendingUp" size={20} className="text-brand-primary" />
              Evolução
              <Badge variant="info">{evolution.days_between} dias</Badge>
              {evolution.overall_score > 0 && (
                <Badge variant="success">Score: {evolution.overall_score}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {evolution.diffs.map((d: EvolutionDiff) => (
                <EvolutionRow key={d.field} diff={d} />
              ))}
            </div>

            {/* Perimeter diffs */}
            {evolution.perimeter_diffs && evolution.perimeter_diffs.length > 0 && (
              <div className="mt-4 border-t border-border-light pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Perímetros
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {evolution.perimeter_diffs
                    .filter((p) => p.diffCm !== null && p.diffCm !== 0)
                    .map((p) => (
                      <div key={p.name} className="flex items-center justify-between rounded-lg bg-bg-tertiary/50 px-3 py-1.5">
                        <span className="text-xs text-text-secondary">{p.label}</span>
                        <span className={`text-xs font-semibold ${p.diffCm! > 0 ? 'text-success' : 'text-error'}`}>
                          {p.diffCm! > 0 ? '+' : ''}{p.diffCm!.toFixed(1)} cm
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Interpretation */}
      {(interpretation || a.ai_interpretation) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="brain" size={20} className="text-brand-primary" />
              Interpretação IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-text-secondary leading-relaxed">
              {interpretation || a.ai_interpretation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notify Student Button */}
      {!a.notified_at && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => notifyMutation.mutate(a.id)}
            loading={notifyMutation.isPending}
            size="lg"
            className="gap-2"
          >
                        <DSIcon name="bell" size={16} />
            Notificar Aluno
          </Button>
          <Button
            variant="outline"
            onClick={() => sendEmailMutation.mutate(a.id)}
            loading={sendEmailMutation.isPending}
            size="lg"
            className="gap-2"
          >
                        <DSIcon name="mail" size={16} />
            Enviar por Email
          </Button>
        </div>
      )}
      {a.notified_at && (
        <div className="flex flex-col items-center gap-2">
          <Badge variant="success">✓ Aluno notificado em {new Date(a.notified_at).toLocaleDateString('pt-BR')}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendEmailMutation.mutate(a.id)}
            loading={sendEmailMutation.isPending}
            className="gap-1 text-xs"
          >
                        <DSIcon name="mail" size={14} />
            Reenviar por email
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Hero Scorecard
// ============================================

function HeroScorecard({ assessment: a }: { assessment: AssessmentDetail }) {
  return (
    <Card className="overflow-hidden border-brand-primary/20">
      <div className="bg-linear-to-br from-brand-primary/10 via-transparent to-transparent p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Resultado da Avaliação</h2>
            <p className="text-sm text-text-muted">
              {a.protocol ? `Protocolo: ${a.protocol}` : 'Avaliação Física'} •{' '}
              {new Date(a.assessment_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {a.protocol && (
            <Badge variant="info" className="text-xs">{a.protocol}</Badge>
          )}
        </div>

        {/* Key metrics row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat label="Peso" value={a.weight_kg != null ? Number(a.weight_kg).toFixed(1) : '—'} unit="kg" />
          <HeroStat label="IMC" value={a.bmi != null ? Number(a.bmi).toFixed(1) : '—'} unit="kg/m²" />
          <HeroStat label="% Gordura" value={a.body_fat_percentage != null ? Number(a.body_fat_percentage).toFixed(1) : '—'} unit="%" />
          <HeroStat
            label="Massa Magra"
            value={a.lean_mass_kg != null ? Number(a.lean_mass_kg).toFixed(1) : '—'}
            unit="kg"
          />
        </div>
      </div>
    </Card>
  )
}

function HeroStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-bg-secondary/80 p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted">{unit}</p>
    </div>
  )
}

// ============================================
// Gauge Card (semicircular visual)
// ============================================

function GaugeCard({
  icon,
  label,
  value,
  unit,
  classification,
  colorClass,
  min,
  max,
}: {
  icon: DSIconName
  label: string
  value: number
  unit: string
  classification: string | null
  colorClass: string
  min: number
  max: number
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  // SVG arc for semicircle gauge
  const radius = 45
  const circumference = Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-4">
        <div className="relative h-20 w-30">
          <svg viewBox="0 0 120 70" className="h-full w-full">
            {/* Background arc */}
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke="currentColor"
              className="text-border-light"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke="currentColor"
              className={colorClass}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${offset}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <span className="text-2xl font-bold text-text-primary">{typeof value === 'number' ? value.toFixed(1) : value}</span>
            <span className="ml-0.5 text-xs text-text-muted">{unit}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <DSIcon name={icon} size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-primary">{label}</span>
        </div>
        {classification && (
          <span className={`mt-0.5 text-xs font-medium ${colorClass}`}>{classification}</span>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Composition Stat
// ============================================

function CompositionStat({
  label, value, unit, pct, color,
}: {
  label: string; value: number | null; unit: string; pct: number | null; color: string
}) {
  if (value == null) return null
  return (
    <div className="rounded-xl bg-bg-tertiary/50 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-text-primary">
        {value.toFixed(1)} <span className="text-xs font-normal text-text-muted">{unit}</span>
      </p>
      {pct != null && (
        <p className="text-xs text-text-secondary">{pct.toFixed(1)}%</p>
      )}
    </div>
  )
}

// ============================================
// Metric Box
// ============================================

function MetricBox({
  icon, label, sublabel, value, unit,
}: {
  icon: DSIconName; label: string; sublabel: string; value: string; unit: string
}) {
  return (
    <div className="rounded-xl bg-bg-tertiary/50 p-4">
      <div className="flex items-center gap-2">
        <DSIcon name={icon} size={16} className="text-brand-primary" />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-text-primary">
        {value} <span className="text-sm font-normal text-text-muted">{unit}</span>
      </p>
      <p className="mt-0.5 text-xs text-text-muted">{sublabel}</p>
    </div>
  )
}

// ============================================
// Evolution Row
// ============================================

function EvolutionRow({ diff }: { diff: EvolutionDiff }) {
  const dirIcon: DSIconName = diff.direction === 'up' ? 'trendingUp' : diff.direction === 'down' ? 'arrowDown' : 'plus'

  return (
    <div className="flex items-center justify-between rounded-lg bg-bg-tertiary/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <DSIcon
          name={dirIcon}
          size={16}
          className={`${
            diff.isPositive ? 'text-success' : diff.direction === 'stable' ? 'text-text-muted' : 'text-error'
          }${diff.direction === 'stable' ? ' rotate-45' : ''}`}
        />
        <span className="text-sm text-text-secondary">{diff.label}</span>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${
            diff.isPositive ? 'text-success' : diff.direction === 'stable' ? 'text-text-muted' : 'text-error'
          }`}
        >
          {diff.diff > 0 ? '+' : ''}{diff.diff.toFixed(1)} {diff.unit}
        </span>
        <span className="ml-1 text-xs text-text-muted">
          ({diff.diffPercentage > 0 ? '+' : ''}{diff.diffPercentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  )
}
