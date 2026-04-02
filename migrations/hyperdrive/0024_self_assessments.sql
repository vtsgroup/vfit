-- Migration 0024: Self-assessments para B2C
-- Avaliações físicas feitas pelo próprio aluno

CREATE TABLE IF NOT EXISTS self_assessments (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg        NUMERIC(5,1) NOT NULL,
  height_cm        NUMERIC(5,1) NOT NULL,
  bmi              NUMERIC(4,1),
  bmi_category     TEXT,
  body_fat_percentage NUMERIC(4,1),
  waist_cm         NUMERIC(5,1),
  hip_cm           NUMERIC(5,1),
  chest_cm         NUMERIC(5,1),
  arm_left_cm      NUMERIC(5,1),
  arm_right_cm     NUMERIC(5,1),
  thigh_left_cm    NUMERIC(5,1),
  thigh_right_cm   NUMERIC(5,1),
  calf_left_cm     NUMERIC(5,1),
  calf_right_cm    NUMERIC(5,1),
  activity_level   TEXT,           -- sedentary, light, moderate, active, very_active
  goal             TEXT,           -- lose_weight, gain_muscle, maintain, improve_health
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_self_assessments_user_id ON self_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_created ON self_assessments(user_id, created_at DESC);
