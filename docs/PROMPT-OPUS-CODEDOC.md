# Prompt — Documentação Automática de Arquivos (Opus 4.6)

> **Uso**: Cole este prompt diretamente no GitHub Copilot (Chat) ou em uma sessão Claude Opus 4.6.
> **Objetivo**: Adicionar um bloco de comentário padronizado no topo de absolutamente todos os arquivos `.ts` e `.tsx` do projeto.
> **Regra principal**: NÃO alterar nenhuma lógica, imports, tipos ou estrutura — apenas inserir/atualizar o bloco de comentário de cabeçalho.

---

## Prompt para copiar e colar

```
Você é um engenheiro sênior documentando o projeto VFIT — um SaaS para Personal Trainers brasileiros.

Stack:
- Frontend: Next.js 15 App Router + Tailwind v4 + Zustand v5 + TanStack Query
- Backend: Cloudflare Workers + Hono + Neon PostgreSQL + D1 + KV + R2
- Linguagem: TypeScript strict em todos os arquivos

## Sua tarefa

Adicione (ou atualize se já existe) um bloco de comentário de cabeçalho no TOPO de cada arquivo .ts e .tsx que eu te mostrar.

## Formato do bloco (obrigatório — não desvie)

Para arquivos TypeScript puros (.ts):
```typescript
// ============================================
// [NOME DO ARQUIVO] — [Propósito em 1 linha]
// ============================================
//
// O que faz:
//   [Descrição de 2-4 linhas explicando o propósito, contexto e responsabilidade deste arquivo]
//
// Exports principais:
//   [listar as funções/classes/constantes/hooks/componentes exportados mais importantes]
//
// Dependências críticas:
//   [libs externas ou arquivos internos que este arquivo precisa para funcionar]
//
// [Seção condicional — inclua APENAS as que se aplicam:]
//
// Auth: [requisitos de autenticação — ex: "requireAuth em todas as rotas" ou "público"]
// DB: [tabelas PostgreSQL ou D1 que este arquivo lê/escreve]
// KV: [chaves KV usadas — ex: "sessions:userId, rate:cpf-lookup:ip"]
// Side effects: [efeitos colaterais — ex: "envia push OneSignal", "salva no R2", "dispara email"]
// Rate limit: [se tem rate limiting próprio — ex: "5 req/min por IP via KV_RATE_LIMIT"]
// Cron: [se é executado por cron — ex: "0 3 * * * — cache warm + XP expiration"]
// ============================================
```

Para componentes React (.tsx):
```typescript
// ============================================
// [NOME DO COMPONENTE] — [Propósito em 1 linha]
// ============================================
//
// O que faz:
//   [Descrição de 2-4 linhas]
//
// Props principais:
//   [listar as props mais importantes com tipo resumido]
//
// Hooks usados:
//   [ex: useStudents(), useAuthStore(), useRouter()]
//
// [Seção condicional — inclua APENAS as que se aplicam:]
//
// Auth: [ex: "Requer AuthGuard requiredType='personal'" ou "público"]
// DSIcon: [ícones usados — ex: "dumbbell, sparkles, arrowLeft"]
// Emits: [eventos/callbacks que este componente dispara para o pai]
// ============================================
```

## Regras INVIOLÁVEIS

1. NÃO altere nenhuma linha de código — apenas insira/substitua o bloco de comentário no topo
2. Se já existe um bloco `// ====` no topo, substitua-o pelo novo bloco atualizado
3. Se o arquivo começa com `'use client'` ou `'use server'`, insira o bloco ANTES dessas diretivas
4. Mantenha o bloco compacto — máximo 30 linhas incluindo o fechamento
5. Use português para as descrições
6. Seções condicionais: inclua SOMENTE as que têm conteúdo relevante — não adicione seções vazias
7. Para hooks (`use-*.ts`): a seção "Exports principais" deve listar cada hook com sua query key e o que retorna
8. Para schemas Zod (`schemas/*.ts`): liste os schemas exportados e o que cada um valida
9. Para middleware de workers: detalhe o que injeta no contexto Hono (ex: "injeta userId, userType, userRole em c.var")
10. Para stores Zustand: liste os estados e as actions principais

## Exemplos de referência

### Exemplo 1 — Worker route handler (workers/api/students.ts)
```typescript
// ============================================
// students.ts — Gestão de alunos do personal trainer
// ============================================
//
// O que faz:
//   CRUD completo de alunos vinculados ao personal autenticado.
//   Inclui convite por email, convite rápido (QR/ao vivo), exportação CSV
//   e atualização de dados base do usuário aluno (nome/telefone/foto).
//
// Exports principais:
//   studentsRoutes — Hono app montado em /api/v1/students
//
// Auth: requireAuth em todas as rotas. Personal vê/edita seus alunos.
//       Student vê/edita apenas /me. Validações de ownership em /:id.
// DB: students, users (JOIN para dados base do aluno)
// Side effects: envia email de convite via Resend, cria notificação in-app
// ============================================
```

