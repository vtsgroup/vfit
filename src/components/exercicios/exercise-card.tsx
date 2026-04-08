/**
 * src/components/exercicios/exercise-card.tsx
 *
 * Exercise Card — reusable card for exercise library
 *
 * Exports: ExerciseCard
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import type { Exercise, MuscleGroup } from '@/hooks/use-exercises'

// ============================================
// Difficulty map
// ============================================

const DIFFICULTY_MAP: Record<string, { label: string; tone: string; pill: string }> = {
  beginner: {
    label: 'Iniciante',
    tone: 'text-emerald-300',
    pill: 'border-emerald-500/20 bg-emerald-500/12 text-emerald-300',
  },
  intermediate: {
    label: 'Intermediário',
    tone: 'text-amber-300',
    pill: 'border-amber-500/20 bg-amber-500/12 text-amber-300',
  },
  advanced: {
    label: 'Avançado',
    tone: 'text-rose-300',
    pill: 'border-rose-500/20 bg-rose-500/12 text-rose-300',
  },
}

// ============================================
// Muscle group emoji map
// ============================================

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '🫁',
  back: '🔙',
  shoulders: '💪',
  biceps: '💪',
  triceps: '💪',
  legs: '🦵',
  quadriceps: '🦵',
  hamstrings: '🦵',
  glutes: '🍑',
  calves: '🦶',
  abs: '🧱',
  core: '🧱',
  forearms: '🤛',
  traps: '🔺',
  full_body: '🏋️',
}

// ============================================
// Component
// ============================================

interface ExerciseCardProps {
  exercise: Exercise
  muscleGroupName?: string
  muscleGroup?: MuscleGroup
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick?: () => void
}

export function ExerciseCard({
  exercise,
  muscleGroupName,
  muscleGroup,
  isFavorite,
  onToggleFavorite,
  onClick,
}: ExerciseCardProps) {
  const diff = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.beginner
  const emoji = MUSCLE_EMOJI[exercise.muscle_group_id] || '💪'
  const anatomyImage = muscleGroup?.image_url || exercise.thumbnail_url
  const muscleColor = muscleGroup?.color_hex || '#22C55E'
  const hasVideo = Boolean(exercise.video_url_vertical || exercise.video_url_horizontal)

  let equipment: string[] = []
  try {
    equipment = JSON.parse(exercise.equipment_needed || '[]')
  } catch {
    equipment = []
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-3.5 backdrop-blur-xl transition-all duration-300',
        'shadow-[0_10px_30px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.05)_inset]',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-brand-primary/18 hover:bg-white/6 hover:shadow-[0_16px_40px_rgba(0,0,0,0.24),0_0_0_1px_rgba(34,197,94,0.08)_inset] active:scale-[0.985]'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start gap-3">
        {/* Visual anatômico / thumb */}
        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
          {anatomyImage ? (
            <img
              src={anatomyImage}
              alt={exercise.name_pt || exercise.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-3xl"
              style={{ background: `linear-gradient(180deg, ${muscleColor}24 0%, rgba(255,255,255,0.02) 100%)` }}
            >
              <span>{emoji}</span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/70 via-black/35 to-transparent px-2 pb-1.5 pt-5">
            <span className="rounded-full border border-white/10 bg-black/35 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Exercício
            </span>
            {hasVideo && <DSIcon name="play" size={12} className="text-white/90" />}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight text-white">
                {exercise.name_pt || exercise.name}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-text-muted">
                {muscleGroupName || 'Grupo muscular'}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/4 transition-all hover:bg-white/10"
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFavorite ? (
                <DSIcon name="heart" size={18} className="fill-rose-400 text-rose-400" />
              ) : (
                <DSIcon name="heart" size={18} className="text-white/45" />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]', diff.pill)}>
              {diff.label}
            </span>
            <span
              className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ backgroundColor: `${muscleColor}14`, color: muscleColor }}
            >
              Anatomia
            </span>
            {hasVideo && (
              <span className="rounded-full border border-brand-primary/20 bg-brand-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-primary">
                Vídeo
              </span>
            )}
          </div>

          {exercise.description_pt && (
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/70">
              {exercise.description_pt}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {equipment.slice(0, 3).map((eq) => (
              <span key={eq} className="rounded-xl border border-white/8 bg-white/4 px-2 py-1 text-[10px] font-medium text-white/75">
                {eq}
              </span>
            ))}
            {equipment.length === 0 && (
              <span className="rounded-xl border border-dashed border-white/10 px-2 py-1 text-[10px] text-white/45">
                Sem equipamento específico
              </span>
            )}
            {equipment.length > 3 && (
              <span className="rounded-xl border border-white/8 bg-white/4 px-2 py-1 text-[10px] font-medium text-white/60">
                +{equipment.length - 3}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-[11px] text-white/50">
            <span className="inline-flex items-center gap-1">
              <DSIcon name="activity" size={12} className={diff.tone} />
              {exercise.view_count > 0 ? `${exercise.view_count} visualizações` : 'Novo na biblioteca'}
            </span>
            <span className="inline-flex items-center gap-1">
              <DSIcon name="target" size={12} style={{ color: muscleColor }} />
              {muscleGroupName || 'Músculo principal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
