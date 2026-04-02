/**
 * src/app/(onboarding)/onboarding/page.tsx
 *
 * Onboarding Quiz — Main page
 * Renders current step based on useOnboardingStore.currentStep
 * Steps 0-4: Gender, Experience, Frequency, Goal, Location
 * Steps 5-9: Body Map, Motivational, Age, Height, Weight+BMI
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import type { OnboardingData } from '@/stores/onboarding-store'
import {
  OnboardingStepLayout,
  StepGender,
  StepExperience,
  StepFrequency,
  StepGoal,
  StepLocation,
  StepBodyMap,
  StepMotivational,
  StepAge,
  StepHeight,
  StepWeight,
  StepTargetWeight,
  StepDaysPerWeek,
  StepSessionDuration,
  StepInjuries,
  StepPreferredTime,
  StepSocialProof,
  StepReady,
} from '@/components/onboarding'
import { hapticLight } from '@/lib/haptics'

// ============================================
// Step configuration
// ============================================

interface StepConfig {
  title: string
  subtitle?: string
  component: React.ComponentType
  isValid: (data: OnboardingData) => boolean
  continueLabel?: string
}

const STEPS: StepConfig[] = [
  {
    title: 'Qual é o seu gênero?',
    subtitle: 'Personalizamos exercícios e métricas com base nisso',
    component: StepGender,
    isValid: (d) => d.gender !== null,
  },
  {
    title: 'Qual seu nível de experiência?',
    subtitle: 'Adaptamos a intensidade ao seu momento',
    component: StepExperience,
    isValid: (d) => d.experience_level !== null,
  },
  {
    title: 'Com que frequência você treina?',
    subtitle: 'Montaremos um plano realista para você',
    component: StepFrequency,
    isValid: (d) => d.training_frequency !== null,
  },
  {
    title: 'Qual é o seu objetivo?',
    subtitle: 'Focamos no que importa para você',
    component: StepGoal,
    isValid: (d) => d.goal !== null,
  },
  {
    title: 'Onde você vai treinar?',
    subtitle: 'Escolhemos exercícios compatíveis com seu espaço',
    component: StepLocation,
    isValid: (d) => d.training_location !== null,
  },
  {
    title: 'Quais áreas quer focar?',
    subtitle: 'Selecione os músculos que quer trabalhar',
    component: StepBodyMap,
    isValid: (d) => d.target_muscles.length > 0,
  },
  {
    title: 'Você está no caminho certo',
    component: StepMotivational,
    isValid: () => true, // auto-valid, just read
    continueLabel: 'Continuar',
  },
  {
    title: 'Quantos anos você tem?',
    subtitle: 'Ajustamos a intensidade para sua faixa etária',
    component: StepAge,
    isValid: (d) => d.age !== null && d.age >= 13 && d.age <= 99,
  },
  {
    title: 'Qual sua altura?',
    subtitle: 'Usamos para calcular seu IMC e métricas',
    component: StepHeight,
    isValid: (d) => d.height_cm !== null && d.height_cm >= 120 && d.height_cm <= 220,
  },
  {
    title: 'Qual seu peso atual?',
    subtitle: 'Não se preocupe — é só para personalizar seu plano',
    component: StepWeight,
    isValid: (d) => d.weight_kg !== null && d.weight_kg >= 30 && d.weight_kg <= 300,
  },
  {
    title: 'Qual sua meta de peso?',
    subtitle: 'Projetamos o tempo estimado para chegar lá',
    component: StepTargetWeight,
    isValid: (d) => d.target_weight_kg !== null && d.target_weight_kg >= 30 && d.target_weight_kg <= 300,
  },
  {
    title: 'Quantos dias por semana?',
    subtitle: 'Montamos um plano que cabe na sua rotina',
    component: StepDaysPerWeek,
    isValid: (d) => d.days_per_week >= 1 && d.days_per_week <= 7,
  },
  {
    title: 'Quanto tempo por treino?',
    subtitle: 'Cada minuto é otimizado pela IA',
    component: StepSessionDuration,
    isValid: (d) => d.session_duration !== null,
  },
  {
    title: 'Tem alguma lesão ou restrição?',
    subtitle: 'Adaptaremos os exercícios para você',
    component: StepInjuries,
    isValid: (d) => d.injuries.length > 0,
  },
  {
    title: 'Qual horário prefere treinar?',
    subtitle: 'Personalizamos lembretes no melhor momento',
    component: StepPreferredTime,
    isValid: (d) => d.preferred_time !== null,
  },
  {
    title: 'Por que o VFIT?',
    subtitle: 'Veja o que nos diferencia',
    component: StepSocialProof,
    isValid: () => true,
    continueLabel: 'Quase lá!',
  },
  {
    title: 'Estamos prontos!',
    component: StepReady,
    isValid: () => true,
    continueLabel: '🚀 Criar Meu Plano',
  },
]

// ============================================
// Main Page
// ============================================

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, data, nextStep } = useOnboardingStore()

  const step = STEPS[currentStep]

  const canContinue = useMemo(() => {
    if (!step) return false
    return step.isValid(data)
  }, [step, data])

  const handleContinue = useCallback(() => {
    if (!canContinue) return
    hapticLight()

    if (currentStep < STEPS.length - 1) {
      nextStep()
    } else {
      // End of current steps → loading / future plan generation
      router.push('/onboarding/loading')
    }
  }, [canContinue, currentStep, nextStep, router])

  // Fallback if currentStep exceeds available steps
  if (!step) {
    router.push('/onboarding/loading')
    return null
  }

  const StepComponent = step.component

  return (
    <OnboardingStepLayout
      title={step.title}
      subtitle={step.subtitle}
      canContinue={canContinue}
      onContinue={handleContinue}
      continueLabel={step.continueLabel}
    >
      <StepComponent />
    </OnboardingStepLayout>
  )
}
