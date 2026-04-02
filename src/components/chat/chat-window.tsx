/**
 * src/components/chat/chat-window.tsx
 *
 * ChatWindow — Janela principal do chat
 *
 * Exports: ChatWindow
 * Hooks: useEffect, useRef, useCallback, useState, useAuthStore, useMessages
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// ChatWindow — Janela principal do chat
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { useMessages, useSendMessage, useMarkRead, type Conversation, type Message } from '@/hooks/use-chat'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'

interface ChatWindowProps {
  conversation: Conversation
  onBack?: () => void
  onArchive?: (conversationId: string) => void
}

export function ChatWindow({ conversation, onBack, onArchive }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id || ''
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  const { data, isLoading } = useMessages(conversation.id)
  const sendMessage = useSendMessage(conversation.id)
  const markRead = useMarkRead(conversation.id)

  const messages = data?.messages || []

  // Mark as read when opening conversation or receiving new messages
  useEffect(() => {
    if (conversation.unread_count > 0) {
      markRead.mutate()
    }
  }, [conversation.id, conversation.unread_count]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive (if user is at bottom)
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isAtBottom])

  // Initial scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' })
    }
  }, [conversation.id])

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const threshold = 80
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < threshold)
  }, [])

  const handleSend = useCallback((content: string) => {
    sendMessage.mutate({ content, message_type: 'text' })
  }, [sendMessage])

  // Group messages for avatar display (show avatar on first message of a streak)
  const shouldShowAvatar = (msg: Message, idx: number) => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    return prev.sender_id !== msg.sender_id || prev.message_type === 'system'
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950/30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        {/* Back button (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <DSIcon name="arrowLeft" size={20} />
          </button>
        )}

        {/* Participant info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {conversation.participant_avatar ? (
            <Image
              src={conversation.participant_avatar}
              alt={conversation.participant_name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover shrink-0"
              unoptimized
              priority
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {conversation.participant_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {conversation.participant_name}
            </h3>
            <p className="text-[11px] text-zinc-500 capitalize">
              {conversation.participant_type === 'personal' ? 'Personal Trainer' : 'Aluno'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <DSIcon name="settings" size={18} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 min-w-40">
                {onArchive && (
                  <button
                    onClick={() => {
                      onArchive(conversation.id)
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                  >
                    <DSIcon name="archive" size={16} />
                    Arquivar conversa
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[60%] h-12 rounded-2xl animate-pulse ${
                  i % 2 === 0 ? 'bg-zinc-800/50' : 'bg-emerald-600/20'
                }`} style={{ width: `${30 + Math.random() * 40}%` }} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500">
              Nenhuma mensagem ainda. Envie a primeira!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === userId}
              showAvatar={shouldShowAvatar(msg, idx)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={sendMessage.isPending}
      />
    </div>
  )
}
