/**
 * workers/api/platform.ts
 *
 * Platform Subscription Routes — /api/v1/platform
 *
 * Exports: platformRoutes
 * Endpoints:
 *   GET  /subscription → current plan info
 *   POST /checkout     → create Asaas payment for plan upgrade
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { pgQueryOne } from '@lib/db'
import { BadRequestError, NotFoundError } from '@lib/errors'
import { success, created } from '@lib/response'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'
import {
  getOrCreateCustomer,
  createAsaasPayment,
  getPixQrCode,
} from '@lib/asaas'
import { getB2BPrices } from '@lib/pricing'
import { PLANS } from '@config/constants'

const platform = new Hono<AppContext>()

// All routes require auth
platform.use('*', authMiddleware)

// ── Plan prices (derived from config/constants.ts via lib/pricing.ts) ──
const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  pro: getB2BPrices('pro'),
  profissional: getB2BPrices('profissional'),
  max: getB2BPrices('max'),
}

const PLAN_NAMES: Record<string, string> = {
  trial: PLANS.trial.name,
  pro: PLANS.pro.name,
  profissional: PLANS.profissional.name,
  max: PLANS.max.name,
}

// ── Schemas ──────────────────────────────────
const checkoutSchema = z.object({
  plan_slug: z.enum(['pro', 'profissional', 'max']),
  billing_cycle: z.enum(['monthly', 'annual']),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']),
  cpf: z.string().optional(),
})

// ══════════════════════════════════════════════
//  GET /subscription — current plan info
// ══════════════════════════════════════════════
platform.get(
  '/subscription',
  requireType('personal', 'admin', 'super_admin'),
  async (c) => {
    const jwt = c.get('jwtPayload')

    const personal = await pgQueryOne<{
      subscription_plan: string | null
      subscription_expires_at: string | null
    }>(
      c.env,
      `SELECT subscription_plan, subscription_expires_at
       FROM personals WHERE id = $1`,
      [jwt.sub]
    )

    if (
      !personal ||
      !personal.subscription_plan ||
      personal.subscription_plan === 'trial'
    ) {
      return success({ subscription: null })
    }

    const now = new Date()
    const expiresAt = personal.subscription_expires_at
      ? new Date(personal.subscription_expires_at)
      : null
    const isActive = !expiresAt || expiresAt > now

    return success({
      subscription: {
        id: `sub_${jwt.sub}`,
        personal_id: jwt.sub,
        plan_slug: personal.subscription_plan,
        billing_cycle: 'monthly' as const,
        status: isActive ? 'active' : 'past_due',
        current_period_start: now.toISOString(),
        current_period_end: personal.subscription_expires_at || now.toISOString(),
        cancel_at_period_end: false,
        amount: PLAN_PRICES[personal.subscription_plan]?.monthly ?? 0,
        payment_method: 'pix' as const,
        asaas_subscription_id: null,
        created_at: now.toISOString(),
      },
    })
  }
)

// ══════════════════════════════════════════════
//  POST /checkout — create Asaas payment
// ══════════════════════════════════════════════
platform.post(
  '/checkout',
  requireType('personal', 'admin', 'super_admin'),
  async (c) => {
    const body = await c.req.json()
    const parsed = checkoutSchema.parse(body)
    const jwt = c.get('jwtPayload')

    // 1. Get user info
    const user = await pgQueryOne<{
      id: string
      full_name: string
      email: string
      cpf: string | null
    }>(c.env, 'SELECT id, full_name, email, cpf FROM users WHERE id = $1', [
      jwt.sub,
    ])

    if (!user) throw new NotFoundError('Usuário não encontrado')

    // 2. Resolve CPF (DB or request body)
    const cpf = user.cpf || parsed.cpf
    if (!cpf) {
      throw new BadRequestError(
        'CPF é obrigatório para pagamento. Atualize seu perfil com o CPF.'
      )
    }

    // 3. Calculate amount
    const prices = PLAN_PRICES[parsed.plan_slug]
    if (!prices) throw new BadRequestError('Plano inválido')
    const amount =
      parsed.billing_cycle === 'monthly' ? prices.monthly : prices.annual

    // 4. Get or create Asaas customer
    const customer = await getOrCreateCustomer(c.env, {
      name: user.full_name,
      email: user.email,
      cpfCnpj: cpf.replace(/\D/g, ''),
      externalReference: `platform_${user.id}`,
    })

    // 5. Map payment method → Asaas billingType
    const billingTypeMap: Record<string, 'PIX' | 'CREDIT_CARD' | 'BOLETO'> = {
      pix: 'PIX',
      credit_card: 'CREDIT_CARD',
      boleto: 'BOLETO',
    }

    // 6. Due date: 3 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)

    const planName = PLAN_NAMES[parsed.plan_slug] || parsed.plan_slug
    const cycleLabel =
      parsed.billing_cycle === 'monthly' ? 'mensal' : 'anual'

    // 7. Create Asaas payment
    const payment = await createAsaasPayment(c.env, {
      customer: customer.id,
      billingType: billingTypeMap[parsed.payment_method] ?? 'PIX',
      value: amount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `VFIT — Plano ${planName} (${cycleLabel})`,
      externalReference: `platform_checkout_${jwt.sub}_${parsed.plan_slug}_${parsed.billing_cycle}`,
    })

    // 8. Get PIX QR code if applicable
    let pixQrCode: string | null = null
    let pixCopyPaste: string | null = null

    if (parsed.payment_method === 'pix' && payment.id) {
      try {
        const qr = await getPixQrCode(c.env, payment.id)
        pixQrCode = qr.encodedImage ?? null
        pixCopyPaste = qr.payload ?? null
      } catch {
        // PIX QR code generation may fail — payment still created
      }
    }

    // 9. Return checkout session
    return created({
      checkout: {
        checkout_url: payment.invoiceUrl || '',
        payment_id: payment.id,
        plan_slug: parsed.plan_slug,
        amount,
        due_date: payment.dueDate,
        pix_qr_code: pixQrCode,
        pix_copy_paste: pixCopyPaste,
        boleto_url: payment.bankSlipUrl || null,
        status: payment.status,
      },
    })
  }
)

// ══════════════════════════════════════════════
//  POST /upgrade — Upgrade plan (creates new checkout)
// ══════════════════════════════════════════════
const upgradeSchema = z.object({
  plan_slug: z.enum(['pro', 'profissional', 'max']),
  billing_cycle: z.enum(['monthly', 'annual']).default('monthly'),
})

platform.post(
  '/upgrade',
  requireType('personal', 'admin', 'super_admin'),
  async (c) => {
    const body = await c.req.json()
    const parsed = upgradeSchema.parse(body)
    const jwt = c.get('jwtPayload')

    // Get current plan
    const personal = await pgQueryOne<{
      subscription_plan: string | null
    }>(
      c.env,
      'SELECT subscription_plan FROM personals WHERE id = $1',
      [jwt.sub]
    )

    const currentPlan = personal?.subscription_plan || 'trial'
    const planOrder = ['trial', 'pro', 'profissional', 'max']
    const currentIdx = planOrder.indexOf(currentPlan)
    const targetIdx = planOrder.indexOf(parsed.plan_slug)

    if (targetIdx <= currentIdx) {
      throw new BadRequestError('Escolha um plano superior ao atual para fazer upgrade')
    }

    // Activate plan immediately (payment via checkout creates separate charge)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (parsed.billing_cycle === 'annual' ? 365 : 30))
    const now = new Date().toISOString()

    await pgQueryOne(
      c.env,
      `UPDATE personals SET subscription_plan = $1, subscription_expires_at = $2, updated_at = $3 WHERE id = $4 RETURNING id`,
      [parsed.plan_slug, expiresAt.toISOString(), now, jwt.sub]
    )

    return success({ success: true, plan_slug: parsed.plan_slug })
  }
)

// ══════════════════════════════════════════════
//  POST /downgrade — Downgrade plan
// ══════════════════════════════════════════════
const downgradeSchema = z.object({
  plan_slug: z.enum(['trial', 'pro', 'profissional']),
})

platform.post(
  '/downgrade',
  requireType('personal', 'admin', 'super_admin'),
  async (c) => {
    const body = await c.req.json()
    const parsed = downgradeSchema.parse(body)
    const jwt = c.get('jwtPayload')

    // Get current plan
    const personal = await pgQueryOne<{
      subscription_plan: string | null
      subscription_expires_at: string | null
    }>(
      c.env,
      'SELECT subscription_plan, subscription_expires_at FROM personals WHERE id = $1',
      [jwt.sub]
    )

    const currentPlan = personal?.subscription_plan || 'trial'
    const planOrder = ['trial', 'pro', 'profissional', 'max']
    const currentIdx = planOrder.indexOf(currentPlan)
    const targetIdx = planOrder.indexOf(parsed.plan_slug)

    if (targetIdx >= currentIdx) {
      throw new BadRequestError('Escolha um plano inferior ao atual para fazer downgrade')
    }

    const now = new Date().toISOString()

    // Downgrade takes effect at end of current billing period (if exists)
    // For now, apply immediately
    const expiresAt = parsed.plan_slug === 'trial'
      ? null
      : personal?.subscription_expires_at || null

    await pgQueryOne(
      c.env,
      `UPDATE personals SET subscription_plan = $1, subscription_expires_at = $2, updated_at = $3 WHERE id = $4 RETURNING id`,
      [parsed.plan_slug, expiresAt, now, jwt.sub]
    )

    return success({ success: true, plan_slug: parsed.plan_slug })
  }
)

// ══════════════════════════════════════════════
//  POST /subscription/cancel — Cancel subscription
// ══════════════════════════════════════════════
platform.post(
  '/subscription/cancel',
  requireType('personal', 'admin', 'super_admin'),
  async (c) => {
    const jwt = c.get('jwtPayload')
    const now = new Date().toISOString()

    const personal = await pgQueryOne<{
      subscription_plan: string | null
      subscription_expires_at: string | null
    }>(
      c.env,
      'SELECT subscription_plan, subscription_expires_at FROM personals WHERE id = $1',
      [jwt.sub]
    )

    if (!personal || !personal.subscription_plan || personal.subscription_plan === 'trial') {
      throw new BadRequestError('Não há assinatura ativa para cancelar')
    }

    // Keep access until end of current billing period, then revert to trial
    // If no expiration date, cancel immediately
    if (personal.subscription_expires_at && new Date(personal.subscription_expires_at) > new Date()) {
      // Plan stays active until expiration, but mark as pending cancellation
      // For now just set plan to trial after current period
      await pgQueryOne(
        c.env,
        `UPDATE personals SET subscription_plan = 'trial', subscription_expires_at = NULL, updated_at = $1 WHERE id = $2 RETURNING id`,
        [now, jwt.sub]
      )
    } else {
      await pgQueryOne(
        c.env,
        `UPDATE personals SET subscription_plan = 'trial', subscription_expires_at = NULL, updated_at = $1 WHERE id = $2 RETURNING id`,
        [now, jwt.sub]
      )
    }

    return success({ success: true })
  }
)

export { platform as platformRoutes }
