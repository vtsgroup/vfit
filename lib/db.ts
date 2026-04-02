// ============================================
// db.ts — Helpers de acesso ao banco de dados (D1 + PostgreSQL)
// ============================================
//
// O que faz:
//   Centraliza todo acesso ao banco: D1 (catálogo de exercícios — cold data)
//   e PostgreSQL via Neon HTTP driver (dados principais — hot data).
//   pgQuery/pgQueryOne são usados em absolutamente todos os route handlers.
//   NUNCA usar ORM — apenas SQL raw com parâmetros posicionais ($1, $2, ...).
//
// Exports principais:
//   pgQuery(env, sql, params) → { rows, rowCount } — query PostgreSQL
//   pgQueryOne(env, sql, params) → T | null — single row PostgreSQL
//   d1FindById, d1FindMany, d1Insert, d1Update, d1Increment — helpers D1
//   generateId() → UUID v4 — ID padrão para todas as tabelas
//   prefixedId(prefix) → string — ID com prefixo legível
//   parsePagination(url) → { page, per_page, offset }
//
// DB: Neon PostgreSQL (HTTP via neon()) + Cloudflare D1 (exercícios)
// ============================================

import { neon } from '@neondatabase/serverless'
import type { Bindings } from '@workers/types'

// ============================================
// D1 HELPERS (Cold Data - SQLite)
// ============================================

/**
 * Busca um registro por ID no D1
 */
export async function d1FindById<T>(
  db: D1Database,
  table: string,
  id: string
): Promise<T | null> {
  const result = await db
    .prepare(`SELECT * FROM ${table} WHERE id = ?`)
    .bind(id)
    .first<T>()
  return result
}

/**
 * Busca múltiplos registros com filtro e paginação
 */
export async function d1FindMany<T>(
  db: D1Database,
  table: string,
  options: {
    where?: string
    params?: unknown[]
    orderBy?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ results: T[]; count: number }> {
  const { where, params = [], orderBy, limit = 50, offset = 0 } = options

  const whereClause = where ? `WHERE ${where}` : ''
  const orderClause = orderBy ? `ORDER BY ${orderBy}` : ''

  // Count total
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM ${table} ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>()

  // Fetch paginated data
  const results = await db
    .prepare(
      `SELECT * FROM ${table} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all<T>()

  return {
    results: results.results ?? [],
    count: countResult?.count ?? 0,
  }
}

/**
 * Insere um registro no D1
 */
export async function d1Insert(
  db: D1Database,
  table: string,
  data: Record<string, unknown>
): Promise<D1Result> {
  const keys = Object.keys(data)
  const placeholders = keys.map(() => '?').join(', ')
  const values = Object.values(data)

  return db
    .prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`)
    .bind(...values)
    .run()
}

/**
 * Atualiza um registro no D1
 */
export async function d1Update(
  db: D1Database,
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<D1Result> {
  const keys = Object.keys(data)
  const setClauses = keys.map((k) => `${k} = ?`).join(', ')
  const values = Object.values(data)

  return db
    .prepare(`UPDATE ${table} SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...values, id)
    .run()
}

/**
 * Incrementa um campo numérico no D1
 */
export async function d1Increment(
  db: D1Database,
  table: string,
  id: string,
  field: string,
  amount = 1
): Promise<D1Result> {
  return db
    .prepare(`UPDATE ${table} SET ${field} = ${field} + ? WHERE id = ?`)
    .bind(amount, id)
    .run()
}

// ============================================
// POSTGRES HELPERS (Hot Data)
// ============================================

/**
 * Obtém connection string para o driver HTTP.
 *
 * ⚠️  IMPORTANTE: A função neon() usa HTTP — ela NÃO é compatível com Hyperdrive.
 *     Hyperdrive fornece connection strings TCP (porta 5432) que só funcionam
 *     com Pool/Client (WebSocket). Passar a connection string do Hyperdrive
 *     para neon() causa "HTTP 530 error code 1016" (DNS origin error).
 *
 *     Para usar Hyperdrive no futuro, migrar pgQuery para Pool/Client:
 *       import { Pool } from '@neondatabase/serverless'
 *       const pool = new Pool({ connectionString: env.HYPERDRIVE.connectionString })
 */
export function getDatabaseUrl(env: Bindings): string {
  // Prioriza nome neutro; mantém fallback legado durante transição
  if (env.DATABASE_URL) {
    return env.DATABASE_URL
  }
  if (env.NEON_DATABASE_URL) {
    return env.NEON_DATABASE_URL
  }
  throw new Error('Database not configured')
}

/**
 * Executa query PostgreSQL via Hyperdrive usando @neondatabase/serverless
 * Hyperdrive expõe connectionString com TCP pooling otimizado
 */
export async function pgQuery<T = Record<string, unknown>>(
  env: Bindings,
  query: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const connectionString = getDatabaseUrl(env)
  const sql = neon(connectionString)

  // Neon serverless driver: usa sql.query() para chamadas com string + params
  // (tagged template sql`` só funciona sem params dinâmicos)
  // sql.query() pode retornar T[] ou FullQueryResults { rows: T[] }
  // dependendo da versão/contexto — guard defensivo para ambos os formatos
  const result = await sql.query(query, params)
  const rows = (Array.isArray(result) ? result : (result as { rows?: T[] }).rows ?? []) as T[]

  return {
    rows,
    rowCount: rows.length,
  }
}

/**
 * Executa query PostgreSQL retornando single row
 */
export async function pgQueryOne<T = Record<string, unknown>>(
  env: Bindings,
  query: string,
  params: unknown[] = []
): Promise<T | null> {
  const { rows } = await pgQuery<T>(env, query, params)
  return rows[0] ?? null
}

// ============================================
// SHARED UTILITIES
// ============================================

/**
 * Parse pagination params da query string
 */
export function parsePagination(url: URL): { page: number; per_page: number; offset: number } {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const per_page = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page')) || 20))
  const offset = (page - 1) * per_page

  return { page, per_page, offset }
}

/**
 * Gera UUID v4 (crypto API disponível em Workers)
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Gera ID com prefixo para fácil identificação
 */
export function prefixedId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`
}
