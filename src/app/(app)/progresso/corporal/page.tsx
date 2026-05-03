/**
 * src/app/(app)/progresso/corporal/page.tsx
 *
 * Evolução Corporal — Peso, medidas, IMC, gráfico de peso
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { MiniBarChart, BarChartSkeleton } from '@/components/progresso'
import {
  useMeasurementHistory,
  useLatestMeasurement,
  useSaveMeasurement,
  getBMICategory,
  type MeasurementInput,
  type BodyMeasurement,
} from '@/hooks/use-measurements'

// ─── S2.1: Transformation comparison card ─────────────────────────────────────
function DeltaBadge({ first, current, unit = '', invertColor = false }: {
  first: number | null
  current: number | null
  unit?: string
  invertColor?: boolean // true when lower = better (weight, fat%, waist)
}) {
  if (first == null || current == null || first === 0) return null
  const delta = parseFloat((current - first).toFixed(1))
  if (delta === 0) return <span className="text-[10px] text-text-muted">sem mudança</span>
  const isGood = invertColor ? delta < 0 : delta > 0
  return (
    <span className={`text-[11px] font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
      {delta > 0 ? '+' : ''}{delta}{unit}
    </span>
  )
}

function TransformationCard({ first, current }: { first: BodyMeasurement; current: BodyMeasurement }) {
  const daysSince = Math.round(
    (new Date(current.measured_at).getTime() - new Date(first.measured_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const metrics = [
    { label: 'Peso', firstVal: first.weight_kg, currentVal: current.weight_kg, unit: 'kg', invertColor: true },
    { label: 'Gordura', firstVal: first.body_fat_percentage, currentVal: current.body_fat_percentage, unit: '%', invertColor: true },
    { label: 'Cintura', firstVal: first.waist_cm, currentVal: current.waist_cm, unit: 'cm', invertColor: true },
    { label: 'IMC', firstVal: first.bmi, currentVal: current.bmi, unit: '', invertColor: true },
  ].filter(m => m.firstVal != null && m.currentVal != null)

  if (metrics.length === 0) return null

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/6 to-transparent p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
            <DSIcon name="trendingUp" size={13} className="text-emerald-400" />
          </div>
          <span className="text-[12px] font-bold text-emerald-400">Sua transformação</span>
        </div>
        <span className="text-[10px] text-text-muted">{daysSince} dias de progresso</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-white/6 bg-white/3 p-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">{m.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] text-text-muted line-through">{m.firstVal}{m.unit}</span>
              <span className="text-[15px] font-black text-text-primary">{m.currentVal}{m.unit}</span>
            </div>
            <div className="mt-1">
              <DeltaBadge first={m.firstVal} current={m.currentVal} unit={m.unit} invertColor={m.invertColor} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-text-muted text-center">
        Comparando {new Date(first.measured_at).toLocaleDateString('pt-BR')} → {new Date(current.measured_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  )
}
// ───────────────────────────────────────────────────────────────────────────────

type Tab = 'resumo' | 'registrar' | 'historico'

export default function CorporalPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('resumo')

  const { data: history, isLoading } = useMeasurementHistory(30)
  const { data: latest } = useLatestMeasurement()
  const saveMutation = useSaveMeasurement()

  const bmiInfo = latest?.bmi ? getBMICategory(latest.bmi) : null

  // Weight chart data from history
  const weightChart = useMemo(() => {
    if (!history || history.length < 2) return []
    return [...history].reverse().slice(-14).map(m => ({
      label: new Date(m.measured_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: m.weight_kg || 0,
    }))
  }, [history])

  // Transformation data (first vs latest)
  const firstMeasurement = useMemo(() => {
    if (!history || history.length < 2) return null
    return [...history].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())[0]
  }, [history])

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Evolução Corporal</h1>
          <p className="text-[12px] text-zinc-500">Peso, medidas e composição</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-white/3 p-1">
        {([
          { key: 'resumo' as Tab, label: 'Resumo' },
          { key: 'registrar' as Tab, label: 'Registrar' },
          { key: 'historico' as Tab, label: 'Histórico' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
              tab === t.key
                ? 'bg-brand-primary/20 text-brand-primary'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <BarChartSkeleton bars={7} />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-21 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      )}

      {/* RESUMO Tab */}
      {!isLoading && tab === 'resumo' && (
        <div className="space-y-4">
          {/* Current stats */}
          {latest ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {latest.weight_kg && (
                  <div className="flex flex-col items-center rounded-2xl border border-white/6 bg-white/3 p-4">
                    <DSIcon name="scale" size={20} className="mb-2 text-brand-primary" />
                    <p className="text-xl font-black text-white">{latest.weight_kg}<span className="text-[11px] font-normal text-zinc-500">kg</span></p>
                    <p className="text-[10px] text-zinc-500">Peso atual</p>
                  </div>
                )}
                {latest.bmi && bmiInfo && (
                  <div className="flex flex-col items-center rounded-2xl border border-white/6 bg-white/3 p-4">
                    <DSIcon name="activity" size={20} className={`mb-2 ${bmiInfo.color}`} />
                    <p className="text-xl font-black text-white">{latest.bmi}</p>
                    <p className={`text-[10px] ${bmiInfo.color}`}>{bmiInfo.label}</p>
                  </div>
                )}
              </div>

              {/* Transformation card — only shown when >= 2 measurements */}
              {firstMeasurement && latest && firstMeasurement.id !== latest.id && (
                <TransformationCard first={firstMeasurement} current={latest} />
              )}

              {/* Body measurements */}
              {(latest.chest_cm || latest.waist_cm || latest.hip_cm || latest.arm_left_cm || latest.thigh_left_cm) && (
                <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
                  <h3 className="mb-3 text-[13px] font-semibold text-zinc-400">Medidas atuais</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {latest.chest_cm && <MeasureRow label="Peito" value={latest.chest_cm} />}
                    {latest.waist_cm && <MeasureRow label="Cintura" value={latest.waist_cm} />}
                    {latest.hip_cm && <MeasureRow label="Quadril" value={latest.hip_cm} />}
                    {latest.arm_left_cm && <MeasureRow label="Braço E" value={latest.arm_left_cm} />}
                    {latest.arm_right_cm && <MeasureRow label="Braço D" value={latest.arm_right_cm} />}
                    {latest.thigh_left_cm && <MeasureRow label="Coxa E" value={latest.thigh_left_cm} />}
                    {latest.thigh_right_cm && <MeasureRow label="Coxa D" value={latest.thigh_right_cm} />}
                  </div>
                </div>
              )}

              {/* Weight chart */}
              {weightChart.length > 1 && (
                <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <DSIcon name="trendingUp" size={14} className="text-brand-primary" />
                    <span className="text-[12px] font-semibold text-zinc-400">Evolução de peso</span>
                  </div>
                  <MiniBarChart data={weightChart} color="#10B981" height={100} />
                </div>
              )}

              <p className="text-center text-[11px] text-zinc-600">
                Última medição: {new Date(latest.measured_at).toLocaleDateString('pt-BR')}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8">
                <DSIcon name="ruler" size={24} className="text-brand-primary" />
              </div>
              <h2 className="text-base font-bold text-white">Registre sua primeira medição</h2>
              <p className="mt-2 text-[13px] text-zinc-500">
                Acompanhe peso, medidas corporais e IMC ao longo do tempo.
              </p>
              <Button className="mt-4" onClick={() => setTab('registrar')}>
                <DSIcon name="plus" size={16} />
                Registrar medidas
              </Button>
            </div>
          )}
        </div>
      )}

      {/* REGISTRAR Tab */}
      {tab === 'registrar' && (
        <MeasurementForm
          onSave={async (data) => {
            await saveMutation.mutateAsync(data)
            setTab('resumo')
          }}
          loading={saveMutation.isPending}
          defaultHeight={latest?.height_cm || undefined}
        />
      )}

      {/* HISTÓRICO Tab */}
      {!isLoading && tab === 'historico' && (
        <div className="space-y-2">
          {(!history || history.length === 0) ? (
            <p className="py-8 text-center text-[13px] text-zinc-500">Nenhuma medição registrada</p>
          ) : (
            history.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/6 bg-white/3 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-zinc-400">
                    {new Date(m.measured_at).toLocaleDateString('pt-BR')}
                  </p>
                  {m.bmi && (
                    <span className={`text-[10px] font-medium ${getBMICategory(m.bmi).color}`}>
                      IMC {m.bmi}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex gap-4">
                  {m.weight_kg && (
                    <span className="text-[13px] font-bold text-white">{m.weight_kg}kg</span>
                  )}
                  {m.waist_cm && (
                    <span className="text-[12px] text-zinc-500">Cintura: {m.waist_cm}cm</span>
                  )}
                  {m.chest_cm && (
                    <span className="text-[12px] text-zinc-500">Peito: {m.chest_cm}cm</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function MeasureRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2">
      <span className="text-[12px] text-zinc-500">{label}</span>
      <span className="text-[13px] font-bold text-white">{value}<span className="text-[10px] font-normal text-zinc-500">cm</span></span>
    </div>
  )
}

function MeasurementForm({
  onSave,
  loading,
  defaultHeight,
}: {
  onSave: (data: MeasurementInput) => Promise<void>
  loading: boolean
  defaultHeight?: number
}) {
  const [form, setForm] = useState<MeasurementInput>({
    height_cm: defaultHeight,
  })

  const update = (key: keyof MeasurementInput, val: string) => {
    const num = val ? parseFloat(val) : undefined
    setForm(prev => ({ ...prev, [key]: num }))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-zinc-400">Dados principais</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Peso (kg)" value={form.weight_kg} onChange={(v) => update('weight_kg', v)} placeholder="75.5" />
          <InputField label="Altura (cm)" value={form.height_cm} onChange={(v) => update('height_cm', v)} placeholder="175" />
          <InputField label="% Gordura" value={form.body_fat_percentage} onChange={(v) => update('body_fat_percentage', v)} placeholder="15.0" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-zinc-400">Medidas (cm)</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Peito" value={form.chest_cm} onChange={(v) => update('chest_cm', v)} placeholder="100" />
          <InputField label="Cintura" value={form.waist_cm} onChange={(v) => update('waist_cm', v)} placeholder="80" />
          <InputField label="Quadril" value={form.hip_cm} onChange={(v) => update('hip_cm', v)} placeholder="95" />
          <InputField label="Braço E" value={form.arm_left_cm} onChange={(v) => update('arm_left_cm', v)} placeholder="35" />
          <InputField label="Braço D" value={form.arm_right_cm} onChange={(v) => update('arm_right_cm', v)} placeholder="35" />
          <InputField label="Coxa E" value={form.thigh_left_cm} onChange={(v) => update('thigh_left_cm', v)} placeholder="55" />
          <InputField label="Coxa D" value={form.thigh_right_cm} onChange={(v) => update('thigh_right_cm', v)} placeholder="55" />
        </div>
      </div>

      <Button
        className="w-full"
        loading={loading}
        onClick={() => onSave(form)}
      >
        <DSIcon name="check" size={16} />
        Salvar medição
      </Button>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: number | undefined
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:border-brand-primary/50 focus:outline-none"
      />
    </div>
  )
}
