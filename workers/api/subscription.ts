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
import { getOrCreateCustomer, createAsaasPayment, getPixQrCode, cancelPayment as cancelAsaasPayment, AsaasApiError } from '@lib/asaas'
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
    payment_status: string
  }>(env, `
    SELECT plan_type, billing_cycle, renews_at, canceled_at, price_paid, payment_status
    FROM vfit_subscriptions
    WHERE user_id = $1 AND canceled_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `, [userId])

  if (b2cSub) {
    // Only consider subscription active if payment is confirmed AND not expired
    const isPaymentConfirmed = b2cSub.payment_status === 'confirmed'
    const isNotExpired = !b2cSub.renews_at || new Date(b2cSub.renews_at) > new Date()
    const isActive = isPaymentConfirmed && isNotExpired
    const plan = isActive ? b2cSub.plan_type : 'free'
    const b2cPlan = mapToB2CPlan(plan)
    return success({
      plan: b2cPlan,
      plan_type: plan,
      is_premium: isActive && b2cPlan !== 'free',
      payment_status: b2cSub.payment_status,
      renews_at: b2cSub.renews_at,
      canceled_at: b2cSub.canceled_at,
      billing_cycle: b2cSub.billing_cycle,
      price_paid: b2cSub.price_paid,
      cpf: userCpf?.cpf || null,
      limits: getPlanLimits(isActive ? b2cPlan : 'free'),
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

  // Super admin test pricing: R$5.00 for any plan (Asaas minimum is R$5.00)
  const isSuperAdmin = user.role === 'super_admin' || c.get('userRole') === 'super_admin'
  const finalPrice = isSuperAdmin ? 5.00 : planConfig.price_brl

  // Save CPF permanently to user profile
  const cleanCpf = cpf.replace(/\D/g, '')
  await pgQuery(env, 'UPDATE users SET cpf = $1 WHERE id = $2 AND (cpf IS NULL OR cpf = $1)', [cleanCpf, userId])

  // Check existing active subscription
  const existing = await pgQueryOne<{ id: string; asaas_subscription_id: string | null }>(env,
    `SELECT id, asaas_subscription_id FROM vfit_subscriptions
     WHERE user_id = $1 AND canceled_at IS NULL
     AND (renews_at IS NULL OR renews_at > NOW())
     LIMIT 1`,
    [userId]
  )
  if (existing) {
    // Super admin: auto-cancel previous subscription for repeated testing
    if (isSuperAdmin) {
      if (existing.asaas_subscription_id) {
        try { await cancelAsaasPayment(env, existing.asaas_subscription_id) } catch { /* ignore */ }
      }
      await pgQuery(env, `UPDATE vfit_subscriptions SET canceled_at = NOW(), updated_at = NOW() WHERE id = $1`, [existing.id])
    } else {
      throw new BadRequestError('Já possui assinatura ativa')
    }
  }

  // ── Step 1: Asaas API calls FIRST (before DB insert) ──
  // If Asaas fails, no orphaned DB record is created

  let customer: { id: string }
  let payment: { id: string }
  let qrCode: { encodedImage: string; payload: string; expirationDate: string }

  try {
    // Create/find Asaas customer
    customer = await getOrCreateCustomer(env, {
      name: user.full_name,
      email: user.email,
      cpfCnpj: cleanCpf,
      externalReference: userId,
    })
  } catch (err) {
    const msg = err instanceof AsaasApiError ? err.message : 'Erro ao criar cliente no gateway de pagamento'
    console.error('[Subscription] getOrCreateCustomer failed:', err)
    throw new BadRequestError(msg)
  }

  // Generate subscription ID early so we can use it in externalReference
  const subId = generateId()

  try {
    // Create PIX payment
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)

    payment = await createAsaasPayment(env, {
      customer: customer.id,
      billingType: 'PIX',
      value: finalPrice,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `VFIT ${planConfig.name}${isSuperAdmin ? ' [TEST]' : ''}`,
      externalReference: `vfit_sub_${subId}`,
    })
  } catch (err) {
    const msg = err instanceof AsaasApiError ? err.message : 'Erro ao gerar cobrança PIX'
    console.error('[Subscription] createAsaasPayment failed:', err)
    throw new BadRequestError(msg)
  }

  try {
    qrCode = await getPixQrCode(env, payment.id)
  } catch (err) {
    const msg = err instanceof AsaasApiError ? err.message : 'Erro ao gerar QR Code PIX'
    console.error('[Subscription] getPixQrCode failed:', err)
    throw new BadRequestError(msg)
  }

  // ── Step 2: All Asaas calls succeeded → persist to DB ──
  // Create subscription as PENDING — webhook will activate it when payment is confirmed
  // No started_at or renews_at until payment is confirmed (prevents pre-activation)

  await pgQuery(env, `
    INSERT INTO vfit_subscriptions (id, user_id, plan_type, billing_cycle, started_at, renews_at, price_paid, asaas_subscription_id, payment_status)
    VALUES ($1, $2, $3, $4, NULL, NULL, $5, $6, 'pending')
    ON CONFLICT (user_id) DO UPDATE SET
      plan_type = $3, billing_cycle = $4, started_at = NULL,
      renews_at = NULL, price_paid = $5, asaas_subscription_id = $6,
      payment_status = 'pending', canceled_at = NULL, updated_at = NOW()
  `, [subId, userId, planSlug, planSlug === 'premium' ? 'monthly' : 'annual',
      finalPrice, payment.id])

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
