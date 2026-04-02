# Melhorias — Onboarding B2C

> O guard de onboarding foi implementado na v6.8.2.
> Este documento propõe evoluções para aumentar a taxa de conclusão e a qualidade dos dados coletados.

---

## 1. Skip Inteligente para Usuários com Histórico

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** Usuários que já usaram o app (re-login, novo dispositivo, mudança de plano) são forçados a repetir todos os steps do onboarding, incluindo dados que já forneceram.

**Proposta:** Ao iniciar o onboarding, verificar quais dados já existem no perfil do usuário. Steps com dados preenchidos são marcados como completos automaticamente, e o usuário começa do primeiro step incompleto.

**Implementação:**
- `use-b2c-onboarding.ts` — ao carregar, buscar `GET /onboarding/progress` e pré-preencher estado
- Se `profile.weight` e `profile.height` já existem, pular step de medidas
- Indicador visual: steps já completos aparecem com checkmark, mas podem ser revisitados

---

## 2. A/B Test de Copy nos Steps

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** Não sabemos qual copy converte melhor em cada step. Hipóteses atuais não são validadas com dados.

**Proposta:** Infraestrutura simples de A/B test usando Cloudflare KV como feature flag store. Dois grupos de copy por step, atribuição por `userId % 2`.

**Implementação:**
- KV key `ab:onboarding:step_{N}:variant` → `{ a: { title, subtitle }, b: { title, subtitle } }`
- Hook `use-ab-variant.ts` — lê KV via API e retorna variante para o usuário
- Evento de analytics ao concluir cada step, incluindo variante
- Análise: comparar taxa de conclusão por step entre variante A e B

**Exemplo de teste:**
- Step de objetivo: "Qual é seu objetivo?" vs. "O que você quer alcançar com seus treinos?"

---

## 3. Progress Save/Resume

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 41

**Problema:** Se o usuário fechar o app no meio do onboarding (notificação, ligação, bateria baixa), perde todo o progresso e recomeça do zero. Alta taxa de abandono.

**Proposta:** Salvar o progresso de cada step no localStorage e na API conforme o usuário avança. Ao retornar, continuar do step onde parou.

**Implementação:**
- `use-b2c-onboarding.ts` — `saveStepProgress(step, data)` persiste em `localStorage['vfit-onboarding-draft']`
- Debounce de 500ms para não salvar a cada keystroke
- Ao montar o onboarding, carregar draft se existir: `resumeFromDraft()`
- Sincronizar com API em background: `POST /onboarding/draft` (não bloqueia UX)
- Expirar draft após 7 dias

---

## 4. Validação em Tempo Real de IMC

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** O step de peso/altura não dá feedback imediato. Usuários que inserem valores inválidos (ex: 300kg, 300cm) só descobrem o erro ao tentar avançar.

**Proposta:** Calcular e exibir o IMC em tempo real conforme o usuário digita peso e altura. Mostrar classificação (Abaixo do peso, Normal, Sobrepeso, Obesidade) com cor semântica.

**Implementação:**
- Função `calculateBMI(weight, height)` em `src/lib/health.ts`
- Componente `bmi-indicator.tsx` — exibe valor e faixa com cor (usando `--ds-*` tokens)
- Validação: IMC < 10 ou > 60 → alerta de valor improvável (não bloqueia, apenas avisa)
- Acessibilidade: `aria-live="polite"` no indicador de IMC

---

## 5. Animações de Transição Entre Steps

**Prioridade:** 🟢 Baixa | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** A transição entre steps é abrupta, sem indicação de direção ou progresso.

**Proposta:** Animação de slide horizontal entre steps (avançar → slide para esquerda, voltar → slide para direita) usando `framer-motion` (já instalado).

**Implementação:**
- Componente `onboarding-step-wrapper.tsx` com `AnimatePresence` e `motion.div`
- Variants: `{ initial: { x: 100 }, animate: { x: 0 }, exit: { x: -100 } }`
- Duração: 200ms para não atrasar o fluxo
- Respeitar `prefers-reduced-motion` via `useReducedMotion()`

---

## 6. Deep Link para Step Específico (Re-onboarding)

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** Não há como enviar o usuário diretamente para reeditar uma área específica do perfil (ex: atualizar objetivo após 3 meses de uso).

**Proposta:** Suporte a deep link `/welcome?step=goals` que abre o onboarding diretamente no step especificado, com contexto de "atualização" em vez de "primeira vez".

**Implementação:**
- `useSearchParams()` no componente de onboarding para ler `step`
- Mapeamento `stepName → stepIndex` em `onboarding-steps.ts`
- Modo `update`: skip da tela de boas-vindas, botão "Salvar" em vez de "Continuar"
- Push notification de re-engajamento: "Seus objetivos mudaram? Atualize seu perfil" → deep link

---

## 7. Analytics de Drop-off por Step

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** Não sabemos em qual step os usuários abandonam o onboarding. Sem esse dado, é impossível priorizar melhorias.

**Proposta:** Rastrear entrada e saída de cada step. Calcular taxa de conclusão step-a-step e identificar gargalos.

**Implementação:**
- Evento `onboarding_step_viewed` e `onboarding_step_completed` com `{ step_name, step_index, user_id }`
- Enviar para GA4 via `gtag()` ou para endpoint interno `POST /analytics/events`
- Dashboard interno: funil de onboarding por step (ver `06-dados-analytics.md`)
- Meta: identificar steps com drop-off > 20% e priorizar melhorias neles

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Skip inteligente para usuários com histórico | 🟡 Média | P | 41 |
| 2 | A/B test de copy | 🟡 Média | M | 43 |
| 3 | Progress save/resume | 🔴 Alta | M | 41 |
| 4 | Validação em tempo real de IMC | 🟡 Média | P | 41 |
| 5 | Animações de transição entre steps | 🟢 Baixa | P | 42 |
| 6 | Deep link para step específico | 🟡 Média | M | 43 |
| 7 | Analytics de drop-off por step | 🔴 Alta | M | 42 |
