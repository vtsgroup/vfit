// ============================================
// error.tsx — Error boundary do dashboard
// ============================================
//
// O que faz:
//   Error boundary de nível dashboard (Next.js error.tsx).
//   Registra o erro no backend (se autenticado) ou em fila local de debug.
//   Exibe UI de erro com botão de retry e link para home.
//
// Exports principais:
//   DashboardError — error boundary do dashboard
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { logClientIssue } from '@/lib/debug-logger'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // best-effort: registra no backend (se tiver auth) ou em fila local
    void logClientIssue({
      level: 'error',
      source: 'dashboard.error.tsx',
      message: error?.message || 'Erro desconhecido no dashboard',
      stack: error?.stack,
      context: { digest: error?.digest },
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-border-light bg-bg-secondary p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-error/10">
            <DSIcon name="alertTriangle" className="text-status-error" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-text-primary">Ops — algo quebrou no dashboard</h1>
            <p className="mt-1 text-sm text-text-muted">
              Esse erro já foi registrado. Se estiver acontecendo sempre (ex.: Configurações), abra a tela de Logs.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={reset}>
                <DSIcon name="refresh" size={16} className="mr-1.5" /> Tentar novamente
              </Button>
              <Link
                href="/dashboard/logs"
                className="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary active:scale-[0.98] border border-border-light bg-transparent text-text-primary hover:bg-bg-tertiary focus-visible:ring-border-light/60 h-11 px-4 text-sm gap-2 rounded-xl"
              >
                <DSIcon name="fileText" size={16} /> Ver Logs
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-border-light bg-bg-primary p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Detalhes</p>
              <p className="mt-1 wrap-break-word text-sm text-text-primary/90">
                {error?.message || 'Erro desconhecido'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
