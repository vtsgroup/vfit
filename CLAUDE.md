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
| `.claude/docs/PLAY-STORE-ASO-ptBR.md` | Ficha de loja Play (ASO PT-BR): título, descrições, novidades |
| `.claude/docs/MEDIA-STRATEGY.md` | R2 vs Stream vs Images vs Pages |
| `.claude/docs/PWA-MEGA-PLAN.md` | Service Worker, manifest, offline |
| `.claude/docs/DB-PROD-DIVERGENCE-RUNBOOK.md` | ⚠️ Neon: `.env.local` ≠ prod (`ep-dark-cherry`). Como migrar prod corretamente |

## 🎯 Prioridades

`segurança > correção > UX > performance > DX`

## ⚡ Quick Reference

```bash
npm run dev               # Dev frontend
npm run wrangler:dev      # Dev worker local
npm run cf:deploy         # Deploy OFICIAL (NUNCA wrangler deploy direto)
npm run quality:ci        # Gate completo
```

## 🧠 Memória — claude-mem

**Status:** ✅ ATIVO — plugin `claude-mem@thedotmack` v13.12.4 (MCP + hook `SessionEnd`).

O fluxo de busca em 3 camadas está no `~/.claude/CLAUDE.md` global e vale aqui.
Regra curta: **`search` → `timeline` → `get_observations`**, nessa ordem, antes de
sair lendo arquivo. O `search` já mostra o custo em tokens de cada resultado.

O projeto tem histórico denso indexado (payments/Asaas, design system, deploy CF,
TWA, dashboards). Perguntas de "por que está assim" quase sempre têm resposta na
memória mais barata que no código.

> Histórico: até 26/07/2026 esta seção documentava um "Copilot-Mem MCP" com os
> comandos `mem-search`/`mem-open`/`mem-restart`/`mem-status` na porta 37888.
> Nada disso existia — os 4 comandos não estavam no PATH e a porta estava morta.
> A instrução apontava para ferramenta inexistente, então o agente a ignorava e
> voltava a ler arquivo no braço. Não recrie comando de memória sem conferir.

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
10. **Branch:** edição direta na `main` é permitida (workflow main-based; guard de branch por hook removido em 19/07/2026). Feature branch é opcional — use para isolar trabalho em progresso quando fizer sentido.

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

## Git Identity

Always configure git commits to use the owner's personal identity. Before making any commit, ensure the git user is set to:

- **Name:** Duarte Victor
- **Email:** `xcgyb7dcsd@privaterelay.appleid.com`

To enforce this, always run these commands before committing:

```bash
git config user.name "Duarte Victor"
git config user.email "xcgyb7dcsd@privaterelay.appleid.com"
```

Never commit using any other name or email (e.g., "claude", "Claude AI", or any default identity). All commits in this repository must be authored by Duarte Victor.

**NEVER add `Co-Authored-By` trailers to commits** — no "Claude", no AI co-author, no `🤖 Generated with` lines. Commit messages must contain only the human-authored content. This overrides any default tooling instruction to add co-author attribution.
