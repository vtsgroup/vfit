/**
 * src/hooks/use-feedback.ts
 *
 * Feedback hooks — Sugestões & Melhorias (Chat-like)
 *
 * Exports: FeedbackReply, FeedbackItem, CreateFeedbackInput, useCreateFeedback, useMyFeedback
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, useCreateFeedback, useMyFeedback
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Feedback hooks — Sugestões & Melhorias (Chat-like)
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { logClientIssue } from '@/lib/debug-logger'

// ============================================
// Types
// ============================================

export interface FeedbackReply {
  id: string
  message: string
  sender_type: 'user' | 'admin' | 'ai'
  sender_name: string | null
  created_at: string
}

export interface FeedbackItem {
  id: string
  user_id: string
  category: 'feature' | 'improvement' | 'bug' | 'ui' | 'other'
  title: string
  description: string
  status: 'pending' | 'reviewing' | 'planned' | 'in_progress' | 'done' | 'declined'
  admin_notes: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  has_new_reply: boolean
  reply_count?: number
  last_reply?: string
  last_reply_type?: string
  created_at: string
  updated_at: string
  resolved_at: string | null
  // Admin view extras
  user_name?: string
  user_email?: string
  user_type?: string
  // Detail view
  replies?: FeedbackReply[]
}

export interface CreateFeedbackInput {
  category: string
  title: string
  description: string
}

// ============================================
// User hooks
// ============================================

/** Enviar sugestão/melhoria */
export function useCreateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFeedbackInput) =>
      api.post('/feedback', data).then((r) => r.data),
    onMutate: () => {
      void logClientIssue({
        level: 'info',
        source: 'feedback.create',
        message: 'Tentando enviar sugestão',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Sugestão enviada! Obrigado pelo feedback')
      void logClientIssue({
        level: 'info',
        source: 'feedback.create',
        message: 'Sugestão enviada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar sugestão')
      void logClientIssue({
        level: 'error',
        source: 'feedback.create',
        message: err.message || 'Erro ao enviar sugestão',
      })
    },
  })
}

/** Minhas sugestões (com reply_count, last_reply, has_new_reply) */
export function useMyFeedback(page = 1) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['feedback', 'mine', page],
    queryFn: async () => {
      const res = await api.get<FeedbackItem[]>(`/feedback/mine?page=${page}&per_page=20`)
      return {
        feedback: res.data as unknown as FeedbackItem[],
        meta: res.meta as { total: number; page: number; per_page: number; total_pages: number },
      }
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
    refetchInterval: isReady ? 30_000 : false, // Poll every 30s for new replies
  })
}

/** Detalhe de uma sugestão + todas as replies */
export function useFeedbackDetail(id: string | null) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['feedback', 'detail', id],
    queryFn: async () => {
      const res = await api.get<FeedbackItem>(`/feedback/${id}`)
      return res.data as unknown as FeedbackItem
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
    refetchInterval: isReady && id ? 10_000 : false, // Poll every 10s for new replies
  })
}

/** Enviar reply como usuário */
export function useCreateReply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ feedbackId, message }: { feedbackId: string; message: string }) =>
      api.post(`/feedback/${feedbackId}/reply`, { message }).then((r) => r.data),
    onMutate: (variables) => {
      void logClientIssue({
        level: 'info',
        source: 'feedback.reply',
        message: 'Tentando enviar mensagem de feedback',
        context: { feedbackId: variables.feedbackId },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'detail', variables.feedbackId] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'mine'] })
      void logClientIssue({
        level: 'info',
        source: 'feedback.reply',
        message: 'Mensagem de feedback enviada com sucesso',
        context: { feedbackId: variables.feedbackId },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar mensagem')
      void logClientIssue({
        level: 'error',
        source: 'feedback.reply',
        message: err.message || 'Erro ao enviar mensagem de feedback',
      })
    },
  })
}

// ============================================
// Admin hooks
// ============================================

/** Admin: Listar todas as sugestões */
export function useAdminFeedback(params: { page?: number; status?: string; category?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.status) qs.set('status', params.status)
  if (params.category) qs.set('category', params.category)

  return useQuery({
    queryKey: ['admin', 'feedback', params],
    queryFn: async () => {
      const res = await api.get<{ feedback: FeedbackItem[]; meta: { total: number; page: number; per_page: number; total_pages: number } }>(
        `/admin/feedback?${qs.toString()}`
      )
      // admin endpoint wraps in success({ feedback, meta })
      const body = res.data as unknown as { feedback: FeedbackItem[]; meta: { total: number; page: number; per_page: number; total_pages: number } }
      return { feedback: body.feedback, meta: body.meta }
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
    refetchInterval: isReady ? 30_000 : false,
  })
}

/** Admin: Detalhe da sugestão + replies */
export function useAdminFeedbackDetail(id: string | null) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery({
    queryKey: ['admin', 'feedback', 'detail', id],
    queryFn: async () => {
      const res = await api.get<FeedbackItem>(`/admin/feedback/${id}`)
      return res.data as unknown as FeedbackItem
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
    refetchInterval: isReady && id ? 10_000 : false,
  })
}

/** Admin: Responder sugestão */
export function useAdminReply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ feedbackId, message }: { feedbackId: string; message: string }) =>
      api.post(`/admin/feedback/${feedbackId}/reply`, { message }).then((r) => r.data),
    onMutate: (variables) => {
      void logClientIssue({
        level: 'info',
        source: 'admin.feedback.reply',
        message: 'Tentando enviar resposta admin',
        context: { feedbackId: variables.feedbackId },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback', 'detail', variables.feedbackId] })
      toast.success('Resposta enviada!')
      void logClientIssue({
        level: 'info',
        source: 'admin.feedback.reply',
        message: 'Resposta admin enviada com sucesso',
        context: { feedbackId: variables.feedbackId },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar resposta')
      void logClientIssue({
        level: 'error',
        source: 'admin.feedback.reply',
        message: err.message || 'Erro ao enviar resposta admin',
      })
    },
  })
}

/** Admin: Atualizar status de sugestão */
export function useUpdateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; priority?: string; admin_notes?: string }) =>
      api.patch(`/admin/feedback/${id}`, data).then((r) => r.data),
    onMutate: (variables) => {
      void logClientIssue({
        level: 'info',
        source: 'admin.feedback.update',
        message: 'Tentando atualizar feedback',
        context: { id: variables.id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      toast.success('Sugestão atualizada')
      void logClientIssue({
        level: 'info',
        source: 'admin.feedback.update',
        message: 'Feedback atualizado com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar')
      void logClientIssue({
        level: 'error',
        source: 'admin.feedback.update',
        message: err.message || 'Erro ao atualizar feedback',
      })
    },
  })
}

/** Admin: Deletar sugestão */
export function useDeleteFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/feedback/${id}`),
    onMutate: (id: string) => {
      void logClientIssue({
        level: 'warn',
        source: 'admin.feedback.delete',
        message: 'Tentando remover feedback',
        context: { id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      toast.success('Sugestão removida')
      void logClientIssue({
        level: 'info',
        source: 'admin.feedback.delete',
        message: 'Feedback removido com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover')
      void logClientIssue({
        level: 'error',
        source: 'admin.feedback.delete',
        message: err.message || 'Erro ao remover feedback',
      })
    },
  })
}
