// ============================================
// faq-inline.tsx — Accordion de FAQ inline reutilizável (tema CLARO)
// ============================================
//
// O que faz:
//   Componente de FAQ em accordion para páginas de conteúdo claras (legal,
//   carreiras, etc.). Gramática do kit light-section: card branco, borda slate,
//   heading gray-950, chip verde, número em badge, estado aberto com anel verde
//   + gradiente, reveal grid-collapse suave. Abre/fecha via useState.
//
// Exports principais:
//   FaqItem — interface { question, answer }
//   FaqInline — accordion de FAQ reutilizável (light)
'use client'

import { useState, type CSSProperties } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

export interface FaqItem {
  question: string
  answer: string
}

interface FaqInlineProps {
  items: FaqItem[]
  title?: string
  /** Emit JSON-LD FAQPage schema (default: true) */
  schema?: boolean
  /** id da seção (p/ anchor do índice/ToC) */
  id?: string
}

const monoBadge: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
}

export function FaqInline({ items, title = 'Perguntas Frequentes', schema = true, id }: FaqInlineProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}
    >
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-primary"
          style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.22)' }}
        >
          <DSIcon name="helpCircle" size={18} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-950 sm:text-xl">{title}</h2>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i

          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 ${
                isOpen
                  ? 'border-emerald-500/25 bg-emerald-50/50 shadow-[0_0_24px_-6px_rgba(34,197,94,0.18)]'
                  : 'border-slate-200/80 bg-white hover:border-emerald-500/20 hover:bg-slate-50'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 sm:px-4 sm:py-4"
              >
                {/* Number indicator */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] transition-all duration-300"
                  style={
                    isOpen
                      ? { ...monoBadge, color: '#fff', background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 2px 8px -1px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }
                      : { ...monoBadge, color: '#64748b', background: '#f1f5f9' }
                  }
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className={`flex-1 text-sm font-semibold transition-colors duration-200 sm:text-base ${isOpen ? 'text-gray-950' : 'text-slate-700'}`}>
                  {item.question}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? 'border-transparent text-white shadow-[0_2px_10px_-2px_rgba(34,197,94,0.5)]'
                      : 'border-slate-300 text-slate-400'
                  }`}
                  style={isOpen ? { background: 'linear-gradient(135deg, #34e565, #16a34a)' } : undefined}
                >
                  {isOpen ? <DSIcon name="minus" size={14} /> : <DSIcon name="plus" size={14} />}
                </span>
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                className="grid transition-all duration-300"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-3.5 pb-4 pl-14 text-sm leading-relaxed text-slate-500 sm:px-4 sm:pl-14">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
