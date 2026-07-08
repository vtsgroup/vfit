// ============================================
// step-up.ts — Middleware requireStepUp para autorizar ações que movem dinheiro
// ============================================
//
// O que faz:
//   Exige prova RECENTE de presença do operador antes de um saque:
//     (a) X-Step-Up-Token válido, vinculado à ESTA transação (amount+pix_key), com
//         aud == endpoint, jti não-consumido → consome jti; OU
//     (b) current_password no body verificado com bcrypt (fallback p/ quem não tem
//         passkey). O caminho de senha NÃO tem dynamic linking — é o tradeoff
//         aceito (D6), mitigado por notificação de todo saque no handler.
//   Sem nenhum dos dois → StepUpRequiredError (403 STEP_UP_REQUIRED).
//
//   IMPORTANTE (segurança):
//   - super_admin NÃO burla o step-up (ao contrário de requireType). A conta que
//     saca ilimitado é a que MAIS precisa de step-up.
//   - A verificação é do OPERADOR REAL (actorUserId), não do usuário simulado —
//     quem encosta o dedo/digita a senha é o humano presente.
//   - jti single-use no KV é best-effort (KV eventualmente consistente); a garantia
//     forte contra replay/double-spend é a idempotência do próprio saque.
//
// Uso:  payments.post('/transfers/pix', requireType('personal'), requireStepUp('withdraw_pix'), handler)
//
// Exports: requireStepUp, StepUpContext

import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../types'
import { StepUpRequiredError, UnauthorizedError, BadRequestError } from '@lib/errors'
import { pgQueryOne } from '@lib/db'
import { verifyPassword } from '@lib/auth-helpers'
import {
  verifyStepUpToken,
  stepUpBindingHash,
  canonicalAmountCents,
  type StepUpPurpose,
} from '@lib/step-up'

const JTI_CONSUMED_TTL = 10 * 60 // 10 min: cobre o TTL do token (5 min) com folga

/** Marca no contexto qual método autorizou o saque (para audit no handler). */
export interface StepUpContext {
  method: 'passkey' | 'password'
}

/**
 * requireStepUp(purpose) — middleware. Deve rodar APÓS authMiddleware (usa actorUserId).
 * Lê o body do saque (amount, pix_key) e valida contra o token/senha.
 */
export function requireStepUp(purpose: StepUpPurpose) {
  return createMiddleware<AppContext>(async (c, next) => {
    // Operador real (nunca o usuário simulado). Fallback para userId por segurança.
    const actorId = c.get('actorUserId') || c.get('userId')

    // O body traz amount + pix_key do saque pretendido. Hono cacheia o json parse,
    // então o handler pode reler o mesmo body depois.
    let body: { amount?: unknown; pix_key?: unknown; current_password?: unknown }
    try {
      body = await c.req.json()
    } catch {
      throw new BadRequestError('Corpo da requisição inválido')
    }

    const amount = typeof body.amount === 'number' ? body.amount : NaN
    const pixKey = typeof body.pix_key === 'string' ? body.pix_key : ''
    if (!Number.isFinite(amount) || amount <= 0 || !pixKey) {
      throw new BadRequestError('Valor ou chave PIX inválidos')
    }

    // ─── Caminho A: step_up_token vinculado à transação ───
    const token = c.req.header('X-Step-Up-Token')
    if (token) {
      let claims
      try {
        claims = await verifyStepUpToken(token, c.env.JWT_SECRET)
      } catch {
        throw new StepUpRequiredError('Confirmação expirada ou inválida. Confirme novamente para sacar.')
      }

      // Dynamic linking: o token só vale para ESTE operador, ESTE endpoint e ESTA transação.
      if (claims.sub !== actorId) {
        throw new StepUpRequiredError('Confirmação não pertence a esta conta.')
      }
      if (claims.aud !== purpose) {
        throw new StepUpRequiredError('Confirmação não vale para esta operação.')
      }
      const expectedHash = await stepUpBindingHash(amount, pixKey)
      if (claims.amt !== canonicalAmountCents(amount) || claims.pkh !== expectedHash) {
        throw new StepUpRequiredError('O valor ou a chave PIX mudaram. Confirme novamente.')
      }

      // jti single-use (best-effort; a idempotência do saque é a garantia real).
      const jtiKey = `stepup_jti:${claims.jti}`
      const alreadyUsed = await c.env.KV_SESSIONS.get(jtiKey).catch(() => null)
      if (alreadyUsed) {
        throw new StepUpRequiredError('Esta confirmação já foi usada. Confirme novamente.')
      }
      await c.env.KV_SESSIONS.put(jtiKey, '1', { expirationTtl: JTI_CONSUMED_TTL }).catch(() => {})

      c.set('stepUp', { method: 'passkey' } satisfies StepUpContext)
      return next()
    }

    // ─── Caminho B: fallback de senha (sem dynamic linking; mitigado por notificação) ───
    const password = typeof body.current_password === 'string' ? body.current_password : ''
    if (password) {
      const user = await pgQueryOne<{ password_hash: string | null }>(
        c.env,
        'SELECT password_hash FROM users WHERE id = $1',
        [actorId]
      )
      if (!user?.password_hash) {
        throw new UnauthorizedError('Não foi possível verificar sua senha.')
      }
      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) {
        throw new StepUpRequiredError('Senha incorreta. Confirme novamente para sacar.')
      }
      c.set('stepUp', { method: 'password' } satisfies StepUpContext)
      return next()
    }

    // Nenhuma prova → o frontend deve abrir o sheet de confirmação.
    throw new StepUpRequiredError()
  })
}
