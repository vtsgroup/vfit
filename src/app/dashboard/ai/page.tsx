/**
 * src/app/dashboard/ai/page.tsx
 *
 * AI Dashboard Page — /dashboard/ai
 * Ultra-Premium v4 — Proactive AI with real data context, Claude-style chat
 *
 * Exports: AIPage (default)
 * Features: 'use client' · Framer Motion · DSIcon · Glass Cards · Real Data Context
 */

'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { useAIUsage, useAIAssistant, useGenerateWorkout } from '@/hooks/use-ai'
import { usePersonalStats, usePaymentStats } from '@/hooks/use-dashboard'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WorkoutGenerator = dynamic(() => import('@/components/ai/workout-generator').then(m => m.WorkoutGenerator), { ssr: false })
const ContentGenerator = dynamic(() => import('@/components/ai/content-generator').then(m => m.ContentGenerator), { ssr: false })

// ── Types ──────────────────────────────────
interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  actions?: string[]
  timestamp: Date
}

type ViewMode = 'welcome' | 'chat' | 'workout-gen' | 'content-gen'

// ── Data ───────────────────────────────────
const THINKING_MESSAGES = [
  'Analisando sua pergunta...',
  'Processando informações...',
  'Elaborando resposta...',
  'Consultando base de conhecimento...',
  'Quase pronto...',
]

const WORKOUT_MESSAGES = [
  'Analisando objetivo do treino...',
  'Selecionando exercícios...',
  'Calculando séries e repetições...',
  'Definindo tempos de descanso...',
  'Montando periodização...',
  'Finalizando treino...',
]

// ── Helpers ────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFirstName(fullName: string): string {
  return fullName?.split(' ')[0] || ''
}

function fmtCurrency(value: number): string {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.0', '')}k`
  return `R$ ${value.toFixed(0)}`
}

