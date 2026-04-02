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

import { useState } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

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
    title: 'Treinos Personalizados',
    description: 'Receba treinos criados por IA para seus objetivos, nível de condicionamento e preferências.',
    badge: 'PERSONALIZADO',
    badgeAccent: true,
    highlights: ['IA adaptativa', 'Progressão automática', '500+ exercícios'],
  },
  {
    icon: 'trendingUp',
    title: 'Evolução Corporal',
    description: 'Acompanhe composição corporal, fotos comparativas e gráficos detalhados de progresso.',
    badge: 'GRÁFICOS',
    badgeAccent: false,
    highlights: ['Gráficos interativos', 'Fotos comparativas', 'Relatório mensal'],
  },
  {
    icon: 'wallet',
    title: 'Pagamento Fácil',
    description: 'Pague via PIX, boleto ou cartão de forma automática, sem esforço e com recibo instantâneo.',
    badge: 'PIX AUTOMÁTICO',
    badgeAccent: true,
    highlights: ['PIX instantâneo', 'Boleto e cartão', 'Recibo automático'],
  },
  {
    icon: 'medal',
    title: 'Ranking & Conquistas',
    description: 'Ganhe XP a cada treino, suba de nível, desbloqueie badges e dispute rankings semanais.',
    badge: 'GAMIFICADO',
    badgeAccent: false,
    highlights: ['Rankings semanais', 'Badges exclusivos', 'Sistema de níveis'],
  },
  {
    icon: 'messageCircle',
    title: 'Chat com Personal',
    description: 'Comunique-se direto com seu personal pelo chat integrado e receba feedback em tempo real.',
    badge: 'TEMPO REAL',
    badgeAccent: true,
    highlights: ['Mensagens instantâneas', 'Push notifications', 'Histórico completo'],
  },
  {
    icon: 'playCircle',
    title: 'Execução Guiada',
    description: 'Vídeos de cada exercício com séries, repetições, tempo de descanso e registro de carga.',
    badge: 'VÍDEOS HD',
    badgeAccent: false,
    highlights: ['Vídeos HD', 'Timer integrado', 'Registro de carga'],
  },
]

const TABS = [
  { id: 'personal', label: 'PARA PERSONALS', features: PERSONAL_FEATURES },
  { id: 'alunos', label: 'PARA ALUNOS', features: ALUNO_FEATURES },
] as const

/* ═══════════════════════════════════════════
   HOW IT WORKS — Steps per perspective
   ═══════════════════════════════════════════ */
const PERSONAL_STEPS: Step[] = [
  { icon: 'userPlus', number: '01', title: 'Crie sua conta', description: 'Cadastro em 30 segundos. Plano Essencial gratuito para sempre, sem cartão de crédito.' },
  { icon: 'users', number: '02', title: 'Cadastre seus alunos', description: 'Adicione alunos manualmente ou envie convites por link direto pelo app.' },
  { icon: 'brainCircuit', number: '03', title: 'Gere treinos com IA', description: 'Defina os objetivos e deixe a inteligência artificial criar treinos perfeitos.' },
]

const ALUNO_STEPS: Step[] = [
  { icon: 'mail', number: '01', title: 'Receba o convite', description: 'Seu personal envia um link exclusivo. Basta clicar e criar sua conta.' },
  { icon: 'download', number: '02', title: 'Instale o app', description: 'Adicione à tela inicial do celular. Funciona como app nativo, sem loja.' },
  { icon: 'dumbbell', number: '03', title: 'Comece a treinar', description: 'Acesse treinos, acompanhe evolução e conquiste badges a cada sessão.' },
]

/* ═══════════════════════════════════════════
   FEATURE CARD — light modern card
   ═══════════════════════════════════════════ */
function FeatureCard({ feat, index }: { feat: Feature; index: number }) {
  return (
    <IntersectionReveal animation="scale-in" delay={index * 80}>
      <div className="group relative h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-7">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex flex-col gap-4">
          {/* Icon + Badge */}
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-all duration-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary group-hover:scale-110 group-hover:-rotate-6">
              <DSIcon name={feat.icon} size={20} />
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                feat.badgeAccent ? 'bg-brand-primary text-bg-dark' : 'bg-gray-900 text-white'
              }`}
              style={monoLabel}
            >
              {feat.badge}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg uppercase tracking-tight text-gray-900" style={headingFont}>
            {feat.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-gray-500">{feat.description}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 pt-1">
            {feat.highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-all duration-200 group-hover:border-brand-primary/25 group-hover:bg-brand-primary/5 group-hover:text-gray-800"
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
  const [activeTab, setActiveTab] = useState<string>('personal')
  const current = TABS.find((t) => t.id === activeTab)!
  const steps = activeTab === 'personal' ? PERSONAL_STEPS : ALUNO_STEPS

  return (
    <section id="features" aria-label="Funcionalidades da plataforma">
      {/* ── LIGHT AREA: Feature Cards ── */}
      <div className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32">
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/3 rounded-full bg-brand-primary/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <IntersectionReveal animation="blur-in">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary"
                style={monoLabel}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
                A Plataforma
              </span>
              <h2
                className="mt-6 text-3xl uppercase tracking-tight text-gray-950 sm:text-4xl lg:text-5xl"
                style={headingFont}
              >
                Tudo que você precisa,{' '}
                <span className="text-brand-primary">nada</span> que não precisa
              </h2>
              <p className="mt-5 text-base text-gray-500 sm:text-lg">
                Operacional, cobrança e IA no mesmo lugar. Sem malabarismos, sem planilhas soltas.
              </p>
            </div>
          </IntersectionReveal>

          {/* Tabs */}
          <IntersectionReveal animation="fade-in" delay={100}>
            <div className="mx-auto mb-12 flex max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:max-w-md">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-bg-dark shadow-md'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={monoLabel}
                >
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
                <DSIcon name="flame" size={16} className="text-brand-primary" />
                99.9% UPTIME
              </span>
              <span className="hidden h-3 w-px bg-gray-300 sm:block" />
              <span className="flex items-center gap-2">
                <DSIcon name="lock" size={16} className="text-brand-primary" />
                CRIPTOGRAFIA E2E
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
              <h2
                className="mt-3 text-3xl font-black uppercase tracking-tight text-gray-950 sm:text-4xl lg:text-5xl"
                style={headingFont}
              >
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
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-primary/25 hover:shadow-md sm:p-8">
                  {/* Watermark number */}
                  <span
                    className="pointer-events-none absolute -right-2 -top-3 select-none text-7xl font-black text-brand-primary/15 sm:text-8xl"
                    style={headingFont}
                  >
                    {step.number}
                  </span>

                  <div className="relative">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary/20">
                      <DSIcon name={step.icon} />
                    </div>
                    <h3 className="mb-2 text-lg font-black tracking-tight text-gray-900" style={headingFont}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </div>
              </IntersectionReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRANSITION: direct cut to dark section ── */}
      <div className="h-px bg-gray-300" />
    </section>
  )
}
