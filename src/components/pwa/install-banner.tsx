// ============================================
// install-banner.tsx — Provider e botão de instalação PWA
// ============================================
//
// O que faz:
//   PwaInstallProvider: captura evento beforeinstallprompt e expõe via Context.
//   usePwaInstall: hook para acessar canInstall, isInstalled, promptInstall().
//   PwaInstallButton: botão que dispara o prompt de instalação nativo.
//   Não exibe nada se já instalado ou se plataforma não suporta.
//
// Exports principais:
//   usePwaInstall — hook: { canInstall, isInstalled, promptInstall }
//   PwaInstallProvider — context provider de instalação PWA
//   PwaInstallButton — botão de instalação PWA
'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'chromium-desktop' | 'safari-desktop' | 'firefox-desktop' | 'other'
type ChromiumBrowser = 'chrome' | 'edge' | 'brave' | 'opera' | 'vivaldi' | 'arc' | 'samsung' | 'comet' | 'chromium-other'

interface PwaInstallContextType {
  platform: Platform | null
  browserName: ChromiumBrowser | 'safari' | 'firefox' | 'unknown'
  isInstalled: boolean
  canNativeInstall: boolean
  showBanner: boolean
  showOverlay: boolean
  triggerInstall: () => void
  dismissBanner: () => void
  openOverlay: () => void
  closeOverlay: () => void
}

const PwaInstallContext = createContext<PwaInstallContextType | null>(null)

export function usePwaInstall() {
  return useContext(PwaInstallContext)
}

// ─── Utilities ────────────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'

  const ua = navigator.userAgent.toLowerCase()
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /android/.test(ua)

  if (isIOS) return 'ios'
  if (isAndroid) return 'android'

  // Desktop detection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isChromium = !!(window as any).chrome || /chrome|chromium|edg|opr|brave/i.test(ua)
  const isSafari = /^((?!chrome|android|chromium).)*safari/i.test(ua)
  const isFirefox = /firefox/i.test(ua)

  if (isFirefox) return 'firefox-desktop'
  if (isSafari) return 'safari-desktop'
  if (isChromium) return 'chromium-desktop'
  return 'other'
}

