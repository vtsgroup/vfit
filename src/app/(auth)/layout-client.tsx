/**
 * src/app/(auth)/layout-client.tsx
 *
 * Auth Layout Client — Ultra-modern split screen
 *
 * Exports: AuthLayoutClient
 * Hooks: useState, useEffect, useMemo, useCallback, usePathname
 * Features: 'use client' · DSIcon
 */

// ============================================
// Auth Layout Client — Ultra-modern split screen
// Left: Cinematic animated CSS bg (aurora + particles), animated logo, white card testimonials
// Right: Clean dark form, max width 420px
// Gradient border separator between panels
// ============================================

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'

/* ─── Hero images slideshow for left panel ─── */
const LEFT_PANEL_IMAGES = [
  '/images/hero-1.webp',
  '/images/hero-2.webp',
  '/images/hero-3.webp',
  '/images/hero-4.webp',
]

function ImageSlideshow() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % LEFT_PANEL_IMAGES.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(next, 5500)
    return () => clearInterval(interval)
  }, [next])

  return (
    <div className="absolute inset-0">
      {/* Images with crossfade + Ken Burns zoom */}
      {mounted && LEFT_PANEL_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-2000 ease-in-out"
          style={{ opacity: current === i ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            style={{
              animation: current === i ? 'authKenBurns 12s ease-in-out forwards' : 'none',
              transformOrigin: ['center center', 'top left', 'bottom right', 'top right'][i],
            }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-bg-base/75" />
      {/* Public/auth green cinematic tint */}
      <div className="absolute inset-0 bg-linear-to-br from-bg-base/50 via-emerald-500/8 to-bg-base/60" />
    </div>
  )
}

const VFIT_LETTERS = 'VFIT'.split('')

function AnimatedAuthLogo({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [typedCount, setTypedCount] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedCount(i)
      if (i >= VFIT_LETTERS.length) {
        clearInterval(interval)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  const isLarge = size === 'large'
  const fontSize = isLarge ? '54px' : '38px'
  const lineH = isLarge ? '62px' : '44px'
  const cursorH = isLarge ? '50px' : '34px'

  return (
    <Link href="/" className="flex items-center gap-0 group shrink-0" aria-label="VFIT - Início">
      <div className="relative flex items-center">
        <span
          className="inline-flex items-center"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 800,
            fontSize,
            letterSpacing: '0',
            lineHeight: lineH,
            color: 'white',
          }}
        >
          {VFIT_LETTERS.map((letter, idx) => (
            <span
              key={idx}
              className="inline-block transition-all duration-200 ease-out"
              style={{
                opacity: idx < typedCount ? 1 : 0,
                transform: idx < typedCount ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              {letter}
            </span>
          ))}
        </span>

        {/* Typing cursor */}
        <span
          className="inline-block w-[2.5px] rounded-full bg-brand-primary ml-px transition-opacity duration-300"
          style={{
            height: cursorH,
            opacity: typedCount < VFIT_LETTERS.length ? 1 : 0,
            animation: typedCount < VFIT_LETTERS.length ? 'authCursorBlink 600ms step-end infinite' : 'none',
          }}
        />
      </div>
    </Link>
  )
}

/* ─── Feature chip ─── */
function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-sm px-3 py-1 text-[10px] font-medium text-zinc-300 select-none transition-all hover:border-white/15 hover:bg-white/7">
      <span className="text-emerald-300/80">{icon}</span>
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  )
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/* ─── Cinematic CSS Background — smooth aurora + floating particles ─── */
function CinematicBackground() {
  // Generate stable particles with useMemo (no re-renders)
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: (2 + seededUnit(i * 7 + 1) * 4).toFixed(4),
      x: (seededUnit(i * 7 + 2) * 100).toFixed(4),
      y: (seededUnit(i * 7 + 3) * 100).toFixed(4),
      duration: (15 + seededUnit(i * 7 + 4) * 25).toFixed(4),
      delay: (seededUnit(i * 7 + 5) * -20).toFixed(4),
      opacity: (0.15 + seededUnit(i * 7 + 6) * 0.35).toFixed(4),
    })),
  [])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-60">
      {/* Base deep dark gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-bg-base/70 via-bg-surface-1/50 to-bg-base/70" />

      {/* Aurora layer 1 — slow drift, green */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 120% 60% at 20% 80%, rgba(34,197,94,0.15) 0%, transparent 60%)',
          animation: 'auroraDrift1 25s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora layer 2 — slow drift, emerald */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 80% 30%, rgba(16,185,129,0.12) 0%, transparent 55%)',
          animation: 'auroraDrift2 30s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora layer 3 — subtle brand accent */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 60%, rgba(34,197,94,0.08) 0%, transparent 50%)',
          animation: 'auroraDrift3 20s ease-in-out infinite alternate',
        }}
      />

      {/* Mesh gradient overlay — organic feel */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, rgba(34,197,94,0.10) 0%, transparent 40%),
            radial-gradient(circle at 85% 75%, rgba(16,185,129,0.09) 0%, transparent 35%),
            radial-gradient(circle at 50% 10%, rgba(52,211,153,0.08) 0%, transparent 45%)
          `,
          animation: 'auroraMesh 35s ease-in-out infinite alternate',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-emerald-400/60"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            filter: `blur(${Number(p.size) > 4 ? 1 : 0}px)`,
            animationName: 'particleFloat',
            animationDuration: `${p.duration}s`,
            animationTimingFunction: 'ease-in-out',
            animationDelay: `${p.delay}s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Soft noise texture (subtle grain) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Vignette edges */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,10,18,0.6) 100%)' }}
      />
    </div>
  )
}

