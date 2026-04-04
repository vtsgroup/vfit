/**
 * src/components/dashboard/dashboard-filter-bar.tsx
 *
 * Barra de filtros do dashboard B2B — DateRange + Status selector
 * Usado no topo do dashboard do personal para filtrar período e status
 */

'use client'

import { useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'

// ============================================
// Types
// ============================================

export interface DashboardFilters {
  dateRange: DateRange
  status: string | null // null = all
}

interface DashboardFilterBarProps {
  filters: DashboardFilters
  onChange: (filters: DashboardFilters) => void
}

// ============================================
// Status options
// ============================================

const STATUS_OPTIONS = [
  { value: null, label: 'Todos', icon: 'users' as const },
  { value: 'active', label: 'Ativos', icon: 'userCheck' as const },
  { value: 'inactive', label: 'Inativos', icon: 'userX' as const },
  { value: 'pending', label: 'Pendentes', icon: 'clock' as const },
]

// ============================================
// Helpers
// ============================================

function getDefaultDateRange(): DateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function useDefaultFilters(): DashboardFilters {
  return {
    dateRange: getDefaultDateRange(),
    status: null,
  }
}

// ============================================
// Component
// ============================================

export function DashboardFilterBar({ filters, onChange }: DashboardFilterBarProps) {
  const handleDateChange = useCallback((dateRange: DateRange) => {
    onChange({ ...filters, dateRange })
  }, [filters, onChange])

  const handleStatusChange = useCallback((status: string | null) => {
    onChange({ ...filters, status })
  }, [filters, onChange])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = filters.status === opt.value
          return (
            <button
              key={opt.value ?? 'all'}
              onClick={() => handleStatusChange(opt.value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/25'
                  : 'bg-white/4 text-text-secondary hover:bg-white/8 border border-transparent'
              }`}
            >
              <DSIcon name={opt.icon} size={12} />
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Date range picker */}
      <DateRangePicker
        value={filters.dateRange}
        onChange={handleDateChange}
      />
    </div>
  )
}
