# MEM-ECONOMY & WHATSAPP FOOTER — VFIT

> **v1.1.0** · 09/07/2026 · Documentação oficial
> Cobre: (A) renderização da mensagem no worker `vfit-whatsapp`; (B) matemática/economia do claude-mem; (C) o rodapé de economia; (D) os três senders e o comando de mensagem personalizada (`whatsapp-say`).
> Complementa `WHATSAPP-GATEWAY.md` e `WHATSAPP-TEMPLATES.md`.

---

## Visão geral

Toda mensagem `end` do Developer Agent no grupo do WhatsApp termina com uma linha de economia do claude-mem:

```
🧠 claude-mem: ~91% economia • ~163k tokens de trabalho indexados nesta sessão (est.)
```

O número é capturado por um hook no `SessionStart`, persistido em `.claude/.mem-savings.json` e usado pelos senders (no campo `footer` ou anexado ao texto), saindo no fim de qualquer template. **Só aparece com dado real** (senão a linha é omitida) e é sempre marcado `(est.)`.

Fluxo:

```
SessionStart hook → capture-mem-savings.mjs → .claude/.mem-savings.json
                                                      ↓
                          lib/mem-savings.mjs (buildMemSavingsFooter)
                                                      ↓
      ┌─ whatsapp-task.mjs (task)   → body.footer ─┐
      ├─ cf-deploy.js      (deploy) → body.footer ─┤→ worker vfit-whatsapp
      └─ whatsapp-say.mjs  (custom) → texto+rodapé ┘   (anexa / inclui no fim)
```

---

## Parte A — Renderização da mensagem no worker (`vfit-whatsapp`)

Fonte: `workers/whatsapp/src/index.ts`. Endpoint operacional: `https://vfit-whatsapp.vd-b0b.workers.dev`.

### Endpoints

| Método/Rota | Função |
|---|---|
| `GET /health` (ou `/`) | status/health; não exige secret |
| `GET /chats` | lista chats (Unipile) |
| `POST /send` | envia texto livre |
| `POST /task-notify` | notifica início/fim de task (`start`/`end`) — **canal oficial do Developer Agent** |
| `POST /format` | retorna a mensagem **formatada sem enviar** (preview) |

**Auth:** `Authorization: Bearer <token>`, onde o token é `ADMIN_AUTH_TOKEN`, `CRON_SECRET` ou `AUTH_TOKEN` (via env ou Secrets Store). `/health` é isento.

### Contrato (NÃO quebrar)

- `event` ∈ `start | end`
- `status` ∈ `success | failed` (relevante no `end`)

Qualquer campo novo deve ser **aditivo** (ex.: `footer`), sem alterar esses enums.

### Campos aceitos no body (`/task-notify` e `/format`)

`event`, `title`, `task_id`, `actor_label`, `started_at`, `ended_at`, `priority`, `action`, `details`, `summary[]`, `deploy_version`, `deploy_message`, `status`, `link_url`, `tone`, `group_name`, `account_id`, **`footer`** (novo).

Limpeza no worker: cada item de `summary` é `clampText(…, 300)`, filtrado e limitado a 24 itens; `footer` é `clampText(…, 300)`.

### Fluxo de decisão do template (o ponto crítico)

**`start` → suprimido.** O worker responde `skipped:true` e **não posta no grupo** ("only the final result is posted"). Só o `end` chega ao grupo.

**`end` + `status: success`** → `buildEndMessage()` escolhe entre dois modos:

1. **Creative template** — dispara quando **alguma linha do `summary` contém `\n`** (quebra de linha real). Renderiza:
   ```
   <title>

   <cada linha do summary, verbatim>

   ⏱️ Deploy: <duração>
   <link>
   ```
   → o texto do `summary` é mostrado como está.

