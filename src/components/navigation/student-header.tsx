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
import { useXPBalance } from '@/hooks/use-xp'

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
  const { data: xpData } = useXPBalance()

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
        // Premium blue top → dark navy bottom, seamlessly connecting to app heroes
        background:
          'linear-gradient(180deg, #0f3a72 0%, #0b2d5c 24%, #092246 48%, #07182f 74%, #050A12 100%)',
        backgroundColor: '#0b2d5c',
        borderBottom: 0,
        top: 'var(--demo-banner-offset, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        boxShadow: scrolled
          ? '0 10px 28px rgba(2,6,23,0.28), inset 0 -1px 0 rgba(125,211,252,0.12)'
          : 'inset 0 -1px 0 rgba(125,211,252,0.10)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-9 bg-linear-to-b from-sky-300/18 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-linear-to-t from-[#050A12] via-[#050A12]/62 to-transparent" />
      <div className="relative z-2 flex h-14 items-center justify-between px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-col justify-center">
            <nav aria-label="Breadcrumb" className="mb-0.5 flex items-center gap-1.5">
              <Link href="/treinos" className="shrink-0 text-white/80 transition-colors hover:text-emerald-300">
                <DSIcon name="home" size={14} className="text-white" />
              </Link>

              {breadcrumbs.length > 0
                ? breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <DSIcon name="chevronRight" size={10} className="shrink-0 text-white/35" />
                      <Link
                        href={item.href!}
                        className="max-w-32 truncate text-xs font-medium text-white/70 transition-colors hover:text-emerald-300"
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
          {/* XP chip — same glass style as bell, left of notifications */}
          <Link
            href="/progresso/streaks"
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-amber-300/35 bg-amber-300/10 px-2.5 text-amber-100 shadow-[0_8px_18px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all hover:border-amber-200/55 hover:bg-amber-300/16 active:translate-y-px active:scale-[0.97]"
            title={`${xpData?.balance ?? 0} XP — Nível ${xpData?.level ?? 1}`}
            aria-label={`${xpData?.balance ?? 0} XP, nível ${xpData?.level ?? 1}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-b from-amber-200 via-amber-400 to-yellow-600 text-yellow-950 shadow-[0_3px_8px_rgba(245,158,11,0.32),inset_0_1px_0_rgba(255,255,255,0.62)]">
              <DSIcon name="coin" size={12} />
            </span>
            <span className="text-[11px] font-black tabular-nums leading-none text-amber-200">{xpData?.balance ?? 0}</span>
          </Link>

          <div className="relative">
            <Link
              href="/perfil/notificacoes"
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[12px] border border-sky-200/18 bg-white/8 text-sky-100 shadow-[0_8px_18px_rgba(14,165,233,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all hover:border-sky-200/35 hover:bg-white/12 hover:text-white active:translate-y-px active:scale-[0.97]"
              title={unreadCount > 0 ? `${unreadCount} nao lida(s)` : 'Notificacoes'}
              aria-label={unreadCount > 0 ? `${unreadCount} notificacoes nao lidas` : 'Notificacoes'}
            >
              <span className="pointer-events-none absolute inset-x-1 top-0 h-px bg-linear-to-r from-transparent via-sky-200/60 to-transparent" />
              <DSIcon name={unreadCount > 0 ? 'bellRing' : 'bell'} size={16} className="text-white drop-shadow-[0_0_10px_rgba(125,211,252,0.28)]" />
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

          <Link
            href="/perfil"
            className="shrink-0 rounded-[14px] border border-white/10 bg-white/7 p-0.5 shadow-[0_8px_18px_rgba(2,6,23,0.20),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all hover:border-sky-200/24 hover:bg-white/10 active:translate-y-px active:scale-[0.97]"
            aria-label="Abrir perfil"
          >
            <AvatarWithPlanBadge src={user?.avatar_url} name={user?.full_name || 'U'} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default StudentHeader
