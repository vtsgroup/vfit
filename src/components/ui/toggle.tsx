/**
 * src/components/ui/toggle.tsx
 *
 * Toggle / Switch — Ultra-Modern MD3 + Apple-style
 * Features: 'use client', spring animation, haptic feedback visual, a11y
 */

'use client'

import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: ToggleSize
  label?: string
  description?: string
}

const sizeMap = {
  sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-4', padding: 'p-[3px]' },
  md: { track: 'h-7 w-12', thumb: 'h-5 w-5', translate: 'translate-x-5', padding: 'p-1' },
  lg: { track: 'h-8 w-14', thumb: 'h-6 w-6', translate: 'translate-x-6', padding: 'p-1' },
}

export function Toggle({
  checked = false,
  onCheckedChange,
  size = 'md',
  label,
  description,
  disabled,
  className,
  id: providedId,
  ...props
}: ToggleProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${id}-label` : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'group relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          s.track,
          s.padding,
          checked
            ? 'bg-linear-to-r from-brand-primary to-brand-primary-hover shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_0_12px_rgba(34,197,94,0.3)]'
            : 'bg-zinc-600/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
        )}
      >
        {/* Active glow */}
        {checked && (
          <span className="absolute inset-0 rounded-full bg-brand-primary/20 animate-[pulse_2s_ease-in-out_infinite]" />
        )}
        {/* Thumb */}
        <span
          className={cn(
            'relative rounded-full bg-white',
            'shadow-[0_2px_6px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.15)]',
            'transition-all duration-300 ease-bounce',
            'group-active:scale-90',
            s.thumb,
            checked ? s.translate : 'translate-x-0'
          )}
        >
          {/* Thumb shine */}
          <span className="absolute inset-0 rounded-full bg-linear-to-b from-white/40 to-transparent" />
          {/* Check/X indicator */}
          <span className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
            checked ? 'opacity-100' : 'opacity-0'
          )}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        </span>
      </button>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer select-none',
                disabled ? 'text-text-muted' : 'text-text-primary'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-text-secondary">{description}</span>
          )}
        </div>
      )}
      {/* Hidden native input for form compatibility */}
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