/* ─── Testimonials data ─── */
const AUTH_TESTIMONIALS = [
  { name: 'Carlos Mendes', role: 'Personal Trainer · São Paulo', avatar: 'CM', text: 'A IA gera treinos incríveis em segundos. Meus alunos adoram a personalização e eu economizo horas por semana.', highlight: 'economizo horas' },
  { name: 'Ana Beatriz', role: 'Personal Trainer · Rio de Janeiro', avatar: 'AB', text: 'O sistema de cobranças automáticas mudou meu negócio. Não perco mais tempo cobrando alunos.', highlight: 'mudou meu negócio' },
  { name: 'Rafael Santos', role: 'Personal Trainer · Belo Horizonte', avatar: 'RS', text: 'Comecei com 10 alunos e hoje tenho 85 usando a plataforma. A gestão ficou muito mais organizada.', highlight: 'hoje tenho 85' },
  { name: 'Juliana Costa', role: 'Personal Trainer · Curitiba', avatar: 'JC', text: 'O marketplace é genial. Já vendi mais de 200 programas de treino para pessoas que nem são meus alunos.', highlight: 'mais de 200' },
  { name: 'Pedro Oliveira', role: 'Dono de Academia · Salvador', avatar: 'PO', text: 'Implementamos para todos os 12 personais da academia. O relatório admin é fantástico.', highlight: '12 personais' },
]

