// ============================================
// DB Self-check (Postgres / Neon)
// - NUNCA imprime DATABASE_URL
// - Verifica conexão e existência da tabela app_logs
// - Faz 1 INSERT/DELETE de teste best-effort
// Uso:
//   DATABASE_URL='postgresql://...' node scripts/db-self-check.mjs
// ============================================

import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'node:crypto'

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não definido (use DATABASE_URL=... antes do comando)')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

const startedAt = Date.now()

try {
  const ping = await sql`SELECT 1 as ok`
  if (!ping?.[0]?.ok) throw new Error('SELECT 1 falhou')

  const reg = await sql`SELECT to_regclass('public.app_logs') as reg`
  const exists = Boolean(reg?.[0]?.reg)

  console.log(`✅ Postgres OK (latência ~${Date.now() - startedAt}ms)`) 
  console.log(`ℹ️ app_logs: ${exists ? 'existe' : 'NÃO existe (aplique a migration 0011_app_logs.sql)'}`)

  if (exists) {
    const id = randomUUID()
    await sql.query(
      `INSERT INTO app_logs (id, user_id, user_type, user_role, level, source, message, context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        id,
        null,
        'anonymous',
        'anonymous',
        'info',
        'local.self-check',
        'self-check insert',
        JSON.stringify({ at: new Date().toISOString() }),
      ]
    )

    await sql.query('DELETE FROM app_logs WHERE id = $1', [id])
    console.log('✅ INSERT/DELETE de teste em app_logs: OK')
  }

  process.exit(0)
} catch (err) {
  console.error('❌ DB self-check falhou')
  console.error(String(err?.message || err))
  process.exit(1)
}
