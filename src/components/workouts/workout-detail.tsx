/**
 * src/components/workouts/workout-detail.tsx
 *
 * Workout Detail — Client Component
 *
 * Exports: WorkoutDetailClient
 * Hooks: useState, useWorkout, useUpdateWorkout, useDeleteWorkout, useDuplicateWorkout, useExportWorkout
 * Features: 'use client' · DSIcon
 */

// ============================================
// Workout Detail — Client Component
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  useWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
  useDuplicateWorkout,
  useExportWorkout,
  useAssignWorkout,
  useExerciseLibrary,
  type WorkoutExercise,
  type WorkoutLog,
} from '@/hooks/use-workouts'
import { useStudents } from '@/hooks/use-students'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkoutDetailSkeleton } from '@/components/ui/page-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExerciseVideoPlayer } from '@/components/workouts/exercise-video-player'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
  active: { label: 'Ativo', variant: 'success' },
  completed: { label: 'Concluído', variant: 'info' },
  paused: { label: 'Pausado', variant: 'warning' },
  archived: { label: 'Arquivado', variant: 'default' },
}

const feelingConfig: Record<string, { icon: DSIconName; label: string; color: string }> = {
  great: { icon: 'smile', label: 'Ótimo', color: 'text-success' },
  good: { icon: 'smile', label: 'Bom', color: 'text-info' },
  tired: { icon: 'meh', label: 'Cansado', color: 'text-warning' },
  pain: { icon: 'frown', label: 'Com dor', color: 'text-error' },
}

