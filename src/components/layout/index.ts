// ============================================
// index.ts — Barrel export dos componentes de layout
// ============================================
//
// O que faz:
//   Re-exporta todos os componentes de layout do dashboard.
//
// Exports principais:
//   DashboardLayout — wrapper principal do dashboard
//   Sidebar — sidebar de navegação desktop
//   Header — header do dashboard
//   MobileBottomNav, MobileDrawer — navegação mobile
//   ToastContainer — container de toasts
//   PageTransition — animação de transição entre páginas
export { DashboardLayout } from './dashboard-layout'
export { Sidebar } from './sidebar'
export { Header } from './header'
export { MobileBottomNav, MobileDrawer } from './mobile-nav'
export { ToastContainer } from './toast-container'
export { PageTransition } from './page-transition'
