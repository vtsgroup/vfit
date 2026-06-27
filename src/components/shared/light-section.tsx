// ============================================
// light-section.tsx — Kit de SEÇÃO CLARA (banda landing-light)
// ============================================
//
// O que faz:
//   Primitivos server-safe (RSC, sem 'use client') que reproduzem a gramática
//   das seções de conteúdo claras da home (features/about/FAQ) e das páginas já
//   aprovadas (/contato, /blog): banda bg-bg-landing-light com atmosfera, cards
//   branco→#eef1f7 com borda-gradiente verde no hover, eyebrow pill mint, heading
//   gray-950 + palavra-acento em gradiente, chips de ícone verdes, listas com
//   check verde e pills de CTA. Centraliza tokens p/ todas as páginas ICP ficarem
//   100% coerentes.
//
// Exports principais:
//   tokens: headingFont, monoLabel, lightCard, greenChip
//   componentes: LightBand, SectionHead, FeatureCard, CheckItem, HoverEdge, PillArrow
//   classes de CTA: pillPrimaryClass, pillGhostClass
import type { CSSProperties, ReactNode } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ─── Tokens ─── */
export const headingFont: CSSProperties = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '0',
}
export const monoLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}
export const lightCard: CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #eef1f7 100%)',
  border: '1px solid rgba(15,23,42,0.09)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -22px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
}
export const greenChip: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))',
  border: '1px solid rgba(34,197,94,0.22)',
}

/* ─── Classes de CTA (TrackedCtaLink só aceita className) ─── */
// Pill primário verde — mesma receita do "Visite nosso blog" da home (shimmer via <PillSweep/>)
export const pillPrimaryClass =
  'group/cta relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full pl-6 pr-2.5 text-[13px] font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] bg-[linear-gradient(135deg,#34e565_0%,#22c55e_52%,#16a34a_100%)] shadow-[0_12px_28px_-8px_rgba(34,197,94,0.55),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(6,78,59,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50'
export const pillGhostClass =
  'inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-[13px] font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:text-emerald-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40'

/* Badge verde da home (gradiente + borda suave + glow + inset highlight) */
export const badgeStyle: CSSProperties = {
  ...monoLabel,
  background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
  border: '1px solid rgba(20,120,60,0.28)',
  boxShadow: '0 2px 8px -1px rgba(34,197,94,0.42), inset 0 1px 0 rgba(255,255,255,0.45)',
}

/* Shimmer que varre o pill no hover (filho do pill) */
export function PillSweep() {
  return <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
}

/* Chip navy com seta — usado dentro do pill primário (acima do sweep) */
export function PillArrow({ icon = 'arrowRight' }: { icon?: DSIconName }) {
  return (
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
      <DSIcon name={icon} size={14} className="text-[#4ADE80] transition-transform duration-300 group-hover/cta:translate-x-0.5" />
    </span>
  )
}

/* ─── Borda-gradiente verde + hairline (CSS-only, group-hover) ─── */
export function HoverEdge({ rounded = 'rounded-2xl' }: { rounded?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.06), transparent 60%)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(132,204,22,0.2) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </>
  )
}

/* ─── Banda clara full-bleed (atmosfera igual à home) ─── */
export function LightBand({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-bg-landing-light py-16 sm:py-24 ${className}`}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.3, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-brand-primary/5 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 rounded-full bg-lime-400/5 blur-[130px]" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-14 px-6 sm:space-y-20">{children}</div>
    </section>
  )
}

/* ─── Eyebrow pill + heading com palavra-acento em gradiente ─── */
export function SectionHead({
  icon,
  eyebrow,
  lead,
  accent,
  sub,
  center = false,
}: {
  icon: DSIconName
  eyebrow: string
  lead: string
  accent?: string
  sub?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] ${center ? 'mx-auto' : ''}`}
        style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.32)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)' }}
      >
        <DSIcon name={icon} size={13} className="text-brand-primary" />
        <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{eyebrow}</span>
      </span>
      <h2 className="mt-5 font-black leading-[0.98] tracking-[-0.02em] text-gray-950" style={{ ...headingFont, fontSize: 'clamp(1.9rem, 4vw, 2.85rem)' }}>
        {lead}
        {accent ? <> <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">{accent}</span></> : null}
      </h2>
      {sub && <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-[15px]">{sub}</p>}
    </div>
  )
}

/* ─── Card de feature (ícone verde + título + conteúdo) ─── */
export function FeatureCard({ icon, title, children }: { icon: DSIconName; title: string; children: ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
      <HoverEdge />
      <span className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-brand-primary" style={greenChip}>
        <DSIcon name={icon} size={20} />
      </span>
      <h3 className="relative font-syne text-base font-black tracking-tight text-gray-950">{title}</h3>
      <div className="relative mt-2 text-sm leading-relaxed text-slate-500">{children}</div>
    </div>
  )
}

/* ─── Item de lista com check verde ─── */
export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 2px 6px -1px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.4)' }}
      >
        <DSIcon name="check" size={12} />
      </span>
      <span>{children}</span>
    </li>
  )
}
