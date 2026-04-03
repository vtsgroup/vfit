/**
 * src/components/navigation/student-header.tsx
 *
 * Sprint 1 — StudentHeader sticky (B2C)
 *
 * Header global para todas as rotas B2C.
 * - Logo VFIT à esquerda (nas tabs root) ou back button (sub-rotas)
 * - Título da página ao centro
 * - Bell icon + Avatar à direita
 * - Sticky com backdrop-blur + safe-area-inset-top
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Route titles
// ============================================
const ROUTE_TITLES: Record<string, string> = {
  '/treinos': 'Treinos',
  '/nutricao': 'Nutrição',
  '/ia': 'IA & Dicas',
  '/avaliacoes': 'Avaliações',
  '/perfil': 'Perfil',
  '/plano': 'Meu Plano',
  '/treino-ativo': 'Treino Ativo',
  '/exercicios': 'Exercícios',
  '/progresso': 'Progresso',
  '/social': 'Comunidade',
}

// Tab root paths (no back button shown)
const TAB_ROOTS = new Set(['/treinos', '/nutricao', '/ia', '/avaliacoes', '/perfil'])

// Sub-routes with their own full-screen headers (don't show StudentHeader)
const EXCLUDED_ROUTES = new Set(['/treino-ativo', '/welcome'])

function getRouteTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  // Match parent path (e.g., /perfil/editar → /perfil → 'Perfil')
  const segments = pathname.split('/')
  while (segments.length > 1) {
    segments.pop()
    const parent = segments.join('/') || '/'
    if (ROUTE_TITLES[parent]) return ROUTE_TITLES[parent]
  }

  return ''
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
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)

  // Progressive shadow on scroll
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Don't render on excluded routes
  if (isExcluded(pathname)) return null

  const title = getRouteTitle(pathname)
  const showBack = !isTabRoot(pathname)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-3 px-4 transition-shadow duration-200',
        'bg-(--color-bg-primary)/85 backdrop-blur-xl',
        scrolled && 'shadow-lg shadow-black/20'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Left: Back or Logo */}
      <div className="flex w-10 items-center justify-start">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-white/5"
            aria-label="Voltar"
          >
            <DSIcon name="arrowLeft" size={20} className="text-text-secondary" />
          </button>
        ) : (
          <span
            className="text-lg tracking-tight text-white"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            V<span className="text-brand-primary">F</span>
          </span>
        )}
      </div>

      {/* Center: Title */}
      <div className="flex flex-1 items-center justify-center">
        <h1 className="truncate text-[15px] font-bold text-text-primary">
          {title}
        </h1>
      </div>

      {/* Right: Bell + Avatar */}
      <div className="flex w-20 items-center justify-end gap-1">
        {/* Bell */}
        <Link
          href="/perfil/notificacoes"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-white/5"
          aria-label="Notificações"
        >
          <DSIcon name="bell" size={20} className="text-text-secondary" />
        </Link>

        {/* Avatar */}
        <Link
          href="/perfil"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 overflow-hidden"
          aria-label="Perfil"
        >
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <DSIcon name="user" size={16} className="text-text-muted" />
          )}
        </Link>
      </div>
    </header>
  )
}
