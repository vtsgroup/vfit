// Script para rodar migration no Neon via sql.query()
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const DATABASE_URL = process.argv[2]
if (!DATABASE_URL) {
  console.error('Usage: node run-migration.mjs <DATABASE_URL>')
  process.exit(1)
}

const sql = neon(DATABASE_URL)
const migrationPath = resolve('migrations/hyperdrive/0001_initial_schema.sql')
const fullSQL = readFileSync(migrationPath, 'utf-8')

console.log('🔗 Database configured')
console.log(`📦 Running migration...`)

// Remove comments and split smartly respecting $$ blocks
const cleanSQL = fullSQL.replace(/^--.*$/gm, '').trim()
const blocks = []
let current = ''
let inDollarBlock = false

for (const line of cleanSQL.split('\n')) {
  const trimmed = line.trim()
  const dollarMatches = (trimmed.match(/\$\$/g) || []).length

  if (dollarMatches > 0) {
    current += line + '\n'
    if (dollarMatches % 2 === 1) {
      inDollarBlock = !inDollarBlock
    }
    if (!inDollarBlock && trimmed.endsWith(';')) {
      blocks.push(current.trim())
      current = ''
    }
    continue
  }

  if (inDollarBlock) {
    current += line + '\n'
    continue
  }

  if (trimmed.endsWith(';')) {
    current += line + '\n'
    const stmt = current.trim()
    if (stmt && stmt !== ';') blocks.push(stmt)
    current = ''
  } else {
    current += line + '\n'
  }
}
if (current.trim()) blocks.push(current.trim())

console.log(`📝 ${blocks.length} statements to execute\n`)
let ok = 0, fail = 0

for (let i = 0; i < blocks.length; i++) {
  const stmt = blocks[i]
  const preview = stmt.substring(0, 75).replace(/\n/g, ' ').trim()
  try {
    await sql.query(stmt)
    ok++
    console.log(`  ✅ [${i+1}/${blocks.length}] ${preview}`)
  } catch (e) {
    if (e.message?.includes('already exists')) {
      ok++
      console.log(`  ⏭️  [${i+1}/${blocks.length}] Already exists: ${preview}`)
    } else {
      fail++
      console.error(`  ❌ [${i+1}/${blocks.length}] ${preview}`)
      console.error(`     Error: ${e.message}`)
    }
  }
}

console.log(`\n✨ Done: ${ok} OK, ${fail} errors`)

// Verify tables
const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`
console.log(`\n📋 Tables (${tables.length}):`)
tables.forEach(t => console.log(`   ✅ ${t.table_name}`))
