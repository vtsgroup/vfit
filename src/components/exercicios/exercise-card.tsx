/**
 * src/components/exercicios/exercise-card.tsx
 *
 * Exercise Card — reusable card for exercise library
 *
 * Exports: ExerciseCard
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import type { Exercise } from '@/hooks/use-exercises'

// ============================================
// Difficulty map
// ============================================

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Iniciante', color: 'bg-green-500/15 text-green-400' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/15 text-amber-400' },
  advanced: { label: 'Avançado', color: 'bg-red-500/15 text-red-400' },
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
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick?: () => void
}

export function ExerciseCard({ exercise, muscleGroupName, isFavorite, onToggleFavorite, onClick }: ExerciseCardProps) {
  const diff = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.beginner
  const emoji = MUSCLE_EMOJI[exercise.muscle_group_id] || '💪'

  let equipment: string[] = []
  try {
    equipment = JSON.parse(exercise.equipment_needed || '[]')
  } catch {
    equipment = []
  }

  return (
    <div
      className="group relative flex items-center gap-3 rounded-2xl border border-white/6 bg-white/3 p-3 transition-all hover:bg-white/6 active:scale-[0.98]"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Thumbnail / Emoji fallback */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
        {exercise.thumbnail_url ? (
          <img
            src={exercise.thumbnail_url}
            alt={exercise.name_pt}
            className="h-14 w-14 rounded-xl object-cover"
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold text-white leading-tight">
          {exercise.name_pt || exercise.name}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          {muscleGroupName && (
            <span className="text-[11px] text-zinc-500">{muscleGroupName}</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        {equipment.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {equipment.slice(0, 2).map((eq) => (
              <span key={eq} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
                {eq}
              </span>
            ))}
            {equipment.length > 2 && (
              <span className="text-[10px] text-zinc-600">+{equipment.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all hover:bg-white/10"
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        {isFavorite ? (
          <DSIcon name="heart" size={18} className="text-red-400 fill-red-400" />
        ) : (
          <DSIcon name="heart" size={18} className="text-zinc-600" />
        )}
      </button>
    </div>
  )
}
