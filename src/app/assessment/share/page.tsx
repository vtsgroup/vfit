/**
 * src/app/assessment/share/page.tsx
 *
 * Shared Assessment — Public page (no auth required)
 *
 * Exports: SharedAssessmentPage
 * Hooks: useMemo, useSearchParams, useSharedAssessment
 * Features: 'use client' · DSIcon
 */

// ============================================
// Shared Assessment — Public page (no auth required)
// /assessment/share?token=xxx
// ============================================

'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useSharedAssessment } from '@/hooks/use-assessments'

// ============================================
// Types
// ============================================
interface SharedAssessment {
  id: string
  assessment_date: string
  student_name: string | null
  personal_name: string | null
  personal_photo: string | null
  personal_cref: string | null
  personal_cref_state: string | null
  personal_cref_verified: boolean
  personal_bio: string | null
  personal_specialties: string[] | null
  student_photo: string | null
  weight_kg: number | null
  height_cm: number | null
  bmi: number | null
  bmi_classification: string | null
  body_fat_percentage: number | null
  fat_classification: string | null
  muscle_mass_kg: number | null
  fat_mass_kg: number | null
  lean_mass_kg: number | null
  lean_mass_percentage: number | null
  muscle_mass_percentage: number | null
  bone_mass_kg: number | null
  residual_mass_kg: number | null
  waist_hip_ratio: number | null
  waist_hip_classification: string | null
  waist_risk: string | null
  basal_metabolic_rate: number | null
  total_daily_expenditure: number | null
  ideal_weight_kg: number | null
  weight_to_lose_kg: number | null
  somatotype: string | null
  protocol: string | null
  density_formula: string | null
  sum_of_skinfolds: number | null
  measurements: Record<string, number> | null
  photos: Array<{ type: string; url: string; order?: number }> | null
  ai_interpretation: string | null
  pdf_url: string | null
}

// ============================================
// Helpers
// ============================================
function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function fmtKg(v: unknown): string {
  const n = toNum(v)
  return n != null ? `${n.toFixed(1)} kg` : '—'
}

function fmtPct(v: unknown): string {
  const n = toNum(v)
  return n != null ? `${n.toFixed(1)}%` : '—'
}

const measurementLabels: Record<string, string> = {
  chest: 'Peitoral', waist: 'Cintura', hips: 'Quadril',
  right_arm: 'Braço D', left_arm: 'Braço E',
  right_thigh: 'Coxa D', left_thigh: 'Coxa E',
  right_calf: 'Panturrilha D', left_calf: 'Panturrilha E',
  shoulders: 'Ombros', neck: 'Pescoço',
  right_forearm: 'Antebraço D', left_forearm: 'Antebraço E',
}

const photoTypeLabels: Record<string, string> = {
  front: 'Frente', back: 'Costas', side_left: 'Lateral Esq.',
  side_right: 'Lateral Dir.', custom: 'Outra',
}

function bmiColor(c: string | null) {
  if (!c) return 'text-gray-400'
  if (c === 'Peso normal') return 'text-emerald-400'
  if (c === 'Sobrepeso') return 'text-amber-400'
  if (c === 'Abaixo do peso') return 'text-brand-primary'
  return 'text-red-400'
}

function fatColor(c: string | null) {
  if (!c) return 'text-gray-400'
  if (c.includes('Atleta') || c.includes('Essencial')) return 'text-brand-primary'
  if (c.includes('Bom') || c.includes('Fitness')) return 'text-emerald-400'
  if (c.includes('Média') || c.includes('Aceitável')) return 'text-amber-400'
  return 'text-red-400'
}

// ============================================
// Main Page
// ============================================
function SharedAssessmentContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const { data: assessment, isLoading, error } = useSharedAssessment(token) as {
    data: SharedAssessment | undefined
    isLoading: boolean
    error: Error | null
  }

  if (!token) {
    return <ErrorState message="Link inválido — token não fornecido." />
  }

  if (isLoading) return <LoadingSkeleton />

  if (error || !assessment) {
    return <ErrorState message={error?.message || 'Avaliação não encontrada ou link expirado.'} />
  }

  return <AssessmentView assessment={assessment} />
}

