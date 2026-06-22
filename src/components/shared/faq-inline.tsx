// ============================================
// faq-inline.tsx — Accordion de FAQ inline reutilizável
// ============================================
//
// O que faz:
//   Componente de FAQ em accordion para uso em qualquer página.
//   Abre/fecha via useState com animação de chevron rotacionado.
//   Aceita array de FaqItem (question + answer).
//
// Exports principais:
//   FaqItem — interface { question, answer }
//   FaqInline — accordion de FAQ reutilizável
'use client'

import { useState } from 'react'
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
}

export function FaqInline({ items, title = 'Perguntas Frequentes', schema = true }: FaqInlineProps) {
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
    <section className="rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-sm sm:p-8">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15">
          <DSIcon name="helpCircle" size={16} className="text-brand-primary" />
        </div>
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
      </div>

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isOpen = openIndex === i

          return (
            <div key={i} className={`rounded-xl transition-all duration-300 ${
              isOpen ? 'bg-brand-primary/4 ring-1 ring-brand-primary/15 shadow-[0_0_20px_rgba(16,185,129,0.06)]' : 'hover:bg-white/2'
            }`}>
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-xl sm:px-4 sm:py-4"
              >
                {/* Number indicator */}
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300 ${
                  isOpen
                    ? 'bg-brand-primary/15 text-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 text-white/60'
                }`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="flex-1 text-sm font-medium text-zinc-200 sm:text-base">
                  {item.question}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? 'border-brand-primary bg-brand-primary text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'border-white/10 text-zinc-400'
                  }`}
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
                  <p className="px-3.5 pb-4 pl-14 text-sm leading-relaxed text-zinc-300 sm:px-4 sm:pl-14">
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
