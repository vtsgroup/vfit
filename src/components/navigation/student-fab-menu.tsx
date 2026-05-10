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

          {/* Quick Actions Card — matches dashboard style */}
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
              className="rounded-[22px] border border-emerald-100 bg-white/96 p-2 shadow-[0_20px_60px_-28px_rgba(34,197,94,0.35),0_10px_24px_-18px_rgba(15,23,42,0.28)]"
              style={{ backdropFilter: 'blur(28px) saturate(185%)', WebkitBackdropFilter: 'blur(28px) saturate(185%)' }}
            >
              {/* Header */}
              <div className="px-4 pb-2.5 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-brand-primary">
                  IA Assistente
                </span>
              </div>

              {/* Actions grid — 2×3 but 5 items (last row has 1 centered or not) */}
              <div className="grid grid-cols-3 gap-1.5 px-1.5 pb-2">
                {FAB_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={() => handleAction(action)}
                    className="flex flex-col items-center gap-2 rounded-xl border-none bg-transparent px-2 py-3.5 transition-all duration-300 hover:bg-brand-primary/8 hover:shadow-[0_8px_22px_rgba(16,185,129,0.12)] active:scale-[0.95]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-primary/15 bg-brand-primary/12 text-brand-primary shadow-[0_2px_8px_rgba(16,185,129,0.12)]">
                      {action.icon}
                    </div>
                    <span className="text-center text-[11px] font-semibold leading-tight text-text-primary">
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
                  className="flex flex-col items-center gap-2 rounded-xl border-none bg-transparent px-2 py-3.5 transition-all duration-300 hover:bg-red-500/8 active:scale-[0.95]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                    <DSIcon name="x" size={20} />
                  </div>
                  <span className="text-center text-[11px] font-semibold leading-tight text-text-muted">
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
