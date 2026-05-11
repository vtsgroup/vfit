#!/usr/bin/env node
/**
 * generate-icons-from-round.mjs
 * 
 * Gera TODOS os ícones (favicons, PWA, TWA) a partir do icon-round.png
 * 100% do ícone escalado, sem padding ou cortes, apenas fit: 'fill'
 * 
 * Dependência: sharp (npm install --save-dev sharp)
 * 
 * Uso: node scripts/generate-icons-from-round.mjs
 */

import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const ICONS_DIR = resolve(PUBLIC, 'icons')
const FAVICONS_DIR = resolve(PUBLIC, 'favicons')
const TWA_DIR = resolve(ROOT, 'twa', 'app', 'src', 'main', 'res')

// Ensure directories exist
mkdirSync(ICONS_DIR, { recursive: true })
mkdirSync(FAVICONS_DIR, { recursive: true })

// Source icon
const SOURCE_ICON = resolve(PUBLIC, 'icon-round.png')

if (!existsSync(SOURCE_ICON)) {
  console.error(`❌ Arquivo não encontrado: ${SOURCE_ICON}`)
  process.exit(1)
}

console.log('🎨 Gerando todos os ícones a partir de icon-round.png...\n')
console.log(`📁 Source: ${SOURCE_ICON}`)
console.log(`📦 Output: ${ICONS_DIR}, ${FAVICONS_DIR}\n`)

/**
 * Generate icon with fit: 'fill' (100% scale, no padding)
 */
async function generateIcon(size, outputPath, label) {
  try {
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'fill', // 100% do ícone escalado, sem padding
        position: 'center',
      })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outputPath)
    
    console.log(`✅ ${String(size).padStart(4)}×${size} → ${label}`)
  } catch (err) {
    console.error(`❌ Erro gerando ${label}:`, err.message)
  }
}

