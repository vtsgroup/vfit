/**
 * workers/api/payments.ts
 *
 * payments.ts — Cobranças, planos e assinaturas (Asaas)
 * Features: Zustand · DB: Neon
 */

// ============================================
// payments.ts — Cobranças, planos e assinaturas (Asaas)
// ============================================
//
// O que faz:
//   CRUD completo de cobranças via Asaas: criar, listar, detalhar, atualizar
//   status e cancelar. Gestão de planos de assinatura recorrente, estatísticas
//   financeiras, webhook Asaas para confirmação e fluxo de saque (PIX/TED).
//
// Exports principais:
//   paymentsRoutes — Hono app montado em /api/v1/payments
//
// Auth: requireAuth. Personal gerencia cobranças dos seus alunos.
// DB: payments, subscriptions, users, students, personals
// Side effects: chama Asaas API (lib/asaas.ts), push OneSignal, email Resend
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  createPaymentSchema,
  createPaymentLinkSchema,
  updatePaymentStatusSchema,
  listPaymentsQuerySchema,
  createWorkoutPlanSchema,
  updateWorkoutPlanSchema,
  listWorkoutPlansQuerySchema,
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
  requestPixTransferSchema,
  checkoutPaySchema,
} from '@workers/schemas/payments'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@lib/errors'
import { FEES } from '@config/constants'
import { notify, notifyEvent, notifyPaymentReceived, notifyPaymentOverdue } from '@lib/onesignal'
import {
  getOrCreateCustomer,
  createAsaasPayment,
  getPayment as getAsaasPayment,
  getPixQrCode,
  cancelPayment as cancelAsaasPayment,
  createSubscription as createAsaasSubscription,
  cancelSubscription as cancelAsaasSubscription,
  createPixTransfer,
  getBalance,
  mapPaymentMethod,
  mapBillingCycle,
  mapPixKeyType,
  AsaasApiError,
} from '@lib/asaas'
import type { CreatePaymentInput as AsaasPaymentInput } from '@lib/asaas'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const payments = new Hono<AppContext>()

async function insertAuditLog(
  env: Bindings,
  input: {
    actorUserId: string | null
    actorRole: string
    action: string
    targetType?: string
    targetId?: string
    metadata?: Record<string, unknown>
    ipAddress?: string | null
    userAgent?: string | null
    requestId?: string
  }
): Promise<void> {
  try {
    await pgQuery(
      env,
      `
        INSERT INTO audit_log (
          actor_user_id,
          actor_role,
          action,
          target_type,
          target_id,
          metadata,
          ip_address,
          user_agent,
          request_id
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
      `,
      [
        input.actorUserId,
        input.actorRole,
        input.action,
        input.targetType || null,
        input.targetId || null,
        JSON.stringify(input.metadata || {}),
        input.ipAddress || null,
        input.userAgent || null,
        input.requestId || null,
      ]
    )
  } catch (err) {
    console.error('[Payments] Failed to write audit_log:', err)
  }
}

// ============================================
// WEBHOOKS — sem auth JWT (verificação própria)
// ============================================

payments.post('/webhooks/asaas', async (c) => {
  // Verificar header de autenticação Asaas
  const accessToken = c.req.header('asaas-access-token')?.trim()
  const expectedTokens = [c.env.ASAAS_WEBHOOK_TOKEN, c.env.ASAAS_API_KEY]
    .filter(Boolean)
    .map((token) => token.trim())
  if (!accessToken || !expectedTokens.includes(accessToken)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()

  try {
    const event = body.event as string
    const paymentData = body.payment

    if (!paymentData?.id) {
      return c.json({ received: true })
    }

    // Buscar pagamento pelo asaas_payment_id
    const { rows } = await pgQuery<PaymentRow>(
      c.env,
      'SELECT * FROM payments WHERE asaas_payment_id = $1 LIMIT 1',
      [paymentData.id]
    )

    if (rows.length === 0) {
      // Check if B2C VFIT subscription payment
      const extRef = paymentData.externalReference as string | undefined
      if (extRef?.startsWith('vfit_sub_')) {
        const subId = extRef.replace('vfit_sub_', '')
        const now = new Date().toISOString()

        if (['CONFIRMED', 'RECEIVED'].includes(event)) {
          // Activate B2C subscription
          const { rows: subRows } = await pgQuery<{ user_id: string; plan_type: string; billing_cycle: string }>(
            c.env,
            'SELECT user_id, plan_type, billing_cycle FROM vfit_subscriptions WHERE id = $1 LIMIT 1',
            [subId]
          )
          if (subRows.length > 0) {
            const sub = subRows[0]
            const renewsAt = new Date()
            renewsAt.setDate(renewsAt.getDate() + (sub.billing_cycle === 'annual' ? 365 : 30))

            await pgQuery(c.env, `
              UPDATE vfit_subscriptions
              SET asaas_subscription_id = $1, started_at = $2, renews_at = $3, updated_at = $2
              WHERE id = $4
            `, [paymentData.id, now, renewsAt.toISOString(), subId])

            await pgQuery(c.env, `
              UPDATE users
              SET subscription_plan = $1, subscription_started_at = $2, subscription_renews_at = $3
              WHERE id = $4
            `, [sub.plan_type, now, renewsAt.toISOString(), sub.user_id])

            // Push notification: subscription activated
            await notify(c.env, sub.user_id, {
              type: 'subscription',
              title: '🎉 Premium Ativado!',
              message: `Seu plano ${sub.plan_type === 'premium_annual' ? 'Premium Anual' : 'Premium'} foi ativado com sucesso!`,
              link: '/perfil/assinatura',
            }).catch(() => {})

            console.log(`[Webhook B2C] Subscription ${subId} activated for user ${sub.user_id} (${sub.plan_type})`)
          }
        } else if (['REFUNDED', 'DELETED'].includes(event)) {
          const { rows: subRows } = await pgQuery<{ user_id: string }>(
            c.env,
            'SELECT user_id FROM vfit_subscriptions WHERE id = $1 LIMIT 1',
            [subId]
          )
          await pgQuery(c.env, `
            UPDATE vfit_subscriptions SET canceled_at = $1, updated_at = $1 WHERE id = $2
          `, [now, subId])
          if (subRows.length > 0) {
            await pgQuery(c.env, `
              UPDATE users SET subscription_plan = 'free', subscription_canceled_at = $1 WHERE id = $2
            `, [now, subRows[0].user_id])
          }
          console.log(`[Webhook B2C] Subscription ${subId} canceled/refunded`)
        }
        return c.json({ received: true })
      }

      // Check if B2B platform checkout payment (personal buying plan)
      if (extRef?.startsWith('platform_checkout_')) {
        // Format: platform_checkout_{userId}_{planSlug}_{billingCycle}
        const parts = extRef.replace('platform_checkout_', '').split('_')
        const userId = parts[0]
        const planSlug = parts[1] // pro, profissional, max
        const billingCycle = parts[2] // monthly, annual
        const now = new Date().toISOString()

        if (['CONFIRMED', 'RECEIVED'].includes(event)) {
          // Calculate expiration date
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + (billingCycle === 'annual' ? 365 : 30))

          // Activate B2B subscription plan for the personal trainer
          await pgQuery(c.env, `
            UPDATE personals
            SET subscription_plan = $1, subscription_expires_at = $2, updated_at = $3
            WHERE id = $4
          `, [planSlug, expiresAt.toISOString(), now, userId])

          // Push notification: plan activated
          await notify(c.env, userId, {
            type: 'subscription',
            title: '🎉 Plano Ativado!',
            message: `Seu plano ${planSlug === 'max' ? 'Max' : planSlug === 'profissional' ? 'Pro+' : 'Pro'} foi ativado com sucesso!`,
            link: '/dashboard/plans',
          }).catch(() => {}) // best-effort

          console.log(`[Webhook B2B] Plan ${planSlug} (${billingCycle}) activated for personal ${userId}`)
        } else if (['REFUNDED', 'DELETED'].includes(event)) {
          // Revert to trial plan
          await pgQuery(c.env, `
            UPDATE personals
            SET subscription_plan = 'trial', subscription_expires_at = NULL, updated_at = $1
            WHERE id = $2
          `, [now, userId])

          console.log(`[Webhook B2B] Plan refunded/deleted for personal ${userId}`)
        }
        return c.json({ received: true })
      }

      console.log(`[Webhook Asaas] Payment not found: ${paymentData.id}`)
      return c.json({ received: true })
    }

    const payment = rows[0]
    const now = new Date().toISOString()

    // Mapear status Asaas → nosso
    const statusMap: Record<string, string> = {
      CONFIRMED: 'confirmed',
      RECEIVED: 'confirmed',
      OVERDUE: 'pending',
      REFUNDED: 'refunded',
      DELETED: 'cancelled',
      PAYMENT_CREATED: 'pending',
    }

    const newStatus = statusMap[event] || payment.status
    const paidAt = ['CONFIRMED', 'RECEIVED'].includes(event) ? now : payment.paid_at

    // Quando confirmado, buscar netValue real do Asaas (valor após taxas do gateway)
    let realNetAmount = payment.net_amount
    if (newStatus === 'confirmed' && paymentData.id) {
      try {
        const asaasPaymentDetail = await getAsaasPayment(c.env, paymentData.id)
        if (asaasPaymentDetail.netValue != null) {
          realNetAmount = asaasPaymentDetail.netValue
          console.log(`[Webhook] netValue real Asaas: R$${asaasPaymentDetail.netValue} (era R$${payment.net_amount})`)
        }
      } catch (err) {
        console.warn('[Webhook] Could not fetch Asaas netValue:', err)
      }
    }

    await pgQuery(c.env, `
      UPDATE payments SET status = $1, paid_at = $2, 
        net_amount = $3,
        invoice_url = COALESCE($4, invoice_url),
        receipt_url = COALESCE($5, receipt_url),
        updated_at = $6
      WHERE id = $7
    `, [newStatus, paidAt, realNetAmount, paymentData.invoiceUrl, paymentData.transactionReceiptUrl, now, payment.id])

    // Se confirmado, processar comissão de afiliado
    if (newStatus === 'confirmed' && payment.commission_amount > 0) {
      await processAffiliateCommission(c.env, payment)
    }

    // Notificar via push + in-app
    if (newStatus === 'confirmed') {
      // Buscar nome do pagador para a notificação
      const { rows: payerRows } = await pgQuery<{ full_name: string }>(
        c.env,
        'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
        [payment.payer_id]
      )
      const payerName = payerRows[0]?.full_name || 'Aluno'

      // Push + in-app para o personal (recebedor)
      await notifyPaymentReceived(
        c.env, payment.recipient_id, payerName, payment.amount
      ).catch(() => {}) // best-effort
    }

    // Notificar aluno sobre pagamento vencido
    if (event === 'OVERDUE') {
      await notifyPaymentOverdue(
        c.env, payment.payer_id, payment.amount
      ).catch(() => {}) // best-effort
    }
  } catch (err) {
    console.error('[Webhook Asaas] Error:', err)
  }

  return c.json({ received: true })
})

