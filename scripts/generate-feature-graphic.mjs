#!/usr/bin/env node

/**
 * Generate Feature Graphic for Google Play Store
 * Output: twa/store/feature-graphic.png (1024x500)
 * 
 * Uses @napi-rs/canvas for high-quality rendering
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'twa', 'store')

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

const W = 1024
const H = 500

async function generateFeatureGraphic() {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // ── Background gradient (dark premium) ───────
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#09090B')
  bg.addColorStop(0.5, '#0F1419')
  bg.addColorStop(1, '#09090B')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ── Decorative circles (brand green glow) ────
  const glow1 = ctx.createRadialGradient(200, 250, 0, 200, 250, 300)
  glow1.addColorStop(0, 'rgba(34, 197, 94, 0.15)')
  glow1.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  const glow2 = ctx.createRadialGradient(800, 200, 0, 800, 200, 250)
  glow2.addColorStop(0, 'rgba(34, 197, 94, 0.08)')
  glow2.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  // ── Grid pattern (subtle) ────────────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  // ── Try to load logo ─────────────────────────
  try {
    const logoPath = join(ROOT, 'public', 'icons', 'icon-512.png')
    if (existsSync(logoPath)) {
      const logo = await loadImage(logoPath)
      const logoSize = 120
      const logoX = 140
      const logoY = (H - logoSize) / 2 - 20
      
      // Logo glow
      const logoGlow = ctx.createRadialGradient(
        logoX + logoSize / 2, logoY + logoSize / 2, 0,
        logoX + logoSize / 2, logoY + logoSize / 2, logoSize
      )
      logoGlow.addColorStop(0, 'rgba(34, 197, 94, 0.2)')
      logoGlow.addColorStop(1, 'rgba(34, 197, 94, 0)')
      ctx.fillStyle = logoGlow
      ctx.fillRect(logoX - logoSize, logoY - logoSize, logoSize * 3, logoSize * 3)
      
      // Draw logo with rounded corners
      ctx.save()
      ctx.beginPath()
      const r = 24
      ctx.moveTo(logoX + r, logoY)
      ctx.lineTo(logoX + logoSize - r, logoY)
      ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + r)
      ctx.lineTo(logoX + logoSize, logoY + logoSize - r)
      ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - r, logoY + logoSize)
      ctx.lineTo(logoX + r, logoY + logoSize)
      ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - r)
      ctx.lineTo(logoX, logoY + r)
      ctx.quadraticCurveTo(logoX, logoY, logoX + r, logoY)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()
    }
  } catch {
    console.log('Logo not found, continuing without it')
  }

  // ── App Name ─────────────────────────────────
  const textX = 300
  
  // "VFIT" main title
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('VFIT', textX, 180)

  // Tagline
  const tagGrad = ctx.createLinearGradient(textX, 0, textX + 500, 0)
  tagGrad.addColorStop(0, '#22C55E')
  tagGrad.addColorStop(1, '#16A34A')
  ctx.fillStyle = tagGrad
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  ctx.fillText('Gestão inteligente para Personal Trainers', textX, 250)

  // Features row
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '18px system-ui, -apple-system, sans-serif'
  const features = ['📊 Dashboard', '💪 Treinos', '📋 Avaliações', '💰 Pagamentos']
  let featureX = textX
  for (const feat of features) {
    ctx.fillText(feat, featureX, 320)
    featureX += ctx.measureText(feat).width + 30
  }

  // ── Pill badges ──────────────────────────────
  const pills = [
    { text: 'PWA', x: textX, y: 370 },
    { text: 'PIX', x: textX + 80, y: 370 },
    { text: 'Chat', x: textX + 150, y: 370 },
    { text: 'IA', x: textX + 225, y: 370 },
  ]

  for (const pill of pills) {
    // Pill background
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'
    const tw = ctx.measureText(pill.text).width + 24
    const th = 30
    const px = pill.x
    const py = pill.y
    ctx.beginPath()
    ctx.roundRect(px, py, tw, th, 15)
    ctx.fill()

    // Pill border
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Pill text
    ctx.fillStyle = '#22C55E'
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
    ctx.fillText(pill.text, px + 12, py + 20)
  }

  // ── Bottom accent line ───────────────────────
  const accent = ctx.createLinearGradient(0, H - 3, W, H - 3)
  accent.addColorStop(0, 'rgba(34, 197, 94, 0)')
  accent.addColorStop(0.3, 'rgba(34, 197, 94, 0.6)')
  accent.addColorStop(0.7, 'rgba(34, 197, 94, 0.6)')
  accent.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = accent
  ctx.fillRect(0, H - 3, W, 3)

  // ── Save ─────────────────────────────────────
  const buffer = canvas.toBuffer('image/png')
  const outputPath = join(OUTPUT_DIR, 'feature-graphic.png')
  writeFileSync(outputPath, buffer)
  console.log(`✅ Feature graphic generated: ${outputPath} (${buffer.length} bytes)`)
}

generateFeatureGraphic().catch(console.error)
