-- =============================================
-- 0016 — Assessment Share Token
-- Permite compartilhar avaliação via link público
-- =============================================

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_assessments_share_token ON assessments(share_token) WHERE share_token IS NOT NULL;
