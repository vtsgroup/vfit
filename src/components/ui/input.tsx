/**
 * src/components/ui/input.tsx
 *
 * Input — MD3 + Apple Glass Style
 */

// ============================================
// Input — MD3 + Apple Glass Style
// ============================================

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint && !error ? `${inputId}-hint` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId || hintId}
            className={cn(
              'peer flex min-h-11 w-full rounded-xl border bg-bg-secondary/80 px-3 text-base text-text-primary backdrop-blur-sm sm:text-sm',
              'light:bg-white/90 light:text-slate-900 light:border-slate-200',
              'placeholder:text-text-muted/60 light:placeholder:text-slate-400',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:border-brand-primary/40',
              'focus-visible:shadow-[0_0_0_3px_rgba(34,197,94,0.12),0_0_16px_rgba(34,197,94,0.08)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error/60 focus-visible:border-error focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_0_16px_rgba(239,68,68,0.08)]'
                : 'border-border-light hover:border-black/15 dark:hover:border-white/15 hover:bg-bg-secondary light:hover:bg-white light:hover:border-slate-300',
              className
            )}
            {...props}
          />
          {/* Focus glow ring — Apple-style expanding */}
          <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 peer-focus-visible:opacity-100">
            <div className="absolute -inset-px rounded-xl bg-linear-to-b from-brand-primary/5 to-transparent" />
          </div>
        </div>
        {error && <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-error">{error}</p>}
        {hint && !error && <p id={hintId} className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, type InputProps }
