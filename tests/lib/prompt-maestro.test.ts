// ============================================
// Tests: lib/prompt-maestro.ts — Regras R1-R6 do orquestrador de prompts
// (Fase 1 — Experiência 1000; exigência do plan-eng-review)
// ============================================

import { describe, it, expect } from 'vitest'
import {
  refusalReason,
  selectCandidate,
  migrateLegacyKeys,
  isBlockedRoute,
  SETTLING_MS,
  VICTORY_WINDOW_MS,
  GLOBAL_SPACING_MS,
  MIN_INTERVAL_MS,
  type PromptCandidate,
  type EligibilityInput,
  type MaestroSessionState,
} from '@/lib/prompt-maestro'

const NOW = 1_800_000_000_000

function ledger(overrides: Partial<{ migrated: boolean; events: unknown[]; suppressed: string[] }> = {}) {
  return { migrated: true, events: [], suppressed: [], ...overrides } as EligibilityInput['ledger']
}

function session(overrides: Partial<MaestroSessionState> = {}): MaestroSessionState {
  return {
    startedAt: NOW - SETTLING_MS - 1000, // já acomodado
    nonLegalShown: 0,
    signals: { hero_cta_seen: NOW - 5000 },
    ...overrides,
  }
}

function ctx(overrides: Partial<Omit<EligibilityInput, 'candidate'>> = {}): Omit<EligibilityInput, 'candidate'> {
  return {
    ledger: ledger(),
    session: session(),
    now: NOW,
    pathname: '/treinos',
    consent: 'resolved',
    activeId: null,
    ...overrides,
  }
}

const UPSELL: PromptCandidate = { id: 'upsell', priority: 'upsell' }
const INSTALL: PromptCandidate = { id: 'install-banner', priority: 'install' }
const CONSENT: PromptCandidate = { id: 'consent', priority: 'legal' }

describe('R1 — um prompt por vez', () => {
  it('recusa quando outro prompt está ativo', () => {
    expect(refusalReason({ ...ctx({ activeId: 'install-banner' }), candidate: UPSELL })).toBe('slot_ocupado')
  })
  it('legal também respeita R1', () => {
    expect(refusalReason({ ...ctx({ activeId: 'upsell' }), candidate: CONSENT })).toBe('slot_ocupado')
  })
})

describe('R2 — prioridade legal > install > upsell', () => {
  it('consent pendente vence install e upsell', () => {
    const pick = selectCandidate([UPSELL, INSTALL, CONSENT], ctx({ consent: 'pending' }))
    expect(pick?.id).toBe('consent')
  })
  it('install vence upsell quando ambos elegíveis', () => {
    const pick = selectCandidate([UPSELL, INSTALL], ctx())
    expect(pick?.id).toBe('install-banner')
  })
})

describe('R3 — máximo 1 não-legal por sessão', () => {
  it('recusa segundo não-legal na mesma sessão', () => {
    expect(
      refusalReason({ ...ctx({ session: session({ nonLegalShown: 1 }) }), candidate: UPSELL })
    ).toBe('sessao_esgotada')
  })
  it('legal não conta para o limite de sessão', () => {
    expect(
      refusalReason({
        ...ctx({ session: session({ nonLegalShown: 1 }), consent: 'pending' }),
        candidate: CONSENT,
      })
    ).toBeNull()
  })
})

describe('R4 — acomodação e CTA visto', () => {
  it('recusa não-legal durante a janela de acomodação', () => {
    expect(
      refusalReason({ ...ctx({ session: session({ startedAt: NOW - 5000 }) }), candidate: UPSELL })
    ).toBe('acomodando')
  })
  it('recusa não-legal antes de o CTA do treino ser visto', () => {
    expect(
      refusalReason({ ...ctx({ session: session({ signals: {} }) }), candidate: UPSELL })
    ).toBe('cta_nao_visto')
  })
  it('requiresCtaSeen: false dispensa o sinal', () => {
    expect(
      refusalReason({
        ...ctx({ session: session({ signals: {} }) }),
        candidate: { ...INSTALL, requiresCtaSeen: false },
      })
    ).toBeNull()
  })
})

