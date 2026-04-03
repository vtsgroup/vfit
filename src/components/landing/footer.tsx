// ============================================
// footer.tsx — Rodapé da landing page
// ============================================
//
// O que faz:
//   Rodapé com logo, colunas de links (Produto, Legal, Suporte),
//   redes sociais e créditos legais.
//   Links internos via Next.js Link + links externos com target=_blank.
//
// Exports principais:
//   Footer — rodapé completo da landing
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

/* ─── Typography — consistent with all sections ─── */
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

/* ─── Link columns ─── */
const FOOTER_LINKS = {
  Produto: [
    { label: 'Recursos', href: '/#features' },
    { label: 'Planos e Preços', href: '/pricing' },
    { label: 'Depoimentos', href: '/#testimonials' },
    { label: 'Gamificação', href: '/#gamification' },
    { label: 'Blog', href: '/blog' },
  ],
  Recursos: [
    { label: 'Central de Ajuda', href: '/contato' },
    { label: 'Como Funciona', href: '/#features' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Status do Sistema', href: 'https://www.cloudflarestatus.com', external: true },
  ],
  Empresa: [
    { label: 'Sobre Nós', href: '/#about' },
    { label: 'Carreiras', href: '/carreiras' },
    { label: 'Contato', href: '/contato' },
  ],
  Legal: [
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'LGPD', href: '/lgpd' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Excluir Conta', href: '/excluir-conta' },
  ],
}

/* ─── Social links ─── */
const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/vfit.app',
    icon: 'instagram' as DSIconName,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/vfit_app',
    // Lucide doesn't have X/Twitter icon — use inline SVG path
    svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/vfit',
    svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]

/* ─── Trust badges ─── */
const TRUST_ITEMS = [
  { icon: 'shield' as DSIconName, label: 'CREF Verificado' },
  { icon: 'lock' as DSIconName, label: 'SSL Criptografado' },
  { icon: 'flame' as DSIconName, label: 'LGPD Conforme' },
]

/* ─── Back to top ─── */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-bg-page">
      {/* ── Gradient separator from previous section ── */}
      <div className="absolute -top-px left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/30 to-transparent" />

      {/* ══════════════════════════════════════════════
          TOP BAND — Mini CTA
          ══════════════════════════════════════════════ */}
      <div className="bg-brand-primary">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row sm:gap-6 sm:px-6 sm:py-12">
          <div>
            <h3
              className="text-lg font-black tracking-tight text-bg-primary sm:text-xl"
              style={{ fontFamily: headingFont.fontFamily }}
            >
              Pronto para revolucionar seu negócio?
            </h3>
            <p className="mt-1 text-sm text-bg-primary/80">
              Comece grátis. Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
          <Link href="/register/personal">
            <Button variant="secondary" size="lg" className="px-7 text-sm uppercase" style={monoLabel}>
              <DSIcon name="dumbbell" size={16} />
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MAIN FOOTER
          ══════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-6 lg:gap-12">
          {/* ── Brand column (spans 2) ── */}
          <div className="col-span-2">
            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <Image
                src="/images/logo-transparent-96.webp"
                alt="VFIT"
                width={36}
                height={36}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              {/* + as circular icon badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.55)',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.8)',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                +
              </span>
              <span className="text-2xl font-black tracking-tight text-white" style={headingFont}>PERSONAL</span>
            </Link>

            {/* Description */}
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              A plataforma mais completa para personal trainers. Crie treinos com IA, gerencie alunos e automatize cobranças.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:contato@iapersonal.app.br"
                className="flex items-center gap-2.5 text-xs text-white/70 transition-colors duration-200 hover:text-brand-primary"
              >
                                <DSIcon name="mail" size={14} />
                contato@iapersonal.app.br
              </a>
              <span className="flex items-center gap-2.5 text-xs text-white/70">
                                <DSIcon name="mapPin" size={14} />
                São Paulo, Brasil
              </span>
            </div>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 text-white/50 transition-all duration-200 hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                  aria-label={social.label}
                >
                  {'icon' in social && social.icon ? (
                    <DSIcon name={social.icon} size={16} />
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.svgPath} />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns (4 cols) ── */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p
                className="mb-5 text-[10px] text-white/70 uppercase"
                style={monoLabel}
              >
                {title}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                      {'external' in link && link.external && (
                                                <DSIcon name="externalLink" size={12} className="text-white/25" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TRUST BADGES BAR
          ══════════════════════════════════════════════ */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 md:gap-10">
          {TRUST_ITEMS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/60 sm:gap-2">
              <DSIcon name={icon} size={14} className="text-brand-primary/60 sm:size-4" />
              <span className="text-[9px] uppercase sm:text-[10px]" style={monoLabel}>{label}</span>
            </div>
          ))}
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 text-white/60 sm:gap-2">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500" />
            </span>
            <span className="text-[9px] uppercase sm:text-[10px]" style={monoLabel}><span className="hidden sm:inline">Sistemas </span>Online</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM BAR
          ══════════════════════════════════════════════ */}
      <div className="border-t border-white/5 bg-[#030810]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:gap-4 sm:px-6 sm:py-5">
          {/* Copyright */}
          <p className="text-[10px] text-white/50" style={monoLabel}>
            © {year} VFIT — VTS DEVELOPMENT
          </p>

          {/* Made with love */}
          <p className="flex items-center gap-1.5 text-[10px] text-white/50" style={monoLabel}>
            FEITO COM <DSIcon name="heart" size={12} className="text-red-400/60" /> NO BRASIL
          </p>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-[10px] text-white/50 transition-colors duration-200 hover:text-brand-primary"
            style={monoLabel}
            aria-label="Voltar ao topo"
          >
            VOLTAR AO TOPO
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/4 transition-all duration-200 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <DSIcon name="arrowUp" size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
