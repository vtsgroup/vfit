// ============================================
// withdrawal-idempotency.test.ts — Anti double-spend (security-review 2026-07-08)
// ============================================
//
// O security-review do plano biometria v2 confirmou (confiança 9/10) um bug HIGH:
// requisições concorrentes com Idempotency-Key DISTINTAS no saque de afiliado liam
// o mesmo saldo, ambas passavam na checagem, ambas pagavam via Asaas — o débito só
// acontecia DEPOIS de pagar, sem guarda (`UPDATE ... WHERE id=$3` sem checar saldo).
//
// Este teste não substitui um teste de integração contra Postgres real (a garantia
// vem do Postgres serializar UPDATEs/leituras na mesma linha sob read-committed),
// mas trava por TEXTO que a query SQL usada no handler contém a guarda — regressão
// textual: se alguém remover "AND available_balance >= $1" no futuro, este teste
// falha imediatamente, sem precisar de um ambiente de banco para pegar o bug.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const affiliatesSrc = readFileSync(
  path.resolve(__dirname, '../../workers/api/affiliates.ts'),
  'utf8'
)
const paymentsSrc = readFileSync(
  path.resolve(__dirname, '../../workers/api/payments.ts'),
  'utf8'
)

describe('affiliates.ts /withdraw — débito guardado (anti double-spend)', () => {
  it('o UPDATE de débito do saldo tem a guarda "available_balance >= $1"', () => {
    // Extrai o bloco do UPDATE que debita available_balance (não o de crédito/rollback)
    const debitBlock = affiliatesSrc.match(
      /UPDATE affiliates\s+SET available_balance = available_balance - \$1[\s\S]{0,200}?RETURNING id/
    )
    expect(debitBlock, 'UPDATE de débito com RETURNING id não encontrado').toBeTruthy()
    expect(debitBlock![0]).toMatch(/WHERE id = \$3 AND available_balance >= \$1/)
  })

  it('existe rollback (crédito de volta) no caminho de falha do Asaas', () => {
    expect(affiliatesSrc).toMatch(/available_balance = available_balance \+ \$1/)
  })

  it('o débito acontece ANTES da chamada ao Asaas (createPixTransfer)', () => {
    const debitIdx = affiliatesSrc.indexOf('WHERE id = $3 AND available_balance >= $1')
    const asaasCallIdx = affiliatesSrc.indexOf('await createPixTransfer(c.env, {')
    expect(debitIdx).toBeGreaterThan(-1)
    expect(asaasCallIdx).toBeGreaterThan(-1)
    expect(debitIdx).toBeLessThan(asaasCallIdx)
  })
})

describe('payments.ts /transfers/pix — claim-first + saldo inclui claims (anti double-spend)', () => {
  // Escopo: o handler POST /transfers/pix (não o GET /payments/balance, que tem uma
  // query de saldo similar só para EXIBIÇÃO e não precisa contar 'claiming').
  const handlerStart = paymentsSrc.indexOf("payments.post('/transfers/pix'")
  const handlerBody = paymentsSrc.slice(handlerStart, handlerStart + 6000)

  it('handler do saque PIX encontrado', () => {
    expect(handlerStart).toBeGreaterThan(-1)
  })

  it('a claim (INSERT status claiming) acontece ANTES do cálculo de saldo interno', () => {
    const claimIdx = handlerBody.indexOf("VALUES ($1, $2, $3, $4, $5, 0, $5, 'claiming'")
    const balanceQueryIdx = handlerBody.indexOf('SUM(amount) FROM pix_transfers WHERE personal_id = $1')
    expect(claimIdx).toBeGreaterThan(-1)
    expect(balanceQueryIdx).toBeGreaterThan(-1)
    expect(claimIdx).toBeLessThan(balanceQueryIdx)
  })

  it('o cálculo de saldo do handler de saque conta status "claiming" no total sacado', () => {
    const balanceQuery = handlerBody.match(/SUM\(amount\) FROM pix_transfers WHERE personal_id = \$1 AND status IN \([^)]+\)/)
    expect(balanceQuery, 'query de total_withdrawn não encontrada no handler').toBeTruthy()
    expect(balanceQuery![0]).toContain("'claiming'")
  })

  it('a query de saldo do GET /payments/balance (display) NÃO precisa incluir claiming', () => {
    // Documenta a diferença intencional: exibição não reserva, só o handler de saque reserva.
    const displayQuery = paymentsSrc.slice(0, handlerStart).match(/SUM\(amount\) FROM pix_transfers WHERE personal_id = \$1 AND status IN \([^)]+\)/)
    expect(displayQuery, 'query de saldo do GET /payments/balance não encontrada').toBeTruthy()
  })

  it('saldo insuficiente libera a claim (releaseClaim) antes de rejeitar', () => {
    expect(handlerBody).toMatch(/if \(internalAvailable < 0\) \{\s*await releaseClaim\(\)/)
  })
})
