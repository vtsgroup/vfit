# pxpipe & claude-mem — Ambiente local de IA

> **Escopo:** este doc descreve **estado da máquina**, não código do VFIT.
> Caminhos como `~/.config`, `~/Library/LaunchAgents` e `~/.pxpipe` não existem
> em outra máquina nem em CI. Nada aqui afeta build, deploy ou runtime do app.
>
> **Atualizado:** 26/07/2026 · Dados derivados de `~/.pxpipe/events.jsonl` (14.178 linhas)

---

## 🎯 Estado atual

| Item | Valor |
| ------ | ------- |
| Proxy | `http://127.0.0.1:47821` |
| LaunchAgent | `com.pxpipe.proxy` (`~/Library/LaunchAgents/com.pxpipe.proxy.plist`) |
| Pacote | `/opt/homebrew/lib/node_modules/pxpipe-proxy` |
| Config | `~/.config/pxpipe/config.json` |
| Log de eventos | `~/.pxpipe/events.jsonl` |
| Dashboard | `http://127.0.0.1:47821/` (sem autenticação, loopback) |
| Modelo padrão | `claude-opus-5` — definido em `.claude/settings.json`, consta na allowlist ✅ |

**Config vigente (escrito 26/07, aguardando restart para ativar):**

```json
{ "models": [
    "claude-fable-5", "claude-sonnet-5",
    "claude-opus-5", "claude-opus-4-8", "claude-opus-4-7"
] }
```

Removidos da lista anterior: `claude-haiku-4-5`, `claude-sonnet-4-6`, `gpt-5.6`.
Backup: `~/.config/pxpipe/config.json.bak-20260726-195221`.

---

## ⚙️ O que o pxpipe faz

Proxy local que fica entre o Claude Code e a API Anthropic. Ele pega a parte
**estática e volumosa** do contexto — system prompt, docs de tools, schemas,
reminders, `tool_result`s antigos — renderiza como **páginas PNG** e manda como
imagem em vez de texto. Imagem custa menos token que o texto equivalente.

O que **nunca** vira imagem: suas mensagens mais recentes e o output do Claude.
Esses seguem byte-exato.

Ativa-se apontando o Claude Code para ele:

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

### ⚠️ Custo de precisão — o trade-off real

O modelo **lê a imagem**, não o texto. Valores exatos dentro do conteúdo
imageado (hashes, IDs, números, nomes de parâmetro de tool) podem ser lidos
errado. O próprio dashboard avisa: *"trate como resumo, não como fonte"*.

> **Regra prática:** ao trabalhar com contexto imageado, **re-derive números
> exatos da fonte** (arquivo, log, comando) em vez de transcrever do que você
> "lembra" de ter lido. Este doc foi reescrito justamente porque a primeira
> versão dos números veio de leitura de imagem e estava errada.

---

## 🔑 Precedência de configuração (não óbvia)

Confirmado em `dist/node.js:8092` (`applyConfigFileDefaults`):

```js
if (process.env.PXPIPE_MODELS === undefined) {
  const models = normalizeModelsConfig(cfg.models);
  if (models !== undefined) process.env.PXPIPE_MODELS = models;
}
```

Ordem de precedência:

1. **Chips do dashboard** — runtime, efeito imediato, **perdido no restart**
2. **`PXPIPE_MODELS`** (env) — se existir, o `config.json` é **ignorado**
3. **`~/.config/pxpipe/config.json`** — só semeia a env var quando ela não existe
4. **Default embutido** — `claude-fable-5,gpt-5.6`

**Consequência prática:** como o processo atual **não** tem `PXPIPE_MODELS` no
env (verificado via `ps eww`), editar o `config.json` basta. **Não é preciso
mexer no plist.** Se algum dia `PXPIPE_MODELS` for parar no plist, ela passa a
vencer e o `config.json` vira letra morta — fonte clássica de confusão.

O `config.json` aceita **apenas** a chave `models` (array, string separada por
vírgula, ou `"off"`). Porta, log e upstream são **env-only**.

---

## 💰 Como ler a economia

Imagear tem custo de entrada. Toda imagem nova **cria** cache (`cache_create_tokens`,
tarifado a 1,25×) e só compensa quando esse cache é **lido** nos turnos seguintes
(`cache_read_tokens`, tarifado a 0,1×).

> **A métrica que importa é a razão `read ÷ create` (R:C).**
> R:C alto = a imagem foi criada uma vez e reaproveitada muitas. R:C = 0 significa
> token gasto sem retorno nenhum.

O painel "Input tokens saved" **não** é essa métrica — ele cresce com volume
imageado, mesmo quando o cache nunca é reaproveitado.

### Dados medidos

Janela do log: **14/07 → 26/07/2026** · 13.863 requests em `/v1/messages`,
das quais **123 imageadas (0,89%)**.

