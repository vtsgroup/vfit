-- ============================================
-- Migration 0008: Colunas de rating em personals
-- Personal IA — 16/02/2026
-- ============================================

-- Colunas para cache de rating (calculado via trigger/on-write no reviews.ts)
ALTER TABLE personals ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,1) DEFAULT 0;
ALTER TABLE personals ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Índice para listagem pública (marketplace, perfil público)
CREATE INDEX IF NOT EXISTS idx_personals_rating ON personals(average_rating DESC) WHERE is_public_profile = true;
