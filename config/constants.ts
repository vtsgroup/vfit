/**
 * config/constants.ts
 *
 * Application Constants
 *
 * Exports: APP_CONFIG, PLANS, PlanSlug, FEES, AFFILIATE_TIERS
 */

// ============================================
// Application Constants
// ============================================

export const APP_CONFIG = {
  name: 'VFIT',
  tagline: 'Seu app de treinos com IA',
  version: '1.0.0',
  domain: 'iapersonal.app.br',
  api_domain: 'api.iapersonal.app.br',
  videos_domain: 'videos.iapersonal.app.br',
  images_domain: 'images.iapersonal.app.br',
} as const

// ============================================
// Subscription Plans
// ============================================
export const PLANS = {
  trial: {
    name: 'Grátis',
    slug: 'trial',
    price_brl: 0,
    duration_days: null, // gratuito para sempre (sem limite de tempo)
    max_students: 5,
    features: [
      'Até 5 alunos',
      'Criação manual de treinos',
      'Gamificação básica (XP)',
      'Cobrança Pix/boleto',
      'App PWA completo',
    ],
  },
  pro: {
    name: 'Pro',
    slug: 'pro',
    price_brl: 29.90,
    duration_days: 30,
    max_students: -1, // unlimited
    features: [
      'Alunos ilimitados',
      'IA para criar treinos',
      'Recorrência automática',
      'Gamificação completa',
      'Notificações WhatsApp + e-mail',
      'Relatórios avançados',
    ],
  },
  profissional: {
    name: 'Pro+',
    slug: 'profissional',
    price_brl: 69.90,
    duration_days: 30,
    max_students: -1, // unlimited
    features: [
      'Alunos ilimitados',
      'Tudo do Pro',
      'Marketplace de planos',
      'IA avançada (Llama 70B)',
      'Relatórios completos (PDF)',
      'Avaliações com fotos IA',
      'Dashboard financeiro',
      'Suporte prioritário',
    ],
  },
  max: {
    name: 'Max',
    slug: 'max',
    price_brl: 129.90,
    duration_days: 30,
    max_students: -1, // unlimited
    features: [
      'Alunos ilimitados',
      'Tudo do Profissional',
      'Contratos digitais',
      'Invoices + NFs automáticas',
      'White-label (nome + logo)',
      'Assistente IA pessoal',
      'Assinatura digital ICP-Brasil',
      'Suporte VIP 24/7',
    ],
  },
} as const

export type PlanSlug = keyof typeof PLANS

// ============================================
// VFIT B2C Subscription Plans
// ============================================
export const VFIT_PLANS = {
  free: {
    name: 'Grátis',
    slug: 'free' as const,
    price_brl: 0,
    duration_days: null,
    features: [
      'Plano de treino básico por IA',
      'Até 3 treinos/semana',
      'Acompanhamento de progresso',
      'Streak + XP básico',
    ],
    limits: {
      ai_plans_per_month: 1,
      workouts_per_week: 3,
      ai_chat_messages: 10,
      exercise_library: 'basic',
    },
  },
  premium: {
    name: 'Premium',
    slug: 'premium' as const,
    price_brl: 19.90,
    duration_days: 30,
    features: [
      'Planos ilimitados por IA',
      'Treinos ilimitados',
      'Chat IA ilimitado',
      'Biblioteca completa de exercícios',
      'Avaliação física IA',
      'Streak freezes ilimitados',
      'Sem anúncios',
    ],
    limits: {
      ai_plans_per_month: -1,
      workouts_per_week: -1,
      ai_chat_messages: -1,
      exercise_library: 'full',
    },
  },
  premium_annual: {
    name: 'Premium Anual',
    slug: 'premium_annual' as const,
    price_brl: 149.90,
    duration_days: 365,
    features: [
      'Tudo do Premium',
      '37% de desconto',
      'Badge exclusivo',
    ],
    limits: {
      ai_plans_per_month: -1,
      workouts_per_week: -1,
      ai_chat_messages: -1,
      exercise_library: 'full',
    },
  },
} as const

export type VfitPlanSlug = keyof typeof VFIT_PLANS

// ============================================
// Platform Fees
// ============================================
export const FEES = {
  platform_fee_percentage: 3.5,      // 3.5% — taxa de plataforma (percentual, ex.: 3.5 = 3.5%)
  marketplace_platform_share: 30,    // 30% platform share on marketplace
  marketplace_creator_share: 70,     // 70% creator share on marketplace
} as const

// ============================================
// Affiliate Commission Tiers
// ============================================
export const AFFILIATE_TIERS = {
  '25': {
    name: 'Bronze',
    commission_percentage: 25,
    min_referrals: 0,
    color: '#CD7F32',
  },
  '30': {
    name: 'Prata',
    commission_percentage: 30,
    min_referrals: 5,
    color: '#C0C0C0',
  },
  '35': {
    name: 'Ouro',
    commission_percentage: 35,
    min_referrals: 15,
    color: '#FFD700',
  },
} as const

