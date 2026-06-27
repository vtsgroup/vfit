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

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
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

/* Liga ALUNOS (constância/treinos) vs PROFISSIONAIS (carteira de alunos) */
type BoardVariant = 'alunos' | 'pros'

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

/* ─── XpQuote — unidade de moeda $XP (coin glyph + tabular-nums), reusada em todo lugar ─── */
function XpQuote({ value, hero = false }: { value: number; hero?: boolean }) {
  if (hero) {
    return (
      <span className="flex items-baseline justify-end gap-1.5">
        <span aria-hidden="true" className="gam-breathe relative inline-flex h-4.5 w-4.5 shrink-0 translate-y-0.5 items-center justify-center rounded-full ring-1 ring-brand-primary/30" style={{ background: 'radial-gradient(closest-side, rgba(34,197,94,0.20), transparent)' }}>
          <DSIcon name="coin" size={11} className="text-brand-primary" />
        </span>
        <span className="flex flex-col items-end">
          <span className="font-syne text-[22px] font-black leading-none tabular-nums bg-linear-to-b from-white to-emerald-200 bg-clip-text text-transparent">
            {value.toLocaleString('pt-BR')}
          </span>
          <span className="mt-0.5 text-[9px] text-white/35" style={monoLabel}>$XP</span>
        </span>
      </span>
    )
  }
  // Rows 2-5: coluna de placar limpa — sem coin (moeda fica no líder/saldo), "$XP" como unidade
  return (
    <span className="inline-flex items-baseline justify-end gap-1 tabular-nums">
      <span className="min-w-14 text-right text-[13px] tabular-nums text-white/85" style={monoLabel}>
        {value.toLocaleString('pt-BR')}
      </span>
      <span className="text-[9px] text-white/30" style={monoLabel}>$XP</span>
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

/* ─── Pódio (top 3) — coluna com pedestal de altura por posição (líder no centro) ─── */
function PodiumColumn({ entry, rank, variant, lead }: { entry: RankEntry; rank: 1 | 2 | 3; variant: BoardVariant; lead?: number }) {
  const first = rank === 1
  const pedH = first ? 'h-24' : rank === 2 ? 'h-16' : 'h-11'
  const pedBg = first
    ? 'linear-gradient(180deg, rgba(34,197,94,0.30) 0%, rgba(34,197,94,0.04) 100%)'
    : rank === 2
      ? 'linear-gradient(180deg, rgba(190,242,100,0.16) 0%, rgba(255,255,255,0.015) 100%)'
      : 'linear-gradient(180deg, rgba(110,231,183,0.13) 0%, rgba(255,255,255,0.015) 100%)'
  const numTone = first ? 'text-white' : rank === 2 ? 'text-brand-lime' : 'text-emerald-200'
  const ringTone = first ? 'ring-brand-primary/40' : rank === 2 ? 'ring-brand-lime/40' : 'ring-emerald-300/35'
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      {/* Avatar (líder maior + halo + coroa) */}
      <div className="relative">
        {first && (
          <span aria-hidden="true" className="gam-halo pointer-events-none absolute -inset-1.5 rounded-full opacity-70" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(34,197,94,0.6), transparent)', WebkitMask: 'radial-gradient(closest-side, transparent 70%, #000 72%)', mask: 'radial-gradient(closest-side, transparent 70%, #000 72%)' }} />
        )}
        <div className={`relative flex items-center justify-center rounded-full font-syne font-black ${first ? 'h-16 w-16 bg-linear-to-br from-brand-primary to-brand-mint text-base text-[#08122B] ring-2 ring-brand-primary/40' : `h-12 w-12 bg-white/5 text-[13px] text-white/80 ring-1 ${ringTone}`}`}>
          {initials(entry.name)}
        </div>
        {first && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary shadow-[0_2px_6px_rgba(34,197,94,0.5)]">
            <DSIcon name="crown" size={11} className="text-[#08122B]" aria-label="Líder da temporada" />
          </span>
        )}
      </div>

      {/* Nome + LV */}
      <div className={`mt-2 max-w-full truncate font-syne font-black text-white ${first ? 'text-[14px]' : 'text-[12px]'}`}>{entry.name}</div>
      <div className="text-[9px] text-brand-primary/60" style={monoLabel}>LV {entry.level}</div>

      {/* Stat diferenciador por liga (constância vs carteira) */}
      <div className="mt-0.5 flex h-3.5 items-center justify-center">
        {variant === 'alunos' ? (
          <StreakFlame streak={entry.streak} />
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] text-white/45" style={monoLabel}>
            <DSIcon name="users" size={9} aria-hidden="true" />{entry.extra}
          </span>
        )}
      </div>

      {/* XP (cryptoCoin só no líder = saldo) */}
      <div className="mt-1.5 flex items-baseline justify-center gap-1">
        {first && <DSIcon name="cryptoCoin" size={12} aria-hidden="true" />}
        <span className={`font-syne font-black leading-none tabular-nums ${first ? 'bg-linear-to-b from-white to-emerald-200 bg-clip-text text-xl text-transparent sm:text-2xl' : 'text-base text-white/85'}`}>{entry.xp.toLocaleString('pt-BR')}</span>
        <span className="text-[8px] text-white/35" style={monoLabel}>$XP</span>
      </div>

      {/* Líder: margem vs #2 */}
      {first && lead != null && (
        <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-brand-primary/12 px-1.5 py-0.5 text-[8px] tabular-nums text-brand-primary ring-1 ring-brand-primary/25" style={monoLabel}>
          <DSIcon name="chevronUp" size={8} aria-hidden="true" />+{lead.toLocaleString('pt-BR')} vs #2
        </span>
      )}

      {/* Pedestal — altura por posição */}
      <div className={`relative mt-3 flex w-full ${pedH} items-start justify-center overflow-hidden rounded-t-xl`} style={{ background: pedBg, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        {first && <span aria-hidden="true" className="gam-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />}
        <span className={`relative mt-2 font-syne font-black leading-none ${numTone} ${first ? 'text-3xl' : 'text-2xl'}`} aria-label={`Posição ${rank}`}>{rank}</span>
      </div>
    </div>
  )
}

/* ─── Linha (rank 2-5) — ledger: pódio verde, identidade c/ stat por liga, pill de momentum ─── */
function RankRow({ entry, variant }: { entry: RankEntry; variant: BoardVariant }) {
  const up = entry.delta > 0
  const down = entry.delta < 0
  // Pódio: o brilho do verde É a hierarquia (sem prata/bronze kitsch). Geometria única.
  const numTone = entry.pos === 2 ? 'text-brand-lime' : entry.pos === 3 ? 'text-emerald-200' : 'text-white/30'
  const ringTone = entry.pos === 2 ? 'ring-brand-primary/30' : entry.pos === 3 ? 'ring-brand-primary/18' : ''
  return (
    <div className="group/row relative grid grid-cols-[40px_1fr_auto] items-center gap-3 px-6 py-3.5 transition-colors duration-200 hover:bg-white/2.5">
      {/* barra de acento no hover — só transform */}
      <span aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 h-7 w-0.5 -translate-x-1 -translate-y-1/2 rounded-full bg-brand-primary opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100" />

      {/* Gutter — numeral; #2/#3 em disco com anel verde decrescente */}
      <div className="flex justify-center">
        {entry.pos <= 3 ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-1 ${ringTone}`}>
            <span className={`font-syne text-base font-black leading-none ${numTone}`} aria-label={`Posição ${entry.pos}`}>{entry.pos}</span>
          </span>
        ) : (
          <span className={`font-syne text-base font-black leading-none ${numTone}`} aria-label={`Posição ${entry.pos}`}>{entry.pos}</span>
        )}
      </div>

      {/* Identidade: monograma + nome/LV + linha-stat por liga (constância vs carteira) */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/4 text-[12px] font-semibold text-white/70 ring-1 ring-white/10 sm:flex">
          {initials(entry.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate text-[14px] font-medium text-white/90">{entry.name}</span>
            <span className="shrink-0 text-[10px] text-brand-primary/55" style={monoLabel}>· LV {entry.level}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/40" style={monoLabel}>
            {variant === 'alunos' ? (
              <>
                <span className="inline-flex items-center gap-1"><DSIcon name="flame" size={9} className="text-orange-400/80" aria-hidden="true" />{entry.streak}d</span>
                <span className="text-white/20">·</span>
                <span className="truncate">{entry.extra}</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-white/50"><DSIcon name="users" size={9} aria-hidden="true" />{entry.extra}</span>
                <span className="text-white/20">·</span>
                <span className="inline-flex items-center gap-1"><DSIcon name="flame" size={9} className="text-orange-400/80" aria-hidden="true" />{entry.streak}d</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* XP (placar limpo) + pill de momentum */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <XpQuote value={entry.xp} />
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] tabular-nums ${up ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/25' : down ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25' : 'text-white/30'}`}
          style={monoLabel}
          aria-label={up ? `Subiu ${entry.delta} posições` : down ? `Caiu ${Math.abs(entry.delta)} posições` : 'Manteve a posição'}
        >
          {up ? <><DSIcon name="chevronUp" size={8} aria-hidden="true" />{entry.delta}</> : down ? <><DSIcon name="chevronDown" size={8} aria-hidden="true" />{Math.abs(entry.delta)}</> : '—'}
        </span>
      </div>
    </div>
  )
}

/* ─── Linha "VOCÊ" — faixa full-bleed alinhada ao gutter (linguagem wallet/coin) ─── */
function VoceRow() {
  return (
    <div className="relative grid grid-cols-[40px_1fr_auto] items-center gap-3 border-t border-white/6 bg-white/2 px-6 py-3.5">
      <span className="flex justify-center">
        <span className="text-[11px] tabular-nums text-brand-primary" style={monoLabel}>#142</span>
      </span>
      <div className="flex items-center gap-2">
        <DSIcon name="wallet" size={13} className="text-brand-primary/80" aria-hidden="true" />
        <span className="text-[13px] font-bold text-white/85">SUA POSIÇÃO</span>
      </div>
      <span className="inline-flex items-center gap-1 text-[10px] text-brand-primary" style={monoLabel}>
        <DSIcon name="trendingUp" size={11} aria-hidden="true" /> faltam 320 $XP
      </span>
    </div>
  )
}

/* ─── Painel leaderboard ─── */
function LeaderboardCard({ icon, title, ranking, delay, variant }: { icon: DSIconName; title: string; ranking: RankEntry[]; delay: number; variant: BoardVariant }) {
  const lead = ranking[0].xp - ranking[1].xp
  return (
    <IntersectionReveal animation="fade-in" delay={delay}>
      <div onMouseMove={handleCardMove} className="group relative overflow-hidden rounded-3xl" style={glassShell}>
        <HoverFX rounded="rounded-3xl" />

        {/* Header — calmo, restrito (sem fill brand) */}
        <div className="relative flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/4 ring-1 ring-white/10">
              <DSIcon name={icon} size={14} className="text-white/70" />
            </div>
            <span className="text-[11px] text-white/55 uppercase" style={monoLabel}>{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
            </span>
            <span className="text-[9px] text-white/35 uppercase" style={monoLabel}>Temporada 01 · {SEASON_DAYS}d</span>
          </div>
        </div>
        <span className="block h-px bg-white/6" />

        {/* Pódio — top 3 visual (líder ao centro, elevado) */}
        <div className="relative grid grid-cols-3 items-end gap-2 px-4 pt-6 sm:gap-3 sm:px-6">
          <PodiumColumn entry={ranking[1]} rank={2} variant={variant} />
          <PodiumColumn entry={ranking[0]} rank={1} variant={variant} lead={lead} />
          <PodiumColumn entry={ranking[2]} rank={3} variant={variant} />
        </div>
        <span className="block h-px bg-white/6" />

        {/* Lista — posições 4-5 */}
        <div className="divide-y divide-white/4">
          {ranking.slice(3).map((entry) => (
            <RankRow key={entry.pos} entry={entry} variant={variant} />
          ))}
        </div>

        {/* Linha VOCÊ */}
        <VoceRow />
      </div>
    </IntersectionReveal>
  )
}

/* ─── Insígnia (badge) — credencial mintada; bloqueada = anel oco aspiracional (sem grayscale) ─── */
function BadgeTile({ badge }: { badge: GameBadge }) {
  const tier = TIERS[badge.tier]
  const almost = !badge.unlocked && (badge.pct ?? 0) >= 85
  const lit = badge.unlocked || almost
  return (
    <div onMouseMove={handleCardMove} className="group relative flex min-h-38 flex-col items-center gap-2.5 overflow-hidden rounded-2xl px-4 py-5 text-center" style={glassShell}>
      <HoverFX />

      {/* Nicho iluminado — só quando conquistado ou quase */}
      <span aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-16 transition-opacity duration-300 ${lit ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgba(34,197,94,0.16), transparent 70%)' }} />

      {/* Ponto de raridade (canto) — só brilha quando conquistado/quase */}
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full" style={{ background: lit ? tier.color : 'rgba(255,255,255,0.18)', boxShadow: lit ? `0 0 6px ${tier.color}` : 'none' }} />
      {!badge.unlocked && (
        <span className="absolute left-2.5 top-2.5">
          <DSIcon name="lock" size={10} className="text-white/25" aria-label="Bloqueado" />
        </span>
      )}

      {/* Medalhão — conquistado = coin preenchido; bloqueado = anel oco */}
      <div
        className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-full"
        style={badge.unlocked
          ? { background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px -4px rgba(34,197,94,0.5)' }
          : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <DSIcon name={badge.icon} size={18} className={badge.unlocked ? 'text-[#08122B]' : 'text-white/35'} />
      </div>

      {/* Label + desc */}
      <div className="px-1">
        <div className="text-[10px] font-bold uppercase text-white/85" style={monoLabel}>{badge.label}</div>
        <div className="mt-0.5 text-[9px] leading-snug text-white/45">{badge.desc}</div>
      </div>

      {/* Rodapé: selo OU progresso single-color */}
      <div className="mt-auto w-full">
        {badge.unlocked ? (
          <span className="inline-flex items-center gap-1 text-[8px] text-brand-primary/80" style={monoLabel}>
            <DSIcon name="check" size={9} className="text-brand-primary" aria-hidden="true" /> CONQUISTADO
          </span>
        ) : (
          <>
            <div className="flex items-center justify-between text-[8px]" style={monoLabel}>
              <span className={almost ? 'gam-pulse text-brand-primary' : 'text-white/35'}>{almost ? 'FALTA POUCO' : badge.tier}</span>
              <span className="tabular-nums text-white/40">{badge.progress}</span>
            </div>
            <div className="mt-1.5 h-0.75 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-primary shadow-[0_0_6px_rgba(34,197,94,0.5)]" style={{ width: `${badge.pct}%` }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function GamificationSection() {
  // Saldo $XP — count-up no primeiro paint (reduced-motion = valor final imediato)
  const [balance, setBalance] = useState(0)
  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setBalance(12480); return }
    let r = 0
    const t = setInterval(() => {
      r = Math.min(r + 820, 12480); setBalance(r)
      if (r >= 12480) clearInterval(t)
    }, 28)
    return () => clearInterval(t)
  }, [])
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
          <h2 className="mb-4 text-center text-3xl leading-[0.96] text-white sm:text-[3.25rem]" style={headingFont}>
            CONSTÂNCIA QUE{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 4px 24px rgba(34,197,94,0.35))' }}>VIRA RESULTADO</span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm leading-relaxed text-white/65 sm:mb-12 sm:text-base">
            XP, badges e rankings deixam o treino menos solitário e dão ao aluno um motivo a mais para voltar amanhã.
          </p>
        </IntersectionReveal>

        {/* Como Ganhar XP — CARTEIRA VFIT (saldo $XP + fontes de renda + resgate) */}
        <div className="mx-auto mb-10 max-w-5xl sm:mb-14">
          <IntersectionReveal animation="fade-in" delay={110}>
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-xl font-black text-white sm:text-2xl" style={headingFont}>Como Ganhar XP</h3>
              <p className="text-sm text-white/50">Cada ação vira moeda — veja seu saldo de $XP crescer a cada treino.</p>
            </div>
          </IntersectionReveal>

          <IntersectionReveal animation="scale-in" delay={120}>
            <div onMouseMove={handleCardMove} className="group relative overflow-hidden rounded-3xl" style={glassShell}>
              <HoverFX rounded="rounded-3xl" />

              <div className="grid lg:grid-cols-[1.25fr_1fr]">
                {/* ── ESQUERDA — saldo $XP ── */}
                <div className="relative p-7 sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    </span>
                    <span className="text-[10px] uppercase text-white/45" style={monoLabel}>Carteira VFIT · $XP ao vivo</span>
                  </div>

                  {/* saldo */}
                  <div className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden="true"
                      className="gam-breathe inline-flex h-7 w-7 shrink-0 translate-y-1 items-center justify-center rounded-full ring-1"
                      style={{ background: 'radial-gradient(closest-side, rgba(245,180,60,0.22), transparent)', borderColor: 'rgba(245,180,60,0.4)' }}
                    >
                      <DSIcon name="cryptoCoin" size={17} />
                    </span>
                    <span
                      className="font-syne font-black leading-none tabular-nums bg-linear-to-b from-white to-emerald-200 bg-clip-text text-transparent"
                      style={{ fontSize: 'clamp(44px,7vw,64px)' }}
                      aria-label={`Saldo ${balance.toLocaleString('pt-BR')} XP`}
                    >
                      {balance.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-sm text-white/40" style={monoLabel}>$XP</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/12 px-2 py-0.5 text-[11px] tabular-nums text-brand-primary ring-1 ring-brand-primary/25" style={monoLabel}>
                      <DSIcon name="chevronUp" size={11} aria-hidden="true" /> +178 $XP HOJE
                    </span>
                    <span className="text-[10px] uppercase text-white/35" style={monoLabel}>saldo da temporada 01</span>
                  </div>

                  {/* equity sparkline — saldo cresce */}
                  <div className="mt-6 flex h-10 items-end gap-1.5" aria-hidden="true">
                    {[28, 34, 30, 42, 46, 58, 72].map((h, i, a) => (
                      <span
                        key={i}
                        className="gam-grow relative flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          transformOrigin: 'bottom',
                          animationDelay: `${i * 60}ms`,
                          background: i === a.length - 1 ? '#bef264' : 'rgba(34,197,94,0.55)',
                        }}
                      >
                        {i === a.length - 1 && (
                          <span className="absolute -top-2 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-[#08122B] ring-1 ring-brand-lime/60">
                            <DSIcon name="coin" size={8} />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-[9px] uppercase text-white/30" style={monoLabel}>saldo cresce a cada treino</div>
                </div>

                {/* ── DIREITA — fontes de renda (linhas de depósito) ── */}
                <div className="relative border-t border-white/8 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <span className="text-[10px] uppercase text-white/45" style={monoLabel}>Fontes de renda</span>
                    <span className="text-[10px] tabular-nums text-white/30" style={monoLabel}>03</span>
                  </div>
                  <div className="divide-y divide-white/6">
                    {[
                      { icon: 'dumbbell' as DSIconName, tone: '#22c55e', title: 'Cada treino concluído', cap: 'depósito base',       credit: '+50',  run: '1.050', mult: false },
                      { icon: 'flame'    as DSIconName, tone: '#fb923c', title: 'Streak 7 dias',          cap: 'rendimento em dobro', credit: '×2',   run: '2.100', mult: true  },
                      { icon: 'gift'     as DSIconName, tone: '#22c55e', title: 'Metas & desafios',       cap: 'bônus + badge',       credit: '+200', run: '2.300', mult: false },
                    ].map((r) => (
                      <div key={r.title} className="group/row relative grid grid-cols-[34px_1fr_auto] items-center gap-3 px-6 py-3.5">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-0 top-1/2 h-7 w-0.5 -translate-x-1 -translate-y-1/2 rounded-full bg-brand-primary opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100"
                        />
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-white/10"
                          style={{ background: `color-mix(in srgb, ${r.tone} 14%, transparent)` }}
                        >
                          <DSIcon name={r.icon} size={15} style={{ color: r.tone }} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-bold text-white/90">{r.title}</div>
                          <div className="text-[9px] uppercase text-white/40" style={monoLabel}>{r.cap}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center gap-1 text-[13px] tabular-nums ${r.mult ? 'text-orange-300' : 'text-brand-primary'}`} style={monoLabel}>
                            {!r.mult && <DSIcon name="coin" size={11} aria-hidden="true" />}
                            {r.credit}{!r.mult && ' $XP'}
                          </span>
                          <span className="text-[8px] uppercase text-brand-primary/0 transition-colors duration-200 group-hover/row:text-brand-primary/65" style={monoLabel} aria-hidden="true">
                            → saldo {r.run}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RODAPÉ — resgate em breve (substitui a formula box morta) ── */}
              <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/8 bg-white/2 px-6 py-3.5">
                <DSIcon name="lock" size={13} className="shrink-0 text-white/35" aria-hidden="true" />
                <span className="text-[10px] uppercase text-white/55" style={monoLabel}>Resgate em breve</span>
                <span className="text-[11px] text-white/45" style={monoLabel}>
                  1.000 $XP <span className="text-white/25">≈</span> recompensas reais
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] tabular-nums text-brand-primary/80" style={monoLabel}>
                  <DSIcon name="coin" size={10} aria-hidden="true" /> conversão em breve
                </span>
              </div>
            </div>
          </IntersectionReveal>
        </div>

        {/* Leaderboards */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <LeaderboardCard icon="dumbbell" title="TOP ALUNOS" ranking={studentRanking} delay={150} variant="alunos" />
          <LeaderboardCard icon="briefcase" title="TOP PROFISSIONAIS" ranking={personalRanking} delay={250} variant="pros" />
        </div>

        {/* Duelo da semana — confronto 1v1 full-width (prova social + aposta de XP) */}
        <IntersectionReveal animation="slide-up" delay={320}>
          <div onMouseMove={handleCardMove} className="group relative mt-8 overflow-hidden rounded-3xl sm:mt-10" style={glassShell}>
            <HoverFX rounded="rounded-3xl" />
            {/* glow central da arena */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28" style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(34,197,94,0.12), transparent 70%)' }} />

            {/* Header — título + pote em jogo */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/4 ring-1 ring-white/10">
                  <DSIcon name="trophy" size={14} className="text-white/70" aria-hidden="true" />
                </div>
                <span className="text-[11px] uppercase text-white/55" style={monoLabel}>Duelo da semana</span>
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
                <span className="hidden items-center gap-1.5 text-[10px] uppercase text-brand-primary/80 sm:inline-flex" style={monoLabel}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  </span>
                  3 dias restantes
                </span>
              </div>
              {/* chip POTE — gold coin = sinal de moeda */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))', border: '1px solid rgba(245,180,60,0.35)', boxShadow: '0 8px 24px -12px rgba(245,180,60,0.4), inset 0 1px 0 rgba(255,255,255,0.12)' }}
              >
                <DSIcon name="coin" size={13} aria-hidden="true" />
                <span className="text-[12px] tabular-nums text-white/90" style={monoLabel}>1.800</span>
                <span className="text-[9px] uppercase text-white/45" style={monoLabel}>$XP em jogo</span>
              </span>
            </div>
            <span className="block h-px bg-white/6" />

            {/* Arena VS — avatares enfrentados */}
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-7 sm:gap-6 sm:px-8">
              {/* VOCÊ */}
              <div className="flex items-center gap-3 justify-self-start">
                <div className="relative shrink-0">
                  <span aria-hidden="true" className="gam-halo pointer-events-none absolute -inset-1 hidden rounded-full opacity-60 sm:block" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(34,197,94,0.55), transparent)', WebkitMask: 'radial-gradient(closest-side, transparent 68%, #000 70%)', mask: 'radial-gradient(closest-side, transparent 68%, #000 70%)' }} />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-brand-mint font-syne text-sm font-black text-[#08122B] ring-2 ring-brand-primary/40">VC</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-syne text-[15px] font-black text-white">Você</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-brand-primary" style={monoLabel}>
                    <DSIcon name="coin" size={10} aria-hidden="true" /><span className="tabular-nums">940</span> $XP
                  </div>
                </div>
              </div>

              {/* Selo VS */}
              <div className="relative flex flex-col items-center justify-self-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-white/12" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}>
                  <span className="font-syne text-[15px] font-black text-white/90">VS</span>
                </div>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-primary/12 px-2 py-0.5 text-[8px] uppercase text-brand-primary ring-1 ring-brand-primary/25" style={monoLabel}>
                  <DSIcon name="chevronUp" size={8} aria-hidden="true" />Liderando +220
                </span>
              </div>

              {/* OPONENTE */}
              <div className="flex items-center gap-3 justify-self-end text-right">
                <div className="order-2 min-w-0 sm:order-1">
                  <div className="truncate font-syne text-[15px] font-black text-white/85">Pedro H.</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-white/55" style={monoLabel}>
                    <DSIcon name="coin" size={10} aria-hidden="true" /><span className="tabular-nums">720</span> $XP
                  </div>
                </div>
                <div className="order-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 font-syne text-sm font-black text-white/80 ring-1 ring-white/12 sm:order-2">PH</div>
              </div>
            </div>

            {/* Race espelhada — barras partindo do centro */}
            <div className="relative px-6 pb-2 sm:px-8">
              <div className="grid grid-cols-2 gap-1.5">
                {/* sua barra (líder) cresce p/ esquerda */}
                <div className="relative h-2 overflow-hidden rounded-full bg-white/8" dir="rtl">
                  <div className="relative h-full rounded-full bg-linear-to-l from-brand-primary to-brand-lime shadow-[0_0_12px_rgba(34,197,94,0.6)]" style={{ width: '78%' }}>
                    <span aria-hidden="true" className="gam-shimmer pointer-events-none absolute inset-y-0 -left-1/4 w-1/4" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                  </div>
                </div>
                {/* barra do oponente cresce p/ direita */}
                <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-white/25" style={{ width: '60%' }} />
                </div>
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] text-white/40" style={monoLabel}>
                <span className="tabular-nums">VOCÊ · 940 $XP</span>
                <span className="tabular-nums">PEDRO · 720 $XP</span>
              </div>
            </div>

            {/* Ledger + CTA */}
            <div className="relative mt-4 grid gap-3 border-t border-white/6 px-6 py-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:px-8">
              {[
                { k: 'Sua semana', v: '940' },
                { k: 'Vantagem', v: '+220' },
                { k: 'Prêmio se vencer', v: '+900' },
              ].map((s) => (
                <div key={s.k}>
                  <div className="text-[9px] uppercase text-white/40" style={monoLabel}>{s.k}</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 font-syne text-[15px] font-black tabular-nums text-white">
                    <DSIcon name="coin" size={12} aria-hidden="true" />{s.v} <span className="text-[9px] font-normal text-white/40" style={monoLabel}>$XP</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-black uppercase text-[#08122B] shadow-[0_8px_24px_-8px_rgba(34,197,94,0.6)] transition-transform duration-200 hover:scale-[1.02]"
                style={monoLabel}
              >
                <DSIcon name="userPlus" size={14} aria-hidden="true" />Desafiar amigo
              </button>
            </div>

            {/* Prova social: duelos da rede + teaser de resgate */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/6 px-6 py-3 sm:px-8">
              <div className="flex items-center gap-2 text-[9px] uppercase text-white/40" style={monoLabel}>
                <DSIcon name="users" size={12} className="text-white/40" aria-hidden="true" />
                <span className="tabular-nums">12 duelos rolando agora</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
                <DSIcon name="coin" size={10} aria-hidden="true" />Vencedor leva o pote · em breve: resgate
              </span>
            </div>
          </div>
        </IntersectionReveal>

        {/* Insígnias */}
        <IntersectionReveal animation="fade-in" delay={350}>
          <div className="mt-14">
            {/* Próxima recompensa — "saldo até o próximo unlock" (full-width = header das conquistas) */}
            <div
              className="mb-9 overflow-hidden rounded-3xl px-6 py-5 sm:px-7 sm:py-6"
              style={{ ...glassShell, background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/12 ring-1 ring-brand-primary/25">
                    <DSIcon name="gift" size={17} className="text-brand-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/45" style={monoLabel}>Próxima recompensa</div>
                    <div className="font-syne text-[15px] font-black text-white">Nível 10</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] text-brand-primary/70" style={monoLabel}>
                      <DSIcon name="coin" size={9} className="text-brand-primary" aria-hidden="true" /> +1.500 XP DE BÔNUS
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-linear-to-r from-white to-brand-primary bg-clip-text font-syne text-[26px] font-black leading-none text-transparent tabular-nums">90%</div>
                  <div className="mt-0.5 text-[9px] uppercase text-white/40" style={monoLabel}>concluído</div>
                </div>
              </div>

              {/* Barra single-color + shimmer + coin puck na cabeça dos 90% */}
              <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="relative h-full rounded-full bg-linear-to-r from-brand-primary to-brand-lime shadow-[0_0_12px_rgba(34,197,94,0.6)]" style={{ width: '90%' }}>
                  <span aria-hidden="true" className="gam-shimmer pointer-events-none absolute inset-y-0 -left-1/4 w-1/4" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                </div>
                <span aria-hidden="true" className="absolute top-1/2 flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#08122B] ring-1 ring-brand-primary/60 shadow-[0_0_8px_rgba(34,197,94,0.7)]" style={{ left: '90%' }}>
                  <DSIcon name="coin" size={9} className="text-brand-primary" />
                </span>
              </div>
              <div className="mt-1.5 text-right text-[9px] text-white/40" style={monoLabel}>faltam ~150 XP</div>
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
        @keyframes gamPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .gam-pulse { animation: gamPulse 1.6s ease-in-out infinite; }
        @keyframes gamSweep { 0% { transform: translateX(0); } 55% { transform: translateX(560%); } 100% { transform: translateX(560%); } }
        .gam-sweep { animation: gamSweep 7s ease-in-out infinite; will-change: transform; }
        @keyframes gamBreathe { 0%, 100% { transform: translateY(2px) scale(1); } 50% { transform: translateY(2px) scale(1.06); } }
        .gam-breathe { animation: gamBreathe 4s ease-in-out infinite; will-change: transform; }
        @keyframes gamShimmer { 0% { transform: translateX(0); } 60% { transform: translateX(900%); } 100% { transform: translateX(900%); } }
        .gam-shimmer { animation: gamShimmer 2.6s ease-in-out infinite; will-change: transform; }
        @keyframes gamGrow { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        .gam-grow { animation: gamGrow .5s cubic-bezier(.2,.8,.2,1) both; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .gam-halo, .gam-pulse, .gam-sweep, .gam-breathe, .gam-shimmer, .gam-grow { animation: none; transform: none; }
        }
      `}</style>
    </section>
  )
}
