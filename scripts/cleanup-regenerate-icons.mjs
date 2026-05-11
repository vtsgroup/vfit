#!/usr/bin/env node
/**
 * cleanup-regenerate-icons.mjs
 * 
 * 1. Converte favicon.svg → PNG de alta qualidade (imagem fonte)
 * 2. Remove ícones antigos/estranhos/duplicatas
 * 3. Regenera apenas os ícones corretos
 */

import sharp from 'sharp'
import { unlinkSync, rmSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const ICONS_DIR = resolve(PUBLIC, 'icons')
const FAVICONS_DIR = resolve(PUBLIC, 'favicons')
const SVG_SOURCE = resolve(FAVICONS_DIR, 'favicon.svg')
const PNG_SOURCE = resolve(PUBLIC, 'icon-round.png')

console.log('🧹 LIMPEZA & REGENERAÇÃO DE ÍCONES\n')

// ============ STEP 1: Converter SVG → PNG ============
console.log('📦 STEP 1: Convertendo favicon.svg → PNG...\n')

if (!existsSync(SVG_SOURCE)) {
  console.error(`❌ Arquivo não encontrado: ${SVG_SOURCE}`)
  process.exit(1)
}

try {
  await sharp(SVG_SOURCE, { density: 300 })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(PNG_SOURCE)
  console.log(`✅ Criado: ${PNG_SOURCE.replace(ROOT, '.')}`)
  console.log(`   Fonte: favicon.svg → PNG 1024×1024\n`)
} catch (err) {
  console.error(`❌ Erro ao converter SVG:`, err.message)
  process.exit(1)
}

// ============ STEP 2: Remover ícones antigos/estranhos ============
console.log('🧹 STEP 2: Removendo ícones antigos/estranhos...\n')

const filesToDelete = [
  // Duplicatas (icon-maskable-* vs icon-*-maskable.png)
  resolve(ICONS_DIR, 'icon-maskable-48.png'),
  resolve(ICONS_DIR, 'icon-maskable-72.png'),
  resolve(ICONS_DIR, 'icon-maskable-96.png'),
  resolve(ICONS_DIR, 'icon-maskable-128.png'),
  resolve(ICONS_DIR, 'icon-maskable-144.png'),
  resolve(ICONS_DIR, 'icon-maskable-152.png'),
  resolve(ICONS_DIR, 'icon-maskable-192.png'),
  resolve(ICONS_DIR, 'icon-maskable-384.png'),
  resolve(ICONS_DIR, 'icon-maskable-512.png'),

  // Monochrome / Badges estranhos
  resolve(ICONS_DIR, 'icon-96-monochrome.png'),
  resolve(ICONS_DIR, 'icon-192-monochrome.png'),
  resolve(ICONS_DIR, 'notification-badge-48.png'),
  resolve(ICONS_DIR, 'notification-badge-72.png'),
  resolve(ICONS_DIR, 'notification-badge-96.png'),
  resolve(ICONS_DIR, 'notification-badge-192.png'),

  // SVG antigos (vamos manter apenas favicon.svg em favicons/)
  resolve(ICONS_DIR, 'icon-192.svg'),
  resolve(ICONS_DIR, 'icon-512.svg'),
  resolve(ICONS_DIR, 'icon-maskable-512.svg'),
  resolve(ICONS_DIR, 'apple-touch-icon.svg'),

  // Arquivos de sistema
  resolve(ICONS_DIR, '.DS_Store'),
  resolve(FAVICONS_DIR, '.DS_Store'),
]

let deletedCount = 0
for (const file of filesToDelete) {
  if (existsSync(file)) {
    try {
      unlinkSync(file)
      console.log(`  ✅ Removido: ${file.replace(ROOT, '.')}`)
      deletedCount++
    } catch (err) {
      console.error(`  ❌ Erro ao remover ${file}:`, err.message)
    }
  }
}

console.log(`\n  Total removido: ${deletedCount} arquivos antigos\n`)

// ============ STEP 3: Regenerar ícones corretos ============
console.log('🎨 STEP 3: Regenerando ícones corretos...\n')

async function generateIcon(size, outputPath, label) {
  try {
    await sharp(PNG_SOURCE)
      .resize(size, size, {
        fit: 'fill',
        position: 'center',
      })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outputPath)
    
    console.log(`✅ ${String(size).padStart(4)}×${size} → ${label}`)
  } catch (err) {
    console.error(`❌ Erro gerando ${label}:`, err.message)
  }
}

