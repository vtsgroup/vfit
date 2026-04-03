/**
 * src/app/dashboard/admin/users/page.tsx
 *
 * Admin Users Page — Gerenciamento de usuários
 *
 * Exports: AdminUsersPage
 * Hooks: useEffect, useState, useAuthStore, useScrollLock, useAdminUsers, useUpdateAdminUser
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Users Page — Gerenciamento de usuários
// super_admin: pode deletar (hard delete), editar tudo
// admin: pode editar nome/email/phone, sem delete
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import { ActionIconButton } from '@/components/ui/action-icon-button'
import { Modal } from '@/components/ui/modal'
import { AdminUsersPageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui/md3-input'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import {
  useAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useAddBonus,
  useAdminAccountNote,
  useUpsertAdminAccountNote,
  type AdminUser,
} from '@/hooks/use-admin'

const typeToBadgeVariant: Record<string, 'aluno' | 'personal' | 'admin'> = {
  student: 'aluno',
  personal: 'personal',
  admin: 'admin',
}

const roleToBadgeVariant: Record<string, 'super-admin' | 'admin'> = {
  super_admin: 'super-admin',
  admin: 'admin',
}

export default function AdminUsersPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [bonusUser, setBonusUser] = useState<AdminUser | null>(null)
  const [bonusAmount, setBonusAmount] = useState('')
  const [bonusDesc, setBonusDesc] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [noteUser, setNoteUser] = useState<AdminUser | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [noteRiskLevel, setNoteRiskLevel] = useState<'none' | 'attention' | 'high'>('none')
  const [noteFinancialRisk, setNoteFinancialRisk] = useState(false)

  // Lock body scroll when any modal is open
  useScrollLock(!!editingUser || !!bonusUser || !!deleteConfirm || !!noteUser)

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminUsers({
    page,
    per_page: 20,
    search: search || undefined,
    user_type: typeFilter || undefined,
  })
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const addBonus = useAddBonus()
  const upsertAccountNote = useUpsertAdminAccountNote()
  const accountNoteQuery = useAdminAccountNote(noteUser?.id)

  const users = data?.users ?? []
  const meta = data?.meta

  // Edit form state
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  function openEdit(user: AdminUser) {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      user_type: user.user_type,
    })
  }

  function saveEdit() {
    if (!editingUser) return
    // Admin can only send basic fields
    const data = isSuperAdmin()
      ? editForm
      : { full_name: editForm.full_name, email: editForm.email, phone: editForm.phone }
    updateUser.mutate(
      { id: editingUser.id, data },
      { onSuccess: () => setEditingUser(null) }
    )
  }

  function handleDelete() {
    if (!deleteConfirm) return
    deleteUser.mutate(deleteConfirm.id, { onSuccess: () => { setDeleteConfirm(null); setDeleteInput('') } })
  }

  function handleBonus() {
    if (!bonusUser || !bonusAmount) return
    addBonus.mutate(
      { userId: bonusUser.id, data: { amount: parseFloat(bonusAmount), description: bonusDesc } },
      { onSuccess: () => { setBonusUser(null); setBonusAmount(''); setBonusDesc('') } }
    )
  }

  useEffect(() => {
    const note = accountNoteQuery.data?.note
    if (!note) {
      setNoteDraft('')
      setNoteRiskLevel('none')
      setNoteFinancialRisk(false)
      return
    }
    setNoteDraft(note.note || '')
    setNoteRiskLevel(note.risk_level || 'none')
    setNoteFinancialRisk(note.is_financial_risk === true)
  }, [accountNoteQuery.data?.note?.id, accountNoteQuery.data?.note?.note, accountNoteQuery.data?.note?.risk_level, accountNoteQuery.data?.note?.is_financial_risk])

  function doSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  const isSA = isSuperAdmin()

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Lista de Usuários</h2>
          <p className="mt-1 text-sm text-text-muted">
            {meta?.total ?? 0} usuário{(meta?.total ?? 0) !== 1 ? 's' : ''} cadastrado{(meta?.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters — DS v3 glass morphism */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-48 flex-1">
            <MD3Input
              label="Buscar usuário"
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
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'personal', label: 'Personal' },
              { value: 'student', label: 'Aluno' },
            ]}
            compact
          />
        </div>

        {/* User list */}
        {isFetching && users.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <DSIcon name="loader" size={14} className="animate-spin" />
            Atualizando usuários...
          </div>
        )}

        {isLoading && users.length === 0 ? (
          <AdminUsersPageSkeleton />
        ) : isError && users.length === 0 ? (
          <EmptyStateDS
            icon="users"
            title="Erro ao carregar usuários"
            description={error instanceof Error ? error.message : 'Não foi possível carregar a lista agora.'}
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
          />
        ) : users.length === 0 ? (
          <EmptyStateDS icon="users" title="Nenhum usuário" description="Nenhum resultado encontrado." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {users.map((user, idx) => {
              const badgeVariant = typeToBadgeVariant[user.user_type] || 'personal'
              const roleVariant = roleToBadgeVariant[user.role]
              const isProtected = user.role === 'super_admin'
              // Avatar gradient colors by user type
              const avatarGradient = isProtected
                ? 'bg-linear-to-br from-amber-400 to-amber-500/70'
                : user.user_type === 'student'
                  ? 'bg-linear-to-br from-emerald-400 to-emerald-500/70'
                  : 'bg-linear-to-br from-amber-400 to-amber-500/70'
              return (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center gap-3.5 rounded-2xl border p-3.5 px-5 backdrop-blur-xl',
                    'shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.05)]',
                    'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
                    isProtected
                      ? 'border-amber-500/20 bg-bg-primary dark:bg-amber-500/5 dark:border-amber-500/15'
                      : 'border-border-light bg-bg-primary'
                  )}
                  style={{ animation: `fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 70}ms both` }}
                >
                  {/* Avatar — 44px gradient circle */}
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white',
                    avatarGradient
                  )}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-text-primary">{user.full_name}</span>
                      <Badge variant={badgeVariant} />
                      {roleVariant && <Badge variant={roleVariant} />}
                      {!user.is_active && <Badge variant="error">Desativado</Badge>}
                      {user.email_verified && <Badge variant="verified" />}
                    </div>
                    <p className="mt-1 text-[13px] text-text-muted">
                      {user.email} · {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Actions — DS v3 icon buttons */}
                  <div className="flex shrink-0 gap-1.5">
                    <ActionIconButton icon={<DSIcon name="edit3" />} tooltip="Editar" onClick={() => openEdit(user)} />
                    <ActionIconButton icon={<DSIcon name="copy" />} tooltip="Duplicar" onClick={() => setNoteUser(user)} />
                    {isSA && (
                      <ActionIconButton icon={<DSIcon name="gift" />} tooltip="Bônus" onClick={() => setBonusUser(user)} />
                    )}
                    {isSA && !isProtected && (
                      <ActionIconButton icon={<DSIcon name="trash2" />} tooltip="Excluir" destructive onClick={() => setDeleteConfirm(user)} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && <Pagination page={page} totalPages={meta.total_pages} total={meta.total} itemLabel="usuários" onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}

        {/* Edit Modal */}
        {editingUser && (
          <Modal title={`Editar: ${editingUser.full_name}`} onClose={() => setEditingUser(null)}>
            <div className="space-y-4">
              <FormField label="Nome" value={editForm.full_name || ''} onChange={(v) => setEditForm(f => ({ ...f, full_name: v }))} />
              <FormField label="Email" value={editForm.email || ''} onChange={(v) => setEditForm(f => ({ ...f, email: v }))} />
              <FormField label="Telefone" value={editForm.phone || ''} onChange={(v) => setEditForm(f => ({ ...f, phone: v }))} />
              {/* Role & user_type editable only by super_admin */}
              {isSA && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Role</label>
                    <StyledSelect
                      value={editForm.role || 'user'}
                      onChange={(v) => setEditForm(f => ({ ...f, role: v }))}
                      options={[
                        { value: 'user', label: 'Usuário' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'super_admin', label: 'Super Admin' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Tipo</label>
                    <StyledSelect
                      value={editForm.user_type || 'personal'}
                      onChange={(v) => setEditForm(f => ({ ...f, user_type: v }))}
                      options={[
                        { value: 'personal', label: 'Personal' },
                        { value: 'student', label: 'Aluno' },
                      ]}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                <Button onClick={saveEdit} loading={updateUser.isPending}>
                  <DSIcon name="save" size={16} className="mr-1.5" />Salvar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Bonus Modal — super_admin only */}
        {bonusUser && isSA && (
          <Modal title={`Bônus para ${bonusUser.full_name}`} onClose={() => setBonusUser(null)}>
            <div className="space-y-4">
              <FormField label="Valor (R$)" type="number" value={bonusAmount} onChange={setBonusAmount} placeholder="100.00" />
              <FormField label="Descrição" value={bonusDesc} onChange={setBonusDesc} placeholder="Bônus de indicação, promoção..." />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setBonusUser(null)}>Cancelar</Button>
                <Button onClick={handleBonus} loading={addBonus.isPending} disabled={!bonusAmount || parseFloat(bonusAmount) <= 0}>
                  <DSIcon name="gift" size={16} className="mr-1.5" />Adicionar Bônus
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Hard Delete Confirm — super_admin only */}
        {deleteConfirm && isSA && (
          <Modal title="Deletar Permanentemente" onClose={() => { setDeleteConfirm(null); setDeleteInput('') }}>
            <div className="space-y-4">
              <div className="rounded-xl bg-error/10 border border-error/20 p-3">
                <div className="flex items-start gap-2">
                  <DSIcon name="alertTriangle" className="text-error shrink-0 mt-0.5" />
                  <div className="text-sm text-error">
                    <p className="font-semibold">AÇÃO IRREVERSÍVEL</p>
                    <p className="mt-1">
                      Isso irá deletar permanentemente <strong>{deleteConfirm.full_name}</strong> ({deleteConfirm.email})
                      e TODOS os dados associados: treinos, avaliações, pagamentos, mensagens, notificações.
                    </p>
                    <p className="mt-1 font-medium">Não há como desfazer esta ação.</p>
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

        {noteUser && (
          <Modal title={`Nota privada: ${noteUser.full_name}`} onClose={() => setNoteUser(null)}>
            <div className="space-y-4">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={6}
                placeholder="Anotações visíveis apenas para Admin e Super Admin..."
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/25 focus:outline-none"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <StyledSelect
                  value={noteRiskLevel}
                  onChange={(v) => setNoteRiskLevel(v as 'none' | 'attention' | 'high')}
                  options={[
                    { value: 'none', label: 'Risco: nenhum' },
                    { value: 'attention', label: 'Risco: atenção' },
                    { value: 'high', label: 'Risco: alto' },
                  ]}
                />

                <label className="flex items-center gap-2 rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={noteFinancialRisk}
                    onChange={(e) => setNoteFinancialRisk(e.target.checked)}
                  />
                  Risco de prejuízo financeiro
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setNoteUser(null)}>Fechar</Button>
                <Button
                  onClick={async () => {
                    if (!noteUser || !noteDraft.trim()) return
                    await upsertAccountNote.mutateAsync({
                      userId: noteUser.id,
                      note: noteDraft,
                      risk_level: noteRiskLevel,
                      is_financial_risk: noteFinancialRisk,
                    })
                    await accountNoteQuery.refetch()
                  }}
                  loading={upsertAccountNote.isPending}
                  disabled={!noteDraft.trim()}
                >
                  <DSIcon name="save" size={16} className="mr-1.5" />Salvar nota
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Form Field
// ============================================
function FormField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <MD3Input
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}
