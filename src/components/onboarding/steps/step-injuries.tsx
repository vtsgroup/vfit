/**
 * src/components/onboarding/steps/step-injuries.tsx
 *
 * Onboarding Step — Lesões ou restrições
 * Multi-select chips (pode pular)
 */

'use client'

import { useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { useOnboardingStore } from '@/stores/onboarding-store'

const INJURY_OPTIONS = [
  { id: 'knee', label: 'Joelho', emoji: '🦵' },
  { id: 'shoulder', label: 'Ombro', emoji: '💪' },
  { id: 'back_lower', label: 'Lombar', emoji: '🔙' },
  { id: 'back_upper', label: 'Coluna', emoji: '🦴' },
  { id: 'wrist', label: 'Pulso', emoji: '✋' },
  { id: 'ankle', label: 'Tornozelo', emoji: '🦶' },
  { id: 'hip', label: 'Quadril', emoji: '🦿' },
  { id: 'neck', label: 'Pescoço', emoji: '🧣' },
  { id: 'none', label: 'Nenhuma', emoji: '✅' },
]

export function StepInjuries() {
  const { data, updateData } = useOnboardingStore()
  const selected = data.injuries

  const toggle = useCallback(
    (id: string) => {
      if (id === 'none') {
        updateData({ injuries: selected.includes('none') ? [] : ['none'] })
        return
      }
      const without = selected.filter((i) => i !== 'none')
      if (without.includes(id)) {
        updateData({ injuries: without.filter((i) => i !== id) })
      } else {
        updateData({ injuries: [...without, id] })
      }
    },
    [selected, updateData]
  )

  return (
    <div className="space-y-6">
      <p className="text-xs text-white/40">
        Adaptaremos exercícios para proteger áreas sensíveis
      </p>

      <div className="flex flex-wrap gap-2.5">
        {INJURY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-300 ${
                isSelected
                  ? opt.id === 'none'
                    ? 'border-brand-primary bg-brand-primary/15 scale-[1.03]'
                    : 'border-orange-400/50 bg-orange-400/10 scale-[1.03]'
                  : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span
                className={`text-sm font-medium transition-colors ${
                  isSelected ? 'text-white' : 'text-white/70'
                }`}
              >
                {opt.label}
              </span>
              {isSelected && (
                <DSIcon
                  name="check"
                  className={`h-3.5 w-3.5 ${opt.id === 'none' ? 'text-brand-primary' : 'text-orange-400'}`}
                />
              )}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && !selected.includes('none') && (
        <p className="text-center text-xs text-white/40">
          {selected.length} {selected.length === 1 ? 'lesão selecionada' : 'lesões selecionadas'} — treino adaptado
        </p>
      )}
    </div>
  )
}
