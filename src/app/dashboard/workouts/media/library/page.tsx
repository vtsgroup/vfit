// ============================================
// page.tsx — Central de mídia de exercícios
// ============================================
//
// O que faz:
//   Centraliza a gestão de mídia de exercícios (legado D1 + registros R2).
//   Permite buscar exercício, revisar cobertura atual, fazer upload e limpar registros.
//   Prepara a base da futura experiência premium de detalhe do exercício.
//
// Auth: requiredType="personal" (admins/super_admin também acessam via privilégio)
//
// Exports principais:
//   MediaLibraryPage — page component (client)
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { MD3Input } from '@/components/ui/md3-input'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { useExerciseLibrary } from '@/hooks/use-workouts'
import { useDeleteExerciseMedia, useExerciseMedia, type ExerciseMediaItem } from '@/hooks/use-exercise-media'
import { ExerciseVideoPlayer } from '@/components/workouts/exercise-video-player'
import { ExerciseMediaUpload } from '@/components/workouts/exercise-media-upload'
import { useAuthStore } from '@/stores/auth-store'

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'warning'
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
    : tone === 'warning'
      ? 'border-amber-400/20 bg-amber-400/8 text-amber-300'
      : 'border-border-light bg-bg-primary text-text-primary'

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  )
}

