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
      className="rounded-xl px-2.5 py-2"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <DSIcon name={icon} size={11} className="text-text-muted" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      </div>
      <p className={`text-[15px] font-black tabular-nums leading-tight ${valueClass ?? 'text-text-primary'}`}>
        {value}{unit && <span className="text-[10px] font-medium text-text-muted"> {unit}</span>}
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
    <div className="relative mx-auto max-w-lg px-4 pt-0 pb-24">
      {/* Ambient gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-100 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.04) 35%, transparent 70%)',
        }}
      />

      {/* Header — clean, no overpowering gradient */}
      <div className="mb-5 flex items-center gap-3 pt-4">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/75 transition-all hover:border-white/18 hover:bg-white/10 hover:text-white"
        >
          <DSIcon name="arrowLeft" size={18} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">Acompanhamento</p>
          <h1 className="text-display-heading font-black tracking-tight text-text-primary">Avaliações físicas</h1>
        </div>
        <Link href="/avaliacoes/nova">
          <Button size="sm">
            <DSIcon name="plus" size={16} />
            Nova
          </Button>
        </Link>
      </div>

      <div
        className="mb-5 overflow-hidden rounded-2xl border border-brand-primary/22 p-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(34,197,94,0.03) 60%, transparent 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px -12px rgba(34,197,94,0.18)',
        }}
      >
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/12">
            <DSIcon name="userPlus" size={18} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-primary">
              Avaliação completa com personal
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
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
            variant={showPersonalQr ? 'secondary' : 'outline'}
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
                className="h-44 w-44 rounded-xl border border-white/12 bg-white p-2"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-white/12 bg-white/6">
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
                className="group relative block overflow-hidden rounded-2xl p-4 transition-all"
                style={{
                  background: isFirst
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  border: isFirst ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isFirst
                    ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 20px -12px rgba(34,197,94,0.25)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        Mais recente
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-text-muted">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
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
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
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