// ── Typing Indicator ───────────────────────
function TypingIndicator({ isWorkout = false }: { isWorkout?: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const messages = isWorkout ? WORKOUT_MESSAGES : THINKING_MESSAGES

  useEffect(() => {
    const iv = setInterval(() => setMessageIndex((p) => (p + 1) % messages.length), 2500)
    return () => clearInterval(iv)
  }, [messages.length])

  useEffect(() => {
    const iv = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/15 to-emerald-500/10 border border-brand-primary/10">
        <DSIcon name="sparkles" size={14} className="text-brand-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-md bg-bg-secondary/80 border border-border-light/50 px-4 py-3">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-brand-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={messageIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-text-secondary"
            >
              {messages[messageIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        {isWorkout && (
          <div className="mt-1.5 h-0.5 max-w-48 overflow-hidden rounded-full bg-brand-primary/10">
            <motion.div
              className="h-full w-1/3 rounded-full bg-brand-primary/50"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}
        <p className="mt-1 pl-0.5 text-[10px] text-text-muted/25">
          {elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`}
          {elapsed > 8 && ' — IA pode levar até 30s'}
        </p>
      </div>
    </motion.div>
  )
}

// ── Message Bubble (Claude-style) ──────────
function MessageBubble({ message, onCopy }: { message: ChatMessage; onCopy: (text: string) => void }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-primary px-4 py-2.5 text-[14px] leading-relaxed text-zinc-950 shadow-sm">
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group/msg"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/15 to-emerald-500/10 border border-brand-primary/10">
          <DSIcon name="sparkles" size={14} className="text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl rounded-tl-md border border-border-light/50 bg-bg-secondary/60 px-4 py-3 text-[14px] leading-relaxed text-text-primary">
            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
          </div>

          {message.actions && message.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.actions.map((action) => (
                <span
                  key={action}
                  className="rounded-lg border border-brand-primary/15 bg-brand-primary/5 px-2.5 py-1 text-[11px] font-medium text-brand-primary/80"
                >
                  {action}
                </span>
              ))}
            </div>
          )}

          <div className="mt-1.5 flex items-center opacity-0 transition-opacity group-hover/msg:opacity-100">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-text-muted/40 transition-colors hover:text-text-muted/70"
            >
              <DSIcon name={copied ? 'check' : 'copy'} size={10} />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main AI Page Content ───────────────────
function AIPageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('welcome')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isWorkoutTyping, setIsWorkoutTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const user = useAuthStore((s) => s.user)
  const { data: usage } = useAIUsage()
  const { data: stats } = usePersonalStats()
  const { data: paymentStats } = usePaymentStats()
  const assistant = useAIAssistant()
  const workoutGen = useGenerateWorkout()

  const firstName = getFirstName(user?.full_name || '')

  // ── Smart suggestions based on real data ──
  const smartSuggestions = useMemo(() => {
    const items: Array<{
      iconName: DSIconName
      title: string
      description: string
      prompt: string
      viewMode?: ViewMode
      accent: string
      priority: number
    }> = []

    const pending = paymentStats?.summary?.total_pending || 0
    const overdue = paymentStats?.summary?.total_overdue || 0
    const totalStudents = stats?.students?.total || 0
    const activeStudents = stats?.students?.active || 0
    const inactiveStudents = totalStudents - activeStudents

    if (overdue > 0) {
      items.push({
        iconName: 'alertTriangle',
        title: `${fmtCurrency(overdue)} em atraso`,
        description: 'Cobranças vencidas precisam de atenção',
        prompt: `Tenho ${fmtCurrency(overdue)} em cobranças vencidas. Me ajude com estratégias para recuperar esses valores e como abordar os alunos inadimplentes.`,
        accent: 'from-red-500 to-orange-500',
        priority: 1,
      })
    }

    if (pending > 0) {
      items.push({
        iconName: 'clock',
        title: `${fmtCurrency(pending)} pendente`,
        description: 'Pagamentos aguardando confirmação',
        prompt: `Tenho ${fmtCurrency(pending)} em pagamentos pendentes. Quais estratégias posso usar para melhorar minha taxa de recebimento?`,
        accent: 'from-amber-500 to-yellow-500',
        priority: 2,
      })
    }

    if (inactiveStudents > 0) {
      items.push({
        iconName: 'userX',
        title: `${inactiveStudents} aluno${inactiveStudents > 1 ? 's' : ''} inativo${inactiveStudents > 1 ? 's' : ''}`,
        description: 'Estratégias de reengajamento',
        prompt: `Tenho ${inactiveStudents} aluno${inactiveStudents > 1 ? 's' : ''} inativo${inactiveStudents > 1 ? 's' : ''} de ${totalStudents} total. Me dê estratégias práticas para reconquistá-los com mensagens e ofertas.`,
        accent: 'from-purple-500 to-indigo-500',
        priority: 3,
      })
    }

    items.push({
      iconName: 'dumbbell',
      title: 'Criar treino personalizado',
      description: 'Montagem inteligente com periodização',
      prompt: 'Quero criar um treino personalizado para um aluno',
      accent: 'from-emerald-500 to-cyan-400',
      priority: 4,
    })

    items.push({
      iconName: 'fileText',
      title: 'Gerar conteúdo',
      description: 'Posts, stories, emails e bio',
      prompt: '',
      viewMode: 'content-gen',
      accent: 'from-pink-500 to-rose-400',
      priority: 5,
    })

    items.push({
      iconName: 'trendingUp',
      title: 'Crescer meu negócio',
      description: 'Insights e estratégias práticas',
      prompt: `Sou personal trainer com ${totalStudents} alunos (${activeStudents} ativos). Me dê uma análise completa do meu negócio com sugestões práticas de crescimento.`,
      accent: 'from-blue-500 to-cyan-500',
      priority: 6,
    })

    items.push({
      iconName: 'message',
      title: 'Tirar uma dúvida',
      description: 'Sobre treinos, negócio ou nutrição',
      prompt: 'Preciso de ajuda com uma dúvida',
      accent: 'from-indigo-500 to-violet-400',
      priority: 7,
    })

    return items.sort((a, b) => a.priority - b.priority).slice(0, 6)
  }, [stats, paymentStats])

  // ── Quick prompts for chat ──
  const quickPrompts = useMemo(() => {
    const total = stats?.students?.total || 0
    const overdue = paymentStats?.summary?.total_overdue || 0
    const base = [
      'Como precificar meus serviços?',
      'Ideias para captar novos alunos',
      'Monte um treino de hipertrofia',
    ]
    if (total > 0) base.unshift(`Análise dos meus ${total} alunos`)
    if (overdue > 0) base.unshift('Como cobrar alunos inadimplentes?')
    return base.slice(0, 4)
  }, [stats, paymentStats])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  const autoResize = (el: HTMLTextAreaElement | null, maxH = 160) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px'
  }

  const addMessage = useCallback((role: 'assistant' | 'user', content: string, actions?: string[]) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, actions, timestamp: new Date() },
    ])
  }, [])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return

    setInput('')
    autoResize(inputRef.current)
    autoResize(chatInputRef.current)

    if (viewMode === 'welcome') setViewMode('chat')
    addMessage('user', msg)
    setIsTyping(true)

    try {
      const isWorkoutRequest = /criar treino|gerar treino|montar treino|treino personalizado/i.test(msg)

      if (isWorkoutRequest) {
        setIsWorkoutTyping(true)
        const result = await workoutGen.mutateAsync({ goal: 'hypertrophy', complexity: 'medium', extra_instructions: msg })
        setIsTyping(false)
        setIsWorkoutTyping(false)

        const workoutText = result.workout?.workouts
          ?.map((w) => {
            const exercises = w.exercises
              .map((e, i) => `  ${i + 1}. ${e.notes || 'Exercício'} — ${e.sets}×${e.reps} (${e.rest_seconds}s descanso)`)
              .join('\n')
            return `${w.name}\n${w.description}\n\n${exercises}`
          })
          .join('\n\n') || 'Treino gerado com sucesso!'

        addMessage('assistant', `Aqui está o treino que montei:\n\n${workoutText}\n\nQuer que eu ajuste alguma coisa?`)
      } else {
        const contextType = /aluno|student|inativo|ativo/i.test(msg) ? 'students' as const
          : /cobran|pagamento|inadimpl|vencid|pend|receb|fatur/i.test(msg) ? 'billing' as const
          : /treino|exerc|workout|série|repeti/i.test(msg) ? 'workouts' as const
          : 'general' as const

        const result = await assistant.mutateAsync({ question: msg, context_type: contextType })
        setIsTyping(false)
        addMessage('assistant', result.response.resposta, result.response.acoes_sugeridas)
      }
    } catch (err) {
      setIsTyping(false)
      setIsWorkoutTyping(false)
      const errorMsg = (err as { message?: string })?.message || ''
      if (errorMsg.includes('Pergunta') || errorMsg.includes('muito curta') || errorMsg.includes('vazia')) {
        addMessage('assistant', 'Sua mensagem é muito curta. Tente escrever um pouco mais para que eu possa te ajudar melhor! 😊')
      } else {
        addMessage('assistant', `Desculpe, não consegui processar sua pergunta.\n\n**Erro:** ${errorMsg || 'Erro desconhecido'}\n\nTente reformular ou pergunte algo diferente.`)
      }
    }
  }, [input, viewMode, addMessage, assistant, workoutGen])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (s: typeof smartSuggestions[0]) => {
    if (s.viewMode) {
      setViewMode(s.viewMode)
      return
    }
    if (s.prompt) handleSend(s.prompt)
  }

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text).catch(() => {}) }

  const handleBack = () => {
    if (viewMode === 'chat' && messages.length > 0) setMessages([])
    setViewMode('welcome')
  }

  // ── Tool views ──
  if (viewMode === 'workout-gen') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <DSIcon name="arrowLeft" size={16} /> Voltar
        </Button>
        <WorkoutGenerator />
      </div>
    )
  }
  if (viewMode === 'content-gen') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <DSIcon name="arrowLeft" size={16} /> Voltar
        </Button>
        <ContentGenerator />
      </div>
    )
  }

  // ══════════════════════════════════════════
  //  SHARED INPUT BAR
  // ══════════════════════════════════════════
  const inputBar = (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative rounded-2xl bg-bg-secondary/50 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_-4px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_32px_-4px_rgba(16,185,129,0.08)]">
        <textarea
          ref={viewMode === 'welcome' ? inputRef : chatInputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoResize(e.target) }}
          onKeyDown={handleKeyDown}
          placeholder={isTyping ? 'Aguarde a resposta...' : 'Pergunte qualquer coisa...'}
          disabled={isTyping}
          rows={1}
          className="block w-full resize-none rounded-2xl bg-transparent py-3.5 pl-4 pr-13 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none disabled:opacity-50 sm:text-[15px]"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="button"
            disabled={!input.trim() || isTyping}
            onClick={() => handleSend()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
              input.trim() && !isTyping
                ? 'bg-brand-primary text-zinc-950 shadow-sm shadow-brand-primary/20 hover:brightness-110 active:scale-95'
                : 'text-text-muted/20'
            )}
          >
            {isTyping
              ? <DSIcon name="loader" size={15} className="animate-spin" />
              : <DSIcon name="arrowUp" size={15} />
            }
          </button>
        </div>
      </div>
      {viewMode === 'welcome' && (
        <p className="mt-2 text-center text-[10px] text-text-muted/25">
          VFIT pode cometer erros · {usage?.totals?.total_calls || 0} chamadas este mês
        </p>
      )}
    </div>
  )

  // ══════════════════════════════════════════
  //  WELCOME VIEW — Claude-style
  // ══════════════════════════════════════════
  if (viewMode === 'welcome') {
    const totalStudents = stats?.students?.total || 0
    const activeStudents = stats?.students?.active || 0
    const revenue = paymentStats?.summary?.total_received || 0
    const pending = paymentStats?.summary?.total_pending || 0
    const overdue = paymentStats?.summary?.total_overdue || 0

    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        {/* Atmospheric mesh background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_40%,rgba(139,92,246,0.08)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_85%_15%,rgba(16,185,129,0.06)_0%,transparent_55%),radial-gradient(ellipse_40%_30%_at_50%_90%,rgba(59,130,246,0.04)_0%,transparent_45%)]" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-6">

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-center"
          >
            {/* AI orb */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] shadow-[0_0_32px_rgba(139,92,246,0.2)]">
              <DSIcon name="sparkles" size={26} className="text-[#A78BFA]" />
            </div>
            <h1 className="font-syne text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {getGreeting()}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-2 text-sm text-text-secondary sm:text-base">
              Como posso te ajudar hoje?
            </p>
          </motion.div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl"
          >
            {inputBar}
          </motion.div>

          {/* Stats Pills */}
          {(totalStudents > 0 || revenue > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
            >
              {totalStudents > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-border-light/30 bg-bg-secondary/30 px-3 py-1.5 text-[11px] text-text-secondary/60">
                  <DSIcon name="users" size={12} className="text-brand-primary/50" />
                  <span className="font-medium text-text-primary/70">{activeStudents}</span>
                  <span>/{totalStudents} alunos</span>
                </div>
              )}
              {revenue > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-border-light/30 bg-bg-secondary/30 px-3 py-1.5 text-[11px] text-text-secondary/60">
                  <DSIcon name="trendingUp" size={12} className="text-emerald-400/50" />
                  <span className="font-medium text-text-primary/70">{fmtCurrency(revenue)}</span>
                  <span>recebido</span>
                </div>
              )}
              {pending > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[11px] text-amber-400/70">
                  <DSIcon name="clock" size={12} />
                  <span className="font-medium">{fmtCurrency(pending)}</span>
                  <span>pendente</span>
                </div>
              )}
              {overdue > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] text-red-400/70">
                  <DSIcon name="alertTriangle" size={12} />
                  <span className="font-medium">{fmtCurrency(overdue)}</span>
                  <span>vencido</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Smart Suggestion Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 grid w-full max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {smartSuggestions.map((s, i) => (
              <motion.button
                key={s.title}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                disabled={isTyping}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -1, transition: { duration: 0.12 } }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-start gap-3 rounded-xl border border-border-light/40 bg-bg-secondary/25 p-3.5 text-left transition-all duration-200 hover:border-border-light/70 hover:bg-bg-secondary/50 disabled:pointer-events-none disabled:opacity-40"
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br shadow-sm',
                  s.accent,
                )}>
                  <DSIcon name={s.iconName} size={15} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-text-primary">{s.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{s.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Coming Soon — inline minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex items-center gap-3 text-[10px] text-text-muted/30"
          >
            <span className="font-medium uppercase tracking-widest">Em breve</span>
            <span className="h-px w-4 bg-border-light/20" />
            {([
              { icon: 'camera' as DSIconName, label: 'Comparação de Fotos' },
              { icon: 'creditCard' as DSIconName, label: 'Cobranças Smart' },
              { icon: 'barChart' as DSIconName, label: 'Sentimento' },
            ]).map((item) => (
              <span key={item.label} className="flex items-center gap-1 opacity-50">
                <DSIcon name={item.icon} size={10} />
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  //  CHAT VIEW — Claude-style
  // ══════════════════════════════════════════
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shrink-0 border-b border-border-light/40"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <DSIcon name="arrowLeft" size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/15 to-emerald-500/10 border border-brand-primary/10">
              <DSIcon name="sparkles" size={12} className="text-brand-primary" />
            </div>
            <span className="text-sm font-semibold text-text-primary">VFIT</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="flex-1" />
          {usage && (
            <span className="hidden text-[10px] text-text-muted/30 sm:inline">
              {usage.totals.total_calls} chamadas · {(usage.totals.total_tokens / 1000).toFixed(1)}k tokens
            </span>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/15 to-emerald-500/10 border border-brand-primary/10">
                <DSIcon name="sparkles" size={20} className="text-brand-primary" />
              </div>
              <p className="mt-3 text-sm text-text-muted/30">Como posso ajudar?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-border-light/40 bg-bg-secondary/30 px-3.5 py-1.5 text-xs text-text-secondary/60 transition-all duration-200 hover:border-border-light/60 hover:bg-bg-secondary/50 hover:text-text-secondary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onCopy={handleCopy} />
          ))}

          {isTyping && <TypingIndicator isWorkout={isWorkoutTyping} />}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border-light/40 px-4 py-3">
        {inputBar}
      </div>
    </div>
  )
}

// ── Page Export ─────────────────────────────
export default function AIPage() {
  return (
    <AuthGuard>
      <AIPageContent />
    </AuthGuard>
  )
}
