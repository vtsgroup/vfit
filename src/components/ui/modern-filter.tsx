/**
 * src/components/ui/modern-filter.tsx
 *
 * Modern Filter — Floating filter chips + dropdown
 *
 * Exports: FilterOption, FilterGroup, FilterChip, FilterBar, MediaFilter
 * Hooks: useState, useRef, useEffect
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Modern Filter — Floating filter chips + dropdown
// With pill animations, glassmorphism, smooth transitions
// ============================================

'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

export interface FilterOption {
  id: string
  label: string
  icon?: ReactNode
  color?: string
}

export interface FilterGroup {
  id: string
  label: string
  icon?: ReactNode
  options: FilterOption[]
  multiple?: boolean
}

// ============================================
// Filter Chip (individual toggle pill)
// ============================================

export function FilterChip({
  label,
  icon,
  active,
  color,
  onClick,
  onRemove,
}: {
  label: string
  icon?: ReactNode
  active?: boolean
  color?: string
  onClick?: () => void
  onRemove?: () => void
}) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
        'border transition-all duration-200',
        active
          ? cn(
              'border-brand-primary/30 bg-brand-primary/10 text-brand-primary',
              'shadow-[0_0_12px_rgba(34,197,94,0.1)]'
            )
          : 'dark:border-white/10 light:border-slate-200 dark:bg-white/3 light:bg-slate-100 dark:text-white/60 light:text-slate-500 dark:hover:bg-white/6 light:hover:bg-slate-200 dark:hover:text-white/80 light:hover:text-slate-700'
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
      {active && onRemove && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary/20 hover:bg-brand-primary/30 transition-colors"
        >
          <DSIcon name="x" size={10} />
        </motion.span>
      )}
    </motion.button>
  )
}

// ============================================
// Filter Bar (horizontal scrollable chips)
// ============================================

export function FilterBar({
  groups,
  selected,
  onChange,
  showSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
}: {
  groups: FilterGroup[]
  selected: Record<string, string[]>
  onChange: (groupId: string, optionId: string) => void
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const totalActive = Object.values(selected).flat().length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <DSIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white/30 light:text-slate-400" />
          <input
            type="text"
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              'h-8 rounded-full border dark:border-white/10 light:border-slate-200 dark:bg-white/3 light:bg-slate-50 pl-8 pr-3',
              'text-xs dark:text-white light:text-slate-900 dark:placeholder:text-white/30 light:placeholder:text-slate-400',
              'focus:border-brand-primary/30 focus:outline-none focus:ring-1 focus:ring-brand-primary/20',
              'w-48 transition-all duration-200 focus:w-56'
            )}
          />
        </div>
      )}

      {/* Filter icon + count */}
      <div className="flex items-center gap-1.5 dark:text-white/40 light:text-slate-400">
        <DSIcon name="slidersHorizontal" size={14} />
        {totalActive > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[9px] font-bold text-black"
          >
            {totalActive}
          </motion.span>
        )}
      </div>

      {/* Group buttons */}
      <div ref={dropdownRef} className="flex flex-wrap items-center gap-1.5">
        {groups.map((group) => {
          const groupSelected = selected[group.id] || []
          const isOpen = openGroup === group.id

          return (
            <div key={group.id} className="relative">
              <FilterChip
                label={group.label}
                icon={group.icon}
                active={groupSelected.length > 0}
                onClick={() => setOpenGroup(isOpen ? null : group.id)}
              />

              {/* Dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={cn(
                      'absolute left-0 top-full z-50 mt-1.5 min-w-45 overflow-hidden',
                      'rounded-xl border dark:border-white/10 light:border-slate-200 dark:bg-kpi-dark/95 light:bg-white/95 backdrop-blur-xl',
                      'shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
                    )}
                  >
                    <div className="p-1.5">
                      {group.options.map((option) => {
                        const isSelected = groupSelected.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            onClick={() => onChange(group.id, option.id)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs',
                              'transition-all duration-150',
                              isSelected
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'dark:text-white/60 light:text-slate-500 dark:hover:bg-white/4 light:hover:bg-slate-100 dark:hover:text-white/80 light:hover:text-slate-700'
                            )}
                          >
                            {option.icon && <span className="shrink-0">{option.icon}</span>}
                            <span className="flex-1 text-left">{option.label}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <DSIcon name="check" size={14} className="text-brand-primary" />
                              </motion.div>
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
        })}
      </div>

      {/* Clear all */}
      <AnimatePresence>
        {totalActive > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => groups.forEach((g) => (selected[g.id] || []).forEach((o) => onChange(g.id, o)))}
            className="text-[10px] font-medium dark:text-white/30 light:text-slate-400 dark:hover:text-white/60 light:hover:text-slate-700 transition-colors"
          >
            Limpar filtros
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Media Filter (Images/Videos like the mockup)
// ============================================

export function MediaFilter({
  value,
  onChange,
}: {
  value: 'all' | 'images' | 'videos'
  onChange: (value: 'all' | 'images' | 'videos') => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
          value !== 'all'
            ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
            : 'dark:border-white/10 light:border-slate-200 dark:bg-white/3 light:bg-slate-100 dark:text-white/60 light:text-slate-500 dark:hover:bg-white/6 light:hover:bg-slate-200'
        )}
      >
        <DSIcon name="filter" size={14} />
        {value === 'all' ? 'Filter by' : value === 'images' ? 'Imagens' : 'Vídeos'}
        <DSIcon name="chevronDown" size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className={cn(
                'absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden',
                'rounded-xl border dark:border-white/10 light:border-slate-200 dark:bg-kpi-dark/95 light:bg-white/95 backdrop-blur-xl',
                'shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
              )}
            >
              <div className="p-1.5">
                <button
                  onClick={() => { onChange('images'); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all',
                    value === 'images'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'dark:text-white/60 light:text-slate-500 dark:hover:bg-white/4 light:hover:bg-slate-100 dark:hover:text-white/80 light:hover:text-slate-700'
                  )}
                >
                  <DSIcon name="image" size={16} />
                  <span>Images</span>
                  {value === 'images' && <DSIcon name="check" size={14} className="ml-auto" />}
                </button>
                <button
                  onClick={() => { onChange('videos'); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all',
                    value === 'videos'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'dark:text-white/60 light:text-slate-500 dark:hover:bg-white/4 light:hover:bg-slate-100 dark:hover:text-white/80 light:hover:text-slate-700'
                  )}
                >
                  <DSIcon name="video" size={16} />
                  <span>Videos</span>
                  {value === 'videos' && <DSIcon name="check" size={14} className="ml-auto" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
