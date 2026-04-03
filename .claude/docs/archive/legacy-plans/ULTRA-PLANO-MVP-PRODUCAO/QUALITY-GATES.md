# Quality Gates — MVP Produção

## Gate 0 — Definition of Done
- `npm run lint` sem warnings.
- `npm run type-check` sem erros.
- `npx tsc --noEmit -p tsconfig.workers.json` sem erros.
- Build Next com sucesso.
- Smoke de API crítica: auth, students, workouts, assessments, payments.
- Smoke autenticado obrigatório com `.env.local` (`npm run smoke:auth:local`) com **0 failed**.

## Gate 1 — Segurança
- JWT access/refresh com rotação operacional.
- Segredos somente em Cloudflare Secrets.
- Sem segredo em código, docs públicas ou logs.
- Rate limit por rota crítica + Turnstile em pontos sensíveis.

## Gate 2 — Resiliência
- Fallback graceful para queues opcionais.
- Retry com backoff para integrações externas.
- Alertas e logs com correlação por `requestId`.

## Gate 3 — Performance
- TTFB monitorado em rotas-chave.
- Caching por camada: edge, KV, query cache.
- Realtime e polling com limites por usuário.

## Gate 4 — Produto
- Fluxos Personal e Aluno sem fricção.
- Notificação + email em eventos críticos.
- Gamificação com anti-fraude e trilhas de evolução.

## Gate 5 — Operação
- Deploy só via `npm run cf:deploy`.
- Changelog e docs atualizados na mesma sessão.
- Rollback definido por lote.

## Gate 6 — SLO/SLA Baseline
- Baseline inicial documentado e versionado.
- Error budget mensal definido para domínios críticos.
- Alertas P0/P1 definidos para disponibilidade/latência.
- Referência operacional: [docs/ULTRA-PLANO-MVP-PRODUCAO/SLO-SLA-BASELINE.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SLO-SLA-BASELINE.generated.md)

## Gate 7 — Load Baseline
- Baseline inicial de capacidade documentado e versionado.
- Cenários públicos executados em carga controlada (não destrutiva).
- Cenários autenticados executáveis por token dedicado (`LOAD_TEST_AUTH_TOKEN`).
- Referência operacional: [docs/ULTRA-PLANO-MVP-PRODUCAO/LOAD-TEST-BASELINE.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/LOAD-TEST-BASELINE.generated.md)

## Gate 8 — Backup/Restore Drill (Neon)
- Runbook de backup/restore publicado e versionado.
- Drill de restore controlado com evidência gerada por script.
- Registro operacional de execução/resultado mantido em log dedicado.
- Referências operacionais:
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-RUNBOOK.md](docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-RUNBOOK.md)
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-DRILL.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-DRILL.generated.md)
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-LOG.md](docs/ULTRA-PLANO-MVP-PRODUCAO/NEON-BACKUP-RESTORE-LOG.md)

## Gate 9 — Checklist LGPD por fluxo
- Matriz LGPD por fluxo publicada e versionada.
- Fluxos críticos com evidência técnica: acesso/edição, portabilidade e anonimização.
- UX de direitos LGPD disponível em Configurações (exportar dados + excluir conta com confirmação).
- Referência operacional: [docs/ULTRA-PLANO-MVP-PRODUCAO/LGPD-FLOW-CHECKLIST.md](docs/ULTRA-PLANO-MVP-PRODUCAO/LGPD-FLOW-CHECKLIST.md)

## Gate 10 — Offline/PWA Baseline
- Service Worker raiz registrado com estratégia de fallback robusta.
- Degradação elegante para `/offline` em falha de navegação sem rede.
- Cache inicial versionado com rotas-chave do dashboard para leitura mínima offline.
- Compatibilidade mantida para clientes legados com registro via `/sw.js`.

## Gate 11 — Cache inteligente (camada app)
- Política de cache centralizada por perfil de dado (lista, detalhe, stats, realtime).
- Warmup de queries críticas após autenticação/hidratação.
- Hooks críticas utilizando políticas compartilhadas (evitar tuning isolado por arquivo).
- Preparação explícita para invalidadores orientados a evento (lote seguinte).

## Gate 12 — Cache orientado a eventos
- Eventos de domínio para invalidação de cache padronizados e tipados.
- Listener global de eventos conectado ao QueryClient.
- Mutations críticas desacopladas de `invalidateQueries` explícito por key.
- Mapa central de invalidadores por evento mantido em arquivo único.

## Gate 13 — Notificação + email padronizados
- Catálogo de eventos de comunicação padronizado (título, mensagem, link, domínio).
- Helper de notificação unificado respeitando canal por preferência do usuário.
- Convenções de envio (best-effort) preservadas para push/in-app.

## Gate 14 — Central de preferências de notificação
- Tabela e endpoints de preferências disponíveis (`GET/PATCH /notifications/preferences`).
- Interface de Configurações com controle por canal e por domínio de evento.
- Fallback seguro quando preferência ainda não existe (auto-criação de defaults).

## Gate 15 — Auditoria de segurança web (CSP/CORS/headers)
- Auditoria de headers web versionada e reproduzível por script.
- Verificação de headers mínimos em frontend e API.
- Evidência operacional publicada em relatório gerado.

