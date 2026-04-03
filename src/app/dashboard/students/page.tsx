/**
 * src/app/dashboard/students/page.tsx
 *
 * Students List Page — /dashboard/students
 *
 * Exports: StudentsPage
 * Hooks: useState, useRouter, useDebounce, useStudents, useAdminStudents, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Students List Page — /dashboard/students
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn, formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { useStudents, type Student, type StudentListParams } from '@/hooks/use-students'
import { useAdminStudents, type AdminStudent } from '@/hooks/use-admin'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { MD3SearchBar } from '@/components/ui/md3-input'
import { GlassCard } from '@/components/ui/glass-card'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'info'; icon: DSIconName }> = {
  active: { label: 'Ativo', variant: 'success', icon: 'shieldCheck' },
  inactive: { label: 'Inativo', variant: 'default', icon: 'shieldOff' },
  pending: { label: 'Convidado', variant: 'warning', icon: 'clock' },
  blocked: { label: 'Bloqueado', variant: 'error', icon: 'shieldBan' },
}

const paymentConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Atrasado', variant: 'error' },
  free: { label: 'Free', variant: 'default' },
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'invited'>('active')
  const router = useRouter()

  const { hasAdminCapabilities, isSimulationActive } = useEffectiveUserView()
  const isPrivileged = hasAdminCapabilities && !isSimulationActive

  const debouncedSearch = useDebounce(search, 400)

  const params: StudentListParams = {
    page,
    per_page: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    payment_status: paymentFilter || undefined,
    sort: 'created_at',
    order: 'desc',
  }

  const studentsQuery = useStudents(params)
  const adminStudentsQuery = useAdminStudents({ page, search: debouncedSearch || undefined })

  const activeQuery = isPrivileged ? adminStudentsQuery : studentsQuery
  const meta = activeQuery.data?.meta

  const students: Student[] = isPrivileged
    ? []
    : (studentsQuery.data?.students ?? [])

  const adminStudents: AdminStudent[] = isPrivileged
    ? (adminStudentsQuery.data?.students ?? [])
    : []

  // Separate students by tab
  const activeStudents = students.filter((s) => s.status === 'active' || s.status === 'inactive' || s.status === 'blocked')
  const invitedStudents = students.filter((s) => s.status === 'pending')
  const filteredStudents = activeTab === 'active' ? activeStudents : invitedStudents

  // Admin: same separation
  const activeAdminStudents = adminStudents.filter((s) => s.status === 'active' || s.status === 'inactive' || s.status === 'blocked')
  const invitedAdminStudents = adminStudents.filter((s) => s.status === 'pending')
  const filteredAdminStudents = activeTab === 'active' ? activeAdminStudents : invitedAdminStudents

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title="Alunos"
          icon="users"
          description={
            meta
              ? `${meta.total} aluno${meta.total !== 1 ? 's' : ''} encontrado${meta.total !== 1 ? 's' : ''}`
              : activeQuery.isFetching
                ? 'Atualizando...'
                : <span className="inline-block h-3.5 w-32 animate-pulse rounded bg-black/8 dark:bg-white/8" />
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/students/invite">
                <Button className="group/btn min-h-11">
                  <motion.span whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <DSIcon name="userPlus" size={16} className="shrink-0 transition-transform group-hover/btn:scale-110" />
                  </motion.span>
                  Convidar Aluno
                </Button>
              </Link>
              <Link href="/dashboard/students/invite?mode=manual">
                <Button variant="outline" className="group/btn min-h-11">
                  <motion.span whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <DSIcon name="userPlus" size={16} className="shrink-0" />
                  </motion.span>
                  Novo Aluno
                </Button>
              </Link>
            </div>
          }
        />
        {isPrivileged && (
          <p className="text-xs text-text-muted -mt-4">
            Super Admin: exibindo todos os alunos (todas as contas).
          </p>
        )}

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <MD3SearchBar
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              onClear={() => { setSearch(''); setPage(1) }}
              className="flex-1"
            />
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="icon"
              className="relative min-h-11 min-w-11"
              onClick={() => setShowFilters(!showFilters)}
            >
              <DSIcon name="filter" size={16} />
              {(statusFilter || paymentFilter) && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-primary shadow-[0_0_6px_rgba(16,185,129,0.5)] ring-2 ring-bg-page" />
              )}
            </Button>
          </div>

          {showFilters && !isPrivileged && (
            <GlassCard variant="surface" padding="sm">
              <div className="flex flex-wrap gap-2">
              <StyledSelect
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1) }}
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'active', label: 'Ativos' },
                  { value: 'inactive', label: 'Inativos' },
                  { value: 'pending', label: 'Pendentes' },
                  { value: 'blocked', label: 'Bloqueados' },
                ]}
                compact
              />
              <StyledSelect
                value={paymentFilter}
                onChange={(v) => { setPaymentFilter(v); setPage(1) }}
                options={[
                  { value: '', label: 'Todos pagamentos' },
                  { value: 'paid', label: 'Pago' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'overdue', label: 'Atrasado' },
                  { value: 'free', label: 'Free' },
                ]}
                compact
              />
              {(statusFilter || paymentFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStatusFilter(''); setPaymentFilter(''); setPage(1) }}
                >
                  Limpar filtros
                </Button>
              )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Tabs: Ativos / Convidados — DS v3 SlidingTabs */}
        {!isPrivileged ? (
          <SlidingTabs
            tabs={[
              { key: 'active', label: 'Ativos', count: activeStudents.length },
              { key: 'invited', label: 'Convidados', count: invitedStudents.length },
            ]}
            activeTab={activeTab}
            onChange={(key) => { setActiveTab(key as 'active' | 'invited'); setPage(1) }}
          />
        ) : (
          <SlidingTabs
            tabs={[
              { key: 'active', label: 'Ativos', count: activeAdminStudents.length },
              { key: 'invited', label: 'Convidados', count: invitedAdminStudents.length },
            ]}
            activeTab={activeTab}
            onChange={(key) => { setActiveTab(key as 'active' | 'invited'); setPage(1) }}
          />
        )}

        {/* Student List */}
        {activeQuery.isFetching && (isPrivileged ? filteredAdminStudents.length > 0 : filteredStudents.length > 0) && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <DSIcon name="loader" size={14} className="animate-spin" />
            Atualizando lista...
          </div>
        )}

        {activeQuery.isLoading && (isPrivileged ? filteredAdminStudents.length === 0 : filteredStudents.length === 0) ? (
          <StudentListSkeleton />
        ) : activeQuery.isError && (isPrivileged ? filteredAdminStudents.length === 0 : filteredStudents.length === 0) ? (
          <EmptyState
            illustration="search"
            title="Erro ao carregar alunos"
            description={activeQuery.error instanceof Error ? activeQuery.error.message : 'Não foi possível carregar a lista agora.'}
            actionLabel="Tentar novamente"
            onAction={() => void activeQuery.refetch()}
          />
        ) : (isPrivileged ? filteredAdminStudents.length === 0 : filteredStudents.length === 0) ? (
          <EmptyState
            illustration={search || statusFilter || paymentFilter ? 'search' : 'students'}
            title={activeTab === 'invited' ? 'Nenhum convite pendente' : 'Nenhum aluno encontrado'}
            description={activeTab === 'invited'
              ? 'Quando você convidar um aluno, ele aparecerá aqui até aceitar.'
              : search || statusFilter || paymentFilter
                ? 'Tente ajustar os filtros de busca.'
                : 'Convide seu primeiro aluno para começar!'}
            actionLabel={!search && !statusFilter && !paymentFilter && activeTab !== 'invited' ? 'Convidar Aluno' : undefined}
            onAction={!search && !statusFilter && !paymentFilter && activeTab !== 'invited' ? () => router.push('/dashboard/students/invite') : undefined}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
              {isPrivileged
                ? filteredAdminStudents.map((student, idx) => (
                  <AdminStudentCard key={student.id} student={student} index={idx} />
                ))
                : filteredStudents.map((student, idx) => (
                  <StudentCard key={student.id} student={student} index={idx} />
                ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Página {meta.page} de {meta.total_pages}
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 flex-1 sm:flex-none"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                <DSIcon name="chevronLeft" size={16} />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 flex-1 sm:flex-none"
                disabled={meta.page >= meta.total_pages}
                onClick={() => setPage(meta.page + 1)}
              >
                Próxima
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
// Student Card
// ============================================

function StudentCard({ student, index = 0 }: { student: Student; index?: number }) {
  const status = statusConfig[student.status] || statusConfig.pending
  const payment = paymentConfig[student.payment_status] || paymentConfig.pending

  // Presence dot based on status + activity
  const presenceColor = (() => {
    if (student.status === 'active' && student.current_streak > 0) return 'bg-success shadow-[0_0_6px_rgba(16,185,129,0.5)]'
    if (student.status === 'active') return 'bg-success'
    if (student.status === 'pending') return 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]'
    return 'bg-text-muted'
  })()

  return (
    <GlassCard
      variant="surface"
      hover
      padding="none"
      style={{ animation: `fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 70}ms both` }}
    >
      <Link
        href={`/dashboard/students/view?id=${student.id}`}
        className="group flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        {/* Avatar with gradient */}
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-500/70 text-base font-bold text-white overflow-hidden">
            {student.profile_photo_url ? (
              <Image
                src={student.profile_photo_url}
                alt={student.full_name}
                fill
                sizes="44px"
                unoptimized
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>
                {(student.full_name || '?')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            )}
          </div>
          {/* Presence dot */}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-bg-secondary transition-colors',
              presenceColor
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-text-primary truncate">{student.full_name}</span>
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                status.variant === 'success' && 'bg-success/10 text-success ring-success/20',
                status.variant === 'warning' && 'bg-warning/10 text-warning ring-warning/20',
                status.variant === 'error' && 'bg-error/10 text-error ring-error/20',
                status.variant === 'default' && 'bg-black/6 dark:bg-white/6 text-text-muted ring-border-light',
              )}
            >
              <DSIcon name={status.icon} size={10} />
              {status.label}
            </motion.span>
            {student.student_type === 'consultoria' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 ring-1 ring-inset ring-purple-500/20">
                Consultoria
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-text-muted truncate">{student.email}</p>
          {student.student_type === 'consultoria' && student.consultation_price && (
            <p className="text-[10px] text-purple-400">
              R$ {Number(student.consultation_price).toFixed(2).replace('.', ',')} / {
                student.consultation_billing_cycle === 'MONTHLY' ? 'mês' :
                student.consultation_billing_cycle === 'QUARTERLY' ? 'trimestre' :
                student.consultation_billing_cycle === 'SEMIANNUALLY' ? 'semestre' : 'ano'
              }
            </p>
          )}
        </div>

        {/* Stats (desktop) */}
        <div className="hidden items-center gap-4 text-xs text-text-muted md:flex">
          <div className="flex items-center gap-1" title="Treinos">
            <DSIcon name="dumbbell" size={14} />
            <span>{student.total_workouts_completed}</span>
          </div>
          <div className="flex items-center gap-1" title="Streak">
            <DSIcon name="flame" size={14} />
            <span>{student.current_streak}d</span>
          </div>
          <div className="flex items-center gap-1" title="Badges">
            <DSIcon name="trophy" size={14} />
            <span>{student.total_badges}</span>
          </div>
        </div>

        {/* Payment + Date */}
        <div className="hidden shrink-0 text-right sm:block">
          <span className={cn(
            'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
            payment.variant === 'success' && 'bg-success/10 text-success ring-success/20',
            payment.variant === 'warning' && 'bg-warning/10 text-warning ring-warning/20',
            payment.variant === 'error' && 'bg-error/10 text-error ring-error/20',
            payment.variant === 'default' && 'bg-black/6 dark:bg-white/6 text-text-muted ring-border-light',
          )}>
            {payment.label}
          </span>
          <p className="mt-1 text-[10px] text-text-muted">{formatRelativeTime(student.created_at)}</p>
        </div>

        <DSIcon name="chevronRight" size={16} className="hidden shrink-0 text-text-muted/70 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
      </Link>
    </GlassCard>
  )
}

// ============================================
// Student List Skeleton — Dedicated shimmer
// ============================================

function StudentListSkeleton() {
  return (
    <GlassCard variant="surface" padding="none">
      <div className="divide-y divide-border-light">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            {/* Avatar skeleton with ring */}
            <div className="relative shrink-0">
              <div className="h-11 w-11 animate-pulse rounded-full bg-black/6 dark:bg-white/6 ring-2 ring-border-light" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full bg-black/8 dark:bg-white/8 border-2 border-bg-secondary" />
            </div>
            {/* Info skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-black/6 dark:bg-white/6" />
                <div className="h-4 w-14 animate-pulse rounded-md bg-black/4 dark:bg-white/4" />
              </div>
              <div className="h-3 w-44 animate-pulse rounded bg-black/4 dark:bg-white/4" />
            </div>
            {/* Stats skeleton (desktop) */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="h-4 w-8 animate-pulse rounded bg-black/4 dark:bg-white/4" />
              <div className="h-4 w-8 animate-pulse rounded bg-black/4 dark:bg-white/4" />
              <div className="h-4 w-8 animate-pulse rounded bg-black/4 dark:bg-white/4" />
            </div>
            {/* Payment skeleton */}
            <div className="hidden shrink-0 text-right sm:block space-y-1.5">
              <div className="h-4 w-14 animate-pulse rounded-md bg-black/4 dark:bg-white/4 ml-auto" />
              <div className="h-3 w-20 animate-pulse rounded bg-bg-secondary ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}// ============================================
// Admin Student Card (super_admin/admin)
// ============================================

function AdminStudentCard({ student, index = 0 }: { student: AdminStudent; index?: number }) {
  const status = statusConfig[student.status] || statusConfig.pending

  return (
    <GlassCard
      variant="surface"
      hover
      padding="none"
      style={{ animation: `fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 70}ms both` }}
    >
      <Link
        href={`/dashboard/students/view?id=${student.id}`}
        className="group flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-500/70 text-base font-bold text-white">
            <span>
              {(student.student_name || '?')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-bg-secondary',
              student.status === 'active' ? 'bg-success shadow-[0_0_6px_rgba(16,185,129,0.5)]' : student.status === 'pending' ? 'bg-warning' : 'bg-text-muted'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-text-primary truncate">{student.student_name}</span>
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                status.variant === 'success' && 'bg-success/10 text-success ring-success/20',
                status.variant === 'warning' && 'bg-warning/10 text-warning ring-warning/20',
                status.variant === 'error' && 'bg-error/10 text-error ring-error/20',
                status.variant === 'default' && 'bg-black/6 dark:bg-white/6 text-text-muted ring-border-light',
              )}
            >
              <DSIcon name={status.icon} size={10} />
              {status.label}
            </motion.span>
            {student.student_type === 'consultoria' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 ring-1 ring-inset ring-purple-500/20">
                Consultoria
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-text-muted truncate">
            {student.student_email} · Personal: {student.personal_name || '—'}
          </p>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="mt-1 text-[10px] text-text-muted">{formatRelativeTime(student.created_at)}</p>
        </div>

        <DSIcon name="chevronRight" size={16} className="hidden shrink-0 text-text-muted/70 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
      </Link>
    </GlassCard>
  )
}
