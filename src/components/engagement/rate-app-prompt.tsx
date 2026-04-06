/**
 * src/components/engagement/rate-app-prompt.tsx
 *
 * Rate App Prompt — Asks user to rate 5 stars after sustained usage
 * Smart timing: 5+ days since install AND 3+ dashboard visits
 * Won't show again for 90 days after dismissal, never after rating
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'

// ─── Constants ───
const STORAGE_KEY_VISITS = 'vfit_dashboard_visits'
const STORAGE_KEY_FIRST_USE = 'vfit_first_use_at'
const STORAGE_KEY_RATED = 'vfit_app_rated'
const STORAGE_KEY_DISMISSED = 'vfit_rate_dismissed_at'
const MIN_DAYS = 5
const MIN_VISITS = 3
const DISMISS_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000 // 90 days
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=br.app.vfit'
const APP_STORE_URL = 'https://apps.apple.com/app/vfit/id000000000' // placeholder

// ─── Helpers ───
function trackDashboardVisit(): number {
  const current = parseInt(localStorage.getItem(STORAGE_KEY_VISITS) || '0', 10)
  const next = current + 1
  localStorage.setItem(STORAGE_KEY_VISITS, next.toString())
  if (!localStorage.getItem(STORAGE_KEY_FIRST_USE)) {
    localStorage.setItem(STORAGE_KEY_FIRST_USE, Date.now().toString())
  }
  return next
}

function shouldShowRatePrompt(): boolean {
  if (typeof window === 'undefined') return false
  // Never show if already rated
  if (localStorage.getItem(STORAGE_KEY_RATED) === 'true') return false
  // Check dismiss cooldown
  const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED)
  if (dismissed) {
    const elapsed = Date.now() - parseInt(dismissed, 10)
    if (elapsed < DISMISS_COOLDOWN_MS) return false
  }
  // Check min visits
  const visits = parseInt(localStorage.getItem(STORAGE_KEY_VISITS) || '0', 10)
  if (visits < MIN_VISITS) return false
  // Check min days since first use
  const firstUse = localStorage.getItem(STORAGE_KEY_FIRST_USE)
  if (!firstUse) return false
  const daysSinceFirst = (Date.now() - parseInt(firstUse, 10)) / (24 * 60 * 60 * 1000)
  if (daysSinceFirst < MIN_DAYS) return false
  return true
}

export function RateAppPrompt() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedStars, setSelectedStars] = useState(0)
  const [step, setStep] = useState<'ask' | 'stars' | 'thanks'>('ask')

  useScrollLock(show)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !user) return
    // Track visit
    trackDashboardVisit()
    // Check after 3s delay to not interrupt initial load
    const timer = setTimeout(() => {
      if (shouldShowRatePrompt()) {
        setShow(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [isHydrated, user])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString())
    setShow(false)
  }, [])

  const handleRate = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_RATED, 'true')
    // Detect platform for store link
    const isAndroid = /android/i.test(navigator.userAgent)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const url = isIOS ? APP_STORE_URL : isAndroid ? PLAY_STORE_URL : PLAY_STORE_URL
    window.open(url, '_blank')
    setStep('thanks')
    setTimeout(() => setShow(false), 2000)
  }, [])

  const handleStarClick = useCallback((star: number) => {
    setSelectedStars(star)
    if (star >= 4) {
      // Good rating → redirect to store
      setTimeout(handleRate, 500)
    }
    // Low rating → just close, maybe show feedback later
    if (star < 4) {
      localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString())
      setTimeout(() => setShow(false), 1000)
    }
  }, [handleRate])

  if (!show || !user || !mounted) return null

  const modal = (
    <div className="fixed inset-0 z-9999 isolate" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleDismiss} />

      <div className="relative flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-400">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-bg-primary shadow-2xl">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute right-8 top-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary transition-all"
            >
              <DSIcon name="close" size={16} />
            </button>

            <div className="p-6 pt-8 text-center">
              {step === 'ask' && (
                <>
                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                    <DSIcon name="star" size={32} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">
                    Curtindo o VFIT?
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Sua opinião nos ajuda a melhorar! Avalie na loja de apps.
                  </p>
                  {/* CTA */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => setStep('stars')}
                      className="w-full rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <DSIcon name="star" size={16} />
                        Sim, quero avaliar!
                      </span>
                    </button>
                    <button onClick={handleDismiss} className="w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors">
                      Agora não
                    </button>
                  </div>
                </>
              )}

              {step === 'stars' && (
                <>
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    Quantas estrelas?
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Toque para avaliar
                  </p>
                  {/* Stars */}
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        className="group p-1 transition-transform hover:scale-110 active:scale-95"
                      >
                        <DSIcon
                          name="star"
                          size={36}
                          className={`transition-colors duration-200 ${
                            star <= selectedStars ? 'text-amber-400' : 'text-white/15 group-hover:text-amber-400/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-text-muted">
                    {selectedStars === 0 && 'Toque em uma estrela'}
                    {selectedStars >= 4 && '🎉 Obrigado! Redirecionando...'}
                    {selectedStars > 0 && selectedStars < 4 && 'Obrigado pelo feedback!'}
                  </p>
                </>
              )}

              {step === 'thanks' && (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                    <DSIcon name="heart" size={32} className="text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Obrigado! 💚</h3>
                  <p className="mt-2 text-sm text-text-secondary">Sua avaliação faz toda a diferença</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
