'use client'

/**
 * src/app/(onboarding)/onboarding/loading/page.tsx
 *
 * Loading Screen — Geração do plano com IA
 *
 * Fases animadas: Analisando perfil → Selecionando exercícios → Montando plano → Otimizando
 * Chama POST /api/v1/plans/generate com dados do onboarding
 * Redireciona para /onboarding/result quando pronto
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

// ─── Fases do loading ───
const PHASES = [
  { label: 'Analisando seu perfil...', emoji: '🔍', duration: 2000 },
  { label: 'Selecionando exercícios ideais...', emoji: '🏋️', duration: 2500 },
  { label: 'Montando seu plano personalizado...', emoji: '📋', duration: 2000 },
  { label: 'Otimizando para resultados máximos...', emoji: '⚡', duration: 1500 },
  { label: 'Quase pronto!', emoji: '✨', duration: 1000 },
]

export default function OnboardingLoadingPage() {
  const router = useRouter()
  const data = useOnboardingStore((s) => s.data)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const hasCalled = useRef(false)

  // ─── Animação das fases ───
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let elapsed = 0

    PHASES.forEach((phase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index)
      }, elapsed)
      timers.push(timer)
      elapsed += phase.duration
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  // ─── Progresso suave ───
  useEffect(() => {
    const totalDuration = PHASES.reduce((s, p) => s + p.duration, 0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (totalDuration / 50)
        return Math.min(next, 95) // Pausar em 95% até API responder
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // ─── Chamar API ───
  const generatePlan = useCallback(async () => {
    if (isGenerating || hasCalled.current) return
    hasCalled.current = true
    setIsGenerating(true)

    try {
      const payload = {
        gender: data.gender || 'prefer_not_say',
        experience_level: data.experience_level || 'beginner',
        training_frequency: data.training_frequency || 'never',
        goal: data.goal || 'health',
        training_location: data.training_location || 'gym_large',
        target_muscles: data.target_muscles?.length ? data.target_muscles : [],
        age: data.age || 25,
        height_cm: data.height_cm || 170,
        weight_kg: data.weight_kg || 70,
        target_weight_kg: data.target_weight_kg || data.weight_kg || 70,
        days_per_week: data.days_per_week || 3,
        session_duration: data.session_duration || 'medium_45',
        injuries: data.injuries?.length ? data.injuries : [],
        preferred_time: data.preferred_time || 'any',
      }

      const result = await api.post<{
        plan: Record<string, unknown>
        source: string
        stats: Record<string, number>
      }>('/plans/generate', payload, { auth: false })

      // Salvar no sessionStorage para a result page
      sessionStorage.setItem('vfit_plan', JSON.stringify(result.data))

      // Completar progresso
      setProgress(100)

      // Redirecionar após animação
      setTimeout(() => {
        router.push('/onboarding/result')
      }, 600)
    } catch (err) {
      console.error('[Loading] Plan generation failed:', err)
      setError('Ops! Algo deu errado. Vamos tentar de novo.')
    } finally {
      setIsGenerating(false)
    }
  }, [data, isGenerating, router])

  useEffect(() => {
    generatePlan()
  }, [generatePlan])

  const phase = PHASES[currentPhase] || PHASES[PHASES.length - 1]

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6 text-center">
        <div className="mb-6 text-6xl">😅</div>
        <h2 className="mb-2 text-xl font-bold text-text-primary">
          {error}
        </h2>
        <p className="mb-8 text-sm text-text-secondary">
          Tente novamente em alguns segundos.
        </p>
        <Button
          onClick={() => {
            setError(null)
            hasCalled.current = false
            setIsGenerating(false)
            generatePlan()
          }}
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6">
      {/* ─── Pulsing orb with glow effect ─── */}
      <div className="relative mb-10">
        <div className="absolute inset-0 h-32 w-32 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <span className="text-5xl transition-all duration-500" key={phase.emoji}>
            {phase.emoji}
          </span>
        </div>
      </div>

      {/* ─── Phase label ─── */}
      <h2
        className="mb-8 text-center text-lg font-semibold text-text-primary transition-all duration-500"
        key={phase.label}
      >
        {phase.label}
      </h2>

      {/* ─── Progress bar with step counter ─── */}
      <div className="w-full max-w-xs space-y-3">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Passo {currentPhase + 1}/{PHASES.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* ─── Time estimate ─── */}
      <p className="mt-12 max-w-xs text-center text-xs text-text-secondary">
        ⏱️ Tempo estimado: 30-45 segundos
      </p>
    </div>
  )
}