export default function SharedAssessmentPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SharedAssessmentContent />
    </Suspense>
  )
}

// ============================================
// Assessment View
// ============================================
function AssessmentView({ assessment: a }: { assessment: SharedAssessment }) {
  const dateStr = new Date(a.assessment_date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const measurements = useMemo(() => {
    if (!a.measurements) return {}
    const raw = typeof a.measurements === 'string' ? JSON.parse(a.measurements) : a.measurements
    return Object.entries(raw as Record<string, unknown>).reduce<Record<string, number>>((acc, [k, v]) => {
      const n = toNum(v)
      if (n != null && n > 0) acc[k] = n
      return acc
    }, {})
  }, [a.measurements])

  const photos = useMemo(() => {
    if (!a.photos) return []
    const raw = typeof a.photos === 'string' ? JSON.parse(a.photos) : a.photos
    if (!Array.isArray(raw)) return []
    return raw.filter((p: { url?: string }) => p.url?.startsWith('http'))
  }, [a.photos])

  const composition = useMemo(() => {
    const fat = toNum(a.body_fat_percentage)
    if (!fat) return null
    const lean = toNum(a.lean_mass_percentage) ?? (100 - fat)
    return { fatPct: fat, leanPct: lean }
  }, [a.body_fat_percentage, a.lean_mass_percentage])

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: `Avaliação Física — ${a.student_name || 'Aluno'}`,
        text: `Confira a avaliação física realizada por ${a.personal_name || 'Personal'}`,
        url,
      }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copiado!')
    }
  }

  return (
    <div className="min-h-screen bg-bg-page text-white">
      {/* Gradient top bar */}
      <div className="h-1 bg-linear-to-r from-emerald-500 via-brand-primary to-emerald-500" />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="bg-linear-to-r from-emerald-400 to-brand-primary bg-clip-text text-transparent">
              AVALIAÇÃO FÍSICA
            </span>
          </h1>
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <DSIcon name="calendar" size={14} />
            {dateStr}
          </p>
        </header>

        {/* Professional Card */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">
            Profissional Responsável
          </p>
          <div className="flex items-center gap-4">
            {a.personal_photo ? (
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-emerald-400 to-brand-primary p-0.5">
                  <Image
                    src={a.personal_photo}
                    alt={a.personal_name || 'Personal'}
                    width={64}
                    height={64}
                    className="h-full w-full rounded-full object-cover"
                    unoptimized
                    priority
                  />
                </div>
                {a.personal_cref_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-0.5">
                    <DSIcon name="shieldCheck" size={14} className="text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <DSIcon name="user" size={28} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {a.personal_name || 'Personal Trainer'}
              </h2>
              {a.personal_cref && (
                <p className="text-sm font-medium text-emerald-400">
                  CREF {a.personal_cref}/{a.personal_cref_state || ''}
                  {a.personal_cref_verified && ' ✓'}
                </p>
              )}
              <p className="text-xs text-gray-400">Educador Físico</p>
            </div>
          </div>
          {a.personal_bio && (
            <p className="mt-3 text-sm text-gray-300 leading-relaxed line-clamp-3">{a.personal_bio}</p>
          )}
          {a.personal_specialties && a.personal_specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.personal_specialties.slice(0, 5).map((s) => (
                <span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Student */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2">Aluno</p>
          <div className="flex items-center gap-3">
            {a.student_photo ? (
              <Image
                src={a.student_photo}
                alt={a.student_name || 'Aluno'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-primary/30"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20">
                <DSIcon name="user" className="text-brand-primary" />
              </div>
            )}
            <h3 className="text-base font-semibold text-white">{a.student_name || 'Aluno'}</h3>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard icon="scale" label="Peso" value={a.weight_kg ? `${toNum(a.weight_kg)?.toFixed(1)}` : '—'} unit="kg" accent="from-brand-primary to-emerald-600" />
          <MetricCard icon="ruler" label="Altura" value={a.height_cm ? `${toNum(a.height_cm)?.toFixed(0)}` : '—'} unit="cm" accent="from-violet-500 to-violet-600" />
          <MetricCard icon="percent" label="% Gordura" value={a.body_fat_percentage ? `${toNum(a.body_fat_percentage)?.toFixed(1)}` : '—'} unit="%" accent="from-orange-500 to-orange-600" />
          <MetricCard icon="dumbbell" label="Massa Musc." value={a.muscle_mass_kg ? `${toNum(a.muscle_mass_kg)?.toFixed(1)}` : '—'} unit="kg" accent="from-emerald-500 to-emerald-600" />
        </section>

        {/* IMC & Classifications */}
        {a.bmi != null && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <DSIcon name="scale" size={16} /> Classificações
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ClassificationBox
                label="IMC"
                value={toNum(a.bmi)?.toFixed(1) ?? '—'}
                classification={a.bmi_classification}
                colorClass={bmiColor(a.bmi_classification)}
              />
              <ClassificationBox
                label="% Gordura"
                value={fmtPct(a.body_fat_percentage)}
                classification={a.fat_classification}
                colorClass={fatColor(a.fat_classification)}
              />
              {a.waist_hip_ratio != null && (
                <ClassificationBox
                  label="Relação C/Q"
                  value={toNum(a.waist_hip_ratio)?.toFixed(2) ?? '—'}
                  classification={a.waist_hip_classification}
                  colorClass={a.waist_risk === 'Normal' ? 'text-emerald-400' : 'text-amber-400'}
                />
              )}
            </div>
          </section>
        )}

        {/* Body Composition Breakdown */}
        {composition && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <DSIcon name="activity" size={16} /> Composição Corporal
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CompStat label="Massa Gorda" value={fmtKg(a.fat_mass_kg)} pct={composition.fatPct} color="bg-orange-500" />
              <CompStat label="Massa Magra" value={fmtKg(a.lean_mass_kg)} pct={composition.leanPct} color="bg-brand-primary" />
              <CompStat label="Massa Muscular" value={fmtKg(a.muscle_mass_kg)} pct={toNum(a.muscle_mass_percentage)} color="bg-emerald-500" />
              <CompStat label="Massa Óssea" value={fmtKg(a.bone_mass_kg)} pct={null} color="bg-gray-400" />
            </div>

            {/* Visual bar */}
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/5">
              <div className="bg-orange-500 transition-all duration-700" style={{ width: `${composition.fatPct}%` }} />
              <div className="bg-brand-primary transition-all duration-700" style={{ width: `${composition.leanPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Gordura {composition.fatPct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-brand-primary" /> Magra {composition.leanPct.toFixed(1)}%
              </span>
            </div>
          </section>
        )}

        {/* Metabolism */}
        {(a.basal_metabolic_rate || a.total_daily_expenditure || a.ideal_weight_kg) && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <DSIcon name="flame" size={16} /> Dados Metabólicos
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {a.basal_metabolic_rate != null && (
                <MetabBox icon="zap" label="TMB" sublabel="Taxa Metabólica Basal" value={`${Math.round(toNum(a.basal_metabolic_rate) || 0)}`} unit="kcal/dia" />
              )}
              {a.total_daily_expenditure != null && (
                <MetabBox icon="flame" label="GET" sublabel="Gasto Energético Total" value={`${Math.round(toNum(a.total_daily_expenditure) || 0)}`} unit="kcal/dia" />
              )}
              {a.ideal_weight_kg != null && (
                <MetabBox icon="target" label="Peso Ideal" sublabel={
                  toNum(a.weight_to_lose_kg) != null && toNum(a.weight_to_lose_kg)! > 0
                    ? `${toNum(a.weight_to_lose_kg)!.toFixed(1)} kg a perder`
                    : toNum(a.weight_to_lose_kg) != null && toNum(a.weight_to_lose_kg)! < 0
                      ? `${Math.abs(toNum(a.weight_to_lose_kg)!).toFixed(1)} kg a ganhar`
                      : 'No peso ideal!'
                } value={`${toNum(a.ideal_weight_kg)!.toFixed(1)}`} unit="kg" />
              )}
            </div>
          </section>
        )}

        {/* Somatotype */}
        {a.somatotype && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <DSIcon name="dumbbell" className="text-emerald-400" />
              <div>
                <p className="text-xs font-medium text-gray-400">Somatotipo</p>
                <p className="text-lg font-bold text-emerald-400">{a.somatotype}</p>
              </div>
            </div>
          </section>
        )}

        {/* Measurements */}
        {Object.keys(measurements).length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <DSIcon name="ruler" size={16} /> Perímetros
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(measurements).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-400">{measurementLabels[k] || k}</span>
                  <span className="font-semibold text-white">{v.toFixed(1)} cm</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Protocol */}
        {a.protocol && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5">Protocolo Utilizado</p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">{a.protocol}</span>
              {a.density_formula && <> • Fórmula: {a.density_formula}</>}
              {a.sum_of_skinfolds != null && <> • Σ dobras: {a.sum_of_skinfolds}</>}
            </p>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <DSIcon name="camera" size={16} /> Fotos ({photos.length})
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo: { type: string; url: string }, idx: number) => (
                <div key={idx} className="relative aspect-3/4 overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={photo.url}
                    alt={photoTypeLabels[photo.type] || 'Foto'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      {photoTypeLabels[photo.type] || photo.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Interpretation */}
        {a.ai_interpretation && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Interpretação
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {a.ai_interpretation}
            </p>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-2 pb-6">
          {a.pdf_url && (
            <a
              href={a.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]"
            >
              <DSIcon name="download" size={16} />
              Baixar PDF
            </a>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
          >
            <DSIcon name="share" size={16} />
            Compartilhar
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center space-y-2 border-t border-white/5 pt-6 pb-8">
          <p className="text-xs font-bold text-emerald-400">
            PERSONAL<span className="text-brand-primary">IA</span>
          </p>
          <p className="text-[10px] text-gray-500">
            Plataforma para Personal Trainers — vfit.app.br
          </p>
          <p className="text-[9px] text-gray-600">
            Este documento é informativo e não substitui avaliação médica.
          </p>
        </footer>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function MetricCard({ icon, label, value, unit, accent }: {
  icon: DSIconName; label: string; value: string; unit: string; accent: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-3.5 text-center">
      <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${accent}`}>
        <DSIcon name={icon} size={16} className="text-white" />
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-xl font-black text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{unit}</p>
    </div>
  )
}

function ClassificationBox({ label, value, classification, colorClass }: {
  label: string; value: string; classification: string | null; colorClass: string
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {classification && (
        <p className={`mt-1 text-xs font-semibold ${colorClass}`}>{classification}</p>
      )}
    </div>
  )
}

function CompStat({ label, value, pct, color }: {
  label: string; value: string; pct: number | null; color: string
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-[10px] text-gray-400">{label}</span>
      </div>
      <p className="mt-1 text-base font-bold text-white">{value}</p>
      {pct != null && <p className="text-[10px] text-gray-500">{pct.toFixed(1)}%</p>}
    </div>
  )
}

function MetabBox({ icon, label, sublabel, value, unit }: {
  icon: DSIconName; label: string; sublabel: string; value: string; unit: string
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <DSIcon name={icon} size={16} className="text-emerald-400" />
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-white">
        {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
      </p>
      <p className="mt-0.5 text-[10px] text-gray-500">{sublabel}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-bg-page text-white">
      <div className="h-1 bg-linear-to-r from-emerald-500 via-brand-primary to-emerald-500" />
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 mx-auto rounded-lg bg-white/10" />
        <div className="h-4 w-40 mx-auto rounded bg-white/5" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
          <div className="h-3 w-32 rounded bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/10" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 rounded bg-white/10" />
              <div className="h-3 w-32 rounded bg-white/5" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3.5 h-24" />
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 h-48" />
        <div className="rounded-2xl border border-white/10 bg-white/5 h-48" />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <DSIcon name="alertCircle" size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Link Indisponível</h1>
        <p className="text-sm text-gray-400">{message}</p>
        <a
          href="https://vfit.app.br"
          className="inline-block mt-4 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
        >
          Ir para VFIT
        </a>
      </div>
    </div>
  )
}
