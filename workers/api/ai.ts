/**
 * workers/api/ai.ts
 *
 * ai.ts — Endpoints de geração com IA (Cloudflare Workers AI + Replicate fallback)
 * Features: DB: Neon, Workers AI binding nativo, AI Gateway
 */

// ============================================
// ai.ts — Endpoints de geração com IA
// ============================================
//
// O que faz:
//   Centraliza todos os endpoints de IA: geração de treino personalizado,
//   comparação de fotos antes/depois, assistente conversacional, conteúdo
//   marketing, análise de sentimento, sugestão de cobranças e transcrição.
//
// Fluxo de providers:
//   1. Workers AI (Llama 3.3 70B / Llama 4 Scout / Llama 3.1 8B) — zero cost, binding nativo
//   2. Replicate (Gemini Flash / Llama 70B / CLIP) — fallback pago
//   3. Mock — dev only, sem API keys
//
// Exports principais:
//   aiRoutes — Hono app montado em /api/v1/ai
//
// Auth: requireAuth em todas as rotas
// DB: ai_usage_logs (task_type, model_used, tokens_used, provider)
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import {
  generateWorkoutSchema,
  comparePhotosSchema,
  assistantChatSchema,
  generateContentSchema,
  analyzeSentimentSchema,
  smartBillingSchema,
  transcribeVideoSchema,
} from '@workers/schemas/ai'
import { pgQuery, generateId } from '@lib/db'
import { success, created } from '@lib/response'
import { AppError, NotFoundError, BadRequestError, ForbiddenError, InternalError } from '@lib/errors'
import { enqueueWithRetry } from '@lib/queue'
import { selectModel, selectWorkersAIModel, AI_MODELS } from '@config/ai-models'
import type { AITaskType, AIComplexity } from '@config/ai-models'
import { callWorkersAIWithFallback } from '@lib/workers-ai'
import { PROMPTS } from '@lib/ai-prompts'
import type { StudentData, StudentBillingData, ExerciseForPrompt, WorkoutGenerationParams } from '@lib/ai-prompts'

const ai = new Hono<AppContext>()

ai.use('*', authMiddleware)

// ============================================
// Guardrails de custo/uso (mensal)
// - rateLimitMiddleware já limita por minuto
// - aqui evitamos runaway por mês
// ============================================

function getMonthlyAiCallLimit(userType: string, userRole?: string | null): number {
  // Admins: limite mais alto (ainda finito)
  if (userRole === 'super_admin' || userRole === 'admin' || userType === 'admin') return 10_000
  if (userType === 'student') return 500
  // personal (default)
  return 3_000
}

async function assertMonthlyAiQuota(env: Bindings, userId: string, limit: number): Promise<void> {
  try {
    const { rows } = await pgQuery<{ total_calls: number }>(
      env,
      `SELECT COUNT(*)::int as total_calls
       FROM ai_usage_logs
       WHERE user_id = $1 AND created_at >= DATE_TRUNC('month', NOW())`,
      [userId]
    )

    const total = rows[0]?.total_calls ?? 0
    if (total >= limit) {
      throw new AppError(
        429,
        `Limite mensal de IA atingido (${total}/${limit}). Tente novamente no próximo mês ou fale com o suporte.`,
        'AI_QUOTA_EXCEEDED',
        { total_calls: total, limit }
      )
    }
  } catch (err) {
    // Se for o AppError acima (quota), propagar.
    if (err instanceof AppError && err.code === 'AI_QUOTA_EXCEEDED') throw err
    // Se tabela ainda não existir/erro transitório, não bloquear.
    console.warn('[AI] Quota check failed (ignored):', err)
  }
}

