-- ============================================
-- Migration: Recreate ALL missing B2C tables
-- ============================================
-- Migration 0022 failed completely: 7 of 8 tables were NOT created.
-- Migration 0024 (self_assessments) also failed.
-- Root cause: exercises(id) FK referenced D1-only table.
-- This migration creates ALL missing tables.
-- exercises FK removed; name/muscle_group denormalized.
-- ============================================

-- 1) user_onboarding (from 0022 — quiz responses)
CREATE TABLE IF NOT EXISTS user_onboarding (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
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

-- 2) workout_plan_days (from 0022)
CREATE TABLE IF NOT EXISTS workout_plan_days (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  focus TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  estimated_duration_min INTEGER DEFAULT 45,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON workout_plan_days(plan_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_days_unique ON workout_plan_days(plan_id, day_number);

-- 3) workout_plan_exercises (from 0022 — WITHOUT FK to exercises)
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_day_id TEXT NOT NULL,
  exercise_id TEXT,
  name TEXT,
  muscle_group TEXT,
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

-- 4) workout_sessions (from 0022)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  plan_id TEXT,
  plan_day_id TEXT,
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

-- 5) exercise_logs (from 0022 — WITHOUT FK to exercises)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  name TEXT,
  muscle_group TEXT,
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

-- 6) personal_records (from 0022 — WITHOUT FK to exercises)
CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  name TEXT,
  record_type TEXT NOT NULL DEFAULT 'max_weight',
  value NUMERIC(10,2) NOT NULL,
  previous_value NUMERIC(10,2),
  session_id TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_exercise ON personal_records(user_id, exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_unique ON personal_records(user_id, exercise_id, record_type);

-- 7) user_streaks (from 0022)
CREATE TABLE IF NOT EXISTS user_streaks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  streak_freezes_used INTEGER DEFAULT 0,
  streak_freezes_available INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user ON user_streaks(user_id);

-- 8) self_assessments (from 0024 — also missing)
CREATE TABLE IF NOT EXISTS self_assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  weight_kg NUMERIC(5,1) NOT NULL,
  height_cm NUMERIC(5,1) NOT NULL,
  bmi NUMERIC(4,1),
  bmi_category TEXT,
  body_fat_percentage NUMERIC(4,1),
  waist_cm NUMERIC(5,1),
  hip_cm NUMERIC(5,1),
  chest_cm NUMERIC(5,1),
  arm_left_cm NUMERIC(5,1),
  arm_right_cm NUMERIC(5,1),
  thigh_left_cm NUMERIC(5,1),
  thigh_right_cm NUMERIC(5,1),
  calf_left_cm NUMERIC(5,1),
  calf_right_cm NUMERIC(5,1),
  activity_level TEXT,
  goal TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_self_assessments_user_id ON self_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_created ON self_assessments(user_id, created_at DESC);
