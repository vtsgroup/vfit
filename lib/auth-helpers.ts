// ============================================
// auth-helpers.ts — JWT, senha, sessões, TOTP e códigos de referral
// ============================================
//
// O que faz:
//   Implementa toda infraestrutura de autenticação: assina/verifica JWTs
//   com Web Crypto API (sem dependências externas), hash/verify de senhas
//   com bcryptjs (cost 12), gerenciamento de sessões no KV,
//   TOTP completo (RFC 6238) para 2FA e geração de códigos de referral.
//
// Exports principais:
//   signAccessToken(payload, secret) → JWT string (1h TTL)
//   signRefreshToken(userId, secret) → JWT string (30d TTL)
//   verifyJWT(token, secret) → JWTPayload
//   hashPassword(password) / verifyPassword(password, hash)
//   createSession / getSession / revokeSession / listUserSessions
//   generateTOTPSecret / buildTOTPAuthUrl / verifyTOTPCode
//   blacklistToken / isTokenBlacklisted
//   generateReferralCode() → 8-char alphanum
//
// KV: KV_SESSIONS (sessions:id, user-sessions:userId:id, blacklist:hash)
// ============================================

import type { Bindings, JWTPayload } from '@workers/types'

// ============================================
// JWT HELPERS
// ============================================

const JWT_ALGORITHM = { name: 'HMAC', hash: 'SHA-256' }
const ACCESS_TOKEN_TTL = 60 * 60 // 1 hour
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days

/**
 * Importa chave secreta para uso com Web Crypto API
 */
async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    JWT_ALGORITHM,
    false,
    ['sign', 'verify']
  )
}

/**
 * Base64url encode
 */
function base64urlEncode(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Base64url decode
 */
function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Gera um access token JWT (1h TTL)
 */
export async function signAccessToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL,
  }

  return signJWT(fullPayload, secret)
}

/**
 * Gera um refresh token JWT (30d TTL)
 */
export async function signRefreshToken(
  userId: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: userId,
    type: 'refresh' as const,
    iat: now,
    exp: now + REFRESH_TOKEN_TTL,
  }

  return signJWT(payload, secret)
}

/**
 * Assina JWT usando Web Crypto API (compatível com Workers)
 */
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const key = await importKey(secret)

  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`

  const signature = await crypto.subtle.sign(
    JWT_ALGORITHM,
    key,
    new TextEncoder().encode(data)
  )

  return `${data}.${base64urlEncode(signature)}`
}

/**
 * Verifica e decodifica JWT
 */
export async function verifyJWT<T = JWTPayload>(
  token: string,
  secret: string
): Promise<T> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Token malformado')

  const [headerB64, payloadB64, signatureB64] = parts
  const key = await importKey(secret)

  const data = `${headerB64}.${payloadB64}`
  const signature = base64urlDecode(signatureB64)

  // Cast necessário: @cloudflare/workers-types redefine Uint8Array de forma
  // incompatível com os tipos DOM do Next.js build
  const sig = signature as unknown as BufferSource
  const msg = new TextEncoder().encode(data) as unknown as BufferSource

  const valid = await crypto.subtle.verify(
    JWT_ALGORITHM,
    key,
    sig,
    msg
  )

  if (!valid) throw new Error('Assinatura inválida')

  const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64))) as T & { exp?: number }

  // Check expiration
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado')
  }

  return payload as T
}

// ============================================
// PASSWORD HELPERS (bcryptjs)
// ============================================

// bcryptjs será importado dinamicamente para manter compatibilidade
// com Workers (pure JS, sem native modules)

/**
 * Hash de senha com bcrypt (12 rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

/**
 * Verifica senha contra hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

// ============================================
// SESSION HELPERS (KV)
// ============================================

const SESSION_TTL = 24 * 60 * 60 // 24 hours

export interface SessionData {
  userId: string
  userType: 'personal' | 'student' | 'admin'
  email: string
  ip?: string
  userAgent?: string
  createdAt: string
}

export interface UserSessionData extends SessionData {
  sessionId: string
}

function isKvDailyWriteLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '')
  return /limit exceeded for the day/i.test(message)
}

// ============================================
// TOTP HELPERS (2FA)
// ============================================

const TOTP_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const TOTP_STEP_SECONDS = 30
const TOTP_DIGITS = 6

function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += TOTP_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += TOTP_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

function base32Decode(input: string): Uint8Array {
  const normalized = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const output: number[] = []

  for (const char of normalized) {
    const idx = TOTP_ALPHABET.indexOf(char)
    if (idx === -1) {
      throw new Error('Secret TOTP inválido')
    }

    value = (value << 5) | idx
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

function sanitizeTotpCode(code: string): string {
  return code.replace(/\s+/g, '').replace(/-/g, '')
}

async function generateTotpAt(secret: string, unixTimeSeconds: number): Promise<string> {
  const counter = Math.floor(unixTimeSeconds / TOTP_STEP_SECONDS)
  const counterBuffer = new ArrayBuffer(8)
  const view = new DataView(counterBuffer)
  view.setUint32(0, Math.floor(counter / 0x100000000), false)
  view.setUint32(4, counter >>> 0, false)

  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(secret) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, counterBuffer)
  const hash = new Uint8Array(signature)
  const offset = hash[hash.length - 1] & 0x0f
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const otp = binary % 10 ** TOTP_DIGITS
  return String(otp).padStart(TOTP_DIGITS, '0')
}

/**
 * Gera secret Base32 para TOTP (Google Authenticator)
 */
export function generateTOTPSecret(byteLength = 20): string {
  const bytes = new Uint8Array(Math.max(10, Math.min(64, byteLength)))
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

/**
 * Gera URI otpauth:// para QR code / setup manual
 */
export function buildTOTPAuthUrl(issuer: string, accountName: string, secret: string): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedAccount = encodeURIComponent(accountName)
  const encodedSecret = encodeURIComponent(secret)
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_SECONDS}`
}

