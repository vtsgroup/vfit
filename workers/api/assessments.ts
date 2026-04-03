/**
 * workers/api/assessments.ts
 *
 * assessments.ts — Avaliações físicas completas
 * Features: DB: Neon
 */

// ============================================
// assessments.ts — Avaliações físicas completas
// ============================================
//
// O que faz:
//   CRUD de avaliações físicas: dados antropométricos, fotos antes/depois,
//   dobras cutâneas, bioimpedância, perimetrias e cálculo automático de
//   evolução. Suporta geração de PDF e compartilhamento por token público.
//
// Exports principais:
//   assessmentsRoutes — Hono app montado em /api/v1/assessments
//   getSharedAssessment — handler público GET /assessments/share/:token
//
// Auth: requireAuth. Personal gerencia; student vê somente as suas.
//       getSharedAssessment é público (token único mínimo 32 chars).
// DB: assessments, assessment_evolution, assessment_photos, users, students
// Side effects: gera PDF via Queue (PDF_QUEUE), armazena fotos no R2
// ============================================
import { enqueueWithRetry } from '@lib/queue'


import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  listAssessmentsQuerySchema,
  uploadAssessmentPhotoSchema,
  listBadgesQuerySchema,
} from '@workers/schemas/assessments'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  InternalError,
} from '@lib/errors'
import { notify, notifyEvent } from '@lib/onesignal'
import { sendEmail } from '@lib/email'
import { PROMPTS } from '@lib/ai-prompts'
import type { Gender, ProtocolId, SkinfoldData, DensityFormula, ActivityLevel } from '@lib/assessment-formulas'
import { PROTOCOLS } from '@lib/assessment-formulas'
import { generateAndStoreAssessmentPdf } from '@lib/assessment-pdf'
import {
  calculateBodyComposition,
  calculateEvolution,
  generateInterpretation,
  comparePerimeters,
  type AssessmentInput,
  type BodyCompositionResult,
} from '@lib/body-composition'

const assessments = new Hono<AppContext>()

// ============================================
// POST /assessments/preview-edit-photo — Preview de edição com IA (sem auth)
// ANTES do middleware de autenticação!
// ============================================
assessments.post('/preview-edit-photo', async (c) => {
  const body = await c.req.json() as {
    image_url: string
    style: 'leaner_man' | 'leaner_woman' | 'muscular_man'
  }

  if (!body.image_url || !body.style) {
    return c.json({ error: 'Missing image_url or style' }, 400)
  }

  if (!['leaner_man', 'leaner_woman', 'muscular_man'].includes(body.style)) {
    return c.json({ error: 'Invalid style' }, 400)
  }

  const token = c.env.REPLICATE_API_TOKEN
  if (!token) {
    return c.json({ error: 'AI service not available' }, 503)
  }

  try {
    const edited = await editPhotoWithNanoBanana(token, body.image_url, body.style)
    return success({ edited_url: edited })
  } catch (err) {
    console.error('[Assessment Photo Preview]', err)
    return c.json({ error: 'Failed to process photo' }, 500)
  }
})

// ============================================
// Middleware de autenticação para o resto das rotas
// ============================================
assessments.use('*', authMiddleware)

// ============================================
// Story Preference + Story Analytics (auth)
// ============================================

assessments.get('/story-preference', async (c) => {
  const userId = c.get('userId')
  const key = `story-pref:${userId}`

  const raw = await c.env.KV_CACHE.get(key)
  if (!raw) return success({ preference: null })

  try {
    const parsed = JSON.parse(raw)
    return success({ preference: parsed })
  } catch {
    return success({ preference: null })
  }
})

assessments.post('/story-preference', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json() as {
    goal?: 'definition' | 'muscle_gain' | 'recomposition'
    step?: number
    playing?: boolean
    variant?: 'A' | 'B' | 'C'
    lockMidline?: boolean
    cleanMode?: boolean
  }

  const payload = {
    goal: body.goal,
    step: typeof body.step === 'number' ? body.step : 0,
    playing: Boolean(body.playing),
    variant: body.variant,
    lockMidline: Boolean(body.lockMidline),
    cleanMode: Boolean(body.cleanMode),
    updated_at: new Date().toISOString(),
  }

  try {
    await c.env.KV_CACHE.put(`story-pref:${userId}`, JSON.stringify(payload), {
      expirationTtl: 60 * 60 * 24 * 30, // 30 dias
    })

    return success({ saved: true })
  } catch (err) {
    console.error('[Story Preference] KV save failed', err)
    return success({ saved: false })
  }
})

assessments.post('/story-events', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const body = await c.req.json() as {
    event: 'story_open' | 'story_play' | 'story_pause' | 'story_complete' | 'story_share' | 'story_export' | 'story_cta_click'
    goal?: 'definition' | 'muscle_gain' | 'recomposition'
    step?: number
    variant?: 'A' | 'B' | 'C'
    mode?: 'inline' | 'fullscreen'
  }

  const validEvents = new Set([
    'story_open',
    'story_play',
    'story_pause',
    'story_complete',
    'story_share',
    'story_export',
    'story_cta_click',
  ])

  if (!body.event || !validEvents.has(body.event)) {
    return c.json({ error: 'event obrigatório' }, 400)
  }

  try {
    c.env.ANALYTICS.writeDataPoint({
      indexes: [
        body.event,
        body.goal || 'unknown',
        body.variant || 'unknown',
        userType || 'unknown',
        body.mode || 'unknown',
      ],
      doubles: [
        typeof body.step === 'number' ? body.step : -1,
        Date.now(),
      ],
      blobs: [String(userId || 'unknown')],
    })

    await incrementStoryKpiCounter(c.env, body.event)

    return success({ tracked: true })
  } catch (err) {
    console.error('[Story Events] analytics write failed', err)
    return success({ tracked: false })
  }
})

assessments.get('/story-kpis', async (c) => {
  const userType = c.get('userType')

  if (userType === 'student') {
    throw new ForbiddenError('Sem permissão para visualizar métricas')
  }

  const today = toIsoDay(new Date())
  const last7Days = getLastDays(7)
  const previous7Days = getLastDaysRange(7, 7)

  const [todayMetrics, last7Metrics, previous7Metrics, allTimeMetrics] = await Promise.all([
    getStoryKpiByDay(c.env, today),
    getStoryKpiLastDays(c.env, last7Days),
    getStoryKpiLastDays(c.env, previous7Days),
    getStoryKpiAllTime(c.env),
  ])

  return success({
    window_days: 7,
    today: withRates(todayMetrics),
    last_7_days: withRates(last7Metrics),
    previous_7_days: withRates(previous7Metrics),
    all_time: withRates(allTimeMetrics),
  })
})

type StoryKpiEvent = 'story_open' | 'story_play' | 'story_pause' | 'story_complete' | 'story_share' | 'story_export' | 'story_cta_click'

interface StoryKpiCounter {
  story_open: number
  story_play: number
  story_pause: number
  story_complete: number
  story_share: number
  story_export: number
  story_cta_click: number
}

const STORY_KPI_EVENTS: StoryKpiEvent[] = [
  'story_open',
  'story_play',
  'story_pause',
  'story_complete',
  'story_share',
  'story_export',
  'story_cta_click',
]

function getEmptyStoryKpiCounter(): StoryKpiCounter {
  return {
    story_open: 0,
    story_play: 0,
    story_pause: 0,
    story_complete: 0,
    story_share: 0,
    story_export: 0,
    story_cta_click: 0,
  }
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getLastDays(days: number): string[] {
  return getLastDaysRange(0, days)
}

function getLastDaysRange(offsetDays: number, days: number): string[] {
  const out: string[] = []
  const base = new Date()

  for (let i = 0; i < days; i += 1) {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() - (offsetDays + i))
    out.push(toIsoDay(d))
  }

  return out
}

function parseStoryCounter(raw: string | null): StoryKpiCounter {
  if (!raw) return getEmptyStoryKpiCounter()

  try {
    const parsed = JSON.parse(raw) as Partial<Record<StoryKpiEvent, number>>
    return {
      story_open: Number(parsed.story_open || 0),
      story_play: Number(parsed.story_play || 0),
      story_pause: Number(parsed.story_pause || 0),
      story_complete: Number(parsed.story_complete || 0),
      story_share: Number(parsed.story_share || 0),
      story_export: Number(parsed.story_export || 0),
      story_cta_click: Number(parsed.story_cta_click || 0),
    }
  } catch {
    return getEmptyStoryKpiCounter()
  }
}

