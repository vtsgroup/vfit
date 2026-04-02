/**
 * src/components/students/student-detail.tsx
 *
 * Student Detail — Client Component
 *
 * Exports: StudentDetailClient
 * Hooks: useEffect, useMemo, useState, useRouter, useStudent, useUpdateStudentStatus
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Student Detail — Client Component
// ============================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { motion } from 'framer-motion'
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useStudent, useUpdateStudentStatus, useDeleteStudent } from '@/hooks/use-students'
import { useCreatePaymentLink } from '@/hooks/use-payments'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StudentDetailSkeleton } from '@/components/ui/page-skeletons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/stores/app-store'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'default' },
  pending: { label: 'Pendente', variant: 'warning' },
  blocked: { label: 'Bloqueado', variant: 'error' },
}

const paymentConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Atrasado', variant: 'error' },
  free: { label: 'Free', variant: 'default' },
}

export default function StudentDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { data: student, isLoading } = useStudent(id)
  const updateStatus = useUpdateStudentStatus(id)
  const deleteStudent = useDeleteStudent(id)
  const createPaymentLink = useCreatePaymentLink()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [financeOpen, setFinanceOpen] = useState(false)
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Hooks NÃO podem ficar após returns condicionais.
  const waNumber = useMemo(() => {
    const raw = (student?.phone || '').replace(/\D/g, '')
    if (!raw) return ''
    return raw.startsWith('55') ? raw : `55${raw}`
  }, [student?.phone])

  const financial = useMemo(() => {
    const dueIso = student?.next_payment_date
    if (!dueIso) {
      return {
        dueDateLabel: '—',
        dueHuman: '—',
        daysUntilDue: null as number | null,
        daysOverdue: null as number | null,
      }
    }

    const d = new Date(dueIso)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const startOfDue = new Date(d)
    startOfDue.setHours(0, 0, 0, 0)

    const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000)

    return {
      dueDateLabel: d.toLocaleDateString('pt-BR'),
      dueHuman: diffDays === 0 ? 'Hoje' : diffDays > 0 ? `${diffDays} dia${diffDays !== 1 ? 's' : ''}` : 'Vencido',
      daysUntilDue: diffDays > 0 ? diffDays : 0,
      daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
    }
  }, [now, student?.next_payment_date])

  if (isLoading) {
    return (
      <AuthGuard requiredType="personal">
        <StudentDetailSkeleton />
      </AuthGuard>
    )
  }

  if (!student) {
    return (
      <AuthGuard requiredType="personal">
        <div className="py-20 text-center">
          <p className="text-text-muted">Aluno não encontrado.</p>
          <Link href="/dashboard/students" className="mt-2 text-sm text-brand-primary hover:underline">
            Voltar para alunos
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const status = statusConfig[student.status] || statusConfig.pending
  const payment = paymentConfig[student.payment_status] || paymentConfig.pending
  const initials = (student.full_name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  function handleStatusChange(newStatus: string) {
    updateStatus.mutate({ status: newStatus })
    setShowMenu(false)
  }

  function handleDelete() {
    deleteStudent.mutate()
  }

  function openWhatsApp(withMessage: boolean) {
    if (!waNumber) {
      toast.error('Telefone ausente', 'Cadastre um telefone no perfil do aluno para abrir o WhatsApp.')
      return
    }

    if (withMessage) {
      const msg = encodeURIComponent('Olá! Baixe o app VFIT para acompanhar seus treinos: https://iapersonal.app.br/download')
      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank', 'noopener,noreferrer')
      return
    }

    window.open(`https://wa.me/${waNumber}`, '_blank', 'noopener,noreferrer')
  }

  async function handleChargeViaWhatsApp() {
    if (!student) return

    if (!student.monthly_fee || student.monthly_fee <= 0) {
      toast.error('Mensalidade ausente', 'Defina o valor da mensalidade do aluno para gerar o link de cobrança.')
      return
    }

    if (!waNumber) {
      toast.error('Telefone ausente', 'Cadastre um telefone no perfil do aluno para enviar cobrança por WhatsApp.')
      return
    }

    try {
      const response = await createPaymentLink.mutateAsync({
        payer_id: student.id,
        amount: student.monthly_fee,
        payment_method: 'pix',
        description: `Mensalidade de ${student.full_name}`,
        message_template: 'Olá {nome}! Segue o link para pagamento: {link}',
      })

      const link = response.data.whatsapp_url
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer')
      } else {
        toast.success('Cobrança criada', 'Link gerado. Copie da tela de pagamentos para enviar ao aluno.')
      }
    } catch {
      // tratamento centralizado no hook
    }
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="space-y-5">
        {/* Back */}
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para alunos
        </Link>

        {/* Perfil (card topo) */}
        <div className="relative overflow-hidden rounded-2xl border border-border-light bg-bg-secondary p-5">
          {/* Gradient background */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-brand-primary/8 to-transparent" />
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            {/* Avatar with animated ring */}
            <div className={cn(
              'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-lg font-bold text-brand-primary ring-2 transition-shadow duration-500',
              student.status === 'active'
                ? 'ring-success/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : student.status === 'blocked'
                  ? 'ring-error/60'
                  : student.status === 'inactive'
                    ? 'ring-border-light'
                    : 'ring-warning/60'
            )}>
              {student.profile_photo_url ? (
                <Image
                  src={student.profile_photo_url}
                  alt={student.full_name}
                  fill
                  sizes="64px"
                  unoptimized
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-bg-secondary',
                  student.status === 'active'
                    ? 'bg-success shadow-[0_0_10px_rgba(61,252,164,0.45)]'
                    : student.status === 'blocked'
                      ? 'bg-error'
                      : student.status === 'inactive'
                        ? 'bg-text-muted'
                        : 'bg-warning'
                )}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-text-primary">{student.full_name}</h2>
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Badge variant={status.variant} className="text-[11px]">{status.label}</Badge>
                </motion.span>
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Badge variant={payment.variant} className="text-[11px]">
                    <DSIcon name="creditCard" size={12} className="mr-1" /> {payment.label}
                  </Badge>
                </motion.span>
              </div>

              <div className="mt-2 flex flex-col gap-1.5 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 truncate">
                  <DSIcon name="mail" size={14} /> {student.email}
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <DSIcon name="phone" size={14} /> {student.phone || '—'}
                </span>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setShowMenu(!showMenu)}>
                <DSIcon name="settings" size={16} />
              </Button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-border-light bg-bg-secondary py-1 shadow-lg">
                    {student.status !== 'active' && (
                      <button
                        onClick={() => handleStatusChange('active')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      >
                        <DSIcon name="userCheck" size={16} className="text-success" /> Ativar
                      </button>
                    )}
                    {student.status !== 'inactive' && (
                      <button
                        onClick={() => handleStatusChange('inactive')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      >
                        <DSIcon name="userX" size={16} className="text-warning" /> Desativar
                      </button>
                    )}
                    {student.status !== 'blocked' && (
                      <button
                        onClick={() => handleStatusChange('blocked')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      >
                        <DSIcon name="shield" size={16} className="text-error" /> Bloquear
                      </button>
                    )}
                    <hr className="my-1 border-border-light" />
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                    >
                      <DSIcon name="trash" size={16} /> Remover aluno
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="button"
              className="relative min-h-12 w-full overflow-hidden text-sm font-extrabold tracking-wide"
              onClick={() => router.push(`/dashboard/workouts/create?student_id=${encodeURIComponent(id)}`)}
            >
              <DSIcon name="plus" size={16} />
              CRIAR TREINO
              {/* Shimmer overlay */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/15 to-transparent" />
            </Button>
          </div>

          {/* Ações rápidas */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <QuickActionButton
              label="Editar"
              icon={<DSIcon name="edit" size={16} />}
              color="info"
              onClick={() => router.push(`/dashboard/students/edit?id=${encodeURIComponent(id)}`)}
            />
            <QuickActionButton
              label="Enviar App"
              icon={<DSIcon name="send" size={16} />}
              color="brand"
              onClick={() => openWhatsApp(true)}
            />
            <QuickActionButton
              label="Avaliação"
              icon={<DSIcon name="clipboardList" size={16} />}
              color="violet"
              onClick={() => router.push(`/dashboard/students/assessment/new?studentId=${encodeURIComponent(id)}`)}
            />
            <QuickActionButton
              label="WhatsApp"
              icon={<DSIcon name="message" size={16} />}
              color="whatsapp"
              onClick={() => openWhatsApp(false)}
            />
          </div>

          {student.total_workouts_completed === 0 && (
            <div className="mt-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3">
              <p className="text-xs font-semibold text-text-primary">Este aluno ainda não tem treino ativo.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/dashboard/workouts/create?student_id=${encodeURIComponent(id)}`)}
                className="mt-2 w-full uppercase tracking-wide"
              >
                CRIAR TREINO AGORA
              </Button>
            </div>
          )}
        </div>

        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Tem certeza que deseja remover {student.full_name}?
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Esta ação irá desvincular o aluno do seu perfil. O aluno poderá ser convidado novamente.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete} loading={deleteStudent.isPending}>
                Sim, remover
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Cards compactos (2x2) + Financeiro expandível */}
        <div className="grid gap-3 sm:grid-cols-2">
          <CompactCard title="Status do aluno" icon={student.status === 'blocked' ? <DSIcon name="shield" size={16} className="text-error" /> : student.status === 'inactive' ? <DSIcon name="shield" size={16} className="text-text-muted" /> : <DSIcon name="shield" size={16} className="text-success" />}>
            <div className="flex items-center justify-between">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className={cn(
                'h-2 w-2 rounded-full',
                student.status === 'active' ? 'bg-success animate-pulse' : student.status === 'blocked' ? 'bg-error' : 'bg-warning'
              )} />
            </div>
          </CompactCard>

          <button
            onClick={() => setFinanceOpen((v) => !v)}
            className="text-left"
          >
            <CompactCard
              title="Financeiro"
              icon={<DSIcon name="wallet" size={16} className="text-emerald-500" />}
              trailing={
                <DSIcon name="chevronDown" size={16}
                  className={cn('text-text-muted transition-transform', financeOpen ? 'rotate-180' : '')}
                />
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {student.monthly_fee ? formatCurrency(student.monthly_fee) : '—'}
                  </p>
                  <p className="text-[11px] text-text-muted">Vencimento: {financial.dueDateLabel}</p>
                </div>
                <Badge variant={payment.variant} className="text-[11px]">{payment.label}</Badge>
              </div>
            </CompactCard>
          </button>

          {financeOpen && (
            <div className="sm:col-span-2 rounded-2xl border border-border-light bg-bg-secondary p-4">
              <div className="grid gap-2">
                <InfoRow label="Vencimento" value={financial.dueDateLabel} />
                <InfoRow
                  label="Vence em"
                  value={financial.dueHuman}
                  valueClassName={cn(
                    financial.daysOverdue && financial.daysOverdue > 0
                      ? 'text-error'
                      : financial.daysUntilDue != null && financial.daysUntilDue <= 3
                        ? 'text-warning'
                        : ''
                  )}
                />
                {payment.label === 'Atrasado' && financial.daysOverdue != null && financial.daysOverdue > 0 && (
                  <InfoRow label="Dias em atraso" value={`${financial.daysOverdue} dia(s)`} valueClassName="text-error" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info('Em breve', 'Histórico financeiro completo será adicionado no próximo sprint.')
                  }}
                  className="mt-2 w-full"
                >
                  Ver histórico completo →
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    void handleChargeViaWhatsApp()
                  }}
                  loading={createPaymentLink.isPending}
                  className="mt-2 w-full"
                >
                  Cobrar via WhatsApp
                </Button>
              </div>
            </div>
          )}

          <MiniStatCard icon={<DSIcon name="dumbbell" size={16} className="text-brand-primary" />} label="Treinos" value={String(student.total_workouts_completed)} />
          <MiniStatCard icon={<DSIcon name="eye" size={16} className="text-info" />} label="Último acesso" value="—" hint="Em breve" />
          <MiniStatCard icon={<DSIcon name="trophy" size={16} className="text-brand-primary" />} label="Badges" value={String(student.total_badges)} />
          <MiniStatCard icon={<DSIcon name="flame" size={16} className="text-warning" />} label="Streak" value={`${student.current_streak}d`} />
        </div>

        {/* Calendário (full width) */}
        <CalendarCard now={now} />

        {/* Desde */}
        <div className="rounded-2xl border border-border-light bg-bg-secondary p-4">
          <p className="text-xs font-semibold text-text-muted">Desde</p>
          <p className="mt-1 text-lg font-bold text-text-primary">{formatRelativeTime(student.created_at)}</p>
        </div>

        {/* Detalhes (mantidos) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Nível fitness" value={student.fitness_level || '—'} />
              <InfoRow label="Objetivos" value={student.goals?.join(', ') || '—'} />
              <InfoRow label="Restrições médicas" value={student.medical_restrictions || 'Nenhuma'} />
              <InfoRow label="Gênero" value={student.gender || '—'} />
              <InfoRow
                label="Nascimento"
                value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('pt-BR') : '—'}
              />
              <InfoRow label="Altura" value={student.height_cm ? `${student.height_cm} cm` : '—'} />
              <InfoRow label="Frequência treino" value={student.training_frequency ? `${student.training_frequency}x/sem` : '—'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow
                label="Mensalidade"
                value={student.monthly_fee ? formatCurrency(student.monthly_fee) : '—'}
              />
              <InfoRow
                label="Último pagamento"
                value={student.last_payment_date ? new Date(student.last_payment_date).toLocaleDateString('pt-BR') : '—'}
              />
              <InfoRow
                label="Próximo pagamento"
                value={student.next_payment_date ? new Date(student.next_payment_date).toLocaleDateString('pt-BR') : '—'}
              />
              <InfoRow
                label="Convidado em"
                value={student.invited_at ? new Date(student.invited_at).toLocaleDateString('pt-BR') : '—'}
              />
              <InfoRow
                label="Aceito em"
                value={student.accepted_at ? new Date(student.accepted_at).toLocaleDateString('pt-BR') : '—'}
              />
              <InfoRow label="Maior streak" value={`${student.longest_streak} dias`} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

function QuickActionButton({
  label,
  icon,
  onClick,
  color,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  color: 'brand' | 'info' | 'violet' | 'warning' | 'whatsapp'
}) {
  const styles = {
    brand: 'border-brand-primary/25 bg-brand-primary/10 text-brand-primary',
    info: 'border-info/25 bg-info/10 text-info',
    violet: 'border-violet-500/25 bg-violet-500/10 text-violet-400',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    whatsapp: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  }[color]

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center',
        styles
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 dark:bg-white/10">
        {icon}
      </div>
      <span className="text-[10px] font-semibold leading-none">
        {label}
      </span>
    </motion.button>
  )
}

function CompactCard({
  title,
  icon,
  trailing,
  children,
}: {
  title: string
  icon: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/10">
            {icon}
          </div>
          <p className="text-xs font-semibold text-text-muted">{title}</p>
        </div>
        {trailing}
      </div>
      <div className="mt-3">
        {children}
      </div>
    </div>
  )
}

function MiniStatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-bg-secondary p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/10">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-text-muted">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-text-primary">{value}</p>
            {hint && <p className="text-[10px] font-semibold text-text-muted">{hint}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  const isEmpty = value === '—' || value === '-' || !value
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={cn(
        'text-xs font-semibold',
        isEmpty ? 'italic text-text-muted' : 'text-text-primary',
        valueClassName
      )}>
        {isEmpty ? 'Não informado' : value}
      </span>
    </div>
  )
}

function CalendarCard({ now }: { now: Date }) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const today = now.getDate()
  const m = now.getMonth()
  const y = now.getFullYear()
  const firstDay = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="rounded-2xl border border-border-light bg-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Calendário</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {days[now.getDay()]}, {today} de {months[m]} {y}
          </p>
        </div>
        <div className="text-lg font-bold text-brand-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {days.map((d) => (
          <div key={d} className="py-1 text-[10px] font-semibold text-text-muted">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const isToday = day === today
          return (
            <div
              key={`${i}-${day ?? 'x'}`}
              className={cn(
                'py-1 text-[11px]',
                day ? 'text-text-muted' : 'text-transparent',
                isToday ? 'rounded-lg bg-brand-primary text-bg-dark font-bold shadow-[0_0_10px_rgba(61,252,164,0.35)]' : ''
              )}
            >
              {day ?? ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
