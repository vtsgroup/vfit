-- Migration 0023: Add B2C columns to workout_plans
-- The original table (0001) was B2B marketplace; 0022 tried CREATE TABLE IF NOT EXISTS
-- which was no-op since the table already existed. This adds the missing B2C columns.
-- Safe: all use ADD COLUMN IF NOT EXISTS and have sensible defaults.

-- B2C columns needed by /plans/current and AI plan generation
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'marketplace';
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS total_days INTEGER DEFAULT 3;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS current_day INTEGER DEFAULT 1;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS ai_prompt_used TEXT;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Indexes for B2C queries
CREATE INDEX IF NOT EXISTS idx_plans_user ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON workout_plans(user_id, status);

-- Backfill: copy title → name for existing records that have title but no name
UPDATE workout_plans SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Also add B2C columns to workout_plan_exercises if missing
ALTER TABLE workout_plan_exercises ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workout_plan_exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;

DO $$ BEGIN RAISE NOTICE 'Migration 0023 complete: B2C columns added to workout_plans.'; END $$;