payments.post('/webhooks/stripe', async (c) => {
  // Verificar Stripe signature (HMAC-SHA256 via Web Crypto)
  const signature = c.req.header('stripe-signature')
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400)
  }

  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook Stripe] STRIPE_WEBHOOK_SECRET not configured')
    return c.json({ error: 'Webhook not configured' }, 500)
  }

  // Parse Stripe signature header: t=timestamp,v1=signature
  const parts = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, ...rest] = part.split('=')
      return [key, rest.join('=')]
    })
  )
  const timestamp = parts.t
  const sigHash = parts.v1
  if (!timestamp || !sigHash) {
    return c.json({ error: 'Invalid signature format' }, 400)
  }

  // Reject if timestamp is older than 5 minutes (replay protection)
  const tolerance = 300 // 5 minutes
  const timestampAge = Math.floor(Date.now() / 1000) - Number(timestamp)
  if (timestampAge > tolerance) {
    return c.json({ error: 'Timestamp too old' }, 400)
  }

  // Verify HMAC-SHA256: sign(timestamp + '.' + rawBody) with webhook secret
  const rawBody = await c.req.text()
  const signedPayload = `${timestamp}.${rawBody}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (expectedSig !== sigHash) {
    console.error('[Webhook Stripe] Invalid signature')
    return c.json({ error: 'Invalid signature' }, 401)
  }

  const body = JSON.parse(rawBody)

  try {
    const eventType = body.type as string
    const paymentIntent = body.data?.object

    if (!paymentIntent?.id) {
      return c.json({ received: true })
    }

    const { rows } = await pgQuery<PaymentRow>(
      c.env,
      'SELECT * FROM payments WHERE stripe_payment_intent_id = $1 LIMIT 1',
      [paymentIntent.id]
    )

    if (rows.length === 0) {
      return c.json({ received: true })
    }

    const payment = rows[0]
    const now = new Date().toISOString()

    const statusMap: Record<string, string> = {
      'payment_intent.succeeded': 'confirmed',
      'payment_intent.payment_failed': 'failed',
      'charge.refunded': 'refunded',
    }

    const newStatus = statusMap[eventType]
    if (!newStatus) return c.json({ received: true })

    const paidAt = newStatus === 'confirmed' ? now : payment.paid_at

    await pgQuery(c.env, `
      UPDATE payments SET status = $1, paid_at = $2, updated_at = $3 WHERE id = $4
    `, [newStatus, paidAt, now, payment.id])

    if (newStatus === 'confirmed' && payment.commission_amount > 0) {
      await processAffiliateCommission(c.env, payment)
    }

    if (newStatus === 'confirmed') {
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)
      await notifyEvent(c.env, payment.recipient_id, 'payment.confirmed', {
        amount: formatted,
        method: 'Stripe',
        paymentId: payment.id,
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[Webhook Stripe] Error:', err)
  }

  return c.json({ received: true })
})

// ============================================
// WEBHOOK — Asaas Transfer (Saque PIX)
// POST /payments/webhooks/asaas/transfer
// ============================================
payments.post('/webhooks/asaas/transfer', async (c) => {
  // Verificar header de autenticação Asaas
  const accessToken = c.req.header('asaas-access-token')?.trim()
  const expectedTokens = [c.env.ASAAS_WEBHOOK_TOKEN, c.env.ASAAS_API_KEY]
    .filter(Boolean)
    .map((token) => token.trim())
  if (!accessToken || !expectedTokens.includes(accessToken)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()

  try {
    const event = body.event as string
    const transferData = body.transfer

    if (!transferData?.id) {
      return c.json({ received: true })
    }

    console.log(`[Webhook Asaas Transfer] Event: ${event}, Transfer: ${transferData.id}`)

    // Mapear status do evento Asaas → nosso
    const statusMap: Record<string, string> = {
      TRANSFER_CREATED: 'pending',
      TRANSFER_PENDING: 'pending',
      TRANSFER_IN_BANK_PROCESSING: 'processing',
      TRANSFER_BLOCKED: 'failed',
      TRANSFER_DONE: 'completed',
      TRANSFER_CANCELLED: 'cancelled',
      TRANSFER_FAILED: 'failed',
    }

    const newStatus = statusMap[event]
    if (!newStatus) {
      console.log(`[Webhook Asaas Transfer] Unknown event: ${event}`)
      return c.json({ received: true })
    }

    // Buscar transferência pelo asaas_transfer_id
    const { rows } = await pgQuery<{
      id: string
      personal_id: string
      amount: number
      status: string
    }>(
      c.env,
      'SELECT id, personal_id, amount, status FROM pix_transfers WHERE asaas_transfer_id = $1 LIMIT 1',
      [transferData.id]
    )

    if (rows.length === 0) {
      console.log(`[Webhook Asaas Transfer] Transfer not found: ${transferData.id}`)
      return c.json({ received: true })
    }

    const transfer = rows[0]
    const now = new Date().toISOString()

    // Atualizar status
    const completedAt = newStatus === 'completed' ? now : null
    await pgQuery(c.env, `
      UPDATE pix_transfers 
      SET status = $1, 
          completed_at = COALESCE($2, completed_at),
          failed_reason = $3,
          updated_at = $4
      WHERE id = $5
    `, [
      newStatus,
      completedAt,
      transferData.failReason || null,
      now,
      transfer.id,
    ])

    // Notificar o personal sobre o resultado
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transfer.amount)

    if (newStatus === 'completed') {
      await notifyEvent(c.env, transfer.personal_id, 'payment.transfer.completed', {
        amount: formatted,
      }).catch(() => {})
    } else if (newStatus === 'failed' || newStatus === 'cancelled') {
      await notifyEvent(c.env, transfer.personal_id, 'payment.transfer.failed', {
        amount: formatted,
        reason: transferData.failReason || 'Motivo não informado',
      }).catch(() => {})

      // Se falhou/cancelou, reverter o saldo (marcar como failed para não descontar)
      // O status 'failed' ou 'cancelled' já não conta no cálculo de available_balance
    }

    console.log(`[Webhook Asaas Transfer] Updated ${transfer.id}: ${transfer.status} → ${newStatus}`)
  } catch (err) {
    console.error('[Webhook Asaas Transfer] Error:', err)
  }

  return c.json({ received: true })
})

// ============================================
// WEBHOOK — Asaas Transfer Authorization (Mecanismo de Segurança)
// POST /payments/webhooks/asaas/transfer-auth
//
// O Asaas envia um POST 5 segundos após cada transferência criada.
// Devemos responder com { "status": "APPROVED" } ou { "status": "REFUSED" }.
// Se falhar 3 vezes, a transferência é cancelada automaticamente.
// Docs: https://docs.asaas.com/docs/mecanismo-para-validacao-de-saque-via-webhooks
//
// Fluxo:
//   1) Transfer via API (nosso app) → existe em pix_transfers → valida valor → APPROVE
//   2) Transfer manual (painel Asaas = super admin) → NÃO existe em pix_transfers → APPROVE
// ============================================
payments.post('/webhooks/asaas/transfer-auth', async (c) => {
  // Verificar header de autenticação Asaas
  const accessToken = c.req.header('asaas-access-token')?.trim()
  const expectedTokens = [c.env.ASAAS_WEBHOOK_TOKEN, c.env.ASAAS_API_KEY]
    .filter(Boolean)
    .map((token) => token.trim())

  if (!accessToken || !expectedTokens.includes(accessToken)) {
    console.error('[Transfer Auth] Unauthorized — invalid token')
    return c.json({ status: 'REFUSED', refuseReason: 'Token de autenticação inválido' }, 200)
  }

  const body = await c.req.json()

  try {
    const type = body.type as string // TRANSFER, BILL, PIX_QR_CODE, etc.
    const transferData = body.transfer

    console.log(`[Transfer Auth] Received type=${type}, transfer_id=${transferData?.id}, value=${transferData?.value}`)

    // Só autorizamos transferências (tipo TRANSFER)
    if (type !== 'TRANSFER' || !transferData?.id) {
      console.warn(`[Transfer Auth] REFUSED — unsupported type: ${type}`)
      return c.json({ status: 'REFUSED', refuseReason: `Tipo não suportado: ${type}` })
    }

    // Buscar a transferência na nossa tabela pix_transfers pelo asaas_transfer_id
    const { rows } = await pgQuery<{
      id: string
      personal_id: string
      amount: number
      status: string
      pix_key: string
    }>(
      c.env,
      `SELECT id, personal_id, amount, status, pix_key 
       FROM pix_transfers 
       WHERE asaas_transfer_id = $1 
       LIMIT 1`,
      [transferData.id]
    )

    if (rows.length === 0) {
      // Transferência NÃO encontrada no sistema — é um saque manual (painel Asaas)
      // Apenas o super admin tem acesso ao painel, então APROVAMOS automaticamente
      console.log(`[Transfer Auth] APPROVED (manual) — transfer ${transferData.id}, value R$${transferData.value} (saque via painel Asaas)`)
      return c.json({ status: 'APPROVED' })
    }

    // Transferência encontrada — é um saque via API (nosso app)
    const localTransfer = rows[0]

    // Validar que o valor confere (tolerância de R$0.01 para arredondamentos)
    const valueDiff = Math.abs(localTransfer.amount - (transferData.value || 0))
    if (valueDiff > 0.01) {
      console.error(`[Transfer Auth] REFUSED — value mismatch: local=${localTransfer.amount}, asaas=${transferData.value}`)
      return c.json({ status: 'REFUSED', refuseReason: `Valor divergente: esperado R$${localTransfer.amount}, recebido R$${transferData.value}` })
    }

    // Tudo válido — APROVAR a transferência
    console.log(`[Transfer Auth] APPROVED (API) — transfer ${transferData.id}, value R$${transferData.value}, personal=${localTransfer.personal_id}`)

    return c.json({ status: 'APPROVED' })
  } catch (err) {
    console.error('[Transfer Auth] Error processing:', err)
    // Em caso de erro interno, RECUSAR por segurança
    return c.json({ status: 'REFUSED', refuseReason: 'Erro interno ao processar autorização' })
  }
})

// Auth required a partir daqui
payments.use('*', authMiddleware)

// ============================================
// POST /payments — Criar cobrança (personal) → integração Asaas
// ============================================
payments.post('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = createPaymentSchema.parse(body)

  // Verificar se é admin (admin pode cobrar qualquer pessoa)
  const { rows: roleRows } = await pgQuery<{ role: string }>(
    c.env,
    'SELECT role FROM users WHERE id = $1',
    [personalId]
  )
  const isAdmin = roleRows[0]?.role === 'admin' || roleRows[0]?.role === 'super_admin'

  if (!isAdmin) {
    // Personais normais: verificar que payer é seu aluno
    const { rows: studentRows } = await pgQuery<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [parsed.payer_id, personalId]
    )
    if (studentRows.length === 0) {
      throw new ForbiddenError('Aluno não pertence ao seu perfil')
    }
  }

  // Buscar dados do aluno para criar customer Asaas
  const { rows: payerRows } = await pgQuery<{
    id: string; email: string; full_name: string; cpf: string; phone: string | null
  }>(
    c.env,
    'SELECT id, email, full_name, cpf, phone FROM users WHERE id = $1 LIMIT 1',
    [parsed.payer_id]
  )
  if (payerRows.length === 0) throw new NotFoundError('Aluno')
  const payer = payerRows[0]

  // Calcular fees
  const platformFee = Math.round(parsed.amount * FEES.platform_fee_percentage) / 100
  const commissionAmount = await calculateAffiliateCommission(c.env, personalId, parsed.amount)
  // Comissão do afiliado é custo da PLATAFORMA, não do personal
  // Personal recebe: amount - platformFee (sem descontar comissão)
  const netAmount = parsed.amount - platformFee

  const id = generateId()
  const now = new Date().toISOString()
  const dueDate = parsed.due_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const splitData = {
    total: parsed.amount,
    platform_fee: platformFee,
    platform_fee_pct: FEES.platform_fee_percentage,
    commission: commissionAmount,
    commission_note: 'Custo da plataforma, não descontado do personal',
    net_to_personal: netAmount,
  }

  let asaasPaymentId: string | null = null
  let invoiceUrl: string | null = null
  let pixData: { qrCode?: string; payload?: string; expirationDate?: string } | null = null

  // Criar cobrança real no Asaas
  if (parsed.create_in_asaas !== false && c.env.ASAAS_API_KEY) {
    try {
      // 1. Garantir customer Asaas do aluno
      const asaasCustomer = await getOrCreateCustomer(c.env, {
        name: payer.full_name,
        email: payer.email,
        cpfCnpj: payer.cpf,
        phone: payer.phone || undefined,
        externalReference: payer.id,
        notificationDisabled: true,
      })

      // Salvar customer_id no cache
      await pgQuery(c.env, `
        INSERT INTO asaas_customers (id, user_id, personal_id, asaas_customer_id, name, email, cpf_cnpj, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, personal_id) DO UPDATE SET asaas_customer_id = $4, updated_at = NOW()
      `, [generateId(), payer.id, personalId, asaasCustomer.id, payer.full_name, payer.email, payer.cpf, payer.phone])

      // 2. Criar cobrança no Asaas (com fallback PIX → UNDEFINED)
      let billingType = mapPaymentMethod(parsed.payment_method)
      let usedFallback = false

      let asaasPayment: { id: string; invoiceUrl?: string; status?: string; bankSlipUrl?: string; identificationField?: string; nossoNumero?: string; creditCard?: { creditCardNumber?: string; creditCardBrand?: string; creditCardToken?: string } }
      try {
        asaasPayment = await createAsaasPayment(c.env, {
          customer: asaasCustomer.id,
          billingType,
          value: parsed.amount,
          dueDate: dueDate,
          description: parsed.description || `Cobrança VFIT - ${payer.full_name}`,
          externalReference: id,
        })
      } catch (err: unknown) {
        // Fallback: se PIX falhar com "chave Pix", tentar com UNDEFINED (cliente escolhe)
        if (err instanceof AsaasApiError && parsed.payment_method === 'pix') {
          const msg = err.message.toLowerCase()
          if (msg.includes('chave pix') || msg.includes('pix key') || msg.includes('invalid_billingtype')) {
            console.warn('[Payments] PIX failed, retrying with UNDEFINED:', err.message)
            billingType = 'UNDEFINED'
            usedFallback = true
            asaasPayment = await createAsaasPayment(c.env, {
              customer: asaasCustomer.id,
              billingType: 'UNDEFINED',
              value: parsed.amount,
              dueDate: dueDate,
              description: parsed.description || `Cobrança VFIT - ${payer.full_name}`,
              externalReference: id,
            })
          } else {
            throw err
          }
        } else {
          throw err
        }
      }

      asaasPaymentId = asaasPayment.id
      invoiceUrl = asaasPayment.invoiceUrl || null

      // 3. Se PIX (e não fallback), buscar QR Code
      if (parsed.payment_method === 'pix' && !usedFallback && asaasPayment.id) {
        try {
          const qr = await getPixQrCode(c.env, asaasPayment.id)
          pixData = {
            qrCode: qr.encodedImage,
            payload: qr.payload,
            expirationDate: qr.expirationDate,
          }
        } catch (err) {
          console.warn('[Payments] PIX QR Code fetch failed:', err)
        }
      }

      if (usedFallback) {
        console.log(`[Payments] Asaas payment created with UNDEFINED fallback: ${asaasPayment.id} for ${payer.email}`)
      } else {
        console.log(`[Payments] Asaas payment created: ${asaasPayment.id} for ${payer.email}`)
      }
    } catch (err: unknown) {
      if (err instanceof AsaasApiError) {
        console.error(`[Payments] Asaas error: ${err.message}`, err.errors)
        // Traduzir erros comuns do Asaas para mensagens amigáveis
        const msg = err.message.toLowerCase()
        if (msg.includes('chave pix') || msg.includes('pix key')) {
          throw new BadRequestError(
            'PIX indisponível. Habilite o PIX em: Asaas → Minha Conta → Configurações do Sistema. ' +
            'Ou use outro método de pagamento (boleto ou cartão).'
          )
        }
        if (msg.includes('cpf') || msg.includes('cnpj')) {
          throw new BadRequestError(
            'CPF/CNPJ do cliente é inválido ou não informado. Atualize os dados do aluno antes de criar a cobrança.'
          )
        }
        if (msg.includes('customer') && msg.includes('not found')) {
          throw new BadRequestError(
            'Cliente não encontrado no Asaas. Verifique os dados do aluno e tente novamente.'
          )
        }
        throw new BadRequestError(`Erro Asaas: ${err.message}`)
      }
      console.error('[Payments] Asaas integration error:', err)
      // Continua criando o registro local mesmo sem Asaas
    }
  }

  await pgQuery(c.env, `
    INSERT INTO payments (
      id, payer_id, recipient_id, amount, commission_amount, platform_fee, net_amount,
      payment_method, due_date, description, split_data, asaas_payment_id, invoice_url,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
  `, [
    id, parsed.payer_id, personalId, parsed.amount,
    commissionAmount, platformFee, netAmount,
    parsed.payment_method, dueDate,
    parsed.description || null, JSON.stringify(splitData),
    asaasPaymentId, invoiceUrl, now,
  ])

  // Notificar aluno via push + in-app
  await notifyEvent(c.env, parsed.payer_id, 'payment.charge.created', {
    amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount),
    method: String(parsed.payment_method).toUpperCase(),
    paymentId: id,
  }).catch(() => {}) // best-effort

  return created({
    id,
    amount: parsed.amount,
    platform_fee: platformFee,
    commission: commissionAmount,
    net_amount: netAmount,
    status: 'pending',
    payment_method: parsed.payment_method,
    due_date: dueDate,
    asaas_payment_id: asaasPaymentId,
    invoice_url: invoiceUrl,
    pix: pixData,
  })
})

// ============================================
// POST /payments/link — Criar cobrança e retornar link de WhatsApp
// ============================================
payments.post('/link', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = createPaymentLinkSchema.parse(body)

  if (!c.env.ASAAS_API_KEY) {
    throw new BadRequestError('Integração Asaas não configurada')
  }

  const { rows: roleRows } = await pgQuery<{ role: string }>(
    c.env,
    'SELECT role FROM users WHERE id = $1',
    [personalId]
  )
  const isAdmin = roleRows[0]?.role === 'admin' || roleRows[0]?.role === 'super_admin'

  if (!isAdmin) {
    const { rows: studentRows } = await pgQuery<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [parsed.payer_id, personalId]
    )
    if (studentRows.length === 0) {
      throw new ForbiddenError('Aluno não pertence ao seu perfil')
    }
  }

  const { rows: payerRows } = await pgQuery<{
    id: string
    email: string
    full_name: string
    cpf: string
    phone: string | null
  }>(
    c.env,
    'SELECT id, email, full_name, cpf, phone FROM users WHERE id = $1 LIMIT 1',
    [parsed.payer_id]
  )

  if (payerRows.length === 0) throw new NotFoundError('Aluno')
  const payer = payerRows[0]

  const platformFee = Math.round(parsed.amount * FEES.platform_fee_percentage) / 100
  const commissionAmount = await calculateAffiliateCommission(c.env, personalId, parsed.amount)
  const netAmount = parsed.amount - platformFee

  const id = generateId()
  const now = new Date().toISOString()
  const dueDate = parsed.due_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const splitData = {
    total: parsed.amount,
    platform_fee: platformFee,
    platform_fee_pct: FEES.platform_fee_percentage,
    commission: commissionAmount,
    commission_note: 'Custo da plataforma, não descontado do personal',
    net_to_personal: netAmount,
  }

  const asaasCustomer = await getOrCreateCustomer(c.env, {
    name: payer.full_name,
    email: payer.email,
    cpfCnpj: payer.cpf,
    phone: payer.phone || undefined,
    externalReference: payer.id,
    notificationDisabled: true,
  })

  await pgQuery(c.env, `
    INSERT INTO asaas_customers (id, user_id, personal_id, asaas_customer_id, name, email, cpf_cnpj, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, personal_id) DO UPDATE SET asaas_customer_id = $4, updated_at = NOW()
  `, [generateId(), payer.id, personalId, asaasCustomer.id, payer.full_name, payer.email, payer.cpf, payer.phone])

  let billingType = mapPaymentMethod(parsed.payment_method)
  let usedFallback = false
  let asaasPayment: { id: string; invoiceUrl?: string }

  try {
    asaasPayment = await createAsaasPayment(c.env, {
      customer: asaasCustomer.id,
      billingType,
      value: parsed.amount,
      dueDate,
      description: parsed.description || `Cobrança VFIT - ${payer.full_name}`,
      externalReference: id,
    })
  } catch (err: unknown) {
    if (err instanceof AsaasApiError && parsed.payment_method === 'pix') {
      const msg = err.message.toLowerCase()
      if (msg.includes('chave pix') || msg.includes('pix key') || msg.includes('invalid_billingtype')) {
        billingType = 'UNDEFINED'
        usedFallback = true
        asaasPayment = await createAsaasPayment(c.env, {
          customer: asaasCustomer.id,
          billingType: 'UNDEFINED',
          value: parsed.amount,
          dueDate,
          description: parsed.description || `Cobrança VFIT - ${payer.full_name}`,
          externalReference: id,
        })
      } else {
        throw err
      }
    } else {
      throw err
    }
  }

  const invoiceUrl = asaasPayment.invoiceUrl || null

  await pgQuery(c.env, `
    INSERT INTO payments (
      id, payer_id, recipient_id, amount, commission_amount, platform_fee, net_amount,
      payment_method, due_date, description, split_data, asaas_payment_id, invoice_url,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
  `, [
    id,
    parsed.payer_id,
    personalId,
    parsed.amount,
    commissionAmount,
    platformFee,
    netAmount,
    parsed.payment_method,
    dueDate,
    parsed.description || null,
    JSON.stringify(splitData),
    asaasPayment.id,
    invoiceUrl,
    now,
  ])

  await notifyEvent(c.env, parsed.payer_id, 'payment.charge.created', {
    amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount),
    method: String(parsed.payment_method).toUpperCase(),
    paymentId: id,
  }).catch(() => {})

  const rawPhone = (payer.phone || '').replace(/\D/g, '')
  const normalizedPhone = rawPhone ? (rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`) : null
  const messageTemplate = (parsed.message_template || 'Olá {nome}! Segue o link para pagamento: {link}').trim()
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount)
  const messageText = messageTemplate
    .replace(/\{nome\}/g, payer.full_name || 'Aluno')
    .replace(/\{link\}/g, invoiceUrl || '')
    .replace(/\{valor\}/g, formattedAmount)
    .replace(/\{vencimento\}/g, dueDate)
  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(messageText)}`
    : null

  return created({
    payment_id: id,
    asaas_payment_id: asaasPayment.id,
    invoice_url: invoiceUrl,
    whatsapp_url: whatsappUrl,
    whatsapp_phone: normalizedPhone,
    message_preview: messageText,
    fallback: usedFallback,
    amount: parsed.amount,
    due_date: dueDate,
  })
})

// ============================================
// GET /payments — Listar (personal)
// ============================================
payments.get('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  // Back-compat: aceitar sort no formato "campo:direcao" (ex: created_at:desc)
  const sortRaw = url.searchParams.get('sort') || undefined
  let sort = sortRaw
  let order = url.searchParams.get('order') || undefined
  if (sortRaw && sortRaw.includes(':')) {
    const [field, dir] = sortRaw.split(':')
    sort = field || undefined
    if (!order && (dir === 'asc' || dir === 'desc')) order = dir
  }

  const query = listPaymentsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    status: url.searchParams.get('status') || undefined,
    payment_method: url.searchParams.get('payment_method') || undefined,
    payer_id: url.searchParams.get('payer_id') || undefined,
    date_from: url.searchParams.get('date_from') || undefined,
    date_to: url.searchParams.get('date_to') || undefined,
    sort,
    order,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['p.recipient_id = $1']
  const params: unknown[] = [personalId]
  let idx = 2

  if (query.status) {
    conditions.push(`p.status = $${idx}`)
    params.push(query.status)
    idx++
  }
  if (query.payment_method) {
    conditions.push(`p.payment_method = $${idx}`)
    params.push(query.payment_method)
    idx++
  }
  if (query.payer_id) {
    conditions.push(`p.payer_id = $${idx}`)
    params.push(query.payer_id)
    idx++
  }
  if (query.date_from) {
    conditions.push(`p.created_at >= $${idx}`)
    params.push(query.date_from)
    idx++
  }
  if (query.date_to) {
    conditions.push(`p.created_at <= $${idx}::date + interval '1 day'`)
    params.push(query.date_to)
    idx++
  }

  const where = conditions.join(' AND ')
  const sortMap: Record<string, string> = {
    created_at: 'p.created_at', due_date: 'p.due_date',
    amount: 'p.amount', status: 'p.status',
  }
  const sortField = sortMap[query.sort] || 'p.created_at'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env, `SELECT COUNT(*)::int as count FROM payments p WHERE ${where}`, params
  )

  const { rows } = await pgQuery<PaymentRow>(
    c.env,
    `SELECT p.*, u.full_name as payer_name
     FROM payments p
     JOIN users u ON u.id = p.payer_id
     WHERE ${where}
     ORDER BY ${sortField} ${sortOrder} NULLS LAST
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  // Sincronizar status de pagamentos pendentes com Asaas API
  await syncPendingPaymentsStatus(c.env, rows)

  return success({
    payments: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// GET /payments/stats — Estatísticas financeiras (personal)
// ============================================
payments.get('/stats', requireType('personal'), async (c) => {
  const personalId = c.get('userId')

  const { rows } = await pgQuery<{
    total_revenue: number
    total_received: number
    total_pending: number
    total_overdue: number
    total_platform_fees: number
    total_commissions: number
    payment_count: number
  }>(c.env, `
    SELECT
      COALESCE(SUM(amount), 0)::float as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN net_amount ELSE 0 END), 0)::float as total_received,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::float as total_pending,
      COALESCE(SUM(CASE WHEN status = 'pending' AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0)::float as total_overdue,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN platform_fee ELSE 0 END), 0)::float as total_platform_fees,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN commission_amount ELSE 0 END), 0)::float as total_commissions,
      COUNT(*)::int as payment_count
    FROM payments WHERE recipient_id = $1
  `, [personalId])

  // Revenue por mês (últimos 6 meses)
  const { rows: monthly } = await pgQuery<{ month: string; revenue: number; count: number }>(
    c.env,
    `SELECT TO_CHAR(paid_at, 'YYYY-MM') as month,
            SUM(net_amount)::float as revenue,
            COUNT(*)::int as count
     FROM payments
     WHERE recipient_id = $1 AND status = 'confirmed'
       AND paid_at >= NOW() - INTERVAL '6 months'
     GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
     ORDER BY month DESC`,
    [personalId]
  )

  return success({
    summary: rows[0] || {},
    monthly_revenue: monthly,
  })
})

// ============================================
// GET /payments/dashboard — KPIs financeiros (personal)
// ============================================
payments.get('/dashboard', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const cacheKey = `payments:dashboard:${personalId}`

  const cached = await c.env.KV_CACHE.get(cacheKey, 'json') as {
    month: {
      current_revenue: number
      previous_revenue: number
      growth_percent: number
      average_ticket: number
    }
    total_received: number
    by_method: Array<{ payment_method: string; amount: number; count: number }>
    top_students: Array<{ student_id: string; student_name: string; revenue: number; payments: number }>
  } | null

  if (cached) return success(cached)

  const { rows: summaryRows } = await pgQuery<{
    current_revenue: number
    previous_revenue: number
    average_ticket: number
    total_received: number
  }>(c.env, `
    SELECT
      COALESCE(SUM(CASE
        WHEN status = 'confirmed'
         AND paid_at >= DATE_TRUNC('month', NOW())
         AND paid_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        THEN net_amount ELSE 0 END), 0)::float as current_revenue,
      COALESCE(SUM(CASE
        WHEN status = 'confirmed'
         AND paid_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
         AND paid_at < DATE_TRUNC('month', NOW())
        THEN net_amount ELSE 0 END), 0)::float as previous_revenue,
      COALESCE(AVG(CASE
        WHEN status = 'confirmed'
         AND paid_at >= DATE_TRUNC('month', NOW())
         AND paid_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        THEN net_amount ELSE NULL END), 0)::float as average_ticket,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN net_amount ELSE 0 END), 0)::float as total_received
    FROM payments
    WHERE recipient_id = $1
  `, [personalId])

  const { rows: byMethodRows } = await pgQuery<{ payment_method: string; amount: number; count: number }>(
    c.env,
    `SELECT payment_method,
            COALESCE(SUM(net_amount), 0)::float as amount,
            COUNT(*)::int as count
     FROM payments
     WHERE recipient_id = $1 AND status = 'confirmed'
     GROUP BY payment_method
     ORDER BY amount DESC`,
    [personalId]
  )

  const { rows: topStudentsRows } = await pgQuery<{
    student_id: string
    student_name: string
    revenue: number
    payments: number
  }>(
    c.env,
    `SELECT p.payer_id as student_id,
            COALESCE(u.full_name, 'Aluno') as student_name,
            COALESCE(SUM(p.net_amount), 0)::float as revenue,
            COUNT(*)::int as payments
     FROM payments p
     LEFT JOIN users u ON u.id = p.payer_id
     WHERE p.recipient_id = $1 AND p.status = 'confirmed'
     GROUP BY p.payer_id, u.full_name
     ORDER BY revenue DESC
     LIMIT 5`,
    [personalId]
  )

  const summary = summaryRows[0] || {
    current_revenue: 0,
    previous_revenue: 0,
    average_ticket: 0,
    total_received: 0,
  }

  const growthPercent = summary.previous_revenue > 0
    ? Number((((summary.current_revenue - summary.previous_revenue) / summary.previous_revenue) * 100).toFixed(2))
    : (summary.current_revenue > 0 ? 100 : 0)

  const payload = {
    month: {
      current_revenue: Number(summary.current_revenue || 0),
      previous_revenue: Number(summary.previous_revenue || 0),
      growth_percent: growthPercent,
      average_ticket: Number(summary.average_ticket || 0),
    },
    total_received: Number(summary.total_received || 0),
    by_method: byMethodRows,
    top_students: topStudentsRows,
  }

  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 })
  return success(payload)
})

