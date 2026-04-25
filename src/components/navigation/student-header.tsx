/**
 * src/components/navigation/student-header.tsx
 *
 * StudentHeader v5 — B2C App Header (Dashboard-style)
 *
 * EXACT same style as dashboard header.tsx:
 * - Breadcrumbs (🏠 > Section > Page title)
 * - AvatarWithPlanBadge on mobile
 * - Bell with unread count badge
 * - Hamburger menu morph on mobile
 * - Fixed with backdrop-blur-2xl + saturate-180 + scroll shadow
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'
import { useUnreadCount } from '@/hooks/use-student-app'

// ============================================
// Route titles & breadcrumbs (B2C)
// ============================================
const ROUTE_MAP: Record<string, string> = {
  '/treinos': 'Treinos',
  '/treinos/ativo': 'Treino Ativo',
  '/treinos/historico': 'Histórico',
  '/nutricao': 'Nutrição',
  '/nutricao/plano': 'Plano Alimentar',
  '/ia': 'IA & Dicas',
  '/avaliacoes': 'Avaliações',
  '/avaliacoes/detalhes': 'Detalhes',
  '/perfil': 'Perfil',
  '/perfil/editar': 'Editar Perfil',
  '/perfil/notificacoes': 'Notificações',
  '/plano': 'Meu Plano',
  '/exercicios': 'Exercícios',
  '/progresso': 'Progresso',
  '/social': 'Comunidade',
}

// Tab root paths (show home icon in breadcrumb, no back)
const TAB_ROOTS = new Set(['/treinos', '/nutricao', '/ia', '/avaliacoes', '/perfil'])

// Sub-routes with their own full-screen headers (don't show StudentHeader)
const EXCLUDED_ROUTES = new Set(['/treino-ativo', '/welcome'])

function getPageTitle(pathname: string): string {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname]
  const parts = pathname.split('/')
  while (parts.length > 1) {
    parts.pop()
    const shorter = parts.join('/') || '/'
    if (ROUTE_MAP[shorter]) return ROUTE_MAP[shorter]
  }
  return ''
}

interface BreadcrumbItem { label: string; href?: string }

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Tab roots: no breadcrumbs (just the title)
  if (TAB_ROOTS.has(pathname)) return []

  // Sub-pages: build crumbs from parent segments
  const segments = pathname.replace(/^\//, '').split('/')
  const crumbs: BreadcrumbItem[] = []
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i]
    const label = ROUTE_MAP[currentPath]
    if (label) crumbs.push({ label, href: currentPath })
  }
  // Remove last crumb — it's shown as <h1> page title
  if (crumbs.length > 0) crumbs.pop()
  return crumbs
}

function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.has(pathname)
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')
}

// ============================================
// Component
// ============================================
export function StudentHeader() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)

  const { data: unread } = useUnreadCount()
  const unreadCount = unread?.unread_count ?? 0

  const pageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumbs(pathname)

  // Scroll detection for progressive shadow (matching dashboard header)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Don't render on excluded routes
  if (isExcluded(pathname)) return null

  return (
    <header
      className={cn(
        'ds3-header fixed left-0 right-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300',
        'border-b-0',
        scrolled && 'ds3-header-scrolled'
      )}
      style={{
        background: 'linear-gradient(to bottom, #050A12 0px, #050A12 32px, #0f1a2c 48%, #0b1627 100%)',
        backgroundColor: '#050A12',
        borderBottom: 0,
        top: 'var(--demo-banner-offset, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Overlay fixo para garantir topo sólido theme color em qualquer ambiente */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 48,
        background: '#050A12',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      {/* ═══ DS v3 NAVBAR — same as dashboard ═══ */}
      <div className="flex h-14 items-center justify-between px-4">

        {/* ── LEFT: Breadcrumbs + Page title ── */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex flex-col justify-center">
            {/* Breadcrumbs — home icon > section > sub-page (same as dashboard) */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-0.5">
              <Link href="/treinos" className="text-white/80 hover:text-sky-300 transition-colors shrink-0">
                <DSIcon name="home" size={14} className="text-white" />
              </Link>
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <DSIcon name="chevronRight" size={10} className="text-white/35 shrink-0" />
                    <Link
                      href={item.href!}
                      className="text-xs font-medium text-white/70 hover:text-sky-300 transition-colors truncate max-w-32"
                    >
                      {item.label}
                    </Link>
                  </span>
                ))
              ) : (
                !isTabRoot(pathname) && pageTitle && (
                  <>
                    <DSIcon name="chevronRight" size={10} className="text-white/35 shrink-0" />
                    <span className="text-xs font-medium text-white/75 truncate max-w-32">
                      {pageTitle}
                    </span>
                  </>
                )
              )}
            </nav>
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* ── RIGHT: Bell + Avatar ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bell — with absolute positioned badge (same as dashboard) */}
          <div className="relative">
            <Link
              href="/perfil/notificacoes"
              className="ds3-action-btn flex"
              title={unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Notificações'}
              aria-label={unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Notificações'}
            >
              <DSIcon name="bell" size={16} className="text-white dark:text-white" />
            </Link>
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-brand-primary text-[9px] font-bold text-white notification-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>

          {/* Avatar with plan badge (same as dashboard mobile) */}
          <div className="shrink-0">
            <AvatarWithPlanBadge
              src={user?.avatar_url}
              name={user?.full_name || 'U'}
              size="sm"
              linkToPlans
            />
          </div>
        </div>
      </div>

      {/* Bottom border removed for seamless gradient */}
      {/* <div className={cn(
        'absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300',
        scrolled ? 'bg-white/40 opacity-100' : 'bg-white/30 opacity-85'
      )} /> */}
    </header>
  )
}