describe('R5 — espaçamentos e exceção de vitória', () => {
  it('recusa superfície dentro do próprio cooldown', () => {
    const l = ledger({ events: [{ id: 'upsell', type: 'shown', ts: NOW - 3600_000 }] })
    expect(refusalReason({ ...ctx({ ledger: l }), candidate: UPSELL })).toBe('cooldown_superficie')
  })
  it('recusa por dismiss recente', () => {
    const l = ledger({ events: [{ id: 'upsell', type: 'dismissed', ts: NOW - 3600_000 }] })
    expect(refusalReason({ ...ctx({ ledger: l }), candidate: UPSELL })).toBe('dismiss_recente')
  })
  it('recusa por espaçamento global entre superfícies diferentes', () => {
    const l = ledger({ events: [{ id: 'install-banner', type: 'shown', ts: NOW - 3600_000 }] })
    expect(refusalReason({ ...ctx({ ledger: l }), candidate: UPSELL })).toBe('espacamento_global')
  })
  it('vitória recente permite upsell furar cooldown e espaçamento global', () => {
    const l = ledger({
      events: [
        { id: 'upsell', type: 'shown', ts: NOW - 3600_000 },
        { id: 'install-banner', type: 'shown', ts: NOW - 1800_000 },
      ],
    })
    const s = session({ signals: { hero_cta_seen: NOW - 5000, workout_completed: NOW - 60_000 } })
    expect(refusalReason({ ...ctx({ ledger: l, session: s }), candidate: UPSELL })).toBeNull()
  })
  it('vitória NÃO beneficia install (só upsell fura)', () => {
    const l = ledger({ events: [{ id: 'install-banner', type: 'shown', ts: NOW - 3600_000 }] })
    const s = session({ signals: { hero_cta_seen: NOW - 5000, workout_completed: NOW - 60_000 } })
    expect(refusalReason({ ...ctx({ ledger: l, session: s }), candidate: INSTALL })).toBe('cooldown_superficie')
  })
  it('vitória expira após a janela', () => {
    const l = ledger({ events: [{ id: 'upsell', type: 'shown', ts: NOW - 3600_000 }] })
    const s = session({
      signals: { hero_cta_seen: NOW - 5000, workout_completed: NOW - VICTORY_WINDOW_MS - 1000 },
    })
    expect(refusalReason({ ...ctx({ ledger: l, session: s }), candidate: UPSELL })).toBe('cooldown_superficie')
  })
})

describe('R6 — rotas bloqueantes', () => {
  it.each(['/treino-ativo', '/treino-ativo/abc', '/onboarding', '/welcome', '/register/student'])(
    'bloqueia não-legal em %s',
    (path) => {
      expect(isBlockedRoute(path)).toBe(true)
      expect(refusalReason({ ...ctx({ pathname: path }), candidate: UPSELL })).toBe('rota_bloqueada')
    }
  )
  it('legal aparece mesmo em rota bloqueante (regra é só para não-legais)', () => {
    expect(
      refusalReason({ ...ctx({ pathname: '/onboarding', consent: 'pending' }), candidate: CONSENT })
    ).toBeNull()
  })
})

describe('Consent 3 estados', () => {
  it('pending trava não-legais', () => {
    expect(refusalReason({ ...ctx({ consent: 'pending' }), candidate: UPSELL })).toBe('consent_pendente')
  })
  it('not-applicable NÃO trava a fila (PWA/TWA)', () => {
    expect(refusalReason({ ...ctx({ consent: 'not-applicable' }), candidate: UPSELL })).toBeNull()
  })
})

describe('Supressão permanente', () => {
  it('convertido nunca mais aparece', () => {
    expect(
      refusalReason({ ...ctx({ ledger: ledger({ suppressed: ['upsell'] }) }), candidate: UPSELL })
    ).toBe('suprimido_permanente')
  })
})

describe('Migração de chaves legadas', () => {
  const legacy: Record<string, string> = {
    vfit_upgrade_last_shown: String(NOW - 24 * 3600_000),
    'pwa-banner-dismissed-v2': String(NOW - 13 * 24 * 3600_000),
    vfit_upgrade_converted: 'true',
    'ios-pwa-installed': 'true',
  }
  const migrated = migrateLegacyKeys(
    { migrated: false, events: [], suppressed: [] },
    (k) => legacy[k] ?? null
  )

  it('marca como migrado e importa timestamps', () => {
    expect(migrated.migrated).toBe(true)
    expect(migrated.events.some((e) => e.id === 'upsell' && e.type === 'shown')).toBe(true)
    expect(migrated.events.some((e) => e.id === 'install-banner' && e.type === 'dismissed')).toBe(true)
  })
  it('flags permanentes viram supressão definitiva', () => {
    expect(migrated.suppressed).toContain('upsell')
    expect(migrated.suppressed).toContain('ios-gate')
  })
  it('não re-mostra prompt dispensado há 13 dias sob janela de 14 (o caso do review)', () => {
    expect(MIN_INTERVAL_MS['install-banner']).toBe(14 * 24 * 3600_000)
    expect(
      refusalReason({
        ...ctx({ ledger: { ...migrated, suppressed: [] } }),
        candidate: { ...INSTALL, requiresCtaSeen: false },
      })
    ).toBe('dismiss_recente')
  })
  it('migração é idempotente', () => {
    const again = migrateLegacyKeys(migrated, () => {
      throw new Error('não deveria reler chaves')
    })
    expect(again).toBe(migrated)
  })
})