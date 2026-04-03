/**
 * src/components/layout/header.tsx
 *
 * Header — DS v3 Navbar
 *
 * Exports: Header
 * Hooks: useState, useEffect, usePathname, useAppStore, useAuthStore, useEffectiveUserView
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Header — DS v3 Navbar
// Desktop: Logo icon + Page title + Breadcrumbs | Search | Theme | Messages | Bell | User pill | Logout
// Mobile: Logo icon + Page title | Bell | Avatar | Hamburger
// v4.1 — Compact with breadcrumbs
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn, getShortName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
// simulation pills moved to sidebar
// import { useUpdateAdminSimulationSession } from '@/hooks/use-admin'
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'
import { useUnreadCount } from '@/hooks/use-student-app'

/* ─── Route → title mapping ─── */
const ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/students': 'Alunos',
  '/dashboard/students/view': 'Detalhes do Aluno',
  '/dashboard/students/edit': 'Editar Aluno',
  '/dashboard/students/invite': 'Convidar Aluno',
  '/dashboard/students/import': 'Importar Alunos',
  '/dashboard/students/assessment/new': 'Nova Avaliação',
  '/dashboard/workouts': 'Treinos',
  '/dashboard/workouts/create': 'Criar Treino',
  '/dashboard/workouts/view': 'Detalhes do Treino',
  '/dashboard/workouts/execute': 'Executar Treino',
  '/dashboard/workouts/exercises/create': 'Criar Exercício',
  '/dashboard/workouts/exercises/library': 'Biblioteca de Exercícios',
  '/dashboard/workouts/media/library': 'Biblioteca de Mídia',
  '/dashboard/assessments': 'Avaliações Físicas',
  '/dashboard/assessments/create': 'Nova Avaliação',
  '/dashboard/assessments/view': 'Detalhes da Avaliação',
  '/dashboard/assessments/success-detail': 'Resultado da Avaliação',
  '/dashboard/calendar': 'Agenda',
  '/dashboard/financeiro': 'Dashboard Financeiro',
  '/dashboard/payments': 'Cobranças',
  '/dashboard/payments/create': 'Nova Cobrança',
  '/dashboard/payments/view': 'Detalhes do Pagamento',
  '/dashboard/payments/checkout': 'Checkout',
  '/dashboard/payments/withdraw': 'Sacar',
  '/dashboard/affiliates': 'Afiliados',
  '/dashboard/marketplace': 'Marketplace',
  '/dashboard/marketplace/create': 'Criar Anúncio',
  '/dashboard/marketplace/view': 'Detalhes do Anúncio',
  '/dashboard/ai': 'IA Assistente',
  '/dashboard/messages': 'Mensagens',
  '/dashboard/notifications': 'Notificações',
  '/dashboard/logs': 'Logs',
  '/dashboard/settings': 'Configurações',
  '/dashboard/profile': 'Meu Perfil',
  '/dashboard/complete-profile': 'Completar Perfil',
  '/dashboard/onboarding': 'Configuração Inicial',
  '/dashboard/admin': 'Painel Admin',
  '/dashboard/admin/users': 'Usuários',
  '/dashboard/admin/personals': 'Personals',
  '/dashboard/admin/workouts': 'Treinos (Admin)',
  '/dashboard/admin/payments': 'Pagamentos (Admin)',
  '/dashboard/admin/feedback': 'Sugestões',
  '/dashboard/admin/smoke': 'Smoke Tests',
  '/dashboard/plans': 'Planos',
}

function getPageTitle(pathname: string): string {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname]
  const parts = pathname.split('/')
  while (parts.length > 2) {
    parts.pop()
    const shorter = parts.join('/')
    if (ROUTE_MAP[shorter]) return ROUTE_MAP[shorter]
  }
  return 'Dashboard'
}

interface BreadcrumbItem { label: string; href?: string }

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/dashboard') return []
  const segments = pathname.replace('/dashboard/', '').split('/')
  const crumbs: BreadcrumbItem[] = []
  let currentPath = '/dashboard'
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i]
    const label = ROUTE_MAP[currentPath]
    if (label) crumbs.push({ label, href: currentPath })
  }
  // Remove last crumb — it's already shown as <h1> page title below
  if (crumbs.length > 0) crumbs.pop()
  return crumbs
}

