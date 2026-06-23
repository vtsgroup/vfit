'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { ButtonUltra } from '@/components/ui/button-ultra'

/**
 * Ultra-modern navigation bar
 * Features:
 * - Glassmorphism with blur effect
 * - Smooth transitions
 * - Mobile menu (hamburger)
 * - Logo + navigation links
 * - CTA buttons
 */

export function NavbarUltra() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { label: 'Plataforma', href: '#features' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sobre', href: '/sobre' },
  ]

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md transition-all duration-300"
      style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-white text-xl hover:text-brand-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <span className="text-slate-900 font-black">V</span>
            </div>
            <span>VFIT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <ButtonUltra
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </ButtonUltra>
            <ButtonUltra
              variant="glass-primary"
              size="sm"
              asChild
              className="font-bold"
            >
              <Link href="/register">Começar Grátis</Link>
            </ButtonUltra>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <DSIcon
              name={isOpen ? 'x' : 'menu'}
              size={24}
              className="text-white"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden border-t border-white/10 py-4 space-y-4"
            style={{
              animation: 'slideDown 300ms ease-out',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-slate-400 hover:text-white transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <ButtonUltra
                variant="ghost"
                size="sm"
                asChild
                fullWidth
              >
                <Link href="/login">Entrar</Link>
              </ButtonUltra>
              <ButtonUltra
                variant="glass-primary"
                size="sm"
                asChild
                fullWidth
                className="font-bold"
              >
                <Link href="/register">Começar Grátis</Link>
              </ButtonUltra>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes slideDown {
            to { transform: none; }
          }
        }
      `}</style>
    </nav>
  )
}
