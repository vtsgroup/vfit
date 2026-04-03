/**
 * src/app/dashboard/admin/workouts/page.tsx
 *
 * Admin Workouts Page — TODOS os treinos da plataforma
 *
 * Exports: AdminWorkoutsPage
 * Hooks: useEffect, useState, useAuthStore, useAdminWorkouts, useAdminDeleteWorkout
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Workouts Page — TODOS os treinos da plataforma
// super_admin: pode deletar qualquer treino (hard delete)
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn, formatRelativeTime } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import { AdminWorkoutsPageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui/md3-input'
import { Modal } from '@/components/ui/modal'
import { useAuthStore } from '@/stores/auth-store'
import {
  useAdminWorkouts,
  useAdminDeleteWorkout,
  type AdminWorkout,
} from '@/hooks/use-admin'

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-success/10 text-success' },
  completed: { label: 'Concluído', color: 'bg-info/10 text-info' },
  paused: { label: 'Pausado', color: 'bg-warning/10 text-warning' },
  archived: { label: 'Arquivado', color: 'bg-text-muted/10 text-text-muted' },
}

export default function AdminWorkoutsPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const isSA = isSuperAdmin()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<AdminWorkout | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    if (!deleteConfirm) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setDeleteConfirm(null)
      setDeleteInput('')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteConfirm])

  const { data, isLoading } = useAdminWorkouts({
    page,
    per_page: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  })
  const deleteWorkout = useAdminDeleteWorkout()

  const workouts = data?.workouts ?? []
  const meta = data?.meta

  function doSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  function handleDelete() {
    if (!deleteConfirm || deleteInput !== 'DELETE') return
    deleteWorkout.mutate(deleteConfirm.id, {
      onSuccess: () => { setDeleteConfirm(null); setDeleteInput('') },
    })
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="dumbbell" className="text-brand-primary" />
            <p className="text-sm text-text-muted">
              {meta?.total ?? 0} treino{(meta?.total ?? 0) !== 1 ? 's' : ''} na plataforma
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48">
            <MD3Input
              label="Buscar treino"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Buscar por treino, personal ou aluno..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>
          <Button variant="outline" size="sm" onClick={doSearch}>Buscar</Button>
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
        </div>

        {/* Workout list */}
        {isLoading ? (
          <AdminWorkoutsPageSkeleton />
        ) : workouts.length === 0 ? (
          <EmptyStateDS icon="dumbbell" title="Nenhum treino" description="Nenhum resultado encontrado." />
        ) : (
          <div className="space-y-2">
            {workouts.map((workout) => {
              const statusConf = statusConfig[workout.status] || statusConfig.active
              return (
                <div key={workout.id} className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4">
                  {/* Icon */}
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    workout.is_template ? 'bg-purple-500/10' : workout.ai_generated ? 'bg-brand-accent/10' : 'bg-brand-primary/10'
                  )}>
                    {workout.is_template ? (
                      <DSIcon name="shoppingBag" className="text-purple-400" />
                    ) : workout.ai_generated ? (
                      <DSIcon name="sparkles" className="text-brand-accent" />
                    ) : (
                      <DSIcon name="dumbbell" className="text-brand-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-text-primary">{workout.name}</p>
                      <Badge className={cn('text-[10px]', statusConf.color)}>{statusConf.label}</Badge>
                      {workout.is_template && (
                        <Badge className="text-[10px] bg-purple-500/10 text-purple-400">Template</Badge>
                      )}
                      {workout.ai_generated && (
                        <Badge className="text-[10px] bg-info/10 text-info">IA</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <DSIcon name="user" size={12} />
                        Personal: <strong className="text-text-primary">{workout.personal_name}</strong>
                      </span>
                      <span>·</span>
                      {workout.student_name ? (
                        <span>Aluno: <strong className="text-text-primary">{workout.student_name}</strong></span>
                      ) : (
                        <span className="text-purple-400">Marketplace</span>
                      )}
                      <span>·</span>
                      <span>{workout.exercise_count} exercício{workout.exercise_count !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <DSIcon name="calendar" size={12} />
                        {formatRelativeTime(workout.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Delete action */}
                  {isSA && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Deletar permanentemente"
                      onClick={() => setDeleteConfirm(workout)}
                    >
                      <DSIcon name="trash2" size={16} className="text-error" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && <Pagination page={page} totalPages={meta.total_pages} total={meta.total} itemLabel="treinos" onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}

        {/* Hard Delete Confirm Modal */}
        {deleteConfirm && isSA && (
          <Modal title="Deletar Treino" onClose={() => { setDeleteConfirm(null); setDeleteInput('') }}>
              <div className="space-y-4">
                <div className="rounded-xl bg-error/10 border border-error/20 p-3">
                  <div className="flex items-start gap-2">
                    <DSIcon name="alertTriangle" className="text-error shrink-0 mt-0.5" />
                    <div className="text-sm text-error">
                      <p className="font-semibold">AÇÃO IRREVERSÍVEL</p>
                      <p className="mt-1">
                        Treino: <strong>{deleteConfirm.name}</strong>
                      </p>
                      <p className="mt-0.5">
                        Personal: {deleteConfirm.personal_name} ({deleteConfirm.personal_email})
                      </p>
                      {deleteConfirm.student_name && (
                        <p className="mt-0.5">
                          Aluno: {deleteConfirm.student_name}
                        </p>
                      )}
                      <p className="mt-1">
                        Isso irá deletar permanentemente o treino, todos os exercícios e
                        todo o histórico de execuções. <strong>Não há como desfazer.</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <MD3Input
                  label='Digite "DELETE" para confirmar'
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  error={deleteInput && deleteInput !== 'DELETE' ? 'Digite DELETE exatamente' : undefined}
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteInput('') }}>Cancelar</Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleteWorkout.isPending}
                    disabled={deleteInput !== 'DELETE'}
                  >
                    <DSIcon name="trash2" size={16} className="mr-1.5" />Deletar Permanentemente
                  </Button>
                </div>
              </div>
          </Modal>
        )}
      </div>
    </AuthGuard>
  )
}
