/**
 * src/app/dashboard/workouts/create/page.tsx
 *
 * Create Workout Page — /dashboard/workouts/create
 *
 * Exports: CreateWorkoutPage
 * Hooks: useState, useMemo, useEffect, useCallback, useSearchParams, useSensor
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Create Workout Page — /dashboard/workouts/create
// Com integração IA para geração automática de treinos
// ============================================

'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { useStudents } from '@/hooks/use-students'
import {
  useCreateWorkout,
  useCreateWorkoutRaw,
  useUploadWorkoutCover,
  useExerciseLibrary,
  type CreateWorkoutInput,
  type D1Exercise,
} from '@/hooks/use-workouts'
import { useGenerateWorkout } from '@/hooks/use-ai'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MD3Input, MD3TextArea } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { StyledSelect } from '@/components/ui/styled-select'
import { toast } from '@/stores/app-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { motion, AnimatePresence } from 'framer-motion'

interface SelectedExercise {
  exercise_id: string
  name: string
  sets: number
  reps: string
  rest_seconds: number
  load: string
  notes: string
  order_index: number
}

export default function CreateWorkoutPage() {
  const searchParams = useSearchParams()
    const router = useRouter()
  const preselectedExerciseId = (searchParams.get('exercise_id') || '').trim()
  const preselectedStudentId = (searchParams.get('student_id') || '').trim()
  const isLockedToStudent = !!preselectedStudentId

  const [step, setStep] = useState(1)
  const [isTemplate, setIsTemplate] = useState(false)
  const [form, setForm] = useState({
    student_id: preselectedStudentId,
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  })
  const [exercises, setExercises] = useState<SelectedExercise[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [showQuickTemplates, setShowQuickTemplates] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')

  // AI states
  const [showAIModal, setShowAIModal] = useState(false)

  useScrollLock(showPicker || showAIModal)

  const [aiGoal, setAiGoal] = useState('')
  const [aiComplexity, setAiComplexity] = useState<'low' | 'medium' | 'high'>('low')
  const [aiDaysPerWeek, setAiDaysPerWeek] = useState(3)
  const [aiSplitType, setAiSplitType] = useState<'auto' | 'abc' | 'upper_lower' | 'push_pull_legs' | 'full_body'>('auto')
  const [aiExtraInstructions, setAiExtraInstructions] = useState('')
  const [aiResult, setAiResult] = useState<Array<{
    name: string
    description: string
    exercises: Array<{
      exercise_id: string
      sets: number
      reps: string
      rest_seconds: number
      load: string
      notes: string
      order_index: number
    }>
  }> | null>(null)
  const [selectedAIWorkoutIdx, setSelectedAIWorkoutIdx] = useState(0)
  const [didApplyPreselectedExercise, setDidApplyPreselectedExercise] = useState(false)

  const { data: studentsData } = useStudents({ per_page: 100 })
  const students = studentsData?.students ?? []
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === form.student_id),
    [students, form.student_id]
  )

  const { data: exerciseLib } = useExerciseLibrary({ search: exerciseSearch || undefined })
  const availableExercises = exerciseLib ?? []

  const { data: allExercises } = useExerciseLibrary({})
  const exerciseMap = useMemo(() => {
    const map = new Map<string, D1Exercise>()
    for (const ex of allExercises ?? []) {
      map.set(ex.id, ex)
    }
    return map
  }, [allExercises])

  const createWorkout = useCreateWorkout()
  const generateWorkout = useGenerateWorkout()
    const createWorkoutRaw = useCreateWorkoutRaw()
    const uploadCover = useUploadWorkoutCover()
    const coverInputRef = useRef<HTMLInputElement>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)

    function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return
      setCoverFile(file)
      const url = URL.createObjectURL(file)
      setCoverPreview(url)
    }

    function handleCoverRemove() {
      setCoverFile(null)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }

  useEffect(() => {
    if (!preselectedStudentId) return
    setIsTemplate(false)
    setForm((prev) => (prev.student_id === preselectedStudentId ? prev : { ...prev, student_id: preselectedStudentId }))
  }, [preselectedStudentId])

  useEffect(() => {
    if (!preselectedExerciseId || didApplyPreselectedExercise) return

    const exercise = exerciseMap.get(preselectedExerciseId)
    if (!exercise) return

    if (!exercises.some((item) => item.exercise_id === preselectedExerciseId)) {
      const newExercise: SelectedExercise = {
        exercise_id: exercise.id,
        name: exercise.name_pt || exercise.name,
        sets: 3,
        reps: '12',
        rest_seconds: 60,
        load: '',
        notes: '',
        order_index: exercises.length,
      }
      setExercises((prev) => [...prev, newExercise])
      setShowPicker(false)
      setExerciseSearch('')
      if (step === 1) setStep(2)
    }

    setDidApplyPreselectedExercise(true)
  }, [
    preselectedExerciseId,
    didApplyPreselectedExercise,
    exerciseMap,
    exercises,
    step,
  ])

  function updateField(field: string, value: string) {
    if (isLockedToStudent && field === 'student_id') return
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const templateMode = !isLockedToStudent && isTemplate

  const step1Valid = templateMode
    ? form.name && form.start_date
    : form.student_id && form.name && form.start_date

  function addExercise(exercise: D1Exercise) {
    const newExercise: SelectedExercise = {
      exercise_id: exercise.id,
      name: exercise.name_pt || exercise.name,
      sets: 3,
      reps: '12',
      rest_seconds: 60,
      load: '',
      notes: '',
      order_index: exercises.length,
    }
    setExercises((prev) => [...prev, newExercise])
    setShowPicker(false)
    setExerciseSearch('')
  }

  function removeExercise(index: number) {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order_index: i }))
    )
  }

  function updateExercise(index: number, field: keyof SelectedExercise, value: string | number) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    )
  }

  function moveExercise(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === exercises.length - 1) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    setExercises((prev) => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[newIndex]
      copy[newIndex] = temp
      return copy.map((ex, i) => ({ ...ex, order_index: i }))
    })
  }

  // ============================================
  // Drag-and-drop (S07-01)
  // ============================================
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const exerciseIds = useMemo(
    () => exercises.map((ex) => ex.exercise_id),
    [exercises]
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setExercises((prev) => {
      const oldIndex = prev.findIndex((ex) => ex.exercise_id === active.id)
      const newIndex = prev.findIndex((ex) => ex.exercise_id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex).map((ex, i) => ({
        ...ex,
        order_index: i,
      }))
    })
  }, [])

  // ============================================
  // AI Generation
  // ============================================

  async function handleAIGenerate() {
    if (!templateMode && !form.student_id) {
      toast.error('Selecione um aluno primeiro')
      return
    }
    if (!aiGoal.trim()) {
      toast.error('Informe o objetivo do treino')
      return
    }

    try {
      const result = await generateWorkout.mutateAsync({
        student_id: form.student_id || undefined,
        goal: aiGoal.trim(),
        complexity: aiComplexity,
        days_per_week: aiDaysPerWeek,
        split_type: aiSplitType,
        extra_instructions: aiExtraInstructions || undefined,
      })

      if (result.workout?.workouts && result.workout.workouts.length > 0) {
        setAiResult(result.workout.workouts)
        setSelectedAIWorkoutIdx(0)
        toast.success(`IA gerou ${result.workout.workouts.length} treino(s)! Revise e escolha.`)
      } else if (result.workout?.raw_response) {
        toast.error('IA retornou formato inesperado. Tente novamente.')
      } else {
        toast.error('Resposta da IA vazia. Tente novamente.')
      }
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao gerar treino com IA')
    }
  }

  function applyAIWorkout(workoutIdx: number) {
    if (!aiResult || !aiResult[workoutIdx]) return

    const aiWorkout = aiResult[workoutIdx]

    setForm((prev) => ({
      ...prev,
      name: aiWorkout.name,
      description: aiWorkout.description || '',
    }))

    const newExercises: SelectedExercise[] = aiWorkout.exercises.map((ex, i) => {
      const d1Exercise = exerciseMap.get(ex.exercise_id)
      return {
        exercise_id: ex.exercise_id,
        name: d1Exercise?.name_pt || d1Exercise?.name || ex.exercise_id,
        sets: ex.sets || 3,
        reps: ex.reps || '12',
        rest_seconds: ex.rest_seconds || 60,
        load: ex.load || '',
        notes: ex.notes || '',
        order_index: i,
      }
    })

    setExercises(newExercises)
    setShowAIModal(false)
    setAiResult(null)
    setStep(2)
    toast.success(`Treino "${aiWorkout.name}" aplicado! Revise e ajuste antes de salvar.`)
  }

  function handleSubmit() {
    if (!step1Valid) return

    const data: CreateWorkoutInput = {
      student_id: templateMode ? undefined : form.student_id,
      is_template: templateMode || undefined,
      name: form.name,
      description: form.description || undefined,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      notes: form.notes || undefined,
      exercises: exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        load: ex.load || undefined,
        notes: ex.notes || undefined,
        order_index: ex.order_index,
      })),
    }

      createWorkoutRaw.mutateAsync(data).then(async (res) => {
        const workoutId = res?.data?.workout?.id ?? (res as { workout?: { id: string } })?.workout?.id
        if (coverFile && workoutId) {
          try {
            await uploadCover.mutateAsync({ workoutId, file: coverFile })
          } catch {
            // capa é opcional, não bloqueia
          }
        }
        toast.success('Treino criado com sucesso!')
      }).catch(() => {
        // erro já tratado pelo hook
      }).finally(() => {
        router.push('/dashboard/workouts')
      })
    }

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        <Link
          href="/dashboard/workouts"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para treinos
        </Link>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-text-primary">
                {templateMode ? 'Criar Template' : 'Criar Treino'}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {step === 1
                  ? (templateMode ? 'Treino template para o marketplace' : 'Informações básicas do treino')
                  : step === 2
                    ? 'Adicione e ajuste os exercícios'
                    : 'Revise tudo antes de salvar'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAIModal(true)}
              className="gap-2 border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50"
            >
              <DSIcon name="sparkles" size={16} />
              Gerar com IA
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <div className={cn('h-1 flex-1 rounded-full', step >= 1 ? 'bg-brand-primary' : 'bg-bg-tertiary')} />
            <div className={cn('h-1 flex-1 rounded-full', step >= 2 ? 'bg-brand-primary' : 'bg-bg-tertiary')} />
            <div className={cn('h-1 flex-1 rounded-full', step >= 3 ? 'bg-brand-primary' : 'bg-bg-tertiary')} />
          </div>
        </div>

        {step === 1 && (
          <div className="rounded-xl border border-border-light bg-bg-secondary p-6 space-y-4">
            {!isLockedToStudent && (
              <>
                {/* Tipo de treino: Aluno vs Marketplace */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Destino do treino</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsTemplate(false); updateField('student_id', '') }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        !templateMode
                          ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                          : 'border-border-light bg-bg-primary hover:border-border-light/80'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        !templateMode ? 'bg-brand-primary/20' : 'bg-bg-tertiary'
                      )}>
                        <DSIcon name="user" size={20} className={cn(!templateMode ? 'text-brand-primary' : 'text-text-muted')} />
                      </div>
                      <div className="text-center">
                        <p className={cn('text-sm font-semibold', !templateMode ? 'text-brand-primary' : 'text-text-primary')}>
                          Para Aluno
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Treino vinculado a um aluno específico
                        </p>
                      </div>
                      {!templateMode && (
                        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                          <DSIcon name="check" size={12} className="text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsTemplate(true); updateField('student_id', '') }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        templateMode
                          ? 'border-purple-500 bg-purple-500/5 shadow-sm'
                          : 'border-border-light bg-bg-primary hover:border-border-light/80'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        templateMode ? 'bg-purple-500/20' : 'bg-bg-tertiary'
                      )}>
                        <DSIcon name="shoppingBag" size={20} className={cn(templateMode ? 'text-purple-400' : 'text-text-muted')} />
                      </div>
                      <div className="text-center">
                        <p className={cn('text-sm font-semibold', templateMode ? 'text-purple-400' : 'text-text-primary')}>
                          Para Marketplace
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Template para vender no marketplace
                        </p>
                      </div>
                      {templateMode && (
                        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                          <DSIcon name="check" size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {templateMode && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-sm text-purple-300">
                <p className="font-medium">Treino Template para Marketplace</p>
                <p className="mt-1 text-xs text-text-muted">
                  Este treino não será vinculado a nenhum aluno. Você poderá usá-lo para criar planos de treino no marketplace e vendê-los.
                </p>
              </div>
            )}

            {isLockedToStudent && (
              <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/8 p-3">
                <p className="text-xs font-semibold text-brand-primary">Aluno pré-selecionado (travado)</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {selectedStudent?.full_name || 'Aluno selecionado'}
                </p>
                <p className="text-xs text-text-muted">{selectedStudent?.email || form.student_id}</p>
              </div>
            )}

            {!templateMode && !isLockedToStudent && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Aluno *</label>
                <StyledSelect
                  value={form.student_id}
                  onChange={(v) => updateField('student_id', v)}
                  options={[
                    { value: '', label: 'Selecione o aluno' },
                    ...students.map((s) => ({ value: s.id, label: s.full_name })),
                  ]}
                />
              </div>
            )}

            <Input
              label="Nome do treino *"
              placeholder="Treino A — Superior"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />

            <Input
              label="Descrição (opcional)"
              placeholder="Descrição do treino..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Data início *"
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                required
              />
              <Input
                label="Data fim (opcional)"
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
              />
            </div>

            <Input
              label="Observações (opcional)"
              placeholder="Notas para o aluno..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />

              {/* ─── Cover image (optional) ─── */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">
                  Imagem de capa <span className="text-text-muted font-normal">(opcional)</span>
                </label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverSelect}
                />
                {coverPreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-border-light">
                    <Image
                      src={coverPreview}
                      alt="Capa do treino"
                      width={600}
                      height={200}
                      className="h-32 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <DSIcon name="pencil" size={12} />
                        Trocar
                      </button>
                      <button
                        type="button"
                        onClick={handleCoverRemove}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-red-500 transition-colors"
                      >
                        <DSIcon name="trash" size={12} />
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-light bg-bg-primary text-text-muted transition-all hover:border-brand-primary/50 hover:bg-brand-primary/3 hover:text-brand-primary"
                  >
                    <DSIcon name="image" size={20} />
                    <span className="text-sm font-medium">Adicionar imagem de capa</span>
                  </button>
                )}
              </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!step1Valid}>
                Próximo: Exercícios
                <DSIcon name="arrowRight" size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-light bg-bg-secondary p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">
                  Exercícios ({exercises.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQuickTemplates(true)}
                    className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <DSIcon name="shoppingBag" size={14} />
                    Templates
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAIModal(true)}
                    className="gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                  >
                    <DSIcon name="sparkles" size={14} />
                    IA
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
                    <DSIcon name="plus" size={16} />
                    Manual
                  </Button>
                </div>
              </div>

              {exercises.length === 0 ? (
                <div className="py-8 text-center">
                  <DSIcon name="dumbbell" size={40} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-muted">
                    Nenhum exercício adicionado.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => setShowAIModal(true)}
                      variant="assessment"
                      className="gap-1.5"
                    >
                      <DSIcon name="sparkles" size={16} />
                      Gerar com IA
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
                      <DSIcon name="plus" size={16} />
                      Adicionar manual
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {exercises.map((exercise, idx) => (
                        <SortableExerciseFormRow
                          key={exercise.exercise_id}
                          exercise={exercise}
                          index={idx}
                          total={exercises.length}
                          onUpdate={updateExercise}
                          onRemove={removeExercise}
                          onMove={moveExercise}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <DSIcon name="arrowLeft" size={16} />
                Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={exercises.length === 0}
              >
                <DSIcon name="eye" size={16} />
                Preview
                <DSIcon name="arrowRight" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <WorkoutPreview
            form={form}
            exercises={exercises}
            templateMode={templateMode}
            selectedStudent={selectedStudent}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={createWorkout.isPending || createWorkoutRaw.isPending || uploadCover.isPending}
          />
        )}

        {showPicker && (
          <ExercisePicker
            exercises={availableExercises}
            search={exerciseSearch}
            onSearchChange={setExerciseSearch}
            onSelect={addExercise}
            onClose={() => { setShowPicker(false); setExerciseSearch('') }}
            selectedIds={exercises.map((e) => e.exercise_id)}
          />
        )}

        {showQuickTemplates && (
          <QuickTemplatesModal
            exerciseMap={exerciseMap}
            onApply={(templateExercises) => {
              setExercises(templateExercises)
              setShowQuickTemplates(false)
              toast.success('Template aplicado! Ajuste séries/cargas conforme necessário.')
            }}
            onClose={() => setShowQuickTemplates(false)}
          />
        )}

        {showAIModal && (
          <AIGenerateModal
            hasStudent={!!form.student_id || templateMode}
            aiGoal={aiGoal}
            onGoalChange={setAiGoal}
            aiComplexity={aiComplexity}
            onComplexityChange={setAiComplexity}
            aiDaysPerWeek={aiDaysPerWeek}
            onDaysChange={setAiDaysPerWeek}
            aiSplitType={aiSplitType}
            onSplitChange={setAiSplitType}
            aiExtraInstructions={aiExtraInstructions}
            onExtraChange={setAiExtraInstructions}
            isGenerating={generateWorkout.isPending}
            onGenerate={handleAIGenerate}
            onClose={() => { setShowAIModal(false); setAiResult(null) }}
            onResetResult={() => setAiResult(null)}
            aiResult={aiResult}
            selectedIdx={selectedAIWorkoutIdx}
            onSelectIdx={setSelectedAIWorkoutIdx}
            onApply={applyAIWorkout}
            exerciseMap={exerciseMap}
          />
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Workout Preview (Step 3) — S07-08
// ============================================

function WorkoutPreview({
  form,
  exercises,
  templateMode,
  selectedStudent,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  form: { student_id: string; name: string; description: string; start_date: string; end_date: string; notes: string }
  exercises: SelectedExercise[]
  templateMode: boolean
  selectedStudent: { full_name: string; email: string } | undefined
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0)
  const totalRestMinutes = Math.round(exercises.reduce((acc, e) => acc + e.rest_seconds * e.sets, 0) / 60)
  const estimatedMinutes = totalRestMinutes + totalSets * 1

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="rounded-2xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/5 to-transparent p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-primary">{form.name || 'Sem nome'}</h3>
            {form.description && (
              <p className="mt-1 text-sm text-text-muted">{form.description}</p>
            )}
          </div>
          {templateMode ? (
            <span className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
              <DSIcon name="shoppingBag" size={12} />
              Template
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary border border-brand-primary/20">
              <DSIcon name="user" size={12} />
              Aluno
            </span>
          )}
        </div>

        {/* Meta stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-center">
            <DSIcon name="dumbbell" size={20} className="mx-auto text-brand-primary" />
            <p className="mt-1 text-lg font-bold text-text-primary">{exercises.length}</p>
            <p className="text-[10px] text-text-muted">Exercícios</p>
          </div>
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-center">
            <DSIcon name="flame" size={20} className="mx-auto text-yellow-400" />
            <p className="mt-1 text-lg font-bold text-text-primary">{totalSets}</p>
            <p className="text-[10px] text-text-muted">Séries totais</p>
          </div>
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-center">
            <DSIcon name="clock" size={20} className="mx-auto text-cyan-400" />
            <p className="mt-1 text-lg font-bold text-text-primary">~{estimatedMinutes}min</p>
            <p className="text-[10px] text-text-muted">Estimativa</p>
          </div>
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-center">
            <DSIcon name="dumbbell" size={20} className="mx-auto text-emerald-400" />
            <p className="mt-1 text-lg font-bold text-text-primary">
              {exercises.filter(e => e.load).length}/{exercises.length}
            </p>
            <p className="text-[10px] text-text-muted">Com carga</p>
          </div>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap gap-3 text-xs text-text-muted">
          {!templateMode && selectedStudent && (
            <span className="flex items-center gap-1">
              <DSIcon name="user" size={12} /> {selectedStudent.full_name}
            </span>
          )}
          <span>Início: {new Date(form.start_date).toLocaleDateString('pt-BR')}</span>
          {form.end_date && (
            <span>🏁 Fim: {new Date(form.end_date).toLocaleDateString('pt-BR')}</span>
          )}
        </div>

        {form.notes && (
          <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3">
            <p className="text-xs font-medium text-text-muted">Observações</p>
            <p className="mt-1 text-sm text-text-secondary">{form.notes}</p>
          </div>
        )}
      </div>

      {/* Exercise List (Read-Only) */}
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-3">
        <h4 className="font-semibold text-text-primary flex items-center gap-2">
          <DSIcon name="dumbbell" size={16} className="text-brand-primary" />
          Exercícios do Treino
        </h4>

        <div className="space-y-2">
          {exercises.map((exercise, idx) => (
            <div
              key={`preview-${exercise.exercise_id}-${idx}`}
              className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-primary p-3 transition-colors"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{exercise.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="font-medium text-brand-primary">{exercise.sets}×{exercise.reps}</span>
                  {exercise.load && (
                    <span className="rounded bg-black/8 dark:bg-white/8 px-1.5 py-0.5">{exercise.load}</span>
                  )}
                  <span className="text-text-muted/60">{exercise.rest_seconds}s descanso</span>
                </div>
              </div>
              {exercise.notes && (
                <span className="shrink-0 text-[10px] text-text-muted/50" title={exercise.notes}>Obs</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <DSIcon name="arrowLeft" size={16} />
          Editar Exercícios
        </Button>
        <Button
          variant="workout"
          size="lg"
          onClick={onSubmit}
          loading={isSubmitting}
          className="gap-2"
        >
          <DSIcon name="check" size={20} />
          {templateMode ? 'Criar Template' : 'Criar Treino'}
        </Button>
      </div>
    </div>
  )
}

// ============================================
// AI Generate Modal
// ============================================

function AIGenerateModal({
  hasStudent,
  aiGoal,
  onGoalChange,
  aiComplexity,
  onComplexityChange,
  aiDaysPerWeek,
  onDaysChange,
  aiSplitType,
  onSplitChange,
  aiExtraInstructions,
  onExtraChange,
  isGenerating,
  onGenerate,
  onClose,
  onResetResult,
  aiResult,
  selectedIdx,
  onSelectIdx,
  onApply,
  exerciseMap,
}: {
  hasStudent: boolean
  aiGoal: string
  onGoalChange: (v: string) => void
  aiComplexity: 'low' | 'medium' | 'high'
  onComplexityChange: (v: 'low' | 'medium' | 'high') => void
  aiDaysPerWeek: number
  onDaysChange: (v: number) => void
  aiSplitType: 'auto' | 'abc' | 'upper_lower' | 'push_pull_legs' | 'full_body'
  onSplitChange: (v: 'auto' | 'abc' | 'upper_lower' | 'push_pull_legs' | 'full_body') => void
  aiExtraInstructions: string
  onExtraChange: (v: string) => void
  isGenerating: boolean
  onGenerate: () => void
  onClose: () => void
  onResetResult: () => void
  aiResult: Array<{
    name: string
    description: string
    exercises: Array<{
      exercise_id: string
      sets: number
      reps: string
      rest_seconds: number
      load: string
      notes: string
      order_index: number
    }>
  }> | null
  selectedIdx: number
  onSelectIdx: (v: number) => void
  onApply: (idx: number) => void
  exerciseMap: Map<string, D1Exercise>
}) {
  const complexityOptions = [
    { value: 'low' as const, label: 'Simples', desc: 'Iniciantes, treinos básicos', iconColor: 'bg-emerald-400' },
    { value: 'medium' as const, label: 'Moderado', desc: 'Intermediários, periodização', iconColor: 'bg-amber-400' },
    { value: 'high' as const, label: 'Avançado', desc: 'Avançados, análise completa', iconColor: 'bg-red-400' },
  ]

  const splitOptions = [
    { value: 'auto' as const, label: 'Automático', desc: 'IA escolhe o melhor' },
    { value: 'abc' as const, label: 'ABC', desc: 'A/B/C clássico' },
    { value: 'upper_lower' as const, label: 'Upper/Lower', desc: 'Superior/Inferior' },
    { value: 'push_pull_legs' as const, label: 'PPL', desc: 'Push/Pull/Legs' },
    { value: 'full_body' as const, label: 'Full Body', desc: 'Corpo inteiro' },
  ]

  const goalPresets = [
    'Hipertrofia muscular',
    'Emagrecimento e definição',
    'Força e potência',
    'Condicionamento e resistência',
    'Saúde e bem-estar geral',
    'Reabilitação e prevenção de lesões',
  ]

  return (
    <>
      <div className="fixed inset-0 z-999999 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed inset-0 z-999999 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-purple-500/20 bg-bg-secondary shadow-xl flex flex-col"
        >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 bg-linear-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <DSIcon name="sparkles" size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Gerar Treino com IA</h3>
              <p className="text-xs text-text-muted">
                A IA usa 145 exercícios reais para montar treinos personalizados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <DSIcon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {!aiResult ? (
            <>
              {!hasStudent && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-400">
                  Selecione um aluno no Step 1 antes de gerar com IA
                </div>
              )}

              {/* Goal */}
              <div className="space-y-2">
                <MD3Input
                  label="Objetivo do treino *"
                  placeholder="Ex: Hipertrofia muscular com foco em membros superiores"
                  value={aiGoal}
                  onChange={(e) => onGoalChange(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5">
                  {goalPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onGoalChange(preset)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs transition-colors',
                        aiGoal === preset
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-bg-tertiary text-text-muted hover:text-text-primary hover:bg-bg-primary border border-transparent'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days per week */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Dias por semana: <span className="text-purple-400 font-bold">{aiDaysPerWeek}x</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => onDaysChange(d)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                        aiDaysPerWeek === d
                          ? 'bg-purple-500 text-white'
                          : 'bg-bg-tertiary text-text-muted hover:bg-bg-primary hover:text-text-primary'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tipo de divisão</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {splitOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSplitChange(opt.value)}
                      className={cn(
                        'rounded-lg border p-2.5 text-left transition-colors',
                        aiSplitType === opt.value
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-border-light bg-bg-primary hover:border-border-light/80'
                      )}
                    >
                      <p className={cn(
                        'text-sm font-medium',
                        aiSplitType === opt.value ? 'text-purple-400' : 'text-text-primary'
                      )}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Complexidade da IA</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {complexityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onComplexityChange(opt.value)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-colors',
                        aiComplexity === opt.value
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-border-light bg-bg-primary hover:border-border-light/80'
                      )}
                    >
                      <p className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                        <span className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', opt.iconColor)} />
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-text-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra instructions */}
              <div className="space-y-2">
                <MD3TextArea
                  label="Instruções extras (opcional)"
                  placeholder="Ex: Evitar exercícios com barra, foco em máquinas..."
                  value={aiExtraInstructions}
                  onChange={(e) => onExtraChange(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
            // === AI Result Preview ===
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <DSIcon name="flame" size={16} className="text-success" />
                <span className="text-success font-medium">
                  IA gerou {aiResult.length} treino(s)!
                </span>
                <span className="text-text-muted">Selecione um para aplicar:</span>
              </div>

              {/* Workout tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {aiResult.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectIdx(i)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                      selectedIdx === i
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-border-light bg-bg-primary text-text-muted hover:text-text-primary'
                    )}
                  >
                    {w.name}
                  </button>
                ))}
              </div>

              {/* Selected workout preview */}
              {aiResult[selectedIdx] && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border-light bg-bg-primary p-4">
                    <h4 className="font-semibold text-text-primary">{aiResult[selectedIdx].name}</h4>
                    <p className="mt-1 text-sm text-text-muted">{aiResult[selectedIdx].description}</p>
                  </div>

                  <div className="space-y-2">
                    {aiResult[selectedIdx].exercises.map((ex, i) => {
                      const d1Ex = exerciseMap.get(ex.exercise_id)
                      return (
                        <div key={i} className="rounded-xl border border-border-light bg-bg-primary p-3 flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-purple-500/10 text-xs font-bold text-purple-400">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {d1Ex?.name_pt || ex.exercise_id}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                              <span>{ex.sets} séries</span>
                              <span>•</span>
                              <span>{ex.reps} reps</span>
                              <span>•</span>
                              <span>{ex.rest_seconds}s descanso</span>
                              {ex.load && (
                                <>
                                  <span>•</span>
                                  <span>{ex.load}</span>
                                </>
                              )}
                            </div>
                            {ex.notes && (
                              <p className="mt-1 text-xs text-text-muted italic">{ex.notes}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 flex justify-between">
          {!aiResult ? (
            <>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button
                onClick={onGenerate}
                disabled={!hasStudent || !aiGoal.trim() || isGenerating}
                variant="assessment"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <DSIcon name="loader" size={16} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <DSIcon name="sparkles" size={16} />
                    Gerar Treino
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onResetResult}>
                <DSIcon name="arrowLeft" size={16} />
                Voltar e ajustar
              </Button>
              <Button
                onClick={() => onApply(selectedIdx)}
                className="gap-2"
              >
                <DSIcon name="check" size={16} />
                Aplicar este treino
              </Button>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

// ============================================
// Sortable Exercise Form Row (DnD wrapper)
// ============================================

function SortableExerciseFormRow(props: {
  exercise: SelectedExercise
  index: number
  total: number
  onUpdate: (index: number, field: keyof SelectedExercise, value: string | number) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.exercise.exercise_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ExerciseFormRow
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

// ============================================
// Exercise Form Row
// ============================================

function ExerciseFormRow({
  exercise,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  dragHandleProps,
  isDragging,
}: {
  exercise: SelectedExercise
  index: number
  total: number
  onUpdate: (index: number, field: keyof SelectedExercise, value: string | number) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: 'up' | 'down') => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}) {
  return (
    <div className={cn(
      'rounded-xl border border-border-light bg-bg-primary p-3 space-y-2 transition-shadow',
      isDragging && 'shadow-lg shadow-black/30 ring-1 ring-brand-primary/30'
    )}>
      <div className="flex items-center gap-2">
        {/* Drag handle — touch-friendly */}
        <button
          type="button"
          className="flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded text-text-muted hover:text-text-primary active:cursor-grabbing"
          {...dragHandleProps}
        >
          <DSIcon name="gripVertical" size={16} />
        </button>
        <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-primary/10 text-xs font-bold text-brand-primary">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-text-primary truncate">{exercise.name}</p>
        <button onClick={() => onRemove(index)} className="text-text-muted hover:text-error">
          <DSIcon name="trash" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <label className="text-[10px] font-medium text-text-muted">Séries</label>
          <input
            type="number"
            min={1}
            max={50}
            value={exercise.sets}
            onChange={(e) => onUpdate(index, 'sets', parseInt(e.target.value) || 1)}
            className="w-full rounded-xl border border-border-light bg-bg-secondary px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-muted">Reps</label>
          <input
            type="text"
            placeholder="12"
            value={exercise.reps}
            onChange={(e) => onUpdate(index, 'reps', e.target.value)}
            className="w-full rounded-xl border border-border-light bg-bg-secondary px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-muted">Carga</label>
          <input
            type="text"
            placeholder="20kg"
            value={exercise.load}
            onChange={(e) => onUpdate(index, 'load', e.target.value)}
            className="w-full rounded-xl border border-border-light bg-bg-secondary px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-muted">Descanso (s)</label>
          <input
            type="number"
            min={0}
            max={600}
            value={exercise.rest_seconds}
            onChange={(e) => onUpdate(index, 'rest_seconds', parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-border-light bg-bg-secondary px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          />
        </div>
      </div>

      {exercise.notes && (
        <div className="mt-1">
          <label className="text-[10px] font-medium text-text-muted">Observação</label>
          <input
            type="text"
            value={exercise.notes}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className="w-full rounded-xl border border-border-light bg-bg-secondary px-2 py-1.5 text-xs text-text-muted focus:border-brand-primary focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// Quick Templates Modal — S07-05
// Pre-configured workout templates
// ============================================

interface QuickTemplate {
  id: string
  name: string
  icon: string
  description: string
  split: string
  color: string
  exercises: Array<{
    nameSearch: string
    sets: number
    reps: string
    rest_seconds: number
    load: string
  }>
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'abc-a',
    name: 'Treino A — Peito + Tríceps',
    icon: 'A',
    description: 'ABC Split · Peito e tríceps com empurrar',
    split: 'ABC',
    color: 'blue',
    exercises: [
      { nameSearch: 'bench press', sets: 4, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'incline bench press', sets: 3, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'dumbbell fly', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'cable crossover', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'triceps pushdown', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'overhead triceps extension', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
    ],
  },
  {
    id: 'abc-b',
    name: 'Treino B — Costas + Bíceps',
    icon: 'B',
    description: 'ABC Split · Costas e bíceps com puxar',
    split: 'ABC',
    color: 'emerald',
    exercises: [
      { nameSearch: 'lat pulldown', sets: 4, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'barbell row', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'seated cable row', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'face pull', sets: 3, reps: '15', rest_seconds: 60, load: '' },
      { nameSearch: 'barbell curl', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'hammer curl', sets: 3, reps: '12', rest_seconds: 60, load: '' },
    ],
  },
  {
    id: 'abc-c',
    name: 'Treino C — Pernas + Ombros',
    icon: 'C',
    description: 'ABC Split · Pernas completo + deltóides',
    split: 'ABC',
    color: 'violet',
    exercises: [
      { nameSearch: 'squat', sets: 4, reps: '8-10', rest_seconds: 120, load: '' },
      { nameSearch: 'leg press', sets: 4, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'leg extension', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'leg curl', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'calf raise', sets: 4, reps: '15-20', rest_seconds: 45, load: '' },
      { nameSearch: 'shoulder press', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'lateral raise', sets: 3, reps: '12-15', rest_seconds: 45, load: '' },
    ],
  },
  {
    id: 'ppl-push',
    name: 'Push — Peito + Ombros + Tríceps',
    icon: 'push',
    description: 'Push/Pull/Legs · Dia de empurrar',
    split: 'PPL',
    color: 'rose',
    exercises: [
      { nameSearch: 'bench press', sets: 4, reps: '6-8', rest_seconds: 120, load: '' },
      { nameSearch: 'shoulder press', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'incline dumbbell press', sets: 3, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'lateral raise', sets: 3, reps: '12-15', rest_seconds: 45, load: '' },
      { nameSearch: 'triceps pushdown', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'overhead triceps extension', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
    ],
  },
  {
    id: 'ppl-pull',
    name: 'Pull — Costas + Bíceps',
    icon: 'pull',
    description: 'Push/Pull/Legs · Dia de puxar',
    split: 'PPL',
    color: 'cyan',
    exercises: [
      { nameSearch: 'deadlift', sets: 4, reps: '5-6', rest_seconds: 180, load: '' },
      { nameSearch: 'lat pulldown', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'barbell row', sets: 3, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'face pull', sets: 3, reps: '15', rest_seconds: 60, load: '' },
      { nameSearch: 'barbell curl', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'hammer curl', sets: 3, reps: '12', rest_seconds: 45, load: '' },
    ],
  },
  {
    id: 'ppl-legs',
    name: 'Legs — Pernas completo',
    icon: 'legs',
    description: 'Push/Pull/Legs · Dia de pernas',
    split: 'PPL',
    color: 'amber',
    exercises: [
      { nameSearch: 'squat', sets: 4, reps: '6-8', rest_seconds: 180, load: '' },
      { nameSearch: 'leg press', sets: 4, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'leg extension', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'leg curl', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'hip thrust', sets: 3, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'calf raise', sets: 4, reps: '15-20', rest_seconds: 45, load: '' },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body — Superiores',
    icon: 'upper',
    description: 'Upper/Lower · Todos os superiores',
    split: 'Upper/Lower',
    color: 'indigo',
    exercises: [
      { nameSearch: 'bench press', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'barbell row', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'shoulder press', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'lat pulldown', sets: 3, reps: '10-12', rest_seconds: 60, load: '' },
      { nameSearch: 'barbell curl', sets: 2, reps: '12', rest_seconds: 45, load: '' },
      { nameSearch: 'triceps pushdown', sets: 2, reps: '12', rest_seconds: 45, load: '' },
    ],
  },
  {
    id: 'lower',
    name: 'Lower Body — Inferiores',
    icon: 'lower',
    description: 'Upper/Lower · Pernas + core',
    split: 'Upper/Lower',
    color: 'teal',
    exercises: [
      { nameSearch: 'squat', sets: 4, reps: '8-10', rest_seconds: 120, load: '' },
      { nameSearch: 'romanian deadlift', sets: 4, reps: '8-10', rest_seconds: 90, load: '' },
      { nameSearch: 'leg press', sets: 3, reps: '10-12', rest_seconds: 90, load: '' },
      { nameSearch: 'leg curl', sets: 3, reps: '12-15', rest_seconds: 60, load: '' },
      { nameSearch: 'calf raise', sets: 4, reps: '15-20', rest_seconds: 45, load: '' },
      { nameSearch: 'plank', sets: 3, reps: '45s', rest_seconds: 45, load: '' },
    ],
  },
]

const SPLIT_COLORS: Record<string, string> = {
  ABC: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PPL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Upper/Lower': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

function QuickTemplatesModal({
  exerciseMap,
  onApply,
  onClose,
}: {
  exerciseMap: Map<string, D1Exercise>
  onApply: (exercises: SelectedExercise[]) => void
  onClose: () => void
}) {
  const [selectedSplit, setSelectedSplit] = useState<string | null>(null)

  // Build lookup: lowercase name → D1Exercise
  const nameLookup = useMemo(() => {
    const map = new Map<string, D1Exercise>()
    for (const ex of exerciseMap.values()) {
      map.set(ex.name.toLowerCase(), ex)
      // Also partial match
      const words = ex.name.toLowerCase().split(' ')
      if (words.length > 1) {
        map.set(words.slice(0, 2).join(' '), ex)
      }
    }
    return map
  }, [exerciseMap])

  function findExercise(searchName: string): D1Exercise | undefined {
    const lower = searchName.toLowerCase()
    // Exact match
    for (const ex of exerciseMap.values()) {
      if (ex.name.toLowerCase() === lower) return ex
    }
    // Partial/contains match
    for (const ex of exerciseMap.values()) {
      if (ex.name.toLowerCase().includes(lower)) return ex
    }
    return nameLookup.get(lower)
  }

  function applyTemplate(template: QuickTemplate) {
    const result: SelectedExercise[] = []
    for (let i = 0; i < template.exercises.length; i++) {
      const t = template.exercises[i]
      const d1 = findExercise(t.nameSearch)
      if (d1) {
        result.push({
          exercise_id: d1.id,
          name: d1.name_pt || d1.name,
          sets: t.sets,
          reps: t.reps,
          load: t.load,
          rest_seconds: t.rest_seconds,
          order_index: i,
          notes: '',
        })
      }
    }
    if (result.length === 0) {
      toast.error('Nenhum exercício encontrado. Carregue a biblioteca primeiro.')
      return
    }
    onApply(result)
  }

  const splits = ['ABC', 'PPL', 'Upper/Lower']
  const filteredTemplates = selectedSplit
    ? QUICK_TEMPLATES.filter(t => t.split === selectedSplit)
    : QUICK_TEMPLATES

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      >
        <div className="max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-border-light bg-bg-secondary shadow-2xl sm:rounded-2xl">
          {/* Drag handle mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-black/20 dark:bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Templates Prontos</h2>
              <p className="text-xs text-text-muted">Selecione um template para preencher automaticamente</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-black/8 dark:hover:bg-white/8"
            >
              <DSIcon name="x" size={16} />
            </button>
          </div>

          {/* Split filter */}
          <div className="flex gap-2 px-5 pb-3">
            <button
              onClick={() => setSelectedSplit(null)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                !selectedSplit
                  ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                  : 'border-border-light bg-bg-primary text-text-muted hover:text-text-primary'
              )}
            >
              Todos
            </button>
            {splits.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSplit(s === selectedSplit ? null : s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  s === selectedSplit
                    ? SPLIT_COLORS[s]
                    : 'border-border-light bg-bg-primary text-text-muted hover:text-text-primary'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <div className="space-y-2 px-5 pb-5">
            {filteredTemplates.map(template => {
              const matched = template.exercises.filter(t => findExercise(t.nameSearch)).length
              const total = template.exercises.length

              return (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border-light bg-bg-primary p-3 text-left transition-all hover:border-brand-primary/30 hover:bg-brand-primary/5 active:scale-[0.98]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    {template.icon === 'push' && <DSIcon name="dumbbell" size={20} />}
                    {template.icon === 'pull' && <DSIcon name="rotateCcw" size={20} />}
                    {template.icon === 'legs' && <DSIcon name="footprints" size={20} />}
                    {template.icon === 'upper' && <DSIcon name="arrowUp" size={20} />}
                    {template.icon === 'lower' && <DSIcon name="arrowDown" size={20} />}
                    {['A', 'B', 'C'].includes(template.icon) && <span className="text-sm font-bold">{template.icon}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">{template.name}</p>
                    <p className="text-xs text-text-muted">{template.description}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">
                      {matched}/{total} exercícios disponíveis · {template.exercises.reduce((a, e) => a + e.sets, 0)} séries total
                    </p>
                  </div>
                  <Badge className={cn('border text-[10px]', SPLIT_COLORS[template.split])}>
                    {template.split}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div className="h-2 sm:h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </motion.div>
    </>
  )
}

// ============================================
// Exercise Picker Modal
// ============================================

function ExercisePicker({
  exercises,
  search,
  onSearchChange,
  onSelect,
  onClose,
  selectedIds,
}: {
  exercises: D1Exercise[]
  search: string
  onSearchChange: (v: string) => void
  onSelect: (exercise: D1Exercise) => void
  onClose: () => void
  selectedIds: string[]
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, D1Exercise[]>()
    exercises.forEach((ex) => {
      const group = ex.muscle_group_id || 'outro'
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push(ex)
    })
    return map
  }, [exercises])

  const groupLabels: Record<string, string> = {
    chest: 'Peito',
    back: 'Costas',
    shoulders: 'Ombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    forearms: 'Antebraços',
    quadriceps: 'Quadríceps',
    hamstrings: 'Posteriores',
    glutes: 'Glúteos',
    calves: 'Panturrilhas',
    abs: 'Abdominais',
    obliques: 'Oblíquos',
    traps: 'Trapézio',
    core: 'Core',
    'full-body': 'Corpo Inteiro',
    adductors: 'Adutores',
    abductors: 'Abdutores',
    'lower-back': 'Lombar',
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="fixed inset-x-4 top-20 bottom-20 z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-border-light bg-bg-secondary shadow-xl flex flex-col"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
          <h3 className="font-semibold text-text-primary">Adicionar Exercício</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <DSIcon name="x" size={20} />
          </button>
        </div>

        <div className="border-b border-border-light px-4 py-3">
          <MD3Input
            label="Buscar exercício"
            placeholder="Buscar exercício..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            leadingIcon={<DSIcon name="search" size={16} />}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {exercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Nenhum exercício encontrado.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([groupId, groupExercises]) => (
              <div key={groupId} className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {groupLabels[groupId] || groupId}
                </p>
                <div className="space-y-1">
                  {groupExercises.map((exercise) => {
                    const isSelected = selectedIds.includes(exercise.id)
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => onSelect(exercise)}
                        disabled={isSelected}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          isSelected
                            ? 'bg-brand-primary/5 text-text-muted cursor-not-allowed'
                            : 'hover:bg-bg-primary text-text-primary'
                        )}
                      >
                        {exercise.thumbnail_url ? (
                          <Image
                            src={exercise.thumbnail_url}
                            alt={exercise.name_pt || exercise.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-bg-tertiary">
                            <DSIcon name="dumbbell" size={14} className="text-text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{exercise.name_pt || exercise.name}</p>
                          <div className="flex gap-1">
                            <Badge variant="default" className="text-[9px]">{exercise.difficulty}</Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <DSIcon name="check" size={16} className="text-brand-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
