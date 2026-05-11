#!/usr/bin/env node
/**
 * regenerate-maskable-icons.mjs
 * Regenerate maskable icons from icon-maskable-source.svg (without rounded corners)
 */

import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const MASKABLE_SOURCE = resolve(ROOT, 'public', 'favicons', 'icon-maskable-source.svg')
const ICONS_DIR = resolve(ROOT, 'public', 'icons')
const TWA_DENSITIES = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192,
}

const MASKABLE_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512]

console.log('🎯 REGENERANDO ÍCONES MASKABLE (sem rounded borders)\n')

// Step 1: Convert SVG to base PNG
console.log('📋 STEP 1: Convertendo icon-maskable-source.svg → PNG...\n')

try {
  const pngBuffer = await sharp(MASKABLE_SOURCE, { density: 300 })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer()

  console.log('✅ Convertido: icon-maskable-source.svg → PNG 1024×1024\n')

  // Step 2: Generate maskable icons
  console.log('📍 STEP 2: Gerando maskable icons (9 tamanhos)\n')

  for (const size of MASKABLE_SIZES) {
    try {
      const outputPath = resolve(ICONS_DIR, `icon-${size}-maskable.png`)
      await sharp(pngBuffer)
        .resize(size, size, { fit: 'fill' })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(outputPath)

      console.log(`✅ ${size}×${size} → icons/icon-${size}-maskable.png`)
    } catch (err) {
      console.error(`❌ Erro ao gerar ${size}×${size}:`, err.message)
    }
  }

  // Step 3: Generate TWA maskable icons
  console.log('\n🚀 STEP 3: Gerando TWA maskable icons (5 densidades)\n')

  for (const [density, size] of Object.entries(TWA_DENSITIES)) {
    try {
      const twaPath = resolve(ROOT, 'twa', 'app', 'src', 'main', 'res', `mipmap-${density}`)
      const outputPath = resolve(twaPath, 'ic_launcher_round.png')

      await sharp(pngBuffer)
        .resize(size, size, { fit: 'fill' })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(outputPath)

      console.log(`✅ ${density} (${size}×${size}) → TWA: ic_launcher_round.png`)
    } catch (err) {
      console.error(`❌ Erro ao gerar TWA ${density}:`, err.message)
    }
  }

  console.log('\n✨ REGENERAÇÃO CONCLUÍDA!\n')
  console.log('📊 Resumo:')
  console.log('   • Fonte: icon-maskable-source.svg (sem rounded borders)')
  console.log('   • Maskable: 9 tamanhos (48–512px)')
  console.log('   • TWA round: 5 densidades')
  console.log('   • Android agora aplica seu próprio rounding!\n')
  console.log('✅ Sistema pronto!\n')
} catch (err) {
  console.error('❌ Erro geral:', err.message)
  process.exit(1)
}
