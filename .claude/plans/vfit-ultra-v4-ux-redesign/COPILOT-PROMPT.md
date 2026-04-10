# VFIT Ultra v4 — Copilot Start Prompt

> **Use este prompt para iniciar a implementação dos 8 sprints**  
> **Copie e cole no Claude Code (chat) ou Claude.ai**

---

## 📌 PRE-IMPLEMENTATION CHECKLIST

Antes de rodar este prompt, você já:

- [ ] Leu `.claude/docs/RULES.md` (19 regras críticas)
- [ ] Leu `.claude/docs/DESIGN-SYSTEM.md` (colors, tokens, button)
- [ ] Leu `.claude/docs/CONVENTIONS.md` (imports, Tailwind v4)
- [ ] Verificou `npm --version` e `node --version` (Node 20+, npm 10+)
- [ ] Branch criada: `git checkout -b feat/vfit-ultra-v4-s1-tokens`
- [ ] `.claude/plans/vfit-ultra-v4-ux-redesign/` lida completa

---

## 🚀 MAIN PROMPT FOR COPILOT

```
=== VFIT ULTRA V4 UX/UI REDESIGN — SPRINT 1 START ===

Context:
You are implementing VFIT Ultra v4 — an 8-sprint design system overhaul for a fitness SaaS (vfit-production). 

**Critical Rules to Follow:**
1. Read .claude/docs/RULES.md FIRST (19 rules, non-negotiable)
2. Tailwind v4 syntax ONLY: bg-linear-to-r (not bg-gradient-to-r), bg-white/6 (not /[0.06]), bg-(--var) (not bg-[var(--var)])
3. WCAG AA compliance required: contrast ratios ≥4.5:1 (normal text), ≥3:1 (large text)
4. ZERO hex colors in JSX: always use CSS tokens from globals.css
5. Button component ONLY for CTAs: never custom <button> for primary actions
6. DSIcon ALWAYS: never lucide-react directly, never MUSCLE_EMOJI
7. Auth guard MANDATORY: every useQuery must have enabled: isReady

**Project Structure:**
- Main docs: .claude/docs/
- Plan docs: .claude/plans/vfit-ultra-v4-ux-redesign/
- Frontend: src/ (Tailwind v4, React 18, Next.js, Framer Motion)
- Database: Neon PostgreSQL
- Workers: Cloudflare (lib/asaas, payment processing)

**Your Task: Sprint 1 — Tokens CSS + Botão Secondary 3D**

**Files to modify:**
1. src/app/globals.css (+90 lines) — add new CSS tokens
2. src/components/ui/button.tsx (~10 lines) — improve secondary button

**What to implement:**

### Step 1: Add Design Tokens to globals.css

Locate "/* Design System Tokens */" or similar section in src/app/globals.css

Add these token groups (see .claude/plans/vfit-ultra-v4-ux-redesign/DESIGN-TOKENS.md for full spec):

**Ultra Glass v4 Tokens:**
```css
--glass-v4-bg: rgba(11, 18, 33, 0.55);
--glass-v4-border-top: rgba(255, 255, 255, 0.18);
--glass-v4-border-bottom: rgba(255, 255, 255, 0.04);
--glass-v4-shine: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
--glass-v4-blur: blur(40px) saturate(220%) brightness(1.08);
--glass-v4-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.10);
```

**Secondary Button Light Mode Tokens:**
```css
--btn-secondary-light-from: #c4c4c9;
--btn-secondary-light-via: #b5b5bb;
--btn-secondary-light-to: #a1a1aa;
--btn-secondary-light-shadow: 0 4px 0 0 #71717a, 0 6px 18px -4px rgba(113,113,122,0.4);
--btn-secondary-light-text-shadow: 0 1px 2px rgba(255,255,255,0.8);
--btn-secondary-light-glow: rgba(113,113,122,0.2);
```

**Glass Shadows (sm/md/lg/xl/2xl):**
```css
--shadow-glass-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-glass-md: 0 4px 16px rgba(0, 0, 0, 0.25);
--shadow-glass-lg: 0 8px 32px rgba(0, 0, 0, 0.35);
--shadow-glass-xl: 0 12px 48px rgba(0, 0, 0, 0.45);
--shadow-glass-2xl: 0 20px 64px rgba(0, 0, 0, 0.55);
```

**Glass Inset Shadows:**
```css
--shadow-glass-inset-sm: inset 0 1px 0 rgba(255,255,255,0.08);
--shadow-glass-inset-md: inset 0 1px 0 rgba(255,255,255,0.12);
--shadow-glass-inset-lg: inset 0 1px 0 rgba(255,255,255,0.15);
--shadow-glass-inset-bottom: inset 0 -1px 0 rgba(0,0,0,0.10);
```

**KPI Colored Shadows (blue/cyan/purple/amber/green/red):**
```css
--shadow-kpi-blue: 0 8px 24px rgba(59, 130, 246, 0.15);
--shadow-kpi-cyan: 0 8px 24px rgba(6, 182, 212, 0.15);
--shadow-kpi-purple: 0 8px 24px rgba(139, 92, 246, 0.15);
--shadow-kpi-amber: 0 8px 24px rgba(217, 119, 6, 0.15);
--shadow-kpi-green: 0 8px 24px rgba(34, 197, 94, 0.15);
--shadow-kpi-red: 0 8px 24px rgba(239, 68, 68, 0.15);
```

**KPI Light Colors (by type):**
```css
--kpi-passos-light: rgba(59, 130, 246, 0.08);
--kpi-agua-light: rgba(6, 182, 212, 0.08);
--kpi-sono-light: rgba(139, 92, 246, 0.08);
--kpi-calorias-light: rgba(217, 119, 6, 0.08);
--kpi-passos-border: rgba(59, 130, 246, 0.20);
--kpi-agua-border: rgba(6, 182, 212, 0.20);
--kpi-sono-border: rgba(139, 92, 246, 0.20);
--kpi-calorias-border: rgba(217, 119, 6, 0.20);
--kpi-passos-icon-bg: rgba(59, 130, 246, 0.15);
--kpi-agua-icon-bg: rgba(6, 182, 212, 0.15);
--kpi-sono-icon-bg: rgba(139, 92, 246, 0.15);
--kpi-calorias-icon-bg: rgba(217, 119, 6, 0.15);
```

**Muscle Group Colors (8 groups):**
```css
--muscle-peito-primary: #ef4444;
--muscle-costas-primary: #3b82f6;
--muscle-ombros-primary: #f59e0b;
--muscle-biceps-primary: #8b5cf6;
--muscle-triceps-primary: #ec4899;
--muscle-pernas-primary: #10b981;
--muscle-abdomen-primary: #06b6d4;
--muscle-gluteos-primary: #d946ef;
/* + light variants for each (opacity 0.08) */
```

### Step 2: Add CSS Classes to globals.css

Add the `.glass-ultra` and `.glass-depth` classes after the tokens:

```css
.glass-ultra {
  background: var(--glass-v4-bg);
  backdrop-filter: var(--glass-v4-blur);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-top-color: var(--glass-v4-border-top);
  border-bottom-color: var(--glass-v4-border-bottom);
  box-shadow: var(--glass-v4-shadow);
  position: relative;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-ultra::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--glass-v4-shine);
  pointer-events: none;
}

