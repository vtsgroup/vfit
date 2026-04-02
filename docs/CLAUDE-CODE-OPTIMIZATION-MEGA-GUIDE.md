# Claude Code Optimization Mega-Guide v2.0
## Guia Definitivo de Configuração, Economia de Tokens e Automação

> **Autor**: VTS Victorious Tech Solutions Ltda
> **Última atualização**: Março 2026
> **Compatibilidade**: Claude Code 1.x+
> **Licença**: Uso interno — adapte para cada projeto

---

## Índice

1. [Arquitetura de Configuração](#1-arquitetura-de-configuração)
2. [Settings: Global, Projeto e Local](#2-settings-global-projeto-e-local)
3. [CLAUDE.md Minimalista + Progressive Disclosure](#3-claudemd-minimalista--progressive-disclosure)
4. [.claudeignore — Controle de Escopo](#4-claudeignore--controle-de-escopo)
5. [Hooks Completos](#5-hooks-completos)
6. [Skills e Slash Commands](#6-skills-e-slash-commands)
7. [Subagentes e Task Tool](#7-subagentes-e-task-tool)
8. [Headless Mode e CI/CD](#8-headless-mode-e-cicd)
9. [Estratégia de Modelos (Opus/Sonnet/Haiku)](#9-estratégia-de-modelos)
10. [Thinking e Output Styles](#10-thinking-e-output-styles)
11. [Gestão de Contexto e Sessões](#11-gestão-de-contexto-e-sessões)
12. [Session Handoff e Memória Persistente](#12-session-handoff-e-memória-persistente)
13. [Índices Estruturados](#13-índices-estruturados)
14. [Scripts de Automação](#14-scripts-de-automação)
15. [Checklist Final de Deploy](#15-checklist-final-de-deploy)

---

## 1. Arquitetura de Configuração

Claude Code usa uma hierarquia de arquivos com precedência bem definida. Entender essa hierarquia é pré-requisito para tudo que vem depois.

### Estrutura de Diretórios Completa

```
your-project/
├── CLAUDE.md                          # Memory do projeto (system prompt)
├── .claudeignore                      # Arquivos/dirs invisíveis ao agente
├── .mcp.json                          # Servidores MCP (JIRA, GitHub, Slack, DB)
├── .claude/
│   ├── settings.json                  # Config compartilhada (versionada no git)
│   ├── settings.local.json            # Config local (gitignored)
│   ├── .gitignore                     # Ignora settings.local.json e session files
│   │
│   ├── commands/                      # Slash commands do projeto (legacy → skills)
│   │   ├── deploy.md
│   │   ├── review-pr.md
│   │   └── bump-version.md
│   │
│   ├── skills/                        # Skills auto-descobertas pelo agente
│   │   ├── commit/SKILL.md
│   │   ├── testing/SKILL.md
│   │   └── security-check/SKILL.md
│   │
│   ├── agents/                        # Subagentes especializados
│   │   ├── code-reviewer.md
│   │   ├── scout.md
│   │   └── meta-agent.md
│   │
│   └── docs/                          # Docs auxiliares (progressive disclosure)
│       ├── architecture.md
│       ├── coding-style.md
│       ├── testing.md
│       ├── security.md
│       ├── i18n.md
│       └── ai-agents.md
│
├── scripts/
│   └── claude/                        # Scripts de automação
│       ├── generate-index.sh
│       ├── track-usage.py
│       ├── bump-version.sh
│       ├── notify-whatsapp.sh
│       └── session-handoff.sh
│
└── src/                               # Código do projeto
```

### Precedência (mais forte → mais fraco)

```
1. Managed settings (enterprise)
2. Flags de CLI (--allowedTools, --max-turns, etc.)
3. .claude/settings.local.json  ← Seu override pessoal
4. .claude/settings.json        ← Regras de time
5. ~/.claude/settings.json      ← Global do usuário
```

**Regra de ouro**: `deny` SEMPRE vence `allow`, independente do nível.

---

## 2. Settings: Global, Projeto e Local

### 2.1 Global (`~/.claude/settings.json`)

Regras que valem para TODOS os projetos. Foco em segurança hard-stop.

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ./*)",
      "Bash(git push --force *)",
      "Bash(git push -f *)",
      "Bash(docker push *)",
      "Bash(kubectl delete *)",
      "Bash(*DROP TABLE*)",
      "Bash(*DROP DATABASE*)",
      "Bash(chmod 777 *)",
      "Bash(curl * | sh)",
      "Bash(curl * | bash)",
      "Bash(wget * | sh)",
      "Bash(*> /dev/sda*)",
      "Bash(mkfs.*)",
      "Bash(dd if=*)",
      "Bash(:(){ :|:& };:)",
      "Write(.env)",
      "Write(.env.*)",
      "Read(.env)",
      "Read(.env.*)"
    ]
  }
}
```

### 2.2 Projeto Compartilhado (`.claude/settings.json`)

Regras de time — versionadas no git. Todos do time herdam.

```json
{
  "permissions": {
    "allow": [
      "Read(**/*)",
      "Edit(/src/**)",
      "Edit(/tests/**)",
      "Bash(npm run test*)",
      "Bash(npm run lint*)",
      "Bash(npm run build*)",
      "Bash(npx prisma generate)",
      "Bash(npx prisma db push --accept-data-loss)",
      "Bash(docker compose up *)",
      "Bash(docker compose down *)"
    ],
    "deny": [
      "Bash(docker push *)",
      "Bash(npm publish *)",
      "Bash(npx prisma migrate deploy *)",
      "Edit(/scripts/deploy/**)",
      "Edit(/.github/workflows/**)",
      "Write(/prisma/migrations/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(git branch --show-current)\" != \"main\" ] || { echo '{\"block\": true, \"message\": \"Cannot edit on main branch. Create a feature branch first.\"}' >&2; exit 2; }",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write(*.ts)|Write(*.tsx)|Edit(*.ts)|Edit(*.tsx)",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### 2.3 Local (`.claude/settings.local.json`)

Seu override pessoal — gitignored. Permissões amplas + experimentação.

```json
{
  "permissions": {
    "allow": [
      "Read(**/*)",
      "Edit(**/*)",
      "Write(**/*)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(pnpm *)",
      "Bash(node *)",
      "Bash(tsx *)",
      "Bash(python *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout *)",
      "Bash(git branch *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git stash *)",
      "Bash(git merge *)",
      "Bash(cat *)",
      "Bash(grep *)",
      "Bash(find *)",
      "Bash(wc *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(echo *)",
      "Bash(curl -s *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git push -f *)"
    ]
  },
  "env": {
    "WHATSAPP_GROUP_WEBHOOK": "https://api.callmebot.com/whatsapp.php?phone=SEU_NUMERO&text=",
    "DEPLOY_ENV": "staging",
    "PROJECT_NAME": "vfit"
  }
}
```

### 2.4 `.claude/.gitignore`

```gitignore
settings.local.json
session-state.md
*.session
*.log
```

### Limpeza Periódica

Execute `/permissions` mensalmente para revisar regras acumuladas. Abra o arquivo `settings.local.json` e:
- Delete regras que referenciam projetos antigos
- Consolide regras específicas em patterns genéricos (`Bash(npm test)` → `Bash(npm *)`)
- Verifique se há regras conflitantes entre níveis

---

## 3. CLAUDE.md Minimalista + Progressive Disclosure

O `CLAUDE.md` é carregado em TODA interação. Cada linha custa tokens repetidamente. A regra é: se não é universalmente necessário para o projeto, não está no CLAUDE.md.

### Template Pronto para Uso

```markdown
# CLAUDE.md — [Nome do Projeto]

## Visão geral
[Tipo de app]. [Usuário alvo]. [Principal proposta de valor em 1 linha].

## Stack
- Frontend: [framework + versão]
- Backend: [framework + versão]
- DB: [engine + ORM]
- Infra: [cloud + deploy method]

## Arquitetura
- `src/app`: rotas e páginas
- `src/modules`: domínios (billing, auth, ai, etc.)
- `src/shared`: componentes e utilitários compartilhados
- `prisma/`: schema e migrations

Detalhes em `.claude/docs/architecture.md`.

## Convenções de código
- TypeScript strict. Nunca use `any` sem justificativa em comentário.
- React: function components + hooks. Nada de class components.
- Imports: absolutos com alias `@/` para `src/`.
- Naming: camelCase para variáveis/funções, PascalCase para componentes/types.

Mais detalhes em `.claude/docs/coding-style.md`.

## Fluxo de desenvolvimento
- Branch principal: `main`. Feature branches: `feat/<descricao-curta>`.
- Sempre criar/atualizar testes para novas features.
- Rodar `npm run lint && npm run test` antes de considerar uma task completa.

## Segurança
- NUNCA logar dados sensíveis (senhas, tokens, PII completa).
- Toda chamada externa passa por `src/shared/clients/*`.
- Variáveis de ambiente NUNCA hardcoded — sempre via `process.env`.

Regras detalhadas em `.claude/docs/security.md`.

## Testes
- Unitários: Vitest em `src/**/__tests__/**`.
- E2E: Playwright em `tests/e2e`.
- Antes de refatorar código com testes existentes, leia `.claude/docs/testing.md`.

## Regras do agente
- Planeje antes de alterar muitos arquivos.
- Prefira mudanças pequenas e iterativas com verificação.
- Se em dúvida sobre requisitos: PERGUNTE antes de codificar.
- Use `/compact` quando a sessão passar de 15 mensagens.

## O que NÃO fazer
- Não alterar scripts de deploy sem instrução explícita.
- Não remover validações de segurança existentes.
- Não executar migrations sem planejar rollback.
- Não commitar direto na main.
- Não instalar dependências novas sem justificar.

## Prioridades
segurança > correção > performance > DX > velocidade de entrega
```

### Docs Auxiliares (`.claude/docs/`)

Cada doc é carregado SOMENTE quando o agente precisa. Isso é o progressive disclosure.

**`.claude/docs/architecture.md`** — diagrama e responsabilidades por módulo:
```markdown
# Arquitetura Detalhada

## Diagrama de módulos
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Grupo de rotas autenticadas
│   ├── (public)/           # Grupo de rotas públicas
│   └── api/                # Route handlers
├── modules/
│   ├── auth/               # Login, registro, refresh token
│   │   ├── services/
│   │   ├── repositories/
│   │   └── __tests__/
│   ├── billing/            # Stripe checkout, webhooks, planos
│   ├── ai/                 # Integração com LLMs
│   └── [domínio]/
└── shared/
    ├── components/         # UI compartilhados
    ├── clients/            # HTTP clients (axios instances)
    ├── hooks/              # React hooks globais
    ├── utils/              # Helpers puros
    └── types/              # TypeScript types globais
```

## Padrões de comunicação
- Módulos NÃO importam entre si diretamente.
- Comunicação via shared/events ou chamadas de service.
- Cada módulo tem seu próprio barrel export (index.ts).
```

**`.claude/docs/testing.md`**:
```markdown
# Padrões de Teste

## Estrutura
- Cada módulo tem `__tests__/` co-localizado.
- Naming: `[nome].test.ts` para unit, `[nome].spec.ts` para integration.

## Convenções
- Use `describe` → `it` (não `test`).
- Mock dependencies com `vi.mock()`.
- Factories em `tests/factories/`.
- Fixtures em `tests/fixtures/`.

## Comandos
- `npm run test` — todos os testes
- `npm run test:watch` — watch mode
- `npm run test:coverage` — coverage report
- `npm run test -- --run src/modules/auth` — testes de um módulo
```

---

## 4. .claudeignore — Controle de Escopo

O `.claudeignore` impede que o agente indexe e leia arquivos irrelevantes. Sem ele, `node_modules`, `dist`, `.next`, logs e fixtures pesadas entram no contexto de busca.

### `.claudeignore` Completo

```gitignore
# === Dependências ===
node_modules/
.pnpm-store/
bower_components/
vendor/

# === Build outputs ===
dist/
build/
.next/
.nuxt/
.output/
out/
.vercel/
.netlify/

# === Cache e temp ===
.cache/
.turbo/
.parcel-cache/
*.tsbuildinfo
.eslintcache
.prettiercache

# === Logs ===
logs/
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# === IDE e SO ===
.idea/
.vscode/settings.json
.DS_Store
Thumbs.db
*.swp
*.swo

# === Environment (segurança) ===
.env
.env.*
!.env.example

# === Dados gerados ===
coverage/
__snapshots__/
*.min.js
*.min.css
*.map
*.chunk.*

# === Fixtures pesadas ===
tests/fixtures/large-*
tests/fixtures/*.sql
tests/fixtures/*.csv

# === Assets binários ===
public/images/
public/fonts/
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.ico
*.woff
*.woff2
*.ttf
*.eot
*.mp4
*.mp3

# === Prisma migrations (geradas) ===
prisma/migrations/*/migration.sql

# === Lock files (grandes, sem valor para o agente) ===
package-lock.json
pnpm-lock.yaml
yarn.lock

# === Docker volumes ===
.docker-data/
postgres-data/
```

---

## 5. Hooks Completos

Hooks são comandos determinísticos que executam em pontos específicos do ciclo de vida do Claude Code. Diferente do CLAUDE.md (advisory), hooks são GARANTIAS.

### 5.1 Referência de Eventos

| Evento | Quando dispara | Pode bloquear? | Uso principal |
|--------|---------------|-----------------|---------------|
| `SessionStart` | Início/resumo de sessão | Não | Carregar contexto, setup env |
| `SessionEnd` | Fim de sessão | Não | Cleanup, logs, métricas |
| `UserPromptSubmit` | Antes de processar prompt | Sim (exit 2) | Validar/enriquecer prompts |
| `PreToolUse` | Antes de executar tool | Sim (exit 2) | Validação, segurança |
| `PostToolUse` | Depois de executar tool | Não | Format, lint, logs |
| `PermissionRequest` | Quando pede permissão | Sim | Auto-approve safe commands |
| `Stop` | Quando agente termina | Sim (exit 2) | Validação final |
| `SubagentStop` | Quando subagente termina | Sim (exit 2) | QA de subagentes |
| `PreCompact` | Antes de compactação | Não | Backup de transcript |
| `Notification` | Quando envia notificação | Não | Alertas desktop/mobile |

### 5.2 Configuração Completa de Hooks

Coloque no `.claude/settings.json` (compartilhado) ou `settings.local.json` (pessoal):

```json
{
  "hooks": {

    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"additionalContext\": \"Git status: '\"$(git status --short | head -20 | tr '\\n' ' ')\"'\\nBranch: '\"$(git branch --show-current)\"'\\nLast commit: '\"$(git log --oneline -1)\"'\"}'"
          }
        ]
      }
    ],

    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/claude/enrich-prompt.sh",
            "timeout": 5
          }
        ]
      }
    ],

    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(git branch --show-current)\" != \"main\" ] || { echo '{\"block\": true, \"message\": \"Bloqueado: não edite na main. Crie uma feature branch.\"}' >&2; exit 2; }",
            "timeout": 5
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/claude/validate-bash.sh",
            "timeout": 5
          }
        ]
      },
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/claude/gate-large-files.sh",
            "timeout": 5
          }
        ]
      }
    ],

    "PostToolUse": [
      {
        "matcher": "Write(*.ts)|Write(*.tsx)|Edit(*.ts)|Edit(*.tsx)",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true",
            "timeout": 15
          }
        ]
      },
      {
        "matcher": "Write(*.py)|Edit(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "python -m black \"$CLAUDE_FILE_PATH\" 2>/dev/null || true",
            "timeout": 15
          }
        ]
      },
      {
        "matcher": "Write(*test*)|Write(*spec*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"feedback\": \"Teste criado/editado. Lembre de rodar npm run test para verificar.\"}'",
            "timeout": 3
          }
        ]
      }
    ],

    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/claude/on-stop.sh",
            "timeout": 10
          }
        ]
      }
    ],

    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cp -f /tmp/claude-transcript-$(date +%Y%m%d).jsonl $CLAUDE_PROJECT_DIR/.claude/backups/ 2>/dev/null || true",
            "timeout": 5
          }
        ]
      }
    ],

    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/claude/notify.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### 5.3 Scripts dos Hooks

