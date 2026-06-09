/**
 * workers/api/consultations.ts
 *
 * Consultation commerce routes (student-first monetization)
 */

import { Hono } from 'hono'
import { z } from 'zod'
import type { AppContext } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { BadRequestError, NotFoundError, ForbiddenError } from '@lib/errors'
import { createAsaasPayment, getOrCreateCustomer, getPixQrCode } from '@lib/asaas'
import {
  appendConsultationLedgerEvent,
  getConsultationLedgerReconciliationSummary,
  getCreatorConsultationLedgerStatus,
  recordConsultationOrderPaid,
} from '@lib/consultation-ledger'

const consultations = new Hono<AppContext>()
consultations.use('*', authMiddleware)

const createOfferSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(4000).optional(),
  price_amount: z.number().positive(),
  duration_minutes: z.number().int().min(15).max(240),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const createOrderSchema = z.object({
  offer_id: z.string().min(6),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']),
})

consultations.post('/offers', requireType('personal', 'nutritionist', 'admin', 'super_admin'), async (c) => {
  const jwt = c.get('jwtPayload')
  const body = await c.req.json()
  const parsed = createOfferSchema.parse(body)

  const creatorType = jwt.type === 'nutritionist' ? 'nutritionist' : 'personal'
  const id = generateId()

  await pgQuery(c.env, `
    INSERT INTO consultation_offers (
      id, creator_id, creator_type, title, description,
      price_amount, duration_minutes, status, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8::jsonb)
  `, [
    id,
    jwt.sub,
    creatorType,
    parsed.title,
    parsed.description || null,
    parsed.price_amount,
    parsed.duration_minutes,
    JSON.stringify(parsed.metadata || {}),
  ])

  return created({
    offer: {
      id,
      creator_id: jwt.sub,
      creator_type: creatorType,
      title: parsed.title,
      description: parsed.description || null,
      price_amount: parsed.price_amount,
      duration_minutes: parsed.duration_minutes,
      status: 'active',
    },
  })
})

consultations.get('/offers', async (c) => {
  const creatorId = c.req.query('creator_id')
  const status = c.req.query('status') || 'active'
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit')) || 20))

  const where: string[] = ['1=1']
  const params: unknown[] = []

  if (creatorId) {
    where.push(`co.creator_id = $${params.length + 1}`)
    params.push(creatorId)
  }

  if (status !== 'all') {
    where.push(`co.status = $${params.length + 1}`)
    params.push(status)
  }

  const { rows } = await pgQuery(c.env, `
    SELECT
      co.id,
      co.creator_id,
      co.creator_type,
      co.title,
      co.description,
      co.price_amount,
      co.duration_minutes,
      co.status,
      co.created_at,
      u.full_name AS creator_name
    FROM consultation_offers co
    JOIN users u ON u.id = co.creator_id
    WHERE ${where.join(' AND ')}
    ORDER BY co.created_at DESC
    LIMIT $${params.length + 1}
  `, [...params, limit])

  return success({ offers: rows })
})

consultations.post('/orders', requireType('student'), async (c) => {
  const jwt = c.get('jwtPayload')
  const body = await c.req.json()
  const parsed = createOrderSchema.parse(body)

  const offer = await pgQueryOne<{
    id: string
    creator_id: string
    title: string
    price_amount: number
    status: string
  }>(c.env, `
    SELECT id, creator_id, title, price_amount, status
    FROM consultation_offers
    WHERE id = $1
    LIMIT 1
  `, [parsed.offer_id])

  if (!offer) throw new NotFoundError('Oferta de consultoria não encontrada')
  if (offer.status !== 'active') throw new BadRequestError('Oferta indisponível no momento')
  if (offer.creator_id === jwt.sub) throw new ForbiddenError('Não é possível comprar sua própria consultoria')

  const user = await pgQueryOne<{
    id: string
    full_name: string
    email: string
    cpf: string | null
  }>(c.env, 'SELECT id, full_name, email, cpf FROM users WHERE id = $1', [jwt.sub])

  if (!user) throw new NotFoundError('Usuário não encontrado')
  if (!user.cpf) throw new BadRequestError('CPF obrigatório para pagamento. Atualize seu perfil.')

  const orderId = generateId()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const customer = await getOrCreateCustomer(c.env, {
    name: user.full_name,
    email: user.email,
    cpfCnpj: user.cpf.replace(/\D/g, ''),
    externalReference: `consult_student_${user.id}`,
  })

  const billingTypeMap: Record<string, 'PIX' | 'CREDIT_CARD' | 'BOLETO'> = {
    pix: 'PIX',
    credit_card: 'CREDIT_CARD',
    boleto: 'BOLETO',
  }

  const asaasPayment = await createAsaasPayment(c.env, {
    customer: customer.id,
    billingType: billingTypeMap[parsed.payment_method] ?? 'PIX',
    value: offer.price_amount,
    dueDate: dueDate.toISOString().split('T')[0],
    description: `VFIT Consultoria - ${offer.title}`,
    externalReference: `consult_order_${orderId}`,
  })

  let pixQrCode: string | null = null
  let pixCopyPaste: string | null = null

  if (parsed.payment_method === 'pix' && asaasPayment.id) {
    try {
      const qr = await getPixQrCode(c.env, asaasPayment.id)
      pixQrCode = qr.encodedImage ?? null
      pixCopyPaste = qr.payload ?? null
    } catch {
      // best effort
    }
  }

  await pgQuery(c.env, `
    INSERT INTO consultation_orders (
      id, offer_id, student_id, creator_id, amount,
      payment_method, status, asaas_payment_id, asaas_invoice_url, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9::jsonb)
  `, [
    orderId,
    offer.id,
    jwt.sub,
    offer.creator_id,
    offer.price_amount,
    parsed.payment_method,
    asaasPayment.id,
    asaasPayment.invoiceUrl || null,
    JSON.stringify({ source: 'consultations_api' }),
  ])

  return created({
    order: {
      id: orderId,
      offer_id: offer.id,
      amount: offer.price_amount,
      status: 'pending',
      payment_method: parsed.payment_method,
      due_date: asaasPayment.dueDate,
      payment_id: asaasPayment.id,
      checkout_url: asaasPayment.invoiceUrl || null,
      boleto_url: asaasPayment.bankSlipUrl || null,
      pix_qr_code: pixQrCode,
      pix_copy_paste: pixCopyPaste,
    },
  })
})

