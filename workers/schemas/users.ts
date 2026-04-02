/**
 * workers/schemas/users.ts
 *
 * Users & Students Zod Schemas - Validation
 *
 * Exports: updateUserSchema, updatePersonalSchema, updatePersonalSettingsSchema, inviteStudentSchema, quickInviteStudentSchema
 */

// ============================================
// Users & Students Zod Schemas - Validation
// ============================================

import { z } from 'zod'

// ============================================
// UPDATE USER PROFILE (shared fields)
// ============================================
export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  phone: z.string().min(10).max(20).optional(),
  profile_photo_url: z.string().url().optional().nullable(),
})

// ============================================
// UPDATE PERSONAL PROFILE
// ============================================
export const updatePersonalSchema = z.object({
  cref: z
    .string()
    .regex(/^\d{6}-[A-Z]\/[A-Z]{2}$/, 'CREF no formato 123456-G/SP')
    .optional(),
  cref_state: z.string().length(2).optional(),
  specialties: z.array(z.string().max(50)).max(20).optional(),
  bio: z.string().max(2000).optional().nullable(),
  public_url_slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug: apenas letras minúsculas, números e hífens')
    .optional(),
  is_public_profile: z.boolean().optional(),
  show_testimonials: z.boolean().optional(),
  show_transformations: z.boolean().optional(),
})

// ============================================
// UPDATE PERSONAL SETTINGS
// ============================================
export const updatePersonalSettingsSchema = z.object({
  is_public_profile: z.boolean().optional(),
  show_testimonials: z.boolean().optional(),
  show_transformations: z.boolean().optional(),
  accepted_fee_percentage: z.number().min(0).max(100).optional(),
})

// ============================================
// INVITE STUDENT
// ============================================
export const inviteStudentSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2).max(255),
  phone: z.string().min(10).max(20).optional(),
  student_type: z.enum(['personal_training', 'consultoria']).default('personal_training'),
  consultation_price: z.number().positive('Valor da consultoria deve ser positivo').optional(),
  consultation_billing_cycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']).default('MONTHLY'),
  consultation_notes: z.string().max(2000).optional(),
}).refine(
  (data) => data.student_type !== 'consultoria' || (data.consultation_price && data.consultation_price > 0),
  { message: 'Preço da consultoria é obrigatório', path: ['consultation_price'] }
)

// ============================================
// QUICK INVITE (QR / live) — email/nome opcionais
// - sem email/nome: gera token + link + placeholder (sem enviar email)
// - com email (e nome opcional): cria convite e tenta enviar email
// ============================================
export const quickInviteStudentSchema = z.object({
  email: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional()
    .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: 'Email inválido' }),
  full_name: z.string().trim().transform((v) => v || undefined).optional(),
  phone: z.string().min(10).max(20).optional(),
  student_type: z.enum(['personal_training', 'consultoria']).default('personal_training'),
  consultation_price: z.number().positive('Valor da consultoria deve ser positivo').optional(),
  consultation_billing_cycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']).default('MONTHLY'),
  consultation_notes: z.string().max(2000).optional(),
}).refine(
  (data) => data.student_type !== 'consultoria' || (data.consultation_price && data.consultation_price > 0),
  { message: 'Preço da consultoria é obrigatório', path: ['consultation_price'] }
)

// ============================================
// MANUAL CREATE STUDENT (cadastro direto pelo personal)
// ============================================
export const manualCreateStudentSchema = z.object({
  full_name: z.string().min(3).max(255),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF no formato 000.000.000-00'),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).default('female'),
  phone: z.string().min(10).max(20),
  email: z.string().email('Email inválido'),
})

// ============================================
// UPDATE STUDENT (pelo personal)
// ============================================
export const updateStudentSchema = z.object({
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional()
    .nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  height_cm: z.number().min(50).max(300).optional().nullable(),
  goals: z.array(z.string().max(50)).max(10).optional(),
  medical_restrictions: z.string().max(2000).optional().nullable(),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  payment_status: z.enum(['paid', 'pending', 'overdue', 'exempt']).optional(),
})

// ============================================
// UPDATE STUDENT STATUS
// ============================================
export const updateStudentStatusSchema = z.object({
  status: z.enum(['active', 'blocked', 'inactive', 'churned']),
  reason: z.string().max(500).optional(),
})

// ============================================
// STUDENT SELF-UPDATE (pelo próprio aluno)
// ============================================
export const studentSelfUpdateSchema = z.object({
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD')
    .optional()
    .nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  height_cm: z.number().min(50).max(300).optional().nullable(),
  goals: z.array(z.string().max(50)).max(10).optional(),
  medical_restrictions: z.string().max(2000).optional().nullable(),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  photo_sharing_consent: z.boolean().optional(),
  testimonial_consent: z.boolean().optional(),
})

// ============================================
// STUDENT LINK TO PERSONAL (vínculo posterior)
// ============================================
export const linkStudentToPersonalSchema = z.object({
  referral_code: z
    .string()
    .trim()
    .min(4, 'Código de referência inválido')
    .max(32, 'Código de referência inválido')
    .regex(/^[A-Za-z0-9_-]+$/, 'Código de referência inválido'),
})

// ============================================
// QUERY PARAMS
// ============================================
export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  status: z.enum(['active', 'blocked', 'inactive', 'churned']).optional(),
  payment_status: z.enum(['paid', 'pending', 'overdue', 'exempt']).optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(['full_name', 'created_at', 'last_payment_date', 'total_workouts_completed', 'current_streak'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// UPLOAD PHOTO
// ============================================
export const uploadPhotoSchema = z.object({
  content_type: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ]),
  filename: z.string().max(255).optional(),
})

// ============================================
// Types inferred
// ============================================
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdatePersonalInput = z.infer<typeof updatePersonalSchema>
export type UpdatePersonalSettingsInput = z.infer<typeof updatePersonalSettingsSchema>
export type InviteStudentInput = z.infer<typeof inviteStudentSchema>
export type QuickInviteStudentInput = z.infer<typeof quickInviteStudentSchema>
export type ManualCreateStudentInput = z.infer<typeof manualCreateStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusSchema>
export type StudentSelfUpdateInput = z.infer<typeof studentSelfUpdateSchema>
export type LinkStudentToPersonalInput = z.infer<typeof linkStudentToPersonalSchema>
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>
export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>
