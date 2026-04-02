/**
 * VFIT Zod Schemas — Validation & TypeScript Types
 *
 * All schemas correspond to VFIT database tables (migrations 0025-0028).
 * Use `z.infer<typeof Schema>` to derive TypeScript types.
 *
 * @module vfit-schemas
 * @version 1.0
 * @since Sprint 41
 */

import { z } from 'zod'

// ─── Common Enums ────────────────────────────────────────────

export const GoalType = z.enum([
  'weight_loss',
  'muscle_gain',
  'strength',
  'endurance',
  'flexibility',
])

export const ExperienceLevel = z.enum([
  'beginner',
  'intermediate',
  'advanced',
])

export const DifficultyLevel = z.enum([
  'beginner',
  'intermediate',
  'advanced',
])

export const MuscleGroup = z.enum([
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'full_body',
  'glutes',
  'calves',
  'forearms',
  'traps',
  'abs',
])

export const MealType = z.enum([
  'breakfast',
  'lunch',
  'snack',
  'dinner',
  'pre_workout',
  'post_workout',
])

export const EvaluationType = z.enum([
  'body_composition',
  'strength',
  'flexibility',
  'balance',
  'custom',
])

export const SubscriptionPlan = z.enum([
  'free',
  'premium',
  'premium_plus',
])

export const BillingCycle = z.enum([
  'monthly',
  'annual',
])

export const BookingStatus = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
])

export const PaymentStatus = z.enum([
  'pending',
  'received',
  'failed',
  'refunded',
])

export const ChatRole = z.enum([
  'user',
  'assistant',
  'system',
])

export const TrainingLocation = z.enum([
  'home',
  'gym',
  'outdoor',
])

export const FoodCategory = z.enum([
  'protein',
  'carb',
  'fat',
  'vegetable',
  'fruit',
  'dairy',
  'grain',
  'snack',
])

// ─── Exercise Set (within workout JSON) ──────────────────────

export const ExerciseSetSchema = z.object({
  exercise_id: z.string().min(1),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1), // "8-12", "AMRAP", "30s"
  rest_seconds: z.number().int().min(0).max(600).default(90),
  notes: z.string().optional(),
})

// ─── VFIT User (extended fields) ─────────────────────────────

export const VFITUserExtensionSchema = z.object({
  birth_date: z.string().date().optional(),
  target_weight_kg: z.number().positive().optional(),
  body_fat_percent: z.number().min(1).max(60).optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  equipment_available: z.array(z.string()).default([]),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  avatar_url: z.string().url().optional(),
  subscription_plan: SubscriptionPlan.default('free'),
})

// ─── VFIT Workout ────────────────────────────────────────────

export const VFITWorkoutSchema = z.object({
  id: z.string().optional(),
  creator_id: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  difficulty_level: DifficultyLevel.default('intermediate'),
  duration_minutes: z.number().int().min(5).max(300).default(45),
  primary_muscle: MuscleGroup.default('full_body'),
  secondary_muscles: z.array(MuscleGroup).default([]),
  exercises: z.array(ExerciseSetSchema).min(1),
  cover_image_url: z.string().url().optional(),
  is_library: z.boolean().default(false),
  is_public: z.boolean().default(false),
})

export const VFITWorkoutCreateSchema = VFITWorkoutSchema.omit({ id: true })

// ─── VFIT Workout Session ────────────────────────────────────

export const VFITWorkoutSessionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  workout_id: z.string().min(1),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  rpe_overall: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  is_completed: z.boolean().default(false),
})

// ─── VFIT Workout Set ────────────────────────────────────────

export const VFITWorkoutSetSchema = z.object({
  id: z.string().optional(),
  session_id: z.string().min(1),
  exercise_id: z.string().min(1),
  set_number: z.number().int().min(1),
  reps: z.number().int().min(0).optional(),
  weight_kg: z.number().min(0).optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
})

export const VFITWorkoutSetCreateSchema = VFITWorkoutSetSchema.omit({ id: true })

