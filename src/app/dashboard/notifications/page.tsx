/**
 * src/app/dashboard/notifications/page.tsx
 *
 * Notifications page (shared by personal + student)
 *
 * Exports: NotificationsPage
 * Hooks: useEffect, useMemo, useRef, useState, useRouter, useNotifications
 * Features: 'use client' · React Query · DSIcon
 */

// ============================================
// Notifications page (shared by personal + student)
// ============================================

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { FilterPills } from '@/components/ui/filter-pills'
import { NotificationsPageSkeleton } from '@/components/ui/page-skeletons'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import { PageHeader } from '@/components/ui/page-header'
import { useNotifications, useUnreadCount, type NotificationItem } from '@/hooks/use-student-app'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { emitCacheEvent } from '@/lib/cache-events'
import { toast } from '@/stores/app-store'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'unread' | 'all'>('unread')
  const [category, setCategory] = useState<'all' | 'payments' | 'workouts' | 'system'>('all')
  const [items, setItems] = useState<NotificationItem[]>([])
  const unreadOnly = tab === 'unread'
  const router = useRouter()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const { data: unread } = useUnreadCount()
  const { data, isLoading, isError, error, refetch, isFetching } = useNotifications({ page, per_page: 20, unread_only: unreadOnly })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => {
      toast.success('Todas marcadas como lidas')
      emitCacheEvent({ type: 'notifications:changed' })
    },
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      emitCacheEvent({ type: 'notifications:changed' })
    },
  })

  const deleteNotification = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      emitCacheEvent({ type: 'notifications:changed' })
    },
  })

  const clearRead = useMutation({
    mutationFn: () => api.delete('/notifications/clear'),
    onSuccess: () => {
      toast.success('Notificações lidas removidas')
      emitCacheEvent({ type: 'notifications:changed' })
    },
  })

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications])
  const meta = data?.meta
  const hasNextPage = Boolean(meta && page < meta.total_pages)

  useEffect(() => {
    if (page === 1) {
      setItems(notifications)
      return
    }

    if (notifications.length === 0) return

    setItems((prev) => {
      const map = new Map(prev.map((n) => [n.id, n]))
      for (const n of notifications) map.set(n.id, n)
      return Array.from(map.values())
    })
  }, [notifications, page])

  useEffect(() => {
    setPage(1)
    setItems([])
  }, [tab])

  useEffect(() => {
    if (!sentinelRef.current) return

    const node = sentinelRef.current
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (!first?.isIntersecting) return
      if (!hasNextPage || isFetching) return
      setPage((p) => p + 1)
    }, { threshold: 0.2 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching])

  const filteredItems = useMemo(() => {
    if (category === 'all') return items
    return items.filter((n) => classifyNotification(n) === category)
  }, [category, items])

  const unreadCount = unread?.unread_count ?? 0

  return (
    <AuthGuard>
      <div className="space-y-4 stagger-children overflow-hidden">
        {/* Header — DS v3 PageHeader */}
        <div className="space-y-4">
          <PageHeader
            title="Notificações"
            icon="bell"
            description={`${filteredItems.length} notificação${filteredItems.length !== 1 ? 'ões' : ''}`}
            actions={
              <div className="flex shrink-0 items-center gap-2">
                {tab === 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearRead.mutate()}
                    loading={clearRead.isPending}
                    disabled={unreadOnly}
                    title="Remove do app as notificações já lidas"
                    className="max-sm:px-2"
                  >
                    <DSIcon name="trash" size={16} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Limpar lidas</span>
                  </Button>
                )}

                {filteredItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllRead.mutate()}
                    loading={markAllRead.isPending}
                    className="max-sm:px-2"
                  >
                    <DSIcon name="checkCheck" size={16} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Marcar todas como lidas</span>
                  </Button>
                )}
              </div>
            }
          />

          {/* Read status — SlidingTabs DS v3 */}
          <SlidingTabs
            tabs={[
              { key: 'unread', label: 'Não lidas', count: unreadCount > 0 ? unreadCount : undefined },
              { key: 'all', label: 'Todas' },
            ]}
            activeTab={tab}
            onChange={(key) => { setTab(key as 'unread' | 'all'); setPage(1) }}
          />

          {/* Category — DS v3 Filter Pills */}
          <FilterPills
            options={[
              { key: 'all', label: 'Todas' },
              { key: 'payments', label: 'Pagamentos' },
              { key: 'workouts', label: 'Treinos' },
              { key: 'system', label: 'Sistema' },
            ]}
            selected={category}
            onChange={(key) => setCategory(key as 'all' | 'payments' | 'workouts' | 'system')}
          />
        </div>

        {/* List */}
        {isFetching && filteredItems.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <DSIcon name="loader" size={14} className="animate-spin" />
            Atualizando notificações...
          </div>
        )}

        {isLoading && filteredItems.length === 0 ? (
          <NotificationsPageSkeleton />
        ) : isError && filteredItems.length === 0 ? (
          <EmptyStateDS
            icon="bellOff"
            title="Erro ao carregar notificações"
            description={error instanceof Error ? error.message : 'Tente novamente em alguns segundos.'}
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyStateDS
            icon="bellOff"
            title="Nenhuma notificação"
            description="Você está em dia! Novas notificações aparecerão aqui."
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onRead={() => markRead.mutate(n.id)}
                onDelete={() => deleteNotification.mutate(n.id)}
                onOpen={() => {
                  if (!n.read_at) markRead.mutate(n.id)
                  if (n.link) router.push(n.link)
                }}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {hasNextPage && (
              <div className="flex items-center justify-center gap-2 py-3">
                {isFetching && <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-light border-t-brand-primary" />}
                <span className="text-xs text-text-muted">{isFetching ? 'Carregando...' : 'Rolar para mais'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

/* Strip emoji characters from text (backward compat for old DB entries) */
function stripEmoji(text: string): string {
  if (!text) return text
  return text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim()
}

function classifyNotification(notification: NotificationItem): 'payments' | 'workouts' | 'system' {
  const type = (notification.type || '').toLowerCase()
  const text = `${notification.title} ${notification.message}`.toLowerCase()

  if (type.includes('payment') || type.includes('invoice') || text.includes('pagamento') || text.includes('cobran')) {
    return 'payments'
  }
  if (type.includes('workout') || type.includes('exercise') || text.includes('treino') || text.includes('exerc')) {
    return 'workouts'
  }
  return 'system'
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
  onOpen,
}: {
  notification: NotificationItem
  onRead: () => void
  onDelete: () => void
  onOpen: () => void
}) {
  const isRead = !!notification.read_at
  const category = classifyNotification(notification)

  const iconConfig = {
    payments: { icon: 'dollar' as DSIconName, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/12', accent: 'border-l-emerald-500' },
    workouts: { icon: 'dumbbell' as DSIconName, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/12', accent: 'border-l-violet-500' },
    system: { icon: 'settings' as DSIconName, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/12', accent: 'border-l-blue-500' },
  }[category]!

  const Wrapper = notification.link ? 'button' : 'div'

  return (
    <Wrapper
      {...(notification.link ? {
        type: 'button' as const,
        'aria-label': `${notification.read_at ? '' : 'Nova: '}${stripEmoji(notification.title)}`,
        onClick: () => onOpen(),
      } : {})}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl border py-4 px-5 text-left backdrop-blur-md',
        // Explicit transition properties (no transition-all)
        'transition-[transform,box-shadow] duration-200 ease-out',
        'shadow-sm',
        'hover:shadow-lg hover:-translate-y-0.5',
        // Focus ring — a11y
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-1',
        // Reduced motion: disable transform
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        // Left accent border (DS v3 Notification Card style)
        'border-l-3',
        isRead
          ? 'border-border-light border-l-border-light bg-bg-primary'
          : `border-border-light ${iconConfig.accent} bg-bg-primary`,
        notification.link && 'cursor-pointer'
      )}
    >
      {/* Category icon — DS v3 rounded square with category color bg */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-200',
        isRead ? 'bg-bg-tertiary' : iconConfig.bg
      )}>
        <DSIcon
          name={isRead ? 'bell' : iconConfig.icon}
          size={18}
          className={cn(isRead ? 'text-text-muted' : iconConfig.color)}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm leading-snug', isRead ? 'text-text-secondary' : 'font-semibold text-text-primary')}>
          {stripEmoji(notification.title)}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-text-muted line-clamp-2">{stripEmoji(notification.message)}</p>
        <p className="mt-0.5 text-xs text-text-muted">
          {new Date(notification.created_at).toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Action buttons — DS v3 ActionBtn style */}
      <div className="flex shrink-0 gap-2">
        {!isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead() }}
            aria-label="Marcar como lida"
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              'border border-border-light bg-bg-secondary text-text-muted',
              'transition-[transform,background-color,border-color,color] duration-150 ease-out',
              'hover:scale-112 hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-emerald-600',
              'active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1',
              'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
              'dark:border-white/8 dark:bg-white/5 dark:hover:bg-emerald-500/12 dark:hover:text-emerald-400'
            )}
          >
            <DSIcon name="check" size={16} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Remover notificação"
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            'border border-border-light bg-bg-secondary text-text-muted',
            'transition-[transform,background-color,border-color,color] duration-150 ease-out',
            'hover:scale-112 hover:border-red-400/30 hover:bg-red-50 hover:text-red-500',
            'active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1',
            'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
            'dark:border-white/8 dark:bg-white/5 dark:hover:bg-red-500/12 dark:hover:text-red-400'
          )}
        >
          <DSIcon name="trash" size={16} />
        </button>
      </div>
    </Wrapper>
  )
}
