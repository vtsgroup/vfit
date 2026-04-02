/**
 * src/app/dashboard/admin/personals/page.tsx
 *
 * Admin Personals Page — Gerenciamento de Personal Trainers
 *
 * Exports: AdminPersonalsPage
 * Hooks: useEffect, useState, useAuthStore, useScrollLock, useAdminPersonals, useUpdateAdminPersonal
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Personals Page — Gerenciamento de Personal Trainers
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn, formatCurrency } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { AdminPersonalsPageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui/md3-input'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import {
  useAdminPersonals,
  useUpdateAdminPersonal,
  useDeleteAdminUser,
  type AdminPersonal,
} from '@/hooks/use-admin'

const planLabels: Record<string, { label: string; color: string }> = {
  trial: { label: 'Grátis', color: 'bg-zinc-500/10 text-zinc-400' },
  free: { label: 'Grátis', color: 'bg-zinc-500/10 text-zinc-400' },
  pro: { label: 'Pro', color: 'bg-brand-primary/10 text-brand-primary' },
  profissional: { label: 'Pro+', color: 'bg-violet-500/10 text-violet-400' },
  max: { label: 'Max', color: 'bg-amber-500/10 text-amber-400' },
}

export default function AdminPersonalsPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const currentUserId = useAuthStore((s) => s.user?.id)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [planFilter, setPlanFilter] = useState('')
  const [editingPersonal, setEditingPersonal] = useState<AdminPersonal | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminPersonal | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  // Lock body scroll when modal is open
  useScrollLock(!!editingPersonal || !!deleteConfirm)

  useEffect(() => {
    if (!editingPersonal && !deleteConfirm) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()

      if (editingPersonal) {
        setEditingPersonal(null)
        return
      }

      if (deleteConfirm) {
        setDeleteConfirm(null)
        setDeleteInput('')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingPersonal, deleteConfirm])

  const { data, isLoading, refetch } = useAdminPersonals({
    page,
    per_page: 20,
    search: search || undefined,
    plan_type: planFilter || undefined,
  })
  const updatePersonal = useUpdateAdminPersonal()
  const deleteUser = useDeleteAdminUser()

  const isSA = isSuperAdmin()

  function handleDelete() {
    if (!deleteConfirm) return
    const userId = deleteConfirm.id || deleteConfirm.personal_id
    deleteUser.mutate(userId, {
      onSuccess: () => { setDeleteConfirm(null); setDeleteInput('') },
    })
  }

  const personals = data?.personals ?? []
  const meta = data?.meta

  const [editForm, setEditForm] = useState<Record<string, string>>({})

  function openEdit(p: AdminPersonal) {
    setEditingPersonal(p)
    setEditForm({
      full_name: p.full_name,
      email: p.email,
      cref: p.cref || '',
      specialties: p.specialties || '',
      plan_type: p.plan_type || 'trial',
      monthly_price: p.monthly_price?.toString() || '0',
      max_students: p.max_students?.toString() || '10',
    })
  }

  function saveEdit() {
    if (!editingPersonal) return
    updatePersonal.mutate(
      {
        id: editingPersonal.personal_id || editingPersonal.id,
        data: {
          full_name: editForm.full_name,
          cref: editForm.cref,
          specialties: editForm.specialties,
          plan_type: editForm.plan_type,
          monthly_price: parseFloat(editForm.monthly_price) || 0,
          max_students: parseInt(editForm.max_students) || 10,
        },
      },
      { onSuccess: () => setEditingPersonal(null) }
    )
  }

  function doSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6 overflow-x-hidden">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Personal Trainers</h2>
          <p className="mt-1 text-sm text-text-muted">
            {meta?.total ?? 0} personal{(meta?.total ?? 0) !== 1 ? 's' : ''} na plataforma
          </p>
        </div>

        {/* Filters — DS v3 glass morphism */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1 sm:min-w-48">
            <MD3Input
              label="Buscar personal"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Buscar por nome ou email..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>
          <Button size="sm" onClick={doSearch}>
            <DSIcon name="search" size={14} />
            Buscar
          </Button>
          <StyledSelect
            value={planFilter}
            onChange={(v) => { setPlanFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todos os planos' },
              { value: 'trial', label: 'Trial' },
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'max', label: 'Max' },
            ]}
            compact
          />
        </div>

        {/* Personal list */}
        {isLoading ? (
          <AdminPersonalsPageSkeleton />
        ) : personals.length === 0 ? (
          <EmptyStateDS icon="users" title="Nenhum personal" description="Nenhum resultado encontrado." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {personals.map((p, idx) => {
              const plan = planLabels[p.plan_type] || planLabels.trial
              return (
                <div
                  key={p.personal_id}
                  className="rounded-2xl border border-border-light bg-bg-primary p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-2 overflow-hidden"
                  style={{ animation: `fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 70}ms both` }}
                >
                  {/* Top: name + plan */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-blue-500/70 text-base font-bold text-white">
                        {p.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-text-primary">{p.full_name}</p>
                        <p className="truncate text-[13px] text-text-muted">{p.email}</p>
                      </div>
                    </div>
                    <Badge className={cn('shrink-0', plan.color)}>{plan.label}</Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <DSIcon name="users" size={14} className="text-text-muted" />
                      <span>{p.student_count ?? 0} aluno{(p.student_count ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <DSIcon name="creditCard" size={14} className="text-text-muted" />
                      <span>{formatCurrency(p.monthly_price ?? 0)}/mês</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <DSIcon name="trendingUp" size={14} className="text-text-muted" />
                      <span>{formatCurrency(p.total_revenue ?? 0)} recv</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <DSIcon name="calendar" size={14} className="text-text-muted" />
                      <span>{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {p.cref && (
                    <p className="mb-3 text-xs text-text-muted">CREF: {p.cref}</p>
                  )}

                  {p.specialties && (Array.isArray(p.specialties) ? p.specialties : typeof p.specialties === 'string' ? p.specialties.split(',') : []).filter(Boolean).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {(Array.isArray(p.specialties) ? p.specialties : typeof p.specialties === 'string' ? p.specialties.split(',') : []).filter(Boolean).map((s) => (
                        <span key={s} className="rounded-full bg-bg-primary px-2 py-0.5 text-[10px] text-text-muted">
                          {typeof s === 'string' ? s.trim() : s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}>
                      <DSIcon name="edit3" size={14} className="mr-1.5" />Editar
                    </Button>
                    {isSA && p.id !== currentUserId && (
                      <Button variant="outline" size="sm" className="text-error border-error/30 hover:bg-error/10" onClick={() => setDeleteConfirm(p)}>
                        <DSIcon name="trash2" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{meta.total} personals</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <DSIcon name="chevronLeft" size={16} />
              </Button>
              <span className="flex items-center px-3 text-sm text-text-muted">{page}/{meta.total_pages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>
                <DSIcon name="chevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingPersonal && (
          <Modal title={`Editar: ${editingPersonal.full_name}`} onClose={() => setEditingPersonal(null)} maxWidth="max-w-lg">

              <div className="space-y-4">
                <MD3Input
                  label="Nome"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                />

                <MD3Input
                  label="CREF"
                  value={editForm.cref || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, cref: e.target.value }))}
                  placeholder="123456-G/SP"
                />

                <MD3Input
                  label="Especialidades"
                  value={editForm.specialties || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, specialties: e.target.value }))}
                  placeholder="Musculação, Funcional, Pilates"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Plano</label>
                    <StyledSelect
                      value={editForm.plan_type || 'trial'}
                      onChange={(v) => setEditForm(f => ({ ...f, plan_type: v }))}
                      options={[
                        { value: 'trial', label: 'Trial' },
                        { value: 'free', label: 'Free' },
                        { value: 'pro', label: 'Pro' },
                        { value: 'max', label: 'Max' },
                      ]}
                    />
                  </div>

                  <MD3Input
                    label="Max Alunos"
                    type="number"
                    value={editForm.max_students || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, max_students: e.target.value }))}
                  />
                </div>

                <MD3Input
                  label="Preço Mensal (R$)"
                  type="number"
                  step="0.01"
                  value={editForm.monthly_price || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, monthly_price: e.target.value }))}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditingPersonal(null)}>Cancelar</Button>
                  <Button onClick={saveEdit} loading={updatePersonal.isPending}>
                    <DSIcon name="save" size={16} className="mr-1.5" />Salvar
                  </Button>
                </div>
              </div>
          </Modal>
        )}
        {/* Hard Delete Confirm — super_admin only */}
        {deleteConfirm && isSA && (
          <Modal title="Deletar Personal" onClose={() => { setDeleteConfirm(null); setDeleteInput('') }}>
              <div className="space-y-4">
                <div className="rounded-xl bg-error/10 border border-error/20 p-3">
                  <div className="flex items-start gap-2">
                    <DSIcon name="alertTriangle" className="text-error shrink-0 mt-0.5" />
                    <div className="text-sm text-error">
                      <p className="font-semibold">AÇÃO IRREVERSÍVEL</p>
                      <p className="mt-1">
                        Isso irá deletar permanentemente <strong>{deleteConfirm.full_name}</strong> ({deleteConfirm.email})
                        e TODOS os dados: alunos, treinos, avaliações, pagamentos, mensagens, afiliados.
                      </p>
                      <p className="mt-1 font-medium">Não há como desfazer.</p>
                    </div>
                  </div>
                </div>
                <MD3Input
                  label='Digite "DELETAR" para confirmar'
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETAR"
                  error={deleteInput && deleteInput !== 'DELETAR' ? 'Digite DELETAR exatamente' : undefined}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteInput('') }}>Cancelar</Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleteUser.isPending}
                    disabled={deleteInput !== 'DELETAR'}
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
