-- ============================================
-- MIGRATION 0002 - Admin + Subscriptions + PIX Transfers
-- Personal IA Prod
-- Date: 2026-02-09
-- ============================================

-- =============================================
-- 1. Adicionar role admin na tabela users
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================
-- 2. Tabela de assinaturas Asaas (cobranças recorrentes)
-- =============================================
CREATE TABLE IF NOT EXISTS payment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem paga e quem recebe
  payer_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES personals(id),
  
  -- Dados do Asaas
  asaas_subscription_id VARCHAR(100) UNIQUE,
  asaas_customer_id VARCHAR(100),
  
  -- Configuração
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  
  description TEXT,
  
  -- Datas
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'overdue')),
  
  -- Fees
  platform_fee DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Controle
  total_charges INT DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_payer ON payment_subscriptions(payer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_recipient ON payment_subscriptions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON payment_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas ON payment_subscriptions(asaas_subscription_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payment_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- 3. Tabela de transferências PIX (saques)
-- =============================================
CREATE TABLE IF NOT EXISTS pix_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem solicita
  personal_id UUID NOT NULL REFERENCES personals(id),
  
  -- Dados Asaas
  asaas_transfer_id VARCHAR(100) UNIQUE,
  
  -- Dados do PIX
  pix_key VARCHAR(100) NOT NULL,
  pix_key_type VARCHAR(20) NOT NULL CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  
  -- Valores
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Controle
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_reason TEXT,
  
  -- Aprovação admin
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pix_transfers_personal ON pix_transfers(personal_id);
CREATE INDEX IF NOT EXISTS idx_pix_transfers_status ON pix_transfers(status);
CREATE INDEX IF NOT EXISTS idx_pix_transfers_created ON pix_transfers(created_at DESC);

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON pix_transfers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- 4. Tabela customers Asaas (cache de clientes)
-- =============================================
CREATE TABLE IF NOT EXISTS asaas_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id),
  
  asaas_customer_id VARCHAR(100) NOT NULL,
  
  -- Dados sincronizados
  name VARCHAR(255),
  email VARCHAR(255),
  cpf_cnpj VARCHAR(18),
  phone VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, personal_id)
);

CREATE INDEX IF NOT EXISTS idx_asaas_customers_user ON asaas_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_asaas_customers_personal ON asaas_customers(personal_id);
CREATE INDEX IF NOT EXISTS idx_asaas_customers_asaas ON asaas_customers(asaas_customer_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON asaas_customers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- 5. Inserir admins
-- =============================================

-- Admin 1: Emerson Xavier
INSERT INTO users (id, email, password_hash, full_name, cpf, user_type, role, is_active, email_verified, metadata)
VALUES (
  'c70205c9-2565-46f4-bff6-fb32606788d3',
  'emerson.xavier@personalia.app.br',
  '$2b$12$VEnmWR2pMIdwGHulZxQVKeeNCX.YIbyifa.bGkli0gJpmP.kF9.M2',
  'Emerson Xavier',
  '000.000.001-91',
  'personal',
  'admin',
  true,
  true,
  '{"admin": true, "admin_since": "2026-02-09"}'::jsonb
) ON CONFLICT (email) DO UPDATE SET role = 'admin', metadata = '{"admin": true, "admin_since": "2026-02-09"}'::jsonb;

INSERT INTO personals (id, cref, cref_state, specialties, referral_code, subscription_plan, subscription_status, is_public_profile)
VALUES (
  'c70205c9-2565-46f4-bff6-fb32606788d3',
  '000001-G/SP',
  'SP',
  ARRAY['administração', 'gestão']::TEXT[],
  'B5NZKF9C',
  'max',
  'active',
  false
) ON CONFLICT (id) DO UPDATE SET subscription_plan = 'max', subscription_status = 'active';

-- Admin 2: Victor Duarte
INSERT INTO users (id, email, password_hash, full_name, cpf, user_type, role, is_active, email_verified, metadata)
VALUES (
  'f1bc775d-7b7b-4702-adeb-dc9255082d03',
  'victor.duarte@personalia.com.br',
  '$2b$12$n9dx9nZb1YqIROS6GaMHv.rQL4qwhQ3m0Cob/Th./v4rjjWbjh/wa',
  'Victor Duarte',
  '000.000.002-72',
  'personal',
  'admin',
  true,
  true,
  '{"admin": true, "admin_since": "2026-02-09"}'::jsonb
) ON CONFLICT (email) DO UPDATE SET role = 'admin', metadata = '{"admin": true, "admin_since": "2026-02-09"}'::jsonb;

INSERT INTO personals (id, cref, cref_state, specialties, referral_code, subscription_plan, subscription_status, is_public_profile)
VALUES (
  'f1bc775d-7b7b-4702-adeb-dc9255082d03',
  '000002-G/RJ',
  'RJ',
  ARRAY['administração', 'gestão']::TEXT[],
  'XHRPC5NR',
  'max',
  'active',
  false
) ON CONFLICT (id) DO UPDATE SET subscription_plan = 'max', subscription_status = 'active';

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE payment_subscriptions IS 'Assinaturas recorrentes via Asaas para cobrança automática de alunos';
COMMENT ON TABLE pix_transfers IS 'Transferências/saques PIX solicitados por personals';
COMMENT ON TABLE asaas_customers IS 'Cache de clientes Asaas sincronizados (aluno → customer Asaas)';
COMMENT ON COLUMN users.role IS 'Papel do usuário: user (padrão), admin, super_admin';
