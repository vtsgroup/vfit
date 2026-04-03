/**
 * src/components/ui/empty-state.tsx
 *
 * EmptyState — MD3 + Apple System Design
 *
 * Exports: EmptyState
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// EmptyState — MD3 + Apple System Design
// v3.0: Refined illustrations, spring physics, floating particles
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { motion, type Variants } from 'framer-motion'
import { Button } from './button'

interface EmptyStateProps {
  icon?: DSIconName
  illustration?: 'students' | 'workouts' | 'payments' | 'notifications' | 'assessments' | 'search' | 'marketplace' | 'onboarding' | 'generic'
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  compact?: boolean
}

// ─── Floating Particles (Apple-style ambient glow) ───

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-brand-primary/15"
          style={{
            width: 4 + i * 2,
            height: 4 + i * 2,
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -8 - i * 3, 0],
            x: [0, (i % 2 ? 4 : -4), 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  )
}

// ─── Illustrations — Floating glass circles with brand glow ───

function EmptyIllustration({ type, className }: { type: string; className?: string }) {
  const baseClass = cn('mx-auto', className)

  switch (type) {
    case 'students':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="s-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#s-glow)" />
          <circle cx="70" cy="70" r="46" fill="currentColor" className="text-brand-primary/5" />
          {/* Person 1 */}
          <circle cx="50" cy="54" r="9" fill="currentColor" className="text-brand-primary/22" />
          <path d="M36 82c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="currentColor" className="text-brand-primary/22" strokeWidth="2.5" strokeLinecap="round" />
          {/* Person 2 */}
          <circle cx="90" cy="54" r="9" fill="currentColor" className="text-brand-primary/15" />
          <path d="M76 82c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="currentColor" className="text-brand-primary/15" strokeWidth="2.5" strokeLinecap="round" />
          {/* Plus badge */}
          <circle cx="70" cy="100" r="12" fill="currentColor" className="text-brand-primary/10" />
          <path d="M65 100h10M70 95v10" stroke="currentColor" className="text-brand-primary" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )

    case 'workouts':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="w-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#w-glow)" />
          <circle cx="70" cy="70" r="46" fill="currentColor" className="text-brand-primary/5" />
          {/* Dumbbell */}
          <rect x="32" y="63" width="76" height="12" rx="6" fill="currentColor" className="text-brand-primary/10" />
          <rect x="27" y="54" width="14" height="30" rx="5" fill="currentColor" className="text-brand-primary/18" />
          <rect x="99" y="54" width="14" height="30" rx="5" fill="currentColor" className="text-brand-primary/18" />
          <rect x="22" y="58" width="9" height="22" rx="3.5" fill="currentColor" className="text-brand-primary/28" />
          <rect x="109" y="58" width="9" height="22" rx="3.5" fill="currentColor" className="text-brand-primary/28" />
          {/* Sparkles */}
          <path d="M70 32l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" fill="currentColor" className="text-brand-primary/30" />
          <path d="M96 28l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="currentColor" className="text-brand-primary/18" />
          <path d="M44 38l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="currentColor" className="text-brand-primary/12" />
        </svg>
      )

    case 'payments':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="p-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#p-glow)" />
          {/* Card */}
          <rect x="32" y="46" width="72" height="48" rx="10" fill="currentColor" className="text-brand-primary/10" />
          <rect x="32" y="58" width="72" height="12" fill="currentColor" className="text-brand-primary/15" />
          <rect x="42" y="80" width="24" height="5" rx="2.5" fill="currentColor" className="text-brand-primary/22" />
          <rect x="72" y="80" width="14" height="5" rx="2.5" fill="currentColor" className="text-brand-primary/16" />
          {/* Dollar badge */}
          <circle cx="98" cy="42" r="14" fill="currentColor" className="text-brand-primary/12" />
          <text x="98" y="48" textAnchor="middle" fill="currentColor" className="text-brand-primary" fontSize="16" fontWeight="bold">$</text>
        </svg>
      )

    case 'notifications':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="n-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#n-glow)" />
          {/* Bell */}
          <path d="M70 38c-12 0-22 10-22 22v14l-5 5h54l-5-5V60c0-12-10-22-22-22z" fill="currentColor" className="text-brand-primary/15" />
          <path d="M62 84a8 8 0 0016 0" stroke="currentColor" className="text-brand-primary/22" strokeWidth="2.5" strokeLinecap="round" />
          {/* Zzz */}
          <text x="96" y="48" fill="currentColor" className="text-brand-primary/22" fontSize="14" fontWeight="bold">z</text>
          <text x="103" y="40" fill="currentColor" className="text-brand-primary/14" fontSize="11" fontWeight="bold">z</text>
          <text x="108" y="34" fill="currentColor" className="text-brand-primary/8" fontSize="9" fontWeight="bold">z</text>
        </svg>
      )

    case 'search':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="sr-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#sr-glow)" />
          {/* Magnifying glass */}
          <circle cx="62" cy="62" r="20" stroke="currentColor" className="text-brand-primary/18" strokeWidth="3" />
          <path d="M78 78l16 16" stroke="currentColor" className="text-brand-primary/22" strokeWidth="3" strokeLinecap="round" />
          {/* Question */}
          <text x="62" y="68" textAnchor="middle" fill="currentColor" className="text-brand-primary/12" fontSize="20" fontWeight="bold">?</text>
        </svg>
      )

    case 'onboarding':
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="ob-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#ob-glow)" />
          {/* Trophy cup */}
          <path d="M52 38h36v22c0 10-8 18-18 18s-18-8-18-18V38z" fill="currentColor" className="text-brand-primary/12" />
          <path d="M52 50H38c0 8 6 14 14 14" stroke="currentColor" className="text-brand-primary/20" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M88 50h14c0 8-6 14-14 14" stroke="currentColor" className="text-brand-primary/20" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="60" y="78" width="20" height="6" rx="3" fill="currentColor" className="text-brand-primary/18" />
          <rect x="50" y="84" width="40" height="5" rx="2.5" fill="currentColor" className="text-brand-primary/14" />
          {/* Sparkles */}
          <path d="M70 44l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2-5.2-1.8 5.2-1.8z" fill="currentColor" className="text-brand-primary/35" />
          <path d="M96 30l1.2 3.5 3.5 1.2-3.5 1.2-1.2 3.5-1.2-3.5-3.5-1.2 3.5-1.2z" fill="currentColor" className="text-brand-primary/20" />
          <path d="M44 34l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z" fill="currentColor" className="text-brand-primary/14" />
        </svg>
      )

    default:
      return (
        <svg className={baseClass} width="140" height="140" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="g-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#g-glow)" />
          <circle cx="70" cy="70" r="46" fill="currentColor" className="text-brand-primary/5" />
          {/* Inbox */}
          <rect x="38" y="44" width="60" height="48" rx="8" fill="currentColor" className="text-brand-primary/10" />
          <path d="M38 68h18l5 10h14l5-10h18" stroke="currentColor" className="text-brand-primary/18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

// ─── Icon fallbacks by illustration type ──────
const illustrationIconMap: Record<string, DSIconName> = {
  students: 'users',
  workouts: 'dumbbell',
  payments: 'creditCard',
  notifications: 'bell',
  assessments: 'clipboardList',
  search: 'search',
  marketplace: 'shoppingBag',
  generic: 'inbox',
}

// ─── Animation variants — MD3 spring physics ──
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9, filter: 'blur(6px)' },
  visible: { 
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 22 }
  }
}

const illustrationVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, filter: 'blur(12px)' },
  visible: { 
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
}

const floatVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
  }
}

// ─── Main Component ───────────────────────────

export function EmptyState({
  icon,
  illustration = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const fallbackIcon: DSIconName = icon || illustrationIconMap[illustration] || 'inbox'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8' : 'py-14',
        className
      )}
    >
      {/* Illustration with floating animation + particles */}
      {!compact ? (
        <motion.div variants={illustrationVariants} className="relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-brand-primary/10 blur-3xl animate-breathe" />
          <FloatingParticles />
          <motion.div variants={floatVariants} animate="animate">
            <EmptyIllustration type={illustration} />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="md3-surface-elevated flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <DSIcon name={fallbackIcon} size={28} className="text-text-secondary" />
        </motion.div>
      )}

      <motion.h3 variants={itemVariants} className={cn(
        'font-semibold text-text-primary',
        compact ? 'mt-3 text-sm' : 'mt-6 text-base'
      )}>
        {title}
      </motion.h3>

      {description && (
        <motion.p variants={itemVariants} className={cn(
          'text-text-secondary',
          compact ? 'mt-1 max-w-xs text-xs' : 'mt-2 max-w-sm text-sm leading-relaxed'
        )}>
          {description}
        </motion.p>
      )}

      {actionLabel && onAction && (
        <motion.div variants={itemVariants}>
          <Button onClick={onAction} className="mt-6" size={compact ? 'sm' : 'md'}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
