// ============================================
// layout.tsx — Layout raiz da aplicação Next.js
// ============================================
//
// O que faz:
//   Root layout: define viewport, metadata global, fontes (Inter), GA4 (@next/third-parties).
//   Monta Providers LEVE (QueryProvider + ThemeProvider + CookieConsent).
//   Providers pesados (Auth, OneSignal, MotionConfig) estão no dashboard/layout.tsx.
//   WebVitalsTracker e DeferredComponents montados globalmente.
//
// Exports principais:
//   viewport — Viewport Next.js
//   metadata — Metadata Next.js global
//   RootLayout — root layout da aplicação
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Syne, DM_Sans } from "next/font/google";
import { DeferredGA4 } from "@/components/analytics/deferred-ga4";
import { Providers } from "@/components/providers";
import { DeferredComponents } from "@/components/layout/deferred-components";
import { LazyWebVitals } from "@/components/analytics/lazy-web-vitals";
import { SoftwareApplicationSchema, OrganizationSchema, WebSiteSchema } from "@/components/seo/json-ld";
import { SmartAppBanner } from "@/components/ui/smart-app-banner";
import { INDEX_FOLLOW_ROBOTS } from "@/lib/seo";
import "./globals.css";

import { APP_VERSION } from "../../lib/version";

const ICONS_REV = "20260404-v4";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  // themeColor removed from viewport — Next.js manages the meta tag via React,
  // which resets it on re-renders, breaking dynamic theme switching in Chrome.
  // Instead, a manual <meta name="theme-color"> is placed in <head> and
  // controlled by anti-flicker script + ThemeProvider.
};

