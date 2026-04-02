// ============================================
// cache-event-listener.tsx — Listener global de eventos de invalidação de cache
// ============================================
//
// O que faz:
//   Componente cliente que escuta CustomEvents do tipo APP_CACHE_EVENT_NAME
//   emitidos em qualquer parte da app e invalida queries TanStack Query
//   correspondentes via invalidateByCacheEvent().
//   Renderiza null — montado em DashboardLayout para cobertura global.
//
// Exports principais:
//   CacheEventListener — listener de eventos de cache (renderiza null)
'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  APP_CACHE_EVENT_NAME,
  invalidateByCacheEvent,
  type AppCacheEvent,
} from '@/lib/cache-events'

export function CacheEventListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handler = (evt: Event) => {
      const customEvt = evt as CustomEvent<AppCacheEvent>
      if (!customEvt.detail?.type) return
      void invalidateByCacheEvent(queryClient, customEvt.detail)
    }

    window.addEventListener(APP_CACHE_EVENT_NAME, handler as EventListener)
    return () => {
      window.removeEventListener(APP_CACHE_EVENT_NAME, handler as EventListener)
    }
  }, [queryClient])

  return null
}
