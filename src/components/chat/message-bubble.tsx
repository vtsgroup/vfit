/**
 * src/components/chat/message-bubble.tsx
 *
 * MessageBubble — Bolha de mensagem no chat
 *
 * Exports: MessageBubble
 * Features: 'use client' · DSIcon
 */

// ============================================
// MessageBubble — Bolha de mensagem no chat
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import type { Message } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // System messages
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 mb-1 group', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar (other person) */}
      {!isOwn && showAvatar && (
        <div className="shrink-0 mt-auto">
          {message.sender_avatar ? (
            <Image
              src={message.sender_avatar}
              alt={message.sender_name || ''}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
              {(message.sender_name || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-7 shrink-0" />}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] px-3.5 py-2 rounded-2xl relative',
          isOwn
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
        )}
      >
        {/* Image type */}
        {message.message_type === 'image' &&
          typeof message.metadata === 'object' &&
          message.metadata !== null &&
          'image_url' in message.metadata &&
          typeof (message.metadata as { image_url: string }).image_url === 'string' && (
            <Image
              src={(message.metadata as { image_url: string }).image_url}
              alt="Imagem"
              width={320}
              height={320}
              className="rounded-lg max-w-full mb-1.5"
              style={{ height: 'auto', width: '100%' }}
              unoptimizedwrap-break-word
            />
        )}

        {/* Text content */}
        <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
          {message.content}
        </p>

        {/* Time + read status */}
        <div className={cn(
          'flex items-center gap-1 mt-0.5',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-[10px]',
            isOwn ? 'text-emerald-200/70' : 'text-zinc-500'
          )}>
            {time}
          </span>
          {isOwn && (
            message.read_at ? (
              <DSIcon name="checkCheck" size={14} className="text-emerald-200" />
            ) : (
              <DSIcon name="check" size={14} className="text-emerald-200/50" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
