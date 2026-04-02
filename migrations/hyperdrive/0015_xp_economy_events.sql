-- =============================================
-- S51: XP Economy — Contracts, Events, Transactions
-- =============================================

-- =============================================
-- 1. XP EVENT TYPES & CONFIGURATION
-- =============================================

CREATE TYPE xp_event_type AS ENUM (
  'workout_completed',
  'streak_3_days',
  'streak_7_days',
  'streak_30_days',
  'streak_100_days',
  'badge_earned',
  'goal_reached_weight',
  'goal_reached_body_fat',
  'assessment_completed',
  'referral_signup',
  'review_written',
  'workout_first',
  'workout_milestone_10',
  'workout_milestone_50',
  'workout_milestone_100',
  'custom_admin_reward',
  'store_purchase_refund',
  'xp_expiration',
  'xp_burn_conversion'
);

-- =============================================
-- 2. XP TRANSACTIONS TABLE (Ledger)
-- =============================================

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID REFERENCES personals(id) ON DELETE SET NULL,
  
  -- Event type and amount
  event_type xp_event_type NOT NULL,
  amount INT NOT NULL CHECK (amount != 0),  -- Positive (credit) or negative (debit)
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('credit', 'debit')),
  
  -- Reference to triggering object (workout, badge, etc)
  reference_type VARCHAR(50),  -- 'workout_log', 'badge', 'assessment', 'referral', 'admin_action'
  reference_id UUID,
  
  -- Anti-duplication token (unique per student + event)
  idempotency_key VARCHAR(255) UNIQUE,
  
  -- Metadata for analytics
  metadata JSONB DEFAULT '{}'::jsonb,  -- reason, bonus_streak, etc
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- For expiring XP (e.g., 90 days)
  
  -- Status
  status VARCHAR(20) DEFAULT 'settled' CHECK (status IN ('pending', 'settled', 'reversed', 'expired')),
  
  -- Audit
  created_by VARCHAR(50),  -- 'system', 'admin', 'api'
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT
);

CREATE INDEX idx_xp_trans_student ON xp_transactions(student_id);
CREATE INDEX idx_xp_trans_personal ON xp_transactions(personal_id);
CREATE INDEX idx_xp_trans_event_type ON xp_transactions(event_type);
CREATE INDEX idx_xp_trans_reference ON xp_transactions(reference_type, reference_id);
CREATE INDEX idx_xp_trans_created ON xp_transactions(created_at DESC);
CREATE INDEX idx_xp_trans_expires ON xp_transactions(expires_at);
CREATE INDEX idx_xp_trans_status ON xp_transactions(status);
CREATE INDEX idx_xp_trans_idempotency ON xp_transactions(idempotency_key);

-- =============================================
-- 3. XP BALANCE VIEW (Materialized summary)
-- =============================================

