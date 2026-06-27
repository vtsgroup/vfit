// ============================================
// pricing-content.tsx — Preços com switch Alunos | Profissionais (tema CLARO)
// ============================================
//
// O que faz:
//   Client island da /pricing. Segmented control Alunos|Profissionais.
//   ALUNOS: 30 dias grátis sem cartão → toggle Mensal/Anual (Premium R$19,90 /
//   Anual R$149,90 −37%) + formas de pagamento. PROFISSIONAIS: sem mensalidade,
//   só taxas da plataforma + vantagens de cobrança/gestão. FAQ claro embaixo.
//   Reusa o kit light-section. page.tsx permanece RSC (metadata + JSON-LD).
//
// Exports principais:
//   PricingContent — switch + planos + pagamento + FAQ (client)
'use client'

import { useState, type CSSProperties } from 'react'
import { VFIT_PLANS } from '@config/constants'
import { FAQ_PRICING } from '@/data/faqs'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import {
  SectionHead, FeatureCard, CheckItem, HoverEdge, PillArrow,
  lightCard, greenChip, monoLabel, headingFont, pillPrimaryClass, pillGhostClass,
} from '@/components/shared/light-section'

const brl = (v: number) => v.toFixed(2).replace('.', ',')
const greenGrad: CSSProperties = { background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)', boxShadow: '0 8px 18px -6px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45)' }

const PREMIUM = VFIT_PLANS.premium.price_brl       // 19.90
const ANNUAL = VFIT_PLANS.premium_annual.price_brl  // 149.90
const ANNUAL_MONTHLY = Math.round((ANNUAL / 12) * 100) / 100
const SAVINGS = Math.round((1 - ANNUAL / (PREMIUM * 12)) * 100)

const PAYMENTS: { icon: DSIconName; label: string }[] = [
  { icon: 'qrCode2', label: 'Pix' },
  { icon: 'creditCard', label: 'Cartão' },
  { icon: 'receipt', label: 'Boleto' },
]

const PRO_ADVANTAGES: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'dollarSign', title: 'Cobrança automática', desc: 'Recorrência e régua de lembretes para reduzir inadimplência sem esforço.' },
  { icon: 'slidersHorizontal', title: 'Controle total da cobrança', desc: 'Status de assinatura, confirmação por webhook e bloqueio sem pagamento.' },
  { icon: 'layoutDashboard', title: 'Gestão de alunos', desc: 'Rotina, treinos e progresso de todos os alunos num painel só.' },
  { icon: 'userPlus', title: 'Monetização por aluno', desc: 'Receita via planos e cobranças dos seus alunos direto na plataforma.' },
  { icon: 'briefcase', title: 'Consultoria paga', desc: 'Ofertas e entregas premium pagas dentro da API do VFIT.' },
  { icon: 'database', title: 'Financeiro auditável', desc: 'Ledger append-only, conciliação com gateway e controle de repasse.' },
]

