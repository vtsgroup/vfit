-- 0033_vfit_food_favorites_and_workout_idempotency.sql
-- Student-first nutrition UX + offline workout duplicate protection.

CREATE TABLE IF NOT EXISTS vfit_food_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES vfit_foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_vfit_food_favorites_user_created
  ON vfit_food_favorites(user_id, created_at DESC);

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS client_completion_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_sessions_client_completion
  ON workout_sessions(user_id, client_completion_id)
  WHERE client_completion_id IS NOT NULL;