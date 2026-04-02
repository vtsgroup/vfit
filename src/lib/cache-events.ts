// ============================================
// cache-events.ts — Eventos de cache para invalidação cross-component
// ============================================
//
// O que faz:
//   Emite CustomEvents no window quando dados mudam (students, notifications,
//   admin). Um listener centralizado invalida as queryKeys do TanStack Query.
//   Evita prop-drilling de invalidação entre componentes desconectados.
//
// Exports principais:
//   emitCacheEvent(event) → void — dispara evento no window
//   invalidateByCacheEvent(queryClient, event) → void — invalida queries
//   AppCacheEventType — union type de todos os eventos de cache
// ============================================
import type { QueryClient } from '@tanstack/react-query'

export type AppCacheEventType =
  | 'students:changed'
  | 'student:detail:changed'
  | 'notifications:changed'
  | 'admin:users:changed'
  | 'admin:personals:changed'
  | 'admin:payments:changed'
  | 'admin:workouts:changed'
  | 'admin:assessments:changed'
  | 'admin:students:changed'
  | 'admin:all:changed'

export interface AppCacheEvent {
  type: AppCacheEventType
  entityId?: string
}

export const APP_CACHE_EVENT_NAME = 'app:cache-event'

export function emitCacheEvent(event: AppCacheEvent) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<AppCacheEvent>(APP_CACHE_EVENT_NAME, { detail: event }))
}

export async function invalidateByCacheEvent(queryClient: QueryClient, event: AppCacheEvent) {
  switch (event.type) {
    case 'students:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['students'] }),
        queryClient.invalidateQueries({ queryKey: ['personal', 'stats'] }),
      ])
      return

    case 'student:detail:changed':
      await Promise.all([
        event.entityId
          ? queryClient.invalidateQueries({ queryKey: ['students', event.entityId] })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: ['students'] }),
        queryClient.invalidateQueries({ queryKey: ['personal', 'stats'] }),
      ])
      return

    case 'notifications:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] }),
      ])
      return

    case 'admin:users:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:personals:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'personals'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:payments:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:workouts:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:assessments:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'assessments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:students:changed':
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'students'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      return

    case 'admin:all:changed':
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      return

    default:
      return
  }
}
