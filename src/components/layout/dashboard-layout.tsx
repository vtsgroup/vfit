/**
 * src/components/layout/dashboard-layout.tsx
 *
 * Dashboard Layout — layout wrapper para /dashboard/*
 *
 * Exports: DashboardLayout
 * Hooks: useCallback, useAppStore, useQueryClient
 * Features: 'use client' · React Query
 */

// ============================================
// Dashboard Layout — layout wrapper para /dashboard/*
// Sidebar + Header + MobileNav + content area
// ============================================

'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { useQueryClient } from '@tanstack/react-query'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileBottomNav, MobileDrawer } from './mobile-nav'
import { ToastContainer } from './toast-container'
import { PageTransition } from './page-transition'
import { CopyLinkFab } from './copy-link-fab'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { CommandPalette } from '@/components/ui'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries()
  }, [queryClient])

  return (
    <div className="min-h-dvh bg-bg-page" style={{ overscrollBehaviorY: 'contain' }}>
      {/* Skip to main content — a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-xl focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg-dark focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      <MobileDrawer />

      {/* Top header */}
      <Header />

      {/* Main content */}
      <main
        id="main-content"
        className={cn(
          'min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300 lg:pb-0',
          'pt-[calc(4rem+env(safe-area-inset-top,0px)+var(--demo-banner-offset,0px))]',
          collapsed ? 'lg:pl-18' : 'lg:pl-65'
        )}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-none',
            'px-3 py-4 sm:px-4 sm:py-5 md:px-5 lg:px-6 lg:py-6 xl:px-7 2xl:px-8'
          )}
        >
          <PullToRefresh onRefresh={handleRefresh}>
            <PageTransition>
              {children}
            </PageTransition>
          </PullToRefresh>
        </div>
      </main>

      {/* AI Bot Floating Action Button */}
      <CopyLinkFab />

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Toast notifications */}
      <ToastContainer />

      {/* Global command palette */}
      <CommandPalette />
    </div>
  )
}
