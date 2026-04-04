/**
 * lib/assessment-pdf.ts
 *
 * Assessment PDF — Ultra-Professional Generator
 *
 * Exports: AssessmentPdfRow
 * Hooks: useBold, useFont
 * Features: Zustand · DB: Neon
 */

// ============================================
// Assessment PDF — Ultra-Professional Generator
// VFIT — v3.0
//
// Cloudflare Workers compatible (no headless Chrome).
// Uses pdf-lib for high-quality, multi-page PDF output.
// ============================================

import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from 'pdf-lib'
import qrcode from 'qrcode-generator'
import { pgQueryOne, pgQuery } from '@lib/db'
import { NotFoundError } from '@lib/errors'
import type { Bindings } from '@workers/types'

// ============================================
// Types
// ============================================

export interface AssessmentPdfRow {
  id: string
  student_id: string | null
  personal_id: string
  assessment_date: string
  student_name: string | null
  personal_name: string | null

  // Personal trainer info
  personal_photo: string | null
  personal_cref: string | null
  personal_cref_state: string | null
  personal_cref_verified: boolean
  personal_bio: string | null

  // Key metrics
  weight_kg: number | null
  height_cm: number | null
  bmi: number | null
  bmi_classification: string | null
  body_fat_percentage: number | null
  fat_classification: string | null
  waist_hip_ratio: number | null
  waist_hip_classification: string | null
  waist_risk: string | null

  // Composition
  body_density: number | null
  fat_mass_kg: number | null
  lean_mass_kg: number | null
  lean_mass_percentage: number | null
  muscle_mass_kg: number | null
  muscle_mass_percentage: number | null
  bone_mass_kg: number | null
  residual_mass_kg: number | null

  // Metabolism
  basal_metabolic_rate: number | null
  total_daily_expenditure: number | null
  ideal_weight_kg: number | null
  weight_to_lose_kg: number | null

  // Extras
  somatotype: string | null
  water_percentage: number | null
  visceral_fat_level: number | null
  metabolic_age: number | null

  // FFMI (from body_composition JSON or computed)
  ffmi_normalized: number | null
  ffmi_classification: string | null

  // Protocol
  protocol: string | null
  protocol_version: string | null
  density_formula: string | null
  sum_of_skinfolds: number | null

  // JSONB fields
  skinfolds: unknown
  measurements: unknown
  body_composition: unknown
  photos: unknown
  ai_analysis: unknown
  ai_interpretation: string | null

  // PDF status
  pdf_generated: boolean
  pdf_url: string | null
  pdf_generated_at: string | null
}

// ============================================
// Color Palette — Dark Premium Theme
// ============================================

const C = {
  bg:            rgb(0.03, 0.04, 0.07),
  bgDarker:      rgb(0.02, 0.03, 0.05),
  bgCard:        rgb(0.06, 0.08, 0.12),
  bgCardAlt:     rgb(0.08, 0.10, 0.15),
  green:         rgb(0.13, 0.77, 0.37),
  greenDark:     rgb(0.08, 0.50, 0.24),
  greenLight:    rgb(0.20, 0.90, 0.50),
  blue:          rgb(0.24, 0.52, 1.0),
  blueLight:     rgb(0.40, 0.65, 1.0),
  orange:        rgb(1.0, 0.55, 0.2),
  red:           rgb(0.90, 0.30, 0.30),
  yellow:        rgb(0.95, 0.75, 0.15),
  purple:        rgb(0.60, 0.35, 0.90),
  white:         rgb(0.95, 0.95, 0.97),
  textPrimary:   rgb(0.92, 0.93, 0.95),
  textSecondary: rgb(0.65, 0.67, 0.72),
  textMuted:     rgb(0.45, 0.47, 0.52),
  border:        rgb(0.15, 0.17, 0.22),
  borderLight:   rgb(0.20, 0.22, 0.28),
  barBg:         rgb(0.10, 0.12, 0.18),
} as const

// ============================================
// Constants
// ============================================

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 40
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_H = 55

const SKINFOLD_LABELS: Record<string, string> = {
  triceps: 'Tríceps',
  chest: 'Peitoral',
  pectoral: 'Peitoral',
  axillary: 'Axilar Média',
  subscapular: 'Subescapular',
  suprailiac: 'Supra-ilíaca',
  abdominal: 'Abdominal',
  thigh: 'Coxa',
  biceps: 'Bíceps',
  calf: 'Panturrilha',
}

const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Peitoral',
  waist: 'Cintura',
  hips: 'Quadril',
  right_arm: 'Braço D.',
  left_arm: 'Braço E.',
  right_thigh: 'Coxa D.',
  left_thigh: 'Coxa E.',
  right_calf: 'Panturrilha D.',
  left_calf: 'Panturrilha E.',
  right_forearm: 'Antebraço D.',
  left_forearm: 'Antebraço E.',
  shoulders: 'Ombros',
  neck: 'Pescoço',
  abdomen: 'Abdômen',
}

const PROTOCOL_NAMES: Record<string, string> = {
  pollock_7: 'Pollock 7 Dobras (Jackson & Pollock)',
  pollock_3_male: 'Pollock 3 Dobras — Masculino',
  pollock_3_female: 'Pollock 3 Dobras — Feminino',
  guedes: 'Guedes 3 Dobras',
  faulkner: 'Faulkner 4 Dobras',
  petroski: 'Petroski 4 Dobras',
  durnin_womersley: 'Durnin & Womersley 4 Dobras',
  bioimpedance: 'Bioimpedância',
}

// ============================================
// Helpers
// ============================================

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function safeText(v: unknown, fallback = '—'): string {
  if (v == null) return fallback
  const s = String(v).trim()
  return s || fallback
}

function fmtKg(v: number | null): string {
  return v != null ? `${v.toFixed(1)} kg` : '—'
}

function fmtPct(v: number | null): string {
  return v != null ? `${v.toFixed(1)}%` : '—'
}

function fmtNum(v: number | null, digits = 1): string {
  return v != null ? v.toFixed(digits) : '—'
}

function fmtKcal(v: number | null): string {
  return v != null ? `${Math.round(v)} kcal/dia` : '—'
}

function parseJsonField<T>(val: unknown): T | null {
  try {
    if (val == null) return null
    if (typeof val === 'object') return val as T
    if (typeof val === 'string') return JSON.parse(val) as T
    return null
  } catch {
    return null
  }
}

