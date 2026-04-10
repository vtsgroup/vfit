/**
 * src/stores/app-store.ts
 *
 * Zustand v5 store para estado global da UI.
 *
 * O que faz:
 *  - Controla sidebar (open, collapsed), theme (light/dark/system), mobile nav
 *  - Sistema de toasts (success, error, warning, info)
 *  - Persiste theme + sidebar em localStorage
 *
 * Exports principais:
 *  - useAppStore — hook Zustand (sidebar, theme, resolvedTheme, mobileNavOpen)
 *  - toast(opts) — função helper para criar toast
 *  - Theme ('light' | 'dark' | 'system')
 */

// ============================================
// App Store — Zustand v5
// Estado global da aplicação (UI, sidebar, modals)
// ============================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================
// Types
// ============================================

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeUsageMs {
  light: number
  dark: number
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

interface AppState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Theme
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  themeUsageMs: ThemeUsageMs
  lastThemeUsageAt: number | null

  // Mobile
  mobileNavOpen: boolean

  // Toasts
  toasts: Toast[]

  // Global loading overlay
  globalLoading: boolean
  globalLoadingMessage: string | null

  // Command palette / search
  commandPaletteOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: Theme) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
  trackThemeUsageTick: () => void
  toggleMobileNav: () => void
  setMobileNavOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  setGlobalLoading: (loading: boolean, message?: string) => void
  setCommandPaletteOpen: (open: boolean) => void
}

// ============================================
// Store
// ============================================

let toastCounter = 0

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      resolvedTheme: 'dark',
      themeUsageMs: { light: 0, dark: 0 },
      lastThemeUsageAt: null,
      mobileNavOpen: false,
      toasts: [],
      globalLoading: false,
      globalLoadingMessage: null,
      commandPaletteOpen: false,

      // Sidebar actions
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme actions
      setTheme: (theme) => {
        // Antes de trocar, contabiliza o tempo de uso do tema atual.
        get().trackThemeUsageTick()

        function resolveSystem(): 'light' | 'dark' {
          return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark'
        }

        const resolved: 'light' | 'dark' = theme === 'system' ? resolveSystem() : theme
        set({ theme, resolvedTheme: resolved, lastThemeUsageAt: typeof window !== 'undefined' ? Date.now() : null })
      },
      setResolvedTheme: (resolvedTheme) => {
        set({ resolvedTheme, lastThemeUsageAt: typeof window !== 'undefined' ? Date.now() : null })
      },

      trackThemeUsageTick: () => {
        if (typeof window === 'undefined') return

        const now = Date.now()
        const { lastThemeUsageAt, resolvedTheme, themeUsageMs } = get()
        if (!lastThemeUsageAt) {
          set({ lastThemeUsageAt: now })
          return
        }

        const dt = now - lastThemeUsageAt
        if (!Number.isFinite(dt) || dt <= 0 || dt > 24 * 60 * 60 * 1000) {
          set({ lastThemeUsageAt: now })
          return
        }

        set({
          themeUsageMs: {
            ...themeUsageMs,
            [resolvedTheme]: (themeUsageMs[resolvedTheme] || 0) + dt,
          },
          lastThemeUsageAt: now,
        })
      },

      // Mobile nav
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      // Toast actions
      addToast: (toast) => {
        const id = `toast-${++toastCounter}`
        const newToast: Toast = { id, duration: 5000, ...toast }
        set((s) => ({ toasts: [...s.toasts, newToast] }))

        // Auto-remove
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, newToast.duration)
        }
        return id
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearToasts: () => set({ toasts: [] }),

      // Global loading
      setGlobalLoading: (loading, message) =>
        set({ globalLoading: loading, globalLoadingMessage: message ?? null }),

      // Command palette
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'vfit-app',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }

        return {
          getItem: (name: string) => {
            try {
              const raw = window.localStorage.getItem(name)
              if (!raw) return null
              JSON.parse(raw)
              return raw
            } catch {
              try {
                window.localStorage.removeItem(name)
              } catch {
                // ignore
              }
              return null
            }
          },
          setItem: (name: string, value: string) => {
            try {
              window.localStorage.setItem(name, value)
            } catch {
              // best-effort
            }
          },
          removeItem: (name: string) => {
            try {
              window.localStorage.removeItem(name)
            } catch {
              // ignore
            }
          },
        }
      }),
      partialize: (state) => ({
        theme: state.theme,
        resolvedTheme: state.resolvedTheme,
        themeUsageMs: state.themeUsageMs,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// ============================================
// Convenience toast helpers
// ============================================

export const toast = {
  success: (title: string, description?: string) =>
    useAppStore.getState().addToast({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    useAppStore.getState().addToast({ type: 'error', title, description }),
  warning: (title: string, description?: string) =>
    useAppStore.getState().addToast({ type: 'warning', title, description }),
  info: (title: string, description?: string) =>
    useAppStore.getState().addToast({ type: 'info', title, description }),
}
