'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, '0')

function CornerMarks() {
  const edge = 'pointer-events-none absolute h-3.5 w-3.5 border-emerald-400/70'
  return (
    <>
      <span aria-hidden className={`${edge} left-0 top-0 border-l-[1.5px] border-t-[1.5px]`} />
      <span aria-hidden className={`${edge} right-0 top-0 border-r-[1.5px] border-t-[1.5px]`} />
      <span aria-hidden className={`${edge} bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]`} />
      <span aria-hidden className={`${edge} bottom-0 right-0 border-b-[1.5px] border-r-[1.5px]`} />
    </>
  )
}

function TelemetryBar({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  const cells = 14
  const filled = Math.round((clamped / 100) * cells)
  return (
    <div className="flex items-baseline gap-2 font-mono text-[11px] leading-none">
      <span className="w-12 shrink-0 tracking-[0.14em] text-emerald-500/80">{label}</span>
      <span aria-hidden className="tracking-[0.1em]">
        <span className="text-emerald-400 [text-shadow:0_0_8px_rgba(34,197,94,0.55)]">{'█'.repeat(filled)}</span>
        <span className="text-emerald-400/18">{'░'.repeat(cells - filled)}</span>
      </span>
      <span className="ml-auto shrink-0 font-bold text-emerald-300">{pad2(clamped)}%</span>
    </div>
  )
}

export function HeroTerminal(props: HeroVariantProps) {
  const { userName, todayDay, plan, planPct, streak, xpBalance, dailyGoal } = props
  const firstName = (userName?.split(' ')[0] ?? 'atleta').toLowerCase()
  const streakN = streak?.current_streak ?? 0
  const xp = xpBalance?.balance ?? 0
  const metaPct = Math.round((dailyGoal?.progress ?? 0) * 100)
  const plano = Math.max(0, Math.min(100, Math.round(planPct ?? 0)))
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const duration = todayDay?.estimated_duration_min ?? 0
  const muscles = translateMuscles(todayDay?.muscle_groups ?? []) || 'Treino personalizado'

  return (
    <section className="relative -mx-4 mb-4 overflow-hidden rounded-b-[24px] border-b border-emerald-500/20 bg-[#02050a] text-white">
      <style>{`
        @keyframes vfit-v04-blink { 0%, 55% { opacity: 1 } 56%, 100% { opacity: 0 } }
        @keyframes vfit-v04-ping { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }
        .vfit-v04-cursor { animation: vfit-v04-blink 1.1s steps(1) infinite }
        .vfit-v04-live { animation: vfit-v04-ping 2.2s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .vfit-v04-cursor, .vfit-v04-live { animation: none }
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(34,197,94,0.045) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(34,197,94,0.035) 0 1px, transparent 1px 22px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: 'radial-gradient(70% 100% at 50% 0%, rgba(34,197,94,0.14) 0%, transparent 70%)' }}
      />

      <div className="relative px-4 pb-4 pt-4">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em]">
          <p className="text-emerald-500/90">
            <span className="text-emerald-400/50">┌</span> VFIT.OS <span className="text-emerald-400/50">▸</span> MODO_ATLETA
          </p>
          <p className="flex items-center gap-1.5 text-emerald-300">
            <span aria-hidden className="vfit-v04-live inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
            ONLINE
          </p>
        </div>

        <p className="mt-3 font-mono text-[13px] text-slate-300">
          <span className="text-emerald-400">&gt;</span> olá, <span className="font-bold text-white">{firstName}</span>
          <span className="text-slate-400"> — sistema pronto para a sessão</span>
          <span aria-hidden className="vfit-v04-cursor ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-emerald-400" />
        </p>

        <div className="relative mt-3 border border-emerald-500/15 bg-[#040b08]/85 p-3.5 shadow-[inset_0_0_32px_rgba(34,197,94,0.05)]">
          <CornerMarks />

          {todayDay ? (
            <>
              <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.2em]">
                <p className="text-emerald-400">
                  SESSÃO_{pad2(currentDay)}<span className="text-emerald-500/50">/{pad2(totalDays)}</span>
                </p>
                <p className="flex items-center gap-1 text-amber-300">
                  <DSIcon name="clock" size={11} />
                  T-{duration}MIN
                </p>
              </div>

              <h1 className="mt-2.5 text-[27px] font-black uppercase leading-[0.95] tracking-tight text-white [text-shadow:0_0_24px_rgba(34,197,94,0.28)]">
                {todayDay.name}
              </h1>
              <p className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-slate-300">
                <span className="text-emerald-500/80">GRUPO:</span> {muscles.toUpperCase()}
              </p>

              <div className="mt-3.5 space-y-2 border-t border-emerald-500/12 pt-3">
                <TelemetryBar label="PLANO" pct={plano} />
                <TelemetryBar label="META" pct={metaPct} />
              </div>

              <Link
                href="/plano"
                onClick={() => hapticLight()}
                className="group mt-4 flex min-h-12 w-full items-center justify-center gap-2.5 border border-emerald-300/60 bg-brand-primary px-4 font-mono text-[14px] font-black tracking-[0.08em] text-emerald-950 shadow-[0_0_0_1px_rgba(2,44,34,0.6),0_4px_18px_-4px_rgba(34,197,94,0.55),0_0_36px_-8px_rgba(34,197,94,0.6),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-150 hover:brightness-105 hover:shadow-[0_0_0_1px_rgba(2,44,34,0.6),0_6px_24px_-4px_rgba(34,197,94,0.7),0_0_48px_-8px_rgba(34,197,94,0.75),inset_0_1px_0_rgba(255,255,255,0.4)] active:translate-y-px active:scale-[0.985] active:brightness-90"
              >
                <DSIcon name="play" size={16} />
                COMEÇAR TREINO DE HOJE
                <span aria-hidden className="text-emerald-950/60 transition-transform duration-150 group-hover:translate-x-0.5">▸</span>
              </Link>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-[0.2em] text-amber-300">ERRO_404: PLANO_NÃO_ENCONTRADO</p>
              <h1 className="mt-2 text-[22px] font-black uppercase leading-none tracking-tight text-white">
                Inicialize seu plano
              </h1>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-300">
                <span className="text-emerald-400">&gt;</span> a IA compila um protocolo de treino a partir do seu objetivo
              </p>
              <Link
                href="/plano"
                onClick={() => hapticLight()}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2.5 border border-emerald-300/60 bg-brand-primary px-4 font-mono text-[14px] font-black tracking-[0.08em] text-emerald-950 shadow-[0_4px_18px_-4px_rgba(34,197,94,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-150 hover:brightness-105 active:translate-y-px active:scale-[0.985] active:brightness-90"
              >
                <DSIcon name="sparkles" size={16} />
                GERAR PLANO COM IA
              </Link>
            </>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px] tracking-[0.16em]">
          <p className="text-emerald-400/90">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <DSIcon name="flame" size={11} />
              STREAK:{pad2(streakN)}
            </span>
            <span className="mx-1.5 text-emerald-500/40">▸</span>
            XP:{xp}
            <span className="mx-1.5 text-emerald-500/40">▸</span>
            META:{pad2(metaPct)}%
          </p>
          <p aria-hidden className="text-emerald-500/45">└─■</p>
        </div>
      </div>
    </section>
  )
}
