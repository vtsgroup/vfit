/**
 * src/components/ui/styled-select.tsx
 *
 * StyledSelect — Drop-in replacement for native <select>
 *
 * Exports: StyledSelect
 * Hooks: useState, useRef, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// StyledSelect — Drop-in replacement for native <select>
// MD3-style custom dropdown, lightweight, no floating labels
// Designed for filters, forms, and inline controls
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

interface StyledSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Compact mode for inline filter selects */
  compact?: boolean
}

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
  disabled = false,
  compact = false,
}: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  const close = useCallback(() => setIsOpen(false), [])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, close])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, close])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-[14px] border transition-all duration-200',
          'text-left text-sm font-medium',
          compact ? 'h-9 px-3' : 'h-11 px-3.5',
          isOpen
            ? 'border-brand-primary/50 ring-2 ring-brand-primary/10 bg-bg-primary shadow-md translate-y-px'
            : [
                'bg-linear-to-b from-(--ds-surface-solid) to-(--ds-surface-secondary)',
                'border-(--ds-border) shadow-(--ds-select-shadow)',
                'hover:border-(--ds-border-focus) hover:shadow-md',
              ].join(' '),
          disabled && 'opacity-50 cursor-not-allowed',
          'active:scale-[0.98]',
        )}
      >
        <span className={cn(
          'truncate',
          value ? 'text-text-primary' : 'text-text-secondary',
        )}>
          {selectedLabel}
        </span>
        <DSIcon name="chevronDown" size={16} className={cn(
          'shrink-0 transition-transform duration-250 text-text-secondary',
          isOpen && 'rotate-180 text-brand-primary',
        )} />
      </button>

      {/* Dropdown — DS V2 glassmorphism */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-full overflow-hidden rounded-[14px]',
            'border border-(--ds-border) bg-(--ds-surface-elevated)',
            'shadow-[0_8px_16px_rgba(0,0,0,0.1),0_20px_48px_rgba(0,0,0,0.15)]',
            'dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_20px_48px_rgba(0,0,0,0.4)]',
            'backdrop-blur-2xl',
            'max-h-56 overflow-y-auto',
            'animate-in fade-in-0 zoom-in-95 duration-200',
          )}
        >
          <div className="p-1.5">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    close()
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-[10px] px-3.5 text-sm transition-all duration-150',
                    compact ? 'py-2' : 'py-2.5',
                    isSelected
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-text-primary hover:bg-(--ds-action-btn-hover-bg) hover:translate-x-1',
                  )}
                >
                  {isSelected && <DSIcon name="check" size={14} className="shrink-0 text-brand-primary" />}
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
