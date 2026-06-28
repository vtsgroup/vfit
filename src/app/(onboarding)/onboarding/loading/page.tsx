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
import {
  AnimatedLogo,
  FloatingOrbs,
  MeshGradientBg,
  AnimatedProgressBar,
} from '@/components/onboarding/onboarding-animations'
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
      <div className="vfit-flow-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
        <div className="vfit-flow-grid pointer-events-none absolute inset-0" />
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/20 bg-yellow-300/10">
          <DSIcon name="alertTriangle" className="h-10 w-10 text-yellow-400" />
        </div>
        <h2 className="relative mb-2 text-xl font-bold text-white">
          {error}
        </h2>
        <p className="relative mb-8 text-sm text-slate-400">
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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-white bg-slate-950">
      {/* ─── Mesh Gradient Background ─── */}
      <MeshGradientBg animate />

      {/* ─── Floating Orbs ─── */}
      <FloatingOrbs />

      {/* ─── Background grid (subtle) ─── */}
      <div className="vfit-flow-grid pointer-events-none absolute inset-0" />

      {/* ─── Top light gradient ─── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-white/5 to-transparent" />

      {/* ─── Content container ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-0">
        {/* ─── Animated Logo as Protagonist ─── */}
        <div className="mb-12">
          <AnimatedLogo size="md" glowColor="rgba(34, 197, 94, 0.7)">
            <DSIcon
              name={phase.icon}
              className="h-16 w-16 text-brand-primary transition-all duration-500"
              key={phase.icon}
            />
          </AnimatedLogo>
        </div>

        {/* ─── Phase label with animation ─── */}
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-center"
        >
          <h2 className="text-3xl font-black leading-tight text-white">
            {phase.label}
          </h2>
        </motion.div>

        <p className="mb-10 max-w-sm text-center text-sm leading-6 text-slate-300">
          Cruzando seus dados com intensidade, tempo disponível e objetivo principal.
        </p>

        {/* ─── Progress bar with enhanced animation ─── */}
        <div className="w-full max-w-xs space-y-3">
          <AnimatedProgressBar progress={progress} />
          <motion.div className="flex items-center justify-between text-xs text-slate-400">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Passo {currentPhase + 1}/{PHASES.length}
            </motion.span>
            <motion.span
              key={Math.round(progress)}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-brand-primary"
            >
              {Math.round(progress)}%
            </motion.span>
          </motion.div>
        </div>

        {/* ─── Time estimate badge ─── */}
        <motion.p
          className="mt-10 flex max-w-xs items-center justify-center gap-2 rounded-2xl backdrop-blur-md border border-emerald-500/20 px-4 py-3 text-center text-xs text-slate-300"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.5) 100%)',
            boxShadow: 'inset 0 1px 12px rgba(34, 197, 94, 0.1)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <DSIcon name="clock" className="h-3.5 w-3.5 text-brand-primary" />
          <span>Tempo estimado: 30-45 segundos</span>
        </motion.p>
      </div>
    </div>
  )
}