**`scripts/claude/enrich-prompt.sh`** — Injeta contexto automaticamente no prompt:
```bash
#!/bin/bash
# Enriquece cada prompt com contexto relevante
# Lê o prompt via stdin (JSON com campo "prompt")

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Se mencionou "deploy" ou "release", injeta estado do deploy
if echo "$PROMPT" | grep -qiE 'deploy|release|production'; then
  CONTEXT="Deploy env: ${DEPLOY_ENV:-staging}. Branch: $(git branch --show-current). Last tag: $(git describe --tags --abbrev=0 2>/dev/null || echo 'none')."
  echo "{\"additionalContext\": \"$CONTEXT\"}"
  exit 0
fi

# Se mencionou "test" ou "spec", injeta status dos testes
if echo "$PROMPT" | grep -qiE 'test|spec|coverage'; then
  FAILING=$(npm run test -- --reporter=json 2>/dev/null | jq '.numFailedTests // 0' 2>/dev/null || echo "unknown")
  echo "{\"additionalContext\": \"Testes com falha: $FAILING\"}"
  exit 0
fi

exit 0
```

**`scripts/claude/validate-bash.sh`** — Bloqueia comandos perigosos:
```bash
#!/bin/bash
# Valida comandos bash antes de executar
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Lista de patterns perigosos
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ./"
  "rm -rf ~"
  "> /dev/sd"
  "mkfs."
  "dd if="
  "chmod 777"
  "curl.*|.*sh"
  "wget.*|.*sh"
  ":(){.*};"
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE"
  "git push.*--force"
  "git push.*-f "
  "npm publish"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "{\"block\": true, \"message\": \"BLOQUEADO: Comando potencialmente destrutivo detectado: $pattern\"}" >&2
    exit 2
  fi
done

exit 0
```

