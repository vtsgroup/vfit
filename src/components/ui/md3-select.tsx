/**
 * src/components/ui/md3-select.tsx
 *
 * MD3 Select — Premium dropdown with refined glass
 *
 * Exports: SelectOption, MD3Select
 * Hooks: useState, useRef, useEffect
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// MD3 Select — Premium dropdown
// Glass surfaces · refined borders · elegant focus
// ============================================

'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// Types
// ============================================

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  description?: string
  disabled?: boolean
}

interface MD3SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  leadingIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outlined' | 'filled'
  fullWidth?: boolean
  className?: string
  disabled?: boolean
}

// ============================================
// MD3 Select Component
// ============================================

export function MD3Select({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  error,
  helperText,
  leadingIcon,
  size = 'md',
  variant = 'outlined',
  fullWidth = false,
  className,
  disabled = false,
}: MD3SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((o) => o.value === value)
  const isError = !!error

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setFocused(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  }

  const hasValue = !!selectedOption
  const isFloating = focused || isOpen || hasValue

  return (
    <div
      ref={containerRef}
      className={cn('relative', fullWidth ? 'w-full' : 'w-fit min-w-48', className)}
    >
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setFocused(true) } }}
        onBlur={() => { if (!isOpen) setFocused(false) }}
        className={cn(
          'relative flex w-full items-center rounded-2xl transition-all duration-300 ease-out',
          sizeClasses[size],
          variant === 'outlined'
            ? cn(
                'border backdrop-blur-sm',
                'bg-white/4 dark:bg-white/4 light:bg-white/80',
                isError
                  ? 'border-red-400/60 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                  : (focused || isOpen)
                    ? cn(
                        'border-emerald-400/70 dark:border-emerald-400/60',
                        'shadow-[0_0_0_3px_rgba(16,185,129,0.12),0_1px_2px_rgba(0,0,0,0.05)]',
                        'bg-white/7 dark:bg-white/7 light:bg-white',
                      )
                    : cn(
                        'border-white/12 dark:border-white/12 light:border-slate-200',
                        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                      ),
                !disabled && !(focused || isOpen) && !isError && 'hover:border-white/25 hover:bg-white/6 light:hover:border-slate-300 light:hover:bg-white',
              )
            : cn(
                'rounded-b-none border-b-2',
                'bg-white/5 dark:bg-white/7 light:bg-slate-50/80',
                isError
                  ? 'border-red-400/80'
                  : (focused || isOpen)
                    ? 'border-emerald-400 bg-white/8 dark:bg-white/10 light:bg-white/90'
                    : 'border-white/10 dark:border-white/10 light:border-slate-200/80',
                !disabled && !(focused || isOpen) && !isError && 'hover:bg-white/8 hover:border-white/20 light:hover:bg-white/90 light:hover:border-slate-300',
              ),
          disabled && 'opacity-40 cursor-not-allowed',
        )}
      >
        {leadingIcon && (
          <span className={cn(
            'shrink-0 pl-3.5 transition-colors duration-300',
            isError ? 'text-red-400' : (focused || isOpen) ? 'text-emerald-400' : 'text-white/40 light:text-slate-400'
          )}>
            {leadingIcon}
          </span>
        )}

        <span className={cn(
          'flex-1 text-left truncate transition-colors duration-300',
          leadingIcon ? 'pl-2.5' : 'pl-4',
          'pr-2',
          label && 'pt-3.5',
          selectedOption
            ? 'text-white light:text-slate-900'
            : 'text-white/35 light:text-slate-400',
        )}>
          {selectedOption?.label || placeholder}
        </span>

        {/* Floating label */}
        {label && (
          <span className={cn(
            'absolute pointer-events-none transition-all duration-300 ease-out',
            leadingIcon ? 'left-11' : 'left-4',
            isFloating
              ? cn(
                  'top-1.5 text-[10px] font-semibold tracking-wide uppercase',
                  isError ? 'text-red-400' : (focused || isOpen) ? 'text-emerald-400' : 'text-white/50 light:text-slate-500'
                )
              : cn(
                  'top-1/2 -translate-y-1/2 text-sm font-normal tracking-normal normal-case',
                  'text-white/40 light:text-slate-400',
                ),
          )}>
            {label}
          </span>
        )}

        {/* Arrow icon */}
        <DSIcon name="chevronDown" size={16} className={cn(
          'shrink-0 mr-3.5 transition-all duration-300 ease-out',
          isOpen && 'rotate-180',
          isError ? 'text-red-400' : (focused || isOpen) ? 'text-emerald-400' : 'text-white/35 light:text-slate-400'
        )} />
      </button>

      {/* Helper / Error text */}
      {(helperText || error) && (
        <p className={cn(
          'mt-1.5 text-[11px] font-medium px-4 tracking-wide',
          isError ? 'text-red-400' : 'text-white/40 light:text-slate-500'
        )}>
          {error || helperText}
        </p>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              'absolute z-50 mt-2 w-full overflow-hidden rounded-2xl',
              'bg-white/95 dark:bg-[#0f1a2e]/95 light:bg-white/98',
              'border border-white/12 dark:border-white/12 light:border-slate-200',
              'shadow-[0_8px_30px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.1)]',
              'light:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
              'backdrop-blur-2xl',
              'max-h-64 overflow-y-auto',
            )}
          >
            <div role="listbox" className="p-1.5">
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setFocused(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200',
                      isSelected
                        ? 'bg-emerald-500/12 text-emerald-400 light:text-emerald-600 font-semibold'
                        : cn(
                            'text-white/80 light:text-slate-700 font-medium',
                            'hover:bg-white/8 light:hover:bg-slate-50',
                          ),
                      option.disabled && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <div className="flex-1 text-left min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block text-[11px] text-white/40 light:text-slate-500 mt-0.5 truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <DSIcon name="check" size={16} className="shrink-0 text-emerald-400 light:text-emerald-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
