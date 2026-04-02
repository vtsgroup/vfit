/**
 * workers/api/passkey.ts
 *
 * passkey.ts — Autenticação biométrica WebAuthn/Passkey
 * Features: DB: Neon
 */

// ============================================
// passkey.ts — Autenticação biométrica WebAuthn/Passkey
// ============================================
//
// O que faz:
//   Registro e autenticação biométrica via WebAuthn usando
//   @simplewebauthn/server. Montado em /api/v1/auth (não /api/v1/passkey).
//   Suporta listagem, remoção e renomeação de passkeys cadastradas.
//
// Exports principais:
//   passkeyRoutes — Hono app montado em /api/v1/auth (⚠️ não /api/v1/passkey)
//
// Auth: registro e gestão exigem Bearer token. Login (/login/*) é público.
// DB: user_passkeys (credential_id, public_key, counter, device_name)
// KV: KV_SESSIONS (webauthn-challenge:{userId} — TTL 5min)
// ============================================

import { Hono } from 'hono'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from '@lib/errors'
import { authMiddleware } from '@workers/middleware/auth'
import { signAccessToken, signRefreshToken, createSession } from '@lib/auth-helpers'
import type { AppContext } from '@workers/types'

const passkey = new Hono<AppContext>()

// ============================================
// Helpers
// ============================================

/** Extract RP (Relying Party) config from request origin */
function getRPConfig(c: { req: { header: (name: string) => string | undefined } }) {
  const origin = c.req.header('origin') || 'https://iapersonal.app.br'
  const url = new URL(origin)
  return {
    rpName: 'VFIT',
    rpID: url.hostname,
    origin,
  }
}

/** base64url encode Uint8Array → string */
function b64urlEncode(buf: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < buf.length; i++) {
    binary += String.fromCharCode(buf[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** base64url decode string → Uint8Array */
function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// ============================================
// REGISTRATION — requires auth (user must be logged in)
// ============================================

/**
 * POST /passkey/register/options
 * Generate WebAuthn registration options (challenge + RP config)
 */
passkey.post('/passkey/register/options', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { rpName, rpID } = getRPConfig(c)

    console.log(`[Passkey] register/options for user=${userId}, rpID=${rpID}`)

    // Get user info
    const user = await pgQueryOne<{ id: string; email: string; full_name: string }>(
      c.env,
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [userId]
    )
    if (!user) throw new NotFoundError('Usuário')

    // Get existing passkeys to exclude (prevent duplicate registration)
    const { rows: existing } = await pgQuery<{ credential_id: string; transports: string | null }>(
      c.env,
      'SELECT credential_id, transports FROM user_passkeys WHERE user_id = $1',
      [userId]
    )

    console.log(`[Passkey] user=${user.email}, existing_passkeys=${existing.length}`)

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      userDisplayName: user.full_name || user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'preferred',
      },
      excludeCredentials: existing.map((cred) => ({
        id: cred.credential_id,
        transports: cred.transports
          ? (JSON.parse(cred.transports) as AuthenticatorTransport[])
          : undefined,
      })),
      timeout: 60000,
    })

    // Store challenge in KV with 5min TTL
    await c.env.KV_SESSIONS.put(
      `passkey_reg_challenge:${userId}`,
      options.challenge,
      { expirationTtl: 300 }
    )

    console.log(`[Passkey] register/options generated successfully for user=${userId}`)
    return success(options)
  } catch (err) {
    console.error('[Passkey] register/options error:', err instanceof Error ? err.message : err, err instanceof Error ? err.stack : '')
    throw err
  }
})

/**
 * POST /passkey/register/complete
 * Verify registration response and store the credential
 */
