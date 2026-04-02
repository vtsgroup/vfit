/**
 * src/components/ui/md3-progress.tsx
 *
 * MD3 Progress — Linear + Circular + Skeleton
 *
 * Exports: LinearProgress, CircularProgress, StepProgress
 * Features: 'use client' · Framer Motion
 */

// ============================================
// MD3 Progress — Linear + Circular + Skeleton
// Material Design 3 + Apple-smooth animations
// ============================================

'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================
// Linear Progress Bar
// ============================================

interface LinearProgressProps {
  /** Progress value 0-100 */
  value: number
  /** Visual style */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand'
  /** Size preset */
  size?: 'sm' | 'md' | 'lg'
  /** Show value label */
  showLabel?: boolean
  /** Custom label */
  label?: string
  /** Enable shimmer animation on bar */
  shimmer?: boolean
  /** Indeterminate (loading) state */
  indeterminate?: boolean
  className?: string
}

const colorMap = {
  default: 'from-brand-primary to-brand-mint',
  success: 'from-emerald-400 to-emerald-500',
  warning: 'from-amber-400 to-amber-500',
  error: 'from-red-400 to-red-500',
  brand: 'from-brand-primary via-brand-mint to-brand-accent',
}

const trackColorMap = {
  default: 'bg-brand-primary/10',
  success: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  error: 'bg-red-500/10',
  brand: 'bg-brand-primary/8',
}

const sizeMap = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

export function LinearProgress({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  shimmer = true,
  indeterminate = false,
  className,
}: LinearProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-(--on-surface-variant)">{label}</span>}
          {showLabel && (
            <span className="tabular-nums font-semibold text-(--on-surface)">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', trackColorMap[variant], sizeMap[size])}>
        {indeterminate ? (
          <motion.div
            className={cn('h-full rounded-full bg-linear-to-r', colorMap[variant])}
            initial={{ x: '-100%', width: '40%' }}
            animate={{ x: '250%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            className={cn('h-full rounded-full bg-linear-to-r relative', colorMap[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {shimmer && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent bg-size-[200%_100%] animate-shimmer" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Circular Progress (Ring)
// ============================================

interface CircularProgressProps {
  /** Progress value 0-100 */
  value: number
  /** Outer size in px */
  size?: number
  /** Ring stroke width */
  strokeWidth?: number
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand'
  /** Show percentage in center */
  showLabel?: boolean
  /** Custom center content */
  children?: React.ReactNode
  className?: string
}

const circleColorMap = {
  default: 'stroke-brand-primary',
  success: 'stroke-emerald-500',
  warning: 'stroke-amber-500',
  error: 'stroke-red-500',
  brand: 'stroke-brand-primary',
}

const trackCircleColor = 'stroke-(--outline-variant)'

export function CircularProgress({
  value,
  size: ringSize = 48,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  children,
  className,
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: ringSize, height: ringSize }}>
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        className="md3-progress-circular"
      >
        {/* Track */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackCircleColor}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={circleColorMap[variant]}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {(showLabel || children) && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <span className="text-xs font-bold tabular-nums text-(--on-surface)">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Step Progress (Horizontal steps)
// ============================================

interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step} className={cn('flex items-center gap-2', !isLast && 'flex-1')}>
            {/* Step circle */}
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
              isCompleted && 'bg-brand-primary text-white shadow-[0_0_12px_rgba(34,197,94,0.2)]',
              isCurrent && 'bg-brand-primary/15 text-brand-primary border-2 border-brand-primary shadow-[0_0_16px_rgba(34,197,94,0.15)]',
              !isCompleted && !isCurrent && 'bg-(--surface-container) text-(--on-surface-variant) border border-(--outline-variant)'
            )}>
              {isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step label (hidden on small screens) */}
            <span className={cn(
              'hidden sm:block text-xs font-medium whitespace-nowrap',
              isCompleted && 'text-brand-primary',
              isCurrent && 'text-(--on-surface) font-semibold',
              !isCompleted && !isCurrent && 'text-(--on-surface-variant)'
            )}>
              {step}
            </span>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 h-px mx-1">
                <div className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isCompleted ? 'bg-brand-primary' : 'bg-(--outline-variant)'
                )} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
