/**
 * src/components/chat/empty-chat.tsx
 *
 * EmptyChat — Estado vazio (nenhuma conversa selecionada)
 *
 * Exports: EmptyChat
 * Features: 'use client' · DSIcon
 */

// ============================================
// EmptyChat — Estado vazio (nenhuma conversa selecionada)
// ============================================

'use client'

import { DSIcon } from '@/components/ui/ds-icon'

interface EmptyChatProps {
  type?: 'no-selection' | 'no-conversations'
}

export function EmptyChat({ type = 'no-selection' }: EmptyChatProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-bg-secondary/60 dark:bg-bg-dark/50">
      {/* DS v3 Glass Card */}
      <div className="mx-4 max-w-sm rounded-2xl border border-black/7 bg-white/88 p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/7 dark:bg-white/6">
        {/* Icon container — 64px with gentle bounce */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/8 dark:bg-brand-primary/12">
          <DSIcon
            name="message"
            size={28}
            className="animate-bounce text-brand-primary"
            style={{ animationDuration: '3s', animationTimingFunction: 'ease-in-out' }}
          />
        </div>

        {type === 'no-selection' ? (
          <>
            <h3 className="text-lg font-bold tracking-tight text-text-primary">
              Selecione uma conversa
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Escolha uma conversa ao lado para começar a trocar mensagens.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold tracking-tight text-text-primary">
              Nenhuma conversa ainda
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Suas conversas com alunos e personal trainers aparecerão aqui.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