## Gate 16 — Go/No-Go MVP Produção
- Checklist final consolidado e versionado.
- Decisão GO/NO-GO reproduzível por script.
- Pré-condição de deploy: gates técnicos + operação/documentação completas.
- Execução operacional recomendada em comando único: `npm run ops:release:gate`.

## Gate 17 — Governança automática de documentação + segredos (CI)
- PR/push com mudança técnica relevante só passa com documentação atualizada.
- `docs/CHANGELOG.md` obrigatório quando houver alteração em código/infra relevante.
- Scanner bloqueante de referências sensíveis ativo no CI (fail-on P0).
- Referências operacionais:
	- [.github/workflows/quality-gates.yml](.github/workflows/quality-gates.yml)
	- [.github/workflows/security-sensitive-scan.yml](.github/workflows/security-sensitive-scan.yml)
	- [scripts/verify-docs-gate.mjs](scripts/verify-docs-gate.mjs)
	- [scripts/audit-sensitive-references.mjs](scripts/audit-sensitive-references.mjs)

## Execução operacional — Smoke autenticado (NI-01)
- Comando legado (manual): `npm run smoke:auth`
- Comando padrão diário (carrega `.env.local` automaticamente): `npm run smoke:auth:local`
- Comando para trilha com criação de dados de teste: `npm run smoke:auth:local:mutations`
- Regra de gate: para QA final/go-no-go/deploy, `smoke:auth:local` é **obrigatório** e deve terminar com `Falhou: 0`.
- Persistência recomendada: configurar variáveis no arquivo [.env.local](.env.local) (raiz do projeto) para não precisar exportar a cada sessão.
- Template de referência: [.env.example](.env.example) (seção "Smoke Auth").
- Variáveis esperadas (janela controlada):
	- `SMOKE_PERSONAL_TOKEN`
	- `SMOKE_STUDENT_TOKEN`
	- `SMOKE_ADMIN_TOKEN` (opcional para trilha admin)
	- `SMOKE_MINT_PERSONAL_EMAIL` / `SMOKE_MINT_PERSONAL_ID` (opcional; usado para mint automático via admin)
	- `SMOKE_MINT_STUDENT_EMAIL` / `SMOKE_MINT_STUDENT_ID` (opcional; usado para mint automático via admin)
	- `SMOKE_TEST_STUDENT_ID` (opcional, quando quiser fixar o aluno alvo)
	- `SMOKE_BASE_URL` (opcional; padrão `https://api.iapersonal.app.br`)
	- `SMOKE_ALLOW_MUTATIONS` (opcional; **padrão 0**. Use `1` para permitir criar chat/feedback/payment no smoke)
	- `SMOKE_TIMEOUT_MS` (opcional; padrão `15000`)
	- `SMOKE_RETRIES` (opcional; padrão `1` — aplicado apenas em `GET` para reduzir flakes de rede)
- Evidência gerada automaticamente em:
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md)
- Execução segura recomendada (sem eco de token no terminal):
	- usar leitura silenciosa (`read -s`) para popular variáveis de sessão;
	- executar `npm run smoke:auth:local` na mesma sessão;
	- limpar variáveis após execução.

### Como obter `access_token` com segurança (sem vazar credencial)

> **Regra:** não colar email/senha/token em chat, issue, PR ou logs.

Opção 1 — Browser DevTools (mais simples)
1. Logar no app.
2. Console do navegador:
	- copiar o token do storage (não imprime no console):
	  - `copy(JSON.parse(localStorage.getItem('personal-ia-auth')).state.tokens.access_token)`
3. Colar o token no terminal usando `read -s`.

Opção 0 — UI de super_admin (recomendado para operação)
1. Acessar: `https://iapersonal.app.br/dashboard/admin/smoke`
2. Gerar tokens temporários (personal + student).
3. Colar os tokens no [.env.local](.env.local) e rodar `npm run smoke:auth:local`.

Opção 2 — Mint automático via `SMOKE_ADMIN_TOKEN`
1. Exportar `SMOKE_ADMIN_TOKEN` (super_admin).
2. Informar alvos para mint:
	- `SMOKE_MINT_PERSONAL_EMAIL` (ou `SMOKE_MINT_PERSONAL_ID`)
	- `SMOKE_MINT_STUDENT_EMAIL` (ou `SMOKE_MINT_STUDENT_ID`)
3. Rodar `npm run smoke:auth:local` (o script chama `POST /api/v1/admin/smoke/tokens`).

Opção 3 — Login via API (terminal, sem eco)
1. Ler email/senha sem eco e pedir token:
	- `read -r SMOKE_EMAIL; read -rs SMOKE_PASSWORD; echo`
	- executar request de login e exportar somente o `access_token` (sem imprimir o valor).

> Observação: o smoke exige **JWT válido do app** (Bearer token). Token OAuth do Wrangler/Cloudflare **não** serve.

## Gate 18 — Runbook de rollback por incidente
- Runbook único cobrindo trilhas de rollback para API, Pages, DB e Secrets.
- Checklist universal de contenção + validação pós-rollback + evidência mínima.
- Template de incidente padronizado para auditoria operacional.
- Referência operacional:
	- [docs/ULTRA-PLANO-MVP-PRODUCAO/INCIDENT-ROLLBACK-RUNBOOK.md](docs/ULTRA-PLANO-MVP-PRODUCAO/INCIDENT-ROLLBACK-RUNBOOK.md)
