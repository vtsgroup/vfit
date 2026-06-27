// ============================================
// Hero — Epic crossfade images + rotating headlines
// Fitness photos, gradient overlays, Inter 900, 3D CTA
// ============================================

'use client'

import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { getExperimentVariant, trackExperimentViewOnce, type ExperimentVariant } from '@/lib/landing-experiments'
import { PUBLIC_SOCIAL_PROOF } from '@config/constants'
import { DSIcon } from '@/components/ui/ds-icon'

/* ─── Hero slides ─── */
const HERO_SLIDES = [
  { image: '/images/hero-1.webp', label: 'Treino personalizado no celular' },
  { image: '/images/hero-2.webp', label: 'Evolução acompanhada por dados' },
  { image: '/images/hero-3.webp', label: 'Personal trainer online' },
  { image: '/images/hero-4.webp', label: 'Treino e dieta alinhados' },
]

const HERO_STATS = [
  { value: PUBLIC_SOCIAL_PROOF.active_students_label, label: 'ALUNOS', icon: 'userCheck' as const, live: false },
  { value: PUBLIC_SOCIAL_PROOF.satisfaction_label, label: 'SATISFAÇÃO', icon: 'star' as const, live: false },
  { value: PUBLIC_SOCIAL_PROOF.active_personals_label, label: 'PROFISSIONAIS', icon: 'users' as const, live: false },
  { value: '24/7', label: 'NO CELULAR', icon: 'smartphone' as const, live: true },
]

/* ================================================================
   STAT COUNT-UP — parse e anima rótulos pt-BR ("15.000+", "98%", "24/7")
   ================================================================ */
type ParsedStat =
  | { animatable: false; static: string }
  | { animatable: true; prefix: string; num: number; suffix: string; decimals: number }

function parseStat(value: string): ParsedStat {
  const str = String(value).trim()
  // Valores compostos (ex: "24/7") não são animados.
  if (str.includes('/')) return { animatable: false, static: str }
  const m = str.match(/^([^\d]*)([\d.,]+)(.*)$/)
  if (!m) return { animatable: false, static: str }
  const [, prefix, numStr, suffix] = m
  // pt-BR: '.' = separador de milhar, ',' = decimal.
  const normalized = numStr.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  if (!isFinite(num)) return { animatable: false, static: str }
  const decimals = normalized.includes('.') ? normalized.split('.')[1].length : 0
  return { animatable: true, prefix, num, suffix, decimals }
}

function formatStat(n: number, p: Extract<ParsedStat, { animatable: true }>): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
  }).format(p.decimals > 0 ? Number(n.toFixed(p.decimals)) : Math.round(n))
  return `${p.prefix}${formatted}${p.suffix}`
}

/** Conta de 0 até o alvo com easeOutCubic quando `active` vira true. */
function useCountUp(value: string, active: boolean, duration = 1700): string {
  const parsed = parseStat(value)
  const [display, setDisplay] = useState<string>(
    parsed.animatable ? formatStat(0, parsed) : (parsed as { static: string }).static
  )

  useEffect(() => {
    if (!parsed.animatable) {
      setDisplay((parsed as { static: string }).static)
      return
    }
    if (!active) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(formatStat(parsed.num, parsed))
      return
    }
    let raf = 0
    let start: number | undefined
    const tick = (t: number) => {
      if (start === undefined) start = t
      const progress = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(formatStat(parsed.num * eased, parsed))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setDisplay(formatStat(parsed.num, parsed))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, value])

  return display
}

/* ================================================================
   STAT CARD — vidro flutuante + spotlight no mouse + count-up
   ================================================================ */
