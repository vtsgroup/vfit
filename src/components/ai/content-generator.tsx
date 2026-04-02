/**
 * src/components/ai/content-generator.tsx
 *
 * ContentGenerator — AI marketing content creation
 *
 * Exports: ContentGenerator
 * Hooks: useState, useGenerateContent
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// ContentGenerator — AI marketing content creation
// ============================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useGenerateContent } from '@/hooks/use-ai'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ContentType = 'instagram_post' | 'story' | 'bio' | 'email' | 'promotion'

const CONTENT_TYPES: Array<{ value: ContentType; icon: DSIconName; label: string; description: string }> = [
  { value: 'instagram_post', icon: 'instagram', label: 'Post Instagram', description: 'Legenda para feed' },
  { value: 'story', icon: 'instagram', label: 'Story', description: 'Texto para story' },
  { value: 'bio', icon: 'type', label: 'Bio', description: 'Bio para redes sociais' },
  { value: 'email', icon: 'mail', label: 'E-mail', description: 'E-mail marketing' },
  { value: 'promotion', icon: 'megaphone', label: 'Promoção', description: 'Texto promocional' },
]

const TOPIC_SUGGESTIONS = [
  'Novo plano de treino',
  'Promoção de matrícula',
  'Dicas de nutrição',
  'Resultados de alunos',
  'Motivação fitness',
  'Treino funcional',
  'Desafio 30 dias',
  'Aula experimental grátis',
]

export function ContentGenerator() {
  const [type, setType] = useState<ContentType>('instagram_post')
  const [topic, setTopic] = useState('')
  const [copied, setCopied] = useState(false)

  const generateContent = useGenerateContent()

  const handleGenerate = () => {
    if (!topic.trim()) return
    generateContent.mutate({ type, topic: topic.trim() })
  }

  const handleCopy = () => {
    const text = typeof generateContent.data?.content === 'string'
      ? generateContent.data.content
      : JSON.stringify(generateContent.data?.content, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Content Type */}
      <div>
        <label className="mb-3 block text-sm font-medium text-text-primary">Tipo de conteúdo</label>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setType(ct.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
                type === ct.value
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-border-light bg-bg-secondary hover:border-brand-primary/30'
              )}
            >
              <DSIcon name={ct.icon} size={20} className={cn(
                type === ct.value ? 'text-brand-primary' : 'text-text-muted'
              )} />
              <span className="text-xs font-medium text-text-primary">{ct.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Sobre o quê?</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Promoção de matrícula com 20% de desconto"
          className="w-full rounded-xl border border-border-light bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                topic === s
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-border-light text-text-muted hover:border-brand-primary/30'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={!topic.trim()}
        loading={generateContent.isPending}
      >
        <DSIcon name="sparkles" size={16} />
        {generateContent.isPending ? 'Gerando...' : 'Gerar Conteúdo'}
      </Button>

      {/* Result */}
      {generateContent.data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border-light bg-bg-secondary p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DSIcon name="fileText" size={16} className="text-brand-primary" />
              <span className="text-sm font-medium text-text-primary">Conteúdo Gerado</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <DSIcon name="check" size={14} className="text-brand-primary" /> : <DSIcon name="copy" size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <div className="prose prose-sm max-w-none text-text-secondary">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {typeof generateContent.data.content === 'string'
                ? generateContent.data.content
                : JSON.stringify(generateContent.data.content, null, 2)}
            </pre>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs text-text-muted">
              Modelo: {generateContent.data.model_used}
            </span>
            <span className="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs text-text-muted">
              Tipo: {generateContent.data.type}
            </span>
          </div>
        </motion.div>
      )}

      {generateContent.isError && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
          {generateContent.error?.message || 'Erro ao gerar conteúdo. Tente novamente.'}
        </div>
      )}
    </div>
  )
}
