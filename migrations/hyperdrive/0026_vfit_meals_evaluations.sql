-- Migration 0026: VFIT Foods, Meals & Evaluations (UUID types)

CREATE TABLE IF NOT EXISTS vfit_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  calories NUMERIC(6,2) NOT NULL,
  protein_g NUMERIC(5,2) DEFAULT 0,
  carbs_g NUMERIC(5,2) DEFAULT 0,
  fat_g NUMERIC(5,2) DEFAULT 0,
  fiber_g NUMERIC(4,2) DEFAULT 0,
  sodium_mg NUMERIC(6,2) DEFAULT 0,
  standard_portion_g INTEGER DEFAULT 100,
  image_url VARCHAR(500),
  is_library BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT FALSE,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_foods_category ON vfit_foods(category);
CREATE INDEX IF NOT EXISTS idx_vfit_foods_creator ON vfit_foods(creator_id);
CREATE INDEX IF NOT EXISTS idx_vfit_foods_name ON vfit_foods(name);

CREATE TABLE IF NOT EXISTS vfit_user_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES vfit_foods(id) ON DELETE CASCADE,
  meal_type VARCHAR(50) NOT NULL,
  quantity_g INTEGER NOT NULL DEFAULT 100,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_total NUMERIC(8,2),
  protein_total NUMERIC(6,2),
  carbs_total NUMERIC(6,2),
  fat_total NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_meals_user ON vfit_user_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_meals_logged ON vfit_user_meals(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_vfit_meals_user_date ON vfit_user_meals(user_id, logged_at);

CREATE TABLE IF NOT EXISTS vfit_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  evaluation_type VARCHAR(100) NOT NULL DEFAULT 'body_composition',
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  photos TEXT[] DEFAULT '{}',
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_evals_user ON vfit_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_evals_trainer ON vfit_evaluations(trainer_id);
CREATE INDEX IF NOT EXISTS idx_vfit_evals_date ON vfit_evaluations(evaluation_date DESC);
