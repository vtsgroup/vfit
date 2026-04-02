// ============================================
// workout-sessions.ts (schema) — Validação de execução de sessões
// ============================================
//
// O que faz:
//   Schemas Zod para os dois endpoints de execução de sessão de treino:
//   avanço de fase (exercise → rest → next_preview → completed)
//   e log de exercício realizado (sets, reps, carga, notas).
//
// Exports principais:
//   sessionAdvanceSchema — body de POST /:id/session/advance
//     (force_phase?, rest_remaining_seconds?)
//   sessionLogSchema — body de POST /:id/session/log
//     (exercise_id, sets_done, reps_done?, load_used?, notes?)
//   SessionAdvanceInput, SessionLogInput — tipos inferidos
// ============================================
import { z } from 'zod'

export const sessionAdvanceSchema = z.object({
  force_phase: z.enum(['exercise', 'rest', 'next_preview', 'completed']).optional(),
  rest_remaining_seconds: z.coerce.number().int().min(0).max(3600).optional(),
})

export const sessionLogSchema = z.object({
  exercise_id: z.string().min(1),
  sets_done: z.coerce.number().int().min(0).max(100),
  reps_done: z.string().max(50).optional().nullable(),
  load_used: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type SessionAdvanceInput = z.infer<typeof sessionAdvanceSchema>
export type SessionLogInput = z.infer<typeof sessionLogSchema>
