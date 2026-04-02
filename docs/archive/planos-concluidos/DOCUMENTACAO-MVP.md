# DOCUMENTAÇÃO MVP - VFIT Prod

> Documento principal de documentação do projeto.

# 📘 VFIT - DOCUMENTAÇÃO TÉCNICA COMPLETA v3.0
## Arquitetura 100% Cloudflare + Replicate AI

**Data:** 06/02/2026  
**Versão Inicial:** 1.0.0  
**Stack:** Cloudflare Workers + Pages + D1 + R2 + Hyperdrive

***

## 🏗️ ARQUITETURA CLOUDFLARE COMPLETA

### Stack Tecnológica Final

```yaml
FRONTEND:
  Framework: Next.js 15 (Static Export)
  Deploy: Cloudflare Pages
  UI: TailwindCSS + Shadcn/ui + Framer Motion
  State: Zustand + TanStack Query
  PWA: next-pwa + Workbox
  
BACKEND:
  Runtime: Cloudflare Workers (V8 isolates)
  Router: Hono.js (ultra-rápido para Workers)
  Validation: Zod
  
DATABASES:
  Hot Data: Hyperdrive + PostgreSQL (Neon/Supabase)
    - Users, payments, workouts, assessments
  Cold Data: D1 (SQLite)
    - Exercise library, templates, muscle groups
  Cache: Cloudflare KV
    - Sessions, rate limiting, referral cookies
  Queue: Cloudflare Queues
    - Email sending, video encoding, webhooks
    
STORAGE:
  Videos/Images: Cloudflare R2
  CDN: Cloudflare CDN (automatic)
  
AI:
  Provider: Replicate API
  Models:
    - Gemini 2.5 Flash (tarefas básicas/baratas)
    - Llama 3.1 70B (criação de treinos complexos)
    - CLIP (análise de evolução em fotos)
    - Whisper (transcrição de vídeos)
    
INTEGRATIONS:
  Payments: Asaas API (primary) + Stripe (secondary)
  Push Notifications: OneSignal
  Auth: Cloudflare Access + OAuth
  Analytics: Cloudflare Analytics Engine
  Security: Cloudflare Turnstile (captcha)
  Marketing: Cloudflare Zaraz (tag manager)
  Performance: Argo Smart Routing
  
DEPLOYMENT:
  CLI: Wrangler
  Command: npm run cf:deploy
  Auto-versioning: 1.0.0 → 1.0.1 → ... → 10.0.0
  CI/CD: GitHub Actions + Wrangler
```

***

## 🤖 ESTRATÉGIA DE IA - REPLICATE

### Mapeamento de Modelos por Funcionalidade

```javascript
// config/ai-models.ts

export const AI_MODELS = {
  
  // 1. CRIAÇÃO DE TREINOS (Complexidade variada)
  workout_basic: {
    model: "google-gemini/gemini-2.5-flash",
    use_case: "Treinos simples, repetitivos, iniciantes",
    cost: "$0.10 / 1M tokens",
    max_tokens: 2048,
    examples: [
      "Criar treino ABC para hipertrofia, 3x/semana",
      "Sugerir exercícios para glúteos, iniciante"
    ]
  },
  
  workout_advanced: {
    model: "meta/llama-3.1-70b-instruct",
    use_case: "Treinos personalizados, análise de histórico, progressão",
    cost: "$0.65 / 1M tokens",
    max_tokens: 4096,
    examples: [
      "Analisar 3 meses de treinos do aluno e sugerir periodização",
      "Criar programa de 12 semanas para atleta avançado"
    ]
  },
  
  // 2. ANÁLISE DE FOTOS DE AVALIAÇÃO
  photo_analysis: {
    model: "openai/clip-vit-large-patch14",
    use_case: "Comparar fotos antes/depois, detectar mudanças corporais",
    cost: "$0.001 / imagem",
    output: "Similarity score + descrição textual",
    examples: [
      "Comparar 2 fotos e calcular % de mudança visual",
      "Detectar grupos musculares mais desenvolvidos"
    ]
  },
  
  // 3. ASSISTENTE GERAL (Chat/Sugestões)
  assistant: {
    model: "google-gemini/gemini-2.5-flash",
    use_case: "Responder dúvidas, sugerir ações, onboarding",
    cost: "$0.10 / 1M tokens",
    max_tokens: 1024,
    examples: [
      "Qual aluno devo cobrar primeiro?",
      "Como criar uma avaliação física?",
      "3 alunos não treinam há 7 dias, enviar lembrete?"
    ]
  },
  
  // 4. TRANSCRIÇÃO DE VÍDEOS
  video_transcription: {
    model: "openai/whisper-large-v3",
    use_case: "Legendas automáticas, acessibilidade",
    cost: "$0.006 / minuto",
    languages: ["pt", "en", "es"],
    output: "SRT file"
  },
  
  // 5. GERAÇÃO DE CONTEÚDO MARKETING
  content_generation: {
    model: "google-gemini/gemini-2.5-flash",
    use_case: "Posts Instagram, emails de cobrança, materiais afiliados",
    cost: "$0.10 / 1M tokens",
    examples: [
      "Criar post Instagram sobre o programa do personal",
      "Escrever email de cobrança amigável",
      "Gerar copy para material de afiliado"
    ]
  },
  
  // 6. ANÁLISE DE SENTIMENTO (Feedback de alunos)
  sentiment_analysis: {
    model: "google-gemini/gemini-2.5-flash",
    use_case: "Analisar feedbacks, detectar alunos insatisfeitos",
    cost: "$0.10 / 1M tokens",
    output: "Score 0-1 + resumo"
  }
}

// Lógica de seleção automática
export function selectModel(task: string, complexity: 'low' | 'medium' | 'high') {
  const modelMap = {
    workout: complexity === 'high' ? 'workout_advanced' : 'workout_basic',
    photo: 'photo_analysis',
    chat: 'assistant',
    transcription: 'video_transcription',
    content: 'content_generation',
    sentiment: 'sentiment_analysis'
  }
  return AI_MODELS[modelMap[task]]
}
```

