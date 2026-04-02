// ============================================
// Tests: callWorkersAIWithFallback — fallback chain
// ============================================
//
// Cobre:
//   - Path 1: Workers AI binding disponível e retorna resposta → provider='workers-ai'
//   - Path 2: Workers AI falha → fallback para Replicate → provider='replicate'
//   - Path 3: Ambos falham → throw ServiceUnavailableError (503)
//   - Path 4: Nenhum provider disponível (sem AI binding, sem token) → throw 503
//   - callReplicateFallback: output null → throw (não retorna string vazia silenciosa)
// ============================================

import { describe, it, expect, vi, afterEach } from 'vitest'
import { callWorkersAIWithFallback } from '@lib/workers-ai'
import type { Bindings } from '@workers/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEnv(opts: {
  ai?: { run: ReturnType<typeof vi.fn> }
  replicate?: boolean
}): Bindings {
  return {
    AI: opts.ai as unknown as Ai,
    REPLICATE_API_TOKEN: opts.replicate ? 'test-token' : undefined,
  } as unknown as Bindings
}

const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast'

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Path 1: Workers AI success ───────────────────────────────────────────────

describe('callWorkersAIWithFallback — Workers AI success', () => {
  it('retorna response e provider=workers-ai quando AI binding funciona', async () => {
    const mockRun = vi.fn().mockResolvedValue({ response: 'treino gerado com sucesso' })
    const env = makeEnv({ ai: { run: mockRun } })

    const result = await callWorkersAIWithFallback(env, MODEL, 'gere um treino')

    expect(result.provider).toBe('workers-ai')
    expect(result.response).toBe('treino gerado com sucesso')
    expect(mockRun).toHaveBeenCalledOnce()
  })

  it('passa system prompt como mensagem system corretamente', async () => {
    const mockRun = vi.fn().mockResolvedValue({ response: 'ok' })
    const env = makeEnv({ ai: { run: mockRun } })

    await callWorkersAIWithFallback(env, MODEL, 'prompt', {
      systemPrompt: 'Você é um personal trainer',
    })

    const callArgs = mockRun.mock.calls[0][1]
    expect(callArgs.messages[0].role).toBe('system')
    expect(callArgs.messages[0].content).toBe('Você é um personal trainer')
  })
})

// ─── Path 2: Workers AI fails → Replicate fallback ────────────────────────────

describe('callWorkersAIWithFallback — fallback para Replicate', () => {
  it('usa Replicate quando Workers AI lança erro', async () => {
    const mockRun = vi.fn().mockRejectedValue(new Error('workers-ai down'))
    const env = makeEnv({ ai: { run: mockRun }, replicate: true })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: 'resposta do replicate' }),
    }))

    const result = await callWorkersAIWithFallback(env, MODEL, 'gere um treino')

    expect(result.provider).toBe('replicate')
    expect(result.response).toBe('resposta do replicate')
  })

  it('tenta modelo fallback Workers AI antes do Replicate', async () => {
    const mockRun = vi.fn()
      .mockRejectedValueOnce(new Error('primary model failed'))  // primary
      .mockResolvedValueOnce({ response: 'fallback model ok' })  // fallback model
    const env = makeEnv({ ai: { run: mockRun } })

    const result = await callWorkersAIWithFallback(env, MODEL, 'prompt', {
      fallbackModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    })

    expect(result.provider).toBe('workers-ai')
    expect(result.response).toBe('fallback model ok')
    expect(mockRun).toHaveBeenCalledTimes(2)
  })
})

// ─── Path 3: All providers fail → throw 503 ───────────────────────────────────

describe('callWorkersAIWithFallback — todos os providers falham', () => {
  it('lança ServiceUnavailableError quando Workers AI e Replicate falham', async () => {
    const mockRun = vi.fn().mockRejectedValue(new Error('workers-ai down'))
    const env = makeEnv({ ai: { run: mockRun }, replicate: true })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'service unavailable',
    }))

    await expect(
      callWorkersAIWithFallback(env, MODEL, 'prompt')
    ).rejects.toThrow('temporariamente indisponível')
  })
})

// ─── Path 4: No providers available → throw 503 ───────────────────────────────

describe('callWorkersAIWithFallback — sem providers disponíveis', () => {
  it('lança 503 quando não há AI binding nem REPLICATE_API_TOKEN', async () => {
    const env = makeEnv({}) // no AI, no Replicate

    await expect(
      callWorkersAIWithFallback(env, MODEL, 'prompt')
    ).rejects.toThrow('temporariamente indisponível')
  })
})

// ─── callReplicateFallback: null/empty output guard ──────────────────────────

describe('callWorkersAIWithFallback — Replicate output guard', () => {
  it('lança erro quando Replicate retorna output: null', async () => {
    const env = makeEnv({ replicate: true })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: null }),
    }))

    await expect(
      callWorkersAIWithFallback(env, MODEL, 'prompt')
    ).rejects.toThrow('temporariamente indisponível') // escalates to 503
  })

  it('lança erro quando Replicate retorna array vazio', async () => {
    const env = makeEnv({ replicate: true })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: [] }),
    }))

    await expect(
      callWorkersAIWithFallback(env, MODEL, 'prompt')
    ).rejects.toThrow('temporariamente indisponível')
  })
})