function addStoryCounters(a: StoryKpiCounter, b: StoryKpiCounter): StoryKpiCounter {
  return {
    story_open: a.story_open + b.story_open,
    story_play: a.story_play + b.story_play,
    story_pause: a.story_pause + b.story_pause,
    story_complete: a.story_complete + b.story_complete,
    story_share: a.story_share + b.story_share,
    story_export: a.story_export + b.story_export,
    story_cta_click: a.story_cta_click + b.story_cta_click,
  }
}

function withRates(counter: StoryKpiCounter) {
  const opens = counter.story_open || 0
  const completionRate = opens > 0 ? Number(((counter.story_complete / opens) * 100).toFixed(1)) : 0
  const shareRate = opens > 0 ? Number(((counter.story_share / opens) * 100).toFixed(1)) : 0
  const ctaRate = opens > 0 ? Number(((counter.story_cta_click / opens) * 100).toFixed(1)) : 0

  return {
    ...counter,
    completion_rate: completionRate,
    share_rate: shareRate,
    cta_rate: ctaRate,
  }
}

async function incrementStoryKpiCounter(env: Bindings, event: StoryKpiEvent): Promise<void> {
  const day = toIsoDay(new Date())
  const dayKey = `story-kpis:day:${day}`
  const allKey = 'story-kpis:all'

  await Promise.all([
    incrementStoryKpiKey(env, dayKey, event, 60 * 60 * 24 * 45),
    incrementStoryKpiKey(env, allKey, event),
  ])
}

async function incrementStoryKpiKey(env: Bindings, key: string, event: StoryKpiEvent, expirationTtl?: number): Promise<void> {
  try {
    const current = parseStoryCounter(await env.KV_CACHE.get(key))
    current[event] += 1
    const value = JSON.stringify(current)

    if (expirationTtl) {
      await env.KV_CACHE.put(key, value, { expirationTtl })
      return
    }

    await env.KV_CACHE.put(key, value)
  } catch (err) {
    console.error('[Story KPI] increment failed', err)
  }
}

async function getStoryKpiByDay(env: Bindings, day: string): Promise<StoryKpiCounter> {
  return parseStoryCounter(await env.KV_CACHE.get(`story-kpis:day:${day}`))
}

async function getStoryKpiAllTime(env: Bindings): Promise<StoryKpiCounter> {
  return parseStoryCounter(await env.KV_CACHE.get('story-kpis:all'))
}

async function getStoryKpiLastDays(env: Bindings, days: string[]): Promise<StoryKpiCounter> {
  const keys = days.map((day) => `story-kpis:day:${day}`)
  const raws = await Promise.all(keys.map((key) => env.KV_CACHE.get(key)))

  return raws
    .map(parseStoryCounter)
    .reduce((acc, cur) => addStoryCounters(acc, cur), getEmptyStoryKpiCounter())
}

// ============================================
// Autenticação obrigatória a partir daqui
// ============================================
assessments.post('/', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const body = await c.req.json()
  const parsed = createAssessmentSchema.parse(body)

  // Validação: só personal ou super_admin podem criar avaliações
  if (userType !== 'personal' && userType !== 'super_admin') {
    return c.json({ error: 'Sem permissão' }, 403)
  }

  // Variável para armazenar dados do student (se existir)
  let student: { full_name: string } | null = null

  // Se não for super_admin, precisa ser personal com student_id válido
  if (userType === 'personal') {
    if (!parsed.student_id) {
      return c.json({ error: 'student_id obrigatório para personals' }, 400)
    }
    // Verificar ownership
    await ensureStudentBelongsToPersonal(c.env, parsed.student_id, userId)
    // Buscar nome do student
    const { rows } = await pgQuery<{ full_name: string }>(
      c.env,
      'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
      [parsed.student_id]
    )
    student = rows[0] || null
  } else if (userType === 'super_admin') {
    // Super admin pode criar sem student_id (teste)
    // Buscar nome do student se student_id foi fornecido
    if (parsed.student_id) {
      const { rows } = await pgQuery<{ full_name: string }>(
        c.env,
        'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
        [parsed.student_id]
      )
      student = rows[0] || null
    }
  }

  const id = generateId()
  const now = new Date().toISOString()
  const assessmentDate = parsed.assessment_date || now.split('T')[0]

  // Super admin criando avaliação de teste usa seu próprio userId como personal_id
  const personalId = userType === 'super_admin' && !parsed.student_id ? userId : userId

  // === Assessment 2.0: Composição Corporal Completa ===
  let bodyComp: BodyCompositionResult | null = null
  let bmi: number | null = null

  // Tentar calcular composição corporal se temos dados suficientes
  const protocol = (parsed.protocol || 'pollock_7') as ProtocolId
  const gender = (parsed.gender || 'male') as Gender
  const age = parsed.age || 30

  if (parsed.weight_kg && parsed.height_cm) {
    try {
      const bcInput: AssessmentInput = {
        weightKg: parsed.weight_kg,
        heightCm: parsed.height_cm,
        age,
        gender,
        protocol,
        skinfolds: (parsed.skinfolds || {}) as SkinfoldData,
        densityFormula: (parsed.density_formula || 'siri') as DensityFormula,
        directFatPercentage: parsed.body_fat_percentage ?? parsed.bioimpedance?.fatPercentage ?? undefined,
        waistCm: parsed.measurements?.waist ?? undefined,
        hipCm: parsed.measurements?.hips ?? undefined,
        wristDiameterCm: parsed.wrist_diameter_cm,
        femurDiameterCm: parsed.femur_diameter_cm,
        activityLevel: (parsed.activity_level || 'moderate') as ActivityLevel,
        bioimpedance: parsed.bioimpedance ? {
          fatPercentage: parsed.bioimpedance.fatPercentage,
          muscleMassKg: parsed.bioimpedance.muscleMassKg,
          boneMassKg: parsed.bioimpedance.boneMassKg,
          waterPercentage: parsed.bioimpedance.waterPercentage,
          visceralFatLevel: parsed.bioimpedance.visceralFatLevel,
          metabolicAge: parsed.bioimpedance.metabolicAge,
          basalMetabolicRate: parsed.bioimpedance.basalMetabolicRate,
        } : undefined,
      }
      bodyComp = calculateBodyComposition(bcInput)
      bmi = bodyComp.bmi.value
    } catch (err) {
      console.error('[Assessment] Body composition calc error:', err)
      // Fallback: calcular BMI simples
      const heightM = parsed.height_cm / 100
      bmi = Math.round((parsed.weight_kg / (heightM * heightM)) * 100) / 100
    }
  }

  // Gerar interpretação textual
  let aiInterpretation: string | null = null
  if (bodyComp) {
    try {
      aiInterpretation = generateInterpretation(bodyComp, student?.full_name || 'Aluno')
    } catch { /* best-effort */ }
  }

  await pgQuery(c.env, `
    INSERT INTO assessments (
      id, student_id, personal_id, assessment_date,
      weight_kg, height_cm, body_fat_percentage, muscle_mass_kg, bmi,
      measurements, photos, notes,
      protocol, protocol_version, density_formula, skinfolds,
      body_density, fat_mass_kg, lean_mass_kg, lean_mass_percentage,
      muscle_mass_percentage, bone_mass_kg, residual_mass_kg, sum_of_skinfolds,
      bmi_classification, fat_classification,
      waist_hip_ratio, waist_hip_classification, waist_risk,
      ideal_weight_kg, weight_to_lose_kg, basal_metabolic_rate, total_daily_expenditure,
      somatotype, water_percentage, visceral_fat_level, metabolic_age,
      ai_interpretation, body_composition,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8, $9,
      $10, $11, $12,
      $13, $14, $15, $16,
      $17, $18, $19, $20,
      $21, $22, $23, $24,
      $25, $26,
      $27, $28, $29,
      $30, $31, $32, $33,
      $34, $35, $36, $37,
      $38, $39,
      $40, $40
    )
  `, [
    id, parsed.student_id || null, personalId, assessmentDate,
    parsed.weight_kg ?? null, parsed.height_cm ?? null,
    bodyComp?.fatPercentage ?? parsed.body_fat_percentage ?? null,
    bodyComp?.muscleMassKg ?? parsed.muscle_mass_kg ?? null,
    bmi,
    JSON.stringify(parsed.measurements || {}),
    JSON.stringify(parsed.photos || []),
    parsed.notes || null,
    protocol, 'v2', parsed.density_formula || 'siri',
    JSON.stringify(parsed.skinfolds || {}),
    bodyComp?.bodyDensity ?? null,
    bodyComp?.fatMassKg ?? null,
    bodyComp?.leanMassKg ?? null,
    bodyComp?.leanMassPercentage ?? null,
    bodyComp?.muscleMassPercentage ?? null,
    bodyComp?.boneMassKg ?? null,
    bodyComp?.residualMassKg ?? null,
    bodyComp?.sumOfSkinfolds ?? null,
    bodyComp?.bmi.classification ?? null,
    bodyComp?.fatClassification.classification ?? null,
    bodyComp?.whr?.value ?? null,
    bodyComp?.whr?.classification ?? null,
    bodyComp?.waistRisk?.classification ?? null,
    bodyComp?.idealWeightKg ?? null,
    bodyComp?.weightToLoseKg ?? null,
    bodyComp?.basalMetabolicRate ?? null,
    bodyComp?.totalDailyExpenditure ?? null,
    bodyComp?.somatotype.classification ?? null,
    bodyComp?.waterPercentage ?? null,
    bodyComp?.visceralFatLevel ?? null,
    bodyComp?.metabolicAge ?? null,
    aiInterpretation,
    JSON.stringify(bodyComp || {}),
    now,
  ])

  // === Calcular evolução (comparar com avaliação anterior) ===
  if (parsed.student_id && bodyComp) {
    try {
      await saveEvolution(c.env, {
        assessmentId: id,
        studentId: parsed.student_id,
        personalId,
        assessmentDate,
        bodyComp,
        measurements: parsed.measurements || {},
      })
    } catch (err) {
      console.error('[Assessment] Evolution calc error:', err)
    }
  }

  // Gerar feedback com IA (best-effort)
  let aiFeedback = null
  try {
    if (bmi !== null && parsed.weight_kg && parsed.height_cm) {
      // Buscar avaliação anterior para comparação
      const { rows: prevRows } = await pgQuery<{ bmi: number; weight_kg: number; body_fat_percentage: number | null }>(
        c.env,
        `SELECT weight_kg, body_fat_percentage, bmi FROM assessments 
         WHERE student_id = $1 AND id != $2 
         ORDER BY assessment_date DESC LIMIT 1`,
        [parsed.student_id, id]
      )

      aiFeedback = await generateAssessmentFeedback(c.env, {
        studentName: student?.full_name || 'Aluno',
        bmi,
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        body_fat_percentage: parsed.body_fat_percentage ?? undefined,
        muscle_mass_kg: parsed.muscle_mass_kg ?? undefined,
        measurements: (parsed.measurements || {}) as Record<string, string | number>,
        previousAssessment: prevRows[0]
          ? {
              weight_kg: prevRows[0].weight_kg,
              body_fat_percentage: prevRows[0].body_fat_percentage ?? undefined,
              bmi: prevRows[0].bmi,
            }
          : undefined,
      })

      // Salvar feedback
      await pgQuery(c.env, `
        UPDATE assessments
        SET ai_analysis = JSONB_SET(COALESCE(ai_analysis, '{}'::jsonb), '{feedback}', $1::jsonb),
            updated_at = $2
        WHERE id = $3
      `, [JSON.stringify(aiFeedback), now, id])
    }
  } catch (err) {
    console.error('[Assessment] Error generating feedback:', err)
    // Continue mesmo se falhar
  }

  // Notificar ALUNO com feedback (só se student_id existir)
  if (parsed.student_id) {
    const feedbackMsg = aiFeedback
      ? `${aiFeedback.summary.substring(0, 80)}...`
      : 'Confira seus resultados!'

    await notifyEvent(c.env, parsed.student_id, 'assessment.ready', {
      assessmentId: id,
      preview: feedbackMsg,
    }).catch(() => {})
  }

  // Notificar PERSONAL TRAINER
  await notifyEvent(c.env, personalId, 'assessment.completed', {
    studentName: student?.full_name || 'aluno',
  }).catch(() => {})

  const assessment = await findAssessmentById(c.env, id)
  return created(assessment)
})

