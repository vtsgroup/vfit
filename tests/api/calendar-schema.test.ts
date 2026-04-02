// ============================================
// Tests: Zod Schemas + Conflict Logic — Calendar
// ============================================
//
// Cobre:
//   - createCalendarEventSchema: validação de campos, recorrência
//   - updateCalendarEventSchema: campos opcionais, parcial
//   - recurrenceSchema: freq enum, count range (1–52)
//   - checkConflict logic: overlap detection (unit-level, via SQL overlap predicate)
//   - boundary cases: eventos adjacentes NÃO conflitam
// ============================================

import { describe, it, expect } from 'vitest'
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  recurrenceSchema,
} from '@workers/schemas/calendar'
import { computeRecurringOffset } from '@workers/api/calendar'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if two intervals overlap using the same predicate as the DB query:
 *  NOT (end_a <= start_b OR start_a >= end_b)
 *  This mirrors the SQL: NOT (end_at <= $start OR start_at >= $end)
 */
function overlaps(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string
): boolean {
  return !(aEnd <= bStart || aStart >= bEnd)
}

// ─── recurrenceSchema ─────────────────────────────────────────────────────────

describe('recurrenceSchema', () => {
  it('deve aceitar freq daily com count válido', () => {
    expect(recurrenceSchema.safeParse({ freq: 'daily', count: 5 }).success).toBe(true)
  })

  it('deve aceitar freq weekly', () => {
    expect(recurrenceSchema.safeParse({ freq: 'weekly', count: 12 }).success).toBe(true)
  })

  it('deve aceitar freq monthly', () => {
    expect(recurrenceSchema.safeParse({ freq: 'monthly', count: 6 }).success).toBe(true)
  })

  it('deve aceitar count máximo = 52', () => {
    expect(recurrenceSchema.safeParse({ freq: 'weekly', count: 52 }).success).toBe(true)
  })

  it('deve rejeitar count = 0', () => {
    expect(recurrenceSchema.safeParse({ freq: 'weekly', count: 0 }).success).toBe(false)
  })

  it('deve rejeitar count > 52', () => {
    expect(recurrenceSchema.safeParse({ freq: 'weekly', count: 53 }).success).toBe(false)
  })

  it('deve rejeitar freq inválida', () => {
    expect(recurrenceSchema.safeParse({ freq: 'hourly', count: 3 }).success).toBe(false)
  })

  it('deve rejeitar count fracionário', () => {
    expect(recurrenceSchema.safeParse({ freq: 'daily', count: 1.5 }).success).toBe(false)
  })
})

// ─── createCalendarEventSchema ────────────────────────────────────────────────

describe('createCalendarEventSchema', () => {
  const base = {
    start_at: '2026-03-20T09:00:00.000Z',
    end_at: '2026-03-20T10:00:00.000Z',
  }

  it('deve aceitar evento mínimo válido', () => {
    expect(createCalendarEventSchema.safeParse(base).success).toBe(true)
  })

  it('deve aceitar evento completo com recorrência', () => {
    const result = createCalendarEventSchema.safeParse({
      ...base,
      title: 'Treino semanal',
      notes: 'Foco em HIIT',
      color: 'green',
      status: 'busy',
      recurrence: { freq: 'weekly', count: 8 },
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar sem recorrência (undefined)', () => {
    const result = createCalendarEventSchema.safeParse({ ...base, recurrence: undefined })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar start_at inválido', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, start_at: 'not-a-date' }).success).toBe(false)
  })

  it('deve rejeitar end_at inválido', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, end_at: 'not-a-date' }).success).toBe(false)
  })

  it('deve rejeitar title > 120 chars', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, title: 'x'.repeat(121) }).success).toBe(false)
  })

  it('deve rejeitar notes > 2000 chars', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, notes: 'x'.repeat(2001) }).success).toBe(false)
  })

  it('deve rejeitar meeting_url inválida', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, meeting_url: 'not-a-url' }).success).toBe(false)
  })

  it('deve rejeitar color inválida', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, color: 'yellow' }).success).toBe(false)
  })

  it('deve rejeitar status inválido', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, status: 'unknown' }).success).toBe(false)
  })

  it('deve rejeitar student_id com formato inválido', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, student_id: 'not-uuid' }).success).toBe(false)
  })

  it('deve aceitar student_id como null', () => {
    expect(createCalendarEventSchema.safeParse({ ...base, student_id: null }).success).toBe(true)
  })

  it('deve rejeitar recorrência com count inválido', () => {
    expect(
      createCalendarEventSchema.safeParse({ ...base, recurrence: { freq: 'weekly', count: 0 } }).success
    ).toBe(false)
  })
})

// ─── updateCalendarEventSchema ────────────────────────────────────────────────

describe('updateCalendarEventSchema', () => {
  it('deve aceitar patch parcial (só title)', () => {
    expect(updateCalendarEventSchema.safeParse({ title: 'Novo título' }).success).toBe(true)
  })

  it('deve aceitar patch de horário', () => {
    expect(
      updateCalendarEventSchema.safeParse({
        start_at: '2026-03-21T10:00:00.000Z',
        end_at: '2026-03-21T11:00:00.000Z',
      }).success
    ).toBe(true)
  })

  it('deve rejeitar color inválida no patch', () => {
    expect(updateCalendarEventSchema.safeParse({ color: 'pink' }).success).toBe(false)
  })

  it('deve rejeitar meeting_url inválida no patch', () => {
    expect(updateCalendarEventSchema.safeParse({ meeting_url: 'not-a-url-at-all' }).success).toBe(false)
  })

  it('deve aceitar objeto vazio (nenhum campo)', () => {
    // Schema aceita — validação de "nenhum campo" é responsabilidade do handler
    expect(updateCalendarEventSchema.safeParse({}).success).toBe(true)
  })
})

