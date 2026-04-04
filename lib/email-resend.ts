/**
 * lib/email-resend.ts
 *
 * Resend Email Sender
 */

// ============================================
// Resend Email Sender
// ============================================

import type { EmailPayload } from './email'

const DEFAULT_FROM = 'VFIT <noreply@vfit.app.br>'

function renderDarkEmail(options: {
  eyebrow: string
  title: string
  subtitle?: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footnote?: string
}) {
  const cta = options.ctaLabel && options.ctaUrl
    ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${options.ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
          ${options.ctaLabel}
        </a>
      </div>
    `
    : ''

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 28px 24px; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 700;">${options.eyebrow}</p>
        <h1 style="color: #fff; margin: 8px 0 0; font-size: 24px; font-weight: 700;">${options.title}</h1>
        ${options.subtitle ? `<p style="color: rgba(255,255,255,0.88); margin: 8px 0 0; font-size: 14px;">${options.subtitle}</p>` : ''}
      </div>
      <div style="padding: 32px 24px; color: #d4d4d4; font-size: 15px; line-height: 1.6;">
        ${options.bodyHtml}
        ${cta}
        ${options.footnote ? `<p style="color: #737373; font-size: 12px; margin-top: 16px;">${options.footnote}</p>` : ''}
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #262626; text-align: center;">
        <p style="color: #525252; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} VFIT · vfit.app.br</p>
      </div>
    </div>
  `
}

function renderTemplate(template: EmailPayload['template'], data: EmailPayload['data']) {
  switch (template) {
    case 'invitation':
      return {
        subject: data.personal_name
          ? `${data.personal_name} te convidou para o VFIT`
          : 'Convite para o VFIT',
        text: `Olá ${data.student_name || ''}!\n\nVocê foi convidado para o VFIT por ${data.personal_name || 'seu personal trainer'}.\n\nAcesse o link abaixo para criar sua conta e começar a acompanhar seus treinos:\n${data.invitation_url}\n\nSe você não esperava este convite, pode ignorar esta mensagem.\n`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">VFIT</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Sua plataforma de treinos inteligente</p>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #f5f5f5; margin: 0 0 16px; font-size: 20px;">Olá ${data.student_name || 'aluno'}! 👋</h2>
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                <strong style="color: #10b981;">${data.personal_name || 'Seu personal trainer'}</strong> te convidou para acompanhar seus treinos pela plataforma VFIT.
              </p>
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Crie sua conta e comece a acompanhar treinos, evolução e muito mais.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.invitation_url}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Aceitar Convite
                </a>
              </div>
              <p style="color: #737373; font-size: 12px; text-align: center; margin: 24px 0 0;">
                Se o botão não funcionar, copie e cole este link no navegador:<br/>
                <a href="${data.invitation_url}" style="color: #10b981; word-break: break-all;">${data.invitation_url}</a>
              </p>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: #525252; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} VFIT · vfit.app.br</p>
            </div>
          </div>
        `,
      }
    case 'verify-email':
      return {
        subject: 'Verifique sua conta - VFIT',
        text: `Olá ${data.name || ''}!\n\nVerifique sua conta no VFIT:\n${data.verification_url}\n`,
        html: renderDarkEmail({
          eyebrow: 'Verificação de conta',
          title: 'Confirme seu e-mail',
          subtitle: 'Ative sua conta para acessar todos os recursos.',
          bodyHtml: `<p>Olá <strong>${data.name || 'usuário'}</strong>! Para concluir seu cadastro, confirme seu e-mail.</p>`,
          ctaLabel: 'Verificar conta',
          ctaUrl: data.verification_url,
          footnote: `Se o botão não funcionar, copie este link: ${data.verification_url}`,
        }),
      }
    case 'reset-password':
      return {
        subject: 'Redefinir senha - VFIT',
        text: `Olá ${data.name || ''}!\n\nUse este código para recuperar sua conta: ${data.reset_code || '—'}\nOu redefina sua senha pelo link: ${data.reset_url}\n`,
        html: renderDarkEmail({
          eyebrow: 'Segurança da conta',
          title: 'Redefinir senha',
          subtitle: 'Recebemos uma solicitação para alterar sua senha.',
          bodyHtml: `
            <p>Olá <strong>${data.name || 'usuário'}</strong>! Use o botão abaixo para redefinir sua senha.</p>
            ${data.reset_code ? `<div style="margin: 16px 0; border: 1px dashed #3f3f46; border-radius: 10px; padding: 12px 14px; background: #111827;"><p style="margin: 0; font-size: 12px; color: #a3a3a3;">Código de recuperação</p><p style="margin: 6px 0 0; font-size: 22px; letter-spacing: 4px; color: #f5f5f5; font-weight: 700;">${data.reset_code}</p></div>` : ''}
            <p style="margin-top: 10px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
          `,
          ctaLabel: 'Redefinir senha',
          ctaUrl: data.reset_url,
          footnote: `Link direto: ${data.reset_url}`,
        }),
      }
    case 'welcome-personal':
      return {
        subject: 'Bem-vindo ao VFIT! 🏋️',
        text: `Olá ${data.name || ''}!\n\nBem-vindo ao VFIT. Seu painel está pronto para cadastrar alunos, treinos e cobranças.`,
        html: renderDarkEmail({
          eyebrow: 'Bem-vindo',
          title: 'Sua conta de personal está pronta',
          subtitle: 'Comece a operar com treinos, avaliações e pagamentos.',
          bodyHtml: `
            <p>Olá <strong>${data.name || 'Personal'}</strong>! Seu ambiente está ativo.</p>
            <ul style="margin: 12px 0 0 18px; padding: 0;">
              <li>Convide alunos em poucos cliques</li>
              <li>Crie treinos e avaliações com IA</li>
              <li>Envie cobranças e acompanhe o financeiro</li>
            </ul>
          `,
          ctaLabel: 'Abrir dashboard',
          ctaUrl: 'https://vfit.app.br/dashboard',
        }),
      }
    case 'welcome-student':
      return {
        subject: 'Bem-vindo ao VFIT! 🎯',
        text: `Olá ${data.name || ''}!\n\nBem-vindo ao VFIT. Seu app já está pronto para acompanhar treinos e evolução.`,
        html: renderDarkEmail({
          eyebrow: 'Bem-vindo',
          title: 'Seu treino começa agora',
          subtitle: 'Acompanhe exercícios, progresso e pagamentos em um só lugar.',
          bodyHtml: `<p>Olá <strong>${data.name || 'Aluno'}</strong>! Seu acesso está liberado. Entre no app para ver seus treinos e manter constância.</p>`,
          ctaLabel: 'Acessar área do aluno',
          ctaUrl: 'https://vfit.app.br/dashboard',
        }),
      }
    case 'student-registered':
      return {
        subject: `✅ ${data.student_name} completou o cadastro!`,
        text: `Olá ${data.personal_name || ''}!\n\nSeu aluno ${data.student_name} (${data.student_email}) completou o cadastro na plataforma VFIT.\n\nAgora você pode:\n- Criar treinos personalizados\n- Realizar avaliações físicas\n- Acompanhar a evolução\n\nAcesse: ${data.dashboard_url}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">VFIT</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Novo aluno cadastrado!</p>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #f5f5f5; margin: 0 0 16px; font-size: 20px;">Olá ${data.personal_name || 'Personal'}! 🎉</h2>
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                Ótima notícia! Seu aluno <strong style="color: #10b981;">${data.student_name}</strong> completou o cadastro na plataforma.
              </p>
              <div style="background: #171717; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Dados do aluno</p>
                <p style="color: #e5e5e5; font-size: 14px; margin: 0 0 8px;">👤 <strong>${data.student_name}</strong></p>
                <p style="color: #e5e5e5; font-size: 14px; margin: 0 0 8px;">✉️ ${data.student_email}</p>
                ${data.student_phone ? `<p style="color: #e5e5e5; font-size: 14px; margin: 0;">📱 ${data.student_phone}</p>` : ''}
              </div>
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                Agora você já pode:
              </p>
              <ul style="color: #a3a3a3; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
                <li>📋 <strong style="color: #e5e5e5;">Criar treinos</strong> personalizados</li>
                <li>📊 <strong style="color: #e5e5e5;">Realizar avaliações</strong> físicas</li>
                <li>💰 <strong style="color: #e5e5e5;">Configurar cobranças</strong> automáticas</li>
                <li>🤖 <strong style="color: #e5e5e5;">Usar a IA</strong> para gerar treinos</li>
              </ul>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                  Ir para o Painel
                </a>
              </div>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: #525252; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} VFIT · vfit.app.br</p>
            </div>
          </div>
        `,
      }
    case 'payment-confirmed':
      return {
        subject: 'Pagamento confirmado - VFIT',
        text: `Pagamento confirmado com sucesso no VFIT.`,
        html: renderDarkEmail({
          eyebrow: 'Financeiro',
          title: 'Pagamento confirmado',
          subtitle: 'Recebimento registrado com sucesso.',
          bodyHtml: `<p>Seu pagamento foi confirmado. O histórico financeiro já foi atualizado na plataforma.</p>`,
          ctaLabel: 'Ver pagamentos',
          ctaUrl: 'https://vfit.app.br/dashboard/payments',
        }),
      }
    case 'payment-overdue':
      return {
        subject: 'Pagamento vencido - VFIT',
        text: `Seu pagamento está vencido. Acesse o app para regularizar.`,
        html: renderDarkEmail({
          eyebrow: 'Financeiro',
          title: 'Pagamento em atraso',
          subtitle: 'Evite bloqueios e mantenha seu plano ativo.',
          bodyHtml: `<p>Identificamos uma cobrança vencida no seu cadastro. Regularize pelo painel para manter seu acesso sem interrupções.</p>`,
          ctaLabel: 'Regularizar agora',
          ctaUrl: 'https://vfit.app.br/dashboard/payments',
        }),
      }
    case 'subscription-expiring':
      return {
        subject: 'Assinatura expirando - VFIT',
        text: `Sua assinatura está próxima do vencimento. Renove para manter acesso.`,
        html: renderDarkEmail({
          eyebrow: 'Assinatura',
          title: 'Assinatura próxima do vencimento',
          subtitle: 'Renove para evitar interrupções.',
          bodyHtml: `<p>Sua assinatura está para expirar. Faça a renovação antecipada para manter todas as funcionalidades ativas.</p>`,
          ctaLabel: 'Renovar assinatura',
          ctaUrl: 'https://vfit.app.br/dashboard/settings',
        }),
      }
    case 'assessment-report': {
      const studentName = data.student_name || 'Aluno'
      const personalName = data.personal_name || 'seu personal trainer'
      const assessmentDate = data.assessment_date || new Date().toLocaleDateString('pt-BR')
      const shareUrl = data.share_url || 'https://vfit.app.br/dashboard/assessments'
      const pdfUrl = data.pdf_url || ''

      const metricsHtml = [
        data.weight_kg ? `<li style="color: #d4d4d4;">Peso: <strong style="color: #fff;">${data.weight_kg} kg</strong></li>` : '',
        data.body_fat_percentage ? `<li style="color: #d4d4d4;">% Gordura: <strong style="color: #fff;">${data.body_fat_percentage}%</strong></li>` : '',
        data.bmi ? `<li style="color: #d4d4d4;">IMC: <strong style="color: #fff;">${data.bmi}</strong></li>` : '',
        data.fat_classification ? `<li style="color: #d4d4d4;">Classificação: <strong style="color: #10b981;">${data.fat_classification}</strong></li>` : '',
      ].filter(Boolean).join('')

      return {
        subject: `Avaliação Física — ${assessmentDate} — VFIT`,
        text: `Olá ${studentName}!\n\n${personalName} finalizou sua avaliação física de ${assessmentDate}.\n\nAcesse: ${shareUrl}\n${pdfUrl ? `\nBaixar PDF: ${pdfUrl}` : ''}`,
        html: renderDarkEmail({
          eyebrow: 'Avaliação Física',
          title: `Resultado da sua Avaliação`,
          subtitle: `${assessmentDate} — por ${personalName}`,
          bodyHtml: `
            <p>Olá <strong style="color: #fff;">${studentName}</strong>! 👋</p>
            <p>Sua avaliação física está pronta. Veja os principais indicadores:</p>
            ${metricsHtml ? `<ul style="padding-left: 16px; margin: 16px 0;">${metricsHtml}</ul>` : ''}
            <p>Acesse o app para ver todos os detalhes, gráficos de evolução e recomendações personalizadas.</p>
            ${pdfUrl ? `<p style="margin-top: 12px;"><a href="${pdfUrl}" style="color: #10b981; text-decoration: underline;">📄 Baixar PDF da avaliação</a></p>` : ''}
          `,
          ctaLabel: 'Ver Avaliação Completa',
          ctaUrl: shareUrl,
          footnote: 'Esta avaliação foi gerada por seu personal trainer através da plataforma VFIT.',
        }),
      }
    }
    default:
      return {
        subject: 'VFIT',
        text: 'Você tem uma nova mensagem do VFIT.',
        html: `<div style="font-family: Arial, sans-serif; color: #111;">Você tem uma nova mensagem do VFIT.</div>`,
      }
  }
}

export async function sendEmailWithResend(
  apiKey: string,
  payload: EmailPayload,
  from = DEFAULT_FROM
): Promise<void> {
  const rendered = renderTemplate(payload.template, payload.data)
  const subject = payload.subject || rendered.subject

  console.log(`[Resend] Sending "${payload.template}" to ${payload.to} from ${from}`)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject,
      text: rendered.text,
      html: rendered.html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Resend] Failed: ${response.status} ${errorText}`)
    throw new Error(`Resend error: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  console.log(`[Resend] Success:`, JSON.stringify(result))
}
