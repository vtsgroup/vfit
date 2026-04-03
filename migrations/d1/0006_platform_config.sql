-- migrations/d1/0006_platform_config.sql
-- Platform Configuration — Dynamic plans & settings manageable by super_admin
-- Created: 2026-04-03

-- ============================================
-- B2B Plans (Personal Trainer subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_plans_b2b (
  slug TEXT PRIMARY KEY,                -- trial, pro, profissional, max
  name TEXT NOT NULL,                    -- Display name
  price_brl REAL NOT NULL DEFAULT 0,     -- Monthly price in BRL
  duration_days INTEGER,                 -- null = forever, 30 = monthly
  max_students INTEGER NOT NULL DEFAULT 5, -- -1 = unlimited
  features TEXT NOT NULL DEFAULT '[]',   -- JSON array of feature strings
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,  -- 0 = hidden from UI
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- B2C Plans (End-user subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_plans_b2c (
  slug TEXT PRIMARY KEY,                -- free, premium, premium_annual
  name TEXT NOT NULL,
  price_brl REAL NOT NULL DEFAULT 0,
  duration_days INTEGER,                 -- null = forever, 30, 365
  features TEXT NOT NULL DEFAULT '[]',   -- JSON array of feature strings
  limits TEXT NOT NULL DEFAULT '{}',     -- JSON object of limits
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- Platform Config (key-value for fees, rates, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_config (
  config_key TEXT PRIMARY KEY,           -- e.g. 'fees.platform_fee_percentage'
  config_value TEXT NOT NULL,            -- JSON value (number, string, object)
  category TEXT NOT NULL DEFAULT 'general', -- fees, gamification, rate_limits, cache, affiliate
  label TEXT NOT NULL DEFAULT '',         -- Human-readable label for admin UI
  description TEXT DEFAULT '',
  value_type TEXT NOT NULL DEFAULT 'string', -- string, number, json, boolean
  is_editable INTEGER NOT NULL DEFAULT 1,   -- 0 = read-only in admin UI
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT                         -- user_id of last editor
);

CREATE INDEX IF NOT EXISTS idx_platform_config_category ON platform_config(category);

-- ============================================
-- Seed B2B Plans
-- ============================================
INSERT OR REPLACE INTO platform_plans_b2b (slug, name, price_brl, duration_days, max_students, features, display_order) VALUES
  ('trial', 'Grátis', 0, NULL, 5, '["Até 5 alunos","Criação manual de treinos","Gamificação básica (XP)","Cobrança Pix/boleto","App PWA completo"]', 0),
  ('pro', 'Pro', 29.90, 30, -1, '["Alunos ilimitados","IA para criar treinos","Recorrência automática","Gamificação completa","Notificações WhatsApp + e-mail","Relatórios avançados"]', 1),
  ('profissional', 'Pro+', 69.90, 30, -1, '["Alunos ilimitados","Tudo do Pro","Marketplace de planos","IA avançada (Llama 70B)","Relatórios completos (PDF)","Avaliações com fotos IA","Dashboard financeiro","Suporte prioritário"]', 2),
  ('max', 'Max', 129.90, 30, -1, '["Alunos ilimitados","Tudo do Profissional","Contratos digitais","Invoices + NFs automáticas","White-label (nome + logo)","Assistente IA pessoal","Assinatura digital ICP-Brasil","Suporte VIP 24/7"]', 3);

-- ============================================
-- Seed B2C Plans
-- ============================================
INSERT OR REPLACE INTO platform_plans_b2c (slug, name, price_brl, duration_days, features, limits, display_order) VALUES
  ('free', 'Grátis', 0, NULL, '["Plano de treino básico por IA","Até 3 treinos/semana","Acompanhamento de progresso","Streak + XP básico"]', '{"ai_plans_per_month":1,"workouts_per_week":3,"ai_chat_messages":10,"exercise_library":"basic"}', 0),
  ('premium', 'Premium', 19.90, 30, '["Planos ilimitados por IA","Treinos ilimitados","Chat IA ilimitado","Biblioteca completa de exercícios","Avaliação física IA","Streak freezes ilimitados","Sem anúncios"]', '{"ai_plans_per_month":-1,"workouts_per_week":-1,"ai_chat_messages":-1,"exercise_library":"full"}', 1),
  ('premium_annual', 'Premium Anual', 149.90, 365, '["Tudo do Premium","37% de desconto","Badge exclusivo"]', '{"ai_plans_per_month":-1,"workouts_per_week":-1,"ai_chat_messages":-1,"exercise_library":"full"}', 2);

-- ============================================
-- Seed Platform Config — Fees
-- ============================================
INSERT OR REPLACE INTO platform_config (config_key, config_value, category, label, description, value_type) VALUES
  ('fees.platform_fee_percentage', '3.5', 'fees', 'Taxa da plataforma (%)', 'Percentual cobrado sobre pagamentos processados', 'number'),
  ('fees.marketplace_platform_share', '30', 'fees', 'Share plataforma marketplace (%)', 'Percentual da plataforma em vendas do marketplace', 'number'),
  ('fees.marketplace_creator_share', '70', 'fees', 'Share criador marketplace (%)', 'Percentual do criador em vendas do marketplace', 'number'),
  ('fees.annual_discount_b2b', '20', 'fees', 'Desconto anual B2B (%)', 'Desconto para planos anuais de personal trainers', 'number');

-- ============================================
-- Seed Platform Config — Gamification XP
-- ============================================
INSERT OR REPLACE INTO platform_config (config_key, config_value, category, label, description, value_type) VALUES
  ('xp.workout_completed', '50', 'gamification', 'XP por treino completo', 'XP ganho ao completar um treino', 'number'),
  ('xp.personal_record', '30', 'gamification', 'XP por recorde pessoal', 'XP ganho ao bater recorde em exercício', 'number'),
  ('xp.streak_day', '10', 'gamification', 'XP por dia de streak', 'XP ganho por cada dia consecutivo de treino', 'number'),
  ('xp.assessment_completed', '20', 'gamification', 'XP por avaliação', 'XP ganho ao completar avaliação física', 'number'),
  ('xp.badge_earned', '25', 'gamification', 'XP por badge', 'XP ganho ao conquistar um badge', 'number'),
  ('xp.first_workout', '100', 'gamification', 'XP primeiro treino', 'XP bônus pelo primeiro treino', 'number');

-- ============================================
-- Seed Platform Config — Rate Limits
-- ============================================
INSERT OR REPLACE INTO platform_config (config_key, config_value, category, label, description, value_type) VALUES
  ('rate_limit.login', '{"max":5,"windowSeconds":900}', 'rate_limits', 'Login', '5 tentativas por 15 minutos', 'json'),
  ('rate_limit.register', '{"max":3,"windowSeconds":3600}', 'rate_limits', 'Registro', '3 por hora', 'json'),
  ('rate_limit.forgot_password', '{"max":3,"windowSeconds":3600}', 'rate_limits', 'Forgot Password', '3 por hora', 'json'),
  ('rate_limit.payments', '{"max":10,"windowSeconds":60}', 'rate_limits', 'Pagamentos', '10 por minuto', 'json'),
  ('rate_limit.ai', '{"max":20,"windowSeconds":60}', 'rate_limits', 'IA', '20 por minuto', 'json'),
  ('rate_limit.default', '{"max":100,"windowSeconds":60}', 'rate_limits', 'Default', '100 por minuto', 'json');

-- ============================================
-- Seed Platform Config — Cache TTLs
-- ============================================
INSERT OR REPLACE INTO platform_config (config_key, config_value, category, label, description, value_type) VALUES
  ('cache.exercises', '604800', 'cache', 'Exercícios (s)', '7 dias', 'number'),
  ('cache.templates', '259200', 'cache', 'Templates (s)', '3 dias', 'number'),
  ('cache.workouts', '3600', 'cache', 'Treinos (s)', '1 hora', 'number'),
  ('cache.sessions', '86400', 'cache', 'Sessões (s)', '24 horas', 'number'),
  ('cache.profiles', '43200', 'cache', 'Perfis (s)', '12 horas', 'number');
