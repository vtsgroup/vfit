// ============================================
// layout.tsx — Layout de páginas públicas (landing, blog, legal)
// ============================================
//
// O que faz:
//   Wrapper de layout para todas as rotas (public): Navbar + children + Footer.
//   Inclui skip-to-content link para acessibilidade.
//   Não requer autenticação.
//
// Exports principais:
//   PublicLayout — layout com Navbar e Footer
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { PWAPublicRedirect } from '@/components/pwa/pwa-public-redirect'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <PWAPublicRedirect />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-xl focus:bg-brand-primary focus:px-6 focus:py-3 focus:text-sm focus:font-bold focus:text-bg-dark focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  )
}
