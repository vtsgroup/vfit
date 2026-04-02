#!/usr/bin/env node

/**
 * smoke-notifications.mjs — Cria notificações de teste via API admin
 *
 * Uso:
 *   npm run smoke:notifications:local           # Cria notificações para todos os perfis
 *   npm run smoke:notifications:local:clean      # Limpa notificações de smoke criadas anteriormente
 *
 * Env vars (.env.local):
 *   SMOKE_BASE_URL          — Base da API (default: https://api.iapersonal.app.br)
 *   SMOKE_ADMIN_TOKEN       — Token de super_admin (obrigatório)
 *   SMOKE_PERSONAL_TOKEN    — Token de personal (para resolver user_id)
 *   SMOKE_STUDENT_TOKEN     — Token de student (para resolver user_id)
 *   SMOKE_CLEAN             — Se "1", limpa notificações ao invés de criar
 *
 * O que cria (por perfil):
 *   - welcome       (welcome.personal / welcome.student)
 *   - workout.new   (novo treino)
 *   - payment.*     (confirmado, cobrança, recebido, vencido)
 *   - student.new   (novo aluno — só personal)
 *   - assessment.*  (avaliação pronta, concluída, PDF)
 *   - message.new   (nova mensagem)
 *   - calendar.reminder
 *   - trial.expiring
 *   - system        (notificação genérica)
 */

import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')

// ─── Config ───────────────────────────────────────────
const baseUrl = (process.env.SMOKE_BASE_URL || 'https://api.iapersonal.app.br').replace(/\/$/, '')
const adminToken = process.env.SMOKE_ADMIN_TOKEN || ''
const personalToken = process.env.SMOKE_PERSONAL_TOKEN || ''
const studentToken = process.env.SMOKE_STUDENT_TOKEN || ''
const shouldClean = process.env.SMOKE_CLEAN === '1' || process.argv.includes('--clean')
const timeoutMs = 15_000
const runId = `smoke-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`

// ─── Helpers ──────────────────────────────────────────
function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length < 2) return null
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

async function apiRequest(method, path, token, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await res.text()
    let parsed = null
    try { parsed = text ? JSON.parse(text) : null } catch { parsed = null }

    return { ok: res.ok, status: res.status, data: parsed?.data ?? parsed }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 0, data: null, error: msg }
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveUserId(token, label) {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (payload?.sub) return payload.sub

  const res = await apiRequest('GET', '/api/v1/auth/me', token)
  if (res.ok && res.data?.user?.id) return res.data.user.id

  console.warn(`[warn] Não foi possível resolver user_id para ${label}`)
  return null
}

// ─── Notification Templates ──────────────────────────
function makePersonalNotifications(userId) {
  const prefix = `[SMOKE ${runId}]`
  return [
    {
      user_id: userId,
      type: 'welcome',
      title: `${prefix} Bem-vindo ao VFIT!`,
      message: 'Olá personal! Comece cadastrando seus alunos e criando treinos.',
      link: '/dashboard',
    },
    {
      user_id: userId,
      type: 'student',
      title: `${prefix} Novo Aluno`,
      message: 'João Silva se cadastrou como seu aluno.',
      link: '/dashboard/students',
    },
    {
      user_id: userId,
      type: 'workout',
      title: `${prefix} Treino Gerado`,
      message: 'O treino "Hipertrofia - Superior A" foi criado com sucesso.',
      link: '/dashboard/workouts',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Pagamento Recebido`,
      message: 'Maria Oliveira pagou R$ 150,00 via PIX.',
      link: '/dashboard/payments',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Pagamento Vencido`,
      message: 'Carlos Santos tem uma cobrança de R$ 120,00 vencida há 3 dias.',
      link: '/dashboard/payments',
    },
    {
      user_id: userId,
      type: 'assessment',
      title: `${prefix} Avaliação Concluída`,
      message: 'Ana Costa completou uma avaliação física.',
      link: '/dashboard/assessments',
    },
    {
      user_id: userId,
      type: 'message',
      title: `${prefix} Nova Mensagem`,
      message: 'Pedro Lima: "Oi professor, amanhã posso ir 30min antes?"',
      link: '/dashboard/messages',
    },
    {
      user_id: userId,
      type: 'calendar',
      title: `${prefix} Lembrete de Agenda`,
      message: 'Treino com João Silva em 1 hora • 14:00 - Sala 2.',
      link: '/dashboard/calendar',
    },
    {
      user_id: userId,
      type: 'subscription',
      title: `${prefix} Teste Grátis Expira em 3 dias`,
      message: 'Assine um plano para continuar usando todos os recursos.',
      link: '/dashboard/settings',
    },
    {
      user_id: userId,
      type: 'system',
      title: `${prefix} Atualização do Sistema`,
      message: 'Nova funcionalidade: Gerador de treinos com IA agora suporta periodização!',
      link: '/dashboard',
    },
  ]
}

