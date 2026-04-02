-- ============================================
-- HYPERDRIVE (PostgreSQL via Neon) - MIGRATION 0001
-- Hot Data: Users, Personals, Students, Workouts,
-- Payments, Affiliates, Assessments, Notifications
-- Personal IA Prod
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- =============================================
-- 1. USERS & AUTH
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('personal', 'student')),
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_cpf ON users(cpf);

-- =============================================
-- 2. PERSONALS
-- =============================================
CREATE TABLE personals (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cref VARCHAR(20) UNIQUE NOT NULL,
  cref_state VARCHAR(2) NOT NULL,
  cref_verified BOOLEAN DEFAULT false,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  public_url_slug VARCHAR(100) UNIQUE,

  -- Subscription
  subscription_plan VARCHAR(20) DEFAULT 'pro' CHECK (subscription_plan IN ('trial', 'pro', 'max')),
  subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,

  -- Payment accounts
  asaas_account_id VARCHAR(100) UNIQUE,
  asaas_wallet_id VARCHAR(100),
  stripe_account_id VARCHAR(100) UNIQUE,

  -- Terms
  accepted_terms_at TIMESTAMPTZ,
  accepted_fee_percentage DECIMAL(5,2) DEFAULT 3.50,

  -- Referral
  referral_code VARCHAR(20) UNIQUE NOT NULL,

  -- Stats (cached)
  total_students INT DEFAULT 0,
  active_students INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,

  -- Public profile
  is_public_profile BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_transformations BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personals_public_url ON personals(public_url_slug) WHERE is_public_profile = true;
CREATE INDEX idx_personals_referral ON personals(referral_code);
CREATE INDEX idx_personals_subscription_status ON personals(subscription_status);
CREATE INDEX idx_personals_cref ON personals(cref);

-- =============================================
-- 3. STUDENTS
-- =============================================
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,

  date_of_birth DATE,
  gender VARCHAR(20),
  height_cm DECIMAL(5,2),

  goals JSONB DEFAULT '[]'::jsonb,
  medical_restrictions TEXT,
  fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),

  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  invitation_token VARCHAR(100) UNIQUE,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'inactive', 'churned')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue', 'exempt')),
  last_payment_date DATE,
  next_payment_date DATE,

  total_workouts_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_badges INT DEFAULT 0,

  photo_sharing_consent BOOLEAN DEFAULT false,
  testimonial_consent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_personal ON students(personal_id);
CREATE INDEX idx_students_payment_status ON students(payment_status);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_invitation_token ON students(invitation_token);

-- =============================================
-- 4. WORKOUTS
-- =============================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  template_id TEXT, -- FK to D1 table (cross-db reference)

  name VARCHAR(255) NOT NULL,
  description TEXT,

  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'paused')),

  start_date DATE NOT NULL,
  end_date DATE,

  ai_generated BOOLEAN DEFAULT false,
  ai_model_used VARCHAR(100),
  ai_prompt_hash VARCHAR(64),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_student ON workouts(student_id);
CREATE INDEX idx_workouts_personal ON workouts(personal_id);
CREATE INDEX idx_workouts_status ON workouts(status);
CREATE INDEX idx_workouts_dates ON workouts(start_date, end_date);

-- =============================================
-- 5. WORKOUT EXERCISES
-- =============================================
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL, -- FK to D1 table (cross-db reference)

  sets INT NOT NULL,
  reps VARCHAR(50) NOT NULL,
  rest_seconds INT DEFAULT 60,
  load VARCHAR(50),

  order_index INT NOT NULL,

  notes TEXT,
  technique_tips TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON workout_exercises(workout_id, order_index);

-- =============================================
-- 6. WORKOUT LOGS
-- =============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  student_id UUID NOT NULL REFERENCES students(id),

  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INT,

  exercises_completed JSONB NOT NULL,

  student_notes TEXT,
  feeling VARCHAR(20) CHECK (feeling IN ('great', 'good', 'tired', 'pain')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_student ON workout_logs(student_id);
CREATE INDEX idx_workout_logs_completed ON workout_logs(completed_at DESC);
CREATE INDEX idx_workout_logs_workout ON workout_logs(workout_id);

-- =============================================
-- 7. ASSESSMENTS (Avaliações Físicas)
-- =============================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,

  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,

  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass_kg DECIMAL(5,2),
  bmi DECIMAL(5,2),

  measurements JSONB DEFAULT '{}'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB DEFAULT '{}'::jsonb,

  notes TEXT,

  pdf_generated BOOLEAN DEFAULT false,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_student ON assessments(student_id);
CREATE INDEX idx_assessments_personal ON assessments(personal_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date DESC);

-- =============================================
-- 8. BADGES & GAMIFICATION
-- =============================================
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_svg TEXT,

  earned_at TIMESTAMPTZ DEFAULT NOW(),

  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_badges_student ON student_badges(student_id);
CREATE INDEX idx_badges_earned ON student_badges(earned_at DESC);
CREATE INDEX idx_badges_type ON student_badges(badge_type);

-- =============================================
-- 9. PAYMENTS
-- =============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES personals(id),

  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,

  currency VARCHAR(3) DEFAULT 'BRL',

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),

  due_date DATE,
  paid_at TIMESTAMPTZ,

  asaas_payment_id VARCHAR(100) UNIQUE,
  stripe_payment_intent_id VARCHAR(100) UNIQUE,

  split_data JSONB DEFAULT '{}'::jsonb,

  description TEXT,
  invoice_url TEXT,
  receipt_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_recipient ON payments(recipient_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- =============================================
-- 10. AFFILIATES
-- =============================================
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID UNIQUE NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,

  total_referrals INT DEFAULT 0,
  active_referrals INT DEFAULT 0,
  churned_referrals INT DEFAULT 0,

  commission_tier VARCHAR(10) DEFAULT '25' CHECK (commission_tier IN ('25', '30', '35')),
  total_earned DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  withdrawn_total DECIMAL(10,2) DEFAULT 0,
  lifetime_earnings DECIMAL(10,2) DEFAULT 0,

  bonus_5_referrals_claimed BOOLEAN DEFAULT false,
  free_plan_active BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_personal ON affiliates(personal_id);
CREATE INDEX idx_affiliates_code ON affiliates(referral_code);

-- =============================================
-- 11. REFERRALS (Vínculo Vitalício)
-- =============================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_personal_id UUID UNIQUE NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  referred_cpf_hash VARCHAR(64) NOT NULL,

  referral_date TIMESTAMPTZ DEFAULT NOW(),
  first_payment_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'churned')),
  commission_percentage DECIMAL(5,2) NOT NULL,
  is_lifetime BOOLEAN DEFAULT true,

  total_payments INT DEFAULT 0,
  total_commission_earned DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_personal_id);
