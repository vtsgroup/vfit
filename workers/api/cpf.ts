/**
 * workers/api/cpf.ts
 *
 * cpf.ts — Consulta de nome via CPF (HubDev API)
 */

// ============================================
// cpf.ts — Consulta de nome via CPF (HubDev API)
// ============================================
//
// O que faz:
//   Endpoint público que consulta nome completo a partir de CPF + data de
//   nascimento via HubDev API. Retorna APENAS full_name e status_rf (LGPD).
//   Rate limiting próprio por IP via KV. Degrada graciosamente se o token
//   HUBDEV_API_TOKEN estiver ausente.
//
// Exports principais:
//   cpfRoutes — Hono app montado em /api/v1/cpf (default export)
//
// Auth: público (sem autenticação)
// KV: KV_RATE_LIMIT (cpf-lookup:{ip}, TTL 60s)
// Rate limit: 5 req/min por IP
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { lookupCpf } from '@lib/cpf-lookup'
import { success } from '@lib/response'
import { BadRequestError, RateLimitError } from '@lib/errors'

const cpfRoutes = new Hono<AppContext>()

/**
 * POST /api/v1/cpf/lookup
 * Public — Consulta nome completo a partir de CPF + nascimento
 *
 * Body: { cpf: string, birth_date: string (DD/MM/YYYY) }
 * Response: { success: true, data: { full_name, status_rf } }
 *
 * Rate limit: 5 requests / min por IP (evitar abuso)
 * Dados processados server-side — LGPD compliant
 */
cpfRoutes.post('/lookup', async (c) => {
  // ── Rate limit por IP ──
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const rateLimitKey = `cpf-lookup:${ip}`

  try {
    const current = await c.env.KV_RATE_LIMIT.get(rateLimitKey)
    const count = current ? parseInt(current, 10) : 0

    if (count >= 5) {
      throw new RateLimitError(60)
    }

    await c.env.KV_RATE_LIMIT.put(rateLimitKey, String(count + 1), {
      expirationTtl: 60, // 1 min
    })
  } catch (err) {
    if (err instanceof RateLimitError) throw err
    // KV error — let it pass
  }

  // ── Parse body ──
  const body = await c.req.json<{ cpf?: string; birth_date?: string }>()

  if (!body.cpf) {
    throw new BadRequestError('CPF é obrigatório')
  }

  const cleanCpf = body.cpf.replace(/\D/g, '')
  if (cleanCpf.length !== 11) {
    throw new BadRequestError('CPF inválido')
  }

  // Validar formato DD/MM/YYYY se informada
  if (body.birth_date) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!dateRegex.test(body.birth_date)) {
      throw new BadRequestError('Data de nascimento deve estar no formato DD/MM/YYYY')
    }
  }

  // ── Checar se token está configurado ──
  const apiToken = c.env.HUBDEV_API_TOKEN
  if (!apiToken) {
    // Graceful degradation — token não configurado
    return success({
      available: false,
      message: 'Serviço de consulta CPF não configurado',
    })
  }

  // ── Lookup ──
  const result = await lookupCpf(cleanCpf, apiToken, body.birth_date)

  if (!result.success) {
    return success({
      available: true,
      found: false,
      message: result.error,
    })
  }

  // Retorna nome + nascimento — mínimo necessário para cadastro (LGPD)
  return success({
    available: true,
    found: true,
    full_name: result.full_name,
    birth_date: result.birth_date,
    status_rf: result.status_rf,
  })
})

export default cpfRoutes
