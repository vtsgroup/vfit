/**
 * workers/api/auth.ts
 *
 * auth.ts — Registro, login e gestão de sessão
 * Features: DB: Neon
 */

// ============================================
// auth.ts — Registro, login e gestão de sessão
// ============================================
//
// O que faz:
//   Todos os endpoints de autenticação: registro de personal e student,
//   login email/senha, refresh de token, logout, recuperação e reset de
//   senha, verificação de email e gestão de sessões ativas (listar/revogar).
//
// Exports principais:
//   authRoutes — Hono app montado em /api/v1/auth
//
// Auth: Turnstile em register/login. Demais rotas exigem Bearer token.
// DB: users, personals, students (criação no registro)
// KV: KV_SESSIONS (tokens, blacklist), KV_RATE_LIMIT
// Side effects: email de boas-vindas e email de reset via Resend
// ============================================

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import {
  registerPersonalSchema,
  registerStudentSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  twoFactorSetupSchema,
  twoFactorVerifySchema,
  twoFactorDisableSchema,
} from '@workers/schemas/auth'
import {
  signAccessToken,
  signRefreshToken,
  verifyJWT,
  hashPassword,
  verifyPassword,
  createSession,
  getSession,
  listUserSessions,
  revokeSession,
  blacklistToken,
  generateReferralCode,
  generateTOTPSecret,
  buildTOTPAuthUrl,
  verifyTOTPCode,
} from '@lib/auth-helpers'
import { generateId, pgQuery } from '@lib/db'
import { requireTurnstile, softRequireTurnstile } from '@lib/turnstile'
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomePersonalEmail,
} from '@lib/email'
import { success, created, error, noContent } from '@lib/response'
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '@lib/errors'
import { authMiddleware } from '@workers/middleware/auth'
import { notifyEvent, notifyNewStudent } from '@lib/onesignal'
import { sendEmailWithResend } from '@lib/email-resend'

const auth = new Hono<AppContext>()

// ============================================
// HELPERS
// ============================================

/** Gera token aleatório para email verification / password reset */
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Gera código numérico de 6 dígitos para recuperação por email */
function generateResetCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/** Hash simples de string para blacklist key */
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Obtém IP real do request */
function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  )
}

function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = new Set([
    'https://vfit.app.br',
    'https://vfit.pages.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
  return allowedOrigins.has(origin)
}

function assertCsrfForMutation(c: { req: { method: string; header: (name: string) => string | undefined } }): void {
  const method = c.req.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return
  }

  const origin = c.req.header('origin')
  const referer = c.req.header('referer')

  if (origin && isAllowedOrigin(origin.toLowerCase())) {
    return
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin.toLowerCase()
      if (isAllowedOrigin(refererOrigin)) {
        return
      }
    } catch {
      // cair no erro de CSRF abaixo
    }
  }

  throw new ForbiddenError('Falha na validação CSRF (origin/referer inválido)')
}

function getUserMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

// ============================================
// REGISTRATION WHITELIST — empty = open to all
// Aberto ao público desde 13/03/2026
// ============================================
const REGISTRATION_WHITELIST: Set<string> = new Set([
  // Aberto para todos — whitelist vazia
])

function isRegistrationAllowed(email: string): boolean {
  // Empty whitelist = open to all
  if (REGISTRATION_WHITELIST.size === 0) return true
  return REGISTRATION_WHITELIST.has(email.toLowerCase().trim())
}

// ============================================
// BAN CHECK — checks banned_identifiers table
// ============================================
async function checkBanned(
  env: Bindings,
  identifiers: { type: string; value: string }[]
): Promise<{ banned: boolean; reason?: string }> {
  if (identifiers.length === 0) return { banned: false }

  const conditions = identifiers.map(
    (_, i) => `(identifier_type = $${i * 2 + 1} AND identifier_value = $${i * 2 + 2})`
  )
  const params = identifiers.flatMap((id) => [id.type, id.value])

  const { rows } = await pgQuery<{ reason: string | null }>(
    env,
    `SELECT reason FROM banned_identifiers WHERE ${conditions.join(' OR ')} LIMIT 1`,
    params
  )

  if (rows.length > 0) {
    return { banned: true, reason: rows[0].reason || 'Acesso permanentemente bloqueado' }
  }
  return { banned: false }
}