// ============================================
// GET /assessments — Listar avaliações (personal)
// ============================================
assessments.get('/', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const url = new URL(c.req.url)

  const query = listAssessmentsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    student_id: url.searchParams.get('student_id') || undefined,
    sort: url.searchParams.get('sort') || undefined,
    order: url.searchParams.get('order') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['a.personal_id = $1']
  const params: unknown[] = [personalId]
  let idx = 2

  if (query.student_id) {
    conditions.push(`a.student_id = $${idx}`)
    params.push(query.student_id)
    idx++
  }

  const where = conditions.join(' AND ')
  const sortField = query.sort === 'created_at' ? 'a.created_at' : 'a.assessment_date'
  const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC'

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM assessments a WHERE ${where}`,
    params
  )
  const total = countRows[0]?.count ?? 0

  const { rows } = await pgQuery<AssessmentRow>(
    c.env,
    `SELECT a.id, a.student_id, a.assessment_date, a.weight_kg, a.height_cm,
            a.body_fat_percentage, a.muscle_mass_kg, a.bmi,
            a.pdf_generated, a.created_at,
            u.full_name as student_name
     FROM assessments a
     JOIN users u ON u.id = a.student_id
     WHERE ${where}
     ORDER BY ${sortField} ${sortOrder}
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    assessments: rows,
    meta: { page: query.page, per_page: query.per_page, total, total_pages: Math.ceil(total / query.per_page) },
  })
})

// ============================================
// GET /assessments/my — Minhas avaliações (student)
// ============================================
assessments.get('/my', requireType('student'), async (c) => {
  const studentId = c.get('userId')
  const url = new URL(c.req.url)

  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * perPage

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    'SELECT COUNT(*)::int as count FROM assessments WHERE student_id = $1',
    [studentId]
  )

  const { rows } = await pgQuery<AssessmentRow>(
    c.env,
    `SELECT a.*, pu.full_name as personal_name
     FROM assessments a
     LEFT JOIN users pu ON pu.id = a.personal_id
     WHERE a.student_id = $1
     ORDER BY a.assessment_date DESC
     LIMIT $2 OFFSET $3`,
    [studentId, perPage, offset]
  )

  return success({
    assessments: rows,
    meta: {
      page, per_page: perPage,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / perPage),
    },
  })
})

// ============================================
// GET /assessments/my/evolution — Evolução (student)
// ============================================
assessments.get('/my/evolution', requireType('student'), async (c) => {
  const studentId = c.get('userId')

  const { rows } = await pgQuery<EvolutionRow>(
    c.env,
    `SELECT assessment_date, weight_kg, body_fat_percentage, muscle_mass_kg, bmi,
            measurements
     FROM assessments
     WHERE student_id = $1
     ORDER BY assessment_date ASC`,
    [studentId]
  )

  // Calcular deltas se houver >=2 avaliações
  let summary = null
  if (rows.length >= 2) {
    const first = rows[0]
    const last = rows[rows.length - 1]
    summary = {
      total_assessments: rows.length,
      period: { from: first.assessment_date, to: last.assessment_date },
      weight_delta: delta(last.weight_kg, first.weight_kg),
      body_fat_delta: delta(last.body_fat_percentage, first.body_fat_percentage),
      muscle_mass_delta: delta(last.muscle_mass_kg, first.muscle_mass_kg),
      bmi_delta: delta(last.bmi, first.bmi),
    }
  }

  return success({ evolution: rows, summary })
})

