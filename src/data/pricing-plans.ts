// ============================================
// pricing-plans.ts — Dados centralizados dos planos de assinatura
// ============================================
//
// O que faz:
//   Define os planos de preços (trial, pro, max) com features, preços e limites.
//   Tabela de comparação de features entre planos.
//   Funções de formatação e cálculo de desconto anual.
//
// Exports principais:
//   PricingPlan, PlanFeature, ComparisonRow — tipos de dados
//   PRICING_PLANS — array dos planos (trial, pro, max)
//   COMPARISON_TABLE — linhas de comparação para PricingTable
//   getAnnualPrice(plan) → number — preço anual com desconto
//   formatPriceInteger(n) → string — parte inteira do preço
//   formatPriceCents(n) → string — centavos do preço
import { PLANS } from '@config/constants'
import { ANNUAL_DISCOUNT_B2B } from '@lib/pricing'

/* ─── Pricing Plans — Dados Centralizados ─── */

export interface PlanFeature {
  text: string
  included: boolean
}

export interface PricingPlan {
  slug: string
  tier: string
  name: string
  monthlyPrice: number
  description: string
  features: PlanFeature[]
  cta: string
  href: string
  popular?: boolean
  badge?: string
}

/* Desconto anual — via ANNUAL_DISCOUNT_B2B (single source of truth) */
export function getAnnualPrice(monthly: number): number {
  if (monthly === 0) return 0
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT_B2B) * 100) / 100
}

export function formatPrice(value: number): string {
  if (value === 0) return '0'
  return value.toFixed(2).replace('.', ',')
}

export function formatPriceInteger(value: number): string {
  if (value === 0) return '0'
  return Math.floor(value).toString()
}

export function formatPriceCents(value: number): string {
  if (value === 0) return ''
  const cents = Math.round((value % 1) * 100)
  return cents > 0 ? `,${cents.toString().padStart(2, '0')}` : ''
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    slug: 'essencial',
    tier: 'GRÁTIS',
    name: 'Grátis',
    monthlyPrice: PLANS.trial.price_brl,
    description: 'Para quem está começando. Tudo que você precisa para gerenciar seus primeiros alunos.',
    features: [
      { text: '5 alunos ativos', included: true },
      { text: 'Gamificação (XP, streaks)', included: true },
      { text: 'Cobrança Pix/boleto', included: true },
      { text: 'Taxa configurável', included: true },
      { text: 'App PWA completo', included: true },
      { text: 'Suporte por e-mail', included: true },
    ],
    cta: 'Começar grátis',
    href: '/register',
  },
  {
    slug: 'pro',
    tier: 'PRO',
    name: 'Pro',
    monthlyPrice: PLANS.pro.price_brl,
    description: 'Para personal trainers que querem escalar. Alunos ilimitados e automação completa.',
    features: [
      { text: 'Alunos ilimitados', included: true },
      { text: 'Recorrência automática (Pix Automático)', included: true },
      { text: 'Gamificação completa (badges, ranking)', included: true },
      { text: 'Notificações e-mail + WhatsApp', included: true },
      { text: 'E-mail @iapersonal.app.br incluso', included: true },
      { text: 'Relatórios avançados', included: true },
    ],
    cta: 'Começar agora',
    href: '/register?plan=trainer',
    popular: true,
    badge: 'MAIS POPULAR',
  },
  {
    slug: 'pro-plus',
    tier: 'PRO+',
    name: 'Pro+',
    monthlyPrice: PLANS.profissional.price_brl,
    description: 'Para quem quer profissionalizar. Contratos, invoices e NFs em um único app.',
    features: [
      { text: 'Tudo do Pro +', included: true },
      { text: 'Contratos digitais com modelos prontos', included: true },
      { text: 'Invoices profissionais com seu logo', included: true },
      { text: 'Papel timbrado digital', included: true },
      { text: '30 NFs/mês incluídas', included: true },
      { text: 'Agendamento automático', included: true },
      { text: 'Topo do marketplace + Selo Verificado', included: true },
    ],
    cta: 'Assinar agora',
    href: '/register?plan=profissional',
  },
  {
    slug: 'max',
    tier: 'MAX',
    name: 'Max',
    monthlyPrice: PLANS.max.price_brl,
    description: 'Experiência premium completa. Sua marca, seu domínio, zero menção ao VFIT.',
    features: [
      { text: 'Tudo do Pro+ +', included: true },
      { text: 'E-mail com domínio próprio', included: true },
      { text: 'App white-label (nome + logo)', included: true },
      { text: 'Assinatura digital ICP-Brasil', included: true },
      { text: 'Zero menção ao VFIT', included: true },
      { text: 'Suporte VIP 24/7', included: true },
    ],
    cta: 'Falar com vendas',
    href: '/register?plan=max',
  },
]

/* ─── Feature Comparison Table ─── */
export interface ComparisonRow {
  feature: string
  gratis: string | boolean
  pro: string | boolean
  proPlus: string | boolean
  max: string | boolean
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  { feature: 'Alunos ativos', gratis: '5', pro: 'Ilimitados', proPlus: 'Ilimitados', max: 'Ilimitados' },
  { feature: 'Gamificação (XP, streaks, badges)', gratis: true, pro: true, proPlus: true, max: true },
  { feature: 'Cobrança Pix/boleto', gratis: true, pro: true, proPlus: true, max: true },
  { feature: 'Recorrência automática', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Notificações WhatsApp', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'E-mail @iapersonal.app.br', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Relatórios avançados', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Contratos digitais', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'Invoices com seu logo', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'Notas fiscais (NFs)', gratis: false, pro: false, proPlus: '30/mês', max: 'Ilimitadas' },
  { feature: 'Agendamento automático', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'Selo Verificado + Marketplace', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'White-label (app + domínio)', gratis: false, pro: false, proPlus: false, max: true },
  { feature: 'Assinatura digital ICP-Brasil', gratis: false, pro: false, proPlus: false, max: true },
  { feature: 'Suporte VIP 24/7', gratis: false, pro: false, proPlus: false, max: true },
]