| modelo | requests | imageadas | imgs | create_tok | read_tok | R:C |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `claude-sonnet-5` | 8.266 | 84 | 364 | 434.385 | 2.749.986 | **6,33** ✅ |
| `claude-opus-4-8` | 4.231 | 0 | 0 | 0 | 0 | — |
| `claude-opus-5` | 1.295 | 33 | 329 | 213.392 | 1.416.440 | **6,64** ✅ |
| `claude-haiku-4-5-20251001` | 67 | 2 | 14 | 71.312 | **0** | 0,00 ❌ |
| `claude-fable-5` | 4 | 4 | 30 | 215.825 | **0** | 0,00 ❌ |

### 🚨 Três ressalvas que mudam a leitura

**1. A amostra é de ~1 hora, não de 13 dias.** Todo o imaging aconteceu numa
janela curtíssima:

| modelo | 1ª imageada | última | duração |
| --- | --- | --- | --- |
| `claude-sonnet-5` | 26/07 22:00:06Z | 22:57:50Z | **57 min** |
| `claude-opus-5` | 26/07 22:39:45Z | 22:57:47Z | **18 min** |

Antes disso o motivo registrado era `unsupported_model` em **13.738 requests** —
o proxy estava ligado mas o modelo não estava na allowlist. Os R:C de 6,3/6,6 são
**direcionalmente bons mas estatisticamente magros**. Revalidar depois de alguns
dias de uso real.

**2. `opus-4-8` com 0 imageadas não é evidência de que ele não imageia.** Os
4.231 requests dele foram **todos** `unsupported_model` — ele nunca teve
permissão. Com a config nova ele **passa a imagear**. Ver risco abaixo.

**3. `haiku` e `fable` queimaram token puro:** 71.312 e 215.825 tokens de create
com **zero** leitura. Sessões one-shot que nunca reaproveitaram o cache.
Remoção justificada pelos dados.

### 📍 Baseline: não existe corte útil dentro deste log

Tentativa descartada: usar o último `unsupported_model`
(`2026-07-26T22:15:36.401Z`) como marco. **Não funciona** — esse timestamp é
quando o *último* modelo saiu da barreira, não quando o imaging começou. Sonnet
já imageava desde 22:00:06Z. Filtrar por ele apenas descarta 20 requests de
sonnet; todo o resto da amostra continua sendo a mesma hora única.

Confirmação: pós-corte, `haiku` = 2 reqs / 71.312 create / R:C 0,00 e `fable` =
3 reqs / 150.786 create / R:C 0,00 — idênticos à tabela acima.

**Baseline honesto exige sessões novas.** Marco prospectivo: primeira sessão
após **26/07/2026 23:10Z**. Critério: ≥3 sessões longas por modelo.

> Não rotacionar `~/.pxpipe/events.jsonl`: o proxy mantém o fd aberto em append
> (`lsof` → `24w`, offset 8,2 MB). `mv` manda eventos para o inode desvinculado;
> `truncate` gera buraco de nulls. Filtrar por `ts` é a via segura.

```sh
jq -r --arg cut "2026-07-26T23:10:00Z" '
  select(.ts > $cut and .path=="/v1/messages" and (.image_count // 0) > 0)
  | [.model, (.cache_create_tokens // 0), (.cache_read_tokens // 0)] | @tsv' \
  ~/.pxpipe/events.jsonl \
| awk -F'\t' '{c[$1]+=$2; r[$1]+=$3; n[$1]++}
    END {for (m in c) printf "%-28s reqs=%-4d create=%-9d read=%-10d R:C=%.2f\n",
                              m, n[m], c[m], r[m], (c[m] ? r[m]/c[m] : 0)}'
```

O campo é `.reason` (`unsupported_model`, `below_min_chars`), ausente quando o
request foi processado. `history_reason` e `passthrough_reasons` são outra coisa.

### ⚠️ Peso de cache errado no dashboard

100% dos creates deste log são **TTL de 1 hora** (`cache_create_1h_tokens` =
12.085.828; `5m` = 0). Cache write de 1h é tarifado a **2,0×**, não 1,25×. O
painel usa 1,25× na fórmula `actual = input + cc×1.25 + cr×0.10`, o que
**superestima a economia em ~7%**. Net agregado real: 11,6M tokens (vs 12,5M
reportado). Direção não muda; o número, sim.

---

## 🎯 Precisão por modelo (benchmark do autor)

Fonte: comentário em `dist/node.js` (`applicability.js`), FINDINGS 16/06/2026.

| modelo | recall em hex denso | veredito |
| --- | --- | --- |
| `claude-fable-5` | **100/100** | ✅ único verificado |
| `claude-opus-4-8` | **6/15** + ~2pp pior em aritmética | ❌ excluído do default pelo autor |
| `gpt-5.5` | degrada com história imageada | ❌ |
| `sonnet-5`, `opus-5`, `opus-4-7`, `haiku-4-5`, `sonnet-4-6` | **sem dado** | ⚠️ desconhecido |

