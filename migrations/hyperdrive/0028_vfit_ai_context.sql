-- Migration 0028: VFIT Subscriptions, AI Context & Chat (UUID types)

CREATE TABLE IF NOT EXISTS vfit_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free',
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  asaas_subscription_id VARCHAR(255),
  price_paid NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_subs_user ON vfit_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_subs_plan ON vfit_subscriptions(plan_type);

CREATE TABLE IF NOT EXISTS vfit_user_ai_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  recent_workouts JSONB DEFAULT '[]'::jsonb,
  recent_meals JSONB DEFAULT '[]'::jsonb,
  progress_metrics JSONB DEFAULT '{}'::jsonb,
  user_preferences JSONB DEFAULT '{}'::jsonb,
  current_weekly_volume INTEGER DEFAULT 0,
  strength_prs JSONB DEFAULT '{}'::jsonb,
  estimated_max_one_rep JSONB DEFAULT '{}'::jsonb,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_ai_profiles_user ON vfit_user_ai_profiles(user_id);

CREATE TABLE IF NOT EXISTS vfit_ia_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  context_used JSONB,
  model_used VARCHAR(100),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_chat_user ON vfit_ia_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_chat_created ON vfit_ia_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vfit_chat_user_recent ON vfit_ia_chat_messages(user_id, created_at DESC);
