# CLAUDE.md — VFIT

> SaaS para Personal Trainers. Usuários: `personal` (treinador), `student` (aluno), `admin`.
> Planos: `trial` | `pro` | `max`. Versão atual: ver `package.json`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind v4 + Zustand v5 + TanStack Query |
| Backend | Cloudflare Workers + Hono (`workers/`) |
| Banco principal | Neon PostgreSQL via `lib/db.ts` |
| Banco exercícios | Cloudflare D1 (`personaliai-exercises` — legacy) |
| Cache/sessão | Cloudflare KV |
| Mídia | Cloudflare R2 |
| Pagamentos | Asaas (gateway brasileiro) |
| E-mail | Resend via `lib/email-resend.ts` |
| Notificações push | OneSignal via `lib/onesignal.ts` |

## Arquitetura de pastas

```
src/
├── app/dashboard/{rota}/   # Pages Next.js (RSC/client por página)
├── components/ui/          # Design System v2 (ÚNICA fonte de componentes base)
├── components/{domínio}/   # Componentes de feature
├── hooks/                  # Todos os data fetching (TanStack Query)
├── stores/                 # Estado global: auth-store.ts, app-store.ts
└── lib/                    # Utilities frontend

workers/
├── index.ts                # Hono app entry point
├── api/{rota}.ts           # Route handlers (um arquivo por domínio)
├── middleware/             # auth.ts, cors.ts, rate-limit.ts, etc.
└── schemas/                # Zod schemas de validação

lib/                        # Código compartilhado worker (db, email, cache, etc.)
scripts/                    # Scripts operacionais (deploy, migrações, auditoria)
```

Detalhes em `.claude/docs/architecture.md`.

## Convenções obrigatórias

- **TypeScript strict**. Nunca `any` sem comentário justificando.
- **Imports**: alias `@/` para `src/`. Nunca paths relativos com `../../../`.
- **Design System**: componentes base SEMPRE de `src/components/ui/`. Spec completo em `docs/design-system/vfit-design-system-v3-docs.md`.
- **Ícones**: SEMPRE `<DSIcon name="..." />` de `@/components/ui/ds-icon`. Nunca importar lucide/heroicons direto.
- **AuthGuard**: toda page de dashboard usa `<AuthGuard requiredType="personal|student">`.
- **Dados**: NUNCA fetch direto — sempre via hooks em `src/hooks/`. Hooks usam TanStack Query.
- **CSS**: CSS vars `--ds-*` e classes Tailwind semânticas (`brand-primary`, `text-primary`, `text-muted`). Não hardcode cores hex no JSX.
- **Comentários de seção**: `// ============================================` no topo de cada arquivo.

Mais detalhes em `.claude/docs/conventions.md`.

## Comandos essenciais

```bash
npm run dev               # Dev frontend (Next.js)
npm run wrangler:dev      # Dev worker local
npm run lint              # ESLint
npm run type-check        # TypeScript (frontend)
npm run type-check:workers # TypeScript (workers)
npm run test              # Vitest (unit)
npm run test:e2e          # Playwright (E2E)
npm run quality:ci        # Gate completo (docs + security + lint + type + test + build)
npm run cf:deploy         # Deploy OFICIAL (patch) — usa scripts/cf-deploy.js
npm run cf:deploy:minor   # Deploy minor
```

**NUNCA use `npm run wrangler:deploy` direto** — sempre `cf:deploy` (tem checks).

## Regras do agente

1. Leia o arquivo relevante ANTES de propor mudanças.
2. Se a task envolve workers, leia `.claude/docs/workers.md` primeiro.
3. Para mudanças no Design System, leia `.claude/docs/design-system.md` primeiro.
4. Planeje antes de modificar >3 arquivos simultâneos.
5. Ao terminar task significativa, atualize `.claude/session-state.md`.

## O que NUNCA fazer

