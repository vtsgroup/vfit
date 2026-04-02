/**
 * workers/schemas/payments.ts
 *
 * Payments & Affiliates Zod Schemas
 *
 * Exports: createPaymentSchema, createPaymentLinkSchema, createSubscriptionSchema, listSubscriptionsQuerySchema, requestPixTransferSchema
 */

// ============================================
// Payments & Affiliates Zod Schemas
// ============================================

import { z } from 'zod'

// ============================================
// PAYMENTS
// ============================================

export const createPaymentSchema = z.object({
  payer_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  description: z.string().max(500).optional().nullable(),
  // Se true, cria cobrança real no Asaas
  create_in_asaas: z.boolean().optional().default(true),
})

export const createPaymentLinkSchema = z.object({
  payer_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']).default('pix'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  description: z.string().max(500).optional().nullable(),
  message_template: z.string().max(1000).optional().nullable(),
})

// ============================================
// SUBSCRIPTIONS (Cobranças Recorrentes)
// ============================================

export const createSubscriptionSchema = z.object({
  payer_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']),
  billing_cycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY']).default('MONTHLY'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  description: z.string().max(500).optional().nullable(),
})

export const listSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  status: z.enum(['active', 'inactive', 'cancelled', 'expired', 'overdue']).optional(),
  payer_id: z.string().uuid().optional(),
})

// ============================================
// PIX TRANSFERS (Saques)
// ============================================

export const requestPixTransferSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  pix_key: z.string().min(1, 'Chave PIX obrigatória').max(100),
  description: z.string().max(200).optional(),
})

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'failed', 'refunded', 'cancelled']),
  paid_at: z.string().datetime().optional().nullable(),
  asaas_payment_id: z.string().max(100).optional().nullable(),
  stripe_payment_intent_id: z.string().max(100).optional().nullable(),
  invoice_url: z.string().url().optional().nullable(),
  receipt_url: z.string().url().optional().nullable(),
})

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  status: z.enum(['pending', 'confirmed', 'failed', 'refunded', 'cancelled']).optional(),
  payment_method: z.enum(['pix', 'credit_card', 'boleto']).optional(),
  payer_id: z.string().uuid().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(['created_at', 'due_date', 'amount', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// WEBHOOKS (Asaas / Stripe)
// ============================================

export const asaasWebhookSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    status: z.string(),
    value: z.number(),
    netValue: z.number().optional(),
    paymentDate: z.string().optional().nullable(),
    invoiceUrl: z.string().optional().nullable(),
    bankSlipUrl: z.string().optional().nullable(),
    transactionReceiptUrl: z.string().optional().nullable(),
  }).passthrough(),
}).passthrough()

export const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
}).passthrough()

// ============================================
// AFFILIATES
// ============================================

export const activateAffiliateSchema = z.object({
  // Personal já tem referral_code auto-gerado,
  // mas pode customizar
  custom_referral_code: z
    .string()
    .min(3).max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Código deve conter apenas letras, números, _ ou -')
    .optional(),
})

export const listReferralsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  status: z.enum(['pending', 'active', 'churned']).optional(),
})

export const listCommissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  status: z.enum(['pending', 'paid', 'failed']).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const requestWithdrawalSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  pix_key: z.string().min(1, 'Chave PIX obrigatória').max(100),
})

// ============================================
// WORKOUT PLANS (Marketplace)
// ============================================

export const createWorkoutPlanSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20).max(5000),
  category: z.enum(['hipertrofia', 'emagrecimento', 'funcional', 'cardio', 'flexibilidade', 'outro']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration_weeks: z.number().int().min(1).max(52),
  workouts_per_week: z.number().int().min(1).max(7),
  price_brl: z.number().positive().min(9.90, 'Preço mínimo: R$9,90').max(999.90),
  plan_content: z.record(z.string(), z.unknown()), // JSONB com estrutura do plano
  thumbnail_url: z.string().url().optional().nullable(),
  preview_video_url: z.string().url().optional().nullable(),
  source_workout_ids: z.array(z.string().uuid()).optional().default([]),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
})

export const updateWorkoutPlanSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.enum(['hipertrofia', 'emagrecimento', 'funcional', 'cardio', 'flexibilidade', 'outro']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration_weeks: z.number().int().min(1).max(52).optional(),
  workouts_per_week: z.number().int().min(1).max(7).optional(),
  price_brl: z.number().positive().min(9.90).max(999.90).optional(),
  plan_content: z.record(z.string(), z.unknown()).optional(),
  is_published: z.boolean().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  preview_video_url: z.string().url().optional().nullable(),
})

export const listWorkoutPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(200).default(20),
  category: z.enum(['hipertrofia', 'emagrecimento', 'funcional', 'cardio', 'flexibilidade', 'outro']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  is_published: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['created_at', 'price_brl', 'total_sales', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// CHECKOUT — Pagamento pelo aluno (in-app)
// ============================================

export const checkoutPaySchema = z.object({
  payment_method: z.enum(['pix', 'credit_card', 'boleto']),
  // CPF do pagador (fallback se não tiver no perfil)
  cpf: z.string().min(11).max(14).optional(),
  // Dados do cartão (obrigatório se payment_method = 'credit_card' e sem token)
  card_holder_name: z.string().min(3).max(100).optional(),
  card_number: z.string().min(13).max(19).optional(),
  expiry_month: z.string().regex(/^(0[1-9]|1[0-2])$/).optional(),
  expiry_year: z.string().regex(/^\d{4}$/).optional(),
  ccv: z.string().min(3).max(4).optional(),
  // Info do titular (obrigatório p/ cartão sem token)
  holder_name: z.string().min(3).max(100).optional(),
  holder_email: z.string().email().optional(),
  holder_cpf: z.string().min(11).max(14).optional(),
  holder_phone: z.string().min(10).max(20).optional(),
  holder_postal_code: z.string().min(8).max(9).optional(),
  holder_address_number: z.string().min(1).max(10).optional(),
  // Parcelas (1-12)
  installment_count: z.number().int().min(1).max(12).optional(),
  // Token de cartão salvo
  credit_card_token: z.string().optional(),
}).refine(
  (data) => {
    if (data.payment_method !== 'credit_card') return true
    if (data.credit_card_token) return true
    return !!(data.card_holder_name && data.card_number && data.expiry_month &&
              data.expiry_year && data.ccv && data.holder_name && data.holder_cpf &&
              data.holder_phone && data.holder_postal_code && data.holder_address_number)
  },
  { message: 'Dados do cartão são obrigatórios para pagamento com cartão de crédito', path: ['card_number'] }
)

export type CheckoutPayInput = z.infer<typeof checkoutPaySchema>

// ============================================
// TYPES
// ============================================

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>
export type AsaasWebhookPayload = z.infer<typeof asaasWebhookSchema>
export type StripeWebhookPayload = z.infer<typeof stripeWebhookSchema>
export type ActivateAffiliateInput = z.infer<typeof activateAffiliateSchema>
export type ListReferralsQuery = z.infer<typeof listReferralsQuerySchema>
export type ListCommissionsQuery = z.infer<typeof listCommissionsQuerySchema>
export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>
export type ListWorkoutPlansQuery = z.infer<typeof listWorkoutPlansQuerySchema>
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>
export type RequestPixTransferInput = z.infer<typeof requestPixTransferSchema>
