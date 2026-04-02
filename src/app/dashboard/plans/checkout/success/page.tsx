/**
 * src/app/dashboard/plans/checkout/success/page.tsx
 *
 * Checkout Success / Payment Result Page
 *
 * Exports: CheckoutSuccessPage
 * Hooks: useSearchParams, useRouter
 * Features: Auth guard · 'use client' · DSIcon · Button · GlassCard · MD3
 * States: pix_pending (QR code) · boleto_pending · card_confirmed · success
 */

// ============================================
// Checkout Result — Pix QR, Boleto link, Card success
// Shows post-checkout result based on payment method
// ============================================

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { AuthGuard } from '@/components/auth'
import { CheckoutPageSkeleton } from '@/components/ui/page-skeletons'
import { toast } from '@/stores/app-store'
import { PLAN_NAMES, type PlatformPlanSlug } from '@/hooks/use-platform-subscription'

/* ─── Countdown timer hook ─── */
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetDate) return

    function calc() {
      const now = Date.now()
      const target = new Date(targetDate!).getTime()
      const diff = target - now
      if (diff <= 0) { setTimeLeft('Expirado'); return }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

/* ─── Copy to clipboard ─── */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  } catch {
    toast.error('Não foi possível copiar')
  }
}

/* ─── Pix Result ─── */
function PixResult({ planName, amount, pixCode, pixQrImage, expiresAt }: {
  planName: string
  amount: string
  pixCode: string
  pixQrImage: string | null
  expiresAt: string | null
}) {
  const countdown = useCountdown(expiresAt)

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Status icon */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <DSIcon name="clock" size={28} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-black text-text-primary tracking-tight">
          Aguardando pagamento Pix
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Plano <strong className="text-text-primary">{planName}</strong> — R$ {amount}
        </p>
      </div>

      {/* QR Code placeholder */}
      <GlassCard variant="surface" padding="lg" radius="2xl" className="text-center">
        <p className="text-xs font-bold text-text-secondary mb-3">Escaneie o QR Code</p>
        <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3">
          {pixQrImage ? (
            <img
              src={`data:image/png;base64,${pixQrImage}`}
              alt="QR Code Pix"
              className="h-full w-full rounded-xl object-contain"
            />
          ) : (
            <div className="h-full w-full rounded-xl bg-bg-tertiary flex items-center justify-center">
              <DSIcon name="qrcode" size={60} className="text-text-muted" />
            </div>
          )}
        </div>
        {countdown && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <DSIcon name="clock" size={14} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400 tabular-nums">{countdown}</span>
          </div>
        )}
      </GlassCard>

      {/* Pix copy paste */}
      <GlassCard variant="surface" padding="md" radius="2xl">
        <p className="text-xs font-bold text-text-secondary mb-2">Ou copie o código Pix</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-bg-tertiary px-3 py-2.5 text-xs text-text-muted font-mono break-all max-h-16 overflow-y-auto">
            {pixCode || 'Código será exibido aqui...'}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(pixCode)}
            title="Copiar código"
          >
            <DSIcon name="copy" size={14} />
          </Button>
        </div>
      </GlassCard>

      {/* Instructions */}
      <div className="space-y-2">
        {[
          'Abra o app do seu banco',
          'Escolha pagar com Pix (copia e cola ou QR Code)',
          'Escaneie ou cole o código acima',
          'Confirme o pagamento',
        ].map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
              {i + 1}
            </div>
            <span className="text-sm text-text-secondary">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Boleto Result ─── */
function BoletoResult({ planName, amount, boletoUrl }: {
  planName: string
  amount: string
  boletoUrl: string
}) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
          <DSIcon name="fileText" size={28} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-black text-text-primary tracking-tight">
          Boleto gerado com sucesso
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Plano <strong className="text-text-primary">{planName}</strong> — R$ {amount}
        </p>
      </div>

      <GlassCard variant="surface" padding="lg" radius="2xl" className="text-center space-y-4">
        <DSIcon name="check" size={24} className="text-brand-primary mx-auto" />
        <p className="text-sm text-text-secondary">
          O boleto vence em <strong className="text-text-primary">3 dias úteis</strong>.
          Após o pagamento, seu plano será ativado automaticamente em até 24h.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            if (boletoUrl) window.open(boletoUrl, '_blank')
          }}
        >
          <DSIcon name="download" size={16} />
          Abrir Boleto
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => copyToClipboard(boletoUrl)}
        >
          <DSIcon name="copy" size={14} />
          Copiar link do boleto
        </Button>
      </GlassCard>

      <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 flex items-center gap-2.5">
        <DSIcon name="alertTriangle" size={16} className="text-amber-400 shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Atenção:</strong> boletos podem levar até 3 dias úteis para compensação. O plano é ativado automaticamente.
        </p>
      </div>
    </div>
  )
}

/* ─── Card Success ─── */
function CardSuccess({ planName, amount }: {
  planName: string
  amount: string
}) {
  const router = useRouter()

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      {/* Success animation */}
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-primary/10 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <DSIcon name="check" size={36} className="text-brand-primary" />
        </div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">
          Pagamento confirmado! 🎉
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Plano <strong className="text-brand-primary">{planName}</strong> ativado — R$ {amount}
        </p>
      </div>

      <GlassCard variant="surface" padding="lg" radius="2xl" className="space-y-4">
        <div className="space-y-2">
          {[
            { icon: 'check' as const, text: 'Plano ativado com sucesso' },
            { icon: 'zap' as const, text: 'Todos os recursos liberados' },
            { icon: 'shieldCheck' as const, text: 'Garantia de 7 dias ativa' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
                <DSIcon name={item.icon} size={12} className="text-brand-primary" />
              </div>
              <span className="text-sm text-text-secondary">{item.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push('/dashboard')}
        >
          <DSIcon name="home" size={16} />
          Ir para o Dashboard
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/dashboard/plans')}
        >
          Ver meu plano
        </Button>
      </div>
    </div>
  )
}

/* ─── Success Content ─── */
function SuccessContent() {
  const searchParams = useSearchParams()

  const status = searchParams.get('status') || 'success'
  const method = searchParams.get('method') || 'card'
  const plan = (searchParams.get('plan') || 'pro') as PlatformPlanSlug
  const amount = searchParams.get('amount') || '29,90'
  const pixCode = searchParams.get('pix_code') || ''
  const boletoUrl = searchParams.get('boleto_url') || ''
  const expiresAt = searchParams.get('expires_at') || null

  // Read QR code base64 from sessionStorage (stored before redirect)
  const [pixQrImage, setPixQrImage] = useState<string | null>(null)
  useEffect(() => {
    try {
      const img = sessionStorage.getItem('pix_qr_image')
      if (img) { setPixQrImage(img); sessionStorage.removeItem('pix_qr_image') }
    } catch {}
  }, [])

  const planName = PLAN_NAMES[plan] || 'Trainer'

  if (method === 'pix' && status === 'pending') {
    return <PixResult planName={planName} amount={amount} pixCode={pixCode} pixQrImage={pixQrImage} expiresAt={expiresAt} />
  }

  if (method === 'boleto') {
    return <BoletoResult planName={planName} amount={amount} boletoUrl={boletoUrl} />
  }

  // card_confirmed or any other success state
  return <CardSuccess planName={planName} amount={amount} />
}

/* ─── Main Page ─── */
export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <div className="w-full max-w-3xl mx-auto py-8 px-4">
        <Suspense fallback={
          <CheckoutPageSkeleton />
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
