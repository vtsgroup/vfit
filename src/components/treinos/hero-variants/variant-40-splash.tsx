'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { notifyMaestroSignal } from '@/lib/prompt-maestro'
import { type HeroVariantProps, translateMuscles } from './types'

/**
 * HeroSplash — hero da home do aluno na linguagem visual da splash.
 *
 * Regra do produto: header + navbar + heroes sempre escuros (navy da splash),
 * body claro. Este hero é a peça escura que fecha o chrome superior.
 *
 * Substitui o HeroCarbono. Diferenças deliberadas:
 *  - sem textura de fibra de carbono (resíduo "carbono/racing")
 *  - sem metáfora de automobilismo na copy (telemetria/volta/boxes)
 *  - sem velocímetro de ponteiro → anel de progresso + gráfico de macros
 *  - topo em #0f1a2b, exatamente onde .ds3-header termina → fusão sem degrau
 *
 * Paleta portada 1:1 de src/components/ui/splash-screen.tsx.
 *
 * Conformidade ui-ux-pro-max:
 *  §1 aria-label em todo gráfico; cor nunca é o único portador de significado
 *  §2 alvos de toque ≥44px; feedback de press; haptics
 *  §6 tabular-nums em todo dado numérico; labels ≥10px
 *  §7 animações 150–900ms, só transform/opacity/stroke; prefers-reduced-motion
 *  §10 direct-labeling, empty-data-state, contraste de dados ≥3:1
 */

const SPLASH_GRID = [
  'linear-gradient(rgba(58,181,74,0.06) 1px, transparent 1px)',
  'linear-gradient(90deg, rgba(58,181,74,0.06) 1px, transparent 1px)',
].join(', ')

const GRID_MASK = 'radial-gradient(circle at 50% 30%, #000 18%, transparent 78%)'

const RING_R = 34
const RING_C = 2 * Math.PI * RING_R

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