### Exemplo 2 — React hook (src/hooks/use-students.ts)
```typescript
// ============================================
// use-students.ts — Hook TanStack Query para gestão de alunos
// ============================================
//
// O que faz:
//   Centraliza todo o data fetching e mutações relacionados a alunos.
//   Invalida automaticamente o cache após criar/editar/remover.
//
// Exports principais:
//   useStudents(filters?) → { data: Student[], isLoading, ... } — lista paginada
//   useStudent(id) → { data: Student, isLoading, ... } — detalhe
//   useCreateStudent() → mutation — cria aluno
//   useUpdateStudent() → mutation — atualiza aluno
//   useDeleteStudent() → mutation — remove aluno (soft delete)
//
// Hooks usados: useQuery, useMutation, useQueryClient
// Auth: requer personal autenticado (AuthGuard no componente pai)
// ============================================
```

### Exemplo 3 — Store Zustand (src/stores/auth-store.ts)
```typescript
// ============================================
// auth-store.ts — Estado global de autenticação
// ============================================
//
// O que faz:
//   Gerencia o estado do usuário logado (tokens JWT, perfil, tipo e plano).
//   Persiste no localStorage via zustand/middleware/persist.
//   É a fonte de verdade para saber se o usuário está autenticado.
//
// Exports principais:
//   useAuthStore — store principal (acesso via hook)
//   UserType: 'personal' | 'student' | 'admin'
//   PlanType: 'trial' | 'pro' | 'max'
//
// Estado: user, accessToken, refreshToken, isAuthenticated
// Actions: setAuth(), clearAuth(), updateUser(), refreshAccessToken()
// ============================================
```

### Exemplo 4 — Middleware Worker (workers/middleware/auth.ts)
```typescript
// ============================================
// auth.ts (middleware) — Verificação JWT + injeção de contexto do usuário
// ============================================
//
// O que faz:
//   Verifica o Bearer token JWT em todas as rotas protegidas.
//   Injeta userId, userType, userRole, userEmail no contexto Hono (c.var).
//   Exporta helpers para verificação de tipo de usuário.
//
// Exports principais:
//   authMiddleware — middleware Hono (verifica JWT, injeta user em c.var)
//   requireAuth — alias para authMiddleware
//   requireType(...types) — middleware factory que exige user_type específico
//
// KV: KV_SESSIONS (blacklist de tokens revogados)
// Auth: este arquivo É a autenticação — não usa requireAuth internamente
// ============================================
```

## Ordem de processamento sugerida

Se quiser processar em lotes, siga esta ordem de prioridade:

**Lote 1 (crítico — lidos a cada sessão):**
- workers/index.ts
- workers/types.ts
- workers/middleware/*.ts (5 arquivos)
- lib/db.ts, lib/auth-helpers.ts, lib/errors.ts, lib/response.ts, lib/cache.ts

**Lote 2 (workers API — 22 arquivos):**
- workers/api/*.ts (em ordem alfabética)

**Lote 3 (workers schemas):**
- workers/schemas/*.ts

**Lote 4 (lib compartilhada):**
- lib/*.ts restantes (asaas, onesignal, email-resend, ai-prompts, etc.)

**Lote 5 (frontend — hooks e stores):**
- src/hooks/use-*.ts
- src/stores/*.ts
- src/lib/*.ts

**Lote 6 (frontend — componentes):**
- src/components/ui/*.tsx (DS components)
- src/components/{domínio}/*.tsx

**Lote 7 (pages):**
- src/app/dashboard/**/*.tsx

## Contexto do projeto para referência rápida

**Convenções de autenticação:**
- Worker: `requireAuth` ou `requireType('personal')` antes do handler
- Frontend: `<AuthGuard requiredType="personal">` envolve toda a page

**Convenções de banco:**
- PostgreSQL: `pgQuery(env, sql, params)` ou `pgQueryOne(env, sql, params)` — nunca ORM
- D1: `d1Query(db, sql, params)` — apenas catálogo de exercícios (cold data)

**Convenções de ícones:**
- SEMPRE `<DSIcon name="..." />` — nunca importar lucide/heroicons diretamente

**IDs importantes:**
- Users: `users.id` (UUID) = `personals.id` = `students.id` (mesma PK, SEM coluna `user_id`)
- Todas as tabelas usam `generateId()` = `crypto.randomUUID()`
```

---

## Como usar no Copilot

1. Abra o GitHub Copilot Chat (ou Claude.ai com Opus 4.6)
2. Cole o prompt acima
3. Em seguida, cole o conteúdo do arquivo que quer documentar:
   ```
   Aqui está o arquivo workers/api/students.ts:

   [conteúdo do arquivo]

   Gere o bloco de cabeçalho para este arquivo.
   ```
4. O Opus vai retornar apenas o bloco de comentário — substitua o topo do arquivo

## Alternativa: processar múltiplos arquivos de uma vez

```
Aqui estão 3 arquivos para documentar. Para cada um, retorne apenas o bloco de cabeçalho:

--- ARQUIVO 1: workers/middleware/auth.ts ---
[conteúdo]

--- ARQUIVO 2: workers/middleware/cors.ts ---
[conteúdo]

--- ARQUIVO 3: workers/middleware/rate-limit.ts ---
[conteúdo]
```

## Dica para Claude Code (este agente)

Se quiser que eu (Claude Code) faça isso automaticamente arquivo por arquivo, diga:
> "Documente o arquivo X" ou "Adicione cabeçalho em workers/api/students.ts"

Eu vou ler o arquivo, gerar o bloco e editar sem alterar nenhuma linha de código.
