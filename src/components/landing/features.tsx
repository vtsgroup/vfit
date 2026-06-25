// ============================================
// features.tsx — Seção de funcionalidades da landing page
// ============================================
//
// O que faz:
//   Exibe as principais features do produto em grid com ícones e tabs de categoria.
//   Tab ativa filtra cards de funcionalidade por categoria.
//   Usa IntersectionReveal para entrada no scroll.
//
// Exports principais:
//   Features — seção de funcionalidades com tabs filtráveis
'use client'

import { useState, type MouseEvent } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* Spotlight verde que segue o cursor (sem re-render, via CSS vars) */
function handleCardMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* Grão/noise SVG (fractalNoise) — textura premium quase imperceptível */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/* Marcas "+" decorativas — posições (blueprint sutil) */
const PLUS_MARKS = [
  ['7%', '15%'], ['92%', '20%'], ['12%', '84%'],
  ['88%', '80%'], ['50%', '7%'], ['30%', '92%'],
] as const

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface Feature {
  icon: DSIconName
  title: string
  description: string
  badge: string
  badgeAccent: boolean
  highlights: string[]
}

interface Step {
  icon: DSIconName
  number: string
  title: string
  description: string
}

/* ═══════════════════════════════════════════
   FEATURE DATA — Para Personals
   ═══════════════════════════════════════════ */
const PERSONAL_FEATURES: Feature[] = [
  {
    icon: 'sparkles',
    title: 'Treinos com IA',
    description: 'Gere treinos personalizados em segundos com periodização, progressão e adaptação automática por IA.',
    badge: 'EXCLUSIVO',
    badgeAccent: true,
    highlights: ['Periodização automática', 'Substituição inteligente', '500+ exercícios'],
  },
  {
    icon: 'users',
    title: 'Gestão de Alunos',
    description: 'Cadastre, organize e acompanhe todos os seus alunos em um só lugar com histórico completo.',
    badge: 'ILIMITADO',
    badgeAccent: false,
    highlights: ['Perfil completo', 'Histórico de treinos', 'Chat integrado'],
  },
  {
    icon: 'creditCard',
    title: 'Cobranças Automáticas',
    description: 'PIX automático, boletos e cartão de crédito. Receba pagamentos sem esforço com split automático.',
    badge: 'PIX INTEGRADO',
    badgeAccent: true,
    highlights: ['PIX instantâneo', 'Boleto e cartão', 'Split automático'],
  },
  {
    icon: 'activity',
    title: 'Avaliações Físicas',
    description: 'Anamnese completa, composição corporal, fotos comparativas e relatórios profissionais em PDF.',
    badge: 'PDF AUTOMÁTICO',
    badgeAccent: false,
    highlights: ['Composição corporal', 'Fotos comparativas', 'Relatório PDF'],
  },
  {
    icon: 'trophy',
    title: 'Gamificação & XP',
    description: 'Pontos, badges, rankings e conquistas que mantém seus alunos motivados e engajados todos os dias.',
    badge: 'NOVO',
    badgeAccent: true,
    highlights: ['Rankings semanais', 'Badges exclusivos', 'Sistema XP'],
  },
  {
    icon: 'smartphone',
    title: 'App PWA Nativo',
    description: 'Instale no celular como app nativo. Funciona offline, push notifications e experiência fluida.',
    badge: 'OFFLINE',
    badgeAccent: false,
    highlights: ['Funciona offline', 'Push notifications', 'Instala no celular'],
  },
]

/* ═══════════════════════════════════════════
   FEATURE DATA — Para Alunos
   ═══════════════════════════════════════════ */
