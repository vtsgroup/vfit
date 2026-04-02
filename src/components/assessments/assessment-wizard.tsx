// ============================================
// assessment-wizard.tsx — Wizard multi-step para nova avaliação física
// ============================================
//
// O que faz:
//   Formulário em 5 etapas: Básico, Medidas, Dobras Cutâneas, Fotos, Resultado.
//   Etapa 4 integra PhotoCaptureModal para captura de fotos (frente/lado/costas).
//   Submit via useCreateAssessmentWithPhotos com upload paralelo de fotos para R2.
//   Mostra AssessmentCompare com avaliação anterior ao confirmar resultado.
//
// Exports principais:
//   AssessmentWizard — wizard completo de avaliação física
'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAssessmentHistory, useCreateAssessmentWithPhotos } from '@/hooks/use-assessments'
import { useStudent } from '@/hooks/use-students'
import { buildAssessmentPreview, AssessmentResult } from '@/components/assessments/assessment-result'
import { AssessmentCompare } from '@/components/assessments/assessment-compare'

type Gender = 'male' | 'female'

const STEPS: { label: string; icon: DSIconName }[] = [
  { label: 'Básico', icon: 'user' },
  { label: 'Medidas', icon: 'ruler' },
  { label: 'Dobras', icon: 'layers' },
  { label: 'Fotos', icon: 'camera' },
  { label: 'Resultado', icon: 'clipboardList' },
]

type PhotoSlot = 'front' | 'side_left' | 'back'

