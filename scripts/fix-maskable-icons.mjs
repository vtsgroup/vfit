#!/usr/bin/env node
/**
 * fix-maskable-icons.mjs
 * 
 * 1. Remove favicon-16/32.png estranhos (com logo roxo antigo)
 * 2. Regenera maskable icons usando icon.png FLAT (não round)
 *    Android faz o mask automaticamente das bordas
 * 3. Mantém favicons corretos (favicon.svg, favicon.ico, favicon-48/96, apple-touch-icon)
 */

import sharp from 'sharp'
import { unlinkSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SOURCE_PNG = resolve(ROOT, 'icon.png')
const FAVICONS_DIR = resolve(ROOT, 'public', 'favicons')
const ICONS_DIR = resolve(ROOT, 'public', 'icons')
const TWA_BASE = resolve(ROOT, 'twa', 'app', 'src', 'main', 'res')

console.log('🧹 FIX MASKABLE ICONS — Usar FLAT icon.png\n')

// STEP 1: Remove favicons estranhos
console.log('📋 STEP 1: Removendo favicons antigos/estranhos\n')

const toRemove = [
  resolve(FAVICONS_DIR, 'favicon-16.png'),
  resolve(FAVICONS_DIR, 'favicon-32.png'),
]

for (const path of toRemove) {
  if (existsSync(path)) {
    try {
      unlinkSync(path)
      console.log(`✅ Removido: ${path.split('/').pop()}`)
    } catch (err) {
      console.error(`❌ Erro:`, err.message)
    }
  }
}

// STEP 2: Regenera maskable icons usando icon.png FLAT
console.log('\n🎨 STEP 2: Regenerando maskable icons (FLAT, sem round)\n')

// Tamanhos para maskable (Android safe zone)
const maskableSizes = [
  { size: 48, output: 'icon-48-maskable.png' },
  { size: 72, output: 'icon-72-maskable.png' },
  { size: 96, output: 'icon-96-maskable.png' },
  { size: 128, output: 'icon-128-maskable.png' },
  { size: 144, output: 'icon-144-maskable.png' },
  { size: 152, output: 'icon-152-maskable.png' },
  { size: 192, output: 'icon-192-maskable.png' },
  { size: 384, output: 'icon-384-maskable.png' },
  { size: 512, output: 'icon-512-maskable.png' },
]

for (const { size, output } of maskableSizes) {
  try {
    const outputPath = resolve(ICONS_DIR, output)
    await sharp(SOURCE_PNG)
      .resize(size, size, {
        fit: 'fill', // 100% escala sem padding
        position: 'center',
      })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outputPath)

    console.log(`✅ ${size}×${size} → ${output}`)
  } catch (err) {
    console.error(`❌ Erro ao gerar ${output}:`, err.message)
  }
}

// STEP 3: Atualiza TWA roundable icons também (para consistência)
console.log('\n🚀 STEP 3: Atualizando TWA icons (Android)\n')

const twaMipmap = [
  { density: 'mdpi', size: 48 },
  { density: 'hdpi', size: 72 },
  { density: 'xhdpi', size: 96 },
  { density: 'xxhdpi', size: 144 },
  { density: 'xxxhdpi', size: 192 },
]

for (const { density, size } of twaMipmap) {
  const mipmapDir = resolve(TWA_BASE, `mipmap-${density}`)
  
  // ic_launcher_round.png (usa icon.png flat)
  try {
    const outputPath = resolve(mipmapDir, 'ic_launcher_round.png')
    await sharp(SOURCE_PNG)
      .resize(size, size, { fit: 'fill', position: 'center' })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outputPath)

    console.log(`✅ TWA mipmap-${density}/ic_launcher_round.png (${size}×${size})`)
  } catch (err) {
    console.error(`❌ Erro ao gerar TWA ${density}:`, err.message)
  }
}

console.log('\n✨ FIX MASKABLE ICONS CONCLUÍDO!\n')
console.log('📊 Resultado:')
console.log('   ✅ Removidos: favicon-16.png, favicon-32.png (lixo)')
console.log('   ✅ Regenerados: 9 maskable icons (FLAT, sem round)')
console.log('   ✅ Atualizados: 5 TWA round icons (icon.png flat)')
console.log('   ✅ Android faz o masking automático das bordas\n')
