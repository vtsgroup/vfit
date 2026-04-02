-- =============================================
-- 0012_calendar_events.sql
-- Calendar / Agenda (events)
-- =============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,

  title VARCHAR(120),
  notes TEXT,
  meeting_url TEXT,

  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  color VARCHAR(20) NOT NULL DEFAULT 'blue',
  status VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_personal_start ON calendar_events(personal_id, start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_student_start ON calendar_events(student_id, start_at);
