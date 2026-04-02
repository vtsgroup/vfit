/**
 * workers/api/feedback.ts
 *
 * feedback.ts — Sugestões, melhorias e auto-reply IA
 *
 * Exports: feedbackRoutes
 * Features: DB: Neon
 */

// ============================================
// feedback.ts — Sugestões, melhorias e auto-reply IA
// ============================================
//
// O que faz:
//   Sistema de sugestões com thread de mensagens e auto-reply gerado por
//   IA (Cloudflare Workers AI Llama, assíncrono com waitUntil).
//   Fallback para respostas pré-definidas aleatórias se API falhar.
//
// Exports principais:
//   feedbackRoutes — Hono app montado em /api/v1/feedback
//
// Auth: requireAuth em todas. GET/:id e POST/:id/reply: owner only.
// DB: feedback_suggestions, feedback_replies
// Side effects: auto-reply IA via waitUntil (Workers AI Llama)
// Rate limit: máx 5 feedbacks/dia por usuário (via pgQuery COUNT)
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import { success, created, paginated } from '@lib/response'
import { BadRequestError, NotFoundError, ForbiddenError } from '@lib/errors'
import { callWorkersAIWithFallback } from '@lib/workers-ai'

export const feedbackRoutes = new Hono<AppContext>()

// All routes require auth
feedbackRoutes.use('*', authMiddleware)

// ============================================
// POST /feedback — Enviar sugestão/melhoria + auto-reply IA
// ============================================
feedbackRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    category: string
    title: string
    description: string
  }>()

  // Validation
  const validCategories = ['feature', 'improvement', 'bug', 'ui', 'other']
  if (!body.category || !validCategories.includes(body.category)) {
    throw new BadRequestError('Categoria inválida. Use: feature, improvement, bug, ui, other')
  }
  if (!body.title || body.title.trim().length < 3) {
    throw new BadRequestError('Título deve ter pelo menos 3 caracteres')
  }
  if (!body.description || body.description.trim().length < 10) {
    throw new BadRequestError('Descrição deve ter pelo menos 10 caracteres')
  }
  if (body.title.length > 200) {
    throw new BadRequestError('Título deve ter no máximo 200 caracteres')
  }
  if (body.description.length > 2000) {
    throw new BadRequestError('Descrição deve ter no máximo 2000 caracteres')
  }

  // Rate limit: max 5 feedbacks per day per user
  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    `SELECT COUNT(*) as count FROM feedback_suggestions 
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
    [userId]
  )
  if ((countResult?.count ?? 0) >= 5) {
    throw new BadRequestError('Limite de 5 sugestões por dia atingido')
  }

  // Get user name for the chat
  const user = await pgQueryOne<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1',
    [userId]
  )
  const userName = user?.full_name || 'Usuário'

  // Create feedback
  const feedback = await pgQueryOne<{
    id: string; category: string; title: string; description: string; status: string; created_at: string
  }>(
    c.env,
    `INSERT INTO feedback_suggestions (user_id, category, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, category, title, description, status, created_at`,
    [userId, body.category, body.title.trim(), body.description.trim()]
  )

  if (!feedback) {
    throw new BadRequestError('Erro ao criar sugestão')
  }

  // Insert the user's original message as first reply (so the chat starts with context)
  await pgQuery(
    c.env,
    `INSERT INTO feedback_replies (feedback_id, user_id, message, sender_type, sender_name)
     VALUES ($1, $2, $3, 'user', $4)`,
    [feedback.id, userId, body.description.trim(), userName]
  )

  // Generate AI auto-reply (best-effort, non-blocking via waitUntil)
  c.executionCtx.waitUntil(
    generateAIAutoReply(c.env, feedback.id, body.category, body.title, body.description, userName)
  )

  return created(feedback)
})

// ============================================
// GET /feedback/mine — Minhas sugestões (com contagem de replies)
// ============================================
feedbackRoutes.get('/mine', async (c) => {
  const userId = c.get('userId')
  const url = new URL(c.req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * limit

  const countResult = await pgQueryOne<{ count: number }>(
    c.env,
    'SELECT COUNT(*) as count FROM feedback_suggestions WHERE user_id = $1',
    [userId]
  )
  const total = countResult?.count ?? 0

  const { rows } = await pgQuery(
    c.env,
    `SELECT f.id, f.category, f.title, f.description, f.status, f.priority,
            f.has_new_reply, f.created_at, f.updated_at, f.resolved_at,
            (SELECT COUNT(*) FROM feedback_replies fr WHERE fr.feedback_id = f.id) as reply_count,
            (SELECT fr2.message FROM feedback_replies fr2 WHERE fr2.feedback_id = f.id ORDER BY fr2.created_at DESC LIMIT 1) as last_reply,
            (SELECT fr3.sender_type FROM feedback_replies fr3 WHERE fr3.feedback_id = f.id ORDER BY fr3.created_at DESC LIMIT 1) as last_reply_type
     FROM feedback_suggestions f
     WHERE f.user_id = $1
     ORDER BY f.has_new_reply DESC, f.updated_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )

  return paginated(rows, { page, per_page: limit, total })
})

