'use client'

import { DSIcon } from '@/components/ui/ds-icon'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index?: number
}

/**
 * Ultra-modern glassmorphism feature card
 * - Subtle glass effect with blur
 * - Hover animation (scale + glow)
 * - Smooth staggered entrance
 */
function FeatureCardUltra({
  icon,
  title,
  description,
  index = 0,
}: FeatureCardProps) {
  return (
    <div
      className="group relative p-8 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(58,181,74,0.15)]"
      style={{
        animation: `slideUp 500ms ease-out ${300 + index * 100}ms backwards`,
      }}
    >
      {/* Animated gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(58, 181, 74, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Icon container */}
      <div className="relative mb-4 inline-flex p-3 rounded-xl bg-brand-primary/10 group-hover:bg-brand-primary/15 transition-colors">
        <div className="text-brand-primary text-2xl">{icon}</div>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
          {description}
        </p>
      </div>

      {/* Accent line on hover */}
      <div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-primary to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ width: 0 }}
      />
    </div>
  )
}

/**
 * Features grid with ultra-modern cards
 */
export function FeatureCardsUltra() {
  const features = [
    {
      icon: '🤖',
      title: 'IA Inteligente',
      description: 'Treinos gerados por inteligência artificial que se adaptam ao seu nível e objetivos.',
    },
    {
      icon: '📊',
      title: 'Evolução por Dados',
      description: 'Acompanhe seu progresso em tempo real com gráficos detalhados e insights personalizados.',
    },
    {
      icon: '🎮',
      title: 'Gamificação',
      description: 'Ganhe pontos, desbloqueie badges e compita com amigos para manter a motivação.',
    },
    {
      icon: '💪',
      title: 'Treinos Variados',
      description: 'Desde musculação até cardio: escolha o tipo de treino que mais combina com você.',
    },
    {
      icon: '📱',
      title: 'Offline',
      description: 'Use o app até sem internet. Seus treinos são sincronizados quando voltar online.',
    },
    {
      icon: '🔒',
      title: 'Segurança',
      description: 'Seus dados são criptografados e protegidos com os mais altos padrões de segurança.',
    },
  ]

  return (
    <section
      id="features"
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-16"
          style={{
            animation: 'slideUp 500ms ease-out',
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 mb-6 backdrop-blur-sm">
            <span className="text-sm font-semibold text-green-300">RECURSOS</span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{
              fontFamily: 'Inter, -apple-system, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Tudo que você precisa para transformar
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ferramentas poderosas e intuitivas para maximizar seus resultados
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCardUltra
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes slideUp {
            to { transform: none; }
          }
        }
      `}</style>
    </section>
  )
}
