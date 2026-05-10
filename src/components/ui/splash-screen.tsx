/**
 * src/components/ui/splash-screen.tsx
 *
 * SplashScreen — Ultra-modern VFIT PWA opening animation
 *
 * Exports: SplashScreen
 * Hooks: useState, useEffect, useMemo
 * Features: 'use client'
 */

// ============================================
// SplashScreen — VFIT brand opening animation
// V icon draws in with stroke animation, then "VFIT" text fades in
// Smooth aurora background, particles, cinematic feel
// Duration: ~2.8s total (icon ~600ms + text ~400ms + breathe ~800ms + exit)
// ============================================

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'

const VFIT_LETTERS = 'VFIT'.split('')
const LETTER_DELAY = 90 // ms per letter
const ICON_SETTLE = 500 // icon draws in for 500ms
const TEXT_START = ICON_SETTLE + 200 // text starts 200ms after icon settles
const TYPING_DURATION = VFIT_LETTERS.length * LETTER_DELAY // ~360ms
const BREATHE_START = TEXT_START + TYPING_DURATION + 300
const SPLASH_TOTAL = BREATHE_START + 700
const SPLASH_KEY = 'vfit-splash-v3'

/* ─── Inline V Icon (no external image dependency) ─── */
function VFITIcon({ size, className, glowing }: { size: number; className?: string; glowing?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
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
          strokeDashoffset: glowing ? 0 : 340,
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </svg>
  )
}