- Não commitar direto na `main`. Sempre feature branch.
- Não usar `git push --force` sem confirmação explícita.
- Não rodar `npm run cf:deploy` (produção) sem o usuário confirmar.
- Não alterar scripts em `scripts/` sem instrução explícita.
- Não alterar `.github/workflows/` sem instrução explícita.
- Não rodar migrations sem planejar rollback.
- Não instalar dependências novas sem justificar o motivo.
- Não remover validações de auth/segurança existentes.
- Não ler/escrever `.env` ou `.env.local`.

## Prioridades

`segurança > correção > UX > performance > DX`

---

## 📱 WhatsApp Operacional — REGRA OBRIGATÓRIA

> **Documentação completa:** `docs/WHATSAPP-GATEWAY.md`
> **TODA ação operacional DEVE ter mensagem `start` e `end` no grupo WhatsApp.**
> Sem isso, a execução é considerada **não conforme**.

### O que é

Um Worker Cloudflare (`personaliai-whatsapp` — legacy) que envia mensagens formatadas via Unipile API para o grupo WhatsApp **"Logs e Docs: VFIT"**. Todas as mensagens vão SEMPRE para o grupo — nunca para pessoas individuais.

### Quando enviar (escopo obrigatório)

| Ação | Exige start/end? |
|------|:----------------:|
| Deploy (cf:deploy) | ✅ Sim (automático via cf-deploy.js) |
| Hotfix | ✅ Sim |
| Migração SQL | ✅ Sim |
| Rollback | ✅ Sim |
| Correção crítica em produção | ✅ Sim |
| Auditoria operacional | ✅ Sim |
| Sprint/feature longa (30+ min) | ✅ Sim |
| Edição simples de 1-2 arquivos | ❌ Não |
| Leitura/análise de código | ❌ Não |
| Testes locais | ❌ Não |

### Como enviar — Helper Script

**SEMPRE usar o helper** `scripts/whatsapp-task.mjs`. Ele:
- Carrega token de `.env.local` automaticamente
- Salva `started_at` em `.wrangler/whatsapp-task-state.json` (persistido entre start/end)
- Normaliza actor_label e title (evita duplicação de emojis)
- Calcula duração automaticamente

#### Variáveis necessárias (já em `.env.local`)

```
WHATSAPP_NOTIFY_URL=https://whatsapp.iapersonal.app.br/task-notify
WHATSAPP_NOTIFY_TOKEN=<ADMIN_AUTH_TOKEN>
```

#### Comando START (antes de iniciar a tarefa)

```bash
node scripts/whatsapp-task.mjs start \
  --task-id "<ID-UNICO>" \
  --title "<Descrição curta da tarefa>" \
  --priority "ALTA|MÉDIA|BAIXA" \
  --actor "Developer Agent" \
  --why "<motivo curto ligado ao objetivo>" \
  --expected "<ganho esperado>"
```

#### Comando END (após concluir a tarefa)

```bash
node scripts/whatsapp-task.mjs end \
  --task-id "<MESMO-ID-DO-START>" \
  --title "<Mesma descrição>" \
  --status "success|failed" \
  --actor "Developer Agent" \
  --deploy "vX.Y.Z" \
  --result "Resultado direto: <1 frase assertiva>" \
  --reason "Motivo: <1 frase, sem repetir resultado>" \
  --benefit "Vantagem prática: <benefício direto>"
```

#### Atalhos npm (carregam .env.local automaticamente)

```bash
npm run notify:start -- --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
npm run notify:end   -- --task-id ID --title "..." --status success --result "..." --reason "..." --benefit "..."
```

#### Preview (sem enviar — valida formatação)

```bash
node scripts/whatsapp-task.mjs preview start --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
node scripts/whatsapp-task.mjs preview end   --task-id ID --title "..." --status success --result "..." --reason "..." --benefit "..."
```

### Formato das mensagens

O Worker formata automaticamente. O agente NÃO precisa montar o texto — apenas passa os campos.

