-- ============================================
-- Migration: 0011_app_logs.sql
-- App logs (client issues + audit events)
-- Date: 2026-02-22
-- ============================================

CREATE TABLE IF NOT EXISTS app_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  user_type    TEXT NOT NULL DEFAULT 'anonymous',
  user_role    TEXT NOT NULL DEFAULT 'anonymous',
  level        TEXT NOT NULL,
  source       TEXT NOT NULL,
  message      TEXT NOT NULL,
  stack        TEXT,
  context      JSONB,
  path         TEXT,
  user_agent   TEXT,
  request_id   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
