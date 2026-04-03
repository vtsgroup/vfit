# WhatsApp Gateway Worker (Unipile) — VFIT (VFIT)

> Última atualização: 17/03/2026

## Objetivo

Centralizar envio de mensagens via WhatsApp (Unipile) com um contrato único e endpoints simples.

## URL e Worker

- URL (produção): https://whatsapp.iapersonal.app.br
- Worker name (Cloudflare): `vfiti-whatsapp`

## Endpoints

- `GET /health` (sem auth)
- `GET /chats` (auth)
- `POST /send` (auth)
- `POST /task-notify` (auth) — start/end padronizado
- `POST /format` (auth) — preview (não envia)

## Autenticação

Todos os endpoints (exceto `/health`) exigem:

- Header: `Authorization: Bearer <ADMIN_AUTH_TOKEN>`

## Secrets Store (Cloudflare)

- Store ID: `88b0ebf0455e437c8d75597ba6aae568` (`default_secrets_store`)

Secrets usados pelo worker:

- `ADMIN_AUTH_TOKEN`
- `UNIPILE_API_KEY`
- `UNIPILE_WHATSAPP_ACCOUNT_ID`
- `UNIPILE_WHATSAPP_GROUP_CHAT_ID`
- `UNIPILE_WHATSAPP_GROUP_NAME` (fallback)

## IDs confirmados (produção)

- Unipile WhatsApp `account_id`: `nEog3ulQQYeAoZR8zvmINQ`
- Grupo WhatsApp "Logs e Docs: VFIT" → `chat_id`: `Rzsb4DgGVp6NDV5IWA5w5Q`

## Contrato: `POST /task-notify`

### Payload

Campos principais:

- `event`: `start | end`
- `title`: string
- `task_id`: string (id estável para correlacionar start/end)
- `actor_label`: string (ex.: "Developer Agent")
- `priority`: string (ex.: "ALTA")
- `status`: `success | failed` (apenas no `end`)
- `summary`: `string[]` (apenas no `end`)
- `deploy_version`: string (opcional)
- `link_url`: string (opcional)
- `started_at`: ISO datetime (recomendado)
- `ended_at`: ISO datetime (recomendado no `end`)

### Regras de mensagem (OBRIGATÓRIO)

Para cada tarefa operacional (deploy, migração, hotfix, etc.):

1) Sempre enviar **start** antes de executar a tarefa.
2) Sempre enviar **end** ao concluir (sucesso ou falha).
3) O **end** deve conter:
   - `started_at`
   - `ended_at`
   - Duração total (calculada a partir desses campos)
4) O conteúdo deve seguir template padrão com o mesmo `task_id` entre start/end.

> **Regra obrigatória absoluta:** toda ação operacional iniciada deve ter mensagem de abertura e toda ação encerrada deve ter mensagem de fechamento no grupo. Sem isso, a execução é considerada não conforme.

### Template padrão obrigatório (bot/agent)

> **Tom de comunicação (novo padrão):**
> - Menos técnico, mais executivo/objetivo.
> - Sempre explicar em linguagem simples: **o que estamos iniciando**, **por que isso importa agora** e **qual vantagem prática** no fechamento.
> - Evitar jargão interno quando não for necessário.
> - No fechamento, ser **assertivo**: frase direta de resultado, sem rodeios.
> - **Sem repetição**: não repetir a mesma ideia em linhas diferentes (motivo/benefício devem ser complementares).

**Start (início):**

```text
[🤖 Developer Agent]

⏱️ Iniciando etapa: <frente principal>.

Por que agora: <motivo curto ligado ao objetivo do dia>.
Resultado esperado: <ganho claro para usuário/produto>.

ID: <TASK_ID>
Início (BRT): <DD/MM, HH:mm>
```

**End (fechamento):**

```text
[🤖 Developer Agent]

✅ Finalizado: <entrega concluída>.

Resultado direto: <resultado final em 1 frase assertiva>.
Motivo: <motivo em 1 frase, sem repetir resultado>.
Vantagem prática: <benefício direto para operação/usuário>.

ID: <TASK_ID>
Início (BRT): <DD/MM, HH:mm>
Fim (BRT): <DD/MM, HH:mm>
Duração: <automática>
Versão: <opcional>

Status: <resultado final>

👍🏻 Se puder, dá um ok aqui na thread.
```

**Checklist rápido do fechamento (obrigatório):**
- 1 frase de resultado final (assertiva)
- 1 frase de motivo (sem repetir resultado)
- 1 frase de vantagem (sem repetir motivo)

> Regra estrita: `end` sem `started_at` é inválido para operação.
> Use sempre o helper [scripts/whatsapp-task.mjs](scripts/whatsapp-task.mjs) para preservar `started_at` automaticamente.

### Formatação do agente (IMPORTANTE)

- A primeira linha do template já exibe o agente no formato: `[🤖 <actor_label>]`.
- **Não** inclua `🤖`/colchetes no `actor_label` e **não** prefixe o título com o nome do agente.

