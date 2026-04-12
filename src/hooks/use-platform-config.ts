/**
 * src/hooks/use-platform-config.ts
 *
 * Dynamic Platform Configuration — React Query hooks
 *
 * Exports: useDynamicPlansB2B, useDynamicPlansB2C, useDynamicConfig, useUpdatePlanB2B, useUpdatePlanB2C, useUpdateConfig
 * Features: Auth: useAuthStore · TanStack Query
 *
 * Strategy:
 *   1. Fetch dynamic plans/config from D1 via API
 *   2. Fallback to static constants.ts if API unavailable
 *   3. Long staleTime (5 min) — config rarely changes
 *   4. Mutations invalidate cache on success
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { PLANS, VFIT_PLANS } from '@config/constants'

// ============================================
// Types
// ============================================
export interface DynamicPlanB2B {
  slug: string
  name: string
  price_brl: number
  duration_days: number | null
  max_students: number
  features: string[]
  display_order: number
  is_active: boolean
  updated_at: string
}

export interface DynamicPlanB2C {
  slug: string
  name: string
  price_brl: number
  duration_days: number | null
  features: string[]
  limits: Record<string, unknown>
  display_order: number
  is_active: boolean
  updated_at: string
}

export interface DynamicConfig {
  key: string
  value: unknown
  category: string
  label: string
  description: string
  value_type: string
  is_editable: boolean
  updated_at: string
  updated_by: string | null
}

// ============================================
// Fallbacks — convert static constants to dynamic format
// ============================================
function staticB2BFallback(): DynamicPlanB2B[] {
  return Object.values(PLANS).map((p, i) => ({
    slug: p.slug,
    name: p.name,
    price_brl: p.price_brl,
    duration_days: p.duration_days,
    max_students: p.max_students,
    features: [...p.features],
    display_order: i,
    is_active: true,
    updated_at: new Date().toISOString(),
  }))
}

function staticB2CFallback(): DynamicPlanB2C[] {
  return Object.values(VFIT_PLANS).map((p, i) => ({
    slug: p.slug,
    name: p.name,
    price_brl: p.price_brl,
    duration_days: p.duration_days,
    features: [...p.features],
    limits: { ...p.limits },
    display_order: i,
    is_active: true,
    updated_at: new Date().toISOString(),
  }))
}

// ============================================
// Query Keys
// ============================================
const QK = {
  plansB2B: ['config', 'plans', 'b2b'] as const,
  plansB2C: ['config', 'plans', 'b2c'] as const,
  configAll: ['config', 'all'] as const,
  configCat: (cat: string) => ['config', 'category', cat] as const,
}

// ============================================
// PUBLIC HOOKS — No auth required
// ============================================

/**
 * Fetch dynamic B2B plans (personal trainers)
 * Falls back to static PLANS if API unavailable
 */
export function useDynamicPlansB2B() {
  return useQuery({
    queryKey: QK.plansB2B,
    queryFn: async () => {
      const res = await api.get('/config/plans/b2b')
      return res.data as DynamicPlanB2B[]
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,   // 30 min
    retry: 1,
    // Fallback to static on error
    placeholderData: staticB2BFallback(),
  })
}

/**
 * Fetch dynamic B2C plans (end users)
 */
export function useDynamicPlansB2C() {
  return useQuery({
    queryKey: QK.plansB2C,
    queryFn: async () => {
      const res = await api.get('/config/plans/b2c')
      return res.data as DynamicPlanB2C[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    placeholderData: staticB2CFallback(),
  })
}

/**
 * Fetch config values by category
 */
export function useDynamicConfig(category: string) {
  return useQuery({
    queryKey: QK.configCat(category),
    queryFn: async () => {
      const res = await api.get(`/config/config/${category}`)
      return res.data as DynamicConfig[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// ADMIN HOOKS — Require super_admin auth
// ============================================

/**
 * Fetch ALL config grouped by category (admin only)
 */
export function useAllConfig() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: QK.configAll,
    queryFn: async () => {
      const res = await api.get('/config/config/all')
      return res.data as Record<string, DynamicConfig[]>
    },
    enabled: isReady,
    staleTime: 60 * 1000, // 1 min for admin
    retry: false,          // server errors (500) não melhoram com retry
  })
}

/**
 * Update a B2B plan
 */
export function useUpdatePlanB2B() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<DynamicPlanB2B> }) => {
      const res = await api.put(`/config/plans/b2b/${slug}`, data)
      return res.data as DynamicPlanB2B
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.plansB2B })
    },
  })
}

/**
 * Update a B2C plan
 */
export function useUpdatePlanB2C() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<DynamicPlanB2C> }) => {
      const res = await api.put(`/config/plans/b2c/${slug}`, data)
      return res.data as DynamicPlanB2C
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.plansB2C })
    },
  })
}

/**
 * Update a config value
 */
export function useUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await api.put(`/config/config/${key}`, { value })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['config'] })
    },
  })
}
