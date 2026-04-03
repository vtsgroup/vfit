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

## 🤖 Regras do Agente

1. **Leia `.claude/docs/RULES.md` PRIMEIRO** — contém todas as regras críticas
2. Leia o arquivo relevante ANTES de propor mudanças
3. Para workers → leia o endpoint existente primeiro
4. Para Design System → leia `.claude/docs/DESIGN-SYSTEM.md`
5. Planeje antes de modificar >3 arquivos
6. Ao terminar task significativa → atualize `.claude/session-state-vfit.md`
7. **NUNCA** deploy sem confirmação do usuário
8. **NUNCA** ler/escrever `.env` ou `.env.local`
9. WhatsApp: toda ação operacional exige start/end (ver `DEPLOY.md`)