/** Barra de macro — cor + rótulo textual (nunca só cor). §10 color-not-only */
function MacroBar({
  label,
  value,
  target,
  unit,
  from,
  to,
  delay,
}: {
  label: string
  value: number
  target: number
  unit: string
  from: string
  to: string
  delay: number
}) {
  const pct = target > 0 ? clampPct((value / target) * 100) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">{label}</span>
        {/* direct-labeling + tabular-nums §6/§10 */}
        <span className="text-[10px] font-black tabular-nums text-slate-200">
          {Math.round(value)}
          <span className="text-slate-400">/{target}{unit}</span>
        </span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8"
        role="img"
        aria-label={`${label}: ${Math.round(value)} de ${target}${unit}, ${pct}% da meta`}
      >
        <div
          className="vfit-bar-fill h-full rounded-full"
          style={{
            width: `${Math.max(2, pct)}%`,
            background: `linear-gradient(90deg, ${from}, ${to})`,
            boxShadow: `0 0 8px ${to}66`,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-[22px] font-black leading-none tracking-tight tabular-nums ${
          accent ? 'text-emerald-300' : 'text-[#edf4ee]'
        }`}
      >
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-bold text-slate-400">{unit}</span>}
      </p>
    </div>
  )
}

/** CTA primário — gradiente da splash + varredura de brilho. §4 primary-action */
function CtaShell({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="vfit-cta relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-[18px] text-[15px] font-black tracking-tight text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] active:brightness-95"
      style={{
        background: 'linear-gradient(180deg, #4ed06a 0%, #33a94a 55%, #2e9f3c 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.32), 0 0 16px rgba(58,181,74,0.34), 0 16px 34px -16px rgba(58,181,74,0.72)',
      }}
    >
      <span
        className="vfit-shine pointer-events-none absolute inset-y-0 -left-full w-1/2"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }}
        aria-hidden
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </span>
  )
}

export function HeroSplash({
  userName,
  todayDay,
  plan,
  planPct,
  totals,
  targets,
  streak,
  xpBalance,
  dailyGoal,
  workoutCount,
}: HeroVariantProps) {
  const firstName = userName?.split(' ')[0] ?? 'atleta'
  const goalPct = clampPct((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDays = streak?.current_streak ?? 0
  const duration = todayDay?.estimated_duration_min ?? 0
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const muscles = todayDay ? translateMuscles(todayDay.muscle_groups ?? []) || 'Treino personalizado' : ''
  const hasMacroTargets = targets.calories > 0 || targets.protein > 0

  // R4 do Maestro: nenhum prompt não-legal antes de o usuário ver o CTA do
  // treino. O observer dispara o sinal uma única vez quando o CTA entra na tela.
  const ctaRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    const el = ctaRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      notifyMaestroSignal('hero_cta_seen')
      return
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        notifyMaestroSignal('hero_cta_seen')
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    // -mt-[2px]: sobrepõe o hero 2px sob o header fixo — mata a hairline de
    // fundo de página que aparece por arredondamento de device-pixel
    <section className="-mx-4 -mt-[2px] mb-5 text-[#edf4ee]">
      <style>{`
        @keyframes vfit-glow { 0%,100% { opacity:.55; transform: translate3d(0,0,0) scale(1); } 50% { opacity:.85; transform: translate3d(-10px,8px,0) scale(1.1); } }
        @keyframes vfit-glow-b { 0%,100% { opacity:.4; transform: translate3d(0,0,0) scale(1.05); } 50% { opacity:.7; transform: translate3d(12px,-6px,0) scale(1); } }
        @keyframes vfit-ring-in { from { stroke-dashoffset: ${RING_C}; } }
        @keyframes vfit-bar-in { from { transform: scaleX(0); } }
        @keyframes vfit-shine { 0% { left:-60%; } 60%,100% { left:140%; } }
        .vfit-glow-a { animation: vfit-glow 9s ease-in-out infinite; }
        .vfit-glow-b { animation: vfit-glow-b 11s ease-in-out infinite; }
        .vfit-ring { animation: vfit-ring-in .9s cubic-bezier(.22,1,.36,1) both; }
        .vfit-bar-fill { transform-origin: left center; animation: vfit-bar-in .7s cubic-bezier(.22,1,.36,1) both; }
        .vfit-shine { animation: vfit-shine 4.5s ease-in-out 1.2s infinite; }
        /* §7 reduced-motion: estado final preservado, movimento removido */
        @media (prefers-reduced-motion: reduce) {
          .vfit-glow-a, .vfit-glow-b, .vfit-ring, .vfit-bar-fill, .vfit-shine { animation: none !important; }
          .vfit-shine { display: none; }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-b-[32px]"
        style={{
          // #0f1a2b = cor exata onde .ds3-header termina → sem degrau na emenda.
          // Depois abre para o navy da splash (#0c1a3a) e fecha em #08122b.
          background: 'linear-gradient(180deg, #0f1a2b 0%, #0c1a3a 38%, #091530 72%, #08122b 100%)',
          boxShadow: '0 30px 54px -34px rgba(4,10,26,0.95)',
        }}
      >
        {/* grid da splash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: SPLASH_GRID,
            backgroundSize: '34px 34px',
            WebkitMaskImage: GRID_MASK,
            maskImage: GRID_MASK,
          }}
          aria-hidden
        />
        {/* aurora — verde da splash + azul de profundidade */}
        <div
          className="vfit-glow-a pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(58,181,74,0.42), rgba(58,181,74,0.10) 45%, transparent 68%)',
            filter: 'blur(26px)',
          }}
          aria-hidden
        />
        <div
          className="vfit-glow-b pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(64,132,255,0.34), rgba(64,132,255,0.08) 48%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          aria-hidden
        />
        {/* vinheta da splash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 38%, transparent 45%, rgba(4,9,22,0.55) 100%)' }}
          aria-hidden
        />

        <div className="relative px-4 pb-5 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300 tabular-nums">
            Dia {currentDay} de {totalDays}
          </p>
          <h1
            className="mt-1 text-[32px] font-black leading-[0.94] tracking-[-0.03em]"
            style={{
              background: 'linear-gradient(96deg, #ffffff 28%, #a8d4ff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 22px rgba(58,181,74,0.24))',
            }}
          >
            Bora, {firstName}
          </h1>

          {todayDay ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                {/* anel de progresso — substitui o velocímetro */}
                <div className="relative h-[82px] w-[82px] shrink-0">
                  <svg viewBox="0 0 82 82" className="h-full w-full -rotate-90" aria-hidden>
                    <circle cx="41" cy="41" r={RING_R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
                    <circle
                      className="vfit-ring"
                      cx="41"
                      cy="41"
                      r={RING_R}
                      fill="none"
                      stroke="url(#vfit-ring-grad)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={RING_C * (1 - goalPct / 100)}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(58,181,74,0.6))' }}
                    />
                    <defs>
                      <linearGradient id="vfit-ring-grad" x1="0" y1="0" x2="82" y2="82" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4ed06a" />
                        <stop offset="100%" stopColor="#2e9f3c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* §10 screen-reader-summary */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`Meta diária: ${goalPct}% concluída`}>
                    <p className="text-[20px] font-black leading-none tabular-nums text-[#edf4ee]">
                      {goalPct}
                      <span className="text-[10px] font-bold text-slate-400">%</span>
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Meta</p>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-3 gap-2">
                  <Stat label="XP" value={String(xp)} accent />
                  <Stat label="Streak" value={String(streakDays)} unit="d" />
                  <Stat label="Duração" value={String(duration)} unit="min" />
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300/90">Treino de hoje</p>
                <h2 className="mt-1 text-[21px] font-black leading-tight text-[#edf4ee]">{todayDay.name ?? 'Treino do dia'}</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{muscles}</p>
              </div>

              <Link ref={ctaRef} href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <CtaShell>
                  <DSIcon name="play" size={17} />
                  Começar treino de hoje
                </CtaShell>
              </Link>

              {/* gráfico de macros — dados reais de totals/targets. §10 */}
              {hasMacroTargets && (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-3 backdrop-blur-[6px]">
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">Macros de hoje</p>
                    <Link
                      href="/nutricao"
                      onClick={() => hapticLight()}
                      className="-m-2 flex items-center gap-1 p-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300 transition-opacity active:opacity-60"
                    >
                      Ver
                      <DSIcon name="chevronRight" size={12} />
                    </Link>
                  </div>
                  <div className="space-y-2.5">
                    <MacroBar label="Calorias" value={totals.calories} target={targets.calories} unit="" from="#2e9f3c" to="#4ed06a" delay={0} />
                    <MacroBar label="Proteína" value={totals.protein} target={targets.protein} unit="g" from="#0284c7" to="#38bdf8" delay={80} />
                    <MacroBar label="Carbos" value={totals.carbs} target={targets.carbs} unit="g" from="#b45309" to="#fbbf24" delay={160} />
                    <MacroBar label="Gordura" value={totals.fat} target={targets.fat} unit="g" from="#6d28d9" to="#a78bfa" delay={240} />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Progresso do plano</p>
                  <p className="text-[13px] font-black tabular-nums text-emerald-300">{clampPct(planPct)}%</p>
                </div>
                <div
                  className="relative h-2 overflow-hidden rounded-full bg-white/8"
                  role="img"
                  aria-label={`Progresso do plano: ${clampPct(planPct)}%`}
                >
                  <div
                    className="vfit-bar-fill h-full rounded-full"
                    style={{
                      width: `${Math.max(3, clampPct(planPct))}%`,
                      background: 'linear-gradient(90deg, #2e9f3c, #4ed06a)',
                      boxShadow: '0 0 10px rgba(58,181,74,0.6)',
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400 tabular-nums">
                  {workoutCount > 0 ? `${workoutCount} treinos no histórico` : 'Seu primeiro treino começa hoje'}
                </p>
              </div>
            </>
          ) : (
            /* §10 empty-data-state */
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300/90">Primeiro passo</p>
              <h2 className="mt-1 text-[20px] font-black leading-tight text-[#edf4ee]">Seu plano ainda não existe</h2>
              <p className="mt-1 text-[12px] leading-snug text-slate-400">
                Gere seu plano com IA e comece a treinar hoje.
              </p>
              <Link ref={ctaRef} href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <CtaShell>
                  <DSIcon name="sparkles" size={17} />
                  Gerar plano com IA
                  <DSIcon name="chevronRight" size={15} />
                </CtaShell>
              </Link>
            </div>
          )}
        </div>

        {/* fio verde da splash fechando o bloco escuro contra o body claro */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
      </div>
    </section>
  )
}

export default HeroSplash
