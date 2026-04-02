-- =============================================
-- Migration 0016: Daily Goals & Streak Rewards
-- Created: 2026-02-26
-- Sprint: S54
-- =============================================

-- =============================================
-- 1. USER DAILY GOALS
-- Tracks daily XP targets and completion status
-- =============================================
CREATE TABLE IF NOT EXISTS user_daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_xp INT NOT NULL DEFAULT 50,
  earned_xp INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  workouts_target INT NOT NULL DEFAULT 1,
  workouts_done INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, goal_date)
);

CREATE INDEX idx_daily_goals_student_date ON user_daily_goals(student_id, goal_date DESC);
CREATE INDEX idx_daily_goals_completed ON user_daily_goals(student_id, completed, goal_date DESC);

-- =============================================
-- 2. STREAK TRACKING TABLE
-- Dedicated streak tracking with milestone history
-- =============================================
CREATE TABLE IF NOT EXISTS xp_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_started_at DATE,
  last_milestone_awarded INT NOT NULL DEFAULT 0,
  freeze_count INT NOT NULL DEFAULT 0,
  max_freezes INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_streaks_student ON xp_streaks(student_id);
CREATE INDEX idx_xp_streaks_current ON xp_streaks(current_streak DESC);

-- =============================================
-- 3. STREAK MILESTONES LOG
-- Records when streak milestones are achieved
-- =============================================
CREATE TABLE IF NOT EXISTS xp_streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  milestone_days INT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded INT NOT NULL DEFAULT 0,
  transaction_id UUID REFERENCES xp_transactions(id) ON DELETE SET NULL,
  UNIQUE(student_id, milestone_days)
);

CREATE INDEX idx_streak_milestones_student ON xp_streak_milestones(student_id, milestone_days);

-- =============================================
-- 4. ADD goal_reached event types to config (if not exists)
-- =============================================
INSERT INTO xp_event_config (event_type, base_amount, daily_limit, name, description)
VALUES
  ('goal_reached_weight', 30, 1, 'Meta Peso Atingida', 'Aluno atingiu meta de peso'),
  ('goal_reached_body_fat', 30, 1, 'Meta BF Atingida', 'Aluno atingiu meta de gordura corporal')
ON CONFLICT (event_type) DO NOTHING;

-- =============================================
-- 5. UPDATE streak event configs with correct amounts
-- =============================================
UPDATE xp_event_config SET base_amount = 15, description = 'Streak de 3 dias consecutivos de treino' WHERE event_type = 'streak_3_days';
UPDATE xp_event_config SET base_amount = 30, description = 'Streak de 7 dias consecutivos de treino' WHERE event_type = 'streak_7_days';
UPDATE xp_event_config SET base_amount = 75, description = 'Streak de 30 dias consecutivos de treino' WHERE event_type = 'streak_30_days';
UPDATE xp_event_config SET base_amount = 200, description = 'Streak de 100 dias consecutivos de treino' WHERE event_type = 'streak_100_days';
