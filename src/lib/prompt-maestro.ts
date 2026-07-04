/**
 * src/lib/prompt-maestro.ts
 *
 * Maestro — orquestrador central de prompts (Fase 1 do plano Experiência 1000).
 *
 * Toda superfície de prompt (consent, gate iOS, install banner, upsell) pede
 * um slot ao Maestro em vez de decidir sozinha. Invariantes:
 *   R1. Máximo 1 prompt visível por vez (fila, nunca pilha).
 *   R2. Prioridade: legal > install > upsell > info.
 *   R3. Máximo 1 prompt não-legal por sessão.
 *   R4. Nenhum não-legal antes da janela de acomodação (20s) nem antes do
 *       usuário ver o CTA do treino (sinal hero_cta_seen), quando aplicável.
 *   R5. Espaçamento mínimo entre exibições por superfície (ledger unificado);
 *       exceção: upsell pós-vitória fura o espaçamento (receita > install).
 *   R6. Rotas bloqueantes (treino-ativo, onboarding, checkout, auth) nunca
 *       recebem prompt não-legal.
 *
 * Consent tem 3 estados (pending | resolved | not-applicable): em PWA/TWA ou
 * rota suprimida ele é not-applicable e NÃO trava a fila.
 *
 * Kill-switch: localStorage 'vfit-maestro-disabled' = 'true' desliga o Maestro
 * e as superfícies caem no comportamento da Fase 0 (prompt-exclusion).
 *
 * Ledger 'vfit-prompt-ledger' unifica o histórico (shown/dismissed/converted)
 * e migra as chaves legadas UMA vez, honrando a maior janela entre a regra
 * antiga e a nova (nunca re-mostra prompt já dispensado).
 */

// ─── Tipos ────────────────────────────────────────────────────────────

export type PromptPriority = 'legal' | 'install' | 'upsell' | 'info'

export type PromptOutcome = 'dismissed' | 'converted' | 'completed'

export type ConsentState = 'pending' | 'resolved' | 'not-applicable'

export type MaestroSignal =
  | 'hero_cta_seen'
  | 'workout_completed'
  | 'streak_milestone'
  | 'new_student'

export interface PromptCandidate {
  id: string
  priority: PromptPriority
  /** Exige que o CTA do treino já tenha sido visto (R4). Default: true p/ não-legais. */
  requiresCtaSeen?: boolean
}

export interface LedgerEvent {
  id: string
  type: 'shown' | PromptOutcome
  ts: number
}

interface Ledger {
  migrated: boolean
  events: LedgerEvent[]
  /** Supressões permanentes (convertido, instalado). */
  suppressed: string[]
}

export interface MaestroSessionState {
  startedAt: number
  nonLegalShown: number
  signals: Partial<Record<MaestroSignal, number>>
}

// ─── Constantes ───────────────────────────────────────────────────────

export const SETTLING_MS = 20_000
export const VICTORY_WINDOW_MS = 5 * 60_000
const SESSION_IDLE_MS = 30 * 60_000

const LEDGER_KEY = 'vfit-prompt-ledger'
const SESSION_KEY = 'vfit-maestro-session'
const KILL_SWITCH_KEY = 'vfit-maestro-disabled'

const PRIORITY_ORDER: Record<PromptPriority, number> = {
  legal: 0,
  install: 1,
  upsell: 2,
  info: 3,
}

/** Espaçamento mínimo entre EXIBIÇÕES da mesma superfície (R5). */
export const MIN_INTERVAL_MS: Record<string, number> = {
  upsell: 72 * 3600_000, // 3 dias (mantém a regra legada)
  'install-banner': 14 * 24 * 3600_000,
  'ios-gate': 72 * 3600_000,
}

/** Espaçamento global entre prompts não-legais de superfícies diferentes. */
export const GLOBAL_SPACING_MS = 72 * 3600_000

