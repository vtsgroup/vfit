/**
 * src/app/dashboard/affiliates/page.tsx
 *
 * Affiliates page — Ultra-Premium v2
 *
 * Exports: AffiliatesPage
 * Hooks: useState, useAffiliateDashboard, useAffiliateLink, useReferrals, useCommissions, useActivateAffiliate
 * Features: 'use client' · DSIcon · Glass morphism · Animated tier cards
 */

// ============================================
// Affiliates page — Ultra-Premium v2
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { EmptyState, SkeletonList } from '@/components/ui'
import { Pagination } from '@/components/ui/pagination'
import { AffiliatesPageSkeleton } from '@/components/ui/page-skeletons'
import { GlassCard, CardContent as GlassCardContent } from '@/components/ui/glass-card'
import { MD3Input } from '@/components/ui/md3-input'
import { toast } from '@/stores/app-store'
import {
  useAffiliateDashboard,
  useAffiliateLink,
  useReferrals,
  useCommissions,
  useActivateAffiliate,
  useRequestWithdrawal,
} from '@/hooks/use-affiliates'

function formatCurrency(value: number) {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

// ── Tier config ─────────────────────────────
interface TierConfig {
  name: string
  percent: string
  referrals: string
  icon: DSIconName
  gradient: string
  glow: string
  ring: string
  bg: string
  text: string
}

const TIERS: TierConfig[] = [
  {
    name: 'Bronze',
    percent: '25%',
    referrals: '0+',
    icon: 'award',
    gradient: 'from-orange-400 to-amber-600',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.15)]',
    ring: 'ring-orange-400/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
  },
  {
    name: 'Prata',
    percent: '30%',
    referrals: '5+',
    icon: 'gem',
    gradient: 'from-slate-300 to-slate-500',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.15)]',
    ring: 'ring-slate-400/30',
    bg: 'bg-slate-400/10',
    text: 'text-slate-300',
  },
  {
    name: 'Ouro',
    percent: '35%',
    referrals: '15+',
    icon: 'crown',
    gradient: 'from-yellow-300 to-amber-500',
    glow: 'shadow-[0_0_30px_rgba(250,204,21,0.15)]',
    ring: 'ring-yellow-400/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
  },
]

const tierColors: Record<string, string> = {
  Bronze: 'text-orange-400',
  Prata: 'text-slate-300',
  Ouro: 'text-yellow-400',
}

