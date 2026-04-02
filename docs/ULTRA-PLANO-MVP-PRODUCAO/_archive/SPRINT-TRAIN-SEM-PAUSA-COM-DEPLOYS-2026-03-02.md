# Sprint Train — Sem Pausa, com Deploys Incrementais (até 02/03/2026)

> Status: plano executivo de execução contínua  
> Janela: 26/02 → 02/03  
> Regra: **cada sprint termina com gate + deploy (ou bloqueio documentado)**.

---

## 1) Decisão executiva

Sim: vamos operar em **sprint train contínua**, sem pausas longas, com entregas curtas e deploy incremental.

### Princípios da sprint train
1. Sprint curta (4–8h úteis por trilha)
2. Gate técnico obrigatório antes de deploy
3. Deploy apenas via script oficial
4. Rollback definido antes de publicar
5. Documentação na mesma sessão

---

## 2) Estrutura das sprints (até segunda)

## Sprint A — Compliance Core (CPF/CREF + cadastro)

### Status operacional
- Gate: ✅ verde
- Deploy patch: ✅ concluído em produção via retry
- Versão publicada: **v3.7.3**
- Evidência operacional WhatsApp:
	- start: `2026-02-27T01:43:20.642Z`
	- end: `2026-02-27T01:50:36.691Z`
	- retry start: `2026-02-27T06:04:30.168Z`
	- retry end: `2026-02-27T06:06:09.753Z`

### Escopo
- CPF obrigatório e único global
- CREF obrigatório
- aluno sem vínculo inicial + vínculo posterior

### Gate de saída
- `smoke:auth:local` ✅
- `quality:ci` ✅
- `ops:go-no-go` ✅

### Deploy
- `node scripts/cf-deploy.js patch --msg "sprint A: compliance core cpf/cref"`
- tentativa executada com mensagem atualizada:
	- `node scripts/cf-deploy.js patch --msg "sprint A: compliance core cpf/cref + student link"`

### Rollback
- hotfix patch imediato + reversão controlada de validações não-críticas

---

## Sprint B — Afiliados aluno + Simulação Super Admin

### Status operacional
- 🟢 Sprint B com patch publicado
- ✅ Checkpoint 1 implementado (simulação super admin — backend)
- ✅ Checkpoint UX Treinos publicado (v3.7.4)
- ✅ Checkpoint 2 implementado (simulação super admin — UI admin)
- ✅ Checkpoint inicial de afiliados para aluno (backend metadata + métrica admin)
- ✅ Deploy patch publicado: **v3.7.5**

### Escopo
- afiliados para alunos
- alternância de modo super admin (Aluno/Personal/Super Admin)

### Checklist técnico Sprint B
- [x] Definir checkpoint inicial
- [x] Implementar `GET /api/v1/admin/simulation/session`
- [x] Implementar `POST /api/v1/admin/simulation/session`
- [x] Persistir sessão em `KV_SESSIONS` com auditoria best-effort
- [x] Validar `npm run type-check:workers`
- [x] Publicar atalhos operacionais de Treinos + bibliotecas (exercícios/mídias)
- [x] Validar smoke autenticado pós-deploy (`8 passed / 0 failed`)
- [x] Integrar UI admin ao contexto de simulação
- [x] Implementar primeiro checkpoint de afiliados para aluno

### Próximo bloco Sprint B (fechamento)
- [x] Exibir métrica `student_referrals` na UI admin de afiliados/pagamentos
- [x] Executar gate completo da Sprint B (`smoke:auth:local`, `quality:ci`, `ops:go-no-go`)
- [x] Publicar patch de Sprint B

### Incremental pós Sprint B (UX operacional)
- [x] Adicionar botão `Novo Aluno` na aba Alunos para facilitar cadastro rápido
- [x] Publicar incremental em produção (`v3.7.6`)

### Gate de saída
- testes de autorização + qualidade completa

### Deploy
- `node scripts/cf-deploy.js patch --msg "sprint B: afiliados aluno + admin simulation"`

### Rollback
- desabilitar modo simulação por feature flag/guard + manter trilha de auditoria

---

## Sprint C — SEO Lote 1 + noindex global

### Status operacional
- ✅ Sprint C concluída
- ✅ Deploy patch publicado: **v3.7.7**

### Entregas
- noindex global temporário aplicado (`metadata.robots` + `robots.txt`)
- lote 1 de páginas SEO institucionais publicado em `/blog/*`
- sitemap atualizado com novas páginas

### Escopo
- publicar lote 1 de páginas SEO
- manter tudo não indexável até gate final de segunda

### Gate de saída
- validação de metadata + robots/sitemap + quality

