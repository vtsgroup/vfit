# LOTE 04 — Auth System

> **Status:** ✅ Concluído  
> **Commit:** _ver git log_  
> **Data:** 2025-01-XX

---

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `workers/schemas/auth.ts` | Zod schemas para todos os endpoints de auth |
| `workers/api/auth.ts` | 11 rotas de autenticação (Hono) |
| `workers/api/oauth.ts` | OAuth Google + Facebook com state validation |
| `lib/turnstile.ts` | Validação Cloudflare Turnstile anti-bot |
| `lib/email.ts` | Email queue helpers (verify, reset, welcome, invite) |

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `workers/index.ts` | Montou `authRoutes` + `oauthRoutes` no router |

---

## Endpoints de Auth

### Rotas Públicas (sem auth)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/auth/register/personal` | Registro de personal trainer |
| `POST` | `/api/v1/auth/register/student` | Registro de aluno (via convite) |
| `POST` | `/api/v1/auth/login` | Login com email/senha |
| `POST` | `/api/v1/auth/refresh` | Renovar tokens (rotate refresh) |
| `POST` | `/api/v1/auth/forgot-password` | Solicitar reset de senha |
| `POST` | `/api/v1/auth/reset-password` | Redefinir senha com token |
| `POST` | `/api/v1/auth/verify-email` | Verificar email com token |

### Rotas Protegidas (requerem JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/auth/logout` | Logout (blacklist tokens + revoke session) |
| `POST` | `/api/v1/auth/change-password` | Alterar senha (autenticado) |
| `GET` | `/api/v1/auth/me` | Dados do user + perfil (personal/student) |

### OAuth

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/v1/auth/oauth/google` | Redirect → Google consent |
| `GET` | `/api/v1/auth/oauth/google/callback` | Callback Google → login/register |
| `GET` | `/api/v1/auth/oauth/facebook` | Redirect → Facebook Login |
| `GET` | `/api/v1/auth/oauth/facebook/callback` | Callback Facebook → login/register |

---

## Zod Schemas

- `registerPersonalSchema` — email, password(8+), full_name, cpf (formato 000.000.000-00), cref (formato 123456-G/SP), cref_state, specialties[], referral_code?, turnstile_token
- `registerStudentSchema` — email, password(8+), full_name, cpf, invitation_token, turnstile_token
- `loginSchema` — email, password, turnstile_token
- `refreshSchema` — refresh_token
- `forgotPasswordSchema` — email, turnstile_token
- `resetPasswordSchema` — token, password(8+)
- `verifyEmailSchema` — token
- `changePasswordSchema` — current_password, new_password(8+)
- `oauthInitiateSchema` — provider (google|facebook)

---

## Segurança

### Turnstile (Anti-bot)
- Todas rotas públicas exigem `turnstile_token`
- Validação server-side via `lib/turnstile.ts`
- Endpoint: `https://challenges.cloudflare.com/turnstile/v0/siteverify`

### JWT
- **Access token**: 1h TTL, HMAC-SHA256 via Web Crypto API
- **Refresh token**: 30d TTL, com rotation (token antigo blacklisted)
- Blacklist via KV_SESSIONS com TTL automático

### Sessions (KV)
- `session:{id}` → SessionData (userId, userType, email, ip, userAgent)
- TTL: 24h
- Revogável via logout

### OAuth
- **State parameter**: salvo no KV (5 min TTL), validado no callback
- Google: scope `openid email profile`, access_type `offline`
- Facebook: scope `email,public_profile`, API v19.0
- Novo user via OAuth → tipo `personal` com flag `needs_profile_completion`
- Em produção: redireciona para frontend com tokens na URL
- Em dev: retorna JSON

### Password
- bcryptjs (12 rounds) — pure JS, compatível com Workers
- Reset token: 64 chars hex, 1h TTL, armazenado em `users.metadata`
- Email verification token: 64 chars hex, armazenado em `users.metadata`

### Email Enumeration Protection
- `POST /forgot-password` sempre retorna sucesso (não revela se email existe)

---

## Fluxos

### Registro Personal
1. Valida Turnstile → check email/cpf duplicado
2. Cria user (Hyperdrive/PG) → crvfit (trial 14d)
3. Se referral_code → registra referral
4. Gera JWT tokens → cria sessão KV
5. Enfileira emails (verificação + welcome)
6. Retorna user + personal + tokens

### Registro Aluno
1. Valida Turnstile → valida invitation_token
2. Check email/cpf duplicado → cria user
3. Atualiza student record (pré-criado pelo personal)
4. Incrementa contador do personal
5. Gera tokens + sessão → retorna

### Login
1. Valida Turnstile → busca user por email
2. Verifica is_active → verifica password (bcrypt)
3. Atualiza last_login_at → gera tokens + sessão

### OAuth
1. Redireciona para provider (state salvo no KV)
2. Callback: valida state → troca code por token
3. Busca dados do user no provider
4. Login (user existe) ou Register (novo user)
5. Redireciona para frontend com tokens

---

## Dependências Pendentes

- **Neon/Hyperdrive**: Queries PostgreSQL via `pgQuery()` — retornam `[]` até Neon ser configurado
- **Email Queue Consumer**: Emails são enfileirados mas não processados (LOTE 06)
- **Turnstile Widget**: Frontend precisa do widget Turnstile (LOTE 10+)

---

## Verificação

```bash
# Type-check workers
npx tsc --project tsconfig.workers.json --noEmit  # ✅ 0 erros

# Build frontend
npm run build  # ✅ 0 erros, 0 warnings novos
```
