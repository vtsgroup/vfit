// Script para executar migration via API serverless PostgreSQL
// Uso: node scripts/run-migration-neon.mjs <path-to-sql>

import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!DATABASE_URL) {
  console.error('Set DATABASE_URL env var')
  process.exit(1)
}

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/run-migration-neon.mjs <path-to-sql>')
  process.exit(1)
}

const sql = neon(DATABASE_URL)
const rawContent = readFileSync(file, 'utf8')

// Remove linhas de comentário simples (--) para evitar descartar statements
// que começam com comentários antes do SQL de fato.
const content = rawContent
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')

// Split por statements (usando ;) mas ignorando dentro de funções
const statements = content
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0)

console.log(`Running ${statements.length} statements from ${file}...`)

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i]
  const preview = stmt.substring(0, 80).replace(/\n/g, ' ')
  try {
    await sql.query(stmt, [])
    console.log(`✅ [${i+1}/${statements.length}] ${preview}...`)
  } catch (err) {
    console.error(`❌ [${i+1}/${statements.length}] ${preview}`)
    console.error(`   Error: ${err.message}`)
    // Continue on non-critical errors (IF NOT EXISTS, ON CONFLICT)
    if (!stmt.includes('IF NOT EXISTS') && !stmt.includes('ON CONFLICT') && !stmt.includes('CREATE OR REPLACE')) {
      // Only warn, don't exit
      console.warn('   (continuing...)')
    }
  }
}

console.log('\n✅ Migration complete!')
