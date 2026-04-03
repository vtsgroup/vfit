/**
 * src/app/dashboard/admin/config/page.tsx
 *
 * Admin Config Manager — Dynamic Platform Configuration
 *
 * Exports: AdminConfigPage
 * Hooks: useState, useAuthStore, useDynamic*, useUpdate*, useAllConfig
 * Features: Auth: super_admin only · 'use client' · D1 CRUD · Tabs
 */

// ============================================
// Admin Config Manager — Platform Configuration
// ============================================

'use client'

import { useState, useCallback, useEffect } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard, CardHeader, CardContent } from '@/components/ui/glass-card'
import { Toggle } from '@/components/ui/toggle'
import { MD3Input } from '@/components/ui/md3-input'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { AuthGuard } from '@/components/auth'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatCurrency } from '@/lib/utils'
import {
  useDynamicPlansB2B,
  useDynamicPlansB2C,
  useAllConfig,
  useUpdatePlanB2B,
  useUpdatePlanB2C,
  useUpdateConfig,
  type DynamicPlanB2B,
  type DynamicPlanB2C,
  type DynamicConfig,
} from '@/hooks/use-platform-config'

// ============================================
// Page Component
// ============================================

export default function AdminConfigPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const isSA = isSuperAdmin()

  const [activeTab, setActiveTab] = useState('b2b')

  const tabs = [
    { key: 'b2b', label: 'Planos B2B' },
    { key: 'b2c', label: 'Planos B2C' },
    { key: 'fees', label: 'Taxas' },
    { key: 'gamification', label: 'Gamificação' },
    { key: 'rate_limits', label: 'Rate Limits' },
    { key: 'cache', label: 'Cache' },
  ]

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/20 to-emerald-600/10">
              <DSIcon name="settings" size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Configuração da Plataforma</h2>
              <p className="text-sm text-text-muted">
                Gerencie planos, preços, taxas e configurações dinâmicas
              </p>
            </div>
          </div>
        </div>

        {!isSA ? (
          <GlassCard>
            <CardContent>
              <EmptyStateDS
                icon="lock"
                title="Acesso restrito"
                description="Apenas super administradores podem gerenciar as configurações da plataforma."
              />
            </CardContent>
          </GlassCard>
        ) : (
          <>
            {/* Tabs */}
            <SlidingTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* Tab Panels */}
            {activeTab === 'b2b' && <PlansB2BPanel />}
            {activeTab === 'b2c' && <PlansB2CPanel />}
            {activeTab === 'fees' && <ConfigPanel category="fees" />}
            {activeTab === 'gamification' && <ConfigPanel category="gamification" />}
            {activeTab === 'rate_limits' && <ConfigPanel category="rate_limits" />}
            {activeTab === 'cache' && <ConfigPanel category="cache" />}
          </>
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// B2B Plans Panel
// ============================================

function PlansB2BPanel() {
  const { data: plans, isLoading } = useDynamicPlansB2B()
  const updatePlan = useUpdatePlanB2B()
  const [editingSlug, setEditingSlug] = useState<string | null>(null)

  if (isLoading) return <PanelSkeleton />
  if (!plans?.length) return <EmptyStateDS icon="creditCard" title="Nenhum plano B2B encontrado" />

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <PlanB2BCard
          key={plan.slug}
          plan={plan}
          isEditing={editingSlug === plan.slug}
          onEdit={() => setEditingSlug(plan.slug)}
          onCancel={() => setEditingSlug(null)}
          onSave={async (data) => {
            await updatePlan.mutateAsync({ slug: plan.slug, data })
            setEditingSlug(null)
          }}
          isSaving={updatePlan.isPending}
        />
      ))}
    </div>
  )
}

