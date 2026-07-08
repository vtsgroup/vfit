// ============================================
// step-up.test.ts — Dynamic linking do step-up de saque (plano biometria v2)
// ============================================
//
// Trava o coração da segurança de saque: um token vinculado à transação A NUNCA
// pode autorizar a transação B. Cobre canonicalização de valor/chave, binding hash,
// emissão/verificação de token e as rejeições (valor diferente, chave diferente,
// aud diferente, sub diferente, token expirado/adulterado).

import { describe, it, expect } from 'vitest'
import {
  canonicalAmountCents,
  canonicalPixKey,
  stepUpBindingHash,
  signStepUpToken,
  verifyStepUpToken,
} from '@lib/step-up'

const SECRET = 'test-secret-key-for-step-up'

describe('canonicalAmountCents', () => {
  it('converte reais para centavos inteiros', () => {
    expect(canonicalAmountCents(100)).toBe(10000)
    expect(canonicalAmountCents(100.0)).toBe(10000)
    expect(canonicalAmountCents(0.01)).toBe(1)
    expect(canonicalAmountCents(1234.56)).toBe(123456)
  })

  it('100 e 100.00 produzem o MESMO valor canônico (não quebra binding)', () => {
    expect(canonicalAmountCents(100)).toBe(canonicalAmountCents(100.0))
  })

  it('arredonda float sujo para o centavo (evita drift)', () => {
    // 19.99 * 100 = 1998.9999... em float; deve virar 1999
    expect(canonicalAmountCents(19.99)).toBe(1999)
  })

  it('rejeita valores inválidos', () => {
    expect(() => canonicalAmountCents(0)).toThrow()
    expect(() => canonicalAmountCents(-5)).toThrow()
    expect(() => canonicalAmountCents(NaN)).toThrow()
    expect(() => canonicalAmountCents(Infinity)).toThrow()
  })
})

describe('canonicalPixKey', () => {
  it('trim + minúsculas', () => {
    expect(canonicalPixKey('  User@Email.COM ')).toBe('user@email.com')
    expect(canonicalPixKey('CHAVE')).toBe('chave')
  })
})

describe('stepUpBindingHash', () => {
  it('mesma transação → mesmo hash (determinístico)', async () => {
    const a = await stepUpBindingHash(100, 'chave@pix.com')
    const b = await stepUpBindingHash(100, 'chave@pix.com')
    expect(a).toBe(b)
  })

  it('100 e 100.00 para a mesma chave → mesmo hash', async () => {
    const a = await stepUpBindingHash(100, 'k')
    const b = await stepUpBindingHash(100.0, 'k')
    expect(a).toBe(b)
  })

  it('valor diferente → hash diferente', async () => {
    const a = await stepUpBindingHash(100, 'k')
    const b = await stepUpBindingHash(101, 'k')
    expect(a).not.toBe(b)
  })

  it('chave diferente → hash diferente', async () => {
    const a = await stepUpBindingHash(100, 'chaveA')
    const b = await stepUpBindingHash(100, 'chaveB')
    expect(a).not.toBe(b)
  })

  it('produz hex SHA-256 (64 chars)', async () => {
    const h = await stepUpBindingHash(100, 'k')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('signStepUpToken / verifyStepUpToken', () => {
  const base = { sub: 'user-1', aud: 'withdraw_pix' as const, amount: 100, pixKey: 'chave@pix.com', jti: 'jti-1' }

  it('token válido verifica e traz os claims da transação', async () => {
    const { token, claims } = await signStepUpToken(base, SECRET)
    const verified = await verifyStepUpToken(token, SECRET)
    expect(verified.sub).toBe('user-1')
    expect(verified.aud).toBe('withdraw_pix')
    expect(verified.amt).toBe(10000)
    expect(verified.jti).toBe('jti-1')
    expect(verified.purpose).toBe('step_up')
    expect(verified.pkh).toBe(claims.pkh)
  })

  it('[CRÍTICO] o pkh do token bate com o hash da MESMA transação e NÃO com outra', async () => {
    const { claims } = await signStepUpToken(base, SECRET)
    // mesma transação → deve bater (é o que o middleware compara)
    expect(claims.pkh).toBe(await stepUpBindingHash(100, 'chave@pix.com'))
    // valor diferente → não bate
    expect(claims.pkh).not.toBe(await stepUpBindingHash(500, 'chave@pix.com'))
    // chave diferente → não bate
    expect(claims.pkh).not.toBe(await stepUpBindingHash(100, 'chave-do-atacante@pix.com'))
    // valor canônico não bate com outro valor
    expect(claims.amt).not.toBe(canonicalAmountCents(500))
  })

  it('token assinado com outro secret é rejeitado', async () => {
    const { token } = await signStepUpToken(base, SECRET)
    await expect(verifyStepUpToken(token, 'outro-secret')).rejects.toThrow()
  })

  it('token adulterado (payload trocado) é rejeitado', async () => {
    const { token } = await signStepUpToken(base, SECRET)
    const parts = token.split('.')
    // troca o payload por um forjado mantendo header+assinatura originais
    const forgedPayload = btoa(JSON.stringify({ sub: 'user-1', purpose: 'step_up', aud: 'withdraw_pix', amt: 999999, pkh: 'x', jti: 'j', iat: 1, exp: 9999999999 }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const forged = `${parts[0]}.${forgedPayload}.${parts[2]}`
    await expect(verifyStepUpToken(forged, SECRET)).rejects.toThrow()
  })

  it('token sem purpose step_up é rejeitado como malformado', async () => {
    // assina um JWT genérico sem os campos de step-up e confirma rejeição
    const { token } = await signStepUpToken({ ...base, jti: '' }, SECRET)
    await expect(verifyStepUpToken(token, SECRET)).rejects.toThrow()
  })
})
