// ============================================
// gamification-section.tsx — "LIGA VFIT · TEMPORADA 01"
// ============================================
//
// O que faz:
//   Gamificação como liga ranqueada + ledger de performance: leaderboards com
//   trono #1, progresso "faltam X XP p/ subir", linha "VOCÊ", e insígnias com
//   raridade (locked/unlocked). Objetivo (CEO): motivar + sensação de recompensa
//   a um passo. Reusa a linguagem premium do resto da landing (spotlight + borda
//   gradiente xor + glow + hairline).
//
// Exports principais:
//   GamificationSection — seção de gamificação da landing
'use client'

import { type CSSProperties, type MouseEvent } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ─── Typography ─── */
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

const SEASON_DAYS = 12

/* ─── Glass shell (dark sibling da features card) ─── */
const glassShell: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 60px -28px rgba(0,0,0,0.6)',
}

/* Spotlight verde que segue o cursor */
function handleCardMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ─── Camadas de hover compartilhadas (spotlight + borda + glow + hairline) ─── */
function HoverFX({ rounded = 'rounded-2xl' }: { rounded?: string }) {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(340px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.10), transparent 60%)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.55) 0%, rgba(132,204,22,0.25) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className={`pointer-events-none absolute -inset-px ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_60px_-18px_rgba(34,197,94,0.45)]`} />
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </>
  )
}

/* ─── Leaderboard data ─── */
interface RankEntry {
  pos: number
  name: string
  xp: number
  level: number
  streak: number
  extra: string
  delta: number
  today?: number
}

const studentRanking: RankEntry[] = [
  { pos: 1, name: 'Mariana C.', xp: 8920, level: 12, streak: 60, extra: '145 treinos', delta: 0, today: 128 },
  { pos: 2, name: 'Pedro H.', xp: 7650, level: 10, streak: 45, extra: '120 treinos', delta: 1 },
  { pos: 3, name: 'Juliana A.', xp: 6890, level: 9, streak: 33, extra: '98 treinos', delta: -1 },
  { pos: 4, name: 'Bruno F.', xp: 5430, level: 8, streak: 22, extra: '76 treinos', delta: 2 },
  { pos: 5, name: 'Camila D.', xp: 4710, level: 7, streak: 15, extra: '61 treinos', delta: -1 },
]

const personalRanking: RankEntry[] = [
  { pos: 1, name: 'Carlos M.', xp: 12480, level: 15, streak: 42, extra: '38 alunos', delta: 0, today: 156 },
  { pos: 2, name: 'Ana Paula R.', xp: 11200, level: 14, streak: 35, extra: '31 alunos', delta: 1 },
  { pos: 3, name: 'Lucas S.', xp: 9870, level: 12, streak: 28, extra: '27 alunos', delta: -1 },
  { pos: 4, name: 'Fernanda L.', xp: 8650, level: 11, streak: 21, extra: '24 alunos', delta: 0 },
  { pos: 5, name: 'Rafael T.', xp: 7340, level: 10, streak: 18, extra: '19 alunos', delta: 2 },
]

/* ─── Badge data — raridade + locked/unlocked ─── */
type Tier = 'COMUM' | 'RARO' | 'ÉPICO' | 'LENDÁRIO'
interface GameBadge {
  icon: DSIconName
  label: string
  desc: string
  tier: Tier
  unlocked: boolean
  pct?: number
  progress?: string
}
const TIERS: Record<Tier, { color: string }> = {
  COMUM: { color: '#22c55e' },
  RARO: { color: '#84cc16' },
  'ÉPICO': { color: '#34d399' },
  'LENDÁRIO': { color: '#34e565' },
}
const gameBadges: GameBadge[] = [
  { icon: 'flame', label: 'STREAK 7D', desc: 'Treine 7 dias seguidos', tier: 'COMUM', unlocked: true },
  { icon: 'target', label: 'META BATIDA', desc: 'Alcance sua meta mensal', tier: 'COMUM', unlocked: true },
  { icon: 'zap', label: 'VELOCISTA', desc: 'Complete 5 treinos/semana', tier: 'RARO', unlocked: false, pct: 60, progress: '3/5 sem' },
  { icon: 'dumbbell', label: 'FIRST 100', desc: '100 treinos completados', tier: 'RARO', unlocked: false, pct: 78, progress: '78/100' },
  { icon: 'trendingUp', label: 'NÍVEL 10', desc: 'Alcance o nível 10', tier: 'ÉPICO', unlocked: false, pct: 90, progress: '9/10' },
  { icon: 'crown', label: 'TOP 10', desc: 'Fique no Top 10 do ranking', tier: 'LENDÁRIO', unlocked: false, pct: 38, progress: '#23' },
]