// ============================================
// POST /ai/workout/generate — Gerar treino via IA
// ============================================
ai.post('/workout/generate', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const body = await c.req.json()
  const parsed = generateWorkoutSchema.parse(body)

  // student_id é opcional — quando ausente, gera treino genérico (ex: via chat IA)
  let student: (StudentData & { fitness_level: string | null; total_workouts_completed: number }) | null = null

  if (parsed.student_id) {
    // Verificar ownership do aluno
    const { rows: studentRows } = await pgQuery<{
      id: string; personal_id: string; goals: unknown; medical_restrictions: string | null
      fitness_level: string | null; total_workouts_completed: number
    }>(
      c.env,
      `SELECT s.id, s.personal_id, s.goals, s.medical_restrictions, s.fitness_level,
              s.total_workouts_completed, u.full_name, s.date_of_birth
       FROM students s JOIN users u ON u.id = s.id
       WHERE s.id = $1 AND s.personal_id = $2 LIMIT 1`,
      [parsed.student_id, personalId]
    )
    if (studentRows.length === 0) throw new ForbiddenError('Aluno não pertence ao seu perfil')
    student = studentRows[0] as StudentData & typeof studentRows[0]
  }

  // Map complexity: frontend pode enviar 'simple'|'moderate'|'complex', backend aceita 'low'|'medium'|'high'
  const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
    simple: 'low', low: 'low',
    moderate: 'medium', medium: 'medium',
    complex: 'high', high: 'high',
  }
  const normalizedComplexity = complexityMap[parsed.complexity] || 'low'
  const model = selectModel('workout', normalizedComplexity)

  // Buscar exercícios do D1 para injetar no prompt
  let exercisesForPrompt: ExerciseForPrompt[] = []
  try {
    const d1Result = await c.env.DB
      .prepare('SELECT id, name_pt, muscle_group_id, difficulty, equipment_needed FROM exercises WHERE is_default = 1 ORDER BY muscle_group_id, name_pt')
      .all()
    exercisesForPrompt = (d1Result.results || []) as unknown as ExerciseForPrompt[]
  } catch {
    console.error('[AI] Failed to fetch exercises from D1, proceeding without exercise list')
  }

  // Construir dados do aluno (ou genérico quando student_id ausente)
  const studentData: StudentData = student
    ? {
        id: student.id,
        name: (student as unknown as { full_name: string }).full_name || 'Aluno',
        level: student.fitness_level || 'beginner',
        goals: Array.isArray(student.goals) ? student.goals as string[] : [],
        medical_restrictions: student.medical_restrictions || undefined,
        workout_history_summary: `${student.total_workouts_completed} treinos completados`,
      }
    : {
        id: 'generic',
        name: 'Aluno genérico',
        level: 'intermediate',
        goals: [parsed.goal],
        medical_restrictions: undefined,
        workout_history_summary: 'Sem histórico disponível',
      }

  // Usar novo prompt estruturado
  const promptParams: WorkoutGenerationParams = {
    student: studentData,
    goal: parsed.goal,
    days_per_week: parsed.days_per_week,
    split_type: parsed.split_type as WorkoutGenerationParams['split_type'],
    exercises_available: exercisesForPrompt,
    extra_instructions: parsed.extra_instructions || undefined,
  }

  const prompt = PROMPTS.create_workout(promptParams)

  // Selecionar modelo Workers AI (prioridade) ou Replicate (fallback)
  const workersAIModel = selectWorkersAIModel('workout', normalizedComplexity)

  const { response: aiResponse, provider } = await callWorkersAIWithFallback(
    c.env,
    workersAIModel?.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    prompt,
    {
      systemPrompt: 'Você é um personal trainer expert. Responda SEMPRE em JSON válido, sem markdown.',
      max_tokens: workersAIModel?.max_tokens || ('max_tokens' in model ? model.max_tokens : 4096),
      temperature: workersAIModel?.temperature || ('temperature' in model ? model.temperature : 0.7),
      replicateModel: model.model,
    }
  )

  const modelUsed = provider === 'workers-ai'
    ? (workersAIModel?.model || 'workers-ai')
    : model.model

  // Tentar parsear JSON da resposta
  let workoutData = null
  try {
    const jsonStr = extractJSON(aiResponse)
    workoutData = JSON.parse(jsonStr)
  } catch {
    // Retornar resposta raw se não for JSON válido
    workoutData = { raw_response: aiResponse }
  }

  // Registrar uso
  await trackAIUsage(c.env, personalId, 'workout', modelUsed, prompt.length, provider)

  // Track analytics
  c.env.ANALYTICS.writeDataPoint({
    blobs: ['ai_workout_generated', modelUsed, normalizedComplexity, provider],
    doubles: [1],
    indexes: [personalId],
  })

  return created({
    model_used: modelUsed,
    provider,
    complexity: normalizedComplexity,
    workout: workoutData,
    student_id: parsed.student_id || null,
  })
})

