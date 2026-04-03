/**
 * src/components/chat/conversation-list.tsx
 *
 * ConversationList — Lista de conversas
 *
 * Exports: ConversationList
 * Hooks: useState
 * Features: 'use client' · DSIcon
 */

// ============================================
// ConversationList — Lista de conversas
// ============================================

'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DSIcon } from '@/components/ui/ds-icon'
import { useState } from 'react'
import Image from 'next/image'
import type { Conversation } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ConversationListProps {
  conversations: Conversation[]
  activeId?: string
  onSelect: (conversation: Conversation) => void
  onArchive?: (conversationId: string) => void
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onArchive,
  isLoading,
  isError,
  onRetry,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.participant_name.toLowerCase().includes(search.toLowerCase())
  )

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <DSIcon name="message" size={40} className="text-text-muted/40" />
        <p className="text-sm font-medium text-text-primary">Erro ao carregar conversas</p>
        <p className="text-xs text-text-muted">Não foi possível carregar suas mensagens.</p>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
          >
            Tentar Novamente
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-black/8 dark:bg-white/8" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-black/8 dark:bg-white/8 rounded" />
              <div className="h-3 w-40 bg-black/6 dark:bg-white/6 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border-light">
        <div className="relative">
          <DSIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-bg-secondary py-2 pl-9 pr-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-dark sm:text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/8 dark:bg-brand-primary/12">
              <DSIcon name="message" size={24} className="text-brand-primary/60" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {search ? 'Tente outro termo de busca' : 'Inicie uma conversa com seus alunos'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl p-3 text-left',
                  'transition-all duration-200',
                  activeId === conversation.id
                    ? 'border-l-[3px] border-l-brand-primary bg-brand-primary/6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:bg-brand-primary/10'
                    : 'border-l-[3px] border-l-transparent hover:bg-black/3 dark:hover:bg-white/4'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {conversation.participant_avatar ? (
                    <Image
                      src={conversation.participant_avatar}
                      alt={conversation.participant_name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/10"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white ring-2 ring-black/5 shadow-[0_2px_8px_rgba(16,185,129,0.25)] dark:ring-white/10">
                      {conversation.participant_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Unread badge */}
                  {conversation.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                      <span className="text-[10px] font-bold text-bg-dark">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'truncate text-[15px]',
                      conversation.unread_count > 0 ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'
                    )}>
                      {conversation.participant_name}
                    </span>
                    {conversation.last_message_at && (
                      <span className="ml-2 shrink-0 text-[11px] text-text-muted">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                  {conversation.last_message_preview && (
                    <p className={cn(
                      'mt-0.5 truncate text-[13px]',
                      conversation.unread_count > 0 ? 'font-medium text-text-secondary' : 'text-text-muted'
                    )}>
                      {conversation.last_message_preview}
                    </p>
                  )}
                </div>

                {/* Archive */}
                {onArchive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive(conversation.id)
                    }}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[10px]',
                      'border border-black/7 text-text-muted',
                      'opacity-0 transition-all duration-200 group-hover:opacity-100',
                      'hover:border-amber-400/30 hover:bg-amber-50 hover:text-amber-600',
                      'dark:border-white/8 dark:hover:bg-amber-500/12 dark:hover:text-amber-400'
                    )}
                    title="Arquivar"
                  >
                    <DSIcon name="archive" size={14} />
                  </button>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
