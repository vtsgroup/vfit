#!/usr/bin/env node
/**
 * final-icons-cleanup.mjs
 * Remove intrusos e deixa APENAS os ícones corretos em public/icons/
 */

import { unlinkSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ICONS_DIR = resolve(ROOT, 'public', 'icons')
const FAVICONS_DIR = resolve(ROOT, 'public', 'favicons')

console.log('🧹 LIMPEZA FINAL DE ÍCONES\n')

// Arquivos que DEVEM estar em icons
const validPatterns = [
  /^icon-\d+(-maskable)?\.png$/,  // icon-48.png, icon-192-maskable.png, etc
  /^icon-\d+\.svg$/,              // icon-512.svg se tiver
]

// Arquivos que DEVEM ser movidos para favicons/
const toMoveFavicons = [
  { from: 'apple-touch-icon.png', to: 'apple-touch-icon.png' },
  { from: 'favicon-16.png', to: 'favicon-16.png' },
  { from: 'favicon-32.png', to: 'favicon-32.png' },
]

console.log('📋 STEP 1: Movendo arquivos para favicons/\n')

for (const item of toMoveFavicons) {
  const source = resolve(ICONS_DIR, item.from)
  const dest = resolve(FAVICONS_DIR, item.to)
  
  if (existsSync(source)) {
    try {
      copyFileSync(source, dest)
      unlinkSync(source)
      console.log(`✅ Movido: ${item.from} → favicons/`)
    } catch (err) {
      console.error(`❌ Erro ao mover ${item.from}:`, err.message)
    }
  }
}

console.log('\n📋 STEP 2: Removendo intrusos de icons/\n')

const intrusos = [
  'screenshot-desktop.png',
  'screenshot-mobile.png',
  'startup-1024.png',
  '.DS_Store',
]

for (const file of intrusos) {
  const path = resolve(ICONS_DIR, file)
  if (existsSync(path)) {
    try {
      unlinkSync(path)
      console.log(`✅ Removido: ${file}`)
    } catch (err) {
      console.error(`❌ Erro ao remover ${file}:`, err.message)
    }
  }
}

console.log('\n✨ LIMPEZA FINAL CONCLUÍDA!\n')
console.log('📍 Resultado:')
console.log('   public/icons/    → Apenas ícones (icon-*.png, icon-*-maskable.png)')
console.log('   public/favicons/ → Apenas favicons (favicon-*.png, favicon.svg, favicon.ico)')
console.log('\n✅ Sistema pronto!\n')
