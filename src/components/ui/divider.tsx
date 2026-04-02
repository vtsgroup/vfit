/**
 * src/components/ui/divider.tsx
 *
 * Divider / Separator — Ultra-Modern
 * Features: horizontal/vertical, label, gradient fade
 */

import { cn } from '@/lib/utils'

interface DividerProps {
  className?: string
  /** Optional centered label */
  label?: string
  /** Visual style */
  variant?: 'default' | 'gradient' | 'dashed' | 'glow'
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Spacing */
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingMap = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
}

const verticalSpacingMap = {
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-8',
}

export function Divider({
  className,
  label,
  variant = 'default',
  orientation = 'horizontal',
  spacing = 'md',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block self-stretch w-px',
          verticalSpacingMap[spacing],
          variant === 'gradient'
            ? 'bg-linear-to-b from-transparent via-border-light to-transparent'
            : variant === 'glow'
              ? 'bg-linear-to-b from-transparent via-brand-primary/30 to-transparent'
              : variant === 'dashed'
                ? 'border-l border-dashed border-border-light bg-transparent'
                : 'bg-border-light',
          className
        )}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('flex items-center gap-4', spacingMap[spacing], className)}
      >
        <div
          className={cn(
            'h-px flex-1',
            variant === 'gradient' || variant === 'glow'
              ? variant === 'glow'
                ? 'bg-linear-to-r from-transparent via-brand-primary/30 to-transparent'
                : 'bg-linear-to-r from-transparent via-border-light to-transparent'
              : 'bg-border-light'
          )}
        />
        <span className="shrink-0 text-xs font-medium text-text-muted uppercase tracking-widest">
          {label}
        </span>
        <div
          className={cn(
            'h-px flex-1',
            variant === 'gradient' || variant === 'glow'
              ? variant === 'glow'
                ? 'bg-linear-to-r from-transparent via-brand-primary/30 to-transparent'
                : 'bg-linear-to-r from-transparent via-border-light to-transparent'
              : 'bg-border-light'
          )}
        />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        'h-px w-full',
        spacingMap[spacing],
        variant === 'gradient'
          ? 'bg-linear-to-r from-transparent via-border-light to-transparent'
          : variant === 'glow'
            ? 'bg-linear-to-r from-transparent via-brand-primary/30 to-transparent'
            : variant === 'dashed'
              ? 'border-t border-dashed border-border-light bg-transparent'
              : 'bg-border-light',
        className
      )}
    />
  )
}
