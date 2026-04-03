/**
 * src/app/dashboard/marketplace/page.tsx
 *
 * Marketplace — Browse & Sell Workout Plans
 *
 * Exports: MarketplacePage
 * Hooks: useState, useAuthStore, useMarketplacePlans
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Marketplace — Browse & Sell Workout Plans
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarketplacePageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { MD3Input } from '@/components/ui/md3-input'
import { StyledSelect } from '@/components/ui/styled-select'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import {
  useMarketplacePlans,
  categoryLabels,
  categoryIcons,
  difficultyLabels,
  difficultyColors,
  type PlanCategory,
  type PlanDifficulty,
  type WorkoutPlan,
} from '@/hooks/use-marketplace'

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

const categoryOptions: { value: string; label: string; icon: string }[] = [
  { value: '', label: 'Todas', icon: '' },
  { value: 'hipertrofia', label: 'Hipertrofia', icon: '' },
  { value: 'emagrecimento', label: 'Emagrecimento', icon: '' },
  { value: 'funcional', label: 'Funcional', icon: '' },
  { value: 'cardio', label: 'Cardio', icon: '' },
  { value: 'flexibilidade', label: 'Flexibilidade', icon: '' },
  { value: 'outro', label: 'Outro', icon: '' },
]

const difficultyOptions: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

const sortOptions: { value: string; label: string }[] = [
  { value: 'created_at', label: 'Mais recentes' },
  { value: 'price_brl', label: 'Preço' },
  { value: 'total_sales', label: 'Mais vendidos' },
  { value: 'title', label: 'Nome' },
]

export default function MarketplacePage() {
  const { isPersonalView } = useEffectiveUserView()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [sort, setSort] = useState('total_sales')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useMarketplacePlans({
    page,
    per_page: 12,
    category: (category || undefined) as PlanCategory | undefined,
    difficulty: (difficulty || undefined) as PlanDifficulty | undefined,
    search: search || undefined,
    sort: sort as 'created_at' | 'price_brl' | 'total_sales' | 'title',
    order,
  })

  const plans = data?.plans ?? []
  const meta = data?.meta

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <AuthGuard>
      <div className="space-y-6 stagger-children">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary">
              <DSIcon name="shoppingBag" size={28} className="mr-2 inline text-brand-primary" />
              Marketplace
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Descubra planos de treino criados por profissionais qualificados
            </p>
          </div>

          {isPersonalView && (
            <Link href="/dashboard/marketplace/create">
              <Button>
                <DSIcon name="plus" size={16} className="mr-2" />
                Vender Plano
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filters */}
        <div className="rounded-xl border border-border-dark bg-bg-dark-secondary p-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="flex-1">
              <MD3Input
                label="Buscar planos de treino"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar planos de treino..."
                leadingIcon={<DSIcon name="search" size={16} />}
              />
            </div>
            <Button type="submit" variant="secondary">
              <DSIcon name="search" size={16} />
            </Button>
          </form>

          {/* Category chips — DS v3 Filter Pills */}
          <div className="mb-3 flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1) }}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all duration-200',
                  category === cat.value
                    ? 'border-brand-primary bg-brand-primary text-white shadow-[0_2px_0_rgba(5,150,105,0.6),0_4px_8px_rgba(5,150,105,0.25)]'
                    : 'border-border-light bg-bg-secondary text-text-muted hover:border-brand-primary/40 hover:text-brand-primary'
                )}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty + Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <DSIcon name="filter" size={14} className="text-text-muted" />
              <StyledSelect
                value={difficulty}
                onChange={(v) => { setDifficulty(v); setPage(1) }}
                options={difficultyOptions}
                compact
              />
            </div>

            <div className="flex items-center gap-2">
              <DSIcon name="trendingUp" size={14} className="text-text-muted" />
              <StyledSelect
                value={sort}
                onChange={(v) => { setSort(v); setPage(1) }}
                options={sortOptions}
                compact
              />
            </div>

            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="rounded-xl border border-border-dark bg-bg-dark px-3 py-1.5 text-xs text-text-secondary hover:text-brand-primary"
              title={order === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              {order === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>

            {(search || category || difficulty) && (
              <button
                onClick={() => { setSearch(''); setSearchInput(''); setCategory(''); setDifficulty(''); setPage(1) }}
                className="text-xs text-error hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <MarketplacePageSkeleton />
        ) : plans.length === 0 ? (
          <EmptyStateDS
            icon="shoppingBag"
            title="Nenhum plano encontrado"
            description={
              search || category || difficulty
                ? 'Tente ajustar seus filtros de busca.'
                : 'Ainda não há planos publicados no marketplace. Seja o primeiro a vender!'
            }
          />
        ) : (
          <>
            {/* Plans grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            {/* Pagination */}
            {meta && <Pagination page={page} totalPages={meta.total_pages} total={meta.total} itemLabel="planos" onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => Math.min(meta.total_pages, p + 1))} />}
          </>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Plan Card Component
// ============================================

function PlanCard({ plan }: { plan: WorkoutPlan }) {
  const icon = categoryIcons[plan.category] || ''
  const catLabel = categoryLabels[plan.category] || plan.category
  const diffLabel = difficultyLabels[plan.difficulty] || plan.difficulty
  const diffColor = difficultyColors[plan.difficulty] || 'bg-text-muted/10 text-text-muted'

  return (
    <Link
      href={`/dashboard/marketplace/view?id=${plan.id}`}
      className="group flex flex-col rounded-xl border border-border-dark bg-bg-dark-secondary transition hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      {/* Thumbnail / Gradient */}
      <div className="relative h-36 overflow-hidden rounded-t-xl bg-linear-to-br from-brand-primary/20 via-brand-accent/10 to-bg-dark">
        {plan.thumbnail_url ? (
          <Image
            src={plan.thumbnail_url}
            alt={plan.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl">{icon}</span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-bg-dark/90 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm font-bold text-brand-primary">
            {formatCurrency(plan.price_brl)}
          </span>
        </div>

        {/* Featured badge */}
        {plan.is_featured && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-warning/90 px-2 py-1 text-xs font-bold text-bg-dark">
            <DSIcon name="star" size={12} /> Destaque
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category + Difficulty */}
        <div className="mb-2 flex items-center gap-2">
          <Badge className="bg-brand-primary/10 text-brand-primary text-xs">
            {icon} {catLabel}
          </Badge>
          <Badge className={cn('text-xs', diffColor)}>
            {diffLabel}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-1 font-semibold text-text-primary line-clamp-2 group-hover:text-brand-primary transition">
          {plan.title}
        </h3>

        {/* Description */}
        <p className="mb-3 text-xs text-text-muted line-clamp-2">
          {plan.description}
        </p>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <DSIcon name="calendar" size={12} />
            {plan.duration_weeks} sem.
          </span>
          <span className="flex items-center gap-1">
            <DSIcon name="dumbbell" size={12} />
            {plan.workouts_per_week}x/sem
          </span>
          <span className="flex items-center gap-1">
            <DSIcon name="users" size={12} />
            {plan.total_sales} venda{plan.total_sales !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Creator */}
        <div className="mt-3 flex items-center gap-2 border-t border-border-dark pt-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-white">
            {plan.creator_name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <span className="text-xs text-text-secondary">{plan.creator_name}</span>
        </div>
      </div>
    </Link>
  )
}