function TestimonialCarousel() {
  return (
    <div className="relative -mx-10 xl:-mx-14">
      {/* Edge fade masks — match dark bg */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-bg-base/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-bg-base/90 to-transparent" />

      <div className="overflow-hidden">
        <div
          className="flex gap-4 will-change-transform"
          style={{ animation: 'authMarquee 40s linear infinite' }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
        >
          {[...AUTH_TESTIMONIALS, ...AUTH_TESTIMONIALS].map((t, i) => (
            <div key={i} className="shrink-0 w-65 xl:w-70">
              <div className="h-45 flex flex-col rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(34,197,94,0.08),0_1px_6px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(34,197,94,0.18)]">
                {/* Stars + rating */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-amber-500">5.0</span>
                </div>

                {/* Quote */}
                <p className="flex-1 text-[12px] text-zinc-600 leading-relaxed line-clamp-4">
                  &ldquo;{t.text.split(t.highlight)[0]}
                  <strong className="font-bold text-zinc-900">{t.highlight}</strong>
                  {t.text.split(t.highlight)[1]}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-2 flex items-center gap-2 pt-2.5 border-t border-zinc-100">
                  <div className="h-7 w-7 rounded-full bg-linear-to-br from-emerald-500 to-green-400 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                    {t.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-zinc-900 truncate">{t.name}</div>
                    <div
                      className="text-[8px] text-zinc-500 truncate"
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 600, letterSpacing: '0.06em' }}
                    >
                      {t.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hidesMobileLogo = pathname?.startsWith('/register/student')

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes authCursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes logoGlowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
        }
        @keyframes authGridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }
        @keyframes authFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes authMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Ken Burns zoom for slideshow */
        @keyframes authKenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }

        /* Aurora cinematic background */
        @keyframes auroraDrift1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -5%) scale(1.1); }
          100% { transform: translate(-5%, 8%) scale(0.95); }
        }
        @keyframes auroraDrift2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, 6%) scale(1.15); }
          100% { transform: translate(6%, -8%) scale(1.05); }
        }
        @keyframes auroraDrift3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.08); }
          100% { transform: translate(-8%, -4%) scale(0.92); }
        }
        @keyframes auroraMesh {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(3deg) scale(1.05); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: var(--tw-opacity, 0.3); }
          25% { transform: translate(30px, -40px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-20px, -60px) scale(0.8); opacity: 0.15; }
          75% { transform: translate(40px, -20px) scale(1.1); opacity: 0.5; }
        }
      `}</style>

      <div className="auth-dark-scope dark flex min-h-screen bg-bg-primary" style={{ colorScheme: 'dark', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* ─── LEFT PANEL — Cinematic aurora background + image slideshow ─── */}
        <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative overflow-hidden">
          {/* Image slideshow with crossfade + Ken Burns */}
          <ImageSlideshow />

          {/* Smooth CSS cinematic background (aurora layers on top of images) */}
          <CinematicBackground />

          {/* Animated grid lines */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.03,
              backgroundImage: 'linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              animation: 'authGridScroll 20s linear infinite',
            }}
          />

          {/* Floating gradient orbs */}
          <div
            className="absolute top-[15%] -left-16 h-72 w-72 rounded-full bg-emerald-500/12 blur-[100px]"
            style={{ animation: 'authFloat 8s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-[20%] right-[-5%] h-80 w-80 rounded-full bg-lime-300/10 blur-[120px]"
            style={{ animation: 'authFloat 10s ease-in-out infinite', animationDelay: '3s' }}
          />

          {/* ─── Content ─── */}
          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
            {/* Logo top */}
            <AnimatedAuthLogo size="large" />

            {/* Tagline + features */}
            <div className="max-w-lg">
              <p
                className="text-[10px] uppercase text-emerald-300/90 mb-3"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.15em' }}
              >
                PLATAFORMA #1 PARA PERSONAL TRAINERS
              </p>
              <h2
                className="text-[2.4rem] xl:text-[2.8rem] text-white leading-[1.08] mb-4"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 900, letterSpacing: 0 }}
              >
                Treinos, alunos e{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-green-300 to-emerald-500">
                  cobranças
                </span>
              </h2>
              <p className="text-zinc-400 leading-relaxed text-[14px] max-w-md mb-6">
                Gere treinos com IA, acompanhe evolução e receba pagamentos automaticamente — tudo em uma plataforma.
              </p>

              {/* Feature chips — 2 rows */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                <FeatureChip icon={<DSIcon name="bot" size={12} />} label="IA GENERATIVA" />
                <FeatureChip icon={<DSIcon name="creditCard" size={12} />} label="PIX AUTOMÁTICO" />
                <FeatureChip icon={<DSIcon name="barChart" size={12} />} label="MÉTRICAS" />
                <FeatureChip icon={<DSIcon name="smartphone" size={12} />} label="PWA OFFLINE" />
                <FeatureChip icon={<DSIcon name="dumbbell" size={12} />} label="TREINOS IA" />
                <FeatureChip icon={<DSIcon name="users" size={12} />} label="GESTÃO ALUNOS" />
                <FeatureChip icon={<DSIcon name="calendarCheck" size={12} />} label="AGENDAMENTOS" />
                <FeatureChip icon={<DSIcon name="trophy" size={12} />} label="GAMIFICAÇÃO" />
                <FeatureChip icon={<DSIcon name="shieldCheck" size={12} />} label="LGPD" />
                <FeatureChip icon={<DSIcon name="rocket" size={12} />} label="MARKETPLACE" />
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {[
                  { value: '2.5k+', label: 'PERSONAIS' },
                  { value: '45k+', label: 'TREINOS' },
                  { value: '98%', label: 'SATISFAÇÃO' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div
                      className="text-2xl text-white"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 900, letterSpacing: 0 }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-[9px] text-zinc-400 mt-0.5"
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.15em' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial carousel — white cards like home */}
            <TestimonialCarousel />
          </div>
        </div>

        {/* ─── GRADIENT BORDER SEPARATOR ─── */}
        <div className="hidden lg:block relative w-px">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-400/45 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-400/25 to-transparent blur-[3px]" />
        </div>

        {/* ─── RIGHT PANEL — Form ─── */}
        <div className="flex w-full lg:w-[52%] xl:w-1/2 flex-col relative">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-emerald-500/4 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] h-60 w-60 rounded-full bg-emerald-400/3 blur-[100px]" />
          </div>

          {/* Subtle grid on right panel */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.015,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Mobile header — hidden on student register (has own cover logo) */}
          {!hidesMobileLogo && (
            <header className="relative z-10 flex items-center justify-center px-5 pt-5 pb-2 lg:hidden">
              <AnimatedAuthLogo size="small" />
            </header>
          )}

          {/* Form container */}
          <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-2 sm:px-8 lg:px-14 lg:py-4 xl:px-20">
            <div className="w-full max-w-105">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer
            className="relative z-10 hidden py-2 text-center text-[9px] text-zinc-700 sm:block"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, letterSpacing: '0.15em' }}
          >
            © {new Date().getFullYear()} VFIT · TODOS OS DIREITOS RESERVADOS
          </footer>
        </div>
      </div>
    </>
  )
}
