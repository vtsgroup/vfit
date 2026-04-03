// ============================================
// command-palette.tsx — Command Palette global (⌘K / Ctrl+K)
// ============================================
//
// O que faz:
//   Painel de busca/ações global ativado por ⌘K ou Ctrl+K.
//   Busca pessoas (alunos, personals) via API /api/search/people.
//   Ações rápidas fixas (Novo Treino, Novo Aluno, etc.) filtradas por tipo de usuário.
//   Navega para perfil/page ao selecionar resultado.
//   Usa Framer Motion para animação de entrada/saída e backdrop blur.
//
// Exports principais:
//   CommandPalette — componente standalone, registra listener global de teclado
//
// Auth: lê useAuthStore (userId, userType) — sem chamada de API protegida direta
'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'

interface SearchItem {
  id: string
  type: string
  title: string
  subtitle: string
  href: string
  badge?: string
}

interface SearchSection {
  key: string
  label: string
  items: SearchItem[]
}

interface SearchResponse {
  query: string
  sections: SearchSection[]
  quick_actions: SearchItem[]
}

const SECTION_ICONS: Record<string, DSIconName> = {
  'Ações rápidas': 'zap',
  'Alunos': 'users',
  'Treinos': 'dumbbell',
  'Pagamentos': 'creditCard',
}

const ACTION_ICONS: Record<string, DSIconName> = {
  'Novo aluno': 'userPlus',
  'Novo treino': 'dumbbell',
  'Nova cobrança': 'receipt',
}

function getSectionIcon(section: string): DSIconName {
  return SECTION_ICONS[section] || 'sparkles'
}

function getActionIcon(title: string): DSIconName {
  return ACTION_ICONS[title] || 'plusCircle'
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' as const } },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 26, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -6,
    transition: { duration: 0.12, ease: 'easeIn' as const },
  },
}

