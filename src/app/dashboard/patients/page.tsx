/**
 * src/app/dashboard/patients/page.tsx
 *
 * Patients Management — Nutritionist's patient list
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth'
import { PageHeader } from '@/components/ui/page-header'
import { useAuthStore } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { cn, formatDate } from '@/lib/utils'

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'userCheck' as const },
  inactive: { label: 'Inativo', color: 'text-zinc-400', bg: 'bg-zinc-500/10', icon: 'userMinus' as const },
  blocked: { label: 'Bloqueado', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'userX' as const },
  churned: { label: 'Desistiu', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'userX' as const },
}

interface Patient {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: keyof typeof STATUS_CONFIG
  total_meal_plans: number
  total_assessments: number
  created_at: string
}

export default function PatientsPage() {
  const router = useRouter()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')

  const { data, isLoading } = useQuery({
    queryKey: ['nutritionist-patients', statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      return api.get<{ data: Patient[]; total: number }>(`/nutritionist/patients?${params}`).then((r) => r.data)
    },
    enabled: isReady,
  })

  const patients = (data as unknown as { data: Patient[] })?.data || []

  return (
    <AuthGuard requiredType="nutritionist">
      <PageHeader
        title="Pacientes"
        description="Gerencie seus pacientes e acompanhamentos"
        icon="users"
      />

      {/* Actions bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['active', 'inactive', 'blocked'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <DSIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 rounded-lg border border-white/10 bg-bg-tertiary pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary/30 focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={() => router.push('/dashboard/patients/new')}>
            <DSIcon name="plus" size={14} className="mr-1" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Patient list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary shimmer" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
            <DSIcon name="users" size={28} className="text-brand-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary">Nenhum paciente</h3>
            <p className="mt-1 text-sm text-text-muted">Adicione seu primeiro paciente para começar</p>
          </div>
          <Button onClick={() => router.push('/dashboard/patients/new')}>
            <DSIcon name="plus" size={16} className="mr-1.5" />
            Adicionar Paciente
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => {
            const statusCfg = STATUS_CONFIG[patient.status] || STATUS_CONFIG.active
            return (
              <button
                key={patient.id}
                onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-bg-secondary p-4 text-left transition-colors hover:bg-bg-tertiary"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                  {patient.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{patient.full_name}</p>
                    <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', statusCfg.bg, statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {patient.email || patient.phone || 'Sem contato'}
                    {' · '}
                    Desde {formatDate(patient.created_at)}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden gap-4 sm:flex">
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">{patient.total_meal_plans}</p>
                    <p className="text-[10px] text-text-muted">Planos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">{patient.total_assessments}</p>
                    <p className="text-[10px] text-text-muted">Avaliações</p>
                  </div>
                </div>

                <DSIcon name="chevronRight" size={16} className="shrink-0 text-text-muted" />
              </button>
            )
          })}
        </div>
      )}
    </AuthGuard>
  )
}
