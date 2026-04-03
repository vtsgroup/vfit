# XP Economy — Governance Documentation

> **v1.0** · VFIT · Última atualização: 26/02/2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Eventos & Valores](#eventos--valores)
3. [Limites Diários](#limites-diários)
4. [Expiração & Burn](#expiração--burn)
5. [Deduplicação](#deduplicação)
6. [Metas Diárias](#metas-diárias)
7. [Streaks & Milestones](#streaks--milestones)
8. [Cache Strategy](#cache-strategy)
9. [API Endpoints](#api-endpoints)
10. [Schema de Banco](#schema-de-banco)
11. [Regras de Negócio](#regras-de-negócio)
12. [Audit Trail](#audit-trail)

---

## 1. Visão Geral

O sistema de XP é a moeda virtual gamificada do VFIT. Cada aluno acumula XP por ações positivas (treinar, manter streak, completar avaliações) e pode gastar/perder XP por inatividade (expiração) ou compras futuras na loja.

### Princípios

- **Zero-sum awareness**: todo XP creditado pode expirar ou ser gasto
- **Anti-abuse**: limites diários + deduplicação impedem farming
- **Transparência**: audit log completo para toda operação
- **Best-effort integration**: falhas em XP nunca bloqueiam a funcionalidade principal (treinos)

---

## 2. Eventos & Valores

Configurados na tabela `xp_event_config`:

| Evento | XP Base | Limite Diário | Expira em (dias) |
|--------|:-------:|:-------------:|:----------------:|
| `workout_completed` | 10 | 5 | 90 |
| `workout_session_completed` | 10 | 5 | 90 *(alias operacional do `workout_completed`)* |
| `streak_3_days` | 15 | — | 90 |
| `streak_7_days` | 30 | — | 90 |
| `streak_30_days` | 75 | — | 90 |
| `streak_100_days` | 200 | — | 90 |
| `badge_earned` | 25 | 3 | 90 |
| `goal_reached_weight` | 50 | 1 | 90 |
| `goal_reached_body_fat` | 50 | 1 | 90 |
| `assessment_completed` | 20 | 2 | 90 |
| `referral_signup` | 100 | 1 | — |
| `review_written` | 15 | 1 | 90 |
| `workout_first` | 50 | 1 | — |
| `workout_milestone_10` | 30 | 1 | — |
| `workout_milestone_50` | 75 | 1 | — |
| `workout_milestone_100` | 150 | 1 | — |
| `custom_admin_reward` | — | — | — |
| `store_purchase_refund` | — | — | — |
| `xp_expiration` | — | — | — |
| `xp_burn_conversion` | — | — | — |

> **Nota:** `—` = sem limite / sem expiração / valor variável

---

## 3. Limites Diários

- Tracking via tabela `xp_daily_limits`
- Reset automático a cada 24h UTC (campo `reset_at`)
- Se `daily_limit = NULL`, sem restrição para aquele evento
- Ao exceder o limite, retorna `RateLimitError` (HTTP 429)

### Fluxo

```
Evento → getEventConfig → checkDailyLimit → se permitido → prosseguir
                                            → se excedido → 429
```

---

## 4. Expiração & Burn

### Regras

- XP com `expires_at` definido expira automaticamente após 90 dias (default)
- Eventos de milestones (`referral_signup`, `workout_first`, etc.) **não expiram**
- Cron handler `0 3 * * *` (03:00 UTC diário) processa expiração via `expireXPDaily()`
  - ⚠️ Cron desabilitado no wrangler.toml (plano Free CF) — usar trigger manual `POST /xp/admin/expire`
- Expiração processa em batch de 100 transações por execução

### Fluxo de Expiração

```
Cron/Manual → busca tx com expires_at < NOW e status = 'settled'
            → marca status = 'expired'
            → debita do xp_balances
            → registra no xp_audit_log
            → invalida cache KV
```

### Banner de Expiração (Frontend)

- `ExpiringXPBanner` mostra XP prestes a expirar
- 3 níveis de urgência: ≤2 dias (vermelho pulsante), ≤5 dias (laranja), >5 dias (neutro)
- Limite de 20 transações por consulta

---

## 5. Deduplicação

- Tabela `xp_deduplication` armazena `(student_id, event_type, reference_id)`
- Janela de 5 segundos para detectar duplicatas
- Se duplicata detectada, retorna a transação original sem criar nova
- Eventos sem `reference_id` não passam por deduplicação
- Idempotency key format: `{studentId}:{eventType}:{referenceId}`

---

## 6. Metas Diárias

### Tabela: `user_daily_goals`

- Criada automaticamente ao primeiro acesso do dia (`getOrCreateDailyGoal`)
- **Meta padrão**: 50 XP + 1 treino concluído
- Completa quando: `earned_xp >= target_xp` **E** `workouts_done >= workouts_target`
- `completed_at` registrado na primeira vez que ambas condições são atendidas

### Integração com Treinos

- `POST /workouts/:id/complete` chama `updateDailyGoalProgress()` (best-effort)
- `POST /workouts/:id/session/complete` também chama `updateDailyGoalProgress()` (best-effort)
- XP do treino é somado ao `earned_xp` da meta
- `workouts_done` incrementado quando `isWorkout = true`

---

## 7. Streaks & Milestones

### Tabela: `xp_streaks` (1 registro por aluno)

| Campo | Descrição |
|-------|-----------|
| `current_streak` | Dias consecutivos ativos |
| `longest_streak` | Recorde pessoal |
| `last_activity_date` | Último dia com atividade |
| `streak_started_at` | Quando a streak atual começou |
| `freeze_count` | Freezes usados na streak atual |
| `max_freezes` | Máximo de freezes permitidos (default: 1) |

### Lógica de Continuação

```
Se last_activity_date == ontem → streak + 1
Se last_activity_date == NULL  → streak = 1 (primeira atividade)
Se gap == 2 dias E freeze disponível → streak + 1 (usa freeze)
Se gap > 2 dias OU sem freeze → streak = 1 (reset)
```

### Milestones

| Dias | Evento XP | XP Premiado |
|:----:|-----------|:-----------:|
| 3 | `streak_3_days` | 15 |
| 7 | `streak_7_days` | 30 |
| 30 | `streak_30_days` | 75 |
| 100 | `streak_100_days` | 200 |

- Milestones registrados em `xp_streak_milestones` (idempotente via UNIQUE constraint)
- XP de milestone creditado via `creditXP()` com idempotency key: `streak:{studentId}:{milestone}:{startedAt}`
- Se streak reiniciar e atingir milestone novamente, novo XP é creditado (nova `started_at`)

### Tiers de Display (Frontend)

| Streak | Tier | Cor | Ícone |
|:------:|------|-----|-------|
| < 3 | Iniciante | Gray | 🔥 |
| ≥ 3 | Aquecendo | Red | 🔥 |
| ≥ 7 | Em Chamas | Yellow | 🔥 |
| ≥ 30 | Imparável | Orange | 🔥 |
| ≥ 100 | Lendário | Purple | 🔥 |

---

## 8. Cache Strategy

### Backend (Cloudflare KV)

| Dado | Cache Key | TTL | Stale-While-Revalidate |
|------|-----------|:---:|:----------------------:|
| Balance | `xp:balance:{studentId}` | 5 min | 1 min |
| Streak | `xp:streak:{studentId}` | 10 min | 2 min |
| Daily Goal | `xp:goal:{studentId}` | 2 min | — |
| Milestones | `xp:milestones:{studentId}` | 1 hora | 30 min |

### Invalidação

Toda operação de escrita (`creditXP`, `debitXP`, `reverseTransaction`, `expireXPDaily`, `updateDailyGoalProgress`, `updateStreakAndCheckMilestones`) invalida o cache via `invalidateXPCache(env, studentId)` — deleta todas as 4 chaves de uma vez.

### Frontend (React Query)

| Hook | staleTime | gcTime | refetchInterval | refetchOnFocus |
|------|:---------:|:------:|:---------------:|:--------------:|
| `useXPBalance` | 60s | 10m | — | ✅ |
| `useXPHistory` | 2m | 10m | — | ❌ |
| `useDailyGoal` | 15s | 5m | 30s | ✅ |
| `useGoalHistory` | 2m | 10m | — | ❌ |
| `useStreak` | 60s | 10m | — | ✅ |
| `useExpiringXP` | 10m | 30m | — | ❌ |

---

## 9. API Endpoints

### Student (requer auth tipo `student`)

| Método | Rota | Descrição |
|:------:|------|-----------|
| GET | `/xp/balance` | Saldo XP atual |
| GET | `/xp/history` | Histórico de transações (`?limit=50&offset=0`) |
| GET | `/xp/limits` | Status de limites diários |
| GET | `/xp/goals/today` | Meta diária atual com progresso |
| GET | `/xp/goals/history` | Histórico de metas (`?days=7`, max 30) |
| GET | `/xp/streak` | Streak atual + milestones + próximo milestone |
| GET | `/xp/expiring` | XP prestes a expirar (`?days=7`, max 30) |

### Personal (requer auth tipo `personal`)

| Método | Rota | Descrição |
|:------:|------|-----------|
| GET | `/xp/student/:id/balance` | Saldo de aluno (com ownership check) |
| GET | `/xp/student/:id/streak` | Streak de aluno (com ownership check) |
| POST | `/xp/admin/reverse` | Reverter transação (body: `{transaction_id, reason}`) |
| POST | `/xp/admin/expire` | Trigger manual de expiração |

---

## 10. Schema de Banco

### Tabelas Principais

```sql
-- xp_event_config        → Configuração de eventos (19 tipos)
-- xp_transactions        → Todas transações XP (credit/debit)
-- xp_balances            → Saldo consolidado por aluno
-- xp_daily_limits        → Tracking de limites diários
-- xp_deduplication       → Anti-duplicação de eventos
-- xp_audit_log           → Log completo de auditoria
-- user_daily_goals       → Metas diárias por aluno
-- xp_streaks             → Streak tracking por aluno
-- xp_streak_milestones   → Milestones alcançados
```

### Tipos de Coluna

- **IDs**: `UUID` (todos — nunca VARCHAR)
- **Timestamps**: `TIMESTAMPTZ` com DEFAULT `NOW()`
- **Amounts**: `INTEGER` (XP é sempre inteiro)
- **Status**: `VARCHAR` com CHECK constraints

---

## 11. Regras de Negócio

### ✅ Invariantes

1. Todo XP creditado gera um registro em `xp_transactions` E `xp_audit_log`
2. `xp_balances.current_balance` = soma de todas transações `settled` (não expired/reversed)
3. Limites diários resetam a cada 24h UTC
4. Milestones de streak são idempotentes (UNIQUE constraint)
5. Daily goals são criados automaticamente no primeiro acesso do dia
6. XP de streak milestone usa o padrão `creditXP()` (passa por limites + deduplication)

### 🚫 Restrições

1. Aluno só vê seu próprio XP
2. Personal só vê XP de alunos vinculados (ownership check)
3. Transação reversed/expired não pode ser revertida novamente
4. XP negativo é possível (debit > balance)
5. Freeze é consumido apenas se gap é exatamente 2 dias (ontem não teve atividade, anteontem sim)

### 🔄 Best-effort Integrations

```typescript
// Nunca falhar o endpoint principal por causa de XP
await updateDailyGoalProgress(c.env, studentId, xpEarned, true).catch(() => {})
await updateStreakAndCheckMilestones(c.env, studentId).catch(() => {})
```

---

## 12. Audit Trail

### Tabela `xp_audit_log`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `student_id` | UUID | FK → students |
| `transaction_id` | UUID | FK → xp_transactions |
| `action` | VARCHAR | `created`, `expired`, `reversed` |
| `before_balance` | INTEGER | Saldo antes |
| `after_balance` | INTEGER | Saldo depois |
| `actor` | VARCHAR | `system`, `admin:{userId}` |
| `reason` | TEXT | Descrição legível |
| `created_at` | TIMESTAMPTZ | Quando ocorreu |

### Rastreabilidade

- Todo creditXP gera: 1 transaction + 1 audit + 1 dedup (se reference_id)
- Toda expiração gera: 1 status update + 1 audit
- Toda reversão gera: 1 status update + 1 audit

---

## 📊 Métricas de Referência

| Métrica | Valor |
|---------|-------|
| Tabelas XP | 9 |
| Event types | 19 |
| API endpoints | 11 |
| React hooks | 10 |
| Testes unitários | 32 |
| Cache layers | Backend KV + Frontend React Query |
| Migrations | `0010_xp_economy.sql` + `0016_daily_goals_streaks.sql` |

---

*Documento gerado em 26/02/2026 — Sprint S58*
