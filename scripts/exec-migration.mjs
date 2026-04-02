// Script para executar migration via Admin endpoint do Worker
// Uso: node scripts/exec-migration.mjs <path-to-sql>

import { readFileSync } from 'fs'

const file = process.argv[2] || 'migrations/hyperdrive/0002_admin_subscriptions_transfers.sql'
const JWT_SECRET = process.argv[3]

if (!JWT_SECRET) {
  console.error('Usage: node scripts/exec-migration.mjs <sql-file> <jwt-secret>')
  process.exit(1)
}

const API_URL = 'https://api.iapersonal.app.br/admin/migrate'

const content = readFileSync(file, 'utf8')

// Parse SQL: split by semicolons, but handle $$ function bodies
const statements = []
let current = ''
let inDollarQuote = false

for (const line of content.split('\n')) {
  const trimmed = line.trim()
  
  // Skip pure comments
  if (trimmed.startsWith('--') && !inDollarQuote) continue
  
  // Check for $$ delimiters
  const dollarCount = (line.match(/\$\$/g) || []).length
  if (dollarCount % 2 !== 0) {
    inDollarQuote = !inDollarQuote
  }
  
  current += line + '\n'
  
  // If line ends with ; and we're not in a $$ block
  if (trimmed.endsWith(';') && !inDollarQuote) {
    const stmt = current.trim()
    if (stmt.length > 1) {
      statements.push(stmt)
    }
    current = ''
  }
}

// Add remaining
if (current.trim().length > 1) {
  statements.push(current.trim())
}

console.log(`📋 Found ${statements.length} SQL statements in ${file}`)
console.log(`🚀 Sending to ${API_URL}...\n`)

const res = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': JWT_SECRET,
  },
  body: JSON.stringify({ sql: statements }),
})

const data = await res.json()

if (!data.success) {
  console.error('❌ Migration failed:', data)
  process.exit(1)
}

let ok = 0, fail = 0
for (const r of data.results) {
  const preview = statements[r.idx]?.substring(0, 70).replace(/\n/g, ' ')
  if (r.ok) {
    console.log(`  ✅ [${r.idx + 1}] ${preview}...`)
    ok++
  } else {
    console.log(`  ❌ [${r.idx + 1}] ${preview}...`)
    console.log(`     Error: ${r.error}`)
    fail++
  }
}

console.log(`\n📊 Results: ${ok} succeeded, ${fail} failed out of ${statements.length}`)
