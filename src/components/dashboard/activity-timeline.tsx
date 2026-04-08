/**
 * src/components/dashboard/activity-timeline.tsx
 *
 * Activity Timeline — Recent actions (Personal Dashboard)
 *
 * Exports: ActivityTimeline
 * Hooks: useMemo
 * Features: 'use client' · DSIcon
 */

// ============================================
// Activity Timeline — Recent actions (Personal Dashboard)
// Shows latest actions: workouts created, assessments, payments, students
// ============================================

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { GlassCard } from '@/components/ui/glass-card'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RecentPayment, RecentStudent } from '@/hooks/use-dashboard'

type TimelineEventType = 'payment' | 'student' | 'workout' | 'assessment' | 'message' | 'system'

interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string
  href?: string
}

interface ActivityTimelineProps {
  payments?: RecentPayment[]
  students?: RecentStudent[]
  loading?: boolean
  limit?: number
}

const eventConfig: Record<TimelineEventType, { icon: DSIconName; color: string; dotColor: string }> = {
  payment: { icon: 'creditCard', color: 'text-emerald-400', dotColor: 'bg-emerald-500' },
    student: { icon: 'userPlus', color: 'text-brand-primary', dotColor: 'bg-brand-primary' },
  workout: { icon: 'dumbbell', color: 'text-violet-400', dotColor: 'bg-violet-500' },
  assessment: { icon: 'clipboardList', color: 'text-amber-400', dotColor: 'bg-amber-500' },
  message: { icon: 'message', color: 'text-brand-primary', dotColor: 'bg-brand-primary' },
  system: { icon: 'flame', color: 'text-text-muted', dotColor: 'bg-black/30 dark:bg-white/30' },
}

function buildTimeline(payments: RecentPayment[], students: RecentStudent[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const p of payments) {
    events.push({
      id: `payment-${p.id}`,
      type: 'payment',
      title: p.status === 'confirmed' ? 'Pagamento recebido' : p.status === 'overdue' ? 'Pagamento atrasado' : 'Cobrança pendente',
      description: `${p.payer_name} • R$ ${(p.amount / 100).toFixed(2).replace('.', ',')}`,
      timestamp: p.created_at,
      href: '/dashboard/payments',
    })
  }

  for (const s of students) {
    events.push({
      id: `student-${s.id}`,
      type: 'student',
      title: 'Novo aluno cadastrado',
      description: s.full_name,
      timestamp: s.created_at,
      href: `/dashboard/students/view?id=${s.id}`,
    })
  }

  // Sort by most recent first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return events
}

export function ActivityTimeline({ payments = [], students = [], loading = false, limit = 8 }: ActivityTimelineProps) {
  const events = useMemo(() => buildTimeline(payments, students).slice(0, limit), [payments, students, limit])

  if (loading) return <TimelineSkeleton />

  if (events.length === 0) {
    return (
      <GlassCard variant="surface" padding="md" radius="2xl">
        <TimelineHeader />
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <DSIcon name="clock" size={32} className="text-text-muted" />
          <p className="text-sm text-text-muted">Nenhuma atividade recente.</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <TimelineHeader />
      <div className="relative ml-2 mt-4">
        {/* Vertical line */}
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border-light" />

        <div className="space-y-1">
          {events.map((event, i) => {
            const config = eventConfig[event.type]

            const inner = (
              <div className={cn(
                'group relative flex gap-3 rounded-xl px-2 py-2.5 transition-all',
                event.href && 'hover:bg-black/4 dark:hover:bg-white/4 cursor-pointer'
              )}>
                {/* Dot + icon */}
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-border-light">
                  <DSIcon name={config.icon} size={14} className={config.color} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-text-primary">{event.title}</p>
                  <p className="text-xs text-text-muted truncate">{event.description}</p>
                </div>

                {/* Time */}
                <p className="shrink-0 pt-1 text-[10px] text-text-muted">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            )

            return event.href ? (
              <Link key={event.id} href={event.href}>{inner}</Link>
            ) : (
              <div key={event.id}>{inner}</div>
            )
          })}
        </div>
      </div>
    </GlassCard>
  )
}

function TimelineHeader() {
  return (
    <h3
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
    ><DSIcon name="clock" size={14} /> Atividade Recente</h3>
  )
}

function TimelineSkeleton() {
  return (
    <GlassCard variant="surface" padding="md" radius="2xl">
      <TimelineHeader />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-2">
            <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
            <div className="flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-black/5 dark:bg-white/5" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