2. **Generic template** — quando o `summary` é só de linhas simples (sem `\n`). Renderiza a partir de `deploy_message` (ou da parte do `title` após " — "), via `prettifyChange()`, e um rodapé de status que **varia por `tone`**:
   - `dev` (default): `🚀 *Subiu a nova versão!*` … `✅ tudo verde · <componentes> no ar · ⏱️ <dur>`
   - `marketing`: `🚀 *Novidade no VFIT!*` …
   - `casual`: `🎉 *… no ar!*` …

   Aqui o **texto do `summary` NÃO é exibido** — ele só é escaneado por `liveComponents()` para detectar quais componentes subiram (Build/Pages/Workers).

**`end` + `status: failed`** → usa **apenas `summary[0]`** como motivo:
```
❌ *Deploy falhou* · <dur>

<motivo>

👀 confere os logs antes de tentar de novo
```

> **Implicação:** injetar o rodapé "empilhando no `summary`" pelo cliente é **frágil** — só apareceria no creative template. Por isso o rodapé usa um campo próprio (`footer`) que o worker anexa **depois** de qualquer template (ver Parte C).

### O campo `footer` (mecanismo do rodapé)

Em `buildTaskNotifyMessage()`, após montar a mensagem final por qualquer caminho:

```ts
const footer = params.footer ? params.footer.trim() : ''
return footer ? `${message}\n\n${footer}` : message
```

Aditivo e uniforme: creative, generic e failed recebem o rodapé no fim. Quem não manda `footer` → comportamento idêntico ao anterior (zero regressão).

---

## Parte B — claude-mem: matemática e economia

### Dois sistemas de memória (não confundir)

| Sistema | Onde vive | É a fonte do número? |
|---|---|---|
| `copilot-mem` | `~/.copilot-mem`, porta `37888`, aliases `mem-*` | ❌ não |
| **`claude-mem`** (plugin `thedotmack`) | `~/.claude-mem`, `~/.claude/plugins/cache/thedotmack/claude-mem/<versão>` | ✅ **sim** |

### As duas grandezas

Fonte: `context-generator.cjs` do plugin claude-mem.

- **Read tokens** (`read`): custo de *ler agora* uma observação. Estimado por observação como
  `ceil((len(title) + len(subtitle) + len(narrative) + len(JSON(facts))) / 4)` e somado.
- **Work tokens** (`work`): o trabalho que *produziu* aquela memória (`discovery_tokens` por observação), somado. Representa pesquisa/construção/decisão originais.

### Fórmula da economia

```
savings      = work − read
savings(%)   = round( savings / work × 100 )     (se work > 0; senão 0)
```

Intuição: em vez de gastar `work` tokens re-descobrindo tudo, você paga só `read` tokens para reusar o índice — a economia é o que deixou de gastar.

### A linha injetada no SessionStart

O claude-mem injeta no contexto (via seu hook `SessionStart`):

```
Stats: N obs (Xt read) | Yt work | Z% savings
```

- `N` = nº de observações no índice
- `Xt read` = total de read tokens
- `Yt work` = total de work tokens
- `Z% savings` = a fórmula acima

Exibição controlada por env do plugin (defaults): `CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT=true`, `..._SHOW_WORK_TOKENS`/`..._SHOW_READ_TOKENS` conforme config.

### Por que é sempre "(est.)"

A seleção de observações do claude-mem é **sensível à sessão** (janela das últimas N observações do projeto, excluindo a sessão atual, filtrada por modo). Reexecutar o gerador dá um valor ligeiramente diferente (observado: 90%/193k no boot; 92%/156k, 91%/139k em capturas seguidas). É estimativa por natureza — daí o `(est.)` obrigatório.

---

## Parte C — O rodapé de economia (pipeline)

### Componentes