**Start:**
```
[🤖 Developer Agent]

⏱️ Iniciando etapa: <title>.

Por que agora: <why>.
Resultado esperado: <expected>.

ID: <task_id>
Início (BRT): DD/MM, HH:mm
```

**End:**
```
[🤖 Developer Agent]

✅ Finalizado: <title>.

Resultado direto: <result>.
Motivo: <reason>.
Vantagem prática: <benefit>.

ID: <task_id>
Início (BRT): DD/MM, HH:mm
Fim (BRT): DD/MM, HH:mm
Duração: Xm Ys
Versão: vX.Y.Z

Status: success

👍🏻 Se puder, dá um ok aqui na thread.
```

### Padrão do task_id

Formato: `<CONTEXTO>-<DATA>-<PERIODO>`

Exemplos:
- `DEPLOY-2026-03-17-AM`
- `HOTFIX-AUTH-2026-03-17-PM`
- `MIGRATION-USERS-2026-03-17-AM`
- `SPRINT-UI-FASE3-2026-03-17-PM`

### Tom de comunicação (OBRIGATÓRIO)

- **Menos técnico, mais executivo/objetivo**
- Explicar em linguagem simples: o que, por que, vantagem
- No fechamento: **frase direta de resultado, sem rodeios**
- **Sem repetição**: resultado/motivo/benefício devem ser complementares
- **NÃO** incluir 🤖 ou colchetes no `--actor` (o Worker adiciona automaticamente)

### Regras de validação

- `end` sem `started_at` = **inválido** (helper salva automaticamente)
- `end` sem `--status` = **erro** (deve ser `success` ou `failed`)
- Deploy sem WhatsApp = **falha** (cf-deploy.js exige, bypass só com `--allow-no-whatsapp`)
- `--actor` com `[🤖 ...]` = normalizado automaticamente (sem duplicação)

### Exemplo completo (deploy típico)

```bash
# 1. ANTES do deploy
node scripts/whatsapp-task.mjs start \
  --task-id "DEPLOY-2026-03-17-AM" \
  --title "Deploy v5.7.6 — CSS inline deferido + cache headers" \
  --priority "ALTA" \
  --why "otimização final de performance Lighthouse" \
  --expected "dependency tree limpa e cache eficiente em produção"

# 2. Executar o deploy
npm run cf:deploy

# 3. DEPOIS do deploy
node scripts/whatsapp-task.mjs end \
  --task-id "DEPLOY-2026-03-17-AM" \
  --title "Deploy v5.7.6 — CSS inline deferido + cache headers" \
  --status "success" \
  --deploy "v5.7.6" \
  --result "Resultado direto: CSS restore deferido via requestIdleCallback, cache favicons 30d." \
  --reason "Motivo: eliminar CSS da dependency tree do Lighthouse e resolver cache lifetimes." \
  --benefit "Vantagem prática: Lighthouse 100/100/100/100 sem warnings residuais."
```

### Endpoints da API (referência)

| Endpoint | Método | Auth | Descrição |
|----------|--------|------|-----------|
| `/health` | GET | ❌ | Health check |
| `/chats` | GET | ✅ | Listar chats |
| `/send` | POST | ✅ | Enviar mensagem direta (uso raro) |
| `/task-notify` | POST | ✅ | Notificação start/end formatada |
| `/format` | POST | ✅ | Preview da formatação (não envia) |

> **URL:** `https://whatsapp.iapersonal.app.br`
> **Auth:** `Authorization: Bearer <WHATSAPP_NOTIFY_TOKEN>`
> **Grupo alvo:** Automático (configurado no Worker via `UNIPILE_WHATSAPP_GROUP_CHAT_ID`)

### ⚠️ Ao documentar esta seção

Claude Code: ao ler este arquivo, **documente** em `.claude/session-state.md` que leu e entendeu o sistema WhatsApp.
Inclua: URL do gateway, como usar o helper, formato do task_id, e que TODA ação operacional exige start/end.
