/**
 * src/app/dashboard/workouts/page.tsx
 *
 * Workouts List Page — /dashboard/workouts
 *
 * Exports: WorkoutsPage
 * Hooks: useState, useRef, useRouter, useDebounce, useWorkouts, useMyWorkouts
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Workouts List Page — /dashboard/workouts
// Dual view: Personal (CRUD) + Student (read-only)
// ============================================

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { useWorkouts, useMyWorkouts, useImportWorkout, type WorkoutListItem, type WorkoutListParams, type MyWorkoutListItem } from '@/hooks/use-workouts'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { StaggeredList } from '@/components/ui/staggered-list'
import { StyledSelect } from '@/components/ui/styled-select'
import { PageHeader } from '@/components/ui/page-header'
import { MD3SearchBar } from '@/components/ui/md3-input'
import { GlassCard } from '@/components/ui/glass-card'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { motion } from 'framer-motion'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
  active: { label: 'Ativo', variant: 'success' },
  completed: { label: 'Concluído', variant: 'info' },
  paused: { label: 'Pausado', variant: 'warning' },
  archived: { label: 'Arquivado', variant: 'default' },
}

export default function WorkoutsPage() {
  const { isPersonalView, isStudentView } = useEffectiveUserView()

  return isStudentView ? <StudentWorkoutsView /> : <PersonalWorkoutsView />
}

// ============================================
// Student Workouts View — Meus Treinos
// ============================================

function StudentWorkoutsView() {
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data, isLoading, isError, refetch } = useMyWorkouts({ page, per_page: 20 })
  const workouts = data?.workouts ?? []
  const meta = data?.meta

  return (
    <AuthGuard>
      <div className="space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title="Meus Treinos"
          icon="dumbbell"
          description={
            meta ? `${meta.total} treino${meta.total !== 1 ? 's' : ''} atribuído${meta.total !== 1 ? 's' : ''}` : <span className="inline-block h-3.5 w-36 animate-pulse rounded bg-black/8 dark:bg-white/8" />
          }
        />

        {/* Workouts List */}
        {isLoading ? (
          <WorkoutListSkeleton count={4} />
        ) : isError ? (
          <EmptyState
            illustration="workouts"
            title="Erro ao carregar treinos"
            description="Não foi possível carregar seus treinos. Tente novamente."
            actionLabel="Tentar Novamente"
            onAction={() => refetch()}
          />
        ) : workouts.length === 0 ? (
          <EmptyState
            illustration="workouts"
            title="Nenhum treino atribuído"
            description="Quando seu personal criar um treino para você, ele aparecerá aqui. Aguarde!"  
          />
        ) : (
          <StaggeredList className="space-y-2">
            {workouts.map((workout) => (
              <StudentWorkoutCard key={workout.id} workout={workout} />
            ))}
          </StaggeredList>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Página {meta.page} de {meta.total_pages}
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="outline" size="sm" className="min-h-11 flex-1 sm:flex-none" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
                <DSIcon name="chevronLeft" size={16} /> Anterior
              </Button>
              <Button variant="outline" size="sm" className="min-h-11 flex-1 sm:flex-none" disabled={meta.page >= meta.total_pages} onClick={() => setPage(meta.page + 1)}>
                Próxima <DSIcon name="chevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Student Workout Card
// ============================================

function StudentWorkoutCard({ workout }: { workout: MyWorkoutListItem }) {
  const status = statusConfig[workout.status] || statusConfig.active

  return (
    <Link
      href={`/dashboard/workouts/view?id=${workout.id}`}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border-light bg-bg-primary p-4 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-md hover:-translate-y-0.5 sm:gap-4',
        workout.status === 'active' && 'border-l-4 border-l-emerald-500',
        workout.status === 'completed' && 'border-l-4 border-l-violet-500',
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
        workout.ai_generated ? 'bg-brand-accent/10' : 'bg-brand-primary/10'
      )}>
        {workout.ai_generated ? (
          <DSIcon name="sparkles" size={20} className="text-brand-accent" />
        ) : (
          <DSIcon name="dumbbell" size={20} className="text-brand-primary" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-text-primary">{workout.name}</p>
          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <DSIcon name="dumbbell" size={12} />
            {workout.exercise_count} exercício{workout.exercise_count !== 1 ? 's' : ''}
          </span>
          {workout.times_completed > 0 && (
            <span className="flex items-center gap-1">
              <DSIcon name="checkCircle" size={12} className="text-brand-primary" />
              {workout.times_completed}× concluído
            </span>
          )}
          {workout.personal_name && (
            <span className="hidden items-center gap-1 sm:flex">
              <DSIcon name="user" size={12} />
              {workout.personal_name}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="hidden shrink-0 sm:block">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
          <DSIcon name="play" size={16} className="text-brand-primary" />
        </div>
      </div>
    </Link>
  )
}

// ============================================
// Personal Workouts View
// ============================================

function PersonalWorkoutsView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [templateFilter, setTemplateFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const debouncedSearch = useDebounce(search, 400)

  const params: WorkoutListParams = {
    page,
    per_page: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    is_template: templateFilter === 'true' ? true : templateFilter === 'false' ? false : undefined,
    sort: 'created_at',
    order: 'desc',
  }

  const { data, isLoading, isError, error, refetch } = useWorkouts(params)
  const importWorkout = useImportWorkout()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workouts = data?.workouts ?? []
  const meta = data?.meta

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      importWorkout.mutate(file)
      // Reset input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title="Treinos"
          icon="dumbbell"
          description={
            meta ? `${meta.total} treino${meta.total !== 1 ? 's' : ''} encontrado${meta.total !== 1 ? 's' : ''}` : <span className="inline-block h-3.5 w-36 animate-pulse rounded bg-black/8 dark:bg-white/8" />
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                loading={importWorkout.isPending}
                className="min-h-11"
              >
                <DSIcon name="upload" size={16} />
                Importar
              </Button>
              <Link href="/dashboard/workouts/create">
                <Button variant="workout" className="min-h-11">
                  <DSIcon name="plus" size={16} />
                  Criar Treino
                </Button>
              </Link>
            </div>
          }
        />

        {/* Quick Actions — 3D style cards with floating icons */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/workouts/exercises/create"
            className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/15 to-emerald-600/5 px-4 py-4 text-sm font-bold text-text-primary shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:shadow-[0_6px_24px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_8px_rgba(16,185,129,0.1)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(16,185,129,0.2)] animate-[float_3s_ease-in-out_infinite]">
              <DSIcon name="plus" size={20} className="text-emerald-400" />
            </div>
            <span className="leading-tight">Crie seu<br className="sm:hidden" /> Exercício</span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent" />
          </Link>

          <Link
            href="/dashboard/workouts/exercises/library"
            className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-blue-500/30 bg-linear-to-r from-blue-500/15 to-blue-600/5 px-4 py-4 text-sm font-bold text-text-primary shadow-[0_4px_16px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:shadow-[0_6px_24px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(59,130,246,0.2)] animate-[float_3s_ease-in-out_0.5s_infinite]">
              <DSIcon name="bookOpen" size={20} className="text-blue-400" />
            </div>
            <span className="leading-tight">Biblioteca de<br className="sm:hidden" /> exercícios</span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent" />
          </Link>

          <Link
            href="/dashboard/workouts/media/library"
            className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-purple-500/30 bg-linear-to-r from-purple-500/15 to-purple-600/5 px-4 py-4 text-sm font-bold text-text-primary shadow-[0_4px_16px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:shadow-[0_6px_24px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_8px_rgba(168,85,247,0.1)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(168,85,247,0.2)] animate-[float_3s_ease-in-out_1s_infinite]">
              <DSIcon name="image" size={20} className="text-purple-400" />
            </div>
            <span className="leading-tight">Biblioteca de<br className="sm:hidden" /> mídias</span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/5 to-transparent" />
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <MD3SearchBar
              placeholder="Buscar por nome ou aluno..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              onClear={() => { setSearch(''); setPage(1) }}
              className="flex-1"
            />
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="icon"
              className="min-h-11 min-w-11"
              onClick={() => setShowFilters(!showFilters)}
            >
              <DSIcon name="filter" size={16} />
            </Button>
          </div>

          {showFilters && (
            <GlassCard variant="surface" padding="md">
              <div className="flex flex-wrap gap-3">
              <StyledSelect
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1) }}
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'active', label: 'Ativos' },
                  { value: 'completed', label: 'Concluídos' },
                  { value: 'paused', label: 'Pausados' },
                  { value: 'archived', label: 'Arquivados' },
                ]}
                compact
              />
              <StyledSelect
                value={templateFilter}
                onChange={(v) => { setTemplateFilter(v); setPage(1) }}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'false', label: 'Para Alunos' },
                  { value: 'true', label: 'Templates Marketplace' },
                ]}
                compact
              />
              {(statusFilter || templateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStatusFilter(''); setTemplateFilter(''); setPage(1) }}
                >
                  Limpar filtros
                </Button>
              )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Workouts List */}
        {isLoading ? (
          <WorkoutListSkeleton count={5} />
        ) : isError ? (
          <EmptyState
            illustration="workouts"
            title="Erro ao carregar treinos"
            description={error?.message || 'Não foi possível carregar seus treinos. Tente novamente.'}
            actionLabel="Tentar Novamente"
            onAction={() => refetch()}
          />
        ) : workouts.length === 0 ? (
          <EmptyState
            illustration="workouts"
            title="Nenhum treino encontrado"
            description={search || statusFilter || templateFilter
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie o primeiro treino para um aluno!'}
            actionLabel={!search && !statusFilter && !templateFilter ? 'Criar Treino' : undefined}
            onAction={!search && !statusFilter && !templateFilter ? () => router.push('/dashboard/workouts/create') : undefined}
          />
        ) : (
          <StaggeredList className="space-y-2">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </StaggeredList>
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
// Workout Card
// ============================================

function WorkoutCard({ workout }: { workout: WorkoutListItem }) {
  const status = statusConfig[workout.status] || statusConfig.active

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
    <GlassCard variant="surface" padding="none" hover>
    <Link
      href={`/dashboard/workouts/view?id=${workout.id}`}
      className={cn(
        'flex items-center gap-3 p-4 transition-all duration-200 sm:gap-4',
        workout.status === 'active' && 'border-l-4 border-l-emerald-500',
        workout.status === 'completed' && 'border-l-4 border-l-violet-500',
        workout.is_template && 'border-l-4 border-l-purple-500',
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
        workout.is_template ? 'bg-purple-500/10' : workout.ai_generated ? 'bg-brand-accent/10' : 'bg-brand-primary/10'
      )}>
        {workout.is_template ? (
          <DSIcon name="shoppingBag" size={20} className="text-purple-400" />
        ) : workout.ai_generated ? (
          <DSIcon name="sparkles" size={20} className="text-brand-accent" />
        ) : (
          <DSIcon name="dumbbell" size={20} className="text-brand-primary" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-text-primary truncate">{workout.name}</p>
          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
          {workout.is_template && (
            <Badge variant="default" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">Template</Badge>
          )}
          {workout.ai_generated && (
            <Badge variant="info" className="text-[10px]">IA</Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
          {workout.is_template ? (
            <span className="flex items-center gap-1">
              <DSIcon name="shoppingBag" size={12} />
              Marketplace
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <DSIcon name="user" size={12} />
              {workout.student_name || 'Sem aluno'}
            </span>
          )}
          <span className="flex items-center gap-1">
            <DSIcon name="dumbbell" size={12} />
            {workout.exercise_count} exercício{workout.exercise_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Date info (desktop) */}
      <div className="hidden shrink-0 text-right sm:block">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <DSIcon name="calendar" size={12} />
          <span>{new Date(workout.start_date).toLocaleDateString('pt-BR')}</span>
        </div>
        <p className="mt-1 text-[10px] text-text-muted">{formatRelativeTime(workout.created_at)}</p>
      </div>
    </Link>
    </GlassCard>
    </motion.div>
  )
}

// ============================================
// Workout List Skeleton
// ============================================

function WorkoutListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard
          key={i}
          variant="surface"
          padding="md"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon skeleton */}
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-brand-primary/10" />
          {/* Info skeleton */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-36 animate-pulse rounded bg-black/8 dark:bg-white/8" />
              <div className="h-4 w-14 animate-pulse rounded-full bg-black/8 dark:bg-white/8" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-20 animate-pulse rounded bg-black/6 dark:bg-white/6" />
              <div className="h-3 w-24 animate-pulse rounded bg-black/6 dark:bg-white/6" />
            </div>
          </div>
          {/* Date skeleton (desktop) */}
          <div className="hidden shrink-0 space-y-1.5 sm:block">
            <div className="h-3 w-20 animate-pulse rounded bg-black/6 dark:bg-white/6" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          </div>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
