-- =============================================
-- 0014_notification_preferences_calendar_windows.sql
-- Calendar reminder windows per user
-- =============================================

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS calendar_reminder_24h_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS calendar_reminder_1h_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS calendar_reminder_15m_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_calendar_windows
  ON notification_preferences(user_id, calendar_enabled, calendar_reminder_24h_enabled, calendar_reminder_1h_enabled, calendar_reminder_15m_enabled);
