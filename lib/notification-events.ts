// ============================================
// notification-events.ts — Registry de eventos de notificação
// ============================================
//
// O que faz:
//   Define os 18 tipos de evento do sistema e resolve evento + dados
//   em payload completo (title, message, link, domainType, emailTemplate).
//   Usado em todos os places que criam notificações no worker.
//
// Exports principais:
//   NotificationEventType — union type (workout.new, payment.*, student.new, etc.)
//   NotificationEventPayload — { title, message, link, domainType, emailTemplate }
//   resolveNotificationEvent(type, data) → NotificationEventPayload
// ============================================
export type NotificationEventType =
  | 'workout.new'
  | 'message.new'
  | 'calendar.reminder'
  | 'welcome.personal'
  | 'welcome.student'
  | 'payment.confirmed'
  | 'payment.charge.created'
  | 'payment.subscription.created'
  | 'payment.transfer.requested'
  | 'payment.transfer.completed'
  | 'payment.transfer.failed'
  | 'payment.received'
  | 'payment.overdue'
  | 'student.new'
  | 'assessment.ready'
  | 'assessment.pdf.ready'
  | 'assessment.completed'
  | 'trial.expiring'

export interface NotificationEventPayload {
  title: string
  message: string
  link: string
  domainType: 'workout' | 'payment' | 'student' | 'assessment' | 'subscription' | 'message' | 'welcome' | 'calendar' | 'system'
  emailTemplate:
    | 'invitation'
    | 'payment-confirmed'
    | 'payment-overdue'
    | 'subscription-expiring'
    | null
}

