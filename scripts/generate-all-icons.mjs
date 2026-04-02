#!/usr/bin/env node
/**
 * generate-all-icons.mjs v2
 * Gera TODOS os ícones do projeto (PWA + TWA) a partir das imagens source:
 * - AI-logo-round-ext.png → ícones regulares (any) + favicons + apple-touch
 * - AI-logo-ext.png → ícones maskable
 *
 * === MASKABLE SAFE ZONE EXPLAINED ===
 * Android maskable icons have a "safe zone" = circle of 80% diameter (40% radius).
 * Anything outside the safe zone gets CLIPPED by the device launcher shape
 * (circle, squircle, teardrop, etc).
 *
 * For the logo to fit FULLY inside the safe zone circle:
 * - The inscribed square of the 80% circle = 80% * cos(45°) ≈ 56.57% of icon
 * - We use 55% logo size to add a small visual margin
 * - That means ~22.5% padding on each side
 *
 * Additionally, TWA's ic_launcher.xml adds 8.5dp INSET on top of the maskable,
 * so TWA ic_maskable should have the logo LARGER (occupy ~92% with no extra padding)
 * because the XML already provides the padding.
 *
 * Resultado visual: Logo igual à 3ª imagem de referência (perfeito, com texto "PERSONAL").
 */

import sharp from 'sharp'
import { mkdirSync, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')

const ROUND_SRC = resolve(PUBLIC, 'AI-logo-round-ext.png')  // Com fundo arredondado → ícones regulares
const SQUARE_SRC = resolve(PUBLIC, 'AI-logo-ext.png')        // Sem round → maskable (adicionamos padding)

const ICONS_DIR = resolve(PUBLIC, 'icons')
const FAVICONS_DIR = resolve(PUBLIC, 'favicons')

// Ensure directories exist
mkdirSync(ICONS_DIR, { recursive: true })
mkdirSync(FAVICONS_DIR, { recursive: true })

const BG_COLOR = '#050A12'
const BG_RGBA = { r: 5, g: 10, b: 18, alpha: 1 }

/**
 * Helper: Create icon with logo centered on BG_COLOR background
 * @param {string} src - Source image path
 * @param {number} outputSize - Final icon size in px
 * @param {number} logoRatio - Ratio of logo to total size (0.0-1.0)
 * @param {string} outputPath - Output file path
 */
async function createPaddedIcon(src, outputSize, logoRatio, outputPath) {
  const logoSize = Math.round(outputSize * logoRatio)
  const offset = Math.round((outputSize - logoSize) / 2)

  const resizedLogo = await sharp(src)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: BG_RGBA,
    },
  })
    .composite([{ input: resizedLogo, top: offset, left: offset }])
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(outputPath)
}

// ============================================
// Regular icons (purpose: "any") — from round logo
// ============================================
const REGULAR_SIZES = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024]

async function generateRegularIcons() {
  console.log('🎨 Generating regular icons from AI-logo-round-ext.png...')
  for (const size of REGULAR_SIZES) {
    await sharp(ROUND_SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(resolve(ICONS_DIR, `icon-${size}.png`))
    console.log(`  ✅ icon-${size}.png`)
  }
}

// ============================================
// Maskable icons for PWA manifest (purpose: "maskable")
//
// PWA maskable safe zone = circle of 80% diameter.
// Inscribed square of that circle ≈ 56.57%.
// We use 62% logo to look good in both circle and squircle masks.
// Padding is filled with BG_COLOR which is seamless.
// ============================================
const MASKABLE_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512]
const PWA_MASKABLE_RATIO = 0.62  // 62% logo, 19% padding each side

async function generateMaskableIcons() {
  console.log(`\n🎭 Generating maskable icons (PWA) — ${PWA_MASKABLE_RATIO * 100}% logo...`)
  for (const size of MASKABLE_SIZES) {
    await createPaddedIcon(SQUARE_SRC, size, PWA_MASKABLE_RATIO, resolve(ICONS_DIR, `icon-${size}-maskable.png`))
    console.log(`  ✅ icon-${size}-maskable.png`)
  }
}

