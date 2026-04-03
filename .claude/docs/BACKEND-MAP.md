# Backend Map — VFIT

> Resumo dos endpoints e schemas. Para referência completa, ver `docs/BACKEND.md`.

---

## Arquitetura

```
workers/
├── index.ts          # Entry point Hono — registra todas as rotas
├── api/
│   ├── auth.ts       # Login, register, refresh, logout, password reset
│   ├── users.ts      # Profile, settings, avatar, subscription
│   ├── personals.ts  # Personal trainer management
│   ├── students.ts   # Student management, invites
│   ├── workouts.ts   # Workout CRUD, templates, sharing
│   ├── exercises.ts  # Exercise library (D1)
│   ├── assessments.ts # Body assessments, measurements
│   ├── payments.ts   # Asaas integration (~2200 linhas, 22 endpoints)
│   ├── chat.ts       # Real-time chat
│   ├── content.ts    # AI content generation
│   ├── notifications.ts # Push notification management
│   ├── admin.ts      # Admin panel endpoints
│   ├── public.ts     # Public pages, SEO
│   ├── media.ts      # R2 upload/download
│   ├── webhooks.ts   # Asaas/Stripe webhooks
│   └── ...           # 17 sub-routers total
├── middleware/
│   ├── auth.ts       # JWT validation, requireType
│   ├── cors.ts       # CORS headers
│   └── rate-limit.ts # Rate limiting via KV
└── schemas/          # Zod validation schemas
```

---

## Padrão de Response

```typescript
// Sucesso
success(data)                    // 200 { success: true, data }
created(data)                    // 201 { success: true, data }
noContent()                      // 204
paginated(data, total, page, limit) // 200 { success: true, data, pagination }

// Erro
throw new BadRequestError('msg')   // 400
throw new UnauthorizedError('msg') // 401
throw new ForbiddenError('msg')    // 403
throw new NotFoundError('msg')     // 404
throw new ConflictError('msg')     // 409
throw new RateLimitError('msg')    // 429
```

---

## DB Helpers

```typescript
import { pgQuery, pgQueryOne, pgQueryCount, generateId } from '@lib/db'

// Query múltiplas rows
const users = await pgQuery<User>(sql, 'SELECT * FROM users WHERE active = $1', [true])

// Query uma row (ou null)
const user = await pgQueryOne<User>(sql, 'SELECT * FROM users WHERE id = $1', [id])

// Count
const total = await pgQueryCount(sql, 'SELECT COUNT(*) FROM users WHERE active = $1', [true])

// Generate ID
const id = generateId() // nanoid
```

---

## Tabelas Principais (Neon PostgreSQL)

| Tabela | Descrição | Relações |
|--------|-----------|----------|
| `users` | Todos os usuários | PK compartilhado com `personals`/`students` |
| `personals` | Dados do personal trainer | `personals.id = users.id` |
| `students` | Dados do aluno | `students.id = users.id` |
| `workouts` | Treinos criados | `personal_id → personals.id` |
| `workout_exercises` | Exercícios do treino | `workout_id → workouts.id` |
| `assessments` | Avaliações físicas | `student_id, personal_id` |
| `payments` | Pagamentos Asaas | `personal_id, student_id` |
| `chat_messages` | Mensagens do chat | `sender_id, receiver_id` |
| `notifications` | Notificações push | `user_id → users.id` |
| `sessions` | Sessões de auth | KV (não tabela) |

> **⚠️ Colunas corretas** — ver regra §9 em `RULES.md`.

---

## Auth Flow

```
POST /api/v1/auth/register → create user + personal/student + session → tokens
POST /api/v1/auth/login    → verify password → create session → tokens
POST /api/v1/auth/refresh  → verify refresh token → new access token
POST /api/v1/auth/logout   → delete session from KV
```

- Access token: 1h TTL (HMAC-SHA256)
- Refresh token: 30d TTL
- Sessions: KV (`vfit-sessions`)
- Passwords: bcryptjs cost 12

---

## Referência Completa

→ `docs/BACKEND.md` — Todos os ~150 endpoints com métodos, params e responses
