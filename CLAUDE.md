# CLAUDE.md — VFIT

> **v1.0.2** · SaaS para Personal Trainers · 02/04/2026
> Usuários: `personal` (treinador), `student` (aluno), `admin`.
> Planos: `trial` | `pro` | `max`. Versão: `lib/version.ts` / `package.json`.

---

## 📖 Documentação Centralizada

> **TODA a documentação técnica está em `.claude/docs/`.** Leia antes de agir.

| Arquivo | Conteúdo |
|---------|----------|
| `.claude/docs/RULES.md` | **19 regras críticas — NÃO VIOLAR** |
| `.claude/docs/STACK.md` | Stack, URLs, credenciais, mapa rápido do projeto |
| `.claude/docs/CONVENTIONS.md` | Imports, TypeScript, CSS/Tailwind v4, auth guard |
| `.claude/docs/DEPLOY.md` | Deploy pipeline, WhatsApp operacional, smoke auth |
| `.claude/docs/DESIGN-SYSTEM.md` | Cores WCAG, Button, DSIcon, tokens CSS |
| `.claude/docs/BACKEND-MAP.md` | Endpoints, schemas, DB helpers |
| `.claude/docs/MIGRATION-CONTEXT.md` | Migração personal-ia → vfit (02/04/2026) |

## 📚 Docs Detalhados (referência expandida)

| Doc | Conteúdo |
|-----|----------|
| `docs/BACKEND.md` | Todos os ~150 endpoints completos |
| `docs/ASAAS-INTEGRATION.md` | API de pagamentos Asaas |
| `docs/INFRAESTRUTURA-CF.md` | Bindings Cloudflare completos |
| `docs/WHATSAPP-GATEWAY.md` | Gateway WhatsApp completo |
| `docs/DESIGN-SYSTEM-COLORS.md` | Paleta completa com contrastes |
| `docs/INDEX.md` | Índice de toda documentação |

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