| Arquivo | Papel |
|---|---|
| `scripts/capture-mem-savings.mjs` | hook `SessionStart`: reexecuta o gerador do claude-mem, faz parse da linha `Stats`, grava o snapshot. Nunca bloqueia a sessão. |
| `scripts/lib/mem-savings.mjs` | helper `readMemSavings()` / `buildMemSavingsFooter()`; formata e aplica as regras de omissão. |
| `scripts/whatsapp-task.mjs` | sender de task/deploy — envia o valor no campo `footer` do body. |
| `scripts/cf-deploy.js` | pipeline de deploy — lê o snapshot inline (`readMemSavingsFooter()`) e envia `footer` no `end`. |
| `scripts/whatsapp-say.mjs` | mensagem personalizada ao grupo (`/send`) — anexa o rodapé ao próprio texto. |
| `workers/whatsapp/src/index.ts` | anexa o `footer` ao fim de toda mensagem `end`. |
| `.claude/settings.json` | registra o hook de captura no `SessionStart`. |
| `.gitignore` | ignora `.claude/.mem-savings.json`. |
| `~/.claude/CLAUDE.md` | a regra do agente (ao lado da regra RTK). |

### Captura (hook)

Um hook não lê o output de outro hook. Então o `capture-mem-savings.mjs` roda **o mesmo comando** do claude-mem, repassando o payload do `SessionStart` pelo stdin:

```
node <pluginRoot>/scripts/bun-runner.js <pluginRoot>/scripts/worker-service.cjs hook claude-code context
```

