/**
 * src/components/ui/card.tsx
 *
 * Card — MD3 Glass + Apple HIG Fusion
 */

// ============================================
// Card — MD3 Glass + Apple HIG Fusion
// v3.0: Definitive surface system
// ============================================

import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable glass-premium treatment with shine */
  glass?: boolean
  /** Enable hover lift + glow border effect */
  interactive?: boolean
  /** Surface variant — matches MD3 elevation */
  variant?: 'default' | 'elevated' | 'outlined' | 'tonal' | 'ultra' | 'depth'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, interactive, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-250',
        glass
          ? 'glass-premium card-shine'
          : variant === 'ultra'
            ? 'glass-ultra'
            : variant === 'depth'
              ? 'glass-depth'
          : variant === 'elevated'
            ? 'md3-surface-elevated'
            : variant === 'outlined'
              ? 'bg-transparent border border-(--outline) hover:bg-(--surface-container-lowest) hover:shadow-elevation-1'
              : variant === 'tonal'
                ? 'bg-brand-primary/4 dark:bg-brand-primary/6 border border-brand-primary/10 dark:border-brand-primary/15'
                : 'surface-card',
        interactive && 'hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.06)] active:translate-y-0 active:scale-[0.995] cursor-pointer',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-5 pb-0', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-text-primary light:text-slate-900', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary light:text-slate-500', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-5 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, type CardProps }
