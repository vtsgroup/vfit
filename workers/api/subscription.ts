/**
 * workers/api/subscription.ts
 *
 * Subscription API — VFIT B2C
 *
 * GET /api/v1/subscription/status — Status da assinatura
 *
 * Auth: requireAuth
 * DB: users (Neon)
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError } from '@lib/errors'
import { authMiddleware } from '@workers/middleware/auth'
import { getOrCreateCustomer, createAsaasPayment, getPixQrCode, cancelPayment as cancelAsaasPayment } from '@lib/asaas'
import { VFIT_PLANS } from '@config/constants'

const subscription = new Hono<AppContext>()

subscription.use('*', authMiddleware)

/**
 * GET /api/v1/subscription/status
 * Returns current subscription plan and limits
 */
subscription.get('/status', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType') as string
  const env = c.env

  // Get user CPF (saved permanently)
  const userCpf = await pgQueryOne<{ cpf: string | null }>(env,
    'SELECT cpf FROM users WHERE id = $1', [userId]
  )

  // Check B2C subscription first (vfit_subscriptions)
  const b2cSub = await pgQueryOne<{
    plan_type: string
    billing_cycle: string
    renews_at: string | null
    canceled_at: string | null
    price_paid: number | null
  }>(env, `
    SELECT plan_type, billing_cycle, renews_at, canceled_at, price_paid
    FROM vfit_subscriptions
    WHERE user_id = $1 AND canceled_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `, [userId])

  if (b2cSub) {
    const isActive = !b2cSub.renews_at || new Date(b2cSub.renews_at) > new Date()
    const plan = isActive ? b2cSub.plan_type : 'free'
    const b2cPlan = mapToB2CPlan(plan)
    return success({
      plan: b2cPlan,
      plan_type: plan,
      is_premium: b2cPlan !== 'free',
      renews_at: b2cSub.renews_at,
      canceled_at: b2cSub.canceled_at,
      billing_cycle: b2cSub.billing_cycle,
      price_paid: b2cSub.price_paid,
      cpf: userCpf?.cpf || null,
      limits: getPlanLimits(b2cPlan),
    })
  }

  // Students don't have personals records — skip B2B fallback
  // (fixes: super_admin simulating as student seeing their own B2B plan)
  if (userType === 'student') {
    return success({
      plan: 'free',
      plan_type: 'free',
      is_premium: false,
      cpf: userCpf?.cpf || null,
      limits: getPlanLimits('free'),
    })
  }

  // Fallback: check B2B (personals table)
  const user = await pgQueryOne<{
    subscription_plan: string | null
    subscription_status: string | null
    subscription_expires_at: string | null
    trial_ends_at: string | null
  }>(env, `
    SELECT p.subscription_plan, p.subscription_status,
           p.subscription_expires_at, p.trial_ends_at
    FROM personals p
    WHERE p.id = $1
    LIMIT 1
  `, [userId])

  // Default to free plan for users without personal record
  const plan = user?.subscription_plan || 'free'
  const status = user?.subscription_status || 'active'
  const expiresAt = user?.subscription_expires_at || null
  const trialEndsAt = user?.trial_ends_at || null

  // Check if trial/subscription is expired
  const now = new Date()
  const isExpired = expiresAt ? new Date(expiresAt) < now : false
  const isTrialExpired = trialEndsAt ? new Date(trialEndsAt) < now : false

  // Determine effective plan
  let effectivePlan = plan
  if (isExpired || isTrialExpired) {
    effectivePlan = 'free'
  }

  // Map B2B plan names to B2C equivalents
  const b2cPlan = mapToB2CPlan(effectivePlan)

  return success({
    plan: b2cPlan,
    status: isExpired ? 'expired' : status,
    expires_at: expiresAt,
    trial_ends_at: trialEndsAt,
    is_premium: b2cPlan !== 'free',
    cpf: userCpf?.cpf || null,
    limits: getPlanLimits(b2cPlan),
  })
})

function mapToB2CPlan(plan: string): string {
  // Map existing B2B plans to B2C equivalents
  switch (plan) {
    case 'trial':
    case 'free':
      return 'free'
    case 'pro':
    case 'profissional':
    case 'max':
    case 'premium':
    case 'premium_annual':
      return 'premium'
    default:
      return 'free'
  }
}

function getPlanLimits(plan: string) {
  if (plan === 'premium') {
    return {
      ai_plans_per_month: -1,
      workouts_per_week: -1,
      ai_chat_messages: -1,
      exercise_library: 'full',
      streak_freezes: -1,
    }
  }

  return {
    ai_plans_per_month: 1,
    workouts_per_week: 3,
    ai_chat_messages: 10,
    exercise_library: 'basic',
    streak_freezes: 1,
  }
}

