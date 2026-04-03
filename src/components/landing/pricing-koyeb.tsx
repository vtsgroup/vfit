/**
 * src/components/landing/pricing-koyeb.tsx
 *
 * Pricing Section — Koyeb-Inspired DARK Design
 *
 * Exports: PricingKoyeb
 * Hooks: useState, useEffect, useRef, useCallback
 * Features: 'use client'
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { PLANS as PLAN_CONSTANTS } from '@config/constants'
import { getAnnualPrice, formatPrice, formatPriceInteger, formatPriceCents } from '@/data/pricing-plans'

// ============================================
// Pricing Section — Koyeb-Inspired DARK Design
// 4 Plans | Annual/Monthly Toggle | 3D Buttons
// ============================================

// Monospace style — avoids Tailwind v4 font-mono + font-bold conflict
const monoStyle = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }
// Heading font — Koyeb-style heavy uppercase (same as testimonials section)
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const forcedGlassStyle = {
  backdropFilter: 'blur(22px) saturate(1.45)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.45)',
}

interface PlanFeature {
  text: string
  highlight?: boolean
}

interface Plan {
  tier: string
  name: string
  icon: 'spark' | 'bolt' | 'briefcase' | 'crown'
  monthlyPrice: number
  description: string
  features: PlanFeature[]
  cta: string
  href: string
  popular?: boolean
  badge?: string
  comparison?: string
}

const PLANS: Plan[] = [
  {
    tier: 'GRÁTIS',
    name: 'Grátis',
    icon: 'spark',
    monthlyPrice: PLAN_CONSTANTS.trial.price_brl,
    description: 'Para quem está começando. Tudo que você precisa para gerenciar seus primeiros alunos.',
    features: [
      { text: '5 alunos ativos' },
      { text: 'Gamificação (XP, streaks)', highlight: true },
      { text: 'Cobrança Pix/boleto' },
      { text: 'Taxa configurável: absorve ou repassa' },
      { text: 'App PWA completo' },
      { text: 'Suporte por e-mail' },
    ],
    cta: 'Começar grátis',
    href: '/welcome',
    comparison: 'Nenhum concorrente oferece gamificação no plano gratuito',
  },
  {
    tier: 'PRO',
    name: 'Pro',
    icon: 'bolt',
    monthlyPrice: PLAN_CONSTANTS.pro.price_brl,
    description: 'Para personal trainers que querem escalar. Alunos ilimitados e automação completa.',
    features: [
      { text: 'Alunos ilimitados', highlight: true },
      { text: 'Recorrência automática (Pix Automático)' },
      { text: 'Gamificação completa (badges, ranking)' },
      { text: 'Notificações e-mail + WhatsApp', highlight: true },
      { text: 'E-mail @iapersonal.app.br incluso' },
      { text: 'Relatórios avançados' },
    ],
    cta: 'Começar agora',
    href: '/register?plan=pro',
    popular: true,
    badge: 'MAIS POPULAR',
    comparison: 'MFIT cobra R$ 39,90 sem recorrência e sem gamificação',
  },
  {
    tier: 'PRO+',
    name: 'Pro+',
    icon: 'briefcase',
    monthlyPrice: PLAN_CONSTANTS.profissional.price_brl,
    description: 'Para quem quer profissionalizar. Contratos, invoices e NFs em um único app.',
    features: [
      { text: 'Tudo do Pro +' },
      { text: 'Contratos digitais com modelos prontos', highlight: true },
      { text: 'Invoices profissionais com seu logo' },
      { text: 'Papel timbrado digital' },
      { text: '30 NFs/mês incluídas', highlight: true },
      { text: 'Agendamento automático' },
      { text: 'Topo do marketplace + Selo Verificado' },
    ],
    cta: 'Assinar agora',
    href: '/register?plan=pro-plus',
    comparison: 'Nenhum concorrente oferece tudo isso num único app',
  },
  {
    tier: 'MAX',
    name: 'Max',
    icon: 'crown',
    monthlyPrice: PLAN_CONSTANTS.max.price_brl,
    description: 'Experiência premium completa. Sua marca, seu domínio, zero menção ao VFIT.',
    features: [
      { text: 'Tudo do Pro+ +' },
      { text: 'E-mail com domínio próprio (@seudominio)', highlight: true },
      { text: 'App white-label (nome + logo)', highlight: true },
      { text: 'Assinatura digital ICP-Brasil' },
      { text: 'Zero menção ao VFIT' },
      { text: 'Suporte VIP 24/7', highlight: true },
    ],
    cta: 'Falar com vendas',
    href: '/register?plan=max',
    comparison: 'Mobitrainer e Nexur cobram R$ 149,90+ com menos recursos',
  },
]

const PLAN_ICONS: Record<Plan['icon'], 'sparkles' | 'zap' | 'briefcase' | 'crown'> = {
  spark: 'sparkles',
  bolt: 'zap',
  briefcase: 'briefcase',
  crown: 'crown',
}

export function PricingKoyeb() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [activeCard, setActiveCard] = useState(1) // default to popular plan
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackLandingEvent('lp_pricing_view', { section: 'pricing-koyeb' })
  }, [])

  // Track active card from scroll position
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[]
      const center = el.scrollLeft + el.offsetWidth / 2
      let closest = 0
      let minDist = Infinity
      children.forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2
        const dist = Math.abs(center - childCenter)
        if (dist < minDist) { minDist = dist; closest = i }
      })
      setActiveCard(closest)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-scroll to popular plan (index 1) on mount — mobile only
  useEffect(() => {
    const el = scrollRef.current
    if (!el || typeof window === 'undefined' || window.innerWidth >= 1024) return
    requestAnimationFrame(() => {
      const child = el.children[1] as HTMLElement | undefined
      if (child) {
        el.scrollTo({ left: child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2, behavior: 'instant' })
      }
    })
  }, [])

  const scrollToCard = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const child = el.children[index] as HTMLElement | undefined
    if (child) {
      el.scrollTo({ left: child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2, behavior: 'smooth' })
    }
  }, [])

  function handleToggle(annual: boolean) {
    setIsAnnual(annual)
    trackLandingEvent('pricing_toggle', {
      billing: annual ? 'annual' : 'monthly',
    })
  }

  return (
    <section id="pricing" className="relative overflow-hidden bg-bg-base py-24 sm:py-32" aria-label="Planos e preços">
      {/* Background pattern — green subtle grid (Koyeb-style) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      {/* Diagonal accent lines — very subtle */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(34,197,94,0.15) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(34,197,94,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Glow decorations */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/4 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-100 w-100 translate-x-1/2 translate-y-1/2 rounded-full bg-brand-accent/3 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* ===== HEADER ===== */}
        <IntersectionReveal animation="blur-in">
          <div className="mb-6 text-center">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-primary"
              style={monoStyle}
            >
              Planos
            </span>
          </div>
          <h2
            className="mx-auto mb-4 max-w-3xl text-center font-black uppercase tracking-tight text-white"
            style={{
              ...headingFont,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '0.95',
            }}
          >
            Feito para{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              crescer
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-sm leading-relaxed text-text-secondary-cool sm:text-base">
            Comece grátis. Pague apenas pelo que precisa. Evolua conforme seu negócio cresce.
          </p>
        </IntersectionReveal>

        {/* ===== BILLING TOGGLE ===== */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <div className="mb-14 flex items-center justify-center gap-3">
            <button
              onClick={() => handleToggle(false)}
              style={monoStyle}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                !isAnnual
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-text-muted-cool hover:text-white/60'
              }`}
            >
              Mensal
            </button>

            {/* Toggle switch */}
            <button
              onClick={() => handleToggle(!isAnnual)}
              className="relative h-7 w-12 rounded-full bg-white/10 p-0.5 transition-colors duration-300 hover:bg-white/15"
              aria-label="Alternar entre plano mensal e anual"
            >
              <div
                className={`h-6 w-6 rounded-full transition-all duration-300 ${
                  isAnnual
                    ? 'translate-x-5 bg-brand-primary shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                    : 'translate-x-0 bg-white/60'
                }`}
              />
            </button>

            <button
              onClick={() => handleToggle(true)}
              style={monoStyle}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isAnnual
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-text-muted-cool hover:text-white/60'
              }`}
            >
              Anual
              <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-bold text-brand-primary ring-1 ring-brand-primary/30">
                −20%
              </span>
            </button>
          </div>
        </IntersectionReveal>

        {/* ===== PLANS CAROUSEL (mobile) / GRID (desktop) ===== */}
        <div
          ref={scrollRef}
          className="relative isolate flex snap-x snap-mandatory gap-4 overflow-x-auto pt-4 scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:snap-none lg:gap-0 lg:overflow-visible lg:pt-0 lg:pb-0"
        >
          {PLANS.map((plan, i) => {
            const currentPrice = isAnnual ? getAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice
            const savings = isAnnual && plan.monthlyPrice > 0
              ? Math.round((plan.monthlyPrice * 12 - getAnnualPrice(plan.monthlyPrice) * 12) * 100) / 100
              : 0

            const isFirst = i === 0
            const isLast = i === PLANS.length - 1

            return (
              <IntersectionReveal
                key={plan.tier}
                animation="scale-in"
                delay={i * 80}
                className={`w-[85vw] shrink-0 snap-center sm:w-[48vw] lg:w-auto lg:shrink ${plan.popular ? 'relative z-70' : 'relative z-10'}`}
              >
                <div
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
                    e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.removeProperty('--spotlight-x')
                    e.currentTarget.style.removeProperty('--spotlight-y')
                  }}
                  className={`group relative flex h-full flex-col border backdrop-blur-md transition-all duration-300 ${
                    plan.popular
                      ? 'z-80 rounded-3xl border-2 border-brand-primary/70 bg-bg-surface-1/95 shadow-[0_0_45px_rgba(34,197,94,0.16)] lg:scale-[1.03]'
                      : 'z-10 rounded-2xl border-white/8 bg-bg-base/92 hover:border-white/14 hover:shadow-[0_10px_30px_rgba(3,8,16,0.45)] lg:rounded-none'
                  } ${
                    plan.popular
                    ? ''
                    : isFirst ? 'lg:rounded-l-2xl lg:rounded-r-none' :
                    isLast ? 'lg:rounded-r-2xl lg:rounded-l-none' :
                    ''
                  } ${
                    !plan.popular && i > 0 ? 'lg:-ml-px' : ''
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/5 via-transparent to-brand-primary/6" />
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(34,197,94,0.07), transparent 60%)' }} />
                  {plan.popular && <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-brand-primary/40" />}

                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 right-6 z-40">
                      <div className="flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 shadow-[0_4px_12px_rgba(34,197,94,0.4)]">
                        <DSIcon name="star" size={12} className="text-bg-base" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-bg-base">
                          {plan.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    {/* Tier label */}
                    <div className="mb-4 flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-brand-primary">
                        <DSIcon name={PLAN_ICONS[plan.icon]} size={16} />
                      </span>
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted-cool"
                        style={monoStyle}
                      >
                        {plan.tier}
                      </span>
                    </div>

                    <h3 className="mb-2 text-[22px] font-black tracking-tight text-white" style={headingFont}>
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-1 flex items-baseline gap-0.5 antialiased">
                      {plan.monthlyPrice > 0 && (
                        <span className="text-sm font-semibold text-text-muted-cool" style={monoStyle}>R$</span>
                      )}
                      <span
                        className={`text-5xl font-black tracking-tight sm:text-6xl ${
                          plan.popular ? 'text-brand-primary' : 'text-white'
                        }`}
                        style={monoStyle}
                      >
                        {plan.monthlyPrice === 0 ? 'Grátis' : formatPriceInteger(currentPrice)}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <>
                          <span
                            className={`text-lg font-bold ${
                              plan.popular ? 'text-brand-primary/70' : 'text-white/50'
                            }`}
                            style={monoStyle}
                          >
                            {formatPriceCents(currentPrice)}
                          </span>
                          <span className="ml-1 text-sm text-text-muted-cool" style={monoStyle}>/mês</span>
                        </>
                      )}
                    </div>

                    {/* Annual savings badge */}
                    {isAnnual && savings > 0 && (
                      <div className="mb-3 mt-1">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary ring-1 ring-inset ring-brand-primary/20">
                          Economize R$ {formatPrice(savings)}/ano · 2 meses grátis
                        </span>
                      </div>
                    )}

                    {/* Strikethrough old price when annual */}
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="mb-2 text-xs text-text-muted-cool">
                        <span className="line-through">R$ {formatPrice(plan.monthlyPrice)}/mês</span>
                      </p>
                    )}

                    {/* Description */}
                    <p className="mb-6 text-[13px] leading-[1.65] text-text-secondary-cool">
                      {plan.description}
                    </p>

                    {/* Features header */}
                    <div className="mb-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted-cool"
                        style={monoStyle}
                      >
                        Recursos
                      </span>
                    </div>

                    {/* Features list */}
                    <ul className="mb-8 flex-1 space-y-3.5">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[13px]">
                          <span className={`mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                            feature.highlight
                              ? 'border-brand-primary/50 bg-brand-primary/20 text-brand-primary'
                              : 'border-white/12 bg-white/3 text-white/30'
                          }`}>
                            <svg
                              className="h-3 w-3"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                          <div className="flex min-w-0 items-center gap-2">
                            <span className={feature.highlight ? 'font-medium text-white/85' : 'text-white/55'}>
                              {feature.text}
                            </span>
                            {feature.highlight && (
                              <span className="inline-flex items-center rounded-full border border-brand-primary/35 bg-brand-primary/12 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-brand-primary" style={monoStyle}>
                                Pro
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Competitor comparison */}
                    {plan.comparison && (
                      <div className="mb-6 rounded-lg border border-white/4 bg-white/2 px-3 py-2">
                        <p className="text-[11px] leading-relaxed text-text-muted-cool">
                          👉 <span className="italic">{plan.comparison}</span>
                        </p>
                      </div>
                    )}

                    {/* ===== 3D CTA BUTTON — DS ===== */}
                    <Link
                      href={plan.href}
                      onClick={() => {
                        trackLandingEvent('plan_click', {
                          placement: 'pricing-koyeb',
                          plan: plan.tier.toLowerCase(),
                          plan_price: currentPrice.toString(),
                          billing: isAnnual ? 'annual' : 'monthly',
                        })
                        if (plan.href.startsWith('/register')) {
                          trackLandingEvent('lp_register_start', {
                            placement: 'pricing-koyeb',
                            plan: plan.tier.toLowerCase(),
                          })
                        }
                      }}
                      className="mt-auto block"
                    >
                      <Button
                        variant={plan.popular ? 'primary' : 'outline'}
                        size="lg"
                        className="w-full text-xs uppercase tracking-wider"
                      >
                        <DSIcon name="play" size={12} />
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </IntersectionReveal>
            )
          })}
        </div>

        {/* ===== DOT NAVIGATION — mobile only ===== */}
        <div className="mt-2 flex items-center justify-center gap-2.5 lg:hidden">
          {PLANS.map((plan, i) => (
            <button
              key={plan.tier}
              onClick={() => scrollToCard(i)}
              aria-label={`Ver plano ${plan.name}`}
              className={`rounded-full transition-all duration-300 ${
                activeCard === i
                  ? 'h-2.5 w-7 bg-brand-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'h-2.5 w-2.5 bg-white/15 hover:bg-white/25'
              }`}
            />
          ))}
        </div>

        {/* ===== BOTTOM BANNERS (Koyeb-style) ===== */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
          {/* Banner: Diferenciais */}
          <IntersectionReveal animation="fade-in" delay={400}>
            <div
              className="relative h-full overflow-hidden rounded-2xl border border-brand-primary/30 bg-bg-surface-1/18 p-6 backdrop-blur-[22px] backdrop-saturate-[1.45] shadow-[0_16px_50px_rgba(3,8,16,0.45)] sm:p-8"
              style={forcedGlassStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-bg-surface-1/10 backdrop-blur-[18px] backdrop-saturate-150"
                style={forcedGlassStyle}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-primary/16 via-white/5 to-brand-accent/9" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/14" />
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-br from-brand-primary/30 via-transparent to-white/16 opacity-60" />
              {/* Koyeb-style circuit decoration */}
              <svg className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.12]" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 0v40h80" stroke="#22C55E" strokeWidth="1" />
                <path d="M160 0v70h40" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M140 30h60" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M100 60h100" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M180 0v150" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M130 80l30-30" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M150 100h50" stroke="#22C55E" strokeWidth="0.5" />
                <circle cx="120" cy="40" r="2" fill="#22C55E" />
                <circle cx="160" cy="70" r="2" fill="#22C55E" />
                <circle cx="140" cy="30" r="1.5" fill="#22C55E" />
                <circle cx="180" cy="100" r="1.5" fill="#22C55E" />
                {/* Dot matrix pattern */}
                {Array.from({length: 8}).map((_, row) =>
                  Array.from({length: 6}).map((_, col) => (
                    <circle key={`${row}-${col}`} cx={110 + col * 14} cy={20 + row * 16} r="0.8" fill="#22C55E" opacity={(row + col) % 2 === 0 ? 0.55 : 0.2} />
                  ))
                )}
              </svg>

              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20">
                    <svg className="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white" style={monoStyle}>
                    Diferenciais Únicos
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-text-secondary-cool">
                  Gamificação nativa, Pix Automático, taxa configurável, NF + contratos + invoices
                  num só app. Nenhum concorrente tem <strong className="text-brand-primary">TUDO isso junto</strong>.
                </p>
                <Link
                  href="#features"
                  style={monoStyle}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary transition-colors hover:text-brand-primary-hover"
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 1.5l7.5 4.5-7.5 4.5V1.5z" />
                  </svg>
                  Ver todos os recursos
                </Link>
              </div>
            </div>
          </IntersectionReveal>

          {/* Banner: Economia Anual */}
          <IntersectionReveal animation="fade-in" delay={500}>
            <div
              className="relative h-full overflow-hidden rounded-2xl border border-white/14 bg-bg-surface-1/18 p-6 backdrop-blur-[22px] backdrop-saturate-[1.45] shadow-[0_16px_50px_rgba(3,8,16,0.45)] sm:p-8"
              style={forcedGlassStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-bg-surface-1/10 backdrop-blur-[18px] backdrop-saturate-150"
                style={forcedGlassStyle}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/13 via-white/5 to-brand-primary/13" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/14" />
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-br from-white/20 via-transparent to-brand-primary/20 opacity-60" />
              {/* Koyeb-style circuit decoration */}
              <svg className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.08]" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0v50h100" stroke="#22C55E" strokeWidth="1" />
                <path d="M130 30h70" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M150 0v80" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M170 50v100" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M110 70l40 40" stroke="#22C55E" strokeWidth="0.5" />
                <path d="M120 120h80" stroke="#22C55E" strokeWidth="0.5" />
                <circle cx="100" cy="50" r="2" fill="#22C55E" />
                <circle cx="150" cy="80" r="1.5" fill="#22C55E" />
                <circle cx="170" cy="50" r="1.5" fill="#22C55E" />
              </svg>

              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20">
                    <svg className="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white" style={monoStyle}>
                    Plano Anual
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-text-secondary-cool">
                  Economize <strong className="text-white">20%</strong> pagando anualmente.
                  São <strong className="text-brand-primary">2 meses grátis</strong> em todos os planos pagos.
                </p>
                <button
                  onClick={() => handleToggle(true)}
                  style={monoStyle}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary transition-colors hover:text-brand-primary-hover"
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 1.5l7.5 4.5-7.5 4.5V1.5z" />
                  </svg>
                  Ativar plano anual
                </button>
              </div>
            </div>
          </IntersectionReveal>
        </div>
      </div>
    </section>
  )
}