// ─── VFIT Food ───────────────────────────────────────────────

export const VFITFoodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: FoodCategory.optional(),
  calories: z.number().min(0),
  protein_g: z.number().min(0).default(0),
  carbs_g: z.number().min(0).default(0),
  fat_g: z.number().min(0).default(0),
  fiber_g: z.number().min(0).default(0),
  sodium_mg: z.number().min(0).default(0),
  standard_portion_g: z.number().int().min(1).default(100),
  image_url: z.string().url().optional(),
  is_library: z.boolean().default(true),
  is_custom: z.boolean().default(false),
  creator_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export const VFITFoodCreateSchema = VFITFoodSchema.omit({ id: true })

// ─── VFIT User Meal ──────────────────────────────────────────

export const VFITUserMealSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  food_id: z.string().min(1),
  meal_type: MealType,
  quantity_g: z.number().int().min(1).default(100),
  logged_at: z.string().date().optional(), // defaults to CURRENT_DATE in DB
  calories_total: z.number().min(0).optional(),
  protein_total: z.number().min(0).optional(),
  carbs_total: z.number().min(0).optional(),
  fat_total: z.number().min(0).optional(),
})

export const VFITUserMealCreateSchema = VFITUserMealSchema.omit({ id: true })

// ─── VFIT Evaluation ─────────────────────────────────────────

export const VFITEvaluationMetricsSchema = z.object({
  weight_kg: z.number().positive().optional(),
  body_fat_percent: z.number().min(1).max(60).optional(),
  chest_cm: z.number().positive().optional(),
  waist_cm: z.number().positive().optional(),
  hip_cm: z.number().positive().optional(),
  thigh_cm: z.number().positive().optional(),
  arm_cm: z.number().positive().optional(),
  calf_cm: z.number().positive().optional(),
  neck_cm: z.number().positive().optional(),
  // Strength tests
  bench_press_1rm: z.number().positive().optional(),
  squat_1rm: z.number().positive().optional(),
  deadlift_1rm: z.number().positive().optional(),
  // Flexibility
  sit_and_reach_cm: z.number().optional(),
  // Custom fields allowed
}).passthrough()

export const VFITEvaluationSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  trainer_id: z.string().optional(),
  evaluation_type: EvaluationType.default('body_composition'),
  metrics: VFITEvaluationMetricsSchema,
  photos: z.array(z.string().url()).default([]),
  evaluation_date: z.string().date().optional(),
})

export const VFITEvaluationCreateSchema = VFITEvaluationSchema.omit({ id: true })

// ─── VFIT Trainer ────────────────────────────────────────────

export const VFITTrainerSchema = z.object({
  id: z.string().min(1), // Same as users.id
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  price_per_evaluation: z.number().min(0).default(0),
  available_days: z.record(z.string(), z.array(z.string())).default({}),
  available_timezones: z.array(z.string()).default(['America/Sao_Paulo']),
  rating_avg: z.number().min(0).max(5).default(0),
  rating_count: z.number().int().min(0).default(0),
  profile_image_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
})

export const VFITTrainerCreateSchema = VFITTrainerSchema.omit({
  rating_avg: true,
  rating_count: true,
})

// ─── VFIT Evaluation Booking ─────────────────────────────────

export const VFITEvaluationBookingSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  trainer_id: z.string().min(1),
  scheduled_at: z.string().datetime(),
  evaluation_type: EvaluationType.default('body_composition'),
  status: BookingStatus.default('pending'),
  price_agreed: z.number().min(0),
  asaas_payment_id: z.string().optional(),
  payment_status: PaymentStatus.default('pending'),
  meeting_link: z.string().url().optional(),
  student_notes: z.string().optional(),
  trainer_notes: z.string().optional(),
  evaluation_id: z.string().optional(),
})

export const VFITBookingCreateSchema = VFITEvaluationBookingSchema.omit({
  id: true,
  status: true,
  payment_status: true,
  evaluation_id: true,
})

// ─── VFIT Subscription ───────────────────────────────────────