### Risco aceito conscientemente

`claude-opus-4-8` está **na allowlist atual** por decisão explícita, apesar do
recall de 6/15. Antes ele nunca imageava (era `unsupported_model`); agora vai.

> **Se Opus 4.8 começar a errar nome ou parâmetro de tool, ou a citar números
> errados, ele é o primeiro suspeito.** Primeiro teste de diagnóstico: tirá-lo
> da lista e repetir.

---

## 🔧 Operação

**Aplicar mudança de config** (o arquivo só é lido no boot):

```bash
launchctl kickstart -k gui/$(id -u)/com.pxpipe.proxy
```

> ⚠️ Isso **derruba a sessão Claude Code em andamento**, porque ela roteia por
> `127.0.0.1:47821`. Aplicar entre sessões.

**Rollback:**

```bash
cp ~/.config/pxpipe/config.json.bak-20260726-195221 ~/.config/pxpipe/config.json
launchctl kickstart -k gui/$(id -u)/com.pxpipe.proxy
```

**Verificar o que está valendo de verdade:**

```bash
# a env vence o config.json — confirme que ela NÃO existe
ps eww -o command= $(pgrep -f pxpipe | head -1) | tr ' ' '\n' | grep '^PXPIPE' \
  || echo "sem PXPIPE_* → config.json manda"
```

**Re-derivar as métricas** (não confie em número lido de imagem):

```bash
cd ~/.pxpipe && python3 -c "
import json,collections
per=collections.defaultdict(lambda:dict(t=0,i=0,c=0,r=0))
for l in open('events.jsonl'):
    d=json.loads(l)
    if d.get('path')!='/v1/messages': continue
    p=per[d.get('model')]; p['t']+=1
    if (d.get('image_count') or 0)>0:
        p['i']+=1; p['c']+=d.get('cache_create_tokens') or 0; p['r']+=d.get('cache_read_tokens') or 0
for m,p in sorted(per.items(),key=lambda k:-k[1]['t']):
    print(f\"{m:<28}{p['t']:>6}{p['i']:>5}  R:C={p['r']/p['c'] if p['c'] else 0:.2f}\")"
```

Campos úteis em `events.jsonl`: `model`, `compressed`, `image_count`,
`image_bytes`, `cache_create_tokens`, `cache_read_tokens`, `reason`,
`baseline_tokens`, `orig_chars`. Motivos comuns de skip: `unsupported_model`,
`below_min_chars (N < 2000)`.

---

## 🧠 claude-mem — dois processos independentes

Erro comum: reiniciar o processo errado e concluir que "não funcionou".

| Processo | O que é | Como reinicia |
| --- | --- | --- |
| **Worker** | viewer/indexador, porta **37777** | `npx claude-mem restart` |
| **MCP server** | bindings tree-sitter, ferramentas `mcp__...` | **ciclo de vida do Claude Code** — exige reiniciar o Claude Code, não o worker |

> Recompilar tree-sitter exige restart do **MCP server** (ou seja, do Claude Code).
> `npx claude-mem restart` **não** resolve esse caso.

---

## 🕳️ Armadilhas conhecidas

| Armadilha | Detalhe |
| --- | --- |
| **Modelo padrão precisa estar na allowlist** | Invariante: o `model` de `.claude/settings.json` **tem que constar no `config.json` do pxpipe**, senão nada é comprimido (motivo `unsupported_model`). Foi exatamente o que aconteceu por 13 dias com `"model": "haiku"`. Ao trocar um, revisar o outro. |
| **Projeto sobrescreve global** | `.claude/settings.json` (projeto) vence `~/.claude/settings.json` (global). O global tem `"opus[1m]"`, mas quem manda é o do projeto. |
| **Chips ≠ persistência** | Ajuste no dashboard some no restart. Sempre espelhar no `config.json`. |
| **Restart derruba a sessão** | O proxy é o `ANTHROPIC_BASE_URL` da sessão viva. |
| **Dashboard sem auth** | Só loopback por padrão. **Não** setar `HOST=0.0.0.0` — expõe contexto capturado das requests sem autenticação. |
| **Número lido de imagem** | Sempre re-derivar da fonte. Já causou erro factual nesta própria investigação. |
| **Economia ≠ tokens salvos** | Olhar R:C, não o contador "Input tokens saved". |

---

## 📎 Relacionados

- [`COST-OPTIMIZATION.md`](COST-OPTIMIZATION.md) — hierarquia de modelos (escopo: **GitHub Copilot**, assunto distinto deste doc)
- `.claude/CONTINUATION.md` — handoff de sessão (gitignored, efêmero)
- `pxpipe --help` — env vars completas
