/**
 * lib/workers-ai.ts
 *
 * Cloudflare Workers AI — Helper para chamadas de IA nativas
 *
 * Usa o binding AI nativo do Cloudflare Workers (custo zero para primeiros 10k neurons/dia).
 * Fallback automático para Replicate API quando o binding não estiver disponível.
 *
 * Modelos principais:
 *   - @cf/meta/llama-3.3-70b-instruct-fp8-fast (avançado, 70B params)
 *   - @cf/meta/llama-4-scout-17b-16e-instruct (Llama 4, MoE 16 experts)
 *   - @cf/meta/llama-3.1-8b-instruct-fast (básico, rápido)
 *
 * Exports: callWorkersAI, callWorkersAIWithFallback
 */

import type { Bindings } from '@workers/types'
import { ServiceUnavailableError } from './errors'

// ============================================
// Types
// ============================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AITextGenerationInput {
  messages: AIMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface AITextGenerationOutput {
  response: string
}

// ============================================
// Workers AI — Chamada nativa via binding
// ============================================

/**
 * Chama um modelo de text-generation via Workers AI binding nativo.
 * Zero latência de rede (binding direto no edge).
 * Custo: $0 para primeiros 10k neurons/dia no free tier.
 */
/** Timeout por chamada de modelo — evita que um modelo lento (cold start) segure
 *  a cascata além do timeout do cliente. Cada camada falha rápido e passa pra próxima. */
const DEFAULT_AI_RUN_TIMEOUT_MS = 12_000

export async function callWorkersAI(
  ai: Ai,
  model: string,
  input: AITextGenerationInput,
  timeoutMs: number = DEFAULT_AI_RUN_TIMEOUT_MS
): Promise<string> {
  try {
    const runPromise = ai.run(model as Parameters<typeof ai.run>[0], {
      messages: input.messages,
      max_tokens: input.max_tokens || 2048,
      temperature: input.temperature || 0.7,
      top_p: input.top_p || 0.95,
    }) as unknown as Promise<AITextGenerationOutput>

    const result = timeoutMs > 0
      ? await Promise.race([
          runPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Workers AI timeout ${timeoutMs}ms (${model})`)), timeoutMs)
          ),
        ])
      : await runPromise

    if (typeof result === 'string') return result
    if (result && typeof result === 'object' && 'response' in result) {
      return result.response
    }

    return JSON.stringify(result)
  } catch (err) {
    console.error('[Workers AI] Call failed:', err)
    throw err
  }
}

// ============================================
// Fallback: Workers AI → Replicate
// ============================================

/**
 * Tenta Workers AI primeiro, fallback para Replicate se falhar.
 * Garante 100% de uptime mesmo se Workers AI tiver issues.
 */
export async function callWorkersAIWithFallback(
  env: Bindings,
  model: string,
  prompt: string,
  options: {
    systemPrompt?: string
    max_tokens?: number
    temperature?: number
    replicateModel?: string
    fallbackModel?: string
  } = {}
): Promise<{ response: string; provider: 'workers-ai' | 'replicate' }> {
  const messages: AIMessage[] = []

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  // 1. Tentar Workers AI binding nativo — modelo primário
  if (env.AI) {
    try {
      const response = await callWorkersAI(env.AI, model, {
        messages,
        max_tokens: options.max_tokens || 2048,
        temperature: options.temperature || 0.7,
      })
      return { response, provider: 'workers-ai' }
    } catch (err) {
      console.warn(`[Workers AI] Primary model (${model}) failed:`, err)
    }

    // 1b. Tentar modelo fallback Workers AI (se diferente do primário)
    const fallback = options.fallbackModel || '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    if (fallback !== model) {
      try {
        console.info(`[Workers AI] Trying fallback model: ${fallback}`)
        const response = await callWorkersAI(env.AI, fallback, {
          messages,
          max_tokens: options.max_tokens || 2048,
          temperature: options.temperature || 0.7,
        })
        return { response, provider: 'workers-ai' }
      } catch (err2) {
        console.warn(`[Workers AI] Fallback model (${fallback}) also failed:`, err2)
      }
    }
  }

  // 2. Fallback: Replicate API
  if (env.REPLICATE_API_TOKEN) {
    try {
      const response = await callReplicateFallback(
        env.REPLICATE_API_TOKEN,
        options.replicateModel || 'meta/llama-3.1-70b-instruct',
        prompt,
        options
      )
      return { response, provider: 'replicate' }
    } catch (err) {
      console.error('[Replicate] Fallback also failed:', err)
    }
  }

  // All providers failed — fail loudly so the operator sees it and the user gets a clear error
  console.error('[AI] All providers failed — Workers AI and Replicate both unavailable')
  throw new ServiceUnavailableError('Serviço de IA temporariamente indisponível. Tente novamente em alguns instantes.')
}

// ============================================
// Replicate API (fallback)
// ============================================

async function callReplicateFallback(
  token: string,
  model: string,
  prompt: string,
  options: { max_tokens?: number; temperature?: number }
): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      model,
      input: {
        prompt,
        max_tokens: options.max_tokens || 2048,
        temperature: options.temperature || 0.7,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Replicate API error ${response.status}: ${error}`)
  }

  const data = await response.json() as { output?: unknown }

  if (Array.isArray(data.output)) {
    const joined = data.output.join('')
    if (!joined) throw new Error('Replicate returned empty array output')
    return joined
  }
  if (typeof data.output === 'string') {
    if (!data.output) throw new Error('Replicate returned empty string output')
    return data.output
  }
  if (data.output == null) throw new Error('Replicate returned null output')
  return JSON.stringify(data.output)
}
