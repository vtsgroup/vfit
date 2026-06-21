/**
 * lib/entitlements.ts
 *
 * Fonte ÚNICA de verdade de "o que este usuário pode fazer".
 * Compartilhado entre worker (backend gating) e frontend (UI gating).
 * Plano VFIT ULTRA — doc 02 (Trial 30d sem cartão).
 *
 * Pure functions, sem I/O. Testável e sem risco de runtime.
 */

export type Plan = 'free' | 'trial' | 'pro' | 'profissional' | 'max'
export type LifecycleStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'expired'
  | 'canceled'
  | 'free'

/** Duração padrão do trial sem cartão (dias). */
export const TRIAL_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

export interface EntitlementInput {
  plan_type?: Plan | string | null
  plan_expires_at?: string | null
  trial_ends_at?: string | null
  subscription_status?: string | null
  lifecycle_status?: LifecycleStatus | string | null
  /** epoch ms; default Date.now() */
  now?: number
}

export interface Entitlements {
  plan: Plan
  isTrialing: boolean
  trialDaysLeft: number
  isPaid: boolean
  /** true durante o trial OU com plano pago ativo */
  canAccessPremium: boolean
}

const PAID_PLANS: ReadonlySet<string> = new Set(['pro', 'profissional', 'max'])

function daysLeft(iso: string | null | undefined, now: number): number {
  if (!iso) return 0
  const end = Date.parse(iso)
  if (Number.isNaN(end)) return 0
  return Math.max(0, Math.ceil((end - now) / MS_PER_DAY))
}

/**
 * Resolve os entitlements efetivos a partir do que se sabe do usuário/assinatura.
 * Conservador: na dúvida, NÃO concede premium (fail-closed), exceto trial ativo.
 */
export function resolveEntitlements(input: EntitlementInput = {}): Entitlements {
  const now = input.now ?? Date.now()
  const rawPlan = String(input.plan_type ?? 'free').toLowerCase()
  const status = String(
    input.lifecycle_status ?? input.subscription_status ?? '',
  ).toLowerCase()

  // Janela de trial: trial_ends_at no futuro OU plano 'trial' com expiração futura.
  const trialEndsLeft = daysLeft(input.trial_ends_at, now)
  const planExpiresLeft = daysLeft(input.plan_expires_at, now)
  const isTrialing =
    status === 'trialing' ||
    trialEndsLeft > 0 ||
    (rawPlan === 'trial' && planExpiresLeft > 0)

  const isPaidPlan = PAID_PLANS.has(rawPlan)
  const paidActive =
    isPaidPlan &&
    status !== 'expired' &&
    status !== 'canceled' &&
    (input.plan_expires_at == null || planExpiresLeft > 0)

  const trialDaysLeft = trialEndsLeft > 0 ? trialEndsLeft : (rawPlan === 'trial' ? planExpiresLeft : 0)

  let plan: Plan = 'free'
  if (paidActive) plan = (rawPlan as Plan)
  else if (isTrialing) plan = 'trial'

  return {
    plan,
    isTrialing: isTrialing && !paidActive,
    trialDaysLeft,
    isPaid: paidActive,
    canAccessPremium: paidActive || isTrialing,
  }
}
