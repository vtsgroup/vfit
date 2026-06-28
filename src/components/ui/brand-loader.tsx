/**
 * src/components/ui/brand-loader.tsx
 *
 * BrandLoader — Loading on-brand unificado.
 *
 * Exports: BrandLoader
 * Features: 'use client' · CSS-only (sem partículas/JS de animação)
 *
 * variant="page"  → tela cheia com a IDENTIDADE DA SPLASH (marca V+wifi do favicon +
 *                   wordmark VFIT em Space Grotesk + barra verde). Sem mensagem de texto:
 *                   qualquer carregamento full-page mostra a mesma cara da abertura.
 * variant="inline"→ loader pequeno dentro do conteúdo (marca V + barra), com label opcional.
 *
 * Diferença para o SplashScreen: aqui NÃO há máquina de estados/sessionStorage/partículas;
 * é só o visual da marca + barra. O SplashScreen (cinematográfico) continua dono do boot.
 */

'use client'

import { cn } from '@/lib/utils'

/* ─── V mark simples (inline, herda corrente) — usado no variant inline ─── */
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
  /** full-page (identidade da splash) ou inline transparente */
  variant?: 'page' | 'inline'
  /** tamanho do mark em px (inline; default 56) */
  size?: number
  /** legenda opcional (apenas inline) */
  label?: string
  /** 'mono' = microcaps técnica (default); 'soft' = frase legível */
  labelTone?: 'mono' | 'soft'
  className?: string
}

export function BrandLoader({
  variant = 'page',
  size = 56,
  label,
  labelTone = 'mono',
  className,
}: BrandLoaderProps) {
  /* ─── PAGE: mesma cara da splash (marca V+wifi + wordmark VFIT + barra) ─── */
  if (variant === 'page') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Carregando VFIT"
        className={cn('fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden', className)}
        style={{ background: 'radial-gradient(circle at 50% 42%, #0c1a3a 0%, #08122b 55%, #050a12 100%)', colorScheme: 'dark' }}
      >
        {/* grid sutil à deriva (atmosfera da splash) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(58,181,74,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(58,181,74,.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            WebkitMaskImage: 'radial-gradient(circle at 50% 46%, #000 22%, transparent 72%)',
            maskImage: 'radial-gradient(circle at 50% 46%, #000 22%, transparent 72%)',
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* glow respirando */}
          <span
            aria-hidden="true"
            className="absolute -top-6 h-64 w-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(58,181,74,.42), rgba(58,181,74,.10) 45%, transparent 68%)',
              filter: 'blur(6px)',
              animation: 'blGlow 5s ease-in-out infinite',
            }}
          />
          {/* marca V+wifi (favicon oficial) — pop-in */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicons/favicon.svg"
            alt=""
            width={104}
            height={104}
            className="relative rounded-2xl shadow-[0_22px_60px_-18px_rgba(58,181,74,0.5)]"
            style={{ animation: 'blPop 0.7s cubic-bezier(0.2,0.75,0.3,1) both' }}
          />
          {/* wordmark VFIT (Space Grotesk 900) */}
          <h1
            className="relative mt-8 font-black uppercase text-[#edf4ee]"
            style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              fontSize: 38,
              letterSpacing: '0.16em',
              paddingLeft: '0.16em',
              lineHeight: 1,
              WebkitTextStroke: '0.6px #edf4ee',
              textShadow: '0 2px 26px rgba(58,181,74,0.28)',
              animation: 'blWord 0.5s cubic-bezier(0.2,0.8,0.2,1) 0.25s both',
            }}
          >
            VFIT
          </h1>
          {/* barra de loading verde (creep + shimmer) */}
          <div className="relative mt-5 h-1 w-37.5 overflow-hidden rounded-full bg-white/8">
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg,#2e9f3c,#4ed06a)',
                boxShadow: '0 0 10px rgba(58,181,74,0.6)',
                transform: 'scaleX(.06)',
                animation: 'blCreep 6s cubic-bezier(0.15,0.7,0.2,1) 0.35s forwards',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 w-2/5 rounded-full"
              style={{
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)',
                transform: 'translateX(-120%)',
                animation: 'blShimmer 1.5s ease-in-out 0.4s infinite',
              }}
            />
          </div>
        </div>

        <span className="sr-only">Carregando…</span>

        <style>{`
          @keyframes blPop { 0%{opacity:0;transform:scale(.6)} 62%{opacity:1;transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
          @keyframes blWord { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
          @keyframes blCreep { 0%{transform:scaleX(.06)} 100%{transform:scaleX(.9)} }
          @keyframes blShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
          @keyframes blGlow { 0%,100%{opacity:.45} 50%{opacity:.7} }
          @media (prefers-reduced-motion: reduce) {
            [style*="blPop"],[style*="blWord"],[style*="blGlow"],[style*="blShimmer"] { animation: none !important; opacity: 1 !important; transform: none !important; }
            [style*="blCreep"] { animation: none !important; transform: scaleX(.5) !important; }
          }
        `}</style>
      </div>
    )
  }

  /* ─── INLINE: loader pequeno dentro do conteúdo ─── */
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('flex flex-col items-center justify-center gap-4', className)}
    >
      <div className="relative flex items-center justify-center">
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

      <div className="h-0.5 w-28 overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full w-1/3 rounded-full bg-linear-to-r from-brand-primary/40 via-brand-primary to-emerald-400/70"
          style={{ animation: 'blBar 1.1s ease-in-out infinite' }}
        />
      </div>

      {label && labelTone === 'soft' && <p className="text-sm font-semibold text-slate-400">{label}</p>}
      {label && labelTone === 'mono' && (
        <p
          className="text-[10px] uppercase text-brand-primary/70"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.18em' }}
        >
          {label}
        </p>
      )}

      <span className="sr-only">Carregando…</span>

      <style>{`
        @keyframes blDraw { to { stroke-dashoffset: 0; } }
        @keyframes blHalo { 0%, 100% { transform: scale(0.92); opacity: 0.7; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes blBar { 0% { transform: translateX(-120%); } 100% { transform: translateX(360%); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="blDraw"] { animation: none !important; stroke-dashoffset: 0 !important; }
          [style*="blHalo"], [style*="blBar"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
