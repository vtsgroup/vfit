# 📋 vfit-domain-migration — Índice

> **Migração Completa: iapersonal.app.br → vfit.app.br**
> 
> Planejamento em engenharia: 679 referências, 163 arquivos, 5 sprints, 100% de cobertura.
> 
> **Status:** 🔵 Em planejamento | **Última atualização:** 2026-04-04

---

## 📂 Estrutura da Pasta

```
.claude/plans/vfit-domain-migration/
├── INDEX.md                    # Este arquivo — índice e entry point
├── README.md                   # Visão geral, motivação, risco/benefício
├── 01-ARCHITECTURE.md          # Design do plano, fluxos, diagrama
├── 02-DISCOVERY-INVENTORY.md   # Mapa completo das 679 referências
├── 03-SPRINT-PLAN.md           # 5 sprints em detalhe (tasks, deps, validação)
├── 04-ROLLOUT-STRATEGY.md      # Fase de execução, rollback, comunicação
├── TRACKING.md                 # Progresso em tempo real (updated durante execução)
└── VALIDATION-CHECKLIST.md     # Testes finais, smoke tests, SLAs
```

---

## 🎯 Objetivos

1. **Migrar 100% das referências** de `iapersonal.app.br` → `vfit.app.br` sem downtime
2. **Manter compatibilidade backward** com apps legados (fallbacks em `iapersonal.pages.dev`)
3. **Preservar funcionalidade crítica** (WebAuthn, OAuth, email, push)
4. **Documentar toda mudança** de infra para auditoria + compliance

---

## ✅ Checklist de Leitura

**OBRIGATÓRIO antes de executar qualquer task:**
- [ ] Ler `README.md` (contexto + risk assessment)
- [ ] Ler `01-ARCHITECTURE.md` (fluxos de trabalho)
- [ ] Ler `02-DISCOVERY-INVENTORY.md` (mapa de refs)
- [ ] Ler `03-SPRINT-PLAN.md` (detalhes de cada sprint)
- [ ] Ler `04-ROLLOUT-STRATEGY.md` (execução + comunicação)

**ANTES DE CADA SPRINT:**
- [ ] Revisar seção correspondente em `03-SPRINT-PLAN.md`
- [ ] Verificar `TRACKING.md` para status atual
- [ ] Rodar validação de Sprint N em `VALIDATION-CHECKLIST.md`

---

## 📊 Resumo de Escopo

| Métrica | Valor |
|---------|-------|
| **Referências totais** | 679 |
| **Arquivos afetados** | 163 |
| **Sprints planejados** | 5 |
| **Duração estimada** | ~2-3 semanas (com parallelização) |
| **Risco crítico** | Médio (WebAuthn rpId + email) |
| **Requer downtime?** | Não (zero-downtime migration) |

---

## 🚀 Quick Start

### Para ler o plano
1. Comece aqui (`INDEX.md`)
2. Leia `README.md` para contexto
3. Leia `01-ARCHITECTURE.md` para design
4. Leia `03-SPRINT-PLAN.md` para tarefas específicas

### Para executar o plano
1. Crie branch: `git checkout -b feat/domain-migration-vfit-app-br`
2. Siga `03-SPRINT-PLAN.md` sequencialmente
3. Atualize `TRACKING.md` após cada task completada
4. Rode validações em `VALIDATION-CHECKLIST.md`
5. Crie PR com `[domain-migration]` no título

---

## 📍 Sprint Overview

| Sprint | Foco | Tasks | Status |
|--------|------|-------|--------|
| **Sprint 1** | Infra CF + Config | 8 tasks (Workers, Pages, consts, env) | ⏳ Pending |
| **Sprint 2** | Backend handlers | 12 tasks (passkeys, auth, emails, webhooks) | ⏳ Pending |
| **Sprint 3** | Frontend + Pages | 18 tasks (hardcodes, links, metadata) | ⏳ Pending |
| **Sprint 4** | CDN + Media | 6 tasks (R2, Images, Videos, WhatsApp) | ⏳ Pending |
| **Sprint 5** | TWA + Mobile | 4 tasks (manifest, keystore, deep linking) | ⏳ Pending |
| **Pós-Sprint** | Validação + Rollout | Smoke tests, rollback plan, go-live | ⏳ Pending |

---

## ⚠️ Riscos Críticos

1. **WebAuthn rpId invalidation** — Passkeys existentes quebram se rpId mudar
   - Mitigação: Dual-write com fallback, comunicação de user
   
2. **Email deliverability** — SPF/DKIM/DMARC não configurados
   - Mitigação: Testar email antes de go-live, status page
   
3. **OAuth redirect URIs** — Provedores (Google, GitHub) rejeitam URIs novos
   - Mitigação: Update provider config antes de deploy

4. **Passkeys antigos** — Usuários com passkey não conseguem fazer login
   - Mitigação: Recovery flow via email, fallback password

---

## 🔗 Links de Contexto

- **CLAUDE.md** — Instruções do projeto
- **STACK.md** — Infra técnica (workers, BD, domínios atuais)
- **DEPLOY.md** — Pipeline de deploy + validação
- **TWA-DOCUMENTATION.md** — Configuração Android

---

## 📞 Questões?

Para dúvidas sobre:
- **Arquitetura** → Leia `01-ARCHITECTURE.md`
- **Tarefas específicas** → Leia `03-SPRINT-PLAN.md`
- **Validação** → Leia `VALIDATION-CHECKLIST.md`
- **Histórico de mudanças** → Veja `TRACKING.md`

---

**Última atualização:** 2026-04-04 17:30 GMT-3
**Próximo milestone:** Sprint 1 kickoff
