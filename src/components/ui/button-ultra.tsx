'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  {
    variants: {
      variant: {
        // Ultra-modern glassmorphism CTA (primary)
        'glass-primary': cn(
          'relative bg-gradient-to-br from-brand-primary/12 to-brand-primary/6 border border-brand-primary/30',
          'text-white font-bold',
          'shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(58,181,74,0.15)]',
          'hover:from-brand-primary/18 hover:to-brand-primary/12 hover:scale-102 hover:shadow-[0_12px_24px_rgba(58,181,74,0.2)]',
          'active:scale-98',
          'focus-visible:ring-brand-primary/40 focus-visible:ring-offset-slate-900'
        ),

        // Ultra-modern secondary glass (subtle)
        'glass-secondary': cn(
          'bg-white/4 border border-white/8',
          'text-slate-400',
          'shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]',
          'hover:bg-white/8 hover:border-white/12 hover:text-white hover:scale-101',
          'active:scale-98',
          'focus-visible:ring-white/20 focus-visible:ring-offset-slate-900'
        ),

        // Ghost style (minimal)
        ghost: cn(
          'bg-transparent border border-transparent',
          'text-slate-400',
          'hover:bg-white/6 hover:text-white hover:border-white/10',
          'active:bg-white/10',
          'focus-visible:ring-white/20'
        ),

        // Link style (text-only)
        link: cn(
          'bg-transparent border-0 text-brand-primary underline-offset-2',
          'hover:underline hover:text-brand-primary/80',
          'focus-visible:ring-brand-primary/30'
        ),

        // Danger/destructive (red)
        destructive: cn(
          'bg-red-500/12 border border-red-500/30 text-red-400',
          'hover:bg-red-500/18 hover:text-red-300',
          'active:bg-red-500/24'
        ),
      },
      size: {
        xs: 'h-8 px-2.5 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'glass-primary',
      size: 'md',
    },
  }
)

export interface ButtonUltraProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const ButtonUltra = React.forwardRef<HTMLButtonElement, ButtonUltraProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled = false,
      children,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>{children}</span>
          </>
        ) : (
          <>
            {icon && <span className="inline-flex">{icon}</span>}
            {children}
          </>
        )}
      </button>
    )
  }
)

ButtonUltra.displayName = 'ButtonUltra'

export { ButtonUltra, buttonVariants }
