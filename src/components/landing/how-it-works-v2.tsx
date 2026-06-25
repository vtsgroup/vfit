// ============================================
// how-it-works-v2.tsx — Seção "Como funciona" da landing page (v2)
// ============================================
//
// O que faz:
//   Passo a passo animado do fluxo do produto (cadastro → treinos → resultados).
//   Step ativo muda automaticamente via setInterval ou ao clicar.
//   CTA de cadastro com trackLandingEvent ao clicar.
//
// Exports principais:
//   HowItWorksV2 — seção de steps "como funciona"
'use client'

import { useState, useEffect, type MouseEvent } from 'react'
import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { DSIcon } from '@/components/ui/ds-icon'

/* Spotlight verde que segue o cursor (via CSS vars, sem re-render) */
function handleCardMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* ─── Typography — Koyeb-style heavy uppercase ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '0',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Data ─── */
interface Testimonial {
  name: string
  role: string
  photo: string
  text: string
  rating: number
  highlight: string
}

const PERSONALS: Testimonial[] = [
  {
    name: 'Carlos Mendes',
    role: 'Personal Trainer · São Paulo',
    photo: '/images/testimonials/carlos.webp',
    text: 'A IA gera treinos incríveis em segundos. Meus alunos adoram a personalização e eu economizo horas por semana.',
    rating: 5,
    highlight: 'economizo horas por semana',
  },
  {
    name: 'Ana Beatriz',
    role: 'Personal Trainer · Rio de Janeiro',
    photo: '/images/testimonials/ana.webp',
    text: 'O sistema de cobranças automáticas mudou meu negócio. Não perco mais tempo cobrando alunos individualmente.',
    rating: 5,
    highlight: 'mudou meu negócio',
  },
  {
    name: 'Rafael Santos',
    role: 'Personal Trainer · Belo Horizonte',
    photo: '/images/testimonials/rafael.webp',
    text: 'Comecei com 10 alunos e hoje tenho 85 usando a plataforma. A gestão ficou muito mais organizada.',
    rating: 5,
    highlight: 'hoje tenho 85',
  },
  {
    name: 'Juliana Costa',
    role: 'Personal Trainer · Curitiba',
    photo: '/images/testimonials/juliana.webp',
    text: 'O marketplace é genial. Já vendi mais de 200 programas de treino para pessoas que nem são meus alunos.',
    rating: 5,
    highlight: 'mais de 200 programas',
  },
  {
    name: 'Pedro Oliveira',
    role: 'Dono de Academia · Salvador',
    photo: '/images/testimonials/pedro.webp',
    text: 'Implementamos para todos os 12 personais da academia. O relatório admin é fantástico.',
    rating: 5,
    highlight: '12 personais da academia',
  },
  {
    name: 'Fernanda Lima',
    role: 'Personal Trainer · Brasília',
    photo: '/images/testimonials/fernanda.webp',
    text: 'A avaliação física automatizada impressiona os alunos. Gero relatórios profissionais em menos de 2 minutos.',
    rating: 5,
    highlight: 'menos de 2 minutos',
  },
  {
    name: 'Marcos Vieira',
    role: 'Personal Trainer · Florianópolis',
    photo: '/images/testimonials/marcos.webp',
    text: 'A gamificação com XP e conquistas engajou demais meus alunos. A retenção aumentou 40% em 3 meses.',
    rating: 5,
    highlight: 'aumentou 40%',
  },
  {
    name: 'Patrícia Souza',
    role: 'Personal Trainer · Porto Alegre',
    photo: '/images/testimonials/patricia.webp',
    text: 'Antes eu usava 3 apps diferentes. Agora tudo está num lugar só: treinos, pagamentos e evolução dos alunos.',
    rating: 5,
    highlight: 'tudo está num lugar só',
  },
  {
    name: 'Diego Almeida',
    role: 'Personal Trainer · Recife',
    photo: '/images/testimonials/diego.webp',
    text: 'O Pix automático foi revolucionário. Recebo de 95% dos alunos no dia certo sem precisar cobrar ninguém.',
    rating: 5,
    highlight: '95% dos alunos',
  },
  {
    name: 'Camila Borges',
    role: 'Personal Trainer · Goiânia',
    photo: '/images/testimonials/camila-b.webp',
    text: 'Minha produtividade triplicou. A IA monta o treino e eu só ajusto os detalhes. Atendo 3x mais alunos.',
    rating: 5,
    highlight: 'triplicou',
  },
]

