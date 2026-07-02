import { chromium, devices } from '@playwright/test'
const OUT = '/private/tmp/claude-501/-Users-macos-Development-apps-vfit-production/1b4c04c3-9923-4e78-9217-47d86c0a4b41/scratchpad'
const B = 'http://localhost:3000'
const browser = await chromium.launch()

const MOCK = {
  plan: {
    plan_name: 'Hipertrofia Total',
    description: 'Plano de 3x por semana focado em ganho de massa, ajustado ao seu tempo, nível e equipamentos disponíveis.',
    days: [
      { day_number: 1, name: 'Peito & Tríceps', focus: 'push', exercises: [
        { name: 'Supino reto com barra', muscle_group: 'chest', sets: 4, reps: '8-12', rest_seconds: 90, weight_suggestion_kg: 40 },
        { name: 'Supino inclinado halteres', muscle_group: 'chest', sets: 3, reps: '10', rest_seconds: 75 },
        { name: 'Crucifixo máquina', muscle_group: 'chest', sets: 3, reps: '12', rest_seconds: 60 },
        { name: 'Tríceps corda', muscle_group: 'triceps', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'Mantenha os cotovelos fixos ao lado do corpo.' },
      ] },
      { day_number: 2, name: 'Costas & Bíceps', focus: 'pull', exercises: [
        { name: 'Puxada frontal', muscle_group: 'back', sets: 4, reps: '10', rest_seconds: 90 },
        { name: 'Remada curvada', muscle_group: 'back', sets: 3, reps: '10', rest_seconds: 90 },
      ] },
      { day_number: 3, name: 'Pernas & Core', focus: 'legs', exercises: [
        { name: 'Agachamento livre', muscle_group: 'legs', sets: 4, reps: '8', rest_seconds: 120 },
      ] },
    ],
  },
  source: 'ai',
  stats: { total_days: 3, total_exercises: 24, avg_exercises_per_day: 8, session_duration_minutes: 45, estimated_weekly_calories: 1200 },
}

async function shot(ctxOpts, path, file, { inject = false, wait = 2400 } = {}) {
  const ctx = await browser.newContext(ctxOpts)
  if (inject) {
    await ctx.addInitScript((mock) => {
      sessionStorage.setItem('vfit_plan', JSON.stringify(mock))
    }, MOCK)
  }
  const p = await ctx.newPage()
  await p.goto(B + path, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await p.evaluate(() => document.fonts?.ready).catch(() => {})
  await p.waitForTimeout(wait)
  await p.screenshot({ path: `${OUT}/${file}` })
  console.log(file, 'ok ·', p.url())
  await ctx.close()
}

const iphone = devices['iPhone 13']
const desk = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }

// Wizard (step 0)
await shot(iphone, '/onboarding', 'ob-wizard-m.png')
await shot(desk, '/onboarding', 'ob-wizard-d.png')
// Loading (captura o boot antes de redirecionar/errar)
await shot(iphone, '/onboarding/loading', 'ob-loading-m.png', { wait: 1800 })
// Result (com plano mock)
await shot(iphone, '/onboarding/result', 'ob-result-m.png', { inject: true, wait: 2600 })
await shot(desk, '/onboarding/result', 'ob-result-d.png', { inject: true, wait: 2600 })

await browser.close()
