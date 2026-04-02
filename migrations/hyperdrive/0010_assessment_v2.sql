-- ============================================
-- MIGRATION 0010 — Assessment 2.0: Composição Corporal Completa
-- Personal IA — 20/02/2026
--
-- Adiciona campos calculados, protocolo, classificações,
-- dobras cutâneas, metabolismo e tabela de evolução.
-- ============================================

-- =============================================
-- 1. NOVOS CAMPOS NA TABELA ASSESSMENTS
-- =============================================

-- Protocolo utilizado
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  protocol TEXT DEFAULT 'pollock_7';

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  protocol_version TEXT DEFAULT 'v2';

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  density_formula TEXT DEFAULT 'siri';

-- Dobras cutâneas (JSONB para flexibilidade)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  skinfolds JSONB DEFAULT '{}'::jsonb;

-- Composição corporal calculada
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  body_density DECIMAL(8,7);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  fat_mass_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  lean_mass_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  lean_mass_percentage DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  muscle_mass_percentage DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  bone_mass_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  residual_mass_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  sum_of_skinfolds DECIMAL(6,2);

-- Classificações
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  bmi_classification TEXT;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  fat_classification TEXT;

-- RCQ
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  waist_hip_ratio DECIMAL(4,3);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  waist_hip_classification TEXT;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  waist_risk TEXT;

-- Peso e metabolismo
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  ideal_weight_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  weight_to_lose_kg DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  basal_metabolic_rate INTEGER;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  total_daily_expenditure INTEGER;

-- Somatotipo
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  somatotype TEXT;

-- Bioimpedância extras
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  water_percentage DECIMAL(5,2);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  visceral_fat_level INTEGER;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  metabolic_age INTEGER;

-- Interpretação e notificação
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  ai_interpretation TEXT;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  notified_at TIMESTAMPTZ;

-- Composição corporal completa (JSONB backup de todos os cálculos)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS
  body_composition JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- 2. TABELA DE EVOLUÇÃO (cache para performance)
-- =============================================

CREATE TABLE IF NOT EXISTS assessment_evolution (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  current_assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  previous_assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,

  -- Diffs principais
  weight_diff DECIMAL(5,2),
  fat_percentage_diff DECIMAL(5,2),
  fat_mass_diff DECIMAL(5,2),
  lean_mass_diff DECIMAL(5,2),
  muscle_mass_diff DECIMAL(5,2),
  bmi_diff DECIMAL(5,2),
  waist_diff DECIMAL(5,2),

  -- Score geral (0-100)
  overall_score INTEGER DEFAULT 50,

  -- Todos os diffs detalhados
  diffs JSONB DEFAULT '[]'::jsonb,

  -- Perímetros
  perimeter_diffs JSONB DEFAULT '[]'::jsonb,

  days_between INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolution_student ON assessment_evolution(student_id);
CREATE INDEX IF NOT EXISTS idx_evolution_current ON assessment_evolution(current_assessment_id);

-- =============================================
-- 3. ÍNDICE PARA BUSCA DE PROTOCOLO
-- =============================================

CREATE INDEX IF NOT EXISTS idx_assessments_protocol ON assessments(protocol);

-- =============================================
-- DONE
-- =============================================