**`scripts/claude/gate-large-files.sh`** — Avisa sobre arquivos gigantes:
```bash
#!/bin/bash
# Avisa quando o agente tenta ler um arquivo muito grande
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
  LINES=$(wc -l < "$FILE_PATH" 2>/dev/null || echo 0)
  SIZE=$(wc -c < "$FILE_PATH" 2>/dev/null || echo 0)

  if [ "$LINES" -gt 1000 ] || [ "$SIZE" -gt 50000 ]; then
    echo "{\"feedback\": \"AVISO: Arquivo grande ($LINES linhas, ${SIZE}B). Considere ler apenas as linhas relevantes com view_range para economizar tokens.\"}"
  fi
fi

exit 0
```

**`scripts/claude/on-stop.sh`** — Executa ao final de cada resposta do agente:
```bash
#!/bin/bash
# Ações pós-resposta
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)
PROJECT=${PROJECT_NAME:-$(basename "$(pwd)")}

# Log da sessão
echo "$TIMESTAMP | $PROJECT | stop" >> ~/.claude/usage-log.csv

# Salvar session state
if [ -f ".claude/session-state.md" ]; then
  cp .claude/session-state.md ".claude/backups/session-state-$(date +%Y%m%d-%H%M%S).md" 2>/dev/null
fi
```

**`scripts/claude/notify.sh`** — Notificação desktop + WhatsApp:
```bash
#!/bin/bash
# Notificação multi-canal quando Claude precisa de input
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code precisa da sua atenção"')
TITLE="Claude Code"

# === Desktop notification (macOS) ===
if command -v osascript &>/dev/null; then
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"Ping\""
fi

# === Desktop notification (Linux) ===
if command -v notify-send &>/dev/null; then
  notify-send "$TITLE" "$MESSAGE" --urgency=normal
fi

# === WhatsApp via CallMeBot (env.local) ===
WEBHOOK="${WHATSAPP_GROUP_WEBHOOK}"
if [ -n "$WEBHOOK" ]; then
  ENCODED_MSG=$(python3 -c "import urllib.parse; print(urllib.parse.quote('🤖 $TITLE: $MESSAGE'))")
  curl -s "${WEBHOOK}${ENCODED_MSG}" >/dev/null 2>&1 &
fi

# === Telegram (opcional) ===
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
  curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=🤖 $TITLE: $MESSAGE" \
    -d "parse_mode=HTML" >/dev/null 2>&1 &
fi

exit 0
```

