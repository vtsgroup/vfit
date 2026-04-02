-- Migration 0027: VFIT Trainers & Evaluation Bookings (UUID types)

CREATE TABLE IF NOT EXISTS vfit_trainers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  price_per_evaluation NUMERIC(8,2) NOT NULL DEFAULT 0,
  available_days JSONB DEFAULT '{}'::jsonb,
  available_timezones TEXT[] DEFAULT '{America/Sao_Paulo}',
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  profile_image_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_trainers_rating ON vfit_trainers(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_vfit_trainers_active ON vfit_trainers(is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS vfit_evaluation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES vfit_trainers(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  evaluation_type VARCHAR(100) DEFAULT 'body_composition',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  price_agreed NUMERIC(8,2) NOT NULL,
  asaas_payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  meeting_link VARCHAR(500),
  student_notes TEXT,
  trainer_notes TEXT,
  evaluation_id UUID REFERENCES vfit_evaluations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfit_bookings_user ON vfit_evaluation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_vfit_bookings_trainer ON vfit_evaluation_bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_vfit_bookings_scheduled ON vfit_evaluation_bookings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_vfit_bookings_status ON vfit_evaluation_bookings(status);
