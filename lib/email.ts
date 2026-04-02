/**
 * lib/email.ts
 *
 * Email Helpers - Queue-based Email Sending
 *
 * Exports: EmailPayload, EmailTemplate
 */

// ============================================
// Email Helpers - Queue-based Email Sending
// ============================================
// Emails são enviados via Queue (assíncrono).
// O consumer real será implementado no LOTE 06.
// Por enquanto, enfileira a mensagem no EMAIL_QUEUE.
// ============================================

import { enqueueWithRetry } from './queue'

export interface EmailPayload {
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, string>
}

export type EmailTemplate =
  | 'verify-email'
  | 'reset-password'
  | 'welcome-personal'
  | 'welcome-student'
  | 'invitation'
  | 'student-registered'
  | 'payment-confirmed'
  | 'payment-overdue'
  | 'subscription-expiring'
  | 'assessment-report'

/**
 * Enfileira email para envio assíncrono
 * Se a Queue não estiver disponível, loga no console (graceful degradation)
 */
export async function sendEmail(
  queue: Queue | undefined,
  payload: EmailPayload,
  requestId?: string
): Promise<void> {
  const result = await enqueueWithRetry(
    queue,
    {
      type: 'email',
      ...payload,
    },
    {
      queueName: 'EMAIL_QUEUE',
      requestId,
      maxAttempts: 3,
      baseBackoffMs: 120,
      maxBackoffMs: 800,
    }
  )

  if (!result.queued) {
    console.log('[EMAIL] Queue unavailable/failure, skipping email:', payload.template, 'to:', payload.to)
    return
  }
}

/**
 * Envia email de verificação de conta
 */
export async function sendVerificationEmail(
  queue: Queue | undefined,
  to: string,
  name: string,
  token: string,
  baseUrl = 'https://iapersonal.app.br',
  requestId?: string
): Promise<void> {
  await sendEmail(queue, {
    to,
    subject: 'Verifique sua conta - VFIT',
    template: 'verify-email',
    data: {
      name,
      verification_url: `${baseUrl}/verify-email?token=${token}`,
    },
  }, requestId)
}

/**
 * Envia email de reset de senha
 */
export async function sendResetPasswordEmail(
  queue: Queue | undefined,
  to: string,
  name: string,
  token: string,
  resetCode?: string,
  baseUrl = 'https://iapersonal.app.br',
  requestId?: string
): Promise<void> {
  await sendEmail(queue, {
    to,
    subject: 'Redefinir senha - VFIT',
    template: 'reset-password',
    data: {
      name,
      reset_url: `${baseUrl}/reset-password?token=${token}`,
      reset_code: resetCode || '',
      expiry: '1 hora',
    },
  }, requestId)
}

/**
 * Envia email de boas-vindas para personal
 */
export async function sendWelcomePersonalEmail(
  queue: Queue | undefined,
  to: string,
  name: string,
  requestId?: string
): Promise<void> {
  await sendEmail(queue, {
    to,
    subject: 'Bem-vindo ao VFIT! 🏋️',
    template: 'welcome-personal',
    data: { name },
  }, requestId)
}

/**
 * Envia convite para aluno
 */
export async function sendStudentInvitationEmail(
  queue: Queue | undefined,
  to: string,
  studentName: string,
  personalName: string,
  invitationToken: string,
  baseUrl = 'https://iapersonal.app.br',
  requestId?: string
): Promise<void> {
  await sendEmail(queue, {
    to,
    subject: `${personalName} te convidou para o VFIT`,
    template: 'invitation',
    data: {
      student_name: studentName,
      personal_name: personalName,
      invitation_url: `${baseUrl}/convite/${invitationToken}`,
    },
  }, requestId)
}
