# 08 — Roadmap de Execução (Sprints)

> 8 sprints. Cada um é **deployável e com valor isolado**. Sequência pensada para: (1) maior alavancagem de negócio primeiro, (2) fundação técnica antes de polir em cima, (3) risco controlado.

---

## Visão geral

```
S1 Trial & Paywall ─────────▶ S2 Onboarding instantâneo ──▶ S5 Painel Aluno ──┐
        │                                                                      │
        └──────────▶ S3 Backend Hardening ──▶ S4 Design System ──▶ S6 Personal ─┼─▶ S8 Polish + QA total
                                                                  S7 Admin ─────┘
```

**Dependências-chave:**
- S2 (plano instantâneo) depende de **Templates CRUD** (S3/doc 06) e do quiz enxuto.
- S5/S6/S7 (painéis) dependem de **entitlements** (S1) e **DS unificado** (S4) para não retrabalhar.
- S8 fecha os 4 estados e QA sobre tudo.

---

## S1 — Trial & Paywall (negócio)
**Objetivo:** 30 dias grátis sem cartão (personal + aluno), ponta-a-ponta.
**Entrega:** migration trial unificado · `lib/entitlements.ts` · signup 30d sem Asaas · `/auth/me` com entitlements (corrige bug `false`) · middleware gating · cron expiração + reminders · frontend (banner/widget/paywall reposicionado) · anti-abuso.
**Deploy:** sim. **Risco:** receita curto prazo — mitigar com métricas (S7 dá o painel).
**Pré-decisões:** DECISÃO 1, 2, 3.

## S2 — Onboarding & Login instantâneos
**Objetivo:** "aha" < 60s; 1º plano < 1s.
**Entrega:** quiz 16→12 · motor rule-based + templates · refino IA background · cadastro adiado (aluno) · cadastro mínimo (personal) · login passkey/OAuth primário + Turnstile invisível · instrumentação de funil.
**Deploy:** sim. **Depende:** Templates CRUD (puxar de S3 se preciso).

## S3 — Backend Hardening
**Objetivo:** correção, segurança, performance, consistência.
**Entrega:** wrapper transacional pagamentos + idempotência/retry · soft-delete avaliações · paginação universal · N+1 chat · PDF→queue · TTL/índices · validações (due_date/body_fat/reps/email/prompt-injection) · file size/cleanup R2 · módulos vazios resolvidos · Templates CRUD · novos endpoints (doc 06 §8).
**Deploy:** sim (incremental por endpoint). **Risco:** regressão — smoke:auth + unit.

## S4 — Design System Unificação
**Objetivo:** 1 Card, 6 Buttons, 0 hardcode, fundação de motion/estados.
**Entrega:** migrar Cards · consolidar Buttons (+atualizar RULES §14) · tokens (lint anti-hardcode) · `PageTransition`/`ErrorRecovery`/`FormProgressIndicator`/`LoadingOverlay` · ilustrações empty · hierarquia tipográfica + espaçamento mobile.
**Deploy:** sim (incremental). **Risco:** quebra visual — codemod + smoke visual por tela.

## S5 — Painel do Aluno (completar)
**Entrega:** corrigir `/treinos/novo` (custom workout) · IA subpáginas reais · assinatura/entitlements · Social (decisão) · desafios/gamificação · unificar rotas de exercício · 4 estados em todas as telas do aluno.
**Depende:** S1 (entitlements), S4 (DS). **Deploy:** sim.

## S6 — Painel do Personal (completar)
**Entrega:** wizard de criação de treino + auto-save · calendar agendamento real · nutricionista compartilha plano · afiliados completo · IA do personal · marketplace (decisão) · widget trial + read-only pós-trial · paginação consistente · 4 estados.
**Depende:** S1, S3, S4. **Deploy:** sim.

## S7 — Admin & Super-Admin (completar)
**Entrega:** paginação admin · config CRUD + audit · suspender/banir · **painel Trial/Conversão** · cohort/funnel · audit trail viewer · feature flags UI · risk assessment ligado · UIs para telas API-only · 4 estados.
**Depende:** S1 (dados de trial), S3. **Deploy:** sim.

## S8 — Ultramodernização & QA total
**Entrega:** micro-interações/motion em ações-chave · dark mode premium · acessibilidade (aria/teclado/leitor de tela) · varredura final dos 4 estados em 100% das telas · QA fim-a-fim de todos os fluxos · docs atualizados (DESIGN-SYSTEM, BACKEND, RULES, CHANGELOG) · `sync-ai-docs`.
**Deploy:** sim (release de "perfeição"). 

---

## Quality gates (todo sprint, antes de deploy)
1. `npm run quality:ci` verde.
2. `npm run smoke:auth:local` verde (RULES §11 — bloqueia deploy se falhar).
3. Grep anti-regressão (RULES §12/§13): `bg-gradient-to-`, `-[var(--`, `bg-[#` = zero.
4. TRACKING.md atualizado (RULES §20) + CHANGELOG.md + WhatsApp start/end (RULES §18).
5. Confirmação do usuário para `cf:deploy` (RULES §7, regra do agente §7).

---

## Consolidação das DECISÕES pendentes (para CEO/Eng review)

| # | Decisão | Recomendação | Doc |
|---|---------|--------------|-----|
| 1 | Trial 30d sem cartão p/ personal **e** aluno | **Sim, ambos** | 02 |
| 2 | Pós-trial personal: read-only vs bloqueio | **Read-only** | 02 |
| 3 | Pós-trial aluno: free com histórico | **Sim** | 02 |
| 4 | IA avançada: premium vs free | **Premium** (free no trial) | 03 |
| 5 | `/social`: v1 enxuto vs remover do nav | **v1 se houver fôlego, senão remover** | 03 |
| 6 | Marketplace: completar vs ocultar | **Ocultar até validar demanda** | 04 |
| 7 | Feature flags: tabela PG+KV vs serviço CF | **Tabela PG + cache KV** | 05 |
| 8 | WhatsApp: feature de produto vs operacional | **Operacional/externo** | 05 |

> Estas 8 decisões são o que o **/plan-ceo-review** e **/plan-eng-review** devem resolver antes do S1.

---

## Estimativa grosseira de esforço
- **S1, S2:** alavancagem máxima, ~2 sprints (núcleo de negócio).
- **S3, S4:** fundação, ~2 sprints (parcialmente paralelos).
- **S5, S6, S7:** completude dos painéis, ~3 sprints (podem paralelizar com cuidado).
- **S8:** polish + QA, ~1 sprint.
- Design system roadmap interno estima ~150-180h só para o DS (doc 07). Total do plano é maior; medir por sprint, não por hora absoluta.

> A ordem é mais importante que a estimativa: **S1→S2 entregam o maior valor já nas primeiras semanas** e são deployáveis sozinhos.
