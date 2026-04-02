-- =============================================
-- 0013_notification_preferences_calendar.sql
-- Add calendar reminders preference toggle
-- =============================================

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS calendar_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_calendar
  ON notification_preferences(user_id, calendar_enabled);