function PlanB2BCard({
  plan,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  plan: DynamicPlanB2B
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (data: Partial<DynamicPlanB2B>) => Promise<void>
  isSaving: boolean
}) {
  const [form, setForm] = useState({
    name: plan.name,
    price_brl: plan.price_brl,
    max_students: plan.max_students,
    is_active: plan.is_active,
  })

  useEffect(() => {
    setForm({
      name: plan.name,
      price_brl: plan.price_brl,
      max_students: plan.max_students,
      is_active: plan.is_active,
    })
  }, [plan, isEditing])

  const tierColors: Record<string, string> = {
    trial: 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/20',
    pro: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    profissional: 'from-violet-500/20 to-violet-600/10 border-violet-500/20',
    max: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  }

  const tierIcons: Record<string, string> = {
    trial: 'sparkles',
    pro: 'zap',
    profissional: 'star',
    max: 'crown',
  }

  return (
    <GlassCard className={cn('border', tierColors[plan.slug] || 'border-border-light')}>
      <CardHeader
        title={`${plan.name} (${plan.slug})`}
        icon={tierIcons[plan.slug] || 'package'}
        action={
          !isEditing ? (
            <div className="flex items-center gap-2">
              {!plan.is_active && (
                <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                  INATIVO
                </span>
              )}
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <DSIcon name="pencil" size={14} />
                Editar
              </Button>
            </div>
          ) : undefined
        }
      />
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <MD3Input
              label="Nome do plano"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <MD3Input
              label="Preço mensal (R$)"
              type="number"
              step="0.01"
              value={String(form.price_brl)}
              onChange={(e) => setForm({ ...form, price_brl: parseFloat(e.target.value) || 0 })}
            />
            <MD3Input
              label="Máx. alunos (-1 = ilimitado)"
              type="number"
              value={String(form.max_students)}
              onChange={(e) => setForm({ ...form, max_students: parseInt(e.target.value) || 0 })}
            />
            <Toggle
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              label="Plano ativo"
              description="Planos inativos não aparecem na UI"
            />
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onSave(form)}
                loading={isSaving}
              >
                <DSIcon name="check" size={14} />
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-text-primary">
                {plan.price_brl === 0 ? 'Grátis' : formatCurrency(plan.price_brl)}
              </span>
              <span className="text-xs text-text-muted">
                {plan.duration_days ? `${plan.duration_days} dias` : 'Vitalício'}
              </span>
            </div>
            <div className="text-sm text-text-secondary">
              <DSIcon name="users" size={14} className="mr-1 inline" />
              {plan.max_students === -1 ? 'Alunos ilimitados' : `Até ${plan.max_students} alunos`}
            </div>
            <div className="space-y-1">
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <DSIcon name="check" size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 text-[10px] text-text-muted">
              Atualizado: {new Date(plan.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}

// ============================================
// B2C Plans Panel
// ============================================

function PlansB2CPanel() {
  const { data: plans, isLoading } = useDynamicPlansB2C()
  const updatePlan = useUpdatePlanB2C()
  const [editingSlug, setEditingSlug] = useState<string | null>(null)

  if (isLoading) return <PanelSkeleton />
  if (!plans?.length) return <EmptyStateDS icon="creditCard" title="Nenhum plano B2C encontrado" />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanB2CCard
          key={plan.slug}
          plan={plan}
          isEditing={editingSlug === plan.slug}
          onEdit={() => setEditingSlug(plan.slug)}
          onCancel={() => setEditingSlug(null)}
          onSave={async (data) => {
            await updatePlan.mutateAsync({ slug: plan.slug, data })
            setEditingSlug(null)
          }}
          isSaving={updatePlan.isPending}
        />
      ))}
    </div>
  )
}

