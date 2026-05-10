/**
 * src/components/navigation/student-fab-menu.tsx
 *
 * v4 — Student FAB Menu (AI Submenu Overlay)
 *
 * 2×3 grid of AI actions that expands from the center FAB button.
 * Spring animation with stagger, backdrop blur, haptic feedback.
 * Each action routes to /ia?action=X.
 * Matches dashboard mobile-nav quick actions card style.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// Haptic feedback helper
// ============================================
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}

// ============================================
// AI Action Icons — Premium filled SVGs (22×22)
// ============================================

function MetasIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}

function ProgressoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 20L7 14L11 16L15 8L21 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4H21V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExercicioIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
      <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
      <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function NutricaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 2 6 5 6 8c0 3 1 5 2 6.5V21a1 1 0 001 1h6a1 1 0 001-1v-6.5c1-1.5 2-3.5 2-6.5 0-3-2-6-6-6z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="9" y1="7" x2="9" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <line x1="15" y1="7" x2="15" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function PerguntaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 13v1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

// ============================================
// Actions config
// ============================================
interface FabAction {
  id: string
  label: string
  action: string
  icon: React.ReactNode
}

const FAB_ACTIONS: FabAction[] = [
  { id: 'goals', label: 'Metas', action: 'goals', icon: <MetasIcon /> },
  { id: 'progress', label: 'Progresso', action: 'progress', icon: <ProgressoIcon /> },
  { id: 'exercise', label: 'Exercício', action: 'exercise', icon: <ExercicioIcon /> },
  { id: 'nutrition', label: 'Nutrição', action: 'nutrition', icon: <NutricaoIcon /> },
  { id: 'qa', label: 'Perguntas', action: 'qa', icon: <PerguntaIcon /> },
]

// ============================================
// Component
// ============================================
interface StudentFabMenuProps {
  open: boolean
  onClose: () => void
}

export function StudentFabMenu({ open, onClose }: StudentFabMenuProps) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const handleAction = (action: FabAction) => {
    haptic()
    onClose()
    router.push(`/ia?action=${action.action}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              haptic()
              onClose()
            }}
            className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-lg lg:hidden"
            style={{ backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)' }}
          />

          {/* Quick Actions Card — suspended AI assistant panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 z-44 -translate-x-1/2 lg:hidden"
            style={{
              bottom: `calc(7rem + env(safe-area-inset-bottom, 0px))`,
              width: 'min(340px, 90vw)',
            }}
          >
            <div
              className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[#06101f]/92 p-2.5 shadow-[0_34px_90px_-34px_rgba(16,185,129,0.55),0_22px_46px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)]"
              style={{ backdropFilter: 'blur(28px) saturate(185%)', WebkitBackdropFilter: 'blur(28px) saturate(185%)' }}
            >
              <div className="pointer-events-none absolute -left-16 -top-20 h-44 w-44 rounded-full bg-emerald-300/18 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 top-8 h-36 w-36 rounded-full bg-sky-300/14 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-emerald-200/65 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-emerald-500/8 to-transparent" />

              {/* Header */}
              <div className="relative flex items-center gap-3 px-3.5 pb-3 pt-3">
                <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-[20px] border border-emerald-200/22 bg-linear-to-b from-emerald-300/24 via-emerald-400/14 to-slate-950/60 text-emerald-100 shadow-[0_0_32px_rgba(16,185,129,0.38),inset_0_1px_0_rgba(255,255,255,0.20)]">
                  <span className="absolute inset-1 rounded-[16px] border border-white/8" aria-hidden="true" />
                  <DSIcon name="sparkles" size={22} className="drop-shadow-[0_0_12px_rgba(110,231,183,0.58)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200/82">IA Assistente</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                  </div>
                  <p className="truncate text-[14px] font-black tracking-tight text-white">Escolha uma ação inteligente</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">Treino, metas e evolução em um toque.</p>
                </div>
              </div>

              {/* Actions grid — 2×3 but 5 items (last row has 1 centered or not) */}
              <div className="relative grid grid-cols-3 gap-2 px-1.5 pb-2">
                {FAB_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={() => handleAction(action)}
                    className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-[19px] border border-white/8 bg-white/6 px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-250 hover:border-emerald-200/24 hover:bg-emerald-300/9 hover:shadow-[0_12px_30px_-18px_rgba(16,185,129,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-[0.96]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-emerald-200/18 bg-linear-to-b from-emerald-300/18 via-emerald-400/9 to-slate-950/45 text-emerald-200 shadow-[0_8px_20px_-16px_rgba(16,185,129,0.72),inset_0_1px_0_rgba(255,255,255,0.13)] transition-all duration-250 group-hover:text-emerald-100 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.24),inset_0_1px_0_rgba(255,255,255,0.18)]">
                      {action.icon}
                    </div>
                    <span className="text-center text-[11px] font-bold leading-tight text-slate-100">
                      {action.label}
                    </span>
                  </motion.button>
                ))}

                {/* Close button — completes the grid */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: FAB_ACTIONS.length * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={() => {
                    haptic()
                    onClose()
                  }}
                  className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-[19px] border border-white/8 bg-white/5 px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-250 hover:border-rose-200/20 hover:bg-rose-300/8 active:scale-[0.96]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-slate-950/58 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition-colors group-hover:text-rose-100">
                    <DSIcon name="x" size={20} />
                  </div>
                  <span className="text-center text-[11px] font-bold leading-tight text-slate-400 group-hover:text-rose-100">
                    Fechar
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
