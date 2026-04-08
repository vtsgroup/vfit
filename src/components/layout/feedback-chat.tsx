/**
 * src/components/layout/feedback-chat.tsx
 *
 * Feedback Chat — Bolhas de mensagem tipo WhatsApp
 *
 * Exports: FeedbackChat
 * Hooks: useState, useRef, useEffect
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Feedback Chat — Bolhas de mensagem tipo WhatsApp
// Exibe replies de user, admin e IA com estilos distintos
// ============================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { Badge } from '@/components/ui/badge'
import type { FeedbackItem, FeedbackReply } from '@/hooks/use-feedback'

// ============================================
// Config
// ============================================

const categoryConfig: Record<string, { label: string; icon: DSIconName; color: string }> = {
  feature: { label: 'Nova funcionalidade', icon: 'lightbulb', color: 'text-amber-400' },
  improvement: { label: 'Melhoria', icon: 'wrench', color: 'text-brand-primary' },
  bug: { label: 'Bug', icon: 'bug', color: 'text-red-400' },
  ui: { label: 'Visual', icon: 'palette', color: 'text-purple-400' },
  other: { label: 'Outro', icon: 'helpCircle', color: 'text-zinc-400' },
}

const statusConfig: Record<string, { label: string; color: string; icon: DSIconName }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning border-warning/20', icon: 'clock' },
  reviewing: { label: 'Analisando', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20', icon: 'eye' },
  planned: { label: 'Planejado', color: 'bg-purple-400/10 text-purple-400 border-purple-400/20', icon: 'sparkles' },
  in_progress: { label: 'Em andamento', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20', icon: 'loader' },
  done: { label: 'Concluído', color: 'bg-success/10 text-success border-success/20', icon: 'checkCircle2' },
  declined: { label: 'Recusado', color: 'bg-error/10 text-error border-error/20', icon: 'xCircle' },
}

// ============================================
// Message Bubble Component
// ============================================

function MessageBubble({ reply, isLast }: { reply: FeedbackReply; isLast: boolean }) {
  const isUser = reply.sender_type === 'user'
  const isAdmin = reply.sender_type === 'admin'
  const isAI = reply.sender_type === 'ai'

  const time = new Date(reply.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const date = new Date(reply.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <motion.div
      initial={isLast ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 px-1',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1',
        isUser && 'bg-brand-primary/20',
        isAdmin && 'bg-emerald-500/20',
        isAI && 'bg-purple-500/20',
      )}>
        {isUser && <DSIcon name="user" size={14} className="text-brand-primary" />}
        {isAdmin && <DSIcon name="shield" size={14} className="text-emerald-400" />}
        {isAI && <DSIcon name="bot" size={14} className="text-purple-400" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-3.5 py-2.5',
        isUser && 'rounded-tr-md bg-brand-primary/15 border border-brand-primary/20',
        isAdmin && 'rounded-tl-md bg-emerald-500/10 border border-emerald-500/20',
        isAI && 'rounded-tl-md bg-purple-500/10 border border-purple-500/20',
      )}>
        {/* Sender name */}
        <p className={cn(
          'text-[10px] font-semibold mb-0.5',
          isUser && 'text-brand-primary text-right',
          isAdmin && 'text-emerald-400',
          isAI && 'text-purple-400',
        )}>
          {isUser ? 'Você' : reply.sender_name || (isAI ? 'Victor (IA)' : 'Victor')}
          {isAI && (
            <span className="ml-1 inline-flex items-center gap-0.5 text-purple-400/60">
              <DSIcon name="bot" size={10} />
              IA
            </span>
          )}
        </p>

        {/* Message text */}
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap wrap-break-word">
          {reply.message}
        </p>

        {/* Timestamp */}
        <p className={cn(
          'text-[10px] text-text-muted/50 mt-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {date} · {time}
        </p>
      </div>
    </motion.div>
  )
}

// ============================================
// Main Chat Component
// ============================================

interface FeedbackChatProps {
  feedback: FeedbackItem
  replies: FeedbackReply[]
  onSendReply: (message: string) => void
  isSending: boolean
  onBack: () => void
  isAdmin?: boolean
}

export function FeedbackChat({
  feedback,
  replies,
  onSendReply,
  isSending,
  onBack,
  isAdmin = false,
}: FeedbackChatProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [replies.length])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || isSending) return
    onSendReply(message.trim())
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const cat = categoryConfig[feedback.category] || categoryConfig.other
  const status = statusConfig[feedback.status] || statusConfig.pending

  return (
    <div className="flex h-full flex-col">
      {/* Header with feedback info */}
      <div className="border-b border-border-light px-4 py-3">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <DSIcon name="arrowLeft" size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-text-primary truncate">
              {feedback.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge className={cn('text-[10px] px-1.5 py-0.5', status.color)}>
                <DSIcon name={status.icon} size={10} className="mr-0.5" />
                {status.label}
              </Badge>
              <span className={cn('inline-flex items-center gap-0.5 text-[10px]', cat.color)}>
                <DSIcon name={cat.icon} size={10} />
                {cat.label}
              </span>
              {isAdmin && feedback.user_name && (
                <span className="text-[10px] text-text-muted">
                  por {feedback.user_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3" style={{ minHeight: 0 }}>
        {replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <DSIcon name="messageCircle" size={32} className="text-text-muted/30 mb-2" />
            <p className="text-xs text-text-muted/50">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <>
            {replies.map((reply, idx) => (
              <MessageBubble
                key={reply.id}
                reply={reply}
                isLast={idx === replies.length - 1}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border-light px-3 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAdmin ? 'Responder como Victor...' : 'Escreva uma mensagem...'}
              maxLength={2000}
              rows={1}
              className="min-h-11 w-full resize-none rounded-xl border border-border-light bg-bg-tertiary px-3.5 py-2.5 pr-10 text-base text-text-primary placeholder:text-text-muted/40 transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-primary"
              style={{ maxHeight: '120px', minHeight: '44px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all',
              message.trim() && !isSending
                ? 'bg-brand-primary text-bg-dark hover:bg-brand-primary-hover shadow-glow-primary'
                : 'bg-bg-tertiary text-text-muted/40'
            )}
          >
            {isSending ? (
              <DSIcon name="loader" size={16} className="animate-spin" />
            ) : (
              <DSIcon name="send" size={16} />
            )}
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-text-muted/40">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  )
}
