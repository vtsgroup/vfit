// ============================================
// use-notification-preferences.ts — Hooks para preferências de notificação
// ============================================
//
// O que faz:
//   Centraliza data fetching e mutação das preferências de notificação
//   do usuário autenticado: busca e atualização parcial (PATCH).
//
// Exports principais:
//   useNotificationPreferences() → { data: NotificationPreferences, isLoading }
//   useUpdateNotificationPreferences() → mutation — salva preferências
//
// Hooks usados: useQuery, useMutation, useQueryClient, useAuthStore
// Auth: enabled: isReady
// ============================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { toast } from '@/stores/app-store'

export interface NotificationPreferences {
  id: string
  user_id: string
  in_app_enabled: boolean
  push_enabled: boolean
  email_enabled: boolean
  workout_enabled: boolean
  payment_enabled: boolean
  student_enabled: boolean
  assessment_enabled: boolean
  calendar_enabled: boolean
  calendar_reminder_24h_enabled: boolean
  calendar_reminder_1h_enabled: boolean
  calendar_reminder_15m_enabled: boolean
  marketing_enabled: boolean
  created_at: string
  updated_at: string
}

export type NotificationPreferencesPatch = Partial<Pick<
  NotificationPreferences,
  | 'in_app_enabled'
  | 'push_enabled'
  | 'email_enabled'
  | 'workout_enabled'
  | 'payment_enabled'
  | 'student_enabled'
  | 'assessment_enabled'
  | 'calendar_enabled'
  | 'calendar_reminder_24h_enabled'
  | 'calendar_reminder_1h_enabled'
  | 'calendar_reminder_15m_enabled'
  | 'marketing_enabled'
>>

export function useNotificationPreferences() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<{ preferences: NotificationPreferences }>({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const res = await api.get<{ preferences: NotificationPreferences }>('/notifications/preferences')
      return res.data
    },
    enabled: isReady,
    staleTime: 30_000,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: NotificationPreferencesPatch) => {
      const res = await api.patch<{ preferences: NotificationPreferences }>('/notifications/preferences', patch)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notifications', 'preferences'], data)
      toast.success('Preferências atualizadas')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar preferências')
    },
  })
}
