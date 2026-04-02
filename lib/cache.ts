// ============================================
// cache.ts — Estratégia de cache KV com stale-while-revalidate
// ============================================
//
// O que faz:
//   Abstrai operações de cache no Cloudflare KV com estratégia
//   stale-while-revalidate: retorna dados em cache imediatamente e
//   atualiza em background via waitUntil. Contém estratégias pré-definidas
//   para exercícios, templates, workouts, perfis e XP.
//
// Exports principais:
//   getCached(kv, key, fetcher, strategy, ctx?) → T — get ou fetch+cache
//   invalidateCache(kv, keys[]) → void
//   cacheKey(prefix, id) → string
//   listCacheKey(prefix, params) → string
//   CACHE_STRATEGIES — Record com TTLs e stale-while-revalidate por entidade
//
// KV: KV_CACHE
// ============================================

import { CACHE_TTL } from '@config/constants'

export interface CacheStrategy {
  ttl: number
  staleWhileRevalidate?: number
}

export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  exercises: {
    ttl: CACHE_TTL.exercises,
    staleWhileRevalidate: 24 * 60 * 60, // 1 day
  },
  templates: {
    ttl: CACHE_TTL.templates,
    staleWhileRevalidate: 12 * 60 * 60, // 12 hours
  },
  workouts: {
    ttl: CACHE_TTL.workouts,
    staleWhileRevalidate: 5 * 60, // 5 min
  },
  sessions: {
    ttl: CACHE_TTL.sessions,
  },
  profiles: {
    ttl: CACHE_TTL.profiles,
    staleWhileRevalidate: 6 * 60 * 60, // 6 hours
  },
  public_profile: {
    ttl: CACHE_TTL.public_profile,
    staleWhileRevalidate: 3 * 60 * 60, // 3 hours
  },
  xp_balance: {
    ttl: CACHE_TTL.xp_balance,
    staleWhileRevalidate: 60, // 1 min
  },
  xp_streak: {
    ttl: CACHE_TTL.xp_streak,
    staleWhileRevalidate: 2 * 60, // 2 min
  },
  xp_daily_goal: {
    ttl: CACHE_TTL.xp_daily_goal,
  },
  xp_milestones: {
    ttl: CACHE_TTL.xp_milestones,
    staleWhileRevalidate: 30 * 60, // 30 min
  },
}

/**
 * Busca dados do cache KV com stale-while-revalidate strategy
 */
export async function getCached<T>(
  kv: KVNamespace,
  key: string,
  fetcher: () => Promise<T>,
  strategy: CacheStrategy,
  ctx?: ExecutionContext
): Promise<T> {
  // Try cache first
  const cached = await kv.get(key, 'json')

  if (cached !== null) {
    // If stale-while-revalidate is set, refresh in background
    if (strategy.staleWhileRevalidate && ctx) {
      ctx.waitUntil(refreshCache(kv, key, fetcher, strategy))
    }
    return cached as T
  }

  // Cache miss - fetch fresh data
  const data = await fetcher()

  // Store in cache (non-blocking)
  if (ctx) {
    ctx.waitUntil(
      kv.put(key, JSON.stringify(data), {
        expirationTtl: strategy.ttl,
      })
    )
  } else {
    await kv.put(key, JSON.stringify(data), {
      expirationTtl: strategy.ttl,
    })
  }

  return data
}

/**
 * Refresh cache in background
 */
async function refreshCache<T>(
  kv: KVNamespace,
  key: string,
  fetcher: () => Promise<T>,
  strategy: CacheStrategy
): Promise<void> {
  try {
    const data = await fetcher()
    await kv.put(key, JSON.stringify(data), {
      expirationTtl: strategy.ttl,
    })
  } catch {
    // Silently fail - stale data is better than no data
  }
}

/**
 * Invalida uma ou mais chaves do cache
 */
export async function invalidateCache(kv: KVNamespace, keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => kv.delete(key)))
}

/**
 * Gera chave de cache padronizada
 */
export function cacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`
}

/**
 * Gera chave de cache para listas paginadas
 */
export function listCacheKey(prefix: string, params: Record<string, string | number>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `${prefix}:list:${sorted}`
}
