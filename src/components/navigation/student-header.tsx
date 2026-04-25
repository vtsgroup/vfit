/**
 * src/components/navigation/student-header.tsx
 *
 * StudentHeader v5 — B2C App Header (Dashboard-style)
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

const ROUTE_MAP: Record<string, string> = {
  '/treinos': 'Treinos',
  '/treinos/ativo': 'Treino Ativo',
  '/treinos/historico': 'Historico',
  '/nutricao': 'Nutricao',
  '/nutricao/plano': 'Plano Alimentar',
  '/ia': 'IA & Dicas',
  '/avaliacoes': 'Avaliacoes',
  '/avaliacoes/detalhes': 'Detalhes',
  '/perfil': 'Perfil',
  '/perfil/editar': 'Editar Perfil',
  '/perfil/notificacoes': 'Notificacoes',
  '/plano': 'Meu Plano',
  '/exercicios': 'Exercicios',
  '/progresso': 'Progresso',
  '/social': 'Comunidade',
}

const TAB_ROOTS = new Set(['/treinos', '/nutricao', '/ia', '/avaliacoes', '/perfil'])
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

interface BreadcrumbItem {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (TAB_ROOTS.has(pathname)) return []

  const segments = pathname.replace(/^\//, '').split('/')
  const crumbs: BreadcrumbItem[] = []
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i]
    const label = ROUTE_MAP[currentPath]
    if (label) crumbs.push({ label, href: currentPath })
  }

  if (crumbs.length > 0) crumbs.pop()
  return crumbs
}

function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.has(pathname)
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED_ROUTES.has(pathname) || pathname.startsWith('/treino-ativo')
}

export function StudentHeader() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)

  const { data: unread } = useUnreadCount()
  const unreadCount = unread?.unread_count ?? 0

  const pageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumbs(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isExcluded(pathname)) return null

  return (
    <header
      className={cn(
        'ds3-header fixed left-0 right-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300',
        'border-b-0',
        scrolled && 'ds3-header-scrolled'
      )}
      style={{
        // Dark top → medium navy bottom, seamlessly connecting to hero (#0b1627)
        background:
          'linear-gradient(to bottom, #050A12 0%, #060d1a 18%, #071120 36%, #08152a 54%, #091830 72%, #0a1b33 88%, #0b1d36 100%)',
        backgroundColor: '#050A12',
        borderBottom: 0,
        top: 'var(--demo-banner-offset, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="relative z-2 flex h-14 items-center justify-between px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-col justify-center">
            <nav aria-label="Breadcrumb" className="mb-0.5 flex items-center gap-1.5">
              <Link href="/treinos" className="shrink-0 text-white/80 transition-colors hover:text-sky-300">
                <DSIcon name="home" size={14} className="text-white" />
              </Link>

              {breadcrumbs.length > 0
                ? breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <DSIcon name="chevronRight" size={10} className="shrink-0 text-white/35" />
                      <Link
                        href={item.href!}
                        className="max-w-32 truncate text-xs font-medium text-white/70 transition-colors hover:text-sky-300"
                      >
                        {item.label}
                      </Link>
                    </span>
                  ))
                : !isTabRoot(pathname) &&
                  pageTitle && (
                    <>
                      <DSIcon name="chevronRight" size={10} className="shrink-0 text-white/35" />
                      <span className="max-w-32 truncate text-xs font-medium text-white/75">{pageTitle}</span>
                    </>
                  )}
            </nav>

            <h1 className="truncate text-sm font-bold tracking-tight text-white">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <Link
              href="/perfil/notificacoes"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/12 bg-white/5 text-slate-200 transition-all hover:bg-white/10 hover:text-white hover:border-emerald-500/30"
              title={unreadCount > 0 ? `${unreadCount} nao lida(s)` : 'Notificacoes'}
              aria-label={unreadCount > 0 ? `${unreadCount} notificacoes nao lidas` : 'Notificacoes'}
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              <DSIcon name="bell" size={16} className="text-white" />
            </Link>

            {unreadCount > 0 && (
              <div
                className="notification-pulse absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-[#0a1628] bg-brand-primary px-1 text-[10px] font-bold text-white"
                style={{ boxShadow: '0 0 0 1px rgba(34,197,94,0.4), 0 2px 6px rgba(34,197,94,0.5)' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <AvatarWithPlanBadge src={user?.avatar_url} name={user?.full_name || 'U'} size="sm" linkToPlans />
          </div>
        </div>
      </div>
    </header>
  )
}

export default StudentHeader