export default function WorkoutDetailClient({ id }: { id: string }) {
  const { data, isLoading } = useWorkout(id)
  const updateWorkout = useUpdateWorkout(id)
  const deleteWorkout = useDeleteWorkout(id)
  const duplicateWorkout = useDuplicateWorkout(id)
  const exportWorkout = useExportWorkout()
  const assignWorkout = useAssignWorkout()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Fetch exercise library to resolve names
  const { data: exerciseLib } = useExerciseLibrary()
  const exerciseMap = new Map(
    (exerciseLib ?? []).map((ex) => [ex.id, ex])
  )

  if (isLoading) {
    return (
      <AuthGuard requiredType="personal">
        <WorkoutDetailSkeleton />
      </AuthGuard>
    )
  }

  if (!data) {
    return (
      <AuthGuard requiredType="personal">
        <div className="py-20 text-center">
          <p className="text-text-muted">Treino não encontrado.</p>
          <Link href="/dashboard/workouts" className="mt-2 text-sm text-brand-primary hover:underline">
            Voltar para treinos
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const { workout, logs } = data
  const status = statusConfig[workout.status] || statusConfig.active

  function handleStatusToggle() {
    const nextStatus = workout.status === 'active' ? 'paused' : 'active'
    updateWorkout.mutate({ status: nextStatus })
    setShowMenu(false)
  }

  function handleComplete() {
    updateWorkout.mutate({ status: 'completed' })
    setShowMenu(false)
  }

  function handleDuplicate() {
    duplicateWorkout.mutate()
    setShowMenu(false)
  }

  function handleDelete() {
    deleteWorkout.mutate()
  }

  function handleShareWhatsApp() {
    const exercises = [...workout.exercises]
      .sort((a, b) => a.order_index - b.order_index)
      .map((ex, i) => {
        const lib = exerciseMap.get(ex.exercise_id)
        const name = lib?.name_pt || ex.exercise_id
        let line = `${i + 1}. *${name}*\n   ${ex.sets}×${ex.reps}`
        if (ex.load) line += ` — ${ex.load}`
        line += ` | Descanso: ${ex.rest_seconds}s`
        if (ex.notes) line += `\n   Obs: ${ex.notes}`
        return line
      })
      .join('\n\n')

    const header = `*${workout.name}*`
    const student = workout.student_name ? `Aluno: ${workout.student_name}` : ''
    const desc = workout.description ? `${workout.description}` : ''
    const count = `${workout.exercises.length} exercício${workout.exercises.length !== 1 ? 's' : ''}`
    const footer = `\n---\n_Gerado por VFIT — vfit.app.br_`

    const parts = [header, student, desc, count, '', exercises, footer].filter(Boolean)
    const text = parts.join('\n')
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setShowMenu(false)
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/workouts"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para treinos
        </Link>

        {/* Header card */}
        <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
              workout.ai_generated ? 'bg-brand-accent/10' : 'bg-brand-primary/10'
            )}>
              {workout.ai_generated ? (
                <DSIcon name="sparkles" className="text-brand-accent" />
              ) : (
                <DSIcon name="dumbbell" className="text-brand-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-text-primary">{workout.name}</h2>
                <Badge variant={status.variant}>{status.label}</Badge>
                {workout.ai_generated && (
                  <Badge variant="info">IA</Badge>
                )}
              </div>
              {workout.description && (
                <p className="mt-1 text-sm text-text-muted">{workout.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <DSIcon name="user" size={14} /> {workout.student_name}
                </span>
                <span className="flex items-center gap-1">
                  <DSIcon name="calendar" size={14} />
                  {new Date(workout.start_date).toLocaleDateString('pt-BR')}
                  {workout.end_date && ` — ${new Date(workout.end_date).toLocaleDateString('pt-BR')}`}
                </span>
                <span className="flex items-center gap-1">
                  <DSIcon name="dumbbell" size={14} />
                  {workout.exercises.length} exercício{workout.exercises.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex gap-2 shrink-0">
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setShowMenu(!showMenu)}>
                <DSIcon name="settings" size={16} />
              </Button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border-light bg-bg-secondary py-1 shadow-lg">
                    <button
                      onClick={handleStatusToggle}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                    >
                      {workout.status === 'active' ? (
                        <><DSIcon name="pause" size={16} className="text-warning" /> Pausar</>
                      ) : (
                        <><DSIcon name="play" size={16} className="text-success" /> Ativar</>
                      )}
                    </button>
                    {workout.status !== 'completed' && (
                      <button
                        onClick={handleComplete}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      >
                        <DSIcon name="checkCircle2" size={16} className="text-info" /> Marcar concluído
                      </button>
                    )}
                    <button
                      onClick={handleDuplicate}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                    >
                      <DSIcon name="copy" size={16} className="text-brand-primary" /> Duplicar
                    </button>
                    <button
                      onClick={() => { setShowAssignModal(true); setShowMenu(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                    >
                      <DSIcon name="userPlus" size={16} className="text-violet-400" /> Atribuir a Aluno
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                    >
                      <DSIcon name="externalLink" size={16} className="text-emerald-500" /> Enviar via WhatsApp
                    </button>
                    <button
                      onClick={() => { exportWorkout.mutate(id); setShowMenu(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                    >
                      <DSIcon name="download" size={16} className="text-brand-accent" /> Exportar JSON
                    </button>
                    <hr className="my-1 border-border-light" />
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                    >
                      <DSIcon name="trash" size={16} /> Excluir permanentemente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-4">
            <div className="flex items-center gap-2">
              <DSIcon name="trash" size={20} className="text-error" />
              <p className="text-sm font-medium text-error">
                Excluir treino permanentemente?
              </p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Esta ação é irreversível. O treino, exercícios e todo o histórico de execuções serão removidos permanentemente.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete} loading={deleteWorkout.isPending}>
                <DSIcon name="trash" size={14} />
                Sim, excluir
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {workout.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{workout.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Exercícios ({workout.exercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {workout.exercises.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">
                Nenhum exercício adicionado.
              </p>
            ) : (
              <div className="space-y-3">
                {[...workout.exercises]
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((exercise, idx) => (
                    <ExerciseRow
                      key={exercise.id}
                      exercise={exercise}
                      index={idx}
                      exerciseMap={exerciseMap}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execução ({logs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <AssignWorkoutModal
            workoutId={id}
            workoutName={workout.name}
            onClose={() => setShowAssignModal(false)}
            onAssign={assignWorkout}
          />
        )}
      </div>
    </AuthGuard>
  )
}

// ============================================
// Exercise Row
// ============================================

function ExerciseRow({
  exercise,
  index,
  exerciseMap,
}: {
  exercise: WorkoutExercise
  index: number
  exerciseMap: Map<string, { name_pt: string; muscle_group_id: string; difficulty: string; thumbnail_url: string | null }>
}) {
  const lib = exerciseMap.get(exercise.exercise_id)
  const name = lib?.name_pt || `Exercício ${exercise.exercise_id.slice(0, 8)}`

  return (
    <div className="rounded-xl border border-border-light bg-bg-primary p-3">
      <div className="flex items-center gap-3">
        {/* Order */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-xs font-bold text-brand-primary">
          {index + 1}
        </div>

        {/* Thumbnail */}
        {lib?.thumbnail_url ? (
          <Image
            src={lib.thumbnail_url}
            alt={name}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
            <DSIcon name="dumbbell" size={16} className="text-text-muted" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{name}</p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{exercise.sets} séries</span>
            <span>×</span>
            <span>{exercise.reps} reps</span>
            {exercise.load && <span>• {exercise.load}</span>}
            <span>• {exercise.rest_seconds}s descanso</span>
          </div>
        </div>

        {/* Notes indicator */}
        {(exercise.notes || exercise.technique_tips) && (
          <div className="shrink-0" title={exercise.notes || exercise.technique_tips || ''}>
            <DSIcon name="alertCircle" size={16} className="text-info" />
          </div>
        )}

        {/* Video button (compact, right side) */}
        <ExerciseVideoPlayer exerciseId={exercise.exercise_id} />
      </div>
    </div>
  )
}

// ============================================
// Log Row
// ============================================

function LogRow({ log }: { log: WorkoutLog }) {
  const feeling = log.feeling ? feelingConfig[log.feeling] : null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-primary p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
        <DSIcon name="checkCircle2" size={16} className="text-success" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {new Date(log.completed_at).toLocaleDateString('pt-BR')}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {log.duration_minutes && (
            <span className="flex items-center gap-1">
              <DSIcon name="clock" size={12} /> {log.duration_minutes} min
            </span>
          )}
          {log.student_notes && (
            <span className="truncate max-w-48">{log.student_notes}</span>
          )}
        </div>
      </div>

      {feeling && (
        <div className={cn('flex items-center gap-1 text-xs', feeling.color)} title={feeling.label}>
          <DSIcon name={feeling.icon} size={16} />
          <span className="hidden sm:inline">{feeling.label}</span>
        </div>
      )}

      <p className="text-[10px] text-text-muted shrink-0">{formatRelativeTime(log.created_at)}</p>
    </div>
  )
}

// ============================================
// Assign Workout Modal — S07-07
// ============================================

function AssignWorkoutModal({
  workoutId,
  workoutName,
  onClose,
  onAssign,
}: {
  workoutId: string
  workoutName: string
  onClose: () => void
  onAssign: ReturnType<typeof useAssignWorkout>
}) {
  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  const { data } = useStudents({ search, per_page: 20 })
  const students = data?.students ?? []

  function handleAssign() {
    if (!selectedStudentId) return
    onAssign.mutate(
      { workoutId, studentId: selectedStudentId, startDate: startDate || undefined, endDate: endDate || undefined },
      { onSuccess: () => onClose() }
    )
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl border border-border-light bg-bg-secondary p-5 shadow-2xl sm:inset-x-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary">Atribuir Treino</h3>
            <p className="text-xs text-text-muted truncate max-w-64">{workoutName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-white/8 hover:text-text-primary">
            <DSIcon name="x" size={16} />
          </button>
        </div>

        {/* Student search */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">Selecionar Aluno</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <DSIcon name="user" size={16} className="text-brand-primary" />
                  <span className="text-sm font-medium text-text-primary">{selectedStudent.full_name}</span>
                </div>
                <button onClick={() => setSelectedStudentId(null)} className="text-text-muted hover:text-text-primary">
                  <DSIcon name="x" size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <DSIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar aluno pelo nome..."
                    className="w-full rounded-xl border border-border-light bg-bg-primary py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
                  />
                </div>
                {students.length > 0 && (
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border-light bg-bg-primary p-1">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStudentId(s.id); setSearch('') }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-white/6"
                      >
                        <DSIcon name="user" size={14} className="text-text-muted shrink-0" />
                        <span className="truncate">{s.full_name}</span>
                        {s.email && <span className="ml-auto text-[10px] text-text-muted truncate max-w-32">{s.email}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Data Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Data Fim (opc.)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Action */}
          <Button
            variant="workout"
            className="w-full"
            onClick={handleAssign}
            disabled={!selectedStudentId || onAssign.isPending}
            loading={onAssign.isPending}
          >
            <DSIcon name="userPlus" size={16} />
            Atribuir Treino
          </Button>
        </div>
      </div>
    </>
  )
}
