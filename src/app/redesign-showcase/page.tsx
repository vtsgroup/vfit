/**
 * Redesign Showcase Page
 * Visualize all ultra-modern components in action
 *
 * URL: http://localhost:3000/redesign-showcase
 */

import { HeroUltra } from '@/components/landing/hero-ultra'
import { NavbarUltra } from '@/components/landing/navbar-ultra'
import { FeatureCardsUltra } from '@/components/landing/feature-cards-ultra'
import { ButtonUltra } from '@/components/ui/button-ultra'
import { DSIcon } from '@/components/ui/ds-icon'

export default function ShowcasePage() {
  return (
    <main className="bg-slate-950">
      {/* Navigation */}
      <NavbarUltra />

      {/* Hero Section */}
      <HeroUltra />

      {/* Features Grid */}
      <FeatureCardsUltra />

      {/* Button Showcase Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Button Variants
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              All button styles with different states and sizes
            </p>
          </div>

          {/* Buttons Grid */}
          <div className="space-y-16">
            {/* Primary Variants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">Glass Primary (Hero CTA)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ButtonUltra variant="glass-primary" size="sm">
                  Small
                </ButtonUltra>
                <ButtonUltra variant="glass-primary" size="md">
                  Medium
                </ButtonUltra>
                <ButtonUltra variant="glass-primary" size="lg">
                  Large
                </ButtonUltra>
                <ButtonUltra variant="glass-primary" size="xl">
                  XL
                </ButtonUltra>
              </div>
              <div className="mt-4">
                <ButtonUltra variant="glass-primary" size="lg" fullWidth>
                  Full Width Button
                  <DSIcon name="arrowRight" size={18} />
                </ButtonUltra>
              </div>
            </div>

            {/* Secondary Variants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">Glass Secondary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ButtonUltra variant="glass-secondary" size="sm">
                  Small
                </ButtonUltra>
                <ButtonUltra variant="glass-secondary" size="md">
                  Medium
                </ButtonUltra>
                <ButtonUltra variant="glass-secondary" size="lg">
                  Large
                </ButtonUltra>
                <ButtonUltra variant="glass-secondary" size="xl">
                  XL
                </ButtonUltra>
              </div>
            </div>

            {/* Ghost Variants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">Ghost (Minimal)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ButtonUltra variant="ghost" size="sm">
                  Small
                </ButtonUltra>
                <ButtonUltra variant="ghost" size="md">
                  Medium
                </ButtonUltra>
                <ButtonUltra variant="ghost" size="lg">
                  Large
                </ButtonUltra>
                <ButtonUltra variant="ghost" size="xl">
                  XL
                </ButtonUltra>
              </div>
            </div>

            {/* Link Variants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">Link (Text Only)</h3>
              <div className="flex flex-wrap gap-4">
                <ButtonUltra variant="link">
                  Link Button
                </ButtonUltra>
                <ButtonUltra variant="link">
                  With Icon
                  <DSIcon name="arrowRight" size={16} />
                </ButtonUltra>
                <ButtonUltra variant="link">
                  Another Link
                </ButtonUltra>
              </div>
            </div>

            {/* Destructive Variants */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">Destructive (Danger)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ButtonUltra variant="destructive" size="sm">
                  Delete
                </ButtonUltra>
                <ButtonUltra variant="destructive" size="md">
                  Remove
                </ButtonUltra>
                <ButtonUltra variant="destructive" size="lg">
                  Danger
                </ButtonUltra>
                <ButtonUltra variant="destructive" size="xl">
                  Confirm
                </ButtonUltra>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-xl font-bold text-white mb-8">States</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Loading State</p>
                  <ButtonUltra variant="glass-primary" size="lg" loading>
                    Carregando...
                  </ButtonUltra>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Disabled State</p>
                  <ButtonUltra variant="glass-primary" size="lg" disabled>
                    Desabilitado
                  </ButtonUltra>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Form Fields (Glassmorphism)
          </h2>
          <p className="text-lg text-slate-400 mb-12">
            Input fields with glass styling
          </p>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block" style={{ letterSpacing: '0.05em' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block" style={{ letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200"
              />
            </div>

            {/* Text Input with Label */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block" style={{ letterSpacing: '0.05em' }}>
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full h-12 px-4 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200"
              />
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 mb-2 block" style={{ letterSpacing: '0.05em' }}>
                Message
              </label>
              <textarea
                placeholder="Sua mensagem aqui..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus:bg-white/6 transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Color Palette
          </h2>
          <p className="text-lg text-slate-400 mb-12">
            VFIT Design System colors
          </p>

          {/* Primary Colors */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-6">Brand Primary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-brand-primary shadow-lg shadow-brand-primary/20" />
                <p className="text-sm text-slate-400">Primary: #3AB54A</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-brand-primary/80 border border-brand-primary/40" />
                <p className="text-sm text-slate-400">Primary/80%</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-brand-primary/20 border border-brand-primary/30" />
                <p className="text-sm text-slate-400">Primary/20%</p>
              </div>
            </div>
          </div>

          {/* Surface Colors */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-6">Dark Surfaces</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-slate-950 border border-white/10" />
                <p className="text-xs text-slate-400">Surface 0<br />#0A0E14</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-slate-900 border border-white/10" />
                <p className="text-xs text-slate-400">Surface 1<br />#121820</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-slate-800 border border-white/10" />
                <p className="text-xs text-slate-400">Surface 2<br />#1B2230</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-slate-700 border border-white/10" />
                <p className="text-xs text-slate-400">Surface 3<br />#242E3D</p>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Semantic Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <span className="text-green-400 font-bold">✓</span>
                </div>
                <p className="text-xs text-slate-400">Success<br />#10B981</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-amber-400 font-bold">!</span>
                </div>
                <p className="text-xs text-slate-400">Warning<br />#F59E0B</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <span className="text-red-400 font-bold">×</span>
                </div>
                <p className="text-xs text-slate-400">Error<br />#EF4444</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-20 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">i</span>
                </div>
                <p className="text-xs text-slate-400">Info<br />#3B82F6</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 text-sm mb-2">
            VFIT Redesign Showcase — Ultramoderno Design System
          </p>
          <p className="text-slate-600 text-xs">
            Branch: feat/ultramodern-redesign-2026 · All components production-ready
          </p>
        </div>
      </footer>
    </main>
  )
}
