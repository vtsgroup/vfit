/**
 * workers/schemas/workouts.ts
 *
 * Workouts Zod Schemas - Validation
 *
 * Exports: createWorkoutSchema, updateWorkoutSchema, addExerciseSchema, updateExerciseSchema, reorderExercisesSchema
 */

// ============================================
// Workouts Zod Schemas - Validation
// ============================================

import { z } from 'zod'

// ============================================
// CREATE WORKOUT
// ============================================
export const createWorkoutSchema = z.object({
  student_id: z.string().uuid('student_id deve ser UUID').optional().nullable(),
  is_template: z.boolean().default(false),
  template_id: z.string().optional(),
  name: z.string().min(2, 'Nome muito curto').max(255),
  description: z.string().max(2000).optional().nullable(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional()
    .nullable(),
  notes: z.string().max(2000).optional().nullable(),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string().min(1),
        sets: z.number().int().min(1).max(50),
        reps: z.string().min(1).max(50),
        rest_seconds: z.number().int().min(0).max(600).default(60),
        load: z.string().max(50).optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
        technique_tips: z.string().max(500).optional().nullable(),
        order_index: z.number().int().min(0),
      })
    )
    .optional()
    .default([]),
})

// ============================================
// UPDATE WORKOUT
// ============================================
export const updateWorkoutSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['active', 'completed', 'archived', 'paused']).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

// ============================================
// ADD EXERCISE TO WORKOUT
// ============================================
export const addExerciseSchema = z.object({
  exercise_id: z.string().min(1),
  sets: z.number().int().min(1).max(50),
  reps: z.string().min(1).max(50),
  rest_seconds: z.number().int().min(0).max(600).default(60),
  load: z.string().max(50).optional().nullable(),
  order_index: z.number().int().min(0),
  notes: z.string().max(500).optional().nullable(),
  technique_tips: z.string().max(500).optional().nullable(),
})

// ============================================
// UPDATE EXERCISE IN WORKOUT
// ============================================
export const updateExerciseSchema = z.object({
  sets: z.number().int().min(1).max(50).optional(),
  reps: z.string().min(1).max(50).optional(),
  rest_seconds: z.number().int().min(0).max(600).optional(),
  load: z.string().max(50).optional().nullable(),
  order_index: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional().nullable(),
  technique_tips: z.string().max(500).optional().nullable(),
})

// ============================================
// REORDER EXERCISES
// ============================================
export const reorderExercisesSchema = z.object({
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      order_index: z.number().int().min(0),
    })
  ),
})

// ============================================
// COMPLETE WORKOUT (student logs)
// ============================================
export const completeWorkoutSchema = z.object({
  duration_minutes: z.number().int().min(1).max(600).optional(),
  exercises_completed: z.array(
    z.object({
      exercise_id: z.string(),
      sets_done: z.number().int().min(0),
      reps_done: z.string().max(50).optional(),
      load_used: z.string().max(50).optional(),
      completed: z.boolean().default(true),
      notes: z.string().max(500).optional(),
    })
  ),
  student_notes: z.string().max(2000).optional().nullable(),
  feeling: z.enum(['great', 'good', 'tired', 'pain']).optional(),
})

// ============================================
// LIST WORKOUTS QUERY
// ============================================
export const listWorkoutsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  student_id: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'archived', 'paused']).optional(),
  is_template: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(['created_at', 'start_date', 'name', 'status'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// LIST WORKOUT LOGS QUERY
// ============================================
export const listLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  student_id: z.string().uuid().optional(),
  workout_id: z.string().uuid().optional(),
  feeling: z.enum(['great', 'good', 'tired', 'pain']).optional(),
})

// ============================================
// WORKOUT HISTORY HEATMAP QUERY (student)
// ============================================
export const workoutHeatmapQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).default(new Date().getUTCFullYear()),
})

// ============================================
// WORKOUT PROGRESS QUERY (student)
// ============================================
export const workoutProgressQuerySchema = z.object({
  exercise_id: z.string().min(1, 'exercise_id é obrigatório'),
  days: z.coerce.number().int().min(7).max(730).default(180),
})

// ============================================
// CLONE FROM TEMPLATE
// ============================================
export const cloneTemplateSchema = z.object({
  template_id: z.string().min(1),
  student_id: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
})

// ============================================
// Types inferred
// ============================================
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>
export type AddExerciseInput = z.infer<typeof addExerciseSchema>
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>
export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>
export type ListWorkoutsQuery = z.infer<typeof listWorkoutsQuerySchema>
export type ListLogsQuery = z.infer<typeof listLogsQuerySchema>
export type WorkoutHeatmapQuery = z.infer<typeof workoutHeatmapQuerySchema>
export type WorkoutProgressQuery = z.infer<typeof workoutProgressQuerySchema>
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>
