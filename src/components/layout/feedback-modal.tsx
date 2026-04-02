/**
 * src/components/layout/feedback-modal.tsx
 *
 * Feedback Modal — Sugestões & Melhorias
 *
 * Exports: FeedbackModal
 * Hooks: useState, useEffect, useCallback, useScrollLock, useCreateFeedback, useMyFeedback
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Feedback Modal — Sugestões & Melhorias
// Duas abas: Nova Sugestão + Minhas Sugestões (com chat)
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { FeedbackChat } from '@/components/layout/feedback-chat'
import {
  useCreateFeedback,
  useMyFeedback,
  useFeedbackDetail,
  useCreateReply,
  type FeedbackItem,
} from '@/hooks/use-feedback'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

const categories = [
  { key: 'feature', label: 'Nova funcionalidade', icon: 'lightbulb' as DSIconName, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { key: 'improvement', label: 'Melhoria', icon: 'wrench' as DSIconName, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { key: 'bug', label: 'Problema/Bug', icon: 'bug' as DSIconName, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  { key: 'ui', label: 'Visual/Design', icon: 'palette' as DSIconName, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  { key: 'other', label: 'Outro', icon: 'helpCircle' as DSIconName, color: 'text-zinc-400', bg: 'bg-zinc-400/10 border-zinc-400/20' },
] as const

const statusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: 'clock' },
  reviewing: { label: 'Analisando', color: 'bg-blue-400/10 text-blue-400', icon: 'eye' },
  planned: { label: 'Planejado', color: 'bg-purple-400/10 text-purple-400', icon: 'sparkles' },
  in_progress: { label: 'Em andamento', color: 'bg-brand-primary/10 text-brand-primary', icon: 'loader' },
  done: { label: 'Concluído', color: 'bg-success/10 text-success', icon: 'checkCircle2' },
  declined: { label: 'Recusado', color: 'bg-error/10 text-error', icon: 'xCircle' },
}

type Tab = 'new' | 'list'

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [tab, setTab] = useState<Tab>('new')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Lock body scroll when modal is open
  useScrollLock(open)

  // New suggestion form state
  const [category, setCategory] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sent, setSent] = useState(false)

  const createFeedback = useCreateFeedback()
  const { data: myFeedback, isLoading: loadingList } = useMyFeedback()
  const { data: feedbackDetail } = useFeedbackDetail(selectedId)
  const createReply = useCreateReply()

  // Reset when closing
  const handleClose = useCallback(() => {
    setCategory('')
    setTitle('')
    setDescription('')
    setSent(false)
    setSelectedId(null)
    onClose()
  }, [onClose])

  // ESC fecha modal principal/detalhe
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  // After send, switch to list to see the AI reply
  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        setSent(false)
        setTab('list')
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [sent])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !title.trim() || !description.trim()) return

    try {
      await createFeedback.mutateAsync({ category, title: title.trim(), description: description.trim() })
      setSent(true)
      setCategory('')
      setTitle('')
      setDescription('')
    } catch {
      // Error handled by hook
    }
  }

  const isValid = category && title.trim().length >= 3 && description.trim().length >= 10
  const feedbackList = Array.isArray(myFeedback?.feedback) ? myFeedback!.feedback : []
  const hasNew = feedbackList.some((f) => f.has_new_reply)

  // If viewing a specific feedback detail with chat
  if (selectedId && feedbackDetail) {
    const detail = feedbackDetail as FeedbackItem
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2"
              style={{
                marginTop: 'env(safe-area-inset-top, 0px)',
                marginBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="flex h-[75vh] max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <FeedbackChat
                  feedback={detail}
                  replies={detail.replies || []}
                  onSendReply={(msg) => createReply.mutate({ feedbackId: selectedId, message: msg })}
                  isSending={createReply.isPending}
                  onBack={() => setSelectedId(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2"
            style={{
              marginTop: 'env(safe-area-inset-top, 0px)',
              marginBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div className="flex max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                    <DSIcon name="lightbulb" size={20} className="text-warning" /> Sugestões & Melhorias
                  </h2>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    Sua ideia vai direto para o desenvolvedor
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                >
                  <DSIcon name="x" size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border-light">
                <button
                  onClick={() => setTab('new')}
                  className={cn(
                    'flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all',
                    tab === 'new'
                      ? 'border-b-2 border-brand-primary text-brand-primary'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <DSIcon name="plus" size={14} />
                  Nova sugestão
                </button>
                <button
                  onClick={() => setTab('list')}
                  className={cn(
                    'relative flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all',
                    tab === 'list'
                      ? 'border-b-2 border-brand-primary text-brand-primary'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <DSIcon name="messageCircle" size={14} />
                  Minhas sugestões
                  {hasNew && (
                    <span className="absolute right-4 top-2 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {tab === 'new' ? (
                    <motion.div
                      key="new"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {sent ? (
                        <div className="flex flex-col items-center gap-3 px-5 py-10">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                            <DSIcon name="checkCircle2" size={32} className="text-success" />
                          </div>
                          <h3 className="text-lg font-bold text-text-primary">Obrigado!</h3>
                          <p className="text-center text-sm text-text-muted">
                            Sua sugestão foi enviada! Veja a resposta na aba &ldquo;Minhas sugestões&rdquo;.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                          {/* Category selector */}
                          <div>
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                              Categoria
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {categories.map((cat) => {
                                const isActive = category === cat.key
                                return (
                                  <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategory(cat.key)}
                                    className={cn(
                                      'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                                      isActive
                                        ? `${cat.bg} ${cat.color}`
                                        : 'border-border-light text-text-muted hover:bg-bg-tertiary hover:text-text-primary'
                                    )}
                                  >
                                    <DSIcon name={cat.icon} size={16} className="shrink-0" />
                                    <span className="truncate">{cat.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                              Título
                            </label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Ex: Adicionar timer nos treinos"
                              maxLength={200}
                              className="min-h-11 w-full rounded-xl border border-border-light bg-bg-tertiary px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted/50 transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary"
                            />
                            <p className="mt-1 text-right text-[10px] text-text-muted/50">{title.length}/200</p>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                              Descreva sua ideia
                            </label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Explique em detalhes o que gostaria de ver na plataforma..."
                              maxLength={2000}
                              rows={4}
                              className="min-h-11 w-full resize-none rounded-xl border border-border-light bg-bg-tertiary px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted/50 transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary"
                            />
                            <p className="mt-1 text-right text-[10px] text-text-muted/50">{description.length}/2000</p>
                          </div>

                          {/* Submit */}
                          <button
                            type="submit"
                            disabled={!isValid || createFeedback.isPending}
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-bg-dark transition-all hover:bg-brand-primary-hover hover:shadow-glow-primary active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
                          >
                            {createFeedback.isPending ? (
                              <DSIcon name="loader" size={16} className="animate-spin" />
                            ) : (
                              <>
                                <DSIcon name="send" size={16} />
                                Enviar sugestão
                              </>
                            )}
                          </button>

                          <p className="text-center text-[10px] text-text-muted/60">
                            Sugestões e melhorias · Máx. 5 por dia
                          </p>
                        </form>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {loadingList ? (
                        <div className="flex items-center justify-center py-12">
                          <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
                        </div>
                      ) : feedbackList.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-5 py-12">
                          <DSIcon name="messageCircle" size={40} className="text-text-muted/20" />
                          <p className="text-sm text-text-muted">Nenhuma sugestão enviada ainda</p>
                          <button
                            onClick={() => setTab('new')}
                            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-primary/10 px-4 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20"
                          >
                            <DSIcon name="plus" size={14} />
                            Enviar primeira sugestão
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-border-light">
                          {feedbackList.map((item) => {
                            const status = statusConfig[item.status] || statusConfig.pending

                            const replyCount = Number(item.reply_count) || 0

                            return (
                              <button
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className="flex min-h-11 w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg-tertiary/50"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-text-primary truncate">
                                      {item.title}
                                    </h4>
                                    {item.has_new_reply && (
                                      <span className="shrink-0 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge className={cn('text-[9px] px-1.5 py-0', status.color)}>
                                      <DSIcon name={status.icon} size={10} className="mr-0.5" />
                                      {status.label}
                                    </Badge>
                                    <span className="text-[10px] text-text-muted/50">
                                      {replyCount} mensage{replyCount !== 1 ? 'ns' : 'm'}
                                    </span>
                                  </div>
                                  {item.last_reply && (
                                    <p className="mt-1 text-xs text-text-muted line-clamp-1">
                                      {item.last_reply_type === 'ai' && (
                                        <DSIcon name="bot" size={12} className="mr-0.5 inline text-purple-400" />
                                      )}
                                      {item.last_reply_type === 'admin' && (
                                        <span className="mr-0.5 text-emerald-400">Victor: </span>
                                      )}
                                      {item.last_reply}
                                    </p>
                                  )}
                                </div>
                                <DSIcon name="chevronRight" size={16} className="mt-1 shrink-0 text-text-muted/30" />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