/* ─── Switch de público ─── */
function AudienceSwitch({ value, onChange }: { value: 'alunos' | 'pros'; onChange: (v: 'alunos' | 'pros') => void }) {
  const opts: { key: 'alunos' | 'pros'; label: string; icon: DSIconName }[] = [
    { key: 'alunos', label: 'Alunos', icon: 'user' },
    { key: 'pros', label: 'Profissionais', icon: 'briefcase' },
  ]
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]">
        {opts.map((o) => {
          const active = value === o.key
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${active ? 'text-[#08122B]' : 'text-slate-500 hover:text-emerald-700'}`}
              style={active ? greenGrad : undefined}
            >
              <DSIcon name={o.icon} size={15} /> {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Toggle Mensal/Anual ─── */
function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]">
        <button type="button" onClick={() => onChange(false)} aria-pressed={!annual} className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${!annual ? 'text-[#08122B]' : 'text-slate-500 hover:text-emerald-700'}`} style={!annual ? greenGrad : undefined}>Mensal</button>
        <button type="button" onClick={() => onChange(true)} aria-pressed={annual} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${annual ? 'text-[#08122B]' : 'text-slate-500 hover:text-emerald-700'}`} style={annual ? greenGrad : undefined}>
          Anual
          <span className={annual ? 'text-[#08122B]/70' : 'text-emerald-600'}>−{SAVINGS}%</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Painel ALUNOS ─── */
function AlunosPanel() {
  const [annual, setAnnual] = useState(true)
  return (
    <div className="space-y-10">
      {/* Trial banner */}
      <div className="relative mx-auto flex max-w-xl items-center justify-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 text-center" style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.10), rgba(34,197,94,0.03))', border: '1px solid rgba(34,197,94,0.3)' }}>
        <DSIcon name="gift" size={16} className="text-brand-primary" />
        <span className="text-[13px] font-semibold text-emerald-700">30 dias grátis · sem cartão de crédito · cancele quando quiser</span>
      </div>

      <BillingToggle annual={annual} onChange={setAnnual} />

      {/* Plan cards */}
      <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
        {/* Grátis */}
        <div className="group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
          <HoverEdge rounded="rounded-3xl" />
          <span className="relative text-[11px] uppercase tracking-wider text-slate-400" style={monoLabel}>Grátis</span>
          <h3 className="relative mt-1 font-syne text-2xl font-black text-gray-950">{VFIT_PLANS.free.name}</h3>
          <div className="relative mt-4 flex items-baseline gap-1">
            <span className="font-syne text-4xl font-black text-gray-950">R$ 0</span>
            <span className="text-sm text-slate-400">/sempre</span>
          </div>
          <p className="relative mt-3 text-sm leading-relaxed text-slate-500">Pra começar a treinar com IA, sem custo.</p>
          <ul className="relative mt-6 flex-1 space-y-2.5">{VFIT_PLANS.free.features.map((f) => <CheckItem key={f}>{f}</CheckItem>)}</ul>
          <TrackedCtaLink href="/register" cta="Começar grátis" placement="pricing_alunos_free" pageSegment="home" event="lp_register_start" className={`relative mt-7 justify-center ${pillGhostClass}`}>Começar grátis</TrackedCtaLink>
        </div>

        {/* Premium — featured */}
        <div
          className="group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
          style={{ background: 'linear-gradient(180deg, #ffffff 0%, #effaf2 100%)', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 28px 60px -24px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.95)' }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(34,197,94,0.75) 0%, rgba(132,204,22,0.45) 50%, rgba(34,197,94,0.55) 100%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
          <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] uppercase text-[#08122B]" style={{ ...monoLabel, ...greenGrad }}><DSIcon name="sparkles" size={10} /> Mais popular</span>

          <span className="relative text-[11px] uppercase tracking-wider text-emerald-600/80" style={monoLabel}>Premium</span>
          <h3 className="relative mt-1 font-syne text-2xl font-black text-gray-950">{VFIT_PLANS.premium.name}</h3>

          <div className="relative mt-4 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-400">R$</span>
            <span className="font-syne text-5xl font-black leading-none tracking-tight tabular-nums bg-linear-to-b from-gray-900 to-emerald-600 bg-clip-text text-transparent">{annual ? brl(ANNUAL_MONTHLY) : brl(PREMIUM)}</span>
            <span className="text-sm text-slate-400">/mês</span>
          </div>
          <p className="relative mt-1 text-xs font-medium text-emerald-600">
            {annual ? `Cobrado R$ ${brl(ANNUAL)}/ano · economize ${SAVINGS}%` : '30 dias grátis, depois R$ 19,90/mês'}
          </p>

          <ul className="relative mt-6 flex-1 space-y-2.5">{VFIT_PLANS.premium.features.map((f) => <CheckItem key={f}>{f}</CheckItem>)}</ul>
          <TrackedCtaLink href="/register" cta="Testar 30 dias grátis" placement="pricing_alunos_premium" pageSegment="home" event="lp_register_start" className={`relative mt-7 justify-center ${pillPrimaryClass}`}>Testar 30 dias grátis <PillArrow /></TrackedCtaLink>
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider text-slate-400" style={monoLabel}>Pague como preferir</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PAYMENTS.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-primary" style={greenChip}><DSIcon name={p.icon} size={15} /></span>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Painel PROFISSIONAIS ─── */
function ProsPanel() {
  return (
    <div className="space-y-10">
      {/* Sem mensalidade — destaque */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-center sm:p-10" style={lightCard}>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name="wallet" size={22} /></span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-syne text-5xl font-black leading-none tracking-tight bg-linear-to-b from-gray-900 to-emerald-600 bg-clip-text text-transparent">R$ 0</span>
          <span className="text-sm text-slate-400" style={monoLabel}>MENSALIDADE</span>
        </div>
        <h3 className="mt-4 font-black tracking-tight text-gray-950" style={{ ...headingFont, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
          Você só paga as <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">taxas da plataforma</span>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Sem assinatura de creator. Sua receita vem dos alunos e consultorias — a plataforma cobra só a taxa por transação.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <TrackedCtaLink href="/register/personal" cta="Começar grátis pro" placement="pricing_pros_main" pageSegment="personal" event="lp_register_start" className={pillPrimaryClass}>Começar grátis <PillArrow /></TrackedCtaLink>
          <TrackedCtaLink href="/app-personal-trainer" cta="Ver app personal" placement="pricing_pros_main" pageSegment="personal" event="lp_cta_secondary_click" className={pillGhostClass}>Conhecer a plataforma</TrackedCtaLink>
        </div>
      </div>

      {/* Vantagens */}
      <div>
        <SectionHead icon="sparkles" eyebrow="/VANTAGENS" lead="Tudo pra você" accent="cobrar e escalar" sub="Operação, cobrança e financeiro num fluxo só — sem mensalidade." center />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRO_ADVANTAGES.map((a) => (
            <FeatureCard key={a.title} icon={a.icon} title={a.title}>{a.desc}</FeatureCard>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── FAQ claro ─── */
const FAQ_ICONS: DSIconName[] = ['creditCard', 'gift', 'percent', 'shield', 'refresh', 'helpCircle']

function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.6fr] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHead icon="helpCircle" eyebrow="/FAQ" lead="Dúvidas sobre" accent="planos" sub="Tudo sobre trial, cobrança e cancelamento." />
      </div>
      <div>
        {FAQ_PRICING.map((item, i) => {
          const isOpen = open === i
          return (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${i > 0 ? 'mt-2.5' : ''} ${isOpen ? '' : 'hover:-translate-y-0.5'}`}
              style={isOpen
                ? { background: 'linear-gradient(180deg, #ffffff 0%, #effaf2 100%)', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 54px -24px rgba(34,197,94,0.38), inset 0 1px 0 rgba(255,255,255,0.95)' }
                : { background: 'linear-gradient(180deg, #ffffff 0%, #f4f6fa 100%)', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
            >
              <span aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ padding: '1px', background: isOpen ? 'linear-gradient(135deg, rgba(34,197,94,0.75) 0%, rgba(132,204,22,0.45) 50%, rgba(34,197,94,0.55) 100%)' : 'linear-gradient(135deg, rgba(34,197,94,0.45) 0%, rgba(132,204,22,0.18) 45%, transparent 75%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="relative flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset sm:gap-4 sm:px-5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${isOpen ? 'text-[#08122B]' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-emerald-600'}`} style={isOpen ? { ...monoLabel, ...greenGrad } : monoLabel}>{String(i + 1).padStart(2, '0')}</span>
                <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:flex ${isOpen ? 'bg-brand-primary/12 text-brand-primary ring-1 ring-brand-primary/25' : 'bg-slate-100 text-slate-400'}`}><DSIcon name={FAQ_ICONS[i % FAQ_ICONS.length]} size={16} /></span>
                <span className={`flex-1 pr-2 text-sm font-semibold tracking-tight transition-colors duration-200 sm:text-[15px] ${isOpen ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`} style={{ fontFamily: headingFont.fontFamily }}>{item.question}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 text-[#08122B]' : 'border border-slate-300 text-slate-400 group-hover:border-brand-primary/50 group-hover:text-emerald-600'}`} style={isOpen ? greenGrad : undefined}><DSIcon name="plus" size={14} /></span>
              </button>
              <div role="region" className="relative grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <p className={`pb-5 pl-13 pr-5 text-sm leading-relaxed text-slate-600 transition-opacity duration-300 sm:pl-[4.25rem] ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Export principal ─── */
export function PricingContent() {
  const [audience, setAudience] = useState<'alunos' | 'pros'>('alunos')
  return (
    <div className="space-y-14 sm:space-y-16">
      <AudienceSwitch value={audience} onChange={setAudience} />
      {audience === 'alunos' ? <AlunosPanel /> : <ProsPanel />}
      <div className="border-t border-slate-200/70 pt-14 sm:pt-16">
        <PricingFaq />
      </div>
    </div>
  )
}