// ============================================
// POST /auth/register/personal
// ============================================
auth.post('/register/personal', async (c) => {
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = registerPersonalSchema.parse(body)

  // Registration whitelist — block everyone except allowed emails
  if (!isRegistrationAllowed(parsed.email)) {
    throw new ForbiddenError('Cadastro temporariamente indisponível. Tente novamente mais tarde.')
  }

  // Ban check — email, CPF, CREF
  const banResult = await checkBanned(c.env, [
    { type: 'email', value: parsed.email.toLowerCase().trim() },
    { type: 'cpf', value: parsed.cpf },
    ...(parsed.phone ? [{ type: 'phone' as const, value: parsed.phone.replace(/\D/g, '') }] : []),
  ])
  if (banResult.banned) {
    throw new ForbiddenError('Cadastro bloqueado permanentemente. Contacte o suporte.')
  }

  // Turnstile anti-bot (soft: não bloqueia se token ausente em mobile)
  const turnstileValid = await softRequireTurnstile(
    parsed.turnstile_token,
    c.env.TURNSTILE_SECRET_KEY,
    getClientIp(c.req.raw)
  )
  if (!turnstileValid) {
    console.warn(`[Register] Turnstile soft-fail for ${parsed.email} (token: ${parsed.turnstile_token ? 'present' : 'empty'})`)
  }

  // Check email/cpf duplicado via Hyperdrive (PostgreSQL)
  const existingUser = await pgFindUserByEmail(c.env, parsed.email)
  if (existingUser) {
    throw new ConflictError('Email já cadastrado')
  }

  const existingCpf = await pgFindUserByCpf(c.env, parsed.cpf)
  if (existingCpf) {
    throw new ConflictError('CPF já cadastrado')
  }

  // Gerar IDs e hashes
  const userId = generateId()
  const passwordHash = await hashPassword(parsed.password)
  const referralCode = generateReferralCode()
  const verificationToken = generateToken()
  const now = new Date().toISOString()

  // Calcular trial end (14 dias)
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  // 1) Insert user
  try {
    await pgExecute(c.env, `
      INSERT INTO users (id, email, password_hash, phone, full_name, cpf, user_type, role, created_at, updated_at, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, 'personal', 'user', $7, $7, $8)
    `, [
      userId,
      parsed.email.toLowerCase().trim(),
      passwordHash,
      parsed.phone || null,
      parsed.full_name.trim(),
      parsed.cpf,
      now,
      JSON.stringify({ verification_token: verificationToken }),
    ])
  } catch (err) {
    console.error('[Register] Failed to INSERT user:', err)
    throw new BadRequestError('Falha ao criar conta. Verifique seus dados e tente novamente.')
  }

  // 2) Insert personal profile
  try {
    // Specialties: convert JS array to PostgreSQL text array literal
    // Escape any double-quotes/backslashes inside values to prevent array literal injection
    const specialtiesLiteral = `{${(parsed.specialties || []).map((s: string) => {
      const safe = s.replace(/[\\"\x00-\x1f]/g, '') // strip quotes, backslashes, control chars
      return `"${safe}"`
    }).join(',')}}`
    await pgExecute(c.env, `
      INSERT INTO personals (id, cref, cref_state, specialties, referral_code, subscription_plan, subscription_status, trial_ends_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4::TEXT[], $5, 'trial', 'trial', $6, $7, $7)
    `, [
      userId,
      parsed.cref,
      parsed.cref_state.toUpperCase(),
      specialtiesLiteral,
      referralCode,
      trialEnd,
      now,
    ])
  } catch (err) {
    console.error('[Register] Failed to INSERT personals:', err)
    // Cleanup orphaned user
    await pgExecute(c.env, 'DELETE FROM users WHERE id = $1', [userId]).catch(() => {})
    throw new BadRequestError('Falha ao criar perfil profissional. Verifique CREF e tente novamente.')
  }

  // 3) Se veio com referral_code, registrar referral (best-effort, não falha o registro)
  if (parsed.referral_code) {
    try {
      const referrer = await pgFindPersonalByReferral(c.env, parsed.referral_code)
      if (referrer) {
        const { rows: affRows } = await pgQuery<{ id: string; commission_tier: string }>(
          c.env,
          'SELECT id, commission_tier FROM affiliates WHERE personal_id = $1 LIMIT 1',
          [referrer.id]
        )
        if (affRows.length > 0) {
          const affiliate = affRows[0]
          const commissionPct = parseFloat(affiliate.commission_tier) || 25
          const cpfHash = await hashToken(parsed.cpf)
          await pgExecute(c.env, `
            INSERT INTO referrals (id, affiliate_id, referred_personal_id, referred_cpf_hash, commission_percentage, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', $6)
            ON CONFLICT (referred_personal_id) DO NOTHING
          `, [generateId(), affiliate.id, userId, cpfHash, commissionPct, now])
          // Incrementar total_referrals do afiliado
          await pgExecute(c.env, `
            UPDATE affiliates SET total_referrals = total_referrals + 1, updated_at = $1 WHERE id = $2
          `, [now, affiliate.id]).catch(() => {})
          console.log(`[Register] Referral registered: affiliate=${affiliate.id}, new_user=${userId}`)
        }
      } else {
        console.log(`[Register] Referral code not found: ${parsed.referral_code}`)
      }
    } catch (err) {
      console.error('[Register] Referral registration failed (non-fatal):', err)
    }
  }

  // 4) Gerar tokens
  const accessToken = await signAccessToken(
    { sub: userId, email: parsed.email.toLowerCase(), type: 'personal' },
    c.env.JWT_SECRET
  )
  const refreshToken = await signRefreshToken(userId, c.env.JWT_REFRESH_SECRET)

  // 5) Criar sessão KV
  const sessionId = generateId()
  await createSession(c.env.KV_SESSIONS, sessionId, {
    userId,
    userType: 'personal',
    email: parsed.email.toLowerCase(),
    ip: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || '',
    createdAt: now,
  })

  // 6) Emails (best-effort, não falha o registro)
  try {
    await sendVerificationEmail(
      c.env.EMAIL_QUEUE,
      parsed.email.toLowerCase(),
      parsed.full_name,
      verificationToken,
      'https://vfit.app.br',
      requestId
    )
  } catch (err) {
    console.error('[Auth] Failed to queue verification email:', err)
  }

  try {
    await sendWelcomePersonalEmail(
      c.env.EMAIL_QUEUE,
      parsed.email.toLowerCase(),
      parsed.full_name,
      requestId
    )
  } catch (err) {
    console.error('[Auth] Failed to queue welcome email:', err)
  }

  // 7) Notificação de boas-vindas (in-app + push)
  await notifyEvent(c.env, userId, 'welcome.personal', {
    firstName: parsed.full_name.split(' ')[0],
  }).catch(() => {})

  console.log(`[Register] Personal created: ${userId} (${parsed.email})`)

  return created({
    user: {
      id: userId,
      email: parsed.email.toLowerCase(),
      full_name: parsed.full_name,
      user_type: 'personal' as const,
      is_active: true,
      email_verified: false,
    },
    personal: {
      cref: parsed.cref,
      cref_state: parsed.cref_state.toUpperCase(),
      referral_code: referralCode,
      subscription_plan: 'trial',
      subscription_status: 'trial',
      trial_ends_at: trialEnd,
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    },
    session_id: sessionId,
  })
})

