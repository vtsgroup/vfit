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
    <section className="relative overflow-hidden bg-bg-landing-light pb-10 pt-24 sm:pb-14 sm:pt-28">
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
export function ArticleH2({ id, eyebrow, children }: { id?: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div id={id} className="space-y-3 scroll-mt-24">
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

/* ─── Resumo rápido / pontos-chave (answer-first p/ GEO) ─── */
// Bloco escaneável no topo do artigo. Formato de lista direta → fácil de extrair
// por motores generativos (ChatGPT/Perplexity) e ótimo p/ featured snippets.
export function KeyTakeaways({ title = 'Resumo rápido', points }: { title?: string; points: string[] }) {
  return (
    <aside
      className="rounded-2xl border border-emerald-500/20 p-5 sm:p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(236,253,243,0.7) 0%, rgba(255,255,255,0.9) 100%)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 44px -26px rgba(34,197,94,0.3)',
      }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600" style={greenChip}>
          <DSIcon name="sparkles" size={18} />
        </span>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700/80" style={monoLabel}>
            TL;DR
          </span>
          <h2 className="font-syne text-lg font-black leading-tight tracking-tight text-gray-950">{title}</h2>
        </div>
      </div>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-slate-700">
            <span
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 2px 6px -1px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}
            >
              <DSIcon name="check" size={12} />
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/* ─── Índice / Sumário (anchor links) — UX + SEO (jump links / sitelinks) ─── */
export function TableOfContents({ items, title = 'Neste artigo' }: { items: { id: string; label: string }[]; title?: string }) {
  if (!items.length) return null
  return (
    <nav
      aria-label="Índice do artigo"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -26px rgba(15,23,42,0.14)' }}
    >
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400" style={monoLabel}>
        <DSIcon name="menu" size={14} className="text-emerald-500" />
        {title}
      </p>
      <ol className="space-y-0.5">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-emerald-50/70 hover:text-emerald-700"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white" style={monoLabel}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-medium">{it.label}</span>
              <DSIcon name="arrowRight" size={13} className="ml-auto shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ─── Tabela comparativa premium (coluna "vencedora" destacada em verde) ─── */
export function ArticleTable({
  head,
  rows,
  highlight,
  caption,
}: {
  head: string[]
  rows: string[][]
  /** índice (0-based) da coluna vencedora — default: última */
  highlight?: number
  caption?: string
}) {
  const win = highlight ?? head.length - 1
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 44px -26px rgba(15,23,42,0.18)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-slate-200" style={{ background: 'linear-gradient(180deg,#f8fafc,#ffffff)' }}>
              {head.map((h, i) => {
                const isWin = i === win
                return (
                  <th
                    key={i}
                    scope="col"
                    className={`px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider ${
                      isWin ? 'text-emerald-700' : i === 0 ? 'text-slate-600' : 'text-slate-400'
                    } ${isWin ? 'bg-emerald-50/70' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isWin && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <DSIcon name="check" size={10} />
                        </span>
                      )}
                      {h}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                {row.map((cell, c) => {
                  const isWin = c === win
                  return (
                    <td
                      key={c}
                      className={`px-4 py-3.5 align-top ${
                        c === 0 ? 'font-semibold text-slate-800' : isWin ? 'font-medium text-emerald-900' : 'text-slate-500'
                      } ${isWin ? 'bg-emerald-50/50' : ''}`}
                    >
                      {isWin && c !== 0 ? (
                        <span className="flex items-start gap-1.5">
                          <DSIcon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                          <span>{cell}</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