export function SplashScreen({ isReady }: { isReady?: boolean }) {
  const [phase, setPhase] = useState<'init' | 'icon' | 'typing' | 'breathe' | 'exit' | 'done'>('init')
  const [typedCount, setTypedCount] = useState(0)
  const [shouldShow, setShouldShow] = useState(false)
  const [minAnimationComplete, setMinAnimationComplete] = useState(false)
  const bootStartedRef = useRef(false)
  const ready = isReady ?? true

  // Stable particle positions
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: 1.5 + Math.random() * 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * -15,
      opacity: 0.1 + Math.random() * 0.4,
    })),
  [])

  useEffect(() => {
    if (bootStartedRef.current) return
    bootStartedRef.current = true

    // Depois da primeira abertura da sessão, ainda cobrimos validações de auth.
    // Sem isso, o app pode ficar em branco enquanto AuthProvider checa /auth/me.
    if (sessionStorage.getItem(SPLASH_KEY)) {
      if (ready) {
        setPhase('done')
        return
      }
      setShouldShow(true)
      setTypedCount(VFIT_LETTERS.length)
      setPhase('breathe')
      setMinAnimationComplete(true)
      return
    }

    setShouldShow(true)
    sessionStorage.setItem(SPLASH_KEY, '1')

    // Icon draws in
    const tIcon = setTimeout(() => setPhase('icon'), 100)

    // Text typing starts after icon settles
    const tTyping = setTimeout(() => setPhase('typing'), 100 + TEXT_START)

    // VFIT letters — typed one by one
    const letterTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < VFIT_LETTERS.length; i++) {
      letterTimers.push(
        setTimeout(() => setTypedCount(i + 1), 100 + TEXT_START + (i + 1) * LETTER_DELAY)
      )
    }

    // Breathe phase
    const tBreathe = setTimeout(() => setPhase('breathe'), 100 + BREATHE_START)
    const tMinDone = setTimeout(() => setMinAnimationComplete(true), 100 + BREATHE_START + 200)

    return () => {
      clearTimeout(tIcon)
      clearTimeout(tTyping)
      letterTimers.forEach(clearTimeout)
      clearTimeout(tBreathe)
      clearTimeout(tMinDone)
    }
  }, [ready])

  useEffect(() => {
    if (!shouldShow || !ready || !minAnimationComplete || phase === 'exit' || phase === 'done') return

    setPhase('exit')

  }, [minAnimationComplete, phase, ready, shouldShow])

  useEffect(() => {
    if (phase !== 'exit') return

    const tDone = setTimeout(() => setPhase('done'), 700)

    return () => clearTimeout(tDone)
  }, [phase])

  useEffect(() => {
    if (!shouldShow || phase === 'exit' || phase === 'done') return

    // Hard safety valve: never let auth/network edge cases trap the user behind splash.
    // The app content behind it is guarded independently by AuthProvider/AuthGate.
    const tFallback = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => setPhase('done'), 700)
    }, SPLASH_TOTAL + 1800)

    return () => clearTimeout(tFallback)
  }, [phase, shouldShow])

  if (phase === 'done' || !shouldShow) return null

  const iconReady = phase !== 'init'
  const allTyped = typedCount === VFIT_LETTERS.length
  const isExiting = phase === 'exit'

  return (
    <div
      className={cn(
        'dark fixed inset-0 z-9999 flex items-center justify-center',
        'transition-all duration-700 ease-out-expo',
        isExiting ? 'pointer-events-none' : 'pointer-events-auto',
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      )}
      style={{ colorScheme: 'dark' }}
      aria-hidden="true"
    >
      {/* ─── Aurora Background ─── */}
      <div className="absolute inset-0 overflow-hidden bg-[#050A12]">
        {/* Aurora blobs — ultra smooth */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(ellipse 130% 70% at 30% 70%, rgba(16,185,129,0.15) 0%, transparent 55%)',
            animation: 'splashAurora1 18s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 75% 35%, rgba(52,211,153,0.12) 0%, transparent 50%)',
            animation: 'splashAurora2 22s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse 80% 45% at 50% 55%, rgba(56,189,248,0.08) 0%, transparent 45%)',
            animation: 'splashAurora3 15s ease-in-out infinite alternate',
          }}
        />

        {/* Center spotlight that grows with animation */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'transition-all duration-1500 ease-out',
            phase === 'init'
              ? 'h-0 w-0 opacity-0'
              : 'h-125 w-125 opacity-100'
          )}
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 40%, transparent 65%)',
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-emerald-400"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              filter: p.size > 3 ? 'blur(0.5px)' : 'none',
              animation: `splashParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,10,18,0.7)_100%)]" />
      </div>

      {/* ─── Logo + VFIT Text Animation ─── */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Outer glow ring */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'border border-brand-primary/15',
            'transition-all duration-1200 ease-out-expo',
            phase === 'init' && 'h-20 w-20 opacity-0',
            (phase === 'icon' || phase === 'typing') && !allTyped && 'h-44 w-44 opacity-100',
            allTyped && 'h-72 w-72 opacity-40',
            isExiting && 'h-125 w-125 opacity-0',
          )}
        />

        {/* Second ring */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'border border-brand-primary/8',
            'transition-all duration-1400 ease-out-expo',
            phase === 'init' && 'h-10 w-10 opacity-0',
            (phase === 'icon' || phase === 'typing') && !allTyped && 'h-56 w-56 opacity-60',
            allTyped && 'h-96 w-96 opacity-25',
            isExiting && 'h-150 w-150 opacity-0',
          )}
        />

        {/* V Icon + VFIT text row */}
        <div
          className={cn(
            'relative flex items-center gap-4 transition-all duration-500',
            phase === 'init' && 'opacity-0 scale-90',
            phase !== 'init' && 'opacity-100 scale-100',
            isExiting && 'opacity-0 scale-95 -translate-y-2',
          )}
        >
          {/* V Icon with glow */}
          <div className="relative">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl pointer-events-none"
              style={{
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(34,197,94,0.45) 0%, rgba(34,197,94,0.12) 40%, transparent 65%)',
                animation: allTyped ? 'splashLogoGlow 3s ease-in-out infinite' : 'none',
                opacity: allTyped ? 1 : 0.4,
                transition: 'opacity 0.8s ease',
              }}
            />
            <VFITIcon
              size={72}
              className="relative z-10"
              glowing={iconReady}
            />
          </div>

          {/* VFIT letters */}
          <span
            className="inline-flex items-center"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(36px, 10vw, 56px)',
              letterSpacing: '-0.03em',
              lineHeight: '1',
              color: 'white',
            }}
          >
            {VFIT_LETTERS.map((letter, idx) => (
              <span
                key={idx}
                className="inline-block"
                style={{
                  opacity: idx < typedCount ? 1 : 0,
                  transform: idx < typedCount ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.15s ease-out, transform 0.2s ease-out',
                  textShadow: idx < typedCount ? '0 0 30px rgba(34,197,94,0.3)' : 'none',
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>

        {/* Subtitle */}
        <div
          className={cn(
            'flex flex-col items-center gap-3 transition-all duration-500',
            allTyped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
            isExiting && 'opacity-0 -translate-y-1',
          )}
        >
          <span
            className="text-[10px] uppercase text-brand-primary/80"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 700,
              letterSpacing: '0.2em',
            }}
          >
            PLATAFORMA PARA PERSONAL TRAINERS
          </span>

          {/* Loading bar */}
          <div className="w-32 h-0.5 rounded-full bg-white/6 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand-primary/60 via-brand-primary to-emerald-400/80"
              style={{
                width: allTyped ? '100%' : '0%',
                transition: 'width 1.2s ease-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes splashLogoGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
        @keyframes splashAurora1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(6%, -4%) scale(1.08); }
        }
        @keyframes splashAurora2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-8%, 5%) scale(1.12); }
        }
        @keyframes splashAurora3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4%, 8%) scale(1.05); }
        }
        @keyframes splashParticle {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -30px); }
          50% { transform: translate(-15px, -50px); }
          75% { transform: translate(25px, -15px); }
        }
      `}</style>
    </div>
  )
}