// ============================================
// POST /auth/register/student
// ============================================
auth.post('/register/student', async (c) => {
  const body = await c.req.json()
  const parsed = registerStudentSchema.parse(body)
  const invitationToken = parsed.invitation_token?.trim() || null

  // Registration whitelist — skip for invited students (they have a valid token from their personal)
  if (!invitationToken && !isRegistrationAllowed(parsed.email)) {
    throw new ForbiddenError('Cadastro temporariamente indisponível. Tente novamente mais tarde.')
  }

  // Ban check — email, CPF
  const banIdentifiers: { type: string; value: string }[] = [
    { type: 'email', value: parsed.email.toLowerCase().trim() },
  ]
  if (parsed.cpf) {
    banIdentifiers.push({ type: 'cpf', value: parsed.cpf })
  }
  const banResult = await checkBanned(c.env, banIdentifiers)
  if (banResult.banned) {
    throw new ForbiddenError('Cadastro bloqueado permanentemente. Contacte o suporte.')
  }

  // Turnstile anti-bot
  await requireTurnstile(
    parsed.turnstile_token,
    c.env.TURNSTILE_SECRET_KEY,
    getClientIp(c.req.raw)
  )

  // invitation_token é opcional: quando vier, valida; quando não vier, cadastro autônomo.
  const invitation = invitationToken
    ? await pgFindStudentByInvitation(c.env, invitationToken)
    : null

  if (invitationToken && !invitation) {
    throw new BadRequestError('Token de convite inválido ou expirado')
  }

  const passwordHash = await hashPassword(parsed.password)
  const now = new Date().toISOString()
  let userId: string

  // CPF opcional — se fornecido, valida e verifica unicidade
  let canonicalCpf: string | null = null
  if (parsed.cpf) {
    const normalizedCpf = normalizeCpf(parsed.cpf)
    if (!normalizedCpf || normalizedCpf.length !== 11) {
      throw new BadRequestError('CPF inválido')
    }
    canonicalCpf = formatCpf(normalizedCpf)
  }

  // Check se email já existe
  const existingUser = await pgFindUserByEmail(c.env, parsed.email)

  // Fluxo com convite (student pre-criado)
  if (invitation) {
    if (existingUser) {
      // Se é um placeholder (criado no invite, is_active=false, sem password)
      // → atualizar com os dados reais do aluno
      if (!existingUser.is_active && !existingUser.password_hash) {
        userId = existingUser.id

        // Check CPF duplicado (excluindo o próprio placeholder)
        if (canonicalCpf) {
          const existingCpf = await pgFindUserByCpf(c.env, canonicalCpf)
          if (existingCpf && existingCpf.id !== userId) {
            throw new ConflictError('CPF já cadastrado')
          }
        }

        // Atualizar placeholder user com dados reais
        await pgExecute(c.env, `
          UPDATE users SET
            password_hash = $1, phone = $2, full_name = $3, cpf = $4,
            is_active = true, email_verified = false, updated_at = $5
          WHERE id = $6
        `, [
          passwordHash,
          parsed.phone || null,
          parsed.full_name.trim(),
          canonicalCpf,
          now,
          userId,
        ])

        // Atualizar student record (aceitar convite)
        await pgExecute(c.env, `
          UPDATE students
          SET accepted_at = $1, invitation_token = NULL, status = 'active', updated_at = $1
          WHERE invitation_token = $2
        `, [now, invitationToken])

      } else {
        throw new ConflictError('Email já cadastrado')
      }
    } else {
      // Email não existe — fluxo com convite: criar user + atualizar student pré-criado

      // Check CPF duplicado (só se fornecido)
      if (canonicalCpf) {
        const existingCpf = await pgFindUserByCpf(c.env, canonicalCpf)
        if (existingCpf) {
          throw new ConflictError('CPF já cadastrado')
        }
      }

      userId = generateId()

      // Insert user
      await pgExecute(c.env, `
        INSERT INTO users (id, email, password_hash, phone, full_name, cpf, user_type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'student', $7, $7)
      `, [
        userId,
        parsed.email.toLowerCase().trim(),
        passwordHash,
        parsed.phone || null,
        parsed.full_name.trim(),
        canonicalCpf,
        now,
      ])

      // Atualizar student record (pre-criado pelo invite)
      // Se o student record pertencia a um placeholder, mudar o id para o novo user
      const oldStudentId = invitation.id
      await pgExecute(c.env, `
        UPDATE students
        SET id = $1, accepted_at = $2, invitation_token = NULL, status = 'active', updated_at = $2
        WHERE invitation_token = $3
      `, [userId, now, invitationToken])

      // Limpar placeholder user órfão (se existir e for diferente do novo user)
      if (oldStudentId && oldStudentId !== userId) {
        await pgExecute(c.env, `
          DELETE FROM users WHERE id = $1 AND is_active = false AND password_hash IS NULL
        `, [oldStudentId]).catch(() => {})
      }
    }
  } else {
    // Fluxo sem convite: aluno autônomo (sem vínculo inicial com personal)
    if (existingUser) {
      throw new ConflictError('Email já cadastrado')
    }

    // Check CPF duplicado (só se fornecido)
    if (canonicalCpf) {
      const existingCpf = await pgFindUserByCpf(c.env, canonicalCpf)
      if (existingCpf) {
        throw new ConflictError('CPF já cadastrado')
      }
    }

    userId = generateId()

    await pgExecute(c.env, `
      INSERT INTO users (id, email, password_hash, phone, full_name, cpf, user_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'student', $7, $7)
    `, [
      userId,
      parsed.email.toLowerCase().trim(),
      passwordHash,
      parsed.phone || null,
      parsed.full_name.trim(),
      canonicalCpf,
      now,
    ])

    await pgExecute(c.env, `
      INSERT INTO students (id, personal_id, accepted_at, status, payment_status, created_at, updated_at)
      VALUES ($1, NULL, $2, 'active', 'pending', $2, $2)
    `, [userId, now])
  }

  // Increment personal's student count (somente quando houver vínculo)
  await pgExecute(c.env, `
    UPDATE personals
    SET total_students = total_students + 1,
        active_students = active_students + 1,
        updated_at = $1
    WHERE id = (SELECT personal_id FROM students WHERE id = $2 AND personal_id IS NOT NULL)
  `, [now, userId])

  // Notificar personal sobre novo aluno (push + in-app)
  const { rows: personalRows } = await pgQuery<{ personal_id: string }>(c.env,
    'SELECT personal_id FROM students WHERE id = $1 LIMIT 1', [userId]
  )
  if (personalRows.length > 0) {
    const personalId = personalRows[0].personal_id

    await notifyNewStudent(
      c.env, personalId, parsed.full_name
    ).catch(() => {})

    // Enviar email de confirmação ao personal (best-effort)
    try {
      if (c.env.RESEND_API_KEY) {
        const { rows: personalUser } = await pgQuery<{ email: string; full_name: string }>(c.env,
          'SELECT email, full_name FROM users WHERE id = $1 LIMIT 1', [personalId]
        )
        if (personalUser.length > 0) {
          await sendEmailWithResend(
            c.env.RESEND_API_KEY,
            {
              to: personalUser[0].email,
              subject: `✅ ${parsed.full_name} completou o cadastro!`,
              template: 'student-registered',
              data: {
                personal_name: personalUser[0].full_name.split(' ')[0],
                student_name: parsed.full_name,
                student_email: parsed.email.toLowerCase(),
                student_phone: parsed.phone || '',
                dashboard_url: 'https://vfit.app.br/dashboard/students',
              },
            },
            c.env.EMAIL_FROM || undefined
          )
          console.log(`[Auth] Student-registered email sent to personal ${personalUser[0].email}`)
        }
      }
    } catch (err) {
      console.error('[Auth] Failed to send student-registered email:', err)
    }
  }

  // Welcome notification para o aluno (in-app + push)
  await notifyEvent(c.env, userId, 'welcome.student', {
    firstName: parsed.full_name.split(' ')[0],
  }).catch(() => {})

  // Gerar tokens
  const accessToken = await signAccessToken(
    { sub: userId, email: parsed.email.toLowerCase(), type: 'student' },
    c.env.JWT_SECRET
  )
  const refreshToken = await signRefreshToken(userId, c.env.JWT_REFRESH_SECRET)

  // Criar sessão KV
  const sessionId = generateId()
  await createSession(c.env.KV_SESSIONS, sessionId, {
    userId,
    userType: 'student',
    email: parsed.email.toLowerCase(),
    ip: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || '',
    createdAt: now,
  })

  return created({
    user: {
      id: userId,
      email: parsed.email.toLowerCase(),
      full_name: parsed.full_name,
      user_type: 'student' as const,
      is_active: true,
      email_verified: false,
    },
    student: {
      id: userId,
      personal_id: personalRows.length > 0 ? personalRows[0].personal_id : null,
      status: 'active',
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    },
    session_id: sessionId,
  })
})

