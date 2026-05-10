# CLAUDE.md — VFIT

> **v1.1.0** · SaaS para Personal Trainers · 03/04/2026
> Usuários: `personal` (treinador), `student` (aluno), `admin`.
> Planos: `trial` | `pro` | `max`. Versão: `lib/version.ts` / `package.json`.

---

## 📖 Documentação Centralizada

> **TODA a documentação técnica está em `.claude/docs/`.** Leia antes de agir.

| Arquivo | Conteúdo |
|---------|----------|
| `.claude/docs/RULES.md` | **19 regras críticas — NÃO VIOLAR** |
| `.claude/docs/STACK.md` | Stack, URLs, credenciais, infra CF, mapa rápido |
| `.claude/docs/CONVENTIONS.md` | Imports, TypeScript, CSS/Tailwind v4, auth guard |
| `.claude/docs/DEPLOY.md` | Deploy pipeline, CF operations, WhatsApp, smoke auth |
| `.claude/docs/DESIGN-SYSTEM.md` | Cores WCAG, contrastes, Button, DSIcon, tokens CSS |
| `.claude/docs/BACKEND.md` | Todos os ~150 endpoints + schemas + DB helpers |
| `.claude/docs/CHANGELOG.md` | Histórico de deploys e mudanças |

## 📚 Docs Detalhados (referência expandida)

| Doc | Conteúdo |
|-----|----------|
| `.claude/docs/ASAAS-INTEGRATION.md` | API de pagamentos Asaas |
| `.claude/docs/WHATSAPP-GATEWAY.md` | Gateway WhatsApp completo |
| `.claude/docs/TWA-DOCUMENTATION.md` | TWA: keystore, SHA-256, Play Store |
| `.claude/docs/MEDIA-STRATEGY.md` | R2 vs Stream vs Images vs Pages |
| `.claude/docs/PWA-MEGA-PLAN.md` | Service Worker, manifest, offline |

## 🎯 Prioridades

`segurança > correção > UX > performance > DX`

## ⚡ Quick Reference

```bash
npm run dev               # Dev frontend
npm run wrangler:dev      # Dev worker local
npm run cf:deploy         # Deploy OFICIAL (NUNCA wrangler deploy direto)
npm run quality:ci        # Gate completo
```

## 🧠 Memory System (Copilot-Mem MCP)

**Status:** ✅ **ATIVO** — v0.2.0 com 8 categorias VFIT capturadas

```bash
mem-search "VFIT <topic>"  # Buscar contexto de projeto
mem-open                   # Dashboard em localhost:37888/ui
mem-restart                # Reiniciar servidor MCP
mem-status                 # Ver status (port 37888)
```

**Categorias Capturadas:**
- Project Overview, Stack Architecture, Structure
- Database Schema (26 PostgreSQL + 5 D1 tables)
- API Endpoints (180+ rotas), Auth Flow
- Critical Rules, Code Conventions, Design System
- Infrastructure, Deployment & Operations

**Auto-Inject:** Quando pergunta sobre VFIT, sistema busca contexto automaticamente na memória → **30-40% economia de tokens**

## 🤖 Regras do Agente

1. **Leia `.claude/docs/RULES.md` PRIMEIRO** — contém todas as regras críticas
2. Leia o arquivo relevante ANTES de propor mudanças
3. Para workers → leia o endpoint existente primeiro
4. Para Design System → leia `.claude/docs/DESIGN-SYSTEM.md`
5. Planeje antes de modificar >3 arquivos
6. Ao terminar task significativa → atualize `.claude/session-state-vfit.md`
7. **NUNCA** deploy sem confirmação do usuário
8. **PODE ACESSAR** ler/escrever `.env` ou `.env.local`
9. WhatsApp: toda ação operacional exige start/end (ver `DEPLOY.md`)

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming -> invoke office-hours
- Bugs, errors, "why is this broken", 500 errors -> invoke investigate
- Ship, deploy, push, create PR -> invoke ship
- QA, test the site, find bugs -> invoke qa
- Code review, check my diff -> invoke review
- Update docs after shipping -> invoke document-release
- Weekly retro -> invoke retro
- Design system, brand -> invoke design-consultation
- Visual audit, design polish -> invoke design-review
- Architecture review -> invoke plan-eng-review
- Save progress, checkpoint, resume -> invoke checkpoint
- Code quality, health check -> invoke health
