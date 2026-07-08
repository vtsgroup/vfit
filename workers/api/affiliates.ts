/**
 * workers/api/affiliates.ts
 *
 * affiliates.ts — Programa de afiliados e comissões
 * Features: DB: Neon
 */

// ============================================
// affiliates.ts — Programa de afiliados e comissões
// ============================================
//
// O que faz:
//   Gerencia o programa de afiliados do personal: ativação, dashboard de
//   desempenho, listagem de referidos, histórico de comissões, geração de
//   link de indicação e solicitação de saque. Webhook Asaas para confirmação.
//
// Exports principais:
//   affiliatesRoutes — Hono app montado em /api/v1/affiliates
//
// Auth: requireAuth em todas as rotas
// DB: affiliates, affiliate_referrals, affiliate_commissions, users
// Side effects: cria notificação in-app, email de confirmação de saque
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import { requireStepUp } from '@workers/middleware/step-up'
import {
  activateAffiliateSchema,
  listReferralsQuerySchema,
  listCommissionsQuerySchema,
  requestWithdrawalSchema,
} from '@workers/schemas/payments'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { createPixTransfer, mapPixKeyType } from '@lib/asaas'
import { notifyEvent } from '@lib/onesignal'
// enqueueWithRetry removido: saque de afiliado agora paga inline via Asaas (era queue morta)
import { success, created } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ServiceUnavailableError,
} from '@lib/errors'
import { AFFILIATE_TIERS } from '@config/constants'

const affiliates = new Hono<AppContext>()

affiliates.use('*', authMiddleware)
affiliates.use('*', requireType('personal'))

// ============================================
// POST /affiliates/activate — Ativar afiliados
// ============================================
affiliates.post('/activate', async (c) => {
  const personalId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const parsed = activateAffiliateSchema.parse(body)

  // Verificar se já ativou
  const { rows: existing } = await pgQuery<{ id: string }>(
    c.env,
    'SELECT id FROM affiliates WHERE personal_id = $1 LIMIT 1',
    [personalId]
  )
  if (existing.length > 0) {
    throw new ConflictError('Programa de afiliados já ativado')
  }

  // Buscar referral_code do personal
  const { rows: personalRows } = await pgQuery<{ referral_code: string }>(
    c.env,
    'SELECT referral_code FROM personals WHERE id = $1 LIMIT 1',
    [personalId]
  )
  if (personalRows.length === 0) throw new NotFoundError('Personal')

  const referralCode = parsed.custom_referral_code || personalRows[0].referral_code

  // Verificar unicidade do código
  if (parsed.custom_referral_code) {
    const { rows: codeCheck } = await pgQuery<{ id: string }>(
      c.env,
      'SELECT id FROM affiliates WHERE referral_code = $1 LIMIT 1',
      [referralCode]
    )
    if (codeCheck.length > 0) {
      throw new ConflictError('Este código de indicação já está em uso')
    }
  }

  const id = generateId()
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    INSERT INTO affiliates (id, personal_id, referral_code, commission_tier, created_at, updated_at)
    VALUES ($1, $2, $3, '25', $4, $4)
  `, [id, personalId, referralCode, now])

  return created({
    id,
    referral_code: referralCode,
    commission_tier: '25',
    tier_name: AFFILIATE_TIERS['25'].name,
    commission_percentage: AFFILIATE_TIERS['25'].commission_percentage,
  })
})

// ============================================
// GET /affiliates/dashboard — Dashboard completo
// ============================================
affiliates.get('/dashboard', async (c) => {
  const personalId = c.get('userId')

  const affiliate = await findAffiliateByPersonal(c.env, personalId)
  if (!affiliate) {
    return success({
      activated: false,
      message: 'Programa de afiliados não ativado. Use POST /affiliates/activate',
    })
  }

  const tierInfo = AFFILIATE_TIERS[affiliate.commission_tier as keyof typeof AFFILIATE_TIERS]

  // Comissões recentes
  const { rows: recentCommissions } = await pgQuery<{
    id: string; amount: number; status: string; created_at: string
  }>(
    c.env,
    `SELECT id, amount, status, created_at
     FROM affiliate_commissions
     WHERE affiliate_id = $1
     ORDER BY created_at DESC LIMIT 5`,
    [affiliate.id]
  )

  // Comissões do mês
  const { rows: monthlyRows } = await pgQuery<{ total: number; count: number }>(
    c.env,
    `SELECT COALESCE(SUM(amount), 0)::float as total, COUNT(*)::int as count
     FROM affiliate_commissions
     WHERE affiliate_id = $1 AND status = 'paid'
       AND created_at >= DATE_TRUNC('month', NOW())`,
    [affiliate.id]
  )

  // Próximo tier
  let nextTier = null
  if (affiliate.commission_tier === '25' && affiliate.total_referrals < 5) {
    nextTier = { tier: '30', name: 'Prata', referrals_needed: 5 - affiliate.total_referrals }
  } else if (affiliate.commission_tier === '30' && affiliate.total_referrals < 15) {
    nextTier = { tier: '35', name: 'Ouro', referrals_needed: 15 - affiliate.total_referrals }
  }

  return success({
    activated: true,
    affiliate: {
      id: affiliate.id,
      referral_code: affiliate.referral_code,
      commission_tier: affiliate.commission_tier,
      tier_name: tierInfo?.name || 'Bronze',
      commission_percentage: tierInfo?.commission_percentage || 25,
      total_referrals: affiliate.total_referrals,
      active_referrals: affiliate.active_referrals,
      churned_referrals: affiliate.churned_referrals,
      total_earned: affiliate.total_earned,
      available_balance: affiliate.available_balance,
      withdrawn_total: affiliate.withdrawn_total,
      lifetime_earnings: affiliate.lifetime_earnings,
      bonus_5_referrals_claimed: affiliate.bonus_5_referrals_claimed,
      free_plan_active: affiliate.free_plan_active,
    },
    next_tier: nextTier,
    this_month: monthlyRows[0] || { total: 0, count: 0 },
    recent_commissions: recentCommissions,
  })
})

// ============================================
// GET /affiliates/link — Link de indicação
// ============================================
affiliates.get('/link', async (c) => {
  const personalId = c.get('userId')

  const affiliate = await findAffiliateByPersonal(c.env, personalId)
  if (!affiliate) throw new NotFoundError('Afiliado não ativado')

  const baseUrl = 'https://vfit.app.br/register'
  const link = `${baseUrl}?ref=${affiliate.referral_code}`

  return success({
    referral_code: affiliate.referral_code,
    referral_link: link,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`,
  })
})

