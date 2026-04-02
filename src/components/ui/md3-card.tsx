/**
 * src/components/ui/md3-card.tsx
 *
 * MD3 Card — Material Design 3 + Apple HIG
 * Features: 'use client'
 */

// ============================================
// MD3 Card — Material Design 3 + Apple HIG
// Definitive card system: 5 variants, hover, shine, glass
// ============================================

'use client'

import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'filled' | 'elevated' | 'outlined' | 'glass' | 'tonal'

interface MD3CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card visual treatment */
  variant?: CardVariant
  /** Enable hover lift + glow border effect */
  interactive?: boolean
  /** Show subtle shine sweep animation */
  shine?: boolean
  /** Enable press feedback (scale down) */
  pressable?: boolean
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses: Record<CardVariant, string> = {
  // MD3 Filled — Tonal background, subtle border
  filled: [
    'bg-(--surface-container-low)',
    'border border-(--outline-variant)',
    'shadow-elevation-1',
    'light:bg-slate-50 light:border-slate-200/60',
    'hover:bg-(--surface-container) hover:shadow-elevation-2 hover:border-(--outline)',
  ].join(' '),

  // MD3 Elevated — Higher prominence with shadow
  elevated: [
    'bg-(--surface-container-lowest)',
    'border border-(--outline-variant)',
    'shadow-elevation-2',
    'light:bg-white light:border-slate-200/60',
    'hover:shadow-elevation-3 hover:border-(--outline)',
  ].join(' '),

  // MD3 Outlined — Minimal, clean border
  outlined: [
    'bg-transparent',
    'border border-(--outline)',
    'shadow-none',
    'light:border-slate-200',
    'hover:bg-(--surface-container-lowest) hover:shadow-elevation-1',
  ].join(' '),

  // Apple Frosted Glass — Ultra-premium blur
  glass: [
    'glass-premium card-shine',
    'hover:shadow-(--shadow-glass-premium-hover)',
  ].join(' '),

  // MD3 Tonal — Brand-tinted surface
  tonal: [
    'bg-brand-primary/4 dark:bg-brand-primary/6',
    'border border-brand-primary/10 dark:border-brand-primary/15',
    'shadow-elevation-1',
    'hover:bg-brand-primary/8 dark:hover:bg-brand-primary/10 hover:border-brand-primary/20 hover:shadow-elevation-2',
  ].join(' '),
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 sm:p-8',
}

const MD3Card = forwardRef<HTMLDivElement, MD3CardProps>(
  ({ className, variant = 'filled', interactive = false, shine = false, pressable = false, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-250',
        variantClasses[variant],
        interactive && 'hover:-translate-y-0.5 cursor-pointer',
        pressable && 'active:scale-[0.98] active:shadow-elevation-1',
        shine && variant !== 'glass' && 'card-shine overflow-hidden',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {/* Top edge highlight — Apple-style specular */}
      {(variant === 'filled' || variant === 'elevated' || variant === 'glass') && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1 h-px rounded-t-2xl bg-linear-to-r from-transparent via-white/8 to-transparent light:via-black/4" />
      )}
      {children}
    </div>
  )
)
MD3Card.displayName = 'MD3Card'

// ─── Card Header ───
const MD3CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between gap-3 mb-4', className)} {...props} />
  )
)
MD3CardHeader.displayName = 'MD3CardHeader'

// ─── Card Title ───
const MD3CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-base font-semibold tracking-tight text-(--on-surface) light:text-slate-900',
        className
      )}
      {...props}
    />
  )
)
MD3CardTitle.displayName = 'MD3CardTitle'

// ─── Card Label (monospace section header) ───
const MD3CardLabel = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-[11px] font-bold uppercase tracking-[0.08em] text-(--on-surface-variant) light:text-slate-500',
        className
      )}
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      {...props}
    />
  )
)
MD3CardLabel.displayName = 'MD3CardLabel'

// ─── Card Content ───
const MD3CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
MD3CardContent.displayName = 'MD3CardContent'

// ─── Card Footer ───
const MD3CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-(--outline-variant) light:border-slate-200', className)} {...props} />
  )
)
MD3CardFooter.displayName = 'MD3CardFooter'

export {
  MD3Card,
  MD3CardHeader,
  MD3CardTitle,
  MD3CardLabel,
  MD3CardContent,
  MD3CardFooter,
  type MD3CardProps,
}
