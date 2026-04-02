/**
 * src/components/dashboard/recent-activity.tsx
 *
 * Recent Activity — Lista de atividades recentes
 *
 * Exports: RecentPayments, RecentStudents
 * Features: 'use client' · DSIcon
 */

// ============================================
// Recent Activity — Lista de atividades recentes
// ============================================

'use client'

import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { GlassCard } from '@/components/ui/glass-card'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RecentPayment, RecentStudent } from '@/hooks/use-dashboard'

// ============================================
// Recent Payments Widget
// ============================================

interface RecentPaymentsProps {
  payments: RecentPayment[]
  loading?: boolean
}

const paymentStatusConfig: Record<string, { icon: DSIconName; color: string; label: string }> = {
  confirmed: { icon: 'checkCircle', color: 'text-success', label: 'Confirmado' },
  pending: { icon: 'clock', color: 'text-warning', label: 'Pendente' },
  overdue: { icon: 'alertTriangle', color: 'text-error', label: 'Atrasado' },
  refunded: { icon: 'creditCard', color: 'text-info', label: 'Estornado' },
  cancelled: { icon: 'alertTriangle', color: 'text-text-muted', label: 'Cancelado' },
}

export function RecentPayments({ payments, loading = false }: RecentPaymentsProps) {
  if (loading) {
    return <ActivityListSkeleton title="Pagamentos Recentes" count={3} />
  }

  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <h3
        className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      ><DSIcon name="creditCard" size={14} /> Pagamentos Recentes</h3>

      {payments.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">
          Nenhum pagamento registrado ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const config = paymentStatusConfig[payment.status] || paymentStatusConfig.pending
            return (
              <div
                key={payment.id}
                className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-black/4 dark:hover:bg-white/4"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', `${config.color} bg-current/10`)}>
                  <DSIcon name={config.icon} size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {payment.payer_name}
                  </p>
                  <p className="text-xs text-text-muted">{config.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('text-sm font-semibold', payment.status === 'confirmed' ? 'text-emerald-400' : 'text-text-primary')}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {formatRelativeTime(payment.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}

// ============================================
// Recent Students Widget
// ============================================

interface RecentStudentsProps {
  students: RecentStudent[]
  loading?: boolean
}

const studentStatusColors: Record<string, string> = {
  active: 'bg-success',
  inactive: 'bg-text-muted',
  pending: 'bg-warning',
  blocked: 'bg-error',
}

export function RecentStudents({ students, loading = false }: RecentStudentsProps) {
  if (loading) {
    return <ActivityListSkeleton title="Alunos Recentes" count={3} />
  }

  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <h3
        className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      ><DSIcon name="userPlus" size={14} /> Alunos Recentes</h3>

      {students.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">
          Nenhum aluno cadastrado ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-black/4 dark:hover:bg-white/4"
            >
              {/* Avatar */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-medium text-emerald-400">
                {student.profile_photo_url ? (
                  <Image
                    src={student.profile_photo_url}
                    alt={student.full_name}
                    fill
                    sizes="36px"
                    unoptimized
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  student.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                )}
                {/* Status dot */}
                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-primary', 
                    studentStatusColors[student.status] || 'bg-text-muted'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {student.full_name}
                </p>
                <p className="text-xs text-text-muted truncate">{student.email}</p>
              </div>

              <div className="text-right shrink-0">
                <DSIcon name="userPlus" size={16} className="text-text-muted" />
                <p className="text-[10px] text-text-muted">
                  {formatRelativeTime(student.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

// ============================================
// Activity List Skeleton
// ============================================

function ActivityListSkeleton({ title, count = 3 }: { title: string; count?: number }) {
  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <h3
        className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      >{title}</h3>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-border-light" />
            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-border-light" />
              <div className="mt-1 h-3 w-20 animate-pulse rounded bg-border-light" />
            </div>
            <div className="text-right">
              <div className="h-4 w-16 animate-pulse rounded bg-border-light" />
              <div className="mt-1 h-3 w-12 animate-pulse rounded bg-border-light" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