function StatCard({
  stat,
  active,
  index,
}: {
  stat: (typeof HERO_STATS)[number]
  active: boolean
  index: number
}) {
  const display = useCountUp(stat.value, active)

  // Spotlight + tilt 3D acompanhando o cursor (sem re-render, via CSS vars).
  const handleMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.style.setProperty('--rx', `${(0.5 - py) * 9}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 9}deg`)
    el.style.setProperty('--lift', '-6px')
  }, [])

  const handleLeave = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--lift', '0px')
  }, [])

  return (
    <div style={{ perspective: '900px' }}>
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group/stat relative overflow-hidden rounded-2xl p-4 sm:p-5"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          boxShadow: '0 8px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          transformStyle: 'preserve-3d',
          transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(var(--lift,0px))',
          transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), box-shadow 350ms ease, border-color 350ms ease',
          animation: active ? `statIn 600ms cubic-bezier(0.16,1,0.3,1) ${index * 90}ms both` : undefined,
        }}
      >
        {/* Borda gradiente animada — aparece no hover (técnica mask) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100"
          style={{
            padding: '1px',
            background: 'conic-gradient(from 130deg, transparent 0%, rgba(34,197,94,0.7) 25%, transparent 50%, rgba(132,204,22,0.5) 75%, transparent 100%)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        {/* Spotlight — segue o cursor */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100"
          style={{ background: 'radial-gradient(240px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.18), transparent 65%)' }}
        />
        {/* Glow ambiente verde no hover */}
        <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100 shadow-[0_18px_50px_-12px_rgba(34,197,94,0.45)]" />
        {/* Mesh glow no canto — atmosfera (sempre sutil, intensifica no hover) */}
        <span
          className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full opacity-45 transition-opacity duration-300 group-hover/stat:opacity-90"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)', filter: 'blur(16px)' }}
        />

        <div className="relative flex flex-col" style={{ transform: 'translateZ(28px)', transformStyle: 'preserve-3d' }}>
          {/* Top row — ícone + selo "ao vivo" */}
          <div className="flex items-start justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover/stat:scale-105"
              style={{
                background: 'linear-gradient(180deg, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0.04) 100%)',
                border: '1px solid rgba(34,197,94,0.22)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <DSIcon name={stat.icon} size={18} className="text-brand-primary [filter:drop-shadow(0_0_6px_rgba(34,197,94,0.45))]" />
            </div>
            {stat.live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/12 px-2 py-0.5 ring-1 ring-inset ring-brand-primary/25">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-brand-primary">Ao vivo</span>
              </span>
            )}
          </div>

          {/* Número com count-up — gradiente metálico + glow */}
          <span className="mt-4 font-syne text-3xl font-black tabular-nums leading-none sm:text-[2.5rem] bg-gradient-to-b from-white via-white to-emerald-100/80 bg-clip-text text-transparent [filter:drop-shadow(0_2px_20px_rgba(34,197,94,0.28))] transition-[filter] duration-300 group-hover/stat:[filter:drop-shadow(0_2px_30px_rgba(34,197,94,0.6))]">
            {display}
          </span>

          {/* Label */}
          <span
            className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 group-hover/stat:text-white/75"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            {stat.label}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   HERO STATS — observa entrada em vista p/ disparar count-up
   ================================================================ */
function HeroStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {HERO_STATS.map((stat, idx) => (
        <StatCard key={stat.label} stat={stat} active={inView} index={idx} />
      ))}
    </div>
  )
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [headlineVariant, setHeadlineVariant] = useState<ExperimentVariant>('A')
  const [ctaVariant, setCtaVariant] = useState<ExperimentVariant>('A')

  useEffect(() => {
    setMounted(true)

    const headline = getExperimentVariant('home_headline_v1')
    const cta = getExperimentVariant('home_cta_v1')

    setHeadlineVariant(headline)
    setCtaVariant(cta)

    trackExperimentViewOnce('home_headline_v1', headline)
    trackExperimentViewOnce('home_cta_v1', cta)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden" aria-label="Hero principal">
      {/* ===== BACKGROUND IMAGES — crossfade ===== */}
      {mounted && HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-1500 ease-in-out"
          style={{ opacity: currentSlide === i ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt=""
            className="h-full w-full object-cover"
            style={{ transform: 'scale(1.05)' }}
            loading={i === 0 ? 'eager' : 'lazy'}
            {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
          />
        </div>
      ))}

      {/* Fallback dark bg before mount */}
      <div className="absolute inset-0 bg-bg-page" style={{ zIndex: -1 }} />

      {/* ===== OVERLAY SYSTEM — cinematic layered gradient ===== */}
      {/* Base dark overlay */}
      <div className="absolute inset-0 bg-bg-page/75" />

      {/* Cinematic color grading — brand green wash */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(5,10,18,0.85) 0%, rgba(5,10,18,0.50) 40%, rgba(34,197,94,0.10) 70%, rgba(5,10,18,0.70) 100%)',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(5,10,18,0.6) 100%)',
        }}
      />

      {/* Bottom gradient fade — strong, smooth transition to page bg */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-5"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, var(--color-bg-primary) 0%, var(--color-bg-primary) 8%, rgba(5,10,18,0.85) 35%, rgba(5,10,18,0.4) 65%, transparent 100%)',
        }}
      />

      {/* Top gradient for navbar blending */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-52 z-5"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,10,18,0.92) 0%, rgba(15,26,44,0.58) 34%, rgba(15,26,43,0.20) 64%, transparent 100%)',
        }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Animated aurora glow orbs — drifting brand light */}
      <div
        className="hero-orb-1 pointer-events-none absolute z-[6]"
        style={{
          top: '10%',
          left: '6%',
          width: '640px',
          height: '640px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.17) 0%, transparent 70%)',
          filter: 'blur(72px)',
        }}
      />
      <div
        className="hero-orb-2 pointer-events-none absolute z-[6]"
        style={{
          bottom: '6%',
          right: '6%',
          width: '540px',
          height: '540px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(132,204,22,0.13) 0%, transparent 70%)',
          filter: 'blur(84px)',
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16 w-full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Mono label */}
          <IntersectionReveal animation="fade-in">
            <div className="mb-6">
              {/* Badge — green inner pill (gradient + shine) + glass outer pill */}
              <span
                className="group/badge inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(28px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 36px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.14)',
                }}
              >
                {/* Inner green pill — gradiente premium com ícone estrela */}
                <span
                  className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 52%, #14803d 100%)',
                    boxShadow: '0 4px 18px -3px rgba(34,197,94,0.65), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(3,50,26,0.45)',
                  }}
                >
                  {/* top shine */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 to-transparent" />
                  {/* shimmer sweep on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/badge:translate-x-[110%]" />
                  {/* ícone estrela sólida */}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="relative text-[#08122B]" aria-hidden="true">
                    <path d="M12 2l2.9 6.26L22 9.27l-5 5.14 1.18 7.59L12 18.77l-6.18 3.23L7 14.41 2 9.27l7.1-1.01L12 2z" />
                  </svg>
                  <span className="relative text-[10px] font-black uppercase tracking-[0.08em] text-[#08122B] [text-shadow:0_0.5px_0_rgba(255,255,255,0.25)]">30 dias grátis</span>
                </span>
                {/* Outer label */}
                <span className="text-[11px] font-semibold text-white/75" style={{ letterSpacing: '0.045em' }}>
                  sem cartão de crédito
                </span>
              </span>
            </div>
          </IntersectionReveal>

          {/* Headline — caixa mista, hierarquia forte (DS unificado) */}
          <h1 className="font-syne mx-auto mb-6 max-w-5xl text-balance text-5xl font-black leading-[0.92] tracking-[-0.03em] text-white sm:text-6xl lg:text-8xl [text-shadow:0_4px_32px_rgba(0,0,0,0.5)]">
            Seu personal trainer com{' '}
            <span className="hero-shimmer bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent [text-shadow:none]">
              IA
            </span>
            , no seu bolso
          </h1>

          {/* Slide indicators */}
          <IntersectionReveal animation="fade-in" delay={100}>
            <div className="mb-8 flex items-center justify-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${
                    currentSlide === i ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ir para slide ${i + 1}${currentSlide === i ? ' (atual)' : ''}`}
                  aria-current={currentSlide === i ? 'true' : undefined}
                />
              ))}
            </div>
          </IntersectionReveal>

          {/* Subtitle */}
          <IntersectionReveal animation="fade-in" delay={150}>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {headlineVariant === 'A'
                ? 'Plano de treino personalizado, evolução por dados e gamificação no app. Teste tudo por 30 dias grátis — sem pedir cartão.'
                : 'Veja seu próximo treino com clareza e evolua com IA, personal e nutricionista. 30 dias grátis, sem cartão de crédito.'}
            </p>
          </IntersectionReveal>

          {/* CTAs — DS 3D Buttons */}
          <IntersectionReveal animation="fade-in" delay={250}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/welcome"
                onClick={() => {
                  trackLandingEvent('lp_cta_primary_click', {
                    placement: 'hero',
                    cta: ctaVariant === 'A' ? 'comecar_agora' : 'testar_agora',
                    experiment_id: 'home_cta_v1',
                    experiment_variant: ctaVariant,
                  })
                  trackLandingEvent('lp_register_start', {
                    placement: 'hero',
                    experiment_id: 'home_cta_v1',
                    experiment_variant: ctaVariant,
                  })
                }}
              >
                <span
                  className="group/cta relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full pl-8 pr-2 text-[13px] font-black uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto sm:text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
                    boxShadow: '0 12px 30px -6px rgba(0,0,0,0.55), 0 6px 22px -4px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.42), inset 0 -1px 0 rgba(6,78,59,0.5)',
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
                  <span className="relative z-10">{ctaVariant === 'A' ? 'Começar Grátis' : 'Criar meu treino'}</span>
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                    <DSIcon name="arrowRight" size={17} className="text-[#4ADE80] -rotate-45 transition-transform duration-300 group-hover/cta:rotate-0" />
                  </span>
                </span>
              </Link>

              <a
                href="#how-it-works"
                onClick={() => trackLandingEvent('lp_cta_secondary_click', { placement: 'hero', cta: 'ver_demo' })}
              >
                <span
                  className="group/play relative inline-flex h-14 w-full items-center justify-between overflow-hidden rounded-full pl-7 pr-2 active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(20px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 24px -6px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Sheen sweep */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/play:translate-x-[120%]" />
                  <span className="relative z-10 pr-4 text-[13px] font-black uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] sm:text-sm">
                    Ver como funciona
                  </span>
                  {/* Play chip — verde gradiente sólido, triângulo navy (espelha o CTA primário) */}
                  <span
                    className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover/play:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
                      boxShadow: '0 4px 14px -3px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(6,78,59,0.4)',
                    }}
                  >
                    {/* halo de pulso suave, único — sem bordas concorrentes */}
                    <span className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-brand-primary/30 motion-safe:animate-ping" />
                    <svg width="12" height="14" viewBox="0 0 12 14" className="relative ml-0.5 fill-[#08122B]" aria-hidden="true">
                      <path d="M1 1.3 11 7 1 12.7Z" />
                    </svg>
                  </span>
                </span>
              </a>
            </div>
          </IntersectionReveal>

          {/* Trust badges — glass mini pills */}
          <IntersectionReveal animation="fade-in" delay={350}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { icon: 'check' as const, label: '30 dias grátis' },
                { icon: 'creditCard' as const, label: 'Sem cartão' },
                { icon: 'x' as const, label: 'Cancele quando quiser' },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <DSIcon name={item.icon} size={12} className="text-brand-primary" />
                  <span className="text-[11px] font-semibold text-white/75" style={{ letterSpacing: '0.04em' }}>
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          </IntersectionReveal>
        </div>

        {/* ===== STATS — cards flutuantes com count-up + spotlight ===== */}
        <HeroStats />

      </div>

      <style jsx global>{`
        @keyframes heroShimmer {
          to { background-position: -200% center; }
        }
        .hero-shimmer {
          background-size: 200% auto;
          animation: heroShimmer 3.5s linear infinite;
        }
        @keyframes heroFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(44px, -34px) scale(1.08); }
        }
        @keyframes heroFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-52px, 22px) scale(0.93); }
        }
        .hero-orb-1 { animation: heroFloat1 15s ease-in-out infinite; will-change: transform; }
        .hero-orb-2 { animation: heroFloat2 19s ease-in-out infinite; will-change: transform; }
        @keyframes statIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-shimmer { animation: none; }
          .hero-orb-1, .hero-orb-2 { animation: none; }
        }
      `}</style>
    </section>
  )
}
