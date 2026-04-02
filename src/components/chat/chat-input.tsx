/**
 * src/components/chat/chat-input.tsx
 *
 * ChatInput — Input de mensagem com envio
 *
 * Exports: ChatInput
 * Hooks: useState, useRef, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// ChatInput — Input de mensagem com envio
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (content: string, type?: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Digite sua mensagem...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setMessage('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, disabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-zinc-800 p-3 bg-zinc-900/50">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="max-h-30 min-h-11 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/25 focus:ring-offset-1 focus:ring-offset-bg-dark disabled:opacity-50"
          />
        </div>

        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
        >
          <DSIcon name="send" size={18} />
        </Button>
      </div>
    </div>
  )
}
