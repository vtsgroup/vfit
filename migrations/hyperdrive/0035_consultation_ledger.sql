-- ============================================
-- Migration 0035: Consultation ledger (append-only)
-- ============================================

CREATE TABLE IF NOT EXISTS consultation_ledger_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES consultation_orders(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (
    event_type IN ('order_paid', 'fee_charged', 'creator_settled', 'refunded', 'security_violation')
  ),
  account_type VARCHAR(40) NOT NULL DEFAULT 'platform_clearing',
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_ledger_order
  ON consultation_ledger_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_ledger_creator
  ON consultation_ledger_events(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_ledger_event_type
  ON consultation_ledger_events(event_type, created_at DESC);
