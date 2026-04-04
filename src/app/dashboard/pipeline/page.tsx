/**
 * src/app/dashboard/pipeline/page.tsx
 *
 * CRM PIPELINE — Kanban-style view of students by status
 * Groups students into columns: Convidado → Ativo → Inativo
 * Shows payment status, streak, last activity
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth'
import { useStudents, type Student } from '@/hooks/use-students'

// ============================================
// Pipeline columns
// ============================================

interface PipelineColumn {
  id: string
  label: string
  icon: DSIconName
  color: string
  bgColor: string
  borderColor: string
  statuses: string[]
}

const COLUMNS: PipelineColumn[] = [
  {
    id: 'invited',
    label: 'Convidados',
    icon: 'mail',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/8',
    borderColor: 'border-blue-400/20',
    statuses: ['invited', 'pending'],
  },
  {
    id: 'active',
    label: 'Ativos',
    icon: 'userCheck',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/8',
    borderColor: 'border-emerald-400/20',
    statuses: ['active'],
  },
  {
    id: 'at_risk',
    label: 'Em Risco',
    icon: 'alertTriangle',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/8',
    borderColor: 'border-amber-400/20',
    statuses: ['__at_risk__'], // virtual status — active + overdue payment
  },
  {
    id: 'inactive',
    label: 'Inativos',
    icon: 'userX',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-400/8',
    borderColor: 'border-zinc-400/20',
    statuses: ['inactive', 'cancelled'],
  },
]

// ============================================
// Helpers
// ============================================

function getPaymentBadge(status: string): { label: string; color: string } {
  switch (status) {
    case 'paid': return { label: 'Em dia', color: 'text-emerald-400 bg-emerald-400/10' }
    case 'pending': return { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10' }
    case 'overdue': return { label: 'Atrasado', color: 'text-red-400 bg-red-400/10' }
    default: return { label: 'Sem cobrança', color: 'text-zinc-400 bg-zinc-400/10' }
  }
}

function groupStudents(students: Student[]): Map<string, Student[]> {
  const groups = new Map<string, Student[]>()

  for (const col of COLUMNS) {
    groups.set(col.id, [])
  }

  for (const student of students) {
    // "At risk" = active but payment overdue
    if (student.status === 'active' && student.payment_status === 'overdue') {
      groups.get('at_risk')!.push(student)
      continue
    }

    // Find matching column
    const col = COLUMNS.find(c => c.statuses.includes(student.status))
    if (col) {
      groups.get(col.id)!.push(student)
    } else {
      // Default to inactive
      groups.get('inactive')!.push(student)
    }
  }

  return groups
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  if (diff < 7) return `${diff}d atrás`
  if (diff < 30) return `${Math.floor(diff / 7)}sem atrás`
  return `${Math.floor(diff / 30)}m atrás`
}

// ============================================
// Components
// ============================================

function StudentCard({ student }: { student: Student }) {
  const paymentBadge = getPaymentBadge(student.payment_status)

  return (
    <Link
      href={`/dashboard/students/${student.id}`}
      className="block glass-card rounded-xl p-3 hover:bg-white/6 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {student.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.profile_photo_url}
            alt={student.full_name}
            className="h-9 w-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-[11px] font-bold text-brand-primary">
            {getInitials(student.full_name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-text-primary truncate">
            {student.full_name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${paymentBadge.color}`}>
              {paymentBadge.label}
            </span>
            {student.current_streak > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400">
                <DSIcon name="flame" size={10} />
                {student.current_streak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
        <span>{student.total_workouts_completed} treinos</span>
        <span>{formatRelativeDate(student.created_at)}</span>
      </div>

      {/* Quick actions */}
      <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
        <a
          href={`https://wa.me/?text=Olá ${encodeURIComponent(student.full_name)}!`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-semibold text-emerald-400 hover:bg-emerald-400/10 transition-colors"
          title="WhatsApp"
        >
          <DSIcon name="messageCircle" size={10} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <Link
          href={`/dashboard/payments/create?student_id=${student.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-semibold text-amber-400 hover:bg-amber-400/10 transition-colors"
          title="Cobrar"
        >
          <DSIcon name="dollarSign" size={10} />
          <span className="hidden sm:inline">Cobrar</span>
        </Link>
        <Link
          href={`/dashboard/workouts/create?student_id=${student.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-semibold text-blue-400 hover:bg-blue-400/10 transition-colors"
          title="Treino"
        >
          <DSIcon name="dumbbell" size={10} />
          <span className="hidden sm:inline">Treino</span>
        </Link>
      </div>
    </Link>
  )
}

function PipelineColumnView({ column, students }: { column: PipelineColumn; students: Student[] }) {
  return (
    <div className={`flex flex-col rounded-2xl border ${column.borderColor} ${column.bgColor} min-h-64`}>
      {/* Column header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <DSIcon name={column.icon} size={14} className={column.color} />
          <span className="text-[12px] font-bold text-text-primary">{column.label}</span>
        </div>
        <span className={`text-[11px] font-bold ${column.color}`}>
          {students.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 p-2 pt-0">
        {students.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <p className="text-[11px] text-text-muted">Nenhum aluno</p>
          </div>
        )}
        {students.map(s => (
          <StudentCard key={s.id} student={s} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Page
// ============================================

export default function PipelinePage() {
  const { data, isLoading } = useStudents({ per_page: 200, sort: 'created_at', order: 'desc' })

  const grouped = useMemo(
    () => groupStudents(data?.students || []),
    [data?.students]
  )

  const totalStudents = data?.students?.length || 0

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">Pipeline</h1>
            <p className="text-[12px] text-text-muted">
              {totalStudents} aluno{totalStudents !== 1 ? 's' : ''} no funil
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/students/invite">
              <Button size="sm">
                <DSIcon name="userPlus" size={16} />
                Convidar Aluno
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
          </div>
        )}

        {/* Pipeline columns */}
        {!isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map(col => (
              <PipelineColumnView
                key={col.id}
                column={col}
                students={grouped.get(col.id) || []}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