function makeStudentNotifications(userId) {
  const prefix = `[SMOKE ${runId}]`
  return [
    {
      user_id: userId,
      type: 'welcome',
      title: `${prefix} Bem-vindo ao VFIT!`,
      message: 'Olá aluno! Seus treinos estarão disponíveis em breve.',
      link: '/dashboard',
    },
    {
      user_id: userId,
      type: 'workout',
      title: `${prefix} Novo Treino Disponível`,
      message: 'O treino "Hipertrofia - Superior A" foi criado para você.',
      link: '/dashboard/workouts',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Pagamento Confirmado`,
      message: 'Pagamento de R$ 150,00 confirmado via PIX.',
      link: '/dashboard/payments',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Nova Cobrança`,
      message: 'Você tem uma cobrança de R$ 120,00 via boleto. Vencimento em 5 dias.',
      link: '/dashboard/payments',
    },
    {
      user_id: userId,
      type: 'assessment',
      title: `${prefix} Avaliação Pronta!`,
      message: 'Seu personal finalizou sua avaliação. Toque para ver seus resultados!',
      link: '/dashboard/assessments',
    },
    {
      user_id: userId,
      type: 'assessment',
      title: `${prefix} PDF da Avaliação Pronto`,
      message: 'Seu PDF está pronto para baixar e compartilhar.',
      link: '/dashboard/assessments',
    },
    {
      user_id: userId,
      type: 'message',
      title: `${prefix} Nova Mensagem`,
      message: 'Prof. Victor: "Treino de amanhã será focado em pernas, traz sua caneleira!"',
      link: '/dashboard/messages',
    },
    {
      user_id: userId,
      type: 'calendar',
      title: `${prefix} Lembrete de Agenda`,
      message: 'Lembrete: Treino com Prof. Victor em 15 minutos • 09:00.',
      link: '/dashboard/calendar',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Pagamento Vencido`,
      message: 'Você tem uma cobrança de R$ 120,00 vencida. Regularize para manter o acesso.',
      link: '/dashboard/payments',
    },
    {
      user_id: userId,
      type: 'system',
      title: `${prefix} Novidade!`,
      message: 'Agora você pode acompanhar sua evolução com gráficos interativos no dashboard.',
      link: '/dashboard',
    },
  ]
}

function makeAdminNotifications(userId) {
  const prefix = `[SMOKE ${runId}]`
  return [
    {
      user_id: userId,
      type: 'system',
      title: `${prefix} Dashboard Admin`,
      message: '42 novos cadastros esta semana. Taxa de conversão: 68%.',
      link: '/dashboard/admin',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Saque PIX Solicitado`,
      message: 'Victor Duarte solicitou saque de R$ 2.500,00.',
      link: '/dashboard/admin/payments',
    },
    {
      user_id: userId,
      type: 'payment',
      title: `${prefix} Saque PIX Concluído`,
      message: 'Saque de R$ 2.500,00 para Victor Duarte processado com sucesso.',
      link: '/dashboard/admin/payments',
    },
    {
      user_id: userId,
      type: 'student',
      title: `${prefix} Novo Personal Cadastrado`,
      message: 'Roberto Ferreira (CREF 012345-G/SP) se cadastrou na plataforma.',
      link: '/dashboard/admin/users',
    },
    {
      user_id: userId,
      type: 'system',
      title: `${prefix} Alerta de Sistema`,
      message: 'Workers respondendo com latência elevada (p99: 1.2s). Verificar CF dashboard.',
      link: '/dashboard/admin',
    },
    {
      user_id: userId,
      type: 'subscription',
      title: `${prefix} Trial Expirando`,
      message: '8 personais com trial expirando nos próximos 3 dias.',
      link: '/dashboard/admin/users',
    },
    {
      user_id: userId,
      type: 'assessment',
      title: `${prefix} Relatório Semanal`,
      message: '156 avaliações realizadas nesta semana. +23% vs semana anterior.',
      link: '/dashboard/admin',
    },
    {
      user_id: userId,
      type: 'message',
      title: `${prefix} Feedback Recebido`,
      message: 'Novo feedback de melhoria: "Adicionar suporte a exercícios de yoga".',
      link: '/dashboard/admin/feedback',
    },
  ]
}

