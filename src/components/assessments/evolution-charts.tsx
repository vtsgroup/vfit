/**
 * src/components/assessments/evolution-charts.tsx
 *
 * Evolution Charts — Gráficos de Evolução
 *
 * Exports: EvolutionCharts
 * Hooks: useEffect, useMemo, useRef, useState, useAssessmentHistory
 * Features: 'use client' · DSIcon
 */

// ============================================
// Evolution Charts — Gráficos de Evolução
// VFIT — v2.0
// ============================================

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import { DSIcon } from '@/components/ui/ds-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonChart } from '@/components/ui/skeleton'
import { useAssessmentHistory } from '@/hooks/use-assessments'

interface EvolutionChartsProps {
  studentId: string
}

type MetricKey = 'weight' | 'fatPercentage' | 'fatMass' | 'leanMass' | 'muscleMass' | 'bmi' | 'waistHipRatio' | 'bmr'

interface MetricConfig {
  key: MetricKey
  label: string
  color: string
  unit: string
}

const METRICS: MetricConfig[] = [
  { key: 'weight', label: 'Peso', color: '#6366f1', unit: 'kg' },
  { key: 'fatPercentage', label: '% Gordura', color: '#f97316', unit: '%' },
  { key: 'leanMass', label: 'Massa Magra', color: '#3b82f6', unit: 'kg' },
  { key: 'muscleMass', label: 'Massa Muscular', color: '#10b981', unit: 'kg' },
  { key: 'fatMass', label: 'Massa Gorda', color: '#ef4444', unit: 'kg' },
  { key: 'bmi', label: 'IMC', color: '#8b5cf6', unit: 'kg/m²' },
  { key: 'bmr', label: 'TMB', color: '#f59e0b', unit: 'kcal' },
]

export default function EvolutionCharts({ studentId }: EvolutionChartsProps) {
  const { data: history, isLoading } = useAssessmentHistory(studentId)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['weight', 'fatPercentage'])
  const evolutionChartRef = useRef<HTMLDivElement | null>(null)
  const [isEvolutionChartReady, setIsEvolutionChartReady] = useState(false)

  // Build chart data from series
  const chartData = useMemo(() => {
    if (!history?.series?.dates) return []
    return history.series.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      fullDate: date,
      weight: history.series.weight[i],
      fatPercentage: history.series.fatPercentage[i],
      fatMass: history.series.fatMass[i],
      leanMass: history.series.leanMass[i],
      muscleMass: history.series.muscleMass[i],
      bmi: history.series.bmi[i],
      waistHipRatio: history.series.waistHipRatio?.[i] ?? null,
      bmr: history.series.bmr?.[i] ?? null,
    }))
  }, [history])

  // Available metrics (have at least 1 non-null value)
  const availableMetrics = useMemo(() => {
    if (!history?.series) return []
    return METRICS.filter((m) => {
      const values = history.series[m.key]
      return values && values.some((v: number | null) => v != null)
    })
  }, [history])

  useEffect(() => {
    const element = evolutionChartRef.current
    if (!element) return

    const updateReady = () => {
      const { width, height } = element.getBoundingClientRect()
      setIsEvolutionChartReady(width > 40 && height > 40)
    }

    updateReady()

    const observer = new ResizeObserver(updateReady)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  if (isLoading) {
    return <SkeletonChart />
  }

  if (!history || history.total_assessments < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <DSIcon name="barChart" size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-muted">
            São necessárias pelo menos 2 avaliações para exibir gráficos de evolução.
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DSIcon name="trendingUp" size={20} className="text-brand-primary" />
            Evolução Corporal
            <span className="text-sm font-normal text-text-muted">
              ({history.total_assessments} avaliações)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Metric selector chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {availableMetrics.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeMetrics.includes(m.key)
                    ? 'text-white shadow-sm'
                    : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
                }`}
                style={
                  activeMetrics.includes(m.key)
                    ? { backgroundColor: m.color }
                    : undefined
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div ref={evolutionChartRef} className="h-72 w-full">
            {isEvolutionChartReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  {availableMetrics.map((m) => (
                    <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, #333)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-secondary, #1a1a2e)',
                    border: '1px solid var(--color-border-light, #333)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'var(--color-text-primary, #fff)' }}
                />
                {activeMetrics.map((key) => {
                  const m = METRICS.find((x) => x.key === key)
                  if (!m) return null
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={m.color}
                      fill={`url(#grad-${key})`}
                      strokeWidth={2}
                      dot={{ r: 4, fill: m.color }}
                      activeDot={{ r: 6 }}
                      connectNulls
                      name={`${m.label} (${m.unit})`}
                    />
                  )
                })}
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse rounded-xl bg-bg-tertiary/40" />
              )}
          </div>
        </CardContent>
      </Card>

      {/* Perimeter Evolution Chart */}
      {history.perimeterSeries && Object.keys(history.perimeterSeries).length > 0 && (
        <PerimeterChart
          dates={history.series.dates}
          perimeterSeries={history.perimeterSeries}
        />
      )}
    </div>
  )
}