Torne todos executáveis:
```bash
chmod +x scripts/claude/*.sh
```

---

## 6. Skills e Slash Commands

Skills são o sistema moderno de extensão. Um arquivo `SKILL.md` com frontmatter YAML cria um `/slash-command` automático.

### 6.1 Skill: Commit Inteligente

**`.claude/skills/commit/SKILL.md`**:
```markdown
---
name: commit
description: Gera commit message convencional, faz git add e commit. Use quando terminar uma task.
allowed-tools: Bash, Read, Grep
---

# Commit Skill

1. Analise o diff atual com `git diff --cached --stat` e `git diff --cached`.
2. Se nada staged, faça `git add -A` primeiro.
3. Analise os commits recentes com `git log --oneline -5` para manter o estilo.
4. Gere uma commit message seguindo Conventional Commits:
   - `feat:` nova feature
   - `fix:` correção de bug
   - `refactor:` refatoração sem mudança de comportamento
   - `test:` adição/correção de testes
   - `docs:` documentação
   - `chore:` manutenção
5. O corpo do commit deve ter no máximo 3 linhas explicando O QUE mudou e POR QUE.
6. Execute `git commit -m "<message>"`.
7. Mostre o resultado para o usuário.

NUNCA faça `git push` — isso é responsabilidade do desenvolvedor.
```

### 6.2 Skill: Review PR

**`.claude/skills/review-pr/SKILL.md`**:
```markdown
---
name: review-pr
description: Faz code review do PR atual ou de um branch específico. Use para revisar antes de merge.
allowed-tools: Bash, Read, Grep, Glob
model: claude-opus-4-6
---

# Review PR Skill

Argumento: $ARGUMENTS (nome do branch, ou vazio para branch atual)

## Processo

1. Determine o branch alvo:
   - Se $ARGUMENTS fornecido: use como branch
   - Senão: use branch atual vs main

2. Obtenha o diff: `git diff main..HEAD` ou `git diff main..$ARGUMENTS`

3. Analise em QUATRO dimensões:
   - **Bugs**: lógica incorreta, edge cases, null safety, race conditions
   - **Segurança**: injection, auth bypass, dados sensíveis expostos, CORS
   - **Performance**: N+1 queries, loops desnecessários, memory leaks
   - **Manutenibilidade**: naming, complexidade ciclomática, DRY

4. Para cada issue encontrada, reporte:
   - Arquivo e linha aproximada
   - Severidade: 🔴 Critical | 🟡 Warning | 🔵 Info
   - Descrição concisa do problema
   - Sugestão de correção

5. NÃO comente sobre estilo (formatting é automático via hooks).
6. NÃO comente sobre coisas triviais (variable naming óbvio, imports).

Foque APENAS em bugs reais e riscos de segurança.
```

### 6.3 Skill: Bump Version

**`.claude/skills/bump-version/SKILL.md`**:
```markdown
---
name: bump-version
description: Incrementa versão do projeto seguindo semver. Uso: /bump-version [major|minor|patch]
allowed-tools: Bash, Read, Edit, Write
---

# Bump Version Skill

Argumento: $ARGUMENTS (major, minor, ou patch. Default: patch)

## Processo

1. Leia a versão atual do `package.json`.
2. Calcule a nova versão conforme semver:
   - `patch`: 1.2.3 → 1.2.4
   - `minor`: 1.2.3 → 1.3.0
   - `major`: 1.2.3 → 2.0.0
3. Atualize `package.json` com a nova versão.
4. Se existir `CHANGELOG.md`, adicione uma seção para a nova versão com a data atual.
5. Execute `git add package.json CHANGELOG.md && git commit -m "chore: bump version to vX.Y.Z"`.
6. Crie uma git tag: `git tag vX.Y.Z`.
7. Reporte: "Versão atualizada de vA.B.C para vX.Y.Z. Tag criada. Execute `git push && git push --tags` quando pronto."
```

### 6.4 Skill: Deploy

**`.claude/skills/deploy/SKILL.md`**:
```markdown
---
name: deploy
description: Executa pipeline de deploy para o ambiente especificado. Uso: /deploy [staging|production]
allowed-tools: Bash, Read
disable-model-invocation: true
---

# Deploy Skill

Argumento: $ARGUMENTS (staging ou production. Default: staging)

## Checklist pré-deploy

1. Verifique que estamos na branch correta:
   - staging: qualquer branch
   - production: APENAS `main`
2. Execute `npm run build` — se falhar, PARE e reporte.
3. Execute `npm run test` — se falhar, PARE e reporte.
4. Execute `npm run lint` — se falhar, PARE e reporte.

## Deploy

5. Para staging:
   ```bash
   npx vercel --env staging
   ```
6. Para production:
   ```bash
   npx vercel --prod
   ```

7. Após deploy, execute o script de notificação:
   ```bash
   $CLAUDE_PROJECT_DIR/scripts/claude/notify-deploy.sh $ARGUMENTS
   ```

## NUNCA
- Deploy em production de branch que não seja main.
- Deploy sem testes passando.
- Deploy sem build passando.
```

### 6.5 Skill: Notify WhatsApp Group

**`.claude/skills/notify-team/SKILL.md`**:
```markdown
---
name: notify-team
description: Envia notificação para o grupo de WhatsApp do time. Uso: /notify-team <mensagem>
allowed-tools: Bash
---

# Notify Team Skill

Argumento: $ARGUMENTS (mensagem a enviar)

Execute o script de notificação:
```bash
$CLAUDE_PROJECT_DIR/scripts/claude/notify-whatsapp.sh "$ARGUMENTS"
```

Confirme ao usuário que a notificação foi enviada.
```

**`scripts/claude/notify-whatsapp.sh`**:
```bash
#!/bin/bash
# Envia mensagem para grupo WhatsApp via CallMeBot
# Configurar WHATSAPP_GROUP_WEBHOOK em .claude/settings.local.json > env

MESSAGE="$1"
PROJECT=${PROJECT_NAME:-$(basename "$(pwd)")}
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
TIMESTAMP=$(date +"%d/%m %H:%M")

FULL_MSG="🤖 *$PROJECT* ($BRANCH)
📅 $TIMESTAMP
$MESSAGE"

WEBHOOK="${WHATSAPP_GROUP_WEBHOOK}"

if [ -z "$WEBHOOK" ]; then
  echo "❌ WHATSAPP_GROUP_WEBHOOK não configurado em settings.local.json"
  exit 1
fi

ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$FULL_MSG'''))")
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${WEBHOOK}${ENCODED}")

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Notificação enviada ao grupo WhatsApp"
else
  echo "⚠️ Falha ao enviar (HTTP $RESPONSE). Verifique o webhook."
fi
```

