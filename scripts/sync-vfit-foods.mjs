#!/usr/bin/env node
/**
 * Idempotent seed/sync for the VFIT food catalog in Neon.
 *
 * Usage:
 *   node scripts/sync-vfit-foods.mjs --dry-run
 *   NEON_DATABASE_URL="postgresql://..." node scripts/sync-vfit-foods.mjs
 *   NEON_DATABASE_URL="postgresql://..." node scripts/sync-vfit-foods.mjs --replace
 */

import { neon } from '@neondatabase/serverless'
import { getVfitFoodLibrary } from './vfit-food-library.mjs'

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    replace: argv.includes('--replace'),
    limit: Number(argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 0),
  }
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function validateFood(food) {
  const requiredNumbers = ['calories', 'protein', 'carbs', 'fat', 'portion']
  if (!food.name || food.name.length > 255) return `Nome invalido: ${food.name || '(empty)'}`
  if (!food.category || food.category.length > 100) return `Categoria invalida: ${food.name}`

  for (const field of requiredNumbers) {
    if (!Number.isFinite(food[field]) || food[field] < 0) return `${food.name}: ${field} invalido`
  }

  if (food.portion < 1) return `${food.name}: porcao menor que 1g`
  return null
}

function normalizeDatabaseUrl(value) {
  if (!value) return value
  return value.startsWith('postgresql:') ? `postgres:${value.slice('postgresql:'.length)}` : value
}

function buildSeedFoods(limit = 0) {
  const dedup = new Map()
  for (const food of getVfitFoodLibrary()) {
    dedup.set(normalizeName(food.name), food)
  }

  const foods = [...dedup.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return limit > 0 ? foods.slice(0, limit) : foods
}

async function ensureFoodColumns(sql) {
  await sql.query(`ALTER TABLE vfit_foods ADD COLUMN IF NOT EXISTS barcode VARCHAR(32)`)
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_vfit_foods_barcode ON vfit_foods(barcode) WHERE barcode IS NOT NULL`)
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_vfit_foods_library_name_lower ON vfit_foods (lower(name)) WHERE is_library = true`)
}

async function syncFoods({ dryRun, replace, limit }) {
  const foods = buildSeedFoods(limit)
  const errors = foods.map(validateFood).filter(Boolean)
  const categoryCounts = foods.reduce((acc, food) => {
    acc[food.category] = (acc[food.category] || 0) + 1
    return acc
  }, {})

  if (errors.length) {
    console.error('Falha de validacao da biblioteca:')
    for (const err of errors.slice(0, 20)) console.error(`- ${err}`)
    process.exit(1)
  }

  console.log(`Biblioteca validada: ${foods.length} alimentos`)
  console.log(`Categorias: ${Object.entries(categoryCounts).map(([k, v]) => `${k}=${v}`).join(', ')}`)

  if (foods.length < 150) {
    console.error(`Biblioteca abaixo do minimo P2.21: ${foods.length}/150`)
    process.exit(1)
  }

  if (dryRun) {
    console.log('Dry-run concluido: nenhuma conexao Neon foi aberta.')
    return { inserted: 0, updated: 0, totalLibrary: foods.length }
  }

  const dbUrl = process.env.NEON_DATABASE_URL
  if (!dbUrl) {
    console.error('NEON_DATABASE_URL nao configurada. Use --dry-run para validar sem banco.')
    process.exit(1)
  }

  const sql = neon(normalizeDatabaseUrl(dbUrl))
  await ensureFoodColumns(sql)

  if (replace) {
    console.log('Replace ativo: removendo alimentos de biblioteca antes do sync...')
    await sql.query('DELETE FROM vfit_foods WHERE is_library = true')
  }

  let inserted = 0
  let updated = 0

  for (const food of foods) {
    const result = await sql.query(
      `INSERT INTO vfit_foods (
        name, category, calories, protein_g, carbs_g, fat_g,
        fiber_g, sodium_mg, standard_portion_g, is_library, is_custom,
        tags, created_at, updated_at
      )
      SELECT
        $1::varchar(255), $2::varchar(100), $3::numeric, $4::numeric, $5::numeric, $6::numeric,
        $7::numeric, $8::numeric, $9::integer, true, false,
        $10::text[], NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM vfit_foods WHERE is_library = true AND lower(name) = lower($1::text)
      )
      RETURNING id`,
      [
        food.name,
        food.category,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        food.fiber,
        food.sodium,
        food.portion,
        [food.category, 'seed:v1'],
      ],
    )

    if (result.length > 0) {
      inserted += 1
      continue
    }

    const updateResult = await sql.query(
      `UPDATE vfit_foods
       SET category = $2::varchar(100),
           calories = $3::numeric,
           protein_g = $4::numeric,
           carbs_g = $5::numeric,
           fat_g = $6::numeric,
           fiber_g = $7::numeric,
           sodium_mg = $8::numeric,
           standard_portion_g = $9::integer,
           tags = CASE
             WHEN COALESCE(tags, '{}'::text[]) @> ARRAY['seed:v1']::text[] THEN COALESCE(tags, '{}'::text[])
             ELSE array_append(COALESCE(tags, '{}'::text[]), 'seed:v1')
           END,
           updated_at = NOW()
       WHERE is_library = true AND lower(name) = lower($1::text)
       RETURNING id`,
      [
        food.name,
        food.category,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        food.fiber,
        food.sodium,
        food.portion,
      ],
    )

    if (updateResult.length > 0) updated += 1
  }

  const total = await sql.query('SELECT COUNT(*)::int AS total FROM vfit_foods WHERE is_library = true')
  const totalLibrary = total?.[0]?.total ?? 0

  console.log(`Inseridos: ${inserted}`)
  console.log(`Atualizados: ${updated}`)
  console.log(`Total biblioteca Neon: ${totalLibrary}`)

  if (totalLibrary < 150) {
    console.error(`Total Neon abaixo do gate P2.21: ${totalLibrary}/150`)
    process.exit(1)
  }

  return { inserted, updated, totalLibrary }
}

const args = parseArgs(process.argv.slice(2))
syncFoods(args).catch((error) => {
  console.error('Falha no sync de alimentos:', error?.message || error)
  process.exit(1)
})
