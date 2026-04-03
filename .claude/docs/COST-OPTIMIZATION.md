# Cost Optimization — GitHub Copilot

> **Seção exclusiva para GitHub Copilot.** Claude Code não precisa desta seção.
> Princípio central: Modelos com multiplicador `0×` são ilimitados em planos pagos.

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

### Checklist Antes de Modelos Premium

- "Qual arquivo / componente exato?"
- "A resposta já está em `docs/`?"
- "GPT-5 mini já tentou e falhou?"
- "O erro tem stack trace legível?"

> Se qualquer resposta for "sim" → use `0×` ou `0.33×` primeiro.

---

## Planos

| Plano | Preço | Premium Requests | Modelos |
|-------|------:|:----------------:|---------|
| **Free** | $0 | 50/mês | Haiku 4.5 · GPT-4.1 · GPT-5 mini · Raptor mini |
| **Pro** | $10/mês | 300/mês | Todos exceto Opus Fast Mode |
| **Pro+** | $39/mês | 1.500/mês | TODOS incluindo Opus Fast Mode |

> Requests `0×` **não consomem** o limite de premium requests.
