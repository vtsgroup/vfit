-- 0018_workout_session_state.sql
-- S64: Persistência de sessão de treino guiado

CREATE TABLE IF NOT EXISTS workout_session_state (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  workout_id TEXT NOT NULL,
  current_exercise_index INTEGER NOT NULL DEFAULT 0,
  phase TEXT NOT NULL CHECK (phase IN ('exercise', 'rest', 'next_preview', 'completed')),
  rest_remaining_seconds INTEGER NOT NULL DEFAULT 0,
  next_exercise_id TEXT,
  exercise_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workout_id)
);

CREATE INDEX IF NOT EXISTS idx_workout_session_user_workout ON workout_session_state(user_id, workout_id);
