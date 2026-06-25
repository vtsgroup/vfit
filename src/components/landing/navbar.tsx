// ============================================
// navbar.tsx — Floating Glass Island Navbar (Ultra-Modern 2026)
// ============================================
//
// O que faz:
//   Navbar flutuante estilo "island" (Linear/Vercel/Arc) com glassmorphism real,
//   logo SVG (favicon oficial), nav pills com hover deslizante, mega menus
//   de vidro e CTAs redondos com varredura de brilho. Mobile: pill flutuante + menu glass.
//
// Exports principais:
//   Navbar — navbar responsiva da landing
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ================================================================
   NAV ITEMS — mega menu profissional com ícones DSIcon
   ================================================================ */
type NavDropdownItem = {
  label: string
  desc: string
  href: string
  icon: DSIconName
  tag?: string
}
type NavItem = {
  label: string
  href: string
  dropdown: NavDropdownItem[] | null
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Plataforma',
    href: '/#features',
    dropdown: [
      { label: 'Treinos com IA', desc: 'Plano personalizado para objetivo, nível e rotina', href: '/#features', icon: 'dumbbell' },
      { label: 'Personal online', desc: 'Acompanhamento profissional quando você precisar', href: '/#features', icon: 'users' },
      { label: 'Progresso por dados', desc: 'Evolução corporal, cargas e frequência no app', href: '/#features', icon: 'trendingUp' },
      { label: 'Gamificação & XP', desc: 'Streaks, rankings e badges para manter constância', href: '/#gamification', icon: 'trophy' },
      { label: 'Para profissionais', desc: 'Gestão, cobranças e IA para personal trainers', href: '/app-personal-trainer', icon: 'briefcase' },
    ],
  },
  {
    label: 'Recursos',
    href: '/#how-it-works',
    dropdown: [
      { label: 'Como Funciona', desc: 'Passo a passo da plataforma', href: '/#how-it-works', icon: 'arrowRight' },
      { label: 'Depoimentos', desc: 'Histórias de alunos e profissionais', href: '/#testimonials', icon: 'star' },
      { label: 'Blog', desc: 'Guias de treino, IA e constância', href: '/blog', icon: 'bookOpen', tag: 'Novo' },
    ],
  },
  { label: 'Preços', href: '/pricing', dropdown: null },
  { label: 'FAQ', href: '/#faq', dropdown: null },
  { label: 'Contato', href: '/contato', dropdown: null },
]

/* ================================================================
   BRAND LOGO — favicon oficial (V + sinal, quadrado verde)
   ================================================================ */
function BrandLogo({ size = 'md', onClick }: { size?: 'sm' | 'md'; onClick?: () => void }) {
  const chip = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const word = size === 'sm' ? 'text-[16px]' : 'text-[19px]'
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="VFIT — Início"
      className="group flex items-center gap-2.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
    >
      <span className="relative inline-flex items-center justify-center">
        {/* Marca real — V + sinal (favicon oficial) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicons/favicon.svg"
          alt=""
          className={`${chip} relative z-10 rounded-[9px] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-6`}
        />
        {/* ambient green glow on hover */}
        <span className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-brand-primary/55 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
      </span>
      <span className={`${word} font-black tracking-tight text-white`}>
        VFIT
      </span>
    </Link>
  )
}

