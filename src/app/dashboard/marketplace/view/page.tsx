/**
 * src/app/dashboard/marketplace/view/page.tsx
 *
 * View Plan Details — Marketplace
 *
 * Exports: ViewPlanPage
 * Hooks: useSearchParams, useAuthStore, usePlanDetail, useBuyPlan, useUpdatePlan, useDeletePlan
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// View Plan Details — Marketplace
// ============================================

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarketplaceDetailSkeleton } from '@/components/ui/page-skeletons'
import { useAuthStore } from '@/stores/auth-store'
import {
  usePlanDetail,
  useUpdatePlan,
  useDeletePlan,
  categoryLabels,
  categoryIcons,
  difficultyLabels,
  difficultyColors,
} from '@/hooks/use-marketplace'

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ViewPlanPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, error } = usePlanDetail(id)
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const plan = data?.plan
  const isOwner = plan && user && plan.created_by === user.id
  const icon = plan ? (categoryIcons[plan.category] || '') : ''

  if (isLoading) {
    return (
      <AuthGuard>
        <MarketplaceDetailSkeleton />
      </AuthGuard>
    )
  }

  if (!plan || error) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center py-20">
          <DSIcon name="shoppingBag" size={48} className="mb-4 text-text-muted" />
          <h3 className="text-lg font-semibold text-text-primary">Plano não encontrado</h3>
          <p className="mb-4 text-sm text-text-muted">O plano pode ter sido removido ou não existe.</p>
          <Link href="/dashboard/marketplace">
            <Button variant="secondary">Voltar ao Marketplace</Button>
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const planContent = plan.plan_content as { weeks?: Array<{
    week: number
    days: Array<{
      day: string
      exercises: Array<{
        name: string
        sets: number
        reps: string
        rest: string
        notes?: string
      }>
    }>
  }> }

  function handleTogglePublish() {
    if (!plan) return
    updatePlan.mutate({ id: plan.id, is_published: !plan.is_published })
  }

  function handleDelete() {
    if (!plan) return
    if (!confirm('Tem certeza que deseja remover este plano?')) return
    deletePlan.mutate(plan.id)
  }

  function handleBuy() {
    if (!plan) return
    router.push(`/dashboard/marketplace/checkout?plan=${plan.id}`)
  }

  return (
    <AuthGuard>
      <div className="w-full space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/marketplace"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar ao Marketplace
        </Link>

        {/* Hero */}
        <div className="overflow-hidden rounded-xl border border-border-dark bg-bg-dark-secondary">
          {/* Thumbnail */}
          <div className="relative h-48 bg-linear-to-br from-brand-primary/20 via-brand-accent/10 to-bg-dark sm:h-56">
            {plan.thumbnail_url ? (
              <Image
                src={plan.thumbnail_url}
                alt={plan.title}
                fill
                sizes="(max-width: 640px) 100vw, 896px"
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-7xl">{icon}</span>
              </div>
            )}

            {plan.is_featured && (
              <div className="absolute left-4 top-4 flex items-center gap-1 rounded-lg bg-warning/90 px-3 py-1.5 text-sm font-bold text-bg-dark">
                <DSIcon name="star" size={16} /> Destaque
              </div>
            )}

            {!plan.is_published && (
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg bg-text-muted/90 px-3 py-1.5 text-sm font-bold text-white">
                <DSIcon name="eyeOff" size={16} /> Rascunho
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-primary/10 text-brand-primary">
                {icon} {categoryLabels[plan.category] || plan.category}
              </Badge>
              <Badge className={cn(difficultyColors[plan.difficulty] || '')}>
                {difficultyLabels[plan.difficulty] || plan.difficulty}
              </Badge>
            </div>

            <h1 className="mb-2 text-2xl font-black tracking-tight text-text-primary">{plan.title}</h1>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-white">
                {plan.creator_name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <span className="text-sm text-text-secondary">por {plan.creator_name}</span>
              <span className="text-xs text-text-muted">· {formatDate(plan.created_at)}</span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-text-secondary">
              {plan.description}
            </p>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border-dark bg-bg-dark p-3 text-center">
                <DSIcon name="calendar" className="mx-auto mb-1 text-brand-primary" />
                <p className="text-lg font-bold text-text-primary">{plan.duration_weeks}</p>
                <p className="text-xs text-text-muted">semanas</p>
              </div>
              <div className="rounded-xl border border-border-dark bg-bg-dark p-3 text-center">
                <DSIcon name="dumbbell" className="mx-auto mb-1 text-brand-primary" />
                <p className="text-lg font-bold text-text-primary">{plan.workouts_per_week}x</p>
                <p className="text-xs text-text-muted">por semana</p>
              </div>
              <div className="rounded-xl border border-border-dark bg-bg-dark p-3 text-center">
                <DSIcon name="users" className="mx-auto mb-1 text-success" />
                <p className="text-lg font-bold text-text-primary">{plan.total_sales}</p>
                <p className="text-xs text-text-muted">vendas</p>
              </div>
              <div className="rounded-xl border border-border-dark bg-bg-dark p-3 text-center">
                <DSIcon name="dollarSign" className="mx-auto mb-1 text-success" />
                <p className="text-lg font-bold text-success">{formatCurrency(plan.price_brl)}</p>
                <p className="text-xs text-text-muted">preço</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {isOwner ? (
                <>
                  <Button
                    onClick={handleTogglePublish}
                    loading={updatePlan.isPending}
                    variant={plan.is_published ? 'secondary' : 'primary'}
                  >
                    {plan.is_published ? (
                      <>
                        <DSIcon name="eyeOff" size={16} className="mr-2" /> Despublicar
                      </>
                    ) : (
                      <>
                        <DSIcon name="eye" size={16} className="mr-2" /> Publicar
                      </>
                    )}
                  </Button>

                  {plan.total_sales === 0 && (
                    <Button
                      onClick={handleDelete}
                      loading={deletePlan.isPending}
                      variant="ghost"
                      className="text-error hover:bg-error/10"
                    >
                      <DSIcon name="trash2" size={16} className="mr-2" /> Remover
                    </Button>
                  )}

                  {isOwner && plan.total_sales > 0 && (
                    <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-2">
                      <p className="text-xs text-success">
                        <DSIcon name="barChart3" size={12} className="mr-1 inline" />
                        Receita total: {formatCurrency(plan.total_revenue)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Button onClick={handleBuy} size="lg">
                  <DSIcon name="shoppingCart" className="mr-2" />
                  Comprar por {formatCurrency(plan.price_brl)}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Plan Content Preview */}
        {planContent?.weeks && planContent.weeks.length > 0 && (
          <div className="rounded-xl border border-border-dark bg-bg-dark-secondary p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <DSIcon name="layers" size={16} className="text-brand-primary" />
              Conteúdo do Plano
              {!isOwner && (
                <span className="text-xs font-normal text-text-muted">(prévia)</span>
              )}
            </h3>

            <div className="space-y-4">
              {planContent.weeks.map((week, wIdx) => (
                <div key={wIdx} className="rounded-xl border border-border-dark bg-bg-dark p-4">
                  <h4 className="mb-3 text-xs font-semibold text-brand-primary">
                    Semana {week.week}
                  </h4>

                  <div className="space-y-3">
                    {week.days.map((day, dIdx) => (
                      <div key={dIdx}>
                        <p className="mb-1 text-xs font-medium text-text-secondary">
                          {day.day}
                        </p>
                        <div className="space-y-1">
                          {day.exercises.map((ex, eIdx) => (
                            <div
                              key={eIdx}
                              className="flex items-center gap-3 rounded-md bg-bg-dark-secondary px-3 py-1.5 text-xs"
                            >
                              <DSIcon name="checkCircle" size={12} className="shrink-0 text-success" />
                              <span className="flex-1 font-medium text-text-primary">
                                {ex.name || 'Exercício'}
                              </span>
                              <span className="text-text-muted">
                                {ex.sets} × {ex.reps}
                              </span>
                              <span className="text-text-muted">
                                <DSIcon name="clock" size={12} className="mr-0.5 inline" />
                                {ex.rest}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
