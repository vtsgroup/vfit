# Cost Optimization — GitHub Copilot

> **Seção exclusiva para GitHub Copilot.** Claude Code não precisa desta seção.
> Princípio central: Modelos com multiplicador `0×` são ilimitados em planos pagos.

---

## Smart Routing (Hard Rule)

Antes de escolher modelo, seguir SEMPRE esta ordem:

1. Terminal first (`rg`, `git`, `npm run ...`)
2. Docs first (`.claude/docs/`, `README`, padrões existentes)
3. Skills first (`/review-pr`, `/qa`, `/deploy`, etc.)
4. IA last (iniciar em `0×`, escalar só com evidência)

> Esta regra sozinha elimina a maior parte do custo desnecessário.

```text
┌──────────────────────────────────────────────────────────────┐
│                        RECEBE TAREFA                        │
└─────────────────────────────┬────────────────────────────────┘
			      ↓
	┌───────────────────────────────────────────────────┐
	│ 1. TERMINAL/GREP RESPONDE?                       │
	│ → rg, ls, cat, git, npm run, wrangler            │
	│ → NÃO USE IA                                      │
	└───────────────────────────────────────────────────┘
		    ↓ NÃO
	┌───────────────────────────────────────────────────┐
	│ 2. DOCS JÁ TÊM RESPOSTA?                         │
	│ → .claude/docs/, README, padrões existentes       │
	│ → LEIA DOCS                                       │
	└───────────────────────────────────────────────────┘
		    ↓ NÃO
	┌───────────────────────────────────────────────────┐
	│ 3. EXISTE SKILL?                                 │
	│ → /deploy, /qa, /review-pr, /cloudflare-*        │
	│ → USE SKILL                                       │
	└───────────────────────────────────────────────────┘
		    ↓ NÃO
	┌───────────────────────────────────────────────────┐
	│ 4. IA POR ÚLTIMO                                 │
	│ → 0× primeiro, escalar com evidência             │
	└───────────────────────────────────────────────────┘
```

---

## Escalonamento Obrigatório

| Etapa | Modelo | Quando entrar | Quando sair |
|------|--------|---------------|-------------|
| 1 | `GPT-5 mini` (`0×`) | Perguntas rápidas, docs, busca orientada, análise simples | Exige implementação/refatoração real |
| 2 | `GPT-4.1` (`0×`) | Edições pequenas e controladas | Escopo cresceu para multi-arquivo |
| 3 | `Raptor mini` (`0×`) | Boilerplate e completions | Precisa raciocínio de implementação |
| 4 | `GPT-5.3-Codex` (`1×`) | Features/refactors moderados, multi-arquivo | Tarefa concluída ou simplificada |

Regras:

- Não pular do terminal/docs direto para modelo `1×` sem motivo objetivo.
- Escalar somente quando a etapa anterior falhar para o objetivo atual.
- Voltar para `0×` assim que o trabalho voltar a ser simples.

---

## Modelos Zero-Cost (Multiplier `0×`)

| Modelo | Disponível em | Ideal para |
|--------|--------------|------------|
| **GPT-5 mini** | Free · Pro · Pro+ | 90% das tarefas diárias · padrão de fallback |
| **GPT-4.1** | Free · Pro · Pro+ | Código controlado · edições simples |
| **Raptor mini** *(preview)* | Free · Pro · Pro+ | Completions inline · boilerplate |

---

## Hierarquia de Multiplicadores

| Tier | `×` | Modelos |
|------|:---:|---------|
| 🟢 ZERO | `0×` | GPT-5 mini · GPT-4.1 · Raptor mini |
| 🟡 Ultra-baixo | `0.25×` | Grok Code Fast 1 |
| 🟡 Baixo | `0.33×` | Claude Haiku 4.5 · Gemini 3 Flash · GPT-5.1-Codex-Mini |
| 🔵 Padrão | `1×` | Claude Sonnet 4/4.5/4.6 · Gemini 2.5/3/3.1 Pro · GPT-5.1/5.2/5.3-Codex |
| 🔴 Caro | `3×` | Claude Opus 4.5 · Claude Opus 4.6 |
| ⛔ Proibido | `30×` | Claude Opus 4.6 Fast Mode (Pro+ only) |

---

## Decisão por Tipo de Tarefa

