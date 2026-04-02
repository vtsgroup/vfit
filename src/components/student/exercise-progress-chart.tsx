// ============================================
// exercise-progress-chart.tsx — Gráfico de progresso de exercício do aluno
// ============================================
//
// O que faz:
//   Gráfico de linha (Recharts LineChart) com histórico de carga/reps por exercício.
//   Eixo X: datas das sessões. Eixo Y: carga em kg ou repetições.
//   Tooltip customizado com valores e data formatada.
//
// Exports principais:
//   ExerciseProgressChart — gráfico de linha de progresso por exercício
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { StudentExerciseProgressResponse } from '@/hooks/use-student-app'

interface ExerciseProgressChartProps {
  data?: StudentExerciseProgressResponse
  loading?: boolean
}

export function ExerciseProgressChart({ data, loading = false }: ExerciseProgressChartProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-black/4 dark:bg-white/6" />
        <div className="mt-4 h-40 animate-pulse rounded bg-black/3 dark:bg-white/4" />
      </div>
    )
  }

  const points = data?.points ?? []

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5">
        <h3 className="font-semibold text-text-primary">Evolução de carga</h3>
        <p className="mt-4 text-sm text-text-secondary">
          Conclua treinos registrando carga para visualizar a evolução deste exercício.
        </p>
      </div>
    )
  }

  const chartData = points.map((point) => ({
    ...point,
    label: shortDate(point.date),
  }))

  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5 shadow-elevation-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text-primary">Evolução de carga</h3>
          <p className="text-xs text-text-muted">{data?.exercise_name}</p>
        </div>
        <div className="text-right text-xs text-text-muted">
          <p>Atual: <span className="font-semibold text-text-primary">{formatLoad(data?.summary.current_load)}</span></p>
          <p>Pico: <span className="font-semibold text-emerald-500 dark:text-emerald-400">{formatLoad(data?.summary.max_load)}</span></p>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ProgressTooltip />} />
            <Line
              type="monotone"
              dataKey="load"
              name="Carga"
              stroke="var(--color-brand-primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-brand-primary)', strokeWidth: 2, stroke: 'var(--color-kpi-dark)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ProgressTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl border border-border-light bg-kpi-dark backdrop-blur-xl px-3 py-2 shadow-elevation-3">
      <p className="text-xs font-semibold text-text-primary">{label}</p>
      <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400">{formatLoad(payload[0].value)}</p>
    </div>
  )
}

function shortDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
}

function formatLoad(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${value.toLocaleString('pt-BR')} kg`
}