passkey.post('/passkey/register/complete', authMiddleware, async (c) => {
  let debugStep = 'init'
  try {
    debugStep = 'parse_body'
    const userId = c.get('userId')
    const body = await c.req.json()
    const { credential, device_name } = body

    if (!credential) throw new BadRequestError('Credential obrigatória')

    debugStep = 'rp_config'
    const { rpID, origin } = getRPConfig(c)

    // Flexibilidade: aceitar origens/RPIDs conhecidas (www, pages.dev, etc)
    const allowedOrigins = new Set([
      'https://iapersonal.app.br',
      'https://vfit.pages.dev',
      'https://personal-ia-prod.pages.dev', // legacy
      origin,
    ])
    const allowedRPIDs = new Set([
      'iapersonal.app.br',
      'vfit.pages.dev',
      'personal-ia-prod.pages.dev', // legacy
      rpID,
    ])

    // Retrieve stored challenge
    debugStep = 'kv_challenge'
    const expectedChallenge = await c.env.KV_SESSIONS.get(`passkey_reg_challenge:${userId}`)
    if (!expectedChallenge) {
      throw new BadRequestError('Challenge expirado. Tente novamente.')
    }

    // Verify the registration response
    debugStep = 'verify'
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: [...allowedOrigins],
      expectedRPID: [...allowedRPIDs],
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestError('Falha na verificação do passkey')
    }

    const { credential: cred, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo

    // Store credential in PostgreSQL
    debugStep = 'db_insert'
    const id = generateId()
    const publicKeyB64 = b64urlEncode(cred.publicKey)
    const transportsJSON = credential.response?.transports
      ? JSON.stringify(credential.response.transports)
      : null

    await pgQuery(
      c.env,
      `INSERT INTO user_passkeys
         (id, user_id, credential_id, public_key, counter, device_type, backed_up, transports, device_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        userId,
        cred.id,
        publicKeyB64,
        cred.counter,
        credentialDeviceType,
        credentialBackedUp,
        transportsJSON,
        device_name || null,
      ]
    )

    // Cleanup challenge from KV
    debugStep = 'kv_cleanup'
    await c.env.KV_SESSIONS.delete(`passkey_reg_challenge:${userId}`)

    return created({
      id,
      credential_id: cred.id,
      device_name: device_name || null,
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error(`[Passkey] register/complete ERROR at step=${debugStep}:`, errMsg)

    // Persist last error for quick diagnosis
    try {
      await c.env.KV_CACHE.put('passkey_debug_last_error', JSON.stringify({
        flow: 'register',
        step: debugStep,
        error: errMsg,
        isAppError: err instanceof AppError,
        timestamp: new Date().toISOString(),
      }), { expirationTtl: 3600 })
    } catch {
      // ignore KV errors
    }

    if (err instanceof AppError) throw err
    const msg = err instanceof Error ? err.message : String(err)
    throw new BadRequestError(`Passkey register falhou: ${msg}`)
  }
})

// ============================================
// AUTHENTICATION — public (no auth required)
// ============================================

/**
 * POST /passkey/login/options
 * Generate WebAuthn authentication options for a given email
 */
passkey.post('/passkey/login/options', async (c) => {
  const body = await c.req.json()
  const email = body?.email?.toLowerCase?.()?.trim?.()

  if (!email) throw new BadRequestError('Email é obrigatório')

  const { rpID } = getRPConfig(c)

  // Find user by email
  const user = await pgQueryOne<{ id: string }>(
    c.env,
    'SELECT id FROM users WHERE LOWER(email) = $1 AND is_active = true',
    [email]
  )
  if (!user) throw new NotFoundError('Usuário')

  // Get user's passkeys
  const { rows: passkeys } = await pgQuery<{ credential_id: string; transports: string | null }>(
    c.env,
    'SELECT credential_id, transports FROM user_passkeys WHERE user_id = $1',
    [user.id]
  )

  if (passkeys.length === 0) {
    throw new BadRequestError('Nenhum passkey registrado para este email')
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: passkeys.map((pk) => ({
      id: pk.credential_id,
      transports: pk.transports
        ? (JSON.parse(pk.transports) as AuthenticatorTransport[])
        : undefined,
    })),
    userVerification: 'preferred',
    timeout: 60000,
  })

  // Store challenge + user mapping in KV (5min TTL)
  await Promise.all([
    c.env.KV_SESSIONS.put(
      `passkey_auth_challenge:${user.id}`,
      options.challenge,
      { expirationTtl: 300 }
    ),
    c.env.KV_SESSIONS.put(
      `passkey_auth_email:${email}`,
      user.id,
      { expirationTtl: 300 }
    ),
  ])

  return success(options)
})

/**
 * POST /passkey/login/complete
 * Verify assertion and issue JWT tokens
 */
passkey.post('/passkey/login/complete', async (c) => {
  let debugStep = 'init'
  try {
  debugStep = 'parse_body'
  const body = await c.req.json()
  const { email, credential } = body

  if (!email || !credential) throw new BadRequestError('Dados incompletos')

  const emailNorm = email.toLowerCase().trim()
  const { rpID, origin } = getRPConfig(c)

  // Build arrays of allowed origins and RP IDs for flexibility
  const allowedOrigins = new Set([
    'https://iapersonal.app.br',
    'https://vfit.pages.dev',
    'https://personal-ia-prod.pages.dev', // legacy
    origin,
  ])
  const allowedRPIDs = new Set([
    'iapersonal.app.br',
    'vfit.pages.dev',
    'personal-ia-prod.pages.dev', // legacy
    rpID,
  ])

  console.log(`[Passkey] login/complete email=${emailNorm}, rpID=${rpID}, origin=${origin}`)
  console.log(`[Passkey] credential keys: ${Object.keys(credential).join(',')}`)
  console.log(`[Passkey] credential.id=${credential?.id}, rawId=${credential?.rawId}, type=${credential?.type}`)
  if (credential?.response) {
    console.log(`[Passkey] response keys: ${Object.keys(credential.response).join(',')}`)
    console.log(`[Passkey] clientDataJSON length=${credential.response?.clientDataJSON?.length}, authData length=${credential.response?.authenticatorData?.length}, sig length=${credential.response?.signature?.length}`)
  }

  // Get user ID from KV mapping
  debugStep = 'kv_email'
  const userId = await c.env.KV_SESSIONS.get(`passkey_auth_email:${emailNorm}`)
  if (!userId) throw new BadRequestError('Sessão expirada. Tente novamente.')

  // Get stored challenge
  debugStep = 'kv_challenge'
  const expectedChallenge = await c.env.KV_SESSIONS.get(`passkey_auth_challenge:${userId}`)
  if (!expectedChallenge) throw new BadRequestError('Challenge expirado. Tente novamente.')

  console.log(`[Passkey] userId=${userId}, challenge_len=${expectedChallenge.length}`)

  // Find the matching stored credential
  debugStep = 'db_query'
  const storedCred = await pgQueryOne<{
    id: string
    credential_id: string
    public_key: string
    counter: number
    transports: string | null
  }>(
    c.env,
    'SELECT id, credential_id, public_key, counter, transports FROM user_passkeys WHERE credential_id = $1 AND user_id = $2',
    [credential.id, userId]
  )
  if (!storedCred) {
    console.error(`[Passkey] credential not found: credential.id=${credential.id}, userId=${userId}`)
    throw new NotFoundError('Passkey')
  }

  console.log(`[Passkey] stored cred found: pk_len=${storedCred.public_key?.length}, counter=${storedCred.counter}`)

  // Verify the authentication response
  debugStep = 'verify'
  let verification
  try {
    const decodedPK = b64urlDecode(storedCred.public_key)
    console.log(`[Passkey] decoded PK bytes=${decodedPK.length}, first3=[${decodedPK[0]},${decodedPK[1]},${decodedPK[2]}]`)
    
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: [...allowedOrigins],
      expectedRPID: [...allowedRPIDs],
      requireUserVerification: false,
      credential: {
        id: storedCred.credential_id,
        publicKey: decodedPK,
        counter: Number(storedCred.counter) || 0,
        transports: storedCred.transports
          ? (JSON.parse(storedCred.transports) as AuthenticatorTransport[])
          : undefined,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[Passkey] verifyAuth FAILED at step=${debugStep}:`, msg)
    // Store error in KV for debug retrieval
    await c.env.KV_CACHE.put('passkey_debug_last_error', JSON.stringify({
      step: debugStep,
      error: msg,
      email: emailNorm,
      credential_id: credential?.id,
      rawId: credential?.rawId,
      rpID,
      origin,
      expectedChallenge: expectedChallenge?.substring(0, 10) + '...',
      storedCredId: storedCred.credential_id,
      storedPKLen: storedCred.public_key?.length,
      timestamp: new Date().toISOString(),
    }), { expirationTtl: 3600 })
    throw new BadRequestError(`Falha na verificação biométrica: ${msg}`)
  }

  if (!verification.verified) {
    await c.env.KV_CACHE.put('passkey_debug_last_error', JSON.stringify({
      step: 'verified_false',
      error: 'Signature verification returned false',
      email: emailNorm,
      timestamp: new Date().toISOString(),
    }), { expirationTtl: 3600 })
    throw new UnauthorizedError('Falha na autenticação biométrica')
  }

  debugStep = 'post_verify'
  console.log(`[Passkey] authentication verified for user=${userId}`)

  // Update counter + last_used_at
  await pgQuery(
    c.env,
    'UPDATE user_passkeys SET counter = $1, last_used_at = NOW() WHERE id = $2',
    [verification.authenticationInfo.newCounter, storedCred.id]
  )

  // Get full user data
  const user = await pgQueryOne<{
    id: string
    email: string
    full_name: string
    user_type: string
    profile_photo_url: string | null
    is_active: boolean
    email_verified: boolean
    role: string | null
  }>(
    c.env,
    `SELECT id, email, full_name, user_type, profile_photo_url, is_active, email_verified, role
     FROM users WHERE id = $1`,
    [userId]
  )
  if (!user) throw new NotFoundError('Usuário')

  console.log(`[Passkey] user found: id=${user.id}, type=${user.user_type}, role=${user.role}`)

  // Update last_login_at
  await pgQuery(c.env, 'UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId])

  // Generate JWT tokens
  const jwtRole: 'user' | 'admin' | 'super_admin' =
    user.role === 'admin' || user.role === 'super_admin' ? user.role : 'user'

  const access_token = await signAccessToken(
    { sub: user.id, email: user.email, type: user.user_type as 'personal' | 'student', role: jwtRole },
    c.env.JWT_SECRET
  )
  const refresh_token = await signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET)

  // Create session
  const sessionId = generateId()
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  const userAgent = c.req.header('user-agent') || 'unknown'

  await createSession(c.env.KV_SESSIONS, sessionId, {
    userId: user.id,
    userType: user.user_type as 'personal' | 'student',
    email: user.email,
    ip,
    userAgent,
    createdAt: new Date().toISOString(),
  })

  // Cleanup KV
  await Promise.all([
    c.env.KV_SESSIONS.delete(`passkey_auth_challenge:${userId}`),
    c.env.KV_SESSIONS.delete(`passkey_auth_email:${emailNorm}`),
  ])

  // Return same shape as normal login (POST /auth/login)
  // Profile data is fetched by frontend via GET /auth/me after login
  return success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: (user.role === 'admin' || user.role === 'super_admin') ? 'admin' as const : user.user_type,
      profile_photo_url: user.profile_photo_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
      role: user.role || 'user',
    },
    tokens: {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: 3600,
    },
    session_id: sessionId,
    auth_method: 'passkey',
  })
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error(`[Passkey] login/complete ERROR at step=${debugStep}:`, errMsg)
    // Store in KV for debug retrieval
    try {
      await c.env.KV_CACHE.put('passkey_debug_last_error', JSON.stringify({
        step: debugStep,
        error: errMsg,
        isAppError: err instanceof AppError,
        timestamp: new Date().toISOString(),
      }), { expirationTtl: 3600 })
    } catch { /* ignore KV errors */ }
    // Re-throw known AppErrors (they have proper status codes)
    if (err instanceof AppError) throw err
    // Convert unknown errors to BadRequestError so we get the real message (not generic 500)
    const msg = err instanceof Error ? err.message : String(err)
    throw new BadRequestError(`Passkey login falhou: ${msg}`)
  }
})

