-- ============================================
-- 2026-07-09_pix_transfers_status_keytype_constraints.sql
-- Constraints que faltaram no claim-first do saque PIX (security-review 2026-07-08).
-- ============================================
--
-- Furo: o handler POST /payments/transfers/pix passou a reservar a linha com
-- status 'claiming' ANTES de chamar o Asaas (anti double-spend), e mapPixKeyType()
-- retorna 'EVP' para chave aleatória (→ inserido como 'evp'). Nenhuma migration
-- atualizou os CHECK constraints, então o INSERT do claim estourava:
--   - status='claiming'      → violava pix_transfers_status_check
--   - pix_key_type='evp'     → violava pix_transfers_pix_key_type_check
-- Resultado: todo saque com o fluxo novo (ou com chave aleatória) dava 500.

ALTER TABLE pix_transfers DROP CONSTRAINT IF EXISTS pix_transfers_status_check;
ALTER TABLE pix_transfers ADD CONSTRAINT pix_transfers_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'claiming'));

ALTER TABLE pix_transfers DROP CONSTRAINT IF EXISTS pix_transfers_pix_key_type_check;
ALTER TABLE pix_transfers ADD CONSTRAINT pix_transfers_pix_key_type_check
  CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random', 'evp'));