function pickPhotoUrls(photos: unknown): Array<{ url: string; type: string }> {
  try {
    const parsed = typeof photos === 'string' ? JSON.parse(photos) : photos
    if (!Array.isArray(parsed)) return []

    const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object'
    const results = parsed
      .filter(isObj)
      .filter((p) => typeof p.url === 'string' && (p.url as string).startsWith('http'))
      .map((p) => ({
        url: p.url as string,
        type: typeof p.type === 'string' ? p.type : 'custom',
      }))

    // Sort: front -> side -> back -> custom
    const prio = (t: string) => (t === 'front' ? 0 : t.startsWith('side') ? 1 : t === 'back' ? 2 : 3)
    results.sort((a, b) => prio(a.type) - prio(b.type))

    return results.slice(0, 3)
  } catch {
    return []
  }
}

const PHOTO_TYPE_LABELS: Record<string, string> = {
  front: 'FRENTE',
  side_left: 'LATERAL',
  side_right: 'LATERAL',
  back: 'COSTAS',
  custom: 'FOTO',
}

function formatDateBR(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function classificationColor(classification: string): RGB {
  const lower = classification.toLowerCase()
  if (lower.includes('normal') || lower.includes('bom') || lower.includes('fitness') || lower.includes('atleta')) return C.green
  if (lower.includes('sobrepeso') || lower.includes('média') || lower.includes('aceitável') || lower.includes('elevado')) return C.yellow
  if (lower.includes('obesidade') || lower.includes('alto') || lower.includes('muito')) return C.red
  if (lower.includes('abaixo')) return C.blue
  return C.textSecondary
}

// ============================================
// PDF Builder Context
// ============================================

interface PdfCtx {
  doc: PDFDocument
  page: PDFPage
  y: number
  font: PDFFont
  fontBold: PDFFont
  pageNum: number
  row: AssessmentPdfRow
}

function newPage(ctx: PdfCtx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H])
  ctx.y = PAGE_H - MARGIN - 8
  ctx.pageNum++
  drawPageBg(ctx)
  drawPageHeaderBar(ctx)
}

function ensureSpace(ctx: PdfCtx, needed: number): void {
  if (ctx.y - needed < FOOTER_H + MARGIN) {
    drawPageFooter(ctx)
    newPage(ctx)
  }
}

// ============================================
// Page Background & Decorations
// ============================================

function drawPageBg(ctx: PdfCtx): void {
  const { page } = ctx
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.bg })
  // Subtle darker area at bottom
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 120, color: C.bgDarker, opacity: 0.5 })
  // Green accent line at very top
  page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: C.green })
  // Subtle side accent
  page.drawRectangle({ x: 0, y: 0, width: 2, height: PAGE_H, color: C.green, opacity: 0.15 })
}

function drawPageHeaderBar(ctx: PdfCtx): void {
  const { page, fontBold, font } = ctx
  const barY = PAGE_H - 28

  page.drawText('VFIT', {
    x: PAGE_W - MARGIN - 85, y: barY,
    size: 10, font: fontBold, color: C.green,
  })
  page.drawText('vfit.app.br', {
    x: PAGE_W - MARGIN - 85, y: barY - 11,
    size: 6, font, color: C.textMuted,
  })
}

function drawPageFooter(ctx: PdfCtx): void {
  const { page, font, fontBold, pageNum } = ctx
  const footerY = 28

  page.drawLine({
    start: { x: MARGIN, y: footerY + 18 },
    end: { x: PAGE_W - MARGIN, y: footerY + 18 },
    thickness: 0.5, color: C.border,
  })

  page.drawText('Gerado por VFIT — vfit.app.br', {
    x: MARGIN, y: footerY + 4,
    size: 7, font: fontBold, color: C.green, opacity: 0.8,
  })

  page.drawText('Este documento é informativo e não substitui avaliação médica.', {
    x: MARGIN, y: footerY - 7,
    size: 5.5, font, color: C.textMuted,
  })

  const pageText = `${pageNum}`
  const pageW = font.widthOfTextAtSize(pageText, 8)
  page.drawText(pageText, {
    x: PAGE_W - MARGIN - pageW, y: footerY + 4,
    size: 8, font: fontBold, color: C.textSecondary,
  })
}

// ============================================
// Drawing Primitives
// ============================================

function drawSectionTitle(ctx: PdfCtx, title: string): void {
  const { page, fontBold } = ctx
  page.drawRectangle({ x: MARGIN, y: ctx.y - 1, width: 3, height: 14, color: C.green })
  page.drawText(title, { x: MARGIN + 10, y: ctx.y, size: 11, font: fontBold, color: C.green })
  ctx.y -= 22
}

function drawSubsectionTitle(ctx: PdfCtx, title: string): void {
  ctx.page.drawText(title, { x: MARGIN + 4, y: ctx.y, size: 9, font: ctx.fontBold, color: C.textPrimary })
  ctx.y -= 14
}

function drawDataRow(
  ctx: PdfCtx,
  label: string,
  value: string,
  opts?: { labelWidth?: number; x?: number; valueColor?: RGB; valueFont?: PDFFont }
): void {
  const x = opts?.x ?? MARGIN + 8
  const labelW = opts?.labelWidth ?? 130
  ctx.page.drawText(label, { x, y: ctx.y, size: 8.5, font: ctx.font, color: C.textSecondary })
  ctx.page.drawText(value, {
    x: x + labelW, y: ctx.y,
    size: 8.5, font: opts?.valueFont ?? ctx.fontBold, color: opts?.valueColor ?? C.textPrimary,
  })
}

function drawProgressBar(
  ctx: PdfCtx, x: number, y: number, width: number, pct: number, color: RGB, height = 6,
): void {
  const clamped = Math.max(0, Math.min(100, pct))
  ctx.page.drawRectangle({ x, y, width, height, color: C.barBg })
  if (clamped > 0) {
    ctx.page.drawRectangle({ x, y, width: (width * clamped) / 100, height, color })
  }
}

