#!/usr/bin/env node
/**
 * generate-favicons.mjs
 * 
 * Gera todos os tamanhos de favicon a partir do SVG master.
 * 
 * Dependências:
 *   npm install --save-dev sharp png-to-ico
 * 
 * Uso:
 *   node scripts/generate-favicons.mjs
 * 
 * Input:  public/favicons/favicon.svg
 * Output: Todos os PNGs + ICO em public/favicons/ e public/icons/
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FAVICONS_DIR = join(ROOT, 'public', 'favicons')
const ICONS_DIR = join(ROOT, 'public', 'icons')

// Ensure directories exist
for (const dir of [FAVICONS_DIR, ICONS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const SVG_PATH = join(FAVICONS_DIR, 'favicon.svg')

if (!existsSync(SVG_PATH)) {
  console.error('❌ SVG master não encontrado em public/favicons/favicon.svg')
  console.error('   Crie o SVG primeiro e depois rode este script.')
  process.exit(1)
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('❌ sharp não instalado. Rode: npm install --save-dev sharp')
    process.exit(1)
  }

  const svgBuffer = readFileSync(SVG_PATH)
  console.log('🎨 Gerando favicons a partir de favicon.svg...\n')

  // ─── PNG Sizes ──────────────────────────
  const sizes = [
    // Favicons (public/favicons/)
    { size: 16, output: join(FAVICONS_DIR, 'favicon-16.png') },
    { size: 32, output: join(FAVICONS_DIR, 'favicon-32.png') },
    { size: 48, output: join(FAVICONS_DIR, 'favicon-48.png') },
    { size: 96, output: join(FAVICONS_DIR, 'favicon-96.png') },
    { size: 180, output: join(FAVICONS_DIR, 'apple-touch-icon.png') },
    // PWA Icons (public/icons/)
    { size: 48, output: join(ICONS_DIR, 'icon-48.png') },
    { size: 72, output: join(ICONS_DIR, 'icon-72.png') },
    { size: 96, output: join(ICONS_DIR, 'icon-96.png') },
    { size: 128, output: join(ICONS_DIR, 'icon-128.png') },
    { size: 144, output: join(ICONS_DIR, 'icon-144.png') },
    { size: 152, output: join(ICONS_DIR, 'icon-152.png') },
    { size: 192, output: join(ICONS_DIR, 'icon-192.png') },
    { size: 256, output: join(ICONS_DIR, 'icon-256.png') },
    { size: 384, output: join(ICONS_DIR, 'icon-384.png') },
    { size: 512, output: join(ICONS_DIR, 'icon-512.png') },
    // Maskable (com padding extra — o SVG já deve ter safe zone)
    { size: 192, output: join(ICONS_DIR, 'icon-192-maskable.png') },
    { size: 512, output: join(ICONS_DIR, 'icon-512-maskable.png') },
    // Apple touch icon no root
    { size: 180, output: join(ROOT, 'public', 'apple-touch-icon.png') },
    // Startup splash
    { size: 1024, output: join(ICONS_DIR, 'startup-1024.png') },
  ]

  for (const { size, output } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(output)
    console.log(`  ✅ ${size}×${size} → ${output.replace(ROOT, '.')}`)
  }

  // ─── ICO (16 + 32) ──────────────────────
  try {
    const pngToIco = (await import('png-to-ico')).default
    const ico16 = join(FAVICONS_DIR, 'favicon-16.png')
    const ico32 = join(FAVICONS_DIR, 'favicon-32.png')
    
    const icoBuffer = await pngToIco([ico16, ico32])
    writeFileSync(join(FAVICONS_DIR, 'favicon.ico'), icoBuffer)
    writeFileSync(join(ROOT, 'public', 'favicon.ico'), icoBuffer)
    console.log(`  ✅ favicon.ico (16+32) → ./public/favicon.ico`)
  } catch (e) {
    console.warn(`  ⚠️  ICO generation skipped: ${e.message}`)
    console.warn('     Instale: npm install --save-dev png-to-ico')
  }

  // ─── Copy key files to root public/ ─────
  const rootCopies = [
    { from: join(FAVICONS_DIR, 'favicon-16.png'), to: join(ROOT, 'public', 'favicon-16.png') },
    { from: join(FAVICONS_DIR, 'favicon-32.png'), to: join(ROOT, 'public', 'favicon-32.png') },
  ]

  for (const { from, to } of rootCopies) {
    if (existsSync(from)) {
      writeFileSync(to, readFileSync(from))
      console.log(`  📋 Copied → ${to.replace(ROOT, '.')}`)
    }
  }

  console.log('\n🎉 Favicons gerados com sucesso!')
  console.log(`   Total: ${sizes.length} PNGs + 1 ICO`)
  console.log('\n💡 Próximos passos:')
  console.log('   1. Atualize manifest.json com os novos paths')
  console.log('   2. Atualize layout.tsx com os novos icon refs')
  console.log('   3. Deploy com: node scripts/cf-deploy.js patch --msg "new favicons"')
}

main().catch(console.error)
