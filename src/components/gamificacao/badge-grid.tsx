/**
 * src/components/gamificacao/badge-grid.tsx
 *
 * Sprint 33 — Grid de badges (locked / unlocked)
 */

'use client'

import { cn } from '@/lib/utils'
import type { Badge } from '@/hooks/use-gamification'

interface BadgeGridProps {
  badges: Badge[]
  className?: string
}

export function BadgeGrid({ badges, className }: BadgeGridProps) {
  const unlocked = badges.filter((b) => b.unlocked)
  const locked = badges.filter((b) => !b.unlocked)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desbloqueados */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            Conquistados ({unlocked.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {unlocked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Bloqueados */}
      {locked.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-secondary">
            Bloqueados ({locked.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl p-3 text-center transition-all',
        badge.unlocked
          ? 'bg-brand-primary/10 shadow-sm'
          : 'bg-bg-tertiary opacity-50 grayscale'
      )}
    >
      <span className="text-3xl">{badge.icon}</span>
      <p
        className={cn(
          'mt-1.5 text-xs font-semibold leading-tight',
          badge.unlocked ? 'text-text-primary' : 'text-text-muted'
        )}
      >
        {badge.name}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-text-muted">
        {badge.description}
      </p>
      {badge.unlocked && (
        <span className="mt-1 text-[10px] font-bold text-brand-primary">
          +{badge.points} XP
        </span>
      )}
    </div>
  )
}
