// ============================================
// Tests: lib/auth-helpers.ts — JWT, Password, Session helpers
// ============================================

import { describe, it, expect } from 'vitest'
import {
  signAccessToken,
  verifyJWT,
  signRefreshToken,
  hashPassword,
  verifyPassword,
  generateReferralCode,
  generateTOTPSecret,
  buildTOTPAuthUrl,
  generateTOTPCode,
  verifyTOTPCode,
} from '@lib/auth-helpers'

const TEST_SECRET = 'test-secret-key-for-vitest-2026'

describe('JWT — signAccessToken + verifyJWT', () => {
  it('deve gerar e verificar um access token válido', async () => {
    const payload = {
      sub: 'user_123',
      email: 'user@test.com',
      type: 'personal' as const,
    }

    const token = await signAccessToken(payload, TEST_SECRET)
    expect(token).toBeDefined()
    expect(token.split('.')).toHaveLength(3) // header.payload.signature

    const decoded = await verifyJWT(token, TEST_SECRET)
    expect(decoded.sub).toBe('user_123')
    expect(decoded.type).toBe('personal')
    expect(decoded.iat).toBeDefined()
    expect(decoded.exp).toBeDefined()
    expect(decoded.exp! - decoded.iat!).toBe(3600) // 1 hour TTL
  })

  it('deve rejeitar token com secret errado', async () => {
    const token = await signAccessToken(
      { sub: 'user_1', email: 'user@test.com', type: 'personal' as const },
      TEST_SECRET
    )

    await expect(verifyJWT(token, 'wrong-secret')).rejects.toThrow('Assinatura inválida')
  })

  it('deve rejeitar token malformado', async () => {
    await expect(verifyJWT('not.a.valid-token-content', TEST_SECRET)).rejects.toThrow()
    await expect(verifyJWT('only-one-part', TEST_SECRET)).rejects.toThrow('Token malformado')
  })

  it('deve rejeitar token expirado', async () => {
    // Criar token com exp no passado manualmente
    const payload = {
      sub: 'user_1',
      type: 'personal' as const,
      role: 'personal' as const,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600, // expirou 1h atrás
    }

    // Precisamos assinar manualmente para criar um token expirado
    const header = { alg: 'HS256', typ: 'JWT' }
    const b64url = (data: string) => {
      const bytes = new TextEncoder().encode(data)
      let binary = ''
      for (const byte of bytes) binary += String.fromCharCode(byte)
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    const headerB64 = b64url(JSON.stringify(header))
    const payloadB64 = b64url(JSON.stringify(payload))
    const data = `${headerB64}.${payloadB64}`

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(TEST_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    const expiredToken = `${data}.${sigB64}`

    await expect(verifyJWT(expiredToken, TEST_SECRET)).rejects.toThrow('Token expirado')
  })
})

describe('JWT — signRefreshToken', () => {
  it('deve gerar refresh token com TTL de 30 dias', async () => {
    const token = await signRefreshToken('user_456', TEST_SECRET)
    expect(token).toBeDefined()
    expect(token.split('.')).toHaveLength(3)

    const decoded = await verifyJWT(token, TEST_SECRET)
    expect(decoded.sub).toBe('user_456')
    expect((decoded as Record<string, unknown>).type).toBe('refresh')
    expect(decoded.exp! - decoded.iat!).toBe(30 * 24 * 60 * 60) // 30 days
  })
})

describe('Password — hashPassword + verifyPassword', () => {
  it('deve fazer hash e verificar senha corretamente', async () => {
    const password = 'MinhaSenh@F0rte!'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password) // deve ser diferente do plain text
    expect(hash).toMatch(/^\$2[aby]?\$/) // formato bcrypt

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('deve rejeitar senha errada', async () => {
    const hash = await hashPassword('SenhaCorreta123!')
    const isValid = await verifyPassword('SenhaErrada456!', hash)
    expect(isValid).toBe(false)
  })

  it('hashes diferentes para mesma senha (salt random)', async () => {
    const password = 'MesmaSenha123!'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)
    expect(hash1).not.toBe(hash2) // salts diferentes
  })
})

describe('generateReferralCode()', () => {
  it('deve gerar código com 8 caracteres', () => {
    const code = generateReferralCode()
    expect(code).toHaveLength(8)
  })

  it('deve conter apenas caracteres válidos (sem I,O,0,1)', () => {
    const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode()
      for (const char of code) {
        expect(validChars).toContain(char)
      }
    }
  })

  it('deve gerar códigos únicos', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateReferralCode())
    }
    // 100 códigos gerados devem ser quase todos únicos (prob colisão ≈ 0)
    expect(codes.size).toBeGreaterThan(95)
  })

  it('não deve conter caracteres ambíguos', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode()
      expect(code).not.toMatch(/[IO01]/)
    }
  })
})

describe('TOTP — helpers de 2FA', () => {
  it('gera secret base32 válido', () => {
    const secret = generateTOTPSecret()
    expect(secret.length).toBeGreaterThanOrEqual(16)
    expect(secret).toMatch(/^[A-Z2-7]+$/)
  })

  it('gera URL otpauth válida', () => {
    const secret = generateTOTPSecret()
    const url = buildTOTPAuthUrl('VFIT', 'user@test.com', secret)
    expect(url).toContain('otpauth://totp/')
    expect(url).toContain('issuer=VFIT')
    expect(url).toContain(`secret=${secret}`)
  })

  it('aceita código atual dentro da janela de tolerância', async () => {
    const secret = generateTOTPSecret()
    const now = Math.floor(Date.now() / 1000)
    const code = await generateTOTPCode(secret, now)
    await expect(verifyTOTPCode(code, secret, { now, window: 0 })).resolves.toBe(true)
  })

  it('rejeita código com formato inválido', async () => {
    const secret = generateTOTPSecret()
    await expect(verifyTOTPCode('12ab', secret)).resolves.toBe(false)
  })
})
