/**
 * workers/api/oauth.ts
 *
 * oauth.ts — Login social OAuth 2.0 (Google)
 * Features: DB: Neon
 */

// ============================================
// oauth.ts — Login social OAuth 2.0 (Google)
// ============================================
//
// O que faz:
//   Fluxo OAuth 2.0 para login social: GET /:provider redireciona ao
//   provider; GET /:provider/callback troca code por tokens, busca perfil
//   e retorna JWT. Cria usuário automaticamente se não existir (personal).
//
// Exports principais:
//   oauthRoutes — Hono app montado em /api/v1/auth
//
// Auth: público (inicia o fluxo sem autenticação)
// DB: users, personals (criação automática em primeiro login)
// Side effects: email de boas-vindas em primeiro login via Resend
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import {
  signAccessToken,
  signRefreshToken,
  createSession,
} from '@lib/auth-helpers'
import { generateId, pgQuery } from '@lib/db'
import { success } from '@lib/response'
import { BadRequestError, UnauthorizedError } from '@lib/errors'

const oauth = new Hono<AppContext>()

// ============================================
// GOOGLE OAuth
// ============================================

/**
 * GET /auth/oauth/google
 * Redireciona o user para o Google consent screen
 * Suporta ?type=student|personal e ?invite=TOKEN para cadastro de alunos
 */
oauth.get('/google', (c) => {
  const state = generateOAuthState()
  const redirectUri = c.env.GOOGLE_REDIRECT_URI

  // Capturar tipo de user e invite token (para cadastro de alunos via OAuth)
  const userType = c.req.query('type') || 'personal'
  const inviteToken = c.req.query('invite') || ''

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  // Salvar state no KV com metadata (5 min TTL)
  const stateData = JSON.stringify({
    provider: 'google',
    user_type: userType === 'student' ? 'student' : 'personal',
    invite_token: inviteToken || null,
  })
  c.executionCtx.waitUntil(
    c.env.KV_SESSIONS.put(`oauth_state:${state}`, stateData, { expirationTtl: 300 })
  )

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

/**
 * GET /auth/oauth/google/callback
 * Recebe o code do Google, troca por tokens, cria/login user
 */
oauth.get('/google/callback', async (c) => {
  const frontendLogin = 'https://vfit.app.br/login'

  try {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  if (error) {
    console.error(`[OAuth Google] Provider error: ${error}`)
    return c.redirect(`${frontendLogin}?error=oauth_denied`)
  }

  if (!code || !state) {
    return c.redirect(`${frontendLogin}?error=oauth_missing_params`)
  }

  // Validar state
  const storedData = await c.env.KV_SESSIONS.get(`oauth_state:${state}`)
  if (!storedData) {
    throw new BadRequestError('State OAuth inválido ou expirado')
  }

  // Parse state data — suporta formato novo (JSON) e legado (string "google")
  let stateProvider = 'google'
  let stateUserType: 'personal' | 'student' = 'personal'
  let stateInviteToken: string | null = null

  try {
    const parsed = JSON.parse(storedData)
    stateProvider = parsed.provider || 'google'
    stateUserType = parsed.user_type === 'student' ? 'student' : 'personal'
    stateInviteToken = parsed.invite_token || null
  } catch {
    // Formato legado: string "google"
    stateProvider = storedData
  }

  if (stateProvider !== 'google') {
    throw new BadRequestError('State OAuth inválido ou expirado')
  }
  await c.env.KV_SESSIONS.delete(`oauth_state:${state}`)

  // Trocar code por tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text()
    console.error('[OAuth Google] Token exchange failed:', err)
    throw new UnauthorizedError('Falha ao autenticar com Google')
  }

  const tokenData = await tokenResponse.json<{
    access_token: string
    id_token: string
  }>()

  // Buscar info do user via Google
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userInfoResponse.ok) {
    throw new UnauthorizedError('Falha ao obter dados do Google')
  }

  const googleUser = await userInfoResponse.json<{
    id: string
    email: string
    name: string
    picture?: string
    verified_email?: boolean
  }>()

  // Login ou criar user
  return handleOAuthLogin(c, {
    provider: 'google',
    providerId: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    emailVerified: googleUser.verified_email ?? false,
    requestedUserType: stateUserType,
    invitationToken: stateInviteToken,
  })

  } catch (err) {
    console.error('[OAuth Google] Callback error:', err)
    return c.redirect(`${frontendLogin}?error=oauth_failed`)
  }
})

// ============================================
// SHARED OAuth HANDLER
// ============================================

