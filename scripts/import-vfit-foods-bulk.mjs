#!/usr/bin/env node
/**
 * Importador bulk para vfit_foods (TACO/TBCA/CSV)
 *
 * Uso:
 *   NEON_DATABASE_URL="postgresql://..." node scripts/import-vfit-foods-bulk.mjs --file data/taco.csv
 *   NEON_DATABASE_URL="postgresql://..." node scripts/import-vfit-foods-bulk.mjs --file data/taco.csv --replace
 *   NEON_DATABASE_URL="postgresql://..." node scripts/import-vfit-foods-bulk.mjs --file data/taco.csv --limit 100
 */

import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'
import { neon } from '@neondatabase/serverless'

function parseArgs(argv) {
  const args = { file: '', replace: false, limit: 0 }

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--file') args.file = argv[i + 1] || ''
    if (a === '--replace') args.replace = true
    if (a === '--limit') args.limit = Number(argv[i + 1] || 0)
  }

  return args
}

function normalizeHeader(h) {
  return String(h || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function truncate(value, max) {
  return String(value || '').trim().slice(0, max)
}

function toNumber(v, fallback = 0) {
  if (v == null || v === '') return fallback
  const raw = String(v).trim().replace(',', '.')
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') return row[key]
  }
  return null
}

function classifyCategory(name) {
  const n = String(name || '').toLowerCase()

  if (/arroz|aveia|trigo|pao|macarrao|massa|cereal|farinha/.test(n)) return 'cereais'
  if (/banana|maca|laranja|melao|melancia|morango|uva|abacaxi|fruta/.test(n)) return 'frutas'
  if (/alface|tomate|cenoura|brocolis|couve|espinafre|abobrinha|berinjela|vegetal|verdura|legume/.test(n)) return 'vegetais'
  if (/frango|carne|peixe|salmao|ovo|leite|iogurte|queijo|protein|proteina/.test(n)) return 'proteinas'
  if (/feijao|lentilha|grao-de-bico|ervilha/.test(n)) return 'legumes'
  if (/azeite|oleo|manteiga|margarina/.test(n)) return 'oleos'
  if (/suco|cafe|cha|refrigerante|bebida/.test(n)) return 'bebidas'
  if (/chocolate|doce|biscoito|sorvete|mel/.test(n)) return 'doces'
  if (/amendoim|castanha|noz|semente/.test(n)) return 'nozes'

  return 'outros'
}

function mapRow(rawRow) {
  const row = {}
  for (const [k, v] of Object.entries(rawRow)) {
    row[normalizeHeader(k)] = v
  }

  const name = truncate(pick(row, [
    'nome',
    'alimento',
    'descricao',
    'description',
    'food',
    'name',
  ]) || '', 255)

  if (!name) return null

  const calories = toNumber(pick(row, ['energia_kcal', 'energia', 'kcal', 'calorias', 'calorie', 'calories']))
  const protein = toNumber(pick(row, ['proteina_g', 'proteinas', 'proteina', 'protein_g', 'protein']))
  const carbs = toNumber(pick(row, ['carboidrato_g', 'carboidratos', 'carboidrato', 'carbs_g', 'carbs']))
  const fat = toNumber(pick(row, ['lipideos_g', 'gorduras', 'gordura', 'fat_g', 'fat']))
  const fiber = toNumber(pick(row, ['fibra_g', 'fibras', 'fibra', 'fiber_g', 'fiber']))
  const sodium = toNumber(pick(row, ['sodio_mg', 'sodio', 'sodium_mg', 'sodium']))
  const portion = toNumber(pick(row, ['porcao_g', 'porcao', 'portion_g', 'portion']), 100)

  const category = truncate(
    String(pick(row, ['categoria', 'category', 'food_category_id']) || classifyCategory(name)).toLowerCase(),
    100,
  )

  return {
    name,
    category,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sodium,
    portion: portion > 0 ? portion : 100,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.file) {
    console.error('Uso: --file <csv> [--replace] [--limit N]')
    process.exit(1)
  }

  const dbUrl = process.env.NEON_DATABASE_URL
  if (!dbUrl) {
    console.error('NEON_DATABASE_URL não configurada')
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), args.file)
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  const csv = fs.readFileSync(filePath, 'utf8')
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })

  if (parsed.errors.length) {
    console.error('Erros ao parsear CSV:', parsed.errors.slice(0, 5))
  }

  const mapped = parsed.data
    .map(mapRow)
    .filter(Boolean)

  const dedupMap = new Map()
  for (const f of mapped) {
    dedupMap.set(f.name.toLowerCase(), f)
  }

  let foods = [...dedupMap.values()]
  if (args.limit > 0) foods = foods.slice(0, args.limit)

  const sql = neon(dbUrl)

  console.log(`📥 Linhas válidas: ${mapped.length}`)
  console.log(`🧹 Após deduplicação: ${foods.length}`)

  if (args.replace) {
    console.log('🗑️ Limpando biblioteca atual (is_library = true)...')
    await sql.query('DELETE FROM vfit_foods WHERE is_library = true')
  }

  const existing = await sql.query('SELECT lower(name) AS name FROM vfit_foods WHERE is_library = true')
  const existingSet = new Set(existing.map((r) => String(r.name || '').toLowerCase()))

  let inserted = 0
  let skipped = 0
  const pending = []
  const BATCH_SIZE = 250

  async function flushBatch() {
    if (pending.length === 0) return

    const values = []
    const placeholders = pending.map((f, index) => {
      const offset = index * 9
      values.push(f.name, f.category, f.calories, f.protein, f.carbs, f.fat, f.fiber, f.sodium, f.portion)
      return `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9},true,NOW(),NOW())`
    })

    await sql.query(
      `INSERT INTO vfit_foods (
        name, category, calories, protein_g, carbs_g, fat_g,
        fiber_g, sodium_mg, standard_portion_g, is_library, created_at, updated_at
      ) VALUES ${placeholders.join(',')}`,
      values,
    )

    inserted += pending.length
    pending.length = 0

    if (inserted > 0) {
      process.stdout.write(`\r✅ Inseridos: ${inserted} | ⏭️ Pulados: ${skipped}`)
    }
  }

  for (const f of foods) {
    const key = f.name.toLowerCase()
    if (existingSet.has(key)) {
      skipped += 1
      continue
    }

    pending.push(f)
    existingSet.add(key)

    if (pending.length >= BATCH_SIZE) {
      await flushBatch()
    }
  }

  await flushBatch()

  const total = await sql.query('SELECT COUNT(*)::int AS total FROM vfit_foods WHERE is_library = true')
  const totalLibrary = total?.[0]?.total ?? 0

  console.log('\n')
  console.log(`✅ Inseridos: ${inserted}`)
  console.log(`⏭️ Pulados (já existentes): ${skipped}`)
  console.log(`📚 Total biblioteca: ${totalLibrary}`)

  if (totalLibrary < 7000) {
    console.warn('⚠️ Biblioteca ainda abaixo de 7000 itens. Importe um CSV maior (TBCA/TACO completo).')
  } else {
    console.log('🎯 Meta atingida: 7000+ alimentos na biblioteca.')
  }
}

main().catch((err) => {
  console.error('❌ Falha no import:', err?.message || err)
  process.exit(1)
})