// ============================================
// Monochrome icon (96px)
// ============================================
async function generateMonochromeIcon() {
  console.log('\n⚪ Generating monochrome icon...')
  const src = await sharp(SQUARE_SRC).resize(96, 96).ensureAlpha().toBuffer()
  await sharp(src).negate({ alpha: false }).toFile(resolve(ICONS_DIR, 'icon-96-monochrome.png'))
  console.log('  ✅ icon-96-monochrome.png')
}

// ============================================
// Favicons — from round logo
// ============================================
const FAVICON_SIZES = [16, 32, 48, 96]

async function generateFavicons() {
  console.log('\n🌐 Generating favicons from AI-logo-round-ext.png...')
  for (const size of FAVICON_SIZES) {
    await sharp(ROUND_SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(resolve(FAVICONS_DIR, `favicon-${size}.png`))
    console.log(`  ✅ favicon-${size}.png`)
  }

  // favicon.ico
  await sharp(ROUND_SRC)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(FAVICONS_DIR, 'favicon.ico'))
  console.log('  ✅ favicon.ico')

  // Apple touch icon (180x180 — logo round with bg)
  await createPaddedIcon(ROUND_SRC, 180, 0.82, resolve(FAVICONS_DIR, 'apple-touch-icon.png'))
  console.log('  ✅ apple-touch-icon.png')

  copyFileSync(
    resolve(FAVICONS_DIR, 'apple-touch-icon.png'),
    resolve(ICONS_DIR, 'apple-touch-icon.png')
  )
  console.log('  ✅ icons/apple-touch-icon.png (copy)')
}

// ============================================
// TWA Android resources
//
// Android Adaptive Icons work in layers:
//   ic_launcher.xml wraps ic_maskable.png in a <layer-list> with 8.5dp padding.
//   So ic_maskable.png should have the logo FILLING most of the canvas
//   because the XML already adds the safe zone padding.
//
// DPI sizes (Android standard):
//   mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
//
// But ic_maskable needs to be BIGGER because the adaptive-icon system
// expects a 108dp resource that gets masked to 72dp display area.
// Standard maskable sizes:
//   mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432
//
// Splash screen sizes:
//   mdpi=300, hdpi=450, xhdpi=600, xxhdpi=900, xxxhdpi=1200
// ============================================

const TWA_RES = resolve(ROOT, 'twa/app/src/main/res')

const TWA_LAUNCHER_MAP = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
}

const TWA_MASKABLE_MAP = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
}

const TWA_SPLASH_MAP = {
  'drawable-mdpi': 300,
  'drawable-hdpi': 450,
  'drawable-xhdpi': 600,
  'drawable-xxhdpi': 900,
  'drawable-xxxhdpi': 1200,
}

