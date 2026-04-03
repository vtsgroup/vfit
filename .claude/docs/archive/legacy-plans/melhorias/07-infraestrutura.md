# Melhorias — Infraestrutura

> Itens de estabilidade, operação e confiabilidade do sistema.
> Alguns itens são pendências críticas da v6.8.2 — marcados com urgência.

---

## 1. Executar Migrations 0021–0024 no Neon

**Prioridade:** 🔴 Alta (urgente) | **Esforço:** P | **Sprint sugerida:** Imediato

**Problema:** As 4 migrations da v6.8.2 ainda não foram executadas no banco Neon de produção. O schema do banco está desatualizado em relação ao código em produção.

**Migrations pendentes:**

| Arquivo | Descrição | Risco |
|---|---|---|
| `0021_remove_facebook_auth.sql` | Remove colunas de autenticação Facebook | Baixo (remoção de coluna não usada) |
| `0022_vfit_b2c_core_tables.sql` | Tabelas core do módulo B2C | Alto (novas tabelas com FKs) |
| `0023_body_measurements.sql` | Tabela de medidas corporais | Médio (nova tabela) |
| `0024_self_assessments.sql` | Tabela de auto-avaliações | Médio (nova tabela) |

**Checklist de execução:**
- [ ] Criar branch do Neon para simular migration em staging
- [ ] Executar `0021` primeiro (remoção — sem dependências de FK)
- [ ] Executar `0022` (verificar FKs com tabela `users`)
- [ ] Executar `0023` e `0024` (verificar FKs com `0022`)
- [ ] Validar com query de integridade após cada migration
- [ ] Executar em produção no horário de menor tráfego
- [ ] Notificar via WhatsApp (start/end obrigatório — ação operacional)

**Plano de rollback:**
```sql
-- Se 0022 falhar: DROP TABLE vfit_b2c_* CASCADE
-- Se 0021 falhar: re-adicionar coluna (definição em backup antes da migration)
```

---

## 2. Renovar Credenciais WhatsApp Unipile

**Prioridade:** 🔴 Alta (urgente) | **Esforço:** P | **Sprint sugerida:** Imediato

**Problema:** O Worker de notificações WhatsApp está retornando 401. Credenciais Unipile expiradas. Toda ação operacional depende do sistema de notificação — sem ele, o protocolo de rastreamento está comprometido.

**Procedimento:**
1. Acessar painel Unipile e gerar novo API token
2. Atualizar segredo `UNIPILE_API_TOKEN` nas variáveis de ambiente do Worker `vfiti-whatsapp`
3. Atualizar `WHATSAPP_NOTIFY_TOKEN` em `.env.local` local
4. Testar com `curl https://whatsapp.iapersonal.app.br/health`
5. Enviar mensagem de teste para o grupo

**Referência:** `docs/WHATSAPP-GATEWAY.md`

---

## 3. Corrigir URL do Git Remote

**Prioridade:** 🔴 Alta | **Esforço:** P | **Sprint sugerida:** Imediato

**Problema:** Push para o remote está falhando por URL desatualizada. Branch `feat/vfit-plano-modular` não está sincronizada com o repositório remoto.

**Diagnóstico e correção:**
```bash
# Verificar URL atual
git remote -v

# Corrigir URL (substituir pela URL correta do repositório)
git remote set-url origin https://github.com/ORG/REPO.git

# Re-tentar push
git push -u origin feat/vfit-plano-modular
```

---

## 4. CI/CD: GitHub Actions para Quality Gate em PRs

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** O `quality:ci` é executado manualmente antes de deploys, mas não está automatizado em PRs. Código com erros pode ser mergeado sem passar pela suite completa.

**Proposta:** Pipeline GitHub Actions que executa `npm run quality:ci` em cada PR para `main` e `develop`.

**Arquivo:** `.github/workflows/quality-ci.yml`

```yaml
name: Quality CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run type-check:workers
      - run: npm run test
      - run: npm run build
```

**Nota:** Modificar `.github/workflows/` requer instrução explícita do usuário — este item está documentado como proposta, não implementado aqui.

---

## 5. Staging Environment

**Prioridade:** 🟡 Média | **Esforço:** G | **Sprint sugerida:** 43

**Problema:** Não existe ambiente de staging separado. Migrations e features novas são testadas diretamente em produção ou apenas localmente.

