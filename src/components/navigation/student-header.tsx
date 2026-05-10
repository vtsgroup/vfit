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
        // Premium blue top → dark intersection, seamlessly connecting to hero (#0b1627)
        background:
          'linear-gradient(to bottom, #082f49 0%, #06314f 18%, #072943 38%, #071f37 60%, #07182d 80%, #050A12 100%)',
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
          {/* XP chip — digital asset coin, left of notifications */}
          <Link
            href="/progresso/streaks"
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-amber-300/35 bg-linear-to-b from-amber-300/18 via-amber-400/10 to-slate-950/20 px-2.5 text-slate-100 shadow-[0_7px_18px_-12px_rgba(251,191,36,0.75),inset_0_1px_0_rgba(253,230,138,0.22)] transition-all duration-200 hover:border-amber-300/55 hover:bg-amber-300/16 active:scale-95"
            title={`${xpData?.balance ?? 0} XP — Nível ${xpData?.level ?? 1}`}
            aria-label={`${xpData?.balance ?? 0} XP, nível ${xpData?.level ?? 1}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-b from-amber-200 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_2px_8px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.42)]">
              <DSIcon name="coin" size={13} />
            </span>
            <span className="text-[11px] font-black tabular-nums leading-none text-amber-100">{xpData?.balance ?? 0}</span>
          </Link>

          <div className="relative">
            <Link
              href="/perfil/notificacoes"
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-sky-200/16 bg-linear-to-b from-white/11 via-sky-300/6 to-slate-950/18 text-slate-100 shadow-[0_8px_20px_-14px_rgba(125,211,252,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:border-sky-200/28 hover:bg-white/12 active:scale-95"
              title={unreadCount > 0 ? `${unreadCount} nao lida(s)` : 'Notificacoes'}
              aria-label={unreadCount > 0 ? `${unreadCount} notificacoes nao lidas` : 'Notificacoes'}
            >
              <DSIcon name={unreadCount > 0 ? 'bellRing' : 'bell'} size={16} className="text-white drop-shadow-[0_0_8px_rgba(125,211,252,0.22)]" />
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

          <Link href="/perfil" className="shrink-0 rounded-full transition-transform duration-200 active:scale-95" aria-label="Abrir perfil">
            <AvatarWithPlanBadge src={user?.avatar_url} name={user?.full_name || 'U'} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default StudentHeader