function drawCard(
  ctx: PdfCtx, x: number, y: number, w: number, h: number,
  opts?: { accentColor?: RGB }
): void {
  ctx.page.drawRectangle({
    x, y: y - h, width: w, height: h,
    color: C.bgCard, borderColor: C.border, borderWidth: 0.5,
  })
  if (opts?.accentColor) {
    ctx.page.drawRectangle({ x, y, width: w, height: 2, color: opts.accentColor })
  }
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawWrappedText(
  ctx: PdfCtx, text: string,
  opts?: { fontSize?: number; color?: RGB; maxWidth?: number; lineSpacing?: number; x?: number; useBold?: boolean }
): void {
  const fontSize = opts?.fontSize ?? 8.5
  const color = opts?.color ?? C.textSecondary
  const maxW = opts?.maxWidth ?? CONTENT_W - 16
  const spacing = opts?.lineSpacing ?? 12
  const x = opts?.x ?? MARGIN + 8
  const useFont = opts?.useBold ? ctx.fontBold : ctx.font

  const lines = wrapText(text, useFont, fontSize, maxW)
  for (const line of lines) {
    if (ctx.y < FOOTER_H + MARGIN + 10) {
      drawPageFooter(ctx)
      newPage(ctx)
    }
    ctx.page.drawText(line, { x, y: ctx.y, size: fontSize, font: useFont, color })
    ctx.y -= spacing
  }
}

function drawDivider(ctx: PdfCtx, spacing = 14): void {
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.5, color: C.border,
  })
  ctx.y -= spacing
}

// ============================================
// QR Code
// ============================================

function drawQr(page: PDFPage, text: string, x: number, y: number, size: number): void {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const count = qr.getModuleCount()
  const cell = size / count

  page.drawRectangle({ x, y, width: size, height: size, color: C.bgCard, borderColor: C.border, borderWidth: 0.5 })
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        page.drawRectangle({
          x: x + col * cell,
          y: y + (count - 1 - row) * cell,
          width: cell, height: cell,
          color: C.white,
        })
      }
    }
  }
}

// ============================================
// Image Embedding
// ============================================

async function embedRemoteImage(pdfDoc: PDFDocument, url: string) {
  const resp = await fetch(url, { headers: { 'User-Agent': 'VFIT-PDF/3.0' } })
  if (!resp.ok) throw new Error(`Image fetch failed: ${resp.status}`)
  const contentType = resp.headers.get('content-type') || ''
  const bytes = new Uint8Array(await resp.arrayBuffer())

  if (contentType.includes('png') || url.toLowerCase().endsWith('.png')) {
    return pdfDoc.embedPng(bytes)
  }
  return pdfDoc.embedJpg(bytes)
}

// ============================================
// PAGE 1: Cover + Key Metrics
// ============================================

