/**
 * src/components/providers/query-provider.tsx
 *
 * Query Provider — TanStack Query v5
 *
 * Exports: QueryProvider
 * Hooks: useState
 * Features: 'use client'
 */

// ============================================
// Query Provider — TanStack Query v5
// ============================================

'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiClientError } from '@/lib/api-client'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 30s — dados ficam "fresh" por 30s
        staleTime: 30 * 1000,
        // GC time: 5 min
        gcTime: 5 * 60 * 1000,
        // Retry: 1x para erros de rede, 0 para 4xx
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError) {
            // Não dar retry em erros 4xx (exceto 429 rate limit)
            if (error.status >= 400 && error.status < 500 && error.status !== 429) {
              return false
            }
          }
          return failureCount < 2
        },
        // Refetch on window focus (bom para dados que mudam)
        refetchOnWindowFocus: true,
        // Não refetch on reconnect automático
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Criar client no client-side para evitar data leak entre requests SSR
  const [queryClient] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