export function Header() {
  const pathname = usePathname()
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const { isPersonalView, isStudentView, hasAdminCapabilities, isSimulationActive, effectiveType } = useEffectiveUserView()

  const { data: unread } = useUnreadCount()
  const unreadCount = unread?.unread_count ?? 0

  const pageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumbs(pathname)

  // Scroll detection for progressive shadow
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const shortName = user?.full_name ? getShortName(user.full_name) : ''

  return (
    <header
      className={cn(
        'ds3-header fixed right-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300',
        collapsed ? 'lg:left-18' : 'lg:left-65',
        'left-0',
        scrolled && 'ds3-header-scrolled'
      )}
      style={{
        top: 'var(--demo-banner-offset, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ═══ DS v3 NAVBAR ═══ */}
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">

        {/* ── LEFT: Breadcrumbs + Page title + Search ── */}
        <div className="flex items-center gap-3 min-w-0 flex-1 lg:gap-5">
          {/* Page title + breadcrumbs */}
          <div className="min-w-0 flex flex-col justify-center">
            {/* Breadcrumbs — always visible: 🏠 > Section > Sub-page */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-0.5">
              <Link href="/dashboard" className="text-text-muted hover:text-brand-primary transition-colors shrink-0">
                <DSIcon name="home" size={14} />
              </Link>
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <DSIcon name="chevronRight" size={10} className="text-text-secondary/40 shrink-0" />
                    <Link href={item.href!}
                      className="text-xs font-medium text-text-muted hover:text-brand-primary transition-colors truncate max-w-32">
                      {item.label}
                    </Link>
                  </span>
                ))
              ) : (
                pathname !== '/dashboard' && (
                  <>
                    <DSIcon name="chevronRight" size={10} className="text-text-secondary/40 shrink-0" />
                    <span className="text-xs font-medium text-text-secondary truncate max-w-32">
                      {pageTitle}
                    </span>
                  </>
                )
              )}
            </nav>
            <h1 className="text-sm font-bold tracking-tight text-text-primary truncate lg:text-base">{pageTitle}</h1>
          </div>

          {/* Search — desktop only, inline (DS v3 style) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden items-center gap-3 ml-4 lg:flex group cursor-pointer"
          >
            <DSIcon name="search" size={16} className="text-text-muted group-hover:text-brand-primary transition-colors" />
            <span className="text-[13px] text-text-muted">Buscar...</span>
            <div className="flex gap-1 ml-2">
              <kbd className="rounded-[5px] border border-border-light bg-bg-tertiary px-1.5 py-0.5 text-[11px] text-text-muted"
                style={{ fontFamily: 'inherit' }}>⌘</kbd>
              <kbd className="rounded-[5px] border border-border-light bg-bg-tertiary px-1.5 py-0.5 text-[11px] text-text-muted"
                style={{ fontFamily: 'inherit' }}>K</kbd>
            </div>
          </button>
        </div>

        {/* ── RIGHT: Actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Email — desktop + mobile */}
          <Link
            href="/dashboard/notifications"
            className="ds3-action-btn hidden sm:flex"
            title="E-mail"
            aria-label="Notificações por e-mail"
          >
            <DSIcon name="mail" size={16} />
          </Link>

          {/* Messages — desktop + mobile */}
          <Link
            href="/dashboard/messages"
            className="ds3-action-btn hidden sm:flex"
            title="Mensagens"
            aria-label="Mensagens do chat"
          >
            <DSIcon name="message" size={16} />
          </Link>

          {/* Bell — with absolute positioned badge */}
          <div className="relative">
            <Link
              href="/dashboard/notifications"
              className="ds3-action-btn flex"
              title={unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Notificações'}
              aria-label={unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Notificações'}
            >
              <DSIcon name="bell" size={16} />
            </Link>
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white border-2 border-bg-page notification-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>

          {/* Separator — desktop only */}
          <div className="hidden lg:block h-6 w-px bg-border-light mx-1" />

          {/* User pill — desktop only (plan badge overlay on avatar) */}
          <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-border-light/50 bg-bg-secondary/50 py-1 pl-1 pr-2.5">
            <AvatarWithPlanBadge
              src={user?.avatar_url}
              name={user?.full_name || 'U'}
              size="sm"
              linkToPlans
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text-primary truncate max-w-24 leading-tight">{shortName}</span>
              <span className="text-[10px] font-semibold text-brand-primary leading-tight">
                {effectiveType === 'admin' ? 'Administrador' : isPersonalView ? 'Personal' : 'Aluno'}
              </span>
            </div>
          </div>

          {/* Logout — desktop only */}
          <Button
            variant="ghost-danger"
            size="icon"
            onClick={logout}
            title="Sair"
            aria-label="Sair da conta"
            className="hidden lg:flex"
          >
            <DSIcon name="logout" size={16} />
          </Button>

          {/* Mobile: avatar with plan badge overlay */}
          <div className="lg:hidden shrink-0">
            <AvatarWithPlanBadge
              src={user?.avatar_url}
              name={user?.full_name || 'U'}
              size="sm"
              linkToPlans
            />
          </div>

          {/* Mobile menu button — Hamburger morph → X */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-text-secondary hover:bg-bg-tertiary active:scale-95 transition-all lg:hidden"
            aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <div className="relative h-5 w-5">
              <span className={cn(
                'absolute left-0.5 h-0.5 w-4 rounded-full bg-current transition-all duration-300',
                mobileNavOpen ? 'top-2.25 rotate-45' : 'top-0.75 rotate-0'
              )} />
              <span className={cn(
                'absolute left-0.5 top-2.25 h-0.5 w-4 rounded-full bg-current transition-all duration-200',
                mobileNavOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
              )} />
              <span className={cn(
                'absolute left-0.5 h-0.5 w-4 rounded-full bg-current transition-all duration-300',
                mobileNavOpen ? 'top-2.25 -rotate-45' : 'top-3.75 rotate-0'
              )} />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom border — subtle */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300',
        scrolled ? 'bg-border-light opacity-100' : 'bg-border-light/50 opacity-60'
      )} />
    </header>
  )
}
