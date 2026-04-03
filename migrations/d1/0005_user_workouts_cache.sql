-- migrations/d1/0005_user_workouts_cache.sql
-- User Workouts Cache — offline availability for PWA
-- Sprint: vfit-sprint-twa-onboarding-d1-visual (v1.1.0)
-- Date: 2026-04-03

CREATE TABLE IF NOT EXISTS user_workouts_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSON NOT NULL,
  synced_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_user_workouts_user ON user_workouts_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_created ON user_workouts_cache(created_at DESC);
