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
  formatMacro,
  type MealType,
  type VfitFood,
} from '@/hooks/use-vfit-nutrition'
import { useStudentProfile, useLinkNutritionist } from '@/hooks/use-student-app'

// ── Food category visual config ────────────────────────

const FOOD_CATEGORY_CONFIG: Record<string, { icon: DSIconName; color: string; bg: string }> = {
  'cereais e derivados': { icon: 'wheat', color: 'text-amber-700', bg: 'bg-amber-500' },
  'leguminosas': { icon: 'apple', color: 'text-emerald-700', bg: 'bg-emerald-500' },
  'carnes': { icon: 'dumbbell', color: 'text-red-700', bg: 'bg-red-500' },
  'aves': { icon: 'dumbbell', color: 'text-orange-700', bg: 'bg-orange-500' },
  'peixes': { icon: 'droplets', color: 'text-sky-700', bg: 'bg-sky-500' },
  'laticínios': { icon: 'flask', color: 'text-slate-700', bg: 'bg-slate-500' },
  'frutas': { icon: 'apple', color: 'text-rose-700', bg: 'bg-rose-500' },
  'verduras': { icon: 'apple', color: 'text-emerald-700', bg: 'bg-emerald-500' },
  'legumes': { icon: 'apple', color: 'text-orange-700', bg: 'bg-orange-500' },
  'ovos': { icon: 'circle', color: 'text-yellow-700', bg: 'bg-yellow-500' },
  'gorduras': { icon: 'droplets', color: 'text-orange-700', bg: 'bg-orange-500' },
  'açúcares': { icon: 'sparkles', color: 'text-pink-700', bg: 'bg-pink-500' },
  'bebidas': { icon: 'droplets', color: 'text-cyan-700', bg: 'bg-cyan-500' },
  'industrializado': { icon: 'archive', color: 'text-slate-700', bg: 'bg-slate-500' },
  'suplementos': { icon: 'flask', color: 'text-violet-700', bg: 'bg-violet-500' },
  'cereais': { icon: 'wheat', color: 'text-amber-700', bg: 'bg-amber-500' },
  'proteinas': { icon: 'dumbbell', color: 'text-red-700', bg: 'bg-red-500' },
  'laticinios': { icon: 'flask', color: 'text-slate-700', bg: 'bg-slate-500' },
  'tuberculos': { icon: 'apple', color: 'text-orange-700', bg: 'bg-orange-500' },
  'oleos': { icon: 'droplets', color: 'text-orange-700', bg: 'bg-orange-500' },
  'nozes': { icon: 'circle', color: 'text-amber-700', bg: 'bg-amber-500' },
  'sementes': { icon: 'wheat', color: 'text-lime-700', bg: 'bg-lime-500' },
  'preparacoes': { icon: 'shoppingBag', color: 'text-sky-700', bg: 'bg-sky-500' },
  'default': { icon: 'apple', color: 'text-slate-700', bg: 'bg-slate-500' },
}

