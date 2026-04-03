# Incident Rollback Runbook — API, Pages, DB, Secrets

> Última atualização: 2026-02-22
> Objetivo: reduzir MTTR com resposta padronizada, segura e auditável.

---

## 1) Princípios operacionais

- **Segurança primeiro:** conter impacto antes de restaurar feature.
- **Rollback mínimo e reversível:** mudar só o necessário para restaurar serviço.
- **Rastreabilidade obrigatória:** registrar responsável, horário, evidências e decisão.
- **Sem ações destrutivas sem confirmação explícita.**

---

## 2) Classificação de incidente

| Severidade | Definição | Meta de resposta |
|---|---|---|
| P0 | indisponibilidade ou erro crítico em fluxo de receita/auth | iniciar contenção em até 5 min |
| P1 | degradação severa sem indisponibilidade total | iniciar contenção em até 15 min |
| P2 | impacto parcial com workaround | tratar no ciclo planejado |

---

## 3) Checklist universal (aplica a qualquer incidente)

1. Congelar mudanças em curso (sem deploy paralelo).
2. Coletar evidências iniciais:
	- `request_id`/`test_run_id`/logs relevantes;
	- horário do início do impacto;
	- escopo (API, frontend, DB, segredo, externo).
3. Escolher trilha de rollback (seções 4–7).
4. Executar validação pós-rollback (seção 8).
5. Registrar no `CHANGELOG` + documento técnico afetado na mesma sessão.

---

## 4) Runbook — API (Workers)

### Sinais comuns
- erro 5xx em endpoints críticos (`/auth`, `/payments`, `/chat`);
- aumento de timeout/latência após release;
- regressão funcional sem mudança de infra frontend.

### Ação de rollback
1. Verificar última release estável (tag/version).
2. Executar rollback do pacote estável via pipeline oficial de deploy.
3. Confirmar health e rotas críticas.

### Validação mínima
- `GET /health` responde estável;
- smoke autenticado sem erro crítico (`npm run smoke:auth` em janela controlada);
- erros P0 cessaram nos logs.

---

## 5) Runbook — Frontend (Pages)

### Sinais comuns
- quebra visual/funcional pós build;
- páginas críticas indisponíveis, mas API saudável.

### Ação de rollback
1. Republicar versão estável anterior do frontend (pipeline oficial).
2. Validar rotas críticas de dashboard e checkout.
3. Confirmar que assets e SW não mantêm artefato inválido em cache.

### Validação mínima
- carregamento de login/dashboard sem erro de runtime;
- checkout e páginas críticas com navegação funcional;
- banner offline/update sem comportamento anômalo.

---

## 6) Runbook — Banco de dados

### 6.1 Neon/PostgreSQL

### Sinais comuns
- erro de migration em produção;
- query crítica quebrada por alteração de schema.

### Ação de rollback
1. Interromper novas migrations.
2. Avaliar rollback lógico (feature flag/compat query) antes de rollback físico.
3. Se necessário, seguir runbook dedicado de restore:
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-RUNBOOK.md](docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-RUNBOOK.md)
4. Validar integridade com queries mínimas e smoke funcional.

### 6.2 D1/KV

### Sinais comuns
- dados de apoio indisponíveis/inconsistentes;
- falha em lookup/cache crítico.

### Ação de rollback
1. Restaurar snapshot recente (`npm run cf:backup` como referência histórica).
2. Reaplicar schema estável quando necessário.
3. Validar leitura/escrita dos fluxos dependentes.

---

## 7) Runbook — Secrets/credenciais

### Sinais comuns
- autenticação externa falhando após rotação;
- suspeita de exposição de token/chave.

### Ação de rollback/rotação
1. Revogar credencial comprometida imediatamente.
2. Reemitir segredo e atualizar bindings seguros.
3. Validar integrações (`auth`, `payments`, `email`, `push`, `ia`).
4. Executar drill de recuperação quando aplicável:
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-RECOVERY-DRILL.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-RECOVERY-DRILL.generated.md)

### Referência de login seguro Wrangler
- [docs/CF-OPERATIONS.md](docs/CF-OPERATIONS.md)
- [docs/INFRAESTRUTURA-CF.md](docs/INFRAESTRUTURA-CF.md)

---

## 8) Gate de saída do incidente

Só encerrar incidente quando todos os itens abaixo forem verdadeiros:

- [ ] health check estável
- [ ] fluxo crítico impactado validado manualmente
- [ ] sem erro P0/P1 novo por janela mínima de observação
- [ ] documentação atualizada (`CHANGELOG` + doc técnico)
- [ ] ação preventiva registrada (evitar recorrência)

---

## 9) Template de registro rápido

| Campo | Valor |
|---|---|
| Incidente ID | `INC-AAAA-MM-DD-XX` |
| Severidade | P0 / P1 / P2 |
| Início | ISO timestamp |
| Detecção | alerta / usuário / log |
| Escopo | API / Pages / DB / Secrets |
| Ação aplicada | rollback/rotação/mitigação |
| Responsável | nome |
| Evidências | request_id, test_run_id, logs |
| Status final | resolvido / monitorando |
