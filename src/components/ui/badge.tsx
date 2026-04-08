/**
 * src/components/ui/badge.tsx
 *
 * Badge — MD3 Glass + Micro-animations + DS v2 Role Badges
 * Features: DSIcon
 */

// ============================================
// Badge — MD3 Glass + Micro-animations + DS v2 Role Badges
// ============================================

import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'premium'
  | 'aluno' | 'personal' | 'super-admin' | 'verified' | 'admin'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /** Pulsing dot indicator (e.g. for "active" status) */
  dot?: boolean
  /** Optional icon override (auto-set for role variants) */
  icon?: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-black/6 dark:bg-white/6 text-text-secondary border-border-light backdrop-blur-sm',
  success: 'bg-success/10 text-success border-success/15 backdrop-blur-sm shadow-[0_0_12px_rgba(16,185,129,0.1)]',
  warning: 'bg-warning/10 text-warning border-warning/15 backdrop-blur-sm shadow-[0_0_12px_rgba(245,158,11,0.1)]',
  error: 'bg-error/10 text-error border-error/15 backdrop-blur-sm shadow-[0_0_12px_rgba(239,68,68,0.1)]',
  info: 'bg-info/10 text-info border-info/15 backdrop-blur-sm shadow-[0_0_12px_rgba(59,130,246,0.1)]',
  outline: 'border border-border-light bg-transparent text-text-secondary backdrop-blur-sm',
  premium: 'bg-linear-to-r from-brand-primary/15 to-brand-accent/15 text-brand-accent border-brand-primary/20 backdrop-blur-sm shadow-[0_0_16px_rgba(16,185,129,0.12)]',
  // DS v2 Role Badges — gradient backgrounds with accent colors
  aluno: 'bg-linear-to-r from-brand-primary/15 to-brand-accent/10 text-brand-primary border-brand-primary/15 dark:from-brand-primary/30 dark:to-brand-accent/20 dark:text-brand-primary dark:border-brand-primary/20',
  personal: 'bg-linear-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-500/20 dark:from-emerald-900/30 dark:to-emerald-800/20 dark:text-emerald-400 dark:border-emerald-400/20',
  admin: 'bg-linear-to-r from-violet-100 to-violet-50 text-violet-700 border-violet-500/15 dark:from-violet-900/30 dark:to-violet-800/20 dark:text-violet-400 dark:border-violet-400/20',
  'super-admin': 'bg-linear-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-500/15 dark:from-amber-900/30 dark:to-amber-800/20 dark:text-amber-400 dark:border-amber-400/20',
  verified: 'bg-linear-to-r from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-500/20 dark:from-emerald-900/30 dark:to-emerald-800/20 dark:text-emerald-400 dark:border-emerald-400/20',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  outline: 'bg-text-secondary',
  premium: 'bg-brand-accent',
  aluno: 'bg-brand-primary',
  personal: 'bg-brand-primary',
  admin: 'bg-violet-500',
  'super-admin': 'bg-amber-500',
  verified: 'bg-brand-primary',
}

/** Auto-icons for DS v2 role badges */
const roleIcons: Partial<Record<BadgeVariant, ReactNode>> = {
  'super-admin': <DSIcon name="sparkles" size={10} />,
  admin: <DSIcon name="shield" size={10} />,
  verified: <DSIcon name="check" size={10} />,
  personal: <DSIcon name="dumbbell" size={10} />,
}

/** Default labels for role variants when no children provided */
const roleLabels: Partial<Record<BadgeVariant, string>> = {
  aluno: 'Aluno',
  personal: 'Personal',
  admin: 'Admin',
  'super-admin': 'Super Admin',
  verified: 'Verificado',
}

function Badge({ className, variant = 'default', dot, icon, children, ...props }: BadgeProps) {
  const autoIcon = icon ?? roleIcons[variant]
  const label = children ?? roleLabels[variant]
  return (
    <span
      className={cn(
        'inline-flex select-none items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none',
        'transition-all duration-200 hover:scale-105 active:scale-95',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', dotColors[variant])} />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        </span>
      )}
      {autoIcon && <span className="flex items-center">{autoIcon}</span>}
      {label}
    </span>
  )
}

export { Badge, type BadgeProps }
