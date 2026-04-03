# Contexto para Claude Code — Sessão Copilot 02/04/2026

> **Leia este arquivo ao iniciar sessão** — contém tudo que foi feito pelo GitHub Copilot.

---

## O que foi feito nesta sessão (Copilot + Opus 4.6)

### 1. Migração de Infraestrutura (concluída)

- Migrado de `victor-development/personal-ia` → `vtsgroup/vfit`
- Todos os recursos CF renomeados (Worker, Pages, D1, KV, R2, Hyperdrive)
- 42 erros TypeScript corrigidos
- Push para novo repo funcionando
- Deploy v1.0.1 (patch) + v1.0.2 (Turnstile + DNS fix)

### 2. Fixes de Produção (v1.0.2)

- **Turnstile**: `size: 'invisible'` não é válido na API → mudado para `size: 'compact'` com `appearance: 'interaction-only'` + `execution: 'execute'`
- **DNS**: `api.iapersonal.app.br` não tinha registro DNS (perdido na migração) → criado AAAA `100::` proxied
- **Service Worker**: limpeza de caches `personaliai-*` → comportamento esperado

### 3. Unificação de Documentação (PRINCIPAL)

**Problema resolvido:** Existiam 3 fontes de verdade divergentes:
- `CLAUDE.md` (395 linhas) — para Claude Code
- `.github/copilot-instructions.md` (615 linhas) — para Copilot
- `.claude/*.md` (3 arquivos, 1.866 linhas) — sprint/design/architecture

**Solução implementada (Opção A — Script de Sync):**

`.claude/docs/` é agora a **FONTE ÚNICA DE VERDADE**:

```
.claude/docs/
├── RULES.md              ← 19 regras críticas (merge de ambos os arquivos)
├── STACK.md              ← Stack, URLs, credenciais, mapa rápido
├── DESIGN-SYSTEM.md      ← Cores WCAG, Button, DSIcon, tokens
├── CONVENTIONS.md        ← Imports, TypeScript, CSS/Tailwind v4
├── DEPLOY.md             ← Deploy pipeline, WhatsApp, smoke auth
├── COST-OPTIMIZATION.md  ← Modelos/multiplicadores (Copilot-specific)
├── BACKEND-MAP.md        ← Endpoints, schemas, DB map
└── MIGRATION-CONTEXT.md  ← Contexto da migração
```

**Fluxo:**
1. Editar em `.claude/docs/*.md`
2. Executar `node scripts/sync-ai-docs.mjs`
3. `.github/copilot-instructions.md` é regenerado automaticamente
4. `CLAUDE.md` é um entry point slim (57 linhas) com ponteiros

**Arquivos movidos:**
- `.claude/vfit-sprint-breakdown.md` → `.claude/archive/` (sprint-specific)
- `.claude/vfit-design-system.md` — mantido (spec mobile React Native, não web)
- `.claude/vfit-component-architecture.md` — mantido (referência de arquitetura)
- `.claude/session-state-vfit.md` — mantido (session tracking)

---

## O que o Claude Code deve fazer agora

### Prioridade 1: Plano de Melhorias Visuais

O usuário quer que o Claude Code **planeje** melhorias visuais para a app web (Next.js).
Áreas potenciais:
- Design System v3 consolidation (o web usa um sistema, o mobile spec usa outro)
- Componentes UI que precisam de polish
- Landing page / páginas públicas
- Dashboard UX improvements
- Acessibilidade (WCAG AA compliance gaps)

### Prioridade 2: Melhorar a Documentação

A documentação em `.claude/docs/` foi criada como merge das docs existentes.
Pode ser melhorada:
- Adicionar mais exemplos de código
- Documentar padrões que faltam
- Criar docs para áreas não cobertas (ex: testing patterns, error handling)
- Revisar e atualizar informações desatualizadas em `docs/`

### Como funciona o workflow

1. **Claude Code planeja** → cria planos detalhados em `.claude/docs/` ou propõe ao usuário
2. **GitHub Copilot executa** → implementa as mudanças planejadas
3. **Após mudanças em docs:** executar `node scripts/sync-ai-docs.mjs` para sync

---

## Estado atual do projeto

- **Versão**: v1.0.2
- **Status**: Produção estável, pós-migração
- **Branch**: main
- **Todos os endpoints**: ✅ Healthy
- **Deploy**: Funcionando via `npm run cf:deploy`
- **WhatsApp**: Gateway com credenciais Unipile expiradas (401) — user vai resolver depois
- **Git**: Limpo, tudo committed

---

## Arquivos-chave para ler

1. `.claude/docs/RULES.md` — 19 regras críticas
2. `.claude/docs/STACK.md` — stack completa, mapa do projeto
3. `.claude/docs/CONVENTIONS.md` — padrões de código
4. `.claude/session-state-vfit.md` — estado do sprint/sessão
5. `docs/design-system/vfit-design-system-v3-docs.md` — spec visual v3

---

## Script de sync

```bash
# Gerar copilot-instructions a partir de .claude/docs/
node scripts/sync-ai-docs.mjs

# Verificar se está em sync (para CI)
node scripts/sync-ai-docs.mjs --check
```
