// ============================================
// navbar.tsx — Barra de navegação da landing page
// ============================================
//
// O que faz:
//   Navbar sticky com logo, mega menu de navegação e CTA de cadastro.
//   Blur backdrop ao scrollar (scrollY > 20).
//   Menu mobile full-height slide-in com scroll lock.
//   Tracking de cliques via trackLandingEvent.
//
// Exports principais:
//   Navbar — navbar responsiva da landing
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

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

function AnimatedLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 group shrink-0" aria-label="VFIT - Início">
      <div className="relative flex items-center gap-2.5">
        <Image
          src="/images/vfit-logo-white.svg"
          alt="VFIT"
          width={160}
          height={32}
          className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-7"
          style={{ width: 'auto', filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.34))' }}
          priority
        />
      </div>
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
      <header
        className={`
          fixed left-0 right-0 z-50 transition-all duration-500
          ${scrolled
            ? 'border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.36)] backdrop-blur-2xl'
            : 'border-b border-transparent shadow-none'
          }
        `}
        style={{
          top: 'var(--demo-banner-offset, 0px)',
          background: scrolled
            ? 'linear-gradient(180deg, rgba(5,10,18,0.96) 0%, rgba(11,18,33,0.90) 100%)'
            : 'linear-gradient(180deg, rgba(5,10,18,0.58) 0%, rgba(5,10,18,0.10) 100%)',
        }}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3 lg:px-6">

          {/* ===== Left: Animated Logo ===== */}
          <div className={`transition-all duration-500 ${scrolled ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.24)]' : ''}`}>
            <AnimatedLogo />
          </div>

          {/* ===== Separator ===== */}
          <div className="hidden lg:block h-5 w-px bg-white/10 mx-4 shrink-0" />

          {/* ===== Center: Nav links with dropdowns ===== */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {/* Trigger */}
                <a
                  href={item.href}
                  onClick={() => {
                    trackLandingEvent('lp_cta_secondary_click', {
                      placement: 'navbar',
                      cta: item.label.toLowerCase().replace(/\s+/g, '_'),
                    })
                    setActiveDropdown(null)
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium text-white/55 transition-all duration-200 hover:text-white hover:bg-white/5"
                >
                  {item.label}
                  {item.dropdown && (
                    <DSIcon
                      name="chevronDown"
                      size={12}
                      className={`opacity-40 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                    />
                  )}
                </a>

                {/* Dropdown panel — glass blur mega menu */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div
                      className="min-w-80 rounded-2xl border border-white/8 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset]"
                      style={{
                        background: 'rgba(10, 22, 40, 0.85)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        animation: 'navDropIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* Category label */}
                      <div className="px-3.5 pt-1.5 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60"
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
                          className="flex items-start gap-3 rounded-xl px-3.5 py-3 transition-all duration-150 hover:bg-white/6 group"
                        >
                          <div className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/4 ring-1 ring-white/8 transition-all duration-200 group-hover:bg-emerald-500/10 group-hover:ring-emerald-400/25 group-hover:shadow-[0_0_16px_rgba(34,197,94,0.18)]">
                            <DSIcon name={sub.icon} size={16} className="text-white/40 transition-colors group-hover:text-emerald-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-white/85 group-hover:text-white transition-colors">
                                {sub.label}
                              </span>
                              {sub.tag && (
                                <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                  {sub.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{sub.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ===== Right: Desktop Actions — DS primary/secondary ===== */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Entrar — DS outline button */}
            <Link
              href="/login"
              onClick={() =>
                trackLandingEvent('lp_cta_secondary_click', {
                  placement: 'navbar',
                  cta: 'entrar_desktop',
                })
              }
            >
              <Button variant="outline" size="sm" className="px-5 text-[13px] uppercase tracking-wide">
                Entrar
              </Button>
            </Link>
            {/* Começar Grátis — DS primary button */}
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', {
                  placement: 'navbar',
                  cta: 'comecar_gratis',
                })
                trackLandingEvent('lp_register_start', { placement: 'navbar' })
              }}
            >
              <Button variant="gradient" size="sm" className="px-5 text-[13px] uppercase tracking-wide">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* ===== Mobile: Login + Hamburger ===== */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Compact mobile CTA — 3D glass Entrar */}
            <Link
              href="/login"
              onClick={() =>
                trackLandingEvent('lp_cta_secondary_click', {
                  placement: 'navbar_mobile',
                  cta: 'entrar_mobile_header',
                })
              }
            >
              <Button variant="glass" size="sm" className="h-9 px-3 text-[11px] uppercase tracking-wider">
                <DSIcon name="logIn" size={13} />
                Entrar
              </Button>
            </Link>
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', {
                  placement: 'navbar_mobile',
                  cta: 'comecar_gratis_mobile_header',
                })
                trackLandingEvent('lp_register_start', { placement: 'navbar_mobile' })
              }}
              className="hidden xs:inline-flex"
            >
              <Button variant="gradient" size="sm" className="h-9 px-3 text-[11px] uppercase tracking-wider">
                Grátis
              </Button>
            </Link>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col justify-center items-center gap-1.5 p-2 -mr-2 rounded-lg transition-colors hover:bg-white/5"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-1.75' : ''}`} />
              <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-1.75' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ===== Mobile Slide-in Menu — Full height, backdrop blur ===== */}
      {/* Backdrop overlay */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transition-opacity duration-400
          ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{
          background: 'rgba(5, 10, 18, 0.60)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`
          lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col
          transition-transform duration-500
          ${mobileOpen ? 'visible translate-x-0 opacity-100 pointer-events-auto' : 'invisible translate-x-full opacity-0 pointer-events-none'}
        `}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
          background: 'rgba(8, 14, 26, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: mobileOpen ? '-16px 0 48px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <Link href="/" onClick={closeMobile} className="flex items-center gap-2">
            <Image
              src="/images/vfit-logo-white.svg"
              alt="VFIT"
              width={120}
              height={24}
              className="h-6 w-auto"
              style={{ width: 'auto', filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.28))' }}
            />
          </Link>
          <button
            onClick={closeMobile}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/4 border border-white/8 transition-colors hover:bg-white/8"
            aria-label="Fechar menu"
          >
            <DSIcon name="x" size={18} className="text-white/60" />
          </button>
        </div>

        {/* Scrollable nav items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    {/* Accordion trigger */}
                    <button
                      onClick={() => setMobileAccordion(mobileAccordion === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white/90 transition-all duration-200 hover:bg-white/8 hover:text-white"
                    >
                      <span>{item.label}</span>
                      <DSIcon
                        name="chevronDown"
                        size={16}
                        className={`text-white/60 transition-transform duration-300 ${mobileAccordion === item.label ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Accordion content */}
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: mobileAccordion === item.label ? `${item.dropdown.length * 60 + 16}px` : '0px',
                        opacity: mobileAccordion === item.label ? 1 : 0,
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
                            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 ring-1 ring-white/6 transition-all group-hover:bg-emerald-500/10 group-hover:ring-emerald-400/20">
                              <DSIcon name={sub.icon} size={14} className="text-white/40 group-hover:text-emerald-300 transition-colors" />
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
                            <DSIcon name="chevronRight" size={12} className="text-white/45 group-hover:text-white/70 transition-colors shrink-0" />
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
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-white/90 transition-all duration-200 hover:bg-white/8 hover:text-white group"
                  >
                    <span>{item.label}</span>
                    <DSIcon name="chevronRight" size={14} className="text-white/45 group-hover:text-white/70 transition-colors" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-white/6" />

          {/* Quick links */}
          <div className="px-4 pb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            >
              Mais
            </span>
          </div>
          <div className="space-y-0.5">
            <Link href="/blog" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-white/85 hover:text-white hover:bg-white/8 transition-all">
              <DSIcon name="bookOpen" size={16} className="text-white/60" />
              Blog
            </Link>
            <Link href="/#about" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-white/85 hover:text-white hover:bg-white/8 transition-all">
              <DSIcon name="info" size={16} className="text-white/60" />
              Sobre
            </Link>
          </div>
        </div>

        {/* Fixed bottom CTA buttons */}
        <div className="shrink-0 px-5 py-5 border-t border-white/6"
          style={{
            background: 'linear-gradient(to top, rgba(8,14,26,0.98), rgba(8,14,26,0.90))',
          }}
        >
          <div className="flex flex-col gap-3">
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', {
                  placement: 'navbar_mobile',
                  cta: 'comecar_gratis_mobile',
                })
                trackLandingEvent('lp_register_start', { placement: 'navbar_mobile' })
                closeMobile()
              }}
            >
              <Button variant="gradient" size="lg" className="w-full text-[13px] uppercase tracking-widest">
                <DSIcon name="sparkles" size={16} />
                Começar Grátis
              </Button>
            </Link>
            <Link
              href="/login"
              onClick={() => {
                trackLandingEvent('lp_cta_secondary_click', {
                  placement: 'navbar_mobile',
                  cta: 'entrar_mobile',
                })
                closeMobile()
              }}
            >
              <Button variant="outline" size="lg" className="w-full text-[13px] uppercase tracking-widest">
                Entrar
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/20">
            Sem cartão de crédito necessário
          </p>
        </div>
      </div>

      {/* Navbar animation keyframes */}
      <style jsx global>{`
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes navCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* xs breakpoint for mobile header buttons */
        @media (min-width: 380px) {
          .xs\\:inline-flex { display: inline-flex !important; }
        }
      `}</style>
    </>
  )
}