// ============================================
// GET /feedback/:id — Detalhe da sugestão + replies (owner only)
// ============================================
feedbackRoutes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  // Get feedback (verify ownership)
  const feedback = await pgQueryOne(
    c.env,
    `SELECT id, user_id, category, title, description, status, priority,
            has_new_reply, created_at, updated_at, resolved_at
     FROM feedback_suggestions
     WHERE id = $1`,
    [id]
  )
  if (!feedback) throw new NotFoundError('Sugestão não encontrada')

  const fbData = feedback as { user_id: string; has_new_reply: boolean }
  if (fbData.user_id !== userId) {
    throw new ForbiddenError('Você não tem acesso a esta sugestão')
  }

  // Get all replies
  const { rows: replies } = await pgQuery(
    c.env,
    `SELECT id, message, sender_type, sender_name, created_at
     FROM feedback_replies
     WHERE feedback_id = $1
     ORDER BY created_at ASC`,
    [id]
  )

  // Mark as read (clear has_new_reply)
  if (fbData.has_new_reply) {
    await pgQuery(
      c.env,
      'UPDATE feedback_suggestions SET has_new_reply = false WHERE id = $1',
      [id]
    ).catch(() => {})
  }

  return success({ ...feedback, replies })
})

// ============================================
// POST /feedback/:id/reply — Enviar reply (owner only)
// ============================================
feedbackRoutes.post('/:id/reply', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()
  const body = await c.req.json<{ message: string }>()

  if (!body.message || body.message.trim().length < 2) {
    throw new BadRequestError('Mensagem deve ter pelo menos 2 caracteres')
  }
  if (body.message.length > 2000) {
    throw new BadRequestError('Mensagem deve ter no máximo 2000 caracteres')
  }

  // Verify ownership
  const feedback = await pgQueryOne<{ id: string; user_id: string; title: string; category: string }>(
    c.env,
    'SELECT id, user_id, title, category FROM feedback_suggestions WHERE id = $1',
    [id]
  )
  if (!feedback) throw new NotFoundError('Sugestão não encontrada')
  if (feedback.user_id !== userId) {
    throw new ForbiddenError('Você não tem acesso a esta sugestão')
  }

  // Get user name
  const user = await pgQueryOne<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1',
    [userId]
  )

  // Insert reply
  const reply = await pgQueryOne(
    c.env,
    `INSERT INTO feedback_replies (feedback_id, user_id, message, sender_type, sender_name)
     VALUES ($1, $2, $3, 'user', $4)
     RETURNING id, message, sender_type, sender_name, created_at`,
    [id, userId, body.message.trim(), user?.full_name || 'Usuário']
  )

  // Update feedback timestamp
  await pgQuery(
    c.env,
    'UPDATE feedback_suggestions SET updated_at = NOW() WHERE id = $1',
    [id]
  ).catch(() => {})

  return created(reply)
})

