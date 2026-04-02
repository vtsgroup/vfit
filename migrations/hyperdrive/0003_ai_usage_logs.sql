-- ============================================
-- Migration 0003: ai_usage_logs table
-- Tabela para tracking de uso de IA (billing/analytics)
-- Referenced by workers/api/ai.ts
-- ============================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_type       VARCHAR(50) NOT NULL,       -- 'generate_workout', 'compare_photos', 'chat', 'transcribe'
    model_used      VARCHAR(100) NOT NULL,      -- e.g. 'meta/llama-2-70b-chat'
    tokens_used     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_month ON ai_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_task_type ON ai_usage_logs(task_type);