// ============================================
// GET /payments/dashboard/chart — Séries de gráfico (personal)
// ============================================
payments.get('/dashboard/chart', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const cacheKey = `payments:dashboard:chart:${personalId}`

  const cached = await c.env.KV_CACHE.get(cacheKey, 'json') as {
    daily_30_days: Array<{ date: string; revenue: number }>
    monthly_12_months: Array<{ month: string; revenue: number }>
  } | null

  if (cached) return success(cached)

  const { rows: dailyRows } = await pgQuery<{ date: string; revenue: number }>(
    c.env,
    `SELECT TO_CHAR(d.day, 'YYYY-MM-DD') as date,
            COALESCE(SUM(p.net_amount), 0)::float as revenue
     FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') d(day)
     LEFT JOIN payments p
       ON p.recipient_id = $1
      AND p.status = 'confirmed'
      AND p.paid_at::date = d.day::date
     GROUP BY d.day
     ORDER BY d.day ASC`,
    [personalId]
  )

  const { rows: monthlyRows } = await pgQuery<{ month: string; revenue: number }>(
    c.env,
    `SELECT TO_CHAR(m.month, 'YYYY-MM') as month,
            COALESCE(SUM(p.net_amount), 0)::float as revenue
     FROM generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) m(month)
     LEFT JOIN payments p
       ON p.recipient_id = $1
      AND p.status = 'confirmed'
      AND DATE_TRUNC('month', p.paid_at) = m.month
     GROUP BY m.month
     ORDER BY m.month ASC`,
    [personalId]
  )

  const payload = {
    daily_30_days: dailyRows,
    monthly_12_months: monthlyRows,
  }

  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 })
  return success(payload)
})

