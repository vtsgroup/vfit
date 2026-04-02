/**
 * src/app/(app)/ia/page.tsx
 *
 * Hub IA — VFIT B2C
 *
 * Seção 1: Consultas IA (cards com ícones, navega para sub-rotas)
 * Seção 2: Dicas Fitness (migrado de /dicas)
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui'
import { TIPS, TIP_CATEGORIES, getTipOfTheDay } from '@config/tips'
import type { Tip } from '@config/tips'
import { cn } from '@/lib/utils'
import { IA_CONSULTATION_OPTIONS } from '@/types/ia-consultation'

export default function IAHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const tipOfTheDay = useMemo(() => getTipOfTheDay(), [])

  const filteredTips = useMemo(() => {
    if (selectedCategory === 'all') return TIPS
    return TIPS.filter((t) => t.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <DSIcon name="sparkles" className="h-5 w-5 text-brand-primary" />
          <h1 className="text-lg font-bold text-text-primary">IA & Dicas</h1>
        </div>
      </header>

      <div className="space-y-6 px-4 pt-2">
        {/* ═══ Seção 1: Consultas IA ═══ */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <DSIcon name="brainCircuit" className="h-4 w-4 text-brand-primary" />
            <h2 className="text-sm font-bold text-text-primary">Consultas com IA</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {IA_CONSULTATION_OPTIONS.map((option) => (
              <Link
                key={option.id}
                href={option.isAvailable ? option.route : '#'}
                aria-disabled={!option.isAvailable}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all',
                  option.isAvailable
                    ? 'bg-bg-secondary hover:bg-bg-tertiary active:scale-[0.98]'
                    : 'bg-bg-secondary/50 opacity-60 pointer-events-none'
                )}
                onClick={(e) => {
                  if (!option.isAvailable) e.preventDefault()
                }}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                    option.isAvailable
                      ? 'bg-brand-primary/12 text-brand-primary group-hover:bg-brand-primary/20'
                      : 'bg-bg-tertiary text-text-muted'
                  )}
                >
                  <DSIcon name={option.icon} size={22} />
                </div>

                {/* Label */}
                <span className="text-xs font-semibold text-text-primary leading-tight">
                  {option.label}
                </span>

                {/* Description */}
                <span className="text-[10px] text-text-muted leading-snug line-clamp-2">
                  {option.description}
                </span>

                {/* "Em breve" badge */}
                {!option.isAvailable && (
                  <span className="absolute top-2 right-2 rounded-full bg-bg-tertiary px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                    Em breve
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-border-light/30" />

        {/* ═══ Seção 2: Dicas Fitness ═══ */}
        <section>
          {/* Dica do Dia — destaque */}
          <div className="rounded-2xl bg-linear-to-br from-brand-primary/15 to-emerald-400/5 p-4 mb-4">
            <p className="mb-1 text-xs font-semibold text-brand-primary">
              💡 Dica do Dia
            </p>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tipOfTheDay.icon}</span>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {tipOfTheDay.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {tipOfTheDay.content}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros por categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TIP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-bg-secondary text-text-secondary'
                )}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de dicas */}
          <div className="space-y-2 mt-3">
            {filteredTips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                expanded={expandedTip === tip.id}
                onToggle={() =>
                  setExpandedTip((prev) =>
                    prev === tip.id ? null : tip.id
                  )
                }
              />
            ))}
          </div>

          {/* Contador */}
          <p className="mt-3 text-center text-xs text-text-muted">
            {filteredTips.length} dicas disponíveis
          </p>
        </section>
      </div>
    </div>
  )
}

// ── Tip Card ───────────────────────────────────────────
function TipCard({
  tip,
  expanded,
  onToggle,
}: {
  tip: Tip
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full rounded-xl p-3 text-left transition-all',
        expanded ? 'bg-bg-secondary ring-1 ring-brand-primary/20' : 'bg-bg-secondary'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{tip.icon}</span>
        <p className="flex-1 text-sm font-semibold text-text-primary">
          {tip.title}
        </p>
        <DSIcon
          name={expanded ? 'chevronDown' : 'chevronRight'}
          className="h-4 w-4 text-text-muted"
        />
      </div>
      {expanded && (
        <p className="mt-2 pl-9 text-xs leading-relaxed text-text-secondary">
          {tip.content}
        </p>
      )}
    </button>
  )
}
