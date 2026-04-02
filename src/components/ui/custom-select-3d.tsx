/**
 * src/components/ui/custom-select-3d.tsx
 *
 * CustomSelect3D — Premium Select with 3D depth
 *
 * Exports: CustomSelect3DProps, CustomSelect3D
 * Hooks: useState, useRef, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// CustomSelect3D — Premium Select with 3D depth
// Glass surface · refined borders · elegant animation
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon } from './ds-icon'

interface SelectOption {
  value: string
  label: string
}

export interface CustomSelect3DProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Min width in px (default 170) */
  minWidth?: number
}

export function CustomSelect3D({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  className,
  minWidth = 170,
}: CustomSelect3DProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue)
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <div ref={ref} className={cn('relative inline-flex', className)} style={{ minWidth }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2',
          'rounded-2xl border px-4 py-3',
          'light:bg-white/90 dark:bg-white/5',
          'backdrop-blur-sm',
          'text-sm font-medium',
          'dark:text-white light:text-slate-900',
          'light:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.04)]',
          'dark:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)]',
          'transition-all duration-300 ease-out',
          'cursor-pointer',
          isOpen
            ? cn(
                'dark:border-emerald-400/50 light:border-emerald-400/60',
                'shadow-[0_0_0_3px_rgba(16,185,129,0.1),0_4px_16px_rgba(0,0,0,0.1)]',
                'dark:bg-white/8 light:bg-white',
              )
            : cn(
                'dark:border-white/12 light:border-slate-200',
                'dark:hover:border-white/25 dark:hover:bg-white/6 light:hover:border-slate-300 light:hover:bg-white',
              ),
        )}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <span
          className={cn(
            'flex shrink-0 transition-all duration-300 ease-out',
            isOpen && 'rotate-180',
          )}
        >
          <DSIcon name="chevronDown" size={16} className={cn(
            'transition-colors duration-300',
            isOpen ? 'text-emerald-400' : 'dark:text-white/35 light:text-slate-400',
          )} />
        </span>
      </button>

      {/* Dropdown menu */}
      <div
        className={cn(
          'absolute left-0 right-0 top-[calc(100%+8px)] z-50',
          'rounded-2xl border p-1.5',
          'dark:bg-[#0f1a2e]/95 light:bg-white/98',
          'dark:border-white/12 light:border-slate-200',
          'backdrop-blur-2xl',
          'dark:shadow-[0_8px_30px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.1)]',
          'light:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
          'transition-all duration-250 ease-out',
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-96 opacity-0'
        )}
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5',
              'text-sm transition-all duration-200',
              opt.value === value
                ? 'bg-emerald-500/12 font-semibold dark:text-emerald-400 light:text-emerald-600'
                : cn(
                    'font-medium dark:text-white/80 light:text-slate-700',
                    'dark:hover:bg-white/8 light:hover:bg-slate-50',
                  ),
            )}
          >
            {opt.value === value && <DSIcon name="check" size={14} className="dark:text-emerald-400 light:text-emerald-600" />}
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  )
}