consultations.post('/orders/:id/confirm', requireType('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')
  const now = new Date().toISOString()

  const { rows } = await pgQuery<{
    id: string
    offer_id: string
    student_id: string
    creator_id: string
    amount: number
    status: string
    paid_at: string
  }>(c.env, `
    UPDATE consultation_orders
    SET status = 'paid', paid_at = $1, updated_at = $1
    WHERE id = $2 AND status <> 'paid'
    RETURNING id, offer_id, student_id, creator_id, amount, status, paid_at
  `, [now, id])

  if (rows.length === 0) throw new NotFoundError('Pedido não encontrado ou já confirmado')

  await pgQuery(c.env, `
    INSERT INTO consultation_sessions (
      id, order_id, student_id, creator_id, status, metadata
    ) VALUES ($1, $2, $3, $4, 'scheduled', $5::jsonb)
    ON CONFLICT (order_id) DO NOTHING
  `, [generateId(), rows[0].id, rows[0].student_id, rows[0].creator_id, JSON.stringify({ created_by: 'manual_confirm' })])

  await recordConsultationOrderPaid(c.env, {
    orderId: rows[0].id,
    creatorId: rows[0].creator_id,
    grossAmount: Number(rows[0].amount),
    paidAt: rows[0].paid_at,
    metadata: { source: 'admin_confirm' },
  })

  return success({ order: rows[0] })
})

consultations.get('/admin/ledger/reconciliation', requireType('admin', 'super_admin'), async (c) => {
  const days = Math.min(180, Math.max(1, Number(c.req.query('days')) || 30))
  const summary = await getConsultationLedgerReconciliationSummary(c.env, days)

  return success({
    summary,
    healthy: summary.missingEntries === 0,
  })
})

consultations.get('/admin/ledger/creator/:id/status', requireType('admin', 'super_admin'), async (c) => {
  const creatorId = c.req.param('id')
  const status = await getCreatorConsultationLedgerStatus(c.env, creatorId)

  return success({
    creator_id: creatorId,
    ...status,
    payout_blocked: status.inconsistentOrders > 0,
  })
})

consultations.post('/sessions/:id/start', requireType('personal', 'nutritionist', 'student', 'admin', 'super_admin'), async (c) => {
  const jwt = c.get('jwtPayload')
  const sessionId = c.req.param('id')

  const session = await pgQueryOne<{
    id: string
    order_id: string
    student_id: string
    creator_id: string
    status: string
    order_status: string
  }>(c.env, `
    SELECT
      cs.id,
      cs.order_id,
      cs.student_id,
      cs.creator_id,
      cs.status,
      co.status AS order_status
    FROM consultation_sessions cs
    JOIN consultation_orders co ON co.id = cs.order_id
    WHERE cs.id = $1
    LIMIT 1
  `, [sessionId])

  if (!session) throw new NotFoundError('Sessão não encontrada')

  const isAdmin = c.get('userRole') === 'admin' || c.get('userRole') === 'super_admin'
  const isParticipant = session.student_id === jwt.sub || session.creator_id === jwt.sub

  if (!isAdmin && !isParticipant) throw new ForbiddenError('Você não tem acesso a esta sessão')
  if (session.order_status !== 'paid') {
    await appendConsultationLedgerEvent(c.env, {
      orderId: session.order_id,
      creatorId: session.creator_id,
      eventType: 'security_violation',
      direction: 'debit',
      accountType: 'risk_events',
      amount: 0.01,
      idempotencyKey: `consult:${session.order_id}:security:${generateId()}`,
      metadata: {
        reason: 'session_start_without_paid_order',
        actor_user_id: jwt.sub,
      },
    })
    throw new BadRequestError('Sessão bloqueada: pagamento da consultoria ainda não confirmado')
  }

  const now = new Date().toISOString()
  await pgQuery(c.env, `
    UPDATE consultation_sessions
    SET status = 'started', started_at = COALESCE(started_at, $1), updated_at = $1
    WHERE id = $2
  `, [now, sessionId])

  return success({
    session_id: sessionId,
    status: 'started',
    started_at: now,
  })
})

export { consultations as consultationsRoutes }
