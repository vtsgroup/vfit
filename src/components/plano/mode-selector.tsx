/**
 * src/components/plano/mode-selector.tsx
 *
 * Bottom sheet para seleção de modo de treino:
 * - Plano IA (padrão)
 * - Criar treino manual
 * - Treino rápido
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'

interface ModeSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (mode: 'ai' | 'manual' | 'quick') => void
  currentMode?: 'ai' | 'manual' | 'quick'
}

const MODES = [
  {
    id: 'ai' as const,
    title: 'Plano de Treino VFIT IA',
    description: 'Plano personalizado gerado pela inteligência artificial',
    emoji: '🤖',
    badge: 'Recomendado',
    badgeColor: 'text-brand-primary bg-brand-primary/10',
  },
  {
    id: 'manual' as const,
    title: 'Criar treino manual',
    description: 'Monte seu próprio treino exercício por exercício',
    emoji: '✏️',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'quick' as const,
    title: 'Treino rápido',
    description: 'Gere um treino on-the-fly para hoje',
    emoji: '⚡',
    badge: 'Em breve',
    badgeColor: 'text-amber-500 bg-amber-500/10',
  },
]

export function ModeSelector({ open, onClose, onSelect, currentMode = 'ai' }: ModeSelectorProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-bg-primary pb-8 pt-4 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-text-muted/30" />

        <div className="px-5">
          <h2 className="mb-1 text-lg font-bold text-text-primary">Selecione seu modo</h2>
          <p className="mb-5 text-sm text-text-secondary">Como você quer treinar?</p>

          <div className="space-y-2">
            {MODES.map((mode) => {
              const isActive = currentMode === mode.id
              const isDisabled = mode.id === 'quick'

              return (
                <button
                  key={mode.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelect(mode.id)
                      onClose()
                    }
                  }}
                  className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all ${
                    isActive
                      ? 'border-2 border-brand-primary bg-brand-primary/5'
                      : 'border border-border-primary bg-bg-secondary hover:border-brand-primary/30'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <span className="mt-0.5 text-2xl">{mode.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{mode.title}</span>
                      {mode.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${mode.badgeColor}`}>
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">{mode.description}</p>
                  </div>
                  {isActive && (
                    <DSIcon name="check" size={18} className="mt-1 shrink-0 text-brand-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
