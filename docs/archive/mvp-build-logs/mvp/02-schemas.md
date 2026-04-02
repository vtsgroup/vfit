# LOTE 02 — Schemas de Banco de Dados

> **Status**: ✅ COMPLETO
> **Data**: $(date)
> **Commit**: (será atualizado após commit)

---

## O que foi feito

### 1. Infraestrutura Cloudflare (Produção)

Todos os recursos criados diretamente em produção via `wrangler`:

| Recurso | Nome | ID |
|---------|------|----|
| D1 Database | `vfiti-exercises` | `988c03d5-bf9a-4394-b65a-adebbe0b87e4` |
| KV Namespace | `KV_CACHE` | `e7147f8855184a4a8f72307756596df4` |
| KV Namespace | `KV_SESSIONS` | `91d34b6725564de39e8ed891e742e76d` |
| KV Namespace | `KV_RATE_LIMIT` | `d94c62b1e8f248a6bd1ea6a11e18f09c` |
| R2 Bucket | `personal-ia-videos` | (bucket_name, não precisa ID) |
| R2 Bucket | `personal-ia-images` | (bucket_name, não precisa ID) |

### 2. D1 Migration - Schema (Cold Data)

**Arquivo**: `migrations/d1/0001_initial_schema.sql`

Tabelas criadas no D1 (SQLite):
- `muscle_groups` — Grupos musculares
- `exercises` — Biblioteca de exercícios
- `workout_templates` — Templates de treino
- `series_types` — Tipos de séries
- `equipment_types` — Tipos de equipamento

### 3. D1 Seed Data

**Arquivo**: `migrations/d1/0002_seed_data.sql`

Dados populados em PRODUÇÃO:

| Tabela | Registros |
|--------|-----------|
| `muscle_groups` | 14 (peito, costas, ombros, bíceps, tríceps, antebraços, quadríceps, posteriores, glúteos, panturrilhas, abdominais, trapézio, core, corpo inteiro) |
| `exercises` | 79 exercícios (10 peito, 10 costas, 8 ombros, 8 bíceps, 8 tríceps, 8 quadríceps, 6 posteriores, 6 glúteos, 4 panturrilhas, 8 abdominais, 3 antebraços) |
| `workout_templates` | 6 (PPL, Upper/Lower, Circuito Emagrecimento, Funcional, Iniciantes, ABC) |
| `series_types` | 13 (bi-set, tri-set, drop-set, super-set, circuito, rest-pause, progressivo, giant-set, pirâmide, 21s, cluster, EMOM, AMRAP) |
| `equipment_types` | 16 (barra, halter, cabo, máquina, peso corporal, kettlebell, elástico, Smith, barra W, barra fixa, banco, TRX, medicine ball, caixa, rolo, sem equipamento) |

### 4. Hyperdrive Migration - Schema (Hot Data)

**Arquivo**: `migrations/hyperdrive/0001_initial_schema.sql`

17 tabelas PostgreSQL para dados transacionais (via Neon + Hyperdrive):

1. `users` — Usuários centrais (personal + student)
2. `personals` — Dados específicos de personals (CREF, plano, conta pagamento)
3. `students` — Alunos vinculados a personal (goals, streaks, gamificação)
4. `workouts` — Treinos atribuídos
5. `workout_exercises` — Exercícios dentro de treino (ref D1)
6. `workout_logs` — Treinos completados
7. `assessments` — Avaliações físicas com fotos e IA
8. `student_badges` — Badges de gamificação
9. `payments` — Pagamentos Asaas/Stripe com split
10. `affiliates` — Sistema de afiliados
11. `referrals` — Vínculos vitalícios de indicação
12. `affiliate_commissions` — Comissões por pagamento
13. `personal_reviews` — Avaliações 1-5 estrelas
14. `workout_plans` — Marketplace de planos
15. `plan_purchases` — Compras no marketplace
16. `notifications` — Push, email, WhatsApp
17. `personal_settings` — Configs do personal

**Inclui**:
- Extension `pgcrypto` para `gen_random_uuid()`
- Trigger `trigger_set_updated_at()` em 11 tabelas
- Indexes otimizados com filtros parciais (WHERE)
- Comments documentais em todas as tabelas

### 5. wrangler.toml Atualizado

Todos os IDs reais de produção configurados. Único pendente: `REPLACE_WITH_HYPERDRIVE_ID` (precisa de conexão Neon PostgreSQL).

---

## Pendências para próximos lotes

- **Hyperdrive**: Criar banco Neon PostgreSQL → obter connection string → `wrangler hyperdrive create` → aplicar migration
- **Queues**: Auto-criadas no primeiro deploy do Worker (4 queues configuradas no wrangler.toml)

---

## Estrutura de arquivos criados/modificados

```
migrations/
├── d1/
│   ├── 0001_initial_schema.sql    ✅ Aplicado em produção
│   └── 0002_seed_data.sql         ✅ Aplicado em produção (584 rows)
└── hyperdrive/
    └── 0001_initial_schema.sql    📋 Pronto (aguarda Neon PostgreSQL)

docs/
├── INFRAESTRUTURA-CF.md           ✅ Todos os IDs documentados
└── mvp/
    └── 02-schemas.md              ✅ Este arquivo

wrangler.toml                      ✅ IDs reais configurados
```