### Deploy
- `node scripts/cf-deploy.js patch --msg "sprint C: seo lote 1 noindex"`

### Rollback
- rollback de rotas SEO novas mantendo core intacto

---

## Sprint D — Unipile Agents Base (Workers)

### Status operacional (checkpoint atual)
- ✅ Implementação base concluída no código (router + schemas + service + bindings)
- ❌ Gate completo bloqueado por `smoke:auth:local` com tokens `SMOKE_*` expirados
- ✅ `quality:ci` aprovado
- ✅ `ops:go-no-go` atualizado
- ⛔ Deploy em produção bloqueado até renovação dos tokens de smoke autenticado

### Escopo
- base de agentes Instagram (post/DM/comments/atendimento)
- limites de segurança + handoff humano

### Gate de saída
- smoke técnico de rotas/handlers + quality

### Deploy
- `node scripts/cf-deploy.js patch --msg "sprint D: unipile agents base"`

### Rollback
- kill-switch operacional dos agentes + fallback manual

---

## Sprint E — SEO Lote 2 + hardening final

### Status operacional (checkpoint 27/02)
- ✅ Sprint de observabilidade/release executada
- ✅ PWA com revalidação silenciosa em background (sem banner de update)
- ✅ Deploy patch publicado: **v3.7.8**
- ✅ Sprint E.1 iniciada (QA real-device + hardening visual final)
- ✅ Gate completo reexecutado com sucesso (`ops:release:gate`)
- 🟡 Checklist manual em device real aberto:
	- [SPRINT-E1-QA-REAL-DEVICE-CHECKLIST-2026-02-27.md](SPRINT-E1-QA-REAL-DEVICE-CHECKLIST-2026-02-27.md)
- ✅ Sprint E.2 em execução com hardening SEO/AEO/GEO (metadata + JSON-LD)
- ✅ noindex global mantido (metadata + robots) até fechamento total das pastas
- ✅ Tokens `SMOKE_*` renovados e gate completo aprovado (`ops:release:gate`)
- ✅ Deploy Sprint E.2 publicado: **v3.8.0**
- ✅ Incremental de hardening admin publicado: **v3.8.1**
	- simulação efetiva do super admin aplicada no contexto fora de `/admin`
	- notas privadas administrativas por usuário (`GET/PUT /api/v1/admin/users/:id/note`)
	- migration `0011_admin_account_notes.sql` aplicada com FKs UUID

### Escopo
- ampliar páginas SEO
- hardening técnico e observabilidade final

### Gate de saída
- quality + go/no-go pré-lançamento

### Deploy
- `node scripts/cf-deploy.js patch --msg "sprint E: seo lote 2 hardening"`

### Rollback
- remover lote incremental mais recente sem impactar páginas estáveis

---

## Sprint F — Launch Sprint (segunda)

### Escopo
- validação final
- liberação de indexação SEO após aprovação
- release final

### Gate final (obrigatório)
- `npm run smoke:auth:local`
- `npm run quality:ci`
- `npm run ops:go-no-go`
- checklist de documentação e operação

### Deploy final
- `node scripts/cf-deploy.js minor --msg "launch: redesign+pricing+seo+agents base"`

### Rollback
- plano de rollback por sprint anterior + freeze de novas mudanças por 24h

---

## 3) Cadência diária (sem pausa)

- Janela 1 (manhã): implementação principal
- Janela 2 (tarde): testes + ajustes
- Janela 3 (noite): gate + deploy + docs

Se gate falhar:
- bloquear deploy,
- corrigir no mesmo ciclo,
- registrar no changelog como sprint parcial.

---

## 4) Checklist operacional por sprint

- [ ] WhatsApp `start`
- [ ] Implementação da sprint
- [ ] `smoke:auth:local` (quando aplicável)
- [ ] `quality:ci`
- [ ] `ops:go-no-go`
- [ ] Deploy via `cf-deploy.js`
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Atualizar plano master e docs da trilha
- [ ] WhatsApp `end`

---

## 5) Espaço para ajustes reais (aberto)

### Ordem das sprints
- [A DEFINIR]

### Escopo exato por sprint
- [A DEFINIR]

### Critérios extras de aprovação
- [A DEFINIR]

### Regras de freeze de lançamento
- [A DEFINIR]

---

## 6) Próxima ação imediata

Executar **Sprint F (launch controlado)** em sequência imediata:

1. Rodar gate final completo (`smoke:auth:local`, `quality:ci`, `ops:go-no-go`)
2. Fechar pendências manuais do checklist real-device E.1 (ou registrar bloqueio formal)
3. Consolidar documentação ULTRA (status, versões, gates, evidências)
4. Seguir com deploy final somente com GO explícito
