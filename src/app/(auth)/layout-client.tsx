/**
 * src/app/(auth)/layout-client.tsx
 *
 * Auth Layout Client — VFIT BROADCAST split screen (dark único)
 *
 * Esquerda: painel editorial seco — grade técnica, manchete Syne gigante, box-score
 * de stats, chips mono e depoimentos em cards dark glass (marquee). Sem fotos, sem
 * aurora, sem Ken Burns — mesma linguagem do /welcome.
 * Direita: formulário dark, max width 420px. Separador hairline verde.
 *
 * Exports: AuthLayoutClient
 */

'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'

const VFIT_LETTERS = 'VFIT'.split('')

function AnimatedAuthLogo({ size = 'large' }: { size?: 'large' | 'small' }) {
  const [typedCount, setTypedCount] = useState(0)
  const [markIn, setMarkIn] = useState(false)

  useEffect(() => {
    const markTimer = setTimeout(() => setMarkIn(true), 60)
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedCount(i)
      if (i >= VFIT_LETTERS.length) {
        clearInterval(interval)
      }
    }, 80)
    return () => { clearInterval(interval); clearTimeout(markTimer) }
  }, [])

  const isLarge = size === 'large'
  const markSize = isLarge ? 46 : 32
  const fontSize = isLarge ? '46px' : '32px'
  const lineH = isLarge ? '54px' : '38px'
  const cursorH = isLarge ? '42px' : '28px'

  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="VFIT - Início">
      {/* ─── Logomark (official SVG) ─── */}
      <span
        className="relative inline-flex shrink-0 transition-all duration-500 ease-out"
        style={{
          width: markSize,
          height: markSize,
          opacity: markIn ? 1 : 0,
          transform: markIn ? 'scale(1)' : 'scale(0.6)',
        }}
      >
        {/* Soft brand glow behind the mark */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[26%] blur-md"
          style={{ background: 'rgba(34,197,94,0.45)', transform: 'scale(0.92)' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicons/favicon.svg"
          alt=""
          width={markSize}
          height={markSize}
          className="relative rounded-[26%] shadow-[0_8px_22px_-6px_rgba(34,197,94,0.55)] ring-1 ring-white/15 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3"
        />
      </span>

      {/* ─── Wordmark with typewriter ─── */}
      <div className="relative flex items-center">
        <span
          className="font-syne inline-flex items-center font-extrabold text-white"
          style={{ fontSize, letterSpacing: '-0.02em', lineHeight: lineH }}
        >
          {VFIT_LETTERS.map((letter, idx) => (
            <span
              key={idx}
              className="inline-block transition-all duration-200 ease-out"
              style={{
                opacity: idx < typedCount ? 1 : 0,
                transform: idx < typedCount ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              {letter}
            </span>
          ))}
        </span>

        {/* Typing cursor */}
        <span
          className="ml-px inline-block w-[2.5px] rounded-full bg-brand-primary transition-opacity duration-300"
          style={{
            height: cursorH,
            opacity: typedCount < VFIT_LETTERS.length ? 1 : 0,
            animation: typedCount < VFIT_LETTERS.length ? 'authCursorBlink 600ms step-end infinite' : 'none',
          }}
        />
      </div>
    </Link>
  )
}

/* ─── Feature chip — aparato mono BROADCAST ─── */
function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bc-mono flex select-none items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-slate-300 transition-all hover:border-green-400/30 hover:bg-green-400/6">
      <span className="text-green-300/80">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

/* ─── Testimonials data ─── */
const AUTH_TESTIMONIALS = [
  { name: 'Carlos Mendes', role: 'Personal Trainer · São Paulo', avatar: 'CM', text: 'A IA gera treinos incríveis em segundos. Meus alunos adoram a personalização e eu economizo horas por semana.', highlight: 'economizo horas' },
  { name: 'Ana Beatriz', role: 'Personal Trainer · Rio de Janeiro', avatar: 'AB', text: 'O sistema de cobranças automáticas mudou meu negócio. Não perco mais tempo cobrando alunos.', highlight: 'mudou meu negócio' },
  { name: 'Rafael Santos', role: 'Personal Trainer · Belo Horizonte', avatar: 'RS', text: 'Comecei com 10 alunos e hoje tenho 85 usando a plataforma. A gestão ficou muito mais organizada.', highlight: 'hoje tenho 85' },
  { name: 'Juliana Costa', role: 'Personal Trainer · Curitiba', avatar: 'JC', text: 'O marketplace é genial. Já vendi mais de 200 programas de treino para pessoas que nem são meus alunos.', highlight: 'mais de 200' },
  { name: 'Pedro Oliveira', role: 'Dono de Academia · Salvador', avatar: 'PO', text: 'Implementamos para todos os 12 personais da academia. O relatório admin é fantástico.', highlight: '12 personais' },
]

function TestimonialCarousel() {
  return (
    <div className="relative -mx-10 xl:-mx-14">
      {/* Edge fade masks — match navy bg */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-[#04080f] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-[#04080f] to-transparent" />

      <div className="overflow-hidden">
        <div
          className="flex gap-4 will-change-transform"
          style={{ animation: 'authMarquee 40s linear infinite' }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
        >
          {[...AUTH_TESTIMONIALS, ...AUTH_TESTIMONIALS].map((t, i) => (
            <div key={i} className="w-65 shrink-0 xl:w-70">
              <div className="flex h-45 flex-col rounded-2xl border border-white/10 bg-white/3 p-4 shadow-glass-inset-sm backdrop-blur-sm transition-colors duration-300 hover:border-green-400/25">
                {/* Stars + rating */}
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="bc-mono text-[10px] font-bold text-amber-400">5.0</span>
                </div>

                {/* Quote */}
                <p className="line-clamp-4 flex-1 text-[12px] leading-relaxed text-slate-400">
                  &ldquo;{t.text.split(t.highlight)[0]}
                  <strong className="font-bold text-white">{t.highlight}</strong>
                  {t.text.split(t.highlight)[1]}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-2 flex items-center gap-2 border-t border-white/8 pt-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-[#06210f] shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)' }}
                  >
                    {t.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-semibold text-white">{t.name}</div>
                    <div className="bc-mono truncate text-[8px] font-semibold tracking-[0.06em] text-slate-500">
                      {t.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hidesMobileLogo = pathname?.startsWith('/register/student')

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes authCursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes authMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes authLivePing { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); } 70%,100% { box-shadow: 0 0 0 7px rgba(74,222,128,0); } }
        .auth-bc-live { animation: authLivePing 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .auth-bc-live { animation: none !important; }
        }
      `}</style>

      <div className="auth-dark-scope dark flex min-h-screen bg-[#04080f]" style={{ colorScheme: 'dark', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* ─── LEFT PANEL — placar editorial BROADCAST ─── */}
        <div className="relative hidden overflow-hidden lg:flex lg:w-[48%] xl:w-1/2">
          {/* atmosfera "impressa" seca — grade técnica + bloom verde (sem orbs/aurora) */}
          <div aria-hidden className="vfit-flow-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 70% at 20% -8%, rgba(34,197,94,0.12), transparent 55%)' }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-green-400/40 to-transparent" />

          {/* numeral índice marca d'água (editorial) */}
          <span
            aria-hidden
            className="font-syne pointer-events-none absolute -right-6 top-[8%] z-0 select-none font-extrabold leading-[0.78]"
            style={{
              fontSize: 'clamp(14rem, 26vw, 24rem)',
              color: 'rgba(34,197,94,0.06)',
              WebkitTextStroke: '1.5px rgba(34,197,94,0.2)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            01
          </span>

          {/* ─── Content ─── */}
          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo top */}
            <AnimatedAuthLogo size="large" />

            {/* Manchete + aparato */}
            <div className="max-w-lg">
              <p className="bc-mono mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-green-300/90">
                <span aria-hidden className="auth-bc-live inline-block h-2 w-2 rounded-full bg-green-400" />
                Plataforma Nº 01 · Personal Trainers
              </p>
              <h2 className="font-syne mb-4 text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight text-white xl:text-[3.1rem]">
                Treinos,
                <br />
                alunos e{' '}
                <span className="text-[#22c55e]" style={{ textShadow: '0 6px 34px rgba(34,197,94,0.32)' }}>
                  cobranças
                </span>
              </h2>
              <p className="mb-6 max-w-md text-[14px] leading-relaxed text-slate-400">
                Gere treinos com IA, acompanhe evolução e receba pagamentos automaticamente — tudo em uma plataforma.
              </p>

              {/* Feature chips — 2 rows */}
              <div className="mb-6 flex flex-wrap gap-1.5">
                <FeatureChip icon={<DSIcon name="bot" size={12} />} label="IA GENERATIVA" />
                <FeatureChip icon={<DSIcon name="creditCard" size={12} />} label="PIX AUTOMÁTICO" />
                <FeatureChip icon={<DSIcon name="barChart" size={12} />} label="MÉTRICAS" />
                <FeatureChip icon={<DSIcon name="smartphone" size={12} />} label="PWA OFFLINE" />
                <FeatureChip icon={<DSIcon name="dumbbell" size={12} />} label="TREINOS IA" />
                <FeatureChip icon={<DSIcon name="users" size={12} />} label="GESTÃO ALUNOS" />
                <FeatureChip icon={<DSIcon name="calendarCheck" size={12} />} label="AGENDAMENTOS" />
                <FeatureChip icon={<DSIcon name="trophy" size={12} />} label="GAMIFICAÇÃO" />
                <FeatureChip icon={<DSIcon name="shieldCheck" size={12} />} label="LGPD" />
                <FeatureChip icon={<DSIcon name="rocket" size={12} />} label="MARKETPLACE" />
              </div>

              {/* Stats — box-score com hairlines */}
              <div className="grid max-w-sm grid-cols-3 overflow-hidden rounded-xl border border-green-400/15">
                {[
                  { value: '2.5k+', label: 'PERSONAIS' },
                  { value: '45k+', label: 'TREINOS' },
                  { value: '98%', label: 'SATISFAÇÃO' },
                ].map((stat, i) => (
                  <div key={stat.label} className={`flex flex-col gap-1 px-4 py-3.5 ${i === 1 ? 'bg-green-900/15' : ''} ${i < 2 ? 'border-r border-white/8' : ''}`}>
                    <div className="font-syne text-2xl font-black leading-none text-white tabular-nums">{stat.value}</div>
                    <div className="bc-mono text-[9px] font-bold tracking-[0.15em] text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial carousel — dark glass cards */}
            <TestimonialCarousel />
          </div>
        </div>

        {/* ─── GRADIENT BORDER SEPARATOR ─── */}
        <div className="relative hidden w-px lg:block">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-green-400/45 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-green-400/25 to-transparent blur-[3px]" />
        </div>

        {/* ─── RIGHT PANEL — Form ─── */}
        <div className="relative flex w-full flex-col lg:w-[52%] xl:w-1/2">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-green-500/4 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] h-60 w-60 rounded-full bg-green-400/3 blur-[100px]" />
          </div>

          {/* Subtle grid on right panel */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.015,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Mobile header — hidden on student register (has own cover logo) */}
          {!hidesMobileLogo && (
            <header className="relative z-10 flex items-center justify-center px-5 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
              <AnimatedAuthLogo size="small" />
            </header>
          )}

          {/* Form container — mobile fills viewport (no-scroll), desktop centered */}
          <main className="relative z-10 flex flex-1 items-start justify-center px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:py-2 lg:items-center lg:px-14 lg:py-4 xl:px-20">
            <div className="w-full max-w-105">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bc-mono relative z-10 hidden py-2 text-center text-[9px] font-bold tracking-[0.15em] text-white/25 sm:block">
            © {new Date().getFullYear()} VFIT · TODOS OS DIREITOS RESERVADOS
          </footer>
        </div>
      </div>
    </>
  )
}
