/**
 * src/app/dashboard/messages/page.tsx
 *
 * Messages page — Chat entre Personal e Aluno
 *
 * Exports: MessagesPage
 * Hooks: useSearchParams, useEffect, useState, useMemo, useConversations, useArchiveConversation
 * Features: 'use client' · DSIcon
 */

// ============================================
// Messages page — Chat entre Personal e Aluno
// ============================================

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, Suspense } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { MessagesPageSkeleton } from '@/components/ui/page-skeletons'
import {
  useConversations,
  useArchiveConversation,
  type Conversation,
} from '@/hooks/use-chat'
import { ConversationList, EmptyChat } from '@/components/chat'
import dynamic from 'next/dynamic'

// Lazy-load heavy chat window (only when conversation selected)
const ChatWindow = dynamic(() => import('@/components/chat/chat-window').then(m => m.ChatWindow), { ssr: false })
import { cn } from '@/lib/utils'

function MessagesContent() {
  const searchParams = useSearchParams()
  const deepLinkId = searchParams.get('conversation')

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [showChat, setShowChat] = useState(false) // mobile toggle

  const { data, isLoading, isError, refetch } = useConversations()
  const archiveMutation = useArchiveConversation()

  const conversations = useMemo(() => data?.conversations || [], [data])

  // Deep link from push notification → auto-select conversation
  useEffect(() => {
    if (deepLinkId && conversations.length > 0 && !activeConversation) {
      const found = conversations.find((c) => c.id === deepLinkId)
      if (found) {
        setActiveConversation(found)
        setShowChat(true)
      }
    }
  }, [deepLinkId, conversations, activeConversation])

  // Update active conversation data when polling refreshes list
  useEffect(() => {
    if (activeConversation) {
      const updated = conversations.find((c) => c.id === activeConversation.id)
      if (updated) {
        setActiveConversation(updated)
      }
    }
  }, [conversations]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setShowChat(true)
  }

  const handleBack = () => {
    setShowChat(false)
  }

  const handleArchive = (conversationId: string) => {
    archiveMutation.mutate(conversationId)
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null)
      setShowChat(false)
    }
  }

  return (
    <AuthGuard>
      <div className="h-[calc(100dvh-8.5rem-var(--demo-banner-offset,0px))] lg:h-[calc(100dvh-4rem-var(--demo-banner-offset,0px))]">
        {/* Header — DS v3 glass surface */}
        <div className="flex items-center gap-3 border-b border-border-light bg-bg-primary px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-primary/8 dark:bg-brand-primary/12">
            <DSIcon name="message" size={18} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-text-primary">Mensagens</h1>
            {conversations.length > 0 && (
              <p className="text-xs text-text-muted">
                {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Split layout */}
        <div className="flex h-[calc(100%-3.75rem)]">
          {/* Conversation list — hidden on mobile when chat is open */}
          <div
            className={cn(
              'w-full lg:w-80 xl:w-96 border-r border-border-light shrink-0',
              showChat ? 'hidden lg:block' : 'block'
            )}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              onArchive={handleArchive}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          </div>

          {/* Chat window — hidden on mobile when list is showing */}
          <div
            className={cn(
              'flex-1 min-w-0',
              showChat ? 'block' : 'hidden lg:block'
            )}
          >
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                onBack={handleBack}
                onArchive={handleArchive}
              />
            ) : (
              <EmptyChat
                type={conversations.length === 0 ? 'no-conversations' : 'no-selection'}
              />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <MessagesPageSkeleton />
    }>
      <MessagesContent />
    </Suspense>
  )
}
