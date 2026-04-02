/**
 * src/components/dashboard/charts/student-progress-charts.tsx
 *
 * Student Progress Charts — Recharts (Dashboard Pro)
 *
 * Exports: WeeklyFrequencyData, WorkoutFrequencyChart, EvolutionDataPoint, BodyEvolutionChart
 * Features: 'use client'
 */

// ============================================
// Student Progress Charts — Recharts (Dashboard Pro)
// Gráficos para o dashboard do aluno
// ============================================

'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ============================================
// Workout Frequency Chart (últimas 4 semanas)
// ============================================

export interface WeeklyFrequencyData {
  week: string
  workouts: number
}

interface WorkoutFrequencyChartProps {
  data: WeeklyFrequencyData[]
  loading?: boolean
}

function FrequencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-border-light bg-kpi-dark px-3.5 py-2.5 shadow-glass backdrop-blur-xl">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className="text-base font-bold text-emerald-400">{payload[0].value} treino{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export function WorkoutFrequencyChart({ data, loading = false }: WorkoutFrequencyChartProps) {
  if (loading) return <MiniChartSkeleton title="Frequência Semanal" />

  const total = data.reduce((sum, w) => sum + w.workouts, 0)

  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Frequência Semanal</h3>
          <p className="mt-0.5 text-xs text-text-muted">Treinos por semana</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-400">{total}</p>
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">total no mês</p>
        </div>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<FrequencyTooltip />} />
            <Bar dataKey="workouts" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================
// Body Evolution Chart (peso / gordura ao longo do tempo)
// ============================================

export interface EvolutionDataPoint {
  date: string
  weight_kg: number | null
  body_fat_percentage: number | null
}

interface BodyEvolutionChartProps {
  data: EvolutionDataPoint[]
  loading?: boolean
}

function EvolutionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-border-light bg-kpi-dark px-3.5 py-2.5 shadow-glass backdrop-blur-xl">
      <p className="text-xs font-semibold text-text-secondary mb-1.5">{label}</p>
      {payload.map((entry) => (
        entry.value != null && (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-text-secondary">{entry.name}:</span>
            <span className="text-sm font-bold text-text-primary">
              {entry.name === 'Peso' ? `${entry.value} kg` : `${entry.value}%`}
            </span>
          </div>
        )
      ))}
    </div>
  )
}

function formatShortDate(date: string): string {
  const d = new Date(date)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export function BodyEvolutionChart({ data, loading = false }: BodyEvolutionChartProps) {
  if (loading) return <MiniChartSkeleton title="Evolução Corporal" />

  if (data.length < 2) {
    return (
      <div className="rounded-2xl border border-border-light bg-kpi-dark p-5">
        <h3 className="text-sm font-bold text-text-primary">Evolução Corporal</h3>
        <p className="mt-4 text-center text-sm text-text-muted py-8">
          Necessário pelo menos 2 avaliações para ver a evolução.
        </p>
      </div>
    )
  }

  const hasWeight = data.some((d) => d.weight_kg != null)
  const hasBodyFat = data.some((d) => d.body_fat_percentage != null)
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatShortDate(d.date),
  }))

  // Calcula variação
  const first = data[0]
  const last = data[data.length - 1]
  const weightDelta = first.weight_kg && last.weight_kg ? last.weight_kg - first.weight_kg : null
  const fatDelta = first.body_fat_percentage && last.body_fat_percentage ? last.body_fat_percentage - first.body_fat_percentage : null

  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Evolução Corporal</h3>
          <p className="mt-0.5 text-xs text-text-muted">{data.length} avaliações</p>
        </div>
        <div className="flex gap-4 text-right">
          {weightDelta !== null && (
            <div className="rounded-lg bg-black/4 dark:bg-white/4 px-2.5 py-1.5">
              <p className={`text-sm font-bold ${weightDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
              </p>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">peso</p>
            </div>
          )}
          {fatDelta !== null && (
            <div className="rounded-lg bg-black/4 dark:bg-white/4 px-2.5 py-1.5">
              <p className={`text-sm font-bold ${fatDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {fatDelta > 0 ? '+' : ''}{fatDelta.toFixed(1)}%
              </p>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">gordura</p>
            </div>
          )}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<EvolutionTooltip />} />
            {hasWeight && (
              <Line
                type="monotone"
                dataKey="weight_kg"
                name="Peso"
                stroke="var(--color-info)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-info)', strokeWidth: 2, stroke: 'var(--chart-dot-stroke)' }}
                connectNulls
              />
            )}
            {hasBodyFat && (
              <Line
                type="monotone"
                dataKey="body_fat_percentage"
                name="Gordura"
                stroke="var(--color-warning)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-warning)', strokeWidth: 2, stroke: 'var(--chart-dot-stroke)' }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-5">
        {hasWeight && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-info" />
            <span className="text-xs font-medium text-text-secondary">Peso (kg)</span>
          </div>
        )}
        {hasBodyFat && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-warning" />
            <span className="text-xs font-medium text-text-secondary">Gordura (%)</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Mini Chart Skeleton
// ============================================

function MiniChartSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark p-5">
      <span className="sr-only">{title}</span>
      <div className="mb-4">
        <div className="h-5 w-36 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
      </div>
      <div className="h-36 animate-pulse rounded-xl bg-black/3 dark:bg-white/3" />
    </div>
  )
}
