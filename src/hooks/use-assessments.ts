/**
 * src/hooks/use-assessments.ts
 *
 * Assessments hooks — TanStack Query
 *
 * Exports: Measurements, AssessmentPhoto, StoryKpisBucket, StoryKpisResponse, Skinfolds
 * Hooks: useMutation, useQuery, useQueryClient, useRouter, useAuthStore, useAssessments
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Assessments hooks — TanStack Query
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

// ============================================
// Types
// ============================================

export interface Measurements {
  chest?: number
  waist?: number
  hips?: number
  right_arm?: number
  left_arm?: number
  right_thigh?: number
  left_thigh?: number
  right_calf?: number
  left_calf?: number
  right_forearm?: number
  left_forearm?: number
  shoulders?: number
  neck?: number
  [key: string]: number | undefined
}

export interface AssessmentPhoto {
  type: 'front' | 'back' | 'side_left' | 'side_right' | 'custom'
  url: string
  order: number
}

export interface StoryKpisBucket {
  story_open: number
  story_play: number
  story_pause: number
  story_complete: number
  story_share: number
  story_export: number
  story_cta_click: number
  completion_rate: number
  share_rate: number
  cta_rate: number
}

export interface StoryKpisResponse {
  window_days: number
  today: StoryKpisBucket
  last_7_days: StoryKpisBucket
  previous_7_days: StoryKpisBucket
  all_time: StoryKpisBucket
}

// Skinfold data (dobras cutâneas em mm)
export interface Skinfolds {
  triceps?: number
  chest?: number
  axillary?: number
  subscapular?: number
  suprailiac?: number
  abdominal?: number
  thigh?: number
  biceps?: number
}

// Bioimpedância
export interface BioimpedanceData {
  fatPercentage?: number
  muscleMassKg?: number
  boneMassKg?: number
  waterPercentage?: number
  visceralFatLevel?: number
  metabolicAge?: number
  basalMetabolicRate?: number
}

// Protocol types
export type ProtocolId =
  | 'pollock_7'
  | 'pollock_3_male'
  | 'pollock_3_female'
  | 'petroski_7'
  | 'deurenberg'
  | 'guedes_male'
  | 'guedes_female'
  | 'faulkner'
  | 'bioimpedance'

export type DensityFormula = 'siri' | 'brozek'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female'

export interface ProtocolInfo {
  id: ProtocolId
  name: string
  author: string
  year: number
  gender: 'male' | 'female' | 'both'
  skinfoldCount: number
  requiredSkinfolds: string[]
  description: string
}

export interface AssessmentListItem {
  id: string
  student_id: string
  student_name: string
  assessment_date: string
  weight_kg: number | null
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  bmi: number | null
  fat_classification: string | null
  protocol: string | null
  photo_count: number
  created_at: string
}

export interface AssessmentDetail {
  id: string
  student_id: string | null
  personal_id: string
  student_name: string | null
  assessment_date: string
  weight_kg: number | null
  height_cm: number | null
  bmi: number | null
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  measurements: Measurements | null
  photos: AssessmentPhoto[]
  notes: string | null
  ai_analysis?: {
    feedback?: {
      summary: string
      strengths: string[]
      improvements: string[]
    }
    edited_photos?: Array<{ type: string; original_url: string; edited_url: string; style?: 'leaner_man' | 'leaner_woman' | 'muscular_man' }>
  }
  created_at: string
  updated_at: string

  // Assessment 2.0
  protocol: ProtocolId | null
  protocol_version: string | null
  density_formula: string | null
  skinfolds: Skinfolds | null
  body_density: number | null
  fat_mass_kg: number | null
  lean_mass_kg: number | null
  lean_mass_percentage: number | null
  muscle_mass_percentage: number | null
  bone_mass_kg: number | null
  residual_mass_kg: number | null
  sum_of_skinfolds: number | null
  bmi_classification: string | null
  fat_classification: string | null
  waist_hip_ratio: number | null
  waist_hip_classification: string | null
  waist_risk: string | null
  ideal_weight_kg: number | null
  weight_to_lose_kg: number | null
  basal_metabolic_rate: number | null
  total_daily_expenditure: number | null
  somatotype: string | null
  water_percentage: number | null
  visceral_fat_level: number | null
  metabolic_age: number | null
  ai_interpretation: string | null
  body_composition: Record<string, unknown> | null
  notified_at: string | null

  // PDF
  pdf_generated?: boolean
  pdf_url?: string | null
  pdf_generated_at?: string | null
}

export type AssessmentPdfStatusResponse =
  | { pdf_url: string; generated_at?: string | null; status?: 'ready' }
  | { status: 'queued' | 'pending'; message?: string }

export interface AssessmentListResponse {
  assessments: AssessmentListItem[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface MyAssessmentsResponse {
  assessments: Array<{
    id: string
    assessment_date: string
    personal_name?: string | null
    weight_kg: number | null
    height_cm: number | null
    body_fat_percentage: number | null
    muscle_mass_kg: number | null
    bmi: number | null
    fat_classification: string | null
    pdf_generated: boolean
    pdf_url?: string | null
    created_at: string
  }>
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface AssessmentListParams {
  page?: number
  per_page?: number
  student_id?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface MyAssessmentsParams {
  page?: number
  per_page?: number
}

export interface CreateAssessmentInput {
  student_id: string
  assessment_date?: string
  weight_kg?: number | null
  height_cm?: number | null
  body_fat_percentage?: number | null
  muscle_mass_kg?: number | null
  measurements?: Measurements | null
  notes?: string | null

  // Assessment 2.0
  protocol?: ProtocolId
  density_formula?: DensityFormula
  gender?: Gender
  age?: number
  skinfolds?: Skinfolds | null
  bioimpedance?: BioimpedanceData | null
  activity_level?: ActivityLevel
  wrist_diameter_cm?: number
  femur_diameter_cm?: number
}

export interface UpdateAssessmentInput {
  assessment_date?: string
  weight_kg?: number | null
  height_cm?: number | null
  body_fat_percentage?: number | null
  muscle_mass_kg?: number | null
  measurements?: Measurements | null
  notes?: string | null

  // Assessment 2.0
  protocol?: ProtocolId
  density_formula?: DensityFormula
  gender?: Gender
  age?: number
  skinfolds?: Skinfolds | null
  bioimpedance?: BioimpedanceData | null
  activity_level?: ActivityLevel
  wrist_diameter_cm?: number
  femur_diameter_cm?: number
}

// Evolution types
export interface EvolutionDiff {
  field: string
  label: string
  previousValue: number
  currentValue: number
  diff: number
  diffPercentage: number
  direction: 'up' | 'down' | 'stable'
  isPositive: boolean
  unit: string
}

export interface AssessmentEvolution {
  id: string
  weight_diff: number | null
  fat_percentage_diff: number | null
  fat_mass_diff: number | null
  lean_mass_diff: number | null
  muscle_mass_diff: number | null
  bmi_diff: number | null
  waist_diff: number | null
  overall_score: number
  diffs: EvolutionDiff[]
  perimeter_diffs: Array<{
    name: string
    label: string
    currentCm: number | null
    previousCm: number | null
    diffCm: number | null
  }>
  days_between: number
  previous_assessment_id: string | null
  created_at: string
}

// History (séries para gráficos)
export interface AssessmentHistoryResponse {
  total_assessments: number
  assessments: Array<{
    id: string
    assessment_date: string
    weight_kg: number | null
    body_fat_percentage: number | null
    fat_mass_kg: number | null
    lean_mass_kg: number | null
    muscle_mass_kg: number | null
    bmi: number | null
    bmi_classification: string | null
    fat_classification: string | null
    waist_hip_ratio: number | null
    basal_metabolic_rate: number | null
    measurements: Measurements | null
    protocol: string | null
  }>
  series: {
    dates: string[]
    weight: (number | null)[]
    fatPercentage: (number | null)[]
    fatMass: (number | null)[]
    leanMass: (number | null)[]
    muscleMass: (number | null)[]
    bmi: (number | null)[]
    waistHipRatio: (number | null)[]
    bmr: (number | null)[]
  }
  perimeterSeries: Record<string, (number | null)[]>
}

export interface AssessmentCompareEntry {
  id: string
  student_id: string
  personal_id: string
  assessment_date: string
  weight_kg: number | null
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  bmi: number | null
  basal_metabolic_rate: number | null
  measurements?: Record<string, number> | null
}

export interface AssessmentComparePerimeterDiff {
  key: string
  label: string
  previous: number | null
  current: number | null
  delta: number | null
}

export interface AssessmentsCompareResponse {
  first: AssessmentCompareEntry
  second: AssessmentCompareEntry
  deltas: {
    weight_kg: number | null
    body_fat_percentage: number | null
    muscle_mass_kg: number | null
    bmi: number | null
    basal_metabolic_rate: number | null
    perimeters: AssessmentComparePerimeterDiff[]
  }
}

// ============================================
// Query hooks
// ============================================

export function useAssessments(params: AssessmentListParams = {}) {
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.student_id) queryString.set('student_id', params.student_id)
  if (params.sort) queryString.set('sort', params.sort)
  if (params.order) queryString.set('order', params.order)

  const qs = queryString.toString()

  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery<AssessmentListResponse>({
    queryKey: ['assessments', params],
    queryFn: async () => {
      const res = await api.get<AssessmentListResponse>(`/assessments${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useMyAssessments(params: MyAssessmentsParams = {}) {
  const isReady = useAuthStore((s) => {
    const userType = s.user?.user_type
    const role = s.user?.role
    const isStudentLike = userType === 'student' || userType === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isStudentLike
  })

  const page = params.page ?? 1
  const perPage = params.per_page ?? 20
  const qs = `?page=${encodeURIComponent(String(page))}&per_page=${encodeURIComponent(String(perPage))}`

  return useQuery<MyAssessmentsResponse>({
    queryKey: ['assessments', 'my', params],
    queryFn: async () => {
      const res = await api.get<MyAssessmentsResponse>(`/assessments/my${qs}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useAssessment(id: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AssessmentDetail>({
    queryKey: ['assessments', id],
    queryFn: async () => {
      const res = await api.get<{ assessment: AssessmentDetail }>(`/assessments/${id}`)
      return res.data.assessment
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
  })
}

// ============================================
// PDF hooks
// ============================================

export function useRequestAssessmentPdf(assessmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opts?: { force?: boolean }) => {
      const query = opts?.force ? '?force=1' : ''
      const res = await api.get<AssessmentPdfStatusResponse>(`/assessments/${assessmentId}/pdf${query}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId, 'pdf'] })
    },
    ...APP_QUERY_CACHE.realtime,
  })
}

export function useAssessmentPdfStatus(assessmentId: string, enabled: boolean) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)

  return useQuery<AssessmentPdfStatusResponse>({
    queryKey: ['assessments', assessmentId, 'pdf'],
    queryFn: async () => {
      const res = await api.get<AssessmentPdfStatusResponse>(`/assessments/${assessmentId}/pdf?check=1`)
      return res.data
    },
    enabled: isReady && !!assessmentId && enabled,
    refetchInterval: enabled ? 3_000 : false,
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useCreateAssessment() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateAssessmentInput) =>
      api.post('/assessments', data),
    onSuccess: () => {
      toast.success('Avaliação criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      router.push('/dashboard/assessments')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar avaliação')
    },
  })
}

// ============================================
// useCreateAssessmentWithPhotos — Criar + Upload Fotos
// ============================================

export interface CreateAssessmentWithPhotosInput extends CreateAssessmentInput {
  photos?: Array<{
    file: File
    type: 'front' | 'back' | 'side_left' | 'side_right' | 'custom'
  }>
  edit_style?: 'none' | 'leaner_man' | 'leaner_woman' | 'muscular_man'
}

export function useCreateAssessmentWithPhotos() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: CreateAssessmentWithPhotosInput) => {
      // 1. Criar assessment sem as fotos
      const { photos, edit_style, ...dataWithoutPhotos } = data
      const createPayload: CreateAssessmentInput = dataWithoutPhotos

      const createRes = await api.post<{ id: string }>('/assessments', createPayload)
      const assessmentId = createRes.data.id

      // 2. Upload de fotos se fornecidas
      if (photos && photos.length > 0) {
        const { getAccessToken } = useAuthStore.getState()
        const token = getAccessToken()

        for (const photo of photos) {
          try {
            // Obter presigned URL
            const uploadRes = await api.post<{ upload_url: string; key: string }>
              (`/assessments/${assessmentId}/photos`,
              {
                type: photo.type,
                content_type: photo.file.type || 'image/jpeg',
              }
            )

            const uploadPath = uploadRes.data.upload_url
            const key = uploadRes.data.key

            // Upload binário direto via fetch (não usar api client pois body é ArrayBuffer)
            const arrayBuffer = await photo.file.arrayBuffer()
            const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'}${uploadPath}?type=${photo.type}&key=${encodeURIComponent(key)}`
            
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': photo.file.type || 'image/jpeg',
                'Authorization': token ? `Bearer ${token}` : '',
              },
              body: arrayBuffer,
            })

            if (!uploadResponse.ok) {
              console.error(`[Photo Upload] Failed for ${photo.type}:`, uploadResponse.status)
              throw new Error(`Upload failed: ${uploadResponse.status}`)
            }
          } catch (photoErr) {
            console.error('[Photo Upload Error]', photoErr)
            // Continua tentando as outras fotos
          }
        }
      }

      // 3. Editar fotos com IA se um estilo foi selecionado
      if (edit_style && edit_style !== 'none' && photos && photos.length > 0) {
        try {
          await api.post(`/assessments/${assessmentId}/edit-photos`, {
            style: edit_style,
            photos: [], // Backend buscará do DB
          })
        } catch (editErr) {
          console.error('[AI Photo Edit Error]', editErr)
          // Não falha a criação — edição com IA é best-effort
        }
      }

      return { id: assessmentId }
    },
    onSuccess: (res) => {
      toast.success('Avaliação e fotos salvas com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      // Redirecionar para página de sucesso com preview
      router.push(`/dashboard/assessments/success-detail?id=${res.id}`)
    },
    onError: (err: Error) => {
      const errorMsg = err.message || 'Erro ao criar avaliação'
      toast.error(errorMsg)
      
      // Salvar como rascunho no localStorage
      const draftData = new Date().toISOString()
      const drafts = JSON.parse(localStorage.getItem('assessment_drafts') || '[]')
      drafts.push({
        timestamp: draftData,
        message: 'Rascunho: ' + errorMsg,
      })
      localStorage.setItem('assessment_drafts', JSON.stringify(drafts))
      toast.info('Rascunho salvo localmente. Você pode recuperar depois.')
    },
  })
}

export function useUpdateAssessment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAssessmentInput) =>
      api.patch(`/assessments/${id}`, data),
    onSuccess: () => {
      toast.success('Avaliação atualizada!')
      queryClient.invalidateQueries({ queryKey: ['assessments', id] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar avaliação')
    },
  })
}

export function useDeleteAssessment(id: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.delete(`/assessments/${id}`),
    onSuccess: () => {
      toast.success('Avaliação removida')
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      router.push('/dashboard/assessments')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover avaliação')
    },
  })
}

// ============================================
// useEditAssessmentPhotos — Editar fotos com IA
// ============================================

export function useEditAssessmentPhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      assessment_id: string
      style: 'leaner_man' | 'leaner_woman' | 'muscular_man'
    }) => {
      return api.post(`/assessments/${payload.assessment_id}/edit-photos`, {
        style: payload.style,
      })
    },
    onSuccess: (_data, variables) => {
      toast.success('Fotos editadas com IA com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['assessments', variables.assessment_id] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao editar fotos com IA')
    },
  })
}

// ============================================
// Assessment 2.0 — Novos Hooks
// ============================================

/** Protocolos disponíveis */
export function useAssessmentProtocols() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<Record<string, ProtocolInfo>>({
    queryKey: ['assessment-protocols'],
    queryFn: async () => {
      const res = await api.get<{ protocols: Record<string, ProtocolInfo> }>('/assessments/protocols')
      return res.data.protocols
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.detail,
    staleTime: 24 * 60 * 60 * 1000, // 24h — protocolos não mudam
  })
}

