/**
 * src/components/ui/brand-loader.tsx
 *
 * BrandLoader — Loading state ultraleve com o mark VFIT
 *
 * Exports: BrandLoader
 * Features: 'use client' · CSS-only (sem partículas/JS de animação)
 *
 * Uso: estado de loading full-page ou inline para qualquer tela.
 * Diferença para o SplashScreen: SEM máquina de estados, SEM partículas,
 * SEM Math.random. Apenas o V desenhando + glow suave. Custo de DOM mínimo.
 */

'use client'

import { cn } from '@/lib/utils'

/* ─── V mark inline (sem dependência de <img>, herda corrente) ─── */
function VMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bl-bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#56EF85" />
          <stop offset="38%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#065F2C" />
        </linearGradient>
        <radialGradient id="bl-hl" cx="33%" cy="28%" r="54%">
          <stop offset="0%" stopColor="rgba(255,255,255,.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="46" fill="url(#bl-bg)" />
      <rect width="200" height="200" rx="46" fill="url(#bl-hl)" />
      <polyline
        points="32,38 100,162 168,38"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 340,
          strokeDashoffset: 340,
          animation: 'blDraw 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      />
    </svg>
  )
}

export interface BrandLoaderProps {
  /** full-page overlay escuro (default) ou inline transparente */
  variant?: 'page' | 'inline'
  /** tamanho do mark em px (default 56) */
  size?: number
  /** legenda opcional sob o mark */
  label?: string
  className?: string
}

export function BrandLoader({
  variant = 'page',
  size = 56,
  label,
  className,
}: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        variant === 'page' && 'fixed inset-0 z-9999',
        className,
      )}
      style={
        variant === 'page'
          ? { background: 'radial-gradient(ellipse 120% 80% at 50% 40%, #0a1322 0%, #050a12 70%)', colorScheme: 'dark' }
          : undefined
      }
    >
      {/* glow + mark */}
      <div className="relative flex items-center justify-center">
        {/* pulsing halo (CSS-only) */}
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: size * 2.2,
            height: size * 2.2,
            background: 'radial-gradient(circle, rgba(34,197,94,0.30) 0%, rgba(34,197,94,0.06) 45%, transparent 68%)',
            animation: 'blHalo 2.4s ease-in-out infinite',
          }}
        />
        <span className="relative z-10 drop-shadow-[0_8px_24px_rgba(34,197,94,0.25)]">
          <VMark size={size} />
        </span>
      </div>

      {/* slim progress bar (indeterminate) */}
      <div className="h-0.5 w-28 overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full w-1/3 rounded-full bg-linear-to-r from-brand-primary/40 via-brand-primary to-emerald-400/70"
          style={{ animation: 'blBar 1.1s ease-in-out infinite' }}
        />
      </div>

      {label && (
        <p
          className="text-[10px] uppercase text-brand-primary/70"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight: 700,
            letterSpacing: '0.18em',
          }}
        >
          {label}
        </p>
      )}

      <span className="sr-only">Carregando…</span>

      <style>{`
        @keyframes blDraw { to { stroke-dashoffset: 0; } }
        @keyframes blHalo {
          0%, 100% { transform: scale(0.92); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes blBar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="blDraw"] { animation: none !important; stroke-dashoffset: 0 !important; }
          [style*="blHalo"], [style*="blBar"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
