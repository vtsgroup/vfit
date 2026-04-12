// ============================================
// config/index.ts — Barrel export de toda a configuração
// ============================================
//
// O que faz:
//   Re-exporta constantes, modelos de IA e tipos de config em um único
//   ponto de entrada. Usar @config para todos os imports de constantes.
//
// Exports principais:
//   PLANS, FEES, AFFILIATE_TIERS, BADGES, RATE_LIMITS, CACHE_TTL, APP_CONFIG
//   AI_MODELS, WORKERS_AI_MODELS, selectModel, selectWorkersAIModel — modelos IA
//   PlanSlug, BadgeType, AIModelKey, AITaskType, AIComplexity — tipos
// ============================================
export { AI_MODELS, WORKERS_AI_MODELS, selectModel, selectWorkersAIModel } from './ai-models'
export type { AIModelKey, WorkersAIModelKey, AITaskType, AIComplexity } from './ai-models'

export {
  APP_CONFIG,
  PLANS,
  FEES,
  AFFILIATE_TIERS,
  AFFILIATE_PROGRAM,
  BADGES,
  PUBLIC_SOCIAL_PROOF,
  RATE_LIMITS,
  CACHE_TTL,
} from './constants'

export type { PlanSlug, BadgeType } from './constants'