// ============================================
// Perimeter Evolution Chart
// ============================================

const PERIMETER_LABELS: Record<string, string> = {
  chest: 'Peitoral',
  waist: 'Cintura',
  hips: 'Quadril',
  right_arm: 'Braço D',
  left_arm: 'Braço E',
  right_thigh: 'Coxa D',
  left_thigh: 'Coxa E',
  right_calf: 'Panturrilha D',
  left_calf: 'Panturrilha E',
  shoulders: 'Ombros',
  neck: 'Pescoço',
}

const PERIMETER_COLORS = [
  '#6366f1', '#10b981', '#f97316', '#ef4444', '#3b82f6',
  '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#64748b',
]

function PerimeterChart({
  dates,
  perimeterSeries,
}: {
  dates: string[]
  perimeterSeries: Record<string, (number | null)[]>
}) {
  const perimeterChartRef = useRef<HTMLDivElement | null>(null)
  const [isPerimeterChartReady, setIsPerimeterChartReady] = useState(false)

  const perimeterKeys = Object.keys(perimeterSeries).filter(
    (k) => perimeterSeries[k].some((v) => v != null)
  )
  const [activePerimeters, setActivePerimeters] = useState<string[]>(
    perimeterKeys.slice(0, 4) // show first 4 by default
  )

  const chartData = dates.map((date, i) => {
    const entry: Record<string, unknown> = {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }
    for (const key of perimeterKeys) {
      entry[key] = perimeterSeries[key][i]
    }
    return entry
  })

  const togglePerimeter = (key: string) => {
    setActivePerimeters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  useEffect(() => {
    const element = perimeterChartRef.current
    if (!element) return

    const updateReady = () => {
      const { width, height } = element.getBoundingClientRect()
      setIsPerimeterChartReady(width > 40 && height > 40)
    }

    updateReady()

    const observer = new ResizeObserver(updateReady)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DSIcon name="barChart" size={20} className="text-brand-primary" />
          Evolução de Perímetros
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Perimeter selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {perimeterKeys.map((key, idx) => (
            <button
              key={key}
              onClick={() => togglePerimeter(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activePerimeters.includes(key)
                  ? 'text-white shadow-sm'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
              }`}
              style={
                activePerimeters.includes(key)
                  ? { backgroundColor: PERIMETER_COLORS[idx % PERIMETER_COLORS.length] }
                  : undefined
              }
            >
              {PERIMETER_LABELS[key] || key}
            </button>
          ))}
        </div>

        <div ref={perimeterChartRef} className="h-60 w-full">
          {isPerimeterChartReady ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, #333)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                tickLine={false}
                axisLine={false}
                width={40}
                unit=" cm"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-secondary, #1a1a2e)',
                  border: '1px solid var(--color-border-light, #333)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              {activePerimeters.map((key) => {
                const idx = perimeterKeys.indexOf(key)
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={PERIMETER_COLORS[idx % PERIMETER_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                    name={PERIMETER_LABELS[key] || key}
                  />
                )
              })}
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse rounded-xl bg-bg-tertiary/40" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