/* ─── Position icon ─── */
function PosIcon({ pos }: { pos: number }) {
  if (pos === 1) return <DSIcon name="trophy" size={13} aria-label="Posição 1" />
  if (pos === 2) return <DSIcon name="medal" size={13} aria-label="Posição 2" />
  if (pos === 3) return <DSIcon name="award" size={13} aria-label="Posição 3" />
  return <span className="text-[11px]" style={monoLabel} aria-label={`Posição ${pos}`}>{pos}</span>
}

/* ─── Movement delta chip ─── */
function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) return <span className="hidden w-6 shrink-0 text-center text-[9px] text-white/25 sm:inline" style={monoLabel}>—</span>
  const up = delta > 0
  return (
    <span className={`hidden w-6 shrink-0 text-center text-[9px] sm:inline ${up ? 'text-brand-primary' : 'text-amber-400/70'}`} style={monoLabel}>
      {up ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  )
}

/* ─── Streak flame (glow escala com a streak) ─── */
function StreakFlame({ streak }: { streak: number }) {
  const intensity = Math.min(0.3 + (streak / 60) * 0.7, 1)
  const blur = 2 + streak / 12
  return (
    <span className="inline-flex items-center gap-1 text-[9px] text-white/40" style={monoLabel}>
      <span style={{ filter: `drop-shadow(0 0 ${blur}px rgba(251,146,60,${intensity}))` }}>
        <DSIcon name="flame" size={12} className="text-orange-400" />
      </span>
      {streak}d
    </span>
  )
}

/* ─── Trono #1 ─── */
function ThroneRow({ entry }: { entry: RankEntry }) {
  return (
    <div
      className="relative flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5"
      style={{
        background: 'linear-gradient(90deg, rgba(34,197,94,0.10) 0%, rgba(34,197,94,0.02) 55%, transparent 100%)',
        boxShadow: 'inset 0 0 24px rgba(34,197,94,0.10)',
      }}
    >
      <span className="absolute left-0 top-1/2 h-10 w-0.5 -translate-y-1/2 rounded-full bg-linear-to-b from-brand-primary to-transparent" />

      {/* Avatar monogram + halo cônico + coroa */}
      <div className="relative shrink-0">
        <span
          className="gam-halo pointer-events-none absolute -inset-1 hidden rounded-full lg:block"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(34,197,94,0.55), transparent)',
            WebkitMask: 'radial-gradient(closest-side, transparent 68%, #000 70%)',
            mask: 'radial-gradient(closest-side, transparent 68%, #000 70%)',
          }}
        />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-brand-mint text-[13px] font-black text-[#08122B] ring-2 ring-brand-primary/30">
          {initials(entry.name)}
        </div>
        <span
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 2px 6px rgba(34,197,94,0.5)' }}
        >
          <DSIcon name="crown" size={10} className="text-[#08122B]" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-syne text-sm font-black text-white">{entry.name}</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-brand-primary/80" style={monoLabel}>LV {entry.level}</span>
        </div>
        <div className="mt-1 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-brand-primary" style={monoLabel}>
            ▲ +{entry.today} XP hoje
          </span>
          <StreakFlame streak={entry.streak} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="font-syne text-lg font-black leading-none bg-linear-to-b from-white to-emerald-200 bg-clip-text text-transparent">
          {entry.xp.toLocaleString('pt-BR')}
        </div>
        <div className="mt-0.5 text-[9px] text-white/40 uppercase" style={monoLabel}>XP</div>
      </div>
    </div>
  )
}

