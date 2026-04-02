#!/usr/bin/env node

/**
 * Script para adicionar headers de documentação automatizados
 * a arquivos .ts/.tsx que ainda não possuem.
 *
 * Uso: node scripts/add-doc-headers.mjs [dir1] [dir2] ...
 * Ex:  node scripts/add-doc-headers.mjs src/components src/app
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const ROOT = process.cwd()
const dirs = process.argv.slice(2)
if (!dirs.length) {
  console.log('Usage: node scripts/add-doc-headers.mjs <dir1> [dir2] ...')
  process.exit(1)
}

function hasHeader(content) {
  const first5 = content.split('\n').slice(0, 5).join('\n')
  return /^\/\*\*|^\* |^\/\/ src\//.test(first5)
}

function getExports(content) {
  const exps = []
  const re = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g
  let m
  while ((m = re.exec(content)) !== null) {
    exps.push(m[1])
  }
  return [...new Set(exps)].slice(0, 5)
}

function getImportedHooks(content) {
  const hooks = new Set()
  // React hooks
  const reactHooks = content.match(/\buse[A-Z]\w+/g)
  if (reactHooks) reactHooks.forEach(h => hooks.add(h))
  return [...hooks].slice(0, 6)
}

function detectFeatures(content, filePath) {
  const features = []
  if (content.includes('useAuthStore')) features.push('Auth: useAuthStore')
  if (content.includes("'use client'")) features.push("'use client'")
  if (content.includes('useQuery') || content.includes('useMutation')) features.push('React Query')
  if (content.includes('framer-motion') || content.includes('motion.')) features.push('Framer Motion')
  if (content.includes('DsIcon') || content.includes('ds-icon')) features.push('DSIcon')
  if (content.includes('zustand') || content.includes('create(')) features.push('Zustand')
  if (content.includes('pgQuery') || content.includes('pgQueryOne')) features.push('DB: Neon')
  if (content.includes('d1Query')) features.push('DB: D1')
  return features
}

function detectPurpose(content, filePath) {
  const name = path.basename(filePath, path.extname(filePath))
  const isBarrel = name === 'index' && content.includes('export {')
  const isTsx = filePath.endsWith('.tsx')
  const isHook = name.startsWith('use-')
  const isStore = filePath.includes('/stores/')

  if (isBarrel) return 'Barrel re-export do módulo.'
  if (isHook) return `Hook React para ${name.replace('use-', '').replace(/-/g, ' ')}.`
  if (isStore) return `Store Zustand para ${name.replace(/-store/, '').replace(/-/g, ' ')}.`
  if (isTsx) {
    // Check if it's a page
    if (filePath.includes('/app/')) return 'Página do dashboard.'
    return 'Componente React.'
  }
  return 'Módulo TypeScript.'
}

function describeFromContent(content, filePath) {
  const lines = content.split('\n')
  const name = path.basename(filePath, path.extname(filePath))

  // Try to extract a meaningful description from existing comments
  for (const line of lines.slice(0, 20)) {
    const commentMatch = line.match(/\/\/\s*(.+)/)
    if (commentMatch && commentMatch[1].length > 15 && !commentMatch[1].includes('===')) {
      return commentMatch[1].trim()
    }
  }

  // Descriptive fallback based on directory + name
  const dir = path.dirname(filePath).split('/').pop()
  const humanName = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const dirDescriptions = {
    'ai': 'IA e geração de conteúdo',
    'analytics': 'Analytics e tracking',
    'assessments': 'Avaliações físicas',
    'auth': 'Autenticação',
    'blog': 'Blog e artigos',
    'cache': 'Cache e prefetch',
    'calendar': 'Calendário e lembretes',
    'chat': 'Chat em tempo real',
    'dashboard': 'Dashboard e métricas',
    'charts': 'Gráficos e visualizações',
    'debug': 'Debug e diagnóstico',
    'financial': 'Módulo financeiro',
    'landing': 'Landing page',
    'layout': 'Layout e navegação',
    'onboarding': 'Onboarding de novos usuários',
    'payments': 'Pagamentos',
    'pricing': 'Precificação e planos',
    'profile': 'Perfil do usuário',
    'providers': 'Context providers React',
    'pwa': 'PWA e service worker',
    'seo': 'SEO e structured data',
    'settings': 'Configurações',
    'shared': 'Componentes compartilhados',
    'student': 'Área do aluno',
    'students': 'Gestão de alunos',
    'ui': 'Design System UI',
    'workouts': 'Treinos e exercícios',
    'xp': 'Sistema de XP e gamificação',
  }

  const context = dirDescriptions[dir] || dir
  return `${humanName} — ${context}`
}

function generateHeader(filePath, content) {
  const relativePath = path.relative(ROOT, filePath)
  const exports = getExports(content)
  const hooks = getImportedHooks(content)
  const features = detectFeatures(content, filePath)
  const purpose = detectPurpose(content, filePath)
  const description = describeFromContent(content, relativePath)

  const lines = []
  lines.push(`/**`)
  lines.push(` * ${relativePath}`)
  lines.push(` *`)
  lines.push(` * ${description}`)

  if (exports.length) {
    lines.push(` *`)
    lines.push(` * Exports: ${exports.join(', ')}`)
  }

  if (hooks.length) {
    lines.push(` * Hooks: ${hooks.join(', ')}`)
  }

  if (features.length) {
    lines.push(` * Features: ${features.join(' · ')}`)
  }

  lines.push(` */`)
  return lines.join('\n')
}

// Main
let totalProcessed = 0
let totalSkipped = 0

for (const dir of dirs) {
  const fullDir = path.resolve(ROOT, dir)
  const files = execSync(`find "${fullDir}" -name '*.tsx' -o -name '*.ts'`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort()

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8')

    if (hasHeader(content)) {
      totalSkipped++
      continue
    }

    const header = generateHeader(filePath, content)

    // Insert header before 'use client' or at top
    let newContent
    if (content.startsWith("'use client'")) {
      newContent = header + '\n\n' + content
    } else if (content.startsWith('"use client"')) {
      newContent = header + '\n\n' + content
    } else {
      newContent = header + '\n\n' + content
    }

    writeFileSync(filePath, newContent, 'utf-8')
    totalProcessed++
    console.log(`✅ ${path.relative(ROOT, filePath)}`)
  }
}

console.log(`\n📊 Resultado: ${totalProcessed} headers adicionados, ${totalSkipped} já tinham.`)