**`scripts/claude/notify-deploy.sh`**:
```bash
#!/bin/bash
# Notifica deploy concluído
ENV="${1:-staging}"
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
BRANCH=$(git branch --show-current)
COMMIT=$(git log --oneline -1)

MESSAGE="🚀 *Deploy $ENV concluído!*
📦 v$VERSION
🌿 $BRANCH
💬 $COMMIT"

# WhatsApp
$CLAUDE_PROJECT_DIR/scripts/claude/notify-whatsapp.sh "$MESSAGE"

# Desktop
if command -v osascript &>/dev/null; then
  osascript -e "display notification \"Deploy $ENV v$VERSION concluído\" with title \"🚀 Deploy\" sound name \"Glass\""
fi
```

---

## 7. Subagentes e Task Tool

Subagentes rodam com contexto SEPARADO da sessão principal. Isso é um multiplicador de economia — cada subagente não herda o histórico completo.

### 7.1 Subagente: Scout (Exploração)

**`.claude/agents/scout.md`**:
```markdown
---
name: scout
description: Explora o codebase para encontrar informações sem modificar nada. Use para investigar antes de implementar.
allowed-tools: Read, Grep, Glob, Bash(find *), Bash(wc *), Bash(head *), Bash(tail *)
model: claude-haiku-4-5-20251001
---

Você é um agente de exploração. Seu papel é:

1. Encontrar arquivos e funções relevantes para a tarefa solicitada.
2. Mapear dependências e relações entre módulos.
3. Reportar o que encontrou de forma CONCISA (máximo 20 linhas de resumo).

REGRAS:
- NUNCA modifique arquivos.
- NUNCA execute comandos que alterem estado.
- Sempre reporte: arquivo, linha, e propósito do que encontrou.
- Se não encontrar o que procura, diga claramente em vez de adivinhar.
```

### 7.2 Subagente: Code Reviewer

**`.claude/agents/code-reviewer.md`**:
```markdown
---
name: code-reviewer
description: Revisa código recém-alterado buscando bugs, security issues e problemas de performance.
allowed-tools: Read, Grep, Glob, Bash(git diff *), Bash(git log *)
model: claude-sonnet-4-6
---

Você é um code reviewer senior. Analise o código fornecido e reporte:

1. 🔴 **Bugs**: Lógica incorreta, null safety, edge cases não tratados.
2. 🔴 **Segurança**: SQL injection, XSS, auth bypass, dados sensíveis.
3. 🟡 **Performance**: N+1 queries, loops ineficientes, memory leaks.
4. 🔵 **Sugestões**: Patterns melhores, simplificações.

FORMAT:
- Arquivo: linha
- Severidade + descrição
- Sugestão de fix

NÃO comente sobre formatting, naming trivial, ou estilo pessoal.
Foque em coisas que QUEBRARIAM em produção.
```

### Pattern: Scout → Plan → Execute

Use este workflow para tarefas complexas:

```
1. Peça ao scout para explorar o codebase (Haiku — barato e rápido)
2. Com o output do scout, planeje a implementação (Opus — raciocínio profundo)
3. Execute o plano em batches pequenos (Sonnet — equilíbrio custo/qualidade)
4. Rode o code-reviewer no resultado (Sonnet)
```

Isso evita que o modelo principal gaste tokens lendo dezenas de arquivos que o scout pode filtrar.

---

## 8. Headless Mode e CI/CD

O modo headless (`claude -p`) transforma Claude Code em ferramenta CLI para automação.

### 8.1 Code Review Automatizado no GitHub Actions

**`.github/workflows/claude-review.yml`**:
```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(git diff origin/main...HEAD)
          REVIEW=$(claude -p "Review this diff for bugs and security issues only. Be concise. No style comments.\n\n$DIFF" \
            --allowedTools "Read,Grep,Glob" \
            --max-turns 5 \
            --output-format json)

          RESULT=$(echo "$REVIEW" | jq -r '.result')
          COST=$(echo "$REVIEW" | jq -r '.cost_usd')

          echo "## 🤖 Claude Code Review" > review.md
          echo "" >> review.md
          echo "$RESULT" >> review.md
          echo "" >> review.md
          echo "_Cost: \$$COST_" >> review.md

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const body = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
```

### 8.2 Geração de Testes Automatizada

```bash
#!/bin/bash
# scripts/claude/generate-tests.sh
# Gera testes para arquivos sem cobertura

UNCOVERED=$(npx vitest --coverage --reporter=json 2>/dev/null \
  | jq -r '.testResults[] | select(.coverage < 80) | .file')

for FILE in $UNCOVERED; do
  echo "📝 Gerando testes para $FILE..."
  claude -p "Generate comprehensive unit tests for $FILE using Vitest. Include edge cases." \
    --allowedTools "Read,Write,Grep,Glob" \
    --max-turns 5 \
    --output-format text > /dev/null
done

echo "✅ Testes gerados. Rode npm run test para verificar."
```

### 8.3 Documentação Automatizada

```bash
#!/bin/bash
# scripts/claude/generate-docs.sh
# Gera/atualiza documentação de API

claude -p "Analyze all route handlers in src/app/api/ and generate comprehensive API documentation in docs/API.md. Include: endpoint, method, request body, response, auth requirements, error codes." \
  --allowedTools "Read,Write,Grep,Glob" \
  --max-turns 10 \
  --output-format text

echo "📄 Documentação atualizada em docs/API.md"
```

---

## 9. Estratégia de Modelos

### Quando usar cada modelo

| Tarefa | Modelo | Justificativa |
|--------|--------|---------------|
| Planejamento de arquitetura | Opus 4.6 | Raciocínio profundo necessário |
| Review de PR complexo | Opus 4.6 | Decisões de design |
| Implementação com plano claro | Sonnet 4.6 | Equilíbrio custo/qualidade |
| Refatoração guiada | Sonnet 4.6 | Segue instruções bem |
| Escrita de testes | Sonnet 4.6 | Padrão claro, execução boa |
| Busca/grep no codebase | Haiku 4.5 | Rápido e barato |
| Análise de logs | Haiku 4.5 | Tarefa mecânica |
| Leitura massiva de arquivos | Haiku 4.5 | Não precisa de raciocínio |
| Commit messages | Haiku 4.5 | Tarefa simples |

