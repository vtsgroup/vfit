/**
 * src/lib/display-mode.ts
 *
 * isStandaloneDisplay — detecta se o app roda instalado (PWA standalone / TWA),
 * não numa aba de browser comum. Fonte única, extraída do splash-screen.tsx
 * (splash-boot v2) para ser reusada pelo app lock (B3) sem acoplar ao componente
 * pesado de splash.
 *
 * Gating pré-paint: o boot script em src/app/layout.tsx seta a classe .vsp-standalone
 * no <html> antes da hidratação — checamos ela primeiro (mais confiável que matchMedia
 * durante o boot), com fallback para matchMedia / navigator.standalone / referrer TWA.
 */
export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  if (document.documentElement.classList.contains('vsp-standalone')) return true
  try {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true) ||
      document.referrer.indexOf('android-app://') !== -1
    )
  } catch {
    return false
  }
}
