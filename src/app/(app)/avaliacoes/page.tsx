/**
 * src/app/(app)/avaliacoes/page.tsx
 *
 * Sprint 26 + FASE 5 — Listagem de auto-avaliações com deltas de evolução
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
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
    <span className={`ml-1 text-[10px] font-semibold ${color}`}>
      {isPositive ? '↑' : '↓'}{Math.abs(diff)}{unit}
    </span>
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
    <div className="mx-auto max-w-lg px-4 pt-0 pb-24">
      {/* Header */}
      <div className="-mx-4 mb-5 flex items-center gap-3 rounded-b-3xl bg-slate-950/95 px-4 py-5 backdrop-blur-md">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
        >
          <DSIcon name="arrowLeft" size={20} />
        </button>
        <h1 className="flex-1 text-lg font-bold text-white">Avaliações Físicas</h1>
        <Link href="/avaliacoes/nova">
          <Button size="sm">
            <DSIcon name="plus" size={16} />
            Nova
          </Button>
        </Link>
      </div>

      <div className="mb-5 rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
              Avaliação Completa com Personal
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Convide um personal para revisar e completar sua avaliação física.
            </p>
            {studentProfile?.personal_name && (
              <p className="mt-1 text-[12px] font-semibold text-success">
                Personal vinculado: {studentProfile.personal_name}
              </p>
            )}
          </div>
          <DSIcon name="userPlus" size={18} className="text-brand-primary" />
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

      {/* Empty */}
      {!isLoading && (!assessments || assessments.length === 0) && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="clipboardList" size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-text-primary">Nenhuma avaliação ainda</h2>
          <p className="max-w-65 text-[13px] text-text-muted">
            Faça sua primeira auto-avaliação para acompanhar sua evolução corporal.
          </p>
          <Link href="/avaliacoes/nova">
            <Button>
              <DSIcon name="plus" size={18} />
              Fazer Avaliação
            </Button>
          </Link>
        </div>
      )}

      {/* List */}
      {assessments && assessments.length > 0 && (
        <div className="space-y-3">
          {assessments.map((a, i) => {
            const date = new Date(a.created_at)
            const isFirst = i === 0
            // Previous assessment for delta comparison (list is desc by date)
            const prev = assessments[i + 1] ?? null
            return (
              <Link
                key={a.id}
                href={`/avaliacoes/${a.id}`}
                className={`glass-card block rounded-2xl p-4 transition-all hover:border-white/12 ${
                  isFirst
                    ? 'border-brand-primary/15'
                    : ''
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFirst && (
                      <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[9px] font-bold text-brand-primary">
                        MAIS RECENTE
                      </span>
                    )}
                    <span className="text-[12px] text-text-muted">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-text-muted">Peso</p>
                    <p className="text-[16px] font-bold text-text-primary">
                      {a.weight_kg}<span className="text-[11px] text-text-muted"> kg</span>
                      {prev && <DeltaBadge current={a.weight_kg} previous={prev.weight_kg} unit="kg" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">IMC</p>
                    <p className={`text-[16px] font-bold ${getBMIColor(a.bmi)}`}>
                      {a.bmi}
                      {prev && <DeltaBadge current={a.bmi} previous={prev.bmi} unit="" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Gordura</p>
                    <p className="text-[16px] font-bold text-text-primary">
                      {a.body_fat_percentage ? `${a.body_fat_percentage}%` : '—'}
                      {prev && a.body_fat_percentage && prev.body_fat_percentage && (
                        <DeltaBadge current={a.body_fat_percentage} previous={prev.body_fat_percentage} unit="%" invert />
                      )}
                    </p>
                  </div>
                </div>

                {a.bmi_category && (
                  <p className="mt-2 text-[11px] text-text-muted">{a.bmi_category}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
