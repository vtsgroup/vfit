-- ============================================
-- 0011_admin_account_notes.sql
-- Notas privadas administrativas por conta (admin/super_admin)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_account_notes (
  id                TEXT PRIMARY KEY,
  target_user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  note              TEXT NOT NULL,
  risk_level        TEXT NOT NULL DEFAULT 'none' CHECK (risk_level IN ('none', 'attention', 'high')),
  is_financial_risk BOOLEAN NOT NULL DEFAULT FALSE,
  created_by        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_account_notes_risk_level
  ON admin_account_notes (risk_level);

CREATE INDEX IF NOT EXISTS idx_admin_account_notes_updated_at
  ON admin_account_notes (updated_at DESC);