const ALUNO_FEATURES: Feature[] = [
  {
    icon: 'dumbbell',
    title: 'Treino sob medida',
    description: 'Receba um plano claro para seu objetivo, nível, rotina e equipamentos disponíveis.',
    badge: 'IA + PERSONAL',
    badgeAccent: true,
    highlights: ['Progressão guiada', '500+ exercícios', 'Ajustes por objetivo'],
  },
  {
    icon: 'trendingUp',
    title: 'Evolução visível',
    description: 'Acompanhe frequência, cargas, medidas e fotos para enxergar o progresso sem achismo.',
    badge: 'GRÁFICOS',
    badgeAccent: false,
    highlights: ['Fotos comparativas', 'Histórico completo', 'Relatórios claros'],
  },
  {
    icon: 'playCircle',
    title: 'Execução sem dúvida',
    description: 'Veja vídeos, séries, repetições, descanso e registro de carga no mesmo lugar.',
    badge: 'GUIADO',
    badgeAccent: true,
    highlights: ['Vídeos HD', 'Timer integrado', 'Carga registrada'],
  },
  {
    icon: 'medal',
    title: 'Constância com XP',
    description: 'Ganhe pontos a cada treino, mantenha streaks e transforme frequência em recompensa.',
    badge: 'GAMIFICADO',
    badgeAccent: false,
    highlights: ['Rankings semanais', 'Badges', 'Sistema de níveis'],
  },
  {
    icon: 'messageCircle',
    title: 'Apoio profissional',
    description: 'Converse com personal e nutricionista quando precisar alinhar treino, dieta e rotina.',
    badge: 'ACOMPANHADO',
    badgeAccent: true,
    highlights: ['Chat integrado', 'Feedback real', 'Histórico salvo'],
  },
  {
    icon: 'smartphone',
    title: 'App no celular',
    description: 'Instale como app, receba notificações e acesse seu treino mesmo com conexão instável.',
    badge: 'PWA',
    badgeAccent: false,
    highlights: ['Instala sem loja', 'Push notifications', 'Modo offline'],
  },
]

const TABS = [
  { id: 'alunos', label: 'PARA ALUNOS', features: ALUNO_FEATURES },
  { id: 'personal', label: 'PARA PROFISSIONAIS', features: PERSONAL_FEATURES },
] as const

/* ═══════════════════════════════════════════
   HOW IT WORKS — Steps per perspective
   ═══════════════════════════════════════════ */
const PERSONAL_STEPS: Step[] = [
  { icon: 'userPlus', number: '01', title: 'Crie sua conta', description: 'Cadastro em 30 segundos. São 30 dias grátis, sem cartão de crédito.' },
  { icon: 'users', number: '02', title: 'Cadastre seus alunos', description: 'Adicione alunos manualmente ou envie convites por link direto pelo app.' },
  { icon: 'brainCircuit', number: '03', title: 'Gere treinos com IA', description: 'Defina os objetivos e deixe a inteligência artificial criar treinos perfeitos.' },
]

const ALUNO_STEPS: Step[] = [
  { icon: 'userPlus', number: '01', title: 'Crie seu perfil', description: 'Informe objetivo, nível, rotina e limitações. São 30 dias grátis, sem cartão.' },
  { icon: 'brainCircuit', number: '02', title: 'Receba seu treino', description: 'A IA monta o plano e o personal pode acompanhar sua evolução quando você quiser.' },
  { icon: 'dumbbell', number: '03', title: 'Treine e evolua', description: 'Siga o app, registre cargas, ganhe XP e veja seu progresso com dados reais.' },
]

/* ═══════════════════════════════════════════
   FEATURE CARD — light modern card
   ═══════════════════════════════════════════ */
function FeatureCard({ feat, index }: { feat: Feature; index: number }) {
  return (
    <IntersectionReveal animation="scale-in" delay={index * 80}>
      <div
        onMouseMove={handleCardMove}
        className="group relative h-full overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out-expo hover:-translate-y-1.5 sm:p-7"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafdfb 100%)',
          border: '1px solid rgba(15,23,42,0.07)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 14px 36px -16px rgba(15,23,42,0.14)',
        }}
      >
        {/* Spotlight verde seguindo o cursor */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(340px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.09), transparent 60%)' }}
        />
        {/* Borda gradiente no hover (técnica mask) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.55) 0%, rgba(132,204,22,0.25) 45%, transparent 75%)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
        {/* Glow ambiente verde no hover */}
        <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-18px_rgba(34,197,94,0.45)]" />
        {/* Accent line no topo */}
        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex h-full flex-col gap-4">
          {/* Icon + Badge */}
          <div className="flex items-start justify-between gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-brand-primary transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, rgba(34,197,94,0.13) 0%, rgba(34,197,94,0.04) 100%)',
                border: '1px solid rgba(34,197,94,0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              <DSIcon name={feat.icon} size={20} className="filter-[drop-shadow(0_1px_1px_rgba(20,120,60,0.15))]" />
            </div>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#08122B]"
              style={{
                ...monoLabel,
                background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
                border: '1px solid rgba(20,120,60,0.28)',
                boxShadow: '0 2px 8px -1px rgba(34,197,94,0.42), inset 0 1px 0 rgba(255,255,255,0.45)',
              }}
            >
              {feat.badge}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-syne text-lg font-bold tracking-tight text-gray-950">
            {feat.title}
          </h3>

          {/* Description */}
          <p className="font-dm-sans text-sm leading-relaxed text-slate-600">{feat.description}</p>

          {/* Highlights */}
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {feat.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-all duration-200 group-hover:border-brand-primary/25 group-hover:bg-brand-primary/6 group-hover:text-slate-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </IntersectionReveal>
  )
}

