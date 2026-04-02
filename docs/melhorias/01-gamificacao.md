# Melhorias — Gamificação

> Base implementada nos Sprints 33–34 (XP, níveis, badges, desafios, leaderboard).
> Este documento propõe evoluções para aprofundar o engajamento.

---

## 1. Streak Freezes

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 41–42

**Problema:** Usuários que perdem um dia de streak por motivo justo (viagem, doença) ficam desmotivados e param de usar o app.

**Proposta:** Introduzir "Freeze de Streak" como item consumível. O usuário acumula freezes ao completar desafios ou atingir marcos de nível. Ao gastar 1 freeze, o streak não é zerado por aquele dia.

**Detalhes de implementação:**
- Nova coluna `streak_freezes_available` na tabela de perfil de gamificação
- Endpoint `POST /gamification/streak/freeze` — consome 1 freeze para o dia atual
- Lógica de proteção no cálculo noturno de streaks (cron ou trigger)
- UI: exibir contador de freezes disponíveis na tela de streaks

**Tabela de ganho de freezes:**

| Gatilho | Freezes ganhos |
|---|---|
| Completar desafio semanal | 1 |
| Atingir novo nível | 2 |
| Streak de 30 dias | 3 |
| Compra no loja de XP (futuro) | Variável |

---

## 2. Leaderboard Semanal vs. All-Time

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** O leaderboard atual é all-time, o que desmotiva usuários novos que nunca conseguirão alcançar usuários antigos.

**Proposta:** Separar em duas abas:
- **Semanal:** resetado toda segunda-feira às 00:00 BRT. Premia consistência recente.
- **All-time:** ranking histórico, símbolo de prestígio.

**Implementação:**
- Adicionar coluna `xp_current_week` na tabela de gamificação, zerada por cron semanal
- `GET /gamification/leaderboard?period=weekly|alltime`
- Frontend: tabs "Esta semana" / "All-time" na página de leaderboard

---

## 3. Badge Raridade Visual

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** Todas as badges têm o mesmo visual, sem distinção de valor ou dificuldade.

**Proposta:** Implementar sistema de raridade com 4 níveis, cada um com cor e efeito visual distinto.

| Raridade | Cor | Efeito | Critério exemplo |
|---|---|---|---|
| Common | Cinza | Sem efeito | Primeiro treino completo |
| Rare | Azul | Borda brilhante | 30 dias de streak |
| Epic | Roxo | Brilho pulsante | Top 10 no leaderboard |
| Legendary | Dourado | Animação de partículas | Nível máximo (20) |

**Implementação:**
- Campo `rarity: 'common' | 'rare' | 'epic' | 'legendary'` em `badge-config.ts`
- CSS classes no DS: `badge-rarity-common`, `badge-rarity-rare`, etc., usando `--ds-*` tokens
- Animação leve com `framer-motion` para epic e legendary (já dependência do projeto)

---

## 4. XP Multiplier Events

**Prioridade:** 🟢 Baixa | **Esforço:** M | **Sprint sugerida:** 43+

**Problema:** O app não tem eventos especiais que incentivem engajamento em períodos específicos.

**Proposta:** Eventos de XP multiplicador em períodos configuráveis (ex: fins de semana 2x XP).

**Implementação:**
- Tabela `xp_events` com colunas `multiplier`, `starts_at`, `ends_at`, `label`
- `xp-service.ts` verifica evento ativo antes de registrar XP
- Banner na home quando evento está ativo: "🔥 Fim de semana — 2× XP em todos os treinos"
- Configuração via painel admin (sem necessidade de deploy)

---

## 5. Tela de Level-Up / Celebração

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** Subir de nível não tem feedback visual marcante. O usuário não percebe o momento.

**Proposta:** Ao detectar level-up após ganho de XP, exibir um modal/overlay de celebração antes de retornar ao fluxo normal.

**Conteúdo da tela:**
- Animação de confetti ou partículas (framer-motion)
- Número do novo nível em destaque
- Recompensa desbloqueada (badge, freeze, etc.)
- Botão "Continuar"

**Implementação:**
- `use-gamification.ts`: ao `mutate` de XP retornar `level_up: true`, disparar estado local
- Componente `level-up-modal.tsx` com animação
- Verificar se `framer-motion` já cobre o efeito ou se precisa de biblioteca de partículas leve

---

## 6. Social Sharing de Conquistas

**Prioridade:** 🟢 Baixa | **Esforço:** M | **Sprint sugerida:** 44+ (após Sprint 35 Social)

**Problema:** Conquistas ficam presas dentro do app, sem viralidade externa.

**Proposta:** Gerar imagem de compartilhamento (OG card) para badges e marcos de nível, permitindo compartilhar via Web Share API.

**Implementação:**
- Worker endpoint `GET /gamification/share-card?badge=:id` — gera PNG via Cloudflare `@cloudflare/puppeteer` ou satori
- Frontend: botão "Compartilhar" em badges conquistadas e tela de level-up
- Fallback para copiar link quando Web Share API não disponível

---

## 7. Push Notification ao Subir de Nível

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** Se o usuário fechar o app após um treino, não recebe o feedback do level-up.

**Proposta:** Enviar push notification via OneSignal quando nível sobe.

**Implementação:**
- Em `gamification.ts` (worker), após calcular level-up, chamar `lib/onesignal.ts`
- Template: "🎉 Você subiu para o Nível {N}! Abra o app para ver sua recompensa."
- Respeitar configuração de notificações do usuário (opt-out)
- `lib/onesignal.ts` já existe no projeto — apenas adicionar o gatilho

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Streak freezes | 🟡 Média | M | 41–42 |
| 2 | Leaderboard semanal | 🟡 Média | P | 41 |
| 3 | Badge raridade visual | 🟡 Média | M | 42 |
| 4 | XP multiplier events | 🟢 Baixa | M | 43+ |
| 5 | Tela de level-up | 🟡 Média | P | 41 |
| 6 | Social sharing de conquistas | 🟢 Baixa | M | 44+ |
| 7 | Push notification level-up | 🟡 Média | P | 42 |