export const metadata: Metadata = {
  title: {
    default: "VFIT | Treinos com IA — Seu App de Treinos",
    template: "%s | VFIT",
  },
  description:
    "VFIT é o app de treinos com IA mais completo do Brasil. Planos personalizados, progresso real e comunidade. Comece grátis.",
  keywords: [
    "personal trainer",
    "personal trainer app",
    "plataforma personal trainer",
    "treino personalizado",
    "treino com IA",
    "musculação",
    "avaliação física",
    "gestão de alunos",
    "cobrar alunos",
    "app fitness",
  ],
  authors: [{ name: "VFIT" }],
  creator: "VFIT",
  publisher: "VFIT",
  applicationName: "VFIT",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vfit.app.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://vfit.app.br",
    siteName: "VFIT",
    title: "VFIT | Treinos com IA — Seu App de Treinos",
    description:
      "VFIT é o app de treinos com IA mais completo do Brasil. Planos personalizados, progresso real e comunidade. Comece grátis.",
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: "VFIT — Treinos com IA",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VFIT | Treinos com IA — Seu App de Treinos",
    description:
      "VFIT é o app de treinos com IA mais completo do Brasil. Planos personalizados, progresso real e comunidade. Comece grátis.",
    images: ["/og/og-default.png"],
    creator: "@vfitapp",
  },
  robots: INDEX_FOLLOW_ROBOTS,
  manifest: `/manifest.json?v=${APP_VERSION}-${ICONS_REV}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VFIT",
    startupImage: `/icons/startup-1024.png?v=${APP_VERSION}`,
  },
  icons: {
    shortcut: [
      { url: `/favicons/favicon.ico`, type: "image/x-icon" },
      { url: `/favicon.ico`, type: "image/x-icon" },
    ],
    icon: [
      { url: `/favicons/favicon.ico`, type: "image/x-icon" },
      { url: `/favicons/favicon-16.png?v=${APP_VERSION}`, sizes: "16x16", type: "image/png" },
      { url: `/favicons/favicon-32.png?v=${APP_VERSION}`, sizes: "32x32", type: "image/png" },
      { url: `/favicons/favicon-48.png?v=${APP_VERSION}`, sizes: "48x48", type: "image/png" },
      { url: `/favicons/favicon-96.png?v=${APP_VERSION}`, sizes: "96x96", type: "image/png" },
      { url: `/icons/icon-192.png?v=${APP_VERSION}`, sizes: "192x192", type: "image/png" },
      { url: `/icons/icon-512.png?v=${APP_VERSION}`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: `/favicons/apple-touch-icon.png?v=${APP_VERSION}` },
      { url: `/apple-touch-icon.png` },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preload logo SVG — evita FOIT e melhora LCP */}
        <link rel="preload" href="/images/vfit-logo-white.svg" as="image" type="image/svg+xml" />
        {/* dns-prefetch para terceiros (leve, sem conexão TCP) */}
        <link rel="dns-prefetch" href="https://api.vfit.app.br" />
        {/* preconnect removido: GA4 agora é deferred até interação */}
        <link rel="dns-prefetch" href="https://cdn.onesignal.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        {/* iOS Splash Screens — top 4 mais populares (reduzido de 12 para perf) */}
        {/* iPhone 12-15 (390×844 @3x) */}
        <link rel="apple-touch-startup-image" href="/icons/startup-1024.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14/15 Pro (393×852 @3x) */}
        <link rel="apple-touch-startup-image" href="/icons/startup-1024.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14/15 Pro Max (430×932 @3x) */}
        <link rel="apple-touch-startup-image" href="/icons/startup-1024.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone SE / X (375×812 @3x) */}
        <link rel="apple-touch-startup-image" href="/icons/startup-1024.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        {/* Manual theme-color meta — NOT managed by Next.js viewport export.
            Anti-flicker script updates it immediately, ThemeProvider manages dynamically.
            This avoids React re-renders resetting the value. */}
        <meta name="theme-color" content="#050A12" />
        {/* PWA/TWA instant redirect — runs BEFORE React hydration.
            Detects standalone mode and redirects public pages to /dashboard immediately.
            This prevents the landing page flash that PWAPublicRedirect (useEffect) causes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var mm=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;var ns='standalone'in navigator&&navigator.standalone;var tw=document.referrer.indexOf('android-app://')!==-1;if(!mm&&!ns&&!tw)return;var p=location.pathname;var ok=['/welcome','/onboarding','/register','/reset-password','/verify-email','/auth','/login'];var found=false;for(var i=0;i<ok.length;i++){if(p===ok[i]||p.indexOf(ok[i]+'/')===0){found=true;break}}if(found)return;var ha=false;var ut='';try{var ad=localStorage.getItem('vfit-auth')||localStorage.getItem('personal-ia-auth');if(ad){var ps=JSON.parse(ad);if(ps.state&&ps.state.tokens&&ps.state.tokens.access_token){ha=true;ut=(ps.state.user&&ps.state.user.user_type)||''}}}catch(e){}if(ha){var home=ut==='student'?'/treinos':'/dashboard';if(p==='/'||p===home)return;if(ut==='student'&&p.indexOf('/dashboard')===0){location.replace('/treinos');return}if(p==='/')location.replace(home)}else{location.replace('/welcome')}}catch(e){}})();`,
          }}
        />
        {/* Theme anti-flicker — lê tema salvo no localStorage antes do React hidratar.
            Aplica classe + background imediatamente, mas ADIA theme-color (status bar)
            até o first paint via requestAnimationFrame. Isso evita status bar branca
            enquanto o carregamento ainda mostra fundo escuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('vfit-app')||localStorage.getItem('personal-ia-app');var theme='system';var resolved='dark';if(s){var p=JSON.parse(s),st=(p.state||{});theme=st.theme||'system';resolved=st.resolvedTheme||'dark'}var prefersLight=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);var isLight=theme==='light'||(theme==='system'&&prefersLight)||(theme!=='light'&&theme!=='dark'&&resolved==='light');var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(isLight?'light':'dark');root.style.colorScheme=isLight?'light':'dark';var bg=isLight?'#f7fbfa':'#050A12';var tc='#050A12';root.style.backgroundColor=bg;var setMeta=function(){var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].content=tc};if(isLight){requestAnimationFrame(function(){requestAnimationFrame(setMeta)})}else{setMeta()}}catch(e){var prefersLight=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(prefersLight?'light':'dark');root.style.colorScheme=prefersLight?'light':'dark';root.style.backgroundColor=prefersLight?'#f7fbfa':'#050A12'}})();`,
          }}
        />

        {/* Capture beforeinstallprompt — MUST be beforeInteractive so we never miss the event.
            lazyOnload was causing the prompt to be lost when Chrome fired it before the script loaded. */}
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`
            window.__pwaPrompt=null;
            window.__pwaPromptCaptured=false;
            window.__pwaInstalled=false;
            window.__pwaDebugLog=[];
            function pwaLog(msg){window.__pwaDebugLog.push(Date.now()+': '+msg)}
            window.addEventListener('beforeinstallprompt',function(e){
              pwaLog('beforeinstallprompt FIRED');
              e.preventDefault();
              window.__pwaPrompt=e;
              window.__pwaPromptCaptured=true;
              window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
            });
            window.addEventListener('appinstalled',function(){
              pwaLog('appinstalled');
              window.__pwaInstalled=true;
              window.__pwaPrompt=null;
              window.dispatchEvent(new CustomEvent('pwa-installed'));
            });
            if(navigator.getInstalledRelatedApps){
              navigator.getInstalledRelatedApps().then(function(apps){
                window.__pwaRelatedApps=apps;
              }).catch(function(){});
            }
          `}
        </Script>
      </head>
      <body className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}>
        <SmartAppBanner />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
        <WebSiteSchema />
        <LazyWebVitals />
        <DeferredGA4 />
        <Providers>
          <DeferredComponents />
          {children}
        </Providers>
      </body>
    </html>
  );
}
