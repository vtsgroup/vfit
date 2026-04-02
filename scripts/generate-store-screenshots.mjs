#!/usr/bin/env node

/**
 * Generate Store Screenshots for Google Play
 * - 2x Phone screenshots (1080x1920)
 * - 1x Tablet 7" screenshot (1200x1920)
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'twa', 'store')

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawGlassCard(ctx, x, y, w, h, radius = 20) {
  roundRect(ctx, x, y, w, h, radius)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawKPICard(ctx, x, y, w, h, emoji, label, value, color) {
  drawGlassCard(ctx, x, y, w, h, 16)
  
  // Icon circle
  ctx.fillStyle = `${color}22`
  ctx.beginPath()
  ctx.arc(x + 35, y + h / 2, 20, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.font = '22px system-ui'
  ctx.fillText(emoji, x + 23, y + h / 2 + 7)
  
  // Label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '13px system-ui, sans-serif'
  ctx.fillText(label, x + 65, y + h / 2 - 8)
  
  // Value
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(value, x + 65, y + h / 2 + 18)
}

function drawStatusBar(ctx, W) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = 'bold 14px system-ui'
  ctx.fillText('9:41', 30, 26)
  
  // Battery/signal icons (simplified)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '12px system-ui'
  ctx.textAlign = 'right'
  ctx.fillText('100% 🔋', W - 20, 26)
  ctx.textAlign = 'left'
}

function drawHeader(ctx, W, title, subtitle) {
  // Glass header
  ctx.fillStyle = 'rgba(9, 9, 11, 0.8)'
  ctx.fillRect(0, 0, W, 90)
  
  drawStatusBar(ctx, W)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(title, 24, 65)
  
  if (subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(subtitle, 24, 85)
  }
}

function drawBottomNav(ctx, W, H, active = 0) {
  const navH = 80
  const navY = H - navH
  
  ctx.fillStyle = 'rgba(9, 9, 11, 0.95)'
  ctx.fillRect(0, navY, W, navH)
  
  // Top border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.fillRect(0, navY, W, 1)
  
  const items = ['🏠', '👥', '💪', '📋', '💰']
  const labels = ['Home', 'Alunos', 'Treinos', 'Avalia.', 'Pagam.']
  const itemW = W / items.length
  
  items.forEach((emoji, i) => {
    const cx = itemW * i + itemW / 2
    const isActive = i === active
    
    if (isActive) {
      // Active pill
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'
      roundRect(ctx, cx - 28, navY + 12, 56, 32, 16)
      ctx.fill()
    }
    
    ctx.font = '20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(emoji, cx, navY + 34)
    
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillStyle = isActive ? '#22C55E' : 'rgba(255, 255, 255, 0.4)'
    ctx.fillText(labels[i], cx, navY + 58)
  })
  
  ctx.textAlign = 'left'
}

// ── Screenshot 1: Dashboard ─────────────────────
async function generateDashboard() {
  const W = 1080, H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  
  // BG
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#09090B')
  bg.addColorStop(1, '#0F1419')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  
  // Green glow
  const glow = ctx.createRadialGradient(W / 2, 400, 0, W / 2, 400, 500)
  glow.addColorStop(0, 'rgba(34, 197, 94, 0.08)')
  glow.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  
  drawHeader(ctx, W, 'Dashboard', 'Olá, Personal 👋')
  
  // Welcome card (glass premium)
  const cardY = 110
  drawGlassCard(ctx, 20, cardY, W - 40, 160, 24)
  
  // Gradient mesh inside
  const mesh = ctx.createLinearGradient(20, cardY, W - 20, cardY + 160)
  mesh.addColorStop(0, 'rgba(34, 197, 94, 0.08)')
  mesh.addColorStop(1, 'rgba(34, 197, 94, 0)')
  roundRect(ctx, 20, cardY, W - 40, 160, 24)
  ctx.fillStyle = mesh
  ctx.fill()
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '14px system-ui'
  ctx.fillText('Bem-vindo de volta', 44, cardY + 40)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText('Seu dia está incrível! 🚀', 44, cardY + 75)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '13px system-ui'
  ctx.fillText('3 treinos pendentes · 2 pagamentos · 1 avaliação', 44, cardY + 110)
  
  // KPI Grid
  const kpiY = cardY + 190
  const kpiW = (W - 60) / 2
  const kpiH = 80
  drawKPICard(ctx, 20, kpiY, kpiW, kpiH, '👥', 'Alunos Ativos', '24', '#22C55E')
  drawKPICard(ctx, 40 + kpiW, kpiY, kpiW, kpiH, '💪', 'Treinos', '156', '#6366F1')
  drawKPICard(ctx, 20, kpiY + kpiH + 12, kpiW, kpiH, '💰', 'Receita', 'R$ 4.200', '#F59E0B')
  drawKPICard(ctx, 40 + kpiW, kpiY + kpiH + 12, kpiW, kpiH, '⭐', 'XP Total', '2.450', '#EC4899')
  
  // Revenue chart area
  const chartY = kpiY + kpiH * 2 + 40
  drawGlassCard(ctx, 20, chartY, W - 40, 280, 20)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.fillText('Receita Mensal', 44, chartY + 35)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '12px system-ui'
  ctx.fillText('Últimos 6 meses', 44, chartY + 55)
  
  // Chart bars
  const barValues = [60, 75, 55, 90, 80, 95]
  const barW = (W - 120) / barValues.length
  barValues.forEach((val, i) => {
    const barH = val * 1.5
    const bx = 50 + i * barW
    const by = chartY + 240 - barH
    
    const barGrad = ctx.createLinearGradient(bx, by, bx, by + barH)
    barGrad.addColorStop(0, 'rgba(34, 197, 94, 0.6)')
    barGrad.addColorStop(1, 'rgba(34, 197, 94, 0.15)')
    ctx.fillStyle = barGrad
    roundRect(ctx, bx, by, barW - 16, barH, 6)
    ctx.fill()
  })
  
  // Recent activity
  const actY = chartY + 310
  drawGlassCard(ctx, 20, actY, W - 40, 380, 20)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.fillText('Atividade Recente', 44, actY + 35)
  
  const activities = [
    { emoji: '💪', text: 'Treino A - Peito criado', time: '2 min', color: '#22C55E' },
    { emoji: '📋', text: 'Avaliação — João S.', time: '15 min', color: '#6366F1' },
    { emoji: '💰', text: 'Pagamento recebido R$ 150', time: '1h', color: '#F59E0B' },
    { emoji: '👤', text: 'Novo aluno: Maria L.', time: '2h', color: '#06B6D4' },
    { emoji: '🔔', text: 'Lembrete: avaliação pendente', time: '3h', color: '#EC4899' },
  ]
  
  activities.forEach((act, i) => {
    const ay = actY + 60 + i * 62
    
    // Icon bg
    ctx.fillStyle = `${act.color}22`
    ctx.beginPath()
    ctx.arc(55, ay + 12, 18, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.font = '18px system-ui'
    ctx.fillText(act.emoji, 43, ay + 18)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(act.text, 85, ay + 8)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.font = '12px system-ui'
    ctx.fillText(`há ${act.time}`, 85, ay + 28)
    
    if (i < activities.length - 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.fillRect(85, ay + 46, W - 140, 1)
    }
  })
  
  drawBottomNav(ctx, W, H, 0)
  
  // Overlay text at top
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillText('Seu negócio na palma da mão', W / 2, H - 130)
  ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.font = '16px system-ui'
  ctx.fillText('Dashboard inteligente em tempo real', W / 2, H - 98)
  ctx.textAlign = 'left'
  
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(OUTPUT_DIR, 'screenshot-1-dashboard.png'), buffer)
  console.log(`✅ Screenshot 1 (Dashboard): ${buffer.length} bytes`)
}

// ── Screenshot 2: Students ──────────────────────
async function generateStudents() {
  const W = 1080, H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#09090B')
  bg.addColorStop(1, '#0F1419')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  
  drawHeader(ctx, W, 'Alunos', '24 alunos encontrados')
  
  // Search bar
  drawGlassCard(ctx, 20, 100, W - 40, 50, 25)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.font = '14px system-ui'
  ctx.fillText('🔍  Buscar por nome ou email...', 48, 130)
  
  // Filter chips
  const chips = ['Todos', 'Ativos', 'Pendentes', 'Inativos']
  let chipX = 20
  chips.forEach((chip, i) => {
    const tw = ctx.measureText(chip).width + 28
    ctx.fillStyle = i === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'
    roundRect(ctx, chipX, 165, tw, 34, 17)
    ctx.fill()
    
    if (i === 1) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    
    ctx.fillStyle = i === 1 ? '#22C55E' : 'rgba(255, 255, 255, 0.6)'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(chip, chipX + 14, 186)
    chipX += tw + 10
  })
  
  // Student cards
  const students = [
    { name: 'João Silva', status: 'Ativo', payment: 'Pago', workouts: 12, streak: 5 },
    { name: 'Maria Oliveira', status: 'Ativo', payment: 'Pago', workouts: 8, streak: 3 },
    { name: 'Pedro Santos', status: 'Ativo', payment: 'Pendente', workouts: 15, streak: 7 },
    { name: 'Ana Costa', status: 'Ativo', payment: 'Pago', workouts: 6, streak: 2 },
    { name: 'Lucas Lima', status: 'Pendente', payment: 'Pendente', workouts: 0, streak: 0 },
    { name: 'Carla Mendes', status: 'Ativo', payment: 'Pago', workouts: 20, streak: 10 },
    { name: 'Rafael Souza', status: 'Ativo', payment: 'Atrasado', workouts: 4, streak: 1 },
  ]
  
  students.forEach((s, i) => {
    const sy = 220 + i * 110
    drawGlassCard(ctx, 20, sy, W - 40, 98, 16)
    
    // Avatar circle
    const avatarColors = ['#22C55E', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4', '#F97316', '#8B5CF6']
    ctx.fillStyle = `${avatarColors[i % avatarColors.length]}33`
    ctx.beginPath()
    ctx.arc(70, sy + 49, 26, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = avatarColors[i % avatarColors.length]
    ctx.font = 'bold 20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(s.name[0], 70, sy + 56)
    ctx.textAlign = 'left'
    
    // Name
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px system-ui, sans-serif'
    ctx.fillText(s.name, 110, sy + 35)
    
    // Status badge
    const statusColor = s.status === 'Ativo' ? '#22C55E' : '#F59E0B'
    ctx.fillStyle = `${statusColor}22`
    const stw = ctx.measureText(s.status).width + 18
    roundRect(ctx, 110, sy + 48, stw, 22, 11)
    ctx.fill()
    ctx.fillStyle = statusColor
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(s.status, 119, sy + 63)
    
    // Payment badge
    const payColor = s.payment === 'Pago' ? '#22C55E' : s.payment === 'Atrasado' ? '#EF4444' : '#F59E0B'
    ctx.fillStyle = `${payColor}22`
    const ptw = ctx.measureText(s.payment).width + 18
    roundRect(ctx, 120 + stw, sy + 48, ptw, 22, 11)
    ctx.fill()
    ctx.fillStyle = payColor
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(s.payment, 129 + stw, sy + 63)
    
    // Stats on right
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '12px system-ui'
    ctx.fillText(`💪 ${s.workouts}`, W - 40, sy + 38)
    ctx.fillText(`🔥 ${s.streak} dias`, W - 40, sy + 60)
    ctx.textAlign = 'left'
  })
  
  drawBottomNav(ctx, W, H, 1)
  
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.font = 'bold 32px system-ui, sans-serif'
  ctx.fillText('Gerencie todos os seus alunos', W / 2, H - 130)
  ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.font = '16px system-ui'
  ctx.fillText('Status, pagamentos e progresso em um só lugar', W / 2, H - 98)
  ctx.textAlign = 'left'
  
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(OUTPUT_DIR, 'screenshot-2-students.png'), buffer)
  console.log(`✅ Screenshot 2 (Students): ${buffer.length} bytes`)
}

// ── Screenshot 3: Tablet (Dashboard expanded) ───
async function generateTablet() {
  const W = 1200, H = 1920
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#09090B')
  bg.addColorStop(1, '#0F1419')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  
  // Glow
  const glow = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, 600)
  glow.addColorStop(0, 'rgba(34, 197, 94, 0.06)')
  glow.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  
  drawStatusBar(ctx, W)
  
  // Sidebar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fillRect(0, 40, 260, H - 40)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.fillRect(260, 40, 1, H - 40)
  
  // Sidebar items
  const sideItems = [
    { emoji: '🏠', label: 'Dashboard', active: true },
    { emoji: '👥', label: 'Alunos', active: false },
    { emoji: '💪', label: 'Treinos', active: false },
    { emoji: '📋', label: 'Avaliações', active: false },
    { emoji: '💰', label: 'Pagamentos', active: false },
    { emoji: '💬', label: 'Mensagens', active: false },
    { emoji: '⚙️', label: 'Configurações', active: false },
  ]
  
  sideItems.forEach((item, i) => {
    const iy = 70 + i * 52
    
    if (item.active) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.12)'
      roundRect(ctx, 12, iy, 236, 42, 12)
      ctx.fill()
    }
    
    ctx.font = '18px system-ui'
    ctx.fillText(item.emoji, 28, iy + 28)
    
    ctx.fillStyle = item.active ? '#22C55E' : 'rgba(255, 255, 255, 0.5)'
    ctx.font = `${item.active ? 'bold ' : ''}14px system-ui, sans-serif`
    ctx.fillText(item.label, 60, iy + 27)
  })
  
  // Logo area
  ctx.fillStyle = '#22C55E'
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillText('VFIT', 50, H - 40)
  
  // Main content area
  const mainX = 280
  const mainW = W - mainX - 20
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('Dashboard', mainX + 10, 80)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '14px system-ui'
  ctx.fillText('Olá, Personal 👋 — Seu dia está incrível!', mainX + 10, 108)
  
  // KPI Grid (4 cols for tablet)
  const kpiY2 = 130
  const kpiW2 = (mainW - 40) / 4
  const kpiH2 = 85
  
  const kpis = [
    { emoji: '👥', label: 'Alunos', value: '24', color: '#22C55E' },
    { emoji: '💪', label: 'Treinos', value: '156', color: '#6366F1' },
    { emoji: '💰', label: 'Receita', value: 'R$ 4.200', color: '#F59E0B' },
    { emoji: '⭐', label: 'XP', value: '2.450', color: '#EC4899' },
  ]
  
  kpis.forEach((kpi, i) => {
    const kx = mainX + 10 + i * (kpiW2 + 10)
    drawGlassCard(ctx, kx, kpiY2, kpiW2, kpiH2, 16)
    
    ctx.fillStyle = `${kpi.color}22`
    ctx.beginPath()
    ctx.arc(kx + 30, kpiY2 + kpiH2 / 2, 16, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.font = '16px system-ui'
    ctx.fillText(kpi.emoji, kx + 20, kpiY2 + kpiH2 / 2 + 6)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px system-ui'
    ctx.fillText(kpi.label, kx + 55, kpiY2 + kpiH2 / 2 - 8)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.fillText(kpi.value, kx + 55, kpiY2 + kpiH2 / 2 + 14)
  })
  
  // Charts side by side
  const chartY2 = kpiY2 + kpiH2 + 25
  const chartW2 = (mainW - 20) / 2
  
  // Revenue chart
  drawGlassCard(ctx, mainX + 10, chartY2, chartW2 - 5, 250, 16)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillText('Receita Mensal', mainX + 30, chartY2 + 30)
  
  const bars = [50, 65, 45, 80, 60, 90, 75]
  bars.forEach((v, i) => {
    const bx = mainX + 30 + i * 55
    const bh = v * 1.6
    const by = chartY2 + 220 - bh
    const barG = ctx.createLinearGradient(bx, by, bx, by + bh)
    barG.addColorStop(0, 'rgba(34, 197, 94, 0.5)')
    barG.addColorStop(1, 'rgba(34, 197, 94, 0.1)')
    ctx.fillStyle = barG
    roundRect(ctx, bx, by, 38, bh, 4)
    ctx.fill()
  })
  
  // Activity list
  drawGlassCard(ctx, mainX + chartW2 + 15, chartY2, chartW2 - 5, 250, 16)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.fillText('Atividade Recente', mainX + chartW2 + 35, chartY2 + 30)
  
  const acts = [
    '💪 Treino criado — João',
    '📋 Avaliação — Maria',
    '💰 R$ 150 recebido',
    '👤 Novo aluno: Pedro',
  ]
  acts.forEach((a, i) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '13px system-ui'
    ctx.fillText(a, mainX + chartW2 + 35, chartY2 + 65 + i * 48)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '11px system-ui'
    ctx.fillText(`há ${(i + 1) * 5} min`, mainX + chartW2 + 35, chartY2 + 82 + i * 48)
  })
  
  // Bottom caption
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText('Interface adaptada para tablet', W / 2, H - 100)
  ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.font = '16px system-ui'
  ctx.fillText('Sidebar + Dashboard completo em tela grande', W / 2, H - 65)
  ctx.textAlign = 'left'
  
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(OUTPUT_DIR, 'screenshot-3-tablet.png'), buffer)
  console.log(`✅ Screenshot 3 (Tablet): ${buffer.length} bytes`)
}

async function main() {
  await generateDashboard()
  await generateStudents()
  await generateTablet()
  console.log('\n🎉 All screenshots generated in twa/store/')
}

main().catch(console.error)