/**
 * Gera o código TOTP atual para um secret.
 * Útil para fluxos internos e testes.
 */
export async function generateTOTPCode(secret: string, nowSeconds = Math.floor(Date.now() / 1000)): Promise<string> {
  return generateTotpAt(secret, nowSeconds)
}

/**
 * Verifica código TOTP com janela de tolerância (default ±1 step)
 */
export async function verifyTOTPCode(
  code: string,
  secret: string,
  options?: { window?: number; now?: number }
): Promise<boolean> {
  const normalizedCode = sanitizeTotpCode(code)
  if (!/^\d{6}$/.test(normalizedCode)) return false

  const now = options?.now ?? Math.floor(Date.now() / 1000)
  const window = Math.max(0, Math.min(5, options?.window ?? 1))

  for (let offset = -window; offset <= window; offset++) {
    const generated = await generateTotpAt(secret, now + offset * TOTP_STEP_SECONDS)
    if (generated === normalizedCode) {
      return true
    }
  }

  return false
}

/**
 * Cria sessão no KV
 */
export async function createSession(
  kv: KVNamespace,
  sessionId: string,
  data: SessionData
): Promise<void> {
  try {
    await Promise.all([
      kv.put(`session:${sessionId}`, JSON.stringify(data), {
        expirationTtl: SESSION_TTL,
      }),
      kv.put(`user-sessions:${data.userId}:${sessionId}`, '1', {
        expirationTtl: SESSION_TTL,
      }),
    ])
  } catch (error) {
    if (isKvDailyWriteLimitError(error)) {
      console.warn('[Auth] KV session write skipped (daily write limit reached)')
      return
    }
    throw error
  }
}

/**
 * Busca sessão no KV
 */
export async function getSession(
  kv: KVNamespace,
  sessionId: string
): Promise<SessionData | null> {
  return kv.get<SessionData>(`session:${sessionId}`, 'json')
}

/**
 * Revoga sessão (logout)
 */
export async function revokeSession(
  kv: KVNamespace,
  sessionId: string
): Promise<void> {
  try {
    const existing = await getSession(kv, sessionId)
    await kv.delete(`session:${sessionId}`)
    if (existing?.userId) {
      await kv.delete(`user-sessions:${existing.userId}:${sessionId}`)
    }
  } catch (error) {
    if (isKvDailyWriteLimitError(error)) {
      console.warn('[Auth] KV session revoke skipped (daily write limit reached)')
      return
    }
    throw error
  }
}

/**
 * Lista sessões ativas de um usuário (mais recentes primeiro)
 */
export async function listUserSessions(
  kv: KVNamespace,
  userId: string,
  limit = 20
): Promise<UserSessionData[]> {
  const keys = await kv.list({
    prefix: `user-sessions:${userId}:`,
    limit: Math.max(1, Math.min(100, limit)),
  })

  const sessions = await Promise.all(
    keys.keys.map(async (key) => {
      const sessionId = key.name.split(':').at(-1)
      if (!sessionId) return null

      const data = await getSession(kv, sessionId)
      if (!data) return null

      return {
        sessionId,
        ...data,
      } satisfies UserSessionData
    })
  )

  return sessions
    .filter((item): item is UserSessionData => item !== null)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

/**
 * Verifica se token está na blacklist (logout forçado)
 */
export async function isTokenBlacklisted(
  kv: KVNamespace,
  tokenHash: string
): Promise<boolean> {
  const result = await kv.get(`blacklist:${tokenHash}`)
  return result !== null
}

/**
 * Adiciona token à blacklist (forçar logout)
 */
export async function blacklistToken(
  kv: KVNamespace,
  tokenHash: string,
  ttlSeconds = ACCESS_TOKEN_TTL
): Promise<void> {
  try {
    await kv.put(`blacklist:${tokenHash}`, '1', {
      expirationTtl: ttlSeconds,
    })
  } catch (error) {
    if (isKvDailyWriteLimitError(error)) {
      console.warn('[Auth] KV token blacklist skipped (daily write limit reached)')
      return
    }
    throw error
  }
}

// ============================================
// REFERRAL CODE GENERATOR
// ============================================

/**
 * Gera código de referral único (8 chars alfanuméricos)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem I,O,0,1 para evitar confusão
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('')
}