// ============================================
// POST /ai/photos/compare — Comparar fotos
// ============================================
ai.post('/photos/compare', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const body = await c.req.json()
  const parsed = comparePhotosSchema.parse(body)

  const model = selectModel('photo')
  const prompt = PROMPTS.analyze_photos(parsed.before_url, parsed.after_url)

  // Intentional: photo comparison requires multimodal input (image_1, image_2).
  // Workers AI text models do not support image URLs — Replicate is the only provider here.
  // Revisit when @cf/llava or equivalent is GA in Workers AI (see TODOS.md TODO-004).
  const aiResponse = await callReplicate(c.env, model.model, {
    prompt,
    image_1: parsed.before_url,
    image_2: parsed.after_url,
    mode: 'similarity',
  })

  let analysis = null
  try {
    const jsonStr = extractJSON(aiResponse)
    analysis = JSON.parse(jsonStr)
  } catch {
    analysis = { raw_response: aiResponse }
  }

  // Se tiver assessment_id, salvar análise
  if (parsed.assessment_id) {
    await pgQuery(c.env, `
      UPDATE assessments SET ai_analysis = $1, updated_at = $2
      WHERE id = $3 AND personal_id = $4
    `, [JSON.stringify(analysis), new Date().toISOString(), parsed.assessment_id, personalId])
  }

  await trackAIUsage(c.env, personalId, 'photo', model.model, 0, 'replicate')

  return success({ analysis, model_used: model.model, provider: 'replicate' })
})