const BLOCKED_ROUTE_PREFIXES = [
  '/treino-ativo',
  '/onboarding',
  '/checkout',
  '/welcome',
  '/login',
  '/register',
  '/auth',
  '/reset-password',
  '/verify-email',
]

// ─── Regras puras (unit-testáveis) ────────────────────────────────────

export function isBlockedRoute(pathname: string): boolean {
  return BLOCKED_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

export function lastEventOf(
  ledger: Ledger,
  id: string,
  type?: LedgerEvent['type']
): LedgerEvent | null {
  for (let i = ledger.events.length - 1; i >= 0; i--) {
    const e = ledger.events[i]
    if (e.id === id && (!type || e.type === type)) return e
  }
  return null
}

export function lastNonLegalShownTs(ledger: Ledger, legalIds: string[]): number {
  for (let i = ledger.events.length - 1; i >= 0; i--) {
    const e = ledger.events[i]
    if (e.type === 'shown' && !legalIds.includes(e.id)) return e.ts
  }
  return 0
}

export interface EligibilityInput {
  candidate: PromptCandidate
  ledger: Ledger
  session: MaestroSessionState
  now: number
  pathname: string
  consent: ConsentState
  activeId: string | null
}

/** R1-R6 como função pura. Retorna motivo da recusa ou null (elegível). */
export function refusalReason(input: EligibilityInput): string | null {
  const { candidate, ledger, session, now, pathname, consent, activeId } = input

  // R1 — slot ocupado por outro prompt
  if (activeId && activeId !== candidate.id) return 'slot_ocupado'

  // Supressão permanente (convertido / instalado)
  if (ledger.suppressed.includes(candidate.id)) return 'suprimido_permanente'

  if (candidate.priority === 'legal') return null // legal só respeita R1

  // Consent pendente trava todos os não-legais
  if (consent === 'pending') return 'consent_pendente'

  // R6 — rota bloqueante
  if (isBlockedRoute(pathname)) return 'rota_bloqueada'

  // R4 — janela de acomodação
  if (now - session.startedAt < SETTLING_MS) return 'acomodando'

  // R4 — CTA do treino visto (quando exigido)
  const requiresCta = candidate.requiresCtaSeen !== false
  if (requiresCta && !session.signals.hero_cta_seen) return 'cta_nao_visto'

  // R3 — 1 não-legal por sessão
  if (session.nonLegalShown >= 1) return 'sessao_esgotada'

  // Vitória recente permite ao upsell furar espaçamentos (decisão CEO-review)
  const victoryTs = Math.max(
    session.signals.workout_completed ?? 0,
    session.signals.streak_milestone ?? 0,
    session.signals.new_student ?? 0
  )
  const victoryActive =
    candidate.priority === 'upsell' && now - victoryTs < VICTORY_WINDOW_MS && victoryTs > 0

  // R5 — espaçamento por superfície
  const own = lastEventOf(ledger, candidate.id, 'shown')
  const minInterval = MIN_INTERVAL_MS[candidate.id] ?? GLOBAL_SPACING_MS
  if (own && now - own.ts < minInterval && !victoryActive) return 'cooldown_superficie'

  // Dismiss recente também respeita a janela da superfície
  const dismissed = lastEventOf(ledger, candidate.id, 'dismissed')
  if (dismissed && now - dismissed.ts < minInterval && !victoryActive) return 'dismiss_recente'

  // R5 — espaçamento global entre superfícies diferentes
  const lastAny = lastNonLegalShownTs(ledger, [])
  if (lastAny && now - lastAny < GLOBAL_SPACING_MS && !victoryActive) return 'espacamento_global'

  return null
}

/** Escolhe o candidato de maior prioridade elegível (R2). */
export function selectCandidate(
  candidates: PromptCandidate[],
  ctx: Omit<EligibilityInput, 'candidate'>
): PromptCandidate | null {
  const sorted = [...candidates].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
  for (const c of sorted) {
    if (refusalReason({ ...ctx, candidate: c }) === null) return c
  }
  return null
}

// ─── Ledger + migração ────────────────────────────────────────────────

const LEGACY_TS_KEYS: Array<{ key: string; id: string; type: LedgerEvent['type'] }> = [
  { key: 'vfit_upgrade_last_shown', id: 'upsell', type: 'shown' },
  { key: 'pwa-banner-dismissed-v2', id: 'install-banner', type: 'dismissed' },
  { key: 'vfit_banner_dismissed', id: 'install-banner', type: 'dismissed' },
  { key: 'ios-gate-dismissed-ts', id: 'ios-gate', type: 'dismissed' },
  { key: 'ios-banner-dismissed-ts', id: 'ios-gate', type: 'dismissed' },
]

const LEGACY_SUPPRESS_KEYS: Array<{ key: string; id: string }> = [
  { key: 'vfit_upgrade_converted', id: 'upsell' },
  { key: 'ios-pwa-installed', id: 'ios-gate' },
]

function emptyLedger(): Ledger {
  return { migrated: false, events: [], suppressed: [] }
}

export function migrateLegacyKeys(
  ledger: Ledger,
  read: (key: string) => string | null
): Ledger {
  if (ledger.migrated) return ledger
  const events = [...ledger.events]
  const suppressed = [...ledger.suppressed]

  for (const { key, id, type } of LEGACY_TS_KEYS) {
    const raw = read(key)
    if (!raw) continue
    const ts = parseInt(raw, 10)
    if (Number.isFinite(ts) && ts > 0) events.push({ id, type, ts })
  }
  for (const { key, id } of LEGACY_SUPPRESS_KEYS) {
    if (read(key) === 'true' && !suppressed.includes(id)) suppressed.push(id)
  }
  events.sort((a, b) => a.ts - b.ts)
  return { migrated: true, events, suppressed }
}

function readLedger(): Ledger {
  if (typeof window === 'undefined') return emptyLedger()
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    const parsed = raw ? (JSON.parse(raw) as Ledger) : emptyLedger()
    if (!parsed.migrated) {
      const migrated = migrateLegacyKeys(parsed, (k) => {
        try {
          return localStorage.getItem(k)
        } catch {
          return null
        }
      })
      writeLedger(migrated)
      return migrated
    }
    return parsed
  } catch {
    return emptyLedger()
  }
}

