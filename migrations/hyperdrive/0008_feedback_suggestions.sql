-- ============================================
-- Migration 0008: feedback_suggestions
-- Canal direto de sugestões/melhorias dos usuários para o desenvolvedor
-- ============================================

CREATE TABLE IF NOT EXISTS feedback_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN ('feature', 'improvement', 'bug', 'ui', 'other')),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'planned', 'in_progress', 'done', 'declined')),
  admin_notes     TEXT,
  priority        TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_suggestions(created_at DESC);