function LegacyMediaPanel({
  thumbnailUrl,
  videoVerticalUrl,
  videoHorizontalUrl,
}: {
  thumbnailUrl: string | null
  videoVerticalUrl: string | null
  videoHorizontalUrl: string | null
}) {
  const legacyItems = [
    { label: 'Thumb D1', value: thumbnailUrl, icon: 'image' as const },
    { label: 'Vídeo vertical D1', value: videoVerticalUrl, icon: 'video' as const },
    { label: 'Vídeo horizontal D1', value: videoHorizontalUrl, icon: 'video' as const },
  ]

  return (
    <div className="rounded-2xl border border-border-light bg-bg-primary p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Mídia legada do catálogo</h3>
          <p className="text-xs text-text-muted">
            Referência temporária dos campos antigos em D1. O objetivo é migrar a operação para R2.
          </p>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          legado
        </span>
      </div>

      <div className="space-y-2">
        {legacyItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-bg-secondary px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <DSIcon name={item.icon} size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary">{item.label}</p>
                <p className="truncate text-[11px] text-text-muted">
                  {item.value ? item.value.replace(/^https?:\/\//, '') : 'Não configurado'}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.value ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/6 text-text-muted'}`}>
              {item.value ? 'OK' : 'Vazio'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExistingMediaPanel({ exerciseId }: { exerciseId: string }) {
  const { data: items = [], isLoading } = useExerciseMedia(exerciseId)
  const deleteMutation = useDeleteExerciseMedia(exerciseId)
  const [previewItem, setPreviewItem] = useState<ExerciseMediaItem | null>(null)

  const activeCount = items.filter((item) => item.is_active).length
  const withThumbCount = items.filter((item) => item.thumbnail_url).length

  return (
    <>
      <div className="rounded-2xl border border-border-light bg-bg-primary p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Registros R2 do exercício</h3>
            <p className="text-xs text-text-muted">
              Vídeos e thumbs enviados pela central. Esses registros serão a base do novo detalhe premium.
            </p>
          </div>
          <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
            R2
          </span>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Registros" value={String(items.length)} />
          <StatCard label="Ativos" value={String(activeCount)} tone={activeCount > 0 ? 'success' : 'warning'} />
          <StatCard label="Com thumb" value={String(withThumbCount)} tone={withThumbCount > 0 ? 'success' : 'warning'} />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl border border-white/6 bg-white/3" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-light bg-bg-secondary p-5 text-sm text-text-muted">
            Nenhuma mídia R2 cadastrada ainda. Faça o upload abaixo para começar a popular a nova experiência do exercício.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-border-light bg-bg-secondary">
                <div className="grid gap-0 md:grid-cols-[140px_1fr]">
                  <div className="relative flex min-h-32 items-center justify-center border-b border-border-light bg-bg-primary md:border-b-0 md:border-r">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <DSIcon name="image" size={20} />
                        <span className="text-[11px] font-medium">Sem thumb</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-text-primary">Mídia #{items.length - index}</p>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            ativa
                          </span>
                          {item.duration_seconds > 0 && (
                            <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                              {item.duration_seconds}s
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">Criado em {new Date(item.created_at).toLocaleString('pt-BR')}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPreviewItem(item)}>
                          <DSIcon name="playCircle" size={14} />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost-danger"
                          loading={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <DSIcon name="trash" size={14} />
                          Remover
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-border-light bg-bg-primary px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Vídeo</p>
                        <p className="mt-1 truncate text-xs text-text-primary">{item.video_url.replace(/^https?:\/\//, '')}</p>
                      </div>
                      <div className="rounded-xl border border-border-light bg-bg-primary px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Thumbnail</p>
                        <p className="mt-1 truncate text-xs text-text-primary">{item.thumbnail_url ? item.thumbnail_url.replace(/^https?:\/\//, '') : 'Sem thumbnail'}</p>
                      </div>
                    </div>

                    {item.setup_notes && (
                      <div className="rounded-xl border border-border-light bg-bg-primary px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Notas de setup</p>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.setup_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setPreviewItem(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border-light bg-bg-primary shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
              <div>
                <p className="text-sm font-bold text-text-primary">Preview da mídia</p>
                <p className="text-xs text-text-muted">Revisão rápida antes de usar no novo detalhe do exercício.</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light bg-bg-secondary text-text-muted transition-colors hover:text-text-primary"
              >
                <DSIcon name="x" size={16} />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="bg-black">
                <video
                  src={previewItem.video_url}
                  poster={previewItem.thumbnail_url || undefined}
                  controls
                  playsInline
                  className="max-h-[70vh] w-full bg-black object-contain"
                />
              </div>

              <div className="space-y-4 p-4">
                {previewItem.thumbnail_url ? (
                  <img src={previewItem.thumbnail_url} alt="Thumbnail" className="h-40 w-full rounded-2xl border border-border-light object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-border-light bg-bg-secondary text-text-muted">
                    Sem thumbnail
                  </div>
                )}

                <div className="rounded-2xl border border-border-light bg-bg-secondary p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Notas</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{previewItem.setup_notes || 'Nenhuma nota de setup cadastrada.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function MediaLibraryPage() {
  const searchParams = useSearchParams()
  const initialExerciseId = searchParams.get('exercise_id') || ''
  const isSuperAdmin = useAuthStore((s) => s.user?.role === 'super_admin')

  const [search, setSearch] = useState('')
  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseId)

  const { data, isLoading } = useExerciseLibrary({ search: search || undefined })
  const exercises = data ?? []

  useEffect(() => {
    if (initialExerciseId) {
      setSelectedExerciseId(initialExerciseId)
    }
  }, [initialExerciseId])

  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId)
  const legacyCoverage = useMemo(() => {
    if (!selectedExercise) return 0
    return [selectedExercise.thumbnail_url, selectedExercise.video_url_vertical, selectedExercise.video_url_horizontal].filter(Boolean).length
  }, [selectedExercise])

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6">
        <Link
          href={isSuperAdmin ? '/dashboard/admin' : '/dashboard/workouts'}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          {isSuperAdmin ? 'Voltar para admin' : 'Voltar para treinos'}
        </Link>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-4 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-brand-primary/10 p-2">
              <DSIcon name="images" className="text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Central de mídia de exercícios</h1>
              <p className="text-sm text-text-muted">
                Selecione um exercício, revise legado vs R2 e faça upload dos vídeos e thumbs que vão abastecer o novo detalhe premium.
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <DSIcon name="sparkles" size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-300">Entrega 1 — base da experiência ultra premium</p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Aqui o fluxo já fica centralizado no R2 para exercício: upload, preview, listagem e limpeza dos registros. O próximo passo será ligar esse acervo à nova tela estilo Be Fit, mas com DS VFIT.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <MD3Input
              label="Buscar exercício"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício para gerenciar mídias..."
              leadingIcon={<DSIcon name="search" size={16} />}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 w-full animate-pulse rounded-xl border border-white/6 bg-white/3" />)}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="max-h-115 space-y-2 overflow-auto pr-1">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setSelectedExerciseId(exercise.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedExerciseId === exercise.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-light bg-bg-primary hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-text-primary">{exercise.name_pt || exercise.name}</p>
                        <p className="mt-1 text-xs text-text-muted">{exercise.difficulty}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {exercise.thumbnail_url && <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">thumb</span>}
                        {(exercise.video_url_vertical || exercise.video_url_horizontal) && <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-primary">vídeo</span>}
                      </div>
                    </div>
                  </button>
                ))}

                {exercises.length === 0 && (
                  <p className="text-sm text-text-muted">Nenhum exercício encontrado.</p>
                )}
              </div>

              <div className="space-y-4">
                {selectedExerciseId ? (
                  <>
                    <div className="rounded-2xl border border-border-light bg-bg-primary p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-black text-text-primary">
                              {selectedExercise?.name_pt || selectedExercise?.name || 'Exercício selecionado'}
                            </p>
                            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                              {selectedExercise?.difficulty || 'catálogo'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-text-muted">ID: {selectedExerciseId}</p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 lg:w-90">
                          <StatCard label="Legado D1" value={`${legacyCoverage}/3`} tone={legacyCoverage > 0 ? 'warning' : 'default'} />
                          <StatCard label="Exercise ID" value={selectedExerciseId.slice(0, 8)} />
                          <StatCard label="R2 alvo" value="ativo" tone="success" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border-light bg-bg-primary p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-text-primary">Preview rápido</h3>
                              <p className="text-xs text-text-muted">
                                Use o player para validar a mídia principal antes de publicar a nova experiência do exercício.
                              </p>
                            </div>
                            <ExerciseVideoPlayer exerciseId={selectedExerciseId} className="h-10 w-10" />
                          </div>

                          {selectedExercise?.thumbnail_url ? (
                            <img
                              src={selectedExercise.thumbnail_url}
                              alt={selectedExercise.name_pt || selectedExercise.name}
                              className="h-56 w-full rounded-2xl border border-border-light object-cover"
                            />
                          ) : (
                            <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border-light bg-bg-secondary text-sm text-text-muted">
                              Ainda não há hero/thumb no catálogo legado.
                            </div>
                          )}
                        </div>

                        <LegacyMediaPanel
                          thumbnailUrl={selectedExercise?.thumbnail_url || null}
                          videoVerticalUrl={selectedExercise?.video_url_vertical || null}
                          videoHorizontalUrl={selectedExercise?.video_url_horizontal || null}
                        />
                      </div>

                      <div className="space-y-4">
                        <ExerciseMediaUpload exerciseId={selectedExerciseId} />
                      </div>
                    </div>

                    <ExistingMediaPanel exerciseId={selectedExerciseId} />
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border-light bg-bg-primary p-6 text-sm text-text-muted">
                    Selecione um exercício para gerenciar a biblioteca de mídias.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/workouts/create">
                    <Button variant="outline">Abrir criador de treino</Button>
                  </Link>
                  <Link href="/dashboard/workouts/exercises/library">
                    <Button variant="ghost">Biblioteca de exercícios</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
