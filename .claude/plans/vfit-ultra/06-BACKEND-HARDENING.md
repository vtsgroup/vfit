# 06 — Backend Hardening (Workers / Hono / PostgreSQL)

> 215+ endpoints, 39 módulos, 59 tabelas PG + 5 D1. Núcleo sólido. Este doc fecha os pontos de **correção, segurança, performance e consistência** levantados na auditoria.

> Todas as mudanças seguem RULES.md: §1 `sql.query`, §7 `net_amount=netValue`, §9 nomes de coluna, e nunca remover validações de auth (§"O que nunca fazer").

---

## 1. 🔴 Correção & Integridade

### 1.1 Wrapper transacional em pagamentos
- **Problema:** fluxo Asaas + DB sem ACID → pagamento confirmado no Asaas mas webhook/insert falha = estado inconsistente.
- **Ação:** envolver criação de pagamento/assinatura em transação PG; idempotência por `asaas_payment_id` (já existe parcialmente). Webhook **idempotente** e com **retry** (fila).
- **Aplicar em:** `payments.ts` (create/subscription), webhook handler, `vfit_subscriptions`.

### 1.2 Soft-delete de avaliações
- **Problema:** hard delete quebra a cadeia de evolução (assessment referencia o anterior).
- **Ação:** `deleted_at` em `assessments`; queries filtram `deleted_at IS NULL`. Admin "delete" vira soft.

### 1.3 Referências cross-DB (PG ↔ D1)
- **Problema:** `workout_exercises.exercise_id` aponta para D1 sem FK → órfãos se exercício D1 some.
- **Ação:** validar existência no fluxo de escrita; job de reconciliação que detecta/loga órfãos; nunca deletar exercício D1 em uso.

---

## 2. 🔴 Performance

| Problema | Onde | Ação |
|----------|------|------|
| Sem paginação | `/admin/users` e outros list admin | `limit/offset` + `{pagination}` em **todos** |
| N+1 no chat | `chat.ts` list mensagens | JOIN com sender ou denormalizar nome |
| PDF síncrono | `assessments` export | Mover para queue `pdf-generator` (já existe!) |
| TTL cache alto | exercícios 7d | Reduzir p/ 12h **ou** invalidação por tag ao editar |
| JSONB sem índice | `assessments.skinfolds`/composition | Índice GIN ou normalizar campos consultados |

---

## 3. 🔴 Validação (gaps concretos)

| Endpoint | Gap | Correção |
|----------|-----|----------|
| `POST /payments` | due_date no passado aceita | rejeitar `due_date < hoje` |
| `POST /assessments` | body_fat > 100% | clamp/validar 0-100 |
| `PATCH /:id/exercises` | reps > 1000 | limite sane (ex.: ≤ 1000) |
| `POST /students/invite` | email sem sanity | validar formato + typo guard |
| `POST /ai/workout/generate` | **prompt injection** | sanitizar input, system prompt blindado, nunca interpolar input cru |

---

## 4. 🟡 Consistência de API (cross-cutting)
- **Padronizar paginação:** escolher **um** padrão (`page`/`per_page`) e aplicar a todos.
- **Padronizar shape:** `{ success, data, pagination? , error? }` em 100% dos endpoints.
- **Padronizar erros:** mapear códigos HTTP + `error.code` consistente (`lib/errors.ts`, `lib/response.ts`).
- **Headers de rate limit:** `X-RateLimit-Remaining`, `Retry-After` onde houver limite.
- Documentar em `.claude/docs/BACKEND.md` (RULES §19/§20).

---

## 5. 🟡 Segurança
- **File upload:** validar **tamanho máximo** (ex.: 10MB R2) e content-type em todos os uploads (hoje faltam em vários).
- **Cleanup R2:** soft-delete no DB não remove do R2 → job de GC de mídia órfã.
- **Sessions KV race:** considerar lock/versão para requests concorrentes que mutam sessão.
- **Turnstile:** manter enforcement (RULES §4 — bypass removido); modo invisível no front (doc 02).

---

## 6. 🟡 Completar/limpar módulos
- **`b2c-exercise-media.ts`** — vazio → implementar ou remover do router.
- **`platform.ts`** — routing incompleto → finalizar ou remover.
- **`templates.ts`** — read-only → CRUD admin (necessário p/ plano instantâneo do doc 02 B.4).
- **`affiliates` commission cron** — placeholder → implementar cálculo/pagamento.
- **Queues `video-encoder` / `ai-batch`** — stubs → implementar ou remover bindings.

---

## 7. 🟢 Dívida & qualidade
- **XP: 7 tabelas** — consolidar `xp_transactions`+`xp_audit_log`(+`xp_event_config`) onde fizer sentido (sem perder auditoria).
- **Testes de cron** — `xp-expiration`, `calendar-reminders`, **novo cron de trial** (doc 02) sem testes → adicionar.
- **OpenAPI/Swagger** — gerar spec a partir dos tipos Hono (DX + contrato com front).
- **Versionamento** — documentar estratégia v1→v2.

---

## 8. Novos endpoints exigidos por este plano

| Necessidade | Endpoint sugerido | Doc origem |
|-------------|-------------------|-----------|
| Entitlements unificados | `GET /auth/me` (estender) | 02 |
| Trial status/cron | interno (cron) + `GET /subscription/status` | 02 |
| Custom workout (aluno) | `POST /custom-workouts` (conectar) | 03 |
| Meal plan → compartilhar com aluno | `POST /meal-plans/:id/share` | 04 |
| Trial/Conversão (admin) | `GET /admin/metrics/trial-funnel` | 05 |
| Audit trail viewer | `GET /admin/audit-logs` | 05 |
| Feature flags | `GET/PATCH /admin/feature-flags` | 05 |
| Templates CRUD | `POST/PATCH/DELETE /admin/templates` | 02/06 |

---

## 9. Critério de "perfeito" (backend)
- ✅ Paginação + shape + erros padronizados em 100% dos endpoints.
- ✅ Pagamentos transacionais e idempotentes; webhooks com retry.
- ✅ Validações fechadas (due_date, body_fat, reps, email, prompt injection).
- ✅ PDF/processos pesados em fila; TTLs/índices corrigidos; N+1 eliminado.
- ✅ Módulos vazios/incompletos resolvidos (implementar ou remover — nada órfão).
- ✅ `smoke:auth` verde (RULES §11) e crons com teste.
