// ============================================
// error.tsx — Error boundary raiz da aplicação
// ============================================
//
// O que faz:
//   Error boundary de nível root (Next.js error.tsx em src/app/).
//   Cobre landing page, auth pages e qualquer rota fora do dashboard.
//   Registra o erro em fila local de debug.
//   Exibe UI de erro minimalista com botão de retry e link para home.
//
// Exports principais:
//   RootError — error boundary raiz
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logClientIssue } from '@/lib/debug-logger'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    void logClientIssue({
      level: 'error',
      source: 'app.error.tsx',
      message: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      context: { digest: error?.digest },
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-5xl font-black text-text-primary">500</p>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Algo deu errado</h1>
        <p className="mt-2 text-sm text-text-muted">
          Esse erro foi registrado automaticamente. Tente novamente ou volte para a página inicial.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border-light px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-bg-secondary"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
