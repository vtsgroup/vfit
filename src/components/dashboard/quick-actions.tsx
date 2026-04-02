/**
 * src/components/dashboard/quick-actions.tsx
 *
 * Quick Actions + Pending Payments Widget
 *
 * Exports: QuickActions, PendingPayments, SubscriptionBanner
 * Features: 'use client' · DSIcon
 */

// ============================================
// Quick Actions + Pending Payments Widget
// ============================================

'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn, formatCurrency } from '@/lib/utils'
import { ActionCard3D, PERSONAL_ACTIONS } from '@/components/ui/action-button-3d'
import { GlassCard } from '@/components/ui/glass-card'
import type { RecentPayment } from '@/hooks/use-dashboard'

// ============================================
// Quick Actions Grid — 3D Didactic Cards
// ============================================

export function QuickActions() {
  const actions = Object.values(PERSONAL_ACTIONS)

  return (
    <GlassCard variant="gradient" padding="md" radius="2xl">
      <h3
        className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      >
        ⚡ Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {actions.map((action) => (
          <ActionCard3D
            key={action.label}
            color={action.color}
            icon={action.icon}
            label={action.label}
            description={action.description}
            href={action.href}
          />
        ))}
      </div>
    </GlassCard>
  )
}

// ============================================
// Pending Payments Widget
// ============================================

interface PendingPaymentsProps {
  payments: RecentPayment[]
  totalPending: number
  totalOverdue: number
  loading?: boolean
}

export function PendingPayments({
  payments,
  totalPending,
  totalOverdue,
  loading = false,
}: PendingPaymentsProps) {
  if (loading) {
    return (
      <GlassCard variant="surface" padding="md" radius="2xl">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>Pagamentos Pendentes</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-tertiary" />
          ))}
        </div>
      </GlassCard>
    )
  }

  const pendingPayments = payments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue'
  )

  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
        >Pagamentos Pendentes</h3>
        {totalOverdue > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            <DSIcon name="alertTriangle" size={12} />
            {formatCurrency(totalOverdue)} atrasado
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="mb-3 flex gap-3">
        <div className="flex-1 rounded-lg bg-warning/5 p-2 text-center">
          <p className="text-lg font-bold text-warning">{formatCurrency(totalPending)}</p>
          <p className="text-[10px] text-text-muted">Pendente</p>
        </div>
        <div className="flex-1 rounded-lg bg-error/5 p-2 text-center">
          <p className="text-lg font-bold text-error">{formatCurrency(totalOverdue)}</p>
          <p className="text-[10px] text-text-muted">Atrasado</p>
        </div>
      </div>

      {pendingPayments.length === 0 ? (
        <p className="py-2 text-center text-sm text-text-muted">
          Nenhum pagamento pendente!
        </p>
      ) : (
        <div className="space-y-2">
          {pendingPayments.slice(0, 5).map((payment) => {
            const isOverdue = payment.status === 'overdue' ||
              (payment.due_date && new Date(payment.due_date) < new Date())
            return (
              <div
                key={payment.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  isOverdue ? 'bg-error/5' : 'bg-warning/5'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{payment.payer_name}</p>
                  {payment.due_date && (
                    <p className={cn('text-xs', isOverdue ? 'text-error' : 'text-text-muted')}>
                      Vence: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <p className={cn('shrink-0 font-semibold', isOverdue ? 'text-error' : 'text-warning')}>
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {pendingPayments.length > 0 && (
        <Link
          href="/dashboard/payments?status=pending"
          className="mt-3 block text-center text-xs font-medium text-brand-primary hover:text-brand-primary-hover"
        >
          Ver todos os pagamentos →
        </Link>
      )}
    </GlassCard>
  )
}

// ============================================
// Subscription Banner
// ============================================

interface SubscriptionBannerProps {
  plan: string
  status: string
  trialEndsAt: string | null
}

export function SubscriptionBanner({ plan, status, trialEndsAt }: SubscriptionBannerProps) {
  if (status !== 'trial' && status !== 'past_due') return null

  const isTrial = status === 'trial'
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-4 py-3 text-sm',
        isTrial
          ? 'border border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
          : 'border border-error/20 bg-error/5 text-error'
      )}
    >
      <div>
        {isTrial ? (
          <>
            <span className="font-medium">Período de teste ({plan})</span>
            {daysLeft > 0 && (
              <span className="ml-1">— {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}</span>
            )}
          </>
        ) : (
          <span className="font-medium">Pagamento pendente — atualize seu plano para continuar</span>
        )}
      </div>
      <Link
        href="/dashboard/settings/billing"
        className={cn(
          'shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors',
          isTrial
            ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
            : 'bg-error text-white hover:bg-error/90'
        )}
      >
        {isTrial ? 'Assinar agora' : 'Atualizar'}
      </Link>
    </div>
  )
}
