/**
 * src/components/ai/workout-generator.tsx
 *
 * WorkoutGenerator — Multi-step AI workout creation
 *
 * Exports: WorkoutGenerator
 * Hooks: useState, useStudents, useGenerateWorkout
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// WorkoutGenerator — Multi-step AI workout creation
// ============================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { useStudents } from '@/hooks/use-students'
import { useGenerateWorkout } from '@/hooks/use-ai'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Step = 'student' | 'config' | 'result'
type Complexity = 'low' | 'medium' | 'high'

const GOALS = [
  'Hipertrofia muscular',
  'Emagrecimento',
  'Condicionamento físico',
  'Força máxima',
  'Resistência muscular',
  'Funcional',
  'Reabilitação',
  'Manutenção',
]

const COMPLEXITY_OPTIONS: Array<{ value: Complexity; label: string; description: string }> = [
  { value: 'low', label: 'Simples', description: 'Treino básico, direto ao ponto' },
  { value: 'medium', label: 'Moderado', description: 'Treino intermediário com variações' },
  { value: 'high', label: 'Completo', description: 'Treino avançado com periodização' },
]

export function WorkoutGenerator() {
  const [step, setStep] = useState<Step>('student')
  const [studentId, setStudentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [goal, setGoal] = useState('')
  const [complexity, setComplexity] = useState<Complexity>('medium')
  const [extraInstructions, setExtraInstructions] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: students, isLoading: studentsLoading } = useStudents()
  const studentList = students?.students ?? []
  const generateWorkout = useGenerateWorkout()

  const handleGenerate = () => {
    generateWorkout.mutate(
      {
        student_id: studentId,
        goal,
        complexity,
        extra_instructions: extraInstructions || undefined,
      },
      { onSuccess: () => setStep('result') }
    )
  }

  const handleCopy = () => {
    const text = JSON.stringify(generateWorkout.data?.workout, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {(['student', 'config', 'result'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
              step === s
                ? 'bg-brand-primary text-zinc-950'
                : i < ['student', 'config', 'result'].indexOf(step)
                  ? 'bg-brand-primary/20 text-brand-primary'
                  : 'bg-bg-tertiary text-text-muted'
            )}>
              {i + 1}
            </div>
            {i < 2 && <DSIcon name="chevronRight" size={16} className="text-text-muted" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Student */}
        {step === 'student' && (
          <motion.div
            key="student"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-text-primary">Selecione o aluno</h2>
            
            {studentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-bg-tertiary" />
                ))}
              </div>
            ) : studentList.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {studentList.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setStudentId(student.id)
                      setStudentName(student.full_name)
                      setStep('config')
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                      studentId === student.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-light bg-bg-secondary hover:border-brand-primary/30'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{student.full_name}</p>
                      <p className="text-xs text-text-muted">
                        {student.fitness_level || 'Nível não definido'}
                        {student.goals?.length ? ` · ${student.goals[0]}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border-light bg-bg-secondary p-8 text-center">
                <DSIcon name="dumbbell" size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">Nenhum aluno cadastrado. Convide alunos primeiro.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Configure */}
        {step === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                {studentName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{studentName}</p>
                <p className="text-xs text-text-muted">Configurar treino</p>
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Objetivo</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      goal === g
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-border-light text-text-muted hover:border-brand-primary/30'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Complexidade</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {COMPLEXITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setComplexity(opt.value)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all',
                      complexity === opt.value
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-light bg-bg-secondary hover:border-brand-primary/30'
                    )}
                  >
                    <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                    <p className="mt-1 text-xs text-text-muted">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Extra instructions */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Instruções adicionais <span className="text-text-muted">(opcional)</span>
              </label>
              <textarea
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="Ex: Focar em membros superiores, evitar exercícios de impacto..."
                rows={3}
                className="w-full rounded-xl border border-border-light bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('student')}
              >
                Voltar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!goal}
                loading={generateWorkout.isPending}
              >
                <DSIcon name="sparkles" size={16} />
                {generateWorkout.isPending ? 'Gerando...' : 'Gerar Treino'}
              </Button>
            </div>

            {generateWorkout.isError && (
              <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
                <DSIcon name="alertCircle" size={20} className="shrink-0" />
                {generateWorkout.error?.message || 'Erro ao gerar treino. Tente novamente.'}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && generateWorkout.data && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DSIcon name="sparkles" size={20} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Treino Gerado</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? <DSIcon name="check" size={14} className="text-brand-primary" /> : <DSIcon name="copy" size={14} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                  {generateWorkout.data.complexity}
                </span>
                <span className="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-muted">
                  {generateWorkout.data.model_used}
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
                {typeof generateWorkout.data.workout === 'string'
                  ? generateWorkout.data.workout
                  : JSON.stringify(generateWorkout.data.workout, null, 2)}
              </pre>
            </div>

            <Button
              variant="outline"
              onClick={() => { setStep('config'); generateWorkout.reset() }}
            >
              Gerar outro treino
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
