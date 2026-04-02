# Melhorias — B2C e Monetização

> Propostas para aumentar conversão trial→pago, reduzir churn e expandir receita.
> Contexto: planos `trial`, `pro`, `max`. Gateway: Asaas (brasileiro).

---

## 1. Trial com Features Desbloqueadas Progressivamente

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** O trial atual provavelmente dá acesso total por X dias e depois bloqueia tudo. Isso não cria percepção de valor progressiva e o usuário pode não explorar as features mais valiosas.

**Proposta:** Estruturar o trial como jornada de descoberta. Cada dia ou ação desbloqueie uma funcionalidade diferente, guiando o usuário pelas features de maior valor antes do paywall.

**Progressão sugerida (primeiros 7 dias):**

| Dia | Feature desbloqueada |
|---|---|
| 1 | Criar primeiro treino |
| 2 | Adicionar aluno |
| 3 | Gamificação básica (XP e nível) |
| 4 | Relatório de progresso |
| 5 | Modelos de treino (templates) |
| 6 | Notificações push para alunos |
| 7 | Tudo desbloqueado — call to action de conversão |

**Implementação:**
- Campo `trial_day` calculado a partir de `trial_started_at` no perfil
- Middleware de feature flags baseado em `trial_day` e `plan`
- Notificação push diária: "Hoje você desbloqueou: [feature]. Experimente agora."

---

## 2. Paywall Contextual

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 41

**Problema:** O paywall é exibido em um momento fixo (ex: ao entrar no dashboard após trial expirado), não no momento em que o usuário quer usar uma feature premium. A conversão é menor porque não há contexto de valor imediato.

**Proposta:** Exibir o paywall no exato momento em que o usuário tenta usar uma feature premium, com copy específico para aquela feature.

**Exemplos:**

| Ação do usuário | Copy do paywall |
|---|---|
| Tenta criar 6º aluno (limite trial: 5) | "Seu plano trial permite até 5 alunos. Faça upgrade para adicionar alunos ilimitados." |
| Tenta ver relatório avançado | "Relatórios detalhados são exclusivos do plano Pro. Veja o que você está perdendo." |
| Tenta usar template premium | "Este template é exclusivo para assinantes. Assine e acesse + 50 templates prontos." |

**Implementação:**
- Componente `feature-gate.tsx` — wrapper que verifica plano antes de renderizar conteúdo
- Props: `feature`, `requiredPlan`, `ctaCopy` (com padrão automático por feature)
- `useFeatureAccess(feature)` — hook que verifica plano do usuário via `auth-store.ts`
- Modal de paywall com preview da feature, benefícios e CTA

---

## 3. Oferta de Downsell

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** Usuários que recusam o plano anual vão embora sem conversão. Plano mensal como alternativa imediata aumenta a taxa de conversão total.

**Proposta:** Após recusa do plano anual, exibir automaticamente oferta de plano mensal com destaque no desconto anual para criar ancoragem.

**Fluxo:**
```
Usuário vê plano anual (R$ X/mês)
       ↓
Clica "Não, obrigado" ou fecha
       ↓
Modal: "Prefere começar mensalmente?"
Plano mensal: R$ Y/mês
(Você economiza R$ Z/ano no plano anual)
       ↓
CTA "Assinar mensalmente"
```

**Implementação:**
- Estado `paywallAttempts` em `localStorage` — se > 1, exibir downsell automaticamente
- Componente `downsell-modal.tsx`
- Evento analytics: `paywall_downsell_shown` e `paywall_downsell_converted`

---

## 4. Social Proof no Paywall

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** O paywall atual não usa prova social para reduzir objeções de compra.

**Proposta:** Exibir métricas reais do produto no paywall: número de personals ativos, treinos completados hoje, avaliação média.

**Dados sugeridos:**

```
✅ +2.400 personals treinadores confiam na plataforma
✅ 1.847 treinos completados hoje
✅ 4.8★ de avaliação média (App Store)
```

**Implementação:**
- Endpoint público `GET /stats/social-proof` — retorna métricas em cache (atualiza a cada hora)
- Dados aproximados arredondados (ex: "2.400+" em vez de "2.387") — mais credível
- KV cache com TTL de 1 hora para não sobrecarregar o banco
- `use-social-proof.ts` — hook com `staleTime: 3600000`

---

## 5. Referral Program

**Prioridade:** 🟡 Média | **Esforço:** G | **Sprint sugerida:** 44

**Problema:** Crescimento atual depende de canais pagos. Referral pode criar canal orgânico com custo de aquisição muito menor.

**Proposta:** Programa "Convide um amigo, ganhe 1 mês grátis". O convidado também ganha benefício (ex: 2 semanas extras de trial).

**Fluxo:**
```
Personal acessa "Convidar amigos" no menu
       ↓
Copia link único /register?ref=ABC123
       ↓
Amigo se cadastra via link
       ↓
Assinante ganha 1 mês após amigo virar pro/max
```

**Implementação:**
- Tabela `referrals` com `referrer_id`, `referred_id`, `status`, `rewarded_at`
- Endpoint `POST /referrals/claim` — processa recompensa após conversão do indicado
- Link único gerado a partir de `userId` (hash curto, não reversível)
- Integração com Asaas: extensão de assinatura via API de créditos/desconto

---

## 6. Plano Corporativo / Empresa

**Prioridade:** 🟡 Média | **Esforço:** G | **Sprint sugerida:** 45+

**Problema:** Academias e estúdios que têm múltiplos personals precisam gerenciar assinaturas individuais, o que é operacionalmente caro.

**Proposta:** Plano corporativo com múltiplos assentos, fatura única para a empresa e painel de gestão de licenças.

**Features:**
- N assentos de personal incluídos (ex: plano Business: 5 personals)
- Fatura mensal/anual única no CNPJ da empresa
- Painel admin da empresa: adicionar/remover personals, ver uso
- Desconto progressivo por volume de assentos

**Implementação:**
- Novo `plan_type: 'corporate'` e tabela `organizations` no banco
- Papel `org_admin` com permissões de gestão de membros
- Fluxo de onboarding corporativo separado
- Asaas: criar cliente PJ com cobrança no CNPJ

---

## 7. PIX com Desconto vs. Cartão

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** Pagamentos via cartão têm taxa de processamento mais alta (em torno de 2–3%). PIX tem custo próximo de zero. Incentivar PIX melhora margem.

**Proposta:** Oferecer desconto de 5% para pagamentos via PIX no checkout.

**Implementação:**
- Asaas já suporta PIX nativo — verificar API de criação de cobrança com desconto por tipo de pagamento
- UI no checkout: "Pague com PIX e ganhe 5% de desconto"
- QR Code do PIX exibido inline (Asaas retorna QR code na resposta)
- Validade do QR code: 30 minutos com contador visível
- Fallback automático para cartão se PIX não for pago em 30 min

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Trial com features progressivas | 🔴 Alta | M | 42 |
| 2 | Paywall contextual | 🔴 Alta | M | 41 |
| 3 | Oferta de downsell | 🟡 Média | P | 42 |
| 4 | Social proof no paywall | 🟡 Média | P | 42 |
| 5 | Referral program | 🟡 Média | G | 44 |
| 6 | Plano corporativo / empresa | 🟡 Média | G | 45+ |
| 7 | PIX com desconto vs. cartão | 🟡 Média | P | 41 |
