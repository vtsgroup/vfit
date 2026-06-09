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
import { useSelfAssessments, getBMIColor } from '@/hooks/use-self-assessments'
import { useMyAssessments } from '@/hooks/use-assessments'
import { useLinkPersonalTrainer, useStudentProfile } from '@/hooks/use-student-app'

/** Format delta with sign and color */
function DeltaBadge({ current, previous, unit, invert }: {
  current: number
  previous: number
  unit: string
  /** true = negative delta is good (e.g. weight loss when goal is lose_weight) */
  invert?: boolean
}) {
  const diff = +(current - previous).toFixed(1)
  if (diff === 0) return null
  const isPositive = diff > 0
  const color = invert
    ? (isPositive ? 'text-red-400' : 'text-brand-primary')
    : (isPositive ? 'text-brand-primary' : 'text-red-400')

  return (
    <span className={`ml-1 text-[10px] font-semibold tabular-nums ${color}`}>
      {isPositive ? '↑' : '↓'}{Math.abs(diff)}{unit}
    </span>
  )
}

const TILE_TONES = {
  emerald: { iconBg: 'bg-emerald-500/12', iconRing: 'ring-emerald-400/25', icon: 'text-emerald-300', glow: 'shadow-[0_12px_34px_-16px_rgba(16,185,129,0.7)]' },
  blue: { iconBg: 'bg-sky-500/12', iconRing: 'ring-sky-400/25', icon: 'text-sky-300', glow: 'shadow-[0_12px_34px_-16px_rgba(56,189,248,0.65)]' },
  amber: { iconBg: 'bg-amber-500/12', iconRing: 'ring-amber-400/25', icon: 'text-amber-300', glow: 'shadow-[0_12px_34px_-16px_rgba(245,158,11,0.65)]' },
} as const

/** Premium dark-glass metric tile */
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
    <div className={`relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 px-2.5 py-3 backdrop-blur-sm ${t.glow}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
      <div className="mb-2 flex items-center gap-1.5">
        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${t.iconBg} ring-1 ${t.iconRing}`}>
          <DSIcon name={icon} size={11} className={t.icon} />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      </div>
      <p className={`text-xl font-black tabular-nums leading-none ${valueClass ?? 'text-white'}`}>
        {value}{unit && <span className="ml-0.5 text-[10px] font-bold text-text-muted">{unit}</span>}
      </p>
      {delta && <div className="mt-1.5 leading-none">{delta}</div>}
    </div>
  )
}

