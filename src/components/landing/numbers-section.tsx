// ============================================
// numbers-section.tsx — Seção de números/estatísticas da landing page
// ============================================
//
// O que faz:
//   Exibe métricas do produto (alunos, treinos, personals) com contador animado.
//   useCountUp: animação de 0 até o valor final ao entrar no viewport.
//   Usa IntersectionReveal para ativar animação no scroll.
//
// Exports principais:
//   NumbersSection — seção de métricas com counters animados
'use client'

import { useEffect, useRef, useState } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Counter hook with spring overshoot ─── */
function useCountUp(end: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const overshoot = 1.08 // spring: overshoot by 8%
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      // Spring ease: overshoot then settle
      const spring = t < 0.8
        ? overshoot * (1 - Math.pow(1 - t / 0.8, 3))
        : overshoot - (overshoot - 1) * ((t - 0.8) / 0.2) * ((t - 0.8) / 0.2) * (3 - 2 * (t - 0.8) / 0.2)
      const clamped = t >= 1 ? 1 : Math.min(spring, overshoot)
      setValue(Math.round(clamped * end))
      if (t < 1) frameRef.current = requestAnimationFrame(animate)
      else setValue(end) // ensure exact final value
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [end, duration, start])

  return value
}

/* ─── Stats data ─── */
const NUMBERS: { icon: DSIconName; value: number; suffix: string; prefix?: string; label: string; desc: string }[] = [
  { icon: 'users', value: 15000, suffix: '+', label: 'Alunos Ativos', desc: 'treinando com acompanhamento digital' },
  { icon: 'brainCircuit', value: 45000, suffix: '+', label: 'Treinos Personalizados', desc: 'gerados com inteligência artificial' },
  { icon: 'heart', value: 98, suffix: '%', label: 'Satisfação', desc: 'de aprovação na experiência VFIT' },
  { icon: 'dumbbell', value: 500, suffix: '+', label: 'Exercícios', desc: 'com variações para academia e casa' },
  { icon: 'clock', value: 24, suffix: '/7', label: 'Acesso Mobile', desc: 'treino sempre disponível no celular' },
  { icon: 'flame', value: 60, suffix: '%', label: 'Mais Constância', desc: 'com XP, streaks e lembretes' },
]

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'K'
  return n.toString()
}

function StatCard({ stat }: { stat: typeof NUMBERS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const count = useCountUp(stat.value, 2200, visible)

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-300 hover:border-brand-primary/25 hover:bg-brand-primary/3"
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <DSIcon name={stat.icon} size={20} className="mb-3 text-brand-primary/60 transition-colors duration-300 group-hover:text-brand-primary" />

      <div className="flex items-baseline gap-1">
        {stat.prefix && (
          <span className="text-lg font-bold text-brand-primary/60" style={monoLabel}>{stat.prefix}</span>
        )}
        <span className="font-syne text-2xl font-black text-white sm:text-4xl">
          {formatNumber(count)}
        </span>
        {stat.suffix && (
          <span className="font-syne text-xl font-black text-brand-primary">{stat.suffix}</span>
        )}
      </div>

      <div className="mt-2 text-xs font-bold text-white/70 uppercase" style={monoLabel}>
        {stat.label}
      </div>
      <div className="mt-1 text-[11px] text-white/30">
        {stat.desc}
      </div>
    </div>
  )
}

export function NumbersSection() {
  return (
    <section className="relative overflow-hidden bg-bg-primary py-16 sm:py-32" aria-label="Números da plataforma">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-primary/5 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-5 text-center">
            <span className="inline-block text-xs text-brand-primary/70 uppercase" style={monoLabel}>
              /PROVA SOCIAL
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2 className="font-syne mb-4 text-center text-3xl uppercase leading-[0.96] text-white sm:text-5xl">
            GENTE REAL{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              TREINANDO
            </span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm leading-relaxed text-white/40 sm:text-base">
            O VFIT combina treino personalizado, acompanhamento profissional e motivação diária em uma experiência simples de usar.
          </p>
        </IntersectionReveal>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {NUMBERS.map((stat, i) => (
            <IntersectionReveal key={stat.label} animation="fade-in" delay={i * 80}>
              <StatCard stat={stat} />
            </IntersectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