CREATE INDEX idx_referrals_cpf_hash ON referrals(referred_cpf_hash);

-- =============================================
-- 12. AFFILIATE COMMISSIONS
-- =============================================
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  referral_id UUID NOT NULL REFERENCES referrals(id),
  payment_id UUID NOT NULL REFERENCES payments(id),

  amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,

  asaas_split_transaction_id VARCHAR(100),
  stripe_transfer_id VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_commissions_created ON affiliate_commissions(created_at DESC);

-- =============================================
-- 13. REVIEWS & RATINGS
-- =============================================
CREATE TABLE personal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,

  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(personal_id, student_id)
);

CREATE INDEX idx_reviews_personal ON personal_reviews(personal_id);
CREATE INDEX idx_reviews_public ON personal_reviews(personal_id, is_public) WHERE is_public = true;

-- =============================================
-- 14. WORKOUT PLANS (Marketplace)
-- =============================================
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES personals(id),

  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  duration_weeks INT NOT NULL,
  workouts_per_week INT NOT NULL,

  price_brl DECIMAL(10,2) NOT NULL,

  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,

  plan_content JSONB NOT NULL,

  thumbnail_url TEXT,
  preview_video_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_creator ON workout_plans(created_by);
CREATE INDEX idx_workout_plans_published ON workout_plans(is_published, category);
CREATE INDEX idx_workout_plans_featured ON workout_plans(is_featured) WHERE is_featured = true;

-- =============================================
-- 15. PLAN PURCHASES
-- =============================================
CREATE TABLE plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES workout_plans(id),
  buyer_id UUID NOT NULL REFERENCES users(id),

  amount_paid DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL,
  platform_share DECIMAL(10,2) NOT NULL,

  payment_id UUID REFERENCES payments(id),

  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plan_purchases_plan ON plan_purchases(plan_id);
CREATE INDEX idx_plan_purchases_buyer ON plan_purchases(buyer_id);

-- =============================================
-- 16. NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  link TEXT,

  read_at TIMESTAMPTZ,
  sent_via TEXT[] DEFAULT ARRAY['push']::TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- 17. PERSONAL SETTINGS
-- =============================================
CREATE TABLE personal_settings (
  id UUID PRIMARY KEY REFERENCES personals(id) ON DELETE CASCADE,

  notifications_push BOOLEAN DEFAULT true,
  notifications_email BOOLEAN DEFAULT true,
  notifications_whatsapp BOOLEAN DEFAULT false,

  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#00D98E',

  business_hours JSONB DEFAULT '{}'::jsonb,

  theme VARCHAR(10) DEFAULT 'dark',
  language VARCHAR(5) DEFAULT 'pt-BR',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRIGGERS: updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON personals FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON personal_reviews FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON personal_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- COMMENTS (Documentação inline)
-- =============================================
COMMENT ON TABLE users IS 'Tabela central de usuários (personals e students)';
COMMENT ON TABLE personals IS 'Dados específicos de personal trainers, vinculados a users';
COMMENT ON TABLE students IS 'Alunos vinculados a um personal, com dados de progresso';
COMMENT ON TABLE workouts IS 'Treinos atribuídos a alunos por personals';
COMMENT ON TABLE workout_exercises IS 'Exercícios dentro de um treino, referencia exercises no D1';
COMMENT ON TABLE workout_logs IS 'Registro de treinos completados pelos alunos';
COMMENT ON TABLE assessments IS 'Avaliações físicas com medidas, fotos e análise IA';
COMMENT ON TABLE student_badges IS 'Badges de gamificação conquistadas pelos alunos';
COMMENT ON TABLE payments IS 'Pagamentos via Asaas/Stripe com split automático';
COMMENT ON TABLE affiliates IS 'Sistema de afiliados para personals indicarem outros';
COMMENT ON TABLE referrals IS 'Vínculo vitalício entre afiliado e referido';
COMMENT ON TABLE affiliate_commissions IS 'Comissões geradas por pagamentos de referidos';
COMMENT ON TABLE personal_reviews IS 'Avaliações de alunos sobre personals';
COMMENT ON TABLE workout_plans IS 'Marketplace de planos de treino para venda';
COMMENT ON TABLE plan_purchases IS 'Compras de planos no marketplace';
COMMENT ON TABLE notifications IS 'Notificações push, email e WhatsApp';
COMMENT ON TABLE personal_settings IS 'Configurações individuais do personal';
