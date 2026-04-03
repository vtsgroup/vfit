'use client'

/**
 * src/app/global-error.tsx
 *
 * Global Error Boundary — catches errors in the root layout itself.
 * This is the LAST fallback before a white screen.
 * Sprint S12/S13 — Resiliência
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#050A12',
        color: '#F0F4F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 1.5rem',
            borderRadius: 16,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Algo deu errado
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, lineHeight: 1.5 }}>
            Um erro inesperado ocorreu. Tente recarregar a página.
            {error.digest && (
              <span style={{ display: 'block', marginTop: 8, fontSize: 11, color: '#64748B' }}>
                Código: {error.digest}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#22C55E',
                color: '#000',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'transparent',
                color: '#F0F4F8',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Ir para início
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
