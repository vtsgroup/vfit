/**
 * src/lib/biometric-lock-policy.ts
 *
 * Política de recorrência do app lock biométrico (B2 — biometria v2).
 *
 * Módulo PURO: sem side effects, sem localStorage, sem window. A persistência
 * da policy escolhida fica em use-passkey.ts (localStorage). Isolado assim para
 * ficar 100% testável de forma determinística — `now` é injetável, nada depende
 * de relógio real. Substitui o cooldown fixo de 1h por uma janela configurável.
 */

export type LockPolicy = 'always' | 'daily' | 'weekly' | 'off'

export const DEFAULT_LOCK_POLICY: LockPolicy = 'daily'
export const LOCK_POLICIES: readonly LockPolicy[] = ['always', 'daily', 'weekly', 'off'] as const

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

/**
 * Intervalo mínimo entre desbloqueios biométricos para cada política:
 *  - always: 0    → pede em todo boot
 *  - daily:  24h
 *  - weekly: 7d
 *  - off:    Infinity → nunca pede
 */
export function lockIntervalMs(policy: LockPolicy): number {
  switch (policy) {
    case 'always':
      return 0
    case 'daily':
      return DAY_MS
    case 'weekly':
      return WEEK_MS
    case 'off':
      return Number.POSITIVE_INFINITY
    default:
      return DAY_MS
  }
}

export interface IsUnlockDueInput {
  /** biometria auto-unlock ativa (passkey registrado + preferência ligada) */
  enabled: boolean
  /** timestamp (ms) da última autenticação biométrica, ou null se nunca autenticou */
  lastAuthAt: number | null
  policy: LockPolicy
  /** injetável para testes determinísticos; default Date.now() */
  now?: number
}

/**
 * Decide se o app deve pedir desbloqueio biométrico neste boot.
 *  - `enabled=false` ou `policy='off'` → nunca (false)
 *  - sem `lastAuthAt` → sempre (true) — primeira vez
 *  - `lastAuthAt` no futuro (clock skew) → dentro da janela (false), nunca trava por relógio inconsistente
 *  - senão → true quando `now - lastAuthAt >= lockIntervalMs(policy)`
 */
export function isUnlockDue({ enabled, lastAuthAt, policy, now = Date.now() }: IsUnlockDueInput): boolean {
  if (!enabled) return false
  if (policy === 'off') return false
  if (lastAuthAt == null) return true
  if (lastAuthAt > now) return false
  return now - lastAuthAt >= lockIntervalMs(policy)
}

/** Type guard para validar valores vindos do localStorage (defensivo). */
export function isValidLockPolicy(value: unknown): value is LockPolicy {
  return value === 'always' || value === 'daily' || value === 'weekly' || value === 'off'
}
