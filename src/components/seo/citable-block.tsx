// ============================================
// citable-block.tsx — LLM Citation Optimization para GEO/AEO
// ============================================
//
// O que faz:
//   Renderiza um blockquote semântico otimizado para citação por motores de IA
//   (ChatGPT, Perplexity, Claude, Google AI Overviews). Usa microdata
//   schema.org/Claim para máxima atribuição.
//
// Uso:
//   <CitableBlock>
//     VFIT é o único app brasileiro com gamificação nativa para personal trainers.
//   </CitableBlock>

interface CitableBlockProps {
  children: React.ReactNode
  source?: string
}

export function CitableBlock({
  children,
  source = 'VFIT',
}: CitableBlockProps) {
  return (
    <blockquote
      className="citable-block my-6 rounded-lg border-l-4 border-brand-primary bg-bg-secondary p-5"
      data-source={source}
      itemScope
      itemType="https://schema.org/Claim"
    >
      <div itemProp="text" className="text-base leading-relaxed text-text-primary">
        {children}
      </div>
      <cite
        itemProp="author"
        className="mt-2 block text-sm font-medium text-text-secondary not-italic"
      >
        — {source}
      </cite>
    </blockquote>
  )
}