// ============================================
// GET /assessments/badges — Badges do aluno
// ============================================
assessments.get('/badges', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const url = new URL(c.req.url)

  const query = listBadgesQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    student_id: url.searchParams.get('student_id') || undefined,
  })

  // Student vê seus próprios, Personal pode filtrar por student_id
  let targetStudentId: string
  if (userType === 'student') {
    targetStudentId = userId
  } else {
    if (!query.student_id) {
      throw new BadRequestError('student_id obrigatório para personals')
    }
    targetStudentId = query.student_id
  }

  const offset = (query.page - 1) * query.per_page

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    'SELECT COUNT(*)::int as count FROM student_badges WHERE student_id = $1',
    [targetStudentId]
  )

  const { rows } = await pgQuery<BadgeRow>(
    c.env,
    `SELECT id, badge_type, badge_name, badge_description, badge_icon_svg, earned_at, metadata
     FROM student_badges
     WHERE student_id = $1
     ORDER BY earned_at DESC
     LIMIT $2 OFFSET $3`,
    [targetStudentId, query.per_page, offset]
  )

  return success({
    badges: rows,
    meta: {
      page: query.page, per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// GET /assessments/protocols — Lista de protocolos disponíveis
// (DEVE ficar antes de /:id para não conflitar)
// ============================================
assessments.get('/protocols', async (c) => {
  return success({ protocols: PROTOCOLS })
})

// ============================================
// GET /assessments/student/:studentId/history — Histórico completo (gráficos)
// (DEVE ficar antes de /:id para não conflitar)
// ============================================
assessments.get('/student/:studentId/history', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const studentId = c.req.param('studentId')

  // Verificar permissão
  if (userType === 'student' && studentId !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'personal') {
    await ensureStudentBelongsToPersonal(c.env, studentId, userId)
  }

  const { rows } = await pgQuery<{
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
    measurements: unknown
    protocol: string | null
  }>(
    c.env,
    `SELECT id, assessment_date, weight_kg, body_fat_percentage,
            fat_mass_kg, lean_mass_kg, muscle_mass_kg, bmi,
            bmi_classification, fat_classification,
            waist_hip_ratio, basal_metabolic_rate,
            measurements, protocol
     FROM assessments
     WHERE student_id = $1
     ORDER BY assessment_date ASC`,
    [studentId]
  )

  // Montar séries para gráficos
  const series = {
    dates: rows.map(r => r.assessment_date),
    weight: rows.map(r => r.weight_kg),
    fatPercentage: rows.map(r => r.body_fat_percentage),
    fatMass: rows.map(r => r.fat_mass_kg),
    leanMass: rows.map(r => r.lean_mass_kg),
    muscleMass: rows.map(r => r.muscle_mass_kg),
    bmi: rows.map(r => r.bmi),
    waistHipRatio: rows.map(r => r.waist_hip_ratio),
    bmr: rows.map(r => r.basal_metabolic_rate),
  }

  // Perímetros ao longo do tempo
  const perimeterSeries: Record<string, (number | null)[]> = {}
  for (const row of rows) {
    const m = typeof row.measurements === 'string'
      ? JSON.parse(row.measurements)
      : (row.measurements || {})
    for (const [key, val] of Object.entries(m as Record<string, unknown>)) {
      if (!perimeterSeries[key]) perimeterSeries[key] = []
      perimeterSeries[key].push(typeof val === 'number' ? val : null)
    }
  }

  return success({
    total_assessments: rows.length,
    assessments: rows,
    series,
    perimeterSeries,
  })
})

// ============================================
// GET /assessments/compare?ids=a,b — Comparar duas avaliações
// (DEVE ficar antes de /:id para não conflitar)
// ============================================
assessments.get('/compare', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const idsRaw = c.req.query('ids') || ''

  const ids = idsRaw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  if (ids.length !== 2) {
    throw new BadRequestError('Informe exatamente 2 IDs em ids=id1,id2')
  }

  const { rows } = await pgQuery<{
    id: string
    personal_id: string
    student_id: string
    assessment_date: string
    weight_kg: number | null
    body_fat_percentage: number | null
    muscle_mass_kg: number | null
    bmi: number | null
    basal_metabolic_rate: number | null
    measurements: unknown
  }>(
    c.env,
    `SELECT id, personal_id, student_id, assessment_date,
            weight_kg, body_fat_percentage, muscle_mass_kg, bmi,
            basal_metabolic_rate, measurements
     FROM assessments
     WHERE id = ANY($1::text[])
     ORDER BY assessment_date ASC`,
    [ids]
  )

  if (rows.length !== 2) {
    throw new NotFoundError('Avaliações')
  }

  const [first, second] = rows

  // Controle de acesso
  if (userType === 'personal' && (first.personal_id !== userId || second.personal_id !== userId)) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && (first.student_id !== userId || second.student_id !== userId)) {
    throw new ForbiddenError('Sem permissão')
  }
  if (first.student_id !== second.student_id) {
    throw new BadRequestError('As avaliações devem ser do mesmo aluno')
  }

  const toMeasurements = (value: unknown): Record<string, number> => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : (value || {})
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, number>>((acc, [k, v]) => {
      if (typeof v === 'number') acc[k] = v
      return acc
    }, {})
  }

  const delta = (a?: number | null, b?: number | null) => {
    if (a == null || b == null) return null
    return Number((b - a).toFixed(2))
  }

  const firstMeasurements = toMeasurements(first.measurements)
  const secondMeasurements = toMeasurements(second.measurements)
  const perimeterDiffs = comparePerimeters(secondMeasurements, firstMeasurements)

  return success({
    first,
    second,
    deltas: {
      weight_kg: delta(first.weight_kg, second.weight_kg),
      body_fat_percentage: delta(first.body_fat_percentage, second.body_fat_percentage),
      muscle_mass_kg: delta(first.muscle_mass_kg, second.muscle_mass_kg),
      bmi: delta(first.bmi, second.bmi),
      basal_metabolic_rate: delta(first.basal_metabolic_rate, second.basal_metabolic_rate),
      perimeters: perimeterDiffs,
    },
  })
})

// ============================================
// GET /assessments/:id — Detalhes (acesso verificado)
// ============================================
assessments.get('/:id', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && assessment.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  return success({ assessment })
})

// ============================================
// PATCH /assessments/:id — Atualizar (personal)
// ============================================
assessments.patch('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = updateAssessmentSchema.parse(body)

  await ensureAssessmentOwnership(c.env, id, personalId)

  // Build dynamic SET
  const setClauses: string[] = []
  const params: unknown[] = []
  let idx = 1

  const simpleFields = ['assessment_date', 'weight_kg', 'height_cm', 'body_fat_percentage', 'muscle_mass_kg', 'notes'] as const
  for (const field of simpleFields) {
    if (parsed[field] !== undefined) {
      setClauses.push(`${field} = $${idx}`)
      params.push(parsed[field])
      idx++
    }
  }

  if (parsed.measurements !== undefined) {
    setClauses.push(`measurements = $${idx}`)
    params.push(JSON.stringify(parsed.measurements))
    idx++
  }

  if (parsed.photos !== undefined) {
    setClauses.push(`photos = $${idx}`)
    params.push(JSON.stringify(parsed.photos))
    idx++
  }

  if (setClauses.length === 0) {
    throw new BadRequestError('Nenhum campo para atualizar')
  }

  // Recalcular BMI se weight ou height mudou
  if (parsed.weight_kg !== undefined || parsed.height_cm !== undefined) {
    // Buscar assessment atual para pegar os valores existentes
    const current = await findAssessmentById(c.env, id)
    if (current) {
      const w = parsed.weight_kg ?? current.weight_kg
      const h = parsed.height_cm ?? current.height_cm
      if (w && h) {
        const heightM = h / 100
        const bmi = Math.round((w / (heightM * heightM)) * 100) / 100
        setClauses.push(`bmi = $${idx}`)
        params.push(bmi)
        idx++
      }
    }
  }

  setClauses.push(`updated_at = $${idx}`)
  params.push(new Date().toISOString())
  idx++

  params.push(id)

  await pgQuery(c.env, `UPDATE assessments SET ${setClauses.join(', ')} WHERE id = $${idx}`, params)

  return success({ message: 'Avaliação atualizada' })
})

// ============================================
// DELETE /assessments/:id — Remover (personal)
// ============================================
assessments.delete('/:id', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const id = c.req.param('id')

  await ensureAssessmentOwnership(c.env, id, personalId)

  // Remover fotos do R2 se existirem
  const assessment = await findAssessmentById(c.env, id)
  if (assessment?.photos) {
    try {
      const photos = typeof assessment.photos === 'string' ? JSON.parse(assessment.photos) : assessment.photos
      if (Array.isArray(photos)) {
        for (const photo of photos) {
          if (photo.url) {
            const key = extractR2Key(photo.url)
            if (key) {
              await c.env.R2_IMAGES.delete(key)
            }
          }
        }
      }
    } catch {
      // Best effort cleanup
    }
  }

  await pgQuery(c.env, 'DELETE FROM assessments WHERE id = $1', [id])

  return noContent()
})