### Exemplos de Prompts Otimizados

```typescript
// lib/ai-prompts.ts

export const PROMPTS = {
  
  create_workout: (aluno: Student, objetivo: string) => `
Você é um personal trainer experiente com CREF ativo.

ALUNO:
- Nome: ${aluno.name}
- Idade: ${aluno.age} anos
- Nível: ${aluno.level}
- Objetivo: ${objetivo}
- Restrições: ${aluno.medical_restrictions || 'Nenhuma'}
- Histórico: ${aluno.workout_history_summary}

TAREFA:
Crie um treino de musculação para 3x/semana (A, B, C).

FORMATO DE SAÍDA (JSON):
{
  "treino_a": [
    {
      "exercicio": "Supino reto com barra",
      "series": 4,
      "reps": "8-12",
      "descanso_segundos": 90,
      "observacoes": "Foco na contração do peitoral"
    }
  ],
  "treino_b": [...],
  "treino_c": [...]
}

Seja específico e progressivo. Retorne APENAS o JSON, sem explicações.
`,

  analyze_photos: (beforeUrl: string, afterUrl: string) => `
Analise estas duas fotos de avaliação física:
- Foto ANTES: ${beforeUrl}
- Foto DEPOIS: ${afterUrl}

Calcule:
1. Percentual de mudança visual (0-100%)
2. Grupos musculares mais desenvolvidos
3. Sugestões de foco para próximo ciclo

Formato JSON:
{
  "mudanca_percentual": 25,
  "musculos_desenvolvidos": ["peitoral", "ombros"],
  "areas_a_melhorar": ["pernas", "costas"],
  "resumo": "Ótima evolução na parte superior..."
}
`,

  smart_billing_suggestion: (alunos: Student[]) => `
Você é um assistente financeiro de personal trainer.

ALUNOS COM PAGAMENTO PENDENTE:
${alunos.map(a => `- ${a.name}: R$ ${a.pending_amount}, vence em ${a.days_until_due} dias, última atividade: ${a.last_activity}`).join('\n')}

TAREFA:
Sugira em qual ordem cobrar, considerando:
- Urgência (dias até vencer)
- Valor pendente
- Histórico de pagamento
- Engajamento recente

Formato JSON:
{
  "ordem_cobranca": [
    {
      "aluno_id": "uuid",
      "prioridade": 1,
      "motivo": "Pagamento vence amanhã e valor alto",
      "melhor_horario": "14:00-16:00",
      "tom_sugerido": "amigável_urgente"
    }
  ]
}
`
}
```

***

## 🗄️ ARQUITETURA DE BANCO DE DADOS

### Estratégia D1 + Hyperdrive