// ============================================
// POST /auth/login
// ============================================
auth.post('/login', async (c) => {
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = loginSchema.parse(body)

  // Turnstile anti-bot (soft — validates if token present, skips if not)
  // Login is already protected by rate-limiting; Turnstile adds extra security when available
  await softRequireTurnstile(
    parsed.turnstile_token,
    c.env.TURNSTILE_SECRET_KEY,
    getClientIp(c.req.raw)
  )

  // Resolve identifier: try CPF first (digits only), then email
  const raw = (parsed.identifier || parsed.email || '').trim()
  const digits = raw.replace(/\D/g, '')
  const isCpf = digits.length === 11 && !/@/.test(raw)

  let user: UserRow | null = null
  if (isCpf) {
    user = await pgFindUserByCpf(c.env, digits)
  }
  if (!user) {
    user = await pgFindUserByEmail(c.env, raw)
  }

  if (!user) {
    await pgInsertAuditLog(c.env, {
      actorUserId: null,
      actorRole: 'anonymous',
      action: 'auth.login_failed',
      metadata: { identifier: raw, reason: 'user_not_found' },
      ipAddress: getClientIp(c.req.raw),
      userAgent: c.req.header('user-agent') || null,
      requestId,
    })
    throw new UnauthorizedError('CPF/email ou senha inválidos')
  }

  // Ban check — blocked user cannot login
  const loginBan = await checkBanned(c.env, [
    { type: 'email', value: user.email.toLowerCase() },
    ...(user.cpf ? [{ type: 'cpf' as const, value: user.cpf }] : []),
  ])
  if (loginBan.banned) {
    await pgInsertAuditLog(c.env, {
      actorUserId: user.id,
      actorRole: user.role || 'user',
      action: 'auth.login_blocked_banned',
      metadata: { reason: loginBan.reason },
      ipAddress: getClientIp(c.req.raw),
      userAgent: c.req.header('user-agent') || null,
      requestId,
    })
    throw new ForbiddenError('Acesso permanentemente bloqueado. Contacte o suporte.')
  }

  // Conta desativada?
  if (!user.is_active) {
    await pgInsertAuditLog(c.env, {
      actorUserId: user.id,
      actorRole: user.role || 'user',
      action: 'auth.login_failed',
      metadata: { reason: 'account_inactive' },
      ipAddress: getClientIp(c.req.raw),
      userAgent: c.req.header('user-agent') || null,
      requestId,
    })
    throw new UnauthorizedError('Conta desativada. Contacte o suporte.')
  }

  // Verificar senha
  if (!user.password_hash) {
    throw new UnauthorizedError('Use login social (Google) para esta conta')
  }

  const validPassword = await verifyPassword(parsed.password, user.password_hash)
  if (!validPassword) {
    await pgInsertAuditLog(c.env, {
      actorUserId: user.id,
      actorRole: user.role || 'user',
      action: 'auth.login_failed',
      metadata: { reason: 'invalid_password' },
      ipAddress: getClientIp(c.req.raw),
      userAgent: c.req.header('user-agent') || null,
      requestId,
    })
    throw new UnauthorizedError('CPF/email ou senha inválidos')
  }

  // 2FA TOTP (quando habilitado)
  const metadata = getUserMetadata(user.metadata)
  const twoFactorEnabled = metadata.two_factor_enabled === true
  const twoFactorSecret = typeof metadata.two_factor_secret === 'string'
    ? metadata.two_factor_secret
    : null

  if (twoFactorEnabled && twoFactorSecret) {
    if (!parsed.two_factor_code) {
      throw new UnauthorizedError('2FA obrigatório: informe o código autenticador')
    }

    const isValidTotp = await verifyTOTPCode(parsed.two_factor_code, twoFactorSecret)
    if (!isValidTotp) {
      await pgInsertAuditLog(c.env, {
        actorUserId: user.id,
        actorRole: user.role || 'user',
        action: 'auth.login_failed',
        metadata: { reason: 'invalid_2fa_code' },
        ipAddress: getClientIp(c.req.raw),
        userAgent: c.req.header('user-agent') || null,
        requestId,
      })
      throw new UnauthorizedError('Código 2FA inválido')
    }
  }

  // Atualizar last_login_at
  await pgExecute(c.env, `
    UPDATE users SET last_login_at = $1, updated_at = $1 WHERE id = $2
  `, [new Date().toISOString(), user.id])

  // Gerar tokens
  const jwtType = user.user_type // personal ou student — type indica o papel funcional
  const jwtRole = user.role || 'user' // admin, super_admin, ou user
  const accessToken = await signAccessToken(
    { sub: user.id, email: user.email, type: jwtType, role: jwtRole },
    c.env.JWT_SECRET
  )
  const refreshToken = await signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET)

  // Criar sessão KV
  const sessionId = generateId()
  await createSession(c.env.KV_SESSIONS, sessionId, {
    userId: user.id,
    userType: user.user_type,
    email: user.email,
    ip: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || '',
    createdAt: new Date().toISOString(),
  })

  await pgInsertAuditLog(c.env, {
    actorUserId: user.id,
    actorRole: user.role || 'user',
    action: 'auth.login_success',
    metadata: {
      user_type: user.user_type,
      two_factor_enabled: twoFactorEnabled,
      session_id: sessionId,
    },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

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
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    },
    session_id: sessionId,
    two_factor_enabled: twoFactorEnabled,
  })
})