async function drawCoverPage(ctx: PdfCtx): Promise<void> {
  const { page, font, fontBold, row } = ctx

  // ── Decorative header area ──
  page.drawRectangle({ x: 0, y: PAGE_H - 140, width: PAGE_W, height: 140, color: rgb(0.04, 0.06, 0.10) })
  page.drawRectangle({ x: 0, y: PAGE_H - 3, width: PAGE_W, height: 3, color: C.green })
  page.drawRectangle({ x: 0, y: PAGE_H - 140, width: PAGE_W, height: 1, color: C.border })
  // Geometric accent
  page.drawRectangle({ x: PAGE_W - 200, y: PAGE_H - 130, width: 200, height: 130, color: C.green, opacity: 0.04 })

  // ── BRAND ──
  page.drawText('VFIT', {
    x: MARGIN, y: PAGE_H - 35, size: 14, font: fontBold, color: C.green,
  })
  page.drawText('Avaliação Física Profissional', {
    x: MARGIN, y: PAGE_H - 50, size: 8, font, color: C.textSecondary,
  })

  // ── TITLE ──
  page.drawText('AVALIAÇÃO', {
    x: MARGIN, y: PAGE_H - 82, size: 28, font: fontBold, color: C.white,
  })
  page.drawText('FÍSICA', {
    x: MARGIN + fontBold.widthOfTextAtSize('AVALIAÇÃO ', 28),
    y: PAGE_H - 82, size: 28, font: fontBold, color: C.green,
  })

  // ── DATE ──
  page.drawText(formatDateBR(row.assessment_date), {
    x: MARGIN, y: PAGE_H - 100, size: 9, font, color: C.textSecondary,
  })

  // Protocol badge
  if (row.protocol) {
    const protocolName = PROTOCOL_NAMES[row.protocol] || row.protocol
    const badgeText = `Protocolo: ${protocolName}`
    const badgeW = font.widthOfTextAtSize(badgeText, 7) + 16
    const badgeX = PAGE_W - MARGIN - badgeW
    page.drawRectangle({
      x: badgeX, y: PAGE_H - 104, width: badgeW, height: 16,
      color: C.green, opacity: 0.12, borderColor: C.green, borderWidth: 0.5,
    })
    page.drawText(badgeText, {
      x: badgeX + 8, y: PAGE_H - 99, size: 7, font, color: C.green,
    })
  }

  ctx.y = PAGE_H - 160

  // ── PROFESSIONAL INFO ──
  drawSectionTitle(ctx, 'PROFISSIONAL RESPONSÁVEL')

  let photoOffset = 0
  if (row.personal_photo) {
    try {
      const img = await embedRemoteImage(ctx.doc, row.personal_photo)
      const imgSize = 56
      const scale = Math.min(imgSize / img.width, imgSize / img.height)
      const w = img.width * scale
      const h = img.height * scale

      page.drawRectangle({
        x: MARGIN + 8, y: ctx.y - imgSize + 4, width: imgSize, height: imgSize,
        color: C.bgCard, borderColor: C.green, borderWidth: 1.5,
      })
      page.drawImage(img, {
        x: MARGIN + 8 + (imgSize - w) / 2,
        y: ctx.y - imgSize + 4 + (imgSize - h) / 2,
        width: w, height: h,
      })
      photoOffset = imgSize + 14
    } catch {
      // best-effort
    }
  }

  const infoX = MARGIN + 8 + photoOffset
  page.drawText(safeText(row.personal_name, 'Personal Trainer'), {
    x: infoX, y: ctx.y, size: 13, font: fontBold, color: C.textPrimary,
  })
  ctx.y -= 15

  if (row.personal_cref) {
    const crefText = `CREF ${row.personal_cref}/${row.personal_cref_state || ''}`
    page.drawText(crefText, { x: infoX, y: ctx.y, size: 9, font, color: C.green })
    if (row.personal_cref_verified) {
      const crefW = font.widthOfTextAtSize(crefText, 9)
      page.drawText(' ✓ Verificado', { x: infoX + crefW, y: ctx.y, size: 8, font: fontBold, color: C.greenLight })
    }
    ctx.y -= 13
  }

  page.drawText('Educador Físico', { x: infoX, y: ctx.y, size: 8, font, color: C.textMuted })
  ctx.y -= (photoOffset > 0 ? 30 : 18)

  // ── STUDENT INFO ──
  drawDivider(ctx, 10)
  drawSectionTitle(ctx, 'ALUNO AVALIADO')

  page.drawText(safeText(row.student_name, 'Aluno'), {
    x: MARGIN + 10, y: ctx.y, size: 15, font: fontBold, color: C.textPrimary,
  })
  ctx.y -= 18

  const basicInfo: string[] = []
  if (row.weight_kg != null) basicInfo.push(`${toNum(row.weight_kg)?.toFixed(1)} kg`)
  if (row.height_cm != null) basicInfo.push(`${toNum(row.height_cm)?.toFixed(0)} cm`)
  if (basicInfo.length > 0) {
    page.drawText(basicInfo.join('  •  '), {
      x: MARGIN + 10, y: ctx.y, size: 9, font, color: C.textSecondary,
    })
    ctx.y -= 24
  }

  // ── 4 HERO METRIC CARDS ──
  const cardW = (CONTENT_W - 18) / 4
  const cardH = 72

  type MetricDef = { label: string; value: string; caption: string; accent: RGB }
  const metrics: MetricDef[] = [
    {
      label: 'PESO',
      value: row.weight_kg != null ? `${toNum(row.weight_kg)?.toFixed(1)}` : '—',
      caption: row.height_cm ? `Altura: ${toNum(row.height_cm)?.toFixed(0)} cm` : '',
      accent: C.blue,
    },
    {
      label: 'IMC',
      value: row.bmi != null ? fmtNum(toNum(row.bmi)) : '—',
      caption: safeText(row.bmi_classification),
      accent: C.yellow,
    },
    {
      label: '% GORDURA',
      value: row.body_fat_percentage != null ? fmtNum(toNum(row.body_fat_percentage)) : '—',
      caption: safeText(row.fat_classification),
      accent: C.orange,
    },
    {
      label: 'FFMI',
      value: row.ffmi_normalized != null ? fmtNum(toNum(row.ffmi_normalized)) : (row.lean_mass_kg != null && row.height_cm != null ? fmtNum(toNum(row.lean_mass_kg)! / Math.pow(toNum(row.height_cm)! / 100, 2)) : '—'),
      caption: row.ffmi_classification ?? (row.lean_mass_percentage != null ? `Magra: ${toNum(row.lean_mass_percentage)?.toFixed(1)}%` : ''),
      accent: C.green,
    },
  ]

  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i]
    const cx = MARGIN + i * (cardW + 6)

    drawCard(ctx, cx, ctx.y, cardW, cardH, { accentColor: m.accent })

    page.drawText(m.label, {
      x: cx + 8, y: ctx.y - 18, size: 7, font: fontBold, color: C.textMuted,
    })
    page.drawText(m.value, {
      x: cx + 8, y: ctx.y - 38, size: 20, font: fontBold, color: C.white,
    })
    if (m.caption) {
      page.drawText(m.caption, {
        x: cx + 8, y: ctx.y - 54, size: 7, font, color: C.textSecondary,
      })
    }
  }

  ctx.y -= cardH + 24

  // ── COMPOSITION OVERVIEW BAR ──
  if (row.body_fat_percentage != null) {
    const fatPct = toNum(row.body_fat_percentage) ?? 0
    const leanPct = row.lean_mass_percentage != null ? (toNum(row.lean_mass_percentage) ?? (100 - fatPct)) : (100 - fatPct)

    drawSectionTitle(ctx, 'COMPOSIÇÃO CORPORAL — VISÃO GERAL')

    const barWidth = CONTENT_W - 16
    const barX = MARGIN + 8
    const barH = 16

    // Fat portion
    page.drawRectangle({
      x: barX, y: ctx.y - barH,
      width: (barWidth * fatPct) / 100, height: barH,
      color: C.orange,
    })
    // Lean portion
    page.drawRectangle({
      x: barX + (barWidth * fatPct) / 100, y: ctx.y - barH,
      width: (barWidth * leanPct) / 100, height: barH,
      color: C.blue,
    })

    ctx.y -= barH + 8

    // Legend
    const legendItems = [
      { label: `Gordura: ${fatPct.toFixed(1)}%`, color: C.orange },
      { label: `Massa Magra: ${leanPct.toFixed(1)}%`, color: C.blue },
    ]
    let legendX = barX
    for (const item of legendItems) {
      page.drawRectangle({ x: legendX, y: ctx.y - 2, width: 8, height: 8, color: item.color })
      page.drawText(item.label, { x: legendX + 12, y: ctx.y, size: 7.5, font, color: C.textSecondary })
      legendX += font.widthOfTextAtSize(item.label, 7.5) + 30
    }

    ctx.y -= 20
  }
}

// ============================================
// PAGE 2: Body Composition Details
// ============================================

function drawCompositionPage(ctx: PdfCtx): void {
  const { page, font, fontBold, row } = ctx

  drawSectionTitle(ctx, 'COMPOSIÇÃO CORPORAL DETALHADA')

  type CompItem = { label: string; valueKg: number | null; valuePct: number | null; color: RGB }
  const items: CompItem[] = [
    { label: 'Massa Gorda', valueKg: toNum(row.fat_mass_kg), valuePct: toNum(row.body_fat_percentage), color: C.orange },
    { label: 'Massa Magra', valueKg: toNum(row.lean_mass_kg), valuePct: toNum(row.lean_mass_percentage), color: C.blue },
    { label: 'Massa Muscular', valueKg: toNum(row.muscle_mass_kg), valuePct: toNum(row.muscle_mass_percentage), color: C.green },
    { label: 'Massa Óssea', valueKg: toNum(row.bone_mass_kg), valuePct: null, color: C.purple },
    { label: 'Massa Residual', valueKg: toNum(row.residual_mass_kg), valuePct: null, color: C.textMuted },
  ].filter((i) => i.valueKg != null)

  const weight = toNum(row.weight_kg) || 1

  for (const item of items) {
    ensureSpace(ctx, 32)

    const x = MARGIN + 8
    const labelW = 110
    const barX = x + labelW
    const barW = 200
    const pctVal = item.valuePct ?? ((item.valueKg! / weight) * 100)

    page.drawText(item.label, { x, y: ctx.y, size: 9, font: fontBold, color: C.textPrimary })

    const valueText = `${item.valueKg!.toFixed(1)} kg`
    page.drawText(valueText, {
      x: barX + barW + 10, y: ctx.y, size: 9, font: fontBold, color: C.textPrimary,
    })

    if (pctVal > 0) {
      const pctText = `(${pctVal.toFixed(1)}%)`
      page.drawText(pctText, {
        x: barX + barW + 10 + fontBold.widthOfTextAtSize(valueText, 9) + 6,
        y: ctx.y, size: 8, font, color: C.textSecondary,
      })
    }

    ctx.y -= 6
    drawProgressBar(ctx, barX, ctx.y - 6, barW, Math.min(pctVal, 100), item.color)
    ctx.y -= 18
  }

  ctx.y -= 8

  // ── HEALTH CLASSIFICATIONS ──
  const classifications: Array<[string, string, RGB]> = []
  if (row.bmi_classification) classifications.push(['Classificação IMC', row.bmi_classification, classificationColor(row.bmi_classification)])
  if (row.fat_classification) classifications.push(['Classificação Gordura', row.fat_classification, classificationColor(row.fat_classification)])
  if (row.waist_hip_classification) classifications.push(['Classificação RCQ', row.waist_hip_classification, classificationColor(row.waist_hip_classification)])
  if (row.waist_risk) classifications.push(['Risco Cintura', row.waist_risk, classificationColor(row.waist_risk)])

  if (classifications.length > 0) {
    ensureSpace(ctx, 20 + classifications.length * 16)
    drawDivider(ctx, 10)
    drawSubsectionTitle(ctx, 'Classificações de Saúde')

    for (const [label, value, color] of classifications) {
      ctx.page.drawRectangle({ x: MARGIN + 10, y: ctx.y - 1, width: 6, height: 6, color })
      drawDataRow(ctx, label, value, { x: MARGIN + 22, labelWidth: 150, valueColor: color })
      ctx.y -= 14
    }
  }
}

