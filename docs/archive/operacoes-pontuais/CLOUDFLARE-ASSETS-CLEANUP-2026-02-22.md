# Cloudflare Assets Cleanup — Inventário e Plano de Desativação (2026-02-22)

## Objetivo
Organizar tudo que existe na conta para decidir com segurança o que manter, desativar e excluir.

## Inventário atual (conta `b0bf95d0fabb322ac3df37bd84ec0c77`)

### Workers scripts

| Worker | Última atividade observada | Secrets | Classificação inicial |
|---|---|---:|---|
| `vfiti-api` | deploys em 21/02/2026 | 19 | **KEEP (produção ativa)** |
| `offshore-proz-article-scheduler` | deploys em 27/01/2026 | 6 | **REVIEW (produto externo ao VFIT)** |
| `offshoreproz-email-scheduler` | deploys em 22/01/2026 | 1 | **REVIEW (produto externo ao VFIT)** |

### Pages projects

| Projeto | Domínios | Last Modified | Secrets prod | Classificação inicial |
|---|---|---|---:|---|
| `personal-ia-prod` | personal-ia-prod.pages.dev, iapersonal.app.br | 21h | 0 | **KEEP (produção ativa)** |
| `portugal-festas` | portugal-festas-5ye.pages.dev, portugalfestas.com | 12h | 2 | REVIEW |
| `cms-offshore-proz` | cms-offshore-proz.pages.dev, cms.offshoreproz.com | 20h | 8 | REVIEW |
| `vts-dev` | vts-dev.pages.dev, vts-dev.victor.pt, vts.victor.pt | 1 semana | 0 | REVIEW |
| `victor-pt` | victor-pt.pages.dev, victor.pt | 1 semana | 0 | REVIEW |
| `site-offshore` | site-offshore.pages.dev | 2 semanas | 0 | REVIEW |
| `offshoreproz-docs` | offshoreproz-docs.pages.dev | 3 semanas | 7 | REVIEW |
| `pmz-capital` | pmz-capital.pages.dev | 1 mês | 0 | REVIEW |
| `bet67-customization` | bet67-customization.pages.dev | 1 ano | 0 | **CANDIDATO FORTE A DELETE** |

### Secret Store (conta)

| Store | ID | Status |
|---|---|---|
| `default_secrets_store` | `88b0ebf0455e437c8d75597ba6aae568` | existe, sem secrets |

---

## Leitura executiva

1. **Core do VFIT**: manter `vfiti-api` e `personal-ia-prod`.
2. **Demais assets** parecem de outros produtos/experimentos, não do repositório atual.
3. Não existe prova suficiente de “não uso” só com `last modified`; antes de excluir, executar janela curta de observação.

## Execução aplicada nesta sessão (deleção real)

### ✅ Deletados definitivamente

- Worker: `offshore-proz-article-scheduler`
- Worker: `offshoreproz-email-scheduler`
- Pages project: `offshoreproz-docs`
- KV namespace: `offshoreproz-docs-KV`
- D1 database: `offshoreproz-docs-db`
- Pages project: `bet67-customization`

### ✅ Bloqueio resolvido

- `bet67-customization` exigiu limpeza massiva de deployments históricos e foi removido com sucesso em seguida.

---

## Estratégia segura de limpeza (3 fases)

### Fase A — Congelamento (sem delete)
- Bloquear novos deploys nos projetos em `REVIEW`.
- Não rotacionar secrets desses projetos até decidir owner.
- Registrar owner responsável por cada projeto.

### Fase B — Desativação reversível
- Pages: remover domínio customizado (manter `*.pages.dev` temporariamente).
- Workers: remover rotas/triggers de produção e manter script por 7–14 dias.
- Monitorar erros/alertas e tickets de negócio.

### Fase C — Exclusão definitiva
- Excluir somente após janela sem tráfego/sem incidente.
- Antes de excluir: backup de config, lista de secrets, última versão/deploy id.
- Excluir por prioridade:
  1) `bet67-customization`
  2) projetos `REVIEW` sem owner confirmado
  3) workers `REVIEW` sem dependências

---

## Execução concluída (22/02/2026)

### Deletados definitivamente

- **Worker** `offshore-proz-article-scheduler` ✅
- **Worker** `offshoreproz-email-scheduler` ✅
- **Pages Project** `offshoreproz-docs` ✅
- **KV Namespace** `offshoreproz-docs-KV` ✅
- **D1 Database** `offshoreproz-docs-db` ✅
- **Pages Project** `bet67-customization` ✅

### Status do caso `bet67-customization`

- **Removido com sucesso** após limpeza em lote dos deployments históricos.

---

## Inventário de assets potencialmente legados (fora do core VFIT)

> Core atual confirmado: `vfiti-api` + `personal-ia-prod` + recursos com prefixo `vfit-*` / `vfiti-*`.

### R2 Buckets

- Manter (core):
  - `personal-ia-images`
  - `personal-ia-videos`
- Revisão (potencial legado):
  - `portugal-festas`

### KV Namespaces

- Manter (core):
  - `KV_CACHE`
  - `KV_RATE_LIMIT`
  - `KV_SESSIONS`
- Revisão (potencial legado):
  - `cms-offshore-proz-sessions`
  - `SESSIONS`
  - `KV`

### D1 Databases

- Manter (core):
  - `vfiti-exercises`
- Revisão (potencial legado):
  - `portugal-festas-db`
  - `offshore-proz-cms`
  - `vts-offshore-cms`
  - `site-offshore-db`

### Hyperdrive

- Manter (core):
  - `vfiti-db`

### Queues

- Sem filas ativas listadas no momento.

---

## Candidatos sugeridos agora

### Manter
- `vfiti-api`
- `personal-ia-prod`

### Candidato forte já concluído
- `bet67-customization` (**deletado**)

### Requer confirmação de owner (não deletar ainda)
- `portugal-festas`
- `cms-offshore-proz`
- `site-offshore`
- `pmz-capital`
- `victor-pt`
- `vts-dev`

---

## Checklist de decisão por asset

- [ ] Tem owner explícito?
- [ ] Tem domínio customizado ativo?
- [ ] Teve deploy/uso nos últimos 30 dias?
- [ ] Tem secrets em produção?
- [ ] Existe dependência cruzada com outro projeto?
- [ ] Passou janela de observação sem incidente?

Se qualquer resposta crítica for “sim” ou “não sei”, manter em `REVIEW`.
