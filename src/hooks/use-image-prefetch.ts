/**
 * src/hooks/use-image-prefetch.ts
 *
 * Prefetch de imagens de exercícios/grupos musculares para o Cache API do browser.
 * Suporta acesso offline (PWA) quando as imagens já foram carregadas uma vez.
 *
 * Uso:
 *   useImagePrefetch(muscleGroups?.map(mg => mg.image_url))
 */
'use client'

import { useEffect } from 'react'

const CACHE_NAME = 'vfit-exercise-images-v1'

/**
 * Prefetch de imagens para Cache API (offline-first / R2 assets).
 * Best-effort: nunca lança erros. Só executa no client.
 *
 * @param urls - lista de URLs (strings, null ou undefined são ignorados)
 */
export function useImagePrefetch(urls: (string | null | undefined)[]) {
  // Derivar chave estável para o effect sem passar array diretamente
  const cacheKey = urls
    .filter((u): u is string => !!u && u.startsWith('http'))
    .sort()
    .join('|')

  useEffect(() => {
    if (typeof window === 'undefined' || !('caches' in window)) return
    if (!cacheKey) return

    const validUrls = cacheKey.split('|')

    void (async () => {
      try {
        const cache = await caches.open(CACHE_NAME)
        await Promise.allSettled(
          validUrls.map(async (url) => {
            const hit = await cache.match(url)
            if (!hit) {
              // Fetch com no-cors para imagens cross-origin (R2, CDN)
              const req = new Request(url, { mode: 'no-cors', credentials: 'omit' })
              const res = await fetch(req)
              await cache.put(url, res)
            }
          })
        )
      } catch {
        // best-effort — nunca interrompe o fluxo principal
      }
    })()
  }, [cacheKey])
}

/**
 * Verifica se uma imagem já está em cache local.
 * Útil para mostrar placeholder vs imagem real.
 */
export async function isImageCached(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false
  try {
    const cache = await caches.open(CACHE_NAME)
    const hit = await cache.match(url)
    return !!hit
  } catch {
    return false
  }
}