**Use assim (correto):**

- `--actor "Developer Agent"`
- `--title "Sprint UI — Fase X: ..."`

> O helper [scripts/whatsapp-task.mjs](scripts/whatsapp-task.mjs) normaliza automaticamente casos como `--actor "[🤖 Developer Agent]"` / título com prefixo, para evitar mensagens esquisitas do tipo `[🤖 [🤖 Developer Agent]]`.

> O pipeline de deploy [scripts/cf-deploy.js](scripts/cf-deploy.js) exige start/end no WhatsApp por padrão. Se `WHATSAPP_NOTIFY_URL`/`WHATSAPP_NOTIFY_TOKEN` não estiverem configurados, o deploy falha (exceto quando executado explicitamente com `--allow-no-whatsapp`).

## ⚡ Fluxo rápido (sem digitar auth toda hora)

**Objetivo:** não repetir `read -s` + `curl` manualmente.

1) Crie um arquivo local (ignorado pelo git): `.env.local`

```bash
WHATSAPP_GATEWAY_URL=https://whatsapp.iapersonal.app.br
WHATSAPP_NOTIFY_TOKEN=COLE_AQUI_O_ADMIN_AUTH_TOKEN
```

2) Carregue as variáveis no terminal atual:

```bash
set -a; source .env.local; set +a
```

3) Use o helper script (salva `started_at` automaticamente em `.wrangler/whatsapp-task-state.json`):

```bash
node scripts/whatsapp-task.mjs start --task-id DESIGN-2026-02-24-PM --title "Design Sprint — ..." --priority ALTA \
  --why "destravar sprint crítica da manhã" --expected "entregar revisão sem bloqueios para publicação"

node scripts/whatsapp-task.mjs end --task-id DESIGN-2026-02-24-PM --title "Design Sprint — ..." --status success --deploy vX.Y.Z \
  --result "Resultado direto: sprint concluída e validada." \
  --reason "Motivo: fechar pendências críticas ainda hoje." \
  --benefit "Vantagem prática: equipe decide próximo passo com contexto completo."

# preview (não envia)
node scripts/whatsapp-task.mjs preview end --task-id DESIGN-2026-02-24-PM --title "..." --status success

# atalhos npm (carregam .env.local automaticamente)
npm run notify:start -- --task-id DESIGN-2026-02-24-PM --title "Design Sprint — ..." --priority ALTA --why "destravar revisão" --expected "fechar sprint"
npm run notify:end -- --task-id DESIGN-2026-02-24-PM --title "Design Sprint — ..." --status success --result "Resultado direto: sprint concluída." --reason "Motivo: cumprir janela de entrega." --benefit "Vantagem prática: time segue sem bloqueios."
```

## Preview (sem enviar): `POST /format`

Use para validar layout antes de enviar no grupo.

## Exemplos

### Preview (end)

```bash
read -s "?ADMIN_AUTH_TOKEN: " ADMIN_AUTH_TOKEN; echo

curl -sS -X POST "https://whatsapp.iapersonal.app.br/format" \
  -H "Authorization: Bearer $ADMIN_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "event":"end",
    "actor_label":"Developer Agent",
    "title":"Criação do WhatsApp Gateway Worker (padrão)",
    "task_id":"WHATSAPP-WORKER-2026-02-24-AM",
    "priority":"ALTA",
    "status":"success",
    "deploy_version":"v1.0.0",
    "link_url":"https://iapersonal.app.br/dashboard",
    "started_at":"2026-02-24T12:00:00.000Z",
    "ended_at":"2026-02-24T12:42:00.000Z",
    "summary":[
      "✅ Entregue: Worker padrão de WhatsApp (Unipile) com endpoint único.",
      "✅ URL alvo: https://whatsapp.iapersonal.app.br (custom domain).",
      "✅ Endpoints: /health, /chats, /send, /task-notify, /format."
    ]
  }' | head -200
```

### Enviar (end)

```bash
read -s "?ADMIN_AUTH_TOKEN: " ADMIN_AUTH_TOKEN; echo

curl -sS -X POST "https://whatsapp.iapersonal.app.br/task-notify" \
  -H "Authorization: Bearer $ADMIN_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "event":"end",
    "actor_label":"Developer Agent",
    "title":"Criação do WhatsApp Gateway Worker (padrão)",
    "task_id":"WHATSAPP-WORKER-2026-02-24-AM",
    "priority":"ALTA",
    "status":"success",
    "deploy_version":"v1.0.0",
    "link_url":"https://iapersonal.app.br/dashboard",
    "started_at":"2026-02-24T12:00:00.000Z",
    "ended_at":"2026-02-24T12:42:00.000Z",
    "summary":[
      "✅ Entregue: Worker padrão de WhatsApp (Unipile) com endpoint único.",
      "✅ URL alvo: https://whatsapp.iapersonal.app.br (custom domain).",
      "✅ Endpoints: /health, /chats, /send, /task-notify, /format."
    ]
  }' | head -200
```