```sql
-- ============================================
-- HYPERDRIVE (PostgreSQL) - HOT DATA
-- Dados transacionais, write-heavy
-- ============================================

-- Connection string via Hyperdrive:
-- DATABASE_URL=$NEON_DATABASE_URL

-- USERS & AUTH
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL, -- Encrypted at app level
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('personal', 'student')),
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_cpf_key UNIQUE (cpf)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- PERSONALS
CREATE TABLE personals (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cref VARCHAR(20) UNIQUE NOT NULL, -- OBRIGATÓRIO: 123456-G/SP
  cref_state VARCHAR(2) NOT NULL,
  cref_verified BOOLEAN DEFAULT false,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['musculacao', 'funcional', 'emagrecimento']
  bio TEXT,
  public_url_slug VARCHAR(100) UNIQUE, -- /emerson-xavier
  
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
  accepted_fee_percentage DECIMAL(5,2) DEFAULT 3.50, -- 3.5% platform fee
  
  -- Referral
  referral_code VARCHAR(20) UNIQUE NOT NULL, -- AUTO_GENERATED
  
  -- Stats (cached)
  total_students INT DEFAULT 0,
  active_students INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Public profile settings
  is_public_profile BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_transformations BOOLEAN DEFAULT false, -- Requires student consent
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personals_public_url ON personals(public_url_slug) WHERE is_public_profile = true;
CREATE INDEX idx_personals_referral ON personals(referral_code);
CREATE INDEX idx_personals_subscription_status ON personals(subscription_status);

-- STUDENTS
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  
  -- Personal data
  date_of_birth DATE,
  gender VARCHAR(20),
  height_cm DECIMAL(5,2),
  
  -- Goals & restrictions
  goals JSONB DEFAULT '[]'::jsonb, -- ['emagrecimento', 'hipertrofia']
  medical_restrictions TEXT,
  fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Invitation
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  invitation_token VARCHAR(100) UNIQUE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'inactive', 'churned')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue', 'exempt')),
  last_payment_date DATE,
  next_payment_date DATE,
  
  -- Gamification
  total_workouts_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_badges INT DEFAULT 0,
  
  -- Consent
  photo_sharing_consent BOOLEAN DEFAULT false,
  testimonial_consent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_personal ON students(personal_id);
CREATE INDEX idx_students_payment_status ON students(payment_status);
CREATE INDEX idx_students_status ON students(status);

-- AFFILIATE SYSTEM
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID UNIQUE NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Stats
  total_referrals INT DEFAULT 0,
  active_referrals INT DEFAULT 0,
  churned_referrals INT DEFAULT 0,
  
  -- Commissions
  commission_tier VARCHAR(10) DEFAULT '25' CHECK (commission_tier IN ('25', '30', '35')),
  total_earned DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  withdrawn_total DECIMAL(10,2) DEFAULT 0,
  lifetime_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Bonuses
  bonus_5_referrals_claimed BOOLEAN DEFAULT false,
  free_plan_active BOOLEAN DEFAULT false, -- 3+ active referrals
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_personal ON affiliates(personal_id);
CREATE INDEX idx_affiliates_code ON affiliates(referral_code);

-- REFERRALS (Vínculo Vitalício)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_personal_id UUID UNIQUE NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  referred_cpf_hash VARCHAR(64) NOT NULL, -- SHA-256 do CPF
  
  referral_date TIMESTAMPTZ DEFAULT NOW(),
  first_payment_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'churned')),
  commission_percentage DECIMAL(5,2) NOT NULL,
  is_lifetime BOOLEAN DEFAULT true,
  
  -- Stats
  total_payments INT DEFAULT 0,
  total_commission_earned DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_personal_id);
CREATE INDEX idx_referrals_cpf_hash ON referrals(referred_cpf_hash);

-- AFFILIATE COMMISSIONS
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  referral_id UUID NOT NULL REFERENCES referrals(id),
  payment_id UUID NOT NULL, -- FK to payments table
  
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

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES personals(id),
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0, -- For affiliate
  platform_fee DECIMAL(10,2) NOT NULL, -- Our cut (3.5%)
  net_amount DECIMAL(10,2) NOT NULL, -- What personal receives
  
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  
  -- Dates
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  -- External IDs
  asaas_payment_id VARCHAR(100) UNIQUE,
  stripe_payment_intent_id VARCHAR(100) UNIQUE,
  
  -- Split data
  split_data JSONB DEFAULT '{}'::jsonb, -- Full split breakdown
  
  -- Metadata
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

-- WORKOUTS
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  template_id UUID, -- FK to D1 table
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'paused')),
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- AI generated
  ai_generated BOOLEAN DEFAULT false,
  ai_model_used VARCHAR(100),
  ai_prompt_hash VARCHAR(64), -- To avoid regenerating same workout
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_student ON workouts(student_id);
CREATE INDEX idx_workouts_personal ON workouts(personal_id);
CREATE INDEX idx_workouts_status ON workouts(status);
CREATE INDEX idx_workouts_dates ON workouts(start_date, end_date);

-- WORKOUT EXERCISES
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL, -- FK to D1 table
  
  sets INT NOT NULL,
  reps VARCHAR(50) NOT NULL, -- "12-15" or "até falha" or "30s"
  rest_seconds INT DEFAULT 60,
  load VARCHAR(50), -- "20kg" or "bodyweight" or "band-red"
  
  order_index INT NOT NULL,
  
  notes TEXT,
  technique_tips TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON workout_exercises(workout_id, order_index);

-- WORKOUT LOGS (Completed workouts)
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  student_id UUID NOT NULL REFERENCES students(id),
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INT,
  
  exercises_completed JSONB NOT NULL, -- Array of completed exercises with actual loads/reps
  
  student_notes TEXT,
  feeling VARCHAR(20), -- 'great', 'good', 'tired', 'pain'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_student ON workout_logs(student_id);
CREATE INDEX idx_workout_logs_completed ON workout_logs(completed_at DESC);

-- ASSESSMENTS (Avaliações Físicas)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Measurements
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass_kg DECIMAL(5,2),
  bmi DECIMAL(5,2), -- Calculated
  
  -- Body measurements (cm)
  measurements JSONB DEFAULT '{}'::jsonb, -- {chest: 100, waist: 80, ...}
  
  -- Photos
  photos JSONB DEFAULT '[]'::jsonb, -- [{type: 'front', url: '...', order: 1}]
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}'::jsonb, -- Results from CLIP model
  
  notes TEXT,
  
  -- PDF Report
  pdf_generated BOOLEAN DEFAULT false,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_student ON assessments(student_id);
CREATE INDEX idx_assessments_personal ON assessments(personal_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date DESC);

-- BADGES & GAMIFICATION
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'streak_30', 'first_workout', 'weight_goal', etc
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_svg TEXT,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'::jsonb -- Additional data like goal achieved
);

CREATE INDEX idx_badges_student ON student_badges(student_id);
CREATE INDEX idx_badges_earned ON student_badges(earned_at DESC);

-- REVIEWS & RATINGS
CREATE TABLE personal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id UUID NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  
  is_public BOOLEAN DEFAULT false, -- Personal can choose to make public
  is_featured BOOLEAN DEFAULT false, -- Highlight on public profile
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(personal_id, student_id) -- One review per student
);

CREATE INDEX idx_reviews_personal ON personal_reviews(personal_id);
CREATE INDEX idx_reviews_public ON personal_reviews(personal_id, is_public) WHERE is_public = true;

-- WORKOUT PLANS (Marketplace)
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES personals(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hipertrofia', 'emagrecimento', 'funcional'
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  duration_weeks INT NOT NULL,
  workouts_per_week INT NOT NULL,
  
  price_brl DECIMAL(10,2) NOT NULL,
  
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Sales
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Content (JSON structure of workouts)
  plan_content JSONB NOT NULL,
  
  -- Preview
  thumbnail_url TEXT,
  preview_video_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_creator ON workout_plans(created_by);
CREATE INDEX idx_workout_plans_published ON workout_plans(is_published, category);
CREATE INDEX idx_workout_plans_featured ON workout_plans(is_featured) WHERE is_featured = true;

-- PLAN PURCHASES
CREATE TABLE plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES workout_plans(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  
  amount_paid DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL, -- 70%
  platform_share DECIMAL(10,2) NOT NULL, -- 30%
  
  payment_id UUID REFERENCES payments(id),
  
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plan_purchases_plan ON plan_purchases(plan_id);
CREATE INDEX idx_plan_purchases_buyer ON plan_purchases(buyer_id);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'payment', 'workout', 'assessment', 'badge', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  link TEXT,
  
  read_at TIMESTAMPTZ,
  sent_via TEXT[] DEFAULT ARRAY['push']::TEXT[], -- ['push', 'email', 'whatsapp']
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- PERSONAL SETTINGS
CREATE TABLE personal_settings (
  id UUID PRIMARY KEY REFERENCES personals(id) ON DELETE CASCADE,
  
  -- Notifications
  notifications_push BOOLEAN DEFAULT true,
  notifications_email BOOLEAN DEFAULT true,
  notifications_whatsapp BOOLEAN DEFAULT false,
  
  -- Branding
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#00D98E',
  
  -- Business hours (for scheduling suggestions)
  business_hours JSONB DEFAULT '{}'::jsonb,
  
  -- Preferences
  theme VARCHAR(10) DEFAULT 'dark',
  language VARCHAR(5) DEFAULT 'pt-BR',
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- D1 (SQLite) - COLD DATA
-- Read-heavy, rarely changes
-- ============================================

-- MUSCLE GROUPS
CREATE TABLE muscle_groups (
  id TEXT PRIMARY KEY, -- 'chest', 'back', 'legs'
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  icon_svg TEXT NOT NULL,
  description TEXT,
  display_order INTEGER
);

-- EXERCISES (Library)
CREATE TABLE exercises (
  id TEXT PRIMARY KEY, -- UUID as text
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  muscle_group_id TEXT NOT NULL,
  
  description TEXT,
  description_pt TEXT,
  
  -- Videos (R2 URLs)
  video_url_vertical TEXT, -- 9:16 for mobile
  video_url_horizontal TEXT, -- 16:9 for desktop
  thumbnail_url TEXT,
  
  -- Transcription
  transcription_pt TEXT,
  transcription_en TEXT,
  
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment_needed TEXT, -- JSON array as text
  
  is_default INTEGER DEFAULT 1, -- 1 = default library, 0 = personal-created
  created_by TEXT, -- UUID of personal (if custom)
  
  view_count INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_default ON exercises(is_default);

-- WORKOUT TEMPLATES
CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description TEXT,
  
  category TEXT NOT NULL, -- 'hipertrofia', 'emagrecimento', etc
  difficulty TEXT,
  
  template_data TEXT NOT NULL, -- JSON structure
  
  is_default INTEGER DEFAULT 1,
  created_by TEXT, -- UUID of personal
  
  usage_count INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_category ON workout_templates(category);
CREATE INDEX idx_templates_default ON workout_templates(is_default);

-- SERIES TYPES
CREATE TABLE series_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon_svg TEXT
);

INSERT INTO series_types VALUES
('bi-set', 'Bi-Set', 'Bi-Set', 'Two exercises back-to-back without rest', NULL),
('tri-set', 'Tri-Set', 'Tri-Set', 'Three exercises back-to-back', NULL),
('drop-set', 'Drop Set', 'Drop Set', 'Reduce weight and continue', NULL),
('super-set', 'Super Set', 'Super Set', 'Antagonist muscles', NULL),
('circuit', 'Circuit', 'Circuito', 'Multiple exercises in rotation', NULL),
('rest-pause', 'Rest-Pause', 'Rest-Pause', 'Short breaks during set', NULL),
('progressive', 'Progressive', 'Progressivo', 'Increase weight each set', NULL);
```

