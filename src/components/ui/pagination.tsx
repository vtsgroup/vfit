/**
 * src/components/ui/pagination.tsx
 *
 * Pagination — controles reutilizáveis de paginação.
 *
 * Substitui o JSX inline duplicado em 7+ páginas do dashboard.
 * Props: page, totalPages, onPrev, onNext, total (opcional para mostrar contagem), label (opcional).
 */

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// Types
// ============================================
export interface PaginationProps {
  /** Página atual (1-based) */
  page: number
  /** Total de páginas */
  totalPages: number
  /** Total de registros (opcional — exibido no label) */
  total?: number
  /** Label customizado. Ex: "sugestões", "alunos". Default: "registros" */
  itemLabel?: string
  /** Callback para página anterior */
  onPrev: () => void
  /** Callback para próxima página */
  onNext: () => void
  className?: string
}

// ============================================
// Component
// ============================================
export function Pagination({
  page,
  totalPages,
  total,
  itemLabel = 'registros',
  onPrev,
  onNext,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-sm text-text-muted">
        {total !== undefined
          ? `Página ${page} de ${totalPages} · ${total} ${itemLabel}`
          : `Página ${page} de ${totalPages}`}
      </p>
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 flex-1 sm:flex-none"
          disabled={page <= 1}
          onClick={onPrev}
        >
          <DSIcon name="chevronLeft" size={16} />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 flex-1 sm:flex-none"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Próxima
          <DSIcon name="chevronRight" size={16} />
        </Button>
      </div>
    </div>
  )
}
