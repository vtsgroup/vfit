'use client'

/**
 * src/app/(onboarding)/onboarding/loading/page.tsx
 *
 * Loading Screen — Geração do plano com IA
 * Ultra-modern redesign: Animated logo + mesh gradient + floating orbs
 *
 * Fases animadas: Analisando perfil → Selecionando exercícios → Montando plano → Otimizando
 * Chama POST /api/v1/plans/generate com dados do onboarding
 * Redireciona para /onboarding/result quando pronto
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { AnimatedProgressBar } from '@/components/onboarding/onboarding-animations'
import { VfitAnimatedMark } from '@/components/ui/vfit-animated-mark'
import { motion } from 'framer-motion'

// ─── Fases do loading ───
const PHASES: { label: string; icon: DSIconName; duration: number }[] = [
  { label: 'Analisando seu perfil...', icon: 'search', duration: 2000 },
  { label: 'Selecionando exercícios ideais...', icon: 'dumbbell', duration: 2500 },
  { label: 'Montando seu plano personalizado...', icon: 'clipboardList', duration: 2000 },
  { label: 'Otimizando para resultados máximos...', icon: 'zap', duration: 1500 },
  { label: 'Quase pronto!', icon: 'sparkles', duration: 1000 },
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

      // Save onboarding data to backend if user is authenticated
      const isAuth = useAuthStore.getState().isAuthenticated
      if (isAuth) {
        try {
          await api.post('/onboarding', payload)
          // Auto-create self-assessment from onboarding data (fire-and-forget)
          api.post('/self-assessments/from-onboarding', {}).catch((err) => {
            console.warn('[Loading] Failed to create assessment from onboarding:', err)
          })
        } catch (err) {
          console.warn('[Loading] Failed to save onboarding to backend:', err)
        }
      }

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
      <div className="vfit-energy-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
        <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/25 bg-amber-300/10">
            <DSIcon name="alertTriangle" className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="mb-2 text-xl font-black text-white">{error}</h2>
          <p className="mb-8 text-sm text-slate-400">Tente novamente em alguns segundos.</p>
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
      </div>
    )
  }

  return (
    <div className="vfit-energy-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-white">
      {/* ─── Orbs vívidos à deriva ─── */}
      <div aria-hidden className="vfit-energy-orb vfit-energy-orb-a absolute -left-24 top-16 h-72 w-72 bg-emerald-400/20 blur-[120px]" />
      <div aria-hidden className="vfit-energy-orb vfit-energy-orb-b absolute -right-20 bottom-24 h-80 w-80 bg-lime-400/16 blur-[130px]" />
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />

      {/* ─── Conteúdo ─── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {/* ─── Logo animada da splash — protagonista ─── */}
        <VfitAnimatedMark size={150} />

        {/* ─── Fase atual ─── */}
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mt-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-200 backdrop-blur-sm">
            <DSIcon name={phase.icon} size={13} />
            Passo {currentPhase + 1}/{PHASES.length}
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-[1.08] text-white sm:text-3xl">
            {phase.label}
          </h2>
        </motion.div>

        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300/85">
          Cruzando seus dados com intensidade, tempo disponível e objetivo principal.
        </p>

        {/* ─── Progresso com porcentagem em destaque ─── */}
        <div className="mt-9 w-full">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Gerando plano</span>
            <motion.span
              key={Math.round(progress)}
              initial={{ scale: 1.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="vfit-energy-text text-3xl font-black leading-none"
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
          <AnimatedProgressBar progress={progress} />
        </div>

        {/* ─── Tempo estimado ─── */}
        <motion.p
          className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-white/[0.04] px-4 py-2.5 text-xs text-slate-300 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <DSIcon name="clock" className="h-3.5 w-3.5 text-emerald-300" />
          <span>Tempo estimado: 30-45 segundos</span>
        </motion.p>
      </div>
    </div>
  )
}