// ============================================
// GET /payments/dashboard/pending — Cobranças pendentes (personal)
// ============================================
payments.get('/dashboard/pending', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const cacheKey = `payments:dashboard:pending:${personalId}`

  const cached = await c.env.KV_CACHE.get(cacheKey, 'json') as {
    pending: Array<{
      id: string
      payer_id: string
      student_name: string
      amount: number
      due_date: string | null
      payment_method: string
      invoice_url: string | null
      is_overdue: boolean
      days_overdue: number
    }>
    totals: {
      pending_count: number
      pending_amount: number
      overdue_count: number
      overdue_amount: number
    }
  } | null

  if (cached) return success(cached)

  const { rows } = await pgQuery<{
    id: string
    payer_id: string
    student_name: string
    amount: number
    due_date: string | null
    payment_method: string
    invoice_url: string | null
    is_overdue: boolean
    days_overdue: number
  }>(
    c.env,
    `SELECT p.id,
            p.payer_id,
            COALESCE(u.full_name, 'Aluno') as student_name,
            p.amount::float as amount,
            p.due_date,
            p.payment_method,
            p.invoice_url,
            (p.due_date IS NOT NULL AND p.due_date < CURRENT_DATE) as is_overdue,
            CASE
              WHEN p.due_date IS NOT NULL AND p.due_date < CURRENT_DATE
                THEN (CURRENT_DATE - p.due_date)::int
              ELSE 0
            END as days_overdue
     FROM payments p
     LEFT JOIN users u ON u.id = p.payer_id
     WHERE p.recipient_id = $1
       AND p.status = 'pending'
     ORDER BY is_overdue DESC, p.due_date ASC NULLS LAST, p.created_at DESC
     LIMIT 100`,
    [personalId]
  )

  const pendingAmount = rows.reduce((acc, row) => acc + (row.amount || 0), 0)
  const overdueRows = rows.filter((row) => row.is_overdue)
  const overdueAmount = overdueRows.reduce((acc, row) => acc + (row.amount || 0), 0)

  const payload = {
    pending: rows,
    totals: {
      pending_count: rows.length,
      pending_amount: Number(pendingAmount.toFixed(2)),
      overdue_count: overdueRows.length,
      overdue_amount: Number(overdueAmount.toFixed(2)),
    },
  }

  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 })
  return success(payload)
})

