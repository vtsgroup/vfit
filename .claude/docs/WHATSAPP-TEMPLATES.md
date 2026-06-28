# WhatsApp Notification Templates v2.0
> Modern, creative, assertive messaging with technical depth

## Template 1: "ULTRA-MODERNO" (Cinematográfico)
**Uso:** Feature releases, visual redesigns, quando há animações/efeitos
**Tone:** Exciting, technical, visual-focused

```
✨ [FEATURE] — [MODERN ANGLE]

🎬 MAIN COMPONENT
├─ Technical detail 1: specific metrics
├─ Technical detail 2: implementation notes
└─ Technical detail 3: architectural choice

🏆 SECONDARY COMPONENT
├─ What changed
├─ How it performs
└─ Why it matters

🧬 ARCHITECTURE
Core components built:
• Component1 (capability)
• Component2 (capability)

📊 EFFICIENCY
• RTK Economy: X% (Nk → Nk tokens)
• Context Speed: ~Nx mais rápido (est.)

🧪 QUALITY
• Zero console errors
• WCAG-AA verified
• Nx seconds deploy time

🌐 Live: [URL]
```

## Template 2: "DEBUGGED & OPTIMIZED" (Técnico)
**Uso:** Bug fixes, performance improvements, infrastructure changes
**Tone:** Professional, detailed, metrics-driven

```
🔧 Issue Fixed — [SPECIFIC PROBLEM]

⚡ Root Cause
[Technical explanation in 1-2 sentences with specificity]

✅ Solution Applied
[What changed, where, why it works]

📊 Impact
• RTK: X% savings
• Latency: Xms → Xms reduction
• Quality: [metric change]

🧪 Verification
[What was tested, how it was verified]
```

## Template 3: "LEARNING & IMPROVEMENT" (Descoberta)
**Uso:** Investigações, findings, documentation of learnings
**Tone:** Educational, pattern-sharing, actionable

```
🔬 [DISCOVERY] — [INSIGHT TITLE]

📌 What We Found
[Clear statement of finding with evidence]

🎯 Why It Matters
[Business/technical impact]

💡 Actionable Takeaways
• Takeaway 1
• Takeaway 2
• Takeaway 3

📈 Effect on Future Deploys
[How this changes our approach]
```

## Template 4: "INFRASTRUCTURE & SCALE" (Backend/Ops)
**Uso:** Database migrations, worker deployments, infrastructure changes
**Tone:** Detailed, metrics-heavy, risk-aware

```
🚀 Infrastructure Update — [COMPONENT]

📊 Current State → New State
[Before metrics] → [After metrics]

🔍 Technical Details
• Migration: [specifics]
• Rollback path: [safety plan]
• Monitoring: [what we're watching]

⏱️ Timeline
• Deployment: Xs
• Verification: Xs
• Full effect: [duration]

📈 RTK Impact
• Token savings: X%
• Context speedup: ~Nx
• CI improvements: [notes]
```

## Meta Rules

### When to use each:
1. **Visual/UX changes** → Template 1 (Cinematográfico)
2. **Bug fixes/performance** → Template 2 (Técnico)
3. **Learnings/discoveries** → Template 3 (Learning)
4. **Infrastructure/ops** → Template 4 (Infrastructure)

### Always include:
- ✅ RTK economy (actual % or "no impact")
- ✅ Claude-mem context speedup (if applicable)
- ✅ Quality metrics (errors, warnings, test coverage)
- ✅ Live URLs (where applicable)
- ✅ Why it matters (business impact)

### Keep modular:
- Use tree structures (├─ └─) for readability
- Max 6 bullets per section
- One emoji per section = visual hierarchy
- Lead with outcome, not process

## Examples

### v5.2.9 (Cinematográfico)
```
✨ Onboarding v5.2.9 — Glassmorphism Upgrade

🎬 LOADING PAGE — Transformação Cinematográfica
├─ Logo como protagonista: glow neon verde (25ms enter)
├─ Mesh gradient dinâmico: navy ↔ teal com SVG blur
└─ Floating orbs (3x): drifting contínuo com delays escalonados

🏆 RESULT PAGE — Glassmorphism Premium
├─ Glass cards: backdrop-blur-2xl + rim light inset
├─ Animated counters: spring physics (stiffness 75)
└─ Staggered features: 50ms delay, checkmarks SVG stroke-dasharray

📊 RTK Economy: ~65% (336k → 117k tokens)
⚡ Context Speed: ~2x mais rápido (est.)
🧪 Quality: Zero console errors, WCAG-AA verified

🌐 Live: https://vfit.app.br/onboarding/
```

### Hypothetical Bug Fix (Técnico)
```
🔧 Fixed — WhatsApp Notification 15-Minute Delay

⚡ Root Cause
Unipile API accepts messages synchronously (200 OK) but processes them
asynchronously in queue (~15 minutes latency). Not a Worker issue.

✅ Solution Applied
Implemented async delivery webhook callback. Script now polls for actual
delivery confirmation, not just API acceptance. Adds --wait-delivery flag.

📊 Impact
• RTK: No token change (async adds negligible overhead)
• Latency visibility: Queue time now measurable
• Quality: Team sees TRUE delivery time, not mystery 15m gap

🧪 Verification
Tested with 5 deploy notifications. Delivery time now visible in logs.
```

---

**Migration Schedule:**
- Immediate: Use Template 1 for v5.2.9 (already sent ✅)
- Next deploy: Choose template based on change type
- Update whatsapp-task.mjs: Auto-format helpers (phase 2)
- Document tone patterns: Archive of real examples (phase 3)