// ============================================
// POST /assessments/:id/photos — Upload foto (presigned URL)
// ============================================
assessments.post('/:id/photos', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = uploadAssessmentPhotoSchema.parse(body)

  // Admin/super_admin pode acessar qualquer assessment
  if (userType !== 'admin' && userType !== 'super_admin') {
    await ensureAssessmentOwnership(c.env, id, userId)
  }

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  // Gerar key para R2
  const ext = parsed.content_type.split('/')[1] || 'jpg'
  const photoKey = `assessments/${assessment.student_id}/${id}/${parsed.type}_${Date.now()}.${ext}`

  // Upload via direct put (não presigned, pois estamos no worker)
  // Frontend envia o body para esta rota e nós fazemos o upload
  // Aqui retornamos o endpoint para upload direto
  const uploadUrl = `/api/v1/assessments/${id}/photos/upload`

  return success({
    upload_url: uploadUrl,
    key: photoKey,
    type: parsed.type,
    content_type: parsed.content_type,
    max_size_mb: 10,
  })
})

// ============================================
// PUT /assessments/:id/photos/upload — Upload direto R2
// ============================================
assessments.put('/:id/photos/upload', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')
  const photoType = c.req.query('type') || 'custom'
  const key = c.req.query('key')

  if (!key) throw new BadRequestError('key obrigatória no query string')

  // Admin/super_admin pode acessar qualquer assessment
  if (userType !== 'admin' && userType !== 'super_admin') {
    await ensureAssessmentOwnership(c.env, id, userId)
  }

  const contentType = c.req.header('Content-Type') || 'image/jpeg'
  const body = await c.req.arrayBuffer()

  if (body.byteLength > 10 * 1024 * 1024) {
    throw new BadRequestError('Arquivo excede 10MB')
  }

  await c.env.R2_IMAGES.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: { assessment_id: id, type: photoType },
  })

  // Atualizar photos JSON na assessment
  const assessment = await findAssessmentById(c.env, id)
  const currentPhotos = parsePhotos(assessment?.photos)
  const photoUrl = `${c.env.R2_IMAGES_URL || 'https://images.iapersonal.app.br'}/${key}`

  currentPhotos.push({
    type: photoType,
    url: photoUrl,
    order: currentPhotos.length,
  })

  await pgQuery(c.env, `UPDATE assessments SET photos = $1, updated_at = $2 WHERE id = $3`, [
    JSON.stringify(currentPhotos),
    new Date().toISOString(),
    id,
  ])

  return created({ url: photoUrl, key, type: photoType })
})

// ============================================
// DELETE /assessments/:id/photos/:idx — Remover foto
// ============================================
assessments.delete('/:id/photos/:idx', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')
  const photoIdx = parseInt(c.req.param('idx'), 10)

  // Admin/super_admin pode acessar qualquer assessment
  if (userType !== 'admin' && userType !== 'super_admin') {
    await ensureAssessmentOwnership(c.env, id, userId)
  }

  const assessment = await findAssessmentById(c.env, id)
  const currentPhotos = parsePhotos(assessment?.photos)

  if (photoIdx < 0 || photoIdx >= currentPhotos.length) {
    throw new BadRequestError('Índice de foto inválido')
  }

  const removed = currentPhotos.splice(photoIdx, 1)[0]

  // Remover do R2
  if (removed?.url) {
    const key = extractR2Key(removed.url)
    if (key) {
      await c.env.R2_IMAGES.delete(key)
    }
  }

  // Reindexar orders
  currentPhotos.forEach((p: { order?: number }, i: number) => { p.order = i })

  await pgQuery(c.env, `UPDATE assessments SET photos = $1, updated_at = $2 WHERE id = $3`, [
    JSON.stringify(currentPhotos),
    new Date().toISOString(),
    id,
  ])

  return noContent()
})

// ============================================
// GET /assessments/:id/pdf — Gerar/baixar PDF
// ============================================
assessments.get('/:id/pdf', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const requestId = c.get('requestId')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  // Verificar acesso
  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && assessment.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  // force=1 → regenerar PDF mesmo se já existir (ex: após upgrade de template)
  const forceRegenerate = c.req.query('force') === '1' || c.req.query('force') === 'true'

  // Se já tem PDF e não é force, retorna o existente
  if (!forceRegenerate && assessment.pdf_generated && assessment.pdf_url) {
    return success({ pdf_url: assessment.pdf_url, generated_at: assessment.pdf_generated_at })
  }

  // Modo "check": permite polling sem re-enfileirar tarefas
  const checkOnly = c.req.query('check') === '1' || c.req.query('check') === 'true'
  if (checkOnly) {
    return success({ status: 'pending' })
  }

  // Se a Queue não estiver configurada, gera síncrono (fallback)
  if (!c.env.PDF_QUEUE) {
    const generated = await generateAndStoreAssessmentPdf(c.env, id, { force: forceRegenerate })
    return success({ pdf_url: generated.pdf_url, generated_at: generated.generated_at, status: 'ready' })
  }

  const enqueue = await enqueueWithRetry(
    c.env.PDF_QUEUE,
    {
      type: 'assessment_pdf',
      assessment_id: id,
      student_id: assessment.student_id,
      personal_id: assessment.personal_id,
    },
    {
      queueName: 'PDF_QUEUE',
      requestId,
      maxAttempts: 3,
      baseBackoffMs: 150,
      maxBackoffMs: 1_000,
    }
  )

  if (!enqueue.queued) {
    throw new BadRequestError('Fila de PDF indisponível no momento')
  }

  return success({
    message: 'PDF sendo gerado, você será notificado quando estiver pronto',
    status: 'queued',
  })
})

// ============================================
// HELPERS
// ============================================

async function ensureStudentBelongsToPersonal(
  env: Bindings, studentId: string, personalId: string
): Promise<void> {
  const { rows } = await pgQuery<{ id: string }>(
    env, 'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [studentId, personalId]
  )
  if (rows.length === 0) throw new ForbiddenError('Aluno não pertence ao seu perfil')
}

async function ensureAssessmentOwnership(
  env: Bindings, assessmentId: string, personalId: string
): Promise<void> {
  const { rows } = await pgQuery<{ id: string }>(
    env, 'SELECT id FROM assessments WHERE id = $1 AND personal_id = $2 LIMIT 1',
    [assessmentId, personalId]
  )
  if (rows.length === 0) throw new NotFoundError('Avaliação')
}

interface AssessmentRow {
  id: string
  student_id: string
  personal_id: string
  assessment_date: string
  weight_kg: number | null
  height_cm: number | null
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  bmi: number | null
  measurements: unknown
  photos: unknown
  ai_analysis: unknown
  notes: string | null
  pdf_generated: boolean
  pdf_url: string | null
  pdf_generated_at: string | null
  created_at: string
  updated_at: string
  student_name?: string
  personal_name?: string

  // Assessment 2.0
  protocol: string | null
  protocol_version: string | null
  density_formula: string | null
  skinfolds: unknown
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
  body_composition: unknown
  notified_at: string | null
  share_token: string | null
  share_expires_at: string | null
}

interface EvolutionRow {
  assessment_date: string
  weight_kg: number | null
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  bmi: number | null
  measurements: unknown
}

interface BadgeRow {
  id: string
  badge_type: string
  badge_name: string
  badge_description: string | null
  badge_icon_svg: string | null
  earned_at: string
  metadata: unknown
}

