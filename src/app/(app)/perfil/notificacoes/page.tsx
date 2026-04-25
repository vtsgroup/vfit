/**
 * src/app/(app)/perfil/notificacoes/page.tsx
 *
 * Inbox de notificações reais do aluno.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { emitCacheEvent } from '@/lib/cache-events'
import { toast } from '@/stores/app-store'
import { useNotifications, useUnreadCount, type NotificationItem } from '@/hooks/use-student-app'

function classifyNotification(notification: NotificationItem): 'payments' | 'workouts' | 'system' {
  const type = (notification.type || '').toLowerCase()
  const text = `${notification.title} ${notification.message}`.toLowerCase()
  if (type.includes('payment') || type.includes('invoice') || text.includes('pagamento') || text.includes('cobran')) return 'payments'
  if (type.includes('workout') || type.includes('exercise') || text.includes('treino') || text.includes('exerc')) return 'workouts'
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
    payments: { icon: 'dollar' as DSIconName, color: 'text-emerald-400', bg: 'bg-emerald-500/12', accent: 'border-l-emerald-500/70' },
    workouts: { icon: 'dumbbell' as DSIconName, color: 'text-violet-400', bg: 'bg-violet-500/12', accent: 'border-l-violet-500/70' },
    system: { icon: 'settings' as DSIconName, color: 'text-sky-300', bg: 'bg-sky-400/12', accent: 'border-l-sky-400/70' },
  }[category]

  const Wrapper = notification.link ? 'button' : 'div'

  return (
    <Wrapper
      {...(notification.link ? { type: 'button' as const, onClick: () => onOpen(), 'aria-label': notification.title } : {})}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl border border-white/10 border-l-3 bg-white/4 px-4 py-3 text-left',
        'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg',
        isRead ? 'border-l-white/15' : iconConfig.accent,
        notification.link && 'cursor-pointer'
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]', isRead ? 'bg-white/6' : iconConfig.bg)}>
        <DSIcon name={isRead ? 'bell' : iconConfig.icon} size={18} className={cn(isRead ? 'text-white/60' : iconConfig.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm leading-snug', isRead ? 'text-white/80' : 'font-semibold text-white')}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/65">{notification.message}</p>
        <p className="mt-0.5 text-xs text-white/45">{new Date(notification.created_at).toLocaleString('pt-BR')}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        {!isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead() }}
            aria-label="Marcar como lida"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <DSIcon name="check" size={16} />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Remover notificação"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition-colors hover:border-red-500/40 hover:text-red-300"
        >
          <DSIcon name="trash" size={16} />
        </button>
      </div>
    </Wrapper>
  )
}

export default function NotificacoesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'unread' | 'all'>('unread')
  const [items, setItems] = useState<NotificationItem[]>([])

  const unreadOnly = tab === 'unread'
  const { data: unread } = useUnreadCount()
  const { data, isLoading, isFetching } = useNotifications({ page, per_page: 20, unread_only: unreadOnly })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => {
      toast.success('Todas marcadas como lidas')
      emitCacheEvent({ type: 'notifications:changed' })
    },
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => emitCacheEvent({ type: 'notifications:changed' }),
  })

  const deleteNotification = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => emitCacheEvent({ type: 'notifications:changed' }),
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

  return (
    <div className="mx-auto max-w-lg px-4 pt-0 pb-24">
      <div className="-mx-4 mb-5 rounded-b-3xl border-b-0 bg-linear-to-b from-vfit-primary-500 to-vfit-primary-700 px-4 py-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              aria-label="Voltar"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
            >
              <DSIcon name="arrowLeft" size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Notificações</h1>
              <p className="text-[11px] text-white/60">{items.length} item(ns)</p>
            </div>
          </div>

          {items.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
              className=""
            >
              <DSIcon name="checkCheck" size={14} />
              Ler tudo
            </Button>
          )}
        </div>

        <div className="mt-4 inline-flex rounded-xl border border-white/10 bg-bg-secondary/80 p-1">
          <button
            onClick={() => setTab('unread')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'unread'
                ? 'bg-brand-primary/90 text-white shadow'
                : 'text-white/80 hover:text-white'
            )}
          >
            Não lidas {unread?.unread_count ? `(${unread.unread_count})` : ''}
          </button>
          <button
            onClick={() => setTab('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'all'
                ? 'bg-brand-primary/90 text-white shadow'
                : 'text-white/80 hover:text-white'
            )}
          >
            Todas
          </button>
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="py-10 text-center text-white/60">Carregando notificações...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/4 p-6 text-center">
          <DSIcon name="bellOff" size={22} className="mx-auto mb-2 text-white/60" />
          <p className="text-sm font-semibold text-white">Nenhuma notificação</p>
          <p className="mt-1 text-xs text-white/60">Você está em dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
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

          {hasNextPage && (
            <Button
              variant="outline"
              className="mt-2 w-full border-white/15 bg-white/6 text-white hover:bg-white/10"
              onClick={() => setPage((p) => p + 1)}
              loading={isFetching}
            >
              Carregar mais
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
