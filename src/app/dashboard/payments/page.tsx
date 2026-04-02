/**
 * src/app/dashboard/payments/page.tsx
 *
 * Payments list page — Personal + Student views
 *
 * Exports: PaymentsPage
 * Hooks: useState, useAuthStore, usePayments, usePaymentStats, useStudentPayments
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Payments list page — Personal + Student views
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState } from '@/components/ui/empty-state'
import { StyledSelect } from '@/components/ui/styled-select'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PageHeader } from '@/components/ui/page-header'
import { motion } from 'framer-motion'
import {
  usePayments,
  usePaymentStats,
  type PaymentListItem,
} from '@/hooks/use-payments'
import {
  useStudentPayments,
  type StudentPaymentItem,
} from '@/hooks/use-student-app'

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'failed', label: 'Falhou' },
  { value: 'refunded', label: 'Reembolsado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const methodOptions = [
  { value: '', label: 'Todos' },
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' },
]

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'; icon: DSIconName }> = {
  pending: { label: 'Pendente', variant: 'warning', icon: 'clock' },
  confirmed: { label: 'Pago', variant: 'success', icon: 'checkCircle' },
  failed: { label: 'Falhou', variant: 'error', icon: 'xCircle' },
  refunded: { label: 'Reembolsado', variant: 'info', icon: 'rotateCcw' },
  cancelled: { label: 'Cancelado', variant: 'default', icon: 'ban' },
  overdue: { label: 'Atrasado', variant: 'error', icon: 'alertTriangle' },
}

const methodLabels: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão',
  boleto: 'Boleto',
}

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (status !== 'pending' || !dueDate) return false
  return new Date(dueDate) < new Date()
}

// ============================================
// Main Page — Detects user type
// ============================================

export default function PaymentsPage() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const { isStudentView } = useEffectiveUserView()

  if (!isHydrated) return null

  if (isStudentView) {
    return <StudentPaymentsView />
  }

  return <PersonalPaymentsView />
}

// ============================================
// STUDENT PAYMENTS VIEW
// ============================================

function StudentPaymentsView() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useStudentPayments({ page, per_page: 20 })

  const payments = data?.payments ?? []
  const meta = data?.meta

  // Separar pendentes e histórico
  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const otherPayments = payments.filter((p) => p.status !== 'pending')

  // Calcular totais
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.filter((p) => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0)

  return (
    <AuthGuard requiredType="student">
    <div className="space-y-6 stagger-children">
      {/* Header — DS v3 PageHeader */}
      <PageHeader
        title="Meus Pagamentos"
        description="Veja suas cobranças e realize pagamentos."
        icon="wallet"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title="A Pagar"
          value={formatCurrency(totalPending)}
          icon="clock"
          color="warning"
          tone="hero-dark"
          description={`${pendingPayments.length} pendente(s)`}
        />
        <StatsCard
          title="Total Pago"
          value={formatCurrency(totalPaid)}
          icon="checkCircle2"
          color="success"
          tone="hero-dark"
          description="histórico"
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <PaymentListSkeleton count={4} />
      ) : isError ? (
        <EmptyState
          illustration="payments"
          title="Erro ao carregar cobranças"
          description="Não foi possível carregar suas cobranças. Tente novamente."
          actionLabel="Tentar Novamente"
          onAction={() => refetch()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          illustration="payments"
          title="Nenhuma cobrança"
          description="Você ainda não tem cobranças. Quando seu personal criar uma, ela aparecerá aqui."
        />
      ) : null}

      {/* Pending payments — highlighted */}
      {pendingPayments.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 font-bold text-text-primary">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
              <DSIcon name="clock" size={16} className="text-warning" />
            </div>
            Cobranças Pendentes ({pendingPayments.length})
          </h2>
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <StudentPaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      {otherPayments.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-text-primary">Histórico</h2>
          <div className="space-y-3">
            {otherPayments.map((payment) => (
              <StudentPaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {meta.total} cobrança{meta.total !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <DSIcon name="chevronLeft" size={16} />
            </Button>
            <span className="flex items-center px-3 text-sm text-text-muted">
              {page} / {meta.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <DSIcon name="chevronRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  )
}

// ============================================
// Student Payment Card
// ============================================

function StudentPaymentCard({ payment }: { payment: StudentPaymentItem }) {
  const overdue = isOverdue(payment.due_date, payment.status)
  const effectiveStatus = overdue ? 'overdue' : payment.status
  const config = statusConfig[effectiveStatus] ?? statusConfig.pending
  const isPending = payment.status === 'pending'

  return (
    <GlassCard variant="surface" hover padding="none" className={cn(
      'p-4',
      isPending && overdue
        ? 'border-l-4 border-l-error border-error/30 shadow-sm shadow-error/5'
        : isPending
          ? 'border-l-4 border-l-warning border-warning/30 shadow-sm shadow-warning/5'
          : payment.status === 'confirmed'
            ? 'border-l-4 border-l-success'
            : '',
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          isPending ? 'bg-warning/10' : payment.status === 'confirmed' ? 'bg-success/10' : 'bg-bg-primary',
        )}>
          {payment.status === 'confirmed' ? (
            <DSIcon name="checkCircle" size={20} className="text-success" />
          ) : (
            <DSIcon name="wallet" className={cn(isPending ? 'text-warning' : 'text-text-muted')} />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-black text-text-primary">{formatCurrency(payment.amount)}</p>
            <Badge variant={config.variant} className="text-[10px] inline-flex items-center gap-1">
              <DSIcon name={config.icon} size={12} />
              {config.label}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            {payment.recipient_name && (
              <span>Personal: <span className="text-text-secondary">{payment.recipient_name}</span></span>
            )}
            {payment.payment_method && (
              <span>{methodLabels[payment.payment_method] || payment.payment_method}</span>
            )}
            {payment.due_date && (
              <span className={overdue ? 'text-error font-semibold' : ''}>
                {overdue ? 'Venceu: ' : 'Vence: '}{formatDate(payment.due_date)}
              </span>
            )}
            {payment.paid_at && (
              <span className="text-success">Pago em {formatDate(payment.paid_at)}</span>
            )}
          </div>
          {payment.description && (
            <p className="mt-1 text-xs text-text-secondary truncate">{payment.description}</p>
          )}
        </div>
      </div>

      {/* Action buttons for pending payments */}
      {isPending && (
        <div className="mt-3 flex gap-2">
          <Link href={`/dashboard/payments/checkout?id=${payment.id}`} className="flex-1">
            <Button className="w-full gap-1.5" size="md">
              <DSIcon name="creditCard" size={16} />
              Pagar Agora
            </Button>
          </Link>
          {payment.invoice_url && (
            <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <DSIcon name="externalLink" size={16} />
                Fatura
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Receipt for confirmed payments */}
      {payment.status === 'confirmed' && payment.receipt_url && (
        <div className="mt-3">
          <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted">
              <DSIcon name="externalLink" size={14} />
              Ver Comprovante
            </Button>
          </a>
        </div>
      )}
    </GlassCard>
  )
}

// ============================================
// PERSONAL PAYMENTS VIEW (original)
// ============================================

function PersonalPaymentsView() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const { data, isLoading, isError, refetch } = usePayments({
    page,
    per_page: 20,
    status: statusFilter || undefined,
    payment_method: methodFilter || undefined,
  })
  const { data: stats } = usePaymentStats()

  const payments = data?.payments ?? []
  const meta = data?.meta

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title="Financeiro"
          description="Gerencie cobranças e acompanhe sua receita."
          icon="dollarSign"
          actions={
            <div className="flex gap-2">
              <Link href="/dashboard/payments/create">
                <Button variant="payment">
                  <DSIcon name="plus" size={16} className="mr-1.5" />
                  Nova Cobrança
                </Button>
              </Link>
              <Link href="/dashboard/payments/withdraw">
                <Button variant="outline">
                  <DSIcon name="arrowDownToLine" size={16} className="mr-1.5" />
                  Saques PIX
                </Button>
              </Link>
            </div>
          }
        />

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatsCard
              title="Total Recebido"
              value={formatCurrency(stats.summary.total_received)}
              icon="dollarSign"
              color="success"
              tone="hero-dark"
              description={`${stats.summary.payment_count} pagamento(s)`}
            />
            <StatsCard
              title="Pendente"
              value={formatCurrency(stats.summary.total_pending)}
              icon="clock"
              color="warning"
              tone="hero-dark"
              description="a receber"
            />
            <StatsCard
              title="Atrasado"
              value={formatCurrency(stats.summary.total_overdue)}
              icon="alertTriangle"
              color="error"
              tone="hero-dark"
              description={stats.summary.total_overdue > 0 ? 'atenção' : 'ok'}
            />
            <StatsCard
              title="Receita Total"
              value={formatCurrency(stats.summary.total_revenue)}
              icon="trendingUp"
              color="primary"
              tone="hero-dark"
              description="(período atual)"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <StyledSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            options={statusOptions}
            compact
          />
          <StyledSelect
            value={methodFilter}
            onChange={(v) => { setMethodFilter(v); setPage(1) }}
            options={methodOptions}
            compact
          />
        </div>

        {/* List */}
        {isLoading ? (
          <PaymentListSkeleton count={6} />
        ) : isError ? (
          <EmptyState
            illustration="payments"
            title="Erro ao carregar cobranças"
            description="Não foi possível carregar as cobranças. Tente novamente."
            actionLabel="Tentar Novamente"
            onAction={() => refetch()}
          />
        ) : payments.length === 0 ? (
          <EmptyState
            illustration="payments"
            title="Nenhuma cobrança"
            description="Crie sua primeira cobrança para um aluno."
            actionLabel="Nova Cobrança"
            onAction={() => window.location.href = '/dashboard/payments/create'}
          />
        ) : (
          <GlassCard variant="surface" padding="none" radius="xl">
            <div className="divide-y divide-border-light">
              {payments.map((payment) => (
                <PersonalPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {meta.total} cobrança{meta.total !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <DSIcon name="chevronLeft" size={16} />
              </Button>
              <span className="flex items-center px-3 text-sm text-text-muted">
                {page} / {meta.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <DSIcon name="chevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Personal Payment Card (original)
// ============================================

function PersonalPaymentCard({ payment }: { payment: PaymentListItem }) {
  const config = statusConfig[payment.status] ?? statusConfig.pending

  const iconBg =
    payment.status === 'confirmed'
      ? 'bg-success/10'
      : payment.status === 'failed'
        ? 'bg-error/10'
        : payment.status === 'refunded'
          ? 'bg-info/10'
          : payment.status === 'cancelled'
            ? 'bg-text-muted/10'
            : 'bg-warning/10'

  const iconColor =
    payment.status === 'confirmed'
      ? 'text-success'
      : payment.status === 'failed'
        ? 'text-error'
        : payment.status === 'refunded'
          ? 'text-info'
          : payment.status === 'cancelled'
            ? 'text-text-muted'
            : 'text-warning'

  return (
    <Link
      href={`/dashboard/payments/view?id=${payment.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-all hover:bg-bg-tertiary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconBg)}>
        <DSIcon name="creditCard" size={20} className={iconColor} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-text-primary">{payment.payer_name}</p>
          <Badge variant={config.variant} className="text-[10px] inline-flex items-center gap-1">
            <DSIcon name={config.icon} size={12} />
            {config.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {methodLabels[payment.payment_method] || payment.payment_method}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          {payment.due_date && (
            <>
              <span>Vence: {new Date(payment.due_date).toLocaleDateString('pt-BR')}</span>
            </>
          )}
          {payment.description && (
            <>
              <span className="truncate max-w-50">{payment.description}</span>
            </>
          )}
        </div>
      </div>

      <p className="shrink-0 font-semibold text-text-primary">
        {formatCurrency(payment.amount)}
      </p>

      <DSIcon name="chevronRight" size={16} className="hidden shrink-0 text-text-muted/70 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
    </Link>
  )
}

// ============================================
// Payment List Skeleton
// ============================================

function PaymentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <GlassCard variant="surface" padding="none" radius="xl">
      <div className="divide-y divide-border-light">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-black/8 dark:bg-white/8" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-black/8 dark:bg-white/8" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-black/6 dark:bg-white/6" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
                <div className="h-3 w-20 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              </div>
            </div>
            <div className="h-5 w-20 shrink-0 animate-pulse rounded bg-black/8 dark:bg-white/8" />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
