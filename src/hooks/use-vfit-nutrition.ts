/**
 * src/hooks/use-vfit-nutrition.ts
 *
 * React Query hooks para nutrição B2C (VFIT)
 * Conecta aos endpoints: GET /vfit/foods, POST /vfit/meals, GET /vfit/meals/today
 */

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// ── Types ──────────────────────────────────────────────

export interface VfitFood {
  id: string
  name: string
  description?: string | null
  category: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  sodium_mg?: number | null
  standard_portion_g: number
  is_library: boolean
  is_custom?: boolean
  is_favorite?: boolean
  creator_id: string | null
  created_at: string
  last_logged_at?: string
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

function emptyDailyMealsResponse(date: string): DailyMealsResponse {
  return {
    date,
    meals: [],
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  }
}

export interface LogMealInput {
  food_id: string
  meal_type: MealType
  quantity_g?: number
  logged_at?: string
}

export interface CreateFoodInput {
  name: string
  description?: string
  category: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
  sodium_mg?: number
  standard_portion_g?: number
}

// ── Hooks ──────────────────────────────────────────────

/**
 * Buscar alimentos (com search e categoria)
 */
export function useFoodSearch(search: string, category?: string, limit = 30) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const normalizedSearch = search.trim()

  const params = new URLSearchParams()
  if (normalizedSearch) params.set('search', normalizedSearch)
  if (category) params.set('category', category)
  params.set('limit', String(limit))
  const qs = params.toString()

  return useQuery({
    queryKey: ['vfit-foods', normalizedSearch, category, limit],
    queryFn: async () => {
      const res = await api.get<VfitFood[]>(`/vfit/foods${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady && normalizedSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useRecentFoods(enabled = true) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['vfit-foods-recent'],
    queryFn: async () => {
      const res = await api.get<VfitFood[]>('/vfit/foods/recent?limit=12')
      return res.data
    },
    enabled: isReady && enabled,
    staleTime: 60_000,
  })
}

export function useFavoriteFoods(enabled = true) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['vfit-foods-favorites'],
    queryFn: async () => {
      const res = await api.get<VfitFood[]>('/vfit/foods/favorites?limit=30')
      return res.data
    },
    enabled: isReady && enabled,
    staleTime: 60_000,
  })
}

export function useCreateFood() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFoodInput) => {
      const res = await api.post<VfitFood>('/vfit/foods', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vfit-foods'] })
      qc.invalidateQueries({ queryKey: ['vfit-foods-recent'] })
    },
  })
}

export function useToggleFoodFavorite() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ foodId, favorite }: { foodId: string; favorite: boolean }) => {
      if (favorite) {
        const res = await api.post<{ food_id: string; is_favorite: boolean }>(`/vfit/foods/${foodId}/favorite`, {})
        return res.data
      }
      const res = await api.delete<{ food_id: string; is_favorite: boolean }>(`/vfit/foods/${foodId}/favorite`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vfit-foods'] })
      qc.invalidateQueries({ queryKey: ['vfit-foods-recent'] })
      qc.invalidateQueries({ queryKey: ['vfit-foods-favorites'] })
    },
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
      return res.data ?? emptyDailyMealsResponse(dateStr)
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
      qc.invalidateQueries({ queryKey: ['vfit-foods-recent'] })
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
