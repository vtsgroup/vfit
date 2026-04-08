// ============================================
// cta-section.tsx — Seção de Call-to-Action da landing page
// ============================================
//
// O que faz:
//   Seção final da landing com CTA principal para cadastro.
//   Dispara trackLandingEvent ao clicar no botão.
//   Usa IntersectionReveal para animação de entrada.
//
// Exports principais:
//   CtaSection — seção CTA final da landing
'use client'

import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'

/* ─── Typography — consistent with pricing/testimonials ─── */
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

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-36" aria-label="Chamada para ação">
      {/* Background image — fitness photo with brand-dark filter */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cta-bg.webp"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback: hide image, show solid dark bg
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>

      {/* Overlay escuro cinematográfico */}
      <div className="absolute inset-0 bg-[#030810]/85" />

      {/* Camada tonal da marca */}
      <div className="absolute inset-0 bg-brand-primary/40 mix-blend-multiply" />

      {/* Bottom gradient fade to dark (transitions into footer) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-primary to-transparent" />

      {/* Top gradient fade from light testimonials */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-bg-primary to-transparent" />

      {/* Perspective grid — subtle over photo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-full w-full opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(800px) rotateX(35deg) scale(2.5)',
            transformOrigin: 'center center',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
          }}
        />
      </div>

      {/* Subtle green glow behind heading */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-brand-primary/8 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 text-center">
            <span
              className="inline-block text-xs text-brand-primary/70 uppercase"
              style={monoLabel}
            >
              /COMECE AGORA
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading — slightly smaller, balanced */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="mx-auto max-w-4xl uppercase text-white"
            style={{
              ...headingFont,
              fontSize: 'clamp(2rem, 5.5vw, 4rem)',
              lineHeight: '0.95',
            }}
          >
            TRANSFORME SEU{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              NEGÓCIO
            </span>
            <br />
            DE PERSONAL TRAINER
          </h2>
        </IntersectionReveal>

        {/* Subtitle */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
            Junte-se a milhares de profissionais. Teste grátis, sem cartão.
          </p>
        </IntersectionReveal>

        {/* CTA buttons */}
        <IntersectionReveal animation="fade-in" delay={200}>
          <div className="mt-10 flex flex-col items-center gap-5">
            {/* Primary — DS 3D button */}
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', { placement: 'cta_section', cta: 'comecar_gratis' })
                trackLandingEvent('lp_register_start', { placement: 'cta_section' })
              }}
            >
              <Button variant="primary" size="lg" className="px-12 text-sm uppercase" style={monoLabel}>
                <DSIcon name="sparkles" size={16} />
                COMEÇAR GRÁTIS
              </Button>
            </Link>

            {/* Secondary — DS outline button */}
            <Link
              href="/login"
              onClick={() => trackLandingEvent('lp_cta_secondary_click', { placement: 'cta_section', cta: 'ja_tenho_conta' })}
            >
              <Button variant="outline" size="lg" className="px-10 text-xs uppercase" style={monoLabel}>
                <DSIcon name="logIn" size={14} />
                JÁ TENHO CONTA
              </Button>
            </Link>
          </div>
        </IntersectionReveal>

        {/* Trust badges — minimal mono */}
        <IntersectionReveal animation="fade-in" delay={400}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-white/50 sm:gap-8" style={monoLabel}>
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
    </section>
  )
}
