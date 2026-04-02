/**
 * src/components/dashboard/charts/revenue-area-chart.tsx
 *
 * Revenue Area Chart — Recharts (Dashboard Pro)
 *
 * Exports: RevenueAreaChart
 * Features: 'use client'
 */

// ============================================
// Revenue Area Chart — Recharts (Dashboard Pro)
// ============================================

'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { ChartCard, ChartCardSkeleton, ChartTooltipGlass } from './chart-primitives'

interface MonthlyData {
  month: string
  revenue: number
  count: number
}

interface RevenueAreaChartProps {
  data: MonthlyData[]
  loading?: boolean
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const m = parseInt(month, 10) - 1
  return `${MONTHS_PT[m]} ${year.slice(2)}`
}

function fillLastMonths(data: MonthlyData[], count = 6): MonthlyData[] {
  const months: MonthlyData[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const existing = data.find((m) => m.month === key)
    months.push(existing || { month: key, revenue: 0, count: 0 })
  }
  return months
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: MonthlyData }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload
  return (
    <ChartTooltipGlass>
      <p className="text-xs font-semibold text-text-primary">{formatMonthLabel(label || '')}</p>
      <p className="text-sm text-success font-bold">{formatCurrency(data.revenue)}</p>
      <p className="text-xs text-text-muted">{data.count} pagamento{data.count !== 1 ? 's' : ''}</p>
    </ChartTooltipGlass>
  )
}

export function RevenueAreaChart({ data, loading = false }: RevenueAreaChartProps) {
  if (loading) return <ChartSkeleton title="Receita Mensal" />

  const chartData = fillLastMonths(data)
  const total = chartData.reduce((sum, m) => sum + m.revenue, 0)
  const currentMonth = chartData[chartData.length - 1]
  const previousMonth = chartData[chartData.length - 2]
  const variation = previousMonth && previousMonth.revenue > 0
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0

  return (
    <ChartCard
      title="Receita Mensal"
      subtitle="Últimos 6 meses"
      rightActions={(
        <>
          <p className="text-lg font-bold text-success">{formatCurrency(total)}</p>
          {variation !== 0 && (
            <p className={`text-xs font-medium ${variation > 0 ? 'text-success' : 'text-error'}`}>
              {variation > 0 ? '↑' : '↓'} {Math.abs(variation).toFixed(1)}% vs mês anterior
            </p>
          )}
        </>
      )}
    >
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthLabel}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-brand-primary)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ r: 4, fill: 'var(--color-brand-primary)', strokeWidth: 2, stroke: 'var(--chart-dot-stroke)' }}
              activeDot={{ r: 6, fill: 'var(--color-brand-primary)', strokeWidth: 2, stroke: 'var(--chart-dot-stroke)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
    </ChartCard>
  )
}

function ChartSkeleton({ title }: { title: string }) {
  return <ChartCardSkeleton title={title} />
}

export { ChartSkeleton }
