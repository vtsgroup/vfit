// ============================================
// agents.ts (schema) — Validação de endpoints de agentes Unipile/Instagram
// ============================================
//
// O que faz:
//   Schemas Zod para validação dos endpoints de agentes IA.
//   Valida dispatch de ações Instagram e toggle do kill-switch operacional.
//
// Exports principais:
//   instagramDispatchSchema — body de POST /agents/instagram/dispatch
//     (intent: post|dm|comment|handoff, message, target?, metadata?, dry_run?)
//   unipileKillSwitchSchema — body de POST /agents/kill-switch
//     (enabled: boolean, reason?: string)
//   InstagramDispatchInput, UnipileKillSwitchInput — tipos inferidos
// ============================================
import { z } from 'zod'

export const instagramDispatchSchema = z.object({
  intent: z.enum(['post', 'dm', 'comment', 'handoff']),
  message: z.string().min(2).max(5000),
  target: z.string().min(2).max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  dry_run: z.boolean().optional(),
})

export const unipileKillSwitchSchema = z.object({
  enabled: z.boolean(),
  reason: z.string().min(3).max(300).optional(),
})

export type InstagramDispatchInput = z.infer<typeof instagramDispatchSchema>
export type UnipileKillSwitchInput = z.infer<typeof unipileKillSwitchSchema>