- **stdin obrigatório**: com stdin vazio o comando aborta (claude-mem issue #2188). O hook repassa o payload real, ou sintetiza `{cwd, source, hook_event_name, session_id}`.
- **bun no PATH**: prepende `~/.bun/bin`.
- Faz regex na linha `Stats:` e grava:
  ```json
  { "percent": 91, "workTokens": 163267, "readTokens": 14665, "obs": 40, "capturedAt": "2026-07-09T07:21:53.607Z" }
  ```

Registro em `.claude/settings.json`:
```json
{ "matcher": "startup|clear|compact", "hooks": [
  { "type": "command",
    "command": "node \"${CLAUDE_PROJECT_DIR:-.}/scripts/capture-mem-savings.mjs\" 2>/dev/null || true; echo '{\"continue\":true,\"suppressOutput\":true}'",
    "timeout": 30 } ] }
```

### Formatação e regras de omissão (helper)

`buildMemSavingsFooter()` retorna `''` (→ rodapé omitido) quando:
- o snapshot não existe, ou
- `workTokens <= 0` / `percent` inválido, ou
- o snapshot é **stale (> 12h)** — evita afirmar "nesta sessão" com número velho num envio via cron.

Formato:
```
🧠 claude-mem: ~<percent>% economia • ~<work em k> tokens de trabalho indexados nesta sessão (est.)
```

### Integração dos senders + worker

- `whatsapp-task.mjs` (templates de task/deploy): `body.footer = buildMemSavingsFooter() || undefined`.
- `cf-deploy.js` (pipeline): lê o snapshot inline (`readMemSavingsFooter()`) e passa `footer` no payload `end` — **sem isso o deploy sai sem o rodapé** (foi o caso do v5.5.0).
- `whatsapp-say.mjs` (texto livre via `/send`): anexa o rodapé ao próprio texto antes de enviar.
- worker: para `/task-notify`, anexa `footer` ao fim (ver Parte A); para `/send`, o rodapé já vem embutido no texto.

### Regra do agente (`~/.claude/CLAUDE.md`)

- Só com dado real; nunca inventar; sempre `(est.)`.
- Coexiste com o bloco RTK (cada um em sua linha).
- **Não adicionar a linha à mão** — o pipeline já faz (evita duplicar).

---

## Parte D — Os três senders + mensagem personalizada

Resposta de chat do assistente **não** vai pro grupo. Mensagem só sai quando um sender é chamado explicitamente. Existem três:

| Sender | Quando | Rodapé |
|---|---|---|
| `scripts/whatsapp-task.mjs` | notificação de task (`start`/`end`) — `start` é suprimido pelo worker | `footer` no body → worker anexa |
| `scripts/cf-deploy.js` | pipeline de deploy (posta no `/task-notify` com body próprio) | `footer` no payload `end` |
| `scripts/whatsapp-say.mjs` | **mensagem personalizada** (texto livre) em marcos importantes | anexado ao texto (via `/send`) |

### whatsapp-say — mensagem personalizada ao grupo

Para resumos sob medida em **marcos relevantes** (deploy concluído, milestone, encerramento com entrega) — não o card genérico. Envia texto livre pelo `/send` do worker e anexa o rodapé de economia.

```bash
# multilinha via stdin (recomendado)
printf '%s\n' "✅ <resumo>" "- <ponto>" "- <ponto>" | node scripts/whatsapp-say.mjs --stdin

# texto direto (\n vira quebra de linha)
node scripts/whatsapp-say.mjs --text "linha 1\nlinha 2"

# conferir sem enviar
node scripts/whatsapp-say.mjs --preview --stdin
```

Flags: `--stdin`, `--text`, `--group "<nome>"`, `--no-footer`, `--preview`.
Regra (no `~/.claude/CLAUDE.md`): usar **só quando há entrega real** — não em toda sessão (evita ruído); `--preview` antes de enviar.

---

## Exemplos renderizados (produção)

**Generic template + footer:**
```
🚀 *Subiu a nova versão!*

_O que mudou:_
▫️ Validação rodapé claude-mem

✅ tudo verde · build, site e API no ar · ⏱️ 1h21m

🧠 claude-mem: ~91% economia • ~163k tokens de trabalho indexados nesta sessão (est.)
```

**Creative template + footer:**
```
Rodapé de economia claude-mem nas mensagens do grupo

✅ O rodapé de economia do claude-mem agora entra automático nas mensagens
├─ Hook SessionStart captura o número da sessão
├─ Worker vfit-whatsapp anexa a linha ao fim de toda mensagem
└─ Some sozinho quando não há dado — nunca inventa número

🧠 claude-mem: ~91% economia • ~163k tokens de trabalho indexados nesta sessão (est.)

⏱️ Deploy: 36m
```

**Sem dado (snapshot ausente/velho):** a linha `🧠` simplesmente não aparece.

---

## Limitações conhecidas

1. **Número oscila** entre execuções (seleção sensível à sessão) → sempre `(est.)`.
2. **Custo:** o hook reexecuta a geração de contexto do claude-mem uma vez por `SessionStart` (leitura local do SQLite sob bun; sub-segundo, sem LLM) — segunda passada em paralelo à do próprio claude-mem.
3. **`scripts/notify-whatsapp.js` não existe** — o `~/.claude/CLAUDE.md` global o referencia, mas o sender real é `scripts/whatsapp-task.mjs`.
4. **`scripts/whatsapp-templates.mjs`** é código legado/não-importado (usa `module.exports` num `.mjs`); não faz parte deste pipeline.
5. **Delay do Unipile** — o gateway tem fila assíncrona; a mensagem pode levar minutos para aparecer no grupo (comportamento conhecido, não erro).

---

## Referências rápidas

- Worker: `workers/whatsapp/src/index.ts` — `buildEndMessage()`, `buildTaskNotifyMessage()`, handlers `/task-notify` e `/format`.
- Captura/helper: `scripts/capture-mem-savings.mjs`, `scripts/lib/mem-savings.mjs`.
- Senders: `scripts/whatsapp-task.mjs` (task/deploy) · `scripts/cf-deploy.js` (pipeline) · `scripts/whatsapp-say.mjs` (mensagem personalizada).
- Hook: `.claude/settings.json` (array `SessionStart`).
- Snapshot: `.claude/.mem-savings.json` (gitignored, por sessão).
- claude-mem: `~/.claude/plugins/cache/thedotmack/claude-mem/<versão>/scripts/context-generator.cjs` (função de stats `Te`, montagem da linha em `os`).
- Commits: `45ab2dc8` (rodapé base) · `4610910e` (fix cf-deploy) · `5b5b26d1` (whatsapp-say).
