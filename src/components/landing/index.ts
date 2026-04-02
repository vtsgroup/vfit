// ============================================
// index.ts — Barrel export dos componentes da landing page
// ============================================
//
// O que faz:
//   Re-exporta todos os componentes da landing page.
//   Ponto único de importação para páginas e layouts da landing.
//
// Exports principais:
//   Navbar, Hero, LandingAnalyticsBootstrap, Features, Pricing (alias PricingKoyeb)
//   Testimonials (alias HowItWorksV2), NumbersSection, GamificationSection
//   BlogSection, FaqSection, AboutSection, CtaSection, Footer
export { Navbar } from './navbar'
export { Hero } from './hero'
export { LandingAnalyticsBootstrap } from './analytics-bootstrap'
export { Features } from './features'
export { PricingKoyeb as Pricing } from './pricing-koyeb'
export { HowItWorksV2 as Testimonials } from './how-it-works-v2'
export { NumbersSection } from './numbers-section'
export { GamificationSection } from './gamification-section'
export { BlogSection } from './blog-section'
export { FaqSection } from './faq-section'
export { AboutSection } from './about-section'
export { CtaSection } from './cta-section'
export { Footer } from './footer'
