/**
 * src/components/workouts/exercise-progression-chart.tsx
 *
 * Exercise Progression Chart — S08-07
 *
 * Exports: ExerciseProgressionChart
 * Hooks: useState, useExerciseProgress
 * Features: 'use client' · DSIcon
 */

// ============================================
// Exercise Progression Chart — S08-07
// Recharts line chart de evolução de carga
// ============================================

'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { useExerciseProgress } from '@/hooks/use-workouts'

// ============================================
// Period selector
// ============================================

const PERIODS = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
  { value: 180, label: '6m' },
  { value: 365, label: '1a' },
] as const

// ============================================
// Main Component
// ============================================

interface ExerciseProgressionChartProps {
  exerciseId: string
  className?: string
}

export function ExerciseProgressionChart({ exerciseId, className }: ExerciseProgressionChartProps) {
  const [days, setDays] = useState(90)
  const { data, isLoading } = useExerciseProgress(exerciseId, days)

  if (isLoading) {
    return (
      <div className={cn('animate-pulse rounded-2xl border border-border-light bg-bg-secondary p-5', className)}>
        <div className="h-5 w-40 rounded bg-white/6" />
        <div className="mt-4 h-48 rounded-xl bg-white/4" />
      </div>
    )
  }

  if (!data || data.points.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border-light bg-bg-secondary p-5 text-center', className)}>
        <DSIcon name="dumbbell" size={32} className="mx-auto text-text-muted/30" />
        <p className="mt-2 text-sm font-medium text-text-primary">Sem dados de progressão</p>
        <p className="mt-1 text-xs text-text-muted">
          Complete sessões de treino com este exercício para ver sua evolução.
        </p>
      </div>
    )
  }

  const { summary, points, exercise_name } = data

  // Trend calculation
  const trend = points.length >= 2
    ? points[points.length - 1].load - points[0].load
    : 0
  const trendPercent = points.length >= 2 && points[0].load > 0
    ? Math.round((trend / points[0].load) * 100)
    : 0

  // Format dates for chart
  const chartData = points.map(p => ({
    ...p,
    dateLabel: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }))

  return (
    <div className={cn('rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Evolução de Carga</h4>
          <p className="text-xs text-text-muted">{exercise_name}</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={cn(
                'rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
                days === p.value
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:bg-white/6 hover:text-text-primary'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <p className="text-lg font-bold text-text-primary">
            {summary.current_load != null ? `${summary.current_load}kg` : '—'}
          </p>
          <p className="text-[10px] text-text-muted">Atual</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <p className="text-lg font-bold text-text-primary">
            {summary.max_load != null ? `${summary.max_load}kg` : '—'}
          </p>
          <p className="text-[10px] text-text-muted">Máxima</p>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {trend > 0 ? (
              <DSIcon name="trendingUp" size={14} className="text-success" />
            ) : trend < 0 ? (
              <DSIcon name="arrowDown" size={14} className="text-error" />
            ) : (
              <span className="inline-block h-0.5 w-3.5 rounded-full bg-text-muted" />
            )}
            <p className={cn(
              'text-lg font-bold',
              trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-muted'
            )}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg
            </p>
          </div>
          <p className="text-[10px] text-text-muted">
            {trendPercent !== 0 ? `${trendPercent > 0 ? '+' : ''}${trendPercent}%` : 'Tendência'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={`progressGrad-${exerciseId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              unit="kg"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.9)',
              }}
              formatter={(value) => [`${value}kg`, 'Carga']}
              labelFormatter={(label) => `${label}`}
            />
            <Area
              type="monotone"
              dataKey="load"
              stroke="#10B981"
              strokeWidth={2}
              fill={`url(#progressGrad-${exerciseId})`}
              dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <DSIcon name="calendar" size={12} />
          {summary.unique_days} dias únicos · {summary.sessions_tracked} sessões
        </span>
      </div>
    </div>
  )
}
