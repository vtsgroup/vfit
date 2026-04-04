/**
 * src/components/ui/date-range-picker.tsx
 *
 * DateRangePicker — Seletor de período com presets rápidos
 * Design: glassmorphism dark-first, Tailwind v4 syntax
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// Types
// ============================================

export interface DateRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

// ============================================
// Presets
// ============================================

interface Preset {
  label: string
  icon: string
  getRange: () => DateRange
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const PRESETS: Preset[] = [
  {
    label: 'Hoje',
    icon: 'calendar',
    getRange: () => {
      const now = formatDate(new Date())
      return { start: now, end: now }
    },
  },
  {
    label: '7 dias',
    icon: 'calendar',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return { start: formatDate(start), end: formatDate(end) }
    },
  },
  {
    label: '30 dias',
    icon: 'calendar',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return { start: formatDate(start), end: formatDate(end) }
    },
  },
  {
    label: 'Este mês',
    icon: 'calendar',
    getRange: () => {
      const now = new Date()
      return { start: formatDate(startOfMonth(now)), end: formatDate(now) }
    },
  },
  {
    label: 'Mês passado',
    icon: 'calendar',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: formatDate(start), end: formatDate(end) }
    },
  },
  {
    label: '3 meses',
    icon: 'calendar',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      start.setDate(1)
      return { start: formatDate(start), end: formatDate(end) }
    },
  },
]

// ============================================
// Helpers
// ============================================

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function getPresetLabel(range: DateRange): string | null {
  for (const preset of PRESETS) {
    const r = preset.getRange()
    if (r.start === range.start && r.end === range.end) return preset.label
  }
  return null
}

// ============================================
// Component
// ============================================

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePreset = useCallback((preset: Preset) => {
    onChange(preset.getRange())
    setOpen(false)
  }, [onChange])

  const handleCustomDate = useCallback((field: 'start' | 'end', val: string) => {
    onChange({ ...value, [field]: val })
  }, [onChange, value])

  const presetLabel = getPresetLabel(value)
  const displayText = presetLabel
    ? presetLabel
    : `${formatDisplayDate(value.start)} — ${formatDisplayDate(value.end)}`

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-[12px] font-medium text-text-secondary hover:bg-white/8 transition-colors"
      >
        <DSIcon name="calendar" size={14} className="text-text-muted" />
        <span>{displayText}</span>
        <DSIcon
          name="chevronDown"
          size={12}
          className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-2xl border border-white/10 bg-surface-2 p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Presets */}
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Períodos rápidos
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = presetLabel === preset.label
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset)}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                        : 'bg-white/4 text-text-secondary hover:bg-white/8 border border-transparent'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom range */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Personalizado
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={value.start}
                  onChange={(e) => handleCustomDate('start', e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-white/4 px-2.5 py-1.5 text-[11px] text-text-primary"
                />
              </div>
              <span className="text-[10px] text-text-muted">→</span>
              <div className="flex-1">
                <input
                  type="date"
                  value={value.end}
                  onChange={(e) => handleCustomDate('end', e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-white/4 px-2.5 py-1.5 text-[11px] text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