async function findAssessmentById(env: Bindings, id: string): Promise<AssessmentRow | null> {
  const { rows } = await pgQuery<AssessmentRow>(
    env,
    `SELECT a.*, 
            COALESCE(u.full_name, 'Usuário sem registro') as student_name
     FROM assessments a
     LEFT JOIN users u ON u.id = a.student_id
     WHERE a.id = $1 LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

/**
 * Criar notificação interna (reutilizável)
 */
export async function createNotificationInternal(
  env: Bindings,
  data: { user_id: string; type: string; title: string; message: string; link?: string | null }
): Promise<void> {
  // Compat: usado por outros routers (chat/payments). A partir de agora,
  // respeita preferências do usuário e envia push best-effort quando habilitado.
  await notify(env, data.user_id, {
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link || undefined,
  })
}

function delta(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null
  return Math.round((a - b) * 100) / 100
}

// ============================================
// POST /assessments/:id/edit-photos — Editar fotos com IA
// ============================================
assessments.post('/:id/edit-photos', async (c) => {
  try {
    const userId = c.get('userId')
    const userType = c.get('userType')
    const assessmentId = c.req.param('id')
    console.log(`[edit-photos] Start: assessmentId=${assessmentId}, userId=${userId}, userType=${userType}`)

    const body = await c.req.json() as {
      photos?: Array<{ url: string; type: string }>
      style: 'leaner_man' | 'leaner_woman' | 'muscular_man'
    }

    if (!body.style || !['leaner_man', 'leaner_woman', 'muscular_man'].includes(body.style)) {
      return c.json({ error: 'Invalid style. Must be "leaner_man", "leaner_woman", or "muscular_man"' }, 400)
    }

    // Verificar ownership (admin/super_admin pode editar qualquer)
    const assessment = await findAssessmentById(c.env, assessmentId)
    if (!assessment) {
      console.log(`[edit-photos] Assessment not found: ${assessmentId}`)
      return c.json({ error: 'Avaliação não encontrada' }, 404)
    }
    if (userType !== 'admin' && userType !== 'super_admin' && assessment.personal_id !== userId) {
      return c.json({ error: 'Sem permissão' }, 403)
    }

    // Se photos vazio/omitido, buscar do assessment no DB
    let photosToEdit = body.photos && body.photos.length > 0 ? body.photos : []
    if (photosToEdit.length === 0) {
      const currentPhotos = parsePhotos(assessment.photos)
      console.log(
        `[edit-photos] Photos from DB: ${currentPhotos.length}`,
        JSON.stringify(currentPhotos.map((p) => ({ type: p.type })))
      )
      photosToEdit = currentPhotos.map(p => ({ url: p.url, type: p.type }))
    }

    // Sanitizar lista de fotos (evita falhas por payload legado sem URL string)
    photosToEdit = photosToEdit.filter(
      (p): p is { url: string; type: string } =>
        typeof p?.url === 'string' && p.url.trim().length > 0 && typeof p?.type === 'string'
    )

    if (photosToEdit.length === 0) {
      console.log(`[edit-photos] No photos found for assessment ${assessmentId}`)
      return c.json({ error: 'No photos found in assessment. Photos may not have uploaded correctly.' }, 400)
    }

    const token = c.env.REPLICATE_API_TOKEN
    if (!token) {
      console.log('[edit-photos] REPLICATE_API_TOKEN not set')
      return c.json({ error: 'AI service not available' }, 503)
    }

    // Processar cada foto com nano-banana (paralelo para evitar timeout)
    const editedPhotos: Array<{ original_url: string; edited_url: string; type: string; style: string }> = []
    const errors: string[] = []

    const results = await Promise.all(
      photosToEdit.map(async (photo) => {
        try {
          console.log(`[edit-photos] Processing ${photo.type}: ${photo.url.slice(0, 80)}...`)
          const edited = await editPhotoWithNanoBanana(token, photo.url, body.style)
          console.log(`[edit-photos] Success for ${photo.type}: ${edited.slice(0, 80)}...`)
          return {
            ok: true as const,
            value: {
              original_url: photo.url,
              edited_url: edited,
              type: photo.type,
              style: body.style,
            },
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error(`[edit-photos] Failed for ${photo.type}:`, msg)
          return { ok: false as const, error: `${photo.type}: ${msg}` }
        }
      })
    )

    for (const result of results) {
      if (result.ok) editedPhotos.push(result.value)
      else errors.push(result.error)
    }

    if (editedPhotos.length === 0) {
      console.error(`[edit-photos] All photos failed. Errors:`, errors)
      return c.json({ error: 'Failed to edit photos', details: errors }, 500)
    }

    // Salvar metadados de fotos editadas
    const now = new Date().toISOString()
    await pgQuery(c.env, `
      UPDATE assessments
      SET ai_analysis = JSONB_SET(COALESCE(ai_analysis, '{}'::jsonb), '{edited_photos}', $1::jsonb),
          updated_at = $2
      WHERE id = $3
    `, [JSON.stringify(editedPhotos), now, assessmentId])

    console.log(`[edit-photos] Done! ${editedPhotos.length} photos edited, ${errors.length} errors`)
    return success({ edited_photos: editedPhotos })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error(`[edit-photos] UNHANDLED ERROR:`, msg, stack)
    return c.json({ error: 'Internal error in edit-photos', detail: msg }, 500)
  }
})

// ============================================
// Helper: Gerar feedback de avaliação com Claude
// ============================================
async function generateAssessmentFeedback(
  env: Bindings,
  assessmentData: {
    studentName: string
    bmi: number
    weight_kg: number
    height_cm: number
    body_fat_percentage?: number
    muscle_mass_kg?: number
    measurements: Record<string, string | number>
    previousAssessment?: {
      weight_kg: number
      body_fat_percentage?: number
      bmi: number
    }
  }
): Promise<{
  summary: string
  strengths: string[]
  improvements: string[]
}> {
  try {
    const prompt = PROMPTS.analyze_assessment(assessmentData)

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        model: 'meta/meta-llama-3-70b-instruct',
        input: {
          prompt: prompt,
          max_tokens: 1000,
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      throw new InternalError(`Claude API error: ${response.status}`)
    }

    const data = (await response.json()) as { output?: string[] | string }
    let textOutput = ''

    if (Array.isArray(data.output)) {
      textOutput = data.output.join('')
    } else if (typeof data.output === 'string') {
      textOutput = data.output
    }

    // Parse JSON da resposta
    const jsonMatch = textOutput.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[Assessment Feedback] Could not parse JSON from LLM output')
      return {
        summary: 'Avaliação concluída com sucesso!',
        strengths: ['Continuidade no acompanhamento'],
        improvements: ['Agende próxima avaliação'],
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary: string
      strengths: string[]
      improvements: string[]
    }

    return parsed
  } catch (err) {
    console.error('[Assessment Feedback Generation] Error:', err)
    // Fallback se IA falhar
    return {
      summary: 'Avaliação registrada com sucesso!',
      strengths: ['Dados coletados com precisão'],
      improvements: ['Próximo passo: agendar sessão de treinamento'],
    }
  }
}

// ============================================
// Helper: Editar foto com Google Nano Banana
// ============================================
async function editPhotoWithNanoBanana(
  token: string,
  photoUrl: string,
  style: 'leaner_man' | 'leaner_woman' | 'muscular_man'
): Promise<string> {
  let stylePrompt: string

  if (style === 'leaner_woman') {
    stylePrompt = `Subtly make the woman look leaner and more toned. Reduce body fat to show better muscle definition, especially in the abdomen, legs, and arms. Keep her facial features, skin tone, hair, and overall appearance EXACTLY the same - only modify the body shape to appear slimmer. The face must remain absolutely unchanged. Focus only on body composition changes.`
  } else if (style === 'leaner_man') {
    stylePrompt = `Make the man look significantly leaner with visible muscle definition. Reduce body fat, make the abdomen flat and defined, enhance muscle tone in the shoulders, chest, and arms while keeping the face completely unchanged. Show more muscle definition without adding bulk - focus on visible muscularity from lower body fat.`
  } else {
    // muscular_man
    stylePrompt = `Transform the man to look more muscular and athletic. Increase muscle mass in the shoulders, chest, arms, and legs. Make the physique more defined and powerful while keeping the face completely unchanged. Add visible muscle size and definition throughout the body. The face must remain exactly the same - only the body should be more muscular.`
  }

  const imageAsDataUri = await toImageDataUri(photoUrl)
  const nanoBananaVersion = await getNanoBananaVersion(token)

  const requestVariants: Array<Record<string, unknown>> = [
    {
      version: nanoBananaVersion,
      input: {
        prompt: stylePrompt,
        image_input: imageAsDataUri ? [imageAsDataUri] : [photoUrl],
        output_format: 'jpg',
        aspect_ratio: 'match_input_image',
      },
    },
    {
      version: nanoBananaVersion,
      input: {
        prompt: stylePrompt,
        image_input: imageAsDataUri || photoUrl,
        output_format: 'jpg',
        aspect_ratio: 'match_input_image',
      },
    },
    {
      version: nanoBananaVersion,
      input: {
        prompt: stylePrompt,
        image: photoUrl,
        output_format: 'jpg',
        aspect_ratio: 'match_input_image',
      },
    },
  ]

  let responseText = ''
  let responseStatus = 0

  type NanoPrediction = {
    id?: string
    output?: unknown
    status?: string
    error?: string
  }

  let data: NanoPrediction | null = null

  for (const payload of requestVariants) {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify(payload),
    })

    responseStatus = response.status
    responseText = await response.text()
    console.log(`[Nano Banana] Response ${response.status}: ${responseText.substring(0, 500)}`)

    if (!response.ok) {
      continue
    }

    try {
      data = JSON.parse(responseText) as NanoPrediction
      break
    } catch {
      throw new InternalError(`Invalid JSON from Replicate: ${responseText.substring(0, 200)}`)
    }
  }

  if (!data) {
    throw new InternalError(`Nano Banana API error: ${responseStatus} — ${responseText.substring(0, 200)}`)
  }

  // Se o status ainda é "processing", fazer polling
  if (data.status === 'processing' || data.status === 'starting') {
    // Esperar e tentar de novo (máximo 3 tentativas de 10s)
    if (!data.id) {
      throw new InternalError('Replicate prediction id ausente para polling')
    }
    const predictionUrl = `https://api.replicate.com/v1/predictions/${data.id}`
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 10000)) // 10s wait
      const pollResp = await fetch(predictionUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      data = await pollResp.json() as typeof data
      console.log(`[Nano Banana] Poll ${i + 1}: status=${data.status}`)
      if (data.status === 'succeeded') break
      if (data.status === 'failed' || data.status === 'canceled') {
        throw new InternalError(`Nano Banana ${data.status}: ${data.error || 'unknown'}`)
      }
    }
  }

  if (data.error) {
    throw new InternalError(`Nano Banana error: ${data.error}`)
  }

  const outputUrl = extractImageUrlFromOutput(data.output)
  if (outputUrl) return outputUrl

  throw new InternalError('Invalid response from Nano Banana')
}

