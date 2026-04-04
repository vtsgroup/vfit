#!/usr/bin/env node
/**
 * generate-og-images.mjs
 * 
 * Gera OG Images (1200×630) para todas as páginas do VFIT.
 * Usa sharp + SVG template rendering.
 * 
 * Dependências:
 *   npm install --save-dev sharp
 * 
 * Uso:
 *   node scripts/generate-og-images.mjs
 * 
 * Output: public/og/*.png
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OG_DIR = join(ROOT, 'public', 'og')

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true })

// ─── OG Image Templates ──────────────────
const OG_PAGES = [
  {
    filename: 'og-default.png',
    title: 'VFIT',
    subtitle: 'Plataforma #1 para Personal Trainers',
    description: 'Crie treinos com IA, gerencie alunos, cobrancas e avaliacoes fisicas.',
    accent: '#22E6A8',
  },
  {
    filename: 'og-blog.png',
    title: 'Blog',
    subtitle: 'VFIT',
    description: 'Dicas, estrategias e novidades para personal trainers.',
    accent: '#3B82F6',
  },
  {
    filename: 'og-blog-ia.png',
    title: 'IA para Personal Trainers',
    subtitle: 'Blog · VFIT',
    description: 'Como a inteligencia artificial esta revolucionando treinos personalizados.',
    accent: '#8B5CF6',
  },
  {
    filename: 'og-blog-cobranca.png',
    title: 'Cobranca Automatica',
    subtitle: 'Blog · VFIT',
    description: 'Automatize cobrancas e nunca mais perca pagamentos de alunos.',
    accent: '#10B981',
  },
  {
    filename: 'og-blog-retencao.png',
    title: 'Retencao de Alunos',
    subtitle: 'Blog · VFIT',
    description: 'Estrategias comprovadas para manter seus alunos engajados.',
    accent: '#F59E0B',
  },
  {
    filename: 'og-pricing.png',
    title: 'Planos e Preços',
    subtitle: 'VFIT',
    description: 'Teste gratis por 7 dias. A partir de R$49/mes.',
    accent: '#22E6A8',
  },
  {
    filename: 'og-sobre.png',
    title: 'Sobre Nós',
    subtitle: 'VFIT',
    description: 'Conheca a equipe por tras da plataforma mais completa para personal trainers.',
    accent: '#3DFCA4',
  },
  {
    filename: 'og-contato.png',
    title: 'Fale Conosco',
    subtitle: 'VFIT',
    description: 'Entre em contato para duvidas, parcerias ou suporte.',
    accent: '#3B82F6',
  },
]

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateOGSvg({ title, subtitle, description, accent }) {
  const t = escXml(title)
  const s = escXml(subtitle)
  const d = escXml(description)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F0F12"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="40" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Grid pattern -->
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>
  
  <!-- Glow accent -->
  <ellipse cx="900" cy="100" rx="400" ry="300" fill="${accent}" opacity="0.06" filter="url(#glow)"/>
  
  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent-grad)"/>
  
  <!-- Logo mark -->
  <rect x="80" y="80" width="56" height="56" rx="14" fill="${accent}" opacity="0.15"/>
  <text x="92" y="120" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="${accent}">P</text>
  
  <!-- Subtitle -->
  <text x="152" y="116" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="18" fill="${accent}" opacity="0.8">
    ${s}
  </text>
  
  <!-- Title -->
  <text x="80" y="280" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="72" fill="#FAFAFA" letter-spacing="-2">
    ${t}
  </text>
  
  <!-- Description -->
  <text x="80" y="340" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#A1A1AA">
    ${d}
  </text>
  
  <!-- Domain -->
  <text x="80" y="570" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="18" fill="#71717A">
    vfit.app.br
  </text>
  
  <!-- Accent dot -->
  <circle cx="1100" cy="540" r="30" fill="${accent}" opacity="0.2"/>
  <circle cx="1100" cy="540" r="12" fill="${accent}" opacity="0.5"/>
</svg>`
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    // Fallback: save as SVG for manual conversion
    console.warn('⚠️  sharp não instalado — salvando como SVG')
    console.warn('   Para PNG: npm install --save-dev sharp')
    
    for (const page of OG_PAGES) {
      const svg = generateOGSvg(page)
      const svgPath = join(OG_DIR, page.filename.replace('.png', '.svg'))
      writeFileSync(svgPath, svg)
      console.log(`  ✅ SVG → ${svgPath.replace(ROOT, '.')}`)
    }
    return
  }

  console.log('🖼️  Gerando OG Images...\n')

  for (const page of OG_PAGES) {
    const svg = generateOGSvg(page)
    const outputPath = join(OG_DIR, page.filename)
    
    await sharp(Buffer.from(svg))
      .resize(1200, 630)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath)
    
    console.log(`  ✅ ${page.filename} → ${outputPath.replace(ROOT, '.')}`)
  }

  console.log(`\n🎉 ${OG_PAGES.length} OG images geradas!`)
  console.log('\n💡 Próximos passos:')
  console.log('   1. Atualize metadata em cada page.tsx com os novos OG paths')
  console.log('   2. Teste com: https://opengraph.xyz/')
}

main().catch(console.error)
