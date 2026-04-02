-- Migration 0023: Body measurements tracking (B2C)
-- Tabela dedicada para tracking corporal do B2C (evolução de peso, medidas, fotos)

CREATE TABLE IF NOT EXISTS body_measurements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core measurements
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  body_fat_percentage NUMERIC(5,2),
  bmi NUMERIC(5,2),
  
  -- Body parts (cm)
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  hip_cm NUMERIC(5,1),
  arm_left_cm NUMERIC(5,1),
  arm_right_cm NUMERIC(5,1),
  thigh_left_cm NUMERIC(5,1),
  thigh_right_cm NUMERIC(5,1),
  calf_left_cm NUMERIC(5,1),
  calf_right_cm NUMERIC(5,1),
  
  -- Progress photos (R2 URLs)
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON body_measurements(user_id, measured_at DESC);
