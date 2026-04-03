/**
 * lib/pricing.ts
 *
 * Sprint 2 — Single source of truth para cálculos de preço.
 * Importado por frontend (src/) e backend (workers/).
 *
 * B2B = PLANS (personal trainers: trial, pro, profissional, max)
 * B2C = VFIT_PLANS (alunos: free, premium, premium_annual)
 */

import { PLANS, VFIT_PLANS, type PlanSlug, type VfitPlanSlug } from '@config/constants'

// ============================================
// Constants
// ============================================
export const ANNUAL_DISCOUNT_B2B = 0.20 // 20% off para planos anuais B2B

// ============================================
// B2B (Personal Trainer Plans)
// ============================================
export function getB2BMonthlyPrice(slug: PlanSlug): number {
  return PLANS[slug]?.price_brl ?? 0
}

export function getB2BAnnualPrice(slug: PlanSlug): number {
  const monthly = getB2BMonthlyPrice(slug)
  if (monthly === 0) return 0
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT_B2B) * 100) / 100
}

export function getB2BAnnualMonthly(slug: PlanSlug): number {
  const annual = getB2BAnnualPrice(slug)
  if (annual === 0) return 0
  return Math.round((annual / 12) * 100) / 100
}

export function getB2BPrices(slug: PlanSlug): { monthly: number; annual: number } {
  return {
    monthly: getB2BMonthlyPrice(slug),
    annual: getB2BAnnualPrice(slug),
  }
}

// ============================================
// B2C (Student/Aluno Plans)
// ============================================
export function getB2CPrice(slug: VfitPlanSlug): number {
  return VFIT_PLANS[slug]?.price_brl ?? 0
}

export function getB2CMonthlyEquivalent(slug: VfitPlanSlug): number {
  const plan = VFIT_PLANS[slug]
  if (!plan) return 0
  if (plan.duration_days === 365) return Math.round((plan.price_brl / 12) * 100) / 100
  return plan.price_brl
}

export function getB2CAnnualSavingsPercent(): number {
  const monthlyTotal = VFIT_PLANS.premium.price_brl * 12
  const annualPrice = VFIT_PLANS.premium_annual.price_brl
  if (monthlyTotal === 0) return 0
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100)
}

// ============================================
// Formatting
// ============================================
export function formatBRL(value: number): string {
  if (value === 0) return 'Grátis'
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export function formatBRLParts(value: number): { integer: string; cents: string } {
  if (value === 0) return { integer: '0', cents: '' }
  const integer = Math.floor(value).toString()
  const cents = Math.round((value % 1) * 100)
  return {
    integer,
    cents: cents > 0 ? `,${cents.toString().padStart(2, '0')}` : '',
  }
}
