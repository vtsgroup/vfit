/**
 * lib/turnstile.ts
 *
 * Cloudflare Turnstile - Anti-bot Verification
 *
 * Exports: TurnstileResult
 */

// ============================================
// Cloudflare Turnstile - Anti-bot Verification
// ============================================

import { BadRequestError } from '@lib/errors'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileResult {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Valida token do Turnstile com a API do Cloudflare
 * @param token - Token enviado pelo cliente
 * @param secretKey - Secret key do Turnstile
 * @param remoteIp - IP do cliente (opcional, recomendado)
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<TurnstileResult> {
  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  })

  if (remoteIp) {
    body.append('remoteip', remoteIp)
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    return {
      success: false,
      'error-codes': ['network-error'],
    }
  }

  return response.json<TurnstileResult>()
}

/**
 * Helper simplificado: valida e lança erro se falhar
 * Se secretKey não estiver configurada, pula validação (dev/staging)
 */
export async function requireTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<void> {
  // Se secret key não configurada, skip (dev mode)
  if (!secretKey) {
    console.warn('[Turnstile] Secret key não configurada, pulando verificação')
    return
  }

  // Se token vazio, rejeitar
  if (!token) {
    throw new BadRequestError('Verificação anti-bot pendente. Tente novamente em alguns segundos.')
  }

  const result = await verifyTurnstile(token, secretKey, remoteIp)

  if (!result.success) {
    const codes = result['error-codes']?.join(', ') || 'unknown'
    throw new BadRequestError(`Verificação anti-bot falhou (${codes}). Recarregue a página e tente novamente.`)
  }
}

/**
 * Soft Turnstile: valida se token presente, pula se vazio.
 * Ideal para login onde rate-limiting já protege contra brute-force.
 * Turnstile agrega segurança quando disponível, mas não bloqueia o fluxo.
 */
export async function softRequireTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<boolean> {
  if (!secretKey || !token) return false

  try {
    const result = await verifyTurnstile(token, secretKey, remoteIp)
    return result.success
  } catch {
    // Network error etc — don't block login
    return false
  }
}