// ============================================
// GET /payments/export — Exportar relatório financeiro (CSV/PDF)
// ============================================
payments.get('/export', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const format = (url.searchParams.get('format') || 'csv').toLowerCase()
  const period = (url.searchParams.get('period') || 'month').toLowerCase()

  if (format !== 'csv' && format !== 'pdf') {
    throw new BadRequestError('Formato inválido. Use: csv ou pdf')
  }
  if (period !== 'month' && period !== 'quarter' && period !== 'year') {
    throw new BadRequestError('Período inválido. Use: month, quarter ou year')
  }

  const now = new Date()
  const periodStart = new Date(now)
  if (period === 'month') periodStart.setMonth(periodStart.getMonth() - 1)
  if (period === 'quarter') periodStart.setMonth(periodStart.getMonth() - 3)
  if (period === 'year') periodStart.setFullYear(periodStart.getFullYear() - 1)

  const { rows } = await pgQuery<{
    id: string
    student_name: string
    amount: number
    net_amount: number
    status: string
    payment_method: string
    due_date: string | null
    paid_at: string | null
    created_at: string
    invoice_url: string | null
  }>(
    c.env,
    `SELECT p.id,
            COALESCE(u.full_name, 'Aluno') as student_name,
            p.amount::float as amount,
            p.net_amount::float as net_amount,
            p.status,
            p.payment_method,
            p.due_date,
            p.paid_at,
            p.created_at,
            p.invoice_url
     FROM payments p
     LEFT JOIN users u ON u.id = p.payer_id
     WHERE p.recipient_id = $1
       AND p.created_at >= $2
     ORDER BY p.created_at DESC
     LIMIT 5000`,
    [personalId, periodStart.toISOString()]
  )

  const generatedAt = new Date().toISOString()
  const dateLabel = generatedAt.slice(0, 10)

  if (format === 'csv') {
    const csv = buildPaymentsCsv(rows)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="relatorio-financeiro-${period}-${dateLabel}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const pdfBytes = await buildPaymentsPdf(rows, period)
  const pdfBody = pdfBytes as unknown as BodyInit
  return new Response(pdfBody, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-financeiro-${period}-${dateLabel}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
})

// ============================================
// GET /payments/my — Meus pagamentos (student)
// ============================================
payments.get('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const url = new URL(c.req.url)

  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env, 'SELECT COUNT(*)::int as count FROM payments WHERE payer_id = $1', [studentId]
  )

  const { rows } = await pgQuery<PaymentRow>(
    c.env,
    `SELECT p.id, p.amount, p.status, p.payment_method, p.due_date, p.paid_at,
            p.invoice_url, p.receipt_url, p.description, p.created_at,
            p.asaas_payment_id, p.recipient_id, p.payer_id, p.commission_amount,
            p.platform_fee, p.net_amount, p.currency, p.updated_at,
            pu.full_name as recipient_name
     FROM payments p
     LEFT JOIN users pu ON pu.id = p.recipient_id
     WHERE p.payer_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, perPage, offset]
  )

  // Sincronizar status de pagamentos pendentes com Asaas API
  await syncPendingPaymentsStatus(c.env, rows)

  return success({
    payments: rows,
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// PIX TRANSFERS — Saques para Personal
// ============================================

// GET /payments/balance — Saldo disponível para saque
payments.get('/balance', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole')
  const isSuperAdmin = userRole === 'super_admin'

  // Calcular saldo baseado em pagamentos confirmados - saques feitos
  const { rows } = await pgQuery<{
    total_received: number; total_withdrawn: number
  }>(c.env, `
    SELECT
      COALESCE((SELECT SUM(net_amount) FROM payments WHERE recipient_id = $1 AND status = 'confirmed'), 0)::float as total_received,
      COALESCE((SELECT SUM(amount) FROM pix_transfers WHERE personal_id = $1 AND status IN ('completed', 'processing', 'pending')), 0)::float as total_withdrawn
  `, [personalId])

  const internalBalance = (rows[0]?.total_received ?? 0) - (rows[0]?.total_withdrawn ?? 0)

  // Saldo real na conta Asaas (fonte de verdade para saques)
  let asaasBalance: number | null = null
  if (c.env.ASAAS_API_KEY) {
    try {
      const bal = await getBalance(c.env)
      asaasBalance = bal?.balance ?? null
    } catch { /* ignore */ }
  }

  // Saldo disponível para saque
  // Super admin: usa saldo Asaas direto (receita da plataforma, não tem payments como recipient)
  // Personal: menor entre cálculo interno e saldo real Asaas (gateway desconta taxas)
  let availableForWithdraw: number
  if (isSuperAdmin && asaasBalance !== null) {
    availableForWithdraw = Math.max(0, asaasBalance)
  } else {
    availableForWithdraw = asaasBalance !== null
      ? Math.min(Math.max(0, internalBalance), asaasBalance)
      : Math.max(0, internalBalance)
  }

  return success({
    available_balance: availableForWithdraw,
    internal_balance: Math.max(0, internalBalance),
    total_received: rows[0]?.total_received ?? 0,
    total_withdrawn: rows[0]?.total_withdrawn ?? 0,
    asaas_balance: asaasBalance,
  })
})

// POST /payments/transfers/pix — Solicitar saque PIX
payments.post('/transfers/pix', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole')
  const isSuperAdmin = userRole === 'super_admin'
  const body = await c.req.json()
  const parsed = requestPixTransferSchema.parse(body)

  // Verificar saldo interno (pagamentos - saques)
  const { rows: balanceRows } = await pgQuery<{ total_received: number; total_withdrawn: number }>(
    c.env, `
    SELECT
      COALESCE((SELECT SUM(net_amount) FROM payments WHERE recipient_id = $1 AND status = 'confirmed'), 0)::float as total_received,
      COALESCE((SELECT SUM(amount) FROM pix_transfers WHERE personal_id = $1 AND status IN ('completed', 'processing', 'pending')), 0)::float as total_withdrawn
  `, [personalId])

  const internalAvailable = (balanceRows[0]?.total_received ?? 0) - (balanceRows[0]?.total_withdrawn ?? 0)

  // Super admin: SEM LIMITES — pode sacar qualquer valor a qualquer momento
  // O saldo Asaas em tempo real é o saldo disponível para o Victor (super admin)
  // Não precisa validar saldo interno nem saldo Asaas — o Asaas rejeita se não tiver
  if (!isSuperAdmin) {
    // Personal: validar saldo interno
    if (parsed.amount > internalAvailable) {
      throw new BadRequestError(`Saldo insuficiente. Disponível: R$${internalAvailable.toFixed(2)}`)
    }

    // Personal: verificar saldo REAL no Asaas (gateway desconta taxas)
    if (c.env.ASAAS_API_KEY) {
      try {
        const asaasBal = await getBalance(c.env)
        if (asaasBal && parsed.amount > asaasBal.balance) {
          throw new BadRequestError(
            `Saldo Asaas insuficiente. Disponível no Asaas: R$${asaasBal.balance.toFixed(2)}. ` +
            `O Asaas desconta taxas de gateway sobre cada cobrança recebida.`
          )
        }
      } catch (err) {
        if (err instanceof BadRequestError) throw err
        console.warn('[Transfers] Could not verify Asaas balance:', err)
      }
    }
  }

  const id = generateId()
  const now = new Date().toISOString()
  const pixKeyType = mapPixKeyType(parsed.pix_key)

  let asaasTransferId: string | null = null
  let transferStatus = 'pending'
  let fee = 0

  // Criar transferência no Asaas (OBRIGATÓRIO — não salvar sem asaas_transfer_id)
  if (c.env.ASAAS_API_KEY) {
    try {
      const transfer = await createPixTransfer(c.env, {
        value: parsed.amount,
        pixAddressKey: parsed.pix_key,
        pixAddressKeyType: pixKeyType.toUpperCase() as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP',
        description: parsed.description || `Saque VFIT - ${personalId}`,
      })

      asaasTransferId = transfer.id
      fee = transfer.transferFee || 0
      transferStatus = transfer.status === 'DONE' ? 'completed' : 'processing'
      console.log(`[Transfers] PIX transfer created: ${transfer.id}, status: ${transfer.status}`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error('[Transfers] PIX transfer error:', errMsg)
      // NÃO salvar como pending sem asaas_transfer_id — isso trava o saldo
      throw new BadRequestError(
        `Falha ao criar transferência PIX no Asaas: ${errMsg}. Tente novamente em alguns minutos.`
      )
    }
  } else {
    throw new BadRequestError('Gateway de pagamento não configurado. Contate o suporte.')
  }

  const netAmount = parsed.amount - fee

  await pgQuery(c.env, `
    INSERT INTO pix_transfers (
      id, personal_id, asaas_transfer_id, pix_key, pix_key_type,
      amount, fee, net_amount, status, requested_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $10)
  `, [
    id, personalId, asaasTransferId, parsed.pix_key, pixKeyType.toLowerCase(),
    parsed.amount, fee, netAmount, transferStatus, now,
  ])

  // Notificação imediata (push + in-app) sobre o saque criado
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount)
  await notifyEvent(
    c.env,
    personalId,
    transferStatus === 'completed' ? 'payment.transfer.completed' : 'payment.transfer.requested',
    { amount: formatted }
  ).catch(() => {})

  return created({
    id,
    amount: parsed.amount,
    fee,
    net_amount: netAmount,
    pix_key: parsed.pix_key,
    pix_key_type: pixKeyType,
    status: transferStatus,
    asaas_transfer_id: asaasTransferId,
  })
})

// GET /payments/transfers — Listar transferências/saques
payments.get('/transfers', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    'SELECT COUNT(*)::int as count FROM pix_transfers WHERE personal_id = $1',
    [personalId]
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT id, personal_id, asaas_transfer_id, pix_key, pix_key_type,
            amount::float, fee::float, net_amount::float,
            status, failed_reason, requested_at, completed_at,
            created_at, updated_at
     FROM pix_transfers WHERE personal_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [personalId, perPage, offset]
  )

  return success({
    transfers: rows,
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// POST /payments/:id/pay — Checkout: aluno paga pagamento pendente
// Suporta PIX (QR code), Cartão de Crédito (cobrança direta), Boleto
// ============================================
payments.post('/:id{[0-9a-f-]{36}}/pay', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const paymentId = c.req.param('id')
  const body = await c.req.json()
  const parsed = checkoutPaySchema.parse(body)

  // 1. Buscar pagamento com dados do pagador
  const { rows } = await pgQuery<PaymentRow & {
    payer_email: string; payer_cpf: string | null; payer_phone: string | null
  }>(
    c.env,
    `SELECT p.*, u.full_name as payer_name, u.email as payer_email,
            u.cpf as payer_cpf, u.phone as payer_phone,
            pu.full_name as recipient_name
     FROM payments p
     JOIN users u ON u.id = p.payer_id
     JOIN users pu ON pu.id = p.recipient_id
     WHERE p.id = $1 LIMIT 1`,
    [paymentId]
  )
  if (rows.length === 0) throw new NotFoundError('Pagamento')
  const payment = rows[0]

  // 2. Verificar permissão
  if (userType === 'student' && payment.payer_id !== userId) {
    throw new ForbiddenError('Sem permissão para pagar este pagamento')
  }
  if (userType === 'personal' && payment.recipient_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  // 3. Verificar status
  if (payment.status !== 'pending') {
    throw new BadRequestError(`Pagamento não está pendente (status: ${payment.status})`)
  }

  if (!c.env.ASAAS_API_KEY) {
    throw new BadRequestError('Gateway de pagamento não configurado')
  }

  // 4. CPF do pagador (DB ou request)
  const payerCpf = payment.payer_cpf || parsed.cpf || parsed.holder_cpf
  if (!payerCpf) {
    throw new BadRequestError('CPF é obrigatório para pagamento. Informe seu CPF.')
  }

  // 5. Se já existe pagamento Asaas com o MESMO método, reutilizar dados
  if (payment.asaas_payment_id && payment.payment_method === parsed.payment_method) {
    try {
      const existingPayment = await getAsaasPayment(c.env, payment.asaas_payment_id)

      if (existingPayment.status === 'RECEIVED' || existingPayment.status === 'CONFIRMED') {
        // Já pago — atualizar nosso DB e retornar
        await pgQuery(c.env, `
          UPDATE payments SET status = 'confirmed', paid_at = $1, updated_at = $1 WHERE id = $2
        `, [new Date().toISOString(), payment.id])
        return success({ payment_id: payment.id, status: 'confirmed', payment_method: parsed.payment_method })
      }

      // PIX: retornar QR code existente
      if (parsed.payment_method === 'pix') {
        const qr = await getPixQrCode(c.env, payment.asaas_payment_id)
        return success({
          payment_id: payment.id,
          asaas_payment_id: payment.asaas_payment_id,
          status: 'pending',
          payment_method: 'pix',
          pix: { qrCode: qr.encodedImage, payload: qr.payload, expirationDate: qr.expirationDate },
        })
      }

      // Boleto: retornar dados existentes
      if (parsed.payment_method === 'boleto') {
        return success({
          payment_id: payment.id,
          asaas_payment_id: payment.asaas_payment_id,
          status: 'pending',
          payment_method: 'boleto',
          boleto: {
            identificationField: existingPayment.identificationField || null,
            bankSlipUrl: existingPayment.bankSlipUrl || null,
            nossoNumero: existingPayment.nossoNumero || null,
          },
        })
      }
    } catch (err) {
      console.warn('[Checkout] Error fetching existing Asaas payment, creating new:', err)
    }
  }

  // 6. Se existe pagamento Asaas com método DIFERENTE, cancelar o anterior
  if (payment.asaas_payment_id && payment.payment_method !== parsed.payment_method) {
    try {
      await cancelAsaasPayment(c.env, payment.asaas_payment_id)
      console.log(`[Checkout] Cancelled old Asaas payment ${payment.asaas_payment_id} (method change)`)
    } catch (err) {
      console.warn('[Checkout] Failed to cancel old Asaas payment:', err)
    }
  }

  // 7. Garantir customer Asaas com notificações desabilitadas
  const asaasCustomer = await getOrCreateCustomer(c.env, {
    name: payment.payer_name || 'Cliente',
    email: payment.payer_email,
    cpfCnpj: payerCpf.replace(/\D/g, ''),
    phone: payment.payer_phone || undefined,
    externalReference: payment.payer_id,
    notificationDisabled: true,
  })

  // Salvar/atualizar customer Asaas
  await pgQuery(c.env, `
    INSERT INTO asaas_customers (id, user_id, personal_id, asaas_customer_id, name, email, cpf_cnpj, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, personal_id) DO UPDATE SET asaas_customer_id = $4, updated_at = NOW()
  `, [
    generateId(), payment.payer_id, payment.recipient_id,
    asaasCustomer.id, payment.payer_name, payment.payer_email,
    payerCpf, payment.payer_phone,
  ])

  // 8. Montar input Asaas
  const billingType = mapPaymentMethod(parsed.payment_method)
  const dueDate = payment.due_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const asaasInput: Record<string, unknown> = {
    customer: asaasCustomer.id,
    billingType,
    value: payment.amount,
    dueDate,
    description: payment.description || `Pagamento VFIT`,
    externalReference: payment.id,
    postalService: false,
  }

  // 9. Cartão de crédito: adicionar dados do cartão
  if (parsed.payment_method === 'credit_card') {
    if (parsed.credit_card_token) {
      asaasInput.creditCardToken = parsed.credit_card_token
    } else if (parsed.card_number) {
      asaasInput.creditCard = {
        holderName: parsed.card_holder_name,
        number: parsed.card_number.replace(/\D/g, ''),
        expiryMonth: parsed.expiry_month,
        expiryYear: parsed.expiry_year,
        ccv: parsed.ccv,
      }
      asaasInput.creditCardHolderInfo = {
        name: parsed.holder_name || parsed.card_holder_name,
        email: payment.payer_email,
        cpfCnpj: (parsed.holder_cpf || payerCpf).replace(/\D/g, ''),
        postalCode: (parsed.holder_postal_code || '').replace(/\D/g, ''),
        addressNumber: parsed.holder_address_number || '0',
        phone: (parsed.holder_phone || payment.payer_phone || '').replace(/\D/g, ''),
      }
    }
    // Parcelas
    if (parsed.installment_count && parsed.installment_count > 1) {
      asaasInput.installmentCount = parsed.installment_count
      asaasInput.installmentValue = Math.round((payment.amount / parsed.installment_count) * 100) / 100
    }
  }

  // 10. Criar pagamento no Asaas (com fallback PIX → UNDEFINED)
  let asaasPayment
  let checkoutUsedFallback = false
  try {
    asaasPayment = await createAsaasPayment(c.env, asaasInput as unknown as AsaasPaymentInput)
  } catch (err) {
    // Fallback: se PIX falhar com "chave Pix", tentar com UNDEFINED
    if (err instanceof AsaasApiError && parsed.payment_method === 'pix') {
      const msg = err.message.toLowerCase()
      if (msg.includes('chave pix') || msg.includes('pix key') || msg.includes('invalid_billingtype')) {
        console.warn('[Checkout] PIX failed, retrying with UNDEFINED:', err.message)
        asaasInput.billingType = 'UNDEFINED'
        checkoutUsedFallback = true
        try {
          asaasPayment = await createAsaasPayment(c.env, asaasInput as unknown as AsaasPaymentInput)
        } catch (err2) {
          if (err2 instanceof AsaasApiError) {
            throw new BadRequestError(`Erro no pagamento: ${err2.message}`)
          }
          throw err2
        }
      } else {
        throw new BadRequestError(`Erro no pagamento: ${err.message}`)
      }
    } else if (err instanceof AsaasApiError) {
      // Mensagens amigáveis para erros comuns
      const msg = err.message
      if (msg.includes('cartão') || msg.includes('credit card') || msg.includes('Card')) {
        throw new BadRequestError(`Erro no cartão: ${msg}. Verifique os dados e tente novamente.`)
      }
      throw new BadRequestError(`Erro no pagamento: ${msg}`)
    } else {
      throw err
    }
  }

  // 11. Montar resultado por método
  const isConfirmed = asaasPayment.status === 'CONFIRMED' || asaasPayment.status === 'RECEIVED'
  const result: Record<string, unknown> = {
    payment_id: payment.id,
    asaas_payment_id: asaasPayment.id,
    status: isConfirmed ? 'confirmed' : 'pending',
    payment_method: parsed.payment_method,
  }

  // Se usou fallback UNDEFINED, retornar invoice_url para o cliente pagar
  if (checkoutUsedFallback) {
    result.fallback = true
    result.invoice_url = asaasPayment.invoiceUrl || null
    result.message = 'PIX direto indisponível. Use o link de pagamento para escolher a forma de pagamento.'
  }

  // PIX: buscar QR Code (apenas se não usou fallback)
  if (parsed.payment_method === 'pix' && !checkoutUsedFallback) {
    try {
      const qr = await getPixQrCode(c.env, asaasPayment.id)
      result.pix = {
        qrCode: qr.encodedImage,
        payload: qr.payload,
        expirationDate: qr.expirationDate,
      }
    } catch (err) {
      console.warn('[Checkout] PIX QR Code failed:', err)
      result.pix = null
    }
  }

  // Boleto: retornar dados
  if (parsed.payment_method === 'boleto') {
    result.boleto = {
      identificationField: asaasPayment.identificationField || null,
      bankSlipUrl: asaasPayment.bankSlipUrl || null,
      nossoNumero: asaasPayment.nossoNumero || null,
    }
  }

  // Cartão: retornar dados do cartão (para feedback visual)
  if (parsed.payment_method === 'credit_card' && asaasPayment.creditCard) {
    result.credit_card = {
      number: asaasPayment.creditCard.creditCardNumber,
      brand: asaasPayment.creditCard.creditCardBrand,
      token: asaasPayment.creditCard.creditCardToken || null,
    }
  }

  // 12. Atualizar pagamento no banco com netValue real do Asaas
  const newStatus = isConfirmed ? 'confirmed' : 'pending'
  const now = new Date().toISOString()
  const realNetAmount = asaasPayment.netValue ?? payment.net_amount

  await pgQuery(c.env, `
    UPDATE payments SET
      asaas_payment_id = $1,
      payment_method = $2,
      status = $3,
      net_amount = $4,
      invoice_url = $5,
      paid_at = $6,
      updated_at = $7
    WHERE id = $8
  `, [
    asaasPayment.id,
    parsed.payment_method,
    newStatus,
    realNetAmount,
    asaasPayment.invoiceUrl || null,
    isConfirmed ? now : null,
    now,
    payment.id,
  ])

  // 13. Se confirmado (cartão), notificar personal + processar comissão
  if (isConfirmed) {
    await notifyPaymentReceived(
      c.env,
      payment.recipient_id,
      payment.payer_name || 'Aluno',
      payment.amount
    ).catch(() => {})

    // Processar comissão de afiliado
    await processAffiliateCommission(c.env, { ...payment, status: 'confirmed' }).catch((err) => {
      console.warn('[Checkout] Affiliate commission error:', err)
    })
  }

  return success(result)
})

// ============================================
// GET /payments/:id — Detalhes pagamento
// ============================================
payments.get('/:id{[0-9a-f-]{36}}', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const { rows } = await pgQuery<PaymentRow>(
    c.env,
    `SELECT p.*, u.full_name as payer_name, pu.full_name as recipient_name
     FROM payments p
     JOIN users u ON u.id = p.payer_id
     JOIN users pu ON pu.id = p.recipient_id
     WHERE p.id = $1 LIMIT 1`,
    [id]
  )
  if (rows.length === 0) throw new NotFoundError('Pagamento')

  const payment = rows[0]
  if (userType === 'personal' && payment.recipient_id !== userId) throw new ForbiddenError('Sem permissão')
  if (userType === 'student' && payment.payer_id !== userId) throw new ForbiddenError('Sem permissão')

  // Active polling: se status=pending e tem asaas_payment_id, verificar status na API Asaas em tempo real
  if (payment.status === 'pending' && payment.asaas_payment_id && c.env.ASAAS_API_KEY) {
    try {
      const asaasPayment = await getAsaasPayment(c.env, payment.asaas_payment_id)
      const asaasStatus = asaasPayment.status

      // Mapear status Asaas → nosso
      const confirmedStatuses = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']
      const isNowConfirmed = confirmedStatuses.includes(asaasStatus)

      if (isNowConfirmed) {
        const now = new Date().toISOString()
        await pgQuery(c.env, `
          UPDATE payments SET status = 'confirmed', paid_at = $1,
            invoice_url = COALESCE($2, invoice_url),
            receipt_url = COALESCE($3, receipt_url),
            updated_at = $4
          WHERE id = $5
        `, [now, asaasPayment.invoiceUrl || null, asaasPayment.transactionReceiptUrl || null, now, payment.id])

        ;(payment as any).status = 'confirmed'
        ;(payment as any).paid_at = now

        // Processar comissão de afiliado se aplicável
        if (payment.commission_amount > 0) {
          await processAffiliateCommission(c.env, payment).catch((e) =>
            console.error('[Polling] Affiliate commission error:', e)
          )
        }

        // Notificar personal via push
        const { rows: payerRows } = await pgQuery<{ full_name: string }>(
          c.env,
          'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
          [payment.payer_id]
        )
        const payerName = payerRows[0]?.full_name || 'Aluno'
        await notifyPaymentReceived(c.env, payment.recipient_id, payerName, payment.amount).catch(() => {})

        console.log(`[Polling] Payment ${payment.id} confirmed via Asaas API check (${asaasStatus})`)
      }
    } catch (err) {
      console.warn('[Polling] Asaas status check failed:', err)
      // Continua retornando dados do banco mesmo se Asaas falhar
    }
  }

  return success({ payment })
})

// ============================================
// PATCH /payments/:id — Atualizar status (personal - manual)
// ============================================
payments.patch('/:id{[0-9a-f-]{36}}', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole')
  const requestId = c.get('requestId')
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = updatePaymentStatusSchema.parse(body)

  // Verificar ownership
  const { rows } = await pgQuery<{ id: string; status: string }>(
    c.env,
    'SELECT id, status FROM payments WHERE id = $1 AND recipient_id = $2 LIMIT 1',
    [id, personalId]
  )
  if (rows.length === 0) throw new NotFoundError('Pagamento')

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${idx}`)
      params.push(value)
      idx++
    }
  }

  if (setClauses.length === 0) throw new BadRequestError('Nenhum campo para atualizar')

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(id)

  await pgQuery(c.env, `UPDATE payments SET ${setClauses.join(', ')} WHERE id = $${idx}`, params)

  await insertAuditLog(c.env, {
    actorUserId: personalId,
    actorRole: userRole || 'personal',
    action: 'payments.status_updated',
    targetType: 'payment',
    targetId: id,
    metadata: {
      changed_fields: Object.keys(parsed).filter((k) => (parsed as Record<string, unknown>)[k] !== undefined),
    },
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({ message: 'Pagamento atualizado' })
})

