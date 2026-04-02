/**
 * workers/schemas/ai.ts
 *
 * AI Zod Schemas - Validation
 *
 * Exports: generateWorkoutSchema, comparePhotosSchema, assistantChatSchema, generateContentSchema, analyzeSentimentSchema
 */

// ============================================
// AI Zod Schemas - Validation
// ============================================

import { z } from 'zod'

// ============================================
// GENERATE WORKOUT (AI)
// ============================================
export const generateWorkoutSchema = z.object({
  student_id: z.string().uuid().optional(),
  goal: z.string().min(3, 'Objetivo muito curto').max(500),
  // Accept both old ('simple'|'moderate'|'complex') and new ('low'|'medium'|'high') values
  complexity: z.enum(['low', 'medium', 'high', 'simple', 'moderate', 'complex']).default('low'),
  days_per_week: z.number().int().min(1).max(7).default(3),
  split_type: z.enum(['abc', 'upper_lower', 'push_pull_legs', 'full_body', 'auto']).default('auto'),
  extra_instructions: z.string().max(2000).optional().nullable(),
})

// ============================================
// COMPARE PHOTOS (AI)
// ============================================
export const comparePhotosSchema = z.object({
  assessment_id: z.string().uuid().optional(),
  before_url: z.string().url('URL da foto antes inválida'),
  after_url: z.string().url('URL da foto depois inválida'),
})

// ============================================
// ASSISTANT CHAT (AI)
// ============================================
export const assistantChatSchema = z.object({
  question: z.string().min(3, 'Pergunta muito curta').max(2000),
  context_type: z.enum(['general', 'billing', 'students', 'workouts']).default('general'),
})

// ============================================
// CONTENT GENERATION (AI)
// ============================================
export const generateContentSchema = z.object({
  type: z.enum(['instagram', 'email', 'whatsapp']),
  topic: z.string().min(3).max(500),
})

// ============================================
// SENTIMENT ANALYSIS (AI)
// ============================================
export const analyzeSentimentSchema = z.object({
  feedback: z.string().min(5, 'Feedback muito curto').max(5000),
  student_id: z.string().uuid().optional(),
})

// ============================================
// SMART BILLING SUGGESTION (AI)
// ============================================
export const smartBillingSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
})

// ============================================
// VIDEO TRANSCRIPTION (AI)
// ============================================
export const transcribeVideoSchema = z.object({
  video_url: z.string().url(),
  language: z.enum(['pt', 'en', 'es']).default('pt'),
  exercise_id: z.string().optional(),
})

// ============================================
// TYPES
// ============================================
export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>
export type ComparePhotosInput = z.infer<typeof comparePhotosSchema>
export type AssistantChatInput = z.infer<typeof assistantChatSchema>
export type GenerateContentInput = z.infer<typeof generateContentSchema>
export type AnalyzeSentimentInput = z.infer<typeof analyzeSentimentSchema>
export type SmartBillingInput = z.infer<typeof smartBillingSchema>
export type TranscribeVideoInput = z.infer<typeof transcribeVideoSchema>
