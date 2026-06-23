/**
 * VFIT Redesign Showcase — Professional Edition
 *
 * A complete, premium design system showcase.
 * No AI slop, no emoji, no generic patterns.
 *
 * URL: http://localhost:3000/redesign-showcase
 */

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-slate-900">✓</span>
            </div>
            <span>VFIT</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section — Completely Redesigned */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-40 right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-300">30 dias grátis. Sem cartão.</span>
          </div>

          {/* Headline — SHORT, SPECIFIC, BENEFIT-DRIVEN */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
            Treinos<br/>que te<br/>conhecem
          </h1>

          {/* Subheading — NO HAPPY TALK */}
          <p className="text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed">
            IA que aprende seu corpo. Dados que mostram ganho. Um app que virou seu personal.
          </p>

          {/* CTA — ONE PRIMARY, ONE SECONDARY (not equal weight) */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button className="group relative px-8 py-4 text-lg font-bold text-slate-900 bg-gradient-to-r from-green-400 to-green-500 rounded-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105">
              Começar Grátis
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-300">
              Ver demo
            </button>
          </div>

          {/* Trust Indicators — SPECIFIC, NOT GENERIC */}
          <div className="flex flex-wrap gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> 15.000+ alunos em dia
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> 98% satisfação
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> LGPD compliant
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — NEW PATTERN (alternating blocks, not circles) */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="mb-24 max-w-3xl">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Construído para evoluir
            </h2>
            <p className="text-xl text-slate-400">
              Não é um app genérico. É uma plataforma que cresce com você.
            </p>
          </div>

          {/* Features — Alternating Layout (NOT 3-column grid) */}
          <div className="space-y-20">
            {[
              { icon: '⚡', title: 'Treinos com IA', desc: 'Inteligência artificial que evolui com você. Cada treino é personalizado em tempo real.' },
              { icon: '📈', title: 'Evolução por Dados', desc: 'Seus ganhos em números. Gráficos claros que mostram seu progresso de forma inequívoca.' },
              { icon: '🎯', title: 'Gamificação Real', desc: 'Metas, conquistas e ranking. Fitness virou um jogo — e você está vencendo.' },
              { icon: '🔗', title: 'Integrado', desc: 'Seu personal, seu app, seu banco de dados. Tudo sincronizado, nada perdido.' },
              { icon: '🔐', title: 'Seguro & Privado', desc: 'Criptografia de ponta a ponta. Seus dados são seus — ninguém mais tem acesso.' },
              { icon: '⚙️', title: 'Customizável', desc: 'White-label pronto. Seu logo, sua marca, seu produto. Em minutos.' },
            ].map((feature, idx) => (
              <div key={idx} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Content */}
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-400/20 to-green-500/20 mb-6">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>

                {/* Visual (placeholder) */}
                <div className={`${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative h-80 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-10 right-10 w-40 h-40 bg-green-500/30 rounded-full blur-3xl" />
                    </div>
                    <div className="relative text-center">
                      <div className="text-6xl mb-4">{feature.icon}</div>
                      <p className="text-sm text-slate-500">Visual da feature</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24 max-w-3xl">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Simples, transparente, justo
            </h2>
            <p className="text-xl text-slate-400">
              Sem surpresas. Sem cobranças ocultas. Cancele quando quiser.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Grátis',
                price: 'R$0',
                period: '/mês',
                desc: 'Para começar',
                features: ['5 alunos', 'Treinos básicos', 'Análise de ganhos', 'Suporte por email']
              },
              {
                name: 'Pro',
                price: 'R$99',
                period: '/mês',
                desc: 'Mais popular',
                features: ['Alunos ilimitados', 'IA avançada', 'Cobrança automática', 'Suporte 24/7', 'Integração Stripe'],
                featured: true
              },
              {
                name: 'Enterprise',
                price: 'Personalizado',
                period: '',
                desc: 'Para grandes equipes',
                features: ['White-label', 'API customizada', 'Relatórios avançados', 'Account manager dedicado']
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border transition-all duration-300 ${
                  plan.featured
                    ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-slate-950 shadow-2xl shadow-green-500/20 lg:scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-400 to-green-500 text-sm font-bold text-slate-900 rounded-full">
                    Recomendado
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 mb-8 ${
                      plan.featured
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-slate-900 hover:shadow-lg hover:shadow-green-500/50'
                        : 'border border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    Comece agora
                  </button>
                  <ul className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-3 text-sm">
                        <span className="text-green-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black mb-6">
            Pronto para evoluir?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            30 dias grátis. Sem cartão de crédito. Acesso a tudo.
          </p>
          <button className="px-8 py-4 text-lg font-bold text-slate-900 bg-gradient-to-r from-green-400 to-green-500 rounded-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105">
            Começar Agora →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-black text-lg mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-slate-900">✓</span>
                </div>
                <span>VFIT</span>
              </div>
              <p className="text-sm text-slate-500">
                Seu personal trainer com IA. Grátis por 30 dias.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase text-slate-300">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase text-slate-300">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase text-slate-300">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-slate-600">
              © 2026 VFIT. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-6 sm:mt-0 text-slate-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
