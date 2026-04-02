/**
 * src/components/ui/action-icon-button.tsx
 *
 * ActionIconButton — DS v2 Mini Action Buttons
 * Features: 'use client'
 */

// ============================================
// ActionIconButton — DS v2 Mini Action Buttons
// 38×38px icon buttons for user lists, cards, tables
// Green hover for actions, red for destructive
// ============================================

'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ActionIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon to render (Lucide or custom SVG) */
  icon: ReactNode
  /** Destructive action = red hover instead of green */
  destructive?: boolean
  /** Custom tooltip (uses title attr) */
  tooltip?: string
  /** Size variant */
  size?: 'sm' | 'md'
}

const ActionIconButton = forwardRef<HTMLButtonElement, ActionIconButtonProps>(
  ({ icon, destructive = false, tooltip, size = 'md', className, ...props }, ref) => {
    const sizeClasses = size === 'sm'
      ? 'h-8 w-8 rounded-lg'
      : 'h-9.5 w-9.5 rounded-[10px]'

    return (
      <button
        ref={ref}
        title={tooltip}
        className={cn(
          sizeClasses,
          'inline-flex items-center justify-center border transition-all duration-200',
          'cursor-pointer select-none',
          'active:scale-95',
          // Default state
          'border-border-light bg-bg-secondary/60 text-text-muted',
          // Hover states based on variant
          destructive
            ? 'hover:border-error/30 hover:bg-error/8 hover:text-error hover:scale-110'
            : 'hover:border-brand-primary/30 hover:bg-brand-primary/8 hover:text-brand-primary hover:scale-110',
          // Focus
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          destructive
            ? 'focus-visible:ring-error/40'
            : 'focus-visible:ring-brand-primary/40',
          'focus-visible:ring-offset-bg-primary',
          // Disabled
          'disabled:pointer-events-none disabled:opacity-40',
          className
        )}
        {...props}
      >
        <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </button>
    )
  }
)
ActionIconButton.displayName = 'ActionIconButton'

export { ActionIconButton, type ActionIconButtonProps }
