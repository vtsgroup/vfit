/**
 * src/app/(app)/nutricao/page.tsx
 *
 * Nutrição — Tracker de refeições e macros diários (VFIT B2C)
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
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
  useLogMeal,
  useNutritionTargets,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  formatMacro,
  type MealType,
  type VfitFood,
} from '@/hooks/use-vfit-nutrition'
import { useStudentProfile, useLinkNutritionist } from '@/hooks/use-student-app'

// ── Food category visual config ────────────────────────

const FOOD_CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  'cereais e derivados': { emoji: '🌾', color: 'text-amber-400', bg: 'bg-amber-400/12' },
  'leguminosas': { emoji: '🫘', color: 'text-green-400', bg: 'bg-green-400/12' },
  'carnes': { emoji: '🥩', color: 'text-red-400', bg: 'bg-red-400/12' },
  'aves': { emoji: '🍗', color: 'text-orange-400', bg: 'bg-orange-400/12' },
  'peixes': { emoji: '🐟', color: 'text-blue-400', bg: 'bg-blue-400/12' },
  'laticínios': { emoji: '🥛', color: 'text-zinc-300', bg: 'bg-zinc-300/12' },
  'frutas': { emoji: '🍎', color: 'text-rose-400', bg: 'bg-rose-400/12' },
  'verduras': { emoji: '🥬', color: 'text-emerald-400', bg: 'bg-emerald-400/12' },
  'legumes': { emoji: '🥕', color: 'text-orange-400', bg: 'bg-orange-400/12' },
  'ovos': { emoji: '🥚', color: 'text-yellow-400', bg: 'bg-yellow-400/12' },
  'gorduras': { emoji: '🫙', color: 'text-amber-500', bg: 'bg-amber-500/12' },
  'açúcares': { emoji: '🍬', color: 'text-pink-400', bg: 'bg-pink-400/12' },
  'bebidas': { emoji: '🥤', color: 'text-brand-primary', bg: 'bg-brand-primary/12' },
  'industrializado': { emoji: '📦', color: 'text-zinc-400', bg: 'bg-zinc-400/12' },
  'suplementos': { emoji: '💊', color: 'text-violet-400', bg: 'bg-violet-400/12' },
  'default': { emoji: '🍽️', color: 'text-zinc-400', bg: 'bg-zinc-400/12' },
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
  const [showBarcode, setShowBarcode] = useState(false)
  const [showFoodCamera, setShowFoodCamera] = useState(false)
  const [nutritionistReferralCode, setNutritionistReferralCode] = useState('')
  const [showNutritionQr, setShowNutritionQr] = useState(false)
  const [nutritionInviteQrUrl, setNutritionInviteQrUrl] = useState('')
  const { data: studentProfile } = useStudentProfile()
  const linkNutritionist = useLinkNutritionist()

  const { data: dailyData, isLoading } = useMealsToday(selectedDate)
  const { data: foods, isLoading: searchLoading } = useFoodSearch(searchQuery)
  const { data: targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 } } =
    useNutritionTargets()
  const logMeal = useLogMeal()

  const totals = dailyData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const meals = useMemo(() => dailyData?.meals ?? [], [dailyData?.meals])

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

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* ─── Hero ─── */}
      <div
        className="mx-0 mb-5 rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <p className="text-xs font-semibold text-emerald-400">
          {(() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' })()}
        </p>
        <h1 className="bg-linear-to-r from-vfit-primary-100 to-vfit-primary-400 bg-clip-text text-4xl font-black text-transparent">
          Nutrição
        </h1>
        <p className="mt-1 text-xs text-emerald-200/80">Refeições e macros do dia</p>
      </div>

      <div className="space-y-5 px-4 pt-1">
        {/* Primary action */}
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowSearch(true)}>
            <DSIcon name="plus" size={16} />
            Adicionar
          </Button>
        </div>

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
        <section className="glass-card flex flex-col items-center py-4">
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
              size={220}
            />
          )}
        </section>

        {/* ═══ Convite/Vínculo com Nutricionista ═══ */}
        <section className="rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">Nutricionista</p>
              <p className="mt-1 text-[13px] text-text-secondary">
                Convide um nutricionista e vincule por código para acompanhamento alimentar.
              </p>
            </div>
            <DSIcon name="userPlus" size={18} className="text-brand-primary" />
          </div>

          <div className="mb-3 flex gap-2">
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

          <div className="flex flex-wrap gap-2">
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
            <div className="mt-4 flex justify-center">
              {nutritionInviteQrUrl ? (
                <img
                  src={nutritionInviteQrUrl}
                  alt="QR Code convite nutricionista"
                  className="h-44 w-44 rounded-xl border border-white/12 bg-white p-2"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-white/12 bg-white/6">
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
            <div className="glass-card flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8">
                <DSIcon name="plus" size={24} className="text-brand-primary" />
              </div>
              <p className="text-sm text-text-secondary">Nenhuma refeição registrada</p>
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
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
                  <div key={type} className="glass-card">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-base">{MEAL_TYPE_ICONS[type]}</span>
                      <span className="text-xs font-bold text-text-primary">
                        {MEAL_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between rounded-xl bg-bg-primary/50 px-3 py-2"
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
          className="glass-card flex items-center gap-3 transition-colors hover:bg-bg-tertiary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8">
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
                <p className="font-bold text-text-primary">{selectedFood.name}</p>
                <p className="mt-1 text-xs capitalize text-text-muted">{selectedFood.category}</p>
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
                {searchQuery.length < 2 ? (
                  <div className="flex flex-col items-center justify-center pt-16 text-center">
                    <DSIcon name="search" size={32} className="mb-3 text-text-muted/50" />
                    <p className="text-sm text-text-muted">
                      Digite pelo menos 2 letras para buscar
                    </p>
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    {foods.map((food) => {
                      const cat = getFoodCategoryConfig(food.category)
                      return (
                        <button
                          key={food.id}
                          onClick={() => {
                            setSelectedFood(food)
                            setQuantity(food.standard_portion_g || 100)
                          }}
                          className="flex w-full items-center gap-3 rounded-xl bg-bg-secondary p-3 text-left transition-colors hover:bg-bg-tertiary active:scale-[0.99]"
                        >
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
                              cat.bg
                            )}
                          >
                            {cat.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-primary">
                              {food.name}
                            </p>
                            <p className={cn('text-xs capitalize', cat.color)}>
                              {food.category}
                            </p>
                          </div>
                          <div className="ml-1 text-right text-xs text-text-secondary">
                            <span className="font-bold">{food.calories} kcal</span>
                            <p className="text-text-muted">
                              P:{food.protein_g} C:{food.carbs_g} G:{food.fat_g}
                            </p>
                          </div>
                        </button>
                      )
                    })}
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
