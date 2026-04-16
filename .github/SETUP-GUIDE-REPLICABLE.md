# 🚀 Copilot Instructions Setup Guide — Replicable Template

> **How to Setup Perfect Copilot Instructions in ANY Project**
>
> Based on OffshoreProz v10.1 (MÁXIMA OTIMIZAÇÃO + 18+ SKILLS)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Customization by Project Type](#customization-by-project-type)
4. [Verification Checklist](#verification-checklist)
5. [Maintenance & Updates](#maintenance--updates)

---

## Quick Start

**For experienced developers:** Copy-paste this into your `.github/copilot-instructions.md`:

```markdown
# [PROJECT_NAME] - Copilot Instructions (v1.0 - OTIMIZADO)

> **[Your Tech Stack]** · Claude Haiku/Sonnet/Opus · [Your Framework]

---

[Copy content from OffshoreProz copilot-instructions.md, replacing placeholders]
```

**For step-by-step guide:** Continue below ⬇️

---

## Step-by-Step Setup

### Phase 1: Foundation (5 min)

#### 1.0 Check If Your Instructions Are Auto-Generated

Before editing anything, detect if your repo generates `.github/copilot-instructions.md` from docs/scripts.

If yes:

- Treat `.github/copilot-instructions.md` as generated output.
- Edit the source docs (for example `docs/` or `.claude/docs/`).
- Run the sync/build script that regenerates instructions.
- Never keep manual changes only in the generated file.

#### 1.1 Create Directory Structure

```bash
cd your-project/
mkdir -p .github
touch .github/copilot-instructions.md
```

#### 1.2 Add Basic Header

```markdown
# [PROJECT_NAME] - Copilot Instructions (v1.0)

> **[Stack: Next.js · Node.js · React Native · etc]** · Claude Haiku/Sonnet/Opus

---
```

**Customize:**

- Replace `[PROJECT_NAME]` with your project name
- Replace `[Stack: ...]` with your actual tech stack
- Keep consistent with your docs/README.md tech stack description

---

### Phase 2: Cost Optimization (10 min)

#### 2.1 Add Model Selection Strategy

Copy the **"💰 COST OPTIMIZATION"** section from OffshoreProz:

```markdown
## 💰 COST OPTIMIZATION — ESTRATÉGIA DEFINITIVA

### 🧠 Seleção de Modelo por Custo/Qualidade

**REGRA FUNDAMENTAL:** `Haiku 4.5 (70%) → Sonnet 4.6 (28%) → Opus 4.6 (2%)`

#### ✨ **HAIKU 4.5** (70% das tarefas — PADRÃO)

...
```

**When to customize:**

- Different Claude models? Update percentages based on YOUR task mix
- Different price sensitivity? Adjust thresholds
- Different context? Adapt examples to your domain

**Default works for:** 95% of projects (only change if radical difference)

Add this explicit model policy (recommended to copy as-is):

```markdown
### Model Policy (Hard Rules)

| Modelo | Uso-alvo | Gatilho de entrada | Gatilho de saída |
| --- | --- | --- | --- |
| Haiku 4.5 | 70% | pergunta simples, docs, logs | precisa implementar/refatorar código |
| Sonnet 4.6 | 28% | edição 1-3 arquivos, bug claro | complexidade 5+ arquivos ou falha 2x |
| Opus 4.6 | 2% | alta complexidade/criticidade | encerrar após resolução, não manter como padrão |

Escalonamento obrigatório: Terminal/Docs/Skills -> Haiku -> Sonnet -> Opus
```

This avoids vague model selection and makes the setup portable across teams.

#### 2.1.1 Add Vendor Mapping (Required)

Keep a vendor-agnostic escalation policy, but also add the concrete model mapping for your active assistant stack.

Example (GitHub Copilot mapping used in this repo):

```markdown
| Faixa | Modelo | Uso |
| --- | --- | --- |
| 0x | GPT-5 mini | docs/search/explicações curtas |
| 0x | GPT-4.1 | edições controladas |
| 0x | Raptor mini | boilerplate/completions |
| 1x | GPT-5.3-Codex | implementação/refatoração multi-arquivo |
```

This avoids policy drift between generic guidance and real runtime behavior.

---

#### 2.2 Add Pre-IA Checklist

```markdown
### ⚡ CHECKLIST PRÉ-IA (GANHA MAIS QUE DEPLOY)

**ANTES de chamar QUALQUER modelo de IA, SEMPRE fazer isso:**

☐ Problema é respondível por grep/terminal?
☐ Documentação já responde?
☐ Padrão existente já resolveu?
☐ Contexto atual suficiente?
☐ É realmente preciso IA agora?
```

**Never customize:** This is universal and saves 40-50% tokens

---

#### 2.3 Add Smart Routing Block (Decision First)

Add this structure right after cost optimization:

```markdown
## 🎯 SMART ROUTING — Onde chamar IA (Decision First)

1. Terminal first (`rg`, `git`, `npm run`)
2. Docs second (`docs/`, `README`)
3. Skills third (`/deploy`, `/qa`, `/review-pr`)
4. IA last (Haiku -> Sonnet -> Opus)
```

This section is crucial for consistent 75%+ savings across teams.

---

#### 2.4 Add Context Efficiency Table

Create 2 small tables:

1. **Anti-patterns** (re-read files, vague search, sequential edits)
2. **Economic patterns** (regex search, batch edits, parallel reads)

This makes optimization actionable and easier to enforce in reviews.

---

### Phase 3: Skills Integration (15 min)

#### 3.1 Audit Your Available Skills

```bash
ls -la ~/.claude/skills/
```

**Which skills does your project use?**

- React project? → Include `/vercel-react-best-practices`
- Frontend? → Include `/ui-ux-pro-max`, `/frontend-design`
- Cloudflare? → Include `/cloudflare-web-perf`, `/cloudflare-workers-best-practices`
- All? → Include everything (doesn't hurt)

#### 3.2 Create Skills Reference Table

From OffshoreProz, adapt this table for YOUR project:

```markdown
## 🎁 SKILLS REFERENCE

| Skill                           | When to Use         | Saves |
| ------------------------------- | ------------------- | ----- |
| `/deploy`                       | Ready to deploy     | –80%  |
| `/commit`                       | Committing changes  | –70%  |
| `/qa`                           | Testing before prod | –60%  |
| `/ui-ux-pro-max`                | Designing new UI    | –70%  |
| `/vercel-react-best-practices`  | React optimization  | –65%  |
| ... (add all applicable skills) |
```

#### 3.3 Add Project-Specific Workflows

Example for **Next.js project**:

```markdown
### 📦 FEATURE WORKFLOW (Economia: ~75%)

1. PLANNING
   └─ /plan-eng-review (lock architecture)

2. DESENVOLVIMENTO
   ├─ Code changes
   └─ /vercel-react-best-practices

3. DESIGN (if UI)
   └─ /ui-ux-pro-max

4. CODE REVIEW
   └─ /review-pr

5. TESTING
   ├─ /qa
   └─ /gstack (optional)

6. SHIP
   ├─ /commit
   ├─ /bump-version
   └─ /deploy
```

**Replace with YOUR project's actual workflow**

#### 3.4 Add /mem-search to Skills (if Claude-Mem is used)

If your team uses Claude-Mem, add `/mem-search` to Skills Reference:

```markdown
| `/mem-search` | Search historical project memory | –60% |
```

Document the retrieval flow to avoid token waste:

1. `search` (compact index)
2. `timeline` (chronology)
3. `get_observations` (details only for selected IDs)

Use this operating rule:

```markdown
Never call get_observations on all results.
Always filter by IDs from search first.
```

---

### Phase 4: Project-Specific Configuration (15 min)

#### 4.1 Add Imports & Patterns Section

```markdown
## 🗺️ QUICK START — Imports & Padrões

### Imports Principais

[Your main imports from lib/, components/]

### Padrões Obrigatórios

[Your stack's rules: API routes, components, DB, etc]
```

**Customize these FULLY:**

- Copy your most common imports
- Add YOUR naming conventions
- Add YOUR database patterns
- Add YOUR component patterns

---

#### 4.2 Add API/Component Templates

From OffshoreProz:

```markdown
## 🔧 Template [API Route / Component / Worker / etc]

[Code Template for YOUR project's standard]
```

**Template should show:**

- Correct structure for YOUR project
- Common imports
- Error handling patterns
- Validation patterns (Zod, etc)

---

#### 4.3 Add Map of Your Codebase

From OffshoreProz:

```markdown
## 🗺️ MAPA RÁPIDO — Find Anything Fast

| Searching for... | Location                        |
| ---------------- | ------------------------------- |
| Database schema  | docs/database/ or schema.sql    |
| API endpoints    | docs/api/ or app/api/           |
| Components       | docs/components/ or components/ |
| ...              | ...                             |
```

**Critical customization:**

- What are YOUR main directories?
- Where are YOUR docs stored?
- What are YOUR most-asked questions?

---

#### 4.4 Add Mandatory Checklists

From OffshoreProz, adapt:

```markdown
## 📋 CHECKLISTS

### When Creating New [Feature/API/Component/etc]

- [ ] Follow [YOUR_PATTERN]
- [ ] Add [YOUR_VALIDATION]
- [ ] Test with [YOUR_METHOD]
- [ ] Document in [YOUR_DOCS_LOCATION]
- [ ] Deploy with [YOUR_DEPLOY_COMMAND]
```

**Customize COMPLETELY for YOUR project**

---

### Phase 5: Verification & Testing (10 min)

#### 5.1 Test File Syntax

```bash
cd your-project/
cat .github/copilot-instructions.md | head -50
# Should show your project name, stack, cost strategy
```

#### 5.2 Verify Links (if any)

All `docs/` references should exist:

```bash
ls -la docs/database/ docs/api/ docs/components/ 2>/dev/null || echo "⚠️ Some docs missing"
```

#### 5.3 Test with Copilot

Ask Copilot simple questions:

```
Q: "Qual é o esquema da tabela [YOUR_TABLE]?"
→ Should find in docs/

Q: "Como criar um novo endpoint?"
→ Should reference /app/api/ or your API template

Q: "Quais skills tenho disponíveis?"
→ Should list from your Skills Reference section
```

✅ **If these work, you're golden!**

#### 5.4 Validate Cost Routing with 5 Real Prompts

Use these prompts as smoke tests:

1. "Onde está função X?" -> should route to terminal/grep
2. "Qual é o schema da tabela Y?" -> should route to docs
3. "Revisa meu PR" -> should suggest `/review-pr`
4. "Explique esse código curto" -> should default to Haiku
5. "Refatore 6 arquivos" -> should escalate to Opus

If 4/5 pass, your setup is production-ready.

#### 5.5 Generate Expert Audit (Mandatory)

Create or update `.github/COPILOT-EXPERT-AUDIT.md` with:

1. Executive verdict (Approved / Approved with conditions / Blocked)
2. Criteria checklist with PASS/FAIL and evidence
3. Residual risks and mitigations
4. Acceptance checklist
5. Recommendation and next review date

Treat this file as the release gate for instruction quality.

---

## Memory Layer (Replicable Pattern)

### Why this matters

Cost optimization is not just model routing; memory avoids paying to rediscover the same context.

### Layer 1: Native memory (`/memory`)

- Built-in, low-maintenance, enabled by default
- Store concise project facts and recurring corrections
- Keep memory index short; move details to topic files

### Layer 2: Claude-Mem + `/mem-search` (optional)

Install using one of the official paths:

```bash
npx claude-mem install
# or
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Do NOT use `npm install -g claude-mem` for full plugin setup.

Validation checklist:

- [ ] Worker healthy (`http://localhost:37777/health`)
- [ ] Web viewer opens (`http://localhost:37777`)
- [ ] Search flow works (`search` -> `timeline` -> `get_observations`)

### Memory Query Protocol (Expert)

Apply this protocol in every project that has Claude-Mem:

1. Search phase: narrow query + filters (type/date/project)
2. Context phase: timeline around the 2-5 most relevant IDs
3. Detail phase: get_observations only for shortlisted IDs
4. Action phase: translate findings into patch + test plan

Success criteria:

- Historical root cause found in under 2 queries
- No full-database dump behavior
- Lower token usage than manual long-context prompts

When to use `/mem-search`:

- Recurring bugs
- Legacy onboarding
- Regression investigations
- Post-mortem knowledge recovery

---

## Customization by Project Type

### 🌐 Next.js / React SPA Project

**Include these sections:**

- `/vercel-react-best-practices` (CRITICAL)
- `/ui-ux-pro-max` (if design matters)
- `/vercel-composition-patterns` (if scaling)
- `/cloudflare-web-perf` (if perf matters)

**Template API Route:**

```tsx
export const runtime = "edge";
// Use server functions, avoid client processing
```

**Key checklist item:**

```
- [ ] Server vs Client Decision: Does this need SSR/ISR?
- [ ] Data Fetching: Best practice pattern used?
- [ ] Bundle impact: Any large imports added?
```

---

### ☁️ Cloudflare Workers / Edge Project

**Include these sections:**

- `/cloudflare-workers-best-practices` (CRITICAL)
- `/cloudflare-wrangler` (for deployment)
- `/cloudflare-web-perf` (for monitoring)

**Template Worker:**

```typescript
export default {
  async fetch(request: Request) {
    // Fetch is optimal for Workers
  },
};
```

**Key checklist item:**

```
- [ ] No blocking operations?
- [ ] Secrets not logged?
- [ ] Bindings configured in wrangler.toml?
```

---

### 🎨 React Native / Mobile Project

**Include these sections:**

- `/ui-ux-pro-max` (design + UX)
- `/vercel-react-best-practices` (many concepts apply)
- `/plan-eng-review` (architecture heavy)

**Template Component:**

```typescript
// Mobile-first design
// No web-specific APIs
// Performance-conscious animations
```

---

### 🔌 Python / Backend API Project

**Include these sections:**

- `/plan-eng-review` (architecture planning)
- `/web-design-guidelines` (if REST API design)
- Create backend-specific skills section

**Add to checklist:**

```
- [ ] Type hints present?
- [ ] Docstrings complete?
- [ ] Error handling comprehensive?
```

---

### 📦 Library / Package

**Include these sections:**

- `/plan-ceo-review` (API design)
- `/vercel-composition-patterns` (composability + interface)
- `/web-design-guidelines` (DX = user experience)

**Key section: API Design**

```
## API Design Standards

- Exports: [main entry points]
- Types: [exported types]
- Examples: [common usage]
```

---

## Verification Checklist

Before considering your copilot-instructions.md "done":

```
File Structure:
☐ File exists at .github/copilot-instructions.md
☐ File is readable (no syntax errors in markdown)
☐ Project name in header
☐ Tech stack in header

Content Sections:
☐ Cost Optimization (Haiku/Sonnet/Opus breakdown)
☐ Smart Routing (terminal/docs/skills/IA)
☐ Pre-IA Checklist section
☐ Context Efficiency (anti-patterns + economic patterns)
☐ Skills Reference table
☐ /mem-search included (if Claude-Mem is used)
☐ Project-specific workflows
☐ Imports & Patterns for YOUR stack
☐ API/Component templates
☐ Mapa Rápido (find anything fast)
☐ Mandatory checklists

Links & References:
☐ All docs/ references exist
☐ All lib/ imports are real
☐ All patterns match your actual codebase

Testing:
☐ Asked Copilot 3 test questions
☐ Ran 5 cost-routing prompts (terminal/docs/skills/model)
☐ Copilot correctly referenced sections
☐ Copilot used skills appropriately
```

✅ **All checked? Your copilot is ready for the team!**

---

## Maintenance & Updates

### When to Update copilot-instructions.md

**Weekly Checks:**

- New skill released? Add to Skills Reference
- Codebase structure changed? Update Mapa Rápido
- New pattern adopted? Add to Templates

**Monthly Reviews:**

- Cost metrics: Are you hitting 75% savings?
- Skill usage: Which skills are actually used?
- Feedback: Team suggestions?

**Quarterly Overhauls:**

- Archive old patterns
- Update tech stack header if changed
- Refresh examples (should be current code)
- Add lessons learned from 3 months usage

---

### Version Bumping

```
v1.0 → v1.1: Skill added or section clarified
v1.1 → v2.0: Major structure change or stack upgrade
```

Keep version in header:

```markdown
# [PROJECT] - Copilot Instructions (v1.2 - [DESCRIPTION])
```

---

## 📊 Expected Outcomes

After implementing this setup:

| Metric                     | Before              | After        | Savings    |
| -------------------------- | ------------------- | ------------ | ---------- |
| Avg cost per feature       | ~$2.50 (all Sonnet) | ~$0.62       | –75%       |
| Time to context setup      | ~3min               | ~30s         | –90%       |
| Skills utilization         | 0%                  | ~50%+        | N/A        |
| Code quality issues caught | ~60%                | ~85%         | +25%       |
| Developer satisfaction     | Baseline            | Baseline+40% | Subjective |

---

## 🎓 Teaching Others

To teach your team:

```
1. Share this guide + your project's copilot-instructions.md
2. Run through verification checklist together
3. Show 3 examples of skills in action
4. Practice one workflow together (/deploy or /qa)
5. Let them use copilot for 1 task
6. Debrief: Did skills help? What questions?
```

**Golden rule:** Skills > IA for specific tasks. Always.

---

## 🔗 References

- OffshoreProz copilot-instructions.md (source)
- Claude Skills documentation (`~/.claude/skills/*/SKILL.md`)
- Project README.md & docs/ (customize from these)

---

**Last Updated:** 2026-04-15  
**Version:** 1.2  
**Author:** GitHub Copilot (GPT-5.3-Codex)