***

## ⚙️ CLOUDFLARE WORKERS ARCHITECTURE

### Estrutura de Workers

```
/workers
├── api/
│   ├── auth.ts              # Login, register, OAuth
│   ├── users.ts             # User CRUD
│   ├── workouts.ts          # Workout management
│   ├── assessments.ts       # Physical assessments
│   ├── payments.ts          # Asaas/Stripe integration
│   ├── affiliates.ts        # Referral system
│   ├── ai.ts                # Replicate AI calls
│   ├── uploads.ts           # R2 presigned URLs
│   └── webhooks.ts          # Asaas/Stripe webhooks
│
├── cron/
│   ├── daily-reminders.ts   # Send workout reminders
│   ├── payment-checks.ts    # Check overdue payments
│   ├── affiliate-calc.ts    # Calculate commissions
│   └── cache-warm.ts        # Pre-warm popular data
│
├── queues/
│   ├── email-queue.ts       # Send emails
│   ├── video-encode.ts      # Encode uploaded videos
│   ├── pdf-generate.ts      # Generate assessment PDFs
│   └── ai-batch.ts          # Batch AI requests
│
└── middleware/
    ├── auth.ts              # JWT validation
    ├── rate-limit.ts        # Rate limiting via KV
    ├── cors.ts              # CORS headers
    └── analytics.ts         # CF Analytics Engine
```

### Worker Principal (Hono Router)

```typescript
// workers/index.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { rateLimiter } from './middleware/rate-limit'
import { analyticsMiddleware } from './middleware/analytics'

// Routes
import authRouter from './api/auth'
import workoutsRouter from './api/workouts'
import paymentsRouter from './api/payments'
import aiRouter from './api/ai'

type Bindings = {
  // D1
  DB: D1Database
  
  // Hyperdrive
  HYPERDRIVE: Hyperdrive
  
  // KV
  KV_CACHE: KVNamespace
  KV_SESSIONS: KVNamespace
  KV_RATE_LIMIT: KVNamespace
  
  // R2
  R2_VIDEOS: R2Bucket
  R2_IMAGES: R2Bucket
  
  // Queues
  EMAIL_QUEUE: Queue
  VIDEO_ENCODE_QUEUE: Queue
  PDF_QUEUE: Queue
  
  // Secrets
  JWT_SECRET: string
  ASAAS_API_KEY: string
  STRIPE_SECRET_KEY: string
  REPLICATE_API_TOKEN: string
  ONESIGNAL_APP_ID: string
  ONESIGNAL_REST_KEY: string
  
  // Analytics
  ANALYTICS: AnalyticsEngineDataset
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', cors({
  origin: ['https://iapersonal.app.br', 'https://dev.iapersonal.app.br'],
  credentials: true
}))

app.use('*', analyticsMiddleware)

// Public routes
app.route('/auth', authRouter)
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// Protected routes (require JWT)
app.use('/api/*', jwt({ secret: (c) => c.env.JWT_SECRET }))
app.use('/api/*', rateLimiter)

app.route('/api/workouts', workoutsRouter)
app.route('/api/payments', paymentsRouter)
app.route('/api/ai', aiRouter)

// Webhooks (special auth)
app.route('/webhooks', webhooksRouter)

// 404
app.notFound((c) => c.json({ error: 'Route not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error(err)
  c.env.ANALYTICS.writeDataPoint({
    blobs: ['error', err.message],
    doubles:  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/40283263/03f8b62b-c754-453f-9d34-c5e49b887c5d/image.jpg),
    indexes: [c.req.path]
  })
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
```

### Exemplo: Worker de IA

