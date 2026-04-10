/**
 * src/app/(app)/exercicios/[id]/page.tsx
 *
 * EXERCÍCIO — detalhe premium com hero de mídia real, CTAs e tabs modernas
 */

'use client'

import { Suspense, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { useExerciseMedia, type ExerciseMediaItem } from '@/hooks/use-exercise-media'
import { useExerciseDetail, type ExerciseDetail } from '@/hooks/use-exercises'
import { useFavoriteExercises } from '@/hooks/use-favorite-exercises'

type DetailTab = 'target' | 'instructions' | 'equipment'
type GalleryItem = { type: 'video' | 'image'; url: string; thumbnailUrl?: string | null; label: string; notes?: string | null }

const DETAIL_TABS: Array<{ id: DetailTab; label: string; icon: 'target' | 'clipboardList' | 'dumbbell' }> = [
  { id: 'target', label: 'Alvo', icon: 'target' },
  { id: 'instructions', label: 'Instruções', icon: 'clipboardList' },
  { id: 'equipment', label: 'Equipamento', icon: 'dumbbell' },
]

const DIFFICULTY_MAP: Record<string, { label: string; chip: string }> = {
  beginner: { label: 'Iniciante', chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  intermediate: { label: 'Intermediário', chip: 'border-amber-400/25 bg-amber-400/10 text-amber-300' },
  advanced: { label: 'Avançado', chip: 'border-red-400/25 bg-red-400/10 text-red-300' },
}

const MUSCLE_ICON_MAP = {
  chest: 'activity',
  back: 'layers',
  shoulders: 'target',
  biceps: 'dumbbell',
  triceps: 'zap',
  legs: 'footprints',
  quadriceps: 'footprints',
  hamstrings: 'footprints',
  glutes: 'flame',
  calves: 'footprints',
  abs: 'shield',
  core: 'shield',
  forearms: 'wrench',
  traps: 'triangle',
  full_body: 'activity',
} as const

const EQUIPMENT_META: Record<string, { label: string; icon: 'dumbbell' | 'wrench' | 'activity' | 'target' | 'shield' | 'layers' }> = {
  machine: { label: 'Máquina', icon: 'activity' },
  cable: { label: 'Cabo', icon: 'target' },
  dumbbell: { label: 'Halter', icon: 'dumbbell' },
  barbell: { label: 'Barra', icon: 'layers' },
  bodyweight: { label: 'Peso corporal', icon: 'shield' },
  kettlebell: { label: 'Kettlebell', icon: 'dumbbell' },
  band: { label: 'Faixa elástica', icon: 'target' },
  smith: { label: 'Smith', icon: 'activity' },
  bench: { label: 'Banco', icon: 'layers' },
  pullup_bar: { label: 'Barra fixa', icon: 'layers' },
  ez_bar: { label: 'Barra EZ', icon: 'layers' },
}

function parseInstructionBlocks(text: string | null): string[] {
  if (!text) return []

  const lines = text
    .split(/(?:\d+\.\s*|\n|•|-)+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 6)

  return lines.length > 0 ? lines : [text]
}

function parseDelimitedList(value: string | null): string[] {
  if (!value) return []

  return value
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseImageUrls(value: string | null): string[] {
  return parseDelimitedList(value).filter((item) => item.startsWith('http'))
}

function parseEquipment(raw: string | null): string[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map((item) => String(item))
  } catch {
    return []
  }

  return []
}

function normalizeEquipmentKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '_')
}

function buildGallery(exercise: ExerciseDetail | undefined, media: ExerciseMediaItem[]): GalleryItem[] {
  const items: GalleryItem[] = media.map((item, index) => ({
    type: 'video',
    url: item.video_url,
    thumbnailUrl: item.thumbnail_url,
    label: `Vídeo ${index + 1}`,
    notes: item.setup_notes,
  }))

  const legacyImages = parseImageUrls(exercise?.image_urls || null)
  legacyImages.forEach((url, index) => {
    items.push({
      type: 'image',
      url,
      thumbnailUrl: url,
      label: `Imagem ${index + 1}`,
    })
  })

  if (exercise?.thumbnail_url && !items.some((item) => item.url === exercise.thumbnail_url)) {
    items.push({
      type: 'image',
      url: exercise.thumbnail_url,
      thumbnailUrl: exercise.thumbnail_url,
      label: 'Thumb principal',
    })
  }

  return items
}