export function resolveNotificationEvent(
  type: NotificationEventType,
  input: Record<string, string | number>
): NotificationEventPayload {
  switch (type) {
    case 'calendar.reminder': {
      const lead = String(input.leadLabel || input.minutesLeft || 'em breve')
      const title = String(input.title || 'Compromisso')
      const when = String(input.when || '')
      const role = String(input.role || '')
      const counterpart = String(input.counterpartName || '')

      const msg = role === 'personal'
        ? `Lembrete: ${title} ${lead}${counterpart ? ` • ${counterpart}` : ''}${when ? ` • ${when}` : ''}`
        : `Lembrete: ${title} ${lead}${counterpart ? ` • com ${counterpart}` : ''}${when ? ` • ${when}` : ''}`

      return {
        title: 'Lembrete de Agenda',
        message: msg,
        link: '/dashboard/calendar',
        domainType: 'calendar',
        emailTemplate: null,
      }
    }
    case 'workout.new':
      return {
        title: 'Novo Treino Disponível',
        message: `O treino "${input.workoutName}" foi criado para você.`,
        link: '/dashboard/workouts',
        domainType: 'workout',
        emailTemplate: 'invitation',
      }

    case 'message.new':
      return {
        title: `${input.senderName || 'Nova mensagem'}`,
        message: String(input.preview || 'Você recebeu uma nova mensagem.'),
        link: input.conversationId ? `/dashboard/messages?conversation=${input.conversationId}` : '/dashboard/messages',
        domainType: 'message',
        emailTemplate: null,
      }

    case 'welcome.personal':
      return {
        title: 'Bem-vindo ao VFIT!',
        message: `Olá ${input.firstName || 'personal'}! Comece cadastrando seus alunos e criando treinos.`,
        link: '/dashboard',
        domainType: 'welcome',
        emailTemplate: null,
      }

    case 'welcome.student':
      return {
        title: 'Bem-vindo ao VFIT!',
        message: `Olá ${input.firstName || 'aluno'}! Seus treinos estarão disponíveis em breve.`,
        link: '/dashboard',
        domainType: 'welcome',
        emailTemplate: null,
      }

    case 'payment.confirmed':
      return {
        title: 'Pagamento confirmado',
        message: `Pagamento de ${input.amount} confirmado via ${input.method}.`,
        link: input.paymentId ? `/dashboard/payments/view?id=${input.paymentId}` : '/dashboard/payments',
        domainType: 'payment',
        emailTemplate: 'payment-confirmed',
      }

    case 'payment.charge.created':
      return {
        title: 'Nova Cobrança',
        message: `Você tem uma cobrança de ${input.amount} via ${input.method}.`,
        link: input.paymentId ? `/dashboard/payments/checkout?id=${input.paymentId}` : '/dashboard/payments',
        domainType: 'payment',
        emailTemplate: null,
      }

    case 'payment.subscription.created':
      return {
        title: 'Assinatura criada',
        message: input.cycle
          ? `Cobrança recorrente de ${input.amount}/${String(input.cycle).toLowerCase()} via ${input.method}.`
          : `Cobrança recorrente de ${input.amount} via ${input.method}.`,
        link: '/dashboard/payments',
        domainType: 'subscription',
        emailTemplate: null,
      }

    case 'payment.transfer.requested':
      return {
        title: 'Saque PIX Solicitado',
        message: `Seu saque de ${input.amount} está sendo processado. Você será notificado quando concluir.`,
        link: '/dashboard/payments/withdraw',
        domainType: 'payment',
        emailTemplate: null,
      }

    case 'payment.transfer.completed':
      return {
        title: 'Saque PIX Concluído',
        message: `Seu saque de ${input.amount} foi processado com sucesso.`,
        link: '/dashboard/payments/withdraw',
        domainType: 'payment',
        emailTemplate: null,
      }

    case 'payment.transfer.failed':
      return {
        title: 'Saque PIX Falhou',
        message: `Seu saque de ${input.amount} falhou: ${input.reason || 'Motivo não informado'}. O saldo foi estornado.`,
        link: '/dashboard/payments/withdraw',
        domainType: 'payment',
        emailTemplate: null,
      }
    case 'payment.received':
      return {
        title: 'Pagamento Recebido',
        message: `${input.studentName} pagou ${input.amount}.`,
        link: '/dashboard/payments',
        domainType: 'payment',
        emailTemplate: 'payment-confirmed',
      }
    case 'payment.overdue':
      return {
        title: 'Pagamento Vencido',
        message: `Você tem uma cobrança de ${input.amount} vencida. Regularize para manter o acesso.`,
        link: '/dashboard/payments',
        domainType: 'payment',
        emailTemplate: 'payment-overdue',
      }
    case 'student.new':
      return {
        title: 'Novo Aluno',
        message: `${input.studentName} se cadastrou como seu aluno.`,
        link: '/dashboard/students',
        domainType: 'student',
        emailTemplate: null,
      }

    case 'assessment.ready':
      return {
        title: 'Avaliação Pronta!',
        message: input.preview
          ? String(input.preview)
          : `${input.personalName || 'Seu personal'} finalizou sua avaliação. Toque para ver seus resultados!`,
        link: input.assessmentId ? `/dashboard/assessments/view?id=${input.assessmentId}` : '/dashboard/assessments',
        domainType: 'assessment',
        emailTemplate: null,
      }
    case 'assessment.completed':
      return {
        title: 'Avaliação Concluída',
        message: `${input.studentName} completou uma avaliação física.`,
        link: '/dashboard/assessments',
        domainType: 'assessment',
        emailTemplate: null,
      }

    case 'assessment.pdf.ready':
      return {
        title: 'PDF da Avaliação Pronto',
        message: 'Seu PDF está pronto para baixar e compartilhar.',
        link: input.assessmentId ? `/dashboard/assessments/view?id=${input.assessmentId}` : '/dashboard/assessments',
        domainType: 'assessment',
        emailTemplate: null,
      }
    case 'trial.expiring':
      return {
        title: `Teste Grátis Expira em ${input.daysLeft} dia${Number(input.daysLeft) > 1 ? 's' : ''}`,
        message: 'Assine um plano para continuar usando todos os recursos.',
        link: '/dashboard/settings',
        domainType: 'subscription',
        emailTemplate: 'subscription-expiring',
      }
    default:
      return {
        title: 'Nova atualização',
        message: 'Você recebeu uma nova atualização.',
        link: '/dashboard',
        domainType: 'workout',
        emailTemplate: null,
      }
  }
}
