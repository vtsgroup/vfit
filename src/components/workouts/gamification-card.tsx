/**
 * src/components/workouts/gamification-card.tsx
 *
 * Gamification Card — XP, Level, Streak display
 *
 * Exports: calculateLevel, GamificationCard, XPEarnedBanner
 * Features: 'use client' · DSIcon
 */

// ============================================
// Gamification Card — XP, Level, Streak display
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

// ============================================
// XP / Level calculation
// ============================================

export function calculateLevel(totalWorkouts: number, totalBadges: number) {
  const xp = totalWorkouts * 50 + totalBadges * 100
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const currentLevelXp = Math.pow(level - 1, 2) * 100
  const nextLevelXp = Math.pow(level, 2) * 100
  const progress = nextLevelXp > currentLevelXp
    ? (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)
    : 0
  return { level, xp, nextLevelXp, progress: Math.min(1, Math.max(0, progress)) }
}

// ============================================
// Full Gamification Card
// ============================================

interface GamificationCardProps {
  totalWorkouts: number
  currentStreak: number
  longestStreak: number
  totalBadges: number
  className?: string
}

export function GamificationCard({
  totalWorkouts,
  currentStreak,
  longestStreak,
  totalBadges,
  className,
}: GamificationCardProps) {
  const { level, xp, progress } = calculateLevel(totalWorkouts, totalBadges)

  return (
    <div className={cn('rounded-xl border border-border-light bg-bg-secondary p-5', className)}>
      {/* Level + XP Bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
            <DSIcon name="flame" size={20} className="text-brand-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Nível {level}</p>
            <p className="text-xs text-text-muted">{xp} XP</p>
          </div>
        </div>
        <span className="text-xs text-text-muted">{Math.round(progress * 100)}%</span>
      </div>

      {/* XP Progress bar */}
      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-all duration-700"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-lg bg-bg-primary/50 p-2.5">
          <DSIcon
            name="flame"
            size={20}
            className={cn(
              currentStreak >= 7
                ? 'text-error animate-pulse'
                : currentStreak >= 3
                  ? 'text-warning'
                  : 'text-text-muted'
            )}
          />
          <span className="text-lg font-bold text-text-primary">{currentStreak}</span>
          <span className="text-[10px] text-text-muted">Streak · rec. {longestStreak}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-bg-primary/50 p-2.5">
          <DSIcon name="star" size={20} className="text-warning" />
          <span className="text-lg font-bold text-text-primary">{totalWorkouts}</span>
          <span className="text-[10px] text-text-muted">Treinos</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-bg-primary/50 p-2.5">
          <DSIcon name="trophy" size={20} className="text-brand-accent" />
          <span className="text-lg font-bold text-text-primary">{totalBadges}</span>
          <span className="text-[10px] text-text-muted">Badges</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// XP Earned Banner (for celebration screen)
// ============================================

interface XPEarnedBannerProps {
  xpEarned: number
  newBadges: Array<{ type: string; name: string; icon: string }>
}

export function XPEarnedBanner({ xpEarned, newBadges }: XPEarnedBannerProps) {
  return (
    <div className="space-y-3">
      {/* XP earned */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-accent/10 p-4">
        <DSIcon name="flame" className="text-brand-accent" />
        <span className="text-2xl font-bold text-brand-accent">+{xpEarned} XP</span>
      </div>

      {/* New badges */}
      {newBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-center text-sm font-semibold text-text-primary">
            Nova Conquista!
          </p>
          {newBadges.map((badge) => (
            <div
              key={badge.type}
              className="flex items-center gap-3 rounded-xl bg-warning/10 p-3"
            >
              <span className="text-3xl">{badge.icon}</span>
              <div>
                <p className="font-bold text-text-primary">{badge.name}</p>
                <p className="text-xs text-text-muted">Parabéns pela conquista!</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