### Config no settings

```json
{
  "model": "claude-sonnet-4-6"
}
```

Use `/model` para trocar durante a sessão, ou especifique `model:` no frontmatter de skills/agents.

---

## 10. Thinking e Output Styles

### Extended Thinking

Por padrão, **mantenha desligado**. Ative apenas para:
- Debug de bugs complexos que envolvem múltiplos sistemas
- Decisões de arquitetura com trade-offs não óbvios
- Problemas de concorrência / race conditions

Palavras-chave que ativam: "think harder", "think step by step", "ultrathink".

### Output Styles

Use `default/concise` para trabalho diário. Crie custom styles com `/output-style:new`.

Exemplo de custom style minimalista salvo em `.claude/output-styles/concise-pt.md`:
```markdown
# Estilo VTS Conciso

- Respostas diretas, sem preâmbulos.
- Código sem explicação — só comente se algo não for óbvio.
- Quando perguntar algo, faça uma pergunta por vez.
- Logs de progresso: "✅ feito X", "⏳ fazendo Y", "❌ falhou Z".
- Idioma: português para comunicação, inglês para código/commits.
```

---

## 11. Gestão de Contexto e Sessões

### Regra de ouro: contexto é moeda

Cada mensagem re-envia TODO o histórico. 30 mensagens = custo exponencial.

### Práticas obrigatórias

1. **`/clear` entre tasks não relacionadas** — não carregue contexto de debugging de auth numa task de billing.
2. **`/compact` quando ultrapassar ~15 mensagens** — com instrução do que preservar: `/compact Focus on the current implementation plan and test results`.
3. **`/rename` antes de `/clear`** — para poder `/resume` depois se precisar.
4. **Sessões curtas e focadas** — uma task por sessão é o ideal.
5. **Não faça brainstorming e coding na mesma sessão** — use uma sessão para discutir, salve o plano em arquivo, abra outra sessão para implementar.

---

## 12. Session Handoff e Memória Persistente

### Pattern: Session State File

Ao final de cada sessão significativa, salve o estado em um arquivo que a próxima sessão pode ler.

**`.claude/session-state.md`** (template):
```markdown
# Session State — [Projeto]
> Última atualização: [data/hora]

## Task atual
[Descrição da task em andamento]

## O que foi feito
- [Item 1]
- [Item 2]

## O que falta
- [ ] [Próximo passo 1]
- [ ] [Próximo passo 2]

## Decisões tomadas
- [Decisão 1: razão]
- [Decisão 2: razão]

## Arquivos modificados
- `src/modules/auth/services/loginUser.ts` — refatorado para usar novo schema
- `tests/auth/login.test.ts` — adicionado teste de edge case

## Contexto importante
[Qualquer coisa que a próxima sessão precisa saber]
```

No CLAUDE.md, adicione:
```markdown
## Continuidade entre sessões
Ao começar uma sessão, se existir `.claude/session-state.md`, leia-o primeiro para retomar contexto.
Ao final de uma sessão significativa, atualize `.claude/session-state.md` com o estado atual.
```

### Automação via Hook

O hook de `Stop` pode lembrar o agente de atualizar o session state:
```json
{
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "echo '{\"feedback\": \"Lembre de atualizar .claude/session-state.md com o estado atual antes de encerrar.\"}'"
        }
      ]
    }
  ]
}
```

---

## 13. Índices Estruturados

### `function_index.md`

Mapa leve das funções/módulos principais. Evita que o agente precise ler dezenas de arquivos para encontrar onde algo está.

**`.claude/docs/function_index.md`**:
```markdown
# Function Index

## Autenticação (src/modules/auth/)
| Arquivo | Propósito | Dependências |
|---------|-----------|-------------|
| services/loginUser.ts | Autenticação email/senha | UserRepository, PasswordHasher |
| services/refreshToken.ts | Gera novo access token | TokenRepository, JWT |
| services/registerUser.ts | Registro de novo usuário | UserRepository, EmailService |
| middleware/authGuard.ts | Middleware de autenticação | JWT, TokenRepository |

## Billing (src/modules/billing/)
| Arquivo | Propósito | Dependências |
|---------|-----------|-------------|
| services/createCheckoutSession.ts | Cria sessão Stripe | StripeClient, PlanRepository |
| services/handleWebhook.ts | Processa webhooks Stripe | StripeClient, SubscriptionRepository |
| services/cancelSubscription.ts | Cancela assinatura | StripeClient, SubscriptionRepository |

## Shared (src/shared/)
| Arquivo | Propósito |
|---------|-----------|
| clients/stripe.ts | Stripe client configurado |
| clients/resend.ts | Email client (Resend) |
| logger.ts | Logger central — SEMPRE use este |
| errors.ts | Classes de erro customizadas |
```

---

## 14. Scripts de Automação

### 14.1 Gerador de Índice Automático

**`scripts/claude/generate-index.sh`**:
```bash
#!/bin/bash
# Gera function_index.md automaticamente a partir do codebase
# Uso: ./scripts/claude/generate-index.sh

OUTPUT=".claude/docs/function_index.md"
SRC_DIR="src"

echo "# Function Index" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "> Auto-gerado em $(date +%Y-%m-%d). Não edite manualmente." >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Encontra todos os módulos
for MODULE_DIR in "$SRC_DIR"/modules/*/; do
  MODULE=$(basename "$MODULE_DIR")
  echo "## ${MODULE^} ($MODULE_DIR)" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "| Arquivo | Exports principais |" >> "$OUTPUT"
  echo "|---------|-------------------|" >> "$OUTPUT"

  # Lista arquivos .ts que exportam funções/classes
  find "$MODULE_DIR" -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" -not -name "index.ts" -not -path "*/__tests__/*" | sort | while read -r FILE; do
    REL_PATH="${FILE#$SRC_DIR/}"
    # Extrai exports
    EXPORTS=$(grep -oP 'export\s+(async\s+)?function\s+\K\w+|export\s+class\s+\K\w+|export\s+const\s+\K\w+' "$FILE" 2>/dev/null | head -5 | tr '\n' ', ' | sed 's/,$//')
    if [ -n "$EXPORTS" ]; then
      echo "| $REL_PATH | $EXPORTS |" >> "$OUTPUT"
    fi
  done

  echo "" >> "$OUTPUT"
done

# Shared utilities
echo "## Shared ($SRC_DIR/shared/)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Arquivo | Exports principais |" >> "$OUTPUT"
echo "|---------|-------------------|" >> "$OUTPUT"

find "$SRC_DIR/shared" -name "*.ts" -not -name "*.test.ts" -not -name "index.ts" -maxdepth 2 | sort | while read -r FILE; do
  REL_PATH="${FILE#$SRC_DIR/}"
  EXPORTS=$(grep -oP 'export\s+(async\s+)?function\s+\K\w+|export\s+class\s+\K\w+|export\s+const\s+\K\w+' "$FILE" 2>/dev/null | head -5 | tr '\n' ', ' | sed 's/,$//')
  if [ -n "$EXPORTS" ]; then
    echo "| $REL_PATH | $EXPORTS |" >> "$OUTPUT"
  fi
done

echo ""
echo "✅ Index gerado em $OUTPUT"
echo "📊 $(grep -c '|' "$OUTPUT") entries encontradas"
```

