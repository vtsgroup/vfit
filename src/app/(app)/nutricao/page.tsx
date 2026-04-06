/**
 * src/app/(app)/nutricao/page.tsx
 *
 * Nutrição — Tracker de refeições e macros diários (VFIT B2C)
 *
 * Seções:
 * 1. Macros do dia (calorias, proteína, carbs, gordura) com barras de progresso
 * 2. Lista de refeições agrupadas por tipo
 * 3. Busca de alimentos + registrar refeição
 * 4. Navegação de data (hoje, ontem, etc.)
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

  const { data: dailyData, isLoading } = useMealsToday(selectedDate)
  const { data: foods, isLoading: searchLoading } = useFoodSearch(searchQuery)
  const { data: targets = { calories: 2000, protein: 150, carbs: 250, fat: 65 } } = useNutritionTargets()
  const logMeal = useLogMeal()

  const totals = dailyData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const meals = dailyData?.meals ?? []

  // Agrupar refeições por tipo
  const grouped = useMemo(() => {
    const map = new Map<MealType, typeof meals>()
    for (const m of meals) {
      const list = map.get(m.meal_type as MealType) ?? []
      list.push(m)
      map.set(m.meal_type as MealType, list)
    }
    return map
  }, [meals])

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
      <div className="space-y-5 px-4 pt-1">
        {/* Action button — add food */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSearch(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary transition-colors hover:bg-brand-primary/20"
          >
            <DSIcon name="plus" size={18} />
          </button>
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
            onClick={() => setSelectedDate((d) => {
              const next = shiftDate(d, 1)
              return next > today ? d : next
            })}
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

        {/* ═══ Macros Overview ═══ */}
        <section className="glass-card">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
            Resumo do Dia
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Calories — big number */}
              <div className="mb-4 text-center">
                <span className="text-3xl font-extrabold text-text-primary">
                  {Math.round(totals.calories)}
                </span>
                <span className="ml-1 text-sm text-text-muted">
                  / {targets.calories} kcal
                </span>
                <div className="mx-auto mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all duration-500"
                    style={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Macros grid */}
              <div className="grid grid-cols-3 gap-3">
                <MacroCard
                  label="Proteína"
                  value={totals.protein}
                  target={targets.protein}
                  unit="g"
                  color="text-blue-400"
                  bgColor="bg-blue-400"
                />
                <MacroCard
                  label="Carboidrato"
                  value={totals.carbs}
                  target={targets.carbs}
                  unit="g"
                  color="text-amber-400"
                  bgColor="bg-amber-400"
                />
                <MacroCard
                  label="Gordura"
                  value={totals.fat}
                  target={targets.fat}
                  unit="g"
                  color="text-red-400"
                  bgColor="bg-red-400"
                />
              </div>
            </>
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
              <p className="text-sm text-text-secondary">
                Nenhuma refeição registrada
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <DSIcon name="plus" size={16} />
                Adicionar Refeição
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(
                ['breakfast', 'snack', 'lunch', 'pre_workout', 'post_workout', 'dinner'] as MealType[]
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
                            <p className="text-xs text-text-muted">
                              {meal.quantity_g}g
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span>{Math.round(meal.calories_total)} kcal</span>
                            <span className="text-blue-400">
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
          <header className="flex items-center gap-3 border-b border-border-light/20 px-4 py-3">
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
            <h2 className="text-base font-bold text-text-primary">
              {selectedFood ? 'Registrar Refeição' : 'Buscar Alimento'}
            </h2>
          </header>

          {selectedFood ? (
            /* ── Log form ── */
            <div className="flex flex-1 flex-col p-4">
              <div className="glass-card mb-6">
                <p className="font-bold text-text-primary">{selectedFood.name}</p>
                <p className="mt-1 text-xs text-text-muted capitalize">{selectedFood.category}</p>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="font-bold text-text-primary">{selectedFood.calories}</span>
                    <p className="text-text-muted">kcal</p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-400">{selectedFood.protein_g}g</span>
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
                  ['breakfast', 'lunch', 'snack', 'dinner', 'pre_workout', 'post_workout'] as MealType[]
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
                className="mb-6 rounded-xl border border-border-light/20 bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary"
                min={1}
              />

              {/* Macros preview for quantity */}
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
                        <span className="font-bold text-blue-400">
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
                <Button
                  className="flex-1"
                  onClick={handleLogMeal}
                  loading={logMeal.isPending}
                >
                  <DSIcon name="plus" size={16} />
                  Registrar
                </Button>
              </div>
            </div>
          ) : (
            /* ── Search view ── */
            <div className="flex flex-1 flex-col">
              <div className="border-b border-border-light/10 px-4 py-3">
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
                    {foods.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food)
                          setQuantity(food.standard_portion_g || 100)
                        }}
                        className="flex w-full items-center justify-between rounded-xl bg-bg-secondary p-3 text-left transition-colors hover:bg-bg-tertiary active:scale-[0.99]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {food.name}
                          </p>
                          <p className="text-xs text-text-muted capitalize">{food.category}</p>
                        </div>
                        <div className="ml-3 text-right text-xs text-text-secondary">
                          <span className="font-bold">{food.calories} kcal</span>
                          <p className="text-text-muted">
                            P:{food.protein_g} C:{food.carbs_g} G:{food.fat_g}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────

function MacroCard({
  label,
  value,
  target,
  unit,
  color,
  bgColor,
}: {
  label: string
  value: number
  target: number
  unit: string
  color: string
  bgColor: string
}) {
  const pct = Math.min((value / target) * 100, 100)

  return (
    <div className="rounded-xl bg-bg-primary/50 p-2.5 text-center">
      <p className={cn('text-lg font-bold', color)}>
        {formatMacro(value)}
        <span className="text-xs text-text-muted">{unit}</span>
      </p>
      <div className="mx-auto my-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className={cn('h-full rounded-full transition-all duration-500', bgColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-text-muted">
        {label} · {target}{unit}
      </p>
    </div>
  )
}
