/**
 * config/ai-models.ts
 *
 * AI Model Configuration — Cloudflare Workers AI + Replicate Fallback
 *
 * Prioridade: Workers AI (custo zero, latência mínima) → Replicate (fallback pago)
 *
 * Exports: AI_MODELS, WORKERS_AI_MODELS, AIModelKey, WorkersAIModelKey,
 *          AITaskType, AIComplexity, selectModel, selectWorkersAIModel
 */

// ============================================
// Cloudflare Workers AI Models (PRIORIDADE)
// Zero cost para primeiros 10k neurons/dia
// ============================================

export const WORKERS_AI_MODELS = {
  // 1. TREINOS - Básico (Llama 3.1 8B — ultra-rápido, ~1-2s)
  workout_basic: {
    model: '@cf/meta/llama-3.1-8b-instruct-fast' as const,
    use_case: 'Treinos simples, iniciantes, respostas rápidas',
    max_tokens: 2048,
    temperature: 0.7,
  },

  // 2. TREINOS - Avançado (Llama 3.3 70B — alta qualidade, ~3-5s)
  workout_advanced: {
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as const,
    use_case: 'Treinos personalizados, periodização, análise completa',
    max_tokens: 4096,
    temperature: 0.7,
  },

  // 3. ASSISTENTE GERAL (Llama 4 Scout — MoE 16 experts, balanceado)
  assistant: {
    model: '@cf/meta/llama-4-scout-17b-16e-instruct' as const,
    use_case: 'Chat conversacional, dúvidas, sugestões, onboarding',
    max_tokens: 2048,
    temperature: 0.8,
  },

  // 4. GERAÇÃO DE CONTEÚDO (Llama 3.3 70B — criativo, detalhado)
  content_generation: {
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as const,
    use_case: 'Posts Instagram, emails, materiais marketing',
    max_tokens: 2048,
    temperature: 0.9,
  },

  // 5. ANÁLISE DE SENTIMENTO (Llama 3.1 8B — simples, rápido)
  sentiment_analysis: {
    model: '@cf/meta/llama-3.1-8b-instruct-fast' as const,
    use_case: 'Analisar feedbacks, detectar insatisfação',
    max_tokens: 512,
    temperature: 0.3,
  },

  // 6. SMART BILLING (Llama 3.1 8B — lógica simples)
  smart_billing: {
    model: '@cf/meta/llama-3.1-8b-instruct-fast' as const,
    use_case: 'Sugestão de cobranças inteligente',
    max_tokens: 1024,
    temperature: 0.5,
  },
} as const

export type WorkersAIModelKey = keyof typeof WORKERS_AI_MODELS

// ============================================
// Replicate Models (FALLBACK)
// Usado apenas se Workers AI não estiver disponível
// ============================================

export const AI_MODELS = {
  // 1. CRIAÇÃO DE TREINOS - Básico (Gemini Flash)
  workout_basic: {
    model: 'google-gemini/gemini-2.5-flash' as const,
    use_case: 'Treinos simples, repetitivos, iniciantes',
    cost_per_million_tokens: 0.10,
    max_tokens: 2048,
    temperature: 0.7,
  },

  // 2. CRIAÇÃO DE TREINOS - Avançado (Llama 3.1 70B)
  workout_advanced: {
    model: 'meta/llama-3.1-70b-instruct' as const,
    use_case: 'Treinos personalizados, análise de histórico, periodização',
    cost_per_million_tokens: 0.65,
    max_tokens: 4096,
    temperature: 0.7,
  },

  // 3. ANÁLISE DE FOTOS (CLIP)
  photo_analysis: {
    model: 'openai/clip-vit-large-patch14' as const,
    use_case: 'Comparar fotos antes/depois, detectar mudanças corporais',
    cost_per_image: 0.001,
  },

  // 4. ASSISTENTE GERAL (Gemini Flash)
  assistant: {
    model: 'google-gemini/gemini-2.5-flash' as const,
    use_case: 'Responder dúvidas, sugerir ações, onboarding',
    cost_per_million_tokens: 0.10,
    max_tokens: 1024,
    temperature: 0.8,
  },

  // 5. TRANSCRIÇÃO DE VÍDEOS (Whisper)
  video_transcription: {
    model: 'openai/whisper-large-v3' as const,
    use_case: 'Legendas automáticas, acessibilidade',
    cost_per_minute: 0.006,
    languages: ['pt', 'en', 'es'] as const,
  },

  // 6. GERAÇÃO DE CONTEÚDO (Gemini Flash)
  content_generation: {
    model: 'google-gemini/gemini-2.5-flash' as const,
    use_case: 'Posts Instagram, emails, materiais afiliados',
    cost_per_million_tokens: 0.10,
    max_tokens: 2048,
    temperature: 0.9,
  },

  // 7. ANÁLISE DE SENTIMENTO (Gemini Flash)
  sentiment_analysis: {
    model: 'google-gemini/gemini-2.5-flash' as const,
    use_case: 'Analisar feedbacks, detectar alunos insatisfeitos',
    cost_per_million_tokens: 0.10,
    max_tokens: 512,
    temperature: 0.3,
  },
} as const

export type AIModelKey = keyof typeof AI_MODELS
export type AITaskType = 'workout' | 'photo' | 'chat' | 'transcription' | 'content' | 'sentiment' | 'billing'
export type AIComplexity = 'low' | 'medium' | 'high'

// Tasks that require Replicate-only capabilities (multimodal, audio) — Workers AI not applicable
const REPLICATE_ONLY_TASKS: AITaskType[] = ['photo', 'transcription']

/**
 * Seleciona modelo Workers AI baseado na tarefa e complexidade.
 * Retorna null para tarefas sem suporte nativo (photo, transcription).
 * Para tarefas desconhecidas, retorna o modelo 8B com um aviso (safe default, menor custo).
 */
export function selectWorkersAIModel(task: AITaskType, complexity: AIComplexity = 'low') {
  if (REPLICATE_ONLY_TASKS.includes(task)) return null

  const modelMap: Partial<Record<AITaskType, WorkersAIModelKey>> = {
    workout: complexity === 'high' ? 'workout_advanced' : 'workout_basic',
    chat: 'assistant',
    content: 'content_generation',
    sentiment: 'sentiment_analysis',
    billing: 'smart_billing',
  }

  const key = modelMap[task]
  if (!key) {
    console.warn(`[Workers AI] No model mapped for task: ${task}, falling back to 8B safe default`)
    return WORKERS_AI_MODELS.workout_basic // cheapest safe default
  }
  return WORKERS_AI_MODELS[key]
}

/**
 * Seleciona modelo Replicate (fallback) baseado na tarefa e complexidade.
 */
export function selectModel(task: AITaskType, complexity: AIComplexity = 'low') {
  const modelMap: Record<string, AIModelKey> = {
    workout: complexity === 'high' ? 'workout_advanced' : 'workout_basic',
    photo: 'photo_analysis',
    chat: 'assistant',
    transcription: 'video_transcription',
    content: 'content_generation',
    sentiment: 'sentiment_analysis',
    billing: 'assistant',
  }

  return AI_MODELS[modelMap[task] || 'assistant']
}
