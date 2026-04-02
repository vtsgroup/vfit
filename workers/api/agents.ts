/**
 * workers/api/agents.ts
 *
 * agents.ts — Agentes Unipile/Instagram com kill-switch
 */

// ============================================
// agents.ts — Agentes Unipile/Instagram com kill-switch
// ============================================
//
// O que faz:
//   Integração com Unipile para automação de Instagram (post, DM, comment,
//   human-handoff). Kill-switch duplo: variável de ambiente + KV_SESSIONS.
//   super_admin pode ativar/desativar o kill-switch remotamente (TTL 30d).
//
// Exports principais:
//   agentsRoutes — Hono app montado em /api/v1/agents
//
// Auth: health: admin; dispatch: personal/admin; kill-switch: super_admin
// KV: KV_SESSIONS (agents:kill-switch — estado + reason)
// Side effects: delega execução para Unipile API via lib/unipile-agents.ts
// ============================================
import { Hono } from 'hono'
import type { Context } from 'hono'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'
import { success } from '@lib/response'
import { BadRequestError, ServiceUnavailableError } from '@lib/errors'
import { instagramDispatchSchema, unipileKillSwitchSchema } from '@workers/schemas/agents'
import { dispatchInstagramAgent, getUnipileAgentsConfig } from '@lib/unipile-agents'

const agentsRoutes = new Hono<AppContext>()

agentsRoutes.use('*', authMiddleware)

// GET /agents/health — diagnóstico operacional (admin/super_admin)
agentsRoutes.get('/health', requireType('admin', 'super_admin'), async (c) => {
  const cfg = getUnipileAgentsConfig(c.env)
  const killSwitchKv = await readKillSwitchState(c)

  return success({
    provider: 'unipile',
    enabled: cfg.enabled,
    kill_switch: {
      env: cfg.kill_switch_env,
      kv: killSwitchKv.enabled,
      reason: killSwitchKv.reason,
    },
    dry_run_default: cfg.dry_run_default,
    capabilities: {
      instagram_post: true,
      instagram_dm: true,
      instagram_comment: true,
      human_handoff: true,
    },
    ready: cfg.enabled && !cfg.kill_switch_env && !killSwitchKv.enabled,
  })
})

// POST /agents/instagram/dispatch — roteador de intents Instagram (personal/admin)
agentsRoutes.post('/instagram/dispatch', requireType('personal', 'admin', 'super_admin'), async (c) => {
  const cfg = getUnipileAgentsConfig(c.env)
  const killSwitchKv = await readKillSwitchState(c)

  if (!cfg.enabled) {
    throw new ServiceUnavailableError('Agents Unipile (desativado)')
  }

  if (cfg.kill_switch_env || killSwitchKv.enabled) {
    return success({
      blocked: true,
      message: 'Agents desativados por kill-switch operacional',
      reason: killSwitchKv.reason || 'kill-switch ativo',
      fallback: 'handoff_humano',
    }, 503)
  }

  const parsed = instagramDispatchSchema.parse(await c.req.json())

  if (parsed.intent !== 'handoff' && !parsed.target) {
    throw new BadRequestError('target é obrigatório para intents post|dm|comment')
  }

  const result = await dispatchInstagramAgent(c.env, {
    intent: parsed.intent,
    message: parsed.message,
    target: parsed.target,
    metadata: parsed.metadata,
    actor_user_id: c.get('userId'),
    actor_user_type: c.get('userType'),
    dry_run: parsed.dry_run,
  })

  return success({
    provider: 'unipile',
    result,
    safety: {
      kill_switch: false,
      requires_human_handoff: parsed.intent === 'handoff',
    },
  })
})

// POST /agents/kill-switch — alterna kill-switch operacional (super_admin)
agentsRoutes.post('/kill-switch', requireType('super_admin'), async (c) => {
  const parsed = unipileKillSwitchSchema.parse(await c.req.json())
  const key = 'agents:unipile:kill-switch'

  await c.env.KV_SESSIONS.put(
    key,
    JSON.stringify({
      enabled: parsed.enabled,
      reason: parsed.reason || null,
      updated_at: new Date().toISOString(),
      actor_user_id: c.get('userId'),
    }),
    { expirationTtl: 30 * 24 * 60 * 60 }
  )

  return success({
    kill_switch: {
      enabled: parsed.enabled,
      reason: parsed.reason || null,
    },
    message: parsed.enabled
      ? 'Kill-switch ativado. Fluxo automático bloqueado, usar handoff humano.'
      : 'Kill-switch desativado. Fluxo automático liberado.',
  })
})

export { agentsRoutes }

async function readKillSwitchState(c: Context<AppContext>) {
  const raw = await c.env.KV_SESSIONS.get('agents:unipile:kill-switch', 'json') as {
    enabled?: boolean
    reason?: string | null
  } | null

  return {
    enabled: Boolean(raw?.enabled),
    reason: raw?.reason || null,
  }
}
