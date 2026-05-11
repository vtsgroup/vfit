/**
 * src/components/onboarding/steps/step-gender.tsx
 *
 * Onboarding Step 1 — Gênero
 * Cards: Masculino / Feminino / Outro / Prefiro não dizer
 */

'use client'

import { OnboardingChoiceRow } from '../onboarding-choice'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'

type GenderOption = {
  value: NonNullable<OnboardingData['gender']>
  label: string
  description: string
  mark: string
  meta: string
  tone: 'emerald' | 'sky' | 'violet' | 'slate'
}

const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Masculino', description: 'Ajuste de força, descanso e gasto energético.', mark: 'M', meta: 'Fisiologia', tone: 'emerald' },
  { value: 'female', label: 'Feminino', description: 'Volume, recuperação e métricas calibradas.', mark: 'F', meta: 'Precisão', tone: 'sky' },
  { value: 'other', label: 'Outro', description: 'Plano neutro com adaptação por resposta.', mark: '+', meta: 'Inclusivo', tone: 'violet' },
  { value: 'prefer_not_say', label: 'Prefiro não dizer', description: 'Privacidade mantida, treino ainda personalizado.', mark: '—', meta: 'Privado', tone: 'slate' },
]

export function StepGender() {
  const { data, updateData } = useOnboardingStore()

  return (
    <div className="vfit-gender-options grid gap-2.5 sm:gap-3">
      {GENDER_OPTIONS.map((opt) => {
        const isSelected = data.gender === opt.value
        return (
          <OnboardingChoiceRow
            key={opt.value}
            onClick={() => updateData({ gender: opt.value })}
            selected={isSelected}
            label={opt.label}
            description={opt.description}
            mark={opt.mark}
            meta={opt.meta}
            tone={opt.tone}
          />
        )
      })}
    </div>
  )
}
