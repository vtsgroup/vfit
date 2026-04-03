/**
 * src/hooks/use-vfit-nutrition.ts
 *
 * React Query hooks para nutrição B2C (VFIT)
 * Conecta aos endpoints: GET /vfit/foods, POST /vfit/meals, GET /vfit/meals/today
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ── Types ──────────────────────────────────────────────

export interface VfitFood {
  id: string
  name: string
  category: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  standard_portion_g: number
  is_library: boolean
  creator_id: string | null
  created_at: string
}

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'snack'
  | 'dinner'
  | 'pre_workout'
  | 'post_workout'

export interface VfitMeal {
  id: string
  user_id: string
  food_id: string
  food_name: string
  food_category: string
  meal_type: MealType
  quantity_g: number
  calories_total: number
  protein_total: number
  carbs_total: number
  fat_total: number
  logged_at: string
  created_at: string
}

export interface DailyTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DailyMealsResponse {
  date: string
  meals: VfitMeal[]
  totals: DailyTotals
}

export interface LogMealInput {
  food_id: string
  meal_type: MealType
  quantity_g?: number
  logged_at?: string
}

// ── Hooks ──────────────────────────────────────────────

/**
 * Buscar alimentos (com search e categoria)
 */
export function useFoodSearch(search: string, category?: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const qs = params.toString()

  return useQuery({
    queryKey: ['vfit-foods', search, category],
    queryFn: async () => {
      const res = await api.get<VfitFood[]>(`/vfit/foods${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady && search.length >= 2,
    staleTime: 60_000,
  })
}

/**
 * Refeições do dia + totais de macros
 */
export function useMealsToday(date?: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const dateStr = date || new Date().toISOString().slice(0, 10)

  return useQuery({
    queryKey: ['vfit-meals-today', dateStr],
    queryFn: async () => {
      const res = await api.get<DailyMealsResponse>(`/vfit/meals/today?date=${dateStr}`)
      return res.data
    },
    enabled: isReady,
  })
}

/**
 * Registrar refeição
 */
export function useLogMeal() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: LogMealInput) => {
      const res = await api.post<VfitMeal>('/vfit/meals', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vfit-meals-today'] })
    },
  })
}

// ── Helpers ────────────────────────────────────────────

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  pre_workout: 'Pré-Treino',
  post_workout: 'Pós-Treino',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🍽️',
  snack: '🍎',
  dinner: '🌙',
  pre_workout: '⚡',
  post_workout: '💪',
}

export const MEAL_TYPE_ORDER: MealType[] = [
  'breakfast',
  'snack',
  'lunch',
  'snack',
  'pre_workout',
  'post_workout',
  'dinner',
]

export function formatMacro(value: number): string {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1)
}

// ── Nutrition Targets from Onboarding ─────────────────

interface OnboardingData {
  gender: string
  age: number
  height_cm: number
  weight_kg: number
  goal: string
  training_frequency: string
}

export interface NutritionTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const DEFAULT_TARGETS: NutritionTargets = { calories: 2000, protein: 150, carbs: 250, fat: 65 }

function calcTargets(o: OnboardingData): NutritionTargets {
  const isMale = o.gender === 'male' || o.gender === 'masculino'
  const bmr = isMale
    ? 10 * o.weight_kg + 6.25 * o.height_cm - 5 * o.age + 5
    : 10 * o.weight_kg + 6.25 * o.height_cm - 5 * o.age - 161

  const freqToActivity: Record<string, number> = {
    never: 1.2, '1-2': 1.375, '3-4': 1.55, '5-6': 1.725, '7': 1.9,
  }
  const tdee = Math.round(bmr * (freqToActivity[o.training_frequency] || 1.55))

  const goalMap: Record<string, string> = {
    lose_weight: 'lose', perder_peso: 'lose', emagrecer: 'lose',
    gain_muscle: 'gain', ganhar_musculo: 'gain', hipertrofia: 'gain',
  }
  const g = goalMap[o.goal] || 'maintain'
  const cals = g === 'lose' ? Math.round(tdee * 0.8) : g === 'gain' ? Math.round(tdee * 1.15) : tdee

  const protein = Math.round(o.weight_kg * (g === 'gain' ? 2.0 : 1.6))
  const fat = Math.round((cals * 0.25) / 9)
  const carbs = Math.round((cals - protein * 4 - fat * 9) / 4)

  return { calories: cals, protein, carbs, fat }
}

/**
 * Calcula metas nutricionais do usuário com base nos dados do onboarding.
 * Usa a mesma fórmula Mifflin-St Jeor do backend (self-assessments.ts).
 * Fallback para metas padrão se onboarding não encontrado.
 */
export function useNutritionTargets() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<NutritionTargets>({
    queryKey: ['nutrition-targets'],
    queryFn: async () => {
      const res = await api.get<{ completed: boolean; data: OnboardingData | null }>('/onboarding')
      if (!res.data?.data) return DEFAULT_TARGETS
      return calcTargets(res.data.data)
    },
    enabled: isReady,
    staleTime: 30 * 60 * 1000, // 30 min — dados raramente mudam
    placeholderData: DEFAULT_TARGETS,
  })
}
