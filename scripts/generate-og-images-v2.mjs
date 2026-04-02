#!/usr/bin/env node
/**
 * generate-og-images-v2.mjs
 * 
 * Gera OG Images (1200×630) com a logo REAL do VFIT.
 * Composita AI-logo-round.png sobre gradient premium.
 * 
 * Uso:
 *   node scripts/generate-og-images-v2.mjs
 * 
 * Output: public/og/*.png
 */

import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OG_DIR = join(ROOT, 'public', 'og')
const LOGO_ROUND = join(ROOT, 'public', 'AI-logo-round.png')

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true })

// ─── OG Pages ──────────────────
const OG_PAGES = [
  {
    filename: 'og-default.png',
    title: 'VFIT',
    subtitle: 'Plataforma #1 para Personal Trainers',
    description: 'Crie treinos com IA, gerencie alunos,',
    descLine2: 'cobrancas e avaliacoes fisicas.',
    accent: '#22E6A8',
    accentSecondary: '#3DFCA4',
  },
  {
    filename: 'og-blog.png',
    title: 'Blog',
    subtitle: 'VFIT',
    description: 'Dicas, estrategias e novidades',
    descLine2: 'para personal trainers.',
    accent: '#3B82F6',
    accentSecondary: '#60A5FA',
  },
  {
    filename: 'og-blog-ia.png',
    title: 'IA para Trainers',
    subtitle: 'Blog · VFIT',
    description: 'Como a inteligencia artificial esta',
    descLine2: 'revolucionando treinos personalizados.',
    accent: '#8B5CF6',
    accentSecondary: '#A78BFA',
  },
  {
    filename: 'og-blog-cobranca.png',
    title: 'Cobranca Auto.',
    subtitle: 'Blog · VFIT',
    description: 'Automatize cobrancas e nunca mais',
    descLine2: 'perca pagamentos de alunos.',
    accent: '#10B981',
    accentSecondary: '#34D399',
  },
  {
    filename: 'og-blog-retencao.png',
    title: 'Retencao',
    subtitle: 'Blog · VFIT',
    description: 'Estrategias comprovadas para manter',
    descLine2: 'seus alunos engajados.',
    accent: '#F59E0B',
    accentSecondary: '#FBBF24',
  },
  {
    filename: 'og-pricing.png',
    title: 'Planos & Precos',
    subtitle: 'VFIT',
    description: 'Teste gratis por 7 dias.',
    descLine2: 'A partir de R$49/mes.',
    accent: '#22E6A8',
    accentSecondary: '#A6FF4D',
  },
  {
    filename: 'og-sobre.png',
    title: 'Sobre Nos',
    subtitle: 'VFIT',
    description: 'A plataforma mais completa',
    descLine2: 'para personal trainers.',
    accent: '#3DFCA4',
    accentSecondary: '#22E6A8',
  },
  {
    filename: 'og-contato.png',
    title: 'Contato',
    subtitle: 'VFIT',
    description: 'Duvidas, parcerias ou suporte.',
    descLine2: 'Fale conosco.',
    accent: '#3B82F6',
    accentSecondary: '#818CF8',
  },
]

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateOGSvg({ title, subtitle, description, descLine2, accent, accentSecondary }) {
  const t = escXml(title)
  const s = escXml(subtitle)
  const d1 = escXml(description)
  const d2 = descLine2 ? escXml(descLine2) : ''
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0B1A"/>
      <stop offset="50%" stop-color="#0F0F14"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="accent-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="50%" stop-color="${accentSecondary}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAFAFA"/>
      <stop offset="100%" stop-color="#D4D4D8"/>
    </linearGradient>
    <radialGradient id="glow1" cx="85%" cy="25%" r="35%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="75%" r="30%">
      <stop offset="0%" stop-color="${accentSecondary}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <!-- Grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  
  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent-line)"/>
  
  <!-- Left accent bar -->
  <rect x="80" y="200" width="4" height="120" rx="2" fill="${accent}" opacity="0.5"/>
  
  <!-- Subtitle badge -->
  <rect x="100" y="195" width="${s.length * 10 + 40}" height="32" rx="16" fill="${accent}" opacity="0.1" stroke="${accent}" stroke-opacity="0.2" stroke-width="1"/>
  <text x="120" y="217" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="600" font-size="14" fill="${accent}" letter-spacing="0.5">
    ${s}
  </text>
  
  <!-- Title -->
  <text x="100" y="310" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="900" font-size="68" fill="url(#title-grad)" letter-spacing="-2">
    ${t}
  </text>
  
  <!-- Description -->
  <text x="100" y="370" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="400" font-size="22" fill="#A1A1AA" letter-spacing="0.2">
    ${d1}
  </text>
  ${d2 ? `<text x="100" y="400" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="400" font-size="22" fill="#A1A1AA" letter-spacing="0.2">${d2}</text>` : ''}
  
  <!-- Domain with dot -->
  <circle cx="100" cy="560" r="4" fill="${accent}"/>
  <text x="115" y="565" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="500" font-size="16" fill="#71717A" letter-spacing="0.5">
    iapersonal.app.br
  </text>
  
  <!-- Bottom accent line -->
  <rect x="0" y="626" width="1200" height="4" fill="url(#accent-line)" opacity="0.5"/>
  
  <!-- Decorative circles -->
  <circle cx="1050" cy="500" r="60" fill="none" stroke="${accent}" stroke-opacity="0.06" stroke-width="1"/>
  <circle cx="1050" cy="500" r="30" fill="none" stroke="${accentSecondary}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="1050" cy="500" r="6" fill="${accent}" opacity="0.3"/>
</svg>`
}

async function main() {
  const sharp = (await import('sharp')).default

  // Pre-process logo — resize to 120px round
  const logoBuf = await sharp(LOGO_ROUND)
    .resize(120, 120, { fit: 'cover' })
    .png()
    .toBuffer()
  
  // Create round-cornered logo (circular mask)
  const circleMask = Buffer.from(
    `<svg width="120" height="120"><circle cx="60" cy="60" r="56" fill="white"/></svg>`
  )
  const logoRound = await sharp(logoBuf)
    .composite([{ input: await sharp(circleMask).resize(120, 120).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer()

  // Create logo with subtle glow behind it
  const logoGlow = Buffer.from(
    `<svg width="160" height="160">
      <defs>
        <filter id="lg"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      <circle cx="80" cy="80" r="50" fill="#22E6A8" opacity="0.15" filter="url(#lg)"/>
    </svg>`
  )
  const logoGlowBuf = await sharp(logoGlow).resize(160, 160).png().toBuffer()

  console.log('🖼️  Gerando OG Images v2 (com logo real)...\n')

  for (const page of OG_PAGES) {
    const svg = generateOGSvg(page)
    const outputPath = join(OG_DIR, page.filename)
    
    // Base from SVG
    const base = await sharp(Buffer.from(svg))
      .resize(1200, 630)
      .png()
      .toBuffer()
    
    // Composite logo onto base
    await sharp(base)
      .composite([
        // Logo glow
        { input: logoGlowBuf, top: 410, left: 970, blend: 'screen' },
        // Logo circle
        { input: logoRound, top: 430, left: 990 },
      ])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath)
    
    console.log(`  ✅ ${page.filename}`)
  }

  console.log(`\n🎉 ${OG_PAGES.length} OG images geradas com logo real!`)
}

main().catch(console.error)
