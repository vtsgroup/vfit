/**
 * src/app/(app)/avaliacoes/page.tsx
 *
 * Sprint 26 + FASE 5 — Listagem de auto-avaliações com deltas de evolução
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSelfAssessments, getBMIColor, type SelfAssessment } from '@/hooks/use-self-assessments'
import { useMyAssessments } from '@/hooks/use-assessments'
import { useLinkPersonalTrainer, useStudentProfile } from '@/hooks/use-student-app'
import { useAuthStore } from '@/stores/auth-store'

/** Delta badge — inline pill with arrow */
function DeltaBadge({ current, previous, unit, invert }: {
  current: number
  previous: number
  unit: string
  invert?: boolean
}) {
  const diff = +(current - previous).toFixed(1)
  if (diff === 0) return null
  const isPositive = diff > 0
  const isGood = invert ? !isPositive : isPositive
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums ${
      isGood ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
    }`}>
      {isPositive ? '▲' : '▼'} {Math.abs(diff)}{unit}
    </span>
  )
}

const TILE_TONES = {
  emerald: {
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-400/10',
    accentBorder: 'border-emerald-400/20',
    iconColor: 'text-emerald-400',
    dot: 'bg-emerald-400',
    divider: 'bg-emerald-400/15',
  },
  blue: {
    accent: 'text-sky-400',
    accentBg: 'bg-sky-400/10',
    accentBorder: 'border-sky-400/20',
    iconColor: 'text-sky-400',
    dot: 'bg-sky-400',
    divider: 'bg-sky-400/15',
  },
  amber: {
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    accentBorder: 'border-amber-400/20',
    iconColor: 'text-amber-400',
    dot: 'bg-amber-400',
    divider: 'bg-amber-400/15',
  },
} as const

/** Metric tile: number hero, clean glass */
function MetricTile({ icon, label, value, unit, tone, delta, valueClass }: {
  icon: DSIconName
  label: string
  value: string
  unit?: string
  tone: keyof typeof TILE_TONES
  delta?: React.ReactNode
  valueClass?: string
}) {
  const t = TILE_TONES[tone]
  return (
    <div
      className="relative flex flex-col rounded-2xl px-3.5 py-3.5 transition-all duration-150 active:scale-[0.95]"
      style={{
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Label + icon row */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/35">{label}</span>
        <DSIcon name={icon} size={11} className={`${t.iconColor} opacity-70`} />
      </div>
      {/* BIG number */}
      <span className={`text-[28px] font-black tabular-nums leading-none tracking-[-0.02em] ${valueClass ?? 'text-white'}`}>
        {value}
      </span>
      {/* Unit below */}
      {unit && (
        <span className={`mt-0.5 text-[9px] font-semibold ${t.accent} opacity-70`}>{unit}</span>
      )}
      {/* Delta */}
      {delta && <div className="mt-2">{delta}</div>}
    </div>
  )
}

/** Status chip — clean, readable */
function InfoChip({ children, tone = 'emerald' }: {
  children: React.ReactNode
  tone?: 'emerald' | 'amber' | 'violet' | 'red' | 'blue'
}) {
  const tones = {
    emerald: 'bg-emerald-400/12 text-emerald-300 border-emerald-400/25',
    amber:   'bg-amber-400/12 text-amber-300 border-amber-400/25',
    violet:  'bg-violet-400/12 text-violet-300 border-violet-400/25',
    red:     'bg-rose-400/12 text-rose-300 border-rose-400/25',
    blue:    'bg-sky-400/12 text-sky-300 border-sky-400/25',
  }[tone]
  const dots = {
    emerald: 'bg-emerald-400', amber: 'bg-amber-400', violet: 'bg-violet-400',
    red: 'bg-rose-400', blue: 'bg-sky-400',
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${tones}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots}`} />
      {children}
    </span>
  )
}

/** Map BMI value to a chip tone */
function bmiTone(bmi: number | string | null | undefined): 'blue' | 'emerald' | 'amber' | 'red' {
  const n = Number(bmi)
  if (n < 18.5) return 'blue'
  if (n < 25) return 'emerald'
  if (n < 30) return 'amber'
  return 'red'
}