// ============================================
// POST /auth/refresh
// ============================================
auth.post('/refresh', async (c) => {
  const body = await c.req.json()
  const parsed = refreshSchema.parse(body)

  // Verificar refresh token
  let payload: { sub: string; type: string }
  try {
    payload = await verifyJWT<{ sub: string; type: string }>(
      parsed.refresh_token,
      c.env.JWT_REFRESH_SECRET
    )
  } catch {
    throw new UnauthorizedError('Refresh token inválido ou expirado')
  }

  // Verificar se token está na blacklist
  const tokenHash = await hashToken(parsed.refresh_token)
  const blacklisted = await c.env.KV_SESSIONS.get(`blacklist:${tokenHash}`)
  if (blacklisted) {
    throw new UnauthorizedError('Token revogado')
  }

  // Buscar user atualizado
  const user = await pgFindUserById(c.env, payload.sub)
  if (!user || !user.is_active) {
    // Sessão fantasma: token aponta para usuário deletado/desativado.
    // Revoga imediatamente este refresh para impedir recorrência do problema.
    await blacklistToken(c.env.KV_SESSIONS, tokenHash, 30 * 24 * 60 * 60)
    throw new UnauthorizedError('Usuário não encontrado ou desativado')
  }

  // Gerar novos tokens (rotate refresh)
  const accessToken = await signAccessToken(
    { sub: user.id, email: user.email, type: user.user_type, role: user.role || 'user' },
    c.env.JWT_SECRET
  )
  const newRefreshToken = await signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET)

  // Blacklist o refresh token antigo (30 days TTL)
  await blacklistToken(c.env.KV_SESSIONS, tokenHash, 30 * 24 * 60 * 60)

  return success({
    tokens: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    },
  })
})

// ============================================
// POST /auth/logout
// ============================================
auth.post('/logout', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  const requestId = c.get('requestId')
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const authHeader = c.req.header('authorization') || ''
  const accessToken = authHeader.replace('Bearer ', '')

  // Blacklist do access token
  if (accessToken) {
    const tokenHash = await hashToken(accessToken)
    await blacklistToken(c.env.KV_SESSIONS, tokenHash, 3600) // 1h TTL
  }

  // Se veio refresh_token no body, blacklist também
  try {
    const body = await c.req.json()
    if (body?.refresh_token) {
      const refreshHash = await hashToken(body.refresh_token)
      await blacklistToken(c.env.KV_SESSIONS, refreshHash, 30 * 24 * 60 * 60)
    }

    // Se veio session_id, revogar sessão
    if (body?.session_id) {
      await revokeSession(c.env.KV_SESSIONS, body.session_id)
    }
  } catch {
    // Body pode ser vazio, tudo bem
  }

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.logout',
    metadata: {},
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return noContent()
})

// ============================================
// GET /auth/sessions
// Lista sessões ativas do usuário autenticado
// ============================================
auth.get('/sessions', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const sessions = await listUserSessions(c.env.KV_SESSIONS, userId, 50)

  return success({
    sessions,
    total: sessions.length,
  })
})