| Tarefa | Modelo | `×` |
|--------|--------|:---:|
| Perguntas sobre docs · "onde está X?" | GPT-5 mini | `0×` |
| Explicações conceituais · debugging simples | GPT-5 mini | `0×` |
| Edições CSS · texto · ajustes isolados | GPT-4.1 | `0×` |
| Completions inline · boilerplate | Raptor mini | `0×` |
| Análise de UI · imagens · diagramas | Gemini 3 Flash | `0.33×` |
| Debugging com stack trace claro | Claude Haiku 4.5 | `0.33×` |
| Agentic tasks longas · automações | Grok Code Fast 1 | `0.25×` |
| Refatoração 1–4 arquivos | Claude Sonnet 4.5 / GPT-5.2-Codex | `1×` |
| Features novas · 5–10 arquivos | Claude Sonnet 4.6 / GPT-5.3-Codex | `1×` |
| Raciocínio multi-arquivo (10+) · migrations | Claude Opus 4.6 | `3×` |
| Debug crítico sem contexto | Claude Opus 4.6 | `3×` |

---

## Regras de Economia

**NUNCA use Opus para:** perguntas conceituais, consultas de docs, CSS, ajustes de texto

**Reserve Opus apenas para:** refatorações multi-arquivo (5+), features complexas, migrations, debugging sem contexto

### Regras de Eficiência de Tokens

- Não re-ler arquivo sem necessidade.
- Preferir leitura por ranges úteis.
- Preferir busca com regex específica.
- Agrupar edições em patch único.
- Paralelizar leituras independentes.

### Checklist Pré-IA (Obrigatório)

Antes de chamar qualquer modelo:

- [ ] Resolve em até 30s com terminal (`rg`, `git`, `npm run`)?
- [ ] Já existe resposta em `.claude/docs/` ou `README`?
- [ ] Existe skill para esse fluxo?
- [ ] Já tenho arquivo/erro exato para reduzir contexto?
- [ ] O modelo escolhido é o menor custo que resolve?

### Quando Não Chamar IA

- "Onde está X?" → `rg -n "X"`
- "Build quebrou?" → `npm run build` / `npm run lint` / `npm run type-check`
- "Qual versão?" → `cat package.json`
- "Qual regra de deploy?" → `.claude/docs/DEPLOY.md`

### Estratégia de Contexto (Token Efficiency)

#### Anti-padrões

| Anti-padrão | Custo | Melhor alternativa |
|---|---|---|
| Re-ler arquivo já lido | 3x | Reusar contexto da conversa |
| Leitura ampla sem foco | 5x | Ler apenas ranges úteis |
| Busca vaga | 2x | Regex específica com `rg`/`grep_search` |
| Edição sequencial repetida | 3x+ | Patch único em lote |
| Escalar cedo para `1×` | 8x | Tentar `0×` primeiro |

#### Padrões econômicos

| Padrão | Economia estimada | Como aplicar |
|---|---|---|
| Terminal antes de IA | até 95% | `rg`, `git`, `npm`, `wrangler` |
| Docs antes de IA | até 30% | `.claude/docs/`, README, padrões |
| Paralelizar leituras | até 60% | ler arquivos independentes juntos |
| Batch edits | até 70% | patch único com múltiplas trocas |
| Skills por fluxo | até 80% | `/deploy`, `/qa`, `/review-pr`, etc |

### Checklist Antes de Modelos Premium

- "Qual arquivo / componente exato?"
- "A resposta já está em `.claude/docs/`?"
- "GPT-5 mini já tentou e falhou?"
- "O erro tem stack trace legível?"

> Se qualquer resposta for "sim" → use `0×` ou `0.33×` primeiro.

### Smoke Test de Roteamento (Gate rápido)

Executar estes 5 prompts e validar roteamento:

1. "Onde está função X?" → terminal/grep
2. "Qual o schema da tabela Y?" → docs
3. "Revisa meu PR" → skill (`/review-pr`)
4. "Explique esse trecho curto" → modelo `0×`
5. "Refatore 6 arquivos" → modelo `1×` (ou superior, se realmente necessário)

Critério mínimo: 4/5 corretos.

---

## Skills Reference (Expert-Level)