// ============================================
// Skinfolds + Measurements
// ============================================

function drawSkinfoldsAndMeasurements(ctx: PdfCtx): void {
  const { page, font, fontBold, row } = ctx

  const skinfolds = parseJsonField<Record<string, number>>(row.skinfolds) || {}
  const measurements = parseJsonField<Record<string, number>>(row.measurements) || {}

  const sfKeys = Object.keys(skinfolds).filter((k) => skinfolds[k] != null && skinfolds[k] > 0)
  const mKeys = Object.keys(measurements).filter((k) => measurements[k] != null && measurements[k] > 0)

  if (sfKeys.length === 0 && mKeys.length === 0) return

  // ── SKINFOLDS ──
  if (sfKeys.length > 0) {
    ensureSpace(ctx, 30 + sfKeys.length * 14)
    drawSectionTitle(ctx, 'DOBRAS CUTÂNEAS')

    if (row.protocol) {
      const protocolName = PROTOCOL_NAMES[row.protocol] || row.protocol
      page.drawText(`Protocolo: ${protocolName}`, {
        x: MARGIN + 10, y: ctx.y, size: 8, font, color: C.textMuted,
      })
      ctx.y -= 4
      if (row.density_formula) {
        page.drawText(`Fórmula de Densidade: ${row.density_formula.charAt(0).toUpperCase() + row.density_formula.slice(1)}`, {
          x: MARGIN + 10, y: ctx.y, size: 8, font, color: C.textMuted,
        })
      }
      ctx.y -= 16
    }

    // Two-column layout
    const colW = (CONTENT_W - 20) / 2
    const col1X = MARGIN + 10
    const col2X = MARGIN + 10 + colW
    const midpoint = Math.ceil(sfKeys.length / 2)
    const startY = ctx.y

    for (let i = 0; i < sfKeys.length; i++) {
      const k = sfKeys[i]
      const v = skinfolds[k]
      const isCol2 = i >= midpoint
      const x = isCol2 ? col2X : col1X
      const rowIdx = isCol2 ? i - midpoint : i
      const yPos = startY - rowIdx * 14

      page.drawRectangle({ x, y: yPos - 1, width: 5, height: 5, color: C.green })
      page.drawText(SKINFOLD_LABELS[k] || k, {
        x: x + 10, y: yPos, size: 8.5, font, color: C.textSecondary,
      })
      page.drawText(`${v.toFixed(1)} mm`, {
        x: x + colW - 60, y: yPos, size: 8.5, font: fontBold, color: C.textPrimary,
      })
    }

    ctx.y = startY - midpoint * 14 - 8

    // Sum of skinfolds highlight
    if (row.sum_of_skinfolds != null) {
      ensureSpace(ctx, 20)
      page.drawRectangle({
        x: MARGIN + 8, y: ctx.y - 4, width: CONTENT_W - 16, height: 18,
        color: C.green, opacity: 0.08, borderColor: C.green, borderWidth: 0.5,
      })
      page.drawText('Somatório de Dobras:', {
        x: MARGIN + 16, y: ctx.y, size: 9, font: fontBold, color: C.green,
      })
      page.drawText(`${toNum(row.sum_of_skinfolds)?.toFixed(1)} mm`, {
        x: MARGIN + 16 + fontBold.widthOfTextAtSize('Somatório de Dobras:', 9) + 10,
        y: ctx.y, size: 9, font: fontBold, color: C.white,
      })
      ctx.y -= 22
    }

    ctx.y -= 10
  }

  // ── MEASUREMENTS ──
  if (mKeys.length > 0) {
    ensureSpace(ctx, 30 + Math.ceil(mKeys.length / 2) * 14)
    drawSectionTitle(ctx, 'PERÍMETROS CORPORAIS (cm)')

    const colW = (CONTENT_W - 20) / 2
    const col1X = MARGIN + 10
    const col2X = MARGIN + 10 + colW
    const midpoint = Math.ceil(mKeys.length / 2)
    const startY = ctx.y

    for (let i = 0; i < mKeys.length; i++) {
      const k = mKeys[i]
      const v = measurements[k]
      const isCol2 = i >= midpoint
      const x = isCol2 ? col2X : col1X
      const rowIdx = isCol2 ? i - midpoint : i
      const yPos = startY - rowIdx * 14

      page.drawRectangle({ x, y: yPos - 1, width: 5, height: 5, color: C.blue })
      page.drawText(MEASUREMENT_LABELS[k] || k, {
        x: x + 10, y: yPos, size: 8.5, font, color: C.textSecondary,
      })
      page.drawText(`${v.toFixed(1)} cm`, {
        x: x + colW - 60, y: yPos, size: 8.5, font: fontBold, color: C.textPrimary,
      })
    }

    ctx.y = startY - midpoint * 14 - 12
  }
}

// ============================================
// Health Indices & Metabolism
// ============================================

