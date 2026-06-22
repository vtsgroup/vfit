// ============================================
// gamification-section.tsx — Seção de gamificação da landing page
// ============================================
//
// O que faz:
//   Apresenta o sistema de XP, ranking e conquistas do produto.
//   Leaderboard mockado com top personals e seus pontos.
//   Usa IntersectionReveal para entrada no scroll.
//
// Exports principais:
//   GamificationSection — seção de gamificação da landing
'use client'

import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ─── Typography — consistent with all sections ─── */
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

/* ─── Leaderboard data — personals ─── */
interface RankEntry {
  pos: number
  name: string
  xp: number
  level: number
  streak: number
  extra: string
}

const personalRanking: RankEntry[] = [
  { pos: 1, name: 'Carlos M.', xp: 12480, level: 15, streak: 42, extra: '38 alunos' },
  { pos: 2, name: 'Ana Paula R.', xp: 11200, level: 14, streak: 35, extra: '31 alunos' },
  { pos: 3, name: 'Lucas S.', xp: 9870, level: 12, streak: 28, extra: '27 alunos' },
  { pos: 4, name: 'Fernanda L.', xp: 8650, level: 11, streak: 21, extra: '24 alunos' },
  { pos: 5, name: 'Rafael T.', xp: 7340, level: 10, streak: 18, extra: '19 alunos' },
]

const studentRanking: RankEntry[] = [
  { pos: 1, name: 'Mariana C.', xp: 8920, level: 12, streak: 60, extra: '145 treinos' },
  { pos: 2, name: 'Pedro H.', xp: 7650, level: 10, streak: 45, extra: '120 treinos' },
  { pos: 3, name: 'Juliana A.', xp: 6890, level: 9, streak: 33, extra: '98 treinos' },
  { pos: 4, name: 'Bruno F.', xp: 5430, level: 8, streak: 22, extra: '76 treinos' },
  { pos: 5, name: 'Camila D.', xp: 4710, level: 7, streak: 15, extra: '61 treinos' },
]

/* ─── Badge data — Lucide icons ─── */
const gameBadges: { icon: DSIconName; label: string; desc: string }[] = [
  { icon: 'flame', label: 'STREAK 7D', desc: 'Treine 7 dias seguidos' },
  { icon: 'dumbbell', label: 'FIRST 100', desc: '100 treinos completados' },
  { icon: 'target', label: 'META BATIDA', desc: 'Alcance sua meta mensal' },
  { icon: 'zap', label: 'VELOCISTA', desc: 'Complete 5 treinos/semana' },
  { icon: 'crown', label: 'TOP 10', desc: 'Fique no Top 10 do ranking' },
  { icon: 'trendingUp', label: 'NÍVEL 10', desc: 'Alcance o nível 10' },
]

/* ─── Position icon resolver ─── */
function PosIcon({ pos }: { pos: number }) {
  if (pos === 1) return <DSIcon name="trophy" size={14} aria-label="Posição 1" />
  if (pos === 2) return <DSIcon name="medal" size={14} aria-label="Posição 2" />
  if (pos === 3) return <DSIcon name="award" size={14} aria-label="Posição 3" />
  return <DSIcon name="star" size={14} aria-label={`Posição ${pos}`} />
}

