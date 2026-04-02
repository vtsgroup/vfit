/**
 * src/components/ui/alert.tsx
 *
 * Alert — Ultra-Modern MD3 + Apple-style
 * Features: 'use client', glass surface, dismissible, icon auto, a11y
 */

'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'ai'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
  /** Show close/dismiss button */
  dismissible?: boolean
  /** Custom icon override */
  icon?: ReactNode
  /** Action button */
  action?: { label: string; onClick: () => void }
  /** Callback when dismissed */
  onDismiss?: () => void
}

const variantConfig: Record<AlertVariant, {
  bg: string
  border: string
  iconColor: string
  titleColor: string
  textColor: string
  icon: ReactNode
}> = {
  info: {
    bg: 'dark:bg-blue-500/8 light:bg-blue-50',
    border: 'dark:border-blue-500/20 light:border-blue-200/60',
    iconColor: 'dark:text-blue-400 light:text-blue-500',
    titleColor: 'dark:text-blue-300 light:text-blue-700',
    textColor: 'dark:text-blue-200/80 light:text-blue-600/80',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    ),
  },
  success: {
    bg: 'dark:bg-emerald-500/8 light:bg-emerald-50',
    border: 'dark:border-emerald-500/20 light:border-emerald-200/60',
    iconColor: 'dark:text-emerald-400 light:text-emerald-600',
    titleColor: 'dark:text-emerald-300 light:text-emerald-700',
    textColor: 'dark:text-emerald-200/80 light:text-emerald-600/80',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
  warning: {
    bg: 'dark:bg-amber-500/8 light:bg-amber-50',
    border: 'dark:border-amber-500/20 light:border-amber-200/60',
    iconColor: 'dark:text-amber-400 light:text-amber-600',
    titleColor: 'dark:text-amber-300 light:text-amber-700',
    textColor: 'dark:text-amber-200/80 light:text-amber-600/80',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
      </svg>
    ),
  },
  error: {
    bg: 'dark:bg-red-500/8 light:bg-red-50',
    border: 'dark:border-red-500/20 light:border-red-200/60',
    iconColor: 'dark:text-red-400 light:text-red-500',
    titleColor: 'dark:text-red-300 light:text-red-700',
    textColor: 'dark:text-red-200/80 light:text-red-600/80',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
      </svg>
    ),
  },
  neutral: {
    bg: 'dark:bg-white/4 light:bg-slate-50',
    border: 'dark:border-white/10 light:border-slate-200/60',
    iconColor: 'text-text-secondary',
    titleColor: 'text-text-primary',
    textColor: 'text-text-secondary',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    ),
  },
  ai: {
    bg: 'dark:bg-violet-500/8 light:bg-violet-50',
    border: 'dark:border-violet-500/20 light:border-violet-200/60',
    iconColor: 'dark:text-violet-400 light:text-violet-500',
    titleColor: 'dark:text-violet-300 light:text-violet-700',
    textColor: 'dark:text-violet-200/80 light:text-violet-600/80',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  dismissible = false,
  icon: customIcon,
  action,
  onDismiss,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = variantConfig[variant]

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className={cn(
        'relative flex gap-3 rounded-xl border p-4',
        'backdrop-blur-sm',
        'animate-[fade-in-up_0.3s_ease-out]',
        config.bg,
        config.border,
        className
      )}
    >
      {/* Glass shine */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-linear-to-b dark:from-white/4 light:from-white/60 to-transparent" />

      {/* Icon */}
      <span className={cn('relative mt-0.5 shrink-0', config.iconColor)}>
        {customIcon || config.icon}
      </span>

      {/* Content */}
      <div className="relative flex-1 min-w-0">
        {title && (
          <p className={cn('text-sm font-semibold mb-1', config.titleColor)}>
            {title}
          </p>
        )}
        <div className={cn('text-sm leading-relaxed', config.textColor)}>
          {children}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              'mt-2 text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-80',
              config.titleColor
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar alerta"
          className={cn(
            'relative shrink-0 rounded-lg p-1 transition-colors',
            'dark:hover:bg-white/8 light:hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 dark:focus-visible:ring-white/20 light:focus-visible:ring-black/10',
            config.iconColor
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
