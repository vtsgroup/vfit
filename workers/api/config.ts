/**
 * workers/api/config.ts
 *
 * Platform Configuration API — Dynamic plans & settings from D1
 *
 * Exports: configRoutes
 * Features: DB: D1 · Cache: KV · Auth: super_admin only for mutations
 *
 * Public endpoints (cached):
 *   GET /plans/b2b       — All active B2B plans
 *   GET /plans/b2c       — All active B2C plans
 *   GET /config/:category — Config values by category
 *
 * Super Admin endpoints:
 *   PUT /plans/b2b/:slug  — Update B2B plan
 *   PUT /plans/b2c/:slug  — Update B2C plan
 *   PUT /config/:key      — Update config value
 *   GET /config/all        — All config grouped by category
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { success } from '@lib/response'
import { BadRequestError, ForbiddenError, NotFoundError } from '@lib/errors'
import { pgQueryOne } from '@lib/db'
import { createMiddleware } from 'hono/factory'
import { CACHE_TTL } from '@config/constants'

const configRoutes = new Hono<AppContext>()

// ============================================
// Cache keys
// ============================================
const CK = {
  b2b: 'config:plans:b2b',
  b2c: 'config:plans:b2c',
  configAll: 'config:all',
  configCat: (cat: string) => `config:cat:${cat}`,
}

// ============================================
// Super Admin middleware
// ============================================
const requireSuperAdmin = createMiddleware<AppContext>(async (c, next) => {
  const userId = c.get('userId')
  const user = await pgQueryOne<{ role: string }>(
    c.env,
    'SELECT role FROM users WHERE id = $1',
    [userId]
  )
  if (!user || user.role !== 'super_admin') {
    throw new ForbiddenError('Acesso restrito a super administradores')
  }
  c.set('userRole', 'super_admin')
  await next()
})

// ============================================
// Helper: invalidate KV cache
// ============================================
async function invalidateCache(kv: KVNamespace, keys: string[]) {
  await Promise.all(keys.map((k) => kv.delete(k)))
}

// ============================================
// PUBLIC: GET /plans/b2b — All active B2B plans
// ============================================
configRoutes.get('/plans/b2b', async (c) => {
  const kv = c.env.KV_CACHE

  // Try cache first
  const cached = await kv.get(CK.b2b, 'json')
  if (cached) return success(cached)

  const db = c.env.DB
  const result = await db
    .prepare('SELECT * FROM platform_plans_b2b WHERE is_active = 1 ORDER BY display_order')
    .all()

  const plans = (result.results ?? []).map(parsePlanB2B)

  // Cache for 1 hour
  await kv.put(CK.b2b, JSON.stringify(plans), { expirationTtl: 3600 })

  return success(plans)
})

// ============================================
// PUBLIC: GET /plans/b2c — All active B2C plans
// ============================================
configRoutes.get('/plans/b2c', async (c) => {
  const kv = c.env.KV_CACHE

  const cached = await kv.get(CK.b2c, 'json')
  if (cached) return success(cached)

  const db = c.env.DB
  const result = await db
    .prepare('SELECT * FROM platform_plans_b2c WHERE is_active = 1 ORDER BY display_order')
    .all()

  const plans = (result.results ?? []).map(parsePlanB2C)

  await kv.put(CK.b2c, JSON.stringify(plans), { expirationTtl: 3600 })

  return success(plans)
})

// ============================================
// PUBLIC: GET /config/:category — Config by category
// ============================================
configRoutes.get('/config/:category', async (c) => {
  const category = c.req.param('category')
  const kv = c.env.KV_CACHE
  const cacheKey = CK.configCat(category)

  const cached = await kv.get(cacheKey, 'json')
  if (cached) return success(cached)

  const db = c.env.DB
  const result = await db
    .prepare('SELECT * FROM platform_config WHERE category = ? ORDER BY config_key')
    .bind(category)
    .all()

  const configs = (result.results ?? []).map(parseConfig)

  await kv.put(cacheKey, JSON.stringify(configs), { expirationTtl: 3600 })

  return success(configs)
})

// ============================================
// SUPER ADMIN: GET /config/all — All config grouped
// ============================================
configRoutes.get('/config/all', authMiddleware, requireSuperAdmin, async (c) => {
  const db = c.env.DB
  const result = await db
    .prepare('SELECT * FROM platform_config ORDER BY category, config_key')
    .all()

  const configs = (result.results ?? []).map(parseConfig)

  // Group by category
  const grouped: Record<string, typeof configs> = {}
  for (const cfg of configs) {
    const cat = cfg.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(cfg)
  }

  return success(grouped)
})

// ============================================
// SUPER ADMIN: PUT /plans/b2b/:slug
// ============================================
configRoutes.put('/plans/b2b/:slug', authMiddleware, requireSuperAdmin, async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json<{
    name?: string
    price_brl?: number
    duration_days?: number | null
    max_students?: number
    features?: string[]
    display_order?: number
    is_active?: boolean
  }>()

  const db = c.env.DB

  // Check exists
  const existing = await db
    .prepare('SELECT slug FROM platform_plans_b2b WHERE slug = ?')
    .bind(slug)
    .first()
  if (!existing) throw new NotFoundError('Plano B2B não encontrado')

  // Build SET clauses
  const sets: string[] = []
  const params: unknown[] = []

  if (body.name !== undefined) { sets.push('name = ?'); params.push(body.name) }
  if (body.price_brl !== undefined) { sets.push('price_brl = ?'); params.push(body.price_brl) }
  if (body.duration_days !== undefined) { sets.push('duration_days = ?'); params.push(body.duration_days) }
  if (body.max_students !== undefined) { sets.push('max_students = ?'); params.push(body.max_students) }
  if (body.features !== undefined) { sets.push('features = ?'); params.push(JSON.stringify(body.features)) }
  if (body.display_order !== undefined) { sets.push('display_order = ?'); params.push(body.display_order) }
  if (body.is_active !== undefined) { sets.push('is_active = ?'); params.push(body.is_active ? 1 : 0) }

  if (sets.length === 0) throw new BadRequestError('Nenhum campo para atualizar')

  sets.push("updated_at = datetime('now')")
  params.push(slug)

  await db
    .prepare(`UPDATE platform_plans_b2b SET ${sets.join(', ')} WHERE slug = ?`)
    .bind(...params)
    .run()

  // Invalidate cache
  await invalidateCache(c.env.KV_CACHE, [CK.b2b])

  // Return updated plan
  const updated = await db
    .prepare('SELECT * FROM platform_plans_b2b WHERE slug = ?')
    .bind(slug)
    .first()

  return success(parsePlanB2B(updated!))
})

// ============================================
// SUPER ADMIN: PUT /plans/b2c/:slug
// ============================================
configRoutes.put('/plans/b2c/:slug', authMiddleware, requireSuperAdmin, async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json<{
    name?: string
    price_brl?: number
    duration_days?: number | null
    features?: string[]
    limits?: Record<string, unknown>
    display_order?: number
    is_active?: boolean
  }>()

  const db = c.env.DB

  const existing = await db
    .prepare('SELECT slug FROM platform_plans_b2c WHERE slug = ?')
    .bind(slug)
    .first()
  if (!existing) throw new NotFoundError('Plano B2C não encontrado')

  const sets: string[] = []
  const params: unknown[] = []

  if (body.name !== undefined) { sets.push('name = ?'); params.push(body.name) }
  if (body.price_brl !== undefined) { sets.push('price_brl = ?'); params.push(body.price_brl) }
  if (body.duration_days !== undefined) { sets.push('duration_days = ?'); params.push(body.duration_days) }
  if (body.features !== undefined) { sets.push('features = ?'); params.push(JSON.stringify(body.features)) }
  if (body.limits !== undefined) { sets.push('limits = ?'); params.push(JSON.stringify(body.limits)) }
  if (body.display_order !== undefined) { sets.push('display_order = ?'); params.push(body.display_order) }
  if (body.is_active !== undefined) { sets.push('is_active = ?'); params.push(body.is_active ? 1 : 0) }

  if (sets.length === 0) throw new BadRequestError('Nenhum campo para atualizar')

  sets.push("updated_at = datetime('now')")
  params.push(slug)

  await db
    .prepare(`UPDATE platform_plans_b2c SET ${sets.join(', ')} WHERE slug = ?`)
    .bind(...params)
    .run()

  await invalidateCache(c.env.KV_CACHE, [CK.b2c])

  const updated = await db
    .prepare('SELECT * FROM platform_plans_b2c WHERE slug = ?')
    .bind(slug)
    .first()

  return success(parsePlanB2C(updated!))
})

// ============================================
// SUPER ADMIN: PUT /config/:key — Update config value
// ============================================
configRoutes.put('/config/:key', authMiddleware, requireSuperAdmin, async (c) => {
  const key = c.req.param('key')
  const body = await c.req.json<{ value: unknown }>()

  if (body.value === undefined) throw new BadRequestError('Campo value é obrigatório')

  const db = c.env.DB
  const userId = c.get('userId')

  const existing = await db
    .prepare('SELECT config_key, is_editable, category FROM platform_config WHERE config_key = ?')
    .bind(key)
    .first<{ config_key: string; is_editable: number; category: string }>()

  if (!existing) throw new NotFoundError('Config não encontrada')
  if (!existing.is_editable) throw new ForbiddenError('Esta config não pode ser editada')

  const serialized = typeof body.value === 'string' ? body.value : JSON.stringify(body.value)

  await db
    .prepare("UPDATE platform_config SET config_value = ?, updated_at = datetime('now'), updated_by = ? WHERE config_key = ?")
    .bind(serialized, userId, key)
    .run()

  // Invalidate category cache + all cache
  await invalidateCache(c.env.KV_CACHE, [
    CK.configCat(existing.category),
    CK.configAll,
  ])

  return success({ key, value: body.value, updated: true })
})

// ============================================
// Parsers — D1 rows to typed objects
// ============================================
interface PlanB2BRow {
  slug: string
  name: string
  price_brl: number
  duration_days: number | null
  max_students: number
  features: string
  display_order: number
  is_active: number
  created_at: string
  updated_at: string
}

interface PlanB2CRow {
  slug: string
  name: string
  price_brl: number
  duration_days: number | null
  features: string
  limits: string
  display_order: number
  is_active: number
  created_at: string
  updated_at: string
}

interface ConfigRow {
  config_key: string
  config_value: string
  category: string
  label: string
  description: string
  value_type: string
  is_editable: number
  updated_at: string
  updated_by: string | null
}

function parsePlanB2B(row: unknown) {
  const r = row as PlanB2BRow
  return {
    slug: r.slug,
    name: r.name,
    price_brl: r.price_brl,
    duration_days: r.duration_days,
    max_students: r.max_students,
    features: safeParseJSON<string[]>(r.features, []),
    display_order: r.display_order,
    is_active: r.is_active === 1,
    updated_at: r.updated_at,
  }
}

function parsePlanB2C(row: unknown) {
  const r = row as PlanB2CRow
  return {
    slug: r.slug,
    name: r.name,
    price_brl: r.price_brl,
    duration_days: r.duration_days,
    features: safeParseJSON<string[]>(r.features, []),
    limits: safeParseJSON<Record<string, unknown>>(r.limits, {}),
    display_order: r.display_order,
    is_active: r.is_active === 1,
    updated_at: r.updated_at,
  }
}

function parseConfig(row: unknown) {
  const r = row as ConfigRow
  let parsedValue: unknown = r.config_value
  if (r.value_type === 'number') parsedValue = Number(r.config_value)
  else if (r.value_type === 'boolean') parsedValue = r.config_value === 'true'
  else if (r.value_type === 'json') parsedValue = safeParseJSON(r.config_value, r.config_value)

  return {
    key: r.config_key,
    value: parsedValue,
    category: r.category,
    label: r.label,
    description: r.description,
    value_type: r.value_type,
    is_editable: r.is_editable === 1,
    updated_at: r.updated_at,
    updated_by: r.updated_by,
  }
}

function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

export { configRoutes }