/** Evolução de uma avaliação vs anterior */
export function useAssessmentEvolution(assessmentId: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AssessmentEvolution | null>({
    queryKey: ['assessment-evolution', assessmentId],
    queryFn: async () => {
      const res = await api.get<{ evolution: AssessmentEvolution | null }>(
        `/assessments/${assessmentId}/evolution`
      )
      return res.data.evolution
    },
    enabled: isReady && !!assessmentId,
    ...APP_QUERY_CACHE.list,
  })
}

/** Comparar duas avaliações por IDs (ids=id1,id2) */
export function useAssessmentsCompare(firstId?: string, secondId?: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AssessmentsCompareResponse>({
    queryKey: ['assessments-compare', firstId, secondId],
    queryFn: async () => {
      const res = await api.get<AssessmentsCompareResponse>(
        `/assessments/compare?ids=${encodeURIComponent(firstId || '')},${encodeURIComponent(secondId || '')}`
      )
      return res.data
    },
    enabled: isReady && !!firstId && !!secondId,
    ...APP_QUERY_CACHE.detail,
  })
}

/** Histórico completo de um aluno (para gráficos) */
export function useAssessmentHistory(studentId: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<AssessmentHistoryResponse>({
    queryKey: ['assessment-history', studentId],
    queryFn: async () => {
      const res = await api.get<AssessmentHistoryResponse>(
        `/assessments/student/${studentId}/history`
      )
      return res.data
    },
    enabled: isReady && !!studentId,
    ...APP_QUERY_CACHE.list,
  })
}

