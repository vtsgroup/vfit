-- ============================================
-- Migration: Add nutritionist user type + nutritionists table
-- Date: 2026-04-05
-- Description: Adds 'nutritionist' to users.user_type CHECK,
--              creates nutritionists table (parallel to personals),
--              creates patients table (parallel to students for nutri context),
--              creates meal_plans and nutrition_assessments tables
-- ============================================

-- 1. Expand user_type CHECK to include 'nutritionist'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('personal', 'student', 'nutritionist'));

-- 2. Create nutritionists table (mirrors personals structure)
CREATE TABLE IF NOT EXISTS nutritionists (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional registration (CRN = Conselho Regional de Nutricionistas)
  crn VARCHAR(20) UNIQUE NOT NULL,
  crn_state VARCHAR(2) NOT NULL,
  crn_verified BOOLEAN DEFAULT false,
  
  -- Profile
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  public_url_slug VARCHAR(100) UNIQUE,
  
  -- Subscription (same model as personals)
  subscription_plan VARCHAR(20) DEFAULT 'trial'
    CHECK (subscription_plan IN ('trial', 'pro', 'profissional', 'max')),
  subscription_status VARCHAR(20) DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
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
  total_patients INT DEFAULT 0,
  active_patients INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Public profile
  is_public_profile BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nutritionists
CREATE INDEX IF NOT EXISTS idx_nutritionists_slug
  ON nutritionists(public_url_slug) WHERE public_url_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nutritionists_plan
  ON nutritionists(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_nutritionists_referral
  ON nutritionists(referral_code);

-- 3. Create patients table (nutritionist's clients)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  
  -- Optional link to a users/students account (if patient also has an account)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Patient info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cpf VARCHAR(14),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'blocked', 'churned')),
  
  -- Health data
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  intolerances TEXT[] DEFAULT ARRAY[]::TEXT[],
  pathologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  medications TEXT,
  dietary_restrictions TEXT,
  objectives TEXT,
  
  -- Consultation
  consultation_type VARCHAR(30) DEFAULT 'presencial'
    CHECK (consultation_type IN ('presencial', 'online', 'hibrido')),
  consultation_price DECIMAL(10,2),
  
  -- Tracking
  invite_code VARCHAR(20) UNIQUE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_nutritionist
  ON patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_status
  ON patients(nutritionist_id, status);
CREATE INDEX IF NOT EXISTS idx_patients_user
  ON patients(user_id) WHERE user_id IS NOT NULL;

-- 4. Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Plan details
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  
  -- Macros target (daily)
  target_calories INT,
  target_protein_g DECIMAL(6,1),
  target_carbs_g DECIMAL(6,1),
  target_fat_g DECIMAL(6,1),
  target_fiber_g DECIMAL(6,1),
  target_water_ml INT,
  
  -- Metadata
  meals_per_day INT DEFAULT 5,
  notes TEXT,
  plan_data JSONB DEFAULT '{}'::jsonb,  -- Flexible structure for meal details
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist
  ON meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient
  ON meal_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status
  ON meal_plans(nutritionist_id, status);

-- 5. Create nutrition_assessments table
CREATE TABLE IF NOT EXISTS nutrition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Anthropometric
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,1),
  bmi DECIMAL(4,1),
  body_fat_percentage DECIMAL(4,1),
  lean_mass_kg DECIMAL(5,2),
  
  -- Circumferences (cm)
  waist_circumference DECIMAL(5,1),
  hip_circumference DECIMAL(5,1),
  arm_circumference DECIMAL(5,1),
  chest_circumference DECIMAL(5,1),
  thigh_circumference DECIMAL(5,1),
  calf_circumference DECIMAL(5,1),
  
  -- Waist-hip ratio
  waist_hip_ratio DECIMAL(4,2),
  
  -- Bioimpedance (BIA)
  bia_body_water_pct DECIMAL(4,1),
  bia_visceral_fat INT,
  bia_basal_metabolic_rate INT,
  
  -- Dietary recall
  dietary_recall TEXT,
  food_frequency JSONB DEFAULT '{}'::jsonb,
  
  -- Clinical
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  blood_glucose DECIMAL(5,1),
  
  -- Notes
  notes TEXT,
  recommendations TEXT,
  
  -- Photos
  photos JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_assessments_nutritionist
  ON nutrition_assessments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_assessments_patient
  ON nutrition_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_assessments_date
  ON nutrition_assessments(patient_id, assessment_date DESC);
