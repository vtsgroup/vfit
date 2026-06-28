// ============================================
// article-kit.tsx — Kit de ARTIGO (tema CLARO, ultra moderno)
// ============================================
//
// O que faz:
//   Primitivos server-safe (RSC) para os artigos do blog na gramática clara da
//   home/índice do blog (light-section.tsx): banda bg-bg-landing-light com
//   atmosfera, coluna de leitura max-w-3xl, headings Syne gray-950, eyebrow pill
//   mint, cards branco→#eef1f7 com borda-gradiente verde no hover e callouts
//   semânticos (brand/amber/info) em versão clara. Centraliza tudo p/ os 7
//   artigos ficarem 100% coerentes. NÃO altera SEO/conteúdo — só estética.
//
// Exports principais:
//   ArticleShell — banda clara + coluna <article> max-w-3xl (wrapper da página)
//   ArticleH2    — eyebrow pill + heading Syne (substitui o label+h2 antigo)
//   Callout      — bloco destaque (tone: brand | amber | info)
//   SourceList   — caixa de fontes/referências (light card)
//   re-exports do light-section: lightCard, HoverEdge, greenChip, monoLabel,
//   pillPrimaryClass, PillSweep, PillArrow
import type { CSSProperties, ReactNode } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import {
  lightCard,
  greenChip,
  monoLabel,
  HoverEdge,
  pillPrimaryClass,
  PillSweep,
  PillArrow,
} from '@/components/shared/light-section'

export { lightCard, greenChip, monoLabel, HoverEdge, pillPrimaryClass, PillSweep, PillArrow }

/* ─── Banda clara + coluna de leitura (wrapper de cada artigo) ─── */
export function ArticleShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-bg-landing-light py-10 sm:py-14">
      {/* atmosfera (igual à home/índice do blog) */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0.3, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-brand-primary/5 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-lime-400/5 blur-[130px]" />
      <article className="relative z-10 mx-auto max-w-3xl space-y-12 px-5 pb-4 sm:px-6">
        {children}
      </article>
    </section>
  )
}

/* ─── Eyebrow pill mint + heading Syne (substitui label+h2 escuro) ─── */
export function ArticleH2({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      {eyebrow && (
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em]"
          style={{
            ...monoLabel,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 6px 16px -8px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{eyebrow}</span>
        </span>
      )}
      <h2 className="font-syne text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-[1.9rem]">
        {children}
      </h2>
    </div>
  )
}

/* ─── Callout semântico (brand verde / amber atenção / info) ─── */
type CalloutTone = 'brand' | 'amber' | 'info'

const CALLOUT: Record<CalloutTone, { wrap: string; chipBg: string; chipBorder: string; icon: string; title: string }> = {
  brand: {
    wrap: 'border-emerald-500/25 bg-emerald-50/70',
    chipBg: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))',
    chipBorder: 'rgba(34,197,94,0.22)',
    icon: 'text-emerald-600',
    title: 'text-emerald-900',
  },
  amber: {
    wrap: 'border-amber-400/40 bg-amber-50/80',
    chipBg: 'linear-gradient(180deg, rgba(245,158,11,0.16), rgba(245,158,11,0.05))',
    chipBorder: 'rgba(245,158,11,0.28)',
    icon: 'text-amber-600',
    title: 'text-amber-900',
  },
  info: {
    wrap: 'border-sky-400/35 bg-sky-50/70',
    chipBg: 'linear-gradient(180deg, rgba(14,165,233,0.16), rgba(14,165,233,0.05))',
    chipBorder: 'rgba(14,165,233,0.26)',
    icon: 'text-sky-600',
    title: 'text-sky-900',
  },
}

export function Callout({
  icon,
  title,
  tone = 'brand',
  children,
}: {
  icon: DSIconName
  title?: string
  tone?: CalloutTone
  children: ReactNode
}) {
  const t = CALLOUT[tone]
  return (
    <div className={`flex gap-4 rounded-2xl border p-5 ${t.wrap}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}
        style={{ background: t.chipBg, border: `1px solid ${t.chipBorder}` }}
      >
        <DSIcon name={icon} size={20} />
      </div>
      <div className="space-y-1 text-sm">
        {title && <p className={`font-bold ${t.title}`}>{title}</p>}
        <div className="leading-relaxed text-slate-600">{children}</div>
      </div>
    </div>
  )
}

/* ─── Caixa de fontes / referências (light card) ─── */
export function SourceList({ sources }: { sources: { label: string; url: string }[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6" style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -24px rgba(15,23,42,0.14)' }}>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-400" style={monoLabel}>
        Fontes e referências
      </h3>
      <ul className="space-y-2.5">
        {sources.map((s) => (
          <li key={s.url} className="flex items-start gap-2 text-sm">
            <DSIcon name="externalLink" size={14} className="mt-0.5 shrink-0 text-emerald-500/70" />
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-emerald-700 hover:decoration-emerald-500/40"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ─── Link de artigo (cor verde, contraste em fundo claro) ─── */
export const articleLinkClass =
  'font-medium text-emerald-700 underline decoration-emerald-600/30 underline-offset-2 transition-colors hover:decoration-emerald-600'

/* ─── Strong dentro do corpo (destaque escuro legível) ─── */
export const articleStrong: CSSProperties = { color: '#0f172a', fontWeight: 600 }