| Skill | Quando usar | Economia estimada |
|---|---|---|
| `/deploy` | Deploy/release padronizado | 80% |
| `/commit` | Commit message + commit seguro | 70% |
| `/bump-version` | Versionamento sem deploy | 70% |
| `/ship` | Fluxo completo de entrega | 75% |
| `/review-pr` | Review pré-merge focado em bug/runtime | 50% |
| `/review` | Pre-landing review estrutural | 50% |
| `/qa` | QA sistemático (quick/full/regression) | 60% |
| `/gstack` | Dogfooding rápido em browser headless | 60% |
| `/browse` | Navegação e validação visual rápida | 55% |
| `/setup-browser-cookies` | QA autenticado com sessão real | 50% |
| `/cloudflare-web-perf` | Core Web Vitals/Lighthouse/perf | 65% |
| `/cloudflare-workers-best-practices` | Revisão de Workers em produção | 60% |
| `/cloudflare-wrangler` | Comandos/config de Wrangler corretos | 60% |
| `/vercel-react-best-practices` | Otimização React/Next.js | 65% |
| `/vercel-composition-patterns` | Refatoração de composição de componentes | 55% |
| `/ui-ux-pro-max` | Design UI/UX de alta qualidade | 70% |
| `/frontend-design` | Construção visual frontend distinta | 70% |
| `/web-design-guidelines` | Auditoria de UI/acessibilidade/UX | 55% |
| `/plan-eng-review` | Planejamento técnico de execução | 60% |
| `/plan-ceo-review` | Reframing de produto/escopo | 55% |
| `/retro` | Retrospectiva e melhoria contínua | 50% |
| `/gstack-upgrade` | Upgrade do gstack com segurança | 50% |
| `copilot-mem (MCP)` | Busca histórica com memória persistente (quando instalado) | 60% |

---

## Memory Strategy (Auto Memory + Copilot-Mem)

1. Memória nativa (`/memory`)
- Guardar fatos estáveis: comandos, padrões, gotchas recorrentes.
- Manter índice curto e tópico.

2. Copilot-Mem (opcional)
- Instalar com `npm install -g @copilot-mem/mcp-server`.
- Configurar em `settings.json` com `github.copilot.chat.mcpServers`.

3. Fluxo recomendado (MCP)
- `search` para índice compacto.
- `timeline` para contexto cronológico.
- `get_memories` apenas para IDs filtrados.

4. Quando usar Copilot-Mem
- Bugs recorrentes.
- Onboarding em área legada.
- Investigação de regressão.
- Recuperação de contexto pós-incidente.

---

## Workflows Recomendados

### Feature (economia ~75%)

1. Planejar com `/plan-eng-review`
2. Implementar com menor diff possível
3. Otimizar com `/vercel-react-best-practices` (quando React/Next)
4. Revisar com `/review-pr`
5. Testar com `/qa` ou `/gstack`
6. Entregar com `/commit` + `/deploy`

### Bugfix (economia ~65%)

1. Reproduzir com terminal e logs
2. Corrigir com escopo mínimo
3. Validar com `/qa` modo quick
4. Entregar com fluxo de release aprovado do projeto

### UI/UX (economia ~70%)

1. Estratégia com `/plan-ceo-review`
2. Implementar com `/ui-ux-pro-max` + `/frontend-design`
3. Auditar com `/web-design-guidelines`
4. Testar visual com `/gstack`/`/browse`
5. Entregar com fluxo de release aprovado do projeto

### Performance (economia ~80%)

1. Medir com `/cloudflare-web-perf`
2. Corrigir gargalos
3. Revalidar com `/cloudflare-web-perf`
4. Entregar com fluxo de release aprovado do projeto

---

## Project Isolation Guardrails (NUNCA CONFUNDIR PROJETOS)

Regras obrigatórias para evitar mistura entre repositórios:

1. Sempre validar o nome do projeto e paths antes de qualquer ação.
2. Nunca reutilizar comandos de deploy, DB, Workers ou docs de outro projeto sem confirmar equivalência.
3. Tratar IDs, domínios, bindings, tabelas e scripts como project-specific por padrão.
4. Se houver dúvida de contexto, pausar e revalidar em `.claude/docs/STACK.md` e `.claude/docs/DEPLOY.md`.

Checklist rápido anti-confusão:

- [ ] Estou no workspace correto?
- [ ] O comando pertence a este projeto?
- [ ] O arquivo/endpoint existe neste repositório?
- [ ] Os nomes de serviço (D1/KV/R2/Workers) batem com este projeto?

Regra de ouro: cada projeto é uma fonte de verdade independente.

---

## Planos

| Plano | Preço | Premium Requests | Modelos |
|-------|------:|:----------------:|---------|
| **Free** | $0 | 50/mês | Haiku 4.5 · GPT-4.1 · GPT-5 mini · Raptor mini |
| **Pro** | $10/mês | 300/mês | Todos exceto Opus Fast Mode |
| **Pro+** | $39/mês | 1.500/mês | TODOS incluindo Opus Fast Mode |

> Requests `0×` **não consomem** o limite de premium requests.