**Proposta:** Criar ambiente de staging completo com:
- Cloudflare Pages preview separado para o frontend
- Worker environment `staging` no `wrangler.jsonc`
- Neon branch dedicado para staging (feature nativa do Neon)
- KV e R2 namespaces separados

**Implementação no `wrangler.jsonc`:**
```jsonc
{
  "env": {
    "staging": {
      "name": "vfiti-api-staging",
      "vars": {
        "ENVIRONMENT": "staging"
      },
      "kv_namespaces": [{ "binding": "KV", "id": "STAGING_KV_ID" }]
    }
  }
}
```

**Custo:** Neon branch: gratuito. Workers/Pages segundo environment: incluído no plano.

---

## 6. Backup Automatizado do Banco (Neon Branching)

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** Não há snapshot regular do banco de dados. Em caso de migration mal executada ou corrupção de dados, o ponto de restauração pode ser o início do dia ou anterior.

**Proposta:** Usar a feature nativa de branching do Neon para criar snapshots diários automáticos.

**Implementação:**
- Script `scripts/neon-backup.mjs` — chama Neon API para criar branch `backup-YYYY-MM-DD`
- Cron no GitHub Actions ou Cloudflare Cron Trigger: executa diariamente às 03:00 BRT
- Retenção: manter últimos 7 dias de backups, deletar mais antigos via API
- Alerta: se criação do backup falhar, notificar via WhatsApp

**Neon API:**
```bash
curl -X POST https://console.neon.tech/api/v2/projects/{id}/branches \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{ "branch": { "name": "backup-2026-03-31", "parent_id": "main" } }'
```

---

## 7. Monitoring: Cloudflare Analytics + Sentry

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** Erros de runtime em produção (worker exceptions, frontend uncaught errors) não têm alerta automático. Dependemos de usuários reportando bugs.

**Proposta:** Configurar monitoramento de erros em duas camadas:

**Frontend — Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
- Captura erros não tratados, performance transactions, Web Vitals
- Alerta via email/Slack quando nova issue aparecer

**Worker — Sentry (Cloudflare Workers SDK):**
```bash
npm install @sentry/cloudflare
```
- Captura exceções no worker, request duration, falhas de DB

**Cloudflare Analytics:**
- Já disponível no dashboard Cloudflare sem custo adicional
- Monitorar: error rate por rota, latência P95, req/s

**Dashboard operacional:**
- Sentry dashboard para erros agrupados por tipo
- Cloudflare Analytics para volume e latência
- Alertas: error rate > 1% em qualquer rota → notificação WhatsApp

---

## 8. Rate Limiting Granular por Plano

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** O rate limiting atual (se existente) é provavelmente igual para todos os usuários, independente do plano. Usuários `max` deveriam ter limites mais altos.

**Proposta:** Rate limiting diferenciado por plano usando Cloudflare KV para contadores.

**Limites propostos:**

| Plano | Req/hora | Req/minuto | Endpoints críticos |
|---|---|---|---|
| `trial` | 200 | 30 | 1 req/min em `/gamification/xp` |
| `pro` | 1.000 | 100 | 5 req/min em `/gamification/xp` |
| `max` | Ilimitado | 500 | 20 req/min em `/gamification/xp` |
| Admin | Ilimitado | Ilimitado | Sem limite |

**Implementação:**
- `workers/middleware/rate-limit.ts` — expandir com `getUserPlan()` e limites por plano
- Contador KV: key `rl:{userId}:{endpoint}:{window}` com TTL igual à janela
- Header de resposta: `X-RateLimit-Remaining` e `X-RateLimit-Reset`
- Resposta 429 com `Retry-After` header

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Executar migrations 0021–0024 | 🔴 Alta | P | Imediato |
| 2 | Renovar credenciais WhatsApp Unipile | 🔴 Alta | P | Imediato |
| 3 | Corrigir URL do git remote | 🔴 Alta | P | Imediato |
| 4 | CI/CD GitHub Actions quality gate | 🔴 Alta | M | 42 |
| 5 | Staging environment | 🟡 Média | G | 43 |
| 6 | Backup automatizado Neon branching | 🟡 Média | P | 42 |
| 7 | Monitoring: Sentry + Cloudflare Analytics | 🟡 Média | M | 43 |
| 8 | Rate limiting granular por plano | 🟡 Média | M | 43 |