function PlanB2CCard({
  plan,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  plan: DynamicPlanB2C
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (data: Partial<DynamicPlanB2C>) => Promise<void>
  isSaving: boolean
}) {
  const [form, setForm] = useState({
    name: plan.name,
    price_brl: plan.price_brl,
    is_active: plan.is_active,
  })

  useEffect(() => {
    setForm({
      name: plan.name,
      price_brl: plan.price_brl,
      is_active: plan.is_active,
    })
  }, [plan, isEditing])

  return (
    <GlassCard>
      <CardHeader
        title={`${plan.name} (${plan.slug})`}
        action={
          !isEditing ? (
            <div className="flex items-center gap-2">
              {!plan.is_active && (
                <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                  INATIVO
                </span>
              )}
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <DSIcon name="pencil" size={14} />
                Editar
              </Button>
            </div>
          ) : undefined
        }
      />
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <MD3Input
              label="Nome do plano"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <MD3Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={String(form.price_brl)}
              onChange={(e) => setForm({ ...form, price_brl: parseFloat(e.target.value) || 0 })}
            />
            <Toggle
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              label="Plano ativo"
            />
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => onSave(form)} loading={isSaving}>
                <DSIcon name="check" size={14} />
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-text-primary">
                {plan.price_brl === 0 ? 'Grátis' : formatCurrency(plan.price_brl)}
              </span>
              <span className="text-xs text-text-muted">
                {plan.duration_days ? `${plan.duration_days} dias` : 'Vitalício'}
              </span>
            </div>
            <div className="space-y-1">
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <DSIcon name="check" size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 text-[10px] text-text-muted">
              Atualizado: {new Date(plan.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}

// ============================================
// Generic Config Panel (fees, gamification, rate_limits, cache)
// ============================================

function ConfigPanel({ category }: { category: string }) {
  const { data: allConfig, isLoading } = useAllConfig()
  const updateConfig = useUpdateConfig()
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const configs = allConfig?.[category] || []

  if (isLoading) return <PanelSkeleton />
  if (!configs.length) return <EmptyStateDS icon="settings" title={`Nenhuma configuração em "${category}"`} />

  const categoryInfo: Record<string, { icon: string; desc: string }> = {
    fees: { icon: 'percent', desc: 'Taxas e comissões da plataforma' },
    gamification: { icon: 'trophy', desc: 'XP, badges e sistema de níveis' },
    rate_limits: { icon: 'shield', desc: 'Limites de requisições por endpoint' },
    cache: { icon: 'clock', desc: 'Tempos de cache para dados (em segundos)' },
  }

  const info = categoryInfo[category] || { icon: 'settings', desc: 'Configurações gerais' }

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary/50 px-4 py-3">
        <DSIcon name={info.icon as 'settings'} size={18} className="text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-text-primary capitalize">{category.replace('_', ' ')}</p>
          <p className="text-xs text-text-muted">{info.desc}</p>
        </div>
      </div>

      {/* Config items */}
      <div className="space-y-3">
        {configs.map((config) => (
          <ConfigItem
            key={config.key}
            config={config}
            isEditing={editingKey === config.key}
            onEdit={() => setEditingKey(config.key)}
            onCancel={() => setEditingKey(null)}
            onSave={async (value) => {
              await updateConfig.mutateAsync({ key: config.key, value })
              setEditingKey(null)
            }}
            isSaving={updateConfig.isPending}
          />
        ))}
      </div>
    </div>
  )
}

function ConfigItem({
  config,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  config: DynamicConfig
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (value: unknown) => Promise<void>
  isSaving: boolean
}) {
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    if (isEditing) {
      setEditValue(
        typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : String(config.value)
      )
    }
  }, [isEditing, config.value])

  const displayValue = useCallback(() => {
    const val = config.value
    if (config.value_type === 'json' && typeof val === 'object') {
      return JSON.stringify(val)
    }
    if (config.value_type === 'number' && config.category === 'fees') {
      return `${val}%`
    }
    if (config.value_type === 'number' && config.category === 'cache') {
      const seconds = Number(val)
      if (seconds >= 86400) return `${(seconds / 86400).toFixed(0)} dias`
      if (seconds >= 3600) return `${(seconds / 3600).toFixed(0)} horas`
      if (seconds >= 60) return `${(seconds / 60).toFixed(0)} min`
      return `${seconds}s`
    }
    return String(val)
  }, [config])

  const parseValue = (raw: string): unknown => {
    if (config.value_type === 'number') return parseFloat(raw) || 0
    if (config.value_type === 'boolean') return raw === 'true'
    if (config.value_type === 'json') {
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    }
    return raw
  }

  return (
    <GlassCard padding="sm">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-primary">{config.label || config.key}</p>
            {!config.is_editable && (
              <span className="rounded bg-zinc-500/20 px-1 py-px text-[9px] text-zinc-400">
                READ-ONLY
              </span>
            )}
          </div>
          {config.description && (
            <p className="mt-0.5 text-xs text-text-muted">{config.description}</p>
          )}

          {isEditing ? (
            <div className="mt-3 space-y-3">
              {config.value_type === 'json' ? (
                <textarea
                  className="w-full rounded-lg border border-border-light bg-bg-tertiary p-3 font-mono text-xs text-text-primary focus:border-brand-primary/50 focus:outline-none"
                  rows={4}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <MD3Input
                  label={`Valor (${config.value_type})`}
                  type={config.value_type === 'number' ? 'number' : 'text'}
                  step={config.value_type === 'number' ? '0.01' : undefined}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSave(parseValue(editValue))}
                  loading={isSaving}
                >
                  <DSIcon name="check" size={14} />
                  Salvar
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel} disabled={isSaving}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <span className="inline-block rounded-md bg-bg-tertiary px-2 py-1 font-mono text-xs text-emerald-400">
                {displayValue()}
              </span>
            </div>
          )}
        </div>

        {!isEditing && config.is_editable && (
          <Button size="sm" variant="ghost" onClick={onEdit} className="shrink-0">
            <DSIcon name="pencil" size={14} />
          </Button>
        )}
      </div>
      {config.updated_by && (
        <div className="border-t border-border-light px-4 py-1.5">
          <span className="text-[10px] text-text-muted">
            Editado por: {config.updated_by} · {new Date(config.updated_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )}
    </GlassCard>
  )
}

// ============================================
// Skeleton
// ============================================

function PanelSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-2xl bg-bg-secondary" />
      ))}
    </div>
  )
}