export function AssessmentWizard({ studentId, onCancel }: { studentId: string; onCancel: () => void }) {
  const [step, setStep] = useState(0)
  const createAssessment = useCreateAssessmentWithPhotos()
  const { data: student } = useStudent(studentId)
  const { data: history } = useAssessmentHistory(studentId)

  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0])
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [muscleMassKg, setMuscleMassKg] = useState('')
  const [notes, setNotes] = useState('')

  const [measurements, setMeasurements] = useState<Record<string, string>>({
    chest: '',
    waist: '',
    hips: '',
    right_arm: '',
    right_thigh: '',
    right_calf: '',
  })

  const [skinfolds, setSkinfolds] = useState<Record<string, string>>({
    chest: '',
    axillary: '',
    triceps: '',
    subscapular: '',
    abdominal: '',
    suprailiac: '',
    thigh: '',
  })

  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, { file: File; preview: string }>>>({})

  const previous = useMemo(() => {
    const list = history?.assessments ?? []
    return list.length > 0 ? list[list.length - 1] : null
  }, [history])

  const preview = useMemo(() => buildAssessmentPreview({
    weightKg: toNumber(weightKg),
    heightCm: toNumber(heightCm),
    age: toNumber(age),
    gender,
    skinfolds: [
      skinfolds.chest,
      skinfolds.axillary,
      skinfolds.triceps,
      skinfolds.subscapular,
      skinfolds.abdominal,
      skinfolds.suprailiac,
      skinfolds.thigh,
    ].map((v) => toNumber(v) ?? 0),
  }), [weightKg, heightCm, age, gender, skinfolds])

  const isStepValid = useMemo(() => {
    if (step === 0) {
      return !!assessmentDate && !!toNumber(weightKg) && !!toNumber(heightCm) && !!toNumber(age)
    }
    if (step === 2) {
      return Object.values(skinfolds).every((v) => (toNumber(v) ?? 0) > 0)
    }
    return true
  }, [step, assessmentDate, weightKg, heightCm, age, skinfolds])

  function onFileChange(slot: PhotoSlot, file: File | null) {
    if (!file) return
    setPhotos((prev) => ({
      ...prev,
      [slot]: { file, preview: URL.createObjectURL(file) },
    }))
  }

  function submit() {
    const cleanMeasurements = Object.entries(measurements).reduce<Record<string, number>>((acc, [key, value]) => {
      const parsed = toNumber(value)
      if (parsed != null) acc[key] = parsed
      return acc
    }, {})

    const cleanSkinfolds = Object.entries(skinfolds).reduce<Record<string, number>>((acc, [key, value]) => {
      const parsed = toNumber(value)
      if (parsed != null) acc[key] = parsed
      return acc
    }, {})

    createAssessment.mutate({
      student_id: studentId,
      assessment_date: assessmentDate,
      weight_kg: toNumber(weightKg),
      height_cm: toNumber(heightCm),
      muscle_mass_kg: toNumber(muscleMassKg),
      measurements: Object.keys(cleanMeasurements).length ? cleanMeasurements : null,
      notes: notes.trim() || null,
      protocol: 'pollock_7',
      density_formula: 'siri',
      gender,
      age: toNumber(age) ?? undefined,
      skinfolds: Object.keys(cleanSkinfolds).length ? cleanSkinfolds : null,
      photos: Object.entries(photos).map(([type, payload]) => ({ file: payload!.file, type: type as PhotoSlot })),
    })
  }

  return (
    <div className="space-y-5">
      <StepHeader current={step} />

      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Dados básicos</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input label="Aluno" value={student?.full_name || 'Carregando...'} readOnly />
            <Input label="Data" type="date" value={assessmentDate} onChange={setAssessmentDate} />
            <Input label="Peso (kg)" type="number" value={weightKg} onChange={setWeightKg} />
            <Input label="Altura (cm)" type="number" value={heightCm} onChange={setHeightCm} />
            <Input label="Idade" type="number" value={age} onChange={setAge} />
            <Input label="Massa muscular (kg)" type="number" value={muscleMassKg} onChange={setMuscleMassKg} />
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-text-primary">Sexo biológico</p>
              <div className="flex gap-2">
                <Button type="button" variant={gender === 'male' ? 'primary' : 'outline'} onClick={() => setGender('male')}>Masculino</Button>
                <Button type="button" variant={gender === 'female' ? 'primary' : 'outline'} onClick={() => setGender('female')}>Feminino</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Medidas corporais (cm)</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input label="Peitoral" type="number" value={measurements.chest} onChange={(v) => setMeasurements((p) => ({ ...p, chest: v }))} />
            <Input label="Cintura" type="number" value={measurements.waist} onChange={(v) => setMeasurements((p) => ({ ...p, waist: v }))} />
            <Input label="Quadril" type="number" value={measurements.hips} onChange={(v) => setMeasurements((p) => ({ ...p, hips: v }))} />
            <Input label="Braço" type="number" value={measurements.right_arm} onChange={(v) => setMeasurements((p) => ({ ...p, right_arm: v }))} />
            <Input label="Coxa" type="number" value={measurements.right_thigh} onChange={(v) => setMeasurements((p) => ({ ...p, right_thigh: v }))} />
            <Input label="Panturrilha" type="number" value={measurements.right_calf} onChange={(v) => setMeasurements((p) => ({ ...p, right_calf: v }))} />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Dobras cutâneas (mm) — Pollock 7</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input label="Peitoral" type="number" value={skinfolds.chest} onChange={(v) => setSkinfolds((p) => ({ ...p, chest: v }))} />
            <Input label="Axilar" type="number" value={skinfolds.axillary} onChange={(v) => setSkinfolds((p) => ({ ...p, axillary: v }))} />
            <Input label="Tricipital" type="number" value={skinfolds.triceps} onChange={(v) => setSkinfolds((p) => ({ ...p, triceps: v }))} />
            <Input label="Subescapular" type="number" value={skinfolds.subscapular} onChange={(v) => setSkinfolds((p) => ({ ...p, subscapular: v }))} />
            <Input label="Abdominal" type="number" value={skinfolds.abdominal} onChange={(v) => setSkinfolds((p) => ({ ...p, abdominal: v }))} />
            <Input label="Supra-ilíaca" type="number" value={skinfolds.suprailiac} onChange={(v) => setSkinfolds((p) => ({ ...p, suprailiac: v }))} />
            <Input label="Coxa" type="number" value={skinfolds.thigh} onChange={(v) => setSkinfolds((p) => ({ ...p, thigh: v }))} />
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Fotos da avaliação</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <PhotoInput label="Frente" preview={photos.front?.preview} onChange={(file) => onFileChange('front', file)} />
            <PhotoInput label="Lateral" preview={photos.side_left?.preview} onChange={(file) => onFileChange('side_left', file)} />
            <PhotoInput label="Costas" preview={photos.back?.preview} onChange={(file) => onFileChange('back', file)} />
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <AssessmentResult preview={preview} />
          <AssessmentCompare
            hasPrevious={!!previous}
            metrics={[
              { label: 'Peso', previous: previous?.weight_kg ?? null, current: toNumber(weightKg), unit: 'kg', positiveWhenDown: true },
              { label: '% Gordura', previous: previous?.body_fat_percentage ?? null, current: preview.bodyFatPercentage, unit: '%', positiveWhenDown: true },
              { label: 'Massa muscular', previous: previous?.muscle_mass_kg ?? null, current: toNumber(muscleMassKg), unit: 'kg' },
              { label: 'IMC', previous: previous?.bmi ?? null, current: preview.bmi, unit: '', positiveWhenDown: true },
            ]}
          />

          <Card>
            <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
                placeholder="Resumo da sessão, pontos de atenção e próximos passos..."
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}>
          <DSIcon name="arrowLeft" size={16} className="mr-1.5" />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {step < 4 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!isStepValid}>
            Próximo
            <DSIcon name="arrowRight" size={16} className="ml-1.5" />
          </Button>
        ) : (
          <Button type="button" loading={createAssessment.isPending} onClick={submit}>
            <DSIcon name="check" size={16} className="mr-1.5" />
            Salvar avaliação
          </Button>
        )}
      </div>
    </div>
  )
}

function StepHeader({ current }: { current: number }) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step, index) => {
            const done = index < current
            const active = index === current
            return (
              <div key={step.label} className="flex flex-col items-center gap-1 text-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${done || active ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-border-light text-text-muted'}`}>
                  <DSIcon name={step.icon} size={16} />
                </div>
              <span className={`text-[10px] ${active ? 'text-brand-primary' : 'text-text-muted'}`}>{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="w-full rounded-lg border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
      />
    </div>
  )
}

function PhotoInput({
  label,
  preview,
  onChange,
}: {
  label: string
  preview?: string
  onChange: (file: File | null) => void
}) {
  return (
    <label className="block cursor-pointer rounded-xl border border-dashed border-border-light bg-bg-secondary p-3 text-center hover:border-brand-primary">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      {preview ? (
        <Image
          src={preview}
          alt={label}
          width={640}
          height={224}
          unoptimized
          className="mx-auto h-28 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-28 items-center justify-center rounded-lg bg-bg-primary text-xs text-text-muted">Selecionar foto</div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  )
}

function toNumber(value: string): number | null {
  if (!value) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}
