/**
 * src/components/ai/ai-chat.tsx
 *
 * AIChat — ChatGPT-style AI assistant interface
 *
 * Exports: AIChat
 * Hooks: useState, useRef, useEffect, useAIAssistant
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// AIChat — ChatGPT-style AI assistant interface
// ============================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAIAssistant } from '@/hooks/use-ai'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: string[]
  timestamp: Date
}

const SUGGESTIONS = [
  'Como posso melhorar a retenção de alunos?',
  'Qual treino ideal para emagrecimento?',
  'Sugira uma estratégia de precificação',
  'Analise o desempenho dos meus alunos',
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [contextType, setContextType] = useState<'general' | 'students' | 'billing' | 'workouts'>('general')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const assistant = useAIAssistant()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = (text?: string) => {
    const question = text || input.trim()
    if (!question || assistant.isPending) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    assistant.mutate(
      { question, context_type: contextType },
      {
        onSuccess: (data) => {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.response.resposta || JSON.stringify(data.response),
            actions: data.response.acoes_sugeridas,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMsg])
        },
        onError: () => {
          const errMsg: Message = {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errMsg])
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border-light bg-bg-secondary" style={{ height: 'calc(100dvh - 280px)', minHeight: '400px' }}>
      {/* Context selector */}
      <div className="flex items-center gap-2 border-b border-border-light px-4 py-2.5">
        <span className="text-xs text-text-muted">Contexto:</span>
        {(['general', 'students', 'billing', 'workouts'] as const).map((ctx) => (
          <button
            key={ctx}
            onClick={() => setContextType(ctx)}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium transition-all',
              contextType === ctx
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-text-muted hover:bg-bg-tertiary'
            )}
          >
            {{ general: 'Geral', students: 'Alunos', billing: 'Financeiro', workouts: 'Treinos' }[ctx]}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 mb-4">
              <DSIcon name="bot" size={32} className="text-brand-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Assistente IA</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm">
              Tire dúvidas, peça sugestões e obtenha insights personalizados sobre seus alunos e negócio.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="flex items-start gap-2 rounded-xl border border-border-light bg-bg-tertiary/50 p-3 text-left text-xs text-text-muted transition-all hover:border-brand-primary/30 hover:text-text-primary"
                >
                  <DSIcon name="lightbulb" size={14} className="shrink-0 mt-0.5 text-brand-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user'
                  ? 'bg-brand-primary text-zinc-950'
                  : 'bg-bg-tertiary text-text-muted'
              )}>
                {msg.role === 'user' ? <DSIcon name="user" size={16} /> : <DSIcon name="bot" size={16} />}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-brand-primary text-zinc-950 rounded-tr-sm'
                  : 'bg-bg-tertiary text-text-primary rounded-tl-sm'
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {msg.actions.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary"
                      >
                        <DSIcon name="sparkles" size={12} /> {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {assistant.isPending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary">
              <DSIcon name="bot" size={16} className="text-text-muted" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-bg-tertiary px-4 py-3">
              <div className="flex items-center gap-2">
                <DSIcon name="loader" size={16} className="animate-spin text-brand-primary" />
                <span className="text-sm text-text-muted">Pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border-light p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Faça uma pergunta..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border-light bg-bg-tertiary px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none sm:text-sm"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || assistant.isPending}
            className="flex h-10.5 w-10.5 items-center justify-center rounded-xl bg-brand-primary text-zinc-950 transition-all hover:bg-brand-primary-hover disabled:opacity-50"
          >
            <DSIcon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
