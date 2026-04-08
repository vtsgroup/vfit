/**
 * src/components/assessments/assessment-form-v2.tsx
 *
 * Assessment Form v2 — Wizard de 6 etapas
 *
 * Exports: AssessmentFormV2
 * Hooks: useState, useMemo, useCallback, useCreateAssessmentWithPhotos, useAssessmentProtocols
 * Features: 'use client' · DSIcon
 */

// ============================================
// Assessment Form v2 — Wizard de 6 etapas
// VFIT — v2.0
// ============================================

'use client'

import { useState, useMemo, useCallback } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StyledSelect } from '@/components/ui/styled-select'
import {
  useCreateAssessmentWithPhotos,
  useAssessmentProtocols,
  type Measurements,
  type Skinfolds,
  type BioimpedanceData,
  type ProtocolId,
  type DensityFormula,
  type ActivityLevel,
  type Gender,
  type ProtocolInfo,
  type CreateAssessmentWithPhotosInput,
} from '@/hooks/use-assessments'
import { PhotoCaptureModal } from '@/components/assessments/photo-capture-modal'

// ============================================
// Types
// ============================================

type PhotoPosition = 'front' | 'side' | 'back'
type SkinfoldSite = 'triceps' | 'chest' | 'axillary' | 'subscapular' | 'suprailiac' | 'abdominal' | 'thigh' | 'biceps'

interface PhotoData {
  position: PhotoPosition
  file: File | null
  preview: string | null
}

interface StudentOption {
  id: string
  full_name: string
}

interface AssessmentFormV2Props {
  students: StudentOption[]
  onCancel: () => void
}

const STEP_LABELS: { label: string; icon: DSIconName }[] = [
  { label: 'Básico', icon: 'user' },
  { label: 'Protocolo', icon: 'activity' },
  { label: 'Dobras', icon: 'layers' },
  { label: 'Medidas', icon: 'ruler' },
  { label: 'Fotos', icon: 'camera' },
  { label: 'Revisão', icon: 'check' },
]

const SKINFOLD_LABELS: Record<SkinfoldSite, string> = {
  triceps: 'Tríceps',
  chest: 'Peitoral',
  axillary: 'Axilar Média',
  subscapular: 'Subescapular',
  suprailiac: 'Supra-ilíaca',
  abdominal: 'Abdominal',
  thigh: 'Coxa',
  biceps: 'Bíceps',
}