// ============================================
// AI Auto-Reply Helper
// ============================================

const categoryLabels: Record<string, string> = {
  feature: 'nova funcionalidade',
  improvement: 'melhoria',
  bug: 'correção de problema',
  ui: 'melhoria visual',
  other: 'sugestão',
}

async function generateAIAutoReply(
  env: Bindings,
  feedbackId: string,
  category: string,
  title: string,
  description: string,
  userName: string
): Promise<void> {
  // Se não tem binding AI nem token Replicate, usar resposta padrão
  if (!env.AI && !env.REPLICATE_API_TOKEN) {
    await insertAIReply(env, feedbackId, getDefaultReply(userName, category, title))
    return
  }

  const categoryLabel = categoryLabels[category] || 'sugestão'

  const prompt = `Você é o Victor, desenvolvedor e fundador do VFIT — uma plataforma para personal trainers.
Um usuário chamado "${userName}" acabou de enviar uma sugestão de ${categoryLabel}.

Título: "${title}"
Descrição: "${description}"

Escreva UMA resposta curta (2-4 frases), cordial e amigável como se fosse o Victor respondendo pessoalmente.
A resposta deve:
- Agradecer pela sugestão de forma genuína e calorosa
- Mencionar brevemente o que o usuário pediu para mostrar que leu
- Dizer que vamos analisar a viabilidade e dar retorno em breve
- Ser informal mas profissional, usar emoji com moderação (1-2 no máximo)
- NÃO prometer prazos específicos
- NÃO usar expressões genéricas demais como "sua opinião é muito importante"
- Ser BREVE e NATURAL, como uma mensagem real de chat

Responda APENAS com o texto da mensagem, sem aspas, sem JSON, sem nada extra.`

  try {
    const { response: aiText } = await callWorkersAIWithFallback(
      env,
      '@cf/meta/llama-3.1-8b-instruct-fast',
      prompt,
      {
        systemPrompt: 'Você é o Victor, fundador do VFIT. Responda de forma curta, natural e amigável.',
        max_tokens: 256,
        temperature: 0.85,
        replicateModel: 'google-gemini/gemini-2.5-flash',
      }
    )

    // Clean up AI response
    let cleanText = aiText.trim()
      .replace(/^["']|["']$/g, '')
      .replace(/^```[\s\S]*?```$/gm, '')
      .trim()

    if (!cleanText || cleanText.length < 10) {
      cleanText = getDefaultReply(userName, category, title)
    }

    await insertAIReply(env, feedbackId, cleanText)
  } catch (err) {
    console.error('[Feedback AI] Failed:', err)
    await insertAIReply(env, feedbackId, getDefaultReply(userName, category, title))
  }
}

async function insertAIReply(env: Bindings, feedbackId: string, message: string): Promise<void> {
  await pgQuery(
    env,
    `INSERT INTO feedback_replies (feedback_id, user_id, message, sender_type, sender_name)
     VALUES ($1, NULL, $2, 'ai', 'Victor (IA)')`,
    [feedbackId, message]
  )

  // Mark feedback as having new reply
  await pgQuery(
    env,
    'UPDATE feedback_suggestions SET has_new_reply = true, updated_at = NOW() WHERE id = $1',
    [feedbackId]
  )
}

function getDefaultReply(userName: string, category: string, title: string): string {
  const categoryLabel = categoryLabels[category] || 'sugestão'
  const responses = [
    `Fala, ${userName}! 👋 Recebi sua ${categoryLabel} sobre "${title}" e achei muito relevante. Vou analisar a viabilidade técnica e te dou um retorno assim que possível!`,
    `E aí, ${userName}! Obrigado por mandar essa ideia sobre "${title}" 🙌 Vou dar uma olhada com carinho e te retorno em breve com novidades.`,
    `Opa, ${userName}! Valeu demais pela ${categoryLabel}! 💜 Já anotei aqui "${title}" e vou avaliar como encaixar isso nas próximas atualizações. Te mantenho informado!`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
