/**
 * src/components/dashboard/revenue-chart.tsx
 *
 * Revenue Chart — CSS-only bar chart
 *
 * Exports: RevenueChart
 * Features: 'use client'
 */

// ============================================
// Revenue Chart — CSS-only bar chart
// ============================================

'use client'

import { formatCurrency } from '@/lib/utils'

interface MonthlyData {
  month: string      // 'YYYY-MM'
  revenue: number
  count: number
}

interface RevenueChartProps {
  data: MonthlyData[]
  loading?: boolean
}

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const m = parseInt(month, 10) - 1
  return `${months[m]} ${year.slice(2)}`
}

export function RevenueChart({ data, loading = false }: RevenueChartProps) {
  if (loading) {
    return <RevenueChartSkeleton />
  }

  // Fill last 6 months even if no data
  const months: MonthlyData[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const existing = data.find((m) => m.month === key)
    months.push(existing || { month: key, revenue: 0, count: 0 })
  }

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1)
  const total = months.reduce((sum, m) => sum + m.revenue, 0)

  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Receita Mensal</h3>
          <p className="mt-0.5 text-xs text-text-muted">Últimos 6 meses</p>
        </div>
        <div className="text-right rounded-lg bg-black/4 dark:bg-white/4 px-3 py-1.5">
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(total)}</p>
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total no período</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2 h-40">
        {months.map((m) => {
          const heightPercent = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              {/* Value label */}
              <span className="text-[10px] font-medium text-text-muted whitespace-nowrap">
                {m.revenue > 0 ? formatCurrency(m.revenue) : '—'}
              </span>

              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                <div
                  className="w-full max-w-10 rounded-t-lg bg-linear-to-t from-emerald-600 to-emerald-400 transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  title={`${formatMonthLabel(m.month)}: ${formatCurrency(m.revenue)} (${m.count} pagamentos)`}
                />
              </div>

              {/* Month label */}
              <span className="text-[10px] font-semibold text-text-muted">
                {formatMonthLabel(m.month)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RevenueChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border-light bg-kpi-dark p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="h-5 w-32 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        </div>
        <div className="text-right">
          <div className="h-6 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          <div className="mt-1 h-3 w-20 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        </div>
      </div>
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="h-3 w-8 animate-pulse rounded bg-border-light" />
            <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
              <div
                className="w-full max-w-10 animate-pulse rounded-t-md bg-border-light"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            </div>
            <div className="h-3 w-8 animate-pulse rounded bg-border-light" />
          </div>
        ))}
      </div>
    </div>
  )
}
