/**
 * src/components/dashboard/charts/payments-status-chart.tsx
 *
 * Payments Status Chart — Recharts (Dashboard Pro)
 *
 * Exports: PaymentStatusData, PaymentsStatusChart
 * Features: 'use client'
 */

// ============================================
// Payments Status Chart — Recharts (Dashboard Pro)
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
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { ChartCard, ChartCardSkeleton, ChartTooltipGlass } from './chart-primitives'

export interface PaymentStatusData {
  status: string
  label: string
  amount: number
  count: number
  color: string
}

interface PaymentsStatusChartProps {
  summary: {
    total_received: number
    total_pending: number
    total_overdue: number
  }
  loading?: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PaymentStatusData }> }) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload
  return (
    <ChartTooltipGlass>
      <p className="text-xs font-semibold text-text-primary">{data.label}</p>
      <p className="text-sm font-bold" style={{ color: data.color }}>{formatCurrency(data.amount)}</p>
      <p className="text-xs text-text-muted">{data.count} cobranças</p>
    </ChartTooltipGlass>
  )
}

export function PaymentsStatusChart({ summary, loading = false }: PaymentsStatusChartProps) {
  if (loading) return <PaymentsChartSkeleton />

  const chartData: PaymentStatusData[] = [
    {
      status: 'received',
      label: 'Recebido',
      amount: summary.total_received,
      count: 0,
      color: 'var(--color-success)',
    },
    {
      status: 'pending',
      label: 'Pendente',
      amount: summary.total_pending,
      count: 0,
      color: 'var(--color-warning)',
    },
    {
      status: 'overdue',
      label: 'Atrasado',
      amount: summary.total_overdue,
      count: 0,
      color: 'var(--color-error)',
    },
  ]

  const total = chartData.reduce((sum, d) => sum + d.amount, 0)

  return (
    <ChartCard
      title="Pagamentos por Status"
      subtitle="Distribuição financeira"
      chartClassName="h-48"
      rightActions={(
        <>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(total)}</p>
          <p className="text-xs text-text-muted">total geral</p>
        </>
      )}
    >
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--color-text-primary)', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={30}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      

      {/* Bottom summary */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border-light pt-3">
        {chartData.map((item) => (
          <div key={item.status} className="text-center">
            <p className="text-xs text-text-muted">{item.label}</p>
            <p className="text-sm font-bold" style={{ color: item.color }}>
              {formatCurrency(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function PaymentsChartSkeleton() {
  return <ChartCardSkeleton title="Pagamentos por Status" chartClassName="h-48" />
}
