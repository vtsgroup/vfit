-- ============================================
-- Migration: 0007_user_passkeys.sql
-- WebAuthn / Passkey credentials storage
-- Date: 2026-02-16
-- ============================================

CREATE TABLE IF NOT EXISTS user_passkeys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id   TEXT NOT NULL UNIQUE,
  public_key      TEXT NOT NULL,
  counter         BIGINT DEFAULT 0,
  device_type     TEXT DEFAULT 'singleDevice',
  backed_up       BOOLEAN DEFAULT false,
  transports      TEXT,        -- JSON array string e.g. '["internal","hybrid"]'
  device_name     TEXT,        -- User-friendly label e.g. "iPhone 16 Pro"
  aaguid          TEXT,        -- Authenticator Attestation GUID
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_used_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON user_passkeys(credential_id);
