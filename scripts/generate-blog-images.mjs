#!/usr/bin/env node
/**
 * generate-blog-images.mjs
 * 
 * Gera hero images (800×450) para cada post do blog.
 * Premium gradient + logo real + ilustração temática.
 * 
 * Uso:
 *   node scripts/generate-blog-images.mjs
 * 
 * Output: public/blog/*.png
 */

import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'public', 'blog')
const LOGO_ROUND = join(ROOT, 'public', 'AI-logo-round.png')

if (!existsSync(BLOG_DIR)) mkdirSync(BLOG_DIR, { recursive: true })

const W = 800
const H = 450

const BLOG_IMAGES = [
  {
    filename: 'hero-blog-index.webp',
    title: 'Blog',
    subtitle: 'VFIT',
    icon: '📚',
    accent: '#22E6A8',
    accentSec: '#3DFCA4',
  },
  {
    filename: 'hero-ia-personal-trainer.webp',
    title: 'IA para',
    titleLine2: 'Trainers',
    subtitle: 'Inteligencia Artificial',
    icon: '🤖',
    accent: '#8B5CF6',
    accentSec: '#A78BFA',
  },
  {
    filename: 'hero-cobranca-automatica.webp',
    title: 'Cobranca',
    titleLine2: 'Automatica',
    subtitle: 'Financeiro · PIX',
    icon: '💰',
    accent: '#10B981',
    accentSec: '#34D399',
  },
  {
    filename: 'hero-retencao-alunos.webp',
    title: 'Retencao',
    titleLine2: 'de Alunos',
    subtitle: 'Engajamento · LTV',
    icon: '🎯',
    accent: '#F59E0B',
    accentSec: '#FBBF24',
  },
]

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateBlogSvg({ title, titleLine2, subtitle, icon, accent, accentSec }) {
  const t1 = escXml(title)
  const t2 = titleLine2 ? escXml(titleLine2) : ''
  const s = escXml(subtitle)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0B1A"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="accentG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accentSec}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="30%" r="40%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  
  <!-- Top line -->
  <rect x="0" y="0" width="${W}" height="3" fill="url(#accentG)"/>
  
  <!-- Icon emoji area -->
  <text x="${W - 120}" y="170" font-size="100" opacity="0.15">${icon}</text>
  
  <!-- Decorative circles -->
  <circle cx="${W - 80}" cy="350" r="60" fill="none" stroke="${accent}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="${W - 80}" cy="350" r="30" fill="none" stroke="${accentSec}" stroke-opacity="0.1" stroke-width="1"/>
  
  <!-- Subtitle badge -->
  <rect x="50" y="130" width="${s.length * 9 + 30}" height="28" rx="14" fill="${accent}" opacity="0.12" stroke="${accent}" stroke-opacity="0.2" stroke-width="1"/>
  <text x="65" y="150" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="13" fill="${accent}" letter-spacing="0.5">${s}</text>
  
  <!-- Title -->
  <text x="50" y="230" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#FAFAFA" letter-spacing="-1.5">${t1}</text>
  ${t2 ? `<text x="50" y="285" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#FAFAFA" letter-spacing="-1.5">${t2}</text>` : ''}
  
  <!-- Domain -->
  <circle cx="55" cy="410" r="3" fill="${accent}"/>
  <text x="68" y="415" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="13" fill="#71717A">iapersonal.app.br</text>
  
  <!-- Bottom line -->
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#accentG)" opacity="0.4"/>
</svg>`
}

async function main() {
  const sharp = (await import('sharp')).default

  // Prepare logo
  const logoBuf = await sharp(LOGO_ROUND)
    .resize(60, 60, { fit: 'cover' })
    .png()
    .toBuffer()

  const circleMask = Buffer.from(
    `<svg width="60" height="60"><circle cx="30" cy="30" r="28" fill="white"/></svg>`
  )
  const logoRound = await sharp(logoBuf)
    .composite([{ input: await sharp(circleMask).resize(60, 60).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer()

  console.log('📸 Gerando Blog Hero Images...\n')

  for (const img of BLOG_IMAGES) {
    const svg = generateBlogSvg(img)
    const outputPath = join(BLOG_DIR, img.filename)

    const base = await sharp(Buffer.from(svg))
      .resize(W, H)
      .png()
      .toBuffer()

    // Composite logo bottom-right area
    await sharp(base)
      .composite([
        { input: logoRound, top: H - 80, left: W - 90 },
      ])
      .webp({ quality: 85 })
      .toFile(outputPath)

    console.log(`  ✅ ${img.filename}`)
  }

  console.log(`\n🎉 ${BLOG_IMAGES.length} blog hero images geradas!`)
}

main().catch(console.error)
