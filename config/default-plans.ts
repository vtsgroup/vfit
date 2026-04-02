/**
 * config/default-plans.ts
 *
 * VFIT B2C — Planos de treino pré-montados (fallback quando IA falha)
 *
 * Exports: getDefaultPlan
 */

import type { GeneratedPlan } from '@workers/schemas/plan-generation'

// ============================================
// Templates por objetivo + local + nível
// ============================================

const GYM_BEGINNER_MUSCLE: GeneratedPlan = {
  plan_name: 'Base Muscular — Iniciante',
  description: 'Treino focado em ganho de massa para quem está começando na academia.',
  estimated_calories_per_session: 280,
  days: [
    {
      day_number: 1,
      name: 'Peito e Tríceps',
      focus: 'chest_triceps',
      exercises: [
        { name: 'Supino Reto com Barra', muscle_group: 'chest', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 20 },
        { name: 'Supino Inclinado com Halteres', muscle_group: 'chest', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 12 },
        { name: 'Crucifixo Máquina', muscle_group: 'chest', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Tríceps Pulley', muscle_group: 'triceps', sets: 3, reps: '12-15', rest_seconds: 60, weight_suggestion_kg: 15 },
        { name: 'Tríceps Testa com Barra EZ', muscle_group: 'triceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 10 },
      ],
    },
    {
      day_number: 2,
      name: 'Costas e Bíceps',
      focus: 'back_biceps',
      exercises: [
        { name: 'Puxada Frontal', muscle_group: 'back', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 30 },
        { name: 'Remada Baixa', muscle_group: 'back', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 25 },
        { name: 'Remada Curvada com Halteres', muscle_group: 'back', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 12 },
        { name: 'Rosca Direta com Barra', muscle_group: 'biceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 15 },
        { name: 'Rosca Martelo', muscle_group: 'biceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 8 },
      ],
    },
    {
      day_number: 3,
      name: 'Pernas e Ombros',
      focus: 'legs_shoulders',
      exercises: [
        { name: 'Agachamento Smith', muscle_group: 'legs', sets: 3, reps: '10-12', rest_seconds: 120, weight_suggestion_kg: 20 },
        { name: 'Leg Press 45°', muscle_group: 'legs', sets: 3, reps: '12-15', rest_seconds: 90, weight_suggestion_kg: 60 },
        { name: 'Cadeira Extensora', muscle_group: 'legs', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Mesa Flexora', muscle_group: 'legs', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Desenvolvimento com Halteres', muscle_group: 'shoulders', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 8 },
        { name: 'Elevação Lateral', muscle_group: 'shoulders', sets: 3, reps: '12-15', rest_seconds: 60, weight_suggestion_kg: 5 },
      ],
    },
  ],
}

const HOME_BEGINNER_LOSE: GeneratedPlan = {
  plan_name: 'Queima Caseira — Iniciante',
  description: 'Treino em casa focado em emagrecimento, sem equipamentos.',
  estimated_calories_per_session: 320,
  days: [
    {
      day_number: 1,
      name: 'Full Body A',
      focus: 'full_body',
      exercises: [
        { name: 'Agachamento Livre', muscle_group: 'legs', sets: 3, reps: '15', rest_seconds: 45 },
        { name: 'Flexão de Braço', muscle_group: 'chest', sets: 3, reps: '10-12', rest_seconds: 45, notes: 'Joelhos no chão se necessário' },
        { name: 'Avanço (Lunge)', muscle_group: 'legs', sets: 3, reps: '12 cada', rest_seconds: 45 },
        { name: 'Prancha Frontal', muscle_group: 'core', sets: 3, reps: '30s', rest_seconds: 30 },
        { name: 'Polichinelo', muscle_group: 'cardio', sets: 3, reps: '40', rest_seconds: 30 },
      ],
    },
    {
      day_number: 2,
      name: 'Full Body B',
      focus: 'full_body',
      exercises: [
        { name: 'Agachamento Sumô', muscle_group: 'legs', sets: 3, reps: '15', rest_seconds: 45 },
        { name: 'Flexão Diamante', muscle_group: 'triceps', sets: 3, reps: '8-10', rest_seconds: 45 },
        { name: 'Elevação de Quadril', muscle_group: 'glutes', sets: 3, reps: '15', rest_seconds: 30 },
        { name: 'Prancha Lateral', muscle_group: 'core', sets: 3, reps: '20s cada', rest_seconds: 30 },
        { name: 'Burpees', muscle_group: 'cardio', sets: 3, reps: '10', rest_seconds: 45 },
      ],
    },
    {
      day_number: 3,
      name: 'Full Body C',
      focus: 'full_body',
      exercises: [
        { name: 'Agachamento com Salto', muscle_group: 'legs', sets: 3, reps: '12', rest_seconds: 45 },
        { name: 'Flexão Inclinada (mão na cadeira)', muscle_group: 'chest', sets: 3, reps: '12-15', rest_seconds: 45 },
        { name: 'Step Up (banco/cadeira)', muscle_group: 'legs', sets: 3, reps: '12 cada', rest_seconds: 45 },
        { name: 'Superman', muscle_group: 'back', sets: 3, reps: '12', rest_seconds: 30 },
        { name: 'Mountain Climber', muscle_group: 'cardio', sets: 3, reps: '30s', rest_seconds: 30 },
      ],
    },
  ],
}

const GYM_INTERMEDIATE_MUSCLE: GeneratedPlan = {
  plan_name: 'Hipertrofia Avançada 4x',
  description: 'Treino ABC+D para intermediários focados em ganho de massa muscular.',
  estimated_calories_per_session: 350,
  days: [
    {
      day_number: 1,
      name: 'Peito e Tríceps',
      focus: 'chest_triceps',
      exercises: [
        { name: 'Supino Reto com Barra', muscle_group: 'chest', sets: 4, reps: '8-10', rest_seconds: 90, weight_suggestion_kg: 40 },
        { name: 'Supino Inclinado com Halteres', muscle_group: 'chest', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 18 },
        { name: 'Cross Over', muscle_group: 'chest', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Paralelas', muscle_group: 'chest', sets: 3, reps: '8-12', rest_seconds: 90, notes: 'Incline tronco para peito' },
        { name: 'Tríceps Corda', muscle_group: 'triceps', sets: 3, reps: '12-15', rest_seconds: 60, weight_suggestion_kg: 20 },
        { name: 'Tríceps Francês', muscle_group: 'triceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 12 },
      ],
    },
    {
      day_number: 2,
      name: 'Costas e Bíceps',
      focus: 'back_biceps',
      exercises: [
        { name: 'Barra Fixa', muscle_group: 'back', sets: 4, reps: '6-10', rest_seconds: 120, notes: 'Auxílio com elástico se necessário' },
        { name: 'Remada Curvada', muscle_group: 'back', sets: 4, reps: '8-10', rest_seconds: 90, weight_suggestion_kg: 30 },
        { name: 'Puxada Frontal Pegada Neutra', muscle_group: 'back', sets: 3, reps: '10-12', rest_seconds: 60 },
        { name: 'Remada Unilateral', muscle_group: 'back', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 16 },
        { name: 'Rosca Direta com Halteres', muscle_group: 'biceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 12 },
        { name: 'Rosca Scott', muscle_group: 'biceps', sets: 3, reps: '10-12', rest_seconds: 60, weight_suggestion_kg: 15 },
      ],
    },
    {
      day_number: 3,
      name: 'Pernas (Quadríceps e Glúteos)',
      focus: 'legs_quads',
      exercises: [
        { name: 'Agachamento Livre', muscle_group: 'legs', sets: 4, reps: '8-10', rest_seconds: 120, weight_suggestion_kg: 40 },
        { name: 'Leg Press 45°', muscle_group: 'legs', sets: 4, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 100 },
        { name: 'Cadeira Extensora', muscle_group: 'legs', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Avanço com Halteres', muscle_group: 'legs', sets: 3, reps: '12 cada', rest_seconds: 60, weight_suggestion_kg: 12 },
        { name: 'Elevação de Quadril na Barra', muscle_group: 'glutes', sets: 3, reps: '12-15', rest_seconds: 60, weight_suggestion_kg: 30 },
      ],
    },
    {
      day_number: 4,
      name: 'Ombros e Posteriores',
      focus: 'shoulders_hamstrings',
      exercises: [
        { name: 'Desenvolvimento Militar', muscle_group: 'shoulders', sets: 4, reps: '8-10', rest_seconds: 90, weight_suggestion_kg: 20 },
        { name: 'Elevação Lateral', muscle_group: 'shoulders', sets: 3, reps: '12-15', rest_seconds: 60, weight_suggestion_kg: 8 },
        { name: 'Elevação Frontal', muscle_group: 'shoulders', sets: 3, reps: '12', rest_seconds: 60, weight_suggestion_kg: 6 },
        { name: 'Mesa Flexora', muscle_group: 'legs', sets: 4, reps: '10-12', rest_seconds: 60 },
        { name: 'Stiff', muscle_group: 'legs', sets: 3, reps: '10-12', rest_seconds: 90, weight_suggestion_kg: 20 },
        { name: 'Panturrilha em Pé', muscle_group: 'calves', sets: 4, reps: '15-20', rest_seconds: 45 },
      ],
    },
  ],
}

const HOME_ANY_TONE: GeneratedPlan = {
  plan_name: 'Definição Express — Sem Equipamentos',
  description: 'Treino caseiro para definição muscular com foco em circuitos e volume.',
  estimated_calories_per_session: 300,
  days: [
    {
      day_number: 1,
      name: 'Upper Body',
      focus: 'upper_body',
      exercises: [
        { name: 'Flexão de Braço', muscle_group: 'chest', sets: 4, reps: '12-15', rest_seconds: 30 },
        { name: 'Flexão Diamante', muscle_group: 'triceps', sets: 3, reps: '10-12', rest_seconds: 30 },
        { name: 'Flexão Pike (ombros)', muscle_group: 'shoulders', sets: 3, reps: '8-10', rest_seconds: 45, notes: 'Pés elevados em cadeira' },
        { name: 'Dips no Banco', muscle_group: 'triceps', sets: 3, reps: '12-15', rest_seconds: 30 },
        { name: 'Prancha Frontal', muscle_group: 'core', sets: 3, reps: '45s', rest_seconds: 30 },
      ],
    },
    {
      day_number: 2,
      name: 'Lower Body',
      focus: 'lower_body',
      exercises: [
        { name: 'Agachamento Búlgaro', muscle_group: 'legs', sets: 3, reps: '12 cada', rest_seconds: 45 },
        { name: 'Agachamento Sumô', muscle_group: 'legs', sets: 3, reps: '15', rest_seconds: 30 },
        { name: 'Elevação de Quadril', muscle_group: 'glutes', sets: 4, reps: '15', rest_seconds: 30 },
        { name: 'Panturrilha Unilateral', muscle_group: 'calves', sets: 3, reps: '15 cada', rest_seconds: 20 },
        { name: 'Abdominais Bicicleta', muscle_group: 'core', sets: 3, reps: '20', rest_seconds: 30 },
      ],
    },
    {
      day_number: 3,
      name: 'Circuito Full Body',
      focus: 'full_body',
      exercises: [
        { name: 'Burpees', muscle_group: 'cardio', sets: 4, reps: '10', rest_seconds: 30 },
        { name: 'Mountain Climber', muscle_group: 'core', sets: 3, reps: '30s', rest_seconds: 20 },
        { name: 'Agachamento com Salto', muscle_group: 'legs', sets: 3, reps: '12', rest_seconds: 30 },
        { name: 'Flexão com Rotação', muscle_group: 'chest', sets: 3, reps: '10 cada', rest_seconds: 30 },
        { name: 'Prancha com Toque no Ombro', muscle_group: 'core', sets: 3, reps: '20', rest_seconds: 30 },
      ],
    },
  ],
}

// ============================================
// Seletor de plano padrão
// ============================================

type PlanKey = 'gym_muscle_beginner' | 'gym_muscle_intermediate' | 'home_lose_any' | 'home_tone_any' | 'fallback'

function resolveKey(
  location: string,
  goal: string,
  level: string
): PlanKey {
  const isGym = location.startsWith('gym')

  if (isGym && (goal === 'gain_muscle' || goal === 'strength')) {
    return level === 'beginner' ? 'gym_muscle_beginner' : 'gym_muscle_intermediate'
  }
  if (!isGym && goal === 'lose_weight') return 'home_lose_any'
  if (!isGym && (goal === 'tone' || goal === 'health' || goal === 'flexibility')) return 'home_tone_any'

  // Fallback genérico
  return isGym ? 'gym_muscle_beginner' : 'home_lose_any'
}

const PLAN_MAP: Record<PlanKey, GeneratedPlan> = {
  gym_muscle_beginner: GYM_BEGINNER_MUSCLE,
  gym_muscle_intermediate: GYM_INTERMEDIATE_MUSCLE,
  home_lose_any: HOME_BEGINNER_LOSE,
  home_tone_any: HOME_ANY_TONE,
  fallback: GYM_BEGINNER_MUSCLE,
}

/**
 * Retorna um plano pré-montado baseado no perfil.
 * Ajusta days_per_week cortando ou duplicando dias.
 */
export function getDefaultPlan(profile: {
  goal: string
  training_location: string
  experience_level: string
  days_per_week: number
}): GeneratedPlan {
  const key = resolveKey(profile.training_location, profile.goal, profile.experience_level)
  const template = PLAN_MAP[key]

  // Ajustar número de dias
  const plan = structuredClone(template)

  if (profile.days_per_week < plan.days.length) {
    plan.days = plan.days.slice(0, profile.days_per_week)
  } else if (profile.days_per_week > plan.days.length) {
    // Repetir dias ciclicamente
    const original = [...plan.days]
    while (plan.days.length < profile.days_per_week) {
      const extra = structuredClone(original[plan.days.length % original.length])
      extra.day_number = plan.days.length + 1
      plan.days.push(extra)
    }
  }

  // Renumerar
  plan.days.forEach((d, i) => { d.day_number = i + 1 })

  return plan
}