// ============================================
// MANAGEMENT — requires auth
// ============================================

/**
 * GET /passkeys — List user's registered passkeys
 */
passkey.get('/passkeys', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const { rows: passkeys } = await pgQuery(
    c.env,
    `SELECT id, device_name, device_type, backed_up, created_at, last_used_at
     FROM user_passkeys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )

  return success(passkeys)
})

/**
 * DELETE /passkeys/:id — Remove a passkey
 */
passkey.delete('/passkeys/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const passkeyId = c.req.param('id')

  const result = await pgQueryOne(
    c.env,
    'DELETE FROM user_passkeys WHERE id = $1 AND user_id = $2 RETURNING id',
    [passkeyId, userId]
  )

  if (!result) throw new NotFoundError('Passkey')

  return noContent()
})

/**
 * GET /passkeys/check/:email — Check if an email has passkeys (public)
 * Used by login page to show biometric button
 */
passkey.get('/passkeys/check/:email', async (c) => {
  const email = decodeURIComponent(c.req.param('email')).toLowerCase().trim()

  const result = await pgQueryOne<{ count: string }>(
    c.env,
    'SELECT COUNT(*)::text as count FROM user_passkeys pk JOIN users u ON pk.user_id = u.id WHERE LOWER(u.email) = $1 AND u.is_active = true',
    [email]
  )

  return success({ has_passkeys: parseInt(result?.count || '0') > 0 })
})

/**
 * GET /passkeys/debug/last-error — Get last passkey error (temporary debug endpoint)
 */
passkey.get('/passkeys/debug/last-error', async (c) => {
  const data = await c.env.KV_CACHE.get('passkey_debug_last_error')
  if (!data) return success({ message: 'No errors recorded' })
  return success(JSON.parse(data))
})

export { passkey as passkeyRoutes }