/* ─── Linha (rank 2-5) com progresso até o próximo ─── */
function RankRow({ entry, aboveXp }: { entry: RankEntry; aboveXp: number }) {
  const deltaXp = Math.max(aboveXp - entry.xp, 0)
  const pct = Math.min((entry.xp / aboveXp) * 100, 100)
  const tokenClass =
    entry.pos === 2 ? 'bg-white/10 text-white/70' :
    entry.pos === 3 ? 'bg-amber-500/15 text-amber-400/80' :
    'bg-white/5 text-white/40'
  return (
    <div className="group/row relative flex items-center gap-2.5 px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03] sm:gap-3 sm:px-5">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${tokenClass}`}>
        <PosIcon pos={entry.pos} />
      </span>
      <DeltaChip delta={entry.delta} />
      <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold text-white/75 ring-1 ring-white/10 sm:flex">
        {initials(entry.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-white">{entry.name}</span>
          <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-brand-primary/80" style={monoLabel}>LV {entry.level}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-[8px] text-white/35" style={monoLabel}>faltam {deltaXp.toLocaleString('pt-BR')} XP</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="bg-linear-to-r from-white to-emerald-300 bg-clip-text text-[10px] font-bold text-transparent sm:text-xs" style={monoLabel}>
          {entry.xp.toLocaleString('pt-BR')} XP
        </div>
        <div className="mt-0.5 hidden justify-end sm:flex">
          <StreakFlame streak={entry.streak} />
        </div>
      </div>
    </div>
  )
}

/* ─── Linha "VOCÊ" (âncora de motivação) ─── */
function VoceRow() {
  return (
    <div className="relative m-2 flex items-center gap-3 rounded-xl border border-dashed border-brand-primary/30 bg-brand-primary/[0.03] px-3 py-2.5 sm:px-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-[10px] font-black text-brand-primary" style={monoLabel}>#142</span>
      <span className="text-xs font-bold text-white/85">VOCÊ</span>
      <span className="ml-auto text-[10px] text-brand-primary" style={monoLabel}>faltam 320 XP p/ subir</span>
    </div>
  )
}

/* ─── Painel leaderboard ─── */
function LeaderboardCard({ icon, title, ranking, delay }: { icon: DSIconName; title: string; ranking: RankEntry[]; delay: number }) {
  return (
    <IntersectionReveal animation="fade-in" delay={delay}>
      <div onMouseMove={handleCardMove} className="group relative overflow-hidden rounded-2xl" style={glassShell}>
        <HoverFX />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/20">
              <DSIcon name={icon} size={15} className="text-brand-primary" />
            </div>
            <span className="text-xs text-white/65 uppercase" style={monoLabel}>{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
            </span>
            <span className="text-[9px] text-white/45 uppercase" style={monoLabel}>termina em {SEASON_DAYS}d</span>
          </div>
        </div>
        {/* Hairline gradiente sob o header */}
        <span className="block h-px bg-linear-to-r from-transparent via-brand-primary/45 to-transparent" />

        {/* Trono #1 */}
        <ThroneRow entry={ranking[0]} />

        {/* Rows 2-5 */}
        <div className="divide-y divide-white/5">
          {ranking.slice(1).map((entry, i) => (
            <RankRow key={entry.pos} entry={entry} aboveXp={ranking[i].xp} />
          ))}
        </div>

        {/* Linha VOCÊ */}
        <VoceRow />
      </div>
    </IntersectionReveal>
  )
}

/* ─── Insígnia (badge) ─── */
function BadgeTile({ badge }: { badge: GameBadge }) {
  const tier = TIERS[badge.tier]
  const almost = !badge.unlocked && (badge.pct ?? 0) >= 85
  return (
    <div onMouseMove={handleCardMove} className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-4 text-center" style={glassShell}>
      <HoverFX />

      {/* Tier dot */}
      <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full" style={{ background: tier.color, boxShadow: `0 0 6px ${tier.color}` }} />
      {/* Lock (se bloqueado) */}
      {!badge.unlocked && (
        <span className="absolute left-2.5 top-2.5">
          <DSIcon name="lock" size={11} className="text-white/25" />
        </span>
      )}

      {/* Medalhão */}
      <div className={`relative mt-1 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 ${badge.unlocked ? '' : 'grayscale'}`}>
        <span
          className="gam-sheen pointer-events-none absolute -inset-0.5 rounded-full opacity-60"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${tier.color}, transparent)`,
            WebkitMask: 'radial-gradient(closest-side, transparent 64%, #000 66%)',
            mask: 'radial-gradient(closest-side, transparent 64%, #000 66%)',
          }}
        />
        <span
          className="relative flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px -4px rgba(34,197,94,0.5)' }}
        >
          <DSIcon name={badge.icon} size={18} className="text-[#08122B]" />
        </span>
      </div>

      {/* Label + desc */}
      <div className="px-1">
        <div className="bg-linear-to-r from-white to-emerald-200 bg-clip-text text-[10px] font-bold uppercase text-transparent" style={monoLabel}>{badge.label}</div>
        <div className="mt-0.5 text-[9px] leading-snug text-white/50">{badge.desc}</div>
      </div>

      {/* Rodapé: selo OU progresso */}
      {badge.unlocked ? (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase text-[#08122B]"
          style={{ ...monoLabel, background: 'linear-gradient(135deg, #34e565, #16a34a)' }}
        >
          <DSIcon name="check" size={9} className="text-[#08122B]" />
          Conquistado
        </span>
      ) : (
        <div className="w-full">
          <div className="flex items-center justify-between text-[8px]" style={monoLabel}>
            <span className={almost ? 'gam-pulse text-brand-primary' : 'text-white/35'}>{almost ? 'FALTA POUCO' : badge.tier}</span>
            <span className="text-white/40">{badge.progress}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${badge.pct}%`, background: 'linear-gradient(90deg, #22c55e, #84cc16)' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export function GamificationSection() {
  return (
    <section id="gamification" className="relative overflow-hidden bg-bg-primary pt-6 pb-16 sm:pt-10 sm:pb-32" aria-label="Sistema de gamificação">
      {/* Subtle grid bg */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-3" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-primary/5 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Eyebrow — pílula status de temporada */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)',
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: '0 8px 24px -10px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="bg-linear-to-r from-white to-brand-mint bg-clip-text text-[11px] uppercase text-transparent" style={monoLabel}>/GAMIFICAÇÃO</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-[10px] uppercase text-white/40" style={monoLabel}>Liga · Temporada 01</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2 className="mb-4 text-center text-3xl leading-[0.96] text-white sm:text-5xl" style={headingFont}>
            CONSTÂNCIA QUE{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">VIRA RESULTADO</span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm leading-relaxed text-white/60 sm:mb-14 sm:text-base">
            XP, badges e rankings deixam o treino menos solitário e dão ao aluno um motivo a mais para voltar amanhã.
          </p>
        </IntersectionReveal>

        {/* Leaderboards */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <LeaderboardCard icon="dumbbell" title="TOP ALUNOS" ranking={studentRanking} delay={150} />
          <LeaderboardCard icon="briefcase" title="TOP PROFISSIONAIS" ranking={personalRanking} delay={250} />
        </div>

        {/* Insígnias */}
        <IntersectionReveal animation="fade-in" delay={350}>
          <div className="mt-14">
            {/* Próxima recompensa */}
            <div className="mx-auto mb-7 max-w-md">
              <div className="flex items-center justify-between text-[10px]" style={monoLabel}>
                <span className="text-white/45 uppercase">Próxima recompensa</span>
                <span className="text-brand-primary uppercase">Nível 10 · 90%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" style={{ width: '90%', background: 'linear-gradient(90deg, #22c55e, #84cc16, #34e565)' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gameBadges.map((badge) => (
                <BadgeTile key={badge.label} badge={badge} />
              ))}
            </div>
          </div>
        </IntersectionReveal>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes gamSpin { to { transform: rotate(360deg); } }
        .gam-halo { animation: gamSpin 6s linear infinite; will-change: transform; }
        .gam-sheen { animation: gamSpin 9s linear infinite; will-change: transform; }
        @keyframes gamPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .gam-pulse { animation: gamPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gam-halo, .gam-sheen, .gam-pulse { animation: none; }
        }
      `}</style>
    </section>
  )
}
