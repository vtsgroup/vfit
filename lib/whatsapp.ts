/**
 * lib/whatsapp.ts
 *
 * Envio de mensagens WhatsApp via gateway vfit-whatsapp (Unipile).
 * O gateway não envia por número diretamente: é preciso resolver o chat_id
 * via GET /chats?q=<telefone> (o número precisa ser um chat existente na
 * conta conectada). Todo envio é best-effort — nunca lançar erro.
 *
 * Exports:
 *   sendWhatsAppText(env, phone, text)   — resolve chat pelo telefone e envia
 *   sendWhatsAppToUser(env, userId, text) — busca users.phone e envia
 */

import { pgQueryOne } from '@lib/db'
import type { Bindings } from '@workers/types'

function normalizePhoneForMatch(value: string): string {
  const digits = (value || '').replace(/\D/g, '')
  if (digits.length <= 11) return digits
  if (digits.length === 13 && digits.startsWith('55')) return digits.slice(2)
  return digits
}

export async function sendWhatsAppText(
  env: Bindings,
  phone: string,
  text: string
): Promise<boolean> {
  try {
    const gatewayUrl = (env.WHATSAPP_GATEWAY_URL || 'https://vfit-whatsapp.vd-b0b.workers.dev').replace(/\/+$/, '')
    const token = env.WHATSAPP_NOTIFY_TOKEN || env.WHATSAPP_ADMIN_AUTH_TOKEN
    if (!token) return false

    const targetDigits = normalizePhoneForMatch(phone)
    if (!targetDigits) return false

    const chatsRes = await fetch(`${gatewayUrl}/chats?q=${encodeURIComponent(targetDigits)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!chatsRes.ok) return false

    const chatsJson = await chatsRes.json() as {
      data?: {
        items?: Array<{ id: string; name: string }>
      }
    }
    const items = chatsJson.data?.items || []
    const chat = items.find((item) => {
      const nameDigits = normalizePhoneForMatch(item.name)
      return nameDigits.endsWith(targetDigits) || targetDigits.endsWith(nameDigits)
    })
    if (!chat?.id) return false

    const sendRes = await fetch(`${gatewayUrl}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat.id,
        text,
      }),
    })

    return sendRes.ok
  } catch {
    return false
  }
}

export async function sendWhatsAppToUser(
  env: Bindings,
  userId: string,
  text: string
): Promise<boolean> {
  try {
    const user = await pgQueryOne<{ phone: string | null }>(
      env,
      'SELECT phone FROM users WHERE id = $1 LIMIT 1',
      [userId]
    )
    if (!user?.phone) return false

    return await sendWhatsAppText(env, user.phone, text)
  } catch {
    return false
  }
}