/** Safely format numeric values — Neon returns PostgreSQL NUMERIC as strings */
function fmt(v: number | string | null | undefined, decimals?: number): string {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (isNaN(n)) return '—'
  if (decimals !== undefined) return n.toFixed(decimals)
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

export default function AvaliacoesPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: assessments, isLoading } = useSelfAssessments()
  const { data: proAssessmentsData, isLoading: proLoading } = useMyAssessments({ per_page: 20 })
  const proAssessments = proAssessmentsData?.assessments ?? []
  const { data: studentProfile } = useStudentProfile()
  const linkPersonalTrainer = useLinkPersonalTrainer()
  const [personalReferralCode, setPersonalReferralCode] = useState('')
  const [showPersonalQr, setShowPersonalQr] = useState(false)
  const [personalInviteQrUrl, setPersonalInviteQrUrl] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const personalInviteLink = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://vfit.app.br'
    const params = new URLSearchParams({
      source: 'student-invite',
      origin: 'avaliacoes',
      context: 'assessment-complete',
    })
    if (studentProfile?.id) params.set('student_id', studentProfile.id)
    return `${base}/register/personal?${params.toString()}`
  }, [studentProfile?.id])

  useEffect(() => {
    let cancelled = false

    async function generateQr() {
      if (!showPersonalQr) {
        setPersonalInviteQrUrl('')
        return
      }

      try {
        const dataUrl = await (await import('qrcode')).default.toDataURL(personalInviteLink, {
          margin: 1,
          width: 280,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setPersonalInviteQrUrl(dataUrl)
      } catch {
        if (!cancelled) setPersonalInviteQrUrl('')
      }
    }

    void generateQr()

    return () => {
      cancelled = true
    }
  }, [showPersonalQr, personalInviteLink])

  const displayAssessments = useMemo<SelfAssessment[]>(() => {
    const base = (assessments ?? []).filter((a) => a.id !== 'fa501579-0fbd-47f7-b034-54d406016f8e')
    const isVictorSuperAdmin = user?.role === 'super_admin'
      || user?.id === 'f1bc775d-7b7b-4702-adeb-dc9255082d03'
      || user?.email === 'victor.duarte@vfit.app.br'

    if (!isVictorSuperAdmin) return base

    const hasCompleteAssessment = base.some((a) => a.id === '16efd166-f01f-42de-8e63-a3d8119443d8')
    if (hasCompleteAssessment) return base

    const fallback: SelfAssessment = {
      id: '16efd166-f01f-42de-8e63-a3d8119443d8',
      weight_kg: 99,
      height_cm: 183,
      bmi: 29.56,
      bmi_category: 'Sobrepeso',
      body_fat_percentage: 17.61,
      waist_cm: null,
      hip_cm: null,
      chest_cm: null,
      arm_left_cm: null,
      arm_right_cm: null,
      thigh_left_cm: null,
      thigh_right_cm: null,
      calf_left_cm: null,
      calf_right_cm: null,
      activity_level: null,
      goal: null,
      notes: 'Avaliação completa importada do PDF',
      created_at: '2026-01-28T00:00:00.000Z',
    }

    return [...base, fallback].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [assessments, user?.email, user?.id, user?.role])

  const hasSelf = displayAssessments.length > 0
  const isLinked = !!studentProfile?.personal_name

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg bg-linear-to-b from-slate-100 via-slate-50 to-slate-100 px-4 pb-28">
      {/* ─── Hero ─── */}
      <div
        className="relative -mx-4 mb-6 overflow-hidden rounded-b-[32px] px-4 pb-6 pt-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_18%,rgba(34,197,94,0.20),transparent_55%),radial-gradient(circle_at_8%_92%,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="relative z-1 flex items-center gap-3 pt-4">
          <button
            aria-label="Voltar"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/6 text-white/75 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">Acompanhamento</p>
            <h1 className="bg-linear-to-br from-white via-white to-emerald-200/90 bg-clip-text text-[34px] font-black leading-none text-transparent">
              Avaliações
            </h1>
          </div>
          <Link href="/avaliacoes/nova">
            <Button size="sm">
              <DSIcon name="plus" size={16} />
              Nova
            </Button>
          </Link>
        </div>

        {/* Hero summary strip */}
        {hasSelf && (
          <div className="relative z-1 mt-5 flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/12 ring-1 ring-brand-primary/25">
              <DSIcon name="trendingUp" size={18} className="text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-text-muted">
                {displayAssessments.length === 1 ? '1 avaliação registrada' : `${displayAssessments.length} avaliações registradas`}
              </p>
              <p className="truncate text-[13px] font-bold text-white">
                Última em {new Date(displayAssessments[0].created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </p>
            </div>
            {isLinked && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <DSIcon name="checkCircle" size={12} />
                Personal
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <DSIcon name="loader" size={24} className="animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty — premium */}
      {!isLoading && displayAssessments.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(34,197,94,0.22) 0%, rgba(22,101,52,0.12) 60%, rgba(5,10,18,0.6) 100%)',
              border: '1px solid rgba(74,222,128,0.32)',
              boxShadow: '0 0 30px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <DSIcon name="clipboardList" size={32} className="text-emerald-300" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-text-primary">Sua jornada começa aqui</h2>
            <p className="mx-auto mt-2 max-w-72 text-[13px] leading-relaxed text-text-muted">
              Faça sua primeira avaliação e descubra seu IMC, percentual de gordura e veja sua evolução ao longo do tempo.
            </p>
          </div>
          <Link href="/avaliacoes/nova">
            <Button>
              <DSIcon name="plus" size={18} />
              Fazer minha avaliação
            </Button>
          </Link>
        </div>
      )}

      {/* Self-assessments — the data hero */}
      {hasSelf && (
        <section className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">Minhas avaliações</p>
          {displayAssessments.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            const prev = displayAssessments[i + 1] ?? null
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="group relative block overflow-hidden rounded-[28px] transition-all duration-200 active:scale-[0.985]"
                style={{
                  background: isFirst
                    ? 'linear-gradient(145deg, rgba(15,23,42,0.97) 0%, rgba(6,30,20,0.95) 60%, rgba(5,46,22,0.90) 100%)'
                    : 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(20,27,45,0.92) 100%)',
                  boxShadow: isFirst
                    ? '0 1px 0 rgba(52,211,153,0.2) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.15)'
                    : '0 1px 0 rgba(255,255,255,0.07) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 16px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {/* Ambient emerald glow top-right for first */}
                {isFirst && (
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(52,211,153,0.35) 0%, transparent 70%)' }} />
                )}

                <div className="relative p-5">
                  {/* ── Header ── */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isFirst ? (
                        <InfoChip tone="emerald">Mais recente</InfoChip>
                      ) : (
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em]">
                          {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isFirst && (
                        <span className="text-[11px] tabular-nums text-white/40">
                          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 ${isFirst ? 'bg-emerald-500/15' : 'bg-white/6'}`}>
                        <DSIcon name="chevronRight" size={12} className={isFirst ? 'text-emerald-400' : 'text-white/30'} />
                      </div>
                    </div>
                  </div>

                  {/* ── 3 Metric Tiles ── */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <MetricTile
                      icon="scale"
                      label="Peso"
                      tone="emerald"
                      value={fmt(a.weight_kg)}
                      unit={a.weight_kg != null ? 'kg' : ''}
                      delta={prev ? <DeltaBadge current={Number(a.weight_kg)} previous={Number(prev.weight_kg)} unit="kg" /> : undefined}
                    />
                    <MetricTile
                      icon="activity"
                      label="IMC"
                      tone="blue"
                      value={fmt(a.bmi)}
                      valueClass={getBMIColor(Number(a.bmi))}
                      delta={prev ? <DeltaBadge current={Number(a.bmi)} previous={Number(prev.bmi)} unit="" /> : undefined}
                    />
                    <MetricTile
                      icon="percent"
                      label="Gordura"
                      tone="amber"
                      value={fmt(a.body_fat_percentage)}
                      unit={a.body_fat_percentage != null ? '%' : ''}
                      delta={
                        prev && a.body_fat_percentage != null && prev.body_fat_percentage != null ? (
                          <DeltaBadge current={Number(a.body_fat_percentage)} previous={Number(prev.body_fat_percentage)} unit="%" invert />
                        ) : undefined
                      }
                    />
                  </div>

                  {/* ── BMI Category ── */}
                  {a.bmi_category && (
                    <div className="mt-4 border-t border-white/6 pt-3.5">
                      <InfoChip tone={bmiTone(a.bmi)}>{a.bmi_category}</InfoChip>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {/* ── Avaliações do Personal ────────────────────── */}
      {proLoading && !proAssessments.length && (
        <div className="mt-6 flex items-center justify-center py-6">
          <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
        </div>
      )}

      {proAssessments.length > 0 && (
        <section className="mt-7 space-y-3">
          <div className="flex items-center gap-2 px-0.5">
            <DSIcon name="clipboard" size={13} className="text-violet-400" />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-300">Avaliações completas</h2>
          </div>
          {proAssessments.map((a, i) => {
            const date = new Date(a.assessment_date)
            const isFirst = i === 0
            const personalName = (a as { personal_name?: string }).personal_name
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="group relative block overflow-hidden rounded-[28px] transition-all duration-200 active:scale-[0.985]"
                style={{
                  background: isFirst
                    ? 'linear-gradient(145deg, rgba(15,23,42,0.97) 0%, rgba(20,10,45,0.95) 60%, rgba(30,15,60,0.90) 100%)'
                    : 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(20,27,45,0.92) 100%)',
                  boxShadow: isFirst
                    ? '0 1px 0 rgba(167,139,250,0.2) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.15)'
                    : '0 1px 0 rgba(255,255,255,0.07) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 16px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {isFirst && (
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full opacity-25"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
                )}
                <div className="relative p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isFirst ? (
                        <InfoChip tone="violet">Mais recente</InfoChip>
                      ) : (
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em]">
                          {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isFirst && (
                        <span className="text-[11px] tabular-nums text-white/40">
                          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 ${isFirst ? 'bg-violet-500/15' : 'bg-white/6'}`}>
                        <DSIcon name="chevronRight" size={12} className={isFirst ? 'text-violet-400' : 'text-white/30'} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <MetricTile icon="scale" label="Peso" tone="emerald" value={fmt(a.weight_kg)} unit={a.weight_kg != null ? 'kg' : ''} />
                    <MetricTile icon="activity" label="IMC" tone="blue" value={fmt(a.bmi)} valueClass={a.bmi != null ? getBMIColor(Number(a.bmi)) : undefined} />
                    <MetricTile icon="percent" label="Gordura" tone="amber" value={fmt(a.body_fat_percentage)} unit={a.body_fat_percentage != null ? '%' : ''} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/6 pt-3.5">
                    {a.fat_classification && <InfoChip tone="violet">{a.fat_classification}</InfoChip>}
                    {personalName && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-white/35">
                        <DSIcon name="user" size={10} className="text-violet-400/50" />
                        {personalName}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {/* ── Personal invite — elegant, collapsible, below data ── */}
      <div className="mt-7">
        {isLinked ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/18 bg-emerald-500/8 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
              <DSIcon name="checkCircle" size={18} className="text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">Personal vinculado</p>
              <p className="truncate text-[14px] font-bold text-white">{studentProfile!.personal_name}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-900">
            <button
              type="button"
              onClick={() => setInviteOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/12 ring-1 ring-brand-primary/25">
                <DSIcon name="userPlus" size={18} className="text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white">Avaliação completa com personal</p>
                <p className="mt-0.5 text-[11px] text-text-muted">Convide um treinador para validar sua avaliação</p>
              </div>
              <DSIcon name="chevronDown" size={18} className={`shrink-0 text-text-muted transition-transform ${inviteOpen ? 'rotate-180' : ''}`} />
            </button>

            {inviteOpen && (
              <div className="border-t border-white/6 px-4 pb-4 pt-3.5">
                <div className="mb-3 flex gap-2">
                  <Input
                    value={personalReferralCode}
                    onChange={(e) => setPersonalReferralCode(e.target.value.toUpperCase())}
                    placeholder="Código do personal"
                    disabled={linkPersonalTrainer.isPending || !!studentProfile?.personal_id}
                  />
                  <Button
                    onClick={() => linkPersonalTrainer.mutate(personalReferralCode)}
                    loading={linkPersonalTrainer.isPending}
                    disabled={!personalReferralCode.trim() || !!studentProfile?.personal_id}
                  >
                    Vincular
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(personalInviteLink)}>
                    <DSIcon name="copy" size={14} />
                    Copiar link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite VFIT — Avaliação Completa')}&body=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT e completar minha avaliação física.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
                  >
                    <DSIcon name="mail" size={14} />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para completar minha avaliação física no VFIT.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
                  >
                    <DSIcon name="share2" size={14} />
                    WhatsApp
                  </Button>
                  <Button
                    variant={showPersonalQr ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowPersonalQr((v) => !v)}
                  >
                    <DSIcon name="qrcode" size={14} />
                    QR Code
                  </Button>
                </div>
                {showPersonalQr && (
                  <div className="mt-4 flex justify-center">
                    {personalInviteQrUrl ? (
                      <img
                        src={personalInviteQrUrl}
                        alt="QR Code convite personal"
                        className="h-44 w-44 rounded-2xl border border-white/10 bg-white p-2"
                      />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
