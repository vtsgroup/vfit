/**
 * src/app/dashboard/admin/muscle-groups/page.tsx
 *
 * Admin Grupos Musculares — Super Admin
 * Edita imagem, animação, cor e sub-músculos de cada grupo muscular
 *
 * Exports: AdminMuscleGroupsPage
 * Features: Auth: super_admin only · imagem/animação upload via R2 · CRUD sub-músculos
 */

// ============================================
// Admin Muscle Groups — super_admin only
// ============================================

'use client'

import { useRef, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { MD3Input } from '@/components/ui/md3-input'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import {
  useMuscleGroupsAdmin,
  useUpdateMuscleGroup,
  useUploadMuscleGroupImage,
  useCreateMuscleGroup,
  useDeleteMuscleGroup,
  type MuscleGroup,
} from '@/hooks/use-muscle-groups'

// ─── Tipos ──────────────────────────────────────────────────────────────────

type AdminMuscleGroup = MuscleGroup & { exercise_count?: number }

// ─── Utils ──────────────────────────────────────────────────────────────────

function generateId(prefix = 'mg'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function ColorSwatch({ hex }: { hex: string | null }) {
  if (!hex) return <div className="h-5 w-5 rounded-md border border-border-light bg-bg-tertiary" />
  return (
    <div
      className="h-5 w-5 rounded-md border border-border-light/30 shadow-sm"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  )
}

function ImageCell({
  url,
  alt,
  onUpload,
  uploading,
}: {
  url: string | null
  alt: string
  onUpload: (file: File) => void
  uploading: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="group relative flex h-12 w-12 shrink-0 items-center justify-center">
      {url ? (
        <img
          src={url}
          alt={alt}
          className="h-12 w-12 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border-light bg-bg-tertiary">
          <DSIcon name="image" size={16} className="text-text-muted" />
        </div>
      )}
      {/* Upload overlay */}
      <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <DSIcon name={url ? 'edit' : 'upload'} size={14} className="text-white" />
        )}
        <input
          ref={ref}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

// ─── Linha de grupo muscular ─────────────────────────────────────────────────

function MuscleGroupRow({
  group,
  isSubMuscle,
  onEdit,
  onDelete,
  isSuperAdmin,
}: {
  group: AdminMuscleGroup
  isSubMuscle: boolean
  onEdit: (g: AdminMuscleGroup) => void
  onDelete: (g: AdminMuscleGroup) => void
  isSuperAdmin: boolean
}) {
  const uploadImage = useUploadMuscleGroupImage()

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAnim, setUploadingAnim] = useState(false)

  async function handleUpload(file: File, type: 'image' | 'animation') {
    if (type === 'image') setUploadingImage(true)
    else setUploadingAnim(true)
    try {
      await uploadImage.mutateAsync({ id: group.id, file, type })
      toast.success(type === 'image' ? 'Imagem atualizada!' : 'Animação atualizada!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      if (type === 'image') setUploadingImage(false)
      else setUploadingAnim(false)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-3 transition-colors hover:bg-bg-tertiary',
        isSubMuscle && 'ml-8 border-border-light/50 bg-bg-tertiary/50',
      )}
    >
      {/* Indent indicator */}
      {isSubMuscle && (
        <div className="h-4 w-0.5 shrink-0 rounded-full bg-border-light" />
      )}

      {/* Imagem */}
      <ImageCell
        url={group.image_url}
        alt={group.name_pt}
        onUpload={(f) => handleUpload(f, 'image')}
        uploading={uploadingImage}
      />

      {/* Animação */}
      <div className="hidden sm:flex shrink-0 flex-col items-center gap-0.5">
        <ImageCell
          url={group.animation_url}
          alt={`${group.name_pt} animação`}
          onUpload={(f) => handleUpload(f, 'animation')}
          uploading={uploadingAnim}
        />
        <span className="text-[9px] text-text-muted">anim</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ColorSwatch hex={group.color_hex} />
          <p className="truncate text-sm font-semibold text-text-primary">{group.name_pt}</p>
          {!isSubMuscle && (
            <span className="hidden text-xs text-text-muted sm:inline">({group.name})</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-muted">
          {group.color_hex || 'sem cor'} · ordem {group.display_order}
          {typeof group.exercise_count === 'number' && ` · ${group.exercise_count} exercícios`}
        </p>
      </div>

      {/* Actions */}
      {isSuperAdmin && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(group)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light bg-bg-primary text-text-muted transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
            title="Editar"
          >
            <DSIcon name="edit" size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(group)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light bg-bg-primary text-text-muted transition-colors hover:border-red-400/30 hover:text-red-400"
            title="Deletar"
          >
            <DSIcon name="trash" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Modal de edição ─────────────────────────────────────────────────────────

interface EditModalProps {
  group: AdminMuscleGroup | null
  onClose: () => void
}

function EditModal({ group, onClose }: EditModalProps) {
  const update = useUpdateMuscleGroup()
  const [nameEn, setNameEn] = useState(group?.name ?? '')
  const [namePt, setNamePt] = useState(group?.name_pt ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [colorHex, setColorHex] = useState(group?.color_hex ?? '')
  const [displayOrder, setDisplayOrder] = useState(String(group?.display_order ?? 0))

  if (!group) return null

  async function handleSave() {
    try {
      await update.mutateAsync({
        id: group!.id,
        data: {
          name: nameEn.trim() || undefined,
          name_pt: namePt.trim() || undefined,
          description: description.trim() || undefined,
          color_hex: colorHex.trim() || undefined,
          display_order: Number(displayOrder) || undefined,
        },
      })
      toast.success('Grupo muscular atualizado!')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <Modal onClose={onClose} title={`Editar: ${group.name_pt}`}>
      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <MD3Input
            label="Nome EN"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Ex: Upper Chest"
          />
          <MD3Input
            label="Nome PT"
            value={namePt}
            onChange={(e) => setNamePt(e.target.value)}
            placeholder="Ex: Peito Superior"
          />
        </div>
        <MD3Input
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição breve (opcional)"
        />
        <div className="flex gap-3">
          <MD3Input
            label="Cor hex"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            placeholder="#22C55E"
          />
          <MD3Input
            label="Ordem"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="1"
            type="number"
          />
        </div>
        {colorHex && /^#[0-9a-fA-F]{6}$/.test(colorHex) && (
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg border border-border-light"
              style={{ backgroundColor: colorHex }}
            />
            <span className="text-sm text-text-muted">{colorHex}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" loading={update.isPending} onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal de novo sub-músculo ────────────────────────────────────────────────

interface CreateModalProps {
  parentGroups: AdminMuscleGroup[]
  onClose: () => void
}

function CreateModal({ parentGroups, onClose }: CreateModalProps) {
  const create = useCreateMuscleGroup()
  const [name, setName] = useState('')
  const [namePt, setNamePt] = useState('')
  const [parentId, setParentId] = useState('')
  const [colorHex, setColorHex] = useState('')

  async function handleCreate() {
    if (!name.trim() || !namePt.trim()) {
      toast.error('Preencha nome (EN) e nome PT')
      return
    }
    try {
      await create.mutateAsync({
        id: generateId('mg'),
        name: name.trim(),
        name_pt: namePt.trim(),
        parent_id: parentId || undefined,
        color_hex: colorHex.trim() || undefined,
      })
      toast.success('Grupo muscular criado!')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar')
    }
  }

  return (
    <Modal onClose={onClose} title="Novo Grupo Muscular">
      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <MD3Input
            label="Nome EN"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="upper_chest"
          />
          <MD3Input
            label="Nome PT"
            value={namePt}
            onChange={(e) => setNamePt(e.target.value)}
            placeholder="Peito Superior"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Grupo pai (opcional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary"
          >
            <option value="">Nenhum (grupo raiz)</option>
            {parentGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name_pt}
              </option>
            ))}
          </select>
        </div>
        <MD3Input
          label="Cor hex"
          value={colorHex}
          onChange={(e) => setColorHex(e.target.value)}
          placeholder="#22C55E"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" loading={create.isPending} onClick={handleCreate}>
            Criar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal de confirmação de delete ──────────────────────────────────────────

function DeleteModal({
  group,
  onClose,
}: {
  group: AdminMuscleGroup | null
  onClose: () => void
}) {
  const del = useDeleteMuscleGroup()

  if (!group) return null

  async function handleDelete() {
    try {
      await del.mutateAsync(group!.id)
      toast.success('Grupo muscular deletado.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  return (
    <Modal onClose={onClose} title="Confirmar exclusão">
      <div className="space-y-4 p-4">
        <p className="text-sm text-text-primary">
          Deletar <strong>{group.name_pt}</strong>?
          {typeof group.exercise_count === 'number' && group.exercise_count > 0 && (
            <span className="ml-1 text-amber-400">
              ({group.exercise_count} exercícios associados)
            </span>
          )}
        </p>
        <p className="text-xs text-text-muted">
          Esta ação não pode ser desfeita. Exercícios vinculados perderão o vínculo com este grupo.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" loading={del.isPending} onClick={handleDelete}>
            Deletar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function MuscleGroupsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex h-16 animate-pulse items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-3"
        >
          <div className="h-12 w-12 shrink-0 rounded-xl bg-bg-tertiary" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded-md bg-bg-tertiary" />
            <div className="h-3 w-48 rounded-md bg-bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminMuscleGroupsPage() {
  const isSA = useAuthStore((s) => s.isSuperAdmin)
  const isSuperAdmin = isSA()

  const { data, isLoading, isError, error, refetch } = useMuscleGroupsAdmin()
  const groups = (data?.muscle_groups ?? []) as AdminMuscleGroup[]
  const isFallbackMode = data?.source === 'public-fallback'

  const [editTarget, setEditTarget] = useState<AdminMuscleGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminMuscleGroup | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  // Separa grupos raiz de sub-músculos
  const rootGroups = groups.filter((g) => !g.parent_id)
  const subMap = groups.reduce<Record<string, AdminMuscleGroup[]>>((acc, g) => {
    if (g.parent_id) {
      if (!acc[g.parent_id]) acc[g.parent_id] = []
      acc[g.parent_id].push(g)
    }
    return acc
  }, {})

  // Flat list filtrada para renderização
  const filtered = (() => {
    const q = search.toLowerCase().trim()
    if (!q) return null // sem filtro → renderização em árvore
    return groups.filter(
      (g) =>
        g.name_pt.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q) ||
        (g.color_hex?.toLowerCase() ?? '').includes(q),
    )
  })()

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6 stagger-children">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20">
              <DSIcon name="activity" size={24} className="text-brand-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Grupos Musculares</h1>
              <p className="text-sm text-text-muted">
                {groups.length} grupos · {Object.values(subMap).flat().length} sub-músculos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light bg-bg-secondary text-text-muted transition-colors hover:text-text-primary"
              title="Recarregar"
            >
              <DSIcon name="refresh" size={16} />
            </button>
            {isSuperAdmin && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <DSIcon name="plus" size={14} />
                Novo Grupo
              </Button>
            )}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <DSIcon name="info" size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-amber-400">Imagens genéricas por enquanto</p>
              <p className="text-xs text-text-muted">
                O primeiro quadro é a imagem estática do grupo muscular. O segundo quadro é a animação/GIF.
                Clique em cada quadro para fazer upload via R2. Os arquivos ficam disponíveis imediatamente em todos os treinos da plataforma.
              </p>
            </div>
          </div>
        </div>

        {isFallbackMode && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <DSIcon name="warning" size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-amber-400">Modo fallback ativo</p>
                <p className="text-xs text-text-muted">
                  A rota administrativa não respondeu corretamente. A tela carregou os grupos pelo endpoint público.
                  Você pode visualizar os grupos já cadastrados, mas ações de super admin podem falhar até a rota admin normalizar.
                </p>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <div className="flex items-start gap-2">
              <DSIcon name="warning" size={16} className="mt-0.5 shrink-0 text-red-400" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-red-400">Erro ao carregar grupos musculares</p>
                <p className="text-xs text-text-muted">
                  {(error as Error | null)?.message || 'Falha inesperada ao consultar a API.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <DSIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar grupo muscular..."
            className="w-full rounded-xl border border-border-light bg-bg-secondary py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary/50 focus:outline-none"
          />
        </div>

        {/* Legenda colunas */}
        <div className="hidden items-center gap-3 px-3 sm:flex">
          <div className="h-12 w-12 shrink-0 text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Img
          </div>
          <div className="hidden h-12 w-12 shrink-0 text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:block">
            Anim
          </div>
          <div className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Nome</div>
          {isSuperAdmin && (
            <div className="w-20 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Ações
            </div>
          )}
        </div>

        {/* Lista */}
        {isLoading ? (
          <MuscleGroupsSkeleton />
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-border-light bg-bg-secondary p-8 text-center">
            <DSIcon name="activity" size={32} className="mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-muted">Nenhum grupo muscular encontrado.</p>
          </div>
        ) : filtered ? (
          // Flat filtered list
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">
                Nenhum resultado para &quot;{search}&quot;
              </p>
            ) : (
              filtered.map((g) => (
                <MuscleGroupRow
                  key={g.id}
                  group={g}
                  isSubMuscle={!!g.parent_id}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  isSuperAdmin={isSuperAdmin}
                />
              ))
            )}
          </div>
        ) : (
          // Tree view
          <div className="space-y-3">
            {rootGroups.map((root) => {
              const subs = subMap[root.id] ?? []
              return (
                <div key={root.id} className="space-y-2">
                  <MuscleGroupRow
                    group={root}
                    isSubMuscle={false}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    isSuperAdmin={isSuperAdmin}
                  />
                  {subs.length > 0 && (
                    <div className="space-y-1.5">
                      {subs
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((sub) => (
                          <MuscleGroupRow
                            key={sub.id}
                            group={sub}
                            isSubMuscle={true}
                            onEdit={setEditTarget}
                            onDelete={setDeleteTarget}
                            isSuperAdmin={isSuperAdmin}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modais */}
      {editTarget && <EditModal group={editTarget} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <DeleteModal group={deleteTarget} onClose={() => setDeleteTarget(null)} />}
      {showCreate && (
        <CreateModal parentGroups={rootGroups} onClose={() => setShowCreate(false)} />
      )}
    </AuthGuard>
  )
}