// ============================================
// DELETE /payments/:id — Cancelar pagamento (personal)
// ============================================
payments.delete('/:id{[0-9a-f-]{36}}', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole')
  const requestId = c.get('requestId')
  const id = c.req.param('id')

  const { rows } = await pgQuery<{ id: string; status: string }>(
    c.env,
    'SELECT id, status FROM payments WHERE id = $1 AND recipient_id = $2 LIMIT 1',
    [id, personalId]
  )
  if (rows.length === 0) throw new NotFoundError('Pagamento')
  if (rows[0].status === 'confirmed') {
    throw new BadRequestError('Pagamento confirmado não pode ser cancelado. Use reembolso.')
  }

  await pgQuery(c.env, `
    UPDATE payments SET status = 'cancelled', updated_at = $1 WHERE id = $2
  `, [new Date().toISOString(), id])

  await insertAuditLog(c.env, {
    actorUserId: personalId,
    actorRole: userRole || 'personal',
    action: 'payments.cancelled',
    targetType: 'payment',
    targetId: id,
    metadata: {},
    ipAddress: c.req.header('cf-connecting-ip') || null,
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return noContent()
})

// ============================================
// MARKETPLACE — Workout Plans
// ============================================

payments.post('/plans', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = createWorkoutPlanSchema.parse(body)

  const id = generateId()
  const now = new Date().toISOString()

  // Calcular total_exercises se source_workout_ids fornecidos
  let totalExercises = 0
  const sourceIds = parsed.source_workout_ids || []
  if (sourceIds.length > 0) {
    const { rows: exCount } = await pgQuery<{ count: number }>(
      c.env,
      `SELECT COUNT(*)::int as count FROM workout_exercises
       WHERE workout_id = ANY(SELECT id FROM workouts WHERE id = ANY($1::uuid[]) AND personal_id = $2 AND is_template = true)`,
      [`{${sourceIds.join(',')}}`, personalId]
    )
    totalExercises = exCount[0]?.count ?? 0
  }

  await pgQuery(c.env, `
    INSERT INTO workout_plans (
      id, created_by, title, description, category, difficulty,
      duration_weeks, workouts_per_week, price_brl, plan_content,
      thumbnail_url, preview_video_url, source_workout_ids, tags, total_exercises,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)
  `, [
    id, personalId, parsed.title, parsed.description, parsed.category,
    parsed.difficulty, parsed.duration_weeks, parsed.workouts_per_week,
    parsed.price_brl, JSON.stringify(parsed.plan_content),
    parsed.thumbnail_url || null, parsed.preview_video_url || null,
    JSON.stringify(sourceIds), JSON.stringify(parsed.tags || []),
    totalExercises, now,
  ])

  return created({ id, ...parsed, total_exercises: totalExercises })
})

