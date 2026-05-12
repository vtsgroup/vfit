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
  detail: string
  tone: string
}

const FAB_ACTIONS: FabAction[] = [
  { id: 'goals', label: 'Metas', action: 'goals', detail: 'ajuste fino', tone: 'emerald', icon: <MetasIcon /> },
  { id: 'progress', label: 'Progresso', action: 'progress', detail: 'leitura real', tone: 'sky', icon: <ProgressoIcon /> },
  { id: 'exercise', label: 'Exercício', action: 'exercise', detail: 'execução', tone: 'lime', icon: <ExercicioIcon /> },
  { id: 'nutrition', label: 'Nutrição', action: 'nutrition', detail: 'macros', tone: 'amber', icon: <NutricaoIcon /> },
  { id: 'qa', label: 'Perguntas', action: 'qa', detail: 'consultoria', tone: 'violet', icon: <PerguntaIcon /> },
]

const ACTION_TONES: Record<string, { card: string; icon: string; rail: string; text: string }> = {
  emerald: {
    card: 'hover:border-emerald-200/28 hover:bg-emerald-300/10',
    icon: 'border-emerald-200/22 bg-emerald-300/12 text-emerald-200 group-hover:text-emerald-100',
    rail: 'from-emerald-300 to-lime-300',
    text: 'text-emerald-200/76',
  },
  sky: {
    card: 'hover:border-sky-200/25 hover:bg-sky-300/9',
    icon: 'border-sky-200/20 bg-sky-300/11 text-sky-200 group-hover:text-sky-100',
    rail: 'from-sky-300 to-emerald-300',
    text: 'text-sky-200/76',
  },
  lime: {
    card: 'hover:border-lime-200/25 hover:bg-lime-300/9',
    icon: 'border-lime-200/20 bg-lime-300/11 text-lime-200 group-hover:text-lime-100',
    rail: 'from-lime-300 to-emerald-300',
    text: 'text-lime-200/76',
  },
  amber: {
    card: 'hover:border-amber-200/25 hover:bg-amber-300/9',
    icon: 'border-amber-200/20 bg-amber-300/11 text-amber-200 group-hover:text-amber-100',
    rail: 'from-amber-300 to-emerald-300',
    text: 'text-amber-200/76',
  },
  violet: {
    card: 'hover:border-violet-200/25 hover:bg-violet-300/9',
    icon: 'border-violet-200/20 bg-violet-300/11 text-violet-200 group-hover:text-violet-100',
    rail: 'from-violet-300 to-emerald-300',
    text: 'text-violet-200/76',
  },
}

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
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 330 }}
            className="fixed left-1/2 z-44 -translate-x-1/2 lg:hidden"
            style={{
              bottom: `calc(7rem + env(safe-area-inset-bottom, 0px))`,
              width: 'min(368px, calc(100vw - 28px))',
            }}
          >
            <div
              className="relative overflow-hidden rounded-[32px] border border-white/13 bg-slate-950/94 p-3 shadow-[0_34px_90px_-32px_rgba(16,185,129,0.58),0_24px_54px_-30px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.14)]"
              style={{ backdropFilter: 'blur(30px) saturate(190%)', WebkitBackdropFilter: 'blur(30px) saturate(190%)' }}
            >
              <div className="pointer-events-none absolute -left-20 -top-24 h-48 w-48 rounded-full bg-emerald-300/18 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 top-8 h-44 w-44 rounded-full bg-sky-300/13 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-emerald-100/78 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-emerald-500/10 to-transparent" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  maskImage: 'linear-gradient(to bottom, black, transparent 72%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 72%)',
                }}
              />

              {/* Header */}
              <div className="relative flex items-center gap-3 px-2 pb-3 pt-2">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[21px] border border-emerald-100/24 bg-linear-to-b from-emerald-200/25 via-emerald-400/13 to-slate-950/64 text-emerald-100 shadow-[0_0_34px_rgba(16,185,129,0.36),inset_0_1px_0_rgba(255,255,255,0.24)]">
                  <span className="absolute inset-1 rounded-[17px] border border-white/8" aria-hidden="true" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
                  <DSIcon name="sparkles" size={23} className="drop-shadow-[0_0_14px_rgba(110,231,183,0.62)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200/82">IA Assistente</p>
                  <p className="mt-1 text-[18px] font-black leading-tight text-white">Comando inteligente</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-400">Ajuste o próximo movimento do seu dia.</p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar menu IA"
                  onClick={() => {
                    haptic()
                    onClose()
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/6 text-slate-300 shadow-glass-inset-sm transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <DSIcon name="x" size={18} />
                </button>
              </div>

              <div className="relative mb-2 grid grid-cols-3 gap-1.5 rounded-card-lg border border-white/8 bg-white/5 p-1.5 shadow-glass-inset-sm">
                {[
                  ['Hoje', 'IA pronta'],
                  ['Foco', 'treino'],
                  ['Ritmo', 'online'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[15px] bg-slate-950/42 px-2 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                    <p className="mt-0.5 truncate text-[11px] font-black text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              {/* Actions grid */}
              <div className="relative grid grid-cols-2 gap-2 pb-1">
                {FAB_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, type: 'spring', damping: 26, stiffness: 320 }}
                    onClick={() => handleAction(action)}
                    className={`group relative flex min-h-21 items-center gap-3 overflow-hidden rounded-card-lg border border-white/9 bg-white/6 px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] transition-all duration-300 hover:shadow-[0_16px_34px_-22px_rgba(16,185,129,0.52),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.97] ${ACTION_TONES[action.tone].card} ${action.id === 'qa' ? 'col-span-2' : ''}`}
                  >
                    <span className={`absolute inset-x-3 top-0 h-px bg-linear-to-r ${ACTION_TONES[action.tone].rail} opacity-0 transition-opacity duration-300 group-hover:opacity-80`} aria-hidden="true" />
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] shadow-[0_8px_20px_-16px_rgba(16,185,129,0.72),inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.24),inset_0_1px_0_rgba(255,255,255,0.2)] ${ACTION_TONES[action.tone].icon}`}>
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-black leading-tight text-slate-50">{action.label}</span>
                      <span className={`mt-0.5 block truncate text-[10px] font-black uppercase tracking-[0.12em] ${ACTION_TONES[action.tone].text}`}>{action.detail}</span>
                    </div>
                    <DSIcon name="chevronRight" size={15} className="shrink-0 text-white/24 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/50" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