function drawHealthAndMetabolism(ctx: PdfCtx): void {
  const { page, font, fontBold, row } = ctx

  const hasMetabolism = row.basal_metabolic_rate != null || row.total_daily_expenditure != null
  const hasGoals = row.ideal_weight_kg != null
  const hasExtras = row.water_percentage != null || row.visceral_fat_level != null || row.metabolic_age != null
  const hasRcq = row.waist_hip_ratio != null

  if (!hasMetabolism && !hasGoals && !hasExtras && !hasRcq && !row.somatotype) return

  ensureSpace(ctx, 60)
  drawSectionTitle(ctx, 'ÍNDICES DE SAÚDE E METABOLISMO')

  const halfW = (CONTENT_W - 10) / 2
  const leftX = MARGIN
  const rightX = MARGIN + halfW + 10

  // ── LEFT: Metabolism ──
  if (hasMetabolism) {
    const cardH = 90
    drawCard(ctx, leftX, ctx.y, halfW, cardH, { accentColor: C.orange })

    let cy = ctx.y - 18
    page.drawText('METABOLISMO', { x: leftX + 12, y: cy, size: 8, font: fontBold, color: C.orange })
    cy -= 18

    if (row.basal_metabolic_rate != null) {
      page.drawText('TMB (Basal)', { x: leftX + 12, y: cy, size: 8, font, color: C.textSecondary })
      page.drawText(fmtKcal(toNum(row.basal_metabolic_rate)), {
        x: leftX + 12 + 95, y: cy, size: 9, font: fontBold, color: C.textPrimary,
      })
      cy -= 15
    }

    if (row.total_daily_expenditure != null) {
      page.drawText('GET (Total)', { x: leftX + 12, y: cy, size: 8, font, color: C.textSecondary })
      page.drawText(fmtKcal(toNum(row.total_daily_expenditure)), {
        x: leftX + 12 + 95, y: cy, size: 9, font: fontBold, color: C.textPrimary,
      })
      cy -= 15
    }

    if (row.basal_metabolic_rate && row.total_daily_expenditure) {
      const tmb = toNum(row.basal_metabolic_rate) || 1
      const get = toNum(row.total_daily_expenditure) || 1
      const factor = get / tmb
      page.drawText('Fator Atividade', { x: leftX + 12, y: cy, size: 8, font, color: C.textSecondary })
      page.drawText(`${factor.toFixed(2)}x`, {
        x: leftX + 12 + 95, y: cy, size: 9, font: fontBold, color: C.green,
      })
    }
  }

  // ── RIGHT: Goals ──
  if (hasGoals) {
    const cardH = 90
    drawCard(ctx, rightX, ctx.y, halfW, cardH, { accentColor: C.green })

    let cy = ctx.y - 18
    page.drawText('METAS DE PESO', { x: rightX + 12, y: cy, size: 8, font: fontBold, color: C.green })
    cy -= 18

    if (row.ideal_weight_kg != null) {
      page.drawText('Peso Ideal', { x: rightX + 12, y: cy, size: 8, font, color: C.textSecondary })
      page.drawText(fmtKg(toNum(row.ideal_weight_kg)), {
        x: rightX + 12 + 95, y: cy, size: 9, font: fontBold, color: C.textPrimary,
      })
      cy -= 15
    }

    if (row.weight_to_lose_kg != null) {
      const wtl = toNum(row.weight_to_lose_kg) ?? 0
      const isGain = wtl < 0
      page.drawText(isGain ? 'A Ganhar' : 'A Perder', {
        x: rightX + 12, y: cy, size: 8, font, color: C.textSecondary,
      })
      page.drawText(fmtKg(Math.abs(wtl)), {
        x: rightX + 12 + 95, y: cy, size: 9, font: fontBold, color: isGain ? C.green : C.orange,
      })
      cy -= 15
    }

    if (row.weight_kg != null && row.ideal_weight_kg != null) {
      const diff = (toNum(row.weight_kg) ?? 0) - (toNum(row.ideal_weight_kg) ?? 0)
      const status = Math.abs(diff) < 1 ? 'No peso ideal!' : diff > 0 ? `${diff.toFixed(1)} kg acima` : `${Math.abs(diff).toFixed(1)} kg abaixo`
      page.drawText(status, {
        x: rightX + 12, y: cy, size: 8, font, color: Math.abs(diff) < 1 ? C.green : C.yellow,
      })
    }
  }

  ctx.y -= 100

  // ── ADDITIONAL METRICS ──
  const additionalItems: Array<[string, string, RGB]> = []

  if (row.waist_hip_ratio != null) {
    additionalItems.push([
      'Relação Cintura-Quadril (RCQ)',
      `${fmtNum(toNum(row.waist_hip_ratio), 2)} — ${safeText(row.waist_hip_classification)}`,
      row.waist_risk === 'Normal' ? C.green : C.yellow,
    ])
  }
  if (row.somatotype) additionalItems.push(['Somatotipo', row.somatotype, C.blue])
  if (row.water_percentage != null) additionalItems.push(['Percentual de Água', fmtPct(toNum(row.water_percentage)), C.blueLight])
  if (row.visceral_fat_level != null) {
    const vfl = toNum(row.visceral_fat_level) ?? 0
    additionalItems.push([
      'Gordura Visceral (Nível)',
      `${vfl}${vfl <= 12 ? ' — Normal' : ' — Elevado'}`,
      vfl <= 12 ? C.green : C.red,
    ])
  }
  if (row.metabolic_age != null) additionalItems.push(['Idade Metabólica', `${row.metabolic_age} anos`, C.purple])
  if (row.body_density != null) additionalItems.push(['Densidade Corporal', fmtNum(toNum(row.body_density), 4), C.textSecondary])

  if (additionalItems.length > 0) {
    ensureSpace(ctx, 20 + additionalItems.length * 16)
    ctx.y -= 6
    drawSubsectionTitle(ctx, 'Indicadores Complementares')

    for (const [label, value, color] of additionalItems) {
      ctx.page.drawRectangle({ x: MARGIN + 8, y: ctx.y - 2, width: 5, height: 5, color })
      drawDataRow(ctx, label, value, { x: MARGIN + 20, labelWidth: 190, valueColor: color })
      ctx.y -= 15
    }
  }
}

// ============================================
// Photos
// ============================================