// ============================================
// DELETE /auth/sessions/:sessionId
// Revoga sessão específica do próprio usuário
// ============================================
auth.delete('/sessions/:sessionId', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  const requestId = c.get('requestId')
  const userRole = c.get('userRole')
  const userId = c.get('userId')
  const { sessionId } = c.req.param()

  if (!sessionId) {
    throw new BadRequestError('sessionId é obrigatório')
  }

  const session = await getSession(c.env.KV_SESSIONS, sessionId)
  if (!session) {
    return noContent()
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('Você não pode revogar sessão de outro usuário')
  }

  await revokeSession(c.env.KV_SESSIONS, sessionId)

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.session_revoked',
    targetType: 'session',
    metadata: { session_id: sessionId },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return noContent()
})

// ============================================
// POST /auth/2fa/setup
// Inicia setup de TOTP e retorna secret + otpauth URL
// ============================================
auth.post('/2fa/setup', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  // valida payload vazio (consistência de contrato)
  const body = await c.req.json().catch(() => ({}))
  twoFactorSetupSchema.parse(body)

  const requestId = c.get('requestId')
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const user = await pgFindUserById(c.env, userId)

  if (!user) {
    throw new NotFoundError('Usuário')
  }

  const metadata = getUserMetadata(user.metadata)
  if (metadata.two_factor_enabled === true) {
    throw new ConflictError('2FA já está habilitado para esta conta')
  }

  const secret = generateTOTPSecret()
  const pendingExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const otpauthUrl = buildTOTPAuthUrl('VFIT', user.email, secret)

  await pgExecute(c.env, `
    UPDATE users
    SET metadata = metadata || $1::jsonb,
        updated_at = $2
    WHERE id = $3
  `, [
    JSON.stringify({
      two_factor_pending_secret: secret,
      two_factor_pending_expires_at: pendingExpiresAt,
    }),
    new Date().toISOString(),
    userId,
  ])

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.2fa_setup_started',
    metadata: {},
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({
    manual_entry_key: secret,
    otpauth_url: otpauthUrl,
    expires_in: 600,
  })
})

// ============================================
// POST /auth/2fa/verify
// Confirma TOTP do setup e habilita 2FA
// ============================================
auth.post('/2fa/verify', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  const requestId = c.get('requestId')
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const body = await c.req.json()
  const parsed = twoFactorVerifySchema.parse(body)

  const user = await pgFindUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  const metadata = getUserMetadata(user.metadata)
  const pendingSecret = typeof metadata.two_factor_pending_secret === 'string'
    ? metadata.two_factor_pending_secret
    : null
  const pendingExpiresAt = typeof metadata.two_factor_pending_expires_at === 'string'
    ? metadata.two_factor_pending_expires_at
    : null

  if (!pendingSecret || !pendingExpiresAt) {
    throw new BadRequestError('Setup 2FA não encontrado. Inicie novamente.')
  }

  if (new Date(pendingExpiresAt) < new Date()) {
    throw new BadRequestError('Setup 2FA expirado. Gere um novo código.')
  }

  const valid = await verifyTOTPCode(parsed.code, pendingSecret)
  if (!valid) {
    throw new UnauthorizedError('Código 2FA inválido')
  }

  await pgExecute(c.env, `
    UPDATE users
    SET metadata = (metadata || $1::jsonb)
      - 'two_factor_pending_secret'
      - 'two_factor_pending_expires_at',
      updated_at = $2
    WHERE id = $3
  `, [
    JSON.stringify({
      two_factor_enabled: true,
      two_factor_secret: pendingSecret,
      two_factor_enabled_at: new Date().toISOString(),
    }),
    new Date().toISOString(),
    userId,
  ])

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.2fa_enabled',
    metadata: {},
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({ message: '2FA habilitado com sucesso.' })
})

// ============================================
// POST /auth/2fa/disable
// Desabilita 2FA mediante código TOTP válido
// ============================================
auth.post('/2fa/disable', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  const requestId = c.get('requestId')
  const userId = c.get('userId')
  const userRole = c.get('userRole')
  const body = await c.req.json()
  const parsed = twoFactorDisableSchema.parse(body)

  const user = await pgFindUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  const metadata = getUserMetadata(user.metadata)
  const secret = typeof metadata.two_factor_secret === 'string' ? metadata.two_factor_secret : null
  const isEnabled = metadata.two_factor_enabled === true

  if (!isEnabled || !secret) {
    return success({ message: '2FA já estava desabilitado.' })
  }

  const valid = await verifyTOTPCode(parsed.code, secret)
  if (!valid) {
    throw new UnauthorizedError('Código 2FA inválido')
  }

  await pgExecute(c.env, `
    UPDATE users
    SET metadata = metadata
      - 'two_factor_enabled'
      - 'two_factor_secret'
      - 'two_factor_enabled_at'
      - 'two_factor_pending_secret'
      - 'two_factor_pending_expires_at',
      updated_at = $1
    WHERE id = $2
  `, [new Date().toISOString(), userId])

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.2fa_disabled',
    metadata: {},
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({ message: '2FA desabilitado com sucesso.' })
})

