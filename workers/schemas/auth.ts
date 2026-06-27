/**
 * workers/schemas/auth.ts
 *
 * Auth Zod Schemas - Validation
 *
 * Exports: registerPersonalSchema, registerStudentSchema, loginSchema, refreshSchema, forgotPasswordSchema
 */

// ============================================
// Auth Zod Schemas - Validation
// ============================================

import { z } from 'zod'

// ============================================
// REGISTER
// ============================================
export const registerPersonalSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  full_name: z.string().min(2, 'Nome muito curto').max(255),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF no formato 000.000.000-00'),
  phone: z.string().min(10).max(20).optional(),
  cref: z
    .string()
    .min(3, 'CREF muito curto')
    .max(20, 'CREF muito longo')
    .transform((val) => val.replace(/\s+/g, '').toUpperCase()),
  cref_state: z.string().min(2, 'Selecione o estado').max(2, 'UF com 2 letras').transform((v) => v.toUpperCase()),
  specialties: z.array(z.string()).optional().default([]),
  referral_code: z.string().optional(),
  turnstile_token: z.string().default(''),
})

export const registerNutritionistSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  full_name: z.string().min(2, 'Nome muito curto').max(255),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF no formato 000.000.000-00'),
  phone: z.string().min(10).max(20).optional(),
  crn: z
    .string()
    .min(3, 'CRN muito curto')
    .max(20, 'CRN muito longo')
    .transform((val) => val.replace(/\s+/g, '').toUpperCase()),
  crn_state: z.string().min(2, 'Selecione o estado').max(2, 'UF com 2 letras').transform((v) => v.toUpperCase()),
  specialties: z.array(z.string()).optional().default([]),
  referral_code: z.string().optional(),
  turnstile_token: z.string().default(''),
})

export const registerStudentSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  full_name: z.string().min(2, 'Nome muito curto').max(255),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF no formato 000.000.000-00')
    .optional(),
  phone: z.string().min(10).max(20).optional(),
  invitation_token: z.string().min(1, 'Token de convite inválido').optional(),
  turnstile_token: z.string().default(''),
})

// ============================================
// LOGIN
// ============================================
export const loginSchema = z.object({
  identifier: z.string().min(1, 'CPF ou email obrigatório'),
  // Keep email as optional alias for backward compatibility
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(1, 'Senha obrigatória'),
  two_factor_code: z.string().regex(/^\d{6}$/, 'Código 2FA inválido').optional(),
  turnstile_token: z.string().default(''),
})

// ============================================
// REFRESH TOKEN
// ============================================
export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token obrigatório'),
})

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  turnstile_token: z.string().min(1, 'Verificação anti-bot necessária'),
})

// ============================================
// RESET PASSWORD
// ============================================
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Token obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  code: z.string().regex(/^\d{6}$/, 'Código inválido').optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
}).superRefine((data, ctx) => {
  const hasToken = !!data.token
  const hasCodeFlow = !!data.email && !!data.code

  if (!hasToken && !hasCodeFlow) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe token ou email + código para redefinir a senha',
    })
  }
})

// ============================================
// VERIFY EMAIL
// ============================================
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
})

// ============================================
// CHANGE PASSWORD (autenticado)
// ============================================
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual obrigatória'),
  new_password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
})

// ============================================
// 2FA (TOTP)
// ============================================
export const twoFactorSetupSchema = z.object({})

export const twoFactorVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Código 2FA inválido'),
})

export const twoFactorDisableSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Código 2FA inválido'),
})

// ============================================
// OAuth initiate
// ============================================
export const oauthInitiateSchema = z.object({
  provider: z.enum(['google']),
  redirect_uri: z.string().url().optional(),
})

// ============================================
// Types inferred
// ============================================
export type RegisterPersonalInput = z.infer<typeof registerPersonalSchema>
export type RegisterNutritionistInput = z.infer<typeof registerNutritionistSchema>
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>
