/**
 * workers/schemas/calendar.ts
 *
 * Calendar (Agenda) — Zod Schemas
 *
 * Exports: listCalendarEventsQuerySchema, calendarEventColorSchema, calendarEventStatusSchema, recurrenceSchema, createCalendarEventSchema, updateCalendarEventSchema
 */

// ============================================
// Calendar (Agenda) — Zod Schemas
// ============================================

import { z } from 'zod'

export const listCalendarEventsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
})

export const calendarEventColorSchema = z.enum(['blue', 'green', 'purple', 'orange', 'red']).default('blue')

export const calendarEventStatusSchema = z.enum(['available', 'partial', 'busy']).optional()

export const recurrenceSchema = z.object({
  freq: z.enum(['daily', 'weekly', 'monthly']),
  count: z.number().int().min(1).max(52),
})

export const createCalendarEventSchema = z.object({
  student_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  meeting_url: z.string().url().optional().nullable(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  color: calendarEventColorSchema.optional(),
  status: calendarEventStatusSchema,
  recurrence: recurrenceSchema.optional(),
})

export const updateCalendarEventSchema = z.object({
  student_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  meeting_url: z.string().url().optional().nullable(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  color: calendarEventColorSchema.optional(),
  status: calendarEventStatusSchema,
})
