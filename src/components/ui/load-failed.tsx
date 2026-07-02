'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

interface LoadFailedProps {
  onRetry?: () => void
  message?: string
  className?: string
}

/**
 * Fallback exibido quando uma query falha (timeout, rede, 5xx).
 * Usado nas páginas que antes ficavam presas em "Carregando...".
 */
export function LoadFailed({ onRetry, message, className }: LoadFailedProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 px-6 py-10 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
        <DSIcon name="alertTriangle" size={22} className="text-red-400" />
      </div>
      <p className="text-sm font-semibold text-text-primary">
        {message || 'Falha ao carregar. Tente novamente.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <DSIcon name="refresh" size={14} />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
