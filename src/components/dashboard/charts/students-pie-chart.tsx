/**
 * src/components/dashboard/charts/students-pie-chart.tsx
 *
 * Students Pie Chart — Recharts (Dashboard Pro)
 *
 * Exports: StudentsPieChart
 * Features: 'use client'
 */

// ============================================
// Students Pie Chart — Recharts (Dashboard Pro)
// ============================================

'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface StudentsByStatus {
  [key: string]: number
}

interface StudentsPieChartProps {
  byStatus: StudentsByStatus
  total: number
  loading?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativos',
  inactive: 'Inativos',
  pending: 'Pendentes',
  blocked: 'Bloqueados',
  invited: 'Convidados',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--color-success)',
  inactive: 'var(--color-text-muted)',
  pending: 'var(--color-warning)',
  blocked: 'var(--color-error)',
  invited: 'var(--color-info)',
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; fill: string } }> }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-border-light bg-bg-secondary px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        <span className="text-xs font-semibold text-text-primary">{item.name}</span>
      </div>
      <p className="mt-0.5 text-sm font-bold text-text-primary">{item.value} aluno{item.value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ color: string; value: string; payload?: { value: number } }> }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-text-muted">
            {entry.value} ({entry.payload?.value ?? 0})
          </span>
        </div>
      ))}
    </div>
  )
}

export function StudentsPieChart({ byStatus, total, loading = false }: StudentsPieChartProps) {
  if (loading) return <PieChartSkeleton />

  const chartData = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      fill: STATUS_COLORS[status] || 'var(--color-text-muted)',
    }))

  if (chartData.length === 0) {
    chartData.push({ name: 'Sem alunos', value: 1, fill: 'var(--color-border-light)' })
  }

  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">Alunos por Status</h3>
          <p className="text-sm text-text-muted">{total} total</p>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PieChartSkeleton() {
  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
      <div className="mb-2">
        <div className="h-5 w-36 animate-pulse rounded bg-border-light" />
        <div className="mt-1 h-4 w-20 animate-pulse rounded bg-border-light" />
      </div>
      <div className="h-52 flex items-center justify-center">
        <div className="h-36 w-36 animate-pulse rounded-full bg-border-light/50" />
      </div>
    </div>
  )
}
