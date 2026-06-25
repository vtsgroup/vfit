// ============================================
// footer.tsx — Rodapé premium da landing
// ============================================
//
// O que faz:
//   Rodapé moderno: aurora animada, wordmark gigante, captura de newsletter,
//   colunas de links com micro-interação, status "ao vivo", trust + bottom bar.
//
// Exports principais:
//   Footer — rodapé completo da landing
'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

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

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/vfitapp', icon: 'instagram' as DSIconName },
  { label: 'X (Twitter)', href: 'https://x.com/vfit_app', svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/vfit', svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
]

const TRUST_ITEMS = [
  { icon: 'shield' as DSIconName, label: 'Dados Protegidos' },
  { icon: 'lock' as DSIconName, label: 'SSL Criptografado' },
  { icon: 'shieldCheck' as DSIconName, label: 'LGPD Conforme' },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3500)
  }

  return (
    <footer className="relative overflow-hidden bg-bg-page" aria-label="Rodapé">
      {/* Aurora animada + grid */}
      <div aria-hidden="true" className="ftr-aurora pointer-events-none absolute -top-32 left-1/2 h-96 w-[120%] -translate-x-1/2 opacity-50" style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(34,197,94,0.18), transparent 70%)', filter: 'blur(40px)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'linear-gradient(to bottom, black, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)' }} />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent" />

      {/* ══ CTA + Newsletter band ══ */}
      <div className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h3 className="font-syne text-3xl font-black leading-[1.02] tracking-tight text-white sm:text-4xl">
              Pronto para treinar com um{' '}
              <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">plano claro?</span>
            </h3>
            <p className="mt-3 max-w-md text-sm text-white/55">
              30 dias grátis, sem cartão. Receba novidades, dicas de treino e atualizações do produto direto no seu email.
            </p>
            <form onSubmit={onSubmit} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="group relative flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  aria-label="Seu email"
                  className="w-full rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white placeholder-white/35 transition-all duration-300 focus:border-brand-primary/45 focus:bg-white/10 focus:outline-none"
                  style={{ backdropFilter: 'blur(16px)' }}
                />
              </div>
              <button
                type="submit"
                className="group/sub relative inline-flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[12px] font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-px active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)', boxShadow: '0 10px 26px -8px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.45)' }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/sub:translate-x-[120%]" />
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  {sent ? <><DSIcon name="check" size={14} /> Enviado</> : <>Inscrever <DSIcon name="arrowRight" size={13} /></>}
                </span>
              </button>
            </form>
          </div>

          {/* Wordmark gigante */}
          <div aria-hidden="true" className="relative hidden justify-end lg:flex">
            <span className="ftr-wordmark select-none font-syne text-[7rem] font-black leading-none tracking-tighter xl:text-[9rem]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(34,197,94,0.10))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>VFIT</span>
          </div>
        </div>
      </div>

      {/* ══ Main grid ══ */}
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-6 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicons/favicon.svg" alt="VFIT" width={36} height={36} className="h-9 w-9 rounded-[9px] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6" />
              <span className="text-xl font-black tracking-tight text-white">VFIT</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
              App de treinos com personal online, IA, evolução por dados e gamificação para manter constância.
            </p>
            <div className="mt-6 space-y-2.5">
              <a href="mailto:contato@vfit.app.br" className="flex items-center gap-2.5 text-xs text-white/65 transition-colors duration-200 hover:text-brand-primary">
                <DSIcon name="mail" size={14} /> contato@vfit.app.br
              </a>
              <span className="flex items-center gap-2.5 text-xs text-white/65"><DSIcon name="mapPin" size={14} /> São Paulo, Brasil</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-white/55 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary">
                  {'icon' in s && s.icon ? <DSIcon name={s.icon} size={16} /> : <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={s.svgPath} /></svg>}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-5 text-[10px] uppercase text-white/70" style={monoLabel}>{title}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group/link inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-200 hover:text-white">
                      <span className="h-px w-0 bg-brand-primary transition-all duration-200 group-hover/link:w-3" />
                      {link.label}
                      {'external' in link && link.external && <DSIcon name="externalLink" size={11} className="text-white/40" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Status + Trust ══ */}
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-5 sm:gap-x-10 sm:px-6">
          {TRUST_ITEMS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/60">
              <DSIcon name={icon} size={14} className="text-brand-primary/60" />
              <span className="text-[9px] uppercase sm:text-[10px]" style={monoLabel}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-white/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[9px] uppercase sm:text-[10px]" style={monoLabel}>Sistemas Online</span>
          </div>
        </div>
      </div>

      {/* ══ Bottom bar ══ */}
      <div className="relative border-t border-white/5 bg-bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-[10px] text-white/50" style={monoLabel}>© {year} VFIT — VTS GROUP</p>
          <p className="flex items-center gap-1.5 text-[10px] text-white/50" style={monoLabel}>
            FEITO COM <DSIcon name="heart" size={12} className="text-red-400/60" /> NO BRASIL
          </p>
          <button onClick={scrollToTop} className="group flex items-center gap-2 text-[10px] text-white/50 transition-colors duration-200 hover:text-brand-primary" style={monoLabel} aria-label="Voltar ao topo">
            VOLTAR AO TOPO
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10">
              <DSIcon name="arrowUp" size={14} />
            </span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ftrAurora { 0%, 100% { opacity: 0.45; transform: translateX(-50%) scale(1); } 50% { opacity: 0.65; transform: translateX(-50%) scale(1.08); } }
        .ftr-aurora { animation: ftrAurora 10s ease-in-out infinite; will-change: opacity, transform; }
        @keyframes ftrFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .ftr-wordmark { animation: ftrFloat 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ftr-aurora, .ftr-wordmark { animation: none; } }
      `}</style>
    </footer>
  )
}