function detectBrowserName(): PwaInstallContextType['browserName'] {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent

  // Order matters: check specific browsers before generic Chrome
  if (/CometBrowser|Comet/i.test(ua)) return 'comet'
  if (/Arc\//i.test(ua)) return 'arc'
  if (/Brave/i.test(ua)) return 'brave'
  if (/Vivaldi/i.test(ua)) return 'vivaldi'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'opera'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome\//i.test(ua) && !/Edg|OPR|Brave|Vivaldi|Arc|Comet|Samsung/i.test(ua)) return 'chrome'
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'safari'
  if (/Firefox\//i.test(ua)) return 'firefox'
  return 'unknown'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

const DISMISS_KEY = 'pwa-banner-dismissed-v2'
const DISMISS_HOURS = 12

function wasDismissedRecently(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < DISMISS_HOURS * 60 * 60 * 1000
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────

// Global type for the captured prompt
declare global {
  interface Window {
    __pwaPrompt: BeforeInstallPromptEvent | null
    __pwaPromptCaptured: boolean
    __pwaInstalled: boolean
  }
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [browserName, setBrowserName] = useState<PwaInstallContextType['browserName']>('unknown')
  const [installed, setInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Detect platform, browser & installed state
  useEffect(() => {
    setPlatform(detectPlatform())
    setBrowserName(detectBrowserName())
    setInstalled(isStandalone())

    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setInstalled(true)
        setShowBanner(false)
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Capture beforeinstallprompt — read from global + listen for events + continuous polling
  useEffect(() => {
    // 1) Read from global immediately (captured by <head> script before React)
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt)
    }
    if (window.__pwaInstalled) {
      setInstalled(true)
    }

    // 2) Listen for custom event dispatched by the global script
    const onPromptReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt)
      }
    }
    window.addEventListener('pwa-prompt-ready', onPromptReady)

    // 3) Also listen natively (for Chrome re-fires after dismiss)
    const handler = (e: Event) => {
      e.preventDefault()
      const prompt = e as BeforeInstallPromptEvent
      window.__pwaPrompt = prompt
      window.__pwaPromptCaptured = true
      setDeferredPrompt(prompt)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // 4) Listen for installed event (both custom and native)
    const onInstalled = () => {
      setInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
      window.__pwaPrompt = null
    }
    window.addEventListener('pwa-installed', onInstalled)
    window.addEventListener('appinstalled', onInstalled)

    // 5) Continuous polling: Chrome fires beforeinstallprompt only after
    //    engagement heuristic (30s + 1 click). Poll every 3s for 2 minutes.
    let pollCount = 0
    const pollInterval = setInterval(() => {
      pollCount++
      if (window.__pwaPrompt && !deferredPrompt) {
        setDeferredPrompt(window.__pwaPrompt)
        clearInterval(pollInterval)
      }
      if (pollCount >= 40) clearInterval(pollInterval) // 40 × 3s = 2min
    }, 3000)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('pwa-prompt-ready', onPromptReady)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('pwa-installed', onInstalled)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [deferredPrompt])

  // Show banner for ALL non-installed users
  useEffect(() => {
    if (installed || !platform) return
    if (wasDismissedRecently()) return

    const timer = setTimeout(() => setShowBanner(true), 4000)
    return () => clearTimeout(timer)
  }, [platform, installed])

  const triggerInstall = useCallback(async () => {
    // Try global prompt first (in case React state is stale)
    const prompt = deferredPrompt || window.__pwaPrompt

    if (prompt) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setInstalled(true)
          setShowBanner(false)
        }
      } catch {
        // Prompt already used or failed — show overlay as fallback
        setShowOverlay(true)
      }
      setDeferredPrompt(null)
      window.__pwaPrompt = null
    } else {
      // No native prompt available — show instructions overlay
      setShowOverlay(true)
    }
  }, [deferredPrompt])

  const dismissBanner = useCallback(() => {
    setShowBanner(false)
    markDismissed()
  }, [])

  const openOverlay = useCallback(() => setShowOverlay(true), [])
  const closeOverlay = useCallback(() => setShowOverlay(false), [])

  return (
    <PwaInstallContext.Provider
      value={{
        platform,
        browserName,
        isInstalled: installed,
        canNativeInstall: !!deferredPrompt || !!(typeof window !== 'undefined' && window.__pwaPrompt),
        showBanner,
        showOverlay,
        triggerInstall,
        dismissBanner,
        openOverlay,
        closeOverlay,
      }}
    >
      {children}
      {showBanner && !installed && <InstallBanner />}
      {showOverlay && <InstructionsOverlay />}
    </PwaInstallContext.Provider>
  )
}

// ─── Install Banner (Bottom floating ultra-glass card) ────────────────

function InstallBanner() {
  const ctx = usePwaInstall()
  if (!ctx) return null

  const { platform, canNativeInstall, triggerInstall, dismissBanner, browserName } = ctx

  // Check global prompt too (React state might be stale on first render)
  const hasNativePrompt = canNativeInstall || !!(typeof window !== 'undefined' && window.__pwaPrompt)

  const browserLabel = (() => {
    const map: Record<string, string> = {
      chrome: 'Chrome', brave: 'Brave', edge: 'Edge', opera: 'Opera',
      vivaldi: 'Vivaldi', arc: 'Arc', comet: 'Comet', samsung: 'Samsung',
    }
    return map[browserName] || ''
  })()

  const getSubtitle = () => {
    if (hasNativePrompt) return 'Instale grátis — acesso rápido e offline'
    if (platform === 'ios') return 'Adicione à tela inicial para acesso rápido'
    if (platform === 'android') return 'Instale o app direto no seu celular'
    if (browserLabel) return `Instale como app nativo no ${browserLabel}`
    return 'Acesse como app nativo no seu dispositivo'
  }

  const getButtonLabel = () => {
    if (hasNativePrompt) return 'Instalar App'
    if (platform === 'ios') return 'Como Instalar'
    if (platform === 'android') return 'Como Instalar'
    return 'Instalar Agora'
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-9999 p-4 sm:p-6 animate-[banner-slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)]"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl sm:rounded-3xl">
        {/* Ultra glass background with multi-layer blur */}
        <div className="absolute inset-0 bg-bg-dark/60 backdrop-blur-[40px] [-webkit-backdrop-filter:blur(40px)_saturate(200%)] border border-white/8 rounded-2xl sm:rounded-3xl" />

        {/* Top accent gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />

        {/* Bottom ambient glow */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-brand-primary/8 rounded-full blur-3xl pointer-events-none" />

        {/* Noise texture */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            {/* App icon */}
            <div className="shrink-0">
              <div className="relative flex h-13 w-13 items-center justify-center rounded-[14px] bg-linear-to-br from-brand-primary to-emerald-600 shadow-lg shadow-brand-primary/25">
                <span className="text-base font-black text-bg-dark tracking-tight">IA</span>
                <div className="absolute inset-0 rounded-[14px] bg-linear-to-br from-white/25 to-transparent" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[15px] font-bold text-white tracking-tight">VFIT</h3>
                <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-[9px] font-bold text-brand-primary uppercase tracking-widest ring-1 ring-brand-primary/20">
                  App
                </span>
              </div>
              <p className="text-[13px] text-zinc-400 leading-snug">{getSubtitle()}</p>

              {/* Star rating */}
              <div className="flex items-center gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-[11px] text-zinc-500 font-medium">5.0</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={dismissBanner}
              className="shrink-0 -mt-0.5 -mr-0.5 p-1.5 rounded-xl text-zinc-600 hover:text-white hover:bg-white/8 transition-all duration-200"
              aria-label="Fechar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Install CTA */}
          <button
            onClick={triggerInstall}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-emerald-500 px-4 py-3 text-[13px] font-bold text-bg-dark transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,142,0.35)] hover:brightness-110 active:scale-[0.98]"
          >
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Instructions Overlay ─────────────────────────────────────────────

interface StepConfig {
  icon: ReactNode
  title: string
  description: string
}

function getInstructionConfig(platform: Platform | null, browser: PwaInstallContextType['browserName']): {
  title: string
  subtitle: string
  steps: StepConfig[]
} {
  const menuIcon = (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )

  const shareIcon = (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
    </svg>
  )

  const downloadIcon = (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )

  const addIcon = (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const checkIcon = (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  // ─── iOS (Safari) ───
  if (platform === 'ios') {
    return {
      title: 'Instalar no iPhone / iPad',
      subtitle: 'Siga os passos abaixo no Safari',
      steps: [
        { icon: shareIcon, title: 'Toque em Compartilhar', description: 'Toque no ícone de compartilhar (□↑) na barra inferior do Safari' },
        { icon: addIcon, title: 'Adicionar à Tela Inicial', description: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
        { icon: checkIcon, title: 'Confirmar', description: 'Toque em "Adicionar" no canto superior direito' },
      ],
    }
  }

  // ─── Safari macOS ───
  if (platform === 'safari-desktop') {
    return {
      title: 'Instalar no macOS',
      subtitle: 'No Safari (macOS Sonoma ou superior)',
      steps: [
        { icon: menuIcon, title: 'Menu Arquivo', description: 'Clique em "Arquivo" na barra de menu do Safari' },
        { icon: addIcon, title: 'Adicionar ao Dock', description: 'Selecione "Adicionar ao Dock" no menu' },
        { icon: checkIcon, title: 'Pronto!', description: 'O app aparecerá no seu Dock como um app nativo' },
      ],
    }
  }

  // ─── Android ───
  if (platform === 'android') {
    return {
      title: 'Instalar no Android',
      subtitle: 'Instale como app no seu celular',
      steps: [
        { icon: menuIcon, title: 'Menu do Navegador', description: 'Toque nos três pontos (⋮) no canto superior direito' },
        { icon: addIcon, title: 'Instalar App', description: 'Selecione "Instalar app" ou "Adicionar à tela inicial"' },
        { icon: checkIcon, title: 'Confirmar', description: 'Toque em "Instalar" e pronto!' },
      ],
    }
  }

  // ─── Firefox Desktop ───
  if (platform === 'firefox-desktop') {
    return {
      title: 'Acessar como App',
      subtitle: 'Firefox não suporta PWA nativamente',
      steps: [
        { icon: downloadIcon, title: 'Use Chrome ou Edge', description: 'Abra iapersonal.app.br no Chrome ou Edge para instalar como app' },
        { icon: addIcon, title: 'Ou Salve nos Favoritos', description: 'Pressione ⌘+D (Ctrl+D no Windows) para acesso rápido' },
      ],
    }
  }

  // ─── Chromium-based browsers (specific instructions per browser) ───
  if (platform === 'chromium-desktop') {
    if (browser === 'chrome') {
      return {
        title: 'Instalar no Chrome',
        subtitle: 'Instale como app nativo no seu computador',
        steps: [
          { icon: menuIcon, title: 'Menu do Chrome', description: 'Clique no menu ⋮ (canto superior direito)' },
          { icon: shareIcon, title: 'Cast, Save, and Share', description: 'Selecione "Cast, Save, and Share" → "Install page as app..."' },
          { icon: checkIcon, title: 'Confirmar', description: 'Clique em "Install" — o app aparecerá nos seus aplicativos' },
        ],
      }
    }

    if (browser === 'brave') {
      return {
        title: 'Instalar no Brave',
        subtitle: 'Instale como app nativo',
        steps: [
          { icon: menuIcon, title: 'Menu do Brave', description: 'Clique no menu ☰ (canto superior direito)' },
          { icon: addIcon, title: 'Instalar VFIT...', description: 'Procure "Instalar VFIT..." no menu principal. Se não encontrar, vá em "Mais ferramentas" → "Criar atalho..."' },
          { icon: checkIcon, title: 'Confirmar', description: 'Marque "Abrir como janela" se disponível e clique em "Instalar"' },
        ],
      }
    }

    if (browser === 'edge') {
      return {
        title: 'Instalar no Edge',
        subtitle: 'Instale como app nativo',
        steps: [
          { icon: menuIcon, title: 'Menu do Edge', description: 'Clique no menu ⋯ (canto superior direito)' },
          { icon: addIcon, title: 'Apps', description: 'Selecione "Apps" → "Instalar este site como um app"' },
          { icon: checkIcon, title: 'Confirmar', description: 'Clique em "Instalar" — o app aparecerá na barra de tarefas' },
        ],
      }
    }

    if (browser === 'opera') {
      return {
        title: 'Instalar no Opera',
        subtitle: 'Instale como app nativo',
        steps: [
          { icon: menuIcon, title: 'Menu do Opera', description: 'Clique no ícone do Opera (canto superior esquerdo) ou menu ⋮' },
          { icon: addIcon, title: 'Instalar como App', description: 'Procure "Instalar..." ou vá em "Mais ferramentas" → "Criar atalho..."' },
          { icon: checkIcon, title: 'Confirmar', description: 'Marque "Abrir como janela" e clique em "Criar"' },
        ],
      }
    }

    if (browser === 'vivaldi') {
      return {
        title: 'Instalar no Vivaldi',
        subtitle: 'Instale como app nativo',
        steps: [
          { icon: downloadIcon, title: 'Ícone na Barra de Endereço', description: 'Procure o ícone de instalação (⊕) no lado direito da barra de endereço' },
          { icon: menuIcon, title: 'Ou via Menu', description: 'Menu Vivaldi → "Ferramentas" → "Instalar VFIT..."' },
          { icon: checkIcon, title: 'Confirmar', description: 'Clique em "Instalar"' },
        ],
      }
    }

    if (browser === 'arc') {
      return {
        title: 'Arc não suporta PWA',
        subtitle: 'Use Chrome para a melhor experiência',
        steps: [
          { icon: downloadIcon, title: 'Abra no Chrome', description: 'Copie iapersonal.app.br e abra no Google Chrome' },
          { icon: addIcon, title: 'Instalar como App', description: 'No Chrome: menu ⋮ → "Cast, Save, and Share" → "Install page as app..."' },
          { icon: checkIcon, title: 'Pronto!', description: 'O app aparecerá como app nativo no Mac' },
        ],
      }
    }

    // Comet, Samsung, or any other Chromium-based browser
    return {
      title: 'Instalar como App',
      subtitle: 'Instale para acesso rápido',
      steps: [
        { icon: downloadIcon, title: 'Ícone na Barra de Endereço', description: 'Procure um ícone de instalação (⊕ ou ⬇) no lado direito da barra de endereço' },
        { icon: menuIcon, title: 'Ou via Menu', description: 'Abra o menu do navegador (⋮ ou ☰) e procure "Instalar app", "Install page as app" ou "Criar atalho"' },
        { icon: checkIcon, title: 'Confirmar', description: 'Confirme a instalação — o app aparecerá nos seus aplicativos' },
      ],
    }
  }

  // ─── Generic fallback ───
  return {
    title: 'Instalar o App',
    subtitle: 'Instale para acesso rápido ao app',
    steps: [
      { icon: menuIcon, title: 'Menu do Navegador', description: 'Clique no menu do seu navegador' },
      { icon: addIcon, title: 'Instalar App', description: 'Selecione "Instalar" ou "Adicionar à tela inicial"' },
      { icon: checkIcon, title: 'Confirmar', description: 'Confirme a instalação e pronto!' },
    ],
  }
}

function InstructionsOverlay() {
  const ctx = usePwaInstall()

  const closeOverlay = ctx?.closeOverlay

  // Close on escape — must be before any early return
  useEffect(() => {
    if (!closeOverlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOverlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeOverlay])

  if (!ctx) return null

  const { platform, browserName } = ctx
  const config = getInstructionConfig(platform, browserName)

  return (
    <div
      className="fixed inset-0 z-10000 flex items-end sm:items-center justify-center animate-[overlay-fade-in_0.25s_ease-out]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]"
        onClick={closeOverlay}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-95 mx-4 mb-4 sm:mb-0 animate-[banner-slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ marginBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="relative overflow-hidden rounded-3xl">
          {/* Ultra glass */}
          <div className="absolute inset-0 bg-bg-dark-secondary/75 backdrop-blur-[48px] [-webkit-backdrop-filter:blur(48px)_saturate(200%)] border border-white/10 rounded-3xl" />

          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/60 to-transparent" />

          {/* Inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-[12px] bg-linear-to-br from-brand-primary to-emerald-600 shadow-lg shadow-brand-primary/20">
                  <span className="text-sm font-black text-bg-dark">IA</span>
                  <div className="absolute inset-0 rounded-[12px] bg-linear-to-br from-white/20 to-transparent" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{config.title}</h3>
                  <p className="text-[11px] text-zinc-500">{config.subtitle}</p>
                </div>
              </div>
              <button
                onClick={closeOverlay}
                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/8 transition-all duration-200"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {config.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl bg-white/3 border border-white/6 p-3.5 transition-all duration-200 hover:bg-white/5 hover:border-white/10"
                >
                  <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/15">
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-primary/15 text-[9px] font-bold text-brand-primary">
                        {i + 1}
                      </span>
                      <h4 className="text-[13px] font-semibold text-white">{step.title}</h4>
                    </div>
                    <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* iOS Safari bottom arrow hint */}
            {platform === 'ios' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>O ícone de compartilhar fica na barra inferior</span>
              </div>
            )}

            {/* Close CTA */}
            <button
              onClick={closeOverlay}
              className="mt-5 w-full rounded-xl bg-white/6 border border-white/8 px-4 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/12"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable Install Button ──────────────────────────────────────────

interface PwaInstallButtonProps {
  variant?: 'default' | 'small' | 'icon'
  className?: string
}

export function PwaInstallButton({ variant = 'default', className = '' }: PwaInstallButtonProps) {
  const ctx = usePwaInstall()

  // Don't render if no context or already installed
  if (!ctx || ctx.isInstalled) return null

  const { triggerInstall } = ctx

  if (variant === 'icon') {
    return (
      <button
        onClick={triggerInstall}
        className={`p-2 rounded-lg text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 ${className}`}
        aria-label="Instalar app"
        title="Instalar app"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    )
  }

  if (variant === 'small') {
    return (
      <button
        onClick={triggerInstall}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/25 ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Instalar
      </button>
    )
  }

  // Default variant
  return (
    <button
      onClick={triggerInstall}
      className={`inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-emerald-500 px-5 py-2.5 text-sm font-bold text-bg-dark transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,142,0.3)] hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Instalar App
    </button>
  )
}
