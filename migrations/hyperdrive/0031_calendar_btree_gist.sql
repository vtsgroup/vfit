-- =============================================
-- 0031_calendar_btree_gist.sql
-- Calendar double-booking prevention (TODO-001)
-- =============================================
--
-- Adds a DB-level exclusion constraint using btree_gist so that
-- no two calendar_events for the same personal_id can overlap.
-- This closes the ~1ms race window that application-level checkConflict()
-- cannot eliminate under concurrent inserts.
--
-- Requires: PostgreSQL btree_gist extension (available on Neon).
-- Safe to run multiple times (idempotent via IF NOT EXISTS / DO block).
-- =============================================

-- 1. Enable btree_gist (required for EXCLUDE on timestamp ranges)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Add recurrence columns if they don't exist yet (idempotent)
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS recurrence_group_id UUID,
  ADD COLUMN IF NOT EXISTS recurrence_index INT;

-- 3. Create the exclusion constraint
--    Two events conflict when they share the same personal_id AND their
--    time ranges overlap (tstzrange, default [) bounds → half-open interval).
--    back-to-back events (end_at = next start_at) do NOT conflict.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'calendar_events_no_overlap_personal'
  ) THEN
    ALTER TABLE calendar_events
      ADD CONSTRAINT calendar_events_no_overlap_personal
      EXCLUDE USING gist (
        personal_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      );
  END IF;
END;
$$;

-- 4. Indexes for common query patterns (idempotent)
CREATE INDEX IF NOT EXISTS idx_calendar_events_personal_start
  ON calendar_events(personal_id, start_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_student_start
  ON calendar_events(student_id, start_at);

CREATE INDEX IF NOT EXISTS idx_calendar_events_recurrence_group
  ON calendar_events(recurrence_group_id)
  WHERE recurrence_group_id IS NOT NULL;
