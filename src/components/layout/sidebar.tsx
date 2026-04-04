/**
 * src/components/layout/sidebar.tsx
 *
 * Sidebar — Desktop navigation (Koyeb-style charcoal)
 *
 * Exports: Sidebar
 * Hooks: useState, usePathname, useAppStore, useAuthStore, useEffectiveUserView
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Sidebar — Desktop navigation (Koyeb-style charcoal)
// v3.0 — Sprint 2 Cinema Premium
// ============================================

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getShortName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { VfitLogo } from '@/components/ui/vfit-logo'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { useUpdateAdminSimulationSession } from '@/hooks/use-admin'
import { useNavPrefetch } from '@/hooks/use-nav-prefetch'
import {
  personalNavigation,
  studentNavigation,
  adminNavigation,
  SECTION_COLORS,
  type NavSection,
  type NavItem,
} from '@/lib/navigation'
import { APP_VERSION } from '../../../lib/version'
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'
import { Badge } from '@/components/ui/badge'

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const setCollapsed = useAppStore((s) => s.setSidebarCollapsed)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { isPersonalView, isStudentView, hasAdminCapabilities, isSimulationActive, canSimulate, simulationMode, simulation } = useEffectiveUserView()
  const updateSimulation = useUpdateAdminSimulationSession()
  const prefetch = useNavPrefetch()

  let navigation: NavSection[] = (isPersonalView || hasAdminCapabilities) && !isStudentView
    ? [...personalNavigation]
    : [...studentNavigation]

  // Adicionar seção admin se for admin e NÃO estiver simulando
  if (hasAdminCapabilities && !isSimulationActive) {
    navigation = [...navigation, adminNavigation]
  }

  return (
    <aside
      aria-label="Navegação principal"
      className={cn(
        'sidebar-premium fixed left-0 z-40 flex flex-col transition-all duration-300',
        'hidden lg:flex',
        collapsed ? 'w-18' : 'w-65'
      )}
      style={{
        top: 'var(--demo-banner-offset, 0px)',
        height: 'calc(100dvh - var(--demo-banner-offset, 0px))',
      }}
    >
      {/* Logo — VFIT brand */}
      <div className="flex h-16 items-center border-b border-white/8 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-0 min-w-0"
          aria-label="Ir para o Dashboard"
        >
          {/* V icon — always visible */}
          <VfitLogo size="xs" showIcon={true} textColor="white" className={cn('shrink-0', collapsed && '[&>span:last-child]:hidden')} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
        {navigation.map((section, sectionIdx) => (
          <div key={section.title} className="mb-5">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-2 px-3"
                >
                  {sectionIdx > 0 && (
                    <div className="mb-3 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                  )}
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35"
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                  >
                    {section.title}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {collapsed && sectionIdx > 0 && (
              <div className="mx-3 mb-3 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  collapsed={collapsed}
                  sectionColor={SECTION_COLORS[section.title] || 'text-white/40'}
                  onMouseEnter={() => prefetch(item.href)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer — always white/transparent on charcoal */}
      <div className="border-t border-white/8 p-3">
        {/* Admin simulation pills — discreet at sidebar bottom */}
        {canSimulate && !collapsed && (
          <div className="mb-3 flex flex-col gap-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 px-1" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>Simular como</p>
            <div className="flex items-center gap-1">
              {(['super_admin', 'personal', 'student'] as const).map((mode) => {
                const isActive = (simulationMode || 'super_admin') === mode
                const labels = { super_admin: 'Admin', personal: 'Personal', student: 'Aluno' } as const
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={async () => {
                      if (mode === 'super_admin') {
                        await updateSimulation.mutateAsync({ mode: 'super_admin' })
                      } else if (isActive) {
                        // Already in this mode, do nothing
                        return
                      } else {
                        // Switch to personal/student as self (Victor can view as himself)
                        await updateSimulation.mutateAsync({ mode, target_user_id: user?.id })
                      }
                    }}
                    disabled={updateSimulation.isPending}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer select-none text-center',
                      isActive
                        ? 'text-white bg-brand-primary/20 border border-brand-primary/40'
                        : 'text-white/35 bg-white/4 border border-white/6 hover:border-white/15 hover:text-white/60'
                    )}
                  >
                    {labels[mode]}
                  </button>
                )
              })}
            </div>
            {isSimulationActive && simulation?.target_email && (
              <p className="text-[9px] text-white/30 px-1 truncate">→ {simulation.target_email}</p>
            )}
          </div>
        )}
        {canSimulate && collapsed && (
          <button
            type="button"
            onClick={async () => {
              await updateSimulation.mutateAsync({ mode: 'super_admin' })
            }}
            className="mb-2 flex w-full items-center justify-center rounded-xl px-3 py-2 text-white/30 hover:bg-white/8 hover:text-white/60 transition-all"
            title="Simulação"
          >
            <DSIcon name="users" size={16} />
          </button>
        )}
        {/* User info — glassmorphism card with plan badge on avatar */}
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 border border-white/8 shadow-[0_2px_12px_rgba(0,0,0,0.15),0_0_0_0.5px_rgba(255,255,255,0.04)_inset] transition-all duration-300 hover:bg-white/7 hover:border-white/12 backdrop-blur-sm">
            <AvatarWithPlanBadge
              src={user.avatar_url}
              name={user.full_name}
              size="md"
              linkToPlans
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white/90">{getShortName(user.full_name)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="premium" className="text-[8px] px-1.5 py-0 h-4">
                  {isSimulationActive ? (isStudentView ? 'Aluno' : 'Personal') : hasAdminCapabilities ? 'Admin' : isPersonalView ? 'Personal' : 'Aluno'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost-danger"
          size={collapsed ? 'icon' : 'md'}
          onClick={logout}
          aria-label="Sair da conta"
          className={cn(
            'w-full justify-start',
            collapsed && 'justify-center'
          )}
        >
          <DSIcon name="logout" size={16} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/35 transition-all hover:bg-white/8 hover:text-white/60 active:scale-[0.98]',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <DSIcon name="chevronRight" size={16} />
          ) : (
            <>
              <DSIcon name="chevronLeft" size={16} />
              <span>Recolher</span>
            </>
          )}
        </button>

        {/* Version */}
        <p className={cn(
          'mt-2 text-center text-[10px] text-white/20 select-none',
          collapsed && 'text-[8px]'
        )}
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
        >
          v{APP_VERSION}
        </p>
      </div>
    </aside>
  )
}

// ============================================
// Sidebar Item
// ============================================

function SidebarItem({
  item,
  isActive,
  collapsed,
  sectionColor,
  onMouseEnter,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  sectionColor: string
  onMouseEnter?: () => void
}) {
  return (
    <li>
      <Link
        href={item.href}
        onMouseEnter={onMouseEnter}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25',
          collapsed && 'justify-center',
          isActive
            ? 'text-white font-semibold'
            : 'text-white/50 hover:bg-white/6 hover:text-white/85 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.97] active:bg-white/3'
        )}
        title={collapsed ? item.label : undefined}
      >
        {/* Active pill background — green accent with glow */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-xl bg-brand-primary/10 border border-brand-primary/25 shadow-[0_0_24px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(16,185,129,0.08)]"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <DSIcon
          name={item.icon}
          size={18}
          className={cn(
            'relative shrink-0 z-10 transition-all duration-200',
            isActive
              ? 'text-brand-primary scale-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]'
              : cn(sectionColor, 'group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.15)]')
          )}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="relative z-10 overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && item.badge && (
          <span className="relative z-10 ml-auto rounded-md bg-brand-primary/20 border border-brand-primary/30 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            {item.badge}
          </span>
        )}

        {/* Active left accent bar with glow */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 rounded-r-full bg-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.5),0_0_4px_rgba(16,185,129,0.8)] animate-[sidebar-accent-breathe_3s_ease-in-out_infinite]" />
        )}
      </Link>
    </li>
  )
}
