-- ============================================
-- Migration 0022: EVOLUIA B2C Core Tables
-- ============================================
-- 8 new tables for B2C workout app:
--   1. user_onboarding (quiz responses)
--   2. workout_plans (AI-generated plans)
--   3. workout_plan_days (days per plan)
--   4. workout_plan_exercises (exercises per day)
--   5. workout_sessions (training sessions)
--   6. exercise_logs (set-by-set logging)
--   7. personal_records (PRs)
--   8. user_streaks (streak tracking)
-- ============================================

-- 1) user_onboarding
CREATE TABLE IF NOT EXISTS user_onboarding (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  training_frequency TEXT NOT NULL,
  goal TEXT NOT NULL,
  training_location TEXT NOT NULL,
  target_muscles TEXT[] DEFAULT '{}',
  age INTEGER NOT NULL,
  height_cm NUMERIC(5,1) NOT NULL,
  weight_kg NUMERIC(5,1) NOT NULL,
  target_weight_kg NUMERIC(5,1),
  days_per_week INTEGER NOT NULL DEFAULT 3,
  session_duration TEXT NOT NULL DEFAULT 'medium',
  injuries TEXT[] DEFAULT '{}',
  preferred_days TEXT[] DEFAULT '{}',
  preferred_time TEXT DEFAULT 'any',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON user_onboarding(user_id);

-- 2) workout_plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Plano EVOLUIA IA',
  type TEXT NOT NULL DEFAULT 'ai_generated',
  status TEXT NOT NULL DEFAULT 'active',
  total_days INTEGER NOT NULL DEFAULT 3,
  current_day INTEGER NOT NULL DEFAULT 1,
  ai_prompt_used TEXT,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON workout_plans(user_id, status);

-- 3) workout_plan_days
CREATE TABLE IF NOT EXISTS workout_plan_days (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_id TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  muscle_groups TEXT[] DEFAULT '{}',
  estimated_duration_min INTEGER DEFAULT 45,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON workout_plan_days(plan_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_days_unique ON workout_plan_days(plan_id, day_number);

-- 4) workout_plan_exercises
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_day_id TEXT NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '12',
  weight_kg NUMERIC(6,2),
  rest_seconds INTEGER DEFAULT 60,
  is_warmup BOOLEAN DEFAULT FALSE,
  is_superset BOOLEAN DEFAULT FALSE,
  superset_group TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_exercises_day ON workout_plan_exercises(plan_day_id);

-- 5) workout_sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES workout_plans(id),
  plan_day_id TEXT REFERENCES workout_plan_days(id),
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_volume_kg NUMERIC(10,2) DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  calories_estimated INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_plan ON workout_sessions(plan_id);

-- 6) exercise_logs
CREATE TABLE IF NOT EXISTS exercise_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  set_type TEXT NOT NULL DEFAULT 'normal',
  reps INTEGER NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  rpe INTEGER,
  distance_meters NUMERIC(8,1),
  is_completed BOOLEAN DEFAULT TRUE,
  is_personal_record BOOLEAN DEFAULT FALSE,
  notes TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise ON exercise_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_pr ON exercise_logs(exercise_id, is_personal_record) WHERE is_personal_record = TRUE;

-- 7) personal_records
CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  record_type TEXT NOT NULL DEFAULT 'max_weight',
  value NUMERIC(10,2) NOT NULL,
  previous_value NUMERIC(10,2),
  session_id TEXT REFERENCES workout_sessions(id),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_exercise ON personal_records(user_id, exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_unique ON personal_records(user_id, exercise_id, record_type);

-- 8) user_streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  streak_freezes_used INTEGER DEFAULT 0,
  streak_freezes_available INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user ON user_streaks(user_id);

-- Done
DO $$ BEGIN RAISE NOTICE 'Migration 0022 complete: 8 EVOLUIA B2C core tables created.'; END $$;
