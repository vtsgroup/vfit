/**
 * workers/api/chat.ts
 *
 * chat.ts — Chat em tempo real personal ↔ aluno
 * Features: DB: Neon
 */

// ============================================
// chat.ts — Chat em tempo real personal ↔ aluno
// ============================================
//
// O que faz:
//   Sistema de mensagens entre personal e aluno via polling. Permite
//   criar/obter conversa, listar e enviar mensagens, marcar como lida,
//   arquivar conversa e consultar contagem de não lidas.
//
// Exports principais:
//   chatRoutes — Hono app montado em /api/v1/chat
//
// Auth: requireAuth em todas as rotas
// DB: conversations, messages, users (JOIN para nomes)
// Side effects: incrementa unread_personal/unread_student, push OneSignal
// ============================================

import { Hono } from 'hono'
import type { AppContext, Bindings } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery, generateId } from '@lib/db'
import { success, created, noContent } from '@lib/response'
import { NotFoundError, ForbiddenError, BadRequestError } from '@lib/errors'
import { notifyEvent } from '@lib/onesignal'
import {
  sendMessageSchema,
  listMessagesQuerySchema,
  createConversationSchema,
  listConversationsQuerySchema,
} from '@workers/schemas/chat'

const chat = new Hono<AppContext>()

chat.use('*', authMiddleware)

// ============================================
// TYPES
// ============================================

interface ConversationRow {
  id: string
  personal_id: string
  student_id: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_personal: number
  unread_student: number
  is_archived: boolean
  created_at: string
  updated_at: string
  participant_name?: string
  participant_avatar?: string
  participant_type?: string
}

interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  metadata: unknown
  read_at: string | null
  created_at: string
  sender_name?: string
  sender_avatar?: string
}

// ============================================
// HELPERS
// ============================================

/** Verifica se o usuário participa da conversa */
async function verifyConversationAccess(
  env: Bindings,
  conversationId: string,
  userId: string
): Promise<ConversationRow> {
  const { rows } = await pgQuery<ConversationRow>(
    env,
    'SELECT * FROM conversations WHERE id = $1 AND (personal_id = $2 OR student_id = $2) LIMIT 1',
    [conversationId, userId]
  )
  if (rows.length === 0) throw new NotFoundError('Conversa')
  return rows[0]
}

/** Determina o campo de unread baseado no papel do usuário na conversa */
function getUnreadField(conversation: ConversationRow, userId: string): 'unread_personal' | 'unread_student' {
  return conversation.personal_id === userId ? 'unread_personal' : 'unread_student'
}

/** Obtém o ID do outro participante */
function getOtherParticipantId(conversation: ConversationRow, userId: string): string {
  return conversation.personal_id === userId ? conversation.student_id : conversation.personal_id
}

// ============================================
// GET /chat/unread-count — Total de mensagens não lidas
// ============================================
chat.get('/unread-count', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')

  const unreadField = userType === 'personal' ? 'unread_personal' : 'unread_student'
  const participantField = userType === 'personal' ? 'personal_id' : 'student_id'

  const { rows } = await pgQuery<{ total: number }>(
    c.env,
    `SELECT COALESCE(SUM(${unreadField}), 0)::int as total
     FROM conversations
     WHERE ${participantField} = $1 AND is_archived = false`,
    [userId]
  )

  return success({ unread_count: rows[0]?.total ?? 0 })
})

