/**
 * src/lib/query-cache-policy.ts
 *
 * App Query Cache Policy — LOTE 015
 *
 * Exports: APP_QUERY_CACHE
 */

// ============================================
// App Query Cache Policy — LOTE 015
// Centraliza perfis de cache por tipo de dado
// ============================================

export const APP_QUERY_CACHE = {
  // Listas de dashboard (alunos, notificações, admin/users)
  list: {
    staleTime: 45_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst' as const,
  },

  // Detalhes com baixa volatilidade
  detail: {
    staleTime: 60_000,
    gcTime: 20 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst' as const,
  },

  // Indicadores e métricas administrativas
  stats: {
    staleTime: 20_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst' as const,
  },

  // Contadores rápidos (badge/unread)
  realtime: {
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'online' as const,
  },
}
