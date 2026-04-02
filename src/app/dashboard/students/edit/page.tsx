/**
 * src/app/dashboard/students/edit/page.tsx
 *
 * Student Edit Page — /dashboard/students/edit?id=xxx
 *
 * Exports: StudentEditPage
 * Hooks: useEffect, useMemo, useState, useSearchParams, useRouter, useStudent
 * Features: 'use client' · DSIcon
 */

// ============================================
// Student Edit Page — /dashboard/students/edit?id=xxx
// Rota estática compatível com output: "export".
// ============================================

'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { Input } from '@/components/ui/input'
import { MD3Input, MD3TextArea } from '@/components/ui/md3-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StyledSelect } from '@/components/ui/styled-select'
import { cn } from '@/lib/utils'
import { useStudent, useUpdateStudent, useUpdateStudentUser, useUpdateStudentStatus } from '@/hooks/use-students'
import { StudentDetailSkeleton } from '@/components/ui/page-skeletons'

function StudentEditContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id') ?? ''

  const { data: student, isLoading } = useStudent(id)
  const updateStudent = useUpdateStudent(id)
  const updateUser = useUpdateStudentUser(id)
  const updateStatus = useUpdateStudentStatus(id)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [heightCm, setHeightCm] = useState('')
  const [dob, setDob] = useState('')
  const [goals, setGoals] = useState('')
  const [medical, setMedical] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<string>('')

  useEffect(() => {
    if (!student) return
    setFullName(student.full_name || '')
    setPhone(student.phone || '')
    setFitnessLevel(student.fitness_level || '')
    setGender(student.gender || '')
    setHeightCm(student.height_cm != null ? String(student.height_cm) : '')
    setDob(student.date_of_birth || '')
    setGoals(Array.isArray(student.goals) ? student.goals.join(', ') : '')
    setMedical(student.medical_restrictions || '')
    setPaymentStatus(student.payment_status || '')
  }, [student])

  const saving = updateStudent.isPending || updateUser.isPending || updateStatus.isPending

  const statusBadge = useMemo(() => {
    const s = student?.status || 'pending'
    const cfg: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
      active: { label: 'Ativo', variant: 'success' },
      inactive: { label: 'Inativo', variant: 'default' },
      blocked: { label: 'Bloqueado', variant: 'error' },
      pending: { label: 'Pendente', variant: 'warning' },
      churned: { label: 'Churned', variant: 'default' },
    }
    return cfg[s] || cfg.pending
  }, [student?.status])

  if (!id) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">ID do aluno não informado.</p>
        <Link href="/dashboard/students" className="mt-2 inline-block text-sm text-brand-primary hover:underline">
          Voltar para alunos
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <StudentDetailSkeleton />
  }

  if (!student) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-muted">Aluno não encontrado.</p>
        <Link href="/dashboard/students" className="mt-2 inline-block text-sm text-brand-primary hover:underline">
          Voltar para alunos
        </Link>
      </div>
    )
  }

  async function handleSave() {
    // 1) Dados base (users)
    await new Promise<void>((resolve) => {
      updateUser.mutate(
        {
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
        },
        {
          onSettled: () => resolve(),
        }
      )
    })

    // 2) Dados do student (students)
    const goalsArr = goals
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10)

    await new Promise<void>((resolve) => {
      updateStudent.mutate(
        {
          fitness_level: fitnessLevel || undefined,
          gender: gender || undefined,
          height_cm: heightCm ? Number(heightCm) : undefined,
          date_of_birth: dob || undefined,
          goals: goalsArr.length ? goalsArr : undefined,
          medical_restrictions: medical.trim() || undefined,
          payment_status: paymentStatus || undefined,
        },
        {
          onSettled: () => resolve(),
        }
      )
    })

    router.push(`/dashboard/students/view?id=${encodeURIComponent(id)}`)
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/students/view?id=${encodeURIComponent(id)}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar
        </Link>
        <Badge variant={statusBadge.variant} className="text-[11px]">
          {statusBadge.label}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border-light bg-bg-secondary p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
            <DSIcon name="userRound" className="text-brand-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight text-text-primary">Editar aluno</h1>
            <p className="text-xs text-text-muted">Atualize dados básicos e preferências.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome do aluno"
          />
          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Nível fitness</label>
              <StyledSelect
                value={fitnessLevel}
                onChange={setFitnessLevel}
                options={[
                  { value: '', label: '—' },
                  { value: 'beginner', label: 'Iniciante' },
                  { value: 'intermediate', label: 'Intermediário' },
                  { value: 'advanced', label: 'Avançado' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Gênero</label>
              <StyledSelect
                value={gender}
                onChange={setGender}
                options={[
                  { value: '', label: '—' },
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Feminino' },
                  { value: 'other', label: 'Outro' },
                  { value: 'prefer_not_to_say', label: 'Prefiro não dizer' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Altura (cm)"
              type="number"
              min="50"
              max="300"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="170"
            />
            <Input
              label="Nascimento (YYYY-MM-DD)"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="1995-03-15"
            />
          </div>

          <MD3Input
            label="Objetivos (separar por vírgula)"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Hipertrofia, Emagrecimento"
          />

          <MD3TextArea
            label="Restrições médicas"
            value={medical}
            onChange={(e) => setMedical(e.target.value)}
            placeholder="Ex: dor lombar, lesão no joelho..."
            rows={3}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Status de pagamento</label>
            <StyledSelect
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                { value: '', label: '—' },
                { value: 'paid', label: 'Pago' },
                { value: 'pending', label: 'Pendente' },
                { value: 'overdue', label: 'Atrasado' },
                { value: 'exempt', label: 'Isento' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => updateStatus.mutate({ status: 'active' })}
              disabled={saving || student.status === 'active'}
              className={cn(student.status === 'active' ? 'opacity-70' : '')}
            >
              Ativar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateStatus.mutate({ status: 'blocked' })}
              disabled={saving || student.status === 'blocked'}
              className={cn(student.status === 'blocked' ? 'opacity-70' : '')}
            >
              Bloquear
            </Button>
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            loading={saving}
            onClick={() => void handleSave()}
          >
            <DSIcon name="save" size={16} />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function StudentEditPage() {
  return (
    <AuthGuard requiredType="personal">
      <Suspense fallback={<StudentDetailSkeleton />}>
        <StudentEditContent />
      </Suspense>
    </AuthGuard>
  )
}
