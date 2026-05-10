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

/** Premium stat tile — used inside assessment cards */
function StatTile({ icon, label, value, unit, delta, valueClass }: {
  icon: DSIconName
  label: string
  value: string
  unit: string
  delta?: React.ReactNode
  valueClass?: string
}) {
  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white/85 px-2.5 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
    >
      <div className="mb-1 flex items-center gap-1.5">
        <DSIcon name={icon} size={11} className="text-emerald-600" />
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className={`text-[16px] font-black tabular-nums leading-tight ${valueClass ?? 'text-slate-950'}`}>
        {value}{unit && <span className="text-[10px] font-bold text-slate-400"> {unit}</span>}
        {delta}
      </p>
    </div>
  )
}

export default function AvaliacoesPage() {
  const router = useRouter()
  const { data: assessments, isLoading } = useSelfAssessments()
  const { data: studentProfile } = useStudentProfile()
  const linkPersonalTrainer = useLinkPersonalTrainer()
  const [personalReferralCode, setPersonalReferralCode] = useState('')
  const [showPersonalQr, setShowPersonalQr] = useState(false)
  const [personalInviteQrUrl, setPersonalInviteQrUrl] = useState('')

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

  return (
    <div className="relative mx-auto max-w-lg px-4 pb-24">
      {/* ─── Hero ─── */}
      <div
        className="relative -mx-4 mb-5 overflow-hidden rounded-b-3xl px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_85%_25%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative z-1 flex items-center gap-3 pt-4">
          <button
            aria-label="Voltar"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/6 text-white/75 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-400">Acompanhamento</p>
            <h1 className="bg-linear-to-r from-vfit-primary-100 to-vfit-primary-400 bg-clip-text text-4xl font-black text-transparent">
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
      </div>

      <div className="relative mb-5 overflow-hidden rounded-[28px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/40 to-slate-50 p-4 shadow-[0_22px_52px_rgba(15,23,42,0.13)]">
        <div className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full bg-emerald-200/45 blur-2xl" />
        <div className="relative mb-3 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_8px_18px_rgba(5,150,105,0.14)]">
            <DSIcon name="userPlus" size={19} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600/85">
              Avaliação completa com personal
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-relaxed text-slate-500">
              Convide um personal trainer para revisar e validar sua avaliação física.
            </p>
            {studentProfile?.personal_name && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-success">
                <DSIcon name="checkCircle" size={12} />
                Vinculado a {studentProfile.personal_name}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-3 flex gap-2">
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

        <div className="relative flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(personalInviteLink)}>
            <DSIcon name="copy" size={14} />
            Copiar link
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Convite VFIT — Avaliação Completa')}&body=${encodeURIComponent(`Olá! Quero te convidar para me acompanhar no VFIT e completar minha avaliação física.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="mail" size={14} />
            Email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para completar minha avaliação física no VFIT.\n\nCadastro: ${personalInviteLink}`)}`, '_blank')}
          >
            <DSIcon name="share2" size={14} />
            WhatsApp
          </Button>
          <Button
            variant={showPersonalQr ? 'primary' : 'secondary'}
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
                className="h-44 w-44 rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80">
                <DSIcon name="loader" size={20} className="animate-spin text-text-muted" />
              </div>
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

      {/* List — refined */}
      {assessments && assessments.length > 0 && (
        <div className="space-y-3">
          {assessments.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            const prev = assessments[i + 1] ?? null
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className="group relative block overflow-hidden rounded-[26px] border border-emerald-100/90 bg-linear-to-br from-white via-emerald-50/35 to-slate-50 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.11)] transition-all active:translate-y-px"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-200/35 blur-2xl" />
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/85 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.10)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        Mais recente
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-400">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <StatTile
                    icon="scale"
                    label="Peso"
                    value={a.weight_kg.toString()}
                    unit="kg"
                    delta={prev ? <DeltaBadge current={a.weight_kg} previous={prev.weight_kg} unit="kg" /> : null}
                  />
                  <StatTile
                    icon="activity"
                    label="IMC"
                    value={a.bmi.toString()}
                    unit=""
                    valueClass={getBMIColor(a.bmi)}
                    delta={prev ? <DeltaBadge current={a.bmi} previous={prev.bmi} unit="" /> : null}
                  />
                  <StatTile
                    icon="percent"
                    label="Gordura"
                    value={a.body_fat_percentage ? a.body_fat_percentage.toString() : '—'}
                    unit={a.body_fat_percentage ? '%' : ''}
                    delta={
                      prev && a.body_fat_percentage && prev.body_fat_percentage ? (
                        <DeltaBadge current={a.body_fat_percentage} previous={prev.body_fat_percentage} unit="%" invert />
                      ) : null
                    }
                  />
                </div>

                {a.bmi_category && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    {a.bmi_category}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
