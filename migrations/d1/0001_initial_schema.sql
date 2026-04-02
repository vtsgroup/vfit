-- ============================================
-- D1 MIGRATION 0001 - Initial Schema
-- Cold Data: Exercise Library, Templates, Muscle Groups
-- Personal IA Prod
-- ============================================

-- MUSCLE GROUPS
CREATE TABLE IF NOT EXISTS muscle_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  icon_svg TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- EXERCISES (Library)
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  muscle_group_id TEXT NOT NULL REFERENCES muscle_groups(id),

  description TEXT,
  description_pt TEXT,

  -- Videos (R2 URLs)
  video_url_vertical TEXT,
  video_url_horizontal TEXT,
  thumbnail_url TEXT,

  -- Transcription
  transcription_pt TEXT,
  transcription_en TEXT,

  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment_needed TEXT DEFAULT '[]',

  is_default INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,

  view_count INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_default ON exercises(is_default);
CREATE INDEX IF NOT EXISTS idx_exercises_name_pt ON exercises(name_pt);

-- WORKOUT TEMPLATES
CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description TEXT,

  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  template_data TEXT NOT NULL,

  is_default INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,

  usage_count INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON workout_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_default ON workout_templates(is_default);

-- SERIES TYPES
CREATE TABLE IF NOT EXISTS series_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon_svg TEXT
);

-- EQUIPMENT TYPES
CREATE TABLE IF NOT EXISTS equipment_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  icon_svg TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);
