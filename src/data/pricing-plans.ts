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
    tier: 'BASE',
    name: 'Creator Free',
    monthlyPrice: 0,
    description: 'Conta profissional sem assinatura obrigatoria para operar no VFIT.',
    features: [
      { text: 'Conta profissional ativa', included: true },
      { text: 'Gestao de alunos e rotina', included: true },
      { text: 'Dashboard e operacao diaria', included: true },
      { text: 'App PWA completo', included: true },
      { text: 'Sem mensalidade de creator', included: true },
      { text: 'Suporte por e-mail', included: true },
    ],
    cta: 'Comecar agora',
    href: '/register',
  },
  {
    slug: 'pro',
    tier: 'ALUNOS',
    name: 'Monetizacao por Aluno',
    monthlyPrice: 0,
    description: 'Receita principal via planos e cobrancas dos alunos na plataforma.',
    features: [
      { text: 'Planos do aluno (B2C)', included: true },
      { text: 'Checkout e webhook de pagamentos', included: true },
      { text: 'Controle de status de assinatura', included: true },
      { text: 'Notificacoes e automacoes', included: true },
      { text: 'Eventos de cobranca auditaveis', included: true },
      { text: 'Sem taxa fixa mensal de creator', included: true },
    ],
    cta: 'Ativar modelo aluno',
    href: '/register',
    popular: true,
    badge: 'MODELO ATUAL',
  },
  {
    slug: 'pro-plus',
    tier: 'CONSULTORIA',
    name: 'Consultoria Paga',
    monthlyPrice: 0,
    description: 'Consultorias oficiais com pagamento dentro da API do VFIT.',
    features: [
      { text: 'Oferta e order de consultoria', included: true },
      { text: 'Bloqueio sem pagamento confirmado', included: true },
      { text: 'Entrega premium dentro do VFIT', included: true },
      { text: 'Historico transacional da consultoria', included: true },
      { text: 'Compliance de exclusividade', included: true },
      { text: 'Sem assinatura de creator', included: true },
    ],
    cta: 'Usar consultoria API',
    href: '/register',
  },
  {
    slug: 'max',
    tier: 'LEDGER',
    name: 'Financeiro Escalavel',
    monthlyPrice: 0,
    description: 'Controle de fee, repasse e conciliacao como base para crescimento.',
    features: [
      { text: 'Ledger financeiro append-only', included: true },
      { text: 'Eventos padronizados por transacao', included: true },
      { text: 'Conciliacao com gateway', included: true },
      { text: 'Bloqueio de payout em inconsistencias', included: true },
      { text: 'Auditabilidade ponta a ponta', included: true },
      { text: 'Pronto para escala operacional', included: true },
    ],
    cta: 'Ver arquitetura financeira',
    href: '/register',
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
  { feature: 'Assinatura obrigatoria de creator', gratis: false, pro: false, proPlus: false, max: false },
  { feature: 'Monetizacao por aluno', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Consultoria paga dentro da API', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'Bloqueio de entrega sem pagamento', gratis: false, pro: false, proPlus: true, max: true },
  { feature: 'Gestao de cobranca do aluno', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Webhook + confirmacao automatica', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Eventos financeiros auditaveis', gratis: false, pro: true, proPlus: true, max: true },
  { feature: 'Ledger append-only', gratis: false, pro: false, proPlus: false, max: true },
  { feature: 'Conciliacao e controle de payout', gratis: false, pro: false, proPlus: false, max: true },
]
