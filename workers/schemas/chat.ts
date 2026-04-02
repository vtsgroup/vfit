/**
 * workers/schemas/chat.ts
 *
 * Chat Zod Schemas - Validation
 *
 * Exports: sendMessageSchema, listMessagesQuerySchema, createConversationSchema, listConversationsQuerySchema
 */

// ============================================
// Chat Zod Schemas - Validation
// ============================================

import { z } from 'zod'

// ============================================
// MESSAGES
// ============================================

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode ser vazia').max(5000, 'Mensagem muito longa'),
  message_type: z.enum(['text', 'image', 'audio', 'workout', 'system']).default('text'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().optional(), // cursor-based: messages before this timestamp
})

// ============================================
// CONVERSATIONS
// ============================================

export const createConversationSchema = z.object({
  participant_id: z.string().uuid('ID do participante inválido'),
})

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20),
  archived: z.coerce.boolean().optional().default(false),
})