```typescript
// workers/api/ai.ts

import { Hono } from 'hono'
import Replicate from 'replicate'
import { selectModel, PROMPTS } from '../../lib/ai-config'

const ai = new Hono()

// POST /api/ai/workout/generate
ai.post('/workout/generate', async (c) => {
  const { student_id, goal, complexity } = await c.req.json()
  
  // Get student data from Hyperdrive
  const db = c.env.HYPERDRIVE
  const student = await db.prepare(
    'SELECT * FROM students WHERE id = ?'
  ).bind(student_id).first()
  
  if (!student) {
    return c.json({ error: 'Student not found' }, 404)
  }
  
  // Select appropriate AI model
  const model = selectModel('workout', complexity)
  
  // Call Replicate
  const replicate = new Replicate({
    auth: c.env.REPLICATE_API_TOKEN
  })
  
  const prompt = PROMPTS.create_workout(student, goal)
  
  const output = await replicate.run(model.model, {
    input: {
      prompt,
      max_tokens: model.max_tokens,
      temperature: 0.7
    }
  })
  
  // Parse JSON response
  const workout = JSON.parse(output)
  
  // Save to database
  const workoutId = crypto.randomUUID()
  await db.prepare(`
    INSERT INTO workouts (id, student_id, personal_id, name, ai_generated, ai_model_used)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    workoutId,
    student_id,
    student.personal_id,
    workout.name,
    true,
    model.model
  ).run()
  
  // Track usage in Analytics Engine
  c.env.ANALYTICS.writeDataPoint({
    blobs: ['ai_workout_generated', model.model],
    doubles:  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/40283263/03f8b62b-c754-453f-9d34-c5e49b887c5d/image.jpg),
    indexes: [student.personal_id]
  })
  
  return c.json({ workout_id: workoutId, workout })
})

// POST /api/ai/photos/compare
ai.post('/photos/compare', async (c) => {
  const { before_url, after_url, assessment_id } = await c.req.json()
  
  const replicate = new Replicate({ auth: c.env.REPLICATE_API_TOKEN })
  
  // Use CLIP model for image comparison
  const model = 'openai/clip-vit-large-patch14'
  
  const output = await replicate.run(model, {
    input: {
      image_1: before_url,
      image_2: after_url,
      mode: 'similarity'
    }
  })
  
  const similarity = output.similarity_score
  const changePercentage = Math.round((1 - similarity) * 100)
  
  // Update assessment with AI analysis
  await c.env.HYPERDRIVE.prepare(`
    UPDATE assessments 
    SET ai_analysis = json_set(ai_analysis, '$.similarity', ?, '$.change_pct', ?)
    WHERE id = ?
  `).bind(similarity, changePercentage, assessment_id).run()
  
  return c.json({
    similarity_score: similarity,
    change_percentage: changePercentage,
    interpretation: changePercentage > 20 ? 'Ótima evolução!' : 'Continue firme!'
  })
})

// POST /api/ai/assistant
ai.post('/assistant', async (c) => {
  const { personal_id, question } = await c.req.json()
  
  // Get context from database
  const students = await c.env.HYPERDRIVE.prepare(`
    SELECT * FROM students 
    WHERE personal_id = ? AND payment_status = 'overdue'
  `).bind(personal_id).all()
  
  const replicate = new Replicate({ auth: c.env.REPLICATE_API_TOKEN })
  
  const prompt = PROMPTS.smart_billing_suggestion(students.results)
  
  const output = await replicate.run('google-gemini/gemini-2.5-flash', {
    input: { prompt, max_tokens: 1024 }
  })
  
  return c.json({ answer: output })
})

export default ai
```

***

## 🚀 DEPLOYMENT & VERSIONAMENTO

### wrangler.toml

```toml
name = "vfiti-api"
main = "workers/index.ts"
compatibility_date = "2026-02-06"
node_compat = true

# Workers AI (future)
# ai = { binding = "AI" }

# Analytics Engine
analytics_engine_datasets = [
  { binding = "ANALYTICS" }
]

# D1 Database (Cold Data)
[[d1_databases]]
binding = "DB"
database_name = "vfiti-exercises"
database_id = "xxx-xxx-xxx"

# Hyperdrive (Hot Data - PostgreSQL)
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "xxx-xxx-xxx"

# KV Namespaces
[[kv_namespaces]]
binding = "KV_CACHE"
id = "xxx-xxx-xxx"

[[kv_namespaces]]
binding = "KV_SESSIONS"
id = "xxx-xxx-xxx"

[[kv_namespaces]]
binding = "KV_RATE_LIMIT"
id = "xxx-xxx-xxx"

# R2 Buckets
[[r2_buckets]]
binding = "R2_VIDEOS"
bucket_name = "personal-ia-videos"

[[r2_buckets]]
binding = "R2_IMAGES"
bucket_name = "personal-ia-images"

# Queues
[[queues.producers]]
binding = "EMAIL_QUEUE"
queue = "email-sender"

[[queues.producers]]
binding = "VIDEO_ENCODE_QUEUE"
queue = "video-encoder"

[[queues.producers]]
binding = "PDF_QUEUE"
queue = "pdf-generator"

# Secrets (set via: wrangler secret put SECRET_NAME)
# - JWT_SECRET
# - ASAAS_API_KEY
# - STRIPE_SECRET_KEY
# - REPLICATE_API_TOKEN
# - ONESIGNAL_APP_ID
# - ONESIGNAL_REST_KEY

# Cron Triggers
[triggers]
crons = [
  "0 8 * * *",  # Daily reminders at 8 AM
  "0 */4 * * *" # Payment checks every 4 hours
]

# Limits
[limits]
cpu_ms = 50  # 50ms CPU time per request

