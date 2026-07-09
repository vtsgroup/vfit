// ============================================
// step-up.ts — Step-up token (dynamic linking) para ações sensíveis (saques)
// ============================================
//
// O que faz:
//   Emite/verifica um "step_up_token" de curta duração (5 min) que autoriza UMA
//   transação específica. O token carrega o hash de (amount|pix_key) e a audiência
//   (endpoint), então roubá-lo ou reusá-lo para OUTRO saque não funciona — é o
//   "dynamic linking" exigido para mover dinheiro (padrão PSD2/FIDO).
//
//   Fluxo:
//     1. Cliente pede reauth/options informando {amount, pix_key} do saque.
//     2. Após a biometria (WebAuthn UV=required), o servidor emite o token com
//        purpose:'step_up', aud:<endpoint>, amt (centavos inteiros), pkh (hash),
//        jti (single-use), 5 min TTL.
//     3. O middleware requireStepUp só libera o saque se o body BATE com amt+pkh+aud.
//
//   A verificação de replay tem DUAS camadas: (a) jti single-use no KV (best-effort,
//   KV é eventualmente consistente) e (b) idempotência do próprio saque (garantia
//   forte). Nunca confiar só no jti.
//
// Exports:
//   canonicalAmountCents, canonicalPixKey, stepUpBindingHash
//   signStepUpToken, verifyStepUpToken, StepUpClaims, StepUpPurpose
//
// ASCII — binding do token à transação:
//
//   reauth/options {amount, pix_key} ──► challenge + hash(amt|pkh) no KV
//                                            │
//   WebAuthn UV=required (biometria) ───────►│
//                                            ▼
//   reauth/complete ──► step_up_token{ sub, aud, amt, pkh, jti, exp+5min }
//                                            │
//   POST /transfers/pix {amount, pix_key, X-Step-Up-Token} ─►│
//                                            ▼
//   requireStepUp: aud==endpoint && amt==body && pkh==hash(body) && jti não usado
//                       │ sim → consome jti → segue    │ não → 401 STEP_UP_REQUIRED

import { verifyJWT } from '@lib/auth-helpers'

export type StepUpPurpose = 'withdraw_pix' | 'withdraw_affiliate'

export interface StepUpClaims {
  sub: string
  purpose: 'step_up'
  aud: StepUpPurpose
  /** valor em centavos inteiros (canônico) */
  amt: number
  /** hash de binding hex de (amt|pix_key canônica) */
  pkh: string
  /** id único do token (single-use) */
  jti: string
  iat: number
  exp: number
}

const STEP_UP_TTL = 5 * 60 // 5 minutos

/**
 * Converte um valor monetário para centavos inteiros de forma determinística.
 * Evita que `100` e `100.00` produzam bindings diferentes entre reauth e saque.
 * Arredonda para o centavo mais próximo (meio-para-cima) para evitar drift de float.
 */
export function canonicalAmountCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount inválido')
  }
  return Math.round(amount * 100)
}

/** Normaliza a chave PIX (trim + minúsculas) para binding estável. */
export function canonicalPixKey(pixKey: string): string {
  return pixKey.trim().toLowerCase()
}

/**
 * Hash de binding de (amount, pix_key). SHA-256 hex de "amtCents:pixKeyCanônica".
 * O mesmo saque sempre gera o mesmo hash; qualquer mudança de valor OU chave muda o hash.
 */
export async function stepUpBindingHash(amount: number, pixKey: string): Promise<string> {
  const amtCents = canonicalAmountCents(amount)
  const canonical = `${amtCents}:${canonicalPixKey(pixKey)}`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Reusa a máquina de assinatura HS256 do auth-helpers via verifyJWT; para assinar,
// replicamos o mesmo formato (o auth-helpers não exporta signJWT genérico).
async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Emite um step_up_token assinado (HS256, 5 min) vinculado à transação.
 */
export async function signStepUpToken(
  input: { sub: string; aud: StepUpPurpose; amount: number; pixKey: string; jti: string },
  secret: string
): Promise<{ token: string; claims: StepUpClaims }> {
  const now = Math.floor(Date.now() / 1000)
  const claims: StepUpClaims = {
    sub: input.sub,
    purpose: 'step_up',
    aud: input.aud,
    amt: canonicalAmountCents(input.amount),
    pkh: await stepUpBindingHash(input.amount, input.pixKey),
    jti: input.jti,
    iat: now,
    exp: now + STEP_UP_TTL,
  }
  const header = { alg: 'HS256', typ: 'JWT' }
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign({ name: 'HMAC', hash: 'SHA-256' }, key, new TextEncoder().encode(data))
  return { token: `${data}.${b64url(sig)}`, claims }
}

/**
 * Verifica assinatura + expiração + shape do step_up_token e devolve os claims.
 * NÃO valida binding (amount/pix_key/aud) — isso é responsabilidade do middleware,
 * que compara contra o body do saque. Lança em token inválido/expirado/malformado.
 */
export async function verifyStepUpToken(token: string, secret: string): Promise<StepUpClaims> {
  const claims = await verifyJWT<StepUpClaims>(token, secret)
  if (claims.purpose !== 'step_up' || !claims.jti || !claims.aud || typeof claims.amt !== 'number' || !claims.pkh) {
    throw new Error('Step-up token malformado')
  }
  return claims
}