const ALUNOS: Testimonial[] = [
  {
    name: 'Lucas Andrade',
    role: 'Aluno · 8 meses',
    photo: '/images/testimonials/lucas.webp',
    text: 'Recebo meu treino novo toda semana pelo app. É muito mais motivante do que planilha no WhatsApp.',
    rating: 5,
    highlight: 'muito mais motivante',
  },
  {
    name: 'Mariana Silva',
    role: 'Aluna · 1 ano',
    photo: '/images/testimonials/mariana.webp',
    text: 'O sistema de XP e conquistas me mantém na academia mesmo nos dias difíceis. Já estou no nível 22!',
    rating: 5,
    highlight: 'nível 22',
  },
  {
    name: 'Thiago Rocha',
    role: 'Aluno · 6 meses',
    photo: '/images/testimonials/diego.webp',
    text: 'Pago tudo por Pix automático e recebo notificação quando o treino novo fica pronto. Muito prático.',
    rating: 5,
    highlight: 'Muito prático',
  },
  {
    name: 'Camila Ferreira',
    role: 'Aluna · 3 meses',
    photo: '/images/testimonials/camila-b.webp',
    text: 'A avaliação física com gráficos de evolução é incrível. Vejo minha transformação com dados reais.',
    rating: 5,
    highlight: 'transformação com dados reais',
  },
  {
    name: 'Bruno Nascimento',
    role: 'Aluno · 11 meses',
    photo: '/images/testimonials/carlos.webp',
    text: 'Os vídeos demonstrativos de cada exercício são perfeitos. Nunca faço nada errado na academia.',
    rating: 5,
    highlight: 'vídeos demonstrativos',
  },
  {
    name: 'Isabela Martins',
    role: 'Aluna · 5 meses',
    photo: '/images/testimonials/fernanda.webp',
    text: 'Meu personal consegue acompanhar minha evolução em tempo real. Me sinto muito mais acompanhada.',
    rating: 5,
    highlight: 'tempo real',
  },
  {
    name: 'Gabriel Santos',
    role: 'Aluno · 9 meses',
    photo: '/images/testimonials/rafael.webp',
    text: 'O ranking entre alunos me motiva muito. Estou sempre tentando subir de posição. Já perdi 12kg!',
    rating: 5,
    highlight: 'perdi 12kg',
  },
  {
    name: 'Luana Oliveira',
    role: 'Aluna · 7 meses',
    photo: '/images/testimonials/juliana.webp',
    text: 'Os lembretes automáticos de treino são perfeitos. Não esqueço nenhum dia e minha frequência melhorou muito.',
    rating: 5,
    highlight: 'frequência melhorou muito',
  },
  {
    name: 'Felipe Cardoso',
    role: 'Aluno · 4 meses',
    photo: '/images/testimonials/pedro.webp',
    text: 'A interface é linda e fácil de usar. Meu treino anterior era uma planilha no Excel que eu mal entendia.',
    rating: 5,
    highlight: 'linda e fácil',
  },
  {
    name: 'Amanda Reis',
    role: 'Aluna · 1 ano e 2 meses',
    photo: '/images/testimonials/patricia.webp',
    text: 'Acompanho minha evolução corporal com gráficos incríveis. Cada avaliação me motiva a continuar firme.',
    rating: 5,
    highlight: 'evolução corporal',
  },
]

const TABS = [
  { id: 'alunos', label: 'ALUNOS', data: ALUNOS },
  { id: 'personals', label: 'PROFISSIONAIS', data: PERSONALS },
] as const

/* ─── Stars — light pill badge ─── */
function Stars({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-amber-200/70">
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <svg key={i} aria-hidden="true" focusable="false" className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] font-bold text-amber-500">{count}.0</span>
    </div>
  )
}

/* ─── Avatar with fallback initials ─── */
function Avatar({ name, photo }: { name: string; photo: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-brand-primary to-brand-accent ring-2 ring-brand-primary/25 shadow-sm sm:h-10 sm:w-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const fallback = el.nextElementSibling as HTMLElement
          if (fallback) fallback.style.display = 'flex'
        }}
      />
      <div className="absolute inset-0 items-center justify-center text-sm font-bold text-white" style={{ display: 'none' }}>
        {initials}
      </div>
    </div>
  )
}

