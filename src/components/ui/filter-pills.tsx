// ============================================
// filter-pills.tsx — Filtro em pills/tabs DS v2
// ============================================
//
// O que faz:
//   Componente de filtro em formato pill para troca de visualização/categoria.
//   Pill ativo: gradiente emerald. Pill inativo: surface-subtle + hover.
//   Suporta scroll horizontal em mobile via overflow-x-auto.
//   Callback onChange(value) ao selecionar pill.
//
// Exports principais:
//   FilterPills — componente de filtro em pills
//   FilterPillOption — tipo { label, value, count? }
//   FilterPillsProps — interface de props
'use client'

import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────
 * FilterPills — DS v2 Filter Pills
 * Active: emerald gradient + 3D shadow + white text
 * Inactive: neutral bg + border + muted text
 * ───────────────────────────────────────────── */

export interface FilterPillOption {
  key: string
  label: string
  count?: number
}

export interface FilterPillsProps {
  options: FilterPillOption[]
  selected: string
  onChange: (key: string) => void
  className?: string
}

export function FilterPills({ options, selected, onChange, className }: FilterPillsProps) {
  return (
    <div role="tablist" className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const isActive = opt.key === selected

        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.key)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border-[1.5px] px-4.5 py-2 text-[13px] font-semibold transition-all duration-200 ease-out-expo select-none',
              isActive
                ? 'border-brand-deep bg-linear-to-b from-brand-primary-hover to-brand-primary text-white shadow-[0_2px_0_#047857,0_4px_8px_rgba(16,185,129,0.25)] [text-shadow:0_1px_2px_rgba(0,0,0,0.15)]'
                : 'border-border-light bg-bg-secondary/88 text-text-secondary shadow-[0_2px_0_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-border-light hover:text-brand-primary hover:shadow-[0_3px_0_rgba(255,255,255,0.08),0_6px_12px_rgba(0,0,0,0.06)] active:translate-y-0.5 active:shadow-[0_0px_0_rgba(255,255,255,0.06)]'
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  'ml-0.5 rounded-full px-1.5 py-px text-[10px] font-bold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-200 text-text-secondary dark:bg-white/10'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
