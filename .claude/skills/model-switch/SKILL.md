# Model Switch — Haiku ↔ Sonnet ↔ Opus

Quick switching between 3 models for optimal token economy + quality.

---

## /haiku

Switch to Haiku (default, 70% economy).

**Use for:**
- Feature implementation (components, pages, hooks)
- Simple bug fixes (obvious cause)
- Tests & QA (unit tests, Playwright)
- Documentation (README, comments, CHANGELOG)
- Simple refactor (imports, renaming)
- Deploy & git operations

**Tokens**: ~30-40k/session

---

## /sonnet

Switch to Sonnet (50% cheaper than Opus, 99% quality).

**Use for:**
- Feature with complex state (intricado)
- Multi-domain (worker + frontend)
- Moderate debugging (non-obvious cause)
- Code review with performance focus
- Structural refactor (multiple files)

**Tokens**: ~10-12k/session

---

## /opus

Switch to Opus (100% quality, critical only).

**Use for:**
- Architecture plan (roadmap, multi-sprint)
- Critical decision (pivot, deprecation, security)
- Blocking debug (race condition, incompatibility)
- Paranóico code review (/review-pr)

**Tokens**: ~2-4k/session

---

## /auto-detect

Run the UserPromptSubmit hook manually to re-analyze current task and get a suggestion.

---

## How it works

Each command edits `.claude/settings.json` → `"model"` key.

**Before**:
```json
{
  "model": "haiku"
}
```

**After `/sonnet`**:
```json
{
  "model": "sonnet"
}
```

Effective immediately in the current Claude Code session.

---

## Golden Rules

1. **Start with Haiku** — switch only if needed
2. **Context before model** — try `/mem-search` before switching
3. **Sonnet is the midpoint** — never skip from Haiku to Opus
4. **Opus is rare** — ~5% of tasks only

---

## Complete Workflow

```
# Task arrives
1. UserPromptSubmit hook analyzes → suggests model
2. Accept suggestion or type /haiku, /sonnet, /opus
3. Work normally
4. At commit: model used is logged in session-state.md
5. Every 6h: snapshot task shows Haiku% vs Sonnet% vs Opus%
```

---

## Settings Reference

Full strategy in: `.claude/docs/model-switching-strategy.md`

Auto-detection keywords:
- "plano", "arquitetura", "roadmap" → `/opus`
- "debug", "race condition", "incompatibilidade" → `/sonnet`
- "review-pr", "paranóico", "security audit" → `/opus`
- "worker + frontend", "múltiplos domínios" → `/mem-search` first
- (default) → `/haiku`

---

**Status**: ✅ ATIVO
**Integrated with**: SessionStart hook, mem-search, scheduled snapshot 6h
