-- ============================================
-- Migration 0009: Feedback Replies (Chat-like)
-- Respostas em formato chat para sugestões
-- ============================================

-- Tabela de respostas/mensagens do feedback
CREATE TABLE IF NOT EXISTS feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user' CHECK (sender_type IN ('user', 'admin', 'ai')),
  sender_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback_id ON feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_created_at ON feedback_replies(created_at);

-- Adicionar coluna unread_count na feedback_suggestions para o usuário
ALTER TABLE feedback_suggestions ADD COLUMN IF NOT EXISTS has_new_reply BOOLEAN DEFAULT false;
