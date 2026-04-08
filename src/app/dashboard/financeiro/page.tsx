// ============================================
// page.tsx — Dashboard Financeiro
// ============================================
//
// O que faz:
//   Dashboard financeiro do personal: resumo de receita, gráficos e pendências.
//   Recharts carregado via dynamic import (lazy) para reduzir bundle inicial.
//   Usa useFinancialSummary, useFinancialCharts, usePendingPayments para dados.
//   Inclui botões de exportação PDF/CSV via FinancialExportButtons.
//
// Auth: requiredType="personal"
//
// Exports principais:
//   FinanceiroPage — page component (client)
'use client'

import dynamic from 'next/dynamic'
import { AuthGuard } from '@/components/auth'
import { DSIcon } from '@/components/ui/ds-icon'
import { PageHeader } from '@/components/ui/page-header'
import { GlassCard, CardHeader as GlassCardHeader, CardContent as GlassCardContent } from '@/components/ui/glass-card'
import { FinanceiroPageSkeleton } from '@/components/ui/page-skeletons'

// Lazy-load heavy recharts components
const MethodPieChart = dynamic(() => import('@/components/financial/financial-charts').then(m => m.MethodPieChart), { ssr: false })
const RevenueComboChart = dynamic(() => import('@/components/financial/financial-charts').then(m => m.RevenueComboChart), { ssr: false })
import { FinancialExportButtons } from '@/components/financial/export-buttons'
import {
  useFinancialDashboard,
  useFinancialDashboardChart,
  useFinancialDashboardPending,
} from '@/hooks/use-financial-dashboard'
import { formatCurrency } from '@/lib/utils'

export default function FinanceiroPage() {
  const summary = useFinancialDashboard()
  const chart = useFinancialDashboardChart()
  const pending = useFinancialDashboardPending()

  const month = summary.data?.month
  const totalReceived = summary.data?.total_received ?? 0
  const growth = month?.growth_percent ?? 0

  // Show skeleton while initial data loads
  if (summary.isLoading && !summary.data) {
    return (
      <AuthGuard requiredType="personal">
        <FinanceiroPageSkeleton />
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6 stagger-children">
        <PageHeader
          title="Financeiro"
          description="Painel consolidado de receita, crescimento e pendências."
          icon="dollarSign"
        />

        <FinancialExportButtons
          summary={summary.data}
          chart={chart.data}
          pending={pending.data}
          disabled={summary.isLoading || chart.isLoading || pending.isLoading}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Receita mês"
            value={formatCurrency(month?.current_revenue ?? 0)}
            icon={<DSIcon name="dollar" size={20} />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
          />
          <KpiCard
            title="Crescimento"
            value={`${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`}
            highlight={growth >= 0 ? 'text-success' : 'text-error'}
            icon={growth >= 0 ? <DSIcon name="trendingUp" size={20} /> : <DSIcon name="arrowDownRight" size={20} />}
            iconBg={growth >= 0 ? 'bg-success/10' : 'bg-error/10'}
            iconColor={growth >= 0 ? 'text-success' : 'text-error'}
          />
          <KpiCard
            title="Ticket médio"
            value={formatCurrency(month?.average_ticket ?? 0)}
            icon={<DSIcon name="receipt" size={20} />}
            iconBg="bg-brand-primary/10"
            iconColor="text-brand-primary"
          />
          <KpiCard
            title="Total recebido"
            value={formatCurrency(totalReceived)}
            icon={<DSIcon name="building" size={20} />}
            iconBg="bg-brand-primary/10"
            iconColor="text-brand-primary"
          />
        </div>

        {chart.data && (
          <RevenueComboChart
            daily={chart.data.daily_30_days}
            monthly={chart.data.monthly_12_months}
          />
        )}

        {summary.data && <MethodPieChart byMethod={summary.data.by_method} />}

        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard variant="surface">
            <GlassCardHeader title="Cobranças pendentes" icon={<DSIcon name="alertTriangle" size={18} className="text-warning" />} />
            <GlassCardContent>
              <div className="space-y-2">
              {(pending.data?.pending ?? []).slice(0, 8).map((item) => (
                <GlassCard key={item.id} variant="outline" padding="sm" radius="lg">
                  <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.student_name}</p>
                    <p className="text-xs text-text-muted">
                      {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : 'Sem vencimento'}
                      {item.is_overdue ? ` • ${item.days_overdue}d atraso` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.amount)}</span>
                  </div>
                </GlassCard>
              ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="surface">
            <GlassCardHeader title="Top alunos por receita" icon={<DSIcon name="trophy" size={18} className="text-brand-primary" />} />
            <GlassCardContent>
              <div className="space-y-2">
              {(summary.data?.top_students ?? []).map((student) => (
                <GlassCard key={student.student_id} variant="outline" padding="sm" radius="lg">
                  <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{student.student_name}</p>
                    <p className="text-xs text-text-muted">{student.payments} pagamento(s)</p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{formatCurrency(student.revenue)}</span>
                  </div>
                </GlassCard>
              ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </AuthGuard>
  )
}

function KpiCard({ title, value, highlight, icon, iconBg, iconColor }: { title: string; value: string; highlight?: string; icon?: React.ReactNode; iconBg?: string; iconColor?: string }) {
  return (
    <GlassCard variant="surface" hover padding="md">
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg, iconColor)}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{title}</p>
          <p className={cn('mt-0.5 text-xl font-black tracking-tight text-text-primary', highlight)}>{value}</p>
        </div>
      </div>
    </GlassCard>
  )
}

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ')
}
