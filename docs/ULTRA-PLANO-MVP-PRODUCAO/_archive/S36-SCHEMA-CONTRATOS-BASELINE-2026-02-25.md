# S36 — Baseline de Schema e Contratos (Mídia + XP)

> Data: 25/02/2026  
> Sprint: S36 (ciclo S36+)  
> Status: baseline definido para implementação incremental

## 1) Escopo fechado da S36

- Definir estrutura de dados para:
  - mídia de exercício (vídeo + thumbnail + setup);
  - ledger de XP (auditável, idempotente);
  - progresso de metas diárias;
  - estado de sessão de treino (exercise/rest/next).
- Definir contratos de API para leitura/escrita desses recursos.
- Definir regras anti-fraude e limites mínimos de emissão de XP.

---

## 2) DDL proposto (PostgreSQL)

```sql
-- 2.1 Mídia por exercício
create table if not exists exercise_media (
  id text primary key,
  exercise_id text not null,
  video_url text not null,
  thumbnail_url text,
  setup_notes text,
  duration_seconds integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_exercise_media_exercise_id on exercise_media(exercise_id);
create index if not exists idx_exercise_media_active on exercise_media(is_active);

-- 2.2 Ledger de XP
create table if not exists xp_ledger (
  id text primary key,
  user_id text not null,
  event_type text not null,
  event_ref text not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount integer not null check (amount > 0),
  balance_after integer not null check (balance_after >= 0),
  metadata jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, event_ref)
);
create index if not exists idx_xp_ledger_user_created_at on xp_ledger(user_id, created_at desc);
create index if not exists idx_xp_ledger_event_type on xp_ledger(event_type);

-- 2.3 Metas diárias
create table if not exists daily_goal_progress (
  id text primary key,
  user_id text not null,
  date_key date not null,
  goal_type text not null,
  target integer not null check (target >= 1),
  current integer not null default 0 check (current >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date_key, goal_type)
);
create index if not exists idx_daily_goal_progress_user_date on daily_goal_progress(user_id, date_key desc);

-- 2.4 Estado da sessão de treino
create table if not exists workout_session_state (
  id text primary key,
  user_id text not null,
  workout_id text not null,
  current_exercise_index integer not null default 0,
  phase text not null check (phase in ('exercise', 'rest', 'next_preview', 'completed')),
  rest_remaining_seconds integer not null default 0,
  next_exercise_id text,
  updated_at timestamptz not null default now(),
  unique (user_id, workout_id)
);
create index if not exists idx_workout_session_user_workout on workout_session_state(user_id, workout_id);
```

---

## 3) Contratos de API (v1)

## 3.1 Mídia de exercício
- `GET /api/v1/exercises/:id/media`
- `PUT /api/v1/exercises/:id/media` (admin/personal)
- `POST /api/v1/exercises/:id/media/validate` (verifica vídeo obrigatório para publicação)

Payload base:
```json
{
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "setup_notes": "Ajustar banco na altura do joelho",
  "duration_seconds": 42,
  "is_active": true
}
```

## 3.2 Ledger XP
- `GET /api/v1/gamification/xp/balance`
- `GET /api/v1/gamification/xp/ledger?page=1&per_page=20`
- `POST /api/v1/gamification/xp/events` (idempotente por `event_ref`)

Payload de evento XP:
```json
{
  "event_type": "workout_completed",
  "event_ref": "workout:abc123:2026-02-25",
  "direction": "credit",
  "amount": 50,
  "metadata": {"source": "workout_runner"}
}
```

## 3.3 Metas diárias
- `GET /api/v1/gamification/goals/today`
- `PATCH /api/v1/gamification/goals/today/:goal_type`

## 3.4 Sessão de treino guiada
- `GET /api/v1/workouts/:id/session`
- `POST /api/v1/workouts/:id/session/advance`
- `POST /api/v1/workouts/:id/session/replay`

---

## 4) Regras de negócio obrigatórias

- Vídeo é obrigatório para exercício publicado.
- `event_ref` único por usuário no ledger para impedir duplicidade.
- Limite diário de crédito por evento sensível (ex.: no máximo 1 crédito de treino completo por treino/dia).
- Quando fase muda para `rest`, cronômetro deve iniciar automaticamente.
- `replay` nunca deve perder estado da sessão.

---

## 5) Critérios de aceite da S36

- Estrutura de schema aprovada e documentada.
- Contratos de API definidos e consistentes com o stack atual.
- Regras anti-fraude e idempotência registradas.
- Documento pronto para execução da S37.

---

## 6) Próximo passo direto (S37)

- Implementar CRUD real de mídia por exercício e validação de publicação sem vídeo.
- Iniciar pelo backend e fechar com consumo no frontend.