async function drawPhotosPage(ctx: PdfCtx): Promise<void> {
  const photos = pickPhotoUrls(ctx.row.photos)
  if (photos.length === 0) return

  ensureSpace(ctx, 300)
  drawSectionTitle(ctx, 'REGISTRO FOTOGRÁFICO')

  const count = Math.min(photos.length, 3)
  const gap = 10
  const totalGap = (count - 1) * gap
  const imgMaxW = (CONTENT_W - 16 - totalGap) / count
  const imgMaxH = Math.min(260, ctx.y - FOOTER_H - MARGIN - 40)

  for (let i = 0; i < count; i++) {
    try {
      const img = await embedRemoteImage(ctx.doc, photos[i].url)
      const scale = Math.min(imgMaxW / img.width, imgMaxH / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const frameX = MARGIN + 8 + i * (imgMaxW + gap)
      const x = frameX + (imgMaxW - w) / 2
      const yPos = ctx.y - imgMaxH + (imgMaxH - h) / 2

      // Photo frame
      ctx.page.drawRectangle({
        x: frameX - 2, y: ctx.y - imgMaxH - 2,
        width: imgMaxW + 4, height: imgMaxH + 4,
        borderColor: C.border, borderWidth: 1, color: C.bgCard,
      })
      // Green accent on top
      ctx.page.drawRectangle({
        x: frameX - 2, y: ctx.y + 2,
        width: imgMaxW + 4, height: 2, color: C.green,
      })

      ctx.page.drawImage(img, { x, y: yPos, width: w, height: h })

      // Photo type label below
      const label = PHOTO_TYPE_LABELS[photos[i].type] || 'FOTO'
      const labelW = ctx.fontBold.widthOfTextAtSize(label, 7)
      ctx.page.drawText(label, {
        x: frameX + (imgMaxW - labelW) / 2,
        y: ctx.y - imgMaxH - 14,
        size: 7, font: ctx.fontBold, color: C.textMuted,
      })
    } catch {
      // best-effort
    }
  }

  ctx.y -= imgMaxH + 26
}

// ============================================
// AI Interpretation
// ============================================

function drawInterpretation(ctx: PdfCtx): void {
  const interpretation = safeText(ctx.row.ai_interpretation, '')
  if (!interpretation) return

  ensureSpace(ctx, 60)
  drawSectionTitle(ctx, 'ANÁLISE E INTERPRETAÇÃO')

  ctx.page.drawText('Análise gerada com base nos dados coletados durante a avaliação física:', {
    x: MARGIN + 10, y: ctx.y, size: 8, font: ctx.font, color: C.textMuted,
  })
  ctx.y -= 18

  const paragraphs = interpretation
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  for (const para of paragraphs) {
    const isHeader = /^[A-ZÁÉÍÓÚÃÕÇ\s:—\-•]{5,}$/.test(para.trim()) ||
      para.startsWith('**') ||
      /^[\u{1F300}-\u{1FAFF}]/u.test(para)

    if (isHeader) {
      ensureSpace(ctx, 20)
      const cleanHeader = para.replace(/\*\*/g, '').trim()
      ctx.page.drawText(cleanHeader, {
        x: MARGIN + 10, y: ctx.y, size: 9.5, font: ctx.fontBold, color: C.green,
      })
      ctx.y -= 14
    } else {
      drawWrappedText(ctx, para, {
        fontSize: 8.5,
        color: rgb(0.82, 0.83, 0.86),
        lineSpacing: 11.5,
        maxWidth: CONTENT_W - 24,
        x: MARGIN + 10,
      })
      ctx.y -= 6
    }
  }
}

// ============================================
// Final Section: QR Code + Motivational
// ============================================

function drawFinalSection(ctx: PdfCtx): void {
  const { page, font, fontBold, row } = ctx

  ensureSpace(ctx, 140)
  drawDivider(ctx, 16)

  // ── MOTIVATIONAL ──
  page.drawRectangle({
    x: MARGIN, y: ctx.y - 50, width: CONTENT_W, height: 56,
    color: C.green, opacity: 0.06,
    borderColor: C.green, borderWidth: 0.5,
  })

  page.drawText('"Seu corpo pode tudo. É a sua mente que precisa ser convencida."', {
    x: MARGIN + 16, y: ctx.y - 16, size: 10, font: fontBold, color: C.green,
  })
  page.drawText('Cada avaliação é um passo na direção dos seus objetivos. Continue evoluindo!', {
    x: MARGIN + 16, y: ctx.y - 32, size: 8, font, color: C.textSecondary,
  })

  ctx.y -= 72

  // ── QR CODE ──
  const onlineUrl = `https://vfit.app.br/dashboard/assessments/view?id=${row.id}`
  const qrSize = 72

  ensureSpace(ctx, qrSize + 40)

  const qrX = PAGE_W - MARGIN - qrSize
  const qrY = ctx.y - qrSize

  try {
    drawQr(page, onlineUrl, qrX, qrY, qrSize)
  } catch {
    // best-effort
  }

  page.drawText('VERSÃO DIGITAL', {
    x: MARGIN + 10, y: ctx.y - 10, size: 9, font: fontBold, color: C.green,
  })
  page.drawText('Escaneie o QR Code para acessar a versão', {
    x: MARGIN + 10, y: ctx.y - 24, size: 8, font, color: C.textSecondary,
  })
  page.drawText('interativa online com gráficos de evolução.', {
    x: MARGIN + 10, y: ctx.y - 36, size: 8, font, color: C.textSecondary,
  })
  page.drawText('vfit.app.br', {
    x: MARGIN + 10, y: ctx.y - 54, size: 8, font: fontBold, color: C.green,
  })

  ctx.y -= qrSize + 16

  // ── CREF / Signature ──
  if (row.personal_cref) {
    ensureSpace(ctx, 40)
    drawDivider(ctx, 8)

    page.drawText(`${safeText(row.personal_name)}`, {
      x: MARGIN + 10, y: ctx.y, size: 9, font: fontBold, color: C.textPrimary,
    })
    ctx.y -= 13

    page.drawText(`CREF ${row.personal_cref}/${row.personal_cref_state || ''}${row.personal_cref_verified ? ' — Verificado' : ''}`, {
      x: MARGIN + 10, y: ctx.y, size: 8, font, color: C.green,
    })
    ctx.y -= 13

    page.drawText('Educador Físico', {
      x: MARGIN + 10, y: ctx.y, size: 7, font, color: C.textMuted,
    })
    ctx.y -= 16
  }
}

// ============================================
// Data Fetching
// ============================================

export async function fetchAssessmentPdfData(env: Bindings, assessmentId: string): Promise<AssessmentPdfRow> {
  const row = await pgQueryOne<AssessmentPdfRow>(
    env,
    `SELECT
       a.id,
       a.student_id,
       a.personal_id,
       a.assessment_date,
       su.full_name            AS student_name,
       pu.full_name            AS personal_name,
       pu.profile_photo_url    AS personal_photo,
       p.cref                  AS personal_cref,
       p.cref_state            AS personal_cref_state,
       p.cref_verified         AS personal_cref_verified,
       p.bio                   AS personal_bio,
       a.weight_kg,
       a.height_cm,
       a.bmi,
       a.bmi_classification,
       a.body_fat_percentage,
       a.fat_classification,
       a.waist_hip_ratio,
       a.waist_hip_classification,
       a.waist_risk,
       a.body_density,
       a.fat_mass_kg,
       a.lean_mass_kg,
       a.lean_mass_percentage,
       a.muscle_mass_kg,
       a.muscle_mass_percentage,
       a.bone_mass_kg,
       a.residual_mass_kg,
       a.basal_metabolic_rate,
       a.total_daily_expenditure,
       a.ideal_weight_kg,
       a.weight_to_lose_kg,
       a.somatotype,
       a.water_percentage,
       a.visceral_fat_level,
       a.metabolic_age,
       a.protocol,
       a.protocol_version,
       a.density_formula,
       a.sum_of_skinfolds,
       a.skinfolds,
       a.measurements,
       a.body_composition,
       a.photos,
       a.ai_analysis,
       a.ai_interpretation,
       a.pdf_generated,
       a.pdf_url,
       a.pdf_generated_at
     FROM assessments a
     LEFT JOIN users su ON su.id = a.student_id
     LEFT JOIN users pu ON pu.id = a.personal_id
     LEFT JOIN personals p ON p.id = a.personal_id
     WHERE a.id = $1
     LIMIT 1`,
    [assessmentId]
  )

  if (!row) throw new NotFoundError('Avaliação')

  // Enrich FFMI from body_composition JSON if available
  if (row.body_composition && row.ffmi_normalized == null) {
    try {
      const bc = typeof row.body_composition === 'string'
        ? JSON.parse(row.body_composition)
        : row.body_composition
      if (bc?.ffmi) {
        row.ffmi_normalized = bc.ffmi.ffmiNormalized ?? bc.ffmi.ffmi ?? null
        row.ffmi_classification = bc.ffmi.label ?? null
      }
    } catch { /* ignore parse errors */ }
  }

  return row
}

// ============================================
// Main Builder
// ============================================

export async function buildAssessmentPdfBytes(row: AssessmentPdfRow): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.setTitle(`Avaliação Física — ${safeText(row.student_name, 'Aluno')}`)
  pdfDoc.setAuthor('VFIT — vfit.app.br')
  pdfDoc.setSubject('Avaliação Física Profissional')
  pdfDoc.setCreator('VFIT v3.0')
  pdfDoc.setProducer('VFIT — pdf-lib')

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const firstPage = pdfDoc.addPage([PAGE_W, PAGE_H])

  const ctx: PdfCtx = {
    doc: pdfDoc,
    page: firstPage,
    y: PAGE_H - MARGIN,
    font,
    fontBold,
    pageNum: 1,
    row,
  }

  drawPageBg(ctx)

  // ── PAGE 1: Cover ──
  await drawCoverPage(ctx)

  // ── Body Composition ──
  const hasComposition = row.fat_mass_kg != null || row.lean_mass_kg != null || row.muscle_mass_kg != null
  if (hasComposition) {
    drawPageFooter(ctx)
    newPage(ctx)
    drawCompositionPage(ctx)
  }

  // ── Skinfolds & Measurements ──
  const skinfolds = parseJsonField<Record<string, number>>(row.skinfolds) || {}
  const measurements = parseJsonField<Record<string, number>>(row.measurements) || {}
  const hasSF = Object.keys(skinfolds).filter((k) => skinfolds[k] > 0).length > 0
  const hasM = Object.keys(measurements).filter((k) => measurements[k] > 0).length > 0

  if (hasSF || hasM) {
    if (ctx.y < 300) {
      drawPageFooter(ctx)
      newPage(ctx)
    }
    drawSkinfoldsAndMeasurements(ctx)
  }

  // ── Health & Metabolism ──
  const hasHealth = row.basal_metabolic_rate != null || row.ideal_weight_kg != null ||
    row.somatotype != null || row.water_percentage != null || row.waist_hip_ratio != null
  if (hasHealth) {
    if (ctx.y < 250) {
      drawPageFooter(ctx)
      newPage(ctx)
    }
    drawHealthAndMetabolism(ctx)
  }

  // ── Photos ──
  const photos = pickPhotoUrls(row.photos)
  if (photos.length > 0) {
    drawPageFooter(ctx)
    newPage(ctx)
    await drawPhotosPage(ctx)
  }

  // ── AI Interpretation ──
  if (row.ai_interpretation) {
    if (ctx.y < 200) {
      drawPageFooter(ctx)
      newPage(ctx)
    }
    drawInterpretation(ctx)
  }

  // ── Final Section ──
  if (ctx.y < 200) {
    drawPageFooter(ctx)
    newPage(ctx)
  }
  drawFinalSection(ctx)

  drawPageFooter(ctx)

  return pdfDoc.save()
}

