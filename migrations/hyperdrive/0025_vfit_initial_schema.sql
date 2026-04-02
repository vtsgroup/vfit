-- ============================================
-- Migration 0025: VFIT Initial Schema
-- ============================================
-- All IDs use UUID (matching existing users.id UUID type).
-- New tables use vfit_ prefix. Dependencies: 0001 (users).
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS body_fat_percent NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipment_available TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_canceled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS vfit_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(50) NOT NULL DEFAULT 'intermediate',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  primary_muscle VARCHAR(100) NOT NULL DEFAULT 'full_body',
  secondary_muscles TEXT[] DEFAULT '{}',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url VARCHAR(500),
  is_library BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_workouts_creator ON vfit_workouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_vfit_workouts_library ON vfit_workouts(is_library);
CREATE INDEX IF NOT EXISTS idx_vfit_workouts_muscle ON vfit_workouts(primary_muscle);

CREATE TABLE IF NOT EXISTS vfit_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES vfit_workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  rpe_overall INTEGER CHECK (rpe_overall BETWEEN 1 AND 10),
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_sessions_user ON vfit_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_sessions_workout ON vfit_workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_vfit_sessions_started ON vfit_workout_sessions(started_at DESC);

CREATE TABLE IF NOT EXISTS vfit_workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES vfit_workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_sets_session ON vfit_workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_vfit_sets_exercise ON vfit_workout_sets(exercise_id);