// ============================================
// POST /auth/forgot-password
// ============================================
auth.post('/forgot-password', async (c) => {
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = forgotPasswordSchema.parse(body)

  // Turnstile anti-bot
  await requireTurnstile(
    parsed.turnstile_token,
    c.env.TURNSTILE_SECRET_KEY,
    getClientIp(c.req.raw)
  )

  // Buscar user (não revelar se existe ou não)
  const user = await pgFindUserByEmail(c.env, parsed.email)

  if (user) {
    const resetToken = generateToken()
    const resetCode = generateResetCode()
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora

    // Salvar token no metadata do user
    await pgExecute(c.env, `
      UPDATE users
      SET metadata = metadata || $1::jsonb, updated_at = $2
      WHERE id = $3
    `, [
      JSON.stringify({
        reset_token: resetToken,
        reset_token_expires: resetExpiry,
        reset_code: resetCode,
        reset_code_expires: resetExpiry,
      }),
      new Date().toISOString(),
      user.id,
    ])

    // Enviar email
    // Preferir envio direto via Resend quando disponível (Queues estão desabilitadas no wrangler.toml hoje).
    // Mantém fallback para queue (best-effort) caso Resend falhe.
    const baseUrl = 'https://vfit.app.br'
    let sent = false

    if (c.env.RESEND_API_KEY) {
      try {
        await sendEmailWithResend(
          c.env.RESEND_API_KEY,
          {
            to: user.email,
            subject: 'Redefinir senha - VFIT',
            template: 'reset-password',
            data: {
              name: user.full_name,
              reset_url: `${baseUrl}/reset-password?token=${resetToken}`,
              reset_code: resetCode,
              expiry: '1 hora',
            },
          },
          c.env.EMAIL_FROM || undefined
        )
        sent = true
        console.log(`[Auth] Reset password email sent via Resend to ${user.email} requestId=${requestId || 'n/a'}`)
      } catch (err) {
        console.error('[Auth] Failed to send reset email via Resend:', err)
      }
    }

    if (!sent) {
      // Queue-based best-effort fallback
      try {
        await sendResetPasswordEmail(
          c.env.EMAIL_QUEUE,
          user.email,
          user.full_name,
          resetToken,
          resetCode,
          baseUrl,
          requestId
        )
      } catch (err) {
        console.error('[Auth] Failed to queue reset email:', err)
      }
    }
  }

  // Sempre retorna sucesso (previne email enumeration)
  return success({
    message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
  })
})

// ============================================
// POST /auth/reset-password
// ============================================
auth.post('/reset-password', async (c) => {
  const body = await c.req.json()
  const parsed = resetPasswordSchema.parse(body)

  const hasTokenFlow = !!parsed.token

  // Buscar user pelo reset token OU email + código
  const user = hasTokenFlow
    ? await pgFindUserByResetToken(c.env, parsed.token!)
    : await pgFindUserByEmailAndResetCode(c.env, parsed.email!, parsed.code!)

  if (!user) {
    throw new BadRequestError('Token inválido ou expirado')
  }

  // Verificar expiração
  const metadata = user.metadata as Record<string, string> | null

  const expiryKey = hasTokenFlow ? 'reset_token_expires' : 'reset_code_expires'
  const expectedSecret = hasTokenFlow ? parsed.token : parsed.code
  const metadataSecret = hasTokenFlow ? metadata?.reset_token : metadata?.reset_code

  if (!expectedSecret || metadataSecret !== expectedSecret) {
    throw new BadRequestError('Token inválido ou expirado')
  }

  if (metadata?.[expiryKey]) {
    if (new Date(metadata[expiryKey]) < new Date()) {
      throw new BadRequestError('Token expirado. Solicite um novo reset de senha.')
    }
  }

  // Atualizar senha e limpar token
  const passwordHash = await hashPassword(parsed.password)
  await pgExecute(c.env, `
    UPDATE users
    SET password_hash = $1,
        metadata = metadata - 'reset_token' - 'reset_token_expires' - 'reset_code' - 'reset_code_expires',
        updated_at = $2
    WHERE id = $3
  `, [passwordHash, new Date().toISOString(), user.id])

  return success({ message: 'Senha redefinida com sucesso.' })
})

// ============================================
// POST /auth/verify-email
// ============================================
auth.post('/verify-email', async (c) => {
  const body = await c.req.json()
  const parsed = verifyEmailSchema.parse(body)

  // Buscar user pelo verification token
  const user = await pgFindUserByVerificationToken(c.env, parsed.token)
  if (!user) {
    throw new BadRequestError('Token de verificação inválido')
  }

  if (user.email_verified) {
    return success({ message: 'Email já verificado.' })
  }

  // Marcar email como verificado
  await pgExecute(c.env, `
    UPDATE users
    SET email_verified = true,
        metadata = metadata - 'verification_token',
        updated_at = $1
    WHERE id = $2
  `, [new Date().toISOString(), user.id])

  return success({ message: 'Email verificado com sucesso!' })
})

// ============================================
// POST /auth/change-password (autenticado)
// ============================================
auth.post('/change-password', authMiddleware, async (c) => {
  assertCsrfForMutation(c)

  const requestId = c.get('requestId')
  const userRole = c.get('userRole')
  const body = await c.req.json()
  const parsed = changePasswordSchema.parse(body)
  const userId = c.get('userId')

  const user = await pgFindUserById(c.env, userId)
  if (!user || !user.password_hash) {
    throw new BadRequestError('Não é possível alterar senha para contas OAuth')
  }

  const validPassword = await verifyPassword(parsed.current_password, user.password_hash)
  if (!validPassword) {
    throw new UnauthorizedError('Senha atual incorreta')
  }

  const passwordHash = await hashPassword(parsed.new_password)
  await pgExecute(c.env, `
    UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3
  `, [passwordHash, new Date().toISOString(), userId])

  await pgInsertAuditLog(c.env, {
    actorUserId: userId,
    actorRole: userRole || 'user',
    action: 'auth.password_changed',
    metadata: {},
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header('user-agent') || null,
    requestId,
  })

  return success({ message: 'Senha alterada com sucesso.' })
})