function writeLedger(ledger: Ledger) {
  try {
    // Mantém o ledger enxuto: últimos 200 eventos bastam para as regras.
    const trimmed: Ledger = { ...ledger, events: ledger.events.slice(-200) }
    localStorage.setItem(LEDGER_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage indisponível (modo privado) — limitação conhecida da Fase 1
  }
}

// ─── Sessão ───────────────────────────────────────────────────────────

function readSession(now: number): MaestroSessionState {
  if (typeof window === 'undefined') return { startedAt: now, nonLegalShown: 0, signals: {} }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      const s = JSON.parse(raw) as MaestroSessionState & { lastActivity?: number }
      // Sessão expira por inatividade (aba dormiu e voltou horas depois)
      if (now - (s.lastActivity ?? s.startedAt) < SESSION_IDLE_MS) {
        return { startedAt: s.startedAt, nonLegalShown: s.nonLegalShown, signals: s.signals ?? {} }
      }
    }
  } catch {
    // corrompida → recomeça
  }
  return { startedAt: now, nonLegalShown: 0, signals: {} }
}

function writeSession(s: MaestroSessionState) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...s, lastActivity: Date.now() })
    )
  } catch {
    // sessionStorage indisponível
  }
}

// ─── Telemetria (padrão gtag do projeto, fire-and-forget) ─────────────

function trackPromptEvent(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    const gtag = (
      window as Window & { gtag?: (c: string, n: string, d?: Record<string, unknown>) => void }
    ).gtag
    if (typeof gtag === 'function') {
      gtag('event', event, params)
    }
  } catch {
    // telemetria nunca pode quebrar o produto
  }
}

