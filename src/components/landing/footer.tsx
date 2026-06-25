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
  { label: 'Instagram', href: 'https://www.instagram.com/vfitaplicativo', svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { label: 'Facebook', href: 'https://www.facebook.com/vfitaplicativo', svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vfitaplicativo', svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Vfitaplicativo', svgPath: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { label: 'X (Twitter)', href: 'https://x.com/Vfitaplicativo', svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'Threads', href: 'https://www.threads.com/@Vfitaplicativo', svgPath: 'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.331-3.082.881-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.749-1.757-.513-.586-1.308-.883-2.359-.89-.013 0-.025 0-.039 0-1.046 0-2.469.225-3.282 1.234l-1.51-1.013c.95-1.18 2.49-1.825 4.27-1.825a8.27 8.27 0 0 1 .057 0c1.62.011 2.92.477 3.864 1.387.853.821 1.348 1.987 1.474 3.471.072.03.143.062.213.094 1.232.579 2.134 1.456 2.607 2.534.659 1.503.72 3.954-1.276 5.909-1.531 1.499-3.391 2.174-6.027 2.193z' },
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

      {/* ══ Newsletter band — zona com gradiente próprio (diferencia do footer) ══ */}
      <div className="relative" style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 65%)' }}>
      <div className="relative mx-auto max-w-2xl px-5 pb-14 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-brand-primary" style={{ ...monoLabel, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
          </span>
          Newsletter
        </span>
        <h3 className="font-syne mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl">
          Pronto para treinar com um{' '}
          <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">plano claro?</span>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
          30 dias grátis, sem cartão. Receba novidades, dicas de treino e atualizações do produto direto no seu email.
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <div className="group relative flex-1">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              aria-label="Seu email"
              className="w-full rounded-full border border-white/12 bg-white/6 px-5 py-3 text-center text-sm text-white placeholder-white/35 transition-all duration-300 focus:border-brand-primary/45 focus:bg-white/10 focus:outline-none sm:text-left"
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
      </div>

      {/* Divisor gradiente — diferencia newsletter ↔ footer */}
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="h-px bg-linear-to-r from-transparent via-brand-primary/35 to-transparent" />
      </div>

      {/* ══ Main grid ══ */}
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-6 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="group inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicons/favicon.svg" alt="VFIT" width={48} height={48} className="h-12 w-12 rounded-xl shadow-[0_6px_20px_-6px_rgba(34,197,94,0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              <span className="text-2xl font-black tracking-tight text-white">VFIT</span>
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
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/55 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary">
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={s.svgPath} /></svg>
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

      {/* ══ Wordmark gigante (statement de marca) ══ */}
      <div aria-hidden="true" className="relative -mb-4 select-none overflow-hidden px-4 pt-6 sm:-mb-8">
        <div
          className="ftr-wordmark text-center font-syne font-black leading-[0.78] tracking-tighter"
          style={{
            fontSize: 'clamp(4.5rem, 21vw, 17rem)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(34,197,94,0.12) 55%, rgba(34,197,94,0) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          VFIT
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