// ══════════════════════════════════════════════
//  Main Page
// ══════════════════════════════════════════════
export default function AffiliatesPage() {
  const { data: dashboard, isLoading } = useAffiliateDashboard()
  const activateAffiliate = useActivateAffiliate()

  if (isLoading) {
    return (
      <AuthGuard requiredType="personal">
        <AffiliatesPageSkeleton />
      </AuthGuard>
    )
  }

  // Not activated — show premium CTA
  if (!dashboard?.activated) {
    return (
      <AuthGuard requiredType="personal">
        <div className="w-full space-y-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-border-light bg-bg-secondary p-8 sm:p-12">
            {/* Ambient gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 via-transparent to-amber-500/5" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-primary/8 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/8 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              {/* Animated icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-brand-primary/15 to-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.12)] ring-1 ring-brand-primary/20">
                <DSIcon name="gift" size={36} className="text-brand-primary" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
                Programa de Afiliados
              </h1>
              <p className="mt-3 text-base text-text-secondary leading-relaxed sm:text-lg">
                Indique outros personais e ganhe <span className="font-bold text-brand-primary">comissão vitalícia</span> sobre os pagamentos deles.
              </p>

              {/* Tier cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border border-border-light/50 bg-bg-primary/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1',
                      tier.glow,
                    )}
                  >
                    {/* Subtle gradient top bar */}
                    <div className={cn('absolute inset-x-0 top-0 h-1 bg-linear-to-r', tier.gradient)} />

                    <div className={cn('mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl', tier.bg)}>
                      <DSIcon name={tier.icon} size={22} className={tier.text} />
                    </div>
                    <p className={cn('text-sm font-bold', tier.text)}>{tier.name}</p>
                    <p className="mt-1 text-3xl font-black tabular-nums text-text-primary">{tier.percent}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{tier.referrals} indicações</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={() => activateAffiliate.mutate()}
                  loading={activateAffiliate.isPending}
                  className="px-10"
                >
                  <DSIcon name="rocket" size={18} />
                  Ativar Programa de Afiliados
                </Button>
                <p className="mt-3 text-xs text-text-muted">
                  Sem custo • Comece no Bronze (25%) • Suba de nível automático
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: 'share2' as DSIconName, title: 'Compartilhe', desc: 'Envie seu link exclusivo para outros personais' },
              { icon: 'userPlus' as DSIconName, title: 'Eles assinam', desc: 'Quando assinam um plano, você ganha comissão' },
              { icon: 'wallet' as DSIconName, title: 'Receba', desc: 'Comissão vitalícia depositada via Pix' },
            ].map((step, i) => (
              <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-bg-secondary/70 p-5 backdrop-blur-xl transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <DSIcon name={step.icon} size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    <span className="mr-2 text-brand-primary">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredType="personal">
      <AffiliateDashboardView />
    </AuthGuard>
  )
}

// ══════════════════════════════════════════════
//  Dashboard View (activated)
// ══════════════════════════════════════════════

function AffiliateDashboardView() {
  const { data: dashboard } = useAffiliateDashboard()
  const { data: linkData } = useAffiliateLink()
  const [tab, setTab] = useState<'overview' | 'referrals' | 'commissions' | 'withdraw'>('overview')
  const [showQr, setShowQr] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const affiliate = dashboard!.affiliate!
  const currentTier = TIERS.find((t) => t.name === affiliate.tier_name) || TIERS[0]

  // Generate QR code from referral link
  useEffect(() => {
    let cancelled = false
    async function generate() {
      const link = linkData?.referral_link
      if (!link) { setQrDataUrl(''); return }
      try {
        const dataUrl = await (await import('qrcode')).default.toDataURL(link, {
          margin: 1,
          width: 340,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setQrDataUrl(dataUrl)
      } catch {
        if (!cancelled) setQrDataUrl('')
      }
    }
    void generate()
    return () => { cancelled = true }
  }, [linkData?.referral_link])

  function copyLink() {
    if (linkData?.referral_link) {
      navigator.clipboard.writeText(linkData.referral_link)
      toast.success('Link copiado!')
    }
  }

  function shareLink() {
    if (linkData?.referral_link && navigator.share) {
      navigator.share({
        title: 'VFIT — Programa de Afiliados',
        text: 'Crie treinos com IA, gerencie alunos e muito mais. Use meu link:',
        url: linkData.referral_link,
      }).catch(() => {})
    } else {
      copyLink()
    }
  }

  function shareWhatsApp() {
    if (!linkData?.referral_link) return
    const text = `🏋️ Crie treinos com IA, gerencie alunos e automatize seu trabalho como Personal Trainer!\n\nUse meu link e comece grátis:\n${linkData.referral_link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function downloadQr() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'vfit-afiliado-qrcode.png'
    a.click()
  }

  return (
    <div className="w-full space-y-6">
      {/* ─── Header with tier badge ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl',
            currentTier.bg,
          )}>
            <DSIcon name="gift" size={26} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              Programa de Afiliados
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <div className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1',
                currentTier.bg, currentTier.text, currentTier.ring,
              )}>
                <DSIcon name={currentTier.icon} size={12} />
                {affiliate.tier_name} — {affiliate.commission_percentage}%
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {linkData && (
            <>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <DSIcon name="copy" size={14} />
                Copiar Link
              </Button>
              <Button variant={showQr ? 'secondary' : 'outline'} size="sm" onClick={() => setShowQr((v) => !v)}>
                <DSIcon name="qrcode" size={14} />
                QR Code
              </Button>
              <Button size="sm" onClick={shareLink}>
                <DSIcon name="share2" size={14} />
                Compartilhar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="users"
          label="Indicados"
          value={String(affiliate.total_referrals)}
          accent="emerald"
        />
        <StatCard
          icon="dollar"
          label="Ganhos Totais"
          value={formatCurrency(affiliate.lifetime_earnings)}
          accent="green"
        />
        <StatCard
          icon="wallet"
          label="Saldo Disponível"
          value={formatCurrency(affiliate.available_balance)}
          accent="amber"
        />
        <StatCard
          icon="trendingUp"
          label="Este Mês"
          value={formatCurrency(dashboard!.this_month.total)}
          accent="green"
        />
      </div>

      {/* ─── Tier Progress ─── */}
      {dashboard!.next_tier && <TierProgressCard
        currentTier={affiliate.tier_name}
        currentReferrals={affiliate.total_referrals}
        nextTierName={dashboard!.next_tier.name}
        nextTierReferrals={dashboard!.next_tier.referrals_needed}
      />}

      {/* ─── Referral Link Card ─── */}
      {linkData && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-primary/15 bg-brand-primary/3 p-5 backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-primary/5 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <DSIcon name="link2" size={16} className="text-brand-primary" />
              <p className="text-sm font-bold text-text-primary">Seu Link de Indicação</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 overflow-hidden rounded-xl border border-border-light bg-bg-primary px-4 py-3">
                <p className="truncate text-sm font-mono text-text-secondary">
                  {linkData.referral_link}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <DSIcon name="copy" size={14} /> Copiar
                </Button>
                <Button variant={showQr ? 'secondary' : 'outline'} size="sm" onClick={() => setShowQr((v) => !v)}>
                  <DSIcon name="qrcode" size={14} /> {showQr ? 'Fechar' : 'QR Code'}
                </Button>
                <Button size="sm" onClick={shareLink}>
                  <DSIcon name="share2" size={14} /> Enviar
                </Button>
              </div>
            </div>

            {/* ─── QR Code Inline ─── */}
            {showQr && (
              <div className="mt-5 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  {/* Glow behind QR */}
                  <div className="absolute inset-0 rounded-3xl bg-brand-primary/10 blur-xl" />
                  <div className="relative rounded-3xl border border-white/10 bg-white p-4 shadow-lg">
                    {qrDataUrl ? (
                      <Image
                        src={qrDataUrl}
                        alt="QR Code do link de indicação"
                        width={280}
                        height={280}
                        unoptimized
                        className="rounded-xl"
                      />
                    ) : (
                      <div className="flex h-70 w-70 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-text-muted text-center max-w-64">
                  Escaneie o QR Code para acessar seu link de indicação
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadQr} disabled={!qrDataUrl}>
                    <DSIcon name="download" size={14} />
                    Baixar QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareWhatsApp}>
                    <DSIcon name="messageCircle" size={14} className="text-emerald-500" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <DSIcon name="copy" size={14} />
                    Copiar Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tabs ─── */}
      <SlidingTabs
        tabs={[
          { key: 'overview', label: 'Visão Geral' },
          { key: 'referrals', label: 'Indicados', count: affiliate.total_referrals },
          { key: 'commissions', label: 'Comissões' },
          { key: 'withdraw', label: 'Saque' },
        ]}
        activeTab={tab}
        onChange={(key) => setTab(key as typeof tab)}
      />

      {tab === 'overview' && <OverviewTab commissions={dashboard!.recent_commissions} />}
      {tab === 'referrals' && <ReferralsTab />}
      {tab === 'commissions' && <CommissionsTab />}
      {tab === 'withdraw' && <WithdrawTab balance={affiliate.available_balance} />}
    </div>
  )
}

// ══════════════════════════════════════════════
//  Stat Card — Ultra-modern
// ══════════════════════════════════════════════

const accentMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/10' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/10' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/10' },
  brand: { bg: 'bg-brand-primary/10', text: 'text-brand-primary', ring: 'ring-brand-primary/10' },
}

function StatCard({ icon, label, value, accent }: {
  icon: DSIconName; label: string; value: string; accent: keyof typeof accentMap
}) {
  const colors = accentMap[accent]
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary/70 p-4 ring-1 backdrop-blur-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
      colors.ring,
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', colors.bg)}>
          <DSIcon name={icon} size={18} className={colors.text} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className="mt-0.5 text-lg font-black tabular-nums tracking-tight text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
//  Tier Progress Card
// ══════════════════════════════════════════════

function TierProgressCard({ currentTier, currentReferrals, nextTierName, nextTierReferrals }: {
  currentTier: string; currentReferrals: number; nextTierName: string; nextTierReferrals: number
}) {
  const progress = Math.min(100, (currentReferrals / nextTierReferrals) * 100)
  const nextConfig = TIERS.find((t) => t.name === nextTierName) || TIERS[2]
  const currentConfig = TIERS.find((t) => t.name === currentTier) || TIERS[0]
  const remaining = nextTierReferrals - currentReferrals

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary/70 p-5 backdrop-blur-xl">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-linear-to-br from-brand-primary/5 to-amber-500/5 blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', currentConfig.bg)}>
              <DSIcon name={currentConfig.icon} size={18} className={currentConfig.text} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Progresso para {nextTierName}</p>
              <p className="text-xs text-text-muted">
                {remaining > 0
                  ? `Faltam ${remaining} indicação${remaining > 1 ? 'ões' : ''}`
                  : 'Nível alcançado!'
                }
              </p>
            </div>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', nextConfig.bg)}>
            <DSIcon name={nextConfig.icon} size={18} className={nextConfig.text} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 overflow-hidden rounded-full bg-bg-primary">
          <div
            className={cn('h-full rounded-full bg-linear-to-r transition-all duration-700 ease-out', currentConfig.gradient)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className={cn('font-bold', currentConfig.text)}>
            {currentReferrals} indicações
          </span>
          <span className="text-text-muted font-medium tabular-nums">
            {currentReferrals}/{nextTierReferrals}
          </span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
//  Overview Tab
// ══════════════════════════════════════════════

function OverviewTab({ commissions }: { commissions: { id: string; amount: number; status: string; created_at: string }[] }) {
  if (commissions.length === 0) {
    return (
      <EmptyState
        compact
        illustration="payments"
        title="Nenhuma comissão recente"
        description="Assim que houver uma comissão, ela aparecerá aqui."
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Comissões Recentes</p>
      {commissions.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-bg-secondary/70 p-4 backdrop-blur-xl transition-all duration-200 hover:bg-bg-tertiary/50 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              c.status === 'paid' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            )}>
              <DSIcon
                name={c.status === 'paid' ? 'checkCircle2' : 'clock'}
                size={16}
                className={c.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}
              />
            </div>
            <div>
              <p className="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(c.amount)}</p>
              <p className="text-xs text-text-muted">
                {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <Badge variant={c.status === 'paid' ? 'success' : 'warning'}>
            {c.status === 'paid' ? 'Paga' : 'Pendente'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════
//  Referrals Tab
// ══════════════════════════════════════════════

function ReferralsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useReferrals({ page, per_page: 20 })

  const referrals = data?.referrals ?? []
  const meta = data?.meta

  if (isLoading) return <SkeletonList count={4} withAvatar={false} />

  if (referrals.length === 0) {
    return (
      <EmptyState
        compact
        illustration="students"
        title="Nenhum indicado ainda"
        description="Compartilhe seu link para começar a gerar comissões."
      />
    )
  }

  return (
    <div className="space-y-2">
      {referrals.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-bg-secondary/70 p-4 backdrop-blur-xl transition-all duration-200 hover:bg-bg-tertiary/50 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
              <span className="text-sm font-bold text-brand-primary">
                {r.referred_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{r.referred_name}</p>
              <p className="text-xs text-text-muted">
                Desde {new Date(r.referral_date).toLocaleDateString('pt-BR')}
                {' · '}{r.total_payments} pgto{r.total_payments !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <p className="text-sm font-bold tabular-nums text-emerald-400">{formatCurrency(r.total_commission_earned)}</p>
            </div>
            <Badge variant={r.status === 'active' ? 'success' : r.status === 'churned' ? 'error' : 'warning'}>
              {r.status === 'active' ? 'Ativo' : r.status === 'churned' ? 'Inativo' : 'Pendente'}
            </Badge>
          </div>
        </div>
      ))}

      {meta && <Pagination page={page} totalPages={meta.total_pages} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}
    </div>
  )
}

// ══════════════════════════════════════════════
//  Commissions Tab
// ══════════════════════════════════════════════

function CommissionsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useCommissions({ page, per_page: 20 })

  const commissions = data?.commissions ?? []
  const meta = data?.meta

  if (isLoading) return <SkeletonList count={4} withAvatar={false} />

  if (commissions.length === 0) {
    return (
      <EmptyState
        compact
        illustration="payments"
        title="Nenhuma comissão registrada"
        description="Suas comissões aparecerão automaticamente após pagamentos confirmados."
      />
    )
  }

  return (
    <div className="space-y-2">
      {commissions.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-bg-secondary/70 p-4 backdrop-blur-xl transition-all duration-200 hover:bg-bg-tertiary/50 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              c.status === 'paid' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            )}>
              <DSIcon
                name={c.status === 'paid' ? 'checkCircle2' : 'clock'}
                size={16}
                className={c.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{c.referred_name}</p>
              <p className="text-xs text-text-muted">
                {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {c.commission_percentage}% de comissão
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <p className="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(c.amount)}</p>
            <Badge variant={c.status === 'paid' ? 'success' : 'warning'}>
              {c.status === 'paid' ? 'Paga' : 'Pendente'}
            </Badge>
          </div>
        </div>
      ))}

      {meta && <Pagination page={page} totalPages={meta.total_pages} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}
    </div>
  )
}

// ══════════════════════════════════════════════
//  Withdraw Tab
// ══════════════════════════════════════════════

function WithdrawTab({ balance }: { balance: number }) {
  const requestWithdrawal = useRequestWithdrawal()
  const [amount, setAmount] = useState('')
  const [pixKey, setPixKey] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return
    requestWithdrawal.mutate({ amount: parsedAmount, pix_key: pixKey })
  }

  const parsedAmount = parseFloat(amount)
  const isValid = !!pixKey.trim() && !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= balance

  return (
    <div className="space-y-4">
      {/* Balance highlight */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary/70 p-5 backdrop-blur-xl">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/8 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
            <DSIcon name="wallet" size={22} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Saldo Disponível</p>
            <p className="text-2xl font-black tabular-nums tracking-tight text-text-primary">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>

      {balance <= 0 ? (
        <div className="rounded-2xl border border-white/8 bg-bg-secondary/70 p-8 text-center backdrop-blur-xl">
          <DSIcon name="inbox" size={32} className="mx-auto text-text-muted/40 mb-3" />
          <p className="text-sm text-text-muted">Sem saldo disponível para saque.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-bg-secondary/70 p-5 backdrop-blur-xl">
          <p className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <DSIcon name="arrowUpRight" size={16} className="text-brand-primary" />
            Solicitar Saque
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MD3Input
              label="Valor (R$)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
              step="0.01"
              min="0.01"
              max={balance}
              required
            />
            <MD3Input
              label="Chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              required
            />
            <Button type="submit" disabled={!isValid} loading={requestWithdrawal.isPending}>
              <DSIcon name="arrowUpRight" size={16} />
              Solicitar Saque via Pix
            </Button>
          </form>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-3 flex items-start gap-2.5">
        <DSIcon name="info" size={14} className="text-brand-primary shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Saques são processados em até <strong className="text-text-primary">48h úteis</strong>. O valor mínimo é R$ 10,00.
        </p>
      </div>
    </div>
  )
}
