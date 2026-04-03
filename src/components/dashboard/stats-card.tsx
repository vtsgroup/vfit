/**
 * src/components/dashboard/stats-card.tsx
 *
 * Stats Card — MD3 + Apple-style Premium
 *
 * Exports: StatsCard, StatsGridSkeleton
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Stats Card — MD3 + Apple-style Premium
// v3.0: Surface elevation, spring physics, state layers
// ============================================

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: DSIconName
  description?: string
  tone?: 'default' | 'hero-dark'
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'accent'
  loading?: boolean
}

const colorMap = {
  primary: {
    icon: 'bg-brand-primary/12 text-brand-primary',
    iconGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    gradient: 'from-brand-primary/6 via-transparent to-transparent',
    border: 'hover:border-brand-primary/20',
    trendPositive: 'text-brand-primary',
  },
  success: {
    icon: 'bg-success/10 text-success',
    iconGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    gradient: 'from-success/5 via-transparent to-transparent',
    border: 'hover:border-success/20',
    trendPositive: 'text-success',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    iconGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    gradient: 'from-warning/5 via-transparent to-transparent',
    border: 'hover:border-warning/20',
    trendPositive: 'text-warning',
  },
  error: {
    icon: 'bg-error/10 text-error',
    iconGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    gradient: 'from-error/5 via-transparent to-transparent',
    border: 'hover:border-error/20',
    trendPositive: 'text-error',
  },
  info: {
    icon: 'bg-info/10 text-info',
    iconGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    gradient: 'from-info/5 via-transparent to-transparent',
    border: 'hover:border-info/20',
    trendPositive: 'text-info',
  },
  accent: {
    icon: 'bg-brand-accent/10 text-brand-accent',
    iconGlow: 'shadow-[0_0_20px_rgba(132,204,22,0.2)]',
    gradient: 'from-brand-accent/6 via-transparent to-transparent',
    border: 'hover:border-brand-accent/20',
    trendPositive: 'text-brand-accent',
  },
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  tone = 'default',
  trend,
  color = 'primary',
  loading = false,
}: StatsCardProps) {
  const colors = colorMap[color]
  const isHero = tone === 'hero-dark'

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-3 sm:p-5 transition-all duration-300',
        'glass-premium card-shine',
        isHero && 'stats-card-hero',
        'hover:shadow-(--shadow-glass-premium-hover)',
        colors.border
      )}
    >
      {/* State layer — MD3 hover/focus overlay */}
      <div
        className={cn(
          'absolute inset-0 z-1 transition-opacity duration-300',
          'opacity-0 group-hover:opacity-100',
          'bg-linear-to-br',
          isHero ? 'from-white/4 via-transparent to-transparent' : colors.gradient
        )}
      />
      
      {/* Top edge specular highlight — Apple style */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-2 h-px bg-linear-to-r from-transparent via-white/12 to-transparent" />
      
      <div className="relative z-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p
              className={cn('text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary')}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            >{title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-black/6 dark:bg-white/6" />
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.08 }}
                className={cn(
                  'mt-1 text-lg sm:text-2xl font-bold tracking-tight truncate font-syne ds-stat-value',
                  isHero ? 'text-kpi-text' : 'text-text-primary'
                )}
              >
                {value}
              </motion.p>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.12, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className={cn(
              'flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300',
              isHero 
                ? 'bg-black/6 dark:bg-white/8 text-text-primary border border-border-light group-hover:bg-black/10 dark:group-hover:bg-white/12 group-hover:border-border-dark dark:group-hover:border-white/16 group-hover:shadow-elevation-2' 
                : cn(colors.icon, colors.iconGlow, 'border border-current/8')
            )}
          >
            <DSIcon name={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
        </div>

        {(description || trend) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-3 flex items-center gap-2 text-xs"
          >
            {trend && (
              <span className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                trend.positive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-error/10 text-error'
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-text-secondary">{description}</span>
            )}
            {trend && <span className="text-text-secondary">{trend.label}</span>}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Stats Grid skeleton
// ============================================

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-xl p-3 sm:p-5 overflow-hidden relative">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_linear_infinite] bg-linear-to-r from-transparent via-brand-primary/4 to-transparent" />
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-3 sm:h-4 w-16 sm:w-20 rounded bg-black/6 dark:bg-white/6" />
              <div className="mt-2 sm:mt-3 h-6 sm:h-8 w-20 sm:w-28 rounded-lg bg-black/6 dark:bg-white/6" />
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-black/6 dark:bg-white/6" />
          </div>
          <div className="mt-2 sm:mt-3 h-3 w-24 sm:w-32 rounded bg-black/6 dark:bg-white/6" />
        </div>
      ))}
    </div>
  )
}
