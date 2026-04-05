/**
 * src/app/dashboard/nutrition-assessments/page.tsx
 *
 * Nutrition Assessments — Nutritionist's assessment management
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

interface NutritionAssessment {
  id: string
  patient_name: string
  assessment_date: string
  weight_kg: number | null
  height_cm: number | null
  bmi: number | null
  body_fat_percentage: number | null
  waist_cm: number | null
  hip_cm: number | null
  waist_hip_ratio: number | null
  created_at: string
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Abaixo', color: 'text-blue-400' }
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' }
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-400' }
  return { label: 'Obesidade', color: 'text-red-400' }
}

export default function NutritionAssessmentsPage() {
  const router = useRouter()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['nutritionist-assessments', search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      return api.get<{ data: NutritionAssessment[]; total: number }>(`/nutritionist/assessments?${params}`).then((r) => r.data)
    },
    enabled: isReady,
  })

  const assessments = (data as unknown as { data: NutritionAssessment[] })?.data || []

  return (
    <AuthGuard requiredType="nutritionist">
      <PageHeader
        title="Avaliações Nutricionais"
        description="Acompanhamento antropométrico e composição corporal dos pacientes"
        icon="activity"
      />

      {/* Actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <DSIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-lg border border-white/10 bg-bg-tertiary pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary/30 focus:outline-none"
          />
        </div>
        <Button size="sm" onClick={() => router.push('/dashboard/nutrition-assessments/new')}>
          <DSIcon name="plus" size={14} className="mr-1" />
          Nova Avaliação
        </Button>
      </div>

      {/* Assessments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary shimmer" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
            <DSIcon name="activity" size={28} className="text-violet-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary">Nenhuma avaliação</h3>
            <p className="mt-1 text-sm text-text-muted">Registre avaliações nutricionais para acompanhar a evolução</p>
          </div>
          <Button onClick={() => router.push('/dashboard/nutrition-assessments/new')}>
            <DSIcon name="plus" size={16} className="mr-1.5" />
            Registrar Avaliação
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => (
            <button
              key={assessment.id}
              onClick={() => router.push(`/dashboard/nutrition-assessments/${assessment.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-bg-secondary p-4 text-left transition-colors hover:bg-bg-tertiary"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <DSIcon name="activity" size={18} className="text-violet-400" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{assessment.patient_name}</p>
                <p className="text-xs text-text-muted">{formatDate(assessment.assessment_date)}</p>
              </div>

              {/* Key metrics */}
              <div className="hidden gap-4 sm:flex">
                {assessment.weight_kg && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">{assessment.weight_kg}</p>
                    <p className="text-[10px] text-text-muted">kg</p>
                  </div>
                )}
                {assessment.bmi && (
                  <div className="text-center">
                    <p className={cn('text-sm font-bold', getBMICategory(assessment.bmi).color)}>
                      {assessment.bmi.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-text-muted">IMC</p>
                  </div>
                )}
                {assessment.body_fat_percentage && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-amber-400">{assessment.body_fat_percentage}%</p>
                    <p className="text-[10px] text-text-muted">% Gord</p>
                  </div>
                )}
                {assessment.waist_hip_ratio && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-400">{assessment.waist_hip_ratio.toFixed(2)}</p>
                    <p className="text-[10px] text-text-muted">C/Q</p>
                  </div>
                )}
              </div>

              <DSIcon name="chevronRight" size={16} className="shrink-0 text-text-muted" />
            </button>
          ))}
        </div>
      )}
    </AuthGuard>
  )
}