### 14.2 Tracker de Usage (Tokens/Custo)

**`scripts/claude/track-usage.py`**:
```python
#!/usr/bin/env python3
"""
Tracker de uso de tokens do Claude Code.
Coleta dados do output JSON e gera relatórios.

Uso:
  - Como hook de Stop: registra cada sessão
  - Standalone: gera relatório de uso

Configurar no settings.json:
  "Stop": [{"hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/scripts/claude/track-usage.py --log"}]}]
"""

import json
import sys
import os
import csv
from datetime import datetime, timedelta
from pathlib import Path

USAGE_FILE = Path.home() / ".claude" / "usage-tracker.csv"
HEADERS = ["timestamp", "project", "session_id", "cost_usd", "input_tokens", "output_tokens", "duration_s", "model"]


def ensure_file():
    """Cria o arquivo CSV se não existir."""
    if not USAGE_FILE.exists():
        USAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(USAGE_FILE, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)


def log_usage():
    """Loga dados de uso da sessão atual."""
    ensure_file()

    # Tenta ler dados do stdin (hook Stop) ou de variáveis de ambiente
    data = {}
    try:
        stdin_data = sys.stdin.read()
        if stdin_data:
            data = json.loads(stdin_data)
    except (json.JSONDecodeError, EOFError):
        pass

    row = [
        datetime.now().isoformat(),
        os.environ.get("PROJECT_NAME", os.path.basename(os.getcwd())),
        data.get("session_id", "unknown"),
        data.get("cost_usd", 0),
        data.get("usage", {}).get("input_tokens", 0),
        data.get("usage", {}).get("output_tokens", 0),
        data.get("duration_ms", 0) / 1000 if data.get("duration_ms") else 0,
        data.get("model", "unknown"),
    ]

    with open(USAGE_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(row)

    print(f"📊 Usage logged: ${row[3]:.4f}")


def report(days=7):
    """Gera relatório de uso dos últimos N dias."""
    ensure_file()

    cutoff = datetime.now() - timedelta(days=days)
    total_cost = 0
    total_input = 0
    total_output = 0
    sessions = 0
    by_project = {}

    with open(USAGE_FILE, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                ts = datetime.fromisoformat(row["timestamp"])
                if ts < cutoff:
                    continue
            except ValueError:
                continue

            cost = float(row.get("cost_usd", 0))
            total_cost += cost
            total_input += int(row.get("input_tokens", 0))
            total_output += int(row.get("output_tokens", 0))
            sessions += 1

            project = row.get("project", "unknown")
            if project not in by_project:
                by_project[project] = {"cost": 0, "sessions": 0}
            by_project[project]["cost"] += cost
            by_project[project]["sessions"] += 1

    print(f"\n📊 Claude Code Usage Report (last {days} days)")
    print(f"{'='*50}")
    print(f"Total sessions:      {sessions}")
    print(f"Total cost:          ${total_cost:.2f}")
    print(f"Total input tokens:  {total_input:,}")
    print(f"Total output tokens: {total_output:,}")
    print(f"Avg cost/session:    ${total_cost/max(sessions,1):.4f}")
    print(f"\nPor projeto:")
    for project, data in sorted(by_project.items(), key=lambda x: x[1]["cost"], reverse=True):
        print(f"  {project}: ${data['cost']:.2f} ({data['sessions']} sessões)")


if __name__ == "__main__":
    if "--log" in sys.argv:
        log_usage()
    elif "--report" in sys.argv:
        days = 7
        for i, arg in enumerate(sys.argv):
            if arg == "--days" and i + 1 < len(sys.argv):
                days = int(sys.argv[i + 1])
        report(days)
    else:
        print("Uso:")
        print("  python track-usage.py --log              # Registra sessão atual")
        print("  python track-usage.py --report           # Relatório 7 dias")
        print("  python track-usage.py --report --days 30 # Relatório 30 dias")
```

### 14.3 Bump Version com Changelog

**`scripts/claude/bump-version.sh`**:
```bash
#!/bin/bash
# Bump version com changelog automático
# Uso: ./scripts/claude/bump-version.sh [major|minor|patch]

TYPE="${1:-patch}"
CURRENT=$(node -p "require('./package.json').version")

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "❌ Tipo inválido: $TYPE (use major, minor, patch)"; exit 1 ;;
esac

NEW="${MAJOR}.${MINOR}.${PATCH}"
DATE=$(date +%Y-%m-%d)

echo "📦 Bumping version: v$CURRENT → v$NEW"

# Atualizar package.json
node -e "
const pkg = require('./package.json');
pkg.version = '$NEW';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Atualizar CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
  # Coleta commits desde última tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$LAST_TAG" ]; then
    COMMITS=$(git log "$LAST_TAG"..HEAD --oneline --no-merges)
  else
    COMMITS=$(git log --oneline --no-merges -20)
  fi

  # Gera seção do changelog
  CHANGELOG_ENTRY="## [$NEW] - $DATE\n\n"
  while IFS= read -r line; do
    CHANGELOG_ENTRY+="- $line\n"
  done <<< "$COMMITS"
  CHANGELOG_ENTRY+="\n"

  # Insere após o título
  sed -i "0,/^## /s//$(echo -e "$CHANGELOG_ENTRY")## /" CHANGELOG.md 2>/dev/null || {
    # macOS sed
    sed -i '' "0,/^## /s//$(echo "$CHANGELOG_ENTRY")## /" CHANGELOG.md
  }
fi

# Git
git add package.json CHANGELOG.md
git commit -m "chore: bump version to v$NEW"
git tag "v$NEW"

echo "✅ Version bumped to v$NEW"
echo "📋 Tag v$NEW criada"
echo "🔜 Execute: git push && git push --tags"

# Notifica time
if command -v "$CLAUDE_PROJECT_DIR/scripts/claude/notify-whatsapp.sh" &>/dev/null; then
  "$CLAUDE_PROJECT_DIR/scripts/claude/notify-whatsapp.sh" "📦 Nova versão: v$NEW ($TYPE)"
fi
```

### 14.4 Git Workflow Automatizado

