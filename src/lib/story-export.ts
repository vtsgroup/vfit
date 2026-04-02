/**
 * src/lib/story-export.ts
 *
 * Story Export — Gera imagem 1080x1920 para Instagram Stories
 *
 * Exports: StoryMetric
 */

// ============================================
// Story Export — Gera imagem 1080x1920 para Instagram Stories
// VFIT — v2.0
// ============================================

export type StoryMetric = {
  label: string
  value: string
  color?: string // css-like hint (usado só para escolher cor)
}

function pickColor(color?: string): string {
  if (!color) return '#3DFCA4'
  if (color.includes('error') || color.includes('red')) return '#ef4444'
  if (color.includes('warning') || color.includes('yellow') || color.includes('amber')) return '#f59e0b'
  if (color.includes('info') || color.includes('blue')) return '#3b82f6'
  if (color.includes('success') || color.includes('green') || color.includes('emerald')) return '#10b981'
  return '#3DFCA4'
}

async function fetchBitmap(url: string): Promise<ImageBitmap> {
  // Fetch -> blob evita problema de CORS no canvas (quando o servidor permite)
  const res = await fetch(url, { mode: 'cors', cache: 'force-cache' }).catch(() => null)
  if (!res || !res.ok) {
    throw new Error('Falha ao baixar imagem')
  }
  const blob = await res.blob()

  // createImageBitmap costuma ser mais rápido/seguro
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(blob)
  }

  // Fallback (mais compatível)
  const imgUrl = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Falha ao carregar imagem'))
      el.crossOrigin = 'anonymous'
      el.src = imgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponível')
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Converte ImageData -> ImageBitmap (simples)
    return await createImageBitmap(data)
  } finally {
    URL.revokeObjectURL(imgUrl)
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function coverDraw(ctx: CanvasRenderingContext2D, bmp: ImageBitmap, dx: number, dy: number, dw: number, dh: number) {
  const sw = bmp.width
  const sh = bmp.height
  const sRatio = sw / sh
  const dRatio = dw / dh

  let sx = 0
  let sy = 0
  let sWidth = sw
  let sHeight = sh

  if (sRatio > dRatio) {
    // source wider
    sWidth = sh * dRatio
    sx = (sw - sWidth) / 2
  } else {
    // source taller
    sHeight = sw / dRatio
    sy = (sh - sHeight) / 2
  }

  ctx.drawImage(bmp, sx, sy, sWidth, sHeight, dx, dy, dw, dh)
}

export async function generateBeforeAfterStoryPng(input: {
  title: string
  subtitle?: string
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  metrics?: StoryMetric[]
}): Promise<Blob> {
  const width = 1080
  const height = 1920

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')

  // Background gradient
  const grd = ctx.createLinearGradient(0, 0, width, height)
  grd.addColorStop(0, '#070A12')
  grd.addColorStop(0.5, '#0B1220')
  grd.addColorStop(1, '#06070D')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, width, height)

  // Accent glow
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = '#3DFCA4'
  ctx.beginPath()
  ctx.ellipse(width * 0.2, height * 0.18, 360, 220, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Header
  ctx.fillStyle = '#E5E7EB'
  ctx.font = '700 56px system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText(input.title.slice(0, 28), 72, 140)

  if (input.subtitle) {
    ctx.fillStyle = '#94A3B8'
    ctx.font = '500 30px system-ui, -apple-system, Segoe UI, Roboto, Arial'
    ctx.fillText(input.subtitle.slice(0, 54), 72, 190)
  }

  // Frame config
  const frameGap = 26
  const frameW = (width - 72 * 2 - frameGap) / 2
  const frameH = 1060
  const frameY = 260

  // Load images
  const [beforeBmp, afterBmp] = await Promise.all([
    fetchBitmap(input.beforeUrl),
    fetchBitmap(input.afterUrl),
  ])

  // Frames
  const drawFrame = (x: number, label: string, bmp: ImageBitmap) => {
    // frame bg
    ctx.save()
    drawRoundedRect(ctx, x, frameY, frameW, frameH, 28)
    ctx.fillStyle = '#0B1220'
    ctx.fill()
    ctx.restore()

    // image clipped
    ctx.save()
    drawRoundedRect(ctx, x, frameY, frameW, frameH, 28)
    ctx.clip()
    coverDraw(ctx, bmp, x, frameY, frameW, frameH)
    ctx.restore()

    // label chip
    const chipW = 220
    const chipH = 56
    const chipX = x + 24
    const chipY = frameY + 24

    ctx.save()
    drawRoundedRect(ctx, chipX, chipY, chipW, chipH, 18)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = '#E5E7EB'
    ctx.font = '700 26px system-ui, -apple-system, Segoe UI, Roboto, Arial'
    ctx.fillText(label, chipX + 18, chipY + 38)
  }

  drawFrame(72, input.beforeLabel || 'ANTES', beforeBmp)
  drawFrame(72 + frameW + frameGap, input.afterLabel || 'AGORA', afterBmp)

  // Metrics
  const metrics = (input.metrics || []).slice(0, 4)
  if (metrics.length > 0) {
    const boxY = frameY + frameH + 70
    ctx.fillStyle = '#E5E7EB'
    ctx.font = '700 36px system-ui, -apple-system, Segoe UI, Roboto, Arial'
    ctx.fillText('Resumo', 72, boxY)

    const cardGap = 18
    const cardW = (width - 72 * 2 - cardGap) / 2
    const cardH = 150

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i]
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 72 + col * (cardW + cardGap)
      const y = boxY + 28 + row * (cardH + cardGap)

      ctx.save()
      drawRoundedRect(ctx, x, y, cardW, cardH, 26)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
      ctx.fill()

      // accent
      ctx.fillStyle = pickColor(m.color)
      ctx.globalAlpha = 0.9
      drawRoundedRect(ctx, x + 16, y + 16, 10, cardH - 32, 8)
      ctx.fill()
      ctx.restore()

      ctx.fillStyle = '#94A3B8'
      ctx.font = '600 24px system-ui, -apple-system, Segoe UI, Roboto, Arial'
      ctx.fillText(m.label.slice(0, 20), x + 40, y + 56)

      ctx.fillStyle = '#E5E7EB'
      ctx.font = '800 44px system-ui, -apple-system, Segoe UI, Roboto, Arial'
      ctx.fillText(m.value.slice(0, 14), x + 40, y + 112)
    }
  }

  // Footer
  ctx.fillStyle = 'rgba(148,163,184,0.9)'
  ctx.font = '600 22px system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('iapersonal.app.br', 72, height - 70)
  ctx.fillStyle = 'rgba(61,252,164,0.9)'
  ctx.fillText('VFIT', width - 72 - 160, height - 70)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Falha ao gerar imagem'))
      resolve(b)
    }, 'image/png', 1)
  })

  return blob
}

export async function shareStoryImage(blob: Blob, filename = 'story.png'): Promise<boolean> {
  const file = new File([blob], filename, { type: 'image/png' })

  // Web Share API level 2
  const canShareFiles =
    typeof (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare === 'function'
      ? (navigator as Navigator & { canShare: (data: ShareData) => boolean }).canShare({ files: [file] })
      : true

  if (navigator.share && canShareFiles) {
    await navigator.share({
      title: 'Story — VFIT',
      files: [file],
    })
    return true
  }

  // fallback: download
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    return false
  } finally {
    URL.revokeObjectURL(url)
  }
}
