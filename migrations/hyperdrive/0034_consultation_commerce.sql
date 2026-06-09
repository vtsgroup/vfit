-- ============================================
-- Migration 0034: Consultation Commerce (student-first)
-- ============================================

CREATE TABLE IF NOT EXISTS consultation_offers (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_type VARCHAR(30) NOT NULL CHECK (creator_type IN ('personal', 'nutritionist')),
  title VARCHAR(140) NOT NULL,
  description TEXT,
  price_amount DECIMAL(10,2) NOT NULL CHECK (price_amount > 0),
  duration_minutes INT NOT NULL CHECK (duration_minutes BETWEEN 15 AND 240),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_orders (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES consultation_offers(id) ON DELETE RESTRICT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  asaas_payment_id VARCHAR(100),
  asaas_invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_consult_orders_asaas_payment_id
  ON consultation_orders(asaas_payment_id)
  WHERE asaas_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS consultation_sessions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES consultation_orders(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'started', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_offers_creator_status
  ON consultation_offers(creator_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_orders_student_status
  ON consultation_orders(student_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_orders_creator_status
  ON consultation_orders(creator_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_sessions_student_status
  ON consultation_sessions(student_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consult_sessions_creator_status
  ON consultation_sessions(creator_id, status, created_at DESC);
