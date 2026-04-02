/**
 * src/components/ui/checkbox.tsx
 *
 * Checkbox — Ultra-Modern MD3 + Apple-style
 * Features: 'use client', spring animation, indeterminate, a11y
 */

'use client'

import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CheckboxSize = 'sm' | 'md' | 'lg'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: CheckboxSize
  label?: string
  description?: string
  indeterminate?: boolean
  error?: string
}

const sizeMap = {
  sm: { box: 'h-4 w-4 rounded-[5px]', icon: 12 },
  md: { box: 'h-5 w-5 rounded-md', icon: 14 },
  lg: { box: 'h-6 w-6 rounded-lg', icon: 16 },
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  size = 'md',
  label,
  description,
  indeterminate = false,
  error,
  disabled,
  className,
  id: providedId,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const s = sizeMap[size]
  const isActive = checked || indeterminate

  return (
    <div className={cn('group flex items-start gap-3', className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-labelledby={label ? `${id}-label` : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center',
          'transition-all duration-200 ease-bounce',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'active:scale-90',
          s.box,
          isActive
            ? 'bg-linear-to-br from-brand-primary-hover to-brand-primary border-transparent shadow-[0_2px_4px_rgba(34,197,94,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
            : cn(
                'border-2 bg-transparent',
                error
                  ? 'border-error'
                  : 'border-zinc-500/50 hover:border-brand-primary-hover/60 dark:border-zinc-600/60'
              )
        )}
      >
        {/* Check icon */}
        {checked && !indeterminate && (
          <svg
            width={s.icon}
            height={s.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[scale-in_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
        {/* Indeterminate icon */}
        {indeterminate && (
          <svg
            width={s.icon}
            height={s.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-[scale-in_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
        {/* Shine overlay when active */}
        {isActive && (
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-white/20 to-transparent" />
        )}
      </button>

      {(label || description) && (
        <div className="flex flex-col gap-0.5 pt-px">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer select-none leading-tight',
                disabled ? 'text-text-muted' : 'text-text-primary'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-text-secondary leading-relaxed">{description}</span>
          )}
          {error && (
            <span className="text-xs text-error font-medium">{error}</span>
          )}
        </div>
      )}

      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
    </div>
  )
}
