/**
 * src/lib/prompt-exclusion.ts
 *
 * Fase 0 do plano "Experiência 1000" — exclusão mútua mínima entre prompts
 * (cookie consent, gate de install iOS, install banner, upsell Pro).
 * Invariante: no máximo UM prompt visível por vez em toda a aplicação.
 *
 * O consent (obrigação legal LGPD) usa forceAcquire e sempre entra; os demais
 * usam tryAcquire e, se o slot estiver ocupado, aguardam a próxima
 * oportunidade (release + re-check) ou a próxima sessão.
 *
 * Este módulo é deliberadamente mínimo: será substituído pelo orquestrador
 * completo (Maestro — fila com prioridade, ledger unificado, telemetria)
 * na Fase 1 do plano.
 */

type Unsubscribe = () => void

const active = new Set<string>()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // listener com erro não pode derrubar os demais
    }
  })
}

/** Tenta ocupar o slot. Falha se outro prompt estiver visível. */
export function tryAcquirePromptSlot(id: string): boolean {
  if (active.size > 0 && !active.has(id)) return false
  active.add(id)
  notify()
  return true
}

/** Ocupa o slot incondicionalmente (apenas consent/legal). */
export function forceAcquirePromptSlot(id: string) {
  active.add(id)
  notify()
}

export function releasePromptSlot(id: string) {
  if (active.delete(id)) notify()
}

/** Há algum prompt visível (além do meu)? */
export function isPromptSlotBusy(exceptId?: string): boolean {
  if (active.size === 0) return false
  if (exceptId && active.size === 1 && active.has(exceptId)) return false
  return true
}

/** Notifica em toda mudança de ocupação (acquire/release). */
export function onPromptSlotChange(fn: () => void): Unsubscribe {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
