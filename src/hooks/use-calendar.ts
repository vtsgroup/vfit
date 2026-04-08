/**
 * src/hooks/use-calendar.ts
 *
 * Calendar hooks — TanStack Query
 *
 * Exports: CalendarEventColor, CalendarEventStatus, CalendarEventApi, ListCalendarEventsResponse, CreateCalendarEventInput, RecurrenceInput
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, useCalendarEvents, useCreateCalendarEvent
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Calendar hooks — TanStack Query
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

type CalendarEventApiColor = 'blue' | 'green' | 'purple' | 'orange' | 'red'
export type CalendarEventColor = 'brand' | 'green' | 'purple' | 'orange' | 'red'
export type CalendarEventStatus = 'available' | 'partial' | 'busy' | null

interface CalendarEventApiResponse {
  id: string
  personal_id: string
  student_id: string | null
  title: string | null
  notes: string | null
  meeting_url: string | null
  start_at: string
  end_at: string
  color: CalendarEventApiColor
  status: CalendarEventStatus
  recurrence_group_id: string | null
  recurrence_index: number | null
  created_at: string
  updated_at: string
  personal_name: string
  student_name: string | null
}

export interface CalendarEventApi extends Omit<CalendarEventApiResponse, 'color'> {
  color: CalendarEventColor
}

function normalizeCalendarColor(color: CalendarEventApiColor): CalendarEventColor {
  return color === 'blue' ? 'brand' : color
}

function toApiCalendarColor(color: CalendarEventColor | undefined): CalendarEventApiColor | undefined {
  if (!color) return undefined
  return color === 'brand' ? 'blue' : color
}

export interface RecurrenceInput {
  freq: 'daily' | 'weekly' | 'monthly'
  count: number
}

export interface ListCalendarEventsResponse {
  events: CalendarEventApi[]
}

export interface CreateCalendarEventInput {
  student_id?: string | null
  title?: string | null
  notes?: string | null
  meeting_url?: string | null
  start_at: string
  end_at: string
  color?: CalendarEventColor
  status?: Exclude<CalendarEventStatus, null>
  recurrence?: RecurrenceInput
}

export interface UpdateCalendarEventInput {
  student_id?: string | null
  title?: string | null
  notes?: string | null
  meeting_url?: string | null
  start_at?: string
  end_at?: string
  color?: CalendarEventColor
  status?: Exclude<CalendarEventStatus, null> | null
}

export function useCalendarEvents(params: { from: string; to: string }) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<ListCalendarEventsResponse>({
    queryKey: ['calendar', 'events', params],
    queryFn: async () => {
      const res = await api.get<ListCalendarEventsResponse>('/calendar/events', {
        params: { from: params.from, to: params.to },
      })
      return {
        events: (res.data.events as CalendarEventApiResponse[]).map((event) => ({
          ...event,
          color: normalizeCalendarColor(event.color),
        })),
      }
    },
    enabled: isReady && !!params.from && !!params.to,
    staleTime: 30_000,
  })
}

export function useCreateCalendarEvent(rangeToInvalidate?: { from: string; to: string }) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCalendarEventInput) => {
      const res = await api.post<{ event?: CalendarEventApiResponse; events?: CalendarEventApiResponse[] }>('/calendar/events', {
        ...input,
        color: toApiCalendarColor(input.color),
      })
      const events = res.data.events ?? (res.data.event ? [res.data.event] : [])
      return events.map((event) => ({
        ...event,
        color: normalizeCalendarColor(event.color),
      }))
    },
    onSuccess: () => {
      toast.success('Agendamento criado')
      qc.invalidateQueries({ queryKey: ['calendar', 'events', rangeToInvalidate] })
      qc.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao criar agendamento')
    },
  })
}

export function useUpdateCalendarEvent(id: string, rangeToInvalidate?: { from: string; to: string }) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateCalendarEventInput) => {
      const res = await api.patch<{ event: CalendarEventApiResponse }>(`/calendar/events/${id}`, {
        ...input,
        color: toApiCalendarColor(input.color),
      })
      return {
        ...res.data.event,
        color: normalizeCalendarColor(res.data.event.color),
      }
    },
    onSuccess: () => {
      toast.success('Agendamento atualizado')
      qc.invalidateQueries({ queryKey: ['calendar', 'events', rangeToInvalidate] })
      qc.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar agendamento')
    },
  })
}

export function useDeleteCalendarEvent(id: string, rangeToInvalidate?: { from: string; to: string }) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/calendar/events/${id}`)
      return true
    },
    onSuccess: () => {
      toast.success('Agendamento removido')
      qc.invalidateQueries({ queryKey: ['calendar', 'events', rangeToInvalidate] })
      qc.invalidateQueries({ queryKey: ['calendar', 'events'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover agendamento')
    },
  })
}