function parsePhotos(photos: unknown): Array<{ type: string; url: string; order: number }> {
  if (!photos) return []
  try {
    const arr = typeof photos === 'string' ? JSON.parse(photos) : photos
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function extractImageUrlFromOutput(output: unknown): string | null {
  if (!output) return null
  if (typeof output === 'string') return output

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractImageUrlFromOutput(item)
      if (url) return url
    }
    return null
  }

  if (typeof output === 'object') {
    const record = output as Record<string, unknown>
    const direct = ['url', 'uri', 'image', 'image_url', 'output_url']

    for (const key of direct) {
      const val = record[key]
      if (typeof val === 'string') return val
      const nested = extractImageUrlFromOutput(val)
      if (nested) return nested
    }

    for (const val of Object.values(record)) {
      const nested = extractImageUrlFromOutput(val)
      if (nested) return nested
    }
  }

  return null
}

async function toImageDataUri(photoUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(photoUrl)
    if (!resp.ok) return null
    const contentType = resp.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) return null
    const bytes = await resp.arrayBuffer()
    if (bytes.byteLength === 0 || bytes.byteLength > 8 * 1024 * 1024) {
      return null
    }
    let binary = ''
    const chunk = 0x8000
    const u8 = new Uint8Array(bytes)
    for (let i = 0; i < u8.length; i += chunk) {
      binary += String.fromCharCode(...u8.subarray(i, i + chunk))
    }
    const base64 = btoa(binary)
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

let nanoBananaVersionCache: string | null = null

async function getNanoBananaVersion(token: string): Promise<string> {
  if (nanoBananaVersionCache) return nanoBananaVersionCache

  const resp = await fetch('https://api.replicate.com/v1/models/google/nano-banana', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!resp.ok) {
    const txt = await resp.text()
    throw new InternalError(`Falha ao obter versão do nano-banana: ${resp.status} ${txt.slice(0, 160)}`)
  }

  const data = await resp.json() as { latest_version?: { id?: string } }
  const versionId = data.latest_version?.id
  if (!versionId) {
    throw new InternalError('Nano Banana sem latest_version na API Replicate')
  }

  nanoBananaVersionCache = versionId
  return versionId
}

function extractR2Key(url: string): string | null {
  try {
    const u = new URL(url)
    return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname
  } catch {
    return null
  }
}

