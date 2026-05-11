/**
 * fix-icons-final.mjs
 *
 * Corrige de vez:
 * 1. ic_maskable.png — fundo verde sólido FULL BLEED (sem cantos arredondados)
 *    Ícone do favicon centralizado na safe-zone (80% do canvas)
 * 2. shortcut_0/1/2.png — fundo verde com cantos arredondados + ícone branco semântico
 *
 * Densidades Android:
 *   mdpi=48  hdpi=72  xhdpi=96  xxhdpi=144  xxxhdpi=192
 */

import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RES = path.join(ROOT, 'twa/app/src/main/res')
const FAVICON_SVG = path.join(ROOT, 'public/favicons/favicon.svg')

const DENSITIES = [
  { name: 'mdpi',    size: 48  },
  { name: 'hdpi',    size: 72  },
  { name: 'xhdpi',   size: 96  },
  { name: 'xxhdpi',  size: 144 },
  { name: 'xxxhdpi', size: 192 },
]

// Verde da marca
const GREEN = '#3AB54A'
const DARK  = '#050A12'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Gera um PNG com fundo verde FULL BLEED + ícone SVG no centro (safe zone 80%) */
async function makeFullBleedGreen(svgContent, size) {
  const iconSize = Math.round(size * 0.62)  // safe zone 80%, ícone ocupa 62% para respirar
  const offset   = Math.round((size - iconSize) / 2)

  // Rasteriza o SVG interno na escala certa
  const iconPng = await sharp(Buffer.from(svgContent))
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Cria fundo FULL BLEED verde (sem arredondamento — Android aplica o shape)
  const bg = await sharp({
    create: { width: size, height: size, channels: 4, background: GREEN }
  })
    .composite([{ input: iconPng, left: offset, top: offset }])
    .png()
    .toBuffer()

  return bg
}

/** Gera um PNG com fundo verde arredondado + ícone branco SVG no centro */
async function makeRoundedGreen(iconSvg, size, radiusFraction = 0.22) {
  const r = Math.round(size * radiusFraction)

  // Máscara de cantos arredondados
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/>
  </svg>`

  const iconSize = Math.round(size * 0.56)
  const offset   = Math.round((size - iconSize) / 2)

  const iconPng = await sharp(Buffer.from(iconSvg))
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const maskPng = await sharp(Buffer.from(mask)).png().toBuffer()

  // Fundo verde + ícone branco + máscara arredondada
  const result = await sharp({
    create: { width: size, height: size, channels: 4, background: GREEN }
  })
    .composite([
      { input: iconPng, left: offset, top: offset },
      { input: maskPng, blend: 'dest-in' },   // aplica cantos arredondados
    ])
    .png()
    .toBuffer()

  return result
}

// ─────────────────────────────────────────────
// ÍCONES SEMÂNTICOS (brancos)
// ─────────────────────────────────────────────

function svgDashboard(s) {
  // Grade 2×2 — Dashboard
  const p = Math.round(s * 0.14)
  const g = Math.round(s * 0.07)
  const cell = Math.round((s - 2 * p - g) / 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect x="${p}" y="${p}" width="${cell}" height="${cell}" rx="${Math.round(cell*0.18)}" fill="white"/>
    <rect x="${p + cell + g}" y="${p}" width="${cell}" height="${cell}" rx="${Math.round(cell*0.18)}" fill="white"/>
    <rect x="${p}" y="${p + cell + g}" width="${cell}" height="${cell}" rx="${Math.round(cell*0.18)}" fill="white"/>
    <rect x="${p + cell + g}" y="${p + cell + g}" width="${cell}" height="${cell}" rx="${Math.round(cell*0.18)}" fill="white"/>
  </svg>`
}