// ─── Store singleton (useSyncExternalStore-compatível) ────────────────

export function isMaestroEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(KILL_SWITCH_KEY) !== 'true'
  } catch {
    return true
  }
}

interface MaestroState {
  activeId: string | null
  consent: ConsentState
}

const candidates = new Map<string, PromptCandidate>()
let state: MaestroState = { activeId: null, consent: 'pending' }
let session: MaestroSessionState | null = null
const storeListeners = new Set<() => void>()
let evaluateTimer: ReturnType<typeof setTimeout> | null = null

function getSession(): MaestroSessionState {
  if (!session) session = readSession(Date.now())
  return session
}

function emit() {
  storeListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // listener quebrado não derruba os demais
    }
  })
}

function setState(next: Partial<MaestroState>) {
  state = { ...state, ...next }
  emit()
}

function evaluate() {
  if (typeof window === 'undefined') return
  if (state.activeId) return
  const now = Date.now()
  const s = getSession()
  const pick = selectCandidate([...candidates.values()], {
    ledger: readLedger(),
    session: s,
    now,
    pathname: window.location.pathname,
    consent: state.consent,
    activeId: state.activeId,
  })
  if (pick) {
    if (pick.priority !== 'legal') {
      s.nonLegalShown += 1
      writeSession(s)
      const ledger = readLedger()
      ledger.events.push({ id: pick.id, type: 'shown', ts: now })
      writeLedger(ledger)
    }
    setState({ activeId: pick.id })
    trackPromptEvent('prompt_shown', { prompt_id: pick.id, priority: pick.priority })
  } else {
    // Reavalia quando a janela de acomodação vencer (única espera temporal interna)
    const wait = SETTLING_MS - (now - s.startedAt)
    if (wait > 0 && !evaluateTimer) {
      evaluateTimer = setTimeout(() => {
        evaluateTimer = null
        evaluate()
      }, wait + 250)
    }
  }
}

// ─── API pública ──────────────────────────────────────────────────────

export function registerPrompt(candidate: PromptCandidate) {
  candidates.set(candidate.id, candidate)
  evaluate()
}

export function unregisterPrompt(id: string) {
  candidates.delete(id)
  if (state.activeId === id) setState({ activeId: null })
}

/** Superfície informa que o usuário resolveu o prompt. Libera o slot. */
export function resolvePrompt(id: string, outcome: PromptOutcome) {
  const ledger = readLedger()
  ledger.events.push({ id, type: outcome, ts: Date.now() })
  if (outcome === 'converted' || outcome === 'completed') {
    if (!ledger.suppressed.includes(id) && id !== 'consent') ledger.suppressed.push(id)
  }
  writeLedger(ledger)
  candidates.delete(id)
  if (state.activeId === id) setState({ activeId: null })
  trackPromptEvent('prompt_' + outcome, { prompt_id: id })
  // Não reavalia imediatamente: R3 já limita a 1 não-legal/sessão e o
  // respiro entre prompts é garantido pela própria sessão.
}

export function setConsentState(consent: ConsentState) {
  if (state.consent !== consent) {
    setState({ consent })
    evaluate()
  }
}

export function notifyMaestroSignal(signal: MaestroSignal) {
  const s = getSession()
  s.signals[signal] = Date.now()
  writeSession(s)
  evaluate()
}

export function subscribeMaestro(fn: () => void): () => void {
  storeListeners.add(fn)
  return () => storeListeners.delete(fn)
}

export function getMaestroSnapshot(): string | null {
  return state.activeId
}

export function getMaestroServerSnapshot(): string | null {
  return null
}

/** Somente para testes. */
export function __resetMaestroForTests() {
  candidates.clear()
  state = { activeId: null, consent: 'pending' }
  session = null
  if (evaluateTimer) {
    clearTimeout(evaluateTimer)
    evaluateTimer = null
  }
}
