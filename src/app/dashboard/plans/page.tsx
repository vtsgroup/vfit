/**
 * src/app/dashboard/plans/page.tsx
 *
 * Dashboard Plans Page — Ultra-Premium v3 Pricing
 *
 * Exports: PlansPage
 * Hooks: useState, useRef, useEffect, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon · Button
 * Design: Clean premium · Glassmorphism · Stagger animations · High-conversion
 */

// ============================================
// Dashboard Plans — Ultra-Premium v3 Pricing
// ============================================

'use client'

import React, { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { usePlanSimulationStore } from '@/stores/plan-simulation-store'
import { PLANS as PLAN_CONSTANTS } from '@config/constants'
import { ANNUAL_DISCOUNT_B2B } from '@lib/pricing'

/* ─────────────────────────────────────────────
   Plan Data
   ───────────────────────────────────────────── */
interface DashboardPlan {
  slug: string
  name: string
  tier: string
  monthlyPrice: number
  description: string
  icon: DSIconName
  accentColor: string
  accentBg: string
  accentBorder: string
  accentGlow: string
  features: PlanFeature[]
  maxStudents: string
  popular?: boolean
  premium?: boolean
}

interface PlanFeature {
  text: string
  highlight?: boolean
  icon?: DSIconName
}

const PLANS: DashboardPlan[] = [
  {
    slug: 'trial',
    name: 'Grátis',
    tier: 'STARTER',
    monthlyPrice: PLAN_CONSTANTS.trial.price_brl,
    description: 'Comece sem compromisso',
    icon: 'user',
    accentColor: 'text-zinc-400',
    accentBg: 'bg-zinc-500/10',
    accentBorder: 'border-zinc-500/20',
    accentGlow: '',
    maxStudents: '5 alunos',
    features: [
      { text: 'Até 5 alunos ativos', icon: 'users' },
      { text: 'Criação manual de treinos', icon: 'dumbbell' },
      { text: 'Gamificação básica (XP)', icon: 'trophy' },
      { text: 'Cobrança Pix / boleto', icon: 'creditCard' },
      { text: 'App PWA completo', icon: 'smartphone' },
      { text: 'Suporte por e-mail', icon: 'mail' },
    ],
  },
  {
    slug: 'pro',
    name: 'Pro',
    tier: 'PRO',
    monthlyPrice: PLAN_CONSTANTS.pro.price_brl,
    description: 'Escale com IA e automação',
    icon: 'rocket',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    accentGlow: 'shadow-[0_0_60px_rgba(16,185,129,0.08)]',
    maxStudents: 'Ilimitados',
    popular: true,
    features: [
      { text: 'Alunos ilimitados', icon: 'infinity', highlight: true },
      { text: 'IA para criar treinos', icon: 'sparkles', highlight: true },
      { text: 'Recorrência automática', icon: 'repeat' },
      { text: 'Gamificação completa', icon: 'trophy' },
      { text: 'Notificações WhatsApp', icon: 'messageCircle' },
      { text: 'E-mail profissional', icon: 'mail' },
      { text: 'Relatórios avançados', icon: 'barChart' },
    ],
  },
  {
    slug: 'profissional',
    name: 'Pro+',
    tier: 'PRO+',
    monthlyPrice: PLAN_CONSTANTS.profissional.price_brl,
    description: 'Destaque-se no mercado',
    icon: 'star',
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
    accentGlow: 'shadow-[0_0_60px_rgba(139,92,246,0.06)]',
    maxStudents: 'Ilimitados',
    features: [
      { text: 'Tudo do Pro, mais:', icon: 'check' },
      { text: 'Marketplace de planos', icon: 'store', highlight: true },
      { text: 'IA avançada (Llama 70B)', icon: 'brain', highlight: true },
      { text: 'Relatórios PDF completos', icon: 'fileText' },
      { text: 'Avaliações com fotos IA', icon: 'camera' },
      { text: 'Dashboard financeiro', icon: 'wallet' },
      { text: 'Comparação de evolução', icon: 'trendingUp' },
      { text: 'Suporte prioritário', icon: 'headphones' },
    ],
  },
  {
    slug: 'max',
    name: 'Max',
    tier: 'ENTERPRISE',
    monthlyPrice: PLAN_CONSTANTS.max.price_brl,
    description: 'Seu app, sua marca',
    icon: 'crown',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
    accentGlow: 'shadow-[0_0_60px_rgba(245,158,11,0.06)]',
    maxStudents: 'Ilimitados',
    premium: true,
    features: [
      { text: 'Tudo do Pro+, mais:', icon: 'check' },
      { text: 'White-label completo', icon: 'palette', highlight: true },
      { text: 'Assistente IA pessoal', icon: 'bot', highlight: true },
      { text: 'Contratos digitais', icon: 'fileSignature' },
      { text: 'Invoices + NFs', icon: 'receipt' },
      { text: 'Assinatura ICP-Brasil', icon: 'shieldCheck' },
      { text: 'Zero menção ao VFIT', icon: 'eyeOff' },
      { text: 'Suporte VIP 24/7', icon: 'headphones' },
    ],
  },
]

/* ─── Comparison Data ─── */
interface ComparisonRow {
  category?: string
  feature: string
  values: [string | boolean, string | boolean, string | boolean, string | boolean]
}

const COMPARISON: ComparisonRow[] = [
  { category: 'Gestão de Alunos', feature: 'Alunos ativos', values: ['5', '∞', '∞', '∞'] },
  { feature: 'Criação de treinos', values: ['Manual', 'IA', 'IA avançada', 'IA avançada'] },
  { feature: 'Gamificação', values: ['Básica', 'Completa', 'Completa', 'Completa'] },
  { feature: 'Cobrança Pix/boleto', values: [true, true, true, true] },
  { feature: 'Recorrência automática', values: [false, true, true, true] },
  { category: 'Comunicação', feature: 'WhatsApp + E-mail', values: [false, true, true, true] },
  { feature: 'E-mail profissional', values: [false, true, true, true] },
  { feature: 'Chat integrado', values: [true, true, true, true] },
  { category: 'Inteligência Artificial', feature: 'IA para treinos', values: [false, true, true, true] },
  { feature: 'IA avançada (Llama 70B)', values: [false, false, true, true] },
  { feature: 'Fotos IA (evolução)', values: [false, false, true, true] },
  { feature: 'Assistente IA pessoal', values: [false, false, false, true] },
  { category: 'Negócio', feature: 'Marketplace', values: [false, false, true, true] },
  { feature: 'Relatórios', values: ['Básico', 'Avançado', 'PDF', 'PDF'] },
  { feature: 'Dashboard financeiro', values: [false, false, true, true] },
  { feature: 'Contratos digitais', values: [false, false, false, true] },
  { feature: 'White-label', values: [false, false, false, true] },
  { feature: 'Assinatura ICP-Brasil', values: [false, false, false, true] },
  { category: 'Suporte', feature: 'E-mail', values: [true, true, true, true] },
  { feature: 'Prioritário', values: [false, false, true, true] },
  { feature: 'VIP 24/7', values: [false, false, false, true] },
]

/* ─── Helpers ─── */
function getAnnualPrice(monthly: number): number {
  if (monthly === 0) return 0
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT_B2B) * 100) / 100
}