/* ═══════════════════════════════════════════
   MAIN — Features + How It Works (merged)
   ═══════════════════════════════════════════ */
export function Features() {
  const [activeTab, setActiveTab] = useState<string>('alunos')
  const current = TABS.find((t) => t.id === activeTab)!
  const steps = activeTab === 'personal' ? PERSONAL_STEPS : ALUNO_STEPS

  return (
    <section id="features" aria-label="Funcionalidades da plataforma">
      {/* ── LIGHT AREA: Feature Cards ── */}
      <div className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32">
        {/* Dot pattern fino */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.35,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Grão/noise premium (quase imperceptível) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 0.045, backgroundImage: NOISE_BG, backgroundSize: '200px 200px' }}
        />
        {/* Light wash vindo do topo — eleva a área do header */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: '460px', background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.6) 0%, transparent 72%)' }}
        />
        {/* Orbs verdes que derivam lentamente (wrapper centraliza, inner anima) */}
        <div className="pointer-events-none absolute left-1/4 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="feat-orb-1 h-96 w-96 rounded-full bg-brand-primary/5 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/3">
          <div className="feat-orb-2 h-80 w-80 rounded-full bg-lime-400/5 blur-[130px]" />
        </div>
        {/* Marcas "+" decorativas (blueprint sutil) */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          {PLUS_MARKS.map(([l, t], i) => (
            <span key={i} className="absolute text-brand-primary/20" style={{ left: l, top: t }}>
              <svg width="9" height="9" viewBox="0 0 10 10"><path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" /></svg>
            </span>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <IntersectionReveal animation="blur-in">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
                style={{
                  ...monoLabel,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)',
                  border: '1px solid rgba(34,197,94,0.32)',
                  boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
                </span>
                <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">App de treino</span>
              </span>
              <h2 className="font-syne mt-6 text-4xl font-black leading-[1.04] tracking-[-0.02em] text-gray-950 sm:text-5xl lg:text-6xl">
                Entenda seu treino,{' '}
                <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">execute</span>{' '}
                melhor
              </h2>
              <p className="font-dm-sans mt-5 text-base text-gray-500 sm:text-lg">
                Um app mobile-first para transformar orientação profissional em treino simples de seguir.
              </p>
            </div>
          </IntersectionReveal>

          {/* Tabs — pill com indicador deslizante */}
          <IntersectionReveal animation="fade-in" delay={100}>
            <div
              className="relative mx-auto mb-12 flex max-w-sm rounded-2xl border border-slate-200/80 p-1.5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.22)] sm:max-w-md"
              style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f8fc 100%)' }}
            >
              {/* Indicador verde gradiente deslizante */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-1.5 rounded-xl transition-all duration-300 ease-out-expo"
                style={{
                  ...(activeTab === 'alunos' ? { left: '0.375rem', right: '50%' } : { left: '50%', right: '0.375rem' }),
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 6px 18px -4px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(6,78,59,0.4)',
                }}
              />
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] uppercase tracking-wider transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-[#08122B]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  style={monoLabel}
                >
                  <DSIcon name={tab.id === 'alunos' ? 'userCheck' : 'briefcase'} size={13} />
                  {tab.label}
                </button>
              ))}
            </div>
          </IntersectionReveal>

          {/* Feature grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" key={activeTab}>
            {current.features.map((feat, i) => (
              <FeatureCard key={feat.title} feat={feat} index={i} />
            ))}
          </div>

          {/* Trust badges */}
          <IntersectionReveal animation="blur-in" delay={500}>
            <div
              className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-semibold text-gray-400"
              style={monoLabel}
            >
              <span className="flex items-center gap-2">
                <DSIcon name="shield" size={16} className="text-brand-primary" />
                LGPD COMPLIANT
              </span>
              <span className="hidden h-3 w-px bg-gray-300 sm:block" />
              <span className="flex items-center gap-2">
                <DSIcon name="smartphone" size={16} className="text-brand-primary" />
                APP NO CELULAR
              </span>
              <span className="hidden h-3 w-px bg-gray-300 sm:block" />
              <span className="flex items-center gap-2">
                <DSIcon name="check" size={16} className="text-brand-primary" />
                30 DIAS GRÁTIS
              </span>
              <span className="hidden h-3 w-px bg-gray-300 sm:block" />
              <span className="flex items-center gap-2">
                <DSIcon name="creditCard" size={16} className="text-brand-primary" />
                SEM CARTÃO NO CADASTRO
              </span>
            </div>
          </IntersectionReveal>
        </div>
      </div>

      {/* ── SEAMLESS CONTINUATION — same light bg ── */}

      {/* ── LIGHT AREA: How It Works ── */}
      <div id="how-it-works" className="relative overflow-hidden pb-16 sm:pb-32" style={{ background: 'linear-gradient(to bottom, var(--color-bg-landing-light), var(--color-bg-landing-light-end))' }}>
        {/* Grid lines — visible from bottom, fading to transparent at top */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)',
          }}
        />
        {/* Grão/noise premium */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 0.04, backgroundImage: NOISE_BG, backgroundSize: '200px 200px' }}
        />
        {/* Nós luminosos na grade — pontos verdes sutis, um pulsando */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          {([['25%', '62%', false], ['57%', '78%', true], ['80%', '54%', false], ['41%', '90%', false]] as const).map(([l, t, pulse], i) => (
            <span
              key={i}
              className={`absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/50 ${pulse ? 'motion-safe:animate-ping' : ''}`}
              style={{ left: l, top: t, boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}
            />
          ))}
        </div>
        {/* Subtle glow accents */}
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-primary/5 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-brand-primary/4 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8 sm:pt-12">
          <IntersectionReveal animation="blur-in">
            <div className="mb-16 max-w-2xl">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary"
                style={monoLabel}
              >
                COMO FUNCIONA
              </span>
              <h2 className="font-syne mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Comece em{' '}
                <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
                  3 passos
                </span>
              </h2>
            </div>
          </IntersectionReveal>

          {/* Step cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3" key={`steps-${activeTab}`}>
            {steps.map((step, i) => (
              <IntersectionReveal key={`${activeTab}-step-${i}`} animation="slide-up" delay={i * 120}>
                <div
                  onMouseMove={handleCardMove}
                  className="group relative h-full overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out-expo hover:-translate-y-1.5 sm:p-8"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafdfb 100%)',
                    border: '1px solid rgba(15,23,42,0.07)',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 14px 36px -16px rgba(15,23,42,0.14)',
                  }}
                >
                  {/* Spotlight verde */}
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.09), transparent 60%)' }}
                  />
                  {/* Borda gradiente no hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      padding: '1px',
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(132,204,22,0.22) 45%, transparent 75%)',
                      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  />
                  {/* Glow ambiente verde */}
                  <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-18px_rgba(34,197,94,0.4)]" />

                  {/* Watermark number — gradiente verde */}
                  <span className="font-syne pointer-events-none absolute -right-1 -top-4 select-none bg-linear-to-br from-brand-primary/30 to-brand-primary/5 bg-clip-text text-7xl font-black text-transparent transition-transform duration-500 ease-out-expo group-hover:scale-110 sm:text-8xl">
                    {step.number}
                  </span>

                  <div className="relative">
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-brand-primary transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: 'linear-gradient(180deg, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.04) 100%)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                      }}
                    >
                      <DSIcon name={step.icon} />
                    </div>
                    <h3 className="font-syne mb-2 text-lg font-black tracking-tight text-gray-900">
                      {step.title}
                    </h3>
                    <p className="font-dm-sans text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </div>
              </IntersectionReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRANSITION: direct cut to dark section ── */}
      <div className="h-px bg-gray-300" />

      <style jsx global>{`
        @keyframes featDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -24px) scale(1.12); }
        }
        @keyframes featDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-24px, 16px) scale(0.9); }
        }
        .feat-orb-1 { animation: featDrift1 22s ease-in-out infinite; will-change: transform; }
        .feat-orb-2 { animation: featDrift2 26s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .feat-orb-1, .feat-orb-2 { animation: none; }
        }
      `}</style>
    </section>
  )
}