// ============================================
// Generate, Store (R2) & Update DB
// ============================================

export async function generateAndStoreAssessmentPdf(
  env: Bindings,
  assessmentId: string,
  opts?: { force?: boolean }
): Promise<{ pdf_url: string; generated_at: string; key: string }> {
  const row = await fetchAssessmentPdfData(env, assessmentId)

  if (!opts?.force && row.pdf_generated && row.pdf_url) {
    return {
      pdf_url: row.pdf_url,
      generated_at: row.pdf_generated_at || new Date().toISOString(),
      key: '',
    }
  }

  if (!env.R2_IMAGES) {
    throw new Error('R2_IMAGES não configurado')
  }

  const now = new Date().toISOString()
  const studentFolder = row.student_id || 'unknown'
  const key = `assessments/${studentFolder}/${assessmentId}/assessment.pdf`

  const pdfBytes = await buildAssessmentPdfBytes(row)

  await env.R2_IMAGES.put(key, pdfBytes, {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: { assessment_id: assessmentId, type: 'assessment_pdf', version: '3.0' },
  })

  const base = env.R2_IMAGES_URL || 'https://images.vfit.app.br'
  const url = `${base}/${key}`

  await pgQuery(
    env,
    `UPDATE assessments
     SET pdf_generated    = true,
         pdf_url          = $1,
         pdf_generated_at = $2,
         updated_at       = $2
     WHERE id = $3`,
    [url, now, assessmentId]
  )

  return { pdf_url: url, generated_at: now, key }
}
