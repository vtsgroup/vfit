# 05 — Admin & Super-Admin — Cobertura Total

> `dashboard/admin/*`. **Super-admin é um papel real e separado** (enforced no backend via `requireSuperAdmin`). Estado atual: **~70% completo** — forte em pagamentos/usuários/conteúdo, fraco em analytics/moderação/flags.

---

## 1. Matriz de papéis (confirmada no código)
- **`role: 'admin'`** — operação do dia a dia (ver, criar bônus, responder feedback, notas).
- **`role: 'super_admin'`** — tudo + destrutivo (deletar usuário/pagamento, config, transfers, exercícios/músculos, smoke tokens, ops de infra).
- Proteção: `AuthGuard requiredType="admin"` no front + `requireAdmin`/`requireSuperAdmin` no back. Admins protegidos (whitelist hardcoded) não podem ser deletados.

---

## 2. Inventário de telas × estado × ação

| Tela | Rota | Estado | Ação |
|------|------|--------|------|
| Dashboard admin | `/admin` | ✅ KPIs, receita, Asaas, notas de risco | Estados + cohort/funnel (ver §4) |
| Usuários | `/admin/users` | ✅ CRUD | **Adicionar paginação** (doc 06) + suspender/banir UI |
| Personals | `/admin/personals` | ✅ | Paginação consistente |
| Pagamentos | `/admin/payments` | ✅ (payments/withdrawals/affiliates tabs) | Estados; validações (doc 06) |
| Exercícios | `/admin/exercises` (super) | ✅ upload thumb | CRUD completo de exercício (hoje só mídia) |
| Grupos musculares | `/admin/muscle-groups` (super) | ✅ editor visual | Bulk ops |
| Treinos | `/admin/workouts` (super delete) | ⚠️ só list/view | Estados |
| Feedback | `/admin/feedback` | ✅ workflow 6 status | Estados; auto-resumo IA |
| Config | `/admin/config` (super) | 🟡 tabs sem CRUD claro | **Fechar CRUD** (planos B2B/B2C, fees, gamif, rate, cache) |
| Design system | `/admin/design-system` | ✅ showcase | Manter atualizado pós-DS unificado (doc 07) |
| Smoke | `/admin/smoke` (super) | ✅ tokens/notifs | Manter |

### Telas API-only (sem UI) — criar UI
- **Avaliações (admin)** — list/delete só via API → criar tela.
- **Alunos (roster global)** — list/delete só via API → criar tela.
- **Ops de infra** (`/admin/infra/readiness`, crons manuais, fix URLs) → painel "Operações".

---

## 3. Gaps a fechar (do levantamento)

### 🔴 Importantes
1. **Paginação** em todos os list endpoints admin (`users`, `personals`, `payments`, `assessments`, `students`, `feedback`) — hoje carregam tudo (O(n) memória) → quebra em escala.
2. **Config CRUD** — frontend mostra tabs mas o encadeamento de endpoints é incerto. Fechar: editar planos, fees, gamificação, rate limits, cache TTLs com **audit trail**.
3. **Suspender/banir usuário** — não há na UI (só hard delete). Adicionar suspensão reversível (alimenta `banned_identifiers`, já existe).

### 🟡 Novas ferramentas (para "perfeição" operacional)
4. **Painel de Trial/Conversão** — quantos em trialing, conversão trial→pago, churn pós-trial, dias médios até assinar. **Essencial** dado o novo modelo (doc 02).
5. **Analytics/cohort/funnel** — hoje só KPIs básicos. Adicionar funil de ativação (signup → 1º plano → 1º treino → assinatura) e cohorts.
6. **Audit trail viewer** — ações admin já são logadas em `app_logs`, mas sem UI. Criar visualizador (quem fez o quê, quando).
7. **Feature flags UI** — hoje flags hardcoded. Painel simples de toggles (liga/desliga recurso sem deploy) — habilita rollout seguro das mudanças deste plano.
8. **Risk assessment** — campos `risk_level`/`is_financial_risk` existem mas **não são consumidos**. Ligar a heurísticas (anti-abuso do trial, doc 02 A.6) e exibir alertas.

> **⚠️ DECISÃO 7:** Feature flags — usar a infra Cloudflare (ex.: KV/Flagship) ou tabela em config? Recomendação: **tabela `feature_flags` em PG + cache KV** (simples, auditável, já temos os dois).

---

## 4. WhatsApp Ops (mencionado em docs, ausente no código)
- Docs citam gateway WhatsApp e regra operacional (RULES §18), mas **não há rotas `/api/v1/whatsapp`**.
- ⚠️ DECISÃO 8: o WhatsApp é só processo operacional (humano) ou deve virar painel admin (envio/log de mensagens)? Recomendação: manter **operacional/externo** por ora; documentar claramente que não é feature de produto.

---

## 5. Os 4 estados + segurança
- Todas as telas admin com loading/vazio/erro/sucesso.
- Toda ação destrutiva com confirmação (padrão "digite DELETE" já existe — padronizar).
- Toda mudança sensível → `app_logs` (audit).

---

## 6. Critério de "perfeito" (admin)
- ✅ Paginação em 100% dos list endpoints admin.
- ✅ Config CRUD completo e auditado.
- ✅ Suspender/banir na UI; risk assessment ligado.
- ✅ **Painel de Trial/Conversão** operante (mede o sucesso do doc 02).
- ✅ Audit trail viewer + feature flags UI.
- ✅ Telas API-only ganham UI (avaliações, roster, ops infra).