// ============================================
// POST /checkout — B2C PIX checkout
// ============================================
subscription.post('/checkout', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const body = await c.req.json()

  const { plan, cpf } = body as { plan: string; cpf: string }

  if (!plan || !['premium', 'premium_annual'].includes(plan)) {
    throw new BadRequestError('Plano inválido. Use: premium ou premium_annual')
  }
  if (!cpf || cpf.replace(/\D/g, '').length < 11) {
    throw new BadRequestError('CPF inválido')
  }

  const planSlug = plan as 'premium' | 'premium_annual'
  const planConfig = VFIT_PLANS[planSlug]
  if (!planConfig) {
    throw new BadRequestError('Plano não disponível para compra')
  }

  // Get user info
  const user = await pgQueryOne<{ email: string; full_name: string; role: string }>(env,
    'SELECT email, full_name, role FROM users WHERE id = $1', [userId]
  )
  if (!user) throw new BadRequestError('Usuário não encontrado')

  // Super admin test pricing: R$1.00 for any plan
  const isSuperAdmin = user.role === 'super_admin' || c.get('userRole') === 'super_admin'
  const finalPrice = isSuperAdmin ? 1.00 : planConfig.price_brl

  // Save CPF permanently to user profile
  const cleanCpf = cpf.replace(/\D/g, '')
  await pgQuery(env, 'UPDATE users SET cpf = $1 WHERE id = $2 AND (cpf IS NULL OR cpf = $1)', [cleanCpf, userId])

  // Check existing active subscription
  const existing = await pgQueryOne<{ id: string }>(env,
    `SELECT id FROM vfit_subscriptions
     WHERE user_id = $1 AND canceled_at IS NULL
     AND (renews_at IS NULL OR renews_at > NOW())
     LIMIT 1`,
    [userId]
  )
  if (existing) {
    throw new BadRequestError('Já possui assinatura ativa')
  }

  // Create subscription record
  const subId = generateId()
  const now = new Date()
  const renewsAt = new Date(now)
  if (planSlug === 'premium') {
    renewsAt.setDate(renewsAt.getDate() + 30)
  } else {
    renewsAt.setDate(renewsAt.getDate() + 365)
  }

  await pgQuery(env, `
    INSERT INTO vfit_subscriptions (id, user_id, plan_type, billing_cycle, started_at, renews_at, price_paid)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) DO UPDATE SET
      plan_type = $3, billing_cycle = $4, started_at = $5,
      renews_at = $6, price_paid = $7, canceled_at = NULL, updated_at = NOW()
  `, [subId, userId, planSlug, planSlug === 'premium' ? 'monthly' : 'annual',
      now.toISOString(), renewsAt.toISOString(), finalPrice])

  // Create/find Asaas customer
  const customer = await getOrCreateCustomer(env, {
    name: user.full_name,
    email: user.email,
    cpfCnpj: cpf.replace(/\D/g, ''),
    externalReference: userId,
  })

  // Create PIX payment
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)

  const payment = await createAsaasPayment(env, {
    customer: customer.id,
    billingType: 'PIX',
    value: finalPrice,
    dueDate: dueDate.toISOString().split('T')[0],
    description: `VFIT ${planConfig.name}${isSuperAdmin ? ' [TEST]' : ''}`,
    externalReference: `vfit_sub_${subId}`,
  })

  // Store Asaas payment ID
  await pgQuery(env, `
    UPDATE vfit_subscriptions SET asaas_subscription_id = $1 WHERE id = $2
  `, [payment.id, subId])

  // Get PIX QR Code
  const qrCode = await getPixQrCode(env, payment.id)

  return created({
    subscription_id: subId,
    plan: planSlug,
    amount: finalPrice,
    pix: {
      qr_code_base64: qrCode.encodedImage,
      copy_paste: qrCode.payload,
      expiration: qrCode.expirationDate,
    },
    asaas_payment_id: payment.id,
  })
})

// ============================================
// POST /cancel — Cancel B2C subscription
// ============================================
subscription.post('/cancel', async (c) => {
  const userId = c.get('userId')
  const env = c.env
  const now = new Date().toISOString()

  const sub = await pgQueryOne<{ id: string; asaas_subscription_id: string | null }>(env,
    `SELECT id, asaas_subscription_id FROM vfit_subscriptions
     WHERE user_id = $1 AND canceled_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  )

  if (!sub) {
    throw new BadRequestError('Nenhuma assinatura ativa encontrada')
  }

  // Cancel in Asaas if has payment
  if (sub.asaas_subscription_id) {
    try {
      await cancelAsaasPayment(env, sub.asaas_subscription_id)
    } catch (err) {
      console.warn('[Subscription] Failed to cancel Asaas payment:', err)
    }
  }

  // Mark as canceled
  await pgQuery(env, `
    UPDATE vfit_subscriptions SET canceled_at = $1, updated_at = $1 WHERE id = $2
  `, [now, sub.id])

  // Update user plan to free
  await pgQuery(env, `
    UPDATE users SET subscription_plan = 'free', subscription_canceled_at = $1 WHERE id = $2
  `, [now, userId])

  return success({ canceled: true, canceled_at: now })
})

export { subscription as subscriptionRoutes }