function formatPrice(value: number): { integer: string; cents: string } {
  if (value === 0) return { integer: '0', cents: '' }
  const integer = Math.floor(value).toString()
  const cents = Math.round((value % 1) * 100)
  return { integer, cents: cents > 0 ? `,${cents.toString().padStart(2, '0')}` : '' }
}

function getPlanIndex(slug: string): number {
  return PLANS.findIndex((p) => p.slug === slug)
}

/* ═══════════════════════════════════════════════
   Reveal on Scroll
   ═══════════════════════════════════════════════ */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.05 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-700 ease-out', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Billing Toggle
   ═══════════════════════════════════════════════ */
function BillingToggle({ isAnnual, onToggle }: { isAnnual: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative flex items-center rounded-full border border-border-light bg-bg-secondary p-1">
        <button
          onClick={() => isAnnual && onToggle()}
          className={cn(
            'relative z-10 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300',
            !isAnnual ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
          )}
        >
          Mensal
        </button>
        <button
          onClick={() => !isAnnual && onToggle()}
          className={cn(
            'relative z-10 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300',
            isAnnual ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
          )}
        >
          Anual
        </button>
        <div
          className={cn(
            'absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-400 ease-out',
            isAnnual
              ? 'translate-x-[calc(100%+4px)] bg-brand-primary/12'
              : 'translate-x-0 bg-bg-tertiary',
          )}
        />
      </div>
      {isAnnual && (
        <span className="animate-in fade-in zoom-in-90 duration-300 flex items-center gap-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 text-xs font-extrabold text-brand-primary">
          <DSIcon name="sparkles" size={12} />
          -20%
        </span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Price Display
   ═══════════════════════════════════════════════ */
function PriceDisplay({ value, isAnnual, accentColor }: { value: number; isAnnual: boolean; accentColor: string }) {
  const price = isAnnual ? getAnnualPrice(value) : value
  const { integer, cents } = formatPrice(price)
  const isFree = value === 0

  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-0.5">
        {!isFree && <span className="text-sm font-medium text-text-muted">R$</span>}
        <span className={cn(
          'font-black tracking-tighter tabular-nums transition-all duration-500',
          isFree ? 'text-3xl text-text-primary' : 'text-4xl text-text-primary',
        )}>
          {isFree ? 'Grátis' : integer}
        </span>
        {cents && <span className="text-lg font-bold text-text-primary/70 tabular-nums">{cents}</span>}
        {!isFree && <span className="ml-1 text-sm text-text-muted">/mês</span>}
      </div>
      {isAnnual && !isFree && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-text-muted line-through tabular-nums">
            R$ {(value * 12).toFixed(2).replace('.', ',')}
          </span>
          <span className={cn('text-xs font-bold tabular-nums', accentColor)}>
            R$ {(price * 12).toFixed(2).replace('.', ',')} /ano
          </span>
        </div>
      )}
      {isFree && <p className="mt-1 text-xs text-text-muted">Para sempre · Sem cartão</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Plan Card — Clean Premium
   ═══════════════════════════════════════════════ */
function PlanCard({
  plan,
  isAnnual,
  currentPlanSlug,
  onSelect,
  index,
}: {
  plan: DashboardPlan
  isAnnual: boolean
  currentPlanSlug: string
  onSelect: (slug: string) => void
  index: number
}) {
  const isCurrent = plan.slug === currentPlanSlug
  const currentIndex = getPlanIndex(currentPlanSlug)
  const planIndex = getPlanIndex(plan.slug)
  const isUpgrade = planIndex > currentIndex
  const isDowngrade = planIndex < currentIndex
  const isFree = plan.monthlyPrice === 0

  return (
    <Reveal delay={index * 80} className="flex">
      <div
        className={cn(
          'group relative flex w-full flex-col rounded-3xl transition-all duration-500',
          'bg-bg-secondary border',
          isCurrent
            ? 'border-brand-primary/40 ring-1 ring-brand-primary/20'
            : plan.popular
              ? 'border-brand-primary/20 hover:border-brand-primary/40'
              : plan.premium
                ? 'border-amber-500/15 hover:border-amber-500/30'
                : 'border-border-light hover:border-border-light/80',
          !isCurrent && 'hover:-translate-y-1',
          plan.accentGlow,
        )}
      >
        {/* Badge — Popular / Premium / Current */}
        {(plan.popular || plan.premium || isCurrent) && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            {isCurrent ? (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase whitespace-nowrap shadow-lg shadow-brand-primary/25">
                <DSIcon name="check" size={10} /> Plano Atual
              </span>
            ) : plan.popular ? (
              <span className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 px-4 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase whitespace-nowrap shadow-lg shadow-emerald-500/25">
                <DSIcon name="zap" size={10} /> Mais Popular
              </span>
            ) : plan.premium ? (
              <span className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber-500 to-amber-400 px-4 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase whitespace-nowrap shadow-lg shadow-amber-500/25">
                <DSIcon name="crown" size={10} /> Premium
              </span>
            ) : null}
          </div>
        )}

        <div className="flex flex-col flex-1 p-6">
          {/* Icon + Name */}
          <div className="flex items-center gap-3 mb-5 mt-1">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border', plan.accentBg, plan.accentBorder)}>
              <DSIcon name={plan.icon} size={20} className={plan.accentColor} />
            </div>
            <div>
              <p className="text-[9px] font-extrabold tracking-[0.2em] text-text-muted uppercase">{plan.tier}</p>
              <h3 className="text-lg font-black text-text-primary tracking-tight leading-none mt-0.5">{plan.name}</h3>
            </div>
          </div>

          {/* Price */}
          <PriceDisplay value={plan.monthlyPrice} isAnnual={isAnnual} accentColor={plan.accentColor} />

          {/* Description */}
          <p className="text-sm text-text-secondary mb-5">{plan.description}</p>

          {/* Students chip */}
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-border-light/50 bg-bg-tertiary/50 px-3.5 py-2.5">
            <DSIcon name="users" size={14} className={plan.accentColor} />
            <span className="text-sm font-bold text-text-primary">{plan.maxStudents}</span>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 flex-1 mb-6">
            {plan.features.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5">
                <div className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  f.highlight ? plan.accentBg : 'bg-brand-primary/6',
                )}>
                  <DSIcon
                    name={f.icon || 'check'}
                    size={11}
                    className={f.highlight ? plan.accentColor : 'text-brand-primary/60'}
                  />
                </div>
                <span className={cn('text-sm leading-snug', f.highlight ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-auto">
            {isCurrent ? (
              <div className={cn('rounded-2xl border px-4 py-3.5 text-center', plan.accentBorder, plan.accentBg)}>
                <span className={cn('flex items-center justify-center gap-2 text-sm font-bold', plan.accentColor)}>
                  <DSIcon name="checkCircle" size={16} /> Plano atual
                </span>
              </div>
            ) : isUpgrade ? (
              <Button variant={plan.premium ? 'gradient' : 'primary'} className="w-full" size="lg" onClick={() => onSelect(plan.slug)}>
                <DSIcon name="zap" size={16} />
                {isFree ? 'Começar grátis' : 'Fazer upgrade'}
              </Button>
            ) : isDowngrade ? (
              <Button variant="outline" className="w-full" onClick={() => onSelect(plan.slug)}>
                Alterar plano
              </Button>
            ) : isFree ? (
              <Button variant="primary" className="w-full" size="lg" onClick={() => onSelect(plan.slug)}>
                Começar grátis
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════
   Mobile Plan Carousel
   ═══════════════════════════════════════════════ */
function MobilePlanCarousel({
  plans,
  isAnnual,
  currentPlanSlug,
  onSelect,
}: {
  plans: DashboardPlan[]
  isAnnual: boolean
  currentPlanSlug: string
  onSelect: (slug: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = plans.findIndex((p) => p.slug === currentPlanSlug)
    return idx >= 0 ? idx : 1
  })

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    const cards = container.children
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => scrollToIndex(activeIndex), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = (container.children[0] as HTMLElement)?.clientWidth || 280
      const newIndex = Math.round(scrollLeft / (cardWidth + 16))
      setActiveIndex(Math.min(Math.max(newIndex, 0), plans.length - 1))
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [plans.length])

  return (
    <div className="xl:hidden">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pb-4 -mx-4"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {plans.map((plan, i) => (
          <div key={plan.slug} className="snap-center shrink-0" style={{ width: 'min(85vw, 320px)' }}>
            <PlanCard plan={plan} isAnnual={isAnnual} currentPlanSlug={currentPlanSlug} onSelect={onSelect} index={i} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        {plans.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); scrollToIndex(i) }}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              activeIndex === i ? 'w-6 bg-brand-primary' : 'w-2 bg-text-muted/25',
            )}
            aria-label={`Plano ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Comparison Table
   ═══════════════════════════════════════════════ */
function ComparisonTable({ currentPlanSlug }: { currentPlanSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const planSlugs = ['trial', 'pro', 'profissional', 'max'] as const

  return (
    <Reveal delay={200}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 rounded-2xl border px-5 py-4 text-sm font-bold transition-all duration-300',
            isOpen
              ? 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
              : 'border-border-light bg-bg-secondary text-text-primary hover:bg-bg-tertiary',
          )}
        >
          <DSIcon name="layers" size={16} className={isOpen ? 'text-brand-primary' : 'text-text-muted'} />
          {isOpen ? 'Ocultar comparação' : 'Comparar todos os recursos'}
          <DSIcon name="chevronDown" size={14} className={cn('transition-transform duration-300', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="mt-4 animate-in slide-in-from-top-3 fade-in duration-500 overflow-hidden rounded-3xl border border-border-light bg-bg-secondary">
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <table className="w-full text-sm min-w-150">
                <thead>
                  <tr className="border-b border-border-light/50">
                    <th className="sticky left-0 z-10 bg-bg-secondary px-5 py-4 text-left font-bold text-text-primary min-w-40">
                      Recurso
                    </th>
                    {PLANS.map((plan) => (
                      <th key={plan.slug} className={cn('px-3 py-4 text-center font-bold min-w-20', plan.slug === currentPlanSlug && 'bg-brand-primary/5')}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl border', plan.accentBg, plan.accentBorder)}>
                            <DSIcon name={plan.icon} size={14} className={plan.accentColor} />
                          </div>
                          <span className="text-xs font-extrabold">{plan.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, idx) => (
                    <React.Fragment key={`row-${idx}`}>
                      {row.category && (
                        <tr>
                          <td colSpan={5} className="px-5 pt-5 pb-2">
                            <span className="text-[10px] font-extrabold tracking-[0.2em] text-text-muted uppercase">{row.category}</span>
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-border-light/15 last:border-0 transition-colors hover:bg-bg-tertiary/20">
                        <td className="sticky left-0 z-10 bg-bg-secondary px-5 py-2.5 text-text-secondary font-medium text-xs">{row.feature}</td>
                        {row.values.map((val, colIdx) => (
                          <td key={colIdx} className={cn('px-3 py-2.5 text-center', planSlugs[colIdx] === currentPlanSlug && 'bg-brand-primary/5')}>
                            {typeof val === 'boolean' ? (
                              val ? (
                                <div className="flex justify-center">
                                  <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-brand-primary/10">
                                    <DSIcon name="check" size={12} className="text-brand-primary" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-text-muted/30">—</span>
                              )
                            ) : (
                              <span className="font-bold text-text-primary text-xs">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════
   FAQ Accordion
   ═══════════════════════════════════════════════ */
const FAQS = [
  { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim! Upgrade ou downgrade quando quiser. No upgrade, a diferença é cobrada proporcionalmente. No downgrade, o novo valor vale no próximo ciclo.' },
  { q: 'O que acontece com meus alunos se eu fizer downgrade?', a: 'Seus alunos não são removidos. No plano Grátis, apenas 5 ficam ativos — os demais são desativados temporariamente e reativados ao voltar para um plano pago.' },
  { q: 'Tem período de fidelidade ou multa?', a: 'Zero fidelidade. Cancele quando quiser, sem multas. No plano anual, você mantém acesso até o final do período contratado.' },
  { q: 'Quais formas de pagamento?', a: 'Pix, boleto e cartão de crédito. A cobrança é recorrente (mensal ou anual) com aviso 3 dias antes do vencimento.' },
  { q: 'O plano Grátis é realmente gratuito?', a: 'Sim, 100% gratuito e para sempre. Sem cartão de crédito, sem período de teste. Use com até 5 alunos o tempo que quiser.' },
  { q: 'O que é o white-label do plano Max?', a: 'O app aparece com sua marca: seu nome, logo e cores. Seus alunos não veem nenhuma menção ao VFIT. É como ter seu próprio aplicativo.' },
]

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <Reveal delay={300}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-text-primary tracking-tight">Perguntas frequentes</h2>
          <p className="text-sm text-text-secondary mt-1">Tudo sobre nossos planos</p>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-300',
                openIdx === i
                  ? 'border-brand-primary/15 bg-brand-primary/3'
                  : 'border-border-light/50 bg-bg-secondary/60 hover:bg-bg-secondary',
              )}
            >
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left">
                <span className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold tabular-nums transition-colors',
                  openIdx === i ? 'bg-brand-primary/12 text-brand-primary' : 'bg-bg-tertiary text-text-muted',
                )}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-sm font-bold text-text-primary">{faq.q}</span>
                <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300', openIdx === i ? 'bg-brand-primary/10 rotate-45' : 'bg-bg-tertiary')}>
                  <DSIcon name="plus" size={12} className={openIdx === i ? 'text-brand-primary' : 'text-text-muted'} />
                </div>
              </button>
              <div className={cn('overflow-hidden transition-all duration-300', openIdx === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}>
                <p className="px-5 pb-4 pl-15 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════
   Metrics Strip (Social Proof)
   ═══════════════════════════════════════════════ */
function MetricsStrip() {
  const metrics = [
    { value: '+2.500', label: 'Personais ativos', icon: 'users' as DSIconName },
    { value: '4.9 ★', label: 'Play Store', icon: 'star' as DSIconName },
    { value: '7 dias', label: 'Garantia total', icon: 'shieldCheck' as DSIconName },
    { value: '0', label: 'Fidelidade', icon: 'x' as DSIconName },
  ]

  return (
    <Reveal delay={80}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-2xl border border-border-light/50 bg-bg-secondary/60 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8">
              <DSIcon name={m.icon} size={16} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary leading-none tabular-nums">{m.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function PlansPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const router = useRouter()
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const { hasAdminCapabilities, isSimulationActive } = useEffectiveUserView()
  const isSuperAdmin = hasAdminCapabilities && !isSimulationActive
  const simulatedPlan = usePlanSimulationStore((s) => s.simulatedPlan)
  const setSimulatedPlan = usePlanSimulationStore((s) => s.setSimulatedPlan)

  const currentPlanSlug = isSuperAdmin
    ? (simulatedPlan || 'max')
    : (personalProfile?.plan_type || 'trial')

  function handleSelectPlan(slug: string) {
    if (isSuperAdmin) {
      setSimulatedPlan(slug)
      setShowSuccess(slug)
      setTimeout(() => setShowSuccess(null), 4000)
      return
    }
    router.push('/dashboard/payments')
  }

  return (
    <AuthGuard>
      <div className="w-full max-w-6xl mx-auto pb-16 space-y-8">
        {/* ─── Super Admin Simulator ─── */}
        {isSuperAdmin && showSuccess && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-400 rounded-2xl border border-brand-primary/30 bg-brand-primary/8 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/15">
              <DSIcon name="checkCircle" size={24} className="text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary">
                ✅ Plano alterado para {PLANS.find((p) => p.slug === showSuccess)?.name || showSuccess}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Simulação ativa — badge atualizado no header e sidebar.</p>
            </div>
            <button
              onClick={() => { setSimulatedPlan(null); setShowSuccess(null) }}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-text-secondary hover:bg-white/10 transition-colors"
            >
              Reset → Max
            </button>
          </div>
        )}

        {isSuperAdmin && !showSuccess && simulatedPlan && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-amber-400">
              <span className="font-bold">🔧 Simulação:</span> Visualizando como{' '}
              <span className="font-bold">{PLANS.find((p) => p.slug === simulatedPlan)?.name}</span>
            </p>
            <button onClick={() => setSimulatedPlan(null)} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Reset
            </button>
          </div>
        )}

        {/* ─── Hero ─── */}
        <section className="relative text-center pt-2">
          <div className="absolute inset-x-0 -top-10 h-60 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
          <Reveal>
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-1.5 text-xs font-bold text-brand-primary">
                <DSIcon name="sparkles" size={12} />
                Planos para cada fase do seu negócio
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
                Escolha o plano{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-emerald-400">
                  ideal
                </span>
              </h1>

              <p className="text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
                Comece grátis, escale quando quiser. Sem fidelidade, sem surpresas.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ─── Metrics ─── */}
        <MetricsStrip />

        {/* ─── Billing Toggle ─── */}
        <Reveal delay={120}>
          <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />
        </Reveal>

        {/* ─── Plan Cards — Desktop ─── */}
        <section className="hidden xl:block">
          <div className="grid grid-cols-4 gap-5 items-start">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.slug} plan={plan} isAnnual={isAnnual} currentPlanSlug={currentPlanSlug} onSelect={handleSelectPlan} index={i} />
            ))}
          </div>
        </section>

        {/* ─── Plan Cards — Mobile Carousel ─── */}
        <MobilePlanCarousel plans={PLANS} isAnnual={isAnnual} currentPlanSlug={currentPlanSlug} onSelect={handleSelectPlan} />

        {/* ─── Comparison Table ─── */}
        <ComparisonTable currentPlanSlug={currentPlanSlug} />

        {/* ─── FAQ ─── */}
        <FAQSection />

        {/* ─── Bottom CTA ─── */}
        <Reveal delay={400}>
          <div className="relative overflow-hidden rounded-3xl border border-border-light bg-bg-secondary p-8 text-center max-w-lg mx-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(16,185,129,0.04),transparent_70%)] pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/8 border border-brand-primary/10 mx-auto">
                <DSIcon name="messageCircle" size={22} className="text-brand-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary">Precisa de ajuda?</h3>
                <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
                  Nossa equipe pode ajudar você a encontrar o plano perfeito.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/messages')}>
                <DSIcon name="messageCircle" size={14} />
                Falar com suporte
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </AuthGuard>
  )
}