/** Interpretação textual IA */
export function useAssessmentInterpretation(assessmentId: string) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<string | null>({
    queryKey: ['assessment-interpretation', assessmentId],
    queryFn: async () => {
      const res = await api.get<{ interpretation: string | null }>(
        `/assessments/${assessmentId}/interpretation`
      )
      return res.data.interpretation
    },
    enabled: isReady && !!assessmentId,
  })
}

/** Notificar aluno que resultado está pronto */
export function useNotifyAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assessmentId: string) => {
      return api.post(`/assessments/${assessmentId}/notify`, {})
    },
    onSuccess: (_data, assessmentId) => {
      toast.success('Notificação enviada ao aluno!')
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar notificação')
    },
  })
}

/** Gerar link compartilhável para avaliação */
export function useShareAssessment() {
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await api.post<{ share_token: string; share_url: string; expires_at: string }>(
        `/assessments/${assessmentId}/share`,
        {}
      )
      return res.data
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.share_url).then(() => {
        toast.success('Link copiado! Válido por 30 dias.')
      }).catch(() => {
        toast.success('Link gerado com sucesso!')
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao gerar link')
    },
  })
}

/** Enviar avaliação por email ao aluno */
export function useSendAssessmentEmail() {
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await api.post<{ message: string; sent_to: string }>(
        `/assessments/${assessmentId}/send-email`,
        {}
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`Email enviado para ${data.sent_to}`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao enviar email')
    },
  })
}

/** Buscar avaliação pública por share token (sem auth) */
export function useSharedAssessment(token: string) {
  return useQuery({
    queryKey: ['shared-assessment', token],
    queryFn: async () => {
      const res = await fetch(`https://api.vfit.app.br/api/v1/assessments/share/${token}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Link inválido ou expirado' })) as { error?: string }
        throw new Error(err.error || 'Avaliação não encontrada')
      }
      const json = await res.json() as { data: { assessment: unknown } }
      return json.data.assessment
    },
    enabled: !!token && token.length >= 32,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

/** KPI de Story (MVP v1) */
export function useStoryKpis() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<StoryKpisResponse>({
    queryKey: ['story-kpis'],
    queryFn: async () => {
      const res = await api.get<StoryKpisResponse>('/assessments/story-kpis')
      return res.data
    },
    enabled: isReady,
    refetchInterval: isReady ? 60_000 : false,
    staleTime: 30_000,
  })
}
