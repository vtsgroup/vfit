// ============================================
// cta-section.tsx — "COMECE AGORA" (CTA final)
// ============================================
//
// O que faz:
//   Seção final com fundo cinematográfico animado (Ken-Burns + crossfade das
//   fotos do hero), overlay escuro e CTAs premium. Reusa a linguagem de botões
//   verde-gradiente (navy) + glass da landing.
//
// Exports principais:
//   CtaSection — seção CTA final
'use client'

import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { DSIcon } from '@/components/ui/ds-icon'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-bg-primary py-20 sm:py-36" aria-label="Chamada para ação">
      {/* ── Fundo: vídeo real de academia (leve, autoplay mudo em loop) ── */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <video
          className="cta-video h-full w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/cta-bg.webp"
        >
          <source src="/videos/gym-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay cinematográfico */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,10,18,0.88), rgba(5,10,18,0.93) 45%, rgba(5,10,18,0.9))' }} />
      <div aria-hidden="true" className="absolute inset-0 bg-brand-primary/30 mix-blend-multiply" />
      {/* Fades topo/baixo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-bg-primary to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-primary to-transparent" />

      {/* Perspective grid + orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="cta-grid h-full w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: 'perspective(800px) rotateX(35deg) scale(2.5)', transformOrigin: 'center', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />
      </div>
      <div aria-hidden="true" className="cta-orb pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 8px 24px -10px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.14)' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="bg-linear-to-r from-white to-brand-mint bg-clip-text text-transparent">Comece agora</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Headline */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2 className="font-syne mx-auto max-w-4xl text-4xl font-black leading-[0.96] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-6xl">
            Comece seu{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">treino</span>
            <br />
            com personal e IA
          </h2>
        </IntersectionReveal>

        {/* Subtitle */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
            30 dias grátis, sem cartão. Receba um plano claro e acompanhe sua evolução sem planilha solta — cancele quando quiser.
          </p>
        </IntersectionReveal>

        {/* Botões */}
        <IntersectionReveal animation="fade-in" delay={200}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', { placement: 'cta_section', cta: 'comecar_gratis' })
                trackLandingEvent('lp_register_start', { placement: 'cta_section' })
              }}
              data-testid="landing-cta-register"
              aria-label="Começar grátis"
            >
              <span className="group/cta relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full pl-3 pr-8 text-sm font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)', boxShadow: '0 16px 38px -8px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(6,78,59,0.4)' }}>
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
                <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  <DSIcon name="sparkles" size={15} className="text-[#4ADE80]" />
                </span>
                <span className="relative z-10">Começar grátis</span>
              </span>
            </Link>

            <Link
              href="/login"
              onClick={() => trackLandingEvent('lp_cta_secondary_click', { placement: 'cta_section', cta: 'ja_tenho_conta' })}
              data-testid="landing-cta-login"
              aria-label="Já tenho conta"
            >
              <span className="inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[13px] font-black uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-px hover:brightness-125 active:scale-[0.98]" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 18px -5px rgba(0,0,0,0.55)' }}>
                <DSIcon name="logIn" size={14} />
                Já tenho conta
              </span>
            </Link>
          </div>
        </IntersectionReveal>

        {/* Trust */}
        <IntersectionReveal animation="fade-in" delay={400}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70" style={monoLabel}>
            {['30 dias grátis', 'Sem cartão', 'Cancele quando quiser'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-[10px] uppercase">
                <DSIcon name="check" size={14} className="text-brand-primary/60" />
                {t}
              </span>
            ))}
          </div>
        </IntersectionReveal>
      </div>

      <style jsx global>{`
        @keyframes ctaZoom { 0%, 100% { transform: scale(1.05); } 50% { transform: scale(1.12); } }
        .cta-video { animation: ctaZoom 22s ease-in-out infinite; will-change: transform; }
        @keyframes ctaGridPulse { 0%, 100% { opacity: 0.04; } 50% { opacity: 0.07; } }
        .cta-grid { opacity: 0.04; animation: ctaGridPulse 8s ease-in-out infinite; }
        @keyframes ctaOrbDrift { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-46%, -54%) scale(1.1); } }
        .cta-orb { animation: ctaOrbDrift 16s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .cta-video, .cta-grid, .cta-orb { animation: none; }
        }
      `}</style>
    </section>
  )
}
