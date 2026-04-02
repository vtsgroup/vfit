/**
 * src/components/ui/stats-card.tsx
 *
 * StatsCard — DS v3 Stats Card Component
 *
 * Exports: StatsCardProps, StatsCard
 * Features: DSIcon
 */

// ============================================
// StatsCard — DS v3 Stats Card Component
// Based on vfit-design-system-v2.jsx "Stats Cards" section
// ============================================

import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'

interface StatsCardBadge {
  text: string
  /** Tailwind text color class, e.g. "text-emerald-500" */
  color?: string
  icon?: DSIconName
}

export interface StatsCardProps {
  icon: DSIconName
  /** Tailwind bg class for icon container, e.g. "bg-emerald-500/10" */
  iconBgColor?: string
  /** Tailwind text color class for icon, e.g. "text-emerald-500" */
  iconColor?: string
  /** Hex color for icon — takes precedence when inline color needed */
  accent?: string
  label: string
  value: string | number
  badge?: StatsCardBadge
  /** Tailwind class for left border accent, e.g. "border-l-emerald-500" */
  borderColor?: string
  onClick?: () => void
  className?: string
  /** Animation delay for staggered entrance (ms) */
  animationDelay?: number
}

export function StatsCard({
  icon,
  iconBgColor = 'bg-brand-primary/10',
  iconColor = 'text-brand-primary',
  accent,
  label,
  value,
  badge,
  borderColor,
  onClick,
  className,
  animationDelay,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
      className={cn(
        // Surface — DS v4 tokens
        'rounded-2xl border border-border-light bg-bg-secondary',
        'shadow-card',
        // Light mode overrides
        'light:bg-white light:border-slate-200/60 light:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
        // Hover
        'transition-all duration-300 ease-out-expo',
        'hover:-translate-y-1 hover:shadow-card-hover',
        // Animation
        'animate-fade-in-up fill-mode-both',
        // Layout
        'px-5.5 py-5',
        // Left border accent
        borderColor && `border-l-3 ${borderColor}`,
        // Clickable
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Header: Icon + Label */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            !accent && iconBgColor
          )}
          style={accent ? {
            backgroundColor: accent + '18',
            boxShadow: `0 0 16px ${accent}20`,
          } : undefined}
        >
          <DSIcon
            name={icon}
            size={18}
            color={accent || undefined}
            className={accent ? undefined : iconColor}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted light:text-slate-500">
          {label}
        </span>
        {badge && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 text-[11px] font-medium',
              badge.color || 'text-brand-primary'
            )}
          >
            {badge.icon && <DSIcon name={badge.icon} size={12} />}
            {badge.text}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-[22px] font-bold tabular-nums text-text-primary">
        {value}
      </div>
    </div>
  )
}