export const VFITSubscriptionSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  plan_type: SubscriptionPlan.default('free'),
  billing_cycle: BillingCycle.default('monthly'),
  started_at: z.string().datetime().optional(),
  renews_at: z.string().datetime().optional(),
  canceled_at: z.string().datetime().optional(),
  asaas_subscription_id: z.string().optional(),
  price_paid: z.number().min(0).optional(),
})

// ─── VFIT User AI Profile ────────────────────────────────────

export const VFITUserAIProfileSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  recent_workouts: z.array(z.any()).default([]),
  recent_meals: z.array(z.any()).default([]),
  progress_metrics: z.record(z.string(), z.any()).default({}),
  user_preferences: z.record(z.string(), z.any()).default({}),
  current_weekly_volume: z.number().int().min(0).default(0),
  strength_prs: z.record(z.string(), z.number()).default({}),
  estimated_max_one_rep: z.record(z.string(), z.number()).default({}),
})

// ─── VFIT IA Chat Message ────────────────────────────────────

export const VFITChatMessageSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  role: ChatRole,
  content: z.string().min(1),
  context_used: z.any().optional(),
  model_used: z.string().optional(),
  tokens_used: z.number().int().min(0).optional(),
})

export const VFITChatMessageCreateSchema = VFITChatMessageSchema.omit({ id: true })

// ─── D1 Exercise (Cloudflare D1) ─────────────────────────────

export const D1ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  primary_muscle: MuscleGroup,
  secondary_muscles: z.string().optional(), // Comma-separated in D1
  difficulty: DifficultyLevel,
  equipment: z.string().optional(), // Comma-separated
  description_detailed: z.string().optional(),
  gif_url: z.string().url().optional(),
  image_urls: z.string().optional(), // Comma-separated
  coaching_cues: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
})

// ─── TypeScript Type Exports ─────────────────────────────────

export type VFITWorkout = z.infer<typeof VFITWorkoutSchema>
export type VFITWorkoutCreate = z.infer<typeof VFITWorkoutCreateSchema>
export type VFITWorkoutSession = z.infer<typeof VFITWorkoutSessionSchema>
export type VFITWorkoutSet = z.infer<typeof VFITWorkoutSetSchema>
export type VFITWorkoutSetCreate = z.infer<typeof VFITWorkoutSetCreateSchema>
export type VFITFood = z.infer<typeof VFITFoodSchema>
export type VFITFoodCreate = z.infer<typeof VFITFoodCreateSchema>
export type VFITUserMeal = z.infer<typeof VFITUserMealSchema>
export type VFITUserMealCreate = z.infer<typeof VFITUserMealCreateSchema>
export type VFITEvaluation = z.infer<typeof VFITEvaluationSchema>
export type VFITEvaluationCreate = z.infer<typeof VFITEvaluationCreateSchema>
export type VFITEvaluationMetrics = z.infer<typeof VFITEvaluationMetricsSchema>
export type VFITTrainer = z.infer<typeof VFITTrainerSchema>
export type VFITTrainerCreate = z.infer<typeof VFITTrainerCreateSchema>
export type VFITEvaluationBooking = z.infer<typeof VFITEvaluationBookingSchema>
export type VFITBookingCreate = z.infer<typeof VFITBookingCreateSchema>
export type VFITSubscription = z.infer<typeof VFITSubscriptionSchema>
export type VFITUserAIProfile = z.infer<typeof VFITUserAIProfileSchema>
export type VFITChatMessage = z.infer<typeof VFITChatMessageSchema>
export type VFITChatMessageCreate = z.infer<typeof VFITChatMessageCreateSchema>
export type D1Exercise = z.infer<typeof D1ExerciseSchema>
export type GoalTypeValue = z.infer<typeof GoalType>
export type ExperienceLevelValue = z.infer<typeof ExperienceLevel>
export type MuscleGroupValue = z.infer<typeof MuscleGroup>
export type MealTypeValue = z.infer<typeof MealType>
export type SubscriptionPlanValue = z.infer<typeof SubscriptionPlan>