const MEAL_TYPE_VISUALS: Record<MealType, { icon: DSIconName; bg: string; text: string }> = {
  breakfast: { icon: 'sun', bg: 'bg-amber-500', text: 'text-amber-700' },
  snack: { icon: 'apple', bg: 'bg-emerald-500', text: 'text-emerald-700' },
  lunch: { icon: 'clock', bg: 'bg-sky-500', text: 'text-sky-700' },
  pre_workout: { icon: 'zap', bg: 'bg-violet-500', text: 'text-violet-700' },
  post_workout: { icon: 'dumbbell', bg: 'bg-emerald-500', text: 'text-emerald-700' },
  dinner: { icon: 'moon', bg: 'bg-slate-600', text: 'text-slate-700' },
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
  const [showBarcode, setShowBarcode] = useState(false)
  const [showFoodCamera, setShowFoodCamera] = useState(false)
  const [nutritionistReferralCode, setNutritionistReferralCode] = useState('')
  const [showNutritionQr, setShowNutritionQr] = useState(false)
  const [nutritionInviteQrUrl, setNutritionInviteQrUrl] = useState('')
  const { data: studentProfile } = useStudentProfile()
  const linkNutritionist = useLinkNutritionist()

  const { data: dailyData, isLoading } = useMealsToday(selectedDate)
  const { data: foods, isLoading: searchLoading } = useFoodSearch(searchQuery)
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
          setSelectedFood(null)
          setSearchQuery('')
          setShowSearch(false)
          setQuantity(100)
        },
      }
    )
  }

  function handleCreateManualFood() {
    const name = manualFood.name.trim()
    if (!name) return

    createFood.mutate(
      {
        name,
        category: manualFood.category,
        calories: Number(manualFood.calories) || 0,
        protein_g: Number(manualFood.protein_g) || 0,
        carbs_g: Number(manualFood.carbs_g) || 0,
        fat_g: Number(manualFood.fat_g) || 0,
        standard_portion_g: Math.max(1, Number(manualFood.standard_portion_g) || 100),
      },
      {
        onSuccess: (food) => {
          setSelectedFood(food)
          setQuantity(food.standard_portion_g || 100)
          setSearchQuery(food.name)
          setShowManualFood(false)
          setManualFood(EMPTY_MANUAL_FOOD)
        },
      }
    )
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
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 text-left shadow-[0_10px_28px_-22px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.92)] transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_16px_36px_-24px_rgba(14,165,233,0.28)] active:translate-y-0 active:scale-[0.99] dark:border-white/10 dark:bg-white/6"
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_8px_18px_-10px_rgba(15,23,42,0.65),inset_0_1px_0_rgba(255,255,255,0.24)]',
            cat.bg
          )}
        >
          <DSIcon name={cat.icon} size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">
            {food.name}
          </p>
          <p className={cn('text-xs capitalize', cat.color)}>
            {label || food.category}
          </p>
        </div>
        <div className="ml-1 text-right text-xs text-slate-500 dark:text-text-secondary">
          <div className="flex items-center justify-end gap-1">
            {favorite && <DSIcon name="star" size={12} className="text-amber-500" />}
            <span className="font-black text-slate-700 dark:text-text-primary">{food.calories} kcal</span>
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.92)] transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 active:translate-y-0"
          >
            <DSIcon name="chevronLeft" size={16} />
          </button>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.34)]">
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
              'flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_8px_20px_-16px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.92)] transition-all',
              selectedDate === today
                ? 'text-slate-300 opacity-50'
                : 'text-slate-600 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 active:translate-y-0'
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
        <section className="relative overflow-hidden rounded-[26px] border border-emerald-100 bg-linear-to-br from-white via-emerald-50/55 to-sky-50/55 p-4 shadow-[0_24px_58px_-34px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.92)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-emerald-200 to-transparent" />

          <div className="relative mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Nutricionista</p>
              <p className="mt-1 max-w-72 text-[13px] leading-relaxed text-slate-600">
                Convide um nutricionista e vincule por código para acompanhamento alimentar.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_10px_22px_-12px_rgba(5,150,105,0.82),inset_0_1px_0_rgba(255,255,255,0.28)]">
              <DSIcon name="userPlus" size={18} />
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
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(nutritionInviteLink)}
            >
              <DSIcon name="copy" size={14} />
              Copiar link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite VFIT — Nutricionista')}&body=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT na parte nutricional.\n\nContato/cadastro: ${nutritionInviteLink}`)}`, '_blank')}
            >
              <DSIcon name="mail" size={14} />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para meu acompanhamento nutricional no VFIT.\n\nContato/cadastro: ${nutritionInviteLink}`)}`, '_blank')}
            >
              <DSIcon name="share2" size={14} />
              WhatsApp
            </Button>
            <Button
              variant={showNutritionQr ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowNutritionQr((v) => !v)}
            >
              <DSIcon name="qrcode" size={14} />
              QR Code
            </Button>
          </div>

          {showNutritionQr && (
            <div className="relative mt-4 flex justify-center">
              {nutritionInviteQrUrl ? (
                <Image
                  src={nutritionInviteQrUrl}
                  alt="QR Code convite nutricionista"
                  width={176}
                  height={176}
                  unoptimized
                  className="h-44 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.32)]"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-slate-200 bg-white/80">
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
            <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_24px_58px_-36px_rgba(15,23,42,0.36),inset_0_1px_0_rgba(255,255,255,0.95)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-sky-50 to-transparent" />
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_24px_-14px_rgba(5,150,105,0.86),inset_0_1px_0_rgba(255,255,255,0.28)]">
                <DSIcon name="plus" size={24} />
              </div>
              <p className="relative text-sm font-bold text-slate-800">Nenhuma refeição registrada</p>
              <p className="relative mx-auto mt-1 max-w-56 text-xs leading-relaxed text-slate-500">Comece com um alimento ou use a IA para montar o dia.</p>
              <Button className="relative mt-4" variant="secondary" size="sm" onClick={() => setShowSearch(true)}>
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
                const visual = MEAL_TYPE_VISUALS[type]
                return (
                  <div key={type} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.94)]">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-white shadow-[0_9px_18px_-12px_rgba(15,23,42,0.74),inset_0_1px_0_rgba(255,255,255,0.24)]', visual.bg)}>
                        <DSIcon name={visual.icon} size={16} />
                      </span>
                      <span className={cn('text-xs font-black uppercase tracking-[0.12em]', visual.text)}>
                        {MEAL_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/85 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-slate-500">{meal.quantity_g}g</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-bold text-slate-700">{Math.round(meal.calories_total)} kcal</span>
                            <span className="font-black text-emerald-700">
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
          className="relative flex items-center gap-3 overflow-hidden rounded-[26px] border border-sky-100 bg-linear-to-br from-white via-sky-50/70 to-emerald-50/55 p-4 shadow-[0_24px_58px_-34px_rgba(14,165,233,0.30),inset_0_1px_0_rgba(255,255,255,0.94)] transition-all hover:-translate-y-0.5 hover:border-sky-200 active:translate-y-0"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-emerald-500 text-white shadow-[0_12px_24px_-14px_rgba(14,165,233,0.74),inset_0_1px_0_rgba(255,255,255,0.28)]">
            <DSIcon name="sparkles" size={20} />
          </div>
          <div className="relative flex-1">
            <p className="text-sm font-black text-slate-900">Plano Alimentar com IA</p>
            <p className="text-xs leading-relaxed text-slate-500">
              Gere um plano personalizado baseado na sua avaliação
            </p>
          </div>
          <DSIcon name="chevronRight" size={16} className="relative text-slate-400" />
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
                ).map((type) => {
                  const visual = MEAL_TYPE_VISUALS[type]
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedMealType(type)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors',
                        selectedMealType === type
                          ? 'bg-brand-primary text-bg-primary'
                          : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                      )}
                    >
                      <DSIcon name={visual.icon} size={13} />
                      {MEAL_TYPE_LABELS[type]}
                    </button>
                  )
                })}
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
                          onChange={(e) => setManualFood((food) => ({ ...food, name: e.target.value }))}
                          placeholder="Nome do alimento"
                        />
                        <select
                          value={manualFood.category}
                          onChange={(e) => setManualFood((food) => ({ ...food, category: e.target.value }))}
                          className="w-full rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                        >
                          {MANUAL_FOOD_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={manualFood.calories}
                            onChange={(e) => setManualFood((food) => ({ ...food, calories: e.target.value }))}
                            placeholder="kcal"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            value={manualFood.standard_portion_g}
                            onChange={(e) => setManualFood((food) => ({ ...food, standard_portion_g: e.target.value }))}
                            placeholder="Porção g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            value={manualFood.protein_g}
                            onChange={(e) => setManualFood((food) => ({ ...food, protein_g: e.target.value }))}
                            placeholder="Proteína g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            value={manualFood.carbs_g}
                            onChange={(e) => setManualFood((food) => ({ ...food, carbs_g: e.target.value }))}
                            placeholder="Carbo g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                          <input
                            type="number"
                            value={manualFood.fat_g}
                            onChange={(e) => setManualFood((food) => ({ ...food, fat_g: e.target.value }))}
                            placeholder="Gordura g"
                            className="rounded-xl border border-white/8 bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={handleCreateManualFood}
                        loading={createFood.isPending}
                        disabled={!manualFood.name.trim()}
                      >
                        <DSIcon name="save" size={16} />
                        Salvar e registrar
                      </Button>
                    </div>
                  </div>
                ) : searchQuery.length < 2 ? (
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
