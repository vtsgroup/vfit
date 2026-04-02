/**
 * src/components/pwa/push-notification-prompt.tsx
 *
 * Push Notification Prompt Card
 *
 * Exports: PushNotificationPrompt, NotificationStatusBadge
 * Hooks: useState, useEffect, useOneSignal, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

'use client'

import { useState, useEffect } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { useOneSignal } from '@/components/providers/onesignal-provider'
import { Button } from '@/components/ui/button'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'

// ============================================
// Push Notification Prompt Card
// Shows in dashboard when notifications not yet enabled
// More persistent for students — re-appears every 4h
// ============================================

const DISMISSED_KEY = 'vfit-push-dismissed'
const DISMISS_COUNT_KEY = 'vfit-push-dismiss-count'

// Dismiss escalation: 4h → 12h → 24h → 3 days (cap)
function getDismissDuration(): number {
  if (typeof window === 'undefined') return 4 * 60 * 60 * 1000
  const count = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10)
  if (count <= 1) return 4 * 60 * 60 * 1000    // 4 hours
  if (count === 2) return 12 * 60 * 60 * 1000   // 12 hours
  if (count === 3) return 24 * 60 * 60 * 1000   // 24 hours
  return 3 * 24 * 60 * 60 * 1000                // 3 days cap
}

export function PushNotificationPrompt() {
  const { requestPermission, getPermissionStatus } = useOneSignal()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const userType = useAuthStore((s) => s.user?.user_type)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    const permission = getPermissionStatus()

    // Already granted — don't show
    if (permission === 'granted') return

    // If denied, show a different version telling them to go to browser settings
    // But still check dismiss timing
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < getDismissDuration()) return
    }

    // Show after a brief delay so it doesn't appear abruptly
    const delay = permission === 'denied' ? 5000 : 1500
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [getPermissionStatus, userType])

  // Poll Notification.permission to auto-dismiss when granted
  // (permissionchange event isn't widely supported)
  useEffect(() => {
    if (!visible || typeof Notification === 'undefined') return

    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        setVisible(false)
        setLoading(false)
        localStorage.removeItem(DISMISSED_KEY)
        localStorage.removeItem(DISMISS_COUNT_KEY)
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [visible])

  async function handleEnable() {
    setLoading(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        toast.success('Notificações ativadas!')
        setVisible(false)
        // Reset dismiss counter on success
        localStorage.removeItem(DISMISSED_KEY)
        localStorage.removeItem(DISMISS_COUNT_KEY)
      } else {
        toast.error('Permissão negada. Ative nas configurações do navegador.')
        // Still count as dismiss
        handleDismiss()
      }
    } catch {
      toast.error('Erro ao ativar notificações')
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    const count = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10)
    localStorage.setItem(DISMISS_COUNT_KEY, (count + 1).toString())
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setVisible(false)
  }

  if (!visible) return null

  const isDenied = getPermissionStatus() === 'denied'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border',
        isDenied
          ? 'border-status-warning/30 bg-linear-to-r from-status-warning/5 via-status-warning/10 to-status-warning/5'
          : 'border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-brand-primary/10 to-brand-primary/5',
        'p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2'
      )}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
        aria-label="Fechar"
      >
        <DSIcon name="close" size={16} />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          isDenied ? 'bg-status-warning/20' : 'bg-brand-primary/20'
        )}>
          {isDenied
            ? <DSIcon name="bellOff" size={20} className="text-status-warning" />
            : <DSIcon name="bell" size={20} className="text-brand-primary" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">
            {isDenied ? 'Notificações bloqueadas' : 'Ative as notificações'}
          </h3>
          <p className="mt-1 text-xs text-text-muted leading-relaxed">
            {isDenied
              ? 'As notificações estão bloqueadas no seu navegador. Para receber alertas de treinos e atualizações, acesse as configurações do site no navegador e permita notificações.'
              : 'Receba alertas de novos treinos, lembretes de pagamento e atualizações importantes em tempo real. Não perca nenhuma atualização!'
            }
          </p>

          <div className="mt-3 flex items-center gap-2">
            {isDenied ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-xs"
              >
                <DSIcon name="smartphone" size={14} className="mr-1.5" />
                Entendi
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleEnable}
                  loading={loading}
                  className="text-xs"
                >
                  <DSIcon name="bell" size={14} className="mr-1.5" />
                  Ativar notificações
                </Button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1"
                >
                  Depois
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Notification Status Badge (for settings page)
// ============================================

export function NotificationStatusBadge() {
  const { getPermissionStatus } = useOneSignal()
  const [status, setStatus] = useState<NotificationPermission>('default')

  useEffect(() => {
    setStatus(getPermissionStatus())
  }, [getPermissionStatus])

  const config = {
    granted: { label: 'Ativadas', className: 'bg-status-success/10 text-status-success', icon: 'bell' as DSIconName },
    denied: { label: 'Bloqueadas', className: 'bg-status-error/10 text-status-error', icon: 'bellOff' as DSIconName },
    default: { label: 'Não configuradas', className: 'bg-status-warning/10 text-status-warning', icon: 'bell' as DSIconName },
  }

  const { label, className, icon } = config[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', className)}>
      <DSIcon name={icon} size={12} />
      {label}
    </span>
  )
}