function StickyActions({
  hasMedia,
  onViewMedia,
  onOpenInstructions,
}: {
  hasMedia: boolean
  onViewMedia: () => void
  onOpenInstructions: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      <div className="rounded-3xl border border-white/10 bg-black/50 p-2 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onOpenInstructions}>
            <DSIcon name="clipboardList" size={16} />
            Como fazer
          </Button>
          <Button variant="workout" onClick={onViewMedia} disabled={!hasMedia}>
            <DSIcon name={hasMedia ? 'playCircle' : 'image'} size={16} />
            {hasMedia ? 'Ver demonstração' : 'Sem mídia'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function HeroStage({
  title,
  gallery,
  onOpenGallery,
}: {
  title: string
  gallery: GalleryItem[]
  onOpenGallery: (index?: number) => void
}) {
  const hero = gallery[0]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-linear-to-br from-bg-secondary to-bg-tertiary">
      <div className="relative h-90 overflow-hidden bg-black">
        {hero ? (
          hero.type === 'video' ? (
            <video
              src={hero.url}
              poster={hero.thumbnailUrl || undefined}
              className="h-full w-full object-cover opacity-92"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={hero.url} alt={title} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-linear-to-br from-bg-secondary to-bg-tertiary text-text-muted">
            <div className="flex h-18 w-18 items-center justify-center rounded-3xl border border-white/8 bg-white/4">
              <DSIcon name="video" size={28} className="text-brand-primary" />
            </div>
            <p className="text-sm font-medium">Mídia premium em preparação</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/15 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-xl">
            {hero?.type === 'video' ? 'demonstração em vídeo' : hero ? 'visual do exercício' : 'aguardando upload'}
          </span>
          {gallery.length > 1 && (
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-xl">
              {gallery.length} mídias
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <Button variant="glass" size="lg" className="w-full" onClick={() => onOpenGallery(0)}>
            <DSIcon name={hero?.type === 'video' ? 'playCircle' : 'images'} size={18} />
            {hero?.type === 'video' ? 'Assistir demonstração' : 'Abrir galeria'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MediaModal({
  gallery,
  activeIndex,
  onClose,
  onSelect,
}: {
  gallery: GalleryItem[]
  activeIndex: number
  onClose: () => void
  onSelect: (index: number) => void
}) {
  const active = gallery[activeIndex]
  if (!active) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div className="flex h-full flex-col justify-center gap-4 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{active.label}</p>
            <p className="text-xs text-white/60">Acervo premium do exercício</p>
          </div>
          <button
            type="button"
            aria-label="Fechar mídia"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white"
          >
            <DSIcon name="x" size={18} />
          </button>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
          {active.type === 'video' ? (
            <video
              src={active.url}
              poster={active.thumbnailUrl || undefined}
              controls
              autoPlay
              playsInline
              className="max-h-[60dvh] w-full bg-black object-contain"
            />
          ) : (
            <img src={active.url} alt={active.label} className="max-h-[60dvh] w-full object-contain" />
          )}
        </div>

        {active.notes && (
          <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Notas de setup</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{active.notes}</p>
          </div>
        )}

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((item, index) => (
              <button
                key={`${item.type}-${item.url}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border ${index === activeIndex ? 'border-brand-primary' : 'border-white/10'}`}
              >
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/6 text-white/60">
                    <DSIcon name={item.type === 'video' ? 'video' : 'image'} size={18} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-2 py-1 text-left text-[10px] font-semibold text-white/90">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TargetTab({
  exercise,
  coachingCues,
  tags,
}: {
  exercise: ExerciseDetail
  coachingCues: string[]
  tags: string[]
}) {
  const difficulty = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.beginner
  const muscleIcon = MUSCLE_ICON_MAP[exercise.muscle_group_id as keyof typeof MUSCLE_ICON_MAP] || 'activity'
  const muscleColor = exercise.muscle_group?.color_hex || '#22C55E'

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-bg-secondary">
        <div className="grid grid-cols-[112px_1fr] gap-0">
          <div className="relative min-h-28 bg-bg-tertiary">
            {exercise.muscle_group?.image_url ? (
              <img src={exercise.muscle_group.image_url} alt={exercise.muscle_group.name_pt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ backgroundColor: `${muscleColor}16` }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/8 bg-white/4" style={{ color: muscleColor }}>
                  <DSIcon name={muscleIcon} size={28} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ backgroundColor: `${muscleColor}18`, color: muscleColor }}>
                alvo principal
              </span>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${difficulty.chip}`}>
                {difficulty.label}
              </span>
            </div>

            <div>
              <p className="text-lg font-black text-text-primary">{exercise.muscle_group?.name_pt || exercise.muscle_group_id}</p>
              <p className="mt-1 text-sm text-text-secondary">
                Este movimento prioriza a execução técnica e a contração do grupo muscular alvo em cada repetição.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Popularidade</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-3xl font-black text-text-primary">{exercise.view_count.toLocaleString('pt-BR')}</p>
            <p className="pb-1 text-xs text-text-secondary">visualizações</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Tags do exercício</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.length > 0 ? tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-medium text-text-primary">
                {tag.replace(/_/g, ' ')}
              </span>
            )) : (
              <p className="text-sm text-text-secondary">Tags editoriais serão enriquecidas na próxima etapa do catálogo.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <DSIcon name="sparkles" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Cues rápidos de execução</p>
            <p className="text-xs text-text-secondary">Pequenos lembretes para entrar no exercício com boa técnica.</p>
          </div>
        </div>

        <div className="grid gap-2">
          {coachingCues.length > 0 ? coachingCues.slice(0, 4).map((cue, index) => (
            <div key={`${cue}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-bg-primary px-3 py-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                <DSIcon name="checkCircle2" size={14} />
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{cue}</p>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-bg-primary px-3 py-4 text-sm text-text-secondary">
              Os cues detalhados serão enriquecidos conforme o catálogo premium evoluir.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InstructionsTab({
  steps,
  cues,
  gallery,
  transcription,
  onOpenGallery,
}: {
  steps: string[]
  cues: string[]
  gallery: GalleryItem[]
  transcription: string | null
  onOpenGallery: (index?: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-text-primary">Kit de demonstração</p>
            <p className="text-xs text-text-secondary">Abra a mídia e revise o movimento antes de executar.</p>
          </div>
          <Button variant="soft" size="sm" onClick={() => onOpenGallery(0)} disabled={gallery.length === 0}>
            <DSIcon name="images" size={14} />
            Abrir mídia
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-bg-primary px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Vídeos</p>
            <p className="mt-1 text-lg font-black text-text-primary">{gallery.filter((item) => item.type === 'video').length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-bg-primary px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Imagens</p>
            <p className="mt-1 text-lg font-black text-text-primary">{gallery.filter((item) => item.type === 'image').length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-bg-primary px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Cues</p>
            <p className="mt-1 text-lg font-black text-text-primary">{cues.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
        <p className="mb-3 text-sm font-bold text-text-primary">Passo a passo</p>

        {steps.length > 0 ? (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={`${step}-${index}`} className="flex gap-3 rounded-2xl border border-white/8 bg-bg-primary px-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/12 text-sm font-black text-brand-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-relaxed text-text-secondary">{step}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-bg-primary px-3 py-4 text-sm text-text-secondary">
            As instruções detalhadas ainda serão enriquecidas. Por enquanto, use a mídia disponível e os cues rápidos.
          </div>
        )}
      </div>

      {(cues.length > 0 || transcription) && (
        <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
          <p className="mb-3 text-sm font-bold text-text-primary">Orientações extras</p>

          {cues.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {cues.map((cue, index) => (
                <span key={`${cue}-${index}`} className="rounded-full border border-brand-primary/18 bg-brand-primary/8 px-3 py-1 text-[11px] font-medium text-brand-primary">
                  {cue}
                </span>
              ))}
            </div>
          )}

          {transcription && (
            <div className="rounded-2xl border border-white/8 bg-bg-primary p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Transcrição / contexto</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{transcription}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EquipmentTab({ equipment }: { equipment: string[] }) {
  if (equipment.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary">
          <DSIcon name="shield" size={28} />
        </div>
        <p className="mt-4 text-lg font-black text-text-primary">Peso corporal</p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Este exercício pode ser executado sem equipamento adicional, ideal para treinos rápidos ou ambiente com pouca estrutura.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
        <p className="mb-3 text-sm font-bold text-text-primary">Equipamentos necessários</p>
        <div className="grid gap-3">
          {equipment.map((raw) => {
            const key = normalizeEquipmentKey(raw)
            const meta = EQUIPMENT_META[key] || { label: raw, icon: 'wrench' as const }

            return (
              <div key={raw} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-bg-primary p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-brand-primary">
                  <DSIcon name={meta.icon} size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{meta.label}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Garanta ajuste estável e amplitude segura antes de iniciar a série.
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-bg-secondary p-4">
        <div className="mb-2 flex items-center gap-2 text-brand-primary">
          <DSIcon name="info" size={16} />
          <p className="text-sm font-bold text-text-primary">Próxima evolução</p>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          O catálogo visual dos equipamentos será integrado na próxima entrega do painel admin, usando o mesmo fluxo R2 da mídia dos exercícios.
        </p>
      </div>
    </div>
  )
}

function ExerciseDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const id = (searchParams.get('id') || (params.id as string) || '').trim()

  const [activeTab, setActiveTab] = useState<DetailTab>('target')
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

  const { data: exercise, isLoading } = useExerciseDetail(id)
  const { data: media = [] } = useExerciseMedia(id)
  const { isFavorite, toggleFavorite } = useFavoriteExercises()

  const difficulty = exercise ? (DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.beginner) : DIFFICULTY_MAP.beginner

  const equipment = useMemo(() => parseEquipment(exercise?.equipment_needed || null), [exercise?.equipment_needed])
  const steps = useMemo(() => parseInstructionBlocks(exercise?.description_pt || exercise?.description || null), [exercise?.description, exercise?.description_pt])
  const coachingCues = useMemo(() => parseDelimitedList(exercise?.coaching_cues || null), [exercise?.coaching_cues])
  const tags = useMemo(() => parseDelimitedList(exercise?.tags || null), [exercise?.tags])
  const gallery = useMemo(() => buildGallery(exercise, media), [exercise, media])

  function openGallery(index = 0) {
    setActiveGalleryIndex(index)
    setIsMediaOpen(true)
  }

  function openInstructions() {
    setActiveTab('instructions')
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/6" />
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/6" />
        </div>
        <div className="h-90 animate-pulse rounded-[2rem] bg-white/4" />
        <div className="mt-4 space-y-3">
          <div className="h-6 w-52 animate-pulse rounded bg-white/6" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-28 animate-pulse rounded-3xl bg-white/4" />
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <button
          aria-label="Voltar"
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-text-primary"
        >
          <DSIcon name="arrowLeft" size={18} />
        </button>
        <div className="rounded-[2rem] border border-white/8 bg-bg-secondary p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-text-muted">
            <DSIcon name="alertTriangle" size={28} />
          </div>
          <h2 className="mt-4 text-lg font-black text-text-primary">Exercício não encontrado</h2>
          <p className="mt-2 text-sm text-text-secondary">Verifique o link ou retorne para a biblioteca de exercícios.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pb-40 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            aria-label="Voltar"
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-text-primary transition-all hover:bg-white/6"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>

          <button
            type="button"
            aria-label={isFavorite(exercise.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={() => toggleFavorite(exercise.id)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-text-primary transition-all hover:bg-white/6"
          >
            <DSIcon name="heart" size={18} className={isFavorite(exercise.id) ? 'fill-red-400 text-red-400' : 'text-text-primary'} />
          </button>
        </div>

        <HeroStage title={exercise.name_pt || exercise.name} gallery={gallery} onOpenGallery={openGallery} />

        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {exercise.muscle_group && (
              <span className="rounded-full border border-brand-primary/18 bg-brand-primary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                {exercise.muscle_group.name_pt}
              </span>
            )}
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${difficulty.chip}`}>
              {difficulty.label}
            </span>
            {exercise.view_count >= 100 && (
              <span className="rounded-full border border-emerald-500/18 bg-emerald-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                Muito popular
              </span>
            )}
          </div>

          <h1 className="text-[2.4rem] font-black leading-[0.96] tracking-tight text-text-primary">
            {exercise.name_pt || exercise.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {exercise.description_pt || exercise.description || 'Detalhe premium com mídia real, cues técnicos e visual moderno do ecossistema VFIT.'}
          </p>
        </div>

        <div ref={contentRef} className="mt-5 rounded-[2rem] border border-white/8 bg-bg-secondary p-2">
          <div className="grid grid-cols-3 gap-1">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-2 py-3 text-[12px] font-bold uppercase tracking-[0.12em] transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.12)]'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <DSIcon name={tab.icon} size={14} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'target' && <TargetTab exercise={exercise} coachingCues={coachingCues} tags={tags} />}
          {activeTab === 'instructions' && (
            <InstructionsTab
              steps={steps}
              cues={coachingCues}
              gallery={gallery}
              transcription={exercise.transcription_pt}
              onOpenGallery={openGallery}
            />
          )}
          {activeTab === 'equipment' && <EquipmentTab equipment={equipment} />}
        </div>
      </div>

      <StickyActions hasMedia={gallery.length > 0} onViewMedia={() => openGallery(0)} onOpenInstructions={openInstructions} />

      {isMediaOpen && (
        <MediaModal
          gallery={gallery}
          activeIndex={activeGalleryIndex}
          onClose={() => setIsMediaOpen(false)}
          onSelect={setActiveGalleryIndex}
        />
      )}
    </>
  )
}

function ExerciseDetailSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/6" />
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/6" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-white/6" />
      <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/6" />
    </div>
  )
}

export default function ExerciseDetailPage() {
  return (
    <Suspense fallback={<ExerciseDetailSkeleton />}>
      <ExerciseDetailContent />
    </Suspense>
  )
}