/* ================================================================
   NAVBAR COMPONENT
   ================================================================ */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  // Increments every time the menu opens so the staggered entrance
  // animation re-triggers on each open (used as React key to remount rows).
  const [menuOpenSeq, setMenuOpenSeq] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setActiveDropdown(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Re-trigger the staggered entrance animation each time the menu opens.
  useEffect(() => {
    if (mobileOpen) setMenuOpenSeq((s) => s + 1)
  }, [mobileOpen])

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [mobileOpen])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    setMobileAccordion(null)
  }, [])

  return (
    <>
      {/* ===================================================================
          FLOATING ISLAND HEADER
          =================================================================== */}
      <header
        className="fixed inset-x-0 z-50 flex justify-center px-3 sm:px-4"
        style={{ top: 'calc(var(--demo-banner-offset, 0px) + 0.75rem)' }}
      >
        <nav
          aria-label="Navegação principal"
          className={`
            group/nav relative flex w-full max-w-5xl items-center justify-between gap-2
            rounded-2xl lg:rounded-full
            pl-4 pr-2.5 lg:pl-5 lg:pr-2
            transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
            ${scrolled ? 'h-13 lg:h-14' : 'h-14 lg:h-16'}
          `}
          style={{
            // Glass island — base navy translúcida (dá corpo p/ não sumir sobre
            // fundos claros) + brilho branco no topo (mantém o look de vidro).
            background: scrolled
              ? 'linear-gradient(180deg, rgba(7,12,22,0.82) 0%, rgba(7,12,22,0.74) 100%), linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)'
              : 'linear-gradient(180deg, rgba(7,12,22,0.70) 0%, rgba(7,12,22,0.60) 100%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(36px) saturate(200%)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: scrolled
              ? '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 40px -10px rgba(34,197,94,0.35)'
              : '0 12px 36px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {/* Top sheen highlight — sutil */}
          <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* ===== Left: Logo ===== */}
          <BrandLogo />

          {/* ===== Center: Nav pills with dropdowns ===== */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeDropdown === item.label
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Trigger pill */}
                  <a
                    href={item.href}
                    aria-haspopup={item.dropdown ? true : undefined}
                    aria-expanded={item.dropdown ? isActive : undefined}
                    onClick={() => {
                      trackLandingEvent('lp_cta_secondary_click', {
                        placement: 'navbar',
                        cta: item.label.toLowerCase().replace(/\s+/g, '_'),
                      })
                      setActiveDropdown(null)
                    }}
                    className={`
                      relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-bold tracking-wide
                      transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
                      ${isActive ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/8'}
                    `}
                  >
                    {item.label}
                    {item.dropdown && (
                      <DSIcon
                        name="chevronDown"
                        size={12}
                        className={`opacity-50 transition-transform duration-300 ${isActive ? 'rotate-180 text-emerald-300 opacity-100' : ''}`}
                      />
                    )}
                  </a>

                  {/* Dropdown — glass mega menu (figma sênior, limpo e largo) */}
                  {item.dropdown && isActive && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                      <div
                        className="relative w-96 rounded-2xl p-2"
                        style={{
                          // Frosted opaco — o nav pai anula o backdrop-filter, então
                          // garantimos legibilidade com alta opacidade + highlights de vidro.
                          background: 'linear-gradient(180deg, rgba(14,21,36,0.975) 0%, rgba(10,15,27,0.97) 100%)',
                          backdropFilter: 'blur(48px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          boxShadow: '0 28px 70px rgba(0,0,0,0.66), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)',
                          animation: 'navDropIn 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {/* Arrow notch */}
                        <span
                          className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-l border-t border-white/10"
                          style={{ background: 'rgb(15,22,37)' }}
                        />
                        {/* Glass highlight — luz frosted verde vinda do topo */}
                        <span
                          className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-2xl"
                          style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(34,197,94,0.10) 0%, transparent 70%)' }}
                        />
                        {/* Top sheen sutil */}
                        <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/16 to-transparent" />

                        {/* Category label */}
                        <div className="px-3 pt-1.5 pb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary/90"
                            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.dropdown.map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group/sub relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.055]"
                          >
                            <div
                              className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover/sub:scale-105"
                              style={{
                                background: 'linear-gradient(180deg, #1eb455 0%, #16a34a 58%, #138a3e 100%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(3,40,22,0.45), 0 4px 12px -4px rgba(34,197,94,0.5)',
                              }}
                            >
                              <DSIcon name={sub.icon} size={18} className="text-[#08122B] filter-[drop-shadow(0_1px_0_rgba(255,255,255,0.22))]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-white whitespace-nowrap">
                                  {sub.label}
                                </span>
                                {sub.tag && (
                                  <span className="rounded-md bg-brand-primary/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-primary">
                                    {sub.tag}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-snug text-white/55">{sub.desc}</p>
                            </div>
                            <DSIcon name="chevronRight" size={14} className="shrink-0 text-white/0 transition-all duration-200 group-hover/sub:text-brand-primary group-hover/sub:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ===== Right: Desktop actions ===== */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Entrar — Frosted Forte (vidro denso, brilho interno) */}
            <Link
              href="/login"
              onClick={() =>
                trackLandingEvent('lp_cta_secondary_click', { placement: 'navbar', cta: 'entrar_desktop' })
              }
              className="inline-flex h-10 items-center rounded-full px-5 text-[13px] font-black uppercase tracking-wide text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-px hover:brightness-125 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 18px -5px rgba(0,0,0,0.55)',
              }}
            >
              Entrar
            </Link>

            {/* Começar Grátis — gradient verde com sheen + chip seta diagonal */}
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', { placement: 'navbar', cta: 'comecar_gratis' })
                trackLandingEvent('lp_register_start', { placement: 'navbar' })
              }}
              className="group/cta relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full pl-5 pr-1.5 text-[13px] font-black uppercase tracking-wide text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.45)] transition-all duration-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
                boxShadow: '0 8px 20px -5px rgba(0,0,0,0.5), 0 4px 18px -2px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(6,78,59,0.45)',
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
              <span className="relative z-10">Começar Grátis</span>
              <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <DSIcon name="arrowRight" size={13} className="text-[#4ADE80] -rotate-45 transition-transform duration-300 group-hover/cta:rotate-0" />
              </span>
            </Link>
          </div>

          {/* ===== Mobile actions ===== */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {/* Compact gradient CTA */}
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', { placement: 'navbar_mobile', cta: 'comecar_gratis_mobile_header' })
                trackLandingEvent('lp_register_start', { placement: 'navbar_mobile' })
              }}
              className="group/cta relative inline-flex h-9 items-center gap-1 overflow-hidden rounded-full px-3.5 text-[11px] font-black uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.45)] active:scale-[0.96] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
                boxShadow: '0 6px 16px -4px rgba(0,0,0,0.5), 0 3px 14px -2px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.34)',
              }}
            >
              <DSIcon name="sparkles" size={12} />
              Grátis
            </Link>

            {/* Hamburger — glass button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-controls="mobile-menu-panel"
              aria-expanded={mobileOpen}
            >
              <span className={`block h-[1.5px] w-5 rounded-full bg-white origin-center [transition:transform_400ms_cubic-bezier(0.16,1,0.3,1),background-color_200ms] ${mobileOpen ? 'rotate-45 translate-y-1.75 bg-brand-primary' : ''}`} />
              <span className={`block h-[1.5px] w-5 rounded-full bg-white [transition:opacity_180ms_ease,transform_180ms_ease] ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-[1.5px] w-5 rounded-full bg-white origin-center [transition:transform_400ms_cubic-bezier(0.16,1,0.3,1),background-color_200ms] ${mobileOpen ? '-rotate-45 -translate-y-1.75 bg-brand-primary' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ===================================================================
          MOBILE SLIDE-IN MENU — Full height glass
          =================================================================== */}
      {/* Backdrop overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          background: 'rgba(5, 10, 18, 0.62)',
          backdropFilter: mobileOpen ? 'blur(10px)' : 'blur(0px)',
          WebkitBackdropFilter: mobileOpen ? 'blur(10px)' : 'blur(0px)',
          transition: mobileOpen
            ? 'opacity 450ms cubic-bezier(0.16,1,0.3,1), backdrop-filter 450ms cubic-bezier(0.16,1,0.3,1), -webkit-backdrop-filter 450ms cubic-bezier(0.16,1,0.3,1)'
            : 'opacity 300ms ease, backdrop-filter 300ms ease, -webkit-backdrop-filter 300ms ease',
        }}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!mobileOpen}
        className={`
          lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col
          ${mobileOpen ? 'visible translate-x-0 opacity-100 pointer-events-auto' : 'invisible translate-x-full opacity-0 pointer-events-none'}
        `}
        style={{
          transform: mobileOpen ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.99)',
          transformOrigin: 'right center',
          transition: mobileOpen
            ? 'transform 550ms cubic-bezier(0.16,1,0.3,1), opacity 350ms ease'
            : 'transform 380ms cubic-bezier(0.4,0,1,1), opacity 250ms ease, visibility 0s linear 380ms',
          background: 'rgba(8, 14, 26, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: mobileOpen ? '-16px 0 48px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <BrandLogo size="sm" onClick={closeMobile} />
          <button
            onClick={closeMobile}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/4 border border-white/8 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            aria-label="Fechar menu"
          >
            <DSIcon name="x" size={18} className="text-white/60" />
          </button>
        </div>

        {/* Scrollable nav items — key remounts on each open to re-trigger stagger */}
        <div
          key={menuOpenSeq}
          className={`flex-1 overflow-y-auto overscroll-contain px-4 py-4 ${mobileOpen ? 'menu-stagger' : ''}`}
        >
          <div className="space-y-1.5">
            {NAV_ITEMS.map((item, i) => (
              <div
                key={item.label}
                className="menu-stagger-item"
                style={{ '--stagger-index': i } as React.CSSProperties}
              >
                {item.dropdown ? (
                  <>
                    {/* Accordion trigger */}
                    <button
                      onClick={() => setMobileAccordion(mobileAccordion === item.label ? null : item.label)}
                      aria-expanded={mobileAccordion === item.label}
                      aria-controls={`mobile-accordion-${item.label}`}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 active:scale-[0.985] hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${mobileAccordion === item.label ? 'bg-white/6 text-white' : 'text-white/90'}`}
                    >
                      <span>{item.label}</span>
                      <DSIcon
                        name="chevronDown"
                        size={16}
                        className={`transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${mobileAccordion === item.label ? 'rotate-180 text-emerald-300' : 'text-white/60'}`}
                      />
                    </button>

                    {/* Accordion content */}
                    <div
                      id={`mobile-accordion-${item.label}`}
                      className="overflow-hidden"
                      style={{
                        maxHeight: mobileAccordion === item.label ? `${item.dropdown.length * 60 + 16}px` : '0px',
                        opacity: mobileAccordion === item.label ? 1 : 0,
                        transition: 'max-height 350ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease',
                      }}
                    >
                      <div className="ml-2 mr-2 mb-2 rounded-xl bg-white/2 border border-white/4 p-2">
                        {item.dropdown.map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={closeMobile}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 hover:bg-white/6 group"
                          >
                            <div
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all group-hover:scale-105"
                              style={{
                                background: 'linear-gradient(180deg, #1eb455 0%, #16a34a 58%, #138a3e 100%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 10px -4px rgba(34,197,94,0.5)',
                              }}
                            >
                              <DSIcon name={sub.icon} size={14} className="text-[#08122B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors truncate">
                                  {sub.label}
                                </span>
                                {sub.tag && (
                                  <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                                    {sub.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <DSIcon name="chevronRight" size={12} className="text-white/45 transition-all duration-200 group-hover:text-emerald-300 group-hover:translate-x-0.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => {
                      trackLandingEvent('lp_cta_secondary_click', {
                        placement: 'navbar_mobile',
                        cta: item.label.toLowerCase().replace(/\s+/g, '_'),
                      })
                      closeMobile()
                    }}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white/90 transition-all duration-200 active:scale-[0.985] hover:bg-white/8 hover:text-white group"
                  >
                    <span>{item.label}</span>
                    <DSIcon name="chevronRight" size={14} className="text-white/45 transition-all duration-200 group-hover:text-emerald-300 group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="menu-stagger-item my-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
            style={{ '--stagger-index': 5 } as React.CSSProperties}
          />

          {/* Quick links — MAIS group */}
          <div
            className="menu-stagger-item px-4 pb-2"
            style={{ '--stagger-index': 5 } as React.CSSProperties}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/55"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            >
              Mais
            </span>
          </div>
          <div className="space-y-0.5">
            <Link
              href="/blog"
              onClick={closeMobile}
              className="menu-stagger-item flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-white/85 transition-all duration-200 active:scale-[0.985] hover:text-white hover:bg-white/8 group"
              style={{ '--stagger-index': 6 } as React.CSSProperties}
            >
              <DSIcon name="bookOpen" size={16} className="text-white/55 group-hover:text-emerald-300 transition-colors" />
              Blog
            </Link>
            <Link
              href="/#about"
              onClick={closeMobile}
              className="menu-stagger-item flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-white/85 transition-all duration-200 active:scale-[0.985] hover:text-white hover:bg-white/8 group"
              style={{ '--stagger-index': 7 } as React.CSSProperties}
            >
              <DSIcon name="info" size={16} className="text-white/55 group-hover:text-emerald-300 transition-colors" />
              Sobre
            </Link>
          </div>
        </div>

        {/* Fixed bottom CTA buttons — premium action zone */}
        <div
          key={`cta-${menuOpenSeq}`}
          className={`relative shrink-0 px-5 py-5 ${mobileOpen ? 'menu-stagger' : ''}`}
          style={{
            background: 'linear-gradient(to top, rgba(8,14,26,0.98), rgba(8,14,26,0.90))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Brand accent glow line at the top of the action zone */}
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="flex flex-col gap-3">
            <Link
              href="/welcome"
              className="menu-stagger-item group/cta relative inline-flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[13px] font-black uppercase tracking-widest text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.45)] active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
              style={{
                '--stagger-index': 8,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                boxShadow: '0 10px 26px -5px rgba(0,0,0,0.5), 0 6px 22px -3px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.36), inset 0 -1px 0 rgba(6,78,59,0.45)',
              } as React.CSSProperties}
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', { placement: 'navbar_mobile', cta: 'comecar_gratis_mobile' })
                trackLandingEvent('lp_register_start', { placement: 'navbar_mobile' })
                closeMobile()
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
              <DSIcon name="sparkles" size={16} className="relative z-10" />
              <span className="relative z-10">Começar Grátis</span>
            </Link>
            <Link
              href="/login"
              className="menu-stagger-item inline-flex h-13 w-full items-center justify-center rounded-2xl text-[13px] font-black uppercase tracking-widest text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-200 hover:brightness-125 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              style={{
                '--stagger-index': 9,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px -4px rgba(0,0,0,0.5)',
              } as React.CSSProperties}
              onClick={() => {
                trackLandingEvent('lp_cta_secondary_click', { placement: 'navbar_mobile', cta: 'entrar_mobile' })
                closeMobile()
              }}
            >
              Entrar
            </Link>
          </div>
          <p
            className="menu-stagger-item mt-3 text-center text-[10px] text-white/70"
            style={{ '--stagger-index': 10 } as React.CSSProperties}
          >
            30 dias grátis, sem cartão de crédito
          </p>
        </div>
      </div>

      {/* Navbar animation keyframes */}
      <style jsx global>{`
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Mobile menu staggered entrance cascade. */
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .menu-stagger .menu-stagger-item {
          opacity: 0;
          will-change: transform, opacity;
          animation: menuItemIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(120ms + var(--stagger-index, 0) * 55ms);
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-stagger .menu-stagger-item {
            opacity: 1;
            transform: none;
            animation: none;
            animation-delay: 0ms;
          }
        }

        /* xs breakpoint for mobile header buttons */
        @media (min-width: 380px) {
          .xs\\:inline-flex { display: inline-flex !important; }
        }
      `}</style>
    </>
  )
}