const DENSITY_FORMULA_OPTIONS: { value: DensityFormula; label: string; desc: string }[] = [
  { value: 'siri', label: 'Siri (1961)', desc: 'Mais utilizada — %G = (4.95/D - 4.50) × 100' },
  { value: 'brozek', label: 'Brozek (1963)', desc: 'Alternativa — %G = (4.57/D - 4.142) × 100' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; factor: string }[] = [
  { value: 'sedentary', label: 'Sedentário', factor: '×1.2' },
  { value: 'light', label: 'Levemente ativo', factor: '×1.375' },
  { value: 'moderate', label: 'Moderadamente ativo', factor: '×1.55' },
  { value: 'active', label: 'Muito ativo', factor: '×1.725' },
  { value: 'very_active', label: 'Extremamente ativo', factor: '×1.9' },
]

// Medidas pareadas
const PAIRED_GROUPS = [
  { label: 'Braço', rightKey: 'right_arm', leftKey: 'left_arm' },
  { label: 'Antebraço', rightKey: 'right_forearm', leftKey: 'left_forearm' },
  { label: 'Coxa', rightKey: 'right_thigh', leftKey: 'left_thigh' },
  { label: 'Panturrilha', rightKey: 'right_calf', leftKey: 'left_calf' },
]

// Medidas avulsas
const SINGLE_MEASURES: { key: keyof Measurements; label: string }[] = [
  { key: 'chest', label: 'Peitoral' },
  { key: 'waist', label: 'Cintura' },
  { key: 'hips', label: 'Quadril' },
  { key: 'shoulders', label: 'Ombros' },
  { key: 'neck', label: 'Pescoço' },
]

// ============================================
// Component
// ============================================

export default function AssessmentFormV2({ students, onCancel }: AssessmentFormV2Props) {
  const createAssessment = useCreateAssessmentWithPhotos()
  const { data: protocols } = useAssessmentProtocols()
  const [step, setStep] = useState(0)

  // Step 1 — Dados Básicos
  const [studentId, setStudentId] = useState('')
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0])
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')

  // Step 2 — Protocolo
  const [protocol, setProtocol] = useState<ProtocolId>('pollock_3_male')
  const [densityFormula, setDensityFormula] = useState<DensityFormula>('siri')

  // Step 3 — Dobras / Bioimpedância
  const [skinfolds, setSkinfolds] = useState<Record<string, string>>({})
  const [bioData, setBioData] = useState<Record<string, string>>({})

  // Step 4 — Medidas
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [wristDiameter, setWristDiameter] = useState('')
  const [femurDiameter, setFemurDiameter] = useState('')

  // Step 5 — Fotos
  const [photos, setPhotos] = useState<Partial<Record<PhotoPosition, PhotoData>>>({
    front: { position: 'front', file: null, preview: null },
    side: { position: 'side', file: null, preview: null },
    back: { position: 'back', file: null, preview: null },
  })
  const [editPhotosMode, setEditPhotosMode] = useState<'none' | 'leaner_man' | 'leaner_woman' | 'muscular_man'>('none')

  // Step 6 — Notes
  const [notes, setNotes] = useState('')

  // Protocol info
  const currentProtocol = useMemo(() => {
    if (!protocols) return null
    return protocols[protocol] ?? null
  }, [protocols, protocol])

  const isBioimpedance = protocol === 'bioimpedance'

  // Validation
  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return !!studentId && !!assessmentDate && !!age
      case 1: return !!protocol
      case 2: {
        if (isBioimpedance) return true // bioimpedance fields optional
        if (!currentProtocol) return true
        // Check required skinfolds have values
        return currentProtocol.requiredSkinfolds.every(
          (s: string) => skinfolds[s] && parseFloat(skinfolds[s]) > 0
        )
      }
      case 3: return true // measurements optional
      case 4: return true // photos optional
      case 5: return true // review always valid
      default: return false
    }
  }, [step, studentId, assessmentDate, age, protocol, isBioimpedance, currentProtocol, skinfolds])

  // Auto-select protocol based on gender
  const handleGenderChange = useCallback((g: Gender) => {
    setGender(g)
    // Auto-swap gendered protocols
    if (protocol === 'pollock_3_male' && g === 'female') setProtocol('pollock_3_female')
    if (protocol === 'pollock_3_female' && g === 'male') setProtocol('pollock_3_male')
    if (protocol === 'guedes_male' && g === 'female') setProtocol('guedes_female')
    if (protocol === 'guedes_female' && g === 'male') setProtocol('guedes_male')
  }, [protocol])

  function handlePhotoCapture(position: PhotoPosition, file: File) {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotos((prev) => ({
        ...prev,
        [position]: { position, file, preview: reader.result as string },
      }))
    }
    reader.readAsDataURL(file)
  }

  function handlePhotoRemove(position: PhotoPosition) {
    setPhotos((prev) => ({
      ...prev,
      [position]: { position, file: null, preview: null },
    }))
  }

  function handleSubmit() {
    // Build clean measurements
    const cleanMeasurements: Measurements = {}
    for (const [key, val] of Object.entries(measurements)) {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) cleanMeasurements[key] = n
    }

    // Build skinfolds
    const cleanSkinfolds: Skinfolds = {}
    for (const [key, val] of Object.entries(skinfolds)) {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) (cleanSkinfolds as Record<string, number>)[key] = n
    }

    // Build bioimpedance
    const cleanBio: BioimpedanceData = {}
    for (const [key, val] of Object.entries(bioData)) {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) (cleanBio as Record<string, number>)[key] = n
    }

    // Photos
    const photosToUpload = Object.values(photos)
      .filter((p) => p?.file !== null)
      .map((p) => {
        const position = p!.position
        const photoType: 'front' | 'back' | 'side_left' | 'side_right' | 'custom' =
          position === 'front' ? 'front' : position === 'side' ? 'side_left' : 'back'
        return { file: p!.file!, type: photoType }
      })

    const payload: CreateAssessmentWithPhotosInput = {
      student_id: studentId,
      assessment_date: assessmentDate,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      body_fat_percentage: isBioimpedance && bioData.body_fat ? parseFloat(bioData.body_fat) : null,
      muscle_mass_kg: isBioimpedance && bioData.muscle_mass_kg ? parseFloat(bioData.muscle_mass_kg) : null,
      measurements: Object.keys(cleanMeasurements).length > 0 ? cleanMeasurements : null,
      notes: notes.trim() || null,
      photos: photosToUpload.length > 0 ? photosToUpload : undefined,
      edit_style: editPhotosMode,
      // v2 fields
      protocol,
      density_formula: !isBioimpedance ? densityFormula : undefined,
      gender,
      age: parseInt(age),
      skinfolds: Object.keys(cleanSkinfolds).length > 0 ? cleanSkinfolds : null,
      bioimpedance: Object.keys(cleanBio).length > 0 ? cleanBio : null,
      activity_level: activityLevel,
      wrist_diameter_cm: wristDiameter ? parseFloat(wristDiameter) : undefined,
      femur_diameter_cm: femurDiameter ? parseFloat(femurDiameter) : undefined,
    }

    createAssessment.mutate(payload)
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress bar */}
      <StepProgress steps={STEP_LABELS} current={step} onStepClick={setStep} />

      {/* Step content */}
      {step === 0 && (
        <StepBasicInfo
          students={students}
          studentId={studentId}
          setStudentId={setStudentId}
          assessmentDate={assessmentDate}
          setAssessmentDate={setAssessmentDate}
          weightKg={weightKg}
          setWeightKg={setWeightKg}
          heightCm={heightCm}
          setHeightCm={setHeightCm}
          gender={gender}
          setGender={handleGenderChange}
          age={age}
          setAge={setAge}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
        />
      )}

      {step === 1 && (
        <StepProtocol
          protocol={protocol}
          setProtocol={setProtocol}
          densityFormula={densityFormula}
          setDensityFormula={setDensityFormula}
          gender={gender}
          protocols={protocols}
        />
      )}

      {step === 2 && (
        isBioimpedance ? (
          <StepBioimpedance bioData={bioData} setBioData={setBioData} />
        ) : (
          <StepSkinfolds
            currentProtocol={currentProtocol}
            skinfolds={skinfolds}
            setSkinfolds={setSkinfolds}
          />
        )
      )}

      {step === 3 && (
        <StepMeasurements
          measurements={measurements}
          setMeasurements={setMeasurements}
          wristDiameter={wristDiameter}
          setWristDiameter={setWristDiameter}
          femurDiameter={femurDiameter}
          setFemurDiameter={setFemurDiameter}
        />
      )}

      {step === 4 && (
        <StepPhotos
          photos={photos}
          editPhotosMode={editPhotosMode}
          setEditPhotosMode={setEditPhotosMode}
          gender={gender}
          onCapture={handlePhotoCapture}
          onRemove={handlePhotoRemove}
        />
      )}

      {step === 5 && (
        <StepReview
          students={students}
          studentId={studentId}
          assessmentDate={assessmentDate}
          weightKg={weightKg}
          heightCm={heightCm}
          gender={gender}
          age={age}
          protocol={protocol}
          currentProtocol={currentProtocol}
          skinfolds={skinfolds}
          bioData={bioData}
          measurements={measurements}
          photos={photos}
          notes={notes}
          setNotes={setNotes}
          isBioimpedance={isBioimpedance}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
        >
          <DSIcon name="arrowLeft" size={16} className="mr-1.5" />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {step < 5 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
            Próximo
            <DSIcon name="arrowRight" size={16} className="ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={createAssessment.isPending}
            disabled={!studentId || !assessmentDate}
          >
                        <DSIcon name="save" size={16} className="mr-1.5" />
            Salvar Avaliação
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Step Progress Indicator
// ============================================

function StepProgress({ steps, current, onStepClick }: { steps: typeof STEP_LABELS; current: number; onStepClick: (step: number) => void }) {
  return (
    <div className="relative">
      {/* Background line */}
      <div className="absolute left-0 right-0 top-5 h-0.5 bg-border-light" />
      <div
        className="absolute left-0 top-5 h-0.5 bg-brand-primary transition-all duration-500"
        style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
      />

      <div className="relative flex justify-between">
        {steps.map((s, i) => {
          const isDone = i < current
          const isActive = i === current
          return (
            <button
              key={i}
              onClick={() => { if (i <= current) onStepClick(i) }}
              className="flex flex-col items-center gap-1.5"
              disabled={i > current}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isDone
                    ? 'border-brand-primary bg-brand-primary text-bg-dark'
                    : isActive
                      ? 'border-brand-primary bg-bg-secondary text-brand-primary shadow-lg shadow-brand-primary/20'
                      : 'border-border-light bg-bg-secondary text-text-muted'
                }`}
              >
                {isDone ? <DSIcon name="check" size={16} /> : <DSIcon name={s.icon} size={16} />}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-brand-primary' : isDone ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 1 — Dados Básicos
// ============================================

function StepBasicInfo({
  students, studentId, setStudentId,
  assessmentDate, setAssessmentDate,
  weightKg, setWeightKg, heightCm, setHeightCm,
  gender, setGender, age, setAge,
  activityLevel, setActivityLevel,
}: {
  students: StudentOption[]
  studentId: string; setStudentId: (v: string) => void
  assessmentDate: string; setAssessmentDate: (v: string) => void
  weightKg: string; setWeightKg: (v: string) => void
  heightCm: string; setHeightCm: (v: string) => void
  gender: Gender; setGender: (v: Gender) => void
  age: string; setAge: (v: string) => void
  activityLevel: ActivityLevel; setActivityLevel: (v: ActivityLevel) => void
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                        <DSIcon name="user" size={20} className="text-brand-primary" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Aluno *</label>
            <StyledSelect
              value={studentId}
              onChange={setStudentId}
              options={[
                { value: '', label: 'Selecione o aluno' },
                ...students.map((s) => ({ value: s.id, label: s.full_name })),
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Data *</label>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Idade *</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min="10"
                max="99"
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Gender toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Sexo biológico *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  gender === 'male'
                    ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/40 shadow-sm'
                    : 'bg-bg-tertiary text-text-muted hover:text-text-primary border border-transparent'
                }`}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  gender === 'female'
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-sm'
                    : 'bg-bg-tertiary text-text-muted hover:text-text-primary border border-transparent'
                }`}
              >
                Feminino
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composição Corporal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField label="Peso (kg)" value={weightKg} onChange={setWeightKg} placeholder="75.0" step="0.1" />
            <NumField label="Altura (cm)" value={heightCm} onChange={setHeightCm} placeholder="175" step="0.1" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Nível de atividade</label>
            <StyledSelect
              value={activityLevel}
              onChange={(v) => setActivityLevel(v as ActivityLevel)}
              options={ACTIVITY_LEVELS.map((l) => ({
                value: l.value,
                label: `${l.label} (${l.factor})`,
              }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Step 2 — Seleção de Protocolo
// ============================================

function StepProtocol({
  protocol, setProtocol, densityFormula, setDensityFormula, gender, protocols,
}: {
  protocol: ProtocolId; setProtocol: (v: ProtocolId) => void
  densityFormula: DensityFormula; setDensityFormula: (v: DensityFormula) => void
  gender: Gender
  protocols: Record<string, ProtocolInfo> | undefined
}) {
  // Hardcoded fallback if API hasn't loaded
  const protocolList: ProtocolInfo[] = useMemo(() => {
    if (protocols) return Object.values(protocols)
    return []
  }, [protocols])

  // Filter by gender compatibility
  const filtered = protocolList.filter(
    (p) => p.gender === 'both' || p.gender === gender
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                        <DSIcon name="activity" size={20} className="text-brand-primary" />
            Protocolo de Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProtocol(p.id)}
                className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                  protocol === p.id
                    ? 'border-brand-primary bg-brand-primary/5 shadow-md shadow-brand-primary/10'
                    : 'border-border-light bg-bg-secondary hover:border-text-muted/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{p.name}</span>
                      {p.id === 'bioimpedance' && (
                        <Badge variant="info">Direto</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {p.author} {p.year > 0 ? `(${p.year})` : ''}
                    </p>
                    <p className="mt-1.5 text-sm text-text-secondary">{p.description}</p>
                  </div>
                  {p.skinfoldCount > 0 && (
                    <Badge variant="outline" className="ml-3 shrink-0">
                      {p.skinfoldCount} dobras
                    </Badge>
                  )}
                </div>

                {/* Required skinfolds preview */}
                {p.requiredSkinfolds.length > 0 && protocol === p.id && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.requiredSkinfolds.map((sf: string) => (
                      <span
                        key={sf}
                        className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary"
                      >
                        {SKINFOLD_LABELS[sf as SkinfoldSite] || sf}
                      </span>
                    ))}
                  </div>
                )}

                {/* Selected indicator */}
                {protocol === p.id && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary">
                                        <DSIcon name="check" size={14} className="text-bg-dark" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Density formula — only for skinfold protocols */}
      {protocol !== 'bioimpedance' && protocol !== 'faulkner' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fórmula de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {DENSITY_FORMULA_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setDensityFormula(f.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    densityFormula === f.value
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-border-light bg-bg-secondary hover:border-text-muted/30'
                  }`}
                >
                  <span className="font-medium text-text-primary">{f.label}</span>
                  <p className="mt-0.5 text-xs text-text-muted">{f.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Step 3a — Dobras Cutâneas
// ============================================

function StepSkinfolds({
  currentProtocol, skinfolds, setSkinfolds,
}: {
  currentProtocol: ProtocolInfo | null
  skinfolds: Record<string, string>
  setSkinfolds: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const required = currentProtocol?.requiredSkinfolds ?? []
  const allSites: SkinfoldSite[] = ['triceps', 'chest', 'axillary', 'subscapular', 'suprailiac', 'abdominal', 'thigh', 'biceps']
  const [showAll, setShowAll] = useState(false)

  const displaySites = showAll ? allSites : required as SkinfoldSite[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
                    <DSIcon name="layers" size={20} className="text-brand-primary" />
          Dobras Cutâneas
          {currentProtocol && (
            <Badge variant="info" className="ml-2">{currentProtocol.name}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-info/20 bg-info/5 p-3">
          <p className="text-xs text-info">
                        <DSIcon name="info" size={14} className="mr-1 inline" />
            Meça cada dobra cutânea 3× e insira o valor médio em milímetros (mm).
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {displaySites.map((site) => {
            const isRequired = required.includes(site)
            return (
              <div key={site}>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-text-primary">
                  {SKINFOLD_LABELS[site]}
                  {isRequired && <span className="text-error">*</span>}
                  <span className="text-xs text-text-muted">(mm)</span>
                </label>
                <input
                  type="number"
                  value={skinfolds[site] || ''}
                  onChange={(e) => setSkinfolds((prev) => ({ ...prev, [site]: e.target.value }))}
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
                    isRequired
                      ? 'border-brand-primary/30 bg-brand-primary/5 focus:border-brand-primary'
                      : 'border-border-light bg-bg-primary focus:border-brand-primary'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {!showAll && required.length < allSites.length && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-primary transition-colors"
          >
                        <DSIcon name="chevronDown" size={14} />
            Mostrar todas as dobras ({allSites.length - required.length} opcionais)
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Step 3b — Bioimpedância
// ============================================

function StepBioimpedance({
  bioData, setBioData,
}: {
  bioData: Record<string, string>
  setBioData: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const fields = [
    { key: 'body_fat', label: '% Gordura', placeholder: '15.0' },
    { key: 'muscle_mass_kg', label: 'Massa Muscular (kg)', placeholder: '60.0' },
    { key: 'water_percentage', label: '% Água', placeholder: '60.0' },
    { key: 'visceral_fat_level', label: 'Gordura Visceral', placeholder: '8' },
    { key: 'metabolic_age', label: 'Idade Metabólica', placeholder: '25' },
    { key: 'bone_mass_kg', label: 'Massa Óssea (kg)', placeholder: '3.0' },
    { key: 'basal_metabolic_rate', label: 'TMB (kcal)', placeholder: '1800' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
                    <DSIcon name="activity" size={20} className="text-brand-primary" />
          Dados da Bioimpedância
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-info/20 bg-info/5 p-3">
          <p className="text-xs text-info">
                        <DSIcon name="info" size={14} className="mr-1 inline" />
            Insira os valores fornecidos pela balança de bioimpedância. Todos são opcionais.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-text-primary">{f.label}</label>
              <input
                type="number"
                value={bioData[f.key] || ''}
                onChange={(e) => setBioData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                step="0.1"
                min="0"
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Step 4 — Antropometria
// ============================================

function StepMeasurements({
  measurements, setMeasurements,
  wristDiameter, setWristDiameter,
  femurDiameter, setFemurDiameter,
}: {
  measurements: Record<string, string>
  setMeasurements: React.Dispatch<React.SetStateAction<Record<string, string>>>
  wristDiameter: string; setWristDiameter: (v: string) => void
  femurDiameter: string; setFemurDiameter: (v: string) => void
}) {
  const handleChange = (key: string, val: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                        <DSIcon name="ruler" size={20} className="text-brand-primary" />
            Perímetros Corporais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single measures */}
          <div className="grid gap-3 sm:grid-cols-2">
            {SINGLE_MEASURES.map((m) => (
              <NumField
                key={m.key as string}
                label={`${m.label} (cm)`}
                value={measurements[m.key as string] || ''}
                onChange={(v) => handleChange(m.key as string, v)}
                placeholder="0.0"
                step="0.1"
              />
            ))}
          </div>

          {/* Paired measures */}
          <div className="space-y-4 border-t border-border-light pt-4">
            {PAIRED_GROUPS.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-sm font-medium text-text-primary">{g.label}</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <NumField
                      label="Esquerdo (cm)"
                      value={measurements[g.leftKey] || ''}
                      onChange={(v) => handleChange(g.leftKey, v)}
                      placeholder="0.0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <NumField
                      label="Direito (cm)"
                      value={measurements[g.rightKey] || ''}
                      onChange={(v) => handleChange(g.rightKey, v)}
                      placeholder="0.0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bone diameters (for muscle/bone mass calc) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diâmetros Ósseos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-text-muted">
            Opcional — usados para cálculo de massa óssea (Von Döbeln) e massa muscular (Lee).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumField
              label="Punho (cm)"
              value={wristDiameter}
              onChange={setWristDiameter}
              placeholder="5.5"
              step="0.1"
            />
            <NumField
              label="Fêmur (cm)"
              value={femurDiameter}
              onChange={setFemurDiameter}
              placeholder="9.0"
              step="0.1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Step 5 — Fotos
// ============================================

function StepPhotos({
  photos, editPhotosMode, setEditPhotosMode, gender, onCapture, onRemove,
}: {
  photos: Partial<Record<PhotoPosition, PhotoData>>
  editPhotosMode: string
  setEditPhotosMode: (v: 'none' | 'leaner_man' | 'leaner_woman' | 'muscular_man') => void
  gender: Gender
  onCapture: (position: PhotoPosition, file: File) => void
  onRemove: (position: PhotoPosition) => void
}) {
  const positions: { pos: PhotoPosition; label: string }[] = [
    { pos: 'front', label: 'Frente' },
    { pos: 'side', label: 'Perfil' },
    { pos: 'back', label: 'Costas' },
  ]

  const [captureOpen, setCaptureOpen] = useState(false)
  const [capturePos, setCapturePos] = useState<PhotoPosition>('front')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
                    <DSIcon name="camera" size={20} className="text-brand-primary" />
          Fotos de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-muted">Opcional — capture 3 fotos para documentar a evolução.</p>

        <PhotoCaptureModal
          open={captureOpen}
          position={capturePos}
          title={`Capturar — ${positions.find((p) => p.pos === capturePos)?.label || 'Foto'}`}
          onClose={() => setCaptureOpen(false)}
          onCaptured={(file) => onCapture(capturePos, file)}
        />

        {/* Photo grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {positions.map(({ pos, label }) => (
            <MiniPhotoButton
              key={pos}
              label={label}
              photo={photos[pos]}
              onCapture={(f) => onCapture(pos, f)}
              onOpenCamera={() => {
                setCapturePos(pos)
                setCaptureOpen(true)
              }}
              onRemove={() => onRemove(pos)}
            />
          ))}
        </div>

        {/* AI edit option */}
        <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3">
          <p className="mb-2 text-sm font-medium text-text-primary">Edição IA (opcional)</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditPhotosMode('none')}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                editPhotosMode === 'none'
                  ? 'bg-bg-secondary text-text-primary border border-border-light'
                  : 'bg-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Sem edição
            </button>
            <button
              type="button"
              onClick={() => setEditPhotosMode(gender === 'male' ? 'leaner_man' : 'leaner_woman')}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                editPhotosMode.includes('leaner')
                  ? 'bg-info/20 text-info border border-info/30'
                  : 'bg-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Mais magro
            </button>
            {gender === 'male' && (
              <button
                type="button"
                onClick={() => setEditPhotosMode('muscular_man')}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                  editPhotosMode === 'muscular_man'
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Musculoso
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Step 6 — Revisão
// ============================================

function StepReview({
  students, studentId, assessmentDate, weightKg, heightCm,
  gender, age, protocol, currentProtocol, skinfolds, bioData,
  measurements, photos, notes, setNotes, isBioimpedance,
}: {
  students: StudentOption[]; studentId: string; assessmentDate: string
  weightKg: string; heightCm: string; gender: Gender; age: string
  protocol: ProtocolId; currentProtocol: ProtocolInfo | null
  skinfolds: Record<string, string>; bioData: Record<string, string>
  measurements: Record<string, string>
  photos: Partial<Record<PhotoPosition, PhotoData>>
  notes: string; setNotes: (v: string) => void; isBioimpedance: boolean
}) {
  const studentName = students.find((s) => s.id === studentId)?.full_name || '—'
  const filledSkinfolds = Object.entries(skinfolds).filter(([, v]) => v && parseFloat(v) > 0)
  const filledBio = Object.entries(bioData).filter(([, v]) => v && parseFloat(v) > 0)
  const filledMeasures = Object.entries(measurements).filter(([, v]) => v && parseFloat(v) > 0)
  const photoCount = Object.values(photos).filter((p) => p?.file).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
                        <DSIcon name="clipboardList" size={20} className="text-brand-primary" />
            Revisão da Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ReviewItem label="Aluno" value={studentName} />
            <ReviewItem label="Data" value={assessmentDate} />
            <ReviewItem label="Sexo" value={gender === 'male' ? 'Masculino' : 'Feminino'} />
            <ReviewItem label="Idade" value={`${age} anos`} />
            <ReviewItem label="Peso" value={weightKg ? `${weightKg} kg` : '—'} />
            <ReviewItem label="Altura" value={heightCm ? `${heightCm} cm` : '—'} />
            <ReviewItem label="Protocolo" value={currentProtocol?.name || protocol} />
            <ReviewItem
              label="Dados coletados"
              value={
                isBioimpedance
                  ? `${filledBio.length} campo(s) bioimpedância`
                  : `${filledSkinfolds.length} dobra(s) cutânea(s)`
              }
            />
            <ReviewItem label="Medidas" value={`${filledMeasures.length} perímetro(s)`} />
            <ReviewItem label="Fotos" value={`${photoCount} foto(s)`} />
          </div>

          {/* Skinfolds detail */}
          {filledSkinfolds.length > 0 && (
            <div className="rounded-xl bg-bg-tertiary/50 p-3">
              <p className="mb-1.5 text-xs font-medium text-text-muted">Dobras cutâneas (mm)</p>
              <div className="flex flex-wrap gap-2">
                {filledSkinfolds.map(([key, val]) => (
                  <span key={key} className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary">
                    {SKINFOLD_LABELS[key as SkinfoldSite] || key}: {val}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas, recomendações, observações..."
            className="w-full resize-none rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
        </CardContent>
      </Card>

      {/* Info banner */}
      <div className="rounded-xl border border-success/20 bg-success/5 p-3">
        <p className="text-xs text-success">
          Ao salvar, o sistema calculará automaticamente: IMC, % gordura, massa magra, massa gorda,
          massa muscular, massa óssea, TMB, GET, somatotipo, classificações e evolução em relação à avaliação anterior.
        </p>
      </div>
    </div>
  )
}

// ============================================
// Shared Helpers
// ============================================

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-tertiary/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  )
}

function NumField({
  label, value, onChange, placeholder, step,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; step?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-text-primary">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min="0"
        className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
      />
    </div>
  )
}

function MiniPhotoButton({
  label, photo, onCapture, onOpenCamera, onRemove,
}: {
  label: string
  photo?: PhotoData | null
  onCapture: (file: File) => void
  onOpenCamera: () => void
  onRemove: () => void
}) {
  const baseId = `photo-${label.toLowerCase().replace(/\s+/g, '-')}`
  const cameraInputId = `${baseId}-camera`
  const galleryInputId = `${baseId}-gallery`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) onCapture(file)
    e.currentTarget.value = ''
  }

  if (photo?.preview) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-brand-primary/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.preview} alt={label} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-600"
        >
          ×
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 py-1.5 text-xs font-medium text-white">
          {label}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light bg-bg-secondary/50">
                <DSIcon name="camera" className="text-text-muted" />
        <span className="mt-1 text-xs font-medium text-text-muted">{label}</span>
        <span className="mt-1 text-[10px] text-text-muted">Use a guia de alinhamento</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenCamera}
          className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-brand-primary/40 bg-brand-primary/10 px-2 py-1.5 text-[11px] font-medium text-brand-primary transition hover:bg-brand-primary/15"
        >
                    <DSIcon name="camera" size={14} /> Câmera
        </button>

        <label
          htmlFor={galleryInputId}
          className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-border-light bg-bg-secondary px-2 py-1.5 text-[11px] font-medium text-text-primary transition hover:border-brand-primary/40 hover:bg-brand-primary/5"
        >
                    <DSIcon name="images" size={14} /> Galeria
        </label>
      </div>

      <input
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        id={galleryInputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
