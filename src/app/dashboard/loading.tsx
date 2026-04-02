/**
 * src/app/dashboard/loading.tsx
 *
 * Dashboard Loading — Dark screen with premium spinner
 *
 * Exports: DashboardLoading
 */

// ============================================
// Dashboard Loading — Dark screen with premium spinner
// Prevents white flash during route transitions
// ============================================

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Premium spinner — green pulsing ring */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/6" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-primary" style={{ animationDuration: '0.8s' }} />
          <div className="absolute inset-1 rounded-full bg-brand-primary/5 animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
        <p className="text-xs font-medium text-white/30 tracking-wide animate-pulse" style={{ animationDuration: '2s' }}>
          Carregando...
        </p>
      </div>
    </div>
  )
}