payments.get('/plans', async (c) => {
  const url = new URL(c.req.url)
  const query = listWorkoutPlansQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    category: url.searchParams.get('category') || undefined,
    difficulty: url.searchParams.get('difficulty') || undefined,
    is_published: url.searchParams.get('is_published') || undefined,
    search: url.searchParams.get('search') || undefined,
    sort: url.searchParams.get('sort') || undefined,
    order: url.searchParams.get('order') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['wp.is_published = true']
  const params: unknown[] = []
  let idx = 1

  if (query.category) {
    conditions.push(`wp.category = $${idx}`)
    params.push(query.category)
    idx++
  }
  if (query.difficulty) {
    conditions.push(`wp.difficulty = $${idx}`)
    params.push(query.difficulty)
    idx++
  }
  if (query.search) {
    conditions.push(`(wp.title ILIKE $${idx} OR wp.description ILIKE $${idx})`)
    params.push(`%${query.search}%`)
    idx++
  }

  const where = conditions.join(' AND ')
  const sortMap: Record<string, string> = {
    created_at: 'wp.created_at', price_brl: 'wp.price_brl',
    total_sales: 'wp.total_sales', title: 'wp.title',
  }
  const sortField = sortMap[query.sort] || 'wp.created_at'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env, `SELECT COUNT(*)::int as count FROM workout_plans wp WHERE ${where}`, params
  )

  const { rows } = await pgQuery<WorkoutPlanRow>(
    c.env,
    `SELECT wp.id, wp.title, wp.description, wp.category, wp.difficulty,
            wp.duration_weeks, wp.workouts_per_week, wp.price_brl,
            wp.total_sales, wp.thumbnail_url, wp.created_at,
            u.full_name as creator_name
     FROM workout_plans wp
     JOIN users u ON u.id = wp.created_by
     WHERE ${where}
     ORDER BY ${sortField} ${sortOrder}
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    plans: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// GET /plans/my-plans — Meus planos criados (personal)
// ============================================
payments.get('/plans/my-plans', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    'SELECT COUNT(*)::int as count FROM workout_plans WHERE created_by = $1',
    [personalId]
  )

  const { rows } = await pgQuery<WorkoutPlanRow>(
    c.env,
    `SELECT wp.*, u.full_name as creator_name
     FROM workout_plans wp
     JOIN users u ON u.id = wp.created_by
     WHERE wp.created_by = $1
     ORDER BY wp.created_at DESC
     LIMIT $2 OFFSET $3`,
    [personalId, perPage, offset]
  )

  return success({
    plans: rows,
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /plans/my-purchases — Meus planos comprados
// ============================================
payments.get('/plans/my-purchases', async (c) => {
  const userId = c.get('userId')
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    'SELECT COUNT(*)::int as count FROM plan_purchases WHERE buyer_id = $1',
    [userId]
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT pp.id, pp.plan_id, pp.amount_paid, pp.purchased_at, pp.status, pp.delivered,
            pp.cloned_workout_ids,
            wp.title, wp.description, wp.category, wp.difficulty, wp.duration_weeks,
            wp.workouts_per_week, wp.thumbnail_url, wp.plan_content,
            u.full_name as creator_name
     FROM plan_purchases pp
     JOIN workout_plans wp ON wp.id = pp.plan_id
     JOIN users u ON u.id = wp.created_by
     WHERE pp.buyer_id = $1
     ORDER BY pp.purchased_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, perPage, offset]
  )

  return success({
    purchases: rows,
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

payments.get('/plans/:id', async (c) => {
  const id = c.req.param('id')

  const { rows } = await pgQuery<WorkoutPlanRow>(
    c.env,
    `SELECT wp.*, u.full_name as creator_name
     FROM workout_plans wp
     JOIN users u ON u.id = wp.created_by
     WHERE wp.id = $1 LIMIT 1`,
    [id]
  )
  if (rows.length === 0) throw new NotFoundError('Plano')

  return success({ plan: rows[0] })
})

payments.patch('/plans/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateWorkoutPlanSchema.parse(body)

  // Verificar ownership
  const { rows: existing } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM workout_plans WHERE id = $1 AND created_by = $2 LIMIT 1',
    [id, personalId]
  )
  if (existing.length === 0) throw new NotFoundError('Plano')

  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined) {
      if (key === 'plan_content') {
        setClauses.push(`${key} = $${idx}`)
        params.push(JSON.stringify(value))
      } else {
        setClauses.push(`${key} = $${idx}`)
        params.push(value)
      }
      idx++
    }
  }

  if (setClauses.length === 0) throw new BadRequestError('Nenhum campo')

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++
  params.push(id)

  await pgQuery(c.env, `UPDATE workout_plans SET ${setClauses.join(', ')} WHERE id = $${idx}`, params)

  return success({ message: 'Plano atualizado' })
})

payments.delete('/plans/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const id = c.req.param('id')

  const { rows } = await pgQuery<{ id: string; total_sales: number }>(
    c.env,
    'SELECT id, total_sales FROM workout_plans WHERE id = $1 AND created_by = $2 LIMIT 1',
    [id, personalId]
  )
  if (rows.length === 0) throw new NotFoundError('Plano')
  if (rows[0].total_sales > 0) {
    throw new BadRequestError('Plano com vendas não pode ser removido. Despublique em vez disso.')
  }

  await pgQuery(c.env, 'DELETE FROM workout_plans WHERE id = $1', [id])
  return noContent()
})

payments.post('/plans/:id/buy', async (c) => {
  const buyerId = c.get('userId')
  const planId = c.req.param('id')

  const { rows } = await pgQuery<WorkoutPlanRow>(
    c.env,
    'SELECT * FROM workout_plans WHERE id = $1 AND is_published = true LIMIT 1',
    [planId]
  )
  if (rows.length === 0) throw new NotFoundError('Plano')

  const plan = rows[0]

  // Verificar se já comprou
  const { rows: existingPurchase } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM plan_purchases WHERE plan_id = $1 AND buyer_id = $2 LIMIT 1',
    [planId, buyerId]
  )
  if (existingPurchase.length > 0) {
    throw new BadRequestError('Você já comprou este plano')
  }

  const creatorShare = Math.round(plan.price_brl * FEES.marketplace_creator_share) / 100
  const platformShare = plan.price_brl - creatorShare

  const purchaseId = generateId()
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    INSERT INTO plan_purchases (id, plan_id, buyer_id, amount_paid, creator_share, platform_share, purchased_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [purchaseId, planId, buyerId, plan.price_brl, creatorShare, platformShare, now])

  // Incrementar vendas
  await pgQuery(c.env, `
    UPDATE workout_plans
    SET total_sales = total_sales + 1, total_revenue = total_revenue + $1, updated_at = $2
    WHERE id = $3
  `, [plan.price_brl, now, planId])

  return created({
    purchase_id: purchaseId,
    plan_id: planId,
    amount_paid: plan.price_brl,
    creator_share: creatorShare,
    platform_share: platformShare,
  })
})

// ============================================
// SUBSCRIPTIONS — Cobranças Recorrentes
// ============================================

// POST /payments/subscriptions — Criar assinatura recorrente
payments.post('/subscriptions', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json()
  const parsed = createSubscriptionSchema.parse(body)

  // Verificar que payer é aluno do personal
  const { rows: studentRows } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [parsed.payer_id, personalId]
  )
  if (studentRows.length === 0) {
    throw new ForbiddenError('Aluno não pertence ao seu perfil')
  }

  // Buscar dados do aluno
  const { rows: payerRows } = await pgQuery<{
    id: string; email: string; full_name: string; cpf: string; phone: string | null
  }>(
    c.env,
    'SELECT id, email, full_name, cpf, phone FROM users WHERE id = $1 LIMIT 1',
    [parsed.payer_id]
  )
  if (payerRows.length === 0) throw new NotFoundError('Aluno')
  const payer = payerRows[0]

  // Calcular fees
  const platformFee = Math.round(parsed.amount * FEES.platform_fee_percentage) / 100
  const commissionAmount = await calculateAffiliateCommission(c.env, personalId, parsed.amount)
  // Comissão do afiliado é custo da PLATAFORMA, não do personal
  const netAmount = parsed.amount - platformFee

  const id = generateId()
  const now = new Date().toISOString()

  let asaasSubscriptionId: string | null = null

  // Criar assinatura no Asaas
  if (c.env.ASAAS_API_KEY) {
    try {
      const asaasCustomer = await getOrCreateCustomer(c.env, {
        name: payer.full_name,
        email: payer.email,
        cpfCnpj: payer.cpf,
        phone: payer.phone || undefined,
        externalReference: payer.id,
      })

      await pgQuery(c.env, `
        INSERT INTO asaas_customers (id, user_id, personal_id, asaas_customer_id, name, email, cpf_cnpj, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, personal_id) DO UPDATE SET asaas_customer_id = $4, updated_at = NOW()
      `, [generateId(), payer.id, personalId, asaasCustomer.id, payer.full_name, payer.email, payer.cpf, payer.phone])

      const asaasSub = await createAsaasSubscription(c.env, {
        customer: asaasCustomer.id,
        billingType: mapPaymentMethod(parsed.payment_method) as 'BOLETO' | 'CREDIT_CARD' | 'PIX',
        value: parsed.amount,
        nextDueDate: parsed.start_date,
        cycle: mapBillingCycle(parsed.billing_cycle),
        description: parsed.description || `Assinatura VFIT - ${payer.full_name}`,
        externalReference: id,
        endDate: parsed.end_date,
      })

      asaasSubscriptionId = asaasSub.id
      console.log(`[Subscriptions] Asaas subscription created: ${asaasSub.id}`)
    } catch (err: unknown) {
      if (err instanceof AsaasApiError) {
        const msg = err.message.toLowerCase()
        if (msg.includes('chave pix') || msg.includes('pix key')) {
          throw new BadRequestError(
            'Sua conta Asaas não possui chave PIX cadastrada. Acesse o painel Asaas e cadastre uma chave PIX, ou use outro método de pagamento.'
          )
        }
        throw new BadRequestError(`Erro Asaas: ${err.message}`)
      }
      console.error('[Subscriptions] Asaas error:', err)
    }
  }

  await pgQuery(c.env, `
    INSERT INTO payment_subscriptions (
      id, payer_id, recipient_id, asaas_subscription_id, amount,
      billing_cycle, payment_method, description, start_date, end_date,
      next_due_date, platform_fee, commission_amount, net_amount,
      status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', $15, $15)
  `, [
    id, parsed.payer_id, personalId, asaasSubscriptionId,
    parsed.amount, parsed.billing_cycle, parsed.payment_method,
    parsed.description || null, parsed.start_date, parsed.end_date || null,
    parsed.start_date, platformFee, commissionAmount, netAmount, now,
  ])

  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount)
  await notifyEvent(c.env, parsed.payer_id, 'payment.subscription.created', {
    amount: formatted,
    cycle: parsed.billing_cycle,
    method: parsed.payment_method,
  }).catch(() => {})

  return created({
    id,
    amount: parsed.amount,
    billing_cycle: parsed.billing_cycle,
    payment_method: parsed.payment_method,
    start_date: parsed.start_date,
    status: 'active',
    asaas_subscription_id: asaasSubscriptionId,
    platform_fee: platformFee,
    commission: commissionAmount,
    net_amount: netAmount,
  })
})

// GET /payments/subscriptions — Listar assinaturas
payments.get('/subscriptions', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const query = listSubscriptionsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    status: url.searchParams.get('status') || undefined,
    payer_id: url.searchParams.get('payer_id') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['ps.recipient_id = $1']
  const params: unknown[] = [personalId]
  let idx = 2

  if (query.status) {
    conditions.push(`ps.status = $${idx}`)
    params.push(query.status)
    idx++
  }
  if (query.payer_id) {
    conditions.push(`ps.payer_id = $${idx}`)
    params.push(query.payer_id)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env, `SELECT COUNT(*)::int as count FROM payment_subscriptions ps WHERE ${where}`, params
  )

  const { rows } = await pgQuery(
    c.env,
    `SELECT ps.*, u.full_name as payer_name
     FROM payment_subscriptions ps
     JOIN users u ON u.id = ps.payer_id
     WHERE ${where}
     ORDER BY ps.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    subscriptions: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// DELETE /payments/subscriptions/:id — Cancelar assinatura
payments.delete('/subscriptions/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const id = c.req.param('id')

  const { rows } = await pgQuery<{ id: string; asaas_subscription_id: string | null; status: string }>(
    c.env,
    'SELECT id, asaas_subscription_id, status FROM payment_subscriptions WHERE id = $1 AND recipient_id = $2 LIMIT 1',
    [id, personalId]
  )
  if (rows.length === 0) throw new NotFoundError('Assinatura')
  if (rows[0].status === 'cancelled') throw new BadRequestError('Assinatura já cancelada')

  // Cancelar no Asaas
  if (rows[0].asaas_subscription_id && c.env.ASAAS_API_KEY) {
    try {
      await cancelAsaasSubscription(c.env, rows[0].asaas_subscription_id)
    } catch (err) {
      console.warn('[Subscriptions] Asaas cancel error:', err)
    }
  }

  await pgQuery(c.env, `
    UPDATE payment_subscriptions SET status = 'cancelled', updated_at = NOW() WHERE id = $1
  `, [id])

  return noContent()
})

// ============================================
// HELPERS
// ============================================

interface PaymentRow {
  id: string
  payer_id: string
  recipient_id: string
  amount: number
  commission_amount: number
  platform_fee: number
  net_amount: number
  currency: string
  status: string
  payment_method: string
  due_date: string | null
  paid_at: string | null
  asaas_payment_id: string | null
  stripe_payment_intent_id: string | null
  split_data: unknown
  description: string | null
  invoice_url: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
  payer_name?: string
  recipient_name?: string
}

interface WorkoutPlanRow {
  id: string
  created_by: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_weeks: number
  workouts_per_week: number
  price_brl: number
  is_published: boolean
  is_featured: boolean
  total_sales: number
  total_revenue: number
  plan_content: unknown
  thumbnail_url: string | null
  preview_video_url: string | null
  created_at: string
  updated_at: string
  creator_name?: string
}

/**
 * Calcular comissão de afiliado para um pagamento
 */
async function calculateAffiliateCommission(
  env: Bindings, personalId: string, amount: number
): Promise<number> {
  // Verificar se o personal foi referido
  const { rows } = await pgQuery<{ commission_percentage: number }>(
    env,
    `SELECT r.commission_percentage
     FROM referrals r
     WHERE r.referred_personal_id = $1 AND r.status = 'active' AND r.is_lifetime = true
     LIMIT 1`,
    [personalId]
  )

  if (rows.length === 0) return 0

  return Math.round(amount * rows[0].commission_percentage) / 100
}

/**
 * Processar comissão quando pagamento é confirmado
 */
async function processAffiliateCommission(env: Bindings, payment: PaymentRow): Promise<void> {
  // T10.3 — Idempotência: pular se comissão já foi registrada para este pagamento
  const { rows: existingComm } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM affiliate_commissions WHERE payment_id = $1 LIMIT 1',
    [payment.id]
  )
  if (existingComm.length > 0) return

  const { rows: referralRows } = await pgQuery<{
    id: string; affiliate_id: string; commission_percentage: number
  }>(
    env,
    `SELECT r.id, r.affiliate_id, r.commission_percentage
     FROM referrals r
     WHERE r.referred_personal_id = $1 AND r.status = 'active'
     LIMIT 1`,
    [payment.recipient_id]
  )

  if (referralRows.length === 0) return

  const referral = referralRows[0]
  const commissionAmount = payment.commission_amount
  const now = new Date().toISOString()

  // Criar registro de comissão
  await pgQuery(env, `
    INSERT INTO affiliate_commissions (id, affiliate_id, referral_id, payment_id, amount, commission_percentage, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
  `, [generateId(), referral.affiliate_id, referral.id, payment.id, commissionAmount, referral.commission_percentage, now])

  // Atualizar saldos
  await pgQuery(env, `
    UPDATE affiliates
    SET total_earned = total_earned + $1,
        available_balance = available_balance + $1,
        lifetime_earnings = lifetime_earnings + $1,
        updated_at = $2
    WHERE id = $3
  `, [commissionAmount, now, referral.affiliate_id])

  // Atualizar referral stats
  await pgQuery(env, `
    UPDATE referrals
    SET total_payments = total_payments + 1,
        total_commission_earned = total_commission_earned + $1,
        last_payment_date = $2,
        updated_at = $2
    WHERE id = $3
  `, [commissionAmount, now, referral.id])
}

function toCsvValue(value: unknown): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildPaymentsCsv(rows: Array<{
  id: string
  student_name: string
  amount: number
  net_amount: number
  status: string
  payment_method: string
  due_date: string | null
  paid_at: string | null
  created_at: string
  invoice_url: string | null
}>): string {
  const headers = [
    'id',
    'aluno',
    'valor_bruto',
    'valor_liquido',
    'status',
    'metodo_pagamento',
    'vencimento',
    'pago_em',
    'criado_em',
    'url_fatura',
  ]

  const lines = rows.map((row) => [
    row.id,
    row.student_name,
    Number(row.amount || 0).toFixed(2),
    Number(row.net_amount || 0).toFixed(2),
    row.status,
    row.payment_method,
    row.due_date || '',
    row.paid_at || '',
    row.created_at,
    row.invoice_url || '',
  ].map(toCsvValue).join(','))

  return [headers.join(','), ...lines].join('\n')
}

async function buildPaymentsPdf(
  rows: Array<{
    id: string
    student_name: string
    amount: number
    net_amount: number
    status: string
    payment_method: string
    due_date: string | null
    paid_at: string | null
    created_at: string
  }>,
  period: string
): Promise<Uint8Array> {
  const totalBruto = rows.reduce((acc, row) => acc + Number(row.amount || 0), 0)
  const totalLiquido = rows
    .filter((row) => row.status === 'confirmed')
    .reduce((acc, row) => acc + Number(row.net_amount || 0), 0)

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 810
  page.drawText('Relatório Financeiro — VFIT', { x: 40, y, size: 16, font: fontBold })
  y -= 22
  page.drawText(`Período: ${period} | Registros: ${rows.length}`, { x: 40, y, size: 10, font })
  y -= 16
  page.drawText(`Total bruto: R$ ${totalBruto.toFixed(2)} | Total líquido confirmado: R$ ${totalLiquido.toFixed(2)}`, { x: 40, y, size: 10, font })
  y -= 22
  page.drawText('Últimos pagamentos:', { x: 40, y, size: 11, font: fontBold })
  y -= 14

  const preview = rows.slice(0, 30)
  for (const row of preview) {
    if (y < 50) {
      break
    }
    const line = `${row.created_at.slice(0, 10)} • ${row.student_name.slice(0, 24)} • R$ ${Number(row.amount || 0).toFixed(2)} • ${row.status}`
    page.drawText(line, { x: 40, y, size: 9, font })
    y -= 12
  }

  return pdfDoc.save()
}

/**
 * Sincronizar status de pagamentos pendentes com a API Asaas.
 * Verifica até MAX_SYNC pagamentos pendentes que possuem asaas_payment_id,
 * consulta a API Asaas em paralelo e atualiza o DB + array in-memory.
 */
const MAX_SYNC_PER_REQUEST = 10

async function syncPendingPaymentsStatus(
  env: Bindings,
  payments: PaymentRow[]
): Promise<PaymentRow[]> {
  if (!env.ASAAS_API_KEY) return payments

  const pendingWithAsaas = payments.filter(
    (p) => p.status === 'pending' && p.asaas_payment_id
  )

  if (pendingWithAsaas.length === 0) return payments

  // Limitar para não sobrecarregar a API Asaas
  const toCheck = pendingWithAsaas.slice(0, MAX_SYNC_PER_REQUEST)
  const confirmedStatuses = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']

  // Verificar todos em paralelo
  const results = await Promise.allSettled(
    toCheck.map(async (payment) => {
      const asaasPayment = await getAsaasPayment(env, payment.asaas_payment_id!)
      return { payment, asaasPayment }
    })
  )

  const now = new Date().toISOString()

  for (const result of results) {
    if (result.status !== 'fulfilled') continue

    const { payment, asaasPayment } = result.value
    if (!confirmedStatuses.includes(asaasPayment.status)) continue

    // Atualizar no banco com netValue real do Asaas
    const realNetAmount = asaasPayment.netValue ?? payment.net_amount
    await pgQuery(env, `
      UPDATE payments SET status = 'confirmed', paid_at = $1,
        net_amount = $2,
        invoice_url = COALESCE($3, invoice_url),
        receipt_url = COALESCE($4, receipt_url),
        updated_at = $5
      WHERE id = $6 AND status = 'pending'
    `, [now, realNetAmount, asaasPayment.invoiceUrl || null, asaasPayment.transactionReceiptUrl || null, now, payment.id])

    // Atualizar no array in-memory
    const idx = payments.findIndex((p) => p.id === payment.id)
    if (idx !== -1) {
      const row = payments[idx] as any
      row.status = 'confirmed'
      row.paid_at = now
      if (asaasPayment.invoiceUrl) {
        row.invoice_url = asaasPayment.invoiceUrl
      }
      if (asaasPayment.transactionReceiptUrl) {
        row.receipt_url = asaasPayment.transactionReceiptUrl
      }
    }

    // Processar comissão de afiliado se aplicável
    if (payment.commission_amount > 0) {
      await processAffiliateCommission(env, { ...payment, status: 'confirmed' }).catch((e) =>
        console.error('[SyncList] Affiliate commission error:', e)
      )
    }

    // Notificar personal via push (best-effort)
    const { rows: payerRows } = await pgQuery<{ full_name: string }>(
      env, 'SELECT full_name FROM users WHERE id = $1 LIMIT 1', [payment.payer_id]
    )
    const payerName = payerRows[0]?.full_name || 'Aluno'
    await notifyPaymentReceived(env, payment.recipient_id, payerName, payment.amount).catch(() => {})

    console.log(`[SyncList] Payment ${payment.id} confirmed via Asaas API check (${asaasPayment.status})`)
  }

  return payments
}

export { payments as paymentsRoutes, syncPendingPaymentsStatus }
