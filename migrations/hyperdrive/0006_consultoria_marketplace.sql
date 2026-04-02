-- ============================================
-- Migration 0006: Consultoria + Marketplace Aprimorado
-- Personal IA — 16/02/2026
-- ============================================

-- ============================================
-- 1. STUDENTS — Suporte a Consultoria
-- ============================================

-- Tipo de relação: personal_training (padrão) ou consultoria
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_type VARCHAR(30) DEFAULT 'personal_training'
  CHECK (student_type IN ('personal_training', 'consultoria'));

-- Precificação da consultoria
ALTER TABLE students ADD COLUMN IF NOT EXISTS consultation_price DECIMAL(10,2);
ALTER TABLE students ADD COLUMN IF NOT EXISTS consultation_billing_cycle VARCHAR(20) DEFAULT 'MONTHLY'
  CHECK (consultation_billing_cycle IN ('MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY'));

-- Notas do personal sobre o aluno de consultoria (plano, observações)
ALTER TABLE students ADD COLUMN IF NOT EXISTS consultation_notes TEXT;

-- ============================================
-- 2. WORKOUTS — Template/Marketplace (student_id nullable)
-- ============================================

-- Permitir treinos sem aluno (templates para marketplace)
ALTER TABLE workouts ALTER COLUMN student_id DROP NOT NULL;

-- Flag para identificar treinos-modelo (marketplace)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- ============================================
-- 3. WORKOUT_PLANS — Melhorias Marketplace
-- ============================================

-- Vincular planos do marketplace a treinos reais (template workouts)
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS source_workout_ids JSONB DEFAULT '[]';

-- Tags para busca e categorização
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Quantidade de exercícios total (cache para listagem)
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS total_exercises INT DEFAULT 0;

-- ============================================
-- 4. PLAN_PURCHASES — Rastreio de entrega
-- ============================================

-- Status da compra (pending = aguardando pagamento, completed, refunded)
ALTER TABLE plan_purchases ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed'
  CHECK (status IN ('pending', 'completed', 'refunded'));

-- ID do pagamento Asaas (quando integrado)
ALTER TABLE plan_purchases ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(100);

-- Treinos clonados para o comprador
ALTER TABLE plan_purchases ADD COLUMN IF NOT EXISTS cloned_workout_ids JSONB DEFAULT '[]';

-- Se os treinos já foram entregues (clonados)
ALTER TABLE plan_purchases ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT false;

-- ============================================
-- 5. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_student_type ON students(student_type);
CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON workouts(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_workouts_student_id_nullable ON workouts(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plan_purchases_buyer_id ON plan_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_plan_purchases_status ON plan_purchases(status);
