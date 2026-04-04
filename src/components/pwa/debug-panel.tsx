// ============================================
// debug-panel.tsx — Painel de diagnóstico de instalabilidade PWA
// ============================================
//
// O que faz:
//   Painel de diagnóstico completo para Chrome PWA installability.
//   Verifica service worker, manifest, HTTPS, beforeinstallprompt e critérios.
//   Ativado via URL param ?pwa-debug=1.
//   Usa usePwaInstall para estado de instalação.
//
// Exports principais:
//   PwaDebugPanel — painel de diagnóstico PWA (visível via ?pwa-debug=1)
'use client'

import { useState, useEffect, useRef } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { usePwaInstall } from './install-banner'

/**
 * PWA Debug Panel — Comprehensive Chrome installability diagnostics.
 * Access via: vfit.app.br?pwa-debug=1
 */
export function PwaDebugPanel() {
  const [show, setShow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [swStatus, setSwStatus] = useState('checking...')
  const [swScope, setSwScope] = useState('')
  const [manifestStatus, setManifestStatus] = useState('checking...')
  const [manifestContentType, setManifestContentType] = useState('')
  const [displayMode, setDisplayMode] = useState('browser')
  const [promptStatus, setPromptStatus] = useState('❌ Not captured')
  const [protocol, setProtocol] = useState('')
  const [userAgent, setUserAgent] = useState('')
  const [supportsInstallEvent, setSupportsInstallEvent] = useState<boolean | null>(null)
  const [engagementTime, setEngagementTime] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [iconsStatus, setIconsStatus] = useState('checking...')
  const [browserName, setBrowserName] = useState('unknown')
  const [adBlockerDetected, setAdBlockerDetected] = useState<boolean | null>(null)
  const [relatedApps, setRelatedApps] = useState<string>('checking...')
  const [debugLog, setDebugLog] = useState<string[]>([])
  const engagementRef = useRef(0)

  const ctx = usePwaInstall()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pwa-debug') === '1') {
      setShow(true)
    }
  }, [])

  // Engagement timer — counts seconds on page
  useEffect(() => {
    if (!show) return
    const timer = setInterval(() => {
      engagementRef.current += 1
      setEngagementTime(engagementRef.current)
    }, 1000)
    return () => clearInterval(timer)
  }, [show])

  // Click counter
  useEffect(() => {
    if (!show) return
    const onClick = () => setClickCount((c) => c + 1)
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [show])

  // Continuously check prompt status
  useEffect(() => {
    if (!show) return
    const checkPrompt = () => {
      if (window.__pwaPrompt) {
        setPromptStatus('✅ CAPTURED')
      } else if (window.__pwaPromptCaptured) {
        setPromptStatus('⚠️ Was captured but expired')
      } else {
        setPromptStatus('❌ Not captured')
      }
    }
    checkPrompt()
    const interval = setInterval(checkPrompt, 2000)
    window.addEventListener('pwa-prompt-ready', checkPrompt)
    return () => {
      clearInterval(interval)
      window.removeEventListener('pwa-prompt-ready', checkPrompt)
    }
  }, [show])

  useEffect(() => {
    if (!show) return

    // Protocol
    setProtocol(window.location.protocol)

    // User agent
    setUserAgent(navigator.userAgent.slice(0, 120))

    // Browser detection (order matters — most specific first)
    const ua = navigator.userAgent
    if (/Comet\//i.test(ua)) setBrowserName('Comet ⚠️')
    else if (/Arc\//i.test(ua)) setBrowserName('Arc ⚠️')
    else if (/Brave/i.test(ua)) setBrowserName('Brave')
    else if (/Vivaldi\//i.test(ua)) setBrowserName('Vivaldi')
    else if (/SamsungBrowser\//i.test(ua)) setBrowserName('Samsung')
    else if (/Edg\//i.test(ua)) setBrowserName('Edge')
    else if (/OPR\//i.test(ua)) setBrowserName('Opera')
    else if (/Chrome\//i.test(ua) && !/Edg|OPR|Brave|Vivaldi|Arc|Comet|SamsungBrowser/i.test(ua)) setBrowserName('Chrome ✅')
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) setBrowserName('Safari')
    else if (/Firefox\//i.test(ua)) setBrowserName('Firefox')
    else setBrowserName('Unknown')

    // Check if BeforeInstallPromptEvent is supported
    const hasEvent = 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
    setSupportsInstallEvent(hasEvent)

    // Display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDisplayMode('standalone ✅')
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      setDisplayMode('minimal-ui')
    } else {
      setDisplayMode('browser tab')
    }

    // SW status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setSwScope(reg.scope)
          if (reg.active) setSwStatus('✅ active')
          else if (reg.installing) setSwStatus('⏳ installing')
          else if (reg.waiting) setSwStatus('⏳ waiting')
          else setSwStatus('⚠️ no active worker')
        } else {
          setSwStatus('❌ not registered')
        }
      })
    } else {
      setSwStatus('❌ not supported')
    }

    // Manifest — check content-type and validity
    const link = document.querySelector('link[rel="manifest"]')
    if (link) {
      const manifestUrl = (link as HTMLLinkElement).href
      fetch(manifestUrl)
        .then((r) => {
          setManifestContentType(r.headers.get('content-type') || 'unknown')
          return r.json()
        })
        .then((m) => {
          const manifest = m as Record<string, unknown>
          const icons = manifest.icons as Array<{ sizes: string }> | undefined
          const has192 = icons?.some((i) => i.sizes?.includes('192'))
          const has512 = icons?.some((i) => i.sizes?.includes('512'))
          const hasName = !!manifest.name || !!manifest.short_name
          const hasStartUrl = !!manifest.start_url
          const hasDisplay = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].includes(manifest.display as string)
          const preferRelated = manifest.prefer_related_applications === true

          const issues = []
          if (!hasName) issues.push('name')
          if (!has192) issues.push('192px icon')
          if (!has512) issues.push('512px icon')
          if (!hasStartUrl) issues.push('start_url')
          if (!hasDisplay) issues.push('display')
          if (preferRelated) issues.push('prefer_related=true!')

          if (issues.length === 0) {
            setManifestStatus(`✅ valid (${icons?.length} icons)`)
          } else {
            setManifestStatus(`❌ ${issues.join(', ')}`)
          }
        })
        .catch(() => setManifestStatus('❌ fetch failed'))
    } else {
      setManifestStatus('❌ no <link rel="manifest">')
    }

    // Check if critical icons are fetchable
    Promise.all([
      fetch('/icons/icon-192.png', { method: 'HEAD' }).then((r) => r.ok),
      fetch('/icons/icon-512.png', { method: 'HEAD' }).then((r) => r.ok),
    ])
      .then(([ok192, ok512]) => {
        if (ok192 && ok512) setIconsStatus('✅ 192+512 OK')
        else setIconsStatus(`❌ 192:${ok192} 512:${ok512}`)
      })
      .catch(() => setIconsStatus('❌ fetch error'))

    // Ad blocker detection — try to fetch a common ad-related URL
    const adTestEl = document.createElement('div')
    adTestEl.className = 'adsbox ad-placement'
    adTestEl.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(adTestEl)
    setTimeout(() => {
      const blocked = adTestEl.offsetHeight === 0 || adTestEl.clientHeight === 0
      setAdBlockerDetected(blocked)
      adTestEl.remove()
    }, 200)

    // Get related apps
    interface PwaWindow extends Window { __pwaRelatedApps?: unknown; __pwaDebugLog?: string[] }
    const w = window as PwaWindow
    if (w.__pwaRelatedApps) {
      setRelatedApps(JSON.stringify(w.__pwaRelatedApps))
    } else if ('getInstalledRelatedApps' in navigator) {
      type InstalledAppsNavigator = Navigator & { getInstalledRelatedApps: () => Promise<unknown[]> }
      ;(navigator as InstalledAppsNavigator).getInstalledRelatedApps().then((apps: unknown[]) => {
        setRelatedApps(apps.length > 0 ? JSON.stringify(apps) : '[] (none)')
      }).catch(() => setRelatedApps('error'))
    } else {
      setRelatedApps('API not available')
    }

    // Get debug log from head script
    if (w.__pwaDebugLog) {
      setDebugLog(w.__pwaDebugLog)
    }
  }, [show])

  if (!show) return null

  const engagementMet = engagementTime >= 30 && clickCount >= 1

  return (
    <div className="fixed top-4 right-4 z-99999">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex items-center gap-1.5 rounded-lg bg-amber-500/90 px-3 py-1.5 text-[11px] font-bold text-black shadow-lg"
      >
        <DSIcon name="wrench" size={14} /> PWA Debug
      </button>

      {expanded && (
        <div className="w-95 max-h-[85vh] overflow-y-auto rounded-xl bg-bg-dark-secondary/95 backdrop-blur-xl border border-white/10 p-4 shadow-2xl text-[11px] font-mono">
          <h3 className="text-amber-400 font-bold text-xs mb-3">PWA Diagnostic</h3>

          {/* Basic checks */}
          <Section title="Environment">
            <Row label="Protocol" value={protocol} ok={protocol === 'https:'} />
            <Row label="Browser" value={browserName} />
            <Row label="Display Mode" value={displayMode} />
            <Row label="UA" value={userAgent} small />
          </Section>

          {/* Installability checks */}
          <Section title="Chrome Install Criteria">
            <Row label="SW Status" value={swStatus} ok={swStatus.includes('✅')} />
            <Row label="SW Scope" value={swScope || 'n/a'} />
            <Row label="Manifest" value={manifestStatus} ok={manifestStatus.includes('✅')} />
            <Row label="Manifest Content-Type" value={manifestContentType} />
            <Row label="Icons fetchable" value={iconsStatus} ok={iconsStatus.includes('✅')} />
            <Row
              label="InstallPromptEvent API"
              value={
                supportsInstallEvent === null
                  ? 'checking...'
                  : supportsInstallEvent
                  ? '✅ supported'
                  : '❌ NOT supported'
              }
              ok={supportsInstallEvent === true}
            />
            <Row
              label="Ad Blocker"
              value={
                adBlockerDetected === null
                  ? 'checking...'
                  : adBlockerDetected
                  ? '⚠️ DETECTED'
                  : '✅ none detected'
              }
              ok={adBlockerDetected === false}
            />
            <Row label="Related Apps" value={relatedApps} small />
          </Section>

          {/* Engagement heuristic */}
          <Section title="Engagement Heuristic (this session)">
            <Row
              label="Time on page"
              value={`${engagementTime}s ${engagementTime >= 30 ? '✅' : `(need 30s)`}`}
              ok={engagementTime >= 30}
            />
            <Row
              label="Clicks on page"
              value={`${clickCount} ${clickCount >= 1 ? '✅' : '(need ≥1)'}`}
              ok={clickCount >= 1}
            />
            <Row
              label="Heuristic met?"
              value={engagementMet ? '✅ YES' : '⏳ waiting...'}
              ok={engagementMet}
            />
            <p className="text-[9px] text-zinc-600 mt-1 leading-relaxed">
              Chrome exige 30s na página + 1 clique antes de disparar beforeinstallprompt.
              Esses valores são cumulativos entre sessões.
            </p>
          </Section>

          {/* Prompt capture */}
          <Section title="Install Prompt">
            <Row label="beforeinstallprompt" value={promptStatus} ok={promptStatus.includes('✅')} />
            <Row label="window.__pwaPrompt" value={window.__pwaPrompt ? '✅ ready' : '❌ null'} ok={!!window.__pwaPrompt} />
            <Row label="window.__pwaInstalled" value={String(window.__pwaInstalled || false)} />
          </Section>

          {/* Context values */}
          <Section title="React Context">
            <Row label="platform" value={ctx?.platform || 'null'} />
            <Row label="browserName" value={ctx?.browserName || 'n/a'} />
            <Row label="isInstalled" value={String(ctx?.isInstalled ?? 'n/a')} />
            <Row label="canNativeInstall" value={String(ctx?.canNativeInstall ?? 'n/a')} ok={ctx?.canNativeInstall} />
            <Row label="showBanner" value={String(ctx?.showBanner ?? 'n/a')} />
          </Section>

          {/* Warnings */}
          {!supportsInstallEvent && supportsInstallEvent !== null && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] leading-relaxed">
              ⚠️ Seu browser NÃO suporta BeforeInstallPromptEvent. Se estiver usando Arc, Brave
              com shields, ou Firefox — abra no Google Chrome para instalar nativamente.
            </div>
          )}

          {(browserName.includes('Arc') || browserName.includes('Comet')) && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">
              ⚠️ {browserName.split(' ')[0]} pode não suportar PWA install nativo. Tente via menu do navegador ou use Google Chrome.
            </div>
          )}

          {/* Troubleshooting tips when prompt not captured */}
          {engagementMet && !window.__pwaPrompt && (
            <Section title="🔍 Troubleshooting">
              <div className="text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                <p>Heurística atendida mas prompt não disparou. Tente:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    <strong>Desative extensões</strong> — Ad blockers (uBlock, AdBlock) podem
                    bloquear o evento. Teste em <strong>janela anônima</strong> (⌘+Shift+N)
                  </li>
                  <li>
                    <strong>Limpe dados do site</strong> — Chrome DevTools → Application →
                    &quot;Clear site data&quot; (incluindo SW)
                  </li>
                  <li>
                    <strong>chrome://flags</strong> — Busque por
                    &quot;bypass-app-banner-engagement-checks&quot; e ative
                  </li>
                  <li>
                    <strong>chrome://apps</strong> — Verifique se o app já está instalado
                    e remova se existir
                  </li>
                  <li>
                    <strong>Instale manualmente</strong> — Chrome menu ⋮ → &quot;Cast, Save, and Share&quot; → &quot;Install page as app...&quot;
                  </li>
                </ol>
              </div>
            </Section>
          )}

          {adBlockerDetected && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] leading-relaxed">
              🚫 <strong>Ad blocker detectado!</strong> Extensões como uBlock Origin podem bloquear
              o evento beforeinstallprompt. Teste em <strong>janela anônima</strong> (⌘+Shift+N)
              ou desative a extensão temporariamente.
            </div>
          )}

          {/* Debug Log from head script */}
          {debugLog.length > 0 && (
            <Section title="📋 Script Log">
              <div className="text-[9px] text-zinc-500 space-y-0.5 max-h-24 overflow-y-auto">
                {debugLog.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => ctx?.triggerInstall()}
              className="flex-1 min-w-20 rounded-lg bg-brand-primary/20 text-brand-primary py-1.5 text-[10px] font-bold hover:bg-brand-primary/30 transition"
            >
              Test Install
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pwa-banner-dismissed-v2')
                window.location.reload()
              }}
              className="flex-1 min-w-20 rounded-lg bg-white/10 text-white py-1.5 text-[10px] font-bold hover:bg-white/20 transition"
            >
              Reset Banner
            </button>
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then((reg) => {
                    reg?.unregister().then(() => {
                      caches.keys().then((keys) =>
                        Promise.all(keys.map((key) => caches.delete(key)))
                      ).then(() => window.location.reload())
                    })
                  })
                }
              }}
              className="flex-1 min-w-20 rounded-lg bg-red-500/10 text-red-400 py-1.5 text-[10px] font-bold hover:bg-red-500/20 transition"
            >
              Clear All + Reload
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 border-b border-white/5 pb-1">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  ok,
  small,
}: {
  label: string
  value: string
  ok?: boolean | null
  small?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span
        className={`text-right ${small ? 'text-[9px] max-w-55' : ''} truncate ${
          ok === true ? 'text-emerald-400' : ok === false ? 'text-red-400' : 'text-zinc-300'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
