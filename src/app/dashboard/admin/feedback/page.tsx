/**
 * src/app/dashboard/admin/feedback/page.tsx
 *
 * Admin Feedback Page — Sugestões & Melhorias
 *
 * Exports: AdminFeedbackPage
 * Hooks: useState, useRef, useEffect, useAdminFeedback, useAdminFeedbackDetail, useUpdateFeedback
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Feedback Page — Sugestões & Melhorias
// Lista + Chat detail com reply do admin
// ============================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Badge } from '@/components/ui/badge'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { StyledSelect } from '@/components/ui/styled-select'
import { MD3Input } from '@/components/ui/md3-input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AdminFeedbackPageSkeleton } from '@/components/ui/page-skeletons'
import {
  useAdminFeedback,
  useAdminFeedbackDetail,
  useUpdateFeedback,
  useDeleteFeedback,
  useAdminReply,
  type FeedbackItem,
  type FeedbackReply,
} from '@/hooks/use-feedback'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Config
// ============================================

const categoryConfig: Record<string, { label: string; icon: DSIconName; color: string }> = {
  feature: { label: 'Funcionalidade', icon: 'lightbulb', color: 'bg-amber-400/10 text-amber-400' },
  improvement: { label: 'Melhoria', icon: 'wrench', color: 'bg-brand-primary/10 text-brand-primary' },
  bug: { label: 'Bug', icon: 'bug', color: 'bg-red-400/10 text-red-400' },
  ui: { label: 'Visual', icon: 'palette', color: 'bg-purple-400/10 text-purple-400' },
  other: { label: 'Outro', icon: 'helpCircle', color: 'bg-zinc-400/10 text-zinc-400' },
}

const statusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: 'clock' },
  reviewing: { label: 'Analisando', color: 'bg-brand-primary/10 text-brand-primary', icon: 'eye' },
  planned: { label: 'Planejado', color: 'bg-purple-400/10 text-purple-400', icon: 'sparkles' },
  in_progress: { label: 'Em andamento', color: 'bg-brand-primary/10 text-brand-primary', icon: 'loader' },
  done: { label: 'Concluído', color: 'bg-success/10 text-success', icon: 'checkCircle2' },
  declined: { label: 'Recusado', color: 'bg-error/10 text-error', icon: 'xCircle' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-zinc-400/10 text-zinc-400' },
  normal: { label: 'Normal', color: 'bg-brand-primary/10 text-brand-primary' },
  high: { label: 'Alta', color: 'bg-warning/10 text-warning' },
  urgent: { label: 'Urgente', color: 'bg-error/10 text-error' },
}

// ============================================
// Admin Reply Bubble
// ============================================

function AdminMessageBubble({ reply }: { reply: FeedbackReply }) {
  const isUser = reply.sender_type === 'user'
  const isAdmin = reply.sender_type === 'admin'
  const isAI = reply.sender_type === 'ai'

  const time = new Date(reply.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(reply.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <div className={cn('flex gap-2', isUser ? 'flex-row' : 'flex-row-reverse')}>
      <div className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-1',
        isUser && 'bg-brand-primary/20',
        isAdmin && 'bg-emerald-500/20',
        isAI && 'bg-purple-500/20',
      )}>
        {isUser && <DSIcon name="user" size={12} className="text-brand-primary" />}
        {isAdmin && <DSIcon name="shield" size={12} className="text-emerald-400" />}
        {isAI && <DSIcon name="bot" size={12} className="text-purple-400" />}
      </div>

      <div className={cn(
        'max-w-[75%] rounded-2xl px-3 py-2',
        isUser && 'rounded-tl-md bg-brand-primary/10 border border-brand-primary/15',
        isAdmin && 'rounded-tr-md bg-emerald-500/10 border border-emerald-500/15',
        isAI && 'rounded-tr-md bg-purple-500/10 border border-purple-500/15',
      )}>
        <p className={cn(
          'text-[9px] font-semibold mb-0.5',
          isUser && 'text-brand-primary',
          isAdmin && 'text-emerald-400',
          isAI && 'text-purple-400',
        )}>
          {reply.sender_name || (isUser ? 'Usuário' : isAI ? 'Victor (IA)' : 'Victor')}
          {isAI && <span className="ml-1 text-purple-400/60">· IA</span>}
        </p>
        <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{reply.message}</p>
        <p className="text-[9px] text-text-muted/40 mt-0.5">{date} · {time}</p>
      </div>
    </div>
  )
}

// ============================================
// Detail View (Chat + Controls)
// ============================================

function FeedbackDetailView({
  feedbackId,
  onBack,
}: {
  feedbackId: string
  onBack: () => void
}) {
  const { data, isLoading } = useAdminFeedbackDetail(feedbackId)
  const updateFeedback = useUpdateFeedback()
  const deleteFeedback = useDeleteFeedback()
  const adminReply = useAdminReply()
  const isSuperAdmin = useAuthStore((s) => s.user?.role === 'super_admin')
  const [replyText, setReplyText] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const feedback = data as FeedbackItem | undefined
  const replies = feedback?.replies || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [replies.length])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [feedbackId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onBack()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onBack])

  if (isLoading || !feedback) {
    return (
      <div className="flex items-center justify-center py-20">
        <DSIcon name="loader" size={32} className="animate-spin text-brand-primary" />
      </div>
    )
  }

  const cat = categoryConfig[feedback.category] || categoryConfig.other
  const status = statusConfig[feedback.status] || statusConfig.pending
  const priority = priorityConfig[feedback.priority] || priorityConfig.normal

  function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim()) return
    adminReply.mutate({ feedbackId, message: replyText.trim() })
    setReplyText('')
  }

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-0.5 rounded-lg p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-text-primary">{feedback.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge className={cat.color}>
              <DSIcon name={cat.icon} size={12} className="mr-1" />{cat.label}
            </Badge>
            <Badge className={status.color}>
              <DSIcon name={status.icon} size={12} className="mr-1" />{status.label}
            </Badge>
            <Badge className={priority.color}>{priority.label}</Badge>
            <span className="text-[10px] text-text-muted">
              {feedback.user_name} · {feedback.user_email} · {feedback.user_type}
            </span>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-error/10 hover:text-error"
            title="Deletar"
          >
            <DSIcon name="trash" size={16} />
          </button>
        )}
      </div>

      {/* Admin Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl border border-border-light bg-bg-tertiary/50 p-3">
        <div>
          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-text-muted">Status</label>
          <StyledSelect
            value={feedback.status}
            onChange={(v) => updateFeedback.mutate({ id: feedbackId, status: v })}
            options={Object.entries(statusConfig).map(([key, { label }]) => ({ value: key, label }))}
            compact
          />
        </div>
        <div>
          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-text-muted">Prioridade</label>
          <StyledSelect
            value={feedback.priority}
            onChange={(v) => updateFeedback.mutate({ id: feedbackId, priority: v })}
            options={Object.entries(priorityConfig).map(([key, { label }]) => ({ value: key, label }))}
            compact
          />
        </div>
        <div>
          <MD3Input
            label="Nota interna"
            defaultValue={feedback.admin_notes || ''}
            placeholder="Nota..."
            onBlur={(e) => {
              if (e.target.value !== (feedback.admin_notes || '')) {
                updateFeedback.mutate({ id: feedbackId, admin_notes: e.target.value })
              }
            }}
            size="sm"
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary overflow-hidden">
        <div className="border-b border-border-light px-4 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Conversa · {replies.length} mensage{replies.length !== 1 ? 'ns' : 'm'}
          </p>
        </div>

        <div
          className="overflow-y-auto px-4 py-4 space-y-3"
          style={{
            maxHeight: 'calc(100dvh - 23rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            minHeight: '12rem',
          }}
        >
          {replies.map((reply) => (
            <AdminMessageBubble key={reply.id} reply={reply} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Admin reply input */}
        <div
          className="border-t border-border-light px-4 pt-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <form onSubmit={handleSendReply} className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e) }
                }}
                placeholder="Responder como Victor..."
                rows={1}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-border-light bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 transition-all focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                style={{ maxHeight: '100px', minHeight: '40px' }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 100) + 'px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!replyText.trim() || adminReply.isPending}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
                replyText.trim() && !adminReply.isPending
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                  : 'bg-bg-tertiary text-text-muted/40'
              )}
            >
              {adminReply.isPending ? (
                <DSIcon name="loader" size={16} className="animate-spin" />
              ) : (
                <DSIcon name="send" size={16} />
              )}
            </button>
          </form>
          <p className="mt-1.5 text-center text-[9px] text-text-muted/40">
            Esta resposta será visível para o usuário · Enter para enviar
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          deleteFeedback.mutate(feedbackId)
          setConfirmDeleteOpen(false)
          onBack()
        }}
        variant="danger"
        title="Deletar sugestão"
        description="Deletar esta sugestão e todas as respostas? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        loading={deleteFeedback.isPending}
      />
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default function AdminFeedbackPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useAdminFeedback({
    page,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  })
  const feedback = data?.feedback ?? []
  const meta = data?.meta ?? { total: 0, page: 1, per_page: 20, total_pages: 1 }

  // If a feedback is selected, show the detail view
  if (selectedId) {
    return (
      <AuthGuard requiredType="admin">
        <FeedbackDetailView feedbackId={selectedId} onBack={() => setSelectedId(null)} />
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary">
              <DSIcon name="messageSquareHeart" size={28} className="text-brand-primary" />
              Sugestões & Melhorias
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {meta.total} sugestão{meta.total !== 1 ? 'ões' : ''} recebidas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <StyledSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todos os status' },
              ...Object.entries(statusConfig).map(([key, { label }]) => ({ value: key, label })),
            ]}
            compact
          />

          <StyledSelect
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1) }}
            options={[
              { value: '', label: 'Todas as categorias' },
              ...Object.entries(categoryConfig).map(([key, { label }]) => ({ value: key, label })),
            ]}
            compact
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <AdminFeedbackPageSkeleton />
        ) : feedback.length === 0 ? (
          <EmptyStateDS
            icon="messageSquareHeart"
            title="Nenhuma sugestão"
            description="As sugestões dos usuários aparecerão aqui."
          />
        ) : (
          <div className="space-y-2">
            {feedback.map((item) => {
              const cat = categoryConfig[item.category] || categoryConfig.other
              const status = statusConfig[item.status] || statusConfig.pending
              const priority = priorityConfig[item.priority] || priorityConfig.normal
              const replyCount = Number(item.reply_count) || 0

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-border-light bg-bg-secondary p-4 text-left transition-all hover:border-brand-primary/20 hover:bg-brand-primary/2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Badge className={cn('text-[10px]', cat.color)}>
                        <DSIcon name={cat.icon} size={12} className="mr-0.5" />{cat.label}
                      </Badge>
                      <Badge className={cn('text-[10px]', status.color)}>
                        <DSIcon name={status.icon} size={12} className="mr-0.5" />{status.label}
                      </Badge>
                      <Badge className={cn('text-[10px]', priority.color)}>{priority.label}</Badge>
                    </div>

                    <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>

                    {item.last_reply && (
                      <p className="mt-1 text-xs text-text-muted line-clamp-1">
                        {item.last_reply_type === 'ai' && <DSIcon name="bot" size={12} className="mr-0.5 inline text-purple-400" />}
                        {item.last_reply_type === 'admin' && <DSIcon name="shield" size={12} className="mr-0.5 inline text-emerald-400" />}
                        {item.last_reply_type === 'user' && <DSIcon name="user" size={12} className="mr-0.5 inline text-brand-primary" />}
                        {item.last_reply}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted/60">
                      <span>{item.user_name} ({item.user_type})</span>
                      <span className="flex items-center gap-0.5">
                        <DSIcon name="messageCircle" size={12} />
                        {replyCount}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <DSIcon name="chevronRight" className="mt-2 shrink-0 text-text-muted/30" />
                </button>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={meta.total_pages} total={meta.total} itemLabel="sugestões" onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => Math.min(meta.total_pages, p + 1))} />
      </div>
    </AuthGuard>
  )
}
