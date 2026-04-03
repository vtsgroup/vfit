/**
 * src/components/ui/splash-screen.tsx
 *
 * SplashScreen — Ultra-modern PWA opening animation
 *
 * Exports: SplashScreen
 * Hooks: useState, useEffect, useMemo
 * Features: 'use client'
 */

// ============================================
// SplashScreen — Ultra-modern PWA opening animation
// Types "EVOLU" letter by letter, then shows "IA" in green
// Smooth aurora background, particles, cinematic feel
// Duration: ~3.2s total (typing ~720ms + logo ~500ms + breathe ~2s)
// ============================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const VFIT_LETTERS = 'EVOLU'.split('')
const LETTER_DELAY = 80 // ms per letter
const VFIT_START_OFFSET = 350 // icon appears first, then EVOLU starts typing
const TYPING_DURATION = VFIT_LETTERS.length * LETTER_DELAY // ~400ms
const BREATHE_START = VFIT_START_OFFSET + TYPING_DURATION + 400 // settle after EVOLU finishes
const SPLASH_TOTAL = BREATHE_START + 800 // 800ms for exit animation
const SPLASH_KEY = 'pia-splash-v2'

export function SplashScreen({ isReady }: { isReady?: boolean }) {
  const [phase, setPhase] = useState<'init' | 'typing' | 'breathe' | 'exit' | 'done'>('init')
  const [typedCount, setTypedCount] = useState(0)
  const [shouldShow, setShouldShow] = useState(false)

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
    // Only show once per session
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setPhase('done')
      return
    }

    setShouldShow(true)
    sessionStorage.setItem(SPLASH_KEY, '1')

    // Icon appears immediately; EVOLU starts after VFIT_START_OFFSET
    const tStart = setTimeout(() => setPhase('typing'), 150)

    // EVOLU letters — start after icon settles
    const letterTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < VFIT_LETTERS.length; i++) {
      letterTimers.push(
        setTimeout(() => setTypedCount(i + 1), 150 + VFIT_START_OFFSET + (i + 1) * LETTER_DELAY)
      )
    }

    // Breathe phase (settle — after all letters typed)
    const tBreathe = setTimeout(() => setPhase('breathe'), 150 + BREATHE_START)
    // Exit
    const tExit = setTimeout(() => setPhase('exit'), 150 + BREATHE_START + 200)
    // Done
    const tDone = setTimeout(() => setPhase('done'), 150 + SPLASH_TOTAL)

    return () => {
      clearTimeout(tStart)
      letterTimers.forEach(clearTimeout)
      clearTimeout(tBreathe)
      clearTimeout(tExit)
      clearTimeout(tDone)
    }
  }, [])

  if (phase === 'done' || !shouldShow) return null

  const allTyped = typedCount === VFIT_LETTERS.length
  const isExiting = phase === 'exit'

  return (
    <div
      className={cn(
        'dark fixed inset-0 z-9999 flex items-center justify-center',
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
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

      {/* ─── Logo + Typing Animation ─── */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Outer glow ring */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'border border-brand-primary/15',
            'transition-all duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)]',
            phase === 'init' && 'h-20 w-20 opacity-0',
            phase === 'typing' && !allTyped && 'h-44 w-44 opacity-100',
            allTyped && 'h-72 w-72 opacity-40',
            isExiting && 'h-125 w-125 opacity-0',
          )}
        />

        {/* Second ring */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            'border border-brand-primary/8',
            'transition-all duration-1400 ease-[cubic-bezier(0.16,1,0.3,1)]',
            phase === 'init' && 'h-10 w-10 opacity-0',
            phase === 'typing' && !allTyped && 'h-56 w-56 opacity-60',
            allTyped && 'h-96 w-96 opacity-25',
            isExiting && 'h-150 w-150 opacity-0',
          )}
        />

        {/* Logo icon → + → EVOLU (typed) → IA (green) */}
        <div
          className={cn(
            'relative flex items-center gap-3 transition-all duration-500',
            phase === 'init' && 'opacity-0 scale-90',
            phase !== 'init' && 'opacity-100 scale-100',
            isExiting && 'opacity-0 scale-95 -translate-y-2',
          )}
        >
          {/* Logo icon with glow */}
          <div className="relative">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.12) 40%, transparent 65%)',
                animation: allTyped ? 'splashLogoGlow 3s ease-in-out infinite' : 'none',
                opacity: allTyped ? 1 : 0.4,
                transition: 'opacity 0.8s ease',
              }}
            />
            <Image
              src="/images/logo-transparent-140.webp"
              alt=""
              width={68}
              height={56}
              className="relative z-10 w-auto"
              style={{
                height: 'clamp(38px, 9.5vw, 56px)',
                filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.55))',
              }}
            />
          </div>

          {/* + as circular icon badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'clamp(22px, 5vw, 30px)',
              height: 'clamp(22px, 5vw, 30px)',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.06)',
              fontSize: 'clamp(14px, 3.5vw, 19px)',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.8)',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            +
          </span>

          {/* EVOLU letters — start typing after VFIT_START_OFFSET */}
          <span
            className="inline-flex items-center"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(32px, 9vw, 48px)',
              letterSpacing: '-0.02em',
              lineHeight: '1.15',
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
                }}
              >
                {letter}
              </span>
            ))}
            {/* IA in brand green — appears after EVOLU finishes typing */}
            <span
              className="inline-block transition-all duration-300 ease-out"
              style={{
                opacity: allTyped ? 1 : 0,
                transform: allTyped ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.8)',
                color: '#10B981',
                textShadow: allTyped ? '0 0 20px rgba(16,185,129,0.5)' : 'none',
              }}
            >
              IA
            </span>
          </span>

          {/* Typing cursor */}
          <span
            className="inline-block w-[2.5px] rounded-full bg-brand-primary ml-0.5"
            style={{
              height: 'clamp(28px, 7.5vw, 44px)',
              opacity: typedCount < VFIT_LETTERS.length ? 1 : 0,
              animation: typedCount < VFIT_LETTERS.length ? 'splashCursorBlink 600ms step-end infinite' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
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
        @keyframes splashCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
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
