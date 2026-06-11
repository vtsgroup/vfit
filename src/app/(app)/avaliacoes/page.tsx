'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSelfAssessments, type SelfAssessment } from '@/hooks/use-self-assessments'
import { useMyAssessments } from '@/hooks/use-assessments'
import { useLinkPersonalTrainer, useStudentProfile } from '@/hooks/use-student-app'
import { useAuthStore } from '@/stores/auth-store'

// ─── Design Tokens (iOS Light) ─────────────
const ios = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  separator: '#E5E5EA',
  text: '#000000',
  secondary: '#8E8E93',
  tertiary: '#AEAEB2',
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#AF52DE',
} as const

const springEasing = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

/** Delta pill — iOS-style evolution indicator */
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
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: isGood ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)',
        color: isGood ? ios.green : ios.red,
      }}
    >
      <span className="text-[10px]">{isPositive ? '▲' : '▼'}</span>
      <span>{Math.abs(diff)}{unit}</span>
    </span>
  )
}

/** Metric tile — iOS-style card cell */
function MetricTile({
  icon,
  label,
  value,
  unit,
  delta,
  tone = 'emerald',
}: {
  icon: DSIconName
  label: string
  value: string
  unit?: string
  delta?: React.ReactNode
  tone?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet'
}) {
  const colorMap = {
    emerald: ios.green,
    blue: ios.blue,
    amber: ios.orange,
    rose: ios.red,
    violet: ios.purple,
  }
  const c = colorMap[tone]

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-slate-950/48 px-3.5 py-3 shadow-glass-inset-sm transition-colors duration-200">
      <div className="flex items-center gap-1.5">
        <DSIcon name={icon} size={12} style={{ color: c }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        {delta && <div className="ml-auto">{delta}</div>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold leading-none tabular-nums tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

/** Map BMI value to chip tone */
function bmiTone(bmi: number | string | null | undefined): 'blue' | 'emerald' | 'amber' | 'red' {
  const n = Number(bmi)
  if (n < 18.5) return 'blue'
  if (n < 25) return 'emerald'
  if (n < 30) return 'amber'
  return 'red'
}

/** Safely format numeric values */
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
          color: { dark: '#000000', light: '#FFFFFF' },
        })
        if (!cancelled) setPersonalInviteQrUrl(dataUrl)
      } catch {
        if (!cancelled) setPersonalInviteQrUrl('')
      }
    }

    void generateQr()
    return () => { cancelled = true }
  }, [showPersonalQr, personalInviteLink])

  const displayAssessments = useMemo<SelfAssessment[]>(() => {
    const base = (assessments ?? []).filter((a) => a.id !== 'fa501579-0fbd-47f7-b034-54d406016f8e')
    const isVictorSuperAdmin = user?.role === 'super_admin'
      || user?.id === 'f1bc775d-7b7b-4702-adeb-dc9255082d03'
      || user?.email === 'victor.duarte@vfit.app.br'

    if (!isVictorSuperAdmin) return base

    const hasComplete = base.some((a) => a.id === '16efd166-f01f-42de-8e63-a3d8119443d8')
    if (hasComplete) return base

    const fb: SelfAssessment = {
      id: '16efd166-f01f-42de-8e63-a3d8119443d8',
      weight_kg: 99, height_cm: 183, bmi: 29.56, bmi_category: 'Sobrepeso',
      body_fat_percentage: 17.61,
      waist_cm: null, hip_cm: null, chest_cm: null,
      arm_left_cm: null, arm_right_cm: null,
      thigh_left_cm: null, thigh_right_cm: null,
      calf_left_cm: null, calf_right_cm: null,
      activity_level: null, goal: null,
      notes: 'Avaliação completa importada do PDF',
      created_at: '2026-01-28T00:00:00.000Z',
    }

    return [...base, fb].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [assessments, user?.email, user?.id, user?.role])

  const hasSelf = displayAssessments.length > 0
  const isLinked = !!studentProfile?.personal_name

  // ─── tone helpers ───
  const toneColor = (t: ReturnType<typeof bmiTone>) =>
    t === 'blue' ? ios.blue : t === 'emerald' ? ios.green : t === 'amber' ? ios.orange : ios.red

  return (


    <div className="relative mx-auto min-h-dvh max-w-lg pb-28" style={{ backgroundColor: '#050A12' }}>
      {/* ─── Hero ─── */}
      <div
        className="relative mb-5 overflow-hidden rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_25%,rgba(34,197,94,0.18),transparent_55%)]" />

        <div className="relative z-1 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-400">Acompanhamento</p>
            <h1 className="bg-linear-to-r from-vfit-primary-100 to-vfit-primary-400 bg-clip-text text-4xl font-black text-transparent">
              Avaliações
            </h1>
            <p className="mt-1 text-xs text-emerald-200/80">Evolução física e métricas corporais</p>
          </div>
          <Link href="/avaliacoes/nova">
            <Button
              size="sm"
              className="gap-1 rounded-full border-0 px-5 py-2 text-[14px] font-semibold shadow-none hover:opacity-90 active:opacity-70"
              style={{ backgroundColor: ios.blue, color: '#FFFFFF' }}
            >
              <DSIcon name="plus" size={14} style={{ color: '#FFFFFF' }} />
              Nova
            </Button>
          </Link>
        </div>

        {hasSelf && (
          <div className="relative z-1 mt-4 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/7 px-4 py-3 shadow-glass-inset-sm backdrop-blur">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <DSIcon name="trendingUp" size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-slate-300">
                {displayAssessments.length === 1 ? '1 avaliação registrada' : `${displayAssessments.length} avaliações registradas`}
              </p>
              <p className="truncate text-[13px] font-semibold text-white">
                Última em {new Date(displayAssessments[0].created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </p>
            </div>
            {isLinked && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                <DSIcon name="checkCircle" size={12} className="text-emerald-400" />
                Personal
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Loading ─── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <DSIcon name="loader" size={24} className="animate-spin" style={{ color: ios.blue }} />
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!isLoading && displayAssessments.length === 0 && (
        <div className="flex flex-col items-center gap-5 px-8 py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/12 bg-white/7 shadow-glass-inset-sm backdrop-blur">
            <DSIcon name="clipboardList" size={36} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold tracking-[-0.01em] text-white">
              Sua jornada começa aqui
            </h2>
            <p className="mx-auto mt-2 max-w-64 text-[14px] leading-relaxed text-slate-300">
              Faça sua primeira avaliação e descubra seu IMC, percentual de gordura e veja sua evolução ao longo do tempo.
            </p>
          </div>
          <Link href="/avaliacoes/nova">
            <Button
              className="gap-2 rounded-full border-0 px-6 py-3 text-[15px] font-semibold shadow-sm hover:opacity-90 active:opacity-70"
              style={{ backgroundColor: ios.blue, color: '#FFFFFF' }}
            >
              <DSIcon name="plus" size={16} style={{ color: '#FFFFFF' }} />
              Fazer minha avaliação
            </Button>
          </Link>
        </div>
      )}

      {/* ─── Self Assessments ─── */}
      {hasSelf && (
        <section className="space-y-3 px-5 pb-2">
          <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Minhas avaliações
          </p>
          {displayAssessments.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            const prev = displayAssessments[i + 1] ?? null
            const bTone = bmiTone(a.bmi)
            const tc = toneColor(bTone)

            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="group block overflow-hidden rounded-2xl border border-white/12 bg-white/7 shadow-glass-inset-sm backdrop-blur transition-all duration-200 active:scale-[0.985]"
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                        Avaliação
                      </p>
                      <h2 className="mt-1 text-[20px] font-bold leading-tight tracking-[-0.01em] text-white">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </h2>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor: isFirst ? `${ios.blue}1A` : 'rgba(255,255,255,0.08)',
                        color: isFirst ? ios.blue : '#AEAEB2',
                      }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isFirst ? ios.blue : '#AEAEB2' }} />
                      {isFirst ? 'Mais recente' : 'Histórico'}
                    </span>
                  </div>

                  {/* Weight hero */}
                  <div className="mb-3 rounded-2xl border border-white/8 bg-slate-950/48 p-4 shadow-glass-inset-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Peso atual</p>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-[3.5rem] font-extrabold leading-none tracking-[-0.04em] text-white">
                            {fmt(a.weight_kg)}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">kg</span>
                        </div>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20">
                        <DSIcon name="scale" size={20} className="text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Metric tiles */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <MetricTile
                      icon="activity"
                      label="IMC"
                      value={fmt(a.bmi)}
                      tone={bTone === 'red' ? 'rose' : bTone as 'emerald' | 'blue' | 'amber'}
                      delta={prev ? <DeltaBadge current={Number(a.bmi)} previous={Number(prev.bmi)} unit="" /> : undefined}
                    />
                    <MetricTile
                      icon="percent"
                      label="Gordura"
                      value={fmt(a.body_fat_percentage)}
                      unit={a.body_fat_percentage != null ? '%' : ''}
                      tone="amber"
                      delta={
                        prev && a.body_fat_percentage != null && prev.body_fat_percentage != null ? (
                          <DeltaBadge current={Number(a.body_fat_percentage)} previous={Number(prev.body_fat_percentage)} unit="%" invert />
                        ) : undefined
                      }
                    />
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-white/8 pt-3">
                    {a.bmi_category && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: `${tc}1A`, color: tc }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tc }} />
                        {a.bmi_category}
                      </span>
                    )}
                    {prev && (
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                        vs. última
                      </span>
                    )}
                    <div className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary transition-colors group-hover:opacity-70">
                      <DSIcon name="chevronRight" size={11} className="text-brand-primary" />
                      Detalhes
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {/* ─── Professional Assessments ─── */}
      {proLoading && !proAssessments.length && (
        <div className="mt-6 flex items-center justify-center py-6">
          <DSIcon name="loader" size={20} className="animate-spin" style={{ color: ios.blue }} />
        </div>
      )}

      {proAssessments.length > 0 && (
        <section className="mt-8 space-y-3 px-5">
          <div className="flex items-center gap-2 px-1">
            <DSIcon name="clipboard" size={13} className="text-violet-400" />
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Avaliações completas
            </h2>
          </div>
          {proAssessments.map((a, i) => {
            const date = new Date(a.assessment_date)
            const isFirst = i === 0
            const personalName = (a as { personal_name?: string }).personal_name
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="group block overflow-hidden rounded-2xl border border-white/12 bg-white/7 shadow-glass-inset-sm backdrop-blur transition-all duration-200 active:scale-[0.985]"
              >
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                        Avaliação completa
                      </p>
                      <p className="mt-1 text-[15px] font-semibold leading-tight text-white">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor: isFirst ? `${ios.purple}1A` : 'rgba(255,255,255,0.08)',
                        color: isFirst ? ios.purple : '#AEAEB2',
                      }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isFirst ? ios.purple : '#AEAEB2' }} />
                      {isFirst ? 'Mais recente' : 'Histórico'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <MetricTile icon="scale" label="Peso" tone="emerald" value={fmt(a.weight_kg)} unit={a.weight_kg != null ? 'kg' : ''} />
                    <MetricTile icon="activity" label="IMC" tone="blue" value={fmt(a.bmi)} />
                    <MetricTile icon="percent" label="Gordura" tone="amber" value={fmt(a.body_fat_percentage)} unit={a.body_fat_percentage != null ? '%' : ''} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-white/8 pt-3">
                    {a.fat_classification && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ backgroundColor: `${ios.purple}1A`, color: ios.purple }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ios.purple }} />
                        {a.fat_classification}
                      </span>
                    )}
                    {personalName && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] bg-white/8 text-slate-400">
                        <DSIcon name="user" size={10} className="text-slate-400" />
                        {personalName}
                      </span>
                    )}
                    <div className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-400 transition-colors group-hover:opacity-70">
                      <DSIcon name="chevronRight" size={11} className="text-violet-400" />
                      Detalhes
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {/* ─── Personal Trainer ─── */}
      <div className="mt-8 px-5">
        {isLinked ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/7 px-4 py-3.5 shadow-glass-inset-sm backdrop-blur">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <DSIcon name="checkCircle" size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Personal vinculado</p>
              <p className="truncate text-[14px] font-semibold text-white">{studentProfile!.personal_name}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/7 shadow-glass-inset-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setInviteOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5 active:bg-white/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20">
                <DSIcon name="userPlus" size={16} className="text-brand-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">Avaliação completa com personal</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Convide um treinador para validar sua avaliação</p>
              </div>
              <DSIcon name="chevronDown" size={16} className={`shrink-0 transition-transform text-slate-500 ${inviteOpen ? 'rotate-180' : ''}`} />
            </button>

            {inviteOpen && (
              <div className="border-t border-white/8 px-4 pb-4 pt-3.5">
                <div className="mb-3 flex gap-2">
                  <Input
                    value={personalReferralCode}
                    onChange={(e) => setPersonalReferralCode(e.target.value.toUpperCase())}
                    placeholder="Código do personal"
                    disabled={linkPersonalTrainer.isPending || !!studentProfile?.personal_id}
                    className="border-white/12 bg-white/7 text-white placeholder:text-slate-500"
                  />
                  <Button
                    onClick={() => linkPersonalTrainer.mutate(personalReferralCode)}
                    loading={linkPersonalTrainer.isPending}
                    disabled={!personalReferralCode.trim() || !!studentProfile?.personal_id}
                    style={{ backgroundColor: ios.blue, color: '#FFFFFF', border: 'none' }}
                    className="rounded-full px-5 text-[14px] font-semibold shadow-none hover:opacity-90"
                  >
                    Vincular
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(personalInviteLink)}
                    className="rounded-full border border-white/12 px-4 text-[13px] font-medium text-white shadow-none hover:opacity-80"
                  >
                    <DSIcon name="copy" size={13} className="text-slate-400" />
                    Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para completar minha avaliação física no VFIT.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
                    className="rounded-full border border-white/12 px-4 text-[13px] font-medium text-white shadow-none hover:opacity-80"
                  >
                    <DSIcon name="share2" size={13} className="text-slate-400" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPersonalQr((v) => !v)}
                    className="rounded-full border px-4 text-[13px] font-medium shadow-none hover:opacity-80"
                    style={{
                      borderColor: showPersonalQr ? ios.blue : 'rgba(255,255,255,0.12)',
                      color: showPersonalQr ? '#FFFFFF' : '#FFFFFF',
                      backgroundColor: showPersonalQr ? ios.blue : 'transparent',
                    }}
                  >
                    <DSIcon name="qrcode" size={13} style={{ color: showPersonalQr ? '#FFFFFF' : '#AEAEB2' }} />
                    QR Code
                  </Button>
                </div>
                {showPersonalQr && (
                  <div className="mt-4 flex justify-center">
                    {personalInviteQrUrl ? (
                      <img
                        src={personalInviteQrUrl}
                        alt="QR Code convite personal"
                        className="h-44 w-44 rounded-2xl border border-white/12 bg-white p-2"
                      />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-white/12 bg-white/7">
                        <DSIcon name="loader" size={20} className="animate-spin text-brand-primary" />
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
