/**
 * src/components/ui/splash-screen.tsx
 *
 * SplashScreen — Abertura VFIT ultraleve e ultramoderna
 *
 * Exports: SplashScreen
 * Hooks: useState, useEffect, useRef
 * Features: 'use client'
 *
 * v4 (2026-06-21): reescrita leve.
 *  - Removidas 30 partículas animadas e 3 camadas de aurora (custo de DOM/CPU).
 *  - Removida cor hardcoded de className (RULES §12) → background via inline style.
 *  - Mantida a MESMA máquina de estados + API `isReady` + válvula de segurança
 *    (cobre validação de /auth/me sem prender o usuário atrás do splash).
 *  - Mark V desenha + halo suave (CSS-only) + wordmark + barra. ~1.8s total.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const VFIT_LETTERS = 'VFIT'.split('')
const ICON_DRAW = 700       // V desenha em 700ms
const TEXT_START = 360      // wordmark começa após o V pegar tração
const BREATHE_START = ICON_DRAW + 400
const SPLASH_TOTAL = BREATHE_START + 600
const SPLASH_KEY = 'vfit-splash-v4'

/* ─── Mark V inline (gradiente da marca, sem <img>) ─── */
function VFITIcon({ size, drawn }: { size: number; drawn: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="splash-bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#56EF85" />
          <stop offset="38%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#065F2C" />
        </linearGradient>
        <radialGradient id="splash-hl" cx="33%" cy="28%" r="54%">
          <stop offset="0%" stopColor="rgba(255,255,255,.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="46" fill="url(#splash-bg)" />
      <rect width="200" height="200" rx="46" fill="url(#splash-hl)" />
      <rect x="1" y="1" width="198" height="198" rx="45" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
      <polyline
        points="32,38 100,162 168,38"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 340,
          strokeDashoffset: drawn ? 0 : 340,
          transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </svg>
  )
}

export function SplashScreen({ isReady }: { isReady?: boolean }) {
  const [phase, setPhase] = useState<'init' | 'icon' | 'breathe' | 'exit' | 'done'>('init')
  const [shouldShow, setShouldShow] = useState(false)
  const [minComplete, setMinComplete] = useState(false)
  const bootRef = useRef(false)
  const ready = isReady ?? true

  // ─── Boot: máquina de estados (preservada da v3) ───
  useEffect(() => {
    if (bootRef.current) return
    bootRef.current = true

    // Reabertura na mesma sessão: ainda cobrimos validações de auth.
    if (sessionStorage.getItem(SPLASH_KEY)) {
      if (ready) { setPhase('done'); return }
      setShouldShow(true)
      setPhase('breathe')
      setMinComplete(true)
      return
    }

    setShouldShow(true)
    sessionStorage.setItem(SPLASH_KEY, '1')

    const tIcon = setTimeout(() => setPhase('icon'), 80)
    const tBreathe = setTimeout(() => setPhase('breathe'), 80 + BREATHE_START)
    const tMin = setTimeout(() => setMinComplete(true), 80 + BREATHE_START + 150)

    return () => { clearTimeout(tIcon); clearTimeout(tBreathe); clearTimeout(tMin) }
  }, [ready])

  // ─── Sair quando pronto + animação mínima concluída ───
  useEffect(() => {
    if (!shouldShow || !ready || !minComplete || phase === 'exit' || phase === 'done') return
    setPhase('exit')
  }, [minComplete, phase, ready, shouldShow])

  useEffect(() => {
    if (phase !== 'exit') return
    const t = setTimeout(() => setPhase('done'), 600)
    return () => clearTimeout(t)
  }, [phase])

  // ─── Válvula de segurança: nunca prender o usuário atrás do splash ───
  useEffect(() => {
    if (!shouldShow || phase === 'exit' || phase === 'done') return
    const t = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => setPhase('done'), 600)
    }, SPLASH_TOTAL + 1800)
    return () => clearTimeout(t)
  }, [phase, shouldShow])

  if (phase === 'done' || !shouldShow) return null

  const drawn = phase !== 'init'
  const settled = phase === 'breathe' || phase === 'exit'
  const isExiting = phase === 'exit'

  return (
    <div
      className={cn(
        'dark fixed inset-0 z-9999 flex items-center justify-center',
        'transition-all duration-600 ease-out-expo',
        isExiting ? 'pointer-events-none opacity-0 scale-105' : 'pointer-events-auto opacity-100 scale-100',
      )}
      style={{
        colorScheme: 'dark',
        background: 'radial-gradient(ellipse 120% 80% at 50% 38%, #0a1322 0%, #050a12 72%)',
      }}
      aria-hidden="true"
    >
      {/* Aurora única, suave (CSS-only) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 120% 60% at 50% 60%, rgba(16,185,129,0.14) 0%, transparent 58%)',
          animation: 'splashAurora 16s ease-in-out infinite alternate',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5,10,18,0.65) 100%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Anel pulsante único */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-primary/15',
            'transition-all duration-1200 ease-out-expo',
            phase === 'init' && 'h-20 w-20 opacity-0',
            (phase === 'icon') && 'h-44 w-44 opacity-100',
            settled && 'h-64 w-64 opacity-40',
            isExiting && 'h-96 w-96 opacity-0',
          )}
        />

        {/* Mark + wordmark */}
        <div
          className={cn(
            'relative flex items-center gap-4 transition-all duration-500',
            phase === 'init' ? 'opacity-0 scale-90' : 'opacity-100 scale-100',
            isExiting && 'opacity-0 scale-95 -translate-y-2',
          )}
        >
          <div className="relative">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl pointer-events-none"
              style={{
                width: 120,
                height: 120,
                background: 'radial-gradient(circle, rgba(34,197,94,0.40) 0%, rgba(34,197,94,0.10) 42%, transparent 66%)',
                animation: settled ? 'splashGlow 3s ease-in-out infinite' : 'none',
                opacity: settled ? 1 : 0.4,
                transition: 'opacity 0.8s ease',
              }}
            />
            <VFITIcon size={72} drawn={drawn} />
          </div>

          <span
            className="inline-flex items-center"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(36px, 10vw, 56px)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: 'white',
            }}
          >
            {VFIT_LETTERS.map((letter, idx) => (
              <span
                key={idx}
                className="inline-block"
                style={{
                  opacity: drawn ? 1 : 0,
                  transform: drawn ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 0.3s ease-out ${TEXT_START + idx * 60}ms, transform 0.35s ease-out ${TEXT_START + idx * 60}ms`,
                  textShadow: '0 0 30px rgba(34,197,94,0.3)',
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>

        {/* Subtítulo + barra */}
        <div
          className={cn(
            'flex flex-col items-center gap-3 transition-all duration-500',
            settled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
            isExiting && 'opacity-0 -translate-y-1',
          )}
        >
          <span
            className="text-[10px] uppercase text-brand-primary/80"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.2em' }}
          >
            PLATAFORMA PARA PERSONAL TRAINERS
          </span>
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand-primary/60 via-brand-primary to-emerald-400/80"
              style={{ width: settled ? '100%' : '8%', transition: 'width 1.1s ease-out' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.65; }
          50% { transform: translate(-50%, -50%) scale(1.28); opacity: 1; }
        }
        @keyframes splashAurora {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3%, -3%) scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="splashGlow"], [style*="splashAurora"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
