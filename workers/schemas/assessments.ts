/**
 * workers/schemas/assessments.ts
 *
 * Assessments, Reviews & Notifications Schemas
 *
 * Exports: createAssessmentSchema, updateAssessmentSchema, listAssessmentsQuerySchema, uploadAssessmentPhotoSchema, createReviewSchema
 */

// ============================================
// Assessments, Reviews & Notifications Schemas
// ============================================

import { z } from 'zod'

// ============================================
// ASSESSMENTS
// ============================================

const measurementsSchema = z.object({
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  right_arm: z.number().positive().optional(),
  left_arm: z.number().positive().optional(),
  right_thigh: z.number().positive().optional(),
  left_thigh: z.number().positive().optional(),
  right_calf: z.number().positive().optional(),
  left_calf: z.number().positive().optional(),
  right_forearm: z.number().positive().optional(),
  left_forearm: z.number().positive().optional(),
  shoulders: z.number().positive().optional(),
  neck: z.number().positive().optional(),
}).passthrough() // permitir campos extras

const photoSchema = z.object({
  type: z.enum(['front', 'back', 'side_left', 'side_right', 'custom']),
  url: z.string().url(),
  order: z.number().int().min(0).default(0),
})

// Dobras cutâneas (mm)
const skinfoldsSchema = z.object({
  triceps: z.number().positive().optional(),
  chest: z.number().positive().optional(),        // peitoral
  axillary: z.number().positive().optional(),     // axilar média
  subscapular: z.number().positive().optional(),  // subescapular
  suprailiac: z.number().positive().optional(),   // supra-ilíaca
  abdominal: z.number().positive().optional(),
  thigh: z.number().positive().optional(),        // coxa
  biceps: z.number().positive().optional(),
}).passthrough()

// Dados de bioimpedância (entrada direta)
const bioimpedanceSchema = z.object({
  fatPercentage: z.number().min(0).max(100).optional(),
  muscleMassKg: z.number().positive().optional(),
  boneMassKg: z.number().positive().optional(),
  waterPercentage: z.number().min(0).max(100).optional(),
  visceralFatLevel: z.number().int().min(0).max(60).optional(),
  metabolicAge: z.number().int().min(1).max(120).optional(),
  basalMetabolicRate: z.number().positive().optional(),
}).passthrough()

// Protocolos suportados
const protocolSchema = z.enum([
  'pollock_7',
  'pollock_3_male',
  'pollock_3_female',
  'petroski_7',
  'deurenberg',
  'guedes_male',
  'guedes_female',
  'faulkner',
  'bioimpedance',
])

const densityFormulaSchema = z.enum(['siri', 'brozek'])

const activityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])

const genderSchema = z.enum(['male', 'female'])

const REQUIRED_SKINFOLDS_BY_PROTOCOL: Record<string, Array<keyof z.infer<typeof skinfoldsSchema>>> = {
  pollock_7: ['chest', 'axillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'],
  pollock_3_male: ['chest', 'abdominal', 'thigh'],
  pollock_3_female: ['triceps', 'suprailiac', 'thigh'],
  petroski_7: ['chest', 'axillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'],
  deurenberg: ['triceps', 'suprailiac', 'subscapular', 'biceps'],
  guedes_male: ['triceps', 'suprailiac', 'abdominal'],
  guedes_female: ['thigh', 'suprailiac', 'subscapular'],
  faulkner: ['triceps', 'subscapular', 'suprailiac', 'abdominal'],
}

function isValidPositiveNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v > 0
}

export const createAssessmentSchema = z.object({
  student_id: z.string().uuid('student_id deve ser UUID').optional().nullable(),
  assessment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
  weight_kg: z.number().positive().max(500).optional().nullable(),
  height_cm: z.number().positive().max(300).optional().nullable(),
  body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
  muscle_mass_kg: z.number().positive().max(300).optional().nullable(),
  measurements: measurementsSchema.optional().nullable(),
  photos: z.array(photoSchema).max(10).optional(),
  notes: z.string().max(5000).optional().nullable(),
  is_test: z.boolean().default(false).optional(),

  // === Assessment 2.0 ===
  protocol: protocolSchema.optional().default('pollock_7'),
  density_formula: densityFormulaSchema.optional().default('siri'),
  gender: genderSchema.optional(),
  age: z.number().int().min(1).max(120).optional(),
  skinfolds: skinfoldsSchema.optional().nullable(),
  bioimpedance: bioimpedanceSchema.optional().nullable(),
  activity_level: activityLevelSchema.optional().default('moderate'),

  // Diâmetros para massa óssea (opcionais)
  wrist_diameter_cm: z.number().positive().optional(),
  femur_diameter_cm: z.number().positive().optional(),
}).superRefine((data, ctx) => {
  // age + gender são essenciais para os protocolos v2 (cálculos e classificações)
  if (data.age == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['age'], message: 'Idade é obrigatória' })
  }
  if (!data.gender) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gender'], message: 'Sexo biológico é obrigatório' })
  }

  const protocol = data.protocol

  // coerência sexo ↔ protocolo
  if (data.gender) {
    if (protocol === 'pollock_3_male' && data.gender !== 'male') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo masculino requer sexo masculino' })
    }
    if (protocol === 'pollock_3_female' && data.gender !== 'female') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo feminino requer sexo feminino' })
    }
    if (protocol === 'guedes_male' && data.gender !== 'male') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo masculino requer sexo masculino' })
    }
    if (protocol === 'guedes_female' && data.gender !== 'female') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo feminino requer sexo feminino' })
    }
  }

  // bioimpedância não requer dobras
  if (protocol === 'bioimpedance') return

  const required = REQUIRED_SKINFOLDS_BY_PROTOCOL[protocol]
  if (!required) return

  if (!data.skinfolds) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['skinfolds'],
      message: 'Dobras cutâneas são obrigatórias para o protocolo selecionado',
    })
    return
  }

  for (const k of required) {
    const v = (data.skinfolds as Record<string, unknown>)[String(k)]
    if (!isValidPositiveNumber(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skinfolds', String(k)],
        message: `Dobra obrigatória: ${String(k)}`,
      })
    }
  }
})