**`scripts/claude/git-workflow.sh`**:
```bash
#!/bin/bash
# Workflow git completo para feature branches
# Uso: ./scripts/claude/git-workflow.sh <action> [args]

ACTION="$1"
shift

case "$ACTION" in
  start)
    # Iniciar feature branch
    DESCRIPTION="$*"
    BRANCH="feat/$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')"
    git checkout main
    git pull origin main
    git checkout -b "$BRANCH"
    echo "✅ Feature branch criada: $BRANCH"
    ;;

  sync)
    # Sincronizar com main
    CURRENT=$(git branch --show-current)
    git fetch origin main
    git rebase origin/main
    echo "✅ Branch $CURRENT sincronizada com main"
    ;;

  finish)
    # Finalizar feature (squash merge)
    CURRENT=$(git branch --show-current)
    if [ "$CURRENT" = "main" ]; then
      echo "❌ Não pode finalizar na main"
      exit 1
    fi
    git checkout main
    git pull origin main
    git merge --squash "$CURRENT"
    echo "✅ Branch $CURRENT merged (squash) em main"
    echo "🔜 Revise o commit e execute: git commit && git push"
    ;;

  cleanup)
    # Limpar branches merged
    git branch --merged main | grep -v 'main' | xargs -r git branch -d
    echo "✅ Branches merged limpas"
    ;;

  *)
    echo "Uso: git-workflow.sh <start|sync|finish|cleanup> [args]"
    echo "  start <descrição>  - Cria feature branch"
    echo "  sync               - Rebase com main"
    echo "  finish             - Squash merge na main"
    echo "  cleanup            - Remove branches merged"
    ;;
esac
```

### 14.5 Session Handoff Automático

**`scripts/claude/session-handoff.sh`**:
```bash
#!/bin/bash
# Salva estado da sessão para continuidade
# Chamado pelo hook Stop ou manualmente

STATE_FILE=".claude/session-state.md"
BACKUP_DIR=".claude/backups"
PROJECT=${PROJECT_NAME:-$(basename "$(pwd)")}
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)

mkdir -p "$BACKUP_DIR"

# Backup do state anterior
if [ -f "$STATE_FILE" ]; then
  cp "$STATE_FILE" "$BACKUP_DIR/session-$(date +%Y%m%d-%H%M%S).md"
fi

# Coleta informações automáticas
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "unknown")
MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -20)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | head -20)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | head -10)

cat > "$STATE_FILE" << EOF
# Session State — $PROJECT
> Última atualização: $TIMESTAMP
> Branch: $BRANCH
> Último commit: $LAST_COMMIT

## Arquivos modificados (não commitados)
$MODIFIED_FILES

## Arquivos staged
$STAGED_FILES

## Arquivos novos (untracked)
$UNTRACKED

## Task atual
<!-- Preencher manualmente ou via agente -->

## O que foi feito
<!-- Preencher manualmente ou via agente -->

## O que falta
<!-- Preencher manualmente ou via agente -->

## Decisões tomadas
<!-- Preencher manualmente ou via agente -->
EOF

echo "📋 Session state salvo em $STATE_FILE"
```

---

## 15. Checklist Final de Deploy

Use este checklist ao configurar Claude Code em um novo projeto:

### Setup Inicial
- [ ] Criar estrutura `.claude/` (settings, commands, skills, agents, docs)
- [ ] Criar `.claudeignore` ajustado ao projeto
- [ ] Criar `CLAUDE.md` minimalista (< 100 linhas)
- [ ] Criar docs auxiliares em `.claude/docs/`
- [ ] Configurar `.claude/settings.json` (permissões de time + hooks)
- [ ] Configurar `.claude/settings.local.json` (permissões pessoais + env vars)
- [ ] Configurar `.claude/.gitignore` (ignorar settings.local, session-state, logs)

### Hooks
- [ ] `SessionStart`: injetar git status e branch
- [ ] `PreToolUse (Edit|Write)`: bloquear edits na main
- [ ] `PreToolUse (Bash)`: validar comandos destrutivos
- [ ] `PreToolUse (Read)`: avisar sobre arquivos grandes
- [ ] `PostToolUse (Write|Edit)`: auto-format com Prettier/Black
- [ ] `Stop`: log de usage + lembrete de session state
- [ ] `Notification`: notificação desktop + WhatsApp
- [ ] `PreCompact`: backup de transcript

### Skills/Commands
- [ ] `/commit` — commit inteligente convencional
- [ ] `/review-pr` — code review automatizado
- [ ] `/bump-version` — bump semver + changelog
- [ ] `/deploy` — pipeline de deploy com checks
- [ ] `/notify-team` — notificação WhatsApp

### Scripts
- [ ] `generate-index.sh` — gera function_index.md
- [ ] `track-usage.py` — tracker de tokens/custo
- [ ] `bump-version.sh` — bump + changelog + tag
- [ ] `git-workflow.sh` — workflow de feature branches
- [ ] `session-handoff.sh` — salva estado entre sessões
- [ ] `notify-whatsapp.sh` — notificação WhatsApp
- [ ] `notify-deploy.sh` — notificação pós-deploy
- [ ] Todos os scripts com `chmod +x`

### Subagentes
- [ ] `scout.md` — exploração com Haiku (somente leitura)
- [ ] `code-reviewer.md` — review com Sonnet

### Configurações de Uso
- [ ] Extended thinking: desligado por padrão
- [ ] Output style: concise/default
- [ ] Modelo default: Sonnet para implementação
- [ ] `/clear` entre tasks não relacionadas
- [ ] `/compact` após ~15 mensagens
- [ ] Session state atualizado ao final de sessões significativas

### Métricas
- [ ] Hook de Stop logando uso em CSV
- [ ] Relatório semanal: `python track-usage.py --report --days 7`
- [ ] Comparar custo antes/depois das otimizações

---

## Notas Finais

### Filosofia geral

1. **Contexto é moeda** — cada token no contexto custa em toda mensagem subsequente.
2. **Progressive disclosure > monolito** — o agente lê o que precisa, quando precisa.
3. **Hooks são garantias, CLAUDE.md é advisory** — use hooks para regras hard, CLAUDE.md para guidelines.
4. **Sessões curtas > sessões longas** — custo escala quase exponencialmente com histórico.
5. **Subagentes economizam contexto** — cada um tem janela separada.
6. **Medir para melhorar** — sem métricas, otimização é achismo.

### Referências

- [Claude Code Docs — Costs](https://code.claude.com/docs/en/costs)
- [Claude Code Docs — Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Docs — Skills](https://code.claude.com/docs/en/skills)
- [Anthropic Blog — How to Configure Hooks](https://claude.com/blog/how-to-configure-hooks)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)

---

*Documento gerado por VTS Victorious Tech Solutions Ltda. Adapte para cada projeto.*
