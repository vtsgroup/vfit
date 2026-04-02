/**
 * src/components/ui/spinner.tsx
 *
 * Spinner — loading indicator
 *
 * Exports: Spinner, PageLoader, Skeleton
 */

// ============================================
// Spinner — loading indicator
// ============================================

import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-brand-primary border-t-transparent',
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Carregando"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  )
}

// Full-page loader
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    </div>
  )
}

// Inline skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-bg-tertiary',
        className
      )}
    />
  )
}