/* ─── XP bar component ─── */
function XPBar({ xp, maxXp }: { xp: number; maxXp: number }) {
  const pct = Math.min((xp / maxXp) * 100, 100)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ─── Rank row ─── */
function RankRow({ entry, maxXp }: { entry: RankEntry; maxXp: number }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/2 sm:gap-4 sm:px-6 sm:py-3.5 ${
      entry.pos === 1 ? 'bg-brand-primary/3 shadow-[inset_0_0_20px_rgba(16,185,129,0.06)]' : ''
    }`}>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
        entry.pos === 1 ? 'bg-brand-primary/20 text-brand-primary' :
        entry.pos === 2 ? 'bg-white/10 text-white/60' :
        entry.pos === 3 ? 'bg-amber-500/15 text-amber-400/70' :
        'bg-white/5 text-white/30'
      }`}>
        <PosIcon pos={entry.pos} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{entry.name}</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-brand-primary/80" style={monoLabel}>
            LV {entry.level}
          </span>
        </div>
        <div className="mt-1.5">
          <XPBar xp={entry.xp} maxXp={maxXp} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-[10px] sm:text-xs font-bold text-brand-primary" style={monoLabel}>{entry.xp.toLocaleString('pt-BR')} XP</div>
        <div className="mt-0.5 hidden items-center justify-end gap-1 text-[10px] text-white/30 sm:flex" style={monoLabel}>
                    <DSIcon name="flame" size={12} className="text-orange-400/60" />
          {entry.streak}d · {entry.extra}
        </div>
      </div>
    </div>
  )
}

/* ─── Leaderboard card ─── */
function LeaderboardCard({
  icon,
  title,
  ranking,
  maxXp,
  delay,
}: {
  icon: DSIconName
  title: string
  ranking: RankEntry[]
  maxXp: number
  delay: number
}) {
  return (
    <IntersectionReveal animation="fade-in" delay={delay}>
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15">
              <DSIcon name={icon} size={16} className="text-brand-primary" />
            </div>
            <span className="text-xs text-white/60 uppercase" style={monoLabel}>
              {title}
            </span>
          </div>
          <span className="text-[10px] text-white/30 uppercase" style={monoLabel}>MENSAL</span>
        </div>
        <div className="divide-y divide-white/5">
          {ranking.map((entry) => (
            <RankRow key={entry.pos} entry={entry} maxXp={maxXp} />
          ))}
        </div>
      </div>
    </IntersectionReveal>
  )
}

export function GamificationSection() {
  return (
    <section id="gamification" className="relative overflow-hidden bg-bg-primary py-16 sm:py-32" aria-label="Sistema de gamificação">
      {/* Subtle grid bg */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-3" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow */}
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand-primary/5 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-5 text-center">
            <span className="inline-block text-xs text-brand-primary/70 uppercase" style={monoLabel}>
              /GAMIFICAÇÃO
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="mb-4 text-center text-3xl leading-[0.96] text-white sm:text-5xl"
            style={headingFont}
          >
            CONSTÂNCIA QUE{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              VIRA RESULTADO
            </span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm leading-relaxed text-white/60 sm:text-base">
            XP, badges e rankings deixam o treino menos solitário e dão ao aluno um motivo a mais para voltar amanhã.
          </p>
        </IntersectionReveal>

        {/* Two-column leaderboards */}
        <div className="grid gap-8 lg:grid-cols-2">
          <LeaderboardCard icon="dumbbell" title="TOP ALUNOS" ranking={studentRanking} maxXp={10000} delay={150} />
          <LeaderboardCard icon="briefcase" title="TOP PROFISSIONAIS" ranking={personalRanking} maxXp={15000} delay={250} />
        </div>

        {/* Badges showcase */}
        <IntersectionReveal animation="fade-in" delay={350}>
          <div className="mt-14">
            <p className="mb-6 text-center text-[11px] text-white/30 uppercase" style={monoLabel}>
              CONQUISTAS DISPONÍVEIS
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center lg:gap-3">
              {gameBadges.map((badge, i) => (
                <div
                  key={badge.label}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-4 text-center transition-all duration-300 hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:scale-105 sm:flex-row sm:items-center sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-left lg:px-5 lg:py-3"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 transition-all duration-200 group-hover:bg-brand-primary/20">
                    <DSIcon name={badge.icon} size={18} className="text-brand-primary/70 transition-colors duration-200 group-hover:text-brand-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/70 uppercase" style={monoLabel}>{badge.label}</div>
                    <div className="text-[10px] text-white/60">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </IntersectionReveal>
      </div>
    </section>
  )
}