// ============================================
// GET /affiliates/referrals — Listar referidos
// ============================================
affiliates.get('/referrals', async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const affiliate = await findAffiliateByPersonal(c.env, personalId)
  if (!affiliate) throw new NotFoundError('Afiliado não ativado')

  const query = listReferralsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    status: url.searchParams.get('status') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['r.affiliate_id = $1']
  const params: unknown[] = [affiliate.id]
  let idx = 2

  if (query.status) {
    conditions.push(`r.status = $${idx}`)
    params.push(query.status)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM referrals r WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<ReferralRow>(
    c.env,
    `SELECT r.id, r.status, r.referral_date, r.first_payment_date, r.last_payment_date,
            r.commission_percentage, r.total_payments, r.total_commission_earned,
            u.full_name as referred_name
     FROM referrals r
     JOIN users u ON u.id = r.referred_personal_id
     WHERE ${where}
     ORDER BY r.referral_date DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    referrals: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// GET /affiliates/commissions — Listar comissões
// ============================================
affiliates.get('/commissions', async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const affiliate = await findAffiliateByPersonal(c.env, personalId)
  if (!affiliate) throw new NotFoundError('Afiliado não ativado')

  const query = listCommissionsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    status: url.searchParams.get('status') || undefined,
    date_from: url.searchParams.get('date_from') || undefined,
    date_to: url.searchParams.get('date_to') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['ac.affiliate_id = $1']
  const params: unknown[] = [affiliate.id]
  let idx = 2

  if (query.status) {
    conditions.push(`ac.status = $${idx}`)
    params.push(query.status)
    idx++
  }
  if (query.date_from) {
    conditions.push(`ac.created_at >= $${idx}`)
    params.push(query.date_from)
    idx++
  }
  if (query.date_to) {
    conditions.push(`ac.created_at <= $${idx}::date + interval '1 day'`)
    params.push(query.date_to)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM affiliate_commissions ac WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<CommissionRow>(
    c.env,
    `SELECT ac.id, ac.amount, ac.commission_percentage, ac.status, ac.paid_at, ac.created_at,
            u.full_name as referred_name
     FROM affiliate_commissions ac
     JOIN referrals r ON r.id = ac.referral_id
     JOIN users u ON u.id = r.referred_personal_id
     WHERE ${where}
     ORDER BY ac.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    commissions: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// POST /affiliates/withdraw — Solicitar saque de comissão (PIX Asaas inline)
// ============================================
//
// Antes (bug B0): debitava o saldo e enfileirava numa queue DESLIGADA sem consumer
// → debitava sem pagar. Agora paga INLINE via Asaas (paridade com /payments/transfers/pix):
// só debita o saldo DEPOIS que a transferência Asaas é criada com sucesso.
// requireStepUp: exige biometria (dynamic linking) ou senha antes de mover dinheiro.
affiliates.post('/withdraw', requireStepUp('withdraw_affiliate'), async (c) => {
  const personalId = c.get('userId')
  const actorId = c.get('actorUserId') || personalId
  const stepUpMethod = c.get('stepUp')?.method ?? 'unknown'
  const body = await c.req.json()
  const parsed = requestWithdrawalSchema.parse(body)

  const idempotencyKey = c.req.header('Idempotency-Key')
  if (!idempotencyKey) throw new BadRequestError('Idempotency-Key obrigatório para saque')

  // Retry seguro: se já existe um saque com esta chave, devolve o existente.
  const existing = await pgQueryOne<{ id: string; amount: number; status: string }>(
    c.env,
    'SELECT id, amount, status FROM payments WHERE payer_id = $1 AND idempotency_key = $2',
    [personalId, idempotencyKey]
  )
  if (existing) {
    return created({ withdrawal_id: existing.id, amount: existing.amount, pix_key: parsed.pix_key, status: existing.status, idempotent_replay: true })
  }

  const affiliate = await findAffiliateByPersonal(c.env, personalId)
  if (!affiliate) throw new NotFoundError('Afiliado não ativado')

  if (!c.env.ASAAS_API_KEY) {
    throw new ServiceUnavailableError('Saque de afiliado')
  }

  const now = new Date().toISOString()
  const withdrawalId = generateId()

  // ─── Débito ATÔMICO E GUARDADO (anti double-spend, security-review 2026-07-08) ───
  // Achado HIGH confirmado: 2 requisições concorrentes com Idempotency-Key DISTINTAS
  // liam o mesmo saldo, ambas passavam na checagem e ambas pagavam via Asaas (o saldo
  // só era debitado DEPOIS de pagar, sem guarda). Fix: debitar PRIMEIRO com
  // "WHERE available_balance >= amount" — o Postgres serializa UPDATEs na mesma linha,
  // então a 2ª requisição concorrente só vê o saldo já reduzido pela 1ª e falha aqui,
  // ANTES de qualquer chamada ao Asaas. RETURNING id prova que o débito realmente
  // aconteceu (0 linhas = saldo insuficiente).
  const debited = await pgQueryOne<{ id: string }>(c.env, `
    UPDATE affiliates
    SET available_balance = available_balance - $1, withdrawn_total = withdrawn_total + $1, updated_at = $2
    WHERE id = $3 AND available_balance >= $1
    RETURNING id
  `, [parsed.amount, now, affiliate.id])
  if (!debited) {
    throw new BadRequestError(
      `Saldo insuficiente. Disponível: R$${affiliate.available_balance.toFixed(2)}`
    )
  }

  // Claim atômico (idempotência): reserva a chave idem. O saldo já foi debitado acima —
  // se o claim perder a corrida (retry na MESMA chave), o débito deste request é
  // revertido abaixo (o vencedor original já debitou pela sua própria chamada).
  const claim = await pgQueryOne<{ id: string }>(c.env, `
    INSERT INTO payments (
      id, payer_id, recipient_id, amount, platform_fee, net_amount, commission_amount,
      payment_method, status, description, split_data, idempotency_key, created_at, updated_at
    ) VALUES ($1, $2, $2, $3, 0, $3, 0, 'pix', 'claiming', $4, $5, $6, $7, $7)
    ON CONFLICT (payer_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
    RETURNING id
  `, [
    withdrawalId, personalId, parsed.amount,
    `Saque de comissão de afiliado - PIX: ${parsed.pix_key}`,
    JSON.stringify({ type: 'affiliate_withdrawal', pix_key: parsed.pix_key, affiliate_id: affiliate.id }),
    idempotencyKey, now,
  ])
  if (!claim) {
    // Perdeu a corrida da MESMA idempotency-key (retry). Reverte o débito deste
    // request (o vencedor original já tem o seu próprio débito contabilizado).
    await pgQuery(c.env, `
      UPDATE affiliates SET available_balance = available_balance + $1, withdrawn_total = withdrawn_total - $1, updated_at = $2 WHERE id = $3
    `, [parsed.amount, now, affiliate.id]).catch(() => {})
    const winner = await pgQueryOne<{ id: string; amount: number; status: string }>(
      c.env, 'SELECT id, amount, status FROM payments WHERE payer_id = $1 AND idempotency_key = $2', [personalId, idempotencyKey]
    )
    return created({ withdrawal_id: winner?.id ?? withdrawalId, amount: parsed.amount, pix_key: parsed.pix_key, status: winner?.status ?? 'processing', idempotent_replay: true })
  }

  // Criar transferência PIX no Asaas INLINE (saldo já debitado — se falhar, credita de volta)
  let asaasTransferId: string
  let transferStatus: string
  try {
    const transfer = await createPixTransfer(c.env, {
      value: parsed.amount,
      pixAddressKey: parsed.pix_key,
      pixAddressKeyType: mapPixKeyType(parsed.pix_key).toUpperCase() as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP',
      description: `Saque afiliado VFIT - ${personalId}`,
    })
    asaasTransferId = transfer.id
    transferStatus = transfer.status === 'DONE' ? 'confirmed' : 'pending'
  } catch (err) {
    // Asaas falhou → CREDITA DE VOLTA (compensação) + libera a claim. Usuário tenta com nova chave.
    await pgQuery(c.env, `
      UPDATE affiliates SET available_balance = available_balance + $1, withdrawn_total = withdrawn_total - $1, updated_at = $2 WHERE id = $3
    `, [parsed.amount, now, affiliate.id]).catch(() => {})
    await pgQuery(c.env, 'DELETE FROM payments WHERE id = $1 AND status = $2', [withdrawalId, 'claiming']).catch(() => {})
    const errMsg = err instanceof Error ? err.message : String(err)
    throw new BadRequestError(`Falha ao criar transferência PIX: ${errMsg}. Tente novamente em alguns minutos.`)
  }

  await pgQuery(c.env, `
    UPDATE payments SET status = $2, asaas_payment_id = $3, updated_at = $4 WHERE id = $1
  `, [withdrawalId, transferStatus, asaasTransferId, now])

  // Notificação de saque (controle detectivo — visível na hora, D6)
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsed.amount)
  await notifyEvent(
    c.env, personalId,
    transferStatus === 'confirmed' ? 'payment.transfer.completed' : 'payment.transfer.requested',
    { amount: formatted }
  ).catch(() => {})

  console.log(`[Affiliates] withdrawal ${withdrawalId} authorized via step-up=${stepUpMethod} actor=${actorId} amount=${parsed.amount}`)

  return created({
    withdrawal_id: withdrawalId,
    amount: parsed.amount,
    pix_key: parsed.pix_key,
    status: transferStatus,
    asaas_transfer_id: asaasTransferId,
    remaining_balance: affiliate.available_balance - parsed.amount,
  })
})

// ============================================
// HELPERS
// ============================================

interface AffiliateRow {
  id: string
  personal_id: string
  referral_code: string
  total_referrals: number
  active_referrals: number
  churned_referrals: number
  commission_tier: string
  total_earned: number
  available_balance: number
  withdrawn_total: number
  lifetime_earnings: number
  bonus_5_referrals_claimed: boolean
  free_plan_active: boolean
  created_at: string
  updated_at: string
}

interface ReferralRow {
  id: string
  status: string
  referral_date: string
  first_payment_date: string | null
  last_payment_date: string | null
  commission_percentage: number
  total_payments: number
  total_commission_earned: number
  referred_name: string
}

interface CommissionRow {
  id: string
  amount: number
  commission_percentage: number
  status: string
  paid_at: string | null
  created_at: string
  referred_name: string
}

async function findAffiliateByPersonal(
  env: Bindings, personalId: string
): Promise<AffiliateRow | null> {
  const { rows } = await pgQuery<AffiliateRow>(
    env,
    'SELECT * FROM affiliates WHERE personal_id = $1 LIMIT 1',
    [personalId]
  )
  return rows[0] || null
}

export { affiliates as affiliatesRoutes }
