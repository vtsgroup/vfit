-- ============================================
-- MIGRATION 0005 - Make CPF nullable for OAuth users
-- Personal IA Prod
-- Date: 2026-02-14
-- ============================================
-- OAuth users (Google/Facebook) don't have CPF on registration.
-- CPF remains UNIQUE but becomes nullable.
-- NULL values don't conflict in PostgreSQL UNIQUE constraints.

ALTER TABLE users ALTER COLUMN cpf DROP NOT NULL;
