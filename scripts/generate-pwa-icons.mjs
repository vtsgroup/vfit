/**
 * Generate favicons + PWA icons from the real brand images.
 *
 * Fonte dos ícones:
 * - public/AI-logo-round.png      → ícones PWA (launcher)
 * - public/AI-logo-round-ext.png  → splash/startup do app
 *
 * Regra (conforme solicitado):
 * - Ícones PWA/favicons: usar apenas o "AI-logo-round" (sem texto "PERSONAL")
 * - Splash/startup: usar "AI-logo-round-ext"
 * - Não usar máscara / background sólido (manter transparência)
 * - Trim + fit cover para ocupar 100% do canvas e remover espaço sobrando.
 */

import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { mkdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')
const ICONS_DIR = join(PUBLIC_DIR, 'icons')

const SRC_SMALL = join(PUBLIC_DIR, 'AI-logo-round.png')
const SRC_EXT = join(PUBLIC_DIR, 'AI-logo-round-ext.png')
const ICONS_REV = '20260224-round'

const TRANSPARENT_BG = { r: 0, g: 0, b: 0, alpha: 0 }

// Sizes needed for PWA
const SIZES = [
  { size: 48, name: 'icon-48.png' },
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 256, name: 'icon-256.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
]

async function ensureSources() {
  await sharp(SRC_SMALL).metadata()
  await sharp(SRC_EXT).metadata()
}

function pickSourceForSize(_size) {
  return SRC_SMALL
}

async function writePngFromSource({ src, outPath, size }) {
  await sharp(src)
    .trim()
    .resize(size, size, {
      fit: 'cover',
      position: 'centre',
      background: TRANSPARENT_BG,
    })
    .png()
    .toFile(outPath)
}

// Generate a screenshot placeholder (for richer install UI on Android)
function createScreenshotSvg(width, height, label) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#09090B"/>
  <rect x="0" y="0" width="${width}" height="${Math.round(height * 0.08)}" fill="#111113"/>
  <circle cx="${Math.round(width * 0.05)}" cy="${Math.round(height * 0.04)}" r="6" fill="#FF5F57"/>
  <circle cx="${Math.round(width * 0.05) + 20}" cy="${Math.round(height * 0.04)}" r="6" fill="#FEBC2E"/>
  <circle cx="${Math.round(width * 0.05) + 40}" cy="${Math.round(height * 0.04)}" r="6" fill="#28C840"/>
  <rect x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.15)}" width="${Math.round(width * 0.35)}" height="${Math.round(height * 0.12)}" rx="12" fill="#111113"/>
  <rect x="${Math.round(width * 0.55)}" y="${Math.round(height * 0.15)}" width="${Math.round(width * 0.35)}" height="${Math.round(height * 0.12)}" rx="12" fill="#111113"/>
  <rect x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.32)}" width="${Math.round(width * 0.8)}" height="${Math.round(height * 0.25)}" rx="12" fill="#111113"/>
  <text x="${width / 2}" y="${Math.round(height * 0.46)}" text-anchor="middle" fill="#00D98E" font-family="system-ui" font-size="24" font-weight="700">${label}</text>
  <rect x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.62)}" width="${Math.round(width * 0.5)}" height="${Math.round(height * 0.15)}" rx="12" fill="#111113"/>
  <rect x="${Math.round(width * 0.65)}" y="${Math.round(height * 0.62)}" width="${Math.round(width * 0.25)}" height="${Math.round(height * 0.15)}" rx="12" fill="#111113"/>
  <rect x="${width / 2 - 60}" y="${Math.round(height * 0.85)}" width="120" height="36" rx="18" fill="#00D98E"/>
  <text x="${width / 2}" y="${Math.round(height * 0.87) + 4}" text-anchor="middle" fill="#09090B" font-family="system-ui" font-size="13" font-weight="700">VFIT</text>
