-- =============================================
-- MIGRATION 0020 - Students without initial personal + CPF uniqueness by normalized digits
-- Date: 2026-02-26
-- =============================================

BEGIN;

-- 1) Permitir aluno sem vínculo inicial com personal.
ALTER TABLE students
  ALTER COLUMN personal_id DROP NOT NULL;

-- 2) Enforce de unicidade de CPF por forma normalizada (somente dígitos).
-- Evita duplicidade por máscara diferente (ex.: 123.456... vs 123456...).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf_digits_unique
  ON users ((regexp_replace(cpf, '\D', '', 'g')))
  WHERE cpf IS NOT NULL;

COMMIT;
