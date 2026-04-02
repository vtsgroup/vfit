// ============================================
// user-search.tsx — Barra de busca de usuários DS v2
// ============================================
//
// O que faz:
//   Componente de busca textual DS v2 com input + botão de busca.
//   Select opcional para filtrar por tipo/categoria antes da busca.
//   Debounce opcional via prop onSearch (chamado ao digitar ou submeter).
//   Usado em páginas de listagem (alunos, personals, marketplace).
//
// Exports principais:
//   UserSearch — barra de busca com input, botão e select opcional
//   UserSearchProps — interface de props
'use client'

import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon } from './ds-icon'
import { Button } from './button'
import { CustomSelect3D, type CustomSelect3DProps } from './custom-select-3d'

/* ─────────────────────────────────────────────
 * UserSearch — DS v2 Search Bar
 * Search input (icon left) + "Buscar" Button sm + optional CustomSelect filter
 * ───────────────────────────────────────────── */

export interface UserSearchProps {
  /** Input placeholder */
  placeholder?: string
  /** Called when user submits or clicks Buscar */
  onSearch: (term: string) => void
  /** Optional filter select */
  filterOptions?: CustomSelect3DProps['options']
  filterValue?: string
  onFilterChange?: (val: string) => void
  /** Search button label */
  searchLabel?: string
  /** Additional className for wrapper */
  className?: string
}

export function UserSearch({
  placeholder = 'Buscar por nome ou email...',
  onSearch,
  filterOptions,
  filterValue,
  onFilterChange,
  searchLabel = 'Buscar',
  className,
}: UserSearchProps) {
  const [term, setTerm] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(term)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex flex-wrap items-center gap-3', className)}
    >
      {/* Search input with icon */}
      <div className="relative flex min-w-50 flex-1 items-center">
        <span className="pointer-events-none absolute left-3.5 z-1 flex text-text-secondary">
          <DSIcon name="search" size={16} />
        </span>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-[14px] border-[1.5px] border-border-light bg-bg-secondary/80 py-3 pl-10.5 pr-4 font-sans text-sm text-text-primary shadow-card outline-none backdrop-blur-sm transition-colors',
            'placeholder:text-text-secondary',
            'focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20',
          )}
        />
      </div>

      {/* Search button */}
      <Button type="submit" size="sm">
        <DSIcon name="search" size={14} />
        {searchLabel}
      </Button>

      {/* Optional filter */}
      {filterOptions && onFilterChange && (
        <CustomSelect3D
          options={filterOptions}
          value={filterValue ?? filterOptions[0]?.value ?? ''}
          onChange={onFilterChange}
        />
      )}
    </form>
  )
}
