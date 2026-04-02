-- 0017_exercise_media.sql
-- S61: Exercise media table for videos/thumbnails by exercise

CREATE TABLE IF NOT EXISTS exercise_media (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  setup_notes TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_media_exercise_id ON exercise_media(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_media_active ON exercise_media(is_active);