/**
 * Main icon generation
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📍 FAVICONS (public/favicons/)\n')
  
  // Favicons
  await generateIcon(16, resolve(FAVICONS_DIR, 'favicon-16.png'), 'favicons/favicon-16.png')
  await generateIcon(32, resolve(FAVICONS_DIR, 'favicon-32.png'), 'favicons/favicon-32.png')
  await generateIcon(48, resolve(FAVICONS_DIR, 'favicon-48.png'), 'favicons/favicon-48.png')
  await generateIcon(96, resolve(FAVICONS_DIR, 'favicon-96.png'), 'favicons/favicon-96.png')
  await generateIcon(180, resolve(FAVICONS_DIR, 'apple-touch-icon.png'), 'favicons/apple-touch-icon.png')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📱 PWA ICONS (public/icons/)\n')

  // Standard PWA icons
  await generateIcon(48, resolve(ICONS_DIR, 'icon-48.png'), 'icons/icon-48.png')
  await generateIcon(72, resolve(ICONS_DIR, 'icon-72.png'), 'icons/icon-72.png')
  await generateIcon(96, resolve(ICONS_DIR, 'icon-96.png'), 'icons/icon-96.png')
  await generateIcon(128, resolve(ICONS_DIR, 'icon-128.png'), 'icons/icon-128.png')
  await generateIcon(144, resolve(ICONS_DIR, 'icon-144.png'), 'icons/icon-144.png')
  await generateIcon(152, resolve(ICONS_DIR, 'icon-152.png'), 'icons/icon-152.png')
  await generateIcon(192, resolve(ICONS_DIR, 'icon-192.png'), 'icons/icon-192.png')
  await generateIcon(256, resolve(ICONS_DIR, 'icon-256.png'), 'icons/icon-256.png')
  await generateIcon(384, resolve(ICONS_DIR, 'icon-384.png'), 'icons/icon-384.png')
  await generateIcon(512, resolve(ICONS_DIR, 'icon-512.png'), 'icons/icon-512.png')
  await generateIcon(1024, resolve(ICONS_DIR, 'icon-1024.png'), 'icons/icon-1024.png')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🎯 MASKABLE ICONS (PWA safe zone)\n')

  // Maskable icons (safe zone = 80% diameter circle)
  // Logo fits at ~55% of icon size for safe zone
  await generateIcon(48, resolve(ICONS_DIR, 'icon-48-maskable.png'), 'icons/icon-48-maskable.png')
  await generateIcon(72, resolve(ICONS_DIR, 'icon-72-maskable.png'), 'icons/icon-72-maskable.png')
  await generateIcon(96, resolve(ICONS_DIR, 'icon-96-maskable.png'), 'icons/icon-96-maskable.png')
  await generateIcon(128, resolve(ICONS_DIR, 'icon-128-maskable.png'), 'icons/icon-128-maskable.png')
  await generateIcon(144, resolve(ICONS_DIR, 'icon-144-maskable.png'), 'icons/icon-144-maskable.png')
  await generateIcon(152, resolve(ICONS_DIR, 'icon-152-maskable.png'), 'icons/icon-152-maskable.png')
  await generateIcon(192, resolve(ICONS_DIR, 'icon-192-maskable.png'), 'icons/icon-192-maskable.png')
  await generateIcon(384, resolve(ICONS_DIR, 'icon-384-maskable.png'), 'icons/icon-384-maskable.png')
  await generateIcon(512, resolve(ICONS_DIR, 'icon-512-maskable.png'), 'icons/icon-512-maskable.png')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🚀 TWA ICONS (Android App)\n')

  // TWA icons - same as PWA but organized by density
  // mipmap-mdpi (1x)
  mkdirSync(resolve(TWA_DIR, 'mipmap-mdpi'), { recursive: true })
  await generateIcon(48, resolve(TWA_DIR, 'mipmap-mdpi', 'ic_launcher.png'), 'TWA: mipmap-mdpi/ic_launcher.png')

  // mipmap-hdpi (1.5x)
  mkdirSync(resolve(TWA_DIR, 'mipmap-hdpi'), { recursive: true })
  await generateIcon(72, resolve(TWA_DIR, 'mipmap-hdpi', 'ic_launcher.png'), 'TWA: mipmap-hdpi/ic_launcher.png')

  // mipmap-xhdpi (2x)
  mkdirSync(resolve(TWA_DIR, 'mipmap-xhdpi'), { recursive: true })
  await generateIcon(96, resolve(TWA_DIR, 'mipmap-xhdpi', 'ic_launcher.png'), 'TWA: mipmap-xhdpi/ic_launcher.png')

  // mipmap-xxhdpi (3x)
  mkdirSync(resolve(TWA_DIR, 'mipmap-xxhdpi'), { recursive: true })
  await generateIcon(144, resolve(TWA_DIR, 'mipmap-xxhdpi', 'ic_launcher.png'), 'TWA: mipmap-xxhdpi/ic_launcher.png')

  // mipmap-xxxhdpi (4x)
  mkdirSync(resolve(TWA_DIR, 'mipmap-xxxhdpi'), { recursive: true })
  await generateIcon(192, resolve(TWA_DIR, 'mipmap-xxxhdpi', 'ic_launcher.png'), 'TWA: mipmap-xxxhdpi/ic_launcher.png')

  // Maskable variants for adaptive icons (Android 8+)
  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    mkdirSync(resolve(TWA_DIR, `mipmap-${density}`), { recursive: true })
  }

  await generateIcon(48, resolve(TWA_DIR, 'mipmap-mdpi', 'ic_launcher_round.png'), 'TWA: mipmap-mdpi/ic_launcher_round.png')
  await generateIcon(72, resolve(TWA_DIR, 'mipmap-hdpi', 'ic_launcher_round.png'), 'TWA: mipmap-hdpi/ic_launcher_round.png')
  await generateIcon(96, resolve(TWA_DIR, 'mipmap-xhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xhdpi/ic_launcher_round.png')
  await generateIcon(144, resolve(TWA_DIR, 'mipmap-xxhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xxhdpi/ic_launcher_round.png')
  await generateIcon(192, resolve(TWA_DIR, 'mipmap-xxxhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xxxhdpi/ic_launcher_round.png')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📋 ROOT COPIES (public/)\n')

  // Root level copies for easy access
  await generateIcon(180, resolve(PUBLIC, 'apple-touch-icon.png'), 'public/apple-touch-icon.png')
  await generateIcon(192, resolve(PUBLIC, 'icon.png'), 'public/icon.png (copy)')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('✨ Todos os ícones gerados com sucesso!')
  console.log(`\n📊 Detalhes:`)
  console.log(`  • Favicons: public/favicons/`)
  console.log(`  • PWA Icons: public/icons/`)
  console.log(`  • TWA Icons: twa/app/src/main/res/mipmap-*/`)
  console.log(`  • Método: 100% scale (fit: 'fill') - sem padding ou cortes`)
  console.log(`\n✅ Pronto para usar em:\n  - Web: favicon.ico, manifest.json, <link rel="icon">`)
  console.log(`  - PWA: icon-*.png, icon-*-maskable.png`)
  console.log(`  - TWA: ic_launcher.png, ic_launcher_round.png\n`)
}

main().catch(err => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