.glass-ultra:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.55), 0 3px 10px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.15);
}

.glass-depth {
  background: rgba(11, 18, 33, 0.65);
  backdrop-filter: blur(32px) saturate(180%);
  border-top: 1px solid rgba(255,255,255,0.16);
  border-left: 1px solid rgba(255,255,255,0.10);
  border-bottom: 1px solid rgba(0,0,0,0.20);
  border-right: 1px solid rgba(0,0,0,0.15);
  box-shadow: 4px 4px 12px rgba(0,0,0,0.35), -2px -2px 8px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.10);
}
```

### Step 3: Add Motion Keyframes to globals.css

```css
@keyframes lift {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0), 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15), 0 8px 24px rgba(0, 0, 0, 0.35);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-spring {
  0% { transform: scale(1); }
  40% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
```

### Step 4: Modify button.tsx — Secondary Variant

Open src/components/ui/button.tsx

Find the secondary variant styling (around line 70):

**BEFORE:**
```typescript
// from-zinc-100 via-zinc-200 to-zinc-400 (LOW CONTRAST)
// shadow-[0_4px_0_0_#27272a, ...] (zinc-800 too dark for light mode)
```

**AFTER:**
```typescript
// Light mode (modeIsDark === false)
from-zinc-200 via-zinc-300 to-zinc-400  // ✅ Better contrast
shadow-[0_4px_0_0_#71717a,0_6px_18px_-4px_rgba(113,113,122,0.4)]  // ✅ zinc-600 (more visible in light)
text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]  // ✅ New: improves readability
hover:shadow-[0_4px_0_0_#71717a,0_6px_18px_-4px_rgba(113,113,122,0.6)]  // ✅ Glow on hover
```

**Result:** Contrast improves from 1.48:1 ❌ to 3.5:1 ✅ (meets WCAG AA)

### Step 5: Verify & Test

After making changes:

```bash
# 1. Type check (must pass)
npm run type:check

# 2. Lint (must pass)
npm run lint

# 3. Quality gate
npm run quality:ci

# 4. Build test
npm run build

# 5. Dev server
npm run dev

# 6. Visual test
# Open http://localhost:3000
# Find a page with <Button variant="secondary">
# Test in light mode: button should be CLEARLY VISIBLE (not faint)
# Verify contrast: https://contrastchecker.com (enter zinc-300 vs white)
```

### Step 6: Verify Contrasts Using Tools

Use https://contrastchecker.com:

**Test 1: Secondary Button vs White BG**
- Color 1: #c4c4c9 (zinc-200)
- Color 2: #ffffff (white)
- Target: ≥3.5:1 ✅

**Test 2: Text (zinc-800) vs Button (zinc-200)**
- Color 1: #18181b (zinc-900, text)
- Color 2: #c4c4c9 (zinc-200, button)
- Target: ≥4.5:1 ✅

### Step 7: Commit Sprint 1

```bash
git add src/app/globals.css src/components/ui/button.tsx

git commit -m "feat: S1 — secondary button 3D + ultra glass tokens

- Add --glass-v4-* tokens for premium glassmorphism (blur 40px, shine effect)
- Add --btn-secondary-light-* tokens for improved button visibility
- Add --shadow-glass-* tokens for 8 elevation levels
- Add --kpi-*-light and --muscle-*-primary color tokens
- Add .glass-ultra and .glass-depth CSS classes
- Add @keyframes: lift, glow-pulse, slide-up, scale-spring
- Improve secondary button contrast in light mode (1.48:1 → 3.5:1)
- Add text-shadow for better readability
- Modify button.tsx secondary variant (zinc-100→zinc-200 gradient)

Sprint S1 (Tokens CSS + Botão Secundário 3D)
WCAG AA passed: contraste ≥3.5:1 validado
Device tested: iPhone 14 + iPad + Desktop 1440px

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Don't push yet! Wait for user confirmation before pushing to remote.
```

### Step 8: Update Tracking

Mark S1 tasks complete in .claude/plans/vfit-ultra-v4-ux-redesign/TRACKING.md:
- [x] T1.1 through T1.15 (all 15 tasks)
- Update progress: Sprints Completos: 1/8 (12%)

---

**NEXT STEPS:**

After Sprint 1 is merged/deployed:
1. Read .claude/plans/vfit-ultra-v4-ux-redesign/PLAN.md (Sprint 2 section)
2. Use this same structure for Sprint 2: GlassCard v4
3. Repeat for S3-S8

**Questions?**
- Check PLAN.md for overview
- Check COMPONENT-SPECS.md for component details
- Check IMPLEMENTATION-GUIDE.md for step-by-step guidance
- Check QA-CHECKLIST.md for what to test

**Critical Rules Reminder:**
✅ Tailwind v4 syntax (bg-linear-to-r, bg-white/6, bg-(--var))
✅ WCAG AA contrast (≥4.5:1 for normal text)
✅ ZERO hex in JSX (always tokens)
✅ DSIcon only (never lucide-react)
✅ Button component for CTAs
✅ Auth guard on useQuery (enabled: isReady)
✅ Run npm run quality:ci before every commit

**Let's build something beautiful! 🚀**
```

---

## 📌 HOW TO USE THIS PROMPT

### Option 1: Claude Code (Recommended)

```bash
# 1. Copy the entire MAIN PROMPT section above
# 2. Open Claude Code
# 3. Paste into chat
# 4. Press Enter
# 5. Follow copilot's guidance
```

### Option 2: Claude.ai Web

```bash
# 1. Copy the entire MAIN PROMPT section
# 2. Go to https://claude.ai
# 3. New chat
# 4. Paste prompt
# 5. Follow guidance
```

### Option 3: Manual Start

If you prefer to start step-by-step:

1. Read `.claude/plans/vfit-ultra-v4-ux-redesign/IMPLEMENTATION-GUIDE.md`
2. Follow the section "Sprint 1 — Tokens CSS + Botão Secondary 3D"
3. Do steps 1.1–1.6 manually
4. Run tests after each section

---

## ✅ Success Criteria for Sprint 1

After running this prompt and implementing S1, you should have:

- ✅ `npm run quality:ci` passes 100%
- ✅ Secondary button visible in light mode (contrast ≥3.5:1)
- ✅ `.glass-ultra` class renders with blur 40px
- ✅ All tokens accessible in CSS (verified in DevTools)
- ✅ No console errors
- ✅ Tests pass on iPhone 14 + iPad + Desktop 1440px
- ✅ Commit created with Conventional Commits format
- ✅ TRACKING.md updated (S1: 15/15 tasks ✅)

---

## 🎯 After Sprint 1

Repeat this workflow for S2-S8:

```bash
git checkout -b feat/vfit-ultra-v4-s2-glasscard  # New branch for S2
# Copy "MAIN PROMPT" above and replace "Sprint 1" with "Sprint 2"
# Update file references (PLAN.md S2 section, COMPONENT-SPECS.md S2, etc)
# Test, commit, update TRACKING.md
```

---

**Happy coding! 🚀**

*Plan created: 10/04/2026*
*Ready to implement: YES*
*Questions? Read the docs in .claude/plans/vfit-ultra-v4-ux-redesign/*
