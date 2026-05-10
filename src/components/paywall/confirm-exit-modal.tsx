'use client'

/**
 * src/components/paywall/confirm-exit-modal.tsx
 *
 * Modal "Tem certeza que deseja desistir?"
 * Mostra o que o usuário vai perder ao continuar sem premium
 */

import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

interface ConfirmExitModalProps {
  onStay: () => void
  onLeave: () => void
}

const LOSSES = [
  'Treinos personalizados com IA',
  'Biblioteca com 500+ exercícios',
  'Chat ilimitado com IA',
  'Análise de progresso avançada',
  'Novos treinos toda semana',
]

export function ConfirmExitModal({ onStay, onLeave }: ConfirmExitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onStay} />

      {/* Modal */}
      <div className="vfit-flow-panel relative z-10 w-full max-w-sm rounded-[2rem] p-6 text-white">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/8">
          <DSIcon name="frown" className="h-8 w-8 text-white/40" />
        </div>

        <h2 className="mb-2 text-center text-2xl font-black text-white">
          Tem certeza?
        </h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          Ao continuar sem premium, você vai perder acesso a:
        </p>

        {/* Losses list */}
        <div className="mb-6 space-y-2">
          {LOSSES.map((loss) => (
            <div key={loss} className="flex items-center gap-2">
              <DSIcon name="x" className="h-4 w-4 shrink-0 text-red-400" />
              <span className="text-sm text-slate-300">{loss}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full"
            onClick={onStay}
          >
            Voltar e Assinar
          </Button>
          <button
            onClick={onLeave}
            className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300"
          >
            Continuar sem premium
          </button>
        </div>
      </div>
    </div>
  )
}
