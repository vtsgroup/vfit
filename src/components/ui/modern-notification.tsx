/**
 * src/components/ui/modern-notification.tsx
 *
 * Modern Notification — In-app notification cards
 *
 * Exports: NotificationItem, NotificationCard, NotificationPanel
 * Hooks: useState
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Modern Notification — In-app notification cards
// With slide-in animation, action buttons, glassmorphism
// ============================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'

// ============================================
// Types
// ============================================

export interface NotificationItem {
  id: string
  type: 'workout' | 'assessment' | 'payment' | 'student' | 'ai' | 'system'
  title: string
  description: string
  time: string
  read?: boolean
  href?: string
  action?: string
}

// ============================================
// Config
// ============================================

const NOTIF_CONFIG: Record<string, {
  icon: DSIconName
  bg: string
  iconColor: string
  dotColor: string
}> = {
  workout: {
    icon: 'dumbbell',
    bg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  assessment: {
    icon: 'clipboardList',
    bg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    dotColor: 'bg-violet-400',
  },
  payment: {
    icon: 'creditCard',
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  student: {
    icon: 'userPlus',
    bg: 'bg-brand-primary/10',
    iconColor: 'text-brand-primary',
    dotColor: 'bg-brand-primary',
  },
  ai: {
    icon: 'sparkles',
    bg: 'bg-lime-500/10',
    iconColor: 'text-lime-400',
    dotColor: 'bg-lime-400',
  },
  system: {
    icon: 'bell',
    bg: 'bg-brand-primary/10',
    iconColor: 'text-brand-primary',
    dotColor: 'bg-brand-primary',
  },
}

// ============================================
// Single Notification Card
// ============================================

export function NotificationCard({
  notification,
  onDismiss,
  onClick,
}: {
  notification: NotificationItem
  onDismiss?: (id: string) => void
  onClick?: (notification: NotificationItem) => void
}) {
  const config = NOTIF_CONFIG[notification.type] || NOTIF_CONFIG.system

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, x: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, x: -16, scale: 0.96, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
      onClick={() => onClick?.(notification)}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border dark:border-white/6 light:border-slate-200 p-3.5',
        'dark:bg-kpi-dark/80 light:bg-white/80 backdrop-blur-lg',
        'dark:hover:bg-kpi-dark dark:hover:border-white/10 light:hover:bg-slate-50 light:hover:border-slate-300 transition-all duration-200',
        onClick && 'cursor-pointer',
        !notification.read && 'border-l-2 border-l-brand-primary'
      )}
    >
      {/* Icon */}
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', config.bg)}>
        <DSIcon name={config.icon} size={18} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium',
            notification.read ? 'dark:text-white/70 light:text-slate-500' : 'dark:text-white light:text-slate-900'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <motion.div
              className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', config.dotColor)}
              animate={{ scale: [1, 1.28, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
        <p className="mt-0.5 text-xs dark:text-white/50 light:text-slate-500 line-clamp-2">{notification.description}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] dark:text-white/30 light:text-slate-400">
            <DSIcon name="clock" size={12} />
            {notification.time}
          </span>
          {notification.action && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-primary">
              {notification.action}
              <DSIcon name="chevronRight" size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
          className="shrink-0 rounded-lg p-1 dark:text-white/20 light:text-slate-300 opacity-0 group-hover:opacity-100 dark:hover:text-white/60 light:hover:text-slate-600 dark:hover:bg-white/5 light:hover:bg-black/5 transition-all"
        >
          <DSIcon name="x" size={14} />
        </button>
      )}
    </motion.div>
  )
}

// ============================================
// Notification Panel (dropdown overlay)
// ============================================

export function NotificationPanel({
  notifications,
  open,
  onClose,
  onRead,
  onDismiss,
  onClearAll,
}: {
  notifications: NotificationItem[]
  open: boolean
  onClose: () => void
  onRead?: (id: string) => void
  onDismiss?: (id: string) => void
  onClearAll?: () => void
}) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-998 bg-black/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed right-4 top-16 z-999 w-95 max-h-[70vh] overflow-hidden',
              'rounded-2xl border dark:border-white/10 light:border-slate-200 bg-bg-secondary/95 backdrop-blur-2xl',
              'shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(16,185,129,0.05)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-white/6 light:border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <DSIcon name="bell" size={16} className="dark:text-white/60 light:text-slate-400" />
                <h3 className="text-sm font-semibold dark:text-white light:text-slate-900">Notificações</h3>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[10px] font-bold text-black">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {onClearAll && notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="rounded-lg px-2 py-1 text-[10px] font-medium dark:text-white/40 light:text-slate-400 dark:hover:text-white/70 light:hover:text-slate-700 dark:hover:bg-white/5 light:hover:bg-black/5 transition-all"
                  >
                    Limpar tudo
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 dark:text-white/40 light:text-slate-400 dark:hover:text-white/80 light:hover:text-slate-700 dark:hover:bg-white/5 light:hover:bg-black/5 transition-all"
                >
                  <DSIcon name="x" size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[calc(70vh-56px)] overflow-y-auto p-2 space-y-1.5">
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2 py-12 text-center"
                  >
                    <DSIcon name="bell" size={32} className="dark:text-white/10 light:text-slate-200" />
                    <p className="text-sm dark:text-white/30 light:text-slate-400">Nenhuma notificação</p>
                  </motion.div>
                ) : (
                  notifications.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onDismiss={onDismiss}
                      onClick={() => onRead?.(notif.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