# Routes (custom domain)
routes = [
  { pattern = "api.iapersonal.app.br/*", zone_name = "iapersonal.app.br" }
]
```

### package.json Scripts

```json
{
  "name": "vfiti",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    
    "wrangler:dev": "wrangler dev",
    "wrangler:deploy": "wrangler deploy",
    
    "version:patch": "npm version patch --no-git-tag-version && node scripts/update-version.js",
    "version:minor": "npm version minor --no-git-tag-version && node scripts/update-version.js",
    "version:major": "npm version major --no-git-tag-version && node scripts/update-version.js",
    
    "cf:deploy": "npm run version:patch && npm run build && npm run export && npm run wrangler:deploy && node scripts/deploy-pages.js",
    
    "db:migrate:hyperdrive": "node scripts/migrate-hyperdrive.js",
    "db:migrate:d1": "wrangler d1 migrations apply vfiti-exercises",
    "db:seed": "node scripts/seed-database.js"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "hono": "^4.0.0",
    "replicate": "^0.25.0",
    "@neondatabase/serverless": "^0.9.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "wrangler": "^3.75.0",
    "@cloudflare/workers-types": "^4.20240106.0"
  }
}
```

### Auto-versioning Script

```javascript
// scripts/update-version.js

const fs = require('fs')
const path = require('path')

const pkg = require('../package.json')
const version = pkg.version

console.log(`📦 New version: ${version}`)

