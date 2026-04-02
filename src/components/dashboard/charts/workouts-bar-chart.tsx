/**
 * src/components/dashboard/charts/workouts-bar-chart.tsx
 *
 * Workouts Bar Chart — Recharts (Dashboard Pro)
 *
 * Exports: WeeklyWorkoutData, WorkoutsBarChart
 * Features: 'use client'
 */

// ============================================
// Workouts Bar Chart — Recharts (Dashboard Pro)
// ============================================

'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard, ChartCardSkeleton, ChartTooltipGlass } from './chart-primitives'

export interface WeeklyWorkoutData {
  week: string       // 'Sem 1', 'Sem 2', etc
  created: number
  completed: number
}

interface WorkoutsBarChartProps {
  data: WeeklyWorkoutData[]
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <ChartTooltipGlass>
      <p className="text-xs font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-text-muted">{entry.name}:</span>
          <span className="text-xs font-bold text-text-primary">{entry.value}</span>
        </div>
      ))}
    </ChartTooltipGlass>
  )
}

export function WorkoutsBarChart({ data, loading = false }: WorkoutsBarChartProps) {
  if (loading) return <BarChartSkeleton title="Treinos — Últimas 4 Semanas" />

  const totalCreated = data.reduce((sum, w) => sum + w.created, 0)
  const totalCompleted = data.reduce((sum, w) => sum + w.completed, 0)
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0
  const createdSeriesColor = 'var(--color-text-muted)'
  const completedSeriesColor = 'var(--color-brand-primary)'

  return (
    <ChartCard
      title="Treinos — Últimas 4 Semanas"
      subtitle="Criados vs concluídos"
      chartClassName="h-48"
      rightActions={(
        <>
          <p className="text-lg font-bold text-brand-primary">{completionRate}%</p>
          <p className="text-xs text-text-muted">taxa de conclusão</p>
        </>
      )}
    >
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="created" name="Criados" fill={createdSeriesColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="completed" name="Concluídos" fill={completedSeriesColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: createdSeriesColor }} />
          <span className="text-xs text-text-muted">Criados ({totalCreated})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: completedSeriesColor }} />
          <span className="text-xs text-text-muted">Concluídos ({totalCompleted})</span>
        </div>
      </div>
    </ChartCard>
  )
}

function BarChartSkeleton({ title }: { title: string }) {
  return (
    <ChartCardSkeleton title={title} chartClassName="h-48" />
  )
}

export { BarChartSkeleton }
