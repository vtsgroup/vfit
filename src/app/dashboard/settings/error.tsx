// ============================================
// error.tsx — Error boundary da página de configurações
// ============================================
//
// O que faz:
//   Error boundary específico para /dashboard/settings.
//   Exibe UI de erro com botão de retry (reset) e link para dashboard.
//
// Exports principais:
//   SettingsError — error boundary de settings
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { logClientIssue } from '@/lib/debug-logger'
import { Button } from '@/components/ui/button'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    void logClientIssue({
      level: 'error',
      source: 'dashboard.settings.error.tsx',
      message: error?.message || 'Erro desconhecido em Configurações',
      stack: error?.stack,
      context: { digest: error?.digest },
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-border-light bg-bg-secondary p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="settings" className="text-brand-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-text-primary">Configurações falhou ao carregar</h1>
            <p className="mt-1 text-sm text-text-muted">
              Esse erro foi registrado automaticamente. Você pode tentar recarregar ou ver os logs.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={reset}>
                <DSIcon name="refresh" size={16} className="mr-1.5" /> Tentar novamente
              </Button>
              <Link
                href="/dashboard/settings?safe=1"
                className="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary active:scale-[0.98] border border-status-warning/30 bg-status-warning/5 text-text-primary hover:bg-status-warning/10 focus-visible:ring-status-warning/30 h-11 px-4 text-sm gap-2 rounded-xl"
              >
                <DSIcon name="shield" size={16} /> Abrir modo seguro
              </Link>
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

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-status-warning/20 bg-status-warning/5 p-3">
              <DSIcon name="alertTriangle" size={16} className="mt-0.5 shrink-0 text-status-warning" />
              <p className="text-xs text-text-muted">
                Se isso estiver acontecendo “muitas vezes”, normalmente é uma exceção em algum bloco (ex.: biometria/WebAuthn,
                notificações/OneSignal ou upload de foto). Os logs mostram a causa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
