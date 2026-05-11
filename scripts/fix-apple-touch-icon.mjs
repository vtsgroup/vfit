#!/usr/bin/env node

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = dirname(__dirname)

const svgPath = join(rootDir, 'public/favicons/favicon.svg')
const outputPath = join(rootDir, 'public/favicons/apple-touch-icon.png')

console.log('🔄 Regenerando apple-touch-icon.png (180×180) de favicon.svg...')

try {
  await sharp(svgPath)
    .resize(180, 180, {
      fit: 'fill',
      withoutEnlargement: false,
    })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(outputPath)

  console.log(`✅ Gerado: ${outputPath}`)
  console.log('   • 180×180 pixels (iOS home screen)')
  console.log('   • Design: favicon.svg atualizado')
  console.log('   • Formato: PNG otimizado (fit: fill, sem padding)')
} catch (error) {
  console.error('❌ Erro:', error.message)
  process.exit(1)
}
