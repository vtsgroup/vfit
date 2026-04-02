#!/usr/bin/env node
/**
 * generate-favicons-v2.mjs
 * 
 * Gera TODOS os favicons e ícones PWA a partir das logos reais PNG.
 * 
 * Estratégia:
 *   - Ícones pequenos (≤96px): AI-logo-round.png (sem texto — legibilidade)
 *   - Ícones médios (128-384px): AI-logo-round.png (sem texto)
 *   - Ícones grandes (≥512px): AI-logo-round-ext.png (com "PERSONAL")
 *   - Apple touch icon (180px): AI-logo-round.png (sem texto)
 *   - OG / Splash (1024px): AI-logo-round-ext.png (com "PERSONAL")
 *   - Maskable: AI-logo-round.png com padding 10% + bg #0A0B1A
 * 
 * Dependência: sharp (npm install --save-dev sharp)
 * 
 * Uso: node scripts/generate-favicons-v2.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')
const FAVICONS_DIR = join(PUBLIC, 'favicons')
const ICONS_DIR = join(PUBLIC, 'icons')

// Ensure directories
for (const dir of [FAVICONS_DIR, ICONS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

// Source logos
const LOGO_SMALL = join(PUBLIC, 'AI-logo-round.png')       // 2048×2048, sem texto
const LOGO_LARGE = join(PUBLIC, 'AI-logo-round-ext.png')   // 2048×2048, com "PERSONAL"

// Dark background color matching the logo
const BG_COLOR = { r: 10, g: 11, b: 26, alpha: 1 } // #0A0B1A (dark navy from logo)

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('❌ sharp não instalado. Rode: npm install --save-dev sharp')
    process.exit(1)
  }

  for (const src of [LOGO_SMALL, LOGO_LARGE]) {
    if (!existsSync(src)) {
      console.error(`❌ Logo não encontrada: ${src}`)
      process.exit(1)
    }
  }

  console.log('🎨 Gerando favicons a partir das logos reais...\n')

  // ━━━ Standard icons (small logo, sem texto) ━━━━━━━━━━━━
  const smallIcons = [
    // Favicons (public/favicons/)
    { size: 16, out: join(FAVICONS_DIR, 'favicon-16.png') },
    { size: 32, out: join(FAVICONS_DIR, 'favicon-32.png') },
    { size: 48, out: join(FAVICONS_DIR, 'favicon-48.png') },
    { size: 96, out: join(FAVICONS_DIR, 'favicon-96.png') },
    { size: 180, out: join(FAVICONS_DIR, 'apple-touch-icon.png') },
    // PWA icons (public/icons/)
    { size: 48, out: join(ICONS_DIR, 'icon-48.png') },
    { size: 72, out: join(ICONS_DIR, 'icon-72.png') },
    { size: 96, out: join(ICONS_DIR, 'icon-96.png') },
    { size: 128, out: join(ICONS_DIR, 'icon-128.png') },
    { size: 144, out: join(ICONS_DIR, 'icon-144.png') },
    { size: 152, out: join(ICONS_DIR, 'icon-152.png') },
    { size: 192, out: join(ICONS_DIR, 'icon-192.png') },
    { size: 256, out: join(ICONS_DIR, 'icon-256.png') },
    { size: 384, out: join(ICONS_DIR, 'icon-384.png') },
    // Root copies
    { size: 180, out: join(PUBLIC, 'apple-touch-icon.png') },
  ]

  for (const { size, out } of smallIcons) {
    await sharp(LOGO_SMALL)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(out)
    console.log(`  ✅ ${String(size).padStart(4)}×${size}  (sem texto) → ${out.replace(ROOT, '.')}`)
  }

  // ━━━ Large icons (logo com "PERSONAL") ━━━━━━━━━━━━━━━━━
  const largeIcons = [
    { size: 512, out: join(ICONS_DIR, 'icon-512.png') },
    { size: 1024, out: join(ICONS_DIR, 'startup-1024.png') },
  ]

  for (const { size, out } of largeIcons) {
    await sharp(LOGO_LARGE)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(out)
    console.log(`  ✅ ${String(size).padStart(4)}×${size}  (com texto) → ${out.replace(ROOT, '.')}`)
  }

  // ━━━ Maskable icons (logo + 10% padding + dark bg) ━━━━━
  console.log('\n  🎭 Maskable icons (safe zone 80%)...')
  
  for (const size of [192, 512]) {
    const iconSize = Math.round(size * 0.8) // 80% of total = logo
    const padding = Math.round((size - iconSize) / 2)
    
    const resizedLogo = await sharp(LOGO_SMALL)
      .resize(iconSize, iconSize, { fit: 'cover' })
      .toBuffer()
    
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      }
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(join(ICONS_DIR, `icon-${size}-maskable.png`))
    
    console.log(`  ✅ ${String(size).padStart(4)}×${size}  (maskable)  → ./public/icons/icon-${size}-maskable.png`)
  }

  // ━━━ Favicon .ico (16 + 32 multi-size) ━━━━━━━━━━━━━━━━━
  console.log('\n  🏷️  favicon.ico...')
  try {
    const pngToIco = (await import('png-to-ico')).default
    const ico16 = join(FAVICONS_DIR, 'favicon-16.png')
    const ico32 = join(FAVICONS_DIR, 'favicon-32.png')
    
    const icoBuffer = await pngToIco([ico16, ico32])
    writeFileSync(join(FAVICONS_DIR, 'favicon.ico'), icoBuffer)
    writeFileSync(join(PUBLIC, 'favicon.ico'), icoBuffer)
    // Also write to src/app/ for Next.js
    writeFileSync(join(ROOT, 'src', 'app', 'favicon.ico'), icoBuffer)
    console.log(`  ✅ favicon.ico (16+32) → ./public/favicon.ico + ./src/app/favicon.ico`)
  } catch (e) {
    console.warn(`  ⚠️  ICO generation skipped: ${e.message}`)
  }

  // ━━━ Copy key files to public root ━━━━━━━━━━━━━━━━━━━━━
  console.log('\n  📋 Root copies...')
  const rootCopies = [
    { from: join(FAVICONS_DIR, 'favicon-16.png'), to: join(PUBLIC, 'favicon-16.png') },
    { from: join(FAVICONS_DIR, 'favicon-32.png'), to: join(PUBLIC, 'favicon-32.png') },
  ]
  for (const { from, to } of rootCopies) {
    writeFileSync(to, readFileSync(from))
    console.log(`  ✅ → ${to.replace(ROOT, '.')}`)
  }

  // ━━━ Generate WebP versions for hero/og usage ━━━━━━━━━━
  console.log('\n  🖼️  WebP versions for web...')
  
  // Logo for hero (transparent, optimized)
  await sharp(join(PUBLIC, 'personal-ia-transparent-ext.png'))
    .resize(600, 600, { fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(join(PUBLIC, 'images', 'logo-transparent-600.webp'))
  console.log('  ✅ logo-transparent-600.webp')

  await sharp(join(PUBLIC, 'personal-ia-transparent.png'))
    .resize(400, 320, { fit: 'inside' })
    .webp({ quality: 90 })
    .toFile(join(PUBLIC, 'images', 'logo-transparent-400.webp'))
  console.log('  ✅ logo-transparent-400.webp')

  // Logo round for navbar/sidebar
  await sharp(LOGO_SMALL)
    .resize(120, 120)
    .webp({ quality: 90 })
    .toFile(join(PUBLIC, 'images', 'logo-round-120.webp'))
  console.log('  ✅ logo-round-120.webp')

  await sharp(LOGO_SMALL)
    .resize(64, 64)
    .webp({ quality: 90 })
    .toFile(join(PUBLIC, 'images', 'logo-round-64.webp'))
  console.log('  ✅ logo-round-64.webp')

  // ━━━ Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n' + '─'.repeat(56))
  console.log(`🎉 Total: ${smallIcons.length + largeIcons.length + 2} PNGs + 2 maskable + 1 ICO + 4 WebP`)
  console.log('─'.repeat(56))
  console.log('\n💡 Próximos passos:')
  console.log('   1. Verificar visualmente os ícones pequenos (16/32px)')
  console.log('   2. Deploy com: node scripts/cf-deploy.js patch --msg "real logo favicons"')
}

main().catch(console.error)
