# REVIEW REPORTS — VFIT ULTRA

> Consolidação dos reviews pedidos: **CEO**, **Eng**, e **Design** (plan-design-review / design-review / ui-ux-pro-max / frontend-design).
> CEO foi interativo (decisões abaixo). Eng e Design foram sintetizados em modo autônomo (usuário pediu "não pergunte nada"), aplicando a expertise de cada lente ao plano.

---

## 1. CEO REVIEW (interativo) ✅

**Modo escolhido:** SELECTIVE EXPANSION.
**Abordagem escolhida:** A — Negócio primeiro + trava de fundação (núcleo do DS antes dos painéis).

**Premise challenge:** o problema real não é "faltam features" — é "o topo do funil cobra cartão cedo e o onboarding leva 3-4 min até o valor". As duas alavancas (trial 30d sem cartão + plano instantâneo) valem mais que completar telas. Premissa do plano confirmada.

**Decisões de expansão:**
| ID | Expansão | Decisão |
|----|----------|---------|
| E1 | WhatsApp como canal de produto | ✅ NO ESCOPO (doc 09, sprint S-WA) |
| E2 | Loop viral no trial | ✅ NO ESCOPO (integra S1) |
| E3 | Coach IA proativo | ⏩ Adiado (TODOS.md) |
| E4 | Radar de churn | ⏩ Adiado (TODOS.md) |

**Risco estratégico nº1:** diluir a alavanca de negócio em 8 sprints de polish. **Mitigação:** S1+S2 (trial+onboarding) saem primeiro, isolados e deployáveis, medidos antes do resto.

**VERDICT (CEO):** Plano aprovado em SELECTIVE EXPANSION com E1+E2 adicionados. Executar S1→S2 primeiro.

---

## 2. ENG REVIEW (síntese autônoma)

Lente de eng manager: zero falhas silenciosas, todo erro tem nome, fluxos têm caminhos-sombra, observabilidade é escopo.

### 🔴 Riscos arquiteturais (must-fix antes/durante execução)
1. **Pagamentos sem transação ACID** (Asaas + DB). Caminho-sombra: webhook falha após confirmação no Asaas → estado inconsistente. **Exigir:** wrapper transacional + idempotência por `asaas_payment_id` + retry de webhook (doc 06 §1.1). É o risco nº1 de correção do sistema.
2. **Trial sem fonte única de verdade.** Hoje o check de subscription é sempre `false` (bug). **Exigir:** `lib/entitlements.ts` como única fonte, exposta em `/auth/me` e no middleware (doc 02 A.4). Sem isso, gating fica inconsistente entre front e back.
3. **Cron de expiração de trial é novo e crítico.** Caminho-sombra: cron não roda → trials nunca expiram → receita vaza. **Exigir:** teste do cron + alerta de "cron não executou" (observabilidade).
4. **Referências cross-DB (PG↔D1) sem FK.** Órfãos de `exercise_id`. **Exigir:** validação na escrita + job de reconciliação (doc 06 §1.3).

### 🟡 Consistência e performance
- Paginação ausente em `/admin/*` → O(n) memória. Padronizar `page/per_page` + shape `{success,data,pagination}` em 100% (doc 06 §2, §4).
- N+1 no chat; PDF síncrono (mover p/ queue); TTL de cache alto. (doc 06 §2)
- Validações faltando: due_date no passado, body_fat>100%, reps>1000, **prompt injection na IA** (doc 06 §3). Prompt injection é segurança, não só validação.

### 🟢 Observabilidade (escopo, não afterthought)
- Funil de ativação instrumentado (doc 02 B.6) — sem isso não medimos o sucesso do trial.
- Painel Trial/Conversão (doc 05 §4) + k-factor (viral E2).
- Alertas: cron de trial, webhook Asaas, taxa de erro de signup.

### Temporal interrogation (decisões a resolver antes de codar)
- **Hora 1:** schema do trial unificado + rollback (migration). Resolver nomes de coluna (RULES §9).
- **Hora 2-3:** regra de entitlements (o que cada plano libera durante/após trial) — DECISÕES 2,3,4 do doc 08.
- **Hora 4-5:** integração Asaas só na conversão (não no trial) — garantir que nada chama Asaas no signup.
- **Hora 6+:** anti-abuso (1 trial/CPF/device) + cap de dias do loop viral.

**VERDICT (Eng):** Aprovado com a ordem da Abordagem A. Bloquear S5-S7 (painéis) até `entitlements` (S1) e núcleo do DS (S4) existirem, para evitar rework. O wrapper transacional de pagamentos é o item de maior severidade — fazer cedo em S3.

---

## 3. DESIGN REVIEW (síntese autônoma — 4 lentes)

Lentes: plan-design-review (revisão do plano de design) + design-review (olho crítico) + ui-ux-pro-max (sistema) + frontend-design (execução).

### Diagnóstico (auditoria, nota atual 6.2/10)
- **Fragmentação:** 5 sistemas de Card, 13 variantes de Button, 10 cores hardcoded. → unificar (doc 07).
- **Estados incompletos:** ~60% das telas sem os 4 estados (loading/vazio/erro/sucesso). → padrão de plataforma (doc 07 §5).
- **Motion pobre:** spinners genéricos, poucas micro-interações. → motion system (doc 07 §4).
- **Tipografia difusa + uppercase agressivo.** → hierarquia definida (doc 07 §2).

### Aplicado já nesta sessão ✅
- **Nova identidade de loading** (doc 11): `BrandLoader` leve + splash reescrito (sem hardcode, sem 30 partículas, respeita reduced-motion). É a primeira peça do motion system e o primeiro "estado" padronizado.

### Direção para login + públicas (doc 10)
- Split-screen premium no login, tokens (zero hardcode), trial 30d em destaque no hero/pricing.
- **Regra de ouro:** mexer só na camada visual do auth, nunca na lógica (passkey/OAuth/2FA). Verificação visual obrigatória antes de produção.

### Acessibilidade
- aria-label em DSIcon significativos, foco/teclado, leitor de tela nos fluxos principais (doc 07 §6).

**VERDICT (Design):** Plano de design aprovado. Sequência: núcleo do DS (tokens, 1 Card, 6 Buttons, 4 estados, motion) ANTES dos painéis. Loading screen já entregue como prova de qualidade. Login/públicas: implementar com verificação visual, não às cegas.

---

## 4. VERDICT CONSOLIDADO

✅ **Plano aprovado** em SELECTIVE EXPANSION, Abordagem A, com E1 (WhatsApp) e E2 (viral) adicionados; E3/E4 adiados.

**Ordem não-negociável:** S1 (trial+viral) → S2 (onboarding) → S3 (hardening, com transação de pagamento cedo) + núcleo S4 (DS) → S5-S7 (painéis sobre o DS unificado) → S8 (polish/QA) ; S-WA (WhatsApp) após S1.

**UNRESOLVED DECISIONS:** as 8 decisões do doc 08 §"Consolidação" têm recomendação, mas 2,3,4 (comportamento pós-trial e gating de IA) devem ser confirmadas no início do S1 antes de codar entitlements.