export function CommandPalette() {
  const router = useRouter()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    if (!isReady) return

    function onKeyDown(event: KeyboardEvent) {
      const isK = event.key?.toLowerCase() === 'k'
      if ((event.metaKey || event.ctrlKey) && isK) {
        event.preventDefault()
        setOpen((prev) => {
          if (prev) setQuery('')
          return !prev
        })
      }
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isReady, handleClose])

  useEffect(() => {
    if (!open || !isReady) return

    let cancelled = false
    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const endpoint = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}&limit=8` : '/search?q=a&limit=4'
        const res = await api.get<SearchResponse>(endpoint)
        if (!cancelled) {
          setData(res.data)
          setActiveIndex(0)
        }
      } catch {
        if (!cancelled) {
          setData({ query: query.trim(), sections: [], quick_actions: [] })
          setActiveIndex(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 180)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [open, query, isReady])

  // Build flat rows with section grouping info
  const { rows, sectionBreaks } = useMemo(() => {
    const output: Array<SearchItem & { section: string }> = []
    const breaks: Record<number, string> = {}

    if (data?.quick_actions?.length) {
      breaks[0] = 'Ações rápidas'
      for (const action of data.quick_actions) {
        output.push({ ...action, section: 'Ações rápidas' })
      }
    }

    for (const section of data?.sections ?? []) {
      if (section.items.length) {
        breaks[output.length] = section.label
        for (const item of section.items) {
          output.push({ ...item, section: section.label })
        }
      }
    }

    return { rows: output, sectionBreaks: breaks }
  }, [data])

  useEffect(() => {
    if (!open) return

    function onNav(event: KeyboardEvent) {
      if (!rows.length) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % rows.length)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + rows.length) % rows.length)
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const selected = rows[activeIndex]
        if (selected?.href) {
          handleClose()
          router.push(selected.href)
        }
      }
    }

    window.addEventListener('keydown', onNav)
    return () => window.removeEventListener('keydown', onNav)
  }, [open, rows, activeIndex, router, handleClose])

  if (!isReady) return null

  return (
    <>
      {/* Trigger button — frosted glass */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-3 z-40 hidden items-center gap-2 rounded-xl border dark:border-white/10 light:border-slate-200 dark:bg-white/5 light:bg-white/80 px-3 py-2 text-xs text-text-muted shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-brand-primary/30 dark:hover:bg-white/8 light:hover:bg-white hover:shadow-[0_0_24px_rgba(16,185,129,0.1)] lg:flex"
      >
        <DSIcon name="command" size={14} />
        <span className="font-mono">⌘K</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="command-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-80 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-[12vh] sm:pt-[16vh]"
            onClick={handleClose}
          >
            <motion.div
              key="command-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border dark:border-white/8 light:border-slate-200 bg-bg-secondary/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04),0_0_80px_-20px_rgba(16,185,129,0.06)] backdrop-blur-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Top edge glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/30 to-transparent" />

              {/* Search input */}
              <div className="flex items-center gap-3 border-b dark:border-white/6 light:border-slate-200 px-5 py-4">
                {loading ? (
                  <DSIcon name="loader" size={18} className="shrink-0 animate-spin text-brand-primary/60" />
                ) : (
                  <DSIcon name="search" size={18} className="shrink-0 text-text-muted/50" />
                )}
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar alunos, treinos, cobranças..."
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none"
                />
                <kbd className="hidden shrink-0 rounded-md border dark:border-white/8 light:border-slate-200 dark:bg-white/4 light:bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-text-muted/50 sm:inline-flex">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-auto overscroll-contain p-1.5">
                {loading ? (
                  <div className="space-y-1 p-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-xl dark:bg-white/3 light:bg-slate-100"
                        style={{ animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl dark:bg-white/4 light:bg-slate-100">
                      <DSIcon name="sparkles" size={20} className="text-text-muted/25" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-muted/50">Nenhum resultado</p>
                      <p className="mt-0.5 text-xs text-text-muted/30">Tente outra busca</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {rows.map((row, idx) => {
                      const sectionLabel = sectionBreaks[idx]
                      const sectionIcon = sectionLabel ? getSectionIcon(sectionLabel) : null
                      const isAction = row.section === 'Ações rápidas'
                      const actionIcon = isAction ? getActionIcon(row.title) : null

                      return (
                        <div key={`${row.section}-${row.id}-${idx}`}>
                          {/* Section header */}
                          {sectionLabel && (
                            <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                              {sectionIcon && <DSIcon name={sectionIcon} size={12} className="text-text-muted/30" />}
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/30">
                                {sectionLabel}
                              </span>
                            </div>
                          )}

                          {/* Result row */}
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              handleClose()
                              router.push(row.href)
                            }}
                            className={cn(
                              'group relative w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                              idx === activeIndex
                                ? 'bg-brand-primary/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15),0_0_20px_-8px_rgba(16,185,129,0.12)]'
                                : 'dark:hover:bg-white/3 light:hover:bg-slate-50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {/* Icon */}
                              {isAction && actionIcon && (
                                <div className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                  idx === activeIndex
                                    ? 'bg-brand-primary/15 text-brand-primary'
                                    : 'dark:bg-white/5 light:bg-slate-100 text-text-muted/40'
                                )}>
                                  <DSIcon name={actionIcon} size={16} />
                                </div>
                              )}

                              {/* Text */}
                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  'truncate text-sm font-medium transition-colors',
                                  idx === activeIndex ? 'text-brand-accent' : 'text-text-primary'
                                )}>
                                  {row.title}
                                </p>
                                <p className={cn(
                                  'truncate text-xs transition-colors',
                                  idx === activeIndex ? 'text-brand-primary/60' : 'text-text-muted/40'
                                )}>
                                  {row.subtitle}
                                </p>
                              </div>

                              {/* Badge + Arrow */}
                              <div className="flex shrink-0 items-center gap-2">
                                {row.badge ? (
                                  <span className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                                    idx === activeIndex
                                      ? 'bg-brand-primary/12 text-brand-accent'
                                      : 'dark:bg-white/4 light:bg-slate-100 text-text-muted/40'
                                  )}>
                                    {row.badge}
                                  </span>
                                ) : null}
                                <DSIcon name="arrowRight" size={14} className={cn(
                                  'transition-all duration-150',
                                  idx === activeIndex
                                    ? 'text-brand-primary/50 translate-x-0 opacity-100'
                                    : 'text-transparent -translate-x-1 opacity-0'
                                )} />
                              </div>
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t dark:border-white/5 light:border-slate-200 px-5 py-2.5">
                <div className="flex items-center gap-4 text-[10px] text-text-muted/30">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border dark:border-white/6 light:border-slate-200 dark:bg-white/3 light:bg-slate-100 px-1.5 py-0.5 font-mono text-[9px]">↑↓</kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border dark:border-white/6 light:border-slate-200 dark:bg-white/3 light:bg-slate-100 px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                    Abrir
                  </span>
                </div>
                <span className="text-[9px] font-medium tracking-wide text-text-muted/20">
                  VFIT
                </span>
              </div>

              {/* Bottom edge glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent dark:via-white/6 light:via-slate-200 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