interface OAuthUserInfo {
  provider: 'google'
  providerId: string
  email: string
  name: string
  picture?: string
  emailVerified: boolean
  requestedUserType?: 'personal' | 'student'
  invitationToken?: string | null
}

/**
 * Lógica compartilhada: login ou registro via OAuth
 * - Se user existe com esse email → login
 * - Se não existe → cria user (personal ou student conforme requestedUserType)
 */
async function handleOAuthLogin(
  c: { env: Bindings; req: { raw: Request; header: (name: string) => string | undefined }; executionCtx: ExecutionContext },
  info: OAuthUserInfo
): Promise<Response> {
  const env = c.env
  const now = new Date().toISOString()
  const frontendErrorUrl = 'https://vfit.app.br/login?error=oauth_failed'

  try {
    // Buscar user existente
    const { rows: existingUsers } = await pgQuery<{
      id: string
      email: string
      full_name: string
      user_type: 'personal' | 'student'
      role: 'user' | 'admin' | 'super_admin' | null
      is_active: boolean
      email_verified: boolean
      profile_photo_url: string | null
    }>(env, 'SELECT id, email, full_name, user_type, role, is_active, email_verified, profile_photo_url FROM users WHERE email = $1 LIMIT 1', [
      info.email.toLowerCase(),
    ])

    let user = existingUsers[0]
    let isNewUser = false

    if (!user) {
      // ── NOVO USUÁRIO VIA OAUTH ──
      const userId = generateId()
      isNewUser = true
      const targetType = info.requestedUserType || 'personal'

      console.log(`[OAuth] Creating new ${targetType} user: ${info.email} via ${info.provider}`)

      // 1) Criar user (cpf=NULL, password_hash=NULL — OAuth user)
      try {
        await pgQuery(env, `
          INSERT INTO users (id, email, full_name, cpf, user_type, role, profile_photo_url, password_hash, is_active, email_verified, created_at, updated_at, metadata)
          VALUES ($1, $2, $3, NULL, $4, 'user', $5, NULL, true, $6, $7, $7, $8)
        `, [
          userId,
          info.email.toLowerCase(),
          info.name,
          targetType,
          info.picture || null,
          info.emailVerified,
          now,
          JSON.stringify({
            oauth_provider: info.provider,
            oauth_provider_id: info.providerId,
            needs_profile_completion: true,
          }),
        ])
      } catch (err) {
        console.error(`[OAuth] Failed to INSERT user:`, err)
        throw err
      }

      // 2) Criar registro na tabela de profile (personal ou student)
      if (targetType === 'student') {
        // Criar registro de student
        try {
          // Se tem invitation token, buscar personal_id
          let personalId: string | null = null
          if (info.invitationToken) {
            const { rows: invRows } = await pgQuery<{ personal_id: string }>(env,
              'SELECT personal_id FROM students WHERE invitation_token = $1 LIMIT 1',
              [info.invitationToken]
            )
            if (invRows.length > 0) {
              personalId = invRows[0].personal_id
              // Atualizar student record existente (aceitar convite)
              await pgQuery(env, `
                UPDATE students
                SET id = $1, accepted_at = $2, invitation_token = NULL, status = 'active', updated_at = $2
                WHERE invitation_token = $3
              `, [userId, now, info.invitationToken])
            }
          }

          if (!personalId) {
            // Criar student record autônomo (sem vínculo com personal)
            await pgQuery(env, `
              INSERT INTO students (id, personal_id, accepted_at, status, payment_status, created_at, updated_at)
              VALUES ($1, NULL, $2, 'active', 'pending', $2, $2)
            `, [userId, now])
          }

          // Incrementar contagem de alunos do personal (se vinculado)
          if (personalId) {
            await pgQuery(env, `
              UPDATE personals
              SET total_students = total_students + 1,
                  active_students = active_students + 1,
                  updated_at = $1
              WHERE id = $2
            `, [now, personalId]).catch(() => {})
          }
        } catch (err) {
          console.error(`[OAuth] Failed to INSERT student:`, err)
          await pgQuery(env, 'DELETE FROM users WHERE id = $1', [userId]).catch(() => {})
          throw err
        }
      } else {
        // Criar registro de personal (trial plan, placeholder CREF)
        try {
          const referralCode = `R${userId.replace(/-/g, '').slice(0, 7).toUpperCase()}`
          const placeholderCref = `OAUTH-${userId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
          const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

          await pgQuery(env, `
            INSERT INTO personals (id, cref, cref_state, specialties, subscription_plan, subscription_status, trial_ends_at, referral_code, total_students, active_students, total_revenue, created_at, updated_at)
            VALUES ($1, $2, 'XX', ARRAY[]::TEXT[], 'trial', 'active', $3, $4, 0, 0, 0, $5, $5)
          `, [
            userId,
            placeholderCref,
            trialEnds,
            referralCode,
            now,
          ])
        } catch (err) {
          console.error(`[OAuth] Failed to INSERT personals:`, err)
          await pgQuery(env, 'DELETE FROM users WHERE id = $1', [userId]).catch(() => {})
          throw err
        }
      }

      user = {
        id: userId,
        email: info.email.toLowerCase(),
        full_name: info.name,
        user_type: targetType,
        role: 'user',
        is_active: true,
        email_verified: info.emailVerified,
        profile_photo_url: info.picture || null,
      }

      console.log(`[OAuth] New ${targetType} user created: ${userId}`)
    } else {
      // ── USUÁRIO EXISTENTE ──
      if (!user.is_active) {
        return Response.redirect(`${frontendErrorUrl}&reason=account_disabled`, 302)
      }

      console.log(`[OAuth] Existing user login: ${user.id} via ${info.provider}`)

      // Atualizar last_login + metadata + foto (sempre atualiza com foto mais recente do provider)
      const shouldVerifyEmail = !user.email_verified && info.emailVerified
      await pgQuery(env, `
        UPDATE users
        SET last_login_at = $1,
            updated_at = $1,
            profile_photo_url = COALESCE($2, profile_photo_url),
            email_verified = CASE WHEN $3::boolean THEN true ELSE email_verified END,
            metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
        WHERE id = $5
      `, [
        now,
        info.picture || null,
        shouldVerifyEmail,
        JSON.stringify({
          oauth_provider: info.provider,
          oauth_provider_id: info.providerId,
          last_oauth_login: now,
        }),
        user.id,
      ])

      // Atualizar foto no objeto local se provider trouxe nova
      if (info.picture) {
        user.profile_photo_url = info.picture
      }
    }

    // Gerar tokens JWT
    const jwtRole: 'user' | 'admin' | 'super_admin' =
      user.role === 'admin' || user.role === 'super_admin' ? user.role : 'user'

    const accessToken = await signAccessToken(
      { sub: user.id, email: user.email, type: user.user_type, role: jwtRole },
      env.JWT_SECRET
    )
    const refreshToken = await signRefreshToken(user.id, env.JWT_REFRESH_SECRET)

    // Criar sessão KV
    const sessionId = generateId()
    await createSession(env.KV_SESSIONS, sessionId, {
      userId: user.id,
      userType: user.user_type,
      email: user.email,
      ip: c.req.raw.headers.get('cf-connecting-ip') || '0.0.0.0',
      userAgent: c.req.header('user-agent') || '',
      createdAt: now,
    })

    // Verificar se user existente precisa completar perfil (CREF placeholder)
    let needsCompletion = isNewUser
    if (!isNewUser && user.user_type === 'personal') {
      const { rows: pRows } = await pgQuery<{ cref: string }>(env,
        'SELECT cref FROM personals WHERE id = $1 LIMIT 1',
        [user.id]
      )
      if (pRows.length > 0 && pRows[0].cref.startsWith('OAUTH-')) {
        needsCompletion = true
      }
    }

    // Redirecionar para frontend com tokens
    const frontendUrl = new URL('https://vfit.app.br/auth/callback')
    frontendUrl.searchParams.set('access_token', accessToken)
    frontendUrl.searchParams.set('refresh_token', refreshToken)
    frontendUrl.searchParams.set('session_id', sessionId)
    frontendUrl.searchParams.set('is_new', isNewUser ? '1' : '0')
    frontendUrl.searchParams.set('needs_completion', needsCompletion ? '1' : '0')
    frontendUrl.searchParams.set('user_type', user.user_type)

    console.log(`[OAuth] Success — redirecting ${user.email} (new=${isNewUser})`)

    return Response.redirect(frontendUrl.toString(), 302)
  } catch (err) {
    console.error(`[OAuth] handleOAuthLogin FATAL:`, err)
    // Em vez de 500 JSON, redireciona para login com erro amigável
    return Response.redirect(`${frontendErrorUrl}&reason=server_error`, 302)
  }
}

// ============================================
// HELPERS
// ============================================

function generateOAuthState(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export { oauth as oauthRoutes }
