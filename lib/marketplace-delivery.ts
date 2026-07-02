/**
 * lib/marketplace-delivery.ts
 *
 * Entrega de plano comprado no marketplace: materializa o conteúdo do plano
 * (workout_plans.plan_content JSONB, shape {weeks:[{days:[{day,exercises}]}]}
 * do form de criação, ou {days:[...]} genérico) em um novo workout_plans B2C
 * do comprador + workout_plan_days + workout_plan_exercises.
 *
 * Chamado pelo webhook Asaas na confirmação do pagamento. Idempotente:
 * se a compra já está delivered, retorna o plano já clonado.
 */

import { pgQuery, pgQueryOne, generateId } from '@lib/db'
import type { Bindings } from '@workers/types'

interface CanonicalExercise {
  name: string
  muscle_group: string | null
  sets: number
  reps: number
  rest_seconds: number
  weight_kg: number | null
  notes: string | null
}

interface CanonicalDay {
  name: string
  focus: string | null
  muscle_groups: string[]
  exercises: CanonicalExercise[]
}

function firstInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value))
  const match = String(value ?? '').match(/\d+/)
  return match ? parseInt(match[0], 10) : fallback
}

function asString(value: unknown): string | null {
  const str = String(value ?? '').trim()
  return str.length > 0 ? str : null
}

function parseExercise(raw: unknown): CanonicalExercise | null {
  if (!raw || typeof raw !== 'object') return null
  const ex = raw as Record<string, unknown>
  const name = asString(ex.name) || asString(ex.exercise_name) || asString(ex.title)
  if (!name) return null

  return {
    name: name.slice(0, 200),
    muscle_group: asString(ex.muscle_group) || asString(ex.target_muscle),
    sets: firstInt(ex.sets, 3),
    reps: firstInt(ex.reps, 10),
    rest_seconds: firstInt(ex.rest_seconds ?? ex.rest, 60),
    weight_kg: typeof ex.weight_kg === 'number' ? ex.weight_kg : null,
    notes: asString(ex.notes),
  }
}

function parseDay(raw: unknown, index: number): CanonicalDay | null {
  if (!raw || typeof raw !== 'object') return null
  const day = raw as Record<string, unknown>
  const exercises = Array.isArray(day.exercises)
    ? day.exercises.map(parseExercise).filter((e): e is CanonicalExercise => e !== null)
    : []
  if (exercises.length === 0) return null

  const muscleGroups = [...new Set(exercises.map((e) => e.muscle_group).filter((m): m is string => !!m))]

  return {
    name: asString(day.day) || asString(day.name) || asString(day.title) || `Dia ${index + 1}`,
    focus: asString(day.focus),
    muscle_groups: muscleGroups,
    exercises,
  }
}

/** Aceita {weeks:[{days:[...]}]} (form do marketplace) ou {days:[...]} genérico */
export function parsePlanContent(content: unknown): CanonicalDay[] {
  let parsed: unknown = content
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed) } catch { return [] }
  }
  if (!parsed || typeof parsed !== 'object') return []

  const root = parsed as Record<string, unknown>
  let rawDays: unknown[] = []

  if (Array.isArray(root.weeks)) {
    for (const week of root.weeks) {
      const w = week as Record<string, unknown>
      if (Array.isArray(w?.days)) rawDays.push(...w.days)
    }
  } else if (Array.isArray(root.days)) {
    rawDays = root.days
  }

  return rawDays
    .map((d, i) => parseDay(d, i))
    .filter((d): d is CanonicalDay => d !== null)
}

export async function deliverPlanPurchase(
  env: Bindings,
  purchaseId: string
): Promise<{ delivered: boolean; cloned_plan_id: string | null }> {
  const purchase = await pgQueryOne<{
    id: string
    buyer_id: string
    plan_id: string
    delivered: boolean
    cloned_workout_ids: unknown
    title: string
    description: string | null
    plan_content: unknown
  }>(
    env,
    `SELECT pp.id, pp.buyer_id, pp.plan_id, pp.delivered, pp.cloned_workout_ids,
            wp.title, wp.description, wp.plan_content
       FROM plan_purchases pp
       JOIN workout_plans wp ON wp.id = pp.plan_id
      WHERE pp.id = $1
      LIMIT 1`,
    [purchaseId]
  )
  if (!purchase) return { delivered: false, cloned_plan_id: null }

  if (purchase.delivered) {
    const ids = Array.isArray(purchase.cloned_workout_ids) ? purchase.cloned_workout_ids : []
    return { delivered: true, cloned_plan_id: typeof ids[0] === 'string' ? ids[0] : null }
  }

  const days = parsePlanContent(purchase.plan_content)
  if (days.length === 0) {
    console.warn(`[Marketplace] Purchase ${purchaseId}: plan_content sem dias materializáveis — entrega adiada`)
    return { delivered: false, cloned_plan_id: null }
  }

  const clonedPlanId = generateId()
  const now = new Date().toISOString()

  await pgQuery(
    env,
    `INSERT INTO workout_plans (id, user_id, name, title, description, type, status, total_days, current_day, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'marketplace', 'active', $6, 1, $7, $7)`,
    [clonedPlanId, purchase.buyer_id, purchase.title, purchase.title, purchase.description || '', days.length, now]
  )

  for (let d = 0; d < days.length; d++) {
    const day = days[d]
    const dayId = generateId()
    await pgQuery(
      env,
      `INSERT INTO workout_plan_days (id, plan_id, day_number, name, focus, muscle_groups, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [dayId, clonedPlanId, d + 1, day.name, day.focus, day.muscle_groups, d + 1, now]
    )

    for (let i = 0; i < day.exercises.length; i++) {
      const ex = day.exercises[i]
      await pgQuery(
        env,
        `INSERT INTO workout_plan_exercises (id, plan_day_id, name, muscle_group, sets, reps, rest_seconds, weight_kg, notes, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [generateId(), dayId, ex.name, ex.muscle_group, ex.sets, ex.reps, ex.rest_seconds, ex.weight_kg, ex.notes, i + 1, now]
      )
    }
  }

  await pgQuery(
    env,
    `UPDATE plan_purchases SET delivered = true, cloned_workout_ids = $1::jsonb WHERE id = $2`,
    [JSON.stringify([clonedPlanId]), purchaseId]
  )

  console.log(`[Marketplace] Purchase ${purchaseId} delivered: plano ${clonedPlanId} clonado para ${purchase.buyer_id}`)
  return { delivered: true, cloned_plan_id: clonedPlanId }
}
