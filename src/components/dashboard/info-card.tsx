/**
 * src/components/dashboard/info-card.tsx
 *
 * InfoCard — Icon + Label + Value + Badge/Link
 *
 * Exports: InfoCard, InfoCardGrid
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// InfoCard — Icon + Label + Value + Badge/Link
// Versatile card for KPI rows, detail panels, etc.
// ============================================

'use client'

import { type ReactNode } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InfoCardProps {
  icon: DSIconName
  label: string
  value: string | number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'violet'
  badge?: string
  badgeColor?: 'green' | 'yellow' | 'red' | 'blue' | 'violet' | 'default'
  href?: string
  suffix?: ReactNode
  description?: string
  className?: string
}

const iconColors = {
  primary: 'bg-brand-primary/12 text-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  success: 'bg-emerald-500/12 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  warning: 'bg-amber-500/12 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  error: 'bg-red-500/12 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
  info: 'bg-blue-500/12 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  accent: 'bg-lime-500/12 text-lime-400 shadow-[0_0_12px_rgba(132,204,22,0.15)]',
  violet: 'bg-violet-500/12 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]',
}

const badgeColors = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  default: 'bg-black/6 dark:bg-white/6 text-text-muted border-border-light',
}

export function InfoCard({
  icon,
  label,
  value,
  color = 'primary',
  badge,
  badgeColor = 'default',
  href,
  suffix,
  description,
  className,
}: InfoCardProps) {
  const content = (
    <motion.div
      whileHover={href ? { y: -3, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'group relative flex items-center gap-3.5 rounded-2xl border border-border-light bg-kpi-dark p-4 backdrop-blur-xl',
        'shadow-[0_4px_16px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.04)_inset] transition-all duration-300',
        'overflow-hidden',
        href && 'hover:border-border-dark dark:hover:border-white/14 hover:bg-kpi-dark hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.06)_inset] cursor-pointer',
        className
      )}
    >
      {/* Subtle top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
      {/* Icon container */}
      <div className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-light transition-all duration-300 group-hover:scale-105',
        iconColors[color]
      )}>
        <DSIcon name={icon} size={20} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-base font-bold text-text-primary truncate">{value}</p>
          {description && (
            <p className="text-xs text-text-muted truncate hidden sm:block">{description}</p>
          )}
        </div>
      </div>

      {/* Badge / Suffix */}
      <div className="flex shrink-0 items-center gap-2">
        {badge && (
          <span className={cn(
            'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            badgeColors[badgeColor]
          )}>
            {badge}
          </span>
        )}
        {suffix}
        {href && (
          <svg className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// ============================================
// InfoCardGrid — Consistent grid wrapper
// ============================================

export function InfoCardGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-3', colClass[columns], className)}>
      {children}
    </div>
  )
}
