/**
 * src/hooks/use-ai.ts
 *
 * AI Hooks — TanStack Query hooks for AI endpoints
 *
 * Exports: useAIUsage, useGenerateWorkout, useAIAssistant, useGenerateContent, useComparePhotos
 * Hooks: useMutation, useQuery, useAuthStore, useAIUsage, useGenerateWorkout, useAIAssistant
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// AI Hooks — TanStack Query hooks for AI endpoints
// ============================================

import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { withRetry, retryPresets } from '@/lib/retry'

// ============================================
// Types
// ============================================

interface AIUsage {
  month: string
  by_task: Array<{
    task_type: string
    total_calls: number
    total_tokens: number
  }>
  totals: {
    total_calls: number
    total_tokens: number
  }
}

interface AIWorkoutResult {
  model_used: string
  complexity: string
  workout: {
    workouts?: Array<{
      name: string
      description: string
      exercises: Array<{
        exercise_id: string
        sets: number
        reps: string
        rest_seconds: number
        load: string
        notes: string
        order_index: number
      }>
    }>
    raw_response?: string
  }
  student_id: string
}

interface AIAssistantResult {
  response: {
    resposta: string
    acoes_sugeridas?: string[]
    links_uteis?: string[]
  }
  model_used: string
}

interface AIContentResult {
  content: unknown
  type: string
  model_used: string
}

interface AIPhotoResult {
  analysis: unknown
  model_used: string
}

interface AIBillingResult {
  suggestions: unknown
  students_analyzed: number
  model_used: string
}

// ============================================
// Queries
// ============================================

export function useAIUsage() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['ai', 'usage'],
    queryFn: () => api.get<AIUsage>('/ai/usage').then((r) => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

// ============================================
// Mutations
// ============================================

export function useGenerateWorkout() {
  return useMutation({
    mutationFn: (data: {
      student_id?: string
      goal: string
      complexity?: 'low' | 'medium' | 'high'
      days_per_week?: number
      split_type?: 'abc' | 'upper_lower' | 'push_pull_legs' | 'full_body' | 'auto'
      extra_instructions?: string
    }) => withRetry(
      () => api.post<AIWorkoutResult>('/ai/workout/generate', data).then((r) => r.data),
      retryPresets.ai,
    ),
  })
}

export function useAIAssistant() {
  return useMutation({
    mutationFn: (data: {
      question: string
      context_type?: 'general' | 'students' | 'billing' | 'workouts'
    }) => withRetry(
      () => api.post<AIAssistantResult>('/ai/assistant', data).then((r) => r.data),
      retryPresets.ai,
    ),
  })
}

export function useGenerateContent() {
  return useMutation({
    mutationFn: (data: {
      type: 'instagram_post' | 'story' | 'bio' | 'email' | 'promotion'
      topic: string
    }) => withRetry(
      () => api.post<AIContentResult>('/ai/content/generate', data).then((r) => r.data),
      retryPresets.ai,
    ),
  })
}

export function useComparePhotos() {
  return useMutation({
    mutationFn: (data: {
      before_url: string
      after_url: string
      assessment_id?: string
    }) => withRetry(
      () => api.post<AIPhotoResult>('/ai/photos/compare', data).then((r) => r.data),
      retryPresets.ai,
    ),
  })
}

export function useSmartBilling() {
  return useMutation({
    mutationFn: (data?: { limit?: number }) =>
      withRetry(
        () => api.post<AIBillingResult>('/ai/billing/smart', data || {}).then((r) => r.data),
        retryPresets.ai,
      ),
  })
}

export function useAnalyzeSentiment() {
  return useMutation({
    mutationFn: (data: { feedback: string }) =>
      withRetry(
        () => api.post<{ analysis: unknown; model_used: string }>('/ai/sentiment/analyze', data).then((r) => r.data),
        retryPresets.ai,
      ),
  })
}
