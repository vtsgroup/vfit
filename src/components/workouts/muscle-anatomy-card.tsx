/**
 * src/components/workouts/muscle-anatomy-card.tsx
 *
 * MuscleAnatomyCard — Exibe imagem/placeholder do músculo primário e lista de músculos secundários
 *
 * Exports: MuscleAnatomyCard
 * Props: primaryMuscleId, secondaryMuscleIds, size, showSecondary
 */

'use client'

import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import { useMuscleGroups } from '@/hooks/use-exercises'
import type { MuscleGroup } from '@/hooks/use-exercises'

// ============================================
// Types
// ============================================

interface MuscleAnatomyCardProps {
  /** ID do grupo muscular primário */
  primaryMuscleId?: string | null
  /** IDs dos grupos musculares secundários */
  secondaryMuscleIds?: string[]
  /** Tamanho do card */
  size?: 'sm' | 'md' | 'lg'
  /** Exibir seção de músculos secundários */
  showSecondary?: boolean
  /** Classe adicional no container */
  className?: string
}

// ============================================
// Helpers
// ============================================

const SIZE_CONFIG = {
  sm: { img: 'h-20', text: 'text-xs', badge: 'text-[10px] px-1.5 py-px' },
  md: { img: 'h-28', text: 'text-sm', badge: 'text-xs px-2 py-0.5' },
  lg: { img: 'h-40', text: 'text-base', badge: 'text-sm px-2.5 py-1' },
}

function MusclePlaceholder({
  muscle,
  sizeClass,
}: {
  muscle?: MuscleGroup
  sizeClass: string
}) {
  const color = muscle?.color_hex ?? '#22C55E'

  return (
    <div
      className={cn('w-full rounded-xl flex flex-col items-center justify-center gap-2', sizeClass)}
      style={{ backgroundColor: `${color}14`, border: `1.5px solid ${color}30` }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}22` }}
      >
        <DSIcon name="activity" size={20} style={{ color }} />
      </div>
      {muscle && (
        <p className="text-xs font-semibold" style={{ color }}>
          {muscle.name_pt || muscle.name}
        </p>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function MuscleAnatomyCard({
  primaryMuscleId,
  secondaryMuscleIds = [],
  size = 'md',
  showSecondary = true,
  className,
}: MuscleAnatomyCardProps) {
  const { data: muscleGroups = [] } = useMuscleGroups()

  const cfg = SIZE_CONFIG[size]

  // Resolve muscle group objects
  const allGroups = muscleGroups.flatMap((g) => [g, ...(g.sub_muscles ?? [])])

  const primaryMuscle = primaryMuscleId
    ? allGroups.find((m) => m.id === primaryMuscleId)
    : undefined

  const secondaryMuscles = secondaryMuscleIds
    .map((id) => allGroups.find((m) => m.id === id))
    .filter(Boolean) as MuscleGroup[]

  // Detecta super admin
  const isSuperAdmin = typeof window !== 'undefined' && useAuthStore.getState?.().isSuperAdmin?.()

  return (
    <div className={cn('space-y-3', className)}>
      {/* ─── Primary muscle image ─── */}
      <div className="space-y-1.5">
        <p className={cn('font-semibold text-text-primary', cfg.text)}>
          Músculo Principal
        </p>

        {primaryMuscle ? (
          (() => {
            const src = isSuperAdmin
              ? primaryMuscle.image_male_url || primaryMuscle.image_url
              : primaryMuscle.image_female_url || primaryMuscle.image_male_url || primaryMuscle.image_url
            if (src && typeof src === 'string') {
              return (
                <div className={cn('relative w-full overflow-hidden rounded-xl', cfg.img)}>
                  <Image
                    src={src}
                    alt={primaryMuscle.name_pt || primaryMuscle.name}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent px-3 pb-2 pt-6">
                    <p className="text-sm font-semibold text-white">
                      {primaryMuscle.name_pt || primaryMuscle.name}
                    </p>
                  </div>
                </div>
              )
            }
            return <MusclePlaceholder muscle={primaryMuscle} sizeClass={cfg.img} />
          })()
        ) : (
          <MusclePlaceholder muscle={primaryMuscle} sizeClass={cfg.img} />
        )}

        {/* Muscle name badge */}
        {primaryMuscle && (
          <div
            className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', cfg.badge)}
            style={{
              backgroundColor: `${primaryMuscle.color_hex ?? '#22C55E'}18`,
              color: primaryMuscle.color_hex ?? '#22C55E',
              border: `1px solid ${primaryMuscle.color_hex ?? '#22C55E'}35`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: primaryMuscle.color_hex ?? '#22C55E' }}
            />
            {primaryMuscle.name_pt || primaryMuscle.name}
          </div>
        )}
      </div>

      {/* ─── Secondary muscles ─── */}
      {showSecondary && secondaryMuscles.length > 0 && (
        <div className="space-y-1.5">
          <p className={cn('font-medium text-text-muted', cfg.text)}>
            Músculos Secundários
          </p>
          <div className="flex flex-wrap gap-1.5">
            {secondaryMuscles.map((m) => (
              <span
                key={m.id}
                className={cn('inline-flex items-center gap-1 rounded-full font-medium', cfg.badge)}
                style={{
                  backgroundColor: `${m.color_hex ?? '#64748B'}12`,
                  color: m.color_hex ?? '#94A3B8',
                  border: `1px solid ${m.color_hex ?? '#64748B'}25`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full opacity-70"
                  style={{ backgroundColor: m.color_hex ?? '#64748B' }}
                />
                {m.name_pt || m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Fallback: nenhum músculo definido ─── */}
      {!primaryMuscle && !primaryMuscleId && (
        <div className={cn('w-full rounded-xl flex items-center justify-center gap-2 border border-dashed border-border-light bg-bg-secondary text-text-muted', cfg.img)}>
          <DSIcon name="activity" size={20} />
          <span className={cfg.text}>Músculo não definido</span>
        </div>
      )}
    </div>
  )
}
