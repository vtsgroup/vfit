/**
 * workers/schemas/plan-generation.ts
 *
 * VFIT B2C — Schemas para geração de plano de treino via IA
 *
 * Exports: generatePlanInputSchema, generatedPlanSchema, GeneratedPlan, GeneratedDay, GeneratedExercise
 */

import { z } from 'zod'

// ============================================
// INPUT — Dados do onboarding para gerar plano
// ============================================
export const generatePlanInputSchema = z.object({
  gender: z.enum(['male', 'female', 'other', 'prefer_not_say']).default('prefer_not_say'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  training_frequency: z.enum(['regularly', 'inconsistently', 'never']).default('never'),
  goal: z.enum(['lose_weight', 'gain_muscle', 'tone', 'health', 'strength', 'flexibility']).default('health'),
  training_location: z.enum(['gym_large', 'gym_small', 'home', 'bodyweight', 'outdoor']).default('gym_large'),
  target_muscles: z.array(z.string()).nullable().default([]).transform((v) => v ?? []),
  age: z.coerce.number().int().min(13).max(100).default(25),
  height_cm: z.coerce.number().min(100).max(250).default(170),
  weight_kg: z.coerce.number().min(30).max(300).default(70),
  target_weight_kg: z.coerce.number().min(30).max(300).optional(),
  days_per_week: z.coerce.number().int().min(1).max(7).default(3),
  session_duration: z.enum(['quick_15', 'short_30', 'medium_45', 'long_60']).default('medium_45'),
  injuries: z.array(z.string()).nullable().default([]).transform((v) => v ?? []),
  preferred_time: z.enum(['morning', 'afternoon', 'evening', 'any']).default('any'),
})

export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>

// ============================================
// OUTPUT — Plano gerado pela IA (JSON parseado)
// ============================================
export const generatedExerciseSchema = z.object({
  name: z.string().min(2).max(200),
  muscle_group: z.string().min(2).max(100),
  sets: z.number().int().min(1).max(10),
  reps: z.string().min(1).max(50), // "10-12", "8", "até falha"
  rest_seconds: z.number().int().min(0).max(300),
  weight_suggestion_kg: z.number().min(0).max(500).optional(),
  notes: z.string().max(500).optional(),
})

export const generatedDaySchema = z.object({
  day_number: z.number().int().min(1).max(7),
  name: z.string().min(2).max(200),
  focus: z.string().min(2).max(200),
  exercises: z.array(generatedExerciseSchema).min(3).max(12),
})

export const generatedPlanSchema = z.object({
  plan_name: z.string().min(3).max(200),
  description: z.string().min(5).max(500),
  estimated_calories_per_session: z.number().int().min(50).max(2000).optional(),
  days: z.array(generatedDaySchema).min(1).max(7),
})

export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>
export type GeneratedDay = z.infer<typeof generatedDaySchema>
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>