function svgAlunos(s) {
  // 3 pessoas — Alunos
  const cx = s / 2
  const cy = s / 2
  // pessoa central
  const hr = s * 0.12  // head radius
  const bw = s * 0.18  // body width
  const bh = s * 0.22  // body height
  const br = s * 0.09  // body corner
  // offset laterais
  const dx = s * 0.28
  const shr = hr * 0.78
  const sbw = bw * 0.70
  const sbh = bh * 0.72

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <!-- pessoa esquerda -->
    <circle cx="${cx - dx}" cy="${cy - s*0.14}" r="${shr}" fill="white" opacity="0.80"/>
    <rect x="${cx - dx - sbw/2}" y="${cy - s*0.01}" width="${sbw}" height="${sbh}" rx="${br*0.7}" fill="white" opacity="0.80"/>
    <!-- pessoa direita -->
    <circle cx="${cx + dx}" cy="${cy - s*0.14}" r="${shr}" fill="white" opacity="0.80"/>
    <rect x="${cx + dx - sbw/2}" y="${cy - s*0.01}" width="${sbw}" height="${sbh}" rx="${br*0.7}" fill="white" opacity="0.80"/>
    <!-- pessoa central (frente) -->
    <circle cx="${cx}" cy="${cy - s*0.16}" r="${hr}" fill="white"/>
    <rect x="${cx - bw/2}" y="${cy - s*0.01}" width="${bw}" height="${bh}" rx="${br}" fill="white"/>
  </svg>`
}

function svgTreinos(s) {
  // Haltere/dumbbell estilizado — Treinos
  const cx = s / 2
  const cy = s / 2
  const barLen = s * 0.46  // metade do comprimento total da barra
  const barH   = s * 0.09
  const plateW = s * 0.14
  const plateH = s * 0.38
  const plateR = s * 0.05

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <!-- barra central -->
    <rect x="${cx - barLen}" y="${cy - barH/2}" width="${barLen*2}" height="${barH}" rx="${barH/2}" fill="white"/>
    <!-- placa esquerda externa -->
    <rect x="${cx - barLen - plateW}" y="${cy - plateH/2}" width="${plateW}" height="${plateH}" rx="${plateR}" fill="white"/>
    <!-- placa direita externa -->
    <rect x="${cx + barLen}" y="${cy - plateH/2}" width="${plateW}" height="${plateH}" rx="${plateR}" fill="white"/>
    <!-- placa esquerda interna -->
    <rect x="${cx - barLen*0.55 - plateW*0.7}" y="${cy - plateH*0.68/2}" width="${plateW*0.7}" height="${plateH*0.68}" rx="${plateR*0.7}" fill="white"/>
    <!-- placa direita interna -->
    <rect x="${cx + barLen*0.55}" y="${cy - plateH*0.68/2}" width="${plateW*0.7}" height="${plateH*0.68}" rx="${plateR*0.7}" fill="white"/>
  </svg>`
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  const faviconSvg = await fs.readFile(FAVICON_SVG, 'utf-8')

  let count = 0

  for (const { name, size } of DENSITIES) {
    // ── 1. ic_maskable — FULL BLEED verde (sem arredondamento) ──
    const mipmapDir = path.join(RES, `mipmap-${name}`)
    const maskablePath = path.join(mipmapDir, 'ic_maskable.png')

    const maskablePng = await makeFullBleedGreen(faviconSvg, size)
    await fs.writeFile(maskablePath, maskablePng)
    console.log(`✅ ic_maskable   [${name}] ${size}×${size}`)
    count++

    // ── 2. Shortcuts — verde arredondado + ícone semântico branco ──
    const drawableDir = path.join(RES, `drawable-${name}`)

    const shortcuts = [
      { file: 'shortcut_0.png', label: 'Dashboard', svg: svgDashboard(size) },
      { file: 'shortcut_1.png', label: 'Alunos',    svg: svgAlunos(size)    },
      { file: 'shortcut_2.png', label: 'Treinos',   svg: svgTreinos(size)   },
    ]

    for (const sc of shortcuts) {
      const outPath = path.join(drawableDir, sc.file)
      const png = await makeRoundedGreen(sc.svg, size)
      await fs.writeFile(outPath, png)
      console.log(`✅ ${sc.file}  [${name}] ${size}×${size}  (${sc.label})`)
      count++
    }
  }

  console.log(`\n🎉 ${count} ícones gerados com sucesso!`)
  console.log(`\nResumo:`)
  console.log(`  • ic_maskable (5 densidades): fundo verde full-bleed, favicon centralizado na safe-zone 62%`)
  console.log(`  • shortcut_0  (5 densidades): verde arredondado + grade 2×2 branca (Dashboard)`)
  console.log(`  • shortcut_1  (5 densidades): verde arredondado + 3 pessoas brancas (Alunos)`)
  console.log(`  • shortcut_2  (5 densidades): verde arredondado + haltere branco (Treinos)`)
}

main().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
