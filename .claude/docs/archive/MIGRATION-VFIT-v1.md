# 🚀 VFIT v1.0.0 — Plano de Migração Completo

> **Data:** 02/04/2026 · **Status:** ⏳ AGUARDANDO APROVAÇÃO  
> **Objetivo:** Migrar para novo repositório GitHub + limpar histórico + infra CF  
> **Resultado:** Repo limpo, versão 1.0.0, zero referências ao projeto antigo

---

## 📋 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Pré-Requisitos](#2-pré-requisitos)
3. [FASE 1 — Preparação Local](#3-fase-1--preparação-local)
4. [FASE 2 — Git: Logout + Login Nova Conta](#4-fase-2--git-logout--login-nova-conta)
5. [FASE 3 — Criar Repo Novo + Push Limpo](#5-fase-3--criar-repo-novo--push-limpo)
6. [FASE 4 — Infra Cloudflare](#6-fase-4--infra-cloudflare)
7. [FASE 5 — Validação Final](#7-fase-5--validação-final)
8. [FASE 6 — Limpeza Pós-Migração](#8-fase-6--limpeza-pós-migração)
9. [README v1.0.0](#9-readme-v100)
10. [Checklist Go/No-Go](#10-checklist-gono-go)
11. [Rollback](#11-rollback)

---

## 1. VISÃO GERAL

### O que estamos fazendo

| Item | De (Antigo) | Para (Novo) |
|------|-------------|-------------|
| **GitHub Account** | `vts-development` | Nova conta (a definir) |
| **Repo** | `personal-ia` (688 commits, 141MB .git) | `vfit` (1 commit, ~1MB .git) |
| **Versão** | `7.0.0` | `1.0.0` (reset, mesmo bump mechanism) |
| **package.json name** | `vfit` (já migrado) | `vfit` ✅ |
| **Git history** | 688 commits com refs antigas | **ZERO** — single initial commit |
| **Branch** | `main` | `main` |

### O que NÃO muda (manter intacto)

| Item | Valor | Razão |
|------|-------|-------|
| CF Account ID | `b0bf95d0fabb322ac3df37bd84ec0c77` | Mesma conta CF |
| Worker name | `personaliai-api` | Nome real no CF (muda na FASE 4) |
| Pages project | `evoluia` | Nome real no CF (muda na FASE 4) |
| D1 database | `personaliai-exercises` | ID permanece |
| R2 buckets | `personal-ia-videos` / `personal-ia-images` | **CF não permite renomear R2** |
| Domínio | `iapersonal.app.br` | Provisório — muda quando tiver novo domínio |
| KV namespaces | IDs permanecem | Dados de sessão/cache |
| Secrets | Todos permanecem | Já estão no CF |
| TWA package | `br.app.personalia` | Play Store — **imutável** |
| Neon DB | Schema + dados intactos | Não toca no banco |

---

## 2. PRÉ-REQUISITOS

### Antes de começar, confirme:

- [ ] **Nova conta GitHub criada** (username: `___________`)
- [ ] **Novo email do GitHub** configurado
- [ ] **SSH key OU Personal Access Token** gerado na nova conta
- [ ] **Backup local completo** do projeto (vamos criar)
- [ ] **Nenhum deploy pendente** — produção estável
- [ ] **Sessão terminal limpa** — sem processos em background

### Informações que preciso de você:

```
1. Username da nova conta GitHub: ___________
2. Email da nova conta GitHub: ___________
3. Nome do repositório desejado: vfit (ou outro?)
4. Repo público ou privado? ___________
5. Quer manter GitHub Actions (CI/CD)? ___________
6. Nova conta já tem SSH key configurada? ___________
```

---

## 3. FASE 1 — Preparação Local

> **Tempo estimado:** 5 minutos  
> **Risco:** ZERO (apenas backup + limpeza)

### 1.1 Backup Completo

```bash
# Criar backup ANTES de qualquer mudança
cd /Users/macos/Development/apps
cp -r personal-ia-prod personal-ia-prod-BACKUP-FINAL
echo "✅ Backup criado em personal-ia-prod-BACKUP-FINAL"

# Verificar backup
ls -la personal-ia-prod-BACKUP-FINAL/package.json
```

> ⚠️ **IMPORTANTE:** Este backup é seu seguro. NÃO delete até a migração estar 100% validada.

### 1.2 Limpar Artefatos Desnecessários

```bash
cd /Users/macos/Development/apps/personal-ia-prod

# Limpar build cache
rm -rf .next out

# Limpar worktrees órfãos do Claude Code (se existirem)
rm -rf .claude/worktrees/

# Limpar backups internos antigos
rm -rf backups/

# Limpar pasta lucas/ (arquivos pessoais de teste)
rm -rf lucas/

# Limpar test results
rm -rf test-results/

# Verificar tamanho limpo (sem node_modules e .git)
du -sh --exclude=node_modules --exclude=.git . 2>/dev/null || echo "~20MB esperado"
```

### 1.3 Reset Versão para 1.0.0

```bash
# Atualizar version no package.json
npm version 1.0.0 --no-git-tag-version --allow-same-version

# Atualizar lib/version.ts
cat > lib/version.ts << 'EOF'
// Auto-generated - do not edit manually
// Updated via: npm run version:patch

export const APP_VERSION = '1.0.0'
export const BUILD_DATE = '2026-04-02T00:00:00.000Z'
export const BUILD_NUMBER = 1
EOF

echo "✅ Versão resetada para 1.0.0"
```

### 1.4 Limpar Referências ao Repo Antigo

Arquivos que referenciam o repo `vts-development/personal-ia`:

```bash
# Verificar onde aparece o repo antigo
grep -rn "vts-development\|personal-ia\.git" --include="*.ts" --include="*.json" --include="*.yml" --include="*.md" --include="*.mjs" --include="*.js" . \
  | grep -v node_modules | grep -v .git/ | grep -v BACKUP
```

> O Copilot vai atualizar todos esses arquivos automaticamente na execução.

### 1.5 Criar README Novo

> Ver seção [9. README v1.0.0](#9-readme-v100) para o conteúdo completo.
> O README atual será **completamente substituído**.

### 1.6 Atualizar .env.local

```bash
# Atualizar grupo WhatsApp (se renomeou)
# WHATSAPP_GROUP_NAME=Logs e Docs: VFIT
```

---

## 4. FASE 2 — Git: Logout + Login Nova Conta

> **Tempo estimado:** 10 minutos  
> **Risco:** BAIXO (apenas credenciais)

### 2.1 Verificar Credenciais Atuais

```bash
# Ver config git atual
git config --global user.name
git config --global user.email
echo "---"
git remote -v

# Ver credential helpers ativos
git config --global credential.helper
git credential-osxkeychain 2>/dev/null && echo "osxkeychain ativo"
```

### 2.2 Remover Credenciais Antigas do macOS Keychain

```bash
# Método 1: Via CLI (recomendado)
git credential-osxkeychain erase <<EOF
protocol=https
host=github.com
EOF

# Método 2: Via Keychain Access (GUI)
# 1. Abrir "Keychain Access" (Cmd+Space → "Keychain Access")
# 2. Buscar "github.com"
# 3. Deletar TODAS as entradas relacionadas a github.com
# 4. Deletar entradas com "vts-development" se houver

# Método 3: Se usa GH CLI
gh auth logout
```

> ⚠️ **CRÍTICO:** Depois de limpar, QUALQUER `git push` vai pedir credenciais novas.
> É exatamente isso que queremos.

### 2.3 Configurar Nova Identidade Git

```bash
# Atualizar identidade GLOBAL (afeta todos os repos)
git config --global user.name "SEU_NOME_NOVO"
git config --global user.email "SEU_EMAIL_NOVO@example.com"

# Verificar
git config --global user.name
git config --global user.email
```

> 💡 **Alternativa:** Se quiser manter a identidade antiga em OUTROS repos,
> use config LOCAL (sem `--global`) dentro da pasta do projeto:
> ```bash
> cd /Users/macos/Development/apps/personal-ia-prod
> git config user.name "SEU_NOME_NOVO"
> git config user.email "SEU_EMAIL_NOVO@example.com"
> ```

### 2.4 Autenticação: SSH ou HTTPS?

#### Opção A: SSH Key (Recomendado)

```bash
# 1. Gerar nova SSH key para a nova conta
ssh-keygen -t ed25519 -C "SEU_EMAIL_NOVO@example.com" -f ~/.ssh/id_ed25519_vfit

# 2. Adicionar ao SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_vfit

# 3. Copiar chave pública
pbcopy < ~/.ssh/id_ed25519_vfit.pub
echo "✅ Chave copiada para clipboard"

# 4. Colar em: GitHub → Settings → SSH and GPG keys → New SSH key

# 5. Se tiver MÚLTIPLAS SSH keys, configurar ~/.ssh/config:
cat >> ~/.ssh/config << 'EOF'

# Nova conta GitHub (VFIT)
Host github-vfit
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_vfit
  IdentitiesOnly yes
EOF

# 6. Testar conexão
ssh -T git@github.com
# Deve mostrar: "Hi NOVO_USERNAME! You've successfully authenticated..."
```

#### Opção B: HTTPS + Personal Access Token

```bash
# 1. GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained
# 2. Criar token com permissões: repo (full), workflow
# 3. Salvar o token (mostra UMA vez)

# 4. Na hora do push, usar:
# Username: SEU_NOVO_USERNAME
# Password: ghp_SEU_TOKEN_AQUI

# 5. Para salvar no keychain (não pedir de novo):
git config --global credential.helper osxkeychain
```

#### Opção C: GitHub CLI (Mais Simples)

```bash
# 1. Instalar GH CLI (se não tem)
brew install gh

# 2. Logout da conta antiga
gh auth logout

# 3. Login na nova conta
gh auth login
# Escolher: GitHub.com → HTTPS → Login with a web browser
# Vai abrir o browser para autenticar

# 4. Verificar
gh auth status
```

### 2.5 Verificar Tudo Antes de Continuar

```bash
echo "=== Git Identity ==="
git config --global user.name
git config --global user.email

echo "=== SSH Test ==="
ssh -T git@github.com 2>&1

echo "=== GH CLI (se instalado) ==="
gh auth status 2>&1 || echo "GH CLI não configurado"
```

---

## 5. FASE 3 — Criar Repo Novo + Push Limpo

> **Tempo estimado:** 5 minutos  
> **Risco:** ZERO (criando do zero, repo antigo intacto)

### 3.1 Criar Repositório no GitHub

#### Via GitHub CLI (recomendado):
```bash
# Criar repo privado
gh repo create NOVO_USERNAME/vfit --private --description "VFIT — SaaS Platform for Personal Trainers"

# OU repo público
gh repo create NOVO_USERNAME/vfit --public --description "VFIT — SaaS Platform for Personal Trainers"
```

#### Via GitHub Web:
1. Ir para https://github.com/new
2. Repository name: `vfit`
3. Description: `VFIT — SaaS Platform for Personal Trainers`
4. Private (recomendado para SaaS)
5. **NÃO** inicializar com README/LICENSE/.gitignore
6. Criar

### 3.2 Preparar Branch Órfã (Limpa Histórico)

```bash
cd /Users/macos/Development/apps/personal-ia-prod

# 1. Criar branch órfã (sem NENHUM parent commit)
git checkout --orphan fresh-start

# 2. Adicionar TODOS os arquivos (já estão limpos)
git add -A

# 3. Commit inicial LIMPO
git commit -m "🚀 VFIT v1.0.0 — Initial release

SaaS platform for Personal Trainers.

Stack: Next.js 15 · Hono.js · Cloudflare Workers · Neon PostgreSQL
Features: AI workouts · Payments · PWA · Gamification · Real-time chat"

# 4. Renomear branch para main
git branch -M main
```

> 🔴 **O que acabou de acontecer:**
> - Branch `fresh-start` criada SEM nenhum histórico
> - Todos os arquivos do working directory adicionados como "novos"
> - 1 único commit existe agora
> - Renomeada para `main`
> - Os 688 commits antigos **não existem mais** nesta branch

### 3.3 Trocar Remote e Push

```bash
# 1. Remover remote antigo
git remote remove origin

# 2. Adicionar remote novo
# Se SSH:
git remote add origin git@github.com:NOVO_USERNAME/vfit.git
# Se HTTPS:
git remote add origin https://github.com/NOVO_USERNAME/vfit.git
# Se SSH com config customizado (múltiplas contas):
git remote add origin git@github-vfit:NOVO_USERNAME/vfit.git

# 3. Push inicial
git push -u origin main

# 4. Verificar
git remote -v
git log --oneline
# Deve mostrar: apenas 1 commit
```

### 3.4 Verificação Pós-Push

```bash
# Confirmar que o repo no GitHub tem:
echo "=== Verificações ==="
git log --oneline                    # 1 commit apenas
git log --all --oneline              # 1 commit apenas (nenhuma branch antiga)
git reflog | wc -l                   # Poucos entries (não os 688 antigos)
echo "---"
echo "Verificar no browser: https://github.com/NOVO_USERNAME/vfit"
```

> ⚠️ **NOTA:** O `git reflog` local ainda pode ter referências antigas.
> Isso é normal e será limpo na FASE 6.

---

## 6. FASE 4 — Infra Cloudflare

> **Tempo estimado:** 30-60 minutos  
> **Risco:** MÉDIO (produção ativa — seguir com cuidado)
> **Requer:** Acesso ao CF Dashboard

### ⚡ IMPORTANTE: Ordem de Operações

A ordem é **crítica** para zero downtime:

```
1. Criar novo Worker "vfit-api" → NÃO rotear ainda
2. Copiar secrets do Worker antigo → novo
3. Deployar código no novo Worker
4. Testar novo Worker via workers.dev
5. Rotear domínio api.iapersonal.app.br → novo Worker
6. Verificar que tudo funciona
7. Desativar Worker antigo
---
8. Criar novo Pages project "vfit"
9. Deployar frontend no novo Pages
10. Rotear domínio iapersonal.app.br → novo Pages
11. Verificar que tudo funciona
12. Desativar Pages antigo
```

### 4.1 Worker: `personaliai-api` → `vfit-api`

#### No CF Dashboard:

```
1. Workers & Pages → Create → Create Worker
2. Name: "vfit-api"
3. Clicar "Deploy" (deploy o hello world default)
4. Ir em Settings do novo Worker
```

#### Copiar Secrets (CF Dashboard → vfit-api → Settings → Variables):

| Secret | Copiar de personaliai-api |
|--------|--------------------------|
| `JWT_SECRET` | ✅ |
| `ASAAS_API_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `REPLICATE_API_TOKEN` | ✅ |
| `RESEND_API_KEY` | ✅ |
| `EMAIL_FROM` | ✅ |
| `ONESIGNAL_APP_ID` | ✅ |
| `ONESIGNAL_REST_KEY` | ✅ |
| `DATABASE_URL` | ✅ |
| `NEON_DATABASE_URL` | ✅ |
| `SENTRY_DSN_WORKER` | ✅ |
| `TURNSTILE_SECRET_KEY` | ✅ |
| `CF_STREAM_API_TOKEN` | ✅ (se existir) |

> ⚠️ Secrets não são visíveis no dashboard — você precisa **re-inserir** cada um.
> Se não tem os valores salvos, use `wrangler secret list` no Worker antigo
> e insira via `wrangler secret put NOME` no novo.

#### Atualizar wrangler.toml:

```toml
# ANTES:
name = "personaliai-api"

# DEPOIS:
name = "vfit-api"
```

#### Deploy do Código:

```bash
# Deploy no novo Worker
wrangler deploy

# Testar via workers.dev
curl https://vfit-api.vd-b0b.workers.dev/api/v1/health
# Deve retornar: { "status": "ok", ... }
```

#### Rotear Domínio (CF Dashboard):

```
1. Workers & Pages → vfit-api → Settings → Triggers
2. Custom Domains → Add: api.iapersonal.app.br
3. OU Routes → Add: api.iapersonal.app.br/*
```

> O CF vai automaticamente remover a rota do Worker antigo.

### 4.2 Pages: `evoluia` → `vfit`

#### No CF Dashboard:

```
1. Workers & Pages → Create → Create Pages
2. Connect to Git → Selecionar repo NOVO (NOVO_USERNAME/vfit)
3. Project name: "vfit"
4. Build command: npm run build
5. Build output: out
6. Deploy
```

#### OU via CLI:

```bash
# Criar Pages project
wrangler pages project create vfit

# Atualizar wrangler.pages.toml
# ANTES: name = "evoluia"
# DEPOIS: name = "vfit"

# Deploy
wrangler pages deploy out --project-name vfit
```

#### Rotear Domínio:

```
1. Workers & Pages → vfit → Custom Domains
2. Add: iapersonal.app.br
3. Add: www.iapersonal.app.br (se usar)
```

### 4.3 D1 Database (Opcional — Pode Manter)

O D1 `personaliai-exercises` pode manter o nome — o binding `DB` é o que importa.
Se quiser renomear:

```bash
# Criar novo D1
wrangler d1 create vfit-exercises

# Exportar dados do antigo
wrangler d1 export personaliai-exercises --output=d1-backup.sql

# Importar no novo
wrangler d1 execute vfit-exercises --file=d1-backup.sql

# Atualizar ID no wrangler.toml
```

> 💡 **Recomendação:** Manter o D1 com nome antigo. Só o binding importa no código.

### 4.4 Hyperdrive (Opcional — Pode Manter)

Mesmo caso do D1 — o ID é o que importa:

```bash
# Se quiser renomear (precisa recriar)
wrangler hyperdrive create vfit-db --connection-string="$NEON_DATABASE_URL"

# Atualizar ID no wrangler.toml
```

### 4.5 R2 Buckets — NÃO RENOMEAR

```
⛔ Cloudflare NÃO permite renomear R2 buckets.
⛔ Deletar + recriar = PERDER TODOS OS ARQUIVOS.

✅ Manter: personal-ia-videos e personal-ia-images
✅ Os bindings (R2_VIDEOS, R2_IMAGES) são o que o código usa
✅ Nenhum usuário vê o nome interno do bucket
```

### 4.6 KV Namespaces — Manter

Os IDs permanecem. Nenhuma ação necessária.

### 4.7 WhatsApp Worker (se migrar)

```bash
# Se quiser renomear personaliai-whatsapp → vfit-whatsapp
# Mesmo processo do Worker principal:
# 1. Criar novo Worker no Dashboard
# 2. Copiar secrets
# 3. Deploy
# 4. Rotear domínio whatsapp.iapersonal.app.br
```

### 4.8 Atualizar CORS (workers/middleware/cors.ts)

Adicionar o novo domínio Pages `vfit.pages.dev`:

```typescript
// Adicionar:
'https://vfit.pages.dev'
// Manter como fallback:
'https://evoluia.pages.dev'
'https://personal-ia-prod.pages.dev'
```

### 4.9 Atualizar wrangler configs finais

Após confirmação de tudo funcionando:

```toml
# wrangler.toml
name = "vfit-api"
# D1 comment atualizado
# Hyperdrive comment atualizado

# wrangler.pages.toml  
name = "vfit"
```

---

## 7. FASE 5 — Validação Final

> **Tempo estimado:** 15 minutos  
> **Risco:** ZERO (apenas verificação)

### 5.1 Verificação do Repositório

```bash
# No diretório do projeto
cd /Users/macos/Development/apps/personal-ia-prod

echo "=== 1. Histórico Git ==="
git log --oneline --all
# ✅ Deve ter APENAS 1 commit

echo "=== 2. Remote ==="
git remote -v
# ✅ Deve apontar para NOVO_USERNAME/vfit

echo "=== 3. Versão ==="
cat package.json | grep '"version"'
cat lib/version.ts | grep APP_VERSION
# ✅ Ambos: 1.0.0

echo "=== 4. Nenhuma ref antiga ==="
grep -rn "personal-ia\.git\|vts-development\|personaliai-api" \
  --include="*.ts" --include="*.json" --include="*.yml" . \
  | grep -v node_modules | grep -v .git/ | grep -v wrangler
# ✅ Zero resultados (exceto wrangler.toml se D1/R2 mantidos)

echo "=== 5. Build ==="
npm run build
# ✅ Build OK

echo "=== 6. Tests ==="
npx vitest run
# ✅ 360/360 pass
```

### 5.2 Verificação de Produção

```bash
# API Health
curl -s https://api.iapersonal.app.br/api/v1/health | jq .

# Frontend
curl -s -o /dev/null -w "%{http_code}" https://iapersonal.app.br

# Login flow (se tiver smoke test)
npm run smoke:auth:local 2>/dev/null || echo "Smoke test não configurado"
```

### 5.3 Verificação GitHub

- [ ] Repo visível em `https://github.com/NOVO_USERNAME/vfit`
- [ ] README renderiza corretamente
- [ ] 1 commit apenas
- [ ] Nenhum arquivo desnecessário (node_modules, .next, etc.)
- [ ] `.gitignore` funcionando
- [ ] Nenhuma referência ao projeto/conta antiga

---

## 8. FASE 6 — Limpeza Pós-Migração

> **Executar SOMENTE após 48h de produção estável**

### 6.1 Limpar Git Reflog Local

```bash
# Remove referências antigas do reflog
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Verificar tamanho do .git (deve ser ~2-5MB agora)
du -sh .git/
```

### 6.2 Desativar Recursos Antigos no CF

```
1. CF Dashboard → Workers → personaliai-api → Settings → Disable
2. CF Dashboard → Pages → evoluia → Settings → Pause
3. AGUARDAR 1 semana → Deletar se tudo OK
```

> ⚠️ **NÃO delete imediatamente.** Mantenha desabilitados por 1 semana como safety net.

### 6.3 Backup do Repo Antigo

```bash
# Comprimir backup final
cd /Users/macos/Development/apps
tar -czf personal-ia-prod-ARCHIVE-FINAL.tar.gz personal-ia-prod-BACKUP-FINAL/

# Mover para local seguro (HD externo, cloud, etc.)
# Após confirmar: rm -rf personal-ia-prod-BACKUP-FINAL/
```

### 6.4 Repo Antigo no GitHub

```
Opção A (Recomendado): Tornar privado + Arquivar
  GitHub → vts-development/personal-ia → Settings → Archive repository

Opção B: Deletar
  GitHub → vts-development/personal-ia → Settings → Delete repository
  ⚠️ Irreversível! Só faça se tem backup local.
```

### 6.5 Renomear Pasta Local (Opcional)

```bash
cd /Users/macos/Development/apps
mv personal-ia-prod vfit
cd vfit
pwd  # /Users/macos/Development/apps/vfit
```

---

## 9. README v1.0.0

> Este README substitui **completamente** o atual.

```markdown
<div align="center">

# 🏋️ VFIT

**SaaS Platform for Personal Trainers**

[![Version](https://img.shields.io/badge/version-1.0.0-00C853?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/NOVO_USERNAME/vfit/releases)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-proprietary-red?style=for-the-badge)](LICENSE)

*Empowering personal trainers with AI-driven tools, seamless payments, and gamified training experiences.*

[Live App](https://iapersonal.app.br) · [API Docs](docs/BACKEND.md) · [Changelog](docs/CHANGELOG.md)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Workouts** | Generate personalized training plans with Llama 3.3 70B |
| 💰 **Payments** | PIX, boleto, credit card via Asaas + Stripe |
| 📱 **PWA** | Installable progressive web app with offline support |
| 🎮 **Gamification** | XP system, badges, streaks, and leaderboards |
| 💬 **Real-time Chat** | Trainer-student messaging with push notifications |
| 📊 **Assessments** | Body composition tracking with photo comparisons |
| 📄 **PDF Reports** | Auto-generated assessment reports |
| 🔔 **Notifications** | Push (OneSignal), email (Resend), WhatsApp |
| 🛡️ **Multi-tenant** | Role-based access (admin, personal, student) |
| 📈 **Analytics** | CF Analytics Engine + GA4 |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    VFIT Platform                      │
├──────────────┬───────────────────────────────────────┤
│   Frontend   │  Next.js 15 · Tailwind v4 · Zustand  │
│              │  TanStack Query · Static Export       │
├──────────────┼───────────────────────────────────────┤
│   Backend    │  Hono.js v4 · Cloudflare Workers      │
│              │  ~150 endpoints · JWT auth             │
├──────────────┼───────────────────────────────────────┤
│   Database   │  Neon PostgreSQL 17 (26 tables)       │
│              │  D1 SQLite (5 tables cold data)       │
├──────────────┼───────────────────────────────────────┤
│   Storage    │  R2 (files) · KV (cache/sessions)     │
│              │  CF Stream (video HLS) · Image Resize │
├──────────────┼───────────────────────────────────────┤
│   Services   │  Asaas · Stripe · OneSignal · Resend  │
│              │  Replicate · Sentry · GA4             │
└──────────────┴───────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Clone
git clone git@github.com:NOVO_USERNAME/vfit.git
cd vfit

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in your secrets

# Development
npm run dev          # Frontend (localhost:3000)
npm run wrangler:dev # Backend  (localhost:8787)

# Build & Deploy
npm run cf:deploy    # Full pipeline: build → version bump → deploy → git push
```

## 📂 Project Structure

```
├── src/                 # Next.js frontend (App Router)
│   ├── app/             # Pages & layouts (48 pages, 5 layouts)
│   ├── components/      # React components
│   ├── hooks/           # TanStack Query hooks (76 hooks)
│   ├── stores/          # Zustand stores
│   └── lib/             # Client utilities
├── workers/             # Cloudflare Workers backend
│   ├── api/             # Route handlers (17 sub-routers)
│   ├── middleware/       # Auth, CORS, rate-limit
│   └── schemas/         # Zod validation schemas
├── lib/                 # Shared server utilities
├── config/              # Constants, plans, AI models
├── migrations/          # SQL migrations (Neon + D1)
├── scripts/             # Deploy, backup, maintenance
├── docs/                # Technical documentation
├── twa/                 # Android TWA (Trusted Web Activity)
└── tests/               # Vitest unit tests (360+ tests)
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run smoke:auth:local # Auth smoke tests
```

## 📦 Deploy

```bash
npm run cf:deploy                # patch bump + build + deploy
npm run cf:deploy:minor          # minor version bump
npm run cf:deploy:major          # major version bump
npm run cf:deploy:dry            # dry run (simulate)
```

## 📖 Documentation

| Doc | Content |
|-----|---------|
| [Backend API](docs/BACKEND.md) | All ~150 endpoints |
| [Design System](docs/DESIGN-SYSTEM-COLORS.md) | Colors, WCAG contrast |
| [Infrastructure](docs/INFRAESTRUTURA-CF.md) | CF bindings, secrets |
| [Changelog](docs/CHANGELOG.md) | Deploy history |

## 🛡️ Security

- JWT with HMAC-SHA256 (Web Crypto API)
- bcryptjs cost 12 for passwords
- Cloudflare Turnstile (bot protection)
- Rate limiting per endpoint
- TOTP 2FA support
- CORS whitelist
- Secure headers (CSP, HSTS, etc.)

---

<div align="center">

**Built with ❤️ for Personal Trainers**

© 2026 VFIT. All rights reserved.

</div>
```

---

## 10. Checklist Go/No-Go

### ANTES de executar:

| # | Item | Status |
|---|------|--------|
| 1 | Nova conta GitHub criada e autenticada | ⬜ |
| 2 | SSH key ou PAT configurado | ⬜ |
| 3 | Backup local criado | ⬜ |
| 4 | Produção estável (sem deploys pendentes) | ⬜ |
| 5 | Todos os secrets anotados/salvos | ⬜ |
| 6 | Aprovação do plano (este documento) | ⬜ |

### DEPOIS de executar:

| # | Item | Status |
|---|------|--------|
| 7 | Repo novo com 1 commit | ⬜ |
| 8 | Build passa localmente | ⬜ |
| 9 | 360/360 testes passam | ⬜ |
| 10 | API health check OK | ⬜ |
| 11 | Frontend carrega OK | ⬜ |
| 12 | Login/logout funciona | ⬜ |
| 13 | README renderiza no GitHub | ⬜ |
| 14 | Zero refs ao projeto antigo | ⬜ |
| 15 | Deploy pipeline funciona | ⬜ |

---

## 11. Rollback

### Se algo der errado:

```bash
# 1. Voltar para o backup
cd /Users/macos/Development/apps
rm -rf personal-ia-prod
cp -r personal-ia-prod-BACKUP-FINAL personal-ia-prod
cd personal-ia-prod

# 2. Restaurar remote antigo
git remote add origin https://github.com/vts-development/personal-ia.git

# 3. Restaurar credenciais antigas
git config --global user.name "vts dev"
git config --global user.email "vts@victor.pt"

# 4. Verificar
git log --oneline -3
git remote -v
```

### CF Rollback:
```
1. Dashboard → Workers → personaliai-api → Re-enable
2. Dashboard → Pages → evoluia → Resume
3. Remover rotas do novo Worker/Pages
```

> O rollback é **instantâneo** porque o backup local tem TUDO e os recursos CF antigos
> ficam desabilitados (não deletados) por 1 semana.

---

## ⏱️ Timeline Estimada

| Fase | Tempo | Descrição |
|------|-------|-----------|
| FASE 1 | 5 min | Preparação local |
| FASE 2 | 10 min | Git logout/login |
| FASE 3 | 5 min | Repo novo + push |
| FASE 4 | 30-60 min | Infra CF (pode postergar) |
| FASE 5 | 15 min | Validação |
| FASE 6 | — | Pós-migração (48h depois) |
| **TOTAL** | **~45-90 min** | Sem contar FASE 4 CF |

---

## 🔑 DECISÕES PENDENTES (Preciso da sua resposta)

1. **Username da nova conta GitHub?**
2. **Email da nova conta?**
3. **Repo público ou privado?**
4. **SSH ou HTTPS para autenticação?**
5. **Quer fazer a FASE 4 (CF infra) agora ou depois?**
6. **Quer renomear a pasta local para `vfit`?**
7. **Quer manter os GitHub Actions (CI/CD)?**
8. **O grupo WhatsApp já foi renomeado para VFIT?**

---

> **⚠️ ESTE PLANO NÃO SERÁ EXECUTADO ATÉ RECEBER SEU "OK" EXPLÍCITO.**  
> **Responda as perguntas acima e diga "OK" para iniciar.**