// ============================================
// POST /ai/assistant — Assistente geral
// ============================================
ai.post('/assistant', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, userId, getMonthlyAiCallLimit(String(userType), userRole))
  const body = await c.req.json()
  const parsed = assistantChatSchema.parse(body)

  // Construir contexto baseado no tipo
  let context = `Tipo de usuário: ${userType}\n`

  if (userType === 'personal' && parsed.context_type === 'students') {
    const { rows } = await pgQuery<{ count: number; active: number }>(
      c.env,
      `SELECT COUNT(*)::int as count,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int as active
       FROM students WHERE personal_id = $1`,
      [userId]
    )
    context += `Alunos totais: ${rows[0]?.count || 0}, Ativos: ${rows[0]?.active || 0}\n`
  }

  if (userType === 'personal' && parsed.context_type === 'billing') {
    const { rows } = await pgQuery<{ pending: number; confirmed: number }>(
      c.env,
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::float as pending,
         COALESCE(SUM(CASE WHEN status = 'confirmed' THEN net_amount ELSE 0 END), 0)::float as confirmed
       FROM payments WHERE recipient_id = $1`,
      [userId]
    )
    context += `Pagamentos pendentes: R$${rows[0]?.pending || 0}, Recebidos: R$${rows[0]?.confirmed || 0}\n`
  }

  const model = selectModel('chat')
  const workersAIModel = selectWorkersAIModel('chat')
  const prompt = PROMPTS.assistant(parsed.question, context)

  const { response: aiResponse, provider } = await callWorkersAIWithFallback(
    c.env,
    workersAIModel?.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    prompt,
    {
      systemPrompt: 'Você é um assistente especializado para personal trainers brasileiros. Responda de forma clara e útil em português brasileiro. Se possível, sugira ações práticas.',
      max_tokens: workersAIModel?.max_tokens || 1024,
      temperature: workersAIModel?.temperature || 0.8,
      replicateModel: model.model,
    }
  )

  const modelUsed = provider === 'workers-ai' ? (workersAIModel?.model || 'workers-ai') : model.model

  let response = null
  try {
    const jsonStr = extractJSON(aiResponse)
    const parsed2 = JSON.parse(jsonStr)
    // Normalizar — aceitar tanto { resposta } quanto { message } quanto string pura
    response = {
      resposta: parsed2.resposta || parsed2.message || parsed2.response || aiResponse,
      acoes_sugeridas: parsed2.acoes_sugeridas || parsed2.actions || [],
      links_uteis: parsed2.links_uteis || [],
    }
  } catch {
    // Se não for JSON, usar resposta crua como texto (perfeitamente válido)
    response = { resposta: aiResponse.trim(), acoes_sugeridas: [], links_uteis: [] }
  }

  await trackAIUsage(c.env, userId, 'chat', modelUsed, prompt.length, provider)

  return success({ response, model_used: modelUsed, provider })
})

// ============================================
// POST /ai/content/generate — Gerar conteúdo marketing
// ============================================
ai.post('/content/generate', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const body = await c.req.json()
  const parsed = generateContentSchema.parse(body)

  // Buscar nome do personal
  const { rows } = await pgQuery<{ full_name: string }>(
    c.env, 'SELECT full_name FROM users WHERE id = $1 LIMIT 1', [personalId]
  )
  const personalName = rows[0]?.full_name || 'Personal'

  const model = selectModel('content')
  const workersAIModel = selectWorkersAIModel('content')
  const prompt = PROMPTS.content_generation(parsed.type, parsed.topic, personalName)

  const { response: aiResponse, provider } = await callWorkersAIWithFallback(
    c.env,
    workersAIModel?.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    prompt,
    {
      systemPrompt: 'Você é um copywriter expert em marketing para personal trainers. Responda em JSON.',
      max_tokens: workersAIModel?.max_tokens || 2048,
      temperature: workersAIModel?.temperature || 0.9,
      replicateModel: model.model,
    }
  )

  const modelUsed = provider === 'workers-ai' ? (workersAIModel?.model || 'workers-ai') : model.model

  let content = null
  try {
    const jsonStr = extractJSON(aiResponse)
    content = JSON.parse(jsonStr)
  } catch {
    content = { raw_response: aiResponse }
  }

  await trackAIUsage(c.env, personalId, 'content', modelUsed, prompt.length, provider)

  return success({ content, type: parsed.type, model_used: modelUsed, provider })
})

// ============================================
// POST /ai/sentiment/analyze — Análise de sentimento
// ============================================
ai.post('/sentiment/analyze', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const body = await c.req.json()
  const parsed = analyzeSentimentSchema.parse(body)

  const model = selectModel('sentiment')
  const workersAIModel = selectWorkersAIModel('sentiment')
  const prompt = PROMPTS.sentiment_analysis(parsed.feedback)

  const { response: aiResponse, provider } = await callWorkersAIWithFallback(
    c.env,
    workersAIModel?.model || '@cf/meta/llama-3.1-8b-instruct-fast',
    prompt,
    {
      systemPrompt: 'Analise o sentimento do texto. Responda em JSON com: score (0-1), sentimento, alerta (boolean).',
      max_tokens: workersAIModel?.max_tokens || 512,
      temperature: workersAIModel?.temperature || 0.3,
      replicateModel: model.model,
    }
  )

  const modelUsed = provider === 'workers-ai' ? (workersAIModel?.model || 'workers-ai') : model.model

  let analysis = null
  try {
    const jsonStr = extractJSON(aiResponse)
    analysis = JSON.parse(jsonStr)
  } catch {
    analysis = { raw_response: aiResponse, score: 0.5, sentimento: 'neutro', alerta: false }
  }

  await trackAIUsage(c.env, personalId, 'sentiment', modelUsed, prompt.length, provider)

  return success({ analysis, model_used: modelUsed, provider })
})

// ============================================
// POST /ai/billing/smart — Sugestão inteligente de cobranças
// ============================================
ai.post('/billing/smart', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const body = await c.req.json().catch(() => ({}))
  const parsed = smartBillingSchema.parse(body)

  // Buscar alunos com pagamento pendente
  const { rows } = await pgQuery<{
    id: string; full_name: string; payment_status: string;
    last_payment_date: string; next_payment_date: string
  }>(
    c.env,
    `SELECT s.id, u.full_name, s.payment_status, s.last_payment_date, s.next_payment_date
     FROM students s
     JOIN users u ON u.id = s.id
     WHERE s.personal_id = $1 AND s.payment_status IN ('pending', 'overdue')
     ORDER BY s.next_payment_date ASC NULLS LAST
     LIMIT $2`,
    [personalId, parsed.limit]
  )

  if (rows.length === 0) {
    return success({ message: 'Nenhum aluno com pagamento pendente', suggestions: [] })
  }

  const billingData: StudentBillingData[] = rows.map((r) => ({
    id: r.id,
    name: r.full_name,
    pending_amount: 0, // TODO: calcular do payments
    days_until_due: r.next_payment_date
      ? Math.ceil((new Date(r.next_payment_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0,
    last_activity: r.last_payment_date || 'nunca',
  }))

  const model = selectModel('billing')
  const workersAIModel = selectWorkersAIModel('billing')
  const prompt = PROMPTS.smart_billing_suggestion(billingData)

  const { response: aiResponse, provider } = await callWorkersAIWithFallback(
    c.env,
    workersAIModel?.model || '@cf/meta/llama-3.1-8b-instruct-fast',
    prompt,
    {
      systemPrompt: 'Você é um consultor financeiro para personal trainers. Sugira ordem de cobranças. Responda em JSON.',
      max_tokens: workersAIModel?.max_tokens || 1024,
      temperature: workersAIModel?.temperature || 0.5,
      replicateModel: model.model,
    }
  )

  const modelUsed = provider === 'workers-ai' ? (workersAIModel?.model || 'workers-ai') : model.model

  let suggestions = null
  try {
    const jsonStr = extractJSON(aiResponse)
    suggestions = JSON.parse(jsonStr)
  } catch {
    suggestions = { raw_response: aiResponse }
  }

  await trackAIUsage(c.env, personalId, 'billing', modelUsed, prompt.length, provider)

  return success({ suggestions, students_analyzed: rows.length, model_used: modelUsed, provider })
})

// ============================================
// POST /ai/video/transcribe — Transcrição de vídeo
// ============================================
ai.post('/video/transcribe', requireType('personal'), async (c) => {
  const personalId = c.get('userId')
  const userRole = c.get('userRole') as string | undefined
  await assertMonthlyAiQuota(c.env, personalId, getMonthlyAiCallLimit('personal', userRole))
  const requestId = c.get('requestId')
  const body = await c.req.json()
  const parsed = transcribeVideoSchema.parse(body)

  const model = AI_MODELS.video_transcription

  // Enfileirar transcrição (pode ser demorada)
  const enqueue = await enqueueWithRetry(
    c.env.VIDEO_ENCODE_QUEUE,
    {
      type: 'transcribe',
      video_url: parsed.video_url,
      language: parsed.language,
      exercise_id: parsed.exercise_id || null,
      personal_id: personalId,
      model: model.model,
    },
    {
      queueName: 'VIDEO_ENCODE_QUEUE',
      requestId,
      maxAttempts: 3,
      baseBackoffMs: 150,
      maxBackoffMs: 1_000,
    }
  )

  if (!enqueue.queued) {
    throw new BadRequestError('Fila de transcrição indisponível no momento')
  }

  await trackAIUsage(c.env, personalId, 'transcription', model.model, 0)

  return success({
    message: 'Transcrição enfileirada. Você será notificado quando pronta.',
    status: 'queued',
    language: parsed.language,
    model_used: model.model,
  })
})

// ============================================
// GET /ai/usage — Uso mensal de IA
// ============================================
ai.get('/usage', async (c) => {
  const userId = c.get('userId')

  const { rows } = await pgQuery<{
    task_type: string; total_calls: number; total_tokens: number
  }>(
    c.env,
    `SELECT task_type,
            COUNT(*)::int as total_calls,
            COALESCE(SUM(tokens_used), 0)::int as total_tokens
     FROM ai_usage_logs
     WHERE user_id = $1 AND created_at >= DATE_TRUNC('month', NOW())
     GROUP BY task_type
     ORDER BY total_calls DESC`,
    [userId]
  )

  // Total geral do mês
  const { rows: totalRows } = await pgQuery<{ total_calls: number; total_tokens: number }>(
    c.env,
    `SELECT COUNT(*)::int as total_calls, COALESCE(SUM(tokens_used), 0)::int as total_tokens
     FROM ai_usage_logs WHERE user_id = $1 AND created_at >= DATE_TRUNC('month', NOW())`,
    [userId]
  )

  return success({
    month: new Date().toISOString().slice(0, 7),
    by_task: rows,
    totals: totalRows[0] || { total_calls: 0, total_tokens: 0 },
  })
})

// ============================================
// HELPERS
// ============================================

/**
 * Chamar Replicate API
 */
async function callReplicate(
  env: Bindings,
  model: string,
  input: Record<string, unknown>
): Promise<string> {
  const token = env.REPLICATE_API_TOKEN
  if (!token) {
    // Dev fallback - retornar mock
    return JSON.stringify({
      message: '[DEV] Replicate API token not configured',
      mock: true,
      input_received: Object.keys(input),
    })
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // Sync mode
      },
      body: JSON.stringify({ model, input }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Replicate] Error ${response.status}:`, error)
      throw new InternalError(`Replicate API error: ${response.status}`)
    }

    const data = await response.json() as { output?: unknown; status?: string }

    // Replicate retorna output como array de strings (tokens) ou string
    if (Array.isArray(data.output)) {
      return data.output.join('')
    }
    if (typeof data.output === 'string') {
      return data.output
    }

    return JSON.stringify(data.output || data)
  } catch (err) {
    console.error('[Replicate] Call failed:', err)
    return JSON.stringify({
      error: 'AI service temporarily unavailable',
      fallback: true,
    })
  }
}

/**
 * Extrair JSON de uma resposta que pode conter texto extra
 */
function extractJSON(text: string): string {
  // Tentar extrair bloco JSON de markdown
  const markdownMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (markdownMatch) return markdownMatch[1].trim()

  // Tentar encontrar objeto JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]

  // Tentar encontrar array JSON
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) return arrayMatch[0]

  return text
}

/**
 * Registrar uso de IA (para tracking/billing)
 */
async function trackAIUsage(
  env: Bindings,
  userId: string,
  taskType: string,
  model: string,
  tokensUsed: number,
  provider: 'workers-ai' | 'replicate' | 'mock' = 'replicate'
): Promise<void> {
  try {
    await pgQuery(env, `
      INSERT INTO ai_usage_logs (id, user_id, task_type, model_used, tokens_used, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [generateId(), userId, taskType, `${provider}:${model}`, tokensUsed, new Date().toISOString()])
  } catch {
    // Tabela pode não existir ainda — não quebrar a request
    console.error('[AI] Failed to track usage')
  }
}

export { ai as aiRoutes }