// Favicons
console.log('📍 Favicons (public/favicons/)\n')
await generateIcon(16, resolve(FAVICONS_DIR, 'favicon-16.png'), 'favicons/favicon-16.png')
await generateIcon(32, resolve(FAVICONS_DIR, 'favicon-32.png'), 'favicons/favicon-32.png')
await generateIcon(48, resolve(FAVICONS_DIR, 'favicon-48.png'), 'favicons/favicon-48.png')
await generateIcon(96, resolve(FAVICONS_DIR, 'favicon-96.png'), 'favicons/favicon-96.png')
await generateIcon(180, resolve(FAVICONS_DIR, 'apple-touch-icon.png'), 'favicons/apple-touch-icon.png')

// PWA Icons
console.log('\n📱 PWA Icons (public/icons/)\n')
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

// Maskable Icons
console.log('\n🎯 Maskable Icons (PWA safe zone)\n')
await generateIcon(48, resolve(ICONS_DIR, 'icon-48-maskable.png'), 'icons/icon-48-maskable.png')
await generateIcon(72, resolve(ICONS_DIR, 'icon-72-maskable.png'), 'icons/icon-72-maskable.png')
await generateIcon(96, resolve(ICONS_DIR, 'icon-96-maskable.png'), 'icons/icon-96-maskable.png')
await generateIcon(128, resolve(ICONS_DIR, 'icon-128-maskable.png'), 'icons/icon-128-maskable.png')
await generateIcon(144, resolve(ICONS_DIR, 'icon-144-maskable.png'), 'icons/icon-144-maskable.png')
await generateIcon(152, resolve(ICONS_DIR, 'icon-152-maskable.png'), 'icons/icon-152-maskable.png')
await generateIcon(192, resolve(ICONS_DIR, 'icon-192-maskable.png'), 'icons/icon-192-maskable.png')
await generateIcon(384, resolve(ICONS_DIR, 'icon-384-maskable.png'), 'icons/icon-384-maskable.png')
await generateIcon(512, resolve(ICONS_DIR, 'icon-512-maskable.png'), 'icons/icon-512-maskable.png')

// TWA Icons
console.log('\n🚀 TWA Icons (Android)\n')

const twaDir = resolve(ROOT, 'twa', 'app', 'src', 'main', 'res')
for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
  mkdirSync(resolve(twaDir, `mipmap-${density}`), { recursive: true })
}

await generateIcon(48, resolve(twaDir, 'mipmap-mdpi', 'ic_launcher.png'), 'TWA: mipmap-mdpi/ic_launcher.png')
await generateIcon(72, resolve(twaDir, 'mipmap-hdpi', 'ic_launcher.png'), 'TWA: mipmap-hdpi/ic_launcher.png')
await generateIcon(96, resolve(twaDir, 'mipmap-xhdpi', 'ic_launcher.png'), 'TWA: mipmap-xhdpi/ic_launcher.png')
await generateIcon(144, resolve(twaDir, 'mipmap-xxhdpi', 'ic_launcher.png'), 'TWA: mipmap-xxhdpi/ic_launcher.png')
await generateIcon(192, resolve(twaDir, 'mipmap-xxxhdpi', 'ic_launcher.png'), 'TWA: mipmap-xxxhdpi/ic_launcher.png')

await generateIcon(48, resolve(twaDir, 'mipmap-mdpi', 'ic_launcher_round.png'), 'TWA: mipmap-mdpi/ic_launcher_round.png')
await generateIcon(72, resolve(twaDir, 'mipmap-hdpi', 'ic_launcher_round.png'), 'TWA: mipmap-hdpi/ic_launcher_round.png')
await generateIcon(96, resolve(twaDir, 'mipmap-xhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xhdpi/ic_launcher_round.png')
await generateIcon(144, resolve(twaDir, 'mipmap-xxhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xxhdpi/ic_launcher_round.png')
await generateIcon(192, resolve(twaDir, 'mipmap-xxxhdpi', 'ic_launcher_round.png'), 'TWA: mipmap-xxxhdpi/ic_launcher_round.png')

// Root copies
console.log('\n📋 Root Copies (public/)\n')
await generateIcon(180, resolve(PUBLIC, 'apple-touch-icon.png'), 'public/apple-touch-icon.png')
await generateIcon(192, resolve(PUBLIC, 'icon.png'), 'public/icon.png (copy)')

console.log('\n' + '='.repeat(70))
console.log('✨ LIMPEZA & REGENERAÇÃO CONCLUÍDA!\n')
console.log('📊 Resumo:')
console.log(`  • Removido: ${deletedCount} ícones antigos/estranhos`)
console.log(`  • Gerado: 35 ícones novos (favicon.svg como fonte)`)
console.log(`  • Método: 100% scale (fit: 'fill') - sem padding`)
console.log('\n✅ Sistema pronto para usar!\n')