CREATE TABLE xp_balances (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  
  -- Running totals
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  current_balance INT DEFAULT 0,
  
  -- Metadata
  last_transaction_at TIMESTAMPTZ,
  transaction_count INT DEFAULT 0,
  
  -- Cached for fast queries
  level INT DEFAULT 1,
  next_level_threshold INT DEFAULT 100,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_balance_updated ON xp_balances(updated_at DESC);

-- =============================================
-- 4. DAILY LIMITS & RATE LIMITING (Anti-abuse)
-- =============================================

CREATE TABLE xp_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  event_type xp_event_type NOT NULL,
  limit_count INT NOT NULL DEFAULT 1,  -- E.g., workout_completed: max 1/day
  
  -- Reset schedule
  reset_at TIMESTAMPTZ NOT NULL,  -- Next reset (usually next midnight UTC)
  current_count INT DEFAULT 0,    -- Current count in window
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_xp_daily_limits_student_event ON xp_daily_limits(student_id, event_type);
CREATE INDEX idx_xp_daily_limits_reset ON xp_daily_limits(reset_at);

-- =============================================
-- 5. ANTI-DUPLICATION REGISTRY
-- =============================================

CREATE TABLE xp_deduplication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  event_type xp_event_type NOT NULL,
  reference_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ NOT NULL,
  window_seconds INT DEFAULT 5,
  
  transaction_id UUID REFERENCES xp_transactions(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_xp_dedup_event_ref ON xp_deduplication(student_id, event_type, reference_id);
CREATE INDEX idx_xp_dedup_created ON xp_deduplication(created_at DESC);

-- =============================================
-- 6. AUDIT LOG (Immutable records of all changes)
-- =============================================

CREATE TABLE xp_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  transaction_id UUID,
  
  action VARCHAR(50) NOT NULL,  -- 'created', 'reversed', 'adjusted', 'expired'
  before_balance INT,
  after_balance INT,
  
  actor VARCHAR(50),  -- 'system', 'admin:uuid', 'api'
  reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_audit_student ON xp_audit_log(student_id);
CREATE INDEX idx_xp_audit_transaction ON xp_audit_log(transaction_id);
CREATE INDEX idx_xp_audit_action ON xp_audit_log(action);

-- =============================================
-- 7. CONFIGURATION & RATES TABLE
-- =============================================

CREATE TABLE xp_event_config (
  event_type xp_event_type PRIMARY KEY,
  
  -- Base reward amounts
  base_amount INT NOT NULL,
  
  -- Rate limiting
  daily_limit INT DEFAULT 1,
  weekly_limit INT DEFAULT NULL,
  lifetime_limit INT DEFAULT NULL,
  
  -- Expiration
  expires_in_days INT DEFAULT NULL,  -- NULL = never expires
  
  -- Description for analytics
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate standard events
INSERT INTO xp_event_config (event_type, base_amount, daily_limit, name, description) VALUES
  ('workout_completed', 50, 1, 'Treino Concluído', 'Conclusão de um treino planejado'),
  ('streak_3_days', 10, 1, 'Streak 3 Dias', 'Marcar 3 dias consecutivos'),
  ('streak_7_days', 20, 1, 'Streak 7 Dias', 'Marcar 7 dias consecutivos'),
  ('streak_30_days', 50, 1, 'Streak 30 Dias', 'Marcar 30 dias consecutivos'),
  ('streak_100_days', 100, 1, 'Streak 100 Dias', 'Marcar 100 dias consecutivos'),
  ('badge_earned', 50, 5, 'Badge Desbloqueado', 'Conquista de badge de gamificação'),
  ('goal_reached_weight', 200, 1, 'Meta de Peso', 'Atingir peso desejado'),
  ('goal_reached_body_fat', 300, 1, 'Meta de Gordura', 'Atingir % de gordura desejado'),
  ('assessment_completed', 30, 1, 'Avaliação Concluída', 'Conclusão de avaliação'),
  ('referral_signup', 150, NULL, 'Amigo Cadastrado', 'Um amigo se registrou via seu link'),
  ('review_written', 25, 5, 'Avaliação Escrita', 'Deixou avaliação de personal'),
  ('workout_first', 50, 1, 'Primeiro Treino', 'Completou primeiro treino'),
  ('workout_milestone_10', 100, 1, '10 Treinos', 'Marcar 10 treinos concluídos'),
  ('workout_milestone_50', 200, 1, '50 Treinos', 'Marcar 50 treinos concluídos'),
  ('workout_milestone_100', 300, 1, '100 Treinos', 'Marcar 100 treinos concluídos'),
  ('custom_admin_reward', 0, NULL, 'Recompensa Manual', 'Recompensa manual do admin'),
  ('store_purchase_refund', 0, NULL, 'Reembolso Loja', 'Reembolso de compra'),
  ('xp_expiration', 0, NULL, 'XP Expirado', 'XP expirou (90 dias)'),
  ('xp_burn_conversion', 0, NULL, 'Conversão para Moeda', 'XP convertido em moeda interna');

-- =============================================
-- 8. COMMENTS
-- =============================================

COMMENT ON TABLE xp_transactions IS 'Ledger imutável de todas as transações XP (crédito/débito)';
COMMENT ON TABLE xp_balances IS 'Saldo atual e metadados por aluno (cache para queries rápidas)';
COMMENT ON TABLE xp_daily_limits IS 'Limites diários por evento (anti-abuso, rate limiting)';
COMMENT ON TABLE xp_deduplication IS 'Registro de deduplicação para prevenir double-clicking';
COMMENT ON TABLE xp_audit_log IS 'Log imutável de todas as mudanças (para auditoria/compliance)';
COMMENT ON TABLE xp_event_config IS 'Configuração de eventos XP (rates, limites, expiração)';

COMMENT ON COLUMN xp_transactions.direction IS 'credit (ganho) ou debit (gasto)';
COMMENT ON COLUMN xp_transactions.idempotency_key IS 'Chave única para deduplicação (e.g., workout_log:${id}:completed)';
COMMENT ON COLUMN xp_transactions.expires_at IS 'Quando este XP expira (NULL = nunca)';
COMMENT ON COLUMN xp_balances.current_balance IS 'Saldo atual = total_earned - total_spent';
COMMENT ON COLUMN xp_daily_limits.reset_at IS 'Próximo reset (geralmente próxima meia-noite UTC)';
