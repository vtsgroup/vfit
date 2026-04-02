/**
 * config/tips.ts
 *
 * Sprint 36 — Seed de 30 dicas fitness categorizadas
 */

export interface Tip {
  id: string
  category: 'nutrition' | 'training' | 'recovery' | 'mindset'
  title: string
  content: string
  icon: string
}

export const TIPS: Tip[] = [
  // ── Nutrição ─────────────────────────────────────
  { id: 'n1', category: 'nutrition', title: 'Hidratação Pré-Treino', content: 'Beba 400-600ml de água 2h antes do treino para máxima performance.', icon: '💧' },
  { id: 'n2', category: 'nutrition', title: 'Proteína Pós-Treino', content: 'Consuma 20-40g de proteína até 2h após o treino para otimizar a síntese proteica.', icon: '🥩' },
  { id: 'n3', category: 'nutrition', title: 'Carboidratos são aliados', content: 'Carboidratos complexos antes do treino fornecem energia sustentada. Batata-doce, aveia e arroz integral são ótimas opções.', icon: '🍠' },
  { id: 'n4', category: 'nutrition', title: 'Não pule refeições', content: 'Jejuns longos não intencionais podem causar perda de massa muscular. Mantenha refeições regulares.', icon: '🍽️' },
  { id: 'n5', category: 'nutrition', title: 'Frutas pós-treino', content: 'Frutas como banana e melancia ajudam a repor glicogênio e fornecem potássio para evitar cãibras.', icon: '🍌' },
  { id: 'n6', category: 'nutrition', title: 'Creatina funciona', content: 'Creatina monoidratada (3-5g/dia) é o suplemento mais estudado e eficaz para ganho de força e massa.', icon: '💊' },
  { id: 'n7', category: 'nutrition', title: 'Café pré-treino', content: 'Cafeína (3-6mg/kg) 30-60min antes do treino melhora foco, resistência e queima de gordura.', icon: '☕' },

  // ── Treino ───────────────────────────────────────
  { id: 't1', category: 'training', title: 'Aquecimento sempre', content: 'Aqueça 5-10min antes de treinar. Séries progressivas com carga leve previnem lesões.', icon: '🔥' },
  { id: 't2', category: 'training', title: 'Sobrecarga progressiva', content: 'Aumente carga, reps ou volume gradualmente a cada semana. É o principal driver de hipertrofia.', icon: '📈' },
  { id: 't3', category: 'training', title: 'Controle a excêntrica', content: 'Desça o peso em 2-3 segundos. A fase excêntrica é responsável por grande parte do estímulo muscular.', icon: '⏱️' },
  { id: 't4', category: 'training', title: 'RPE é seu amigo', content: 'Treine com RPE 7-9 na maioria das séries. Ir à falha sempre pode causar fadiga acumulada.', icon: '🎯' },
  { id: 't5', category: 'training', title: 'Variação inteligente', content: 'Mude exercícios a cada 4-8 semanas, não a cada treino. Consistência > variedade excessiva.', icon: '🔄' },
  { id: 't6', category: 'training', title: 'Compostos primeiro', content: 'Comece com exercícios compostos (agachamento, supino, terra) e termine com isolados.', icon: '🏋️' },
  { id: 't7', category: 'training', title: 'Descanso entre séries', content: '60-90s para hipertrofia, 2-3min para força. Use o timer do app!', icon: '⏰' },
  { id: 't8', category: 'training', title: 'Full ROM', content: 'Amplitude completa gera mais ganho muscular que cargas pesadas com ROM parcial.', icon: '📐' },

  // ── Recuperação ──────────────────────────────────
  { id: 'r1', category: 'recovery', title: 'Sono é anabolizante', content: 'Durma 7-9h por noite. GH e testosterona são liberados durante o sono profundo.', icon: '😴' },
  { id: 'r2', category: 'recovery', title: 'Deload a cada 4-6 semanas', content: 'Reduza volume e intensidade por 1 semana para descanso ativo e prevenção de overtraining.', icon: '🧘' },
  { id: 'r3', category: 'recovery', title: 'Alongamento pós-treino', content: '10-15min de alongamento pós-treino melhora flexibilidade e reduz dor muscular tardia.', icon: '🤸' },
  { id: 'r4', category: 'recovery', title: 'Dias off são importantes', content: 'Músculos crescem no descanso, não no treino. 1-2 dias off por semana são essenciais.', icon: '🛋️' },
  { id: 'r5', category: 'recovery', title: 'Mobilidade articular', content: 'Reserve 5min diários para mobilidade de ombros, quadril e tornozelos. Previne lesões a longo prazo.', icon: '🦴' },
  { id: 'r6', category: 'recovery', title: 'Foam roller', content: 'Rolo de liberação miofascial antes do treino melhora ROM e reduz tensão muscular residual.', icon: '🪵' },

  // ── Mindset ──────────────────────────────────────
  { id: 'm1', category: 'mindset', title: 'Consistência > Intensidade', content: 'Treinar 3x/semana por 1 ano supera 6x/semana por 2 meses. O segredo é não parar.', icon: '🧠' },
  { id: 'm2', category: 'mindset', title: 'Compare com você mesmo', content: 'Seu progresso é pessoal. Compare fotos de 3 meses atrás, não com influencers.', icon: '📸' },
  { id: 'm3', category: 'mindset', title: 'Registre tudo', content: 'Anote seus treinos. O que é medido melhora. Use o app para acompanhar cada série.', icon: '📝' },
  { id: 'm4', category: 'mindset', title: 'Celebre pequenas vitórias', content: 'Cada PR, cada treino concluído, cada semana consistente merece reconhecimento.', icon: '🎉' },
  { id: 'm5', category: 'mindset', title: 'Paciência é chave', content: 'Resultados visíveis levam 8-12 semanas. Confie no processo e nos dados.', icon: '🌱' },
  { id: 'm6', category: 'mindset', title: 'Visualize seus objetivos', content: 'Antes do treino, visualize o exercício com boa forma. Conexão mente-músculo é real.', icon: '🎯' },
  { id: 'm7', category: 'mindset', title: 'Grupo de apoio', content: 'Treinar com alguém ou compartilhar progresso aumenta adesão em até 95%.', icon: '👥' },
]

export const TIP_CATEGORIES = [
  { id: 'all' as const, label: 'Todas', icon: '✨' },
  { id: 'nutrition' as const, label: 'Nutrição', icon: '🍎' },
  { id: 'training' as const, label: 'Treino', icon: '💪' },
  { id: 'recovery' as const, label: 'Recuperação', icon: '😴' },
  { id: 'mindset' as const, label: 'Mindset', icon: '🧠' },
] as const

export function getTipOfTheDay(): Tip {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  return TIPS[dayOfYear % TIPS.length]
}
