/**
 * src/app/(app)/nutricao/page.tsx
 *
 * Nutrição — Tracker de refeições e macros diários (VFIT B2C)
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { MacroRingChart } from '@/components/nutrition/macro-ring-chart'
import { BarcodeScanner } from '@/components/nutrition/barcode-scanner'
import { FoodCamera } from '@/components/nutrition/food-camera'
import {
  useMealsToday,
  useFoodSearch,
  useRecentFoods,
  useFavoriteFoods,
  useCreateFood,
  useToggleFoodFavorite,
  useLogMeal,
  useNutritionTargets,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  formatMacro,
  type MealType,
  type CreateFoodInput,
  type VfitFood,
} from '@/hooks/use-vfit-nutrition'
import { useStudentProfile, useLinkNutritionist } from '@/hooks/use-student-app'

// ── Food category visual config ────────────────────────

const FOOD_CATEGORY_CONFIG: Record<string, { icon: DSIconName; color: string; bg: string }> = {
  'cereais e derivados': { icon: 'apple', color: 'text-amber-600', bg: 'bg-amber-400' },
  'leguminosas': { icon: 'layers', color: 'text-green-600', bg: 'bg-green-500' },
  'carnes': { icon: 'dumbbell', color: 'text-red-600', bg: 'bg-red-500' },
  'aves': { icon: 'dumbbell', color: 'text-orange-600', bg: 'bg-orange-500' },
  'peixes': { icon: 'droplets', color: 'text-blue-600', bg: 'bg-blue-500' },
  'laticínios': { icon: 'flask', color: 'text-slate-600', bg: 'bg-slate-500' },
  'frutas': { icon: 'apple', color: 'text-rose-600', bg: 'bg-rose-500' },
  'verduras': { icon: 'apple', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  'legumes': { icon: 'apple', color: 'text-orange-600', bg: 'bg-orange-500' },
  'ovos': { icon: 'circle', color: 'text-yellow-600', bg: 'bg-yellow-500' },
  'gorduras': { icon: 'droplets', color: 'text-orange-600', bg: 'bg-orange-500' },
  'açúcares': { icon: 'sparkles', color: 'text-pink-600', bg: 'bg-pink-500' },
  'bebidas': { icon: 'droplets', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  'industrializado': { icon: 'archive', color: 'text-slate-600', bg: 'bg-slate-500' },
  'suplementos': { icon: 'flask', color: 'text-violet-600', bg: 'bg-violet-500' },
  'cereais': { icon: 'apple', color: 'text-amber-600', bg: 'bg-amber-400' },
  'proteinas': { icon: 'flask', color: 'text-emerald-600', bg: 'bg-emerald-600' },
  'laticinios': { icon: 'flask', color: 'text-slate-600', bg: 'bg-slate-500' },
  'tuberculos': { icon: 'apple', color: 'text-orange-600', bg: 'bg-orange-500' },
  'oleos': { icon: 'droplets', color: 'text-orange-600', bg: 'bg-orange-500' },
  'nozes': { icon: 'circle', color: 'text-amber-600', bg: 'bg-amber-500' },
  'sementes': { icon: 'apple', color: 'text-lime-600', bg: 'bg-lime-500' },
  'preparacoes': { icon: 'clipboardList', color: 'text-sky-600', bg: 'bg-sky-500' },
  'default': { icon: 'apple', color: 'text-slate-600', bg: 'bg-slate-500' },
}

const QUICK_SEARCH_TERMS = ['arroz', 'frango', 'ovo', 'banana', 'feijao', 'whey']
const MANUAL_FOOD_CATEGORIES = [
  'preparacoes',
  'proteinas',
  'cereais',
  'frutas',
  'vegetais',
  'laticinios',
  'suplementos',
  'bebidas',
]

const EMPTY_MANUAL_FOOD = {
  name: '',
  category: 'preparacoes',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
  standard_portion_g: '100',
}

type ManualFoodDraft = typeof EMPTY_MANUAL_FOOD
type ManualFoodBuildResult =
  | { ok: true; input: CreateFoodInput & { standard_portion_g: number } }
  | { ok: false; error: string }

function parseManualFoodNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function buildManualFoodInput(draft: ManualFoodDraft): ManualFoodBuildResult {
  const name = draft.name.trim()
  if (name.length < 2) return { ok: false, error: 'Informe o nome do alimento com pelo menos 2 letras.' }

  const calories = parseManualFoodNumber(draft.calories)
  const protein = parseManualFoodNumber(draft.protein_g)
  const carbs = parseManualFoodNumber(draft.carbs_g)
  const fat = parseManualFoodNumber(draft.fat_g)
  const portion = parseManualFoodNumber(draft.standard_portion_g)

  if (calories === null) return { ok: false, error: 'Informe as calorias da porção.' }
  if (protein === null) return { ok: false, error: 'Informe a proteína da porção, mesmo que seja 0g.' }
  if (carbs === null) return { ok: false, error: 'Informe os carboidratos da porção, mesmo que seja 0g.' }
  if (fat === null) return { ok: false, error: 'Informe as gorduras da porção, mesmo que seja 0g.' }
  if (portion === null || portion < 1) return { ok: false, error: 'Informe uma porção válida em gramas.' }

  return {
    ok: true,
    input: {
      name,
      category: draft.category,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      standard_portion_g: Math.round(portion),
    },
  }
}

function getFoodCategoryConfig(category: string) {
  const key = (category || '').toLowerCase()
  return FOOD_CATEGORY_CONFIG[key] ?? FOOD_CATEGORY_CONFIG['default']
}

// ── Helpers ────────────────────────────────────────────

function getDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ── Component ──────────────────────────────────────────

export default function NutricaoPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [selectedFood, setSelectedFood] = useState<VfitFood | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [showManualFood, setShowManualFood] = useState(false)
  const [manualFood, setManualFood] = useState(EMPTY_MANUAL_FOOD)
  const [manualFoodError, setManualFoodError] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showBarcode, setShowBarcode] = useState(false)
  const [showFoodCamera, setShowFoodCamera] = useState(false)
  const [nutritionistReferralCode, setNutritionistReferralCode] = useState('')
  const [showNutritionQr, setShowNutritionQr] = useState(false)
  const [nutritionInviteQrUrl, setNutritionInviteQrUrl] = useState('')
  const { data: studentProfile } = useStudentProfile()
  const linkNutritionist = useLinkNutritionist()

  const { data: dailyData, isLoading } = useMealsToday(selectedDate)
  const trimmedSearchQuery = searchQuery.trim()
  const isTypingSearch = trimmedSearchQuery.length >= 2 && debouncedSearchQuery !== trimmedSearchQuery
  const { data: foods, isLoading: foodsLoading, isFetching: foodsFetching } = useFoodSearch(debouncedSearchQuery)
  const { data: recentFoods = [] } = useRecentFoods(showSearch && !selectedFood)
  const { data: favoriteFoods = [] } = useFavoriteFoods(showSearch && !selectedFood)
  const { data: targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 } } =
    useNutritionTargets()
  const logMeal = useLogMeal()
  const createFood = useCreateFood()
  const toggleFavorite = useToggleFoodFavorite()

  const totals = dailyData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const meals = useMemo(() => dailyData?.meals ?? [], [dailyData?.meals])
  const favoriteIds = useMemo(() => new Set(favoriteFoods.map((food) => food.id)), [favoriteFoods])
  const selectedFoodIsFavorite = selectedFood ? Boolean(selectedFood.is_favorite || favoriteIds.has(selectedFood.id)) : false
  const searchLoading = trimmedSearchQuery.length >= 2 && (foodsLoading || isTypingSearch)
  const searchRefreshing = trimmedSearchQuery.length >= 2 && foodsFetching && !foodsLoading && !isTypingSearch

  const grouped = useMemo(() => {
    const map = new Map<MealType, typeof meals>()
    for (const m of meals) {
      const list = map.get(m.meal_type as MealType) ?? []
      list.push(m)
      map.set(m.meal_type as MealType, list)
    }
    return map
  }, [meals])

  const nutritionInviteLink = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vfit.app.br'
    const params = new URLSearchParams({
      source: 'student-invite',
      origin: 'nutricao',
      role: 'nutritionist',
    })
    if (studentProfile?.id) params.set('student_id', studentProfile.id)
    return `${base}/contato?${params.toString()}`
  }, [studentProfile?.id])

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearchQuery(trimmedSearchQuery), 180)
    return () => window.clearTimeout(id)
  }, [trimmedSearchQuery])

  useEffect(() => {
    let cancelled = false

    async function generateQr() {
      if (!showNutritionQr) {
        setNutritionInviteQrUrl('')
        return
      }

      try {
        const dataUrl = await (await import('qrcode')).default.toDataURL(nutritionInviteLink, {
          margin: 1,
          width: 280,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setNutritionInviteQrUrl(dataUrl)
      } catch {
        if (!cancelled) setNutritionInviteQrUrl('')
      }
    }

    void generateQr()

    return () => {
      cancelled = true
    }
  }, [showNutritionQr, nutritionInviteLink])

  async function handleBarcodeDetected(code: string) {
    setShowBarcode(false)
    try {
      const res = await api.get<{ source: 'local' | 'openfoodfacts'; food?: VfitFood }>(
        `/vfit/food-barcode/${code}`
      )
      if (res.data?.food) {
        setSelectedFood(res.data.food)
        setQuantity(res.data.food.standard_portion_g || 100)
        setShowSearch(true)
      }
    } catch {
      // silently ignore
    }
  }

  function handleFoodCameraSearch(query: string) {
    setShowFoodCamera(false)
    setSearchQuery(query)
    setShowSearch(true)
  }

  function handleLogMeal() {
    if (!selectedFood) return
    logMeal.mutate(
      {
        food_id: selectedFood.id,
        meal_type: selectedMealType,
        quantity_g: quantity,
        logged_at: selectedDate,
      },
      {
        onSuccess: () => {
          toast.success('Refeição registrada', `${selectedFood.name} entrou nos macros do dia.`)
          setSelectedFood(null)
          setSearchQuery('')
          setShowSearch(false)
          setQuantity(100)
        },
        onError: (error) => {
          toast.error('Não foi possível registrar', error instanceof Error ? error.message : 'Tente novamente em alguns segundos.')
        },
      }
    )
  }

  function updateManualFoodField(field: keyof ManualFoodDraft, value: string) {
    setManualFood((food) => ({ ...food, [field]: value }))
    if (manualFoodError) setManualFoodError('')
  }

  async function handleCreateManualFood() {
    const result = buildManualFoodInput(manualFood)
    if (!result.ok) {
      setManualFoodError(result.error)
      return
    }

    let createdFood: VfitFood | null = null

    try {
      createdFood = await createFood.mutateAsync(result.input)
      await logMeal.mutateAsync({
        food_id: createdFood.id,
        meal_type: selectedMealType,
        quantity_g: result.input.standard_portion_g,
        logged_at: selectedDate,
      })

      toast.success('Alimento registrado', `${createdFood.name} entrou nos macros do dia.`)
      setSelectedFood(null)
      setQuantity(100)
      setSearchQuery('')
      setShowSearch(false)
      setShowManualFood(false)
      setManualFood(EMPTY_MANUAL_FOOD)
      setManualFoodError('')
    } catch (error) {
      if (createdFood) {
        setSelectedFood(createdFood)
        setQuantity(createdFood.standard_portion_g || result.input.standard_portion_g)
        setShowManualFood(false)
        setManualFood(EMPTY_MANUAL_FOOD)
        setManualFoodError('')
        toast.error('Alimento salvo, mas não registrado', 'Revise a porção e toque em Registrar para somar no dia.')
        return
      }

      const message = error instanceof Error ? error.message : 'Tente novamente em alguns segundos.'
      setManualFoodError(message)
      toast.error('Não foi possível salvar o alimento', message)
    }
  }

  function pickFood(food: VfitFood) {
    setSelectedFood(food)
    setQuantity(food.standard_portion_g || 100)
    setShowManualFood(false)
  }

  function renderFoodRow(food: VfitFood, label?: string) {
    const cat = getFoodCategoryConfig(food.category)
    const favorite = Boolean(food.is_favorite || favoriteIds.has(food.id))
    return (
      <button
        key={food.id}
        onClick={() => pickFood({ ...food, is_favorite: favorite })}
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-colors hover:bg-emerald-50/50 active:scale-[0.99]"
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_14px_rgba(15,23,42,0.12)]',
            cat.bg
          )}
        >
          <DSIcon name={cat.icon} size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {food.name}
          </p>
          <p className={cn('text-xs capitalize', cat.color)}>
            {label || food.category}
          </p>
        </div>
        <div className="ml-1 text-right text-xs text-text-secondary">
          <div className="flex items-center justify-end gap-1">
            {favorite && <DSIcon name="star" size={12} className="text-amber-300" />}
            <span className="font-bold">{food.calories} kcal</span>
          </div>
          <p className="text-text-muted">
            P:{food.protein_g} C:{food.carbs_g} G:{food.fat_g}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* ─── Hero ─── */}
      <div
        className="relative mb-5 overflow-hidden rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_25%,rgba(34,197,94,0.18),transparent_55%)]" />

        <div className="relative z-1 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-400">
              {(() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' })()}
            </p>
            <h1 className="bg-linear-to-r from-vfit-primary-100 to-vfit-primary-400 bg-clip-text text-4xl font-black text-transparent">
              Nutrição
            </h1>
            <p className="mt-1 text-xs text-emerald-200/80">Refeições e macros do dia</p>
          </div>

          {/* Adicionar dentro do hero */}
          <Button
            size="sm"
            onClick={() => setShowSearch(true)}
          >
            <DSIcon name="plus" size={14} />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="space-y-5 px-4 pt-1">
        {/* ═══ Date Navigation ═══ */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-text-secondary transition-colors hover:bg-bg-tertiary"
          >
            <DSIcon name="chevronLeft" size={16} />
          </button>
          <span className="text-sm font-semibold text-text-primary">
            {getDateLabel(selectedDate)}
          </span>
          <button
            onClick={() =>
              setSelectedDate((d) => {
                const next = shiftDate(d, 1)
                return next > today ? d : next
              })
            }
            disabled={selectedDate === today}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary transition-colors',
              selectedDate === today
                ? 'text-text-muted opacity-40'
                : 'text-text-secondary hover:bg-bg-tertiary'
            )}
          >
            <DSIcon name="chevronRight" size={16} />
          </button>
        </div>

        {/* ═══ Macros Overview — MacroRingChart ═══ */}
        <section className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          ) : (
            <MacroRingChart
              calories={totals.calories}
              calorieTarget={targets.calories}
              protein={totals.protein}
              proteinTarget={targets.protein}
              carbs={totals.carbs}
              carbsTarget={targets.carbs}
              fat={totals.fat}
              fatTarget={targets.fat}
              size={196}
            />
          )}
        </section>

        {/* ═══ Convite/Vínculo com Nutricionista ═══ */}
        <section className="relative overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/40 to-slate-50 p-4 shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
          <div className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full bg-emerald-200/45 blur-2xl" />
          <div className="relative mb-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(5,150,105,0.14)]">
                <DSIcon name="userPlus" size={19} />
              </div>
              <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600/85">Nutricionista</p>
              <p className="mt-1 text-[13px] font-semibold text-slate-500">
                Convide um nutricionista e vincule por código para acompanhamento alimentar.
              </p>
              </div>
            </div>
          </div>

          <div className="relative mb-3 flex gap-2">
            <Input
              value={nutritionistReferralCode}
              onChange={(e) => setNutritionistReferralCode(e.target.value.toUpperCase())}
              placeholder="Código do nutricionista"
              disabled={linkNutritionist.isPending}
            />
            <Button
              onClick={() => linkNutritionist.mutate(nutritionistReferralCode)}
              loading={linkNutritionist.isPending}
              disabled={!nutritionistReferralCode.trim()}
            >
              Vincular
            </Button>
          </div>

          <div className="relative flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigator.clipboard.writeText(nutritionInviteLink)}
            >
              <DSIcon name="copy" size={14} />
              Copiar link
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite VFIT — Nutricionista')}&body=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT na parte nutricional.\n\nContato/cadastro: ${nutritionInviteLink}`)}`, '_blank')}
            >
              <DSIcon name="mail" size={14} />
              Email
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para meu acompanhamento nutricional no VFIT.\n\nContato/cadastro: ${nutritionInviteLink}`)}`, '_blank')}
            >
              <DSIcon name="share2" size={14} />
              WhatsApp
            </Button>
            <Button
              variant={showNutritionQr ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowNutritionQr((v) => !v)}
            >
              <DSIcon name="qrcode" size={14} />
              QR Code
            </Button>
          </div>

          {showNutritionQr && (
            <div className="mt-4 flex justify-center">
              {nutritionInviteQrUrl ? (
                <Image
                  src={nutritionInviteQrUrl}
                  alt="QR Code convite nutricionista"
                  width={176}
                  height={176}
                  unoptimized
                  className="h-44 w-44 rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80">
                  <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
                </div>
              )}
            </div>
          )}
        </section>

        {/* ═══ Meals List ═══ */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Refeições</h2>
            <span className="text-xs text-text-muted">{meals.length} item(ns)</span>
          </div>

          {meals.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center gap-3 rounded-[28px] border border-emerald-100 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_8px_18px_rgba(5,150,105,0.14)]">
                <DSIcon name="plus" size={24} className="text-brand-primary" />
              </div>
              <p className="text-sm font-bold text-slate-600">Nenhuma refeição registrada</p>
              <Button variant="secondary" size="sm" onClick={() => setShowSearch(true)}>
                <DSIcon name="plus" size={16} />
                Adicionar Refeição
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(
                [
                  'breakfast',
                  'snack',
                  'lunch',
                  'pre_workout',
                  'post_workout',
                  'dinner',
                ] as MealType[]
              ).map((type) => {
                const items = grouped.get(type)
                if (!items?.length) return null
                return (
                  <div key={type} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_6px_14px_rgba(5,150,105,0.16)]"><DSIcon name="apple" size={15} /></span>
                      <span className="text-xs font-bold text-text-primary">
                        {MEAL_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-primary">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-text-muted">{meal.quantity_g}g</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span>{Math.round(meal.calories_total)} kcal</span>
                            <span className="text-brand-primary">
                              {formatMacro(meal.protein_total)}p
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ═══ Link para IA Dieta ═══ */}
        <Link
          href="/ia/dieta"
          className="flex items-center gap-3 rounded-[28px] border border-emerald-100 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] transition-colors hover:bg-emerald-50/70"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_8px_18px_rgba(5,150,105,0.14)]">
            <DSIcon name="sparkles" size={20} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">Plano Alimentar com IA</p>
            <p className="text-xs text-text-muted">
              Gere um plano personalizado baseado na sua avaliação
            </p>
          </div>
          <DSIcon name="chevronRight" size={16} className="text-text-muted" />
        </Link>
      </div>

      {/* ═══ Search / Log Modal ═══ */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary">
          {/* Modal header */}
          <header className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
            <button
              onClick={() => {
                setShowSearch(false)
                setSelectedFood(null)
                setSearchQuery('')
                setShowManualFood(false)
              }}
              className="p-1"
            >
              <DSIcon name="x" size={20} className="text-text-primary" />
            </button>
            <h2 className="flex-1 text-base font-bold text-text-primary">
              {selectedFood ? 'Registrar Refeição' : 'Buscar Alimento'}
            </h2>
            {!selectedFood && (
              <>
                <button
                  onClick={() => setShowManualFood((value) => !value)}
                  title="Adicionar alimento manual"
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    showManualFood
                      ? 'bg-brand-primary text-bg-primary'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  )}
                >
                  <DSIcon name="edit" size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setShowBarcode(true)
                  }}
                  title="Escanear código de barras"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                >
                  <DSIcon name="scan" size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setShowFoodCamera(true)
                  }}
                  title="Identificar por foto"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                >
                  <DSIcon name="camera" size={16} />
                </button>
              </>
            )}
          </header>

          {selectedFood ? (
            /* ── Log form ── */
            <div className="flex flex-1 flex-col p-4">
              <div className="glass-card mb-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary">{selectedFood.name}</p>
                    <p className="mt-1 text-xs capitalize text-text-muted">{selectedFood.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextFavorite = !selectedFoodIsFavorite
                      toggleFavorite.mutate(
                        { foodId: selectedFood.id, favorite: nextFavorite },
                        {
                          onSuccess: () => setSelectedFood({ ...selectedFood, is_favorite: nextFavorite }),
                        }
                      )
                    }}
                    disabled={toggleFavorite.isPending}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
                      selectedFoodIsFavorite
                        ? 'border-amber-400/40 bg-amber-400/12 text-amber-300'
                        : 'border-white/8 bg-white/6 text-text-muted hover:text-amber-300'
                    )}
                    title={selectedFoodIsFavorite ? 'Remover dos favoritos' : 'Favoritar alimento'}
                  >
                    <DSIcon name="star" size={16} />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="font-bold text-text-primary">{selectedFood.calories}</span>
                    <p className="text-text-muted">kcal</p>
                  </div>
                  <div>
                    <span className="font-bold text-brand-primary">{selectedFood.protein_g}g</span>
                    <p className="text-text-muted">prot</p>
                  </div>
                  <div>
                    <span className="font-bold text-amber-400">{selectedFood.carbs_g}g</span>
                    <p className="text-text-muted">carb</p>
                  </div>
                  <div>
                    <span className="font-bold text-red-400">{selectedFood.fat_g}g</span>
                    <p className="text-text-muted">gord</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-text-muted">
                  por {selectedFood.standard_portion_g}g (porção padrão)
                </p>
              </div>

              {/* Meal type selector */}
              <label className="mb-2 text-xs font-bold text-text-muted">Tipo de Refeição</label>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {(
                  [
                    'breakfast',
                    'lunch',
                    'snack',
                    'dinner',
                    'pre_workout',
                    'post_workout',
                  ] as MealType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={cn(
                      'rounded-xl px-2 py-2 text-xs font-semibold transition-colors',
                      selectedMealType === type
                        ? 'bg-brand-primary text-bg-primary'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    )}
                  >
                    {MEAL_TYPE_ICONS[type]} {MEAL_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <label className="mb-2 text-xs font-bold text-text-muted">Quantidade (g)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="mb-6 rounded-xl border border-white/8 bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                min={1}
              />

              {/* Macros preview */}
              <div className="mb-6 grid grid-cols-4 gap-2 rounded-xl bg-bg-secondary p-3 text-center text-xs">
                {(() => {
                  const ratio = quantity / (selectedFood.standard_portion_g || 100)
                  return (
                    <>
                      <div>
                        <span className="font-bold text-text-primary">
                          {Math.round(selectedFood.calories * ratio)}
                        </span>
                        <p className="text-text-muted">kcal</p>
                      </div>
                      <div>
                        <span className="font-bold text-brand-primary">
                          {formatMacro(selectedFood.protein_g * ratio)}g
                        </span>
                        <p className="text-text-muted">prot</p>
                      </div>
                      <div>
                        <span className="font-bold text-amber-400">
                          {formatMacro(selectedFood.carbs_g * ratio)}g
                        </span>
                        <p className="text-text-muted">carb</p>
                      </div>
                      <div>
                        <span className="font-bold text-red-400">
                          {formatMacro(selectedFood.fat_g * ratio)}g
                        </span>
                        <p className="text-text-muted">gord</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              <div className="mt-auto flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setSelectedFood(null)
                    setSearchQuery('')
                  }}
                >
                  Voltar
                </Button>
                <Button className="flex-1" onClick={handleLogMeal} loading={logMeal.isPending}>
                  <DSIcon name="plus" size={16} />
                  Registrar
                </Button>
              </div>
            </div>
          ) : (
            /* ── Search view ── */
            <div className="flex flex-1 flex-col">
              <div className="border-b border-white/6 px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl bg-bg-secondary px-3 py-2.5">
                  <DSIcon name="search" size={16} className="text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar alimento... (mín. 2 letras)"
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}>
                      <DSIcon name="x" size={14} className="text-text-muted" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                {showManualFood ? (
                  <div className="space-y-4 py-4">
                    <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/6 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <DSIcon name="edit" size={16} className="text-brand-primary" />
                        <p className="text-sm font-bold text-text-primary">Entrada manual</p>
                      </div>
                      <div className="space-y-3">
                        <Input
                          value={manualFood.name}
                          onChange={(e) => updateManualFoodField('name', e.target.value)}
                          placeholder="Nome do alimento"
                        />
                        <select
                          value={manualFood.category}
                          onChange={(e) => updateManualFoodField('category', e.target.value)}
                          className="w-full rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                        >
                          {MANUAL_FOOD_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            inputMode="decimal"
                            value={manualFood.calories}
                            onChange={(e) => updateManualFoodField('calories', e.target.value)}
                            placeholder="kcal"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            value={manualFood.standard_portion_g}
                            onChange={(e) => updateManualFoodField('standard_portion_g', e.target.value)}
                            placeholder="Porção g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            inputMode="decimal"
                            value={manualFood.protein_g}
                            onChange={(e) => updateManualFoodField('protein_g', e.target.value)}
                            placeholder="Proteína g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            inputMode="decimal"
                            value={manualFood.carbs_g}
                            onChange={(e) => updateManualFoodField('carbs_g', e.target.value)}
                            placeholder="Carbo g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            inputMode="decimal"
                            value={manualFood.fat_g}
                            onChange={(e) => updateManualFoodField('fat_g', e.target.value)}
                            placeholder="Gordura g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                        </div>
                        <p className="text-[11px] leading-relaxed text-text-muted">
                          Valores por porção. Calorias, proteínas, carboidratos e gorduras são obrigatórios.
                        </p>
                        {manualFoodError && (
                          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            <DSIcon name="alertCircle" size={14} className="mt-0.5 shrink-0" />
                            <span>{manualFoodError}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={handleCreateManualFood}
                        loading={createFood.isPending || logMeal.isPending}
                        disabled={!manualFood.name.trim() || createFood.isPending || logMeal.isPending}
                      >
                        <DSIcon name="save" size={16} />
                        Salvar e registrar no dia
                      </Button>
                    </div>
                  </div>
                ) : trimmedSearchQuery.length < 2 ? (
                  <div className="flex flex-col items-center justify-center pt-16 text-center">
                    <DSIcon name="search" size={32} className="mb-3 text-text-muted/50" />
                    <p className="text-sm text-text-muted">
                      Digite pelo menos 2 letras para buscar
                    </p>
                    <div className="mt-5 flex max-w-xs flex-wrap justify-center gap-2">
                      {QUICK_SEARCH_TERMS.map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="rounded-full border border-white/8 bg-bg-secondary px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => {
                          setShowSearch(false)
                          setShowBarcode(true)
                        }}
                        className="flex items-center gap-2 rounded-xl bg-bg-secondary px-4 py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary"
                      >
                        <DSIcon name="scan" size={14} />
                        Código de barras
                      </button>
                      <button
                        onClick={() => {
                          setShowSearch(false)
                          setShowFoodCamera(true)
                        }}
                        className="flex items-center gap-2 rounded-xl bg-bg-secondary px-4 py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary"
                      >
                        <DSIcon name="camera" size={14} />
                        Identificar foto
                      </button>
                    </div>
                    {(favoriteFoods.length > 0 || recentFoods.length > 0) && (
                      <div className="mt-8 w-full space-y-5 text-left">
                        {favoriteFoods.length > 0 && (
                          <section>
                            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-amber-300">
                              <DSIcon name="star" size={13} />
                              Favoritos
                            </h3>
                            <div className="space-y-2">
                              {favoriteFoods.slice(0, 6).map((food) => renderFoodRow(food, 'favorito'))}
                            </div>
                          </section>
                        )}
                        {recentFoods.length > 0 && (
                          <section>
                            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-text-muted">
                              <DSIcon name="clock" size={13} />
                              Recentes
                            </h3>
                            <div className="space-y-2">
                              {recentFoods.slice(0, 6).map((food) => renderFoodRow(food, 'recente'))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}
                  </div>
                ) : searchLoading ? (
                  <div className="flex items-center justify-center pt-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                  </div>
                ) : !foods?.length ? (
                  <div className="flex flex-col items-center justify-center pt-16 text-center">
                    <p className="text-sm text-text-muted">
                      Nenhum alimento encontrado para &quot;{searchQuery}&quot;
                    </p>
                    <p className="mt-2 max-w-72 text-xs text-text-muted">
                      Tente uma palavra mais simples ou use câmera/código de barras para identificar mais rápido.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShowSearch(false)
                          setShowFoodCamera(true)
                        }}
                      >
                        <DSIcon name="camera" size={14} />
                        Identificar por foto
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowSearch(false)
                          setShowBarcode(true)
                        }}
                      >
                        <DSIcon name="scan" size={14} />
                        Código de barras
                      </Button>
                    </div>

                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowManualFood(true)}>
                      <DSIcon name="edit" size={14} />
                      Cadastrar manualmente (opcional)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 pb-1 pt-2">
                      <p className="text-[11px] font-bold uppercase text-text-muted">
                        Sugestões para &quot;{trimmedSearchQuery}&quot;
                      </p>
                      {searchRefreshing && (
                        <DSIcon name="loader" size={13} className="animate-spin text-text-muted" />
                      )}
                    </div>
                    {foods.map((food) => renderFoodRow(food))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Barcode Scanner Modal (Sprint 14) ═══ */}
      {showBarcode && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowBarcode(false)}
        />
      )}

      {/* ═══ Food Camera / Vision AI Modal (Sprint 14) ═══ */}
      {showFoodCamera && (
        <FoodCamera
          onSearch={handleFoodCameraSearch}
          onClose={() => setShowFoodCamera(false)}
        />
      )}
    </div>
  )
}