async function generateTWAIcons() {
  console.log('\n📱 Generating TWA Android resources...')

  // --- ic_launcher.png (regular round icon for app drawer) ---
  console.log('\n  🔷 ic_launcher.png (round, "any" purpose)...')
  for (const [folder, size] of Object.entries(TWA_LAUNCHER_MAP)) {
    const dir = resolve(TWA_RES, folder)
    mkdirSync(dir, { recursive: true })
    await sharp(ROUND_SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(resolve(dir, 'ic_launcher.png'))
    console.log(`    ✅ ${folder}/ic_launcher.png (${size}px)`)
  }

  // --- ic_maskable.png (foreground for adaptive icon) ---
  // Android adaptive icon: canvas=108dp, visible after mask=72dp (66.7%).
  // Safe zone for content = 66dp = 61%. We use 62% logo ratio.
  // Padding filled with BG_COLOR blends with <background> layer.
  console.log('\n  🎭 ic_maskable.png (62% logo, safe zone padding)...')
  const TWA_MASKABLE_RATIO = 0.62
  for (const [folder, size] of Object.entries(TWA_MASKABLE_MAP)) {
    const dir = resolve(TWA_RES, folder)
    mkdirSync(dir, { recursive: true })
    await createPaddedIcon(SQUARE_SRC, size, TWA_MASKABLE_RATIO, resolve(dir, 'ic_maskable.png'))
    console.log(`    ✅ ${folder}/ic_maskable.png (${size}px, logo=${Math.round(size * TWA_MASKABLE_RATIO)}px)`)
  }

  // --- splash.png (centered round logo on bg) ---
  console.log('\n  💦 splash.png (loading screen)...')
  for (const [folder, size] of Object.entries(TWA_SPLASH_MAP)) {
    const dir = resolve(TWA_RES, folder)
    mkdirSync(dir, { recursive: true })
    await createPaddedIcon(ROUND_SRC, size, 0.50, resolve(dir, 'splash.png'))
    console.log(`    ✅ ${folder}/splash.png (${size}px)`)
  }

  // --- Shortcut icons (reuse round) ---
  console.log('\n  🔗 Shortcut icons...')
  const SHORTCUT_MAP = {
    'drawable-mdpi': 48,
    'drawable-hdpi': 72,
    'drawable-xhdpi': 96,
    'drawable-xxhdpi': 144,
    'drawable-xxxhdpi': 192,
  }
  for (const [folder, size] of Object.entries(SHORTCUT_MAP)) {
    const dir = resolve(TWA_RES, folder)
    const iconBuf = await sharp(ROUND_SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer()
    for (const name of ['shortcut_0.png', 'shortcut_1.png', 'shortcut_2.png']) {
      await sharp(iconBuf).toFile(resolve(dir, name))
    }
    console.log(`    ✅ ${folder}/shortcut_*.png (${size}px)`)
  }

  // --- Notification icon (white silhouette) ---
  console.log('\n  🔔 Notification icons...')
  const NOTIF_MAP = {
    'drawable-mdpi': 24,
    'drawable-hdpi': 36,
    'drawable-xhdpi': 48,
    'drawable-xxhdpi': 72,
    'drawable-xxxhdpi': 96,
  }
  for (const [folder, size] of Object.entries(NOTIF_MAP)) {
    const dir = resolve(TWA_RES, folder)
    // Notification icons need to be white silhouette on transparent
    const src = await sharp(ROUND_SRC)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .toBuffer()
    await sharp(src)
      .negate({ alpha: false })
      .toFile(resolve(dir, 'ic_notification_icon.png'))
    console.log(`    ✅ ${folder}/ic_notification_icon.png (${size}px)`)
  }

  // --- TWA store_icon.png (512px, same ratio as maskable) ---
  console.log('\n  🏪 Store icon...')
  await createPaddedIcon(SQUARE_SRC, 512, 0.62, resolve(ROOT, 'twa/store_icon.png'))
  console.log('  ✅ twa/store_icon.png (512px)')

  // --- Startup/splash icon for PWA ---
  console.log('\n  🖼️  Startup icon...')
  await createPaddedIcon(ROUND_SRC, 1024, 0.50, resolve(ICONS_DIR, 'startup-1024.png'))
  console.log('  ✅ icons/startup-1024.png (1024px)')
}

// ============================================
// Run all
// ============================================
async function main() {
  console.log('🚀 Generating ALL icons for VFIT (v2)\n')
  console.log(`  Source (regular):  AI-logo-round-ext.png`)
  console.log(`  Source (maskable): AI-logo-ext.png`)
  console.log(`  Background: ${BG_COLOR}`)
  console.log(`  PWA maskable: 100% fill (source has built-in bg)\n`)

  await generateRegularIcons()
  await generateMaskableIcons()
  await generateMonochromeIcon()
  await generateFavicons()
  await generateTWAIcons()

  console.log('\n🎉 All icons generated successfully!')
  console.log('\n📋 Summary:')
  console.log(`  • ${REGULAR_SIZES.length} regular icons (any)`)
  console.log(`  • ${MASKABLE_SIZES.length} maskable icons (PWA)`)
  console.log('  • 1 monochrome icon')
  console.log(`  • ${FAVICON_SIZES.length + 2} favicons (+ apple-touch + ico)`)
  console.log(`  • ${Object.keys(TWA_LAUNCHER_MAP).length} TWA ic_launcher`)
  console.log(`  • ${Object.keys(TWA_MASKABLE_MAP).length} TWA ic_maskable (108dp-432dp)`)
  console.log(`  • ${Object.keys(TWA_SPLASH_MAP).length} TWA splash screens`)
  console.log('  • TWA shortcut + notification icons')
  console.log('  • 1 store icon + 1 startup icon')
  console.log('\nNext: update manifest.json cache-bust, then build TWA')
}

main().catch(console.error)
