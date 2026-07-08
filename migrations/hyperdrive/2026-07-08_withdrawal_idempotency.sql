-- ============================================
-- 2026-07-08_withdrawal_idempotency.sql
-- Idempotência de saque (anti double-spend) — plano biometria v2 / B0
-- ============================================
--
-- Furo: POST /payments/transfers/pix e /affiliates/withdraw não tinham proteção
-- contra clique-duplo/retry. Duas requisições idênticas criavam 2 transferências
-- Asaas (dinheiro real duplicado). Fix: chave de idempotência com UNIQUE parcial;
-- o handler faz "claim-first" (INSERT ON CONFLICT DO NOTHING) ANTES de chamar o
-- Asaas — só o 1º vencedor cria a transferência; o retry devolve a existente.

-- pix_transfers: chave de idempotência por operador
ALTER TABLE pix_transfers ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pix_transfers_idem
  ON pix_transfers (personal_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- payments: idempotência para o saque de afiliado (registrado na tabela payments).
-- Chave por pagador, parcial (só afeta linhas que carregam a chave).
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idem
  ON payments (payer_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
