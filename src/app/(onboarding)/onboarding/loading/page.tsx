'use client'

/**
 * src/app/(onboarding)/onboarding/loading/page.tsx
 *
 * Loading Screen — "VFIT BROADCAST · TRANSMISSÃO AO VIVO".
 * A IA montando o plano AO VIVO: marca animada (sinal), telemetria das fases acendendo
 * em cascata (box-score) e progresso em placar. Navy seco, aparato mono.
 *
 * Chama POST /api/v1/plans/generate com dados do onboarding → /onboarding/result.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { api, ApiClientError } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { VfitAnimatedMark } from '@/components/ui/vfit-animated-mark'
import { cn } from '@/lib/utils'

// ─── Fases (telemetria) ───
const PHASES: { label: string; icon: DSIconName; duration: number }[] = [
  { label: 'Analisando seu perfil', icon: 'search', duration: 2000 },
  { label: 'Selecionando exercícios', icon: 'dumbbell', duration: 2500 },
  { label: 'Montando seu plano', icon: 'clipboardList', duration: 2000 },
  { label: 'Otimizando resultados', icon: 'zap', duration: 1500 },
  { label: 'Finalizando', icon: 'sparkles', duration: 1000 },
]

export default function OnboardingLoadingPage() {
  const router = useRouter()
  const data = useOnboardingStore((s) => s.data)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retrySeconds, setRetrySeconds] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const hasCalled = useRef(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let elapsed = 0
    PHASES.forEach((phase, index) => {
      const timer = setTimeout(() => setCurrentPhase(index), elapsed)
      timers.push(timer)
      elapsed += phase.duration
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const totalDuration = PHASES.reduce((s, p) => s + p.duration, 0)
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (totalDuration / 50), 95))
    }, 50)
    return () => clearInterval(interval)
  }, [])

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

      const isAuth = useAuthStore.getState().isAuthenticated
      if (isAuth) {
        try {
          await api.post('/onboarding', payload)
          api.post('/self-assessments/from-onboarding', {}).catch((err) => {
            console.warn('[Loading] Failed to create assessment from onboarding:', err)
          })
        } catch (err) {
          console.warn('[Loading] Failed to save onboarding to backend:', err)
        }
      }

      sessionStorage.setItem('vfit_plan', JSON.stringify(result.data))
      setProgress(100)
      setTimeout(() => router.push('/onboarding/result'), 600)
    } catch (err) {
      console.error('[Loading] Plan generation failed:', err)
      if (err instanceof ApiClientError && err.status === 429) {
        const match = err.message.match(/(\d+)\s*s/)
        setRetrySeconds(match ? Number(match[1]) : 30)
        setIsRateLimited(true)
        setError('Muita gente criando plano agora')
      } else {
        setIsRateLimited(false)
        setError('Ops! Algo deu errado. Vamos tentar de novo.')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [data, isGenerating, router])

  useEffect(() => {
    generatePlan()
  }, [generatePlan])

  // Countdown regressivo pro retry automático quando é rate limit (429)
  useEffect(() => {
    if (!isRateLimited || retrySeconds <= 0) return
    const t = setTimeout(() => setRetrySeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [isRateLimited, retrySeconds])

  const phase = PHASES[currentPhase] || PHASES[PHASES.length - 1]
  const pct = Math.round(progress)

  if (error) {
    const canRetryNow = !isRateLimited || retrySeconds <= 0
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#04080f] px-6 text-center text-white">
        <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full border ${isRateLimited ? 'border-green-400/25 bg-green-400/10' : 'border-amber-300/25 bg-amber-300/10'}`}>
            <DSIcon name={isRateLimited ? 'clock' : 'alertTriangle'} className={`h-8 w-8 ${isRateLimited ? 'text-green-300' : 'text-amber-400'}`} />
          </div>
          <h2 className="font-syne mb-2 text-2xl font-black text-white">{error}</h2>
          <p className="bc-mono mb-8 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {isRateLimited
              ? canRetryNow
                ? 'Pode tentar de novo'
                : `Nossa IA está a mil hoje · libera em ${retrySeconds}s`
              : 'Tente novamente em alguns segundos'}
          </p>
          <button
            type="button"
            disabled={!canRetryNow}
            onClick={() => {
              setError(null)
              setIsRateLimited(false)
              hasCalled.current = false
              setIsGenerating(false)
              generatePlan()
            }}
            className="bc-retry-cta group relative flex h-13 items-center gap-2.5 overflow-hidden rounded-full px-7 text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 disabled:saturate-[0.5]"
            style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
          >
            <span className="font-syne relative z-10 text-[14px] font-black uppercase tracking-tight">
              {canRetryNow ? 'Tentar novamente' : `Aguarde ${retrySeconds}s`}
            </span>
            {canRetryNow && <DSIcon name="arrowRight" size={16} className="relative z-10" />}
          </button>
        </div>
        <style>{`.bc-retry-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }`}</style>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#04080f] px-6 text-white">
      <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 12%, rgba(34,197,94,0.12), transparent 60%)' }} />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* sinal AO VIVO */}
        <span className="bc-mono mb-9 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-green-300/90">
          <span aria-hidden className="bc-live h-2 w-2 rounded-full bg-green-400" />
          Ao vivo · Gerando plano Nº 01
        </span>

        {/* marca animada — protagonista */}
        <VfitAnimatedMark size={132} />

        {/* fase atual */}
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-10 text-center"
        >
          <span className="bc-mono text-[10px] font-bold uppercase tracking-[0.24em] text-green-300/70">
            Passo {String(currentPhase + 1).padStart(2, '0')}/{String(PHASES.length).padStart(2, '0')}
          </span>
          <h1 className="font-syne mt-2 text-[30px] font-black leading-[1.02] text-white sm:text-4xl">{phase.label}</h1>
        </motion.div>

        {/* telemetria — box-score acendendo */}
        <div className="mt-8 w-full border-y border-green-400/15">
          {PHASES.map((p, i) => {
            const done = i < currentPhase
            const active = i === currentPhase
            return (
              <div
                key={p.label}
                className={cn(
                  'flex items-center gap-3 py-2.5 transition-opacity duration-300',
                  i > 0 && 'border-t border-white/8',
                  active ? 'opacity-100' : done ? 'opacity-75' : 'opacity-30',
                )}
              >
                <span className="bc-mono w-6 text-[11px] font-bold tabular-nums text-green-300/55">{String(i + 1).padStart(2, '0')}</span>
                <DSIcon name={p.icon} size={15} className={active ? 'text-green-300' : 'text-green-300/70'} />
                <span className="bc-mono flex-1 text-[11px] font-bold uppercase leading-tight tracking-[0.12em] text-white/85">{p.label}</span>
                <span aria-hidden className="flex h-5 w-5 items-center justify-center">
                  {done ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[#06210f]" style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)' }}>
                      <DSIcon name="check" size={11} />
                    </span>
                  ) : active ? (
                    <span className="bc-live h-2.5 w-2.5 rounded-full bg-green-400" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                  )}
                </span>
              </div>
            )
          })}
        </div>

        {/* progresso — placar */}
        <div className="mt-8 w-full">
          <div className="mb-2 flex items-end justify-between">
            <span className="bc-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Progresso</span>
            <motion.span
              key={pct}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-syne text-4xl font-black leading-none text-green-300 tabular-nums"
            >
              {pct}
              <span className="text-2xl text-green-300/70">%</span>
            </motion.span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-green-400 via-green-300 to-green-400 shadow-[0_0_16px_rgba(74,222,128,0.5)] transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="bc-mono mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          <DSIcon name="clock" size={13} className="text-green-300" />
          Setup · 30–45 segundos
        </p>
      </div>

      <style>{`
        .bc-live { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); animation: bcLivePing 1.8s ease-out infinite; }
        @keyframes bcLivePing { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.55); } 70%,100% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } }
        @media (prefers-reduced-motion: reduce) { .bc-live { animation: none !important; } }
      `}</style>
    </div>
  )
}