/** Subtle pill chip for classification labels */
function InfoChip({ children, tone = 'emerald' }: {
  children: React.ReactNode
  tone?: 'emerald' | 'amber' | 'violet' | 'red' | 'blue'
}) {
  const tones = {
    emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
    violet: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
    red: 'border-red-400/20 bg-red-500/10 text-red-300',
    blue: 'border-sky-400/20 bg-sky-500/10 text-sky-300',
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tones}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

/** Map BMI value to a chip tone */
function bmiTone(bmi: number): 'blue' | 'emerald' | 'amber' | 'red' {
  if (bmi < 18.5) return 'blue'
  if (bmi < 25) return 'emerald'
  if (bmi < 30) return 'amber'
  return 'red'
}

export default function AvaliacoesPage() {
  const router = useRouter()
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

  const hasSelf = !!assessments && assessments.length > 0
  const isLinked = !!studentProfile?.personal_name

  return (
    <div className="relative mx-auto max-w-lg px-4 pb-28">
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
                {assessments!.length === 1 ? '1 avaliação registrada' : `${assessments!.length} avaliações registradas`}
              </p>
              <p className="truncate text-[13px] font-bold text-white">
                Última em {new Date(assessments![0].created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
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
      {!isLoading && (!assessments || assessments.length === 0) && (
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
          <div className="flex items-center gap-2 px-0.5">
            <DSIcon name="user" size={13} className="text-emerald-400" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Minhas avaliações</h2>
          </div>
          {assessments!.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            const prev = assessments![i + 1] ?? null
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className={`group relative block overflow-hidden rounded-3xl border p-4 transition-all active:translate-y-px ${isFirst ? 'border-emerald-400/18 bg-white/5' : 'border-white/8 bg-white/3 hover:border-white/12'}`}
                style={isFirst ? { boxShadow: '0 18px 48px -24px rgba(16,185,129,0.55)' } : undefined}
              >
                {isFirst && <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/12 blur-3xl" />}
                <div className="relative mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && <InfoChip tone="emerald">Mais recente</InfoChip>}
                    <span className="text-[11px] font-semibold text-text-muted">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="relative grid grid-cols-3 gap-2">
                  <MetricTile
                    icon="scale"
                    label="Peso"
                    tone="emerald"
                    value={a.weight_kg.toString()}
                    unit="kg"
                    delta={prev ? <DeltaBadge current={a.weight_kg} previous={prev.weight_kg} unit="kg" /> : undefined}
                  />
                  <MetricTile
                    icon="activity"
                    label="IMC"
                    tone="blue"
                    value={a.bmi.toString()}
                    valueClass={getBMIColor(a.bmi)}
                    delta={prev ? <DeltaBadge current={a.bmi} previous={prev.bmi} unit="" /> : undefined}
                  />
                  <MetricTile
                    icon="percent"
                    label="Gordura"
                    tone="amber"
                    value={a.body_fat_percentage ? a.body_fat_percentage.toString() : '—'}
                    unit={a.body_fat_percentage ? '%' : ''}
                    delta={
                      prev && a.body_fat_percentage && prev.body_fat_percentage ? (
                        <DeltaBadge current={a.body_fat_percentage} previous={prev.body_fat_percentage} unit="%" invert />
                      ) : undefined
                    }
                  />
                </div>

                {a.bmi_category && (
                  <div className="relative mt-3">
                    <InfoChip tone={bmiTone(a.bmi)}>{a.bmi_category}</InfoChip>
                  </div>
                )}
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
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">Avaliações do personal</h2>
          </div>
          {proAssessments.map((a, i) => {
            const date = new Date(a.assessment_date)
            const isFirst = i === 0
            const personalName = (a as { personal_name?: string }).personal_name
            return (
              <Link
                key={a.id}
                href={`/dashboard/assessments/view?id=${a.id}`}
                className={`group relative block overflow-hidden rounded-3xl border p-4 transition-all active:translate-y-px ${isFirst ? 'border-violet-400/18 bg-white/5' : 'border-white/8 bg-white/3 hover:border-white/12'}`}
                style={isFirst ? { boxShadow: '0 18px 48px -24px rgba(139,92,246,0.5)' } : undefined}
              >
                {isFirst && <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl" />}
                <div className="relative mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && <InfoChip tone="violet">Mais recente</InfoChip>}
                    <span className="text-[11px] font-semibold text-text-muted">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="relative grid grid-cols-3 gap-2">
                  <MetricTile icon="scale" label="Peso" tone="emerald" value={String(a.weight_kg ?? '—')} unit={a.weight_kg ? 'kg' : ''} />
                  <MetricTile icon="activity" label="IMC" tone="blue" value={String(a.bmi ?? '—')} valueClass={a.bmi ? getBMIColor(Number(a.bmi)) : undefined} />
                  <MetricTile icon="percent" label="Gordura" tone="amber" value={a.body_fat_percentage ? String(a.body_fat_percentage) : '—'} unit={a.body_fat_percentage ? '%' : ''} />
                </div>

                <div className="relative mt-3 flex flex-wrap items-center gap-2">
                  {a.fat_classification && <InfoChip tone="violet">{a.fat_classification}</InfoChip>}
                  {personalName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-300/90">
                      <DSIcon name="user" size={11} />
                      {personalName}
                    </span>
                  )}
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
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            <button
              type="button"
              onClick={() => setInviteOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/4"
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
