/**
 * src/hooks/use-chat.ts
 *
 * Chat hooks — TanStack Query
 *
 * Exports: Conversation, Message, useConversations, useMessages, useUnreadMessages
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, useConversations, useMessages
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Chat hooks — TanStack Query
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

export interface Conversation {
  id: string
  personal_id: string
  student_id: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_personal: number
  unread_student: number
  unread_count: number
  is_archived: boolean
  participant_name: string
  participant_avatar: string | null
  participant_type: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'audio' | 'workout' | 'system'
  metadata: Record<string, unknown> | null
  read_at: string | null
  created_at: string
  sender_name?: string
  sender_avatar?: string | null
}

interface ConversationsResponse {
  conversations: Conversation[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

interface MessagesResponse {
  messages: Message[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

// ============================================
// Query hooks
// ============================================

export function useConversations(params: { page?: number; archived?: boolean } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.archived) qs.set('archived', 'true')

  return useQuery<ConversationsResponse>({
    queryKey: ['chat', 'conversations', params],
    queryFn: async () => {
      const res = await api.get<ConversationsResponse>(`/chat/conversations?${qs}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
    refetchInterval: isReady ? 15_000 : false, // polling a cada 15s
  })
}

export function useMessages(conversationId: string, params: { page?: number } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  qs.set('per_page', '50')

  return useQuery<MessagesResponse>({
    queryKey: ['chat', 'messages', conversationId, params],
    queryFn: async () => {
      const res = await api.get<MessagesResponse>(`/chat/conversations/${conversationId}/messages?${qs}`)
      return res.data
    },
    enabled: isReady && !!conversationId,
    ...APP_QUERY_CACHE.list,
    refetchInterval: isReady && !!conversationId ? 5_000 : false, // polling a cada 5s quando ativo
  })
}

export function useUnreadMessages() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ unread_count: number }>({
    queryKey: ['chat', 'unread-count'],
    queryFn: async () => {
      const res = await api.get<{ unread_count: number }>('/chat/unread-count')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.realtime,
    refetchInterval: isReady ? 30_000 : false, // polling a cada 30s
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (participantId: string) => {
      const res = await api.post<{ conversation: Conversation }>('/chat/conversations', {
        participant_id: participantId,
      })
      return res.data.conversation
    },
    onMutate: (participantId: string) => {
      void logClientIssue({
        level: 'info',
        source: 'chat.create-conversation',
        message: 'Tentando iniciar conversa',
        context: { participantId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void logClientIssue({
        level: 'info',
        source: 'chat.create-conversation',
        message: 'Conversa iniciada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao iniciar conversa')
      void logClientIssue({
        level: 'error',
        source: 'chat.create-conversation',
        message: err.message || 'Erro ao iniciar conversa',
      })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { content: string; message_type?: string; metadata?: Record<string, unknown> }) => {
      const res = await api.post<{ message: Message }>(
        `/chat/conversations/${conversationId}/messages`,
        data
      )
      return res.data.message
    },
    onMutate: (data) => {
      void logClientIssue({
        level: 'info',
        source: 'chat.send-message',
        message: 'Tentando enviar mensagem',
        context: {
          conversationId,
          message_type: data.message_type || 'text',
          content_length: data.content?.length || 0,
        },
      })
    },
    onSuccess: () => {
      // Invalidar mensagens E conversas (atualiza preview + unread)
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void logClientIssue({
        level: 'info',
        source: 'chat.send-message',
        message: 'Mensagem enviada com sucesso',
        context: { conversationId },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar mensagem')
      void logClientIssue({
        level: 'error',
        source: 'chat.send-message',
        message: err.message || 'Erro ao enviar mensagem',
        context: { conversationId },
      })
    },
  })
}

export function useMarkRead(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.patch(`/chat/conversations/${conversationId}/read`)
    },
    onMutate: () => {
      void logClientIssue({
        level: 'debug',
        source: 'chat.mark-read',
        message: 'Marcando conversa como lida',
        context: { conversationId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] })
    },
  })
}

export function useArchiveConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.patch(`/chat/conversations/${conversationId}/archive`)
    },
    onMutate: (conversationId: string) => {
      void logClientIssue({
        level: 'info',
        source: 'chat.archive-conversation',
        message: 'Tentando arquivar conversa',
        context: { conversationId },
      })
    },
    onSuccess: () => {
      toast.success('Conversa arquivada')
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void logClientIssue({
        level: 'info',
        source: 'chat.archive-conversation',
        message: 'Conversa arquivada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao arquivar conversa')
      void logClientIssue({
        level: 'error',
        source: 'chat.archive-conversation',
        message: err.message || 'Erro ao arquivar conversa',
      })
    },
  })
}
