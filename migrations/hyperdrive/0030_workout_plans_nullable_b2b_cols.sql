-- ============================================
-- Migration 0030: Make B2B marketplace columns nullable in workout_plans
-- ============================================
-- Context: workout_plans table was originally designed for B2B marketplace plans
-- with strict NOT NULL constraints on columns like title, description, category,
-- price_brl, plan_content, etc. B2C AI-generated plans (via /plans/auto-generate)
-- don't use these columns, causing INSERT failures:
--   "null value in column 'created_by' of relation 'workout_plans' violates not-null constraint"
--
-- This migration makes B2B-specific columns nullable so B2C plans can be inserted
-- with just the B2C columns (user_id, name, type, status, total_days, etc.)
-- ============================================

-- Make B2B marketplace columns nullable
ALTER TABLE workout_plans ALTER COLUMN title DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN description DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN category DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN duration_weeks DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN workouts_per_week DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN price_brl DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN plan_content DROP NOT NULL;
ALTER TABLE workout_plans ALTER COLUMN created_by DROP NOT NULL;

-- Add defaults for B2B columns used in B2C context
ALTER TABLE workout_plans ALTER COLUMN price_brl SET DEFAULT 0;
ALTER TABLE workout_plans ALTER COLUMN description SET DEFAULT '';
ALTER TABLE workout_plans ALTER COLUMN category SET DEFAULT 'b2c';
