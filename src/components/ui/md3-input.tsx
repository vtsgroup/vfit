/**
 * src/components/ui/md3-input.tsx
 *
 * MD3 Input — Premium Design System Text Fields
 * Hooks: useState
 * Features: 'use client'
 */

// ============================================
// MD3 Input — Premium Text Fields
// Glass surfaces · refined borders · elegant focus
// ============================================

'use client'

import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// MD3 Text Field
// ============================================

interface MD3InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant */
  variant?: 'filled' | 'outlined'
  /** Floating label text */
  label?: string
  /** Helper text below input */
  helperText?: string
  /** Error message (overrides helperText) */
  error?: string
  /** Leading icon */
  leadingIcon?: ReactNode
  /** Trailing icon */
  trailingIcon?: ReactNode
  /** Size preset */
  size?: 'sm' | 'md' | 'lg'
}

const MD3Input = forwardRef<HTMLInputElement, MD3InputProps>(({
  variant = 'outlined',
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  size = 'md',
  className,
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const hasValue = !!props.value || !!props.defaultValue
  const isFloating = focused || hasValue || !!props.placeholder

  const inputId = id || `md3-input-${label?.toLowerCase().replace(/\s/g, '-')}`

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  }

  const isError = !!error

  return (
    <div className={cn('relative w-full group', className)}>
      <div className={cn(
        'relative flex items-center rounded-2xl transition-all duration-300 ease-out',
        isError && 'motion-safe:animate-[field-shake_220ms_ease-in-out_1]',
        variant === 'filled'
          ? cn(
              'rounded-b-none border-b-2',
              'dark:bg-white/7 light:bg-slate-50/80',
              isError
                ? 'border-red-400/80'
                : focused
                  ? 'border-emerald-400 dark:bg-white/10 light:bg-white/90'
                  : 'dark:border-white/10 light:border-slate-200/80',
              !focused && !isError && !props.disabled && 'dark:hover:bg-white/8 dark:hover:border-white/20 light:hover:bg-white/90 light:hover:border-slate-300',
            )
          : cn(
              'border',
              'dark:bg-white/4 light:bg-white/80',
              'backdrop-blur-sm',
              isError
                ? 'border-red-400/60 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                : focused
                  ? cn(
                      'dark:border-emerald-400/60 light:border-emerald-400/70',
                      'shadow-[0_0_0_3px_rgba(34,197,94,0.15),0_1px_2px_rgba(0,0,0,0.05)]',
                      'dark:bg-white/7 light:bg-white',
                    )
                  : cn(
                      'dark:border-white/12 light:border-slate-200',
                      'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                    ),
              !focused && !isError && !props.disabled && 'dark:hover:border-white/25 dark:hover:bg-white/6 light:hover:border-slate-300 light:hover:bg-white',
            ),
        props.disabled && 'opacity-40 cursor-not-allowed',
      )}>
        {leadingIcon && (
          <span className={cn(
            'shrink-0 pl-3.5 transition-colors duration-300',
            isError ? 'text-red-400' : focused ? 'text-emerald-400' : 'dark:text-white/40 light:text-slate-400'
          )}>
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          className={cn(
            'w-full bg-transparent outline-none',
            'dark:text-white light:text-slate-900',
            'dark:placeholder:text-white/30 light:placeholder:text-slate-400',
            'transition-colors duration-300',
            sizeClasses[size],
            leadingIcon ? 'pl-2.5' : 'pl-4',
            trailingIcon ? 'pr-2.5' : 'pr-4',
            label && 'pt-5 pb-1.5',
            props.disabled && 'cursor-not-allowed',
          )}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute transition-all duration-300 ease-out pointer-events-none',
              leadingIcon ? 'left-11' : 'left-4',
              isFloating
                ? cn(
                    'top-1.5 text-[10px] font-semibold tracking-wide uppercase',
                    isError ? 'text-red-400' : focused ? 'text-emerald-400' : 'dark:text-white/50 light:text-slate-500'
                  )
                : cn(
                    'top-1/2 -translate-y-1/2 text-sm font-normal tracking-normal normal-case',
                    'dark:text-white/40 light:text-slate-400',
                  ),
            )}
          >
            {label}
          </label>
        )}

        {trailingIcon && (
          <span className={cn(
            'shrink-0 pr-3.5 transition-colors duration-300',
            isError ? 'text-red-400' : focused ? 'text-emerald-400' : 'dark:text-white/40 light:text-slate-400'
          )}>
            {trailingIcon}
          </span>
        )}
      </div>

      {/* Helper / Error text */}
      {(helperText || error) && (
        <p className={cn(
          'mt-1.5 px-4 text-[11px] font-medium tracking-wide motion-safe:animate-[helper-fade-in_220ms_ease-out]',
          isError ? 'text-red-400' : 'dark:text-white/40 light:text-slate-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})
MD3Input.displayName = 'MD3Input'

// ============================================
// MD3 TextArea
// ============================================

interface MD3TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

const MD3TextArea = forwardRef<HTMLTextAreaElement, MD3TextAreaProps>(({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const hasValue = !!props.value || !!props.defaultValue
  const isFloating = focused || hasValue || !!props.placeholder
  const isError = !!error
  const inputId = id || `md3-textarea-${label?.toLowerCase().replace(/\s/g, '-')}`

  return (
    <div className={cn('relative w-full', className)}>
      <div className={cn(
        'relative rounded-2xl border transition-all duration-300 ease-out',
        isError && 'motion-safe:animate-[field-shake_220ms_ease-in-out_1]',
        'dark:bg-white/4 light:bg-white/80',
        'backdrop-blur-sm',
        isError
          ? 'border-red-400/60 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
          : focused
            ? cn(
                'dark:border-emerald-400/60 light:border-emerald-400/70',
                'shadow-[0_0_0_3px_rgba(34,197,94,0.15),0_1px_2px_rgba(0,0,0,0.05)]',
                'dark:bg-white/7 light:bg-white',
              )
            : cn(
                'dark:border-white/12 light:border-slate-200',
                'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
              ),
        !focused && !isError && 'dark:hover:border-white/25 dark:hover:bg-white/6 light:hover:border-slate-300 light:hover:bg-white/95',
      )}>
        <textarea
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          className={cn(
            'w-full min-h-28 bg-transparent outline-none text-sm p-4 resize-y',
            'dark:text-white light:text-slate-900',
            'dark:placeholder:text-white/30 light:placeholder:text-slate-400',
            'transition-colors duration-300',
            label && 'pt-7',
          )}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-300 ease-out pointer-events-none',
              isFloating
                ? cn(
                    'top-2.5 text-[10px] font-semibold tracking-wide uppercase',
                    isError ? 'text-red-400' : focused ? 'text-emerald-400' : 'dark:text-white/50 light:text-slate-500'
                  )
                : cn(
                    'top-4 text-sm font-normal tracking-normal normal-case',
                    'dark:text-white/40 light:text-slate-400',
                  ),
            )}
          >
            {label}
          </label>
        )}
      </div>

      {(helperText || error) && (
        <p className={cn(
          'mt-1.5 px-4 text-[11px] font-medium tracking-wide motion-safe:animate-[helper-fade-in_220ms_ease-out]',
          isError ? 'text-red-400' : 'dark:text-white/40 light:text-slate-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})
MD3TextArea.displayName = 'MD3TextArea'

// ============================================
// MD3 Search Bar — Premium glass pill
// ============================================

interface MD3SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  onClear?: () => void
}

const MD3SearchBar = forwardRef<HTMLInputElement, MD3SearchBarProps>(({
  size = 'md',
  onClear,
  className,
  value,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
    lg: 'h-13 text-base',
  }

  return (
    <div className={cn(
      'relative flex items-center rounded-full transition-all duration-300 ease-out',
      'dark:bg-white/5 light:bg-slate-50/80',
      'border backdrop-blur-sm',
      focused
        ? cn(
            'dark:border-emerald-400/40 light:border-emerald-400/50',
            'shadow-[0_0_0_3px_rgba(34,197,94,0.15),0_4px_12px_rgba(0,0,0,0.08)]',
            'dark:bg-white/8 light:bg-white',
          )
        : cn(
            'dark:border-white/10 light:border-slate-200',
            'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            'dark:hover:border-white/20 dark:hover:bg-white/7 light:hover:border-slate-300 light:hover:bg-white',
          ),
      className
    )}>
      {/* Search icon */}
      <svg
        className={cn(
          'shrink-0 ml-3.5 h-4 w-4 transition-all duration-300',
          focused ? 'text-emerald-400 scale-110' : 'dark:text-white/35 light:text-slate-400'
        )}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      <input
        ref={ref}
        type="search"
        value={value}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        className={cn(
          'w-full bg-transparent outline-none pl-2.5 pr-3',
          'dark:text-white light:text-slate-900',
          'dark:placeholder:text-white/35 light:placeholder:text-slate-400',
          'transition-colors duration-300',
          sizeClasses[size],
        )}
        {...props}
      />

      {/* Clear button */}
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'shrink-0 mr-2.5 flex h-5 w-5 items-center justify-center rounded-full',
            'dark:bg-white/10 light:bg-slate-200/80',
            'dark:text-white/60 light:text-slate-500',
            'dark:hover:bg-white/20 light:hover:bg-slate-300',
            'transition-all duration-200',
            'active:scale-90',
          )}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
})
MD3SearchBar.displayName = 'MD3SearchBar'

export { MD3Input, MD3TextArea, MD3SearchBar }