// ============================================
// Gamification — XP Levels
// ============================================
/** XP acumulado necessário para atingir cada nível (nível 2 em diante) */
export const LEVEL_THRESHOLDS = [
  100,    // Nível 2
  300,    // Nível 3
  600,    // Nível 4
  1000,   // Nível 5
  1500,   // Nível 6
  2200,   // Nível 7
  3000,   // Nível 8
  4000,   // Nível 9
  5200,   // Nível 10
  6600,   // Nível 11
  8200,   // Nível 12
  10000,  // Nível 13
  12000,  // Nível 14
  14500,  // Nível 15
  17500,  // Nível 16
  21000,  // Nível 17
  25000,  // Nível 18
  30000,  // Nível 19
  36000,  // Nível 20
] as const

/** XP ganho por ação */
export const XP_PER_ACTION = {
  workout_completed: 50,
  personal_record: 30,
  streak_day: 10,
  assessment_completed: 20,
  badge_earned: 25,
  first_workout: 100,
} as const

// ============================================
// Gamification Badges
// ============================================
export const BADGES = {
  // Streak badges
  streak_7: {
    name: 'Consistência Iniciante',
    description: '7 dias consecutivos de treino',
    icon: '🔥',
    points: 100,
  },
  streak_30: {
    name: 'Disciplina de Ferro',
    description: '30 dias consecutivos de treino',
    icon: '💪',
    points: 500,
  },
  streak_100: {
    name: 'Imparável',
    description: '100 dias consecutivos',
    icon: '🏆',
    points: 2000,
  },

  // Workout milestones
  workouts_10: {
    name: 'Primeiro Passo',
    description: '10 treinos completos',
    icon: '👟',
    points: 50,
  },
  workouts_50: {
    name: 'Dedicação',
    description: '50 treinos completos',
    icon: '⚡',
    points: 300,
  },
  workouts_100: {
    name: 'Veterano',
    description: '100 treinos completos',
    icon: '🎖️',
    points: 1000,
  },

  // Goal achievements
  weight_goal: {
    name: 'Meta Atingida',
    description: 'Alcançou peso desejado',
    icon: '🎯',
    points: 1000,
  },
  body_fat_goal: {
    name: 'Definição Total',
    description: 'Alcançou % de gordura ideal',
    icon: '💎',
    points: 1500,
  },

  // Social
  first_review: {
    name: 'Opinião Valiosa',
    description: 'Primeira avaliação do personal',
    icon: '⭐',
    points: 50,
  },

  // Early adopter
  early_bird: {
    name: 'Early Adopter',
    description: 'Um dos primeiros 1000 usuários',
    icon: '🦅',
    points: 500,
  },
} as const

export type BadgeType = keyof typeof BADGES

// ============================================
// Rate Limits
// ============================================
// Chaves são prefixos do pathname completo (ex: /api/v1/auth/login).
// O middleware usa longest-prefix match — rotas mais específicas têm prioridade.
export const RATE_LIMITS: Record<string, { max: number; windowSeconds: number }> = {
  '/api/v1/auth/login': { max: 5, windowSeconds: 900 },            // 5 por 15 min — brute force
  '/api/v1/auth/register': { max: 3, windowSeconds: 3600 },        // 3 por hora — cadastro
  '/api/v1/auth/forgot-password': { max: 3, windowSeconds: 3600 }, // 3 por hora — reset
  '/api/v1/auth/reset-password': { max: 5, windowSeconds: 900 },   // 5 por 15 min — reset
  '/api/v1/payments': { max: 10, windowSeconds: 60 },              // 10 por minuto
  '/api/v1/ai': { max: 20, windowSeconds: 60 },                    // 20 por minuto
  default: { max: 100, windowSeconds: 60 },                        // 100 por minuto
}

// ============================================
// Cache TTLs (seconds)
// ============================================
export const CACHE_TTL = {
  exercises: 7 * 24 * 60 * 60,       // 7 days
  templates: 3 * 24 * 60 * 60,       // 3 days
  workouts: 60 * 60,                  // 1 hour
  sessions: 24 * 60 * 60,            // 24 hours
  profiles: 12 * 60 * 60,            // 12 hours
  public_profile: 6 * 60 * 60,       // 6 hours
  exercise_library: 7 * 24 * 60 * 60, // 7 days
  xp_balance: 5 * 60,                // 5 minutes
  xp_streak: 10 * 60,                // 10 minutes
  xp_daily_goal: 2 * 60,             // 2 minutes (changes frequently)
  xp_milestones: 60 * 60,            // 1 hour (rarely changes)
} as const