// ============================================
// Assessment 2.0: saveEvolution helper
// ============================================
async function saveEvolution(
  env: Bindings,
  data: {
    assessmentId: string
    studentId: string
    personalId: string
    assessmentDate: string
    bodyComp: BodyCompositionResult
    measurements: Record<string, unknown>
  }
): Promise<void> {
  // Buscar avaliação anterior
  const prev = await pgQueryOne<{
    id: string
    assessment_date: string
    body_composition: string | null
    measurements: string | null
    weight_kg: number | null
    body_fat_percentage: number | null
    lean_mass_kg: number | null
    muscle_mass_kg: number | null
    bmi: number | null
    fat_mass_kg: number | null
  }>(
    env,
    `SELECT id, assessment_date, body_composition, measurements,
            weight_kg, body_fat_percentage, lean_mass_kg, muscle_mass_kg, bmi, fat_mass_kg
     FROM assessments
     WHERE student_id = $1 AND id != $2
     ORDER BY assessment_date DESC LIMIT 1`,
    [data.studentId, data.assessmentId]
  )

  if (!prev) return // Primeira avaliação — sem evolução

  // Parse body_composition da avaliação anterior
  let prevBodyComp: BodyCompositionResult | null = null
  try {
    const raw = typeof prev.body_composition === 'string'
      ? JSON.parse(prev.body_composition)
      : prev.body_composition
    if (raw && raw.fatPercentage != null) {
      prevBodyComp = raw as BodyCompositionResult
    }
  } catch { /* ignore */ }

  // Se não temos body_composition salva, montar uma versão simplificada
  if (!prevBodyComp && prev.weight_kg && prev.bmi != null) {
    // Não temos dados completos — salvar diffs básicos
    const weightDiff = data.bodyComp.fatMassKg + data.bodyComp.leanMassKg - (prev.weight_kg || 0)
    const fatDiff = data.bodyComp.fatPercentage - (prev.body_fat_percentage || 0)

    const evolId = generateId()
    await pgQuery(env, `
      INSERT INTO assessment_evolution (
        id, student_id, personal_id, current_assessment_id, previous_assessment_id,
        weight_diff, fat_percentage_diff, fat_mass_diff, lean_mass_diff,
        muscle_mass_diff, bmi_diff, overall_score, days_between, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      evolId, data.studentId, data.personalId, data.assessmentId, prev.id,
      Math.round(weightDiff * 100) / 100,
      Math.round(fatDiff * 100) / 100,
      null, null, null, null,
      50,  // neutral score
      Math.round((new Date(data.assessmentDate).getTime() - new Date(prev.assessment_date).getTime()) / 86400000),
      new Date().toISOString(),
    ])
    return
  }

  if (!prevBodyComp) return

  // Calcular evolução completa
  const evolution = calculateEvolution({
    current: data.bodyComp,
    previous: prevBodyComp,
    currentDate: data.assessmentDate,
    previousDate: prev.assessment_date,
  })

  // Comparar perímetros
  const prevMeasurements = typeof prev.measurements === 'string'
    ? JSON.parse(prev.measurements)
    : (prev.measurements || {})
  const perimeterDiffs = comparePerimeters(
    data.measurements as Record<string, number | undefined>,
    prevMeasurements as Record<string, number | undefined>
  )

  const evolId = generateId()
  const weightDiff = evolution.diffs.find(d => d.field === 'weight')?.diff ?? null
  const fatPercentageDiff = evolution.diffs.find(d => d.field === 'fatPercentage')?.diff ?? null
  const fatMassDiff = evolution.diffs.find(d => d.field === 'fatMass')?.diff ?? null
  const leanMassDiff = evolution.diffs.find(d => d.field === 'leanMass')?.diff ?? null
  const muscleMassDiff = evolution.diffs.find(d => d.field === 'muscleMass')?.diff ?? null
  const bmiDiff = evolution.diffs.find(d => d.field === 'bmi')?.diff ?? null
  const waistDiff = perimeterDiffs.find(d => d.name === 'waist')?.diffCm ?? null

  await pgQuery(env, `
    INSERT INTO assessment_evolution (
      id, student_id, personal_id, current_assessment_id, previous_assessment_id,
      weight_diff, fat_percentage_diff, fat_mass_diff, lean_mass_diff,
      muscle_mass_diff, bmi_diff, waist_diff,
      overall_score, diffs, perimeter_diffs, days_between, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  `, [
    evolId, data.studentId, data.personalId, data.assessmentId, prev.id,
    weightDiff, fatPercentageDiff, fatMassDiff, leanMassDiff,
    muscleMassDiff, bmiDiff, waistDiff,
    evolution.overallScore,
    JSON.stringify(evolution.diffs),
    JSON.stringify(perimeterDiffs),
    evolution.daysBetween,
    new Date().toISOString(),
  ])

  // Atualizar interpretação com evolução
  try {
    const interpretation = generateInterpretation(
      data.bodyComp,
      '',  // será preenchido no frontend
      evolution
    )
    await pgQuery(env, `
      UPDATE assessments SET ai_interpretation = $1 WHERE id = $2
    `, [interpretation, data.assessmentId])
  } catch { /* best-effort */ }
}

// ============================================
// GET /assessments/:id/evolution — Evolução vs avaliação anterior
// ============================================
assessments.get('/:id/evolution', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && assessment.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  const evolution = await pgQueryOne<{
    id: string
    weight_diff: number | null
    fat_percentage_diff: number | null
    fat_mass_diff: number | null
    lean_mass_diff: number | null
    muscle_mass_diff: number | null
    bmi_diff: number | null
    waist_diff: number | null
    overall_score: number
    diffs: unknown
    perimeter_diffs: unknown
    days_between: number
    previous_assessment_id: string | null
    created_at: string
  }>(
    c.env,
    `SELECT * FROM assessment_evolution WHERE current_assessment_id = $1 LIMIT 1`,
    [id]
  )

  if (!evolution) {
    return success({ evolution: null, message: 'Primeira avaliação — sem dados de evolução' })
  }

  return success({ evolution })
})

// ============================================
// POST /assessments/:id/notify — Notificar aluno que resultado está pronto
// ============================================
assessments.post('/:id/notify', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  if (!assessment.student_id) {
    throw new BadRequestError('Avaliação sem aluno associado')
  }

  // Buscar nome do personal
  const personal = await pgQueryOne<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1',
    [assessment.personal_id]
  )

  const bmiLabel = assessment.bmi_classification || 'Normal'
  const fatLabel = assessment.fat_classification || ''
  const bmiVal = assessment.bmi ?? 0
  const fatVal = assessment.body_fat_percentage ?? 0

  // Notificação (in-app + push) — respeita preferências e é best-effort.
  await notifyEvent(c.env, assessment.student_id, 'assessment.ready', {
    personalName: personal?.full_name || 'Seu personal',
    assessmentId: id,
  }).catch(() => {})

  const notifiedAt = new Date().toISOString()
  await pgQuery(c.env, `UPDATE assessments SET notified_at = $1 WHERE id = $2`, [
    notifiedAt,
    id,
  ])

  return success({ message: 'Notificação enviada ao aluno', notified_at: notifiedAt })
})

// ============================================
// POST /assessments/:id/send-email — Enviar avaliação por email ao aluno
// ============================================
assessments.post('/:id/send-email', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  if (!assessment.student_id) {
    throw new BadRequestError('Avaliação sem aluno associado')
  }

  // Buscar email do aluno e nome do personal
  const student = await pgQueryOne<{ full_name: string; email: string }>(
    c.env,
    'SELECT full_name, email FROM users WHERE id = $1',
    [assessment.student_id]
  )
  if (!student?.email) {
    throw new BadRequestError('Aluno sem email cadastrado')
  }

  const personal = await pgQueryOne<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1',
    [assessment.personal_id]
  )

  // Gerar share URL se não existir
  let shareUrl = ''
  if (assessment.share_token) {
    shareUrl = `https://iapersonal.app.br/assessment/share?token=${assessment.share_token}`
  } else {
    shareUrl = `https://iapersonal.app.br/dashboard/assessments/view?id=${id}`
  }

  const assessmentDate = new Date(assessment.assessment_date).toLocaleDateString('pt-BR')

  await sendEmail(c.env.EMAIL_QUEUE, {
    to: student.email,
    subject: `Avaliação Física — ${assessmentDate} — VFIT`,
    template: 'assessment-report',
    data: {
      student_name: student.full_name || 'Aluno',
      personal_name: personal?.full_name || 'Seu personal',
      assessment_date: assessmentDate,
      share_url: shareUrl,
      pdf_url: assessment.pdf_url || '',
      weight_kg: assessment.weight_kg?.toString() || '',
      body_fat_percentage: assessment.body_fat_percentage?.toString() || '',
      bmi: assessment.bmi?.toString() || '',
      fat_classification: assessment.fat_classification || '',
    },
  })

  return success({ message: 'Email enviado com sucesso', sent_to: student.email })
})

// ============================================
// GET /assessments/:id/interpretation — Interpretação IA dos resultados
// ============================================
assessments.get('/:id/interpretation', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && assessment.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  // Se já tem interpretação salva, retornar
  if (assessment.ai_interpretation) {
    return success({ interpretation: assessment.ai_interpretation })
  }

  // Tentar gerar a partir do body_composition salvo
  if (assessment.body_composition) {
    try {
      const bc = typeof assessment.body_composition === 'string'
        ? JSON.parse(assessment.body_composition as string)
        : assessment.body_composition
      
      if (bc && bc.fatPercentage != null) {
        const interpretation = generateInterpretation(
          bc as BodyCompositionResult,
          assessment.student_name || 'Aluno'
        )
        // Salvar para cache
        await pgQuery(c.env, `UPDATE assessments SET ai_interpretation = $1 WHERE id = $2`, [
          interpretation, id
        ])
        return success({ interpretation })
      }
    } catch { /* ignore */ }
  }

  return success({ interpretation: null, message: 'Dados insuficientes para interpretação' })
})

// ============================================
// POST /assessments/:id/share — Gerar link compartilhável
// ============================================
assessments.post('/:id/share', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const id = c.req.param('id')

  const assessment = await findAssessmentById(c.env, id)
  if (!assessment) throw new NotFoundError('Avaliação')

  if (userType === 'personal' && assessment.personal_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }
  if (userType === 'student' && assessment.student_id !== userId) {
    throw new ForbiddenError('Sem permissão')
  }

  // Se já tem token válido, retorna
  if (assessment.share_token && assessment.share_expires_at) {
    const expires = new Date(assessment.share_expires_at)
    if (expires > new Date()) {
      return success({
        share_token: assessment.share_token,
        share_url: `https://iapersonal.app.br/assessment/share?token=${assessment.share_token}`,
        expires_at: assessment.share_expires_at,
      })
    }
  }

  // Gerar novo token (64 chars hex)
  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const shareToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')

  // Expira em 30 dias
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await pgQuery(c.env,
    `UPDATE assessments SET share_token = $1, share_expires_at = $2, updated_at = NOW() WHERE id = $3`,
    [shareToken, expiresAt, id]
  )

  return success({
    share_token: shareToken,
    share_url: `https://iapersonal.app.br/assessment/share?token=${shareToken}`,
    expires_at: expiresAt,
  })
})

export { assessments as assessmentsRoutes }

// ============================================
// PUBLIC — Busca avaliação por share_token (sem auth)
// ============================================
export async function getSharedAssessment(env: Bindings, shareToken: string) {
  const { rows } = await pgQuery<AssessmentRow & {
    personal_name: string
    personal_photo: string | null
    personal_cref: string | null
    personal_cref_state: string | null
    personal_cref_verified: boolean
    personal_bio: string | null
    personal_specialties: string[] | null
    student_name: string
    student_photo: string | null
  }>(
    env,
    `SELECT a.*,
            pu.full_name   as personal_name,
            pu.profile_photo_url as personal_photo,
            p.cref         as personal_cref,
            p.cref_state   as personal_cref_state,
            p.cref_verified as personal_cref_verified,
            p.bio          as personal_bio,
            p.specialties  as personal_specialties,
            su.full_name   as student_name,
            su.profile_photo_url as student_photo
     FROM assessments a
     LEFT JOIN users pu ON pu.id = a.personal_id
     LEFT JOIN personals p ON p.id = a.personal_id
     LEFT JOIN users su ON su.id = a.student_id
     WHERE a.share_token = $1
     LIMIT 1`,
    [shareToken]
  )

  const assessment = rows[0]
  if (!assessment) return null

  // Verificar expiração
  if (assessment.share_expires_at) {
    const expires = new Date(assessment.share_expires_at)
    if (expires < new Date()) return null
  }

  return assessment
}
