// ============================================
// index.ts — Barrel export dos componentes de autenticação
// ============================================
//
// O que faz:
//   Re-exporta todos os componentes do módulo auth.
//   Ponto de importação único para AuthGuard, OAuthButtons, Turnstile, Passkey.
//
// Exports principais:
//   AuthGuard, GuestGuard — guards de rota por tipo de usuário
//   OAuthButtons, AuthDivider — botões OAuth (Google)
//   Turnstile, TurnstileRef — widget CAPTCHA Cloudflare
//   PasskeyPrompt, PasskeyLogin — autenticação com passkeys
export { AuthGuard, GuestGuard } from './auth-guard'
export { DashboardAuthGate } from './dashboard-auth-gate'
export { OAuthButtons, AuthDivider } from './oauth-buttons'
export { Turnstile, type TurnstileRef } from './turnstile'
export { PasskeyPrompt } from './passkey-prompt'
export { PasskeyLogin } from './passkey-login'
