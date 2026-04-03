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

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { trackLandingEvent } from '@/lib/landing-analytics'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'

/* ─── Typography — Koyeb-style heavy uppercase ─── */
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
    photo: '/images/testimonials/thiago.webp',
    text: 'Pago tudo por Pix automático e recebo notificação quando o treino novo fica pronto. Muito prático.',
    rating: 5,
    highlight: 'Muito prático',
  },
  {
    name: 'Camila Ferreira',
    role: 'Aluna · 3 meses',
    photo: '/images/testimonials/camila.webp',
    text: 'A avaliação física com gráficos de evolução é incrível. Vejo minha transformação com dados reais.',
    rating: 5,
    highlight: 'transformação com dados reais',
  },
  {
    name: 'Bruno Nascimento',
    role: 'Aluno · 11 meses',
    photo: '/images/testimonials/bruno.webp',
    text: 'Os vídeos demonstrativos de cada exercício são perfeitos. Nunca faço nada errado na academia.',
    rating: 5,
    highlight: 'vídeos demonstrativos',
  },
  {
    name: 'Isabela Martins',
    role: 'Aluna · 5 meses',
    photo: '/images/testimonials/isabela.webp',
    text: 'Meu personal consegue acompanhar minha evolução em tempo real. Me sinto muito mais acompanhada.',
    rating: 5,
    highlight: 'tempo real',
  },
  {
    name: 'Gabriel Santos',
    role: 'Aluno · 9 meses',
    photo: '/images/testimonials/gabriel.webp',
    text: 'O ranking entre alunos me motiva muito. Estou sempre tentando subir de posição. Já perdi 12kg!',
    rating: 5,
    highlight: 'perdi 12kg',
  },
  {
    name: 'Luana Oliveira',
    role: 'Aluna · 7 meses',
    photo: '/images/testimonials/luana.webp',
    text: 'Os lembretes automáticos de treino são perfeitos. Não esqueço nenhum dia e minha frequência melhorou muito.',
    rating: 5,
    highlight: 'frequência melhorou muito',
  },
  {
    name: 'Felipe Cardoso',
    role: 'Aluno · 4 meses',
    photo: '/images/testimonials/felipe.webp',
    text: 'A interface é linda e fácil de usar. Meu treino anterior era uma planilha no Excel que eu mal entendia.',
    rating: 5,
    highlight: 'linda e fácil',
  },
  {
    name: 'Amanda Reis',
    role: 'Aluna · 1 ano e 2 meses',
    photo: '/images/testimonials/amanda.webp',
    text: 'Acompanho minha evolução corporal com gráficos incríveis. Cada avaliação me motiva a continuar firme.',
    rating: 5,
    highlight: 'evolução corporal',
  },
]

const TABS = [
  { id: 'personals', label: 'PERSONAL TRAINERS', data: PERSONALS },
  { id: 'alunos', label: 'ALUNOS', data: ALUNOS },
] as const

/* ─── Stars — modern pill badge ─── */
function Stars({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 ring-1 ring-amber-200/60">
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <svg key={i} className="h-3.5 w-3.5 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] font-bold text-amber-600">{count}.0</span>
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
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-brand-primary to-[#16A34A] ring-2 ring-brand-primary/25 shadow-md sm:h-14 sm:w-14 sm:ring-[3px]">
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

/* ─── Card — modern glassmorphism-lite ─── */
function TestimonialCard({ t }: { t: Testimonial }) {
  const parts = t.text.split(t.highlight)

  return (
    <div className="group relative flex h-60 w-80 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-3 cursor-pointer sm:h-80 sm:w-96 sm:p-7 lg:w-105">
      {/* Quote watermark */}
      <svg className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-brand-primary/4 transition-all duration-300 group-hover:text-brand-primary/8 sm:h-24 sm:w-24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
      </svg>

      {/* Stars — top right */}
      <div className="mb-3 sm:mb-5">
        <Stars count={t.rating} />
      </div>

      {/* Quote */}
      <blockquote className="flex-1 text-sm leading-relaxed text-gray-600 sm:text-[15px] sm:leading-[1.7]">
        &ldquo;{parts.map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <strong className="font-semibold text-gray-900">{t.highlight}</strong>
            )}
          </span>
        ))}&rdquo;
      </blockquote>

      {/* Divider */}
      <div className="my-3 h-px bg-gray-100 sm:my-5" />

      {/* Footer: Avatar + Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <Avatar name={t.name} photo={t.photo} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-gray-900" style={headingFont}>
            {t.name}
          </div>
          <div className="truncate text-[10px] text-gray-400 uppercase tracking-wider" style={monoLabel}>
            {t.role}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function HowItWorksV2() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)

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
      className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32"
      aria-label="Depoimentos e como funciona"
    >
      {/* Subtle grid pattern — Koyeb style */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Solid divider — clean separation from dark pricing section */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Label */}
        <IntersectionReveal animation="fade-in">
          <div className="text-center mb-5">
            <span
              className="inline-block text-xs text-gray-400 uppercase"
              style={monoLabel}
            >
              /DEPOIMENTOS
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading — Koyeb ultra-bold */}
        <IntersectionReveal animation="fade-in" delay={50}>
          <h2
            className="mx-auto max-w-4xl text-center uppercase text-gray-950 mb-4"
            style={{
              ...headingFont,
              fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
              lineHeight: '0.95',
            }}
          >
            QUEM USA,{' '}
            <span className="bg-linear-to-r from-brand-primary via-[#34D399] to-brand-accent bg-clip-text text-transparent">RECOMENDA</span>
          </h2>
        </IntersectionReveal>

        {/* Subtitle */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto max-w-lg text-center text-base text-gray-500 mb-10 sm:mb-14">
            Mais de 2.500 personal trainers e 850 mil alunos já transformaram sua rotina.
          </p>
        </IntersectionReveal>

        {/* Tabs — pill style like Koyeb */}
        <IntersectionReveal animation="fade-in" delay={150}>
          <div className="flex justify-center mb-10 sm:mb-14">
            <div className="inline-flex rounded-full border border-gray-300 bg-white p-1 shadow-sm">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={monoLabel}
                  className={`relative rounded-full px-5 py-2.5 text-[11px] transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-gray-900 shadow-md'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </IntersectionReveal>

      </div>

      {/* Cards — full-bleed 100vw marquee (breaks out of container) */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 py-2">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-bg-landing-light to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-bg-landing-light to-transparent sm:w-32" />

        <div className="overflow-hidden pb-6">
          <div
            key={activeTab}
            className="flex gap-6 will-change-transform"
            style={{ animation: 'testimonialMarquee 60s linear infinite' }}
            onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
            onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
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

        {/* CTA — DS Button */}
        <IntersectionReveal animation="fade-in" delay={350}>
          <div className="mt-8 flex justify-center">
            <Link
              href="/welcome"
              onClick={() => {
                trackLandingEvent('lp_cta_primary_click', {
                  placement: 'reviews',
                  destination: 'register',
                })
              }}
            >
              <Button variant="outline" size="lg" className="text-xs uppercase tracking-widest">
                <DSIcon name="sparkles" size={14} />
                COMEÇAR GRÁTIS
              </Button>
            </Link>
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