// ─── Clean Mode ──────────────────────────────────────
async function cleanNotifications(userIds) {
  console.log('\n🧹 Limpando notificações de smoke...\n')

  for (const { id, label } of userIds) {
    if (!id) {
      console.log(`  ⏭  ${label}: sem user_id, pulando`)
      continue
    }

    const res = await apiRequest('DELETE', '/api/v1/admin/smoke/notifications', adminToken, {
      user_id: id,
      prefix: '[SMOKE',
    })

    if (res.ok) {
      console.log(`  ✅ ${label}: ${res.data?.deleted ?? 0} notificações removidas`)
    } else {
      console.error(`  ❌ ${label}: erro ${res.status} — ${JSON.stringify(res.data)}`)
    }
  }

  console.log('\n✨ Limpeza concluída!\n')
}

// ─── Create Mode ─────────────────────────────────────
async function createNotifications(profiles) {
  console.log('\n🔔 Criando notificações de smoke...\n')

  let totalCreated = 0
  let totalFailed = 0

  for (const { label, userId, notifications } of profiles) {
    if (!userId) {
      console.log(`  ⏭  ${label}: sem user_id, pulando`)
      continue
    }

    console.log(`  📤 ${label} (${userId}): ${notifications.length} notificações...`)

    // Batch — API aceita até 50
    const res = await apiRequest('POST', '/api/v1/admin/smoke/notifications', adminToken, {
      notifications,
    })

    if (res.ok) {
      const count = res.data?.created ?? 0
      totalCreated += count
      console.log(`  ✅ ${label}: ${count} criadas`)
    } else {
      totalFailed += notifications.length
      console.error(`  ❌ ${label}: erro ${res.status} — ${JSON.stringify(res.data)}`)
    }
  }

  console.log(`\n✨ Resultado: ${totalCreated} criadas, ${totalFailed} falharam`)
  console.log(`📌 Prefixo: [SMOKE ${runId}]`)
  console.log('🧹 Para limpar: npm run smoke:notifications:local:clean\n')

  if (totalFailed > 0) process.exit(1)
}

// ─── Main ────────────────────────────────────────────
async function main() {
  if (!adminToken) {
    console.error('[smoke-notifications] SMOKE_ADMIN_TOKEN não informado.')
    console.error('  → Configure em .env.local ou exporte no terminal.')
    process.exit(1)
  }

  console.log(`\n🎯 Base URL: ${baseUrl}`)
  console.log(`🔑 Admin token: ${adminToken ? '✅ presente' : '❌ ausente'}`)
  console.log(`👤 Personal token: ${personalToken ? '✅ presente' : '⚠️  ausente'}`)
  console.log(`🎓 Student token: ${studentToken ? '✅ presente' : '⚠️  ausente'}`)

  // Resolve user IDs from tokens
  const adminPayload = decodeJwtPayload(adminToken)
  const adminUserId = adminPayload?.sub || null

  const personalUserId = await resolveUserId(personalToken, 'personal')
  const studentUserId = await resolveUserId(studentToken, 'student')

  const userIds = [
    { id: personalUserId, label: 'Personal' },
    { id: studentUserId, label: 'Student' },
    { id: adminUserId, label: 'Admin' },
  ]

  console.log(`\n📋 User IDs resolvidos:`)
  for (const { id, label } of userIds) {
    console.log(`  ${id ? '✅' : '⏭ '} ${label}: ${id || '(não disponível)'}`)
  }

  if (shouldClean) {
    await cleanNotifications(userIds)
    return
  }

  // Build notification sets
  const profiles = []

  if (personalUserId) {
    profiles.push({
      label: 'Personal',
      userId: personalUserId,
      notifications: makePersonalNotifications(personalUserId),
    })
  }

  if (studentUserId) {
    profiles.push({
      label: 'Student',
      userId: studentUserId,
      notifications: makeStudentNotifications(studentUserId),
    })
  }

  if (adminUserId) {
    // Admin gets admin-specific + some personal notifications for completeness
    profiles.push({
      label: 'Admin',
      userId: adminUserId,
      notifications: makeAdminNotifications(adminUserId),
    })
  }

  if (profiles.length === 0) {
    console.error('\n❌ Nenhum user_id resolvido. Verifique os tokens.')
    process.exit(1)
  }

  await createNotifications(profiles)
}

main().catch((err) => {
  console.error('[smoke-notifications] failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