/* ─── Card — white, compact, premium (floats on dark) ─── */
function TestimonialCard({ t }: { t: Testimonial }) {
  const parts = t.text.split(t.highlight)

  return (
    <div
      onMouseMove={handleCardMove}
      className="group relative flex h-52 w-72 shrink-0 flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out-expo hover:-translate-y-1.5 sm:h-60 sm:w-80 sm:p-6"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)',
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.05), 0 16px 40px -20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Spotlight verde sutil */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(300px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.07), transparent 60%)' }}
      />
      {/* Borda gradiente no hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(132,204,22,0.2) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {/* Glow verde no hover */}
      <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-20px_rgba(34,197,94,0.5)]" />

      {/* Quote watermark */}
      <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute -right-1 -top-1 h-12 w-12 text-brand-primary/8 transition-all duration-300 group-hover:text-brand-primary/14 sm:h-16 sm:w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
      </svg>

      {/* Stars — top */}
      <div className="relative mb-3">
        <Stars count={t.rating} />
      </div>

      {/* Quote */}
      <blockquote className="relative flex-1 overflow-hidden text-[13px] leading-relaxed text-slate-600 sm:text-sm sm:leading-[1.65]">
        &ldquo;{parts.map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <strong className="font-semibold text-emerald-600">{t.highlight}</strong>
            )}
          </span>
        ))}&rdquo;
      </blockquote>

      {/* Divider */}
      <div className="relative my-3 h-px bg-slate-100" />

      {/* Footer: Avatar + Info */}
      <div className="relative flex items-center gap-2.5">
        <Avatar name={t.name} photo={t.photo} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-gray-900" style={headingFont}>
            {t.name}
          </div>
          <div className="truncate text-[9px] text-gray-400 uppercase tracking-wider" style={monoLabel}>
            {t.role}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function HowItWorksV2() {
  const [activeTab, setActiveTab] = useState<string>('alunos')

  useEffect(() => {
    trackLandingEvent('lp_how_it_works_view', { section: 'reviews' })
  }, [])

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0]

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    trackLandingEvent('how_it_works_tab', { tab: tabId })
  }

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-bg-primary pt-16 pb-10 sm:pt-32 sm:pb-14"
      aria-label="Depoimentos e como funciona"
    >
      {/* Topo dark — vinheta de profundidade (sem fade cinza) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(2,6,16,0.55) 0%, transparent 100%)' }}
      />

      {/* Subtle grid pattern (dark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      {/* Glow verde ambiente */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-primary/5 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Label — pílula glass com gradiente */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
              style={{
                ...monoLabel,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)',
                border: '1px solid rgba(34,197,94,0.28)',
                boxShadow: '0 8px 24px -10px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="bg-linear-to-r from-brand-primary to-brand-mint bg-clip-text text-transparent">Depoimentos</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading — ultra-bold */}
        <IntersectionReveal animation="fade-in" delay={50}>
          <h2
            className="mx-auto max-w-4xl text-center text-white mb-4 [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]"
            style={{
              ...headingFont,
              fontSize: 'clamp(2.25rem, 5.8vw, 4rem)',
              lineHeight: '0.94',
              letterSpacing: '-0.02em',
            }}
          >
            QUEM USA,{' '}
              <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">RECOMENDA</span>
          </h2>
        </IntersectionReveal>

        {/* Subtitle */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto max-w-lg text-center text-base text-white/55 mb-10 sm:mb-14">
            Alunos que saíram da planilha, treinaram com mais clareza e continuaram aparecendo na academia.
          </p>
        </IntersectionReveal>

        {/* Tabs — pill com indicador deslizante (dark) */}
        <IntersectionReveal animation="fade-in" delay={150}>
          <div className="mb-10 flex justify-center sm:mb-14">
            <div
              className="relative flex w-full max-w-xs rounded-2xl border border-white/10 p-1.5 sm:max-w-sm"
              style={{ background: 'rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px -14px rgba(0,0,0,0.6)' }}
            >
              {/* Indicador verde gradiente deslizante */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1.5 rounded-xl transition-all duration-300 ease-out-expo"
                style={{
                  ...(activeTab === 'alunos' ? { left: '0.375rem', right: '50%' } : { left: '50%', right: '0.375rem' }),
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 6px 18px -4px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(6,78,59,0.4)',
                }}
              />
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={monoLabel}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-[#08122B]' : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  <DSIcon name={tab.id === 'alunos' ? 'userCheck' : 'briefcase'} size={13} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </IntersectionReveal>

      </div>

      {/* Cards — contained marquee */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Edge fade masks (dark) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-bg-primary to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-bg-primary to-transparent sm:w-32" />

        <div className="overflow-hidden pb-6">
          <div
            key={activeTab}
            className="flex gap-6 will-change-transform"
            style={{ animation: 'testimonialMarquee 60s linear infinite' }}
            onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
            onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
            onFocusCapture={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
            onBlurCapture={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
          >
            {[...currentTab.data, ...currentTab.data].map((t, i) => (
              <div key={`${activeTab}-${i}`}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">

        {/* CTA — botão "claim your spot" (navy no verde + sheen) */}
        <IntersectionReveal animation="fade-in" delay={350}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', {
                  placement: 'reviews',
                  destination: 'register',
                })
              }}
            >
              <span
                onMouseMove={handleCardMove}
                className="group/cta relative inline-flex h-13 items-center gap-3 overflow-hidden rounded-full pl-2.5 pr-6 text-[13px] font-black uppercase tracking-widest text-[#08122B] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)',
                  boxShadow: '0 12px 30px -8px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(6,78,59,0.4)',
                }}
              >
                {/* Cursor sheen */}
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100" style={{ background: 'radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.4), transparent 60%)' }} />
                {/* Light sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-linear-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/cta:translate-x-[120%]" />
                {/* Trophy chip */}
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#08122B] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  <DSIcon name="trophy" size={14} className="text-[#4ADE80]" />
                </span>
                <span className="relative z-10">Começar como aluno</span>
                <DSIcon name="arrowRight" size={15} className="relative z-10 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </span>
            </Link>
            <span className="text-[10px] text-white/45" style={monoLabel}>Suba no ranking desde o 1º treino</span>
          </div>
        </IntersectionReveal>
      </div>

      {/* Marquee animation keyframes */}
      <style jsx global>{`
        @keyframes testimonialMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