export const updateAssessmentSchema = z.object({
  assessment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional(),
  weight_kg: z.number().positive().max(500).optional().nullable(),
  height_cm: z.number().positive().max(300).optional().nullable(),
  body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
  muscle_mass_kg: z.number().positive().max(300).optional().nullable(),
  measurements: measurementsSchema.optional().nullable(),
  photos: z.array(photoSchema).max(10).optional(),
  notes: z.string().max(5000).optional().nullable(),

  // === Assessment 2.0 ===
  protocol: protocolSchema.optional(),
  density_formula: densityFormulaSchema.optional(),
  gender: genderSchema.optional(),
  age: z.number().int().min(1).max(120).optional(),
  skinfolds: skinfoldsSchema.optional().nullable(),
  bioimpedance: bioimpedanceSchema.optional().nullable(),
  activity_level: activityLevelSchema.optional(),
  wrist_diameter_cm: z.number().positive().optional(),
  femur_diameter_cm: z.number().positive().optional(),
}).superRefine((data, ctx) => {
  // Só valida coerência se houver protocolo/gender/age em jogo
  const protocol = data.protocol
  if (!protocol) return

  // coerência sexo ↔ protocolo (quando gender é enviado)
  if (data.gender) {
    if (protocol === 'pollock_3_male' && data.gender !== 'male') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo masculino requer sexo masculino' })
    }
    if (protocol === 'pollock_3_female' && data.gender !== 'female') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo feminino requer sexo feminino' })
    }
    if (protocol === 'guedes_male' && data.gender !== 'male') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo masculino requer sexo masculino' })
    }
    if (protocol === 'guedes_female' && data.gender !== 'female') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['protocol'], message: 'Protocolo feminino requer sexo feminino' })
    }
  }

  if (protocol === 'bioimpedance') return

  const required = REQUIRED_SKINFOLDS_BY_PROTOCOL[protocol]
  if (!required) return

  // Se o usuário está mudando skinfolds, validar as obrigatórias
  if (data.skinfolds) {
    for (const k of required) {
      const v = (data.skinfolds as Record<string, unknown>)[String(k)]
      if (!isValidPositiveNumber(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['skinfolds', String(k)],
          message: `Dobra obrigatória: ${String(k)}`,
        })
      }
    }
  }
})

export const listAssessmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  student_id: z.string().uuid().optional(),
  sort: z.enum(['assessment_date', 'created_at']).default('assessment_date'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const uploadAssessmentPhotoSchema = z.object({
  type: z.enum(['front', 'back', 'side_left', 'side_right', 'custom']),
  content_type: z.string().regex(/^image\/(jpeg|png|webp)$/, 'Tipo de imagem inválido'),
})

// ============================================
// REVIEWS
// ============================================

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(10, 'Avaliação muito curta').max(2000).optional().nullable(),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  review_text: z.string().min(10).max(2000).optional().nullable(),
})

export const manageReviewSchema = z.object({
  is_public: z.boolean().optional(),
  is_featured: z.boolean().optional(),
})

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  is_public: z.coerce.boolean().optional(),
})

// ============================================
// NOTIFICATIONS
// ============================================

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(['payment', 'workout', 'assessment', 'badge', 'system', 'review']),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(2000),
  link: z.string().max(500).optional().nullable(),
})

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['payment', 'workout', 'assessment', 'badge', 'system', 'review']).optional(),
  unread_only: z.coerce.boolean().default(false),
})

// ============================================
// BADGES (read-only para student)
// ============================================

export const listBadgesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(50),
  student_id: z.string().uuid().optional(),
})

// ============================================
// TYPES
// ============================================

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>
export type ListAssessmentsQuery = z.infer<typeof listAssessmentsQuerySchema>
export type UploadAssessmentPhotoInput = z.infer<typeof uploadAssessmentPhotoSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ManageReviewInput = z.infer<typeof manageReviewSchema>
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>
export type ListBadgesQuery = z.infer<typeof listBadgesQuerySchema>