</svg>`)
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true })

  await ensureSources()

  // Generate regular icons
  for (const { size, name } of SIZES) {
    const src = pickSourceForSize(size)
    await writePngFromSource({ src, outPath: join(ICONS_DIR, name), size })
    console.log(`✅ ${name} (${size}x${size})`)
  }

  // Maskable icons: fundo sólido #09090B + logo IA centralizado
  // A safe zone do maskable é 80% (inner circle) — logo a 75% garante que nunca é cortado
  for (const mSize of [192, 512]) {
    const logoSize = Math.round(mSize * 0.78)
    const logo = await sharp(SRC_SMALL)
      .trim()
      .resize(logoSize, logoSize, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG })
      .toBuffer()

    await sharp({
      create: { width: mSize, height: mSize, channels: 4, background: { r: 9, g: 9, b: 11, alpha: 255 } }
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toFile(join(ICONS_DIR, `icon-${mSize}-maskable.png`))
    console.log(`✅ icon-${mSize}-maskable.png (maskable, fundo sólido #09090B)`)
  }

  // Apple touch icon (180x180) — usar logo IA sem texto
  await writePngFromSource({ src: SRC_SMALL, outPath: join(ICONS_DIR, 'apple-touch-icon.png'), size: 180 })
  await writePngFromSource({ src: SRC_SMALL, outPath: join(PUBLIC_DIR, 'apple-touch-icon.png'), size: 180 })
  await writePngFromSource({ src: SRC_SMALL, outPath: join(PUBLIC_DIR, `apple-touch-icon-${ICONS_REV}.png`), size: 180 })
  console.log('✅ apple-touch-icon.png (180x180)')

  // Startup image (iOS splash) — versão estendida com fundo escuro
  const startupLogo = await sharp(SRC_EXT)
    .trim()
    .resize(720, 720, { fit: 'contain', position: 'centre', background: TRANSPARENT_BG })
    .toBuffer()

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 9, g: 9, b: 11, alpha: 255 } }
  })
    .composite([{ input: startupLogo, gravity: 'centre' }])
    .png()
    .toFile(join(ICONS_DIR, 'startup-1024.png'))
  console.log('✅ startup-1024.png (splash)')

  // Favicons (PNG) — usar versão round, sem preenchimento sólido.
  await sharp(SRC_SMALL).trim().resize(16, 16, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(ICONS_DIR, 'favicon-16.png'))
  await sharp(SRC_SMALL).trim().resize(32, 32, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(ICONS_DIR, 'favicon-32.png'))
  await sharp(SRC_SMALL).trim().resize(16, 16, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(PUBLIC_DIR, 'favicon-16.png'))
  await sharp(SRC_SMALL).trim().resize(32, 32, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(PUBLIC_DIR, 'favicon-32.png'))
  await sharp(SRC_SMALL).trim().resize(16, 16, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(PUBLIC_DIR, `favicon-${ICONS_REV}-16.png`))
  await sharp(SRC_SMALL).trim().resize(32, 32, { fit: 'cover', position: 'centre', background: TRANSPARENT_BG }).png().toFile(join(PUBLIC_DIR, `favicon-${ICONS_REV}-32.png`))
  console.log('✅ favicon-16.png (16x16)')
  console.log('✅ favicon-32.png (32x32)')

  // favicon.ico (16 + 32) — recomendação padrão
  const ico16 = await sharp(SRC_SMALL).trim().resize(16, 16, { fit: 'cover' }).png().toBuffer()
  const ico32 = await sharp(SRC_SMALL).trim().resize(32, 32, { fit: 'cover' }).png().toBuffer()
  const icoBuf = await pngToIco([ico16, ico32])
  await writeFile(join(PUBLIC_DIR, 'favicon.ico'), icoBuf)
  await writeFile(join(PUBLIC_DIR, `favicon-${ICONS_REV}.ico`), icoBuf)
  console.log('✅ favicon.ico (16/32)')

  // Generate screenshots for richer install UI
  const screenshotMobile = createScreenshotSvg(390, 844, 'Dashboard')
  await sharp(screenshotMobile).png().toFile(join(ICONS_DIR, 'screenshot-mobile.png'))
  console.log('✅ screenshot-mobile.png (390x844)')

  const screenshotDesktop = createScreenshotSvg(1280, 720, 'Dashboard VFIT')
  await sharp(screenshotDesktop).png().toFile(join(ICONS_DIR, 'screenshot-desktop.png'))
  console.log('✅ screenshot-desktop.png (1280x720)')

  console.log('\n🎉 All PWA icons generated!')
}

main().catch(console.error)
