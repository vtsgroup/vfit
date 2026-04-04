import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendEmailWithResend } from '@lib/email-resend'

describe('sendEmailWithResend()', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('deve enviar payload com template invitation', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'mail_123' }), { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await sendEmailWithResend('resend_test_key', {
      to: 'aluno@example.com',
      subject: 'Convite teste',
      template: 'invitation',
      data: {
        student_name: 'Aluno Teste',
        personal_name: 'Personal Teste',
        invitation_url: 'https://vfit.app.br/register/student?token=abc',
      },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const init = call[1]
    const body = JSON.parse(String(init.body)) as {
      from: string
      to: string
      subject: string
      html: string
      text: string
    }

    expect(body.to).toBe('aluno@example.com')
    expect(body.subject).toBe('Convite teste')
    expect(body.html).toContain('Personal Teste')
    expect(body.html).toContain('https://vfit.app.br/register/student?token=abc')
  })

  it('deve lançar erro quando API do Resend falhar', async () => {
    const fetchMock = vi.fn(async () => new Response('bad request', { status: 400 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await expect(
      sendEmailWithResend('resend_test_key', {
        to: 'erro@example.com',
        subject: 'Erro',
        template: 'payment-confirmed',
        data: {},
      })
    ).rejects.toThrow('Resend error: 400 bad request')
  })
})
