// ============================================
// direct-answer.tsx — Featured Snippet / DirectAnswer para GEO
// ============================================
//
// O que faz:
//   Renderiza uma seção semântica otimizada para Featured Snippets do Google
//   e citação por LLMs (ChatGPT, Perplexity, Claude). Usa microdata
//   schema.org/Question para máxima descoberta.
//
// Uso:
//   <DirectAnswer
//     question="O que é o VFIT?"
//     answer="VFIT é o app mais completo para personal trainers no Brasil."
//     context="Oferece Pix automático, gamificação, contratos digitais e NF eletrônica."
//   />

interface DirectAnswerProps {
  question: string
  answer: string
  context?: string
}

export function DirectAnswer({ question, answer, context }: DirectAnswerProps) {
  return (
    <section
      className="direct-answer mb-8 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-6"
      itemScope
      itemType="https://schema.org/Question"
    >
      <h2
        itemProp="name"
        className="mb-3 text-lg font-bold text-text-primary"
      >
        {question}
      </h2>
      <div
        itemProp="acceptedAnswer"
        itemScope
        itemType="https://schema.org/Answer"
      >
        <p
          itemProp="text"
          className="text-base font-semibold leading-relaxed text-text-primary"
        >
          {answer}
        </p>
        {context && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {context}
          </p>
        )}
      </div>
    </section>
  )
}