// Update manifest.json for PWA
const manifestPath = path.join(__dirname, '../public/manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
manifest.version = version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

// Update version.ts
const versionFile = `// Auto-generated - do not edit
export const APP_VERSION = '${version}'
export const BUILD_DATE = '${new Date().toISOString()}'
export const BUILD_NUMBER = ${Date.now()}
`
fs.writeFileSync(
  path.join(__dirname, '../lib/version.ts'),
  versionFile
)

console.log('✅ Version files updated')
```

### Deploy to Cloudflare Pages Script

```javascript
// scripts/deploy-pages.js

const { execSync } = require('child_process')
const pkg = require('../package.json')

console.log(`🚀 Deploying v${pkg.version} to Cloudflare Pages...`)

try {
  // Deploy to Pages
  execSync('npx wrangler pages deploy out --project-name=vfiti', {
    stdio: 'inherit'
  })
  
  console.log(`✅ Deployed successfully!`)
  console.log(`🔗 https://vfiti.pages.dev`)
  console.log(`🔗 https://iapersonal.app.br`)
  
} catch (error) {
  console.error('❌ Deploy failed:', error.message)
  process.exit(1)
}
```

***

## 🎯 FUNCIONALIDADES PRINCIPAIS DETALHADAS

### 1. **Portfolio Público do Personal**

```typescript
// app/[personal_slug]/page.tsx

export default async function PersonalPublicProfile({ params }) {
  const { personal_slug } = params
  
  // Fetch from D1 cache first, fallback to Hyperdrive
  const personal = await fetch(`/api/personals/${personal_slug}`)
  
  return (
    <div className="bg-linear-to-b from-[#0A0E27] to-brand-primary">
      {/* Hero Section */}
      <section className="hero">
        <img src={personal.profile_photo} alt={personal.name} />
        <h1>{personal.full_name}</h1>
        <p>CREF: {personal.cref}</p>
        <div className="specialties">
          {personal.specialties.map(s => <Badge key={s}>{s}</Badge>)}
        </div>
        <p>{personal.bio}</p>
        
        {/* Rating */}
        <div className="rating">
          <Stars rating={personal.avg_rating} />
          <span>{personal.total_reviews} avaliações</span>
        </div>
        
        <Button>Quero treinar com você</Button>
      </section>
      
      {/* Transformations */}
      {personal.show_transformations && (
        <section className="transformations">
          <h2>Transformações</h2>
          <BeforeAfterSlider transformations={personal.transformations} />
        </section>
      )}
      
      {/* Testimonials */}
      {personal.show_testimonials && (
        <section className="testimonials">
          <h2>Depoimentos</h2>
          {personal.reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </section>
      )}
      
      {/* CTA */}
      <section className="cta">
        <h2>Pronto para transformar seu corpo?</h2>
        <Button size="lg">Falar com {personal.first_name}</Button>
      </section>
    </div>
  )
}
```

### 2. **Comparação de Fotos Antes/Depois (Slider)**

```typescript
// components/BeforeAfterSlider.tsx

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function BeforeAfterSlider({ beforeUrl, afterUrl }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  
  return (
    <div className="relative w-full h-150 overflow-hidden rounded-2xl">
      {/* After Image (Full) */}
      <img 
        src={afterUrl} 
        alt="Depois"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Before Image (Clipped) */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeUrl} 
          alt="Antes"
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Slider Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(e, info) => {
          const newPosition = (info.point.x / window.innerWidth) * 100
          setSliderPosition(Math.max(0, Math.min(100, newPosition)))
        }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </motion.div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-white font-medium">
        Antes
      </div>
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-white font-medium">
        Depois
      </div>
    </div>
  )
}
```

### 3. **Geração de PDF de Avaliação Física**

```typescript
// workers/queues/pdf-generate.ts

import puppeteer from '@cloudflare/puppeteer'

export default {
  async queue(batch: MessageBatch<{ assessment_id: string }>, env: Bindings) {
    
    for (const message of batch.messages) {
      const { assessment_id } = message.body
      
      // Fetch assessment data
      const assessment = await env.HYPERDRIVE.prepare(`
        SELECT a.*, s.full_name as student_name, p.full_name as personal_name, p.logo_url
        FROM assessments a
        JOIN students s ON a.student_id = s.id
        JOIN personals p ON a.personal_id = p.id
        WHERE a.id = ?
      `).bind(assessment_id).first()
      
      // Launch browser
      const browser = await puppeteer.launch(env.BROWSER)
      const page = await browser.newPage()
      
      // Set HTML content (could also render a Next.js page)
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { width: 150px; }
            .section { margin: 30px 0; }
            .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .photo img { width: 100%; border-radius: 8px; }
            .measurements { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .chart { width: 100%; height: 300px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${assessment.logo_url ? `<img src="${assessment.logo_url}" class="logo" />` : ''}
            <h1>Avaliação Física</h1>
            <p><strong>${assessment.student_name}</strong></p>
            <p>Data: ${new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="section">
            <h2>Medidas Corporais</h2>
            <div class="measurements">
              <div><strong>Peso:</strong> ${assessment.weight_kg} kg</div>
              <div><strong>Altura:</strong> ${assessment.height_cm} cm</div>
              <div><strong>% Gordura:</strong> ${assessment.body_fat_percentage}%</div>
              <div><strong>Massa Muscular:</strong> ${assessment.muscle_mass_kg} kg</div>
              <div><strong>IMC:</strong> ${assessment.bmi}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Fotos de Evolução</h2>
            <div class="photos">
              ${assessment.photos.map(p => `
                <div class="photo">
                  <img src="${p.url}" alt="${p.type}" />
                  <p>${p.type}</p>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h2>Observações</h2>
            <p>${assessment.notes || 'Nenhuma observação'}</p>
          </div>
          
          <div class="footer" style="text-align: center; margin-top: 50px; color: #666;">
            <p>Personal Trainer: ${assessment.personal_name}</p>
            <p>Gerado via VFIT - iapersonal.app.br</p>
          </div>
        </body>
        </html>
      `, { waitUntil: 'networkidle0' })
      
      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      })
      
      await browser.close()
      
      // Upload to R2
      const filename = `assessments/${assessment_id}.pdf`
      await env.R2_IMAGES.put(filename, pdf, {
        httpMetadata: { contentType: 'application/pdf' }
      })
      
      const pdfUrl = `https://images.iapersonal.app.br/${filename}`
      
      // Update database
      await env.HYPERDRIVE.prepare(`
        UPDATE assessments 
        SET pdf_generated = true, pdf_url = ?, pdf_generated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(pdfUrl, assessment_id).run()
      
      console.log(`✅ PDF generated: ${pdfUrl}`)
      
      message.ack()
    }
  }
}
```

### 4. **Sistema de Badges & Gamificação**

```typescript
// lib/gamification.ts

export const BADGES = {
  // Streak badges
  streak_7: {
    name: 'Consistência Iniciante',
    description: '7 dias consecutivos de treino',
    icon: '🔥',
    points: 100
  },
  streak_30: {
    name: 'Disciplina de Ferro',
    description: '30 dias consecutivos de treino',
    icon: '💪',
    points: 500
  },
  streak_100: {
    name: 'Imparável',
    description: '100 dias consecutivos',
    icon: '🏆',
    points: 2000
  },
  
  // Workout milestones
  workouts_10: {
    name: 'Primeiro Passo',
    description: '10 treinos completos',
    icon: '👟',
    points: 50
  },
  workouts_100: {
    name: 'Veterano',
    description: '100 treinos completos',
    icon: '🎖️',
    points: 1000
  },
  
  // Goal achievements
  weight_goal: {
    name: 'Meta Atingida',
    description: 'Alcançou peso desejado',
    icon: '🎯',
    points: 1000
  },
  body_fat_goal: {
    name: 'Definição Total',
    description: 'Alcançou % de gordura ideal',
    icon: '💎',
    points: 1500
  },
  
  // Social
  first_review: {
    name: 'Opinião Valiosa',
    description: 'Primeira avaliação do personal',
    icon: '⭐',
    points: 50
  },
  
  // Early adopter
  early_bird: {
    name: 'Early Adopter',
    description: 'Um dos primeiros 1000 usuários',
    icon: '🦅',
    points: 500
  }
}

// Auto-check badges after workout completion
export async function checkAndAwardBadges(student_id: string, db: Hyperdrive) {
  const student = await db.prepare(`
    SELECT * FROM students WHERE id = ?
  `).bind(student_id).first()
  
  const newBadges = []
  
  // Check streak badges
  if (student.current_streak === 7 && !hasBadge(student_id, 'streak_7')) {
    await awardBadge(student_id, 'streak_7', db)
    newBadges.push(BADGES.streak_7)
  }
  
  // Check workout count
  if (student.total_workouts_completed === 10) {
    await awardBadge(student_id, 'workouts_10', db)
    newBadges.push(BADGES.workouts_10)
  }
  
  // Send push notification if new badges
  if (newBadges.length > 0) {
    await sendPushNotification(student_id, {
      title: '🎉 Novo Badge Desbloqueado!',
      message: newBadges.map(b => b.name).join(', '),
      link: '/badges'
    })
  }
  
  return newBadges
}
```

***

## 🔒 SEGURANÇA & PERFORMANCE

### Rate Limiting com KV

```typescript
// middleware/rate-limit.ts

export async function rateLimiter(c: Context, next: Next) {
  const key = `rate:${c.req.header('cf-connecting-ip')}:${c.req.path}`
  const limit = getRateLimitForRoute(c.req.path)
  
  const current = await c.env.KV_RATE_LIMIT.get(key)
  const count = current ? parseInt(current) : 0
  
  if (count >= limit.max) {
    return c.json({ error: 'Too many requests' }, 429)
  }
  
  await c.env.KV_RATE_LIMIT.put(key, (count + 1).toString(), {
    expirationTtl: limit.windowSeconds
  })
  
  await next()
}

function getRateLimitForRoute(path: string) {
  const limits = {
    '/auth/login': { max: 5, windowSeconds: 900 }, // 5 per 15 min
    '/api/payments': { max: 10, windowSeconds: 60 }, // 10 per minute
    '/api/uploads': { max: 5, windowSeconds: 3600 }, // 5 per hour
    default: { max: 100, windowSeconds: 60 } // 100 per minute
  }
  
  return limits[path] || limits.default
}
```

### Smart Caching Strategy

```typescript
// lib/cache.ts

export const CACHE_STRATEGIES = {
  // Exercises library - rarely changes
  exercises: {
    ttl: 7 * 24 * 60 * 60, // 7 days
    staleWhileRevalidate: 24 * 60 * 60,
    cacheKey: (id: string) => `exercise:${id}`
  },
  
  // Workout templates
  templates: {
    ttl: 3 * 24 * 60 * 60, // 3 days
    staleWhileRevalidate: 12 * 60 * 60,
    cacheKey: (id: string) => `template:${id}`
  },
  
  // Student workouts (frequently updated)
  workouts: {
    ttl: 60 * 60, // 1 hour
    staleWhileRevalidate: 5 * 60,
    cacheKey: (student_id: string) => `workouts:${student_id}`
  },
  
  // User sessions
  sessions: {
    ttl: 24 * 60 * 60, // 24 hours
    cacheKey: (token: string) => `session:${token}`
  },
  
  // Public profiles (can be stale)
  profiles: {
    ttl: 12 * 60 * 60, // 12 hours
    staleWhileRevalidate: 6 * 60 * 60,
    cacheKey: (slug: string) => `profile:${slug}`
  }
}

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  strategy: CacheStrategy,
  kv: KVNamespace
): Promise<T> {
  
  // Try cache first
  const cached = await kv.get(key, 'json')
  
  if (cached) {
    // Return cached, maybe revalidate in background
    if (strategy.staleWhileRevalidate) {
      // Non-blocking revalidation
      ctx.waitUntil(refreshCache(key, fetcher, strategy, kv))
    }
    return cached as T
  }
  
  // Cache miss - fetch fresh data
  const data = await fetcher()
  
  // Store in cache
  await kv.put(key, JSON.stringify(data), {
    expirationTtl: strategy.ttl
  })
  
  return data
}
```

***

## 📊 ANALYTICS & MONITORING

```typescript
// lib/analytics.ts

export async function trackEvent(
  analytics: AnalyticsEngineDataset,
  event: {
    name: string
    user_id?: string
    metadata?: Record<string, any>
  }
) {
  await analytics.writeDataPoint({
    blobs: [event.name, event.user_id || 'anonymous'],
    doubles:  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/40283263/03f8b62b-c754-453f-9d34-c5e49b887c5d/image.jpg),
    indexes: [event.name]
  })
}

// Usage examples
trackEvent(env.ANALYTICS, {
  name: 'workout_created',
  user_id: personal_id,
  metadata: { student_id, workout_type }
})

trackEvent(env.ANALYTICS, {
  name: 'payment_received',
  user_id: personal_id,
  metadata: { amount, method: 'pix' }
})

trackEvent(env.ANALYTICS, {
  name: 'ai_request',
  user_id: personal_id,
  metadata: { model: 'gemini-2.5-flash', task: 'workout_generation' }
})
```

***

## 🎯 REGISTRO FINAL CONSOLIDADO

```yaml
PROJETO: VFIT
VERSÃO_INICIAL: 1.0.0
DATA: 06/02/2026

ARQUITETURA: 100% Cloudflare
  - Frontend: Next.js 15 (Static) + Cloudflare Pages
  - Backend: Cloudflare Workers + Hono.js
  - Database: D1 (cold) + Hyperdrive (hot)
  - Storage: R2 (videos/images)
  - Cache: KV + CDN
  - Queue: Cloudflare Queues
  - AI: Replicate (Gemini 2.5 Flash + Llama 3.1 70B + CLIP + Whisper)
  - Payments: Asaas (primary) + Stripe (secondary)
  - Push: OneSignal
  - Security: Turnstile
  - Analytics: CF Analytics Engine
  - Marketing: Zaraz

MVP_FEATURES:
  ✅ Landing page otimizada
  ✅ PWA com install banner
  ✅ Auth (email/Google/Facebook/Apple)
  ✅ Dashboard personal + aluno
  ✅ Gestão de alunos
  ✅ Criação de treinos (manual + IA)
  ✅ Biblioteca de exercícios (vídeos vertical/horizontal)
  ✅ Avaliações físicas com fotos
  ✅ Comparação antes/depois (slider)
  ✅ Geração de PDF de avaliações
  ✅ Cobranças automatizadas (Asaas/Stripe)
  ✅ Sistema de afiliados vitalício (25-35%)
  ✅ Portfolio público do personal
  ✅ Sistema de reviews
  ✅ Gamificação (badges para alunos)
  ✅ Marketplace de planos de treino
  ✅ Notificações push
  ✅ Offline-first (nível 2)
  ✅ Auto-versioning (1.0.0 → X.Y.Z)
  ✅ Deploy via: npm run cf:deploy

ROADMAP_FUTURO:
  📅 Fase 2 (Q3 2026):
    - Chat em tempo real (Durable Objects)
    - Integração Apple Health / Google Fit
    - Modo "Academia" (multi-personals)
    - IA avançada (análise preditiva de churn)
    - App nativo (Capacitor)
    
COMANDO_DEPLOY:
  npm run cf:deploy
  
  Faz:
  1. Auto-increment versão (1.0.0 → 1.0.1)
  2. Build Next.js
  3. Static export
  4. Deploy Workers (wrangler deploy)
  5. Deploy Pages (wrangler pages deploy)
  6. Update version.ts

CUSTOS_ESTIMADOS:
  - Cloudflare Workers: $5/mês (10M requests inclusos)
  - Cloudflare Pages: GRÁTIS
  - D1: GRÁTIS (até 5GB)
  - Hyperdrive: $5/mês
  - R2: $0.015/GB armazenado + $0.36/milhão de reads
  - OneSignal: GRÁTIS (até 10k subscribers)
  - Replicate: Pay-per-use (~$50-200/mês depende de uso)
  - Asaas: 0,99% Pix / 3,99% Cartão
  
  TOTAL: ~$100-300/mês operacional

PRÓXIMOS_PASSOS:
  1. Registrar domínio iapersonal.app.br
  2. Criar conta Cloudflare
  3. Setup Workers, D1, R2, KV
  4. Criar conta Replicate
  5. Criar conta Asaas
  6. Setup OneSignal
  7. Iniciar desenvolvimento
```

***

**Status:** 🟢 **ARQUITETURA 100% CLOUDFLARE COMPLETA - PRONTO PARA DESENVOLVIMENTO**

Está perfeito agora! Temos TUDO documentado:
- ✅ Arquitetura 100% Cloudflare
- ✅ IA estratégica (modelos por caso de uso)
- ✅ Database schema (D1 + Hyperdrive)
- ✅ Workers structure
- ✅ Deploy automatizado
- ✅ Todas as features aprovadas
- ✅ Exemplos de código prontos