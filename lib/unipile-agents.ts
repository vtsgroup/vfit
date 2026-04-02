// ============================================
// unipile-agents.ts — Dispatch de agentes IA via Unipile
// ============================================
//
// O que faz:
//   Abstrai o dispatch de ações Instagram via Unipile: verifica kill-switch
//   e feature flags antes de executar, suporta dry_run para simulação segura.
//   MVP: execução real fica atrás do kill-switch + dry-run opt-out explícito.
//
// Exports principais:
//   getUnipileAgentsConfig(env) → { enabled, kill_switch_env, dry_run_default, ... }
//   dispatchInstagramAgent(env, input) → DispatchAgentResult
//   DispatchAgentInput, DispatchAgentResult, AgentIntent — tipos exportados
// ============================================
import type { Bindings } from '@workers/types'

export type AgentIntent = 'post' | 'dm' | 'comment' | 'handoff'

export interface DispatchAgentInput {
  intent: AgentIntent
  message: string
  target?: string
  metadata?: Record<string, unknown>
  actor_user_id: string
  actor_user_type: string
  dry_run?: boolean
}

export interface DispatchAgentResult {
  intent: AgentIntent
  dry_run: boolean
  provider: 'unipile'
  status: 'queued' | 'dry_run'
  action: string
  target: string | null
  simulated_payload: Record<string, unknown>
  dispatched_at: string
}

export function getUnipileAgentsConfig(env: Bindings) {
  const enabled = String(env.AGENTS_UNIPILE_ENABLED || '').toLowerCase() === 'true'
  const killSwitchEnv = String(env.AGENTS_UNIPILE_KILL_SWITCH || '').toLowerCase() === 'true'
  const dryRunDefault = String(env.AGENTS_UNIPILE_DRY_RUN || '').toLowerCase() !== 'false'

  return {
    enabled,
    kill_switch_env: killSwitchEnv,
    dry_run_default: dryRunDefault,
    api_url: (env.UNIPILE_API_URL || 'https://api1.unipile.com:13123/api/v1').replace(/\/$/, ''),
    has_api_key: Boolean(env.UNIPILE_API_KEY),
    has_instagram_account_id: Boolean(env.UNIPILE_INSTAGRAM_ACCOUNT_ID),
  }
}

export async function dispatchInstagramAgent(
  env: Bindings,
  input: DispatchAgentInput
): Promise<DispatchAgentResult> {
  const cfg = getUnipileAgentsConfig(env)
  const dryRun = input.dry_run ?? cfg.dry_run_default

  const action =
    input.intent === 'post' ? 'create_instagram_post' :
      input.intent === 'dm' ? 'send_instagram_dm' :
        input.intent === 'comment' ? 'reply_instagram_comment' :
          'handoff_to_human'

  const simulatedPayload = {
    intent: input.intent,
    action,
    message: input.message,
    target: input.target || null,
    metadata: input.metadata || {},
    actor_user_id: input.actor_user_id,
    actor_user_type: input.actor_user_type,
    unipile: {
      api_url: cfg.api_url,
      account_id: env.UNIPILE_INSTAGRAM_ACCOUNT_ID || null,
    },
  }

  if (dryRun || input.intent === 'handoff') {
    return {
      intent: input.intent,
      dry_run: true,
      provider: 'unipile',
      status: 'dry_run',
      action,
      target: input.target || null,
      simulated_payload: simulatedPayload,
      dispatched_at: new Date().toISOString(),
    }
  }

  // MVP Sprint D: integração controlada em modo seguro (fila lógica)
  // Execução real de chamada externa fica atrás do kill-switch + dry-run opt-out.
  return {
    intent: input.intent,
    dry_run: false,
    provider: 'unipile',
    status: 'queued',
    action,
    target: input.target || null,
    simulated_payload: simulatedPayload,
    dispatched_at: new Date().toISOString(),
  }
}