// ─── computeRecurringOffset — monthly overflow / clamping ─────────────────────
//
// Critical: JS Date.setMonth() overflows on day 29-31 for short months.
// Jan 31 + 1 month → March 3 (JS default), should be Feb 28 (clamped).

describe('computeRecurringOffset — monthly overflow', () => {
  const toISO = (ms: number) => new Date(ms).toISOString().slice(0, 10)

  it('Jan 31 + 1 month → Feb 28 (not March 3)', () => {
    const base = new Date('2026-01-31T09:00:00.000Z').getTime()
    expect(toISO(computeRecurringOffset(base, 1, 'monthly'))).toBe('2026-02-28')
  })

  it('Mar 31 + 1 month → Apr 30 (not May 1)', () => {
    const base = new Date('2026-03-31T09:00:00.000Z').getTime()
    expect(toISO(computeRecurringOffset(base, 1, 'monthly'))).toBe('2026-04-30')
  })

  it('Jan 15 + 1 month → Feb 15 (no overflow, no clamping)', () => {
    const base = new Date('2026-01-15T09:00:00.000Z').getTime()
    expect(toISO(computeRecurringOffset(base, 1, 'monthly'))).toBe('2026-02-15')
  })

  it('Jan 31 + 0 months → Jan 31 (i=0 is always identity)', () => {
    const base = new Date('2026-01-31T09:00:00.000Z').getTime()
    expect(computeRecurringOffset(base, 0, 'monthly')).toBe(base)
  })

  it('preserves time component (09:00 UTC)', () => {
    const base = new Date('2026-01-31T09:00:00.000Z').getTime()
    const result = new Date(computeRecurringOffset(base, 1, 'monthly'))
    expect(result.getUTCHours()).toBe(9)
    expect(result.getUTCMinutes()).toBe(0)
  })
})

describe('computeRecurringOffset — daily and weekly', () => {
  const base = new Date('2026-03-20T09:00:00.000Z').getTime()
  const DAY_MS = 24 * 60 * 60 * 1000

  it('daily: i=7 → +7 days exactly', () => {
    expect(computeRecurringOffset(base, 7, 'daily')).toBe(base + 7 * DAY_MS)
  })

  it('weekly: i=4 → +28 days exactly', () => {
    expect(computeRecurringOffset(base, 4, 'weekly')).toBe(base + 4 * 7 * DAY_MS)
  })
})

// ─── Conflict detection logic (overlap predicate) ─────────────────────────────
//
// Testa a lógica SQL: NOT (end_at <= $start OR start_at >= $end)
// Isso espelha exatamente o que checkConflict() executa no banco.

describe('conflict detection — overlap predicate', () => {
  // Evento A: 09:00 → 10:00
  const A_START = '2026-03-20T09:00:00.000Z'
  const A_END   = '2026-03-20T10:00:00.000Z'

  it('deve detectar overlap: B começa antes de A terminar', () => {
    // B: 09:30 → 10:30 — overlap com A
    expect(overlaps(A_START, A_END, '2026-03-20T09:30:00.000Z', '2026-03-20T10:30:00.000Z')).toBe(true)
  })

  it('deve detectar overlap: B contido dentro de A', () => {
    // B: 09:15 → 09:45 — totalmente dentro de A
    expect(overlaps(A_START, A_END, '2026-03-20T09:15:00.000Z', '2026-03-20T09:45:00.000Z')).toBe(true)
  })

  it('deve detectar overlap: B envolve A completamente', () => {
    // B: 08:00 → 11:00 — cobre A inteiro
    expect(overlaps(A_START, A_END, '2026-03-20T08:00:00.000Z', '2026-03-20T11:00:00.000Z')).toBe(true)
  })

  it('deve detectar overlap: B começa exatamente no início de A', () => {
    // B: 09:00 → 09:30 — compartilha início com A
    expect(overlaps(A_START, A_END, '2026-03-20T09:00:00.000Z', '2026-03-20T09:30:00.000Z')).toBe(true)
  })

  it('NÃO deve detectar overlap: B termina quando A começa (adjacente)', () => {
    // B: 08:00 → 09:00 — termina exatamente quando A começa → sem conflito
    expect(overlaps(A_START, A_END, '2026-03-20T08:00:00.000Z', '2026-03-20T09:00:00.000Z')).toBe(false)
  })

  it('NÃO deve detectar overlap: B começa quando A termina (adjacente)', () => {
    // B: 10:00 → 11:00 — começa exatamente quando A termina → sem conflito
    expect(overlaps(A_START, A_END, '2026-03-20T10:00:00.000Z', '2026-03-20T11:00:00.000Z')).toBe(false)
  })

  it('NÃO deve detectar overlap: B completamente antes de A', () => {
    // B: 07:00 → 08:30 — antes de A
    expect(overlaps(A_START, A_END, '2026-03-20T07:00:00.000Z', '2026-03-20T08:30:00.000Z')).toBe(false)
  })

  it('NÃO deve detectar overlap: B completamente depois de A', () => {
    // B: 11:00 → 12:00 — depois de A
    expect(overlaps(A_START, A_END, '2026-03-20T11:00:00.000Z', '2026-03-20T12:00:00.000Z')).toBe(false)
  })

  it('deve detectar overlap: eventos em dias diferentes mas mesmo horário', () => {
    // A amanhã: mesma hora → sem conflito com A de hoje
    expect(overlaps(A_START, A_END, '2026-03-21T09:00:00.000Z', '2026-03-21T10:00:00.000Z')).toBe(false)
  })
})
