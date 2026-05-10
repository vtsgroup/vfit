// ============================================
// Hero — Epic crossfade images + rotating headlines
// Fitness photos, gradient overlays, Inter 900, 3D CTA
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { getExperimentVariant, trackExperimentViewOnce, type ExperimentVariant } from '@/lib/landing-experiments'
import { PUBLIC_SOCIAL_PROOF } from '@config/constants'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

/* ─── Typography ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Hero slides ─── */
const HERO_SLIDES = [
  { image: '/images/hero-1.webp', prefix: 'TREINOS QUE', highlight: 'TRANSFORMAM' },
  { image: '/images/hero-2.webp', prefix: 'SEU OBJETIVO', highlight: 'NO FOCO' },
  { image: '/images/hero-3.webp', prefix: 'RESULTADO COM', highlight: 'MÉTODO' },
  { image: '/images/hero-4.webp', prefix: 'TREINO E DIETA', highlight: 'ALINHADOS' },
]

const HERO_STATS = [
  { value: PUBLIC_SOCIAL_PROOF.active_personals_label, label: 'PERSONALS', icon: 'users' as const },
  { value: PUBLIC_SOCIAL_PROOF.active_students_label, label: 'ALUNOS', icon: 'userCheck' as const },
  { value: PUBLIC_SOCIAL_PROOF.satisfaction_label, label: 'SATISFAÇÃO', icon: 'star' as const },
  { value: '24/7', label: 'DISPONÍVEL', icon: 'clock' as const },
]

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

      {/* Cinematic color grading */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(5,10,18,0.85) 0%, rgba(5,10,18,0.50) 40%, rgba(16,185,129,0.08) 70%, rgba(5,10,18,0.70) 100%)',
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
        className="absolute inset-x-0 bottom-0 z-20"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, var(--color-bg-primary) 0%, var(--color-bg-primary) 8%, rgba(5,10,18,0.85) 35%, rgba(5,10,18,0.4) 65%, transparent 100%)',
        }}
      />

      {/* Top gradient for navbar blending */}
      <div
        className="absolute inset-x-0 top-0 h-40 z-20"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,10,18,0.96) 0%, rgba(15,26,44,0.62) 38%, rgba(15,26,43,0.24) 68%, transparent 100%)',
        }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Brand glow accent */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: '20%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16 w-full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Mono label */}
          <IntersectionReveal animation="fade-in">
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/6 px-4 py-1.5 text-[11px] text-brand-primary/80 uppercase"
                style={monoLabel}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                {headlineVariant === 'A'
                  ? 'App de treino com IA para alunos'
                  : 'Treino inteligente com apoio profissional'}
              </span>
            </div>
          </IntersectionReveal>

          {/* Rotating headline */}
          <div className="relative mb-4" style={{ minHeight: 'clamp(100px, 16vw, 180px)' }}>
            {HERO_SLIDES.map((slide, i) => (
              <div
                key={slide.highlight}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700"
                style={{
                  opacity: currentSlide === i ? 1 : 0,
                  transform: currentSlide === i ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                }}
              >
                <h1
                  className="uppercase text-white"
                  style={{ ...headingFont, fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: '0.9' }}
                >
                  {slide.prefix}
                  <br />
                  <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
                    {slide.highlight}
                  </span>
                </h1>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <IntersectionReveal animation="fade-in" delay={100}>
            <div className="mb-8 flex items-center justify-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    currentSlide === i ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </IntersectionReveal>

          {/* Subtitle */}
          <IntersectionReveal animation="fade-in" delay={150}>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
              {headlineVariant === 'A'
                ? 'Receba treinos personalizados com inteligência artificial, acompanhe sua evolução e mantenha constância com gamificação no celular.'
                : 'Treine com método, acompanhe progresso real e conte com personal e nutricionista no mesmo ecossistema quando precisar.'}
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
                <Button variant="primary" size="lg" className="px-10 text-sm uppercase" style={monoLabel}>
                  <DSIcon name="sparkles" size={16} />
                  {ctaVariant === 'A' ? 'COMEÇAR GRÁTIS' : 'TESTAR AGORA'}
                </Button>
              </Link>

              <a
                href="#how-it-works"
                onClick={() => trackLandingEvent('lp_cta_secondary_click', { placement: 'hero', cta: 'ver_demo' })}
              >
                <Button variant="outline" size="lg" className="px-8 text-xs uppercase" style={monoLabel}>
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 1.5l7.5 4.5-7.5 4.5V1.5z" />
                  </svg>
                  VER DEMONSTRAÇÃO
                </Button>
              </a>
            </div>
          </IntersectionReveal>

          {/* Trust badges */}
          <IntersectionReveal animation="fade-in" delay={350}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/25" style={monoLabel}>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase">
                <DSIcon name="check" size={14} className="text-brand-primary/50" />
                PLANO GRATUITO
              </span>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase">
                <DSIcon name="check" size={14} className="text-brand-primary/50" />
                SEM CARTÃO
              </span>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase">
                <DSIcon name="check" size={14} className="text-brand-primary/50" />
                CANCELE QUANDO QUISER
              </span>
            </div>
          </IntersectionReveal>
        </div>

        {/* ===== STATS BAR — glass card with animated border ===== */}
        <IntersectionReveal animation="fade-in" delay={500}>
          <div className="relative mt-20 rounded-2xl p-px" style={{ background: 'conic-gradient(from var(--border-angle), transparent 40%, rgba(16,185,129,0.4) 50%, transparent 60%)', animation: 'borderRotate 4s linear infinite' }}>
          <div
            className="rounded-2xl border border-white/6 p-1"
            style={{
              background: 'rgba(11, 18, 33, 0.50)',
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
              {HERO_STATS.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center py-4 sm:py-5 ${
                    idx < HERO_STATS.length - 1 ? 'sm:border-r sm:border-white/6' : ''
                  }`}
                >
                  <DSIcon name={stat.icon} size={16} className="text-brand-primary/40 mb-1.5 sm:mb-2" />
                  <span className="text-xl font-black text-white sm:text-3xl" style={headingFont}>
                    {stat.value}
                  </span>
                  <span className="mt-1 text-[9px] sm:text-[10px] text-white/30 uppercase" style={monoLabel}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </IntersectionReveal>

      </div>
    </section>
  )
}
