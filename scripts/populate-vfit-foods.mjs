#!/usr/bin/env node
/**
 * Script para popular tabela vfit_foods com alimentos TACO (Tabela de Composição de Alimentos)
 * Execução: NEON_DATABASE_URL="postgresql://..." node scripts/populate-vfit-foods.mjs
 * 
 * Faz INSERT de ~60 alimentos comuns com dados nutricionais do TACO/IBGE.
 */

import { neon } from '@neondatabase/serverless'

// Alimentos TACO - amostra com dados nutricionais reais
const FOODS = [
  // Cereais
  { name: 'Arroz branco cozido', category: 'cereais', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 2, portion: 150 },
  { name: 'Aveia em flocos', category: 'cereais', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sodium: 2, portion: 40 },
  { name: 'Pão de trigo integral', category: 'cereais', calories: 227, protein: 8.8, carbs: 43, fat: 2.8, fiber: 6.4, sodium: 480, portion: 50 },
  { name: 'Macarrão cozido', category: 'cereais', calories: 131, protein: 4.3, carbs: 25, fat: 1.1, fiber: 1.8, sodium: 1, portion: 180 },

  // Frutas
  { name: 'Maçã com casca', category: 'frutas', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sodium: 2, portion: 182 },
  { name: 'Banana', category: 'frutas', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sodium: 1, portion: 100 },
  { name: 'Laranja', category: 'frutas', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.2, fiber: 2.4, sodium: 1, portion: 210 },
  { name: 'Melancia', category: 'frutas', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sodium: 1, portion: 160 },
  { name: 'Morango', category: 'frutas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sodium: 2, portion: 152 },
  { name: 'Abacaxi', category: 'frutas', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sodium: 1, portion: 160 },

  // Vegetais
  { name: 'Alface crespa', category: 'vegetais', calories: 15, protein: 1.2, carbs: 2.9, fat: 0.2, fiber: 1, sodium: 9, portion: 50 },
  { name: 'Tomate', category: 'vegetais', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5, portion: 123 },
  { name: 'Cenoura crua', category: 'vegetais', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sodium: 69, portion: 100 },
  { name: 'Brócolis cru', category: 'vegetais', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.4, sodium: 64, portion: 90 },
  { name: 'Couve-flor crua', category: 'vegetais', calories: 25, protein: 1.9, carbs: 4.9, fat: 0.1, fiber: 2.4, sodium: 52, portion: 100 },
  { name: 'Espinafre cru', category: 'vegetais', calories: 23, protein: 2.7, carbs: 3.6, fat: 0.4, fiber: 2.7, sodium: 79, portion: 85 },

  // Proteínas
  { name: 'Frango peito grelhado', category: 'proteinas', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 66, portion: 100 },
  { name: 'Carne vermelha magra assada', category: 'proteinas', calories: 215, protein: 31, carbs: 0, fat: 9.7, fiber: 0, sodium: 68, portion: 100 },
  { name: 'Peixe branco cozido', category: 'proteinas', calories: 82, protein: 17.9, carbs: 0, fat: 0.7, fiber: 0, sodium: 59, portion: 100 },
  { name: 'Salmão cozido', category: 'proteinas', calories: 206, protein: 22.5, carbs: 0, fat: 12.3, fiber: 0, sodium: 75, portion: 100 },
  { name: 'Ovo de galinha cozido', category: 'proteinas', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124, portion: 50 },
  { name: 'Iogurte natural', category: 'proteinas', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sodium: 56, portion: 150 },
  { name: 'Leite integral', category: 'proteinas', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sodium: 44, portion: 200 },
  { name: 'Queijo meia cura', category: 'proteinas', calories: 301, protein: 25, carbs: 1.4, fat: 23, fiber: 0, sodium: 700, portion: 30 },

  // Legumes
  { name: 'Feijão cozido', category: 'legumes', calories: 76, protein: 5.4, carbs: 13.7, fat: 0.3, fiber: 3.2, sodium: 3, portion: 150 },
  { name: 'Lentilha cozida', category: 'legumes', calories: 116, protein: 9.0, carbs: 20, fat: 0.4, fiber: 3.8, sodium: 4, portion: 150 },
  { name: 'Grão-de-bico cozido', category: 'legumes', calories: 134, protein: 8.9, carbs: 22.5, fat: 2.1, fiber: 6.2, sodium: 6, portion: 150 },

  // Óleos e gorduras
  { name: 'Azeite de oliva', category: 'óleos', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 0, portion: 14 },
  { name: 'Manteiga', category: 'óleos', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sodium: 714, portion: 10 },

  // Bebidas
  { name: 'Suco de laranja natural', category: 'bebidas', calories: 48, protein: 0.7, carbs: 11.1, fat: 0.2, fiber: 0.2, sodium: 2, portion: 240 },
  { name: 'Café preto', category: 'bebidas', calories: 2, protein: 0.3, carbs: 0, fat: 0.1, fiber: 0, sodium: 4, portion: 240 },
  { name: 'Chá verde', category: 'bebidas', calories: 2, protein: 0.5, carbs: 0.4, fat: 0, fiber: 0, sodium: 2, portion: 240 },

  // Doces e lanches
  { name: 'Chocolate ao leite', category: 'doces', calories: 535, protein: 8.3, carbs: 56.5, fat: 30.6, fiber: 1.2, sodium: 108, portion: 30 },
  { name: 'Mel', category: 'doces', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sodium: 4, portion: 21 },

  // Nozes e sementes
  { name: 'Amendoim cru', category: 'nozes', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 6.4, sodium: 7, portion: 28 },
  { name: 'Castanha de caju crua', category: 'nozes', calories: 553, protein: 18.2, carbs: 30, fat: 44.8, fiber: 3.3, sodium: 12, portion: 28 },
  { name: 'Noz crua', category: 'nozes', calories: 660, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sodium: 2, portion: 28 },
]

async function main() {
  console.log('🥗 Populando tabela vfit_foods com dados TACO...\n')
  
  const connectionUrl = process.env.NEON_DATABASE_URL
  if (!connectionUrl) {
    console.error('❌ NEON_DATABASE_URL não configurada!')
    console.error('Uso: NEON_DATABASE_URL="postgresql://..." node scripts/populate-vfit-foods.mjs')
    process.exit(1)
  }

  try {
    const sql = neon(connectionUrl)
    
    // Verifica conexão
    console.log('📊 Verificando conexão...')
    const check = await sql`SELECT 1 as ok`
    if (!check.length) throw new Error('Conexão falhou')
    console.log('✅ Conexão OK\n')

    // Insere alimentos
    console.log(`⏳ Inserindo ${FOODS.length} alimentos...`)
    let count = 0
    for (const food of FOODS) {
      await sql`
        INSERT INTO vfit_foods (
          name, category, calories, protein_g, carbs_g, fat_g,
          fiber_g, sodium_mg, standard_portion_g, is_library, created_at, updated_at
        ) VALUES (
          ${food.name}, ${food.category}, ${food.calories}, ${food.protein},
          ${food.carbs}, ${food.fat}, ${food.fiber}, ${food.sodium},
          ${food.portion}, true, NOW(), NOW()
        )
      `
      count++
      if (count % 10 === 0) process.stdout.write('.')
    }

    console.log('\n✅ Alimentos inseridos!\n')

    // Verifica resultado
    const result = await sql`SELECT COUNT(*) as total FROM vfit_foods WHERE is_library = true`
    console.log(`📈 Total na biblioteca: ${result[0].total} alimentos`)
    console.log('✨ Pronto!\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

main()