// ============================================
// GET /chat/conversations — Listar conversas
// ============================================
chat.get('/conversations', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const url = new URL(c.req.url)

  const query = listConversationsQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    archived: url.searchParams.get('archived') || undefined,
  })

  const participantField = userType === 'personal' ? 'personal_id' : 'student_id'
  const otherField = userType === 'personal' ? 'student_id' : 'personal_id'
  const unreadField = userType === 'personal' ? 'unread_personal' : 'unread_student'
  const offset = (query.page - 1) * query.per_page

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM conversations
     WHERE ${participantField} = $1 AND is_archived = $2`,
    [userId, query.archived]
  )

  const { rows } = await pgQuery<ConversationRow>(
    c.env,
    `SELECT c.*,
            u.full_name as participant_name,
            u.profile_photo_url as participant_avatar,
            u.user_type as participant_type
     FROM conversations c
     JOIN users u ON u.id = c.${otherField}
     WHERE c.${participantField} = $1 AND c.is_archived = $2
     ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
     LIMIT $3 OFFSET $4`,
    [userId, query.archived, query.per_page, offset]
  )

  return success({
    conversations: rows.map((conv) => ({
      ...conv,
      unread_count: conv[unreadField],
    })),
    meta: {
      page: query.page,
      per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// POST /chat/conversations — Criar ou obter conversa existente
// ============================================
chat.post('/conversations', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const body = await c.req.json()
  const parsed = createConversationSchema.parse(body)

  // Determinar quem é personal e quem é student
  let personalId: string
  let studentId: string

  if (userType === 'personal') {
    personalId = userId
    studentId = parsed.participant_id
    // Verificar que o aluno pertence ao personal
    const { rows } = await pgQuery<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [studentId, personalId]
    )
    if (rows.length === 0) throw new ForbiddenError('Este aluno não pertence ao seu perfil')
  } else {
    studentId = userId
    personalId = parsed.participant_id
    // Verificar que o student pertence ao personal
    const { rows } = await pgQuery<{ id: string }>(
      c.env,
      'SELECT id FROM students WHERE id = $1 AND personal_id = $2 LIMIT 1',
      [studentId, personalId]
    )
    if (rows.length === 0) throw new ForbiddenError('Você não é aluno deste personal')
  }

  // Verificar se já existe conversa
  const { rows: existing } = await pgQuery<ConversationRow>(
    c.env,
    'SELECT * FROM conversations WHERE personal_id = $1 AND student_id = $2 LIMIT 1',
    [personalId, studentId]
  )

  if (existing.length > 0) {
    // Reativar se arquivada
    if (existing[0].is_archived) {
      await pgQuery(c.env,
        'UPDATE conversations SET is_archived = false, updated_at = NOW() WHERE id = $1',
        [existing[0].id]
      )
    }
    return success({ conversation: existing[0] })
  }

  // Criar nova conversa
  const id = generateId()
  const now = new Date().toISOString()

  await pgQuery(c.env, `
    INSERT INTO conversations (id, personal_id, student_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $4)
  `, [id, personalId, studentId, now])

  const { rows: conv } = await pgQuery<ConversationRow>(
    c.env,
    `SELECT c.*, u.full_name as participant_name, u.profile_photo_url as participant_avatar
     FROM conversations c
     JOIN users u ON u.id = $2
     WHERE c.id = $1`,
    [id, userType === 'personal' ? studentId : personalId]
  )

  return created({ conversation: conv[0] })
})

// ============================================
// GET /chat/conversations/:id/messages — Listar mensagens
// ============================================
chat.get('/conversations/:id/messages', async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('id')
  const url = new URL(c.req.url)

  // Verificar acesso
  await verifyConversationAccess(c.env, conversationId, userId)

  const query = listMessagesQuerySchema.parse({
    page: url.searchParams.get('page') || undefined,
    per_page: url.searchParams.get('per_page') || undefined,
    before: url.searchParams.get('before') || undefined,
  })

  const offset = (query.page - 1) * query.per_page
  const conditions: string[] = ['m.conversation_id = $1']
  const params: unknown[] = [conversationId]
  let idx = 2

  if (query.before) {
    conditions.push(`m.created_at < $${idx}`)
    params.push(query.before)
    idx++
  }

  const where = conditions.join(' AND ')

  const { rows: countRows } = await pgQuery<{ count: number }>(
    c.env,
    `SELECT COUNT(*)::int as count FROM messages m WHERE ${where}`,
    params
  )

  const { rows } = await pgQuery<MessageRow>(
    c.env,
    `SELECT m.*, u.full_name as sender_name, u.profile_photo_url as sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE ${where}
     ORDER BY m.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, query.per_page, offset]
  )

  return success({
    messages: rows.reverse(), // cronológica (mais antigas primeiro)
    meta: {
      page: query.page,
      per_page: query.per_page,
      total: countRows[0]?.count ?? 0,
      total_pages: Math.ceil((countRows[0]?.count ?? 0) / query.per_page),
    },
  })
})