// ============================================
// GET /auth/me (autenticado)
// Returns role for admin/super_admin, and personal profile if admin is also a personal
// ============================================
auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')

  const user = await pgFindUserById(c.env, userId)
  if (!user) {
    throw new NotFoundError('Usuário')
  }

  // Determine effective user_type for response
  const isAdminRole = user.role === 'admin' || user.role === 'super_admin'
  const effectiveType = isAdminRole ? 'admin' as const : user.user_type

  // Buscar perfil específico
  // For admins, try personal profile first (admins can be personals too)
  let profile = null
  if (isAdminRole) {
    // Admins may have a personal profile
    profile = await pgFindPersonalById(c.env, userId)
    if (!profile) {
      // Fallback: try student profile
      profile = await pgFindStudentById(c.env, userId)
    }
  } else if (userType === 'personal') {
    profile = await pgFindPersonalById(c.env, userId)
  } else {
    profile = await pgFindStudentById(c.env, userId)
  }

  return success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      cpf: user.cpf,
      phone: user.phone,
      user_type: effectiveType,
      role: user.role || 'user',
      profile_photo_url: user.profile_photo_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    profile,
  })
})

// ============================================
// POSTGRESQL QUERY HELPERS (Hyperdrive)
// ============================================
// Helpers internos para queries de auth.
// Usam pgQuery/pgExecute do lib/db.ts quando Neon
// estiver configurado. Por ora, usam Hyperdrive fetch.
// ============================================

import type { Bindings } from '@workers/types'

interface UserRow {
  id: string
  email: string
  password_hash: string | null
  phone: string | null
  full_name: string
  cpf: string
  user_type: 'personal' | 'student'
  role: 'user' | 'admin' | 'super_admin'
  profile_photo_url: string | null
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  metadata: Record<string, unknown> | null
}

interface PersonalRow {
  id: string
  cref: string
  cref_state: string
  cref_verified: boolean
  specialties: string[]
  bio: string | null
  public_url_slug: string | null
  subscription_plan: string
  subscription_status: string
  trial_ends_at: string | null
  referral_code: string
  total_students: number
  active_students: number
  total_revenue: number
  is_public_profile: boolean
  created_at: string
}

interface StudentRow {
  id: string
  personal_id: string | null
  date_of_birth: string | null
  gender: string | null
  goals: unknown
  fitness_level: string | null
  status: string
  payment_status: string
  total_workouts_completed: number
  current_streak: number
  longest_streak: number
  created_at: string
}

interface InvitationRow {
  id: string | null
  personal_id: string | null
  invitation_token: string
}

async function pgFindUserByEmail(env: Bindings, email: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(env, 'SELECT * FROM users WHERE email = $1 LIMIT 1', [
    email.toLowerCase().trim(),
  ])
  return rows[0] ?? null
}

async function pgFindUserByCpf(env: Bindings, cpf: string): Promise<UserRow | null> {
  const normalizedCpf = normalizeCpf(cpf)
  const { rows } = await pgQuery<UserRow>(
    env,
    `SELECT *
       FROM users
      WHERE cpf IS NOT NULL
        AND regexp_replace(cpf, '\\D', '', 'g') = $1
      LIMIT 1`,
    [normalizedCpf]
  )
  return rows[0] ?? null
}

function normalizeCpf(value: string): string {
  return String(value || '').replace(/\D/g, '')
}

function formatCpf(value: string): string {
  const digits = normalizeCpf(value)
  if (digits.length !== 11) return value
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

async function pgFindUserById(env: Bindings, id: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(env, 'SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

async function pgFindUserByResetToken(env: Bindings, token: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(
    env,
    `SELECT * FROM users WHERE metadata->>'reset_token' = $1 LIMIT 1`,
    [token]
  )
  return rows[0] ?? null
}

async function pgFindUserByEmailAndResetCode(env: Bindings, email: string, code: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(
    env,
    `SELECT * FROM users WHERE email = $1 AND metadata->>'reset_code' = $2 LIMIT 1`,
    [email.toLowerCase().trim(), code]
  )
  return rows[0] ?? null
}

async function pgFindUserByVerificationToken(env: Bindings, token: string): Promise<UserRow | null> {
  const { rows } = await pgQuery<UserRow>(
    env,
    `SELECT * FROM users WHERE metadata->>'verification_token' = $1 LIMIT 1`,
    [token]
  )
  return rows[0] ?? null
}

async function pgFindPersonalById(env: Bindings, id: string): Promise<PersonalRow | null> {
  const { rows } = await pgQuery<PersonalRow>(
    env,
    'SELECT * FROM personals WHERE id = $1 LIMIT 1',
    [id]
  )
  return rows[0] ?? null
}

async function pgFindPersonalByReferral(env: Bindings, code: string): Promise<{ id: string } | null> {
  const { rows } = await pgQuery<{ id: string }>(
    env,
    'SELECT id FROM personals WHERE referral_code = $1 LIMIT 1',
    [code]
  )
  return rows[0] ?? null
}

async function pgFindStudentById(env: Bindings, id: string): Promise<StudentRow | null> {
  const { rows } = await pgQuery<StudentRow>(
    env,
    'SELECT * FROM students WHERE id = $1 LIMIT 1',
    [id]
  )
  return rows[0] ?? null
}

async function pgFindStudentByInvitation(env: Bindings, token: string): Promise<InvitationRow | null> {
  const { rows } = await pgQuery<InvitationRow>(
    env,
    'SELECT id, personal_id, invitation_token FROM students WHERE invitation_token = $1 LIMIT 1',
    [token]
  )
  return rows[0] ?? null
}

/** Executa SQL mutação via Hyperdrive */
async function pgExecute(
  env: Bindings,
  query: string,
  params: unknown[] = []
): Promise<void> {
  await pgQuery(env, query, params)
}

interface AuditLogInput {
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

async function pgInsertAuditLog(env: Bindings, input: AuditLogInput): Promise<void> {
  try {
    await pgExecute(
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
    // Audit é best-effort: não derruba o endpoint principal.
    console.error('[Auth] Failed to write audit_log:', err)
  }
}

export { auth as authRoutes }
