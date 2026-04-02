/**
 * src/components/dashboard/progress-rings.tsx
 *
 * Weekly Progress Ring — Animated ring chart
 *
 * Exports: WeeklyProgressRing, StreakRing, XpProgress
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Weekly Progress Ring — Animated ring chart
// Shows days trained vs weekly goal
// ============================================

'use client'

import { motion } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

interface WeeklyProgressRingProps {
  daysCompleted: number
  daysGoal: number
  label?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function WeeklyProgressRing({
  daysCompleted,
  daysGoal,
  label = 'Meta semanal',
  size = 140,
  strokeWidth = 10,
  className,
}: WeeklyProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(daysCompleted / Math.max(daysGoal, 1), 1)
  const offset = circumference * (1 - progress)
  const isComplete = daysCompleted >= daysGoal

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border-light)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? 'url(#ring-complete)' : 'url(#ring-progress)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
          <defs>
            <linearGradient id="ring-progress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#3DFC94" />
            </linearGradient>
            <linearGradient id="ring-complete" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-2xl font-black text-text-primary"
          >
            {daysCompleted}/{daysGoal}
          </motion.span>
          <span className="text-[10px] font-medium text-text-muted">dias</span>
        </div>

        {/* Completion glow */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.2)]"
          />
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-text-secondary">{label}</p>
        {isComplete && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-0.5 text-[10px] font-bold text-amber-500 dark:text-amber-400"
          >
            Meta atingida!
          </motion.p>
        )}
      </div>
    </div>
  )
}

// ============================================
// Streak Ring — Current streak visualizer
// ============================================

interface StreakRingProps {
  currentStreak: number
  longestStreak: number
  size?: number
  className?: string
}

export function StreakRing({
  currentStreak,
  longestStreak,
  size = 120,
  className,
}: StreakRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const maxStreak = Math.max(longestStreak, 30) // at least 30 days scale
  const progress = Math.min(currentStreak / maxStreak, 1)
  const offset = circumference * (1 - progress)
  const isOnFire = currentStreak >= 7

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border-light)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOnFire ? 'url(#streak-fire)' : 'url(#streak-normal)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
          <defs>
            <linearGradient id="streak-fire" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="streak-normal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOnFire ? (
            <DSIcon name="flame" size={20} className="text-orange-500" />
          ) : (
            <DSIcon name="flame" size={20} className="text-emerald-500" />
          )}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-black text-text-primary"
          >
            {currentStreak}
          </motion.span>
          <span className="text-[9px] font-medium text-text-muted">dias</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-text-secondary">Streak atual</p>
        <p className="text-[10px] text-text-muted">Recorde: {longestStreak} dias</p>
      </div>
    </div>
  )
}

// ============================================
// XP Progress Bar — Level progress
// ============================================

interface XpProgressProps {
  currentXp: number
  nextLevelXp: number
  level: number
  className?: string
}

export function XpProgress({
  currentXp,
  nextLevelXp,
  level,
  className,
}: XpProgressProps) {
  const progress = Math.min(currentXp / Math.max(nextLevelXp, 1), 1)

  return (
    <div className={cn('rounded-2xl border border-border-light bg-kpi-dark p-4 backdrop-blur-sm shadow-elevation-1', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
            <DSIcon name="flame" size={16} className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Nível {level}</p>
            <p className="text-[10px] text-text-muted">{currentXp} / {nextLevelXp} XP</p>
          </div>
        </div>
        <span className="text-xs font-bold text-violet-500 dark:text-violet-400">{Math.round(progress * 100)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/6 dark:bg-white/6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full rounded-full bg-linear-to-r from-violet-500 to-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
        />
      </div>
    </div>
  )
}