// ============================================
// POST /chat/conversations/:id/messages — Enviar mensagem
// ============================================
chat.post('/conversations/:id/messages', async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('id')
  const body = await c.req.json()
  const parsed = sendMessageSchema.parse(body)

  // Verificar acesso
  const conversation = await verifyConversationAccess(c.env, conversationId, userId)

  const id = generateId()
  const now = new Date().toISOString()
  const preview = parsed.content.length > 100 ? parsed.content.slice(0, 97) + '...' : parsed.content

  // Inserir mensagem
  await pgQuery(c.env, `
    INSERT INTO messages (id, conversation_id, sender_id, content, message_type, metadata, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    id, conversationId, userId, parsed.content,
    parsed.message_type, parsed.metadata ? JSON.stringify(parsed.metadata) : null, now,
  ])

  // Atualizar conversa: último mensagem + incrementar unread do OUTRO participante
  const otherUnreadField = getUnreadField(conversation, userId) === 'unread_personal'
    ? 'unread_student'  // se EU sou o personal, incrementa unread do student
    : 'unread_personal' // se EU sou o student, incrementa unread do personal

  await pgQuery(c.env, `
    UPDATE conversations
    SET last_message_at = $1,
        last_message_preview = $2,
        ${otherUnreadField} = ${otherUnreadField} + 1,
        updated_at = $1
    WHERE id = $3
  `, [now, preview, conversationId])

  // Notificar o outro participante (push + in-app) — best-effort
  const receiverId = getOtherParticipantId(conversation, userId)
  const { rows: senderRows } = await pgQuery<{ full_name: string }>(
    c.env,
    'SELECT full_name FROM users WHERE id = $1 LIMIT 1',
    [userId]
  )
  const senderName = senderRows[0]?.full_name || 'Alguém'

  await notifyEvent(c.env, receiverId, 'message.new', {
    senderName,
    preview,
    conversationId,
  }).catch(() => {}) // best-effort

  return created({
    message: {
      id,
      conversation_id: conversationId,
      sender_id: userId,
      content: parsed.content,
      message_type: parsed.message_type,
      metadata: parsed.metadata || null,
      read_at: null,
      created_at: now,
    },
  })
})

// ============================================
// PATCH /chat/conversations/:id/read — Marcar mensagens como lidas
// ============================================
chat.patch('/conversations/:id/read', async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('id')

  // Verificar acesso
  const conversation = await verifyConversationAccess(c.env, conversationId, userId)

  const now = new Date().toISOString()
  const unreadField = getUnreadField(conversation, userId)

  // Marcar todas as mensagens do OUTRO como lidas
  const otherParticipantId = getOtherParticipantId(conversation, userId)
  await pgQuery(c.env, `
    UPDATE messages
    SET read_at = $1
    WHERE conversation_id = $2 AND sender_id = $3 AND read_at IS NULL
  `, [now, conversationId, otherParticipantId])

  // Zerar unread counter
  await pgQuery(c.env, `
    UPDATE conversations SET ${unreadField} = 0, updated_at = $1 WHERE id = $2
  `, [now, conversationId])

  return noContent()
})

// ============================================
// PATCH /chat/conversations/:id/archive — Arquivar conversa
// ============================================
chat.patch('/conversations/:id/archive', async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('id')

  await verifyConversationAccess(c.env, conversationId, userId)

  await pgQuery(c.env, `
    UPDATE conversations SET is_archived = true, updated_at = NOW() WHERE id = $1
  `, [conversationId])

  return noContent()
})

export { chat as chatRoutes }
