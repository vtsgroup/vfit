// ============================================
// page-hero.tsx — Hero de páginas internas (blog, termos, etc.)
// ============================================
//
// O que faz:
//   Hero padronizado para páginas de conteúdo estático (blog, legal, etc.).
//   Inclui Breadcrumbs no topo, título e subtítulo com tipografia pesada.
//   H1 (LCP element) renderiza direto no HTML estático — sem IntersectionReveal.
//   Breadcrumbs, badge e subtitle usam IntersectionReveal (client island).
//
// Perf: RSC — zero JS shipped para este componente.
//       H1 visível imediatamente no HTML estático → LCP < 0.5s.
//
// Exports principais:
//   PageHero — hero de página com breadcrumbs e título

import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/breadcrumbs'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'

/* ─── Typography ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

interface PageHeroProps {
  title: string
  subtitle?: string
  badge?: string
  breadcrumbs: BreadcrumbItem[]
}

export function PageHero({ title, subtitle, badge, breadcrumbs }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-bg-page pb-16 pt-32 sm:pb-20 sm:pt-40">
      {/* ── Background effects ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial mesh */}
        <div className="absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/4 blur-[120px]" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-brand-mint/3 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-bg-primary to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Breadcrumbs */}
        <IntersectionReveal animation="fade-in">
          <Breadcrumbs items={breadcrumbs} />
        </IntersectionReveal>

        {/* Badge */}
        {badge && (
          <IntersectionReveal animation="fade-in" delay={50}>
            <div className="mt-6">
              <span
                className="inline-block rounded-md border border-brand-primary/25 bg-brand-primary/8 px-3 py-1 text-[10px] text-brand-primary uppercase shadow-[0_0_12px_rgba(34,197,94,0.08)]"
                style={monoLabel}
              >
                {badge}
              </span>
            </div>
          </IntersectionReveal>
        )}

        {/* Title H1 — LCP element: render direto sem IntersectionReveal.
            CSS-only animation para fade-in suave sem depender de JS hydration. */}
        <h1
          className="mt-5 max-w-3xl text-white uppercase"
          style={{
            ...headingFont,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: '1.05',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <IntersectionReveal animation="fade-in" delay={150}>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {subtitle}
            </p>
          </IntersectionReveal>
        )}
      </div>

      {/* Gradient divider */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-linear-to-r from-transparent via-brand-primary/25 to-transparent" />
    </section>
  )
}
