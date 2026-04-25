# 🚀 VFIT — Plano de Lançamento 6 Semanas

> **v3.2.1 prod** · Foco: Do _protótipo desorganizado_ → **MVP pronto para Early Access (10-30 trainers pagando)**
> 
> Baseado em: QA audit (118 runs, 4 bugs fixos), 48 pages desconfiguras, problema real = personalizacao

---

## 📊 Current State Snapshot

| Item | Hoje | Problema |
|------|------|----------|
| **Páginas** | 48 | Confuso — qual é core? |
| **Endpoints** | ~150 | Over-engineered para 0 usuários |
| **Usuários pagos** | 0 | Sem validação de mercado |
| **Core flow** | Ambíguo (trainer? athlete? AI?) | → **Precisa ser claro: "Studio de IA pra PT" ou "Plataforma de treinos IA"?** |
| **Tech debt** | Tailwind v4 + CSP + hydration | Fixo em v3.2.1 ✅ |
| **Engajamento** | Gamification (streaks, XP, badges) | Pronto mas não há usuários |
| **Diferenciador** | IA (treinos personalizados) | **ISSO É OURO — foco aqui** |

### QA Audit Results (v3.2.0 → v3.2.1)
- **118 test runs** (59 routes × 2 viewports)
  - 99 ✅ OK
  - 14 🔴/🟠 issues (4 críticos encontrados + fixos)
  - **Critical bugs fixos:** React #418 hydration (gamification + 404) | overflow móvel (streaks)

---

## 🎯 Diagnóstico: Por que "não é útil ainda"?

### ❌ Problema 1: **Sem usuários reais**
- 48 páginas mas zero trainer/student usando
- Isso significa: nenhuma validação se é útil mesmo
- **Solução:** Early Access com 10-30 trainers reais (pagando ou invitados próximos) → feedback semanal

### ❌ Problema 2: **UX confusa — muitas workflows**
- Home (analytics? inspiração? call-to-action?)
- Dashboard (qual é principal: studio? alunos? pagamentos?)
- Exercícios (biblioteca ou criar?)
- Treinos (gerados, templates, histórico?)
- Alunos (invite... como?)
- **Solução:** Reducir a **Uma** crisp user journey (trainer perspective):
  - Log in → Create workout (IA helps) → Invite students → Track adherence
  - Tudo em 3-4 paginas, zero distrações

### ❌ Problema 3: **Feature scatter — foco em "tudo" = foco em "nada"**
- Gamification (streaks, badges, XP, leaderboard)
- Whatsapp gateway (feature, not core)
- Assessment (body composition, test results)
- Blog (distracao para MVP)
- Social (posts, comments — Phase 2!)
- **Solução:** MVP = **Create Workout + Assign + Track** — tudo mais é Phase 2

### ❌ Problema 4: **Sem go-to-market**
- Não há positioning claro
- Não há case study (sem usuários)
- Não há "why this vs Trello+Whatsapp?"
- **Solução:** Posicionar como **"AI Personal Trainer Studio — Cria treinos IA em 30s, cuida de frequência + evolução"**

### ❌ Problema 5: **Monetização nebulosa**
- 3 planos (trial, pro, profissional/max)
- Mas nenhum pricing justificado com valor
- **Solução:** Pricing baseado em job-to-be-done:
  - **Trial:** "Test IA workout generation" (free, 5 alunos)
  - **Pro ($29/mês):** "Unlimited workouts + students + 1 check-in/sem"
  - **Max ($79/mês):** "+ Body composition assessment, 2-way feedback"

---

## 🎬 MVP Definition: "Studio Mínimo de IA"

### Job to be done
> **"I'm a Personal Trainer. I want AI to generate workout variations in 10 seconds, I want to send to clients via WhatsApp, I want to know if they did it."**

### Core Flows (reduce 48 pages → 5 core screens)

| Screen | Purpose | MVP v | Current Pages |
|--------|---------|-------|---------------|
| **1. Auth** | Login/register | v3.2.1 | /login, /register, /_not-found |
| **2. Dashboard** | Quick view (students today, workouts sent, trends) | v3.2.1 ✅ (fix hydration) | /dashboard (was broken) |
| **3. Studio** | **CREATE workout (AI-powered)** | ⭐ HERO | /exercicios, /treinos/novo + AI integration |
| **4. Students** | Manage crew + send/track | ⭐ HERO | /alunos + send modal |
| **5. Profile** | Account + plan management | v3.2.1 | /perfil + /planos |

### Kill List (Phase 2 or later)
- ❌ Blog (content marketing, Phase 2)
- ❌ Assessment (complex, Phase 2)
- ❌ Community/leaderboard (nice-to-have, Phase 3)
- ❌ Wrangler/gateway (internal, post-MVP)
- ❌ Analytics (track later, Phase 2 when real data exists)
- ❌ Mobile app (after 100 users, Phase 3)

### Kill List (Already in code, disable UX)
```typescript
// In next.config.ts or page routes:
// Disable in early access:
// - /blog (redirect to Phase 2 page)
// - /assessment (grey out, "Coming soon")
// - /comunidade (hide menu item)
// - /pagamentos history (grey out, "After first month")
```

---

## 📅 6-Week Sprint Plan

### **Week 1–2: UX Ruthlessness + Core Flows**

**Goal:** Redesign MVP to feel 3x simpler. Make "Create Workout" the hero.

#### Sprint 1a: Navigation + Dashboard clarity
- [ ] **Remove** secondary nav items (blog, community, assessment links)
- [ ] **Redesign** dashboard to show:
  - **Big CTa:** "Create Workout" (emerald, glow, top-center)
  - **Quick stats:** "5 students invited, 3 workouts sent, 2 completed today"
  - **Recent** (last 3 workouts + completion %)
- [ ] **Simplify** mobile nav (hide non-core: blog, assessment, community)
- [ ] Files: `src/app/dashboard/page.tsx` (refactor), remove dead nav items
- [ ] **Testing:** Desktop + mobile, check for accidental 404s (QA found 2)

#### Sprint 1b: Studio (Create Workout) — ⭐ HERO FEATURE
- [ ] **Redesign** /treinos/novo workflow to:
  - Step 1: "What body part? (muscular/cardio/mobility)" → AI suggests 6 exercises
  - Step 2: "Pick exercises you like + reps/sets" (drag-and-drop or simple select)
  - Step 3: "Name it, set difficulty, save"
  - **Total:** 2–3 min, not 15 pages
- [ ] **AI Integration** — call Replicate:
  - Prompt: "Generate 6 exercises for [body_part] at [difficulty] level, considering [trainer_level]"
  - Returns: { name, description, target_muscle, difficulty, tips }
  - Show with animations + loading state
- [ ] **Testing:** Generate 10 workouts, feel fast + intuitive
- [ ] Files: `src/app/dashboard/studio/page.tsx` (new), hook `useGenerateWorkout` (new)

#### Sprint 1c: Students + Send Flow
- [ ] **Simplify** /alunos to:
  - List (name, phone, last workout, status: invited/active/inactive)
  - Quick actions: "View progress" or "Send workout"
- [ ] **Send Workout Modal:**
  - Select workout (recent or create new)
  - Confirm student phone number
  - Send via Whatsapp (lib/unipile-agents already exists)
  - Show delivery status
- [ ] Files: `src/app/dashboard/students/page.tsx` (refactor), send modal component

**Deliverables:**
- 3 pages (Studio, Students, Dashboard) are 3x simpler
- AI integration tested end-to-end
- 0 external links to blog/community/assessment

---

### **Week 2–3: AI Personalization (The Differentiator)**

**Goal:** Make IA workouts feel like "magic". This is the moat.

#### Sprint 2a: Smart Workout Generation
- [ ] **Enhance** AI prompts to consider:
  - Trainer's experience level (beginner/intermediate/advanced)
  - Student's fitness level (from profile or past workouts)
  - Equipment available (home, gym, outdoor)
  - Time available (15-30-45-60 min)
  - **Result:** Each workout feels personalized, not generic
- [ ] **UI:** Add filters before AI generation (equipment, time, level, goal)
- [ ] **Caching:** Store generated workouts (don't re-gen on every load)
- [ ] Files: `lib/ai-prompts.ts` (enhance prompts), `src/hooks/useGenerateWorkout.ts` (add filters + cache)

#### Sprint 2b: Workout Feedback Loop
- [ ] **After workout:** Student marks "completed" + optionally "difficulty" (too easy/hard/perfect)
- [ ] **Trainer sees:** Completion % + difficulty feedback
- [ ] **AI learns:** Next workout suggestion considers feedback ("Student found last one too easy → increase difficulty")
- [ ] **Nice-to-have:** Suggest micro-variations ("Add 2 more sets" / "Swap exercise")
- [ ] Files: `src/components/student/WorkoutFeedback.tsx` (new), DB tracking `workout_completions`

#### Sprint 2c: Student Engagement (Gamification Lite)
- [ ] **Keep simple:** Streak counter (consecutive workout days), XP per workout
- [ ] **Remove clutter:** No leaderboard yet, no badges (Phase 2)
- [ ] **Show:** "7 day streak! 🔥" in student view
- [ ] **Server side:** Calculate + cache (don't calculate fresh each load)
- [ ] Files: use existing `src/lib/xp-service.ts` + `streak-calendar`, just hide leaderboard UI

**Deliverables:**
- AI workouts feel personalized, not generic
- Feedback loop closes (completion → next workout learns)
- Streaks + XP visible but not distracting

---

### **Week 3–4: Go-to-Market + Copy**

**Goal:** Make it clear what VFIT is. Create collateral + early access path.

#### Sprint 3a: Positioning + Copy
- [ ] **Define** 30-second pitch:
  > "VFIT: AI Personal Trainer Studio. Generate workouts in 30 seconds, send to clients via WhatsApp, track adherence. Perfect for PTs managing 5–50 clients."
- [ ] **Landing page** (simple):
  - Hero: "Workout AI for Personal Trainers"
  - 3 benefits: "Fast" / "Personal" / "Trackable"
  - 1 screenshot (dashboard)
  - CTA: "Early Access — Free for 5 clients"
  - Testimonial space (TBD, will fill with beta users)
- [ ] **Email template** for outreach (invite trainers to beta)
- [ ] Files: `src/app/page.tsx` (overhaul), new landing copy in content module

#### Sprint 3b: Early Access Setup
- [ ] **Pricing page** (simple, 3 tiers):
  - Trial (free, 5 students)
  - Pro ($29/mth, ∞ students, full features)
  - Max ($79/mth, + advanced analytics)
- [ ] **Waitlist** (optional):
  - Collect emails at /early-access
  - Track referrals ("Tell a friend, get free month")
  - Send weekly beta updates
- [ ] **Onboarding email series** (3 emails):
  1. "Welcome! Here's 3 workouts we generated for you"
  2. "How-to: Invite your first student"
  3. "Challenge: 10 workouts in 10 days"
- [ ] Files: Resend templates in `lib/email-resend.ts` (new templates)

#### Sprint 3c: Collect Beta Feedback
- [ ] **In-app NPS:**
  - Weekly: "How likely to recommend VFIT? (1–10)"
  - Monthly: "What would make this 10x better?"
  - Save to DB `feedback` table
- [ ] **Metrics dashboard** (for you, internal):
  - Active trainers (who logged in this week)
  - Workouts created + sent
  - Student completion rate
  - Churn (invited but never logged in)
  - NPS trend
- [ ] **Rollup reports** (weekly to your email):
  - N trainers active, M workouts created, X% completion
  - Top issues from NPS
  - Next actions (e.g., "Add ability to edit workouts")

**Deliverables:**
- Landing page + pitch is crystal clear
- Early access + referral loop working
- You have data to iterate weekly

---

### **Week 4–5: Beta Launch + Iteration**

**Goal:** Get 10 PTs on VFIT, paying or invited. Collect 1–2 weeks of real feedback.

#### Sprint 4a: Onboard 10 Beta Trainers
- [ ] **Outreach:** Reach out to 3–5 PTs you know
  - "Hey, I built an AI workout tool. Want to auto-generate workouts for your clients? It's free for the first month. 10 min setup."
  - Direct them to landing page + early access form
- [ ] **1:1 Onboarding calls** (30 min each):
  - Show 2-min demo
  - Set up their account
  - Generate 1st workout together
  - They invite 1–2 clients
  - **Goal:** Leave with confidence, not confusion
- [ ] **Slack group** for beta feedback (async, 8–12 people)
  - Daily check-ins: "What did you create today?"
  - Ask: "What would make this 2x better?"
  - Share wins ("Generated 50 workouts!")

#### Sprint 4b: Weekly Iteration Cycle
- [ ] **Monday:** Review previous week feedback
  - Top 3 pain points from NPS + Slack
  - Decide: fix, postpone, or educate user
- [ ] **Tuesday–Thursday:** Implement top 2 fixes
  - Batch edits + test
  - Deploy patch version (3.2.2, 3.2.3, etc.)
  - Notify beta group: "Fixed: [thing]"
- [ ] **Friday:** Metrics + planning
  - Review engagement: workouts, students, completion %
  - Plan next week's priority

#### Sprint 4c: Kill Dead Branches Ruthlessly
- [ ] **If unused:** Remove feature (e.g., if nobody uses assessment → hide in Week 5)
  - Better to have 1 feature loved than 10 features ignored
- [ ] **If confusing:** Simplify or remove (e.g., if students don't understand pricing → simplify)

**Deliverables:**
- 10 beta trainers on VFIT
- 1–2 weeks of real usage data
- Weekly iteration cycle locked in
- Kill list updated (features nobody uses)

---

### **Week 5–6: Polish + Prepare for Paid Launch**

**Goal:** App feels 3x more polished. Ready for first paid customers.

#### Sprint 5a: UX Polish (Design Review)
- [ ] Mobile responsiveness (test on iPhone 12, 14, Edge, Firefox)
- [ ] Accessibility (keyboard nav, color contrast)
- [ ] Micro-interactions (button feedback, loading states, success messages)
- [ ] Empty states (no data → show helpful prompts)
- [ ] Error messages (clear, actionable, not scary)
- [ ] Files: Use `/design-review` skill or do manual QA + iterate

#### Sprint 5b: Performance + Analytics
- [ ] **Performance:**
  - API response times (target: <500ms for workout generation)
  - Page load (target: <2s first contentful paint)
  - Bundle size (check for bloat)
  - Files: `npm run quality:ci` (already in scripts)
- [ ] **Analytics setup** (production tracking):
  - GA4 events: Signup, workout created, workout sent, student joined, completion
  - Tracking code in place
  - Real data flowing
- [ ] **Observability:**
  - Sentry errors (production error tracking)
  - Turnstile (captcha) not blocking (already fixed in v3.2.1)
  - No 500s or silent failures

#### Sprint 5c: Paid Transition
- [ ] **Set payment methods live:**
  - Asaas webhook fully working (payment received → upgrade user plan)
  - Stripe secondary (optional)
  - Test: Create fake payment → plan upgrades automatically
- [ ] **Pricing tiering enforcement:**
  - Trial (5 students max): prevent adding 6th
  - Pro ($29): unlimited students
  - Max ($79): + advanced analytics
  - Graceful degradation (plan expired → show "upgrade needed" modal)
- [ ] **Cancel flow:** Easy self-service (don't make users email)
- [ ] Files: Payments logic in `workers/api/payments.ts` (already 2200 lines, should be mostly working)

#### Sprint 5d: Case Study + Social Proof
- [ ] **Pick 1 happy beta user:** "Hey, can I share your story?"
  - 2-min video (them using VFIT)
  - 3–4 sentence testimonial
  - Photo + name
- [ ] **Landing page update:**
  - Add testimonial + metric ("Generating 100+ workouts/week")
  - Update copy with their number: "Used by 10+ PTs to generate 500+ AI workouts"
- [ ] **LinkedIn post:** Soft launch story (you + testimonial)

**Deliverables:**
- App feels polished (speed, responsive, no errors)
- Payment flow live + tested
- 1 case study + social proof in place
- Ready for word-of-mouth growth

---

### **Week 6: Go-Live + Relaunch**

**Goal:** Official launch to broader market. 30+ trainers.

#### Sprint 6a: Announce
- [ ] **Email:** Send to all beta users + waitlist
  - "Thank you for beta testing. We're live now. [link]"
  - "Special: First 50 users get 50% off Pro ($15/mo)"
- [ ] **Social:** Post on LinkedIn, Twitter, Instagram (trainer communities)
  - "AI Personal Trainer Studio is live. Generate workouts in 30s. [link]"
  - Tag trainers + fitness influencers
- [ ] **Communities:** Post in Reddit (r/personaltraining, r/fitness), Facebook trainer groups
  - "Made a tool to help PTs scale workouts. Curious if it solves your problem."
  - Engage in comments, don't just promote

#### Sprint 6b: Support + Onboarding Scale
- [ ] **FAQ page:** Answer top 5 questions
  - "How long to create a workout?" → "30s with AI, or manual"
  - "How do students get workouts?" → "WhatsApp link or in-app"
  - "Is this GDPR compliant?" → "Yes, privacy policy [link]"
- [ ] **Help center** (simple):
  - 3–4 video tutorials (5 min each)
  - "Getting started" checklist
  - Email support (reply within 24h)
- [ ] **Automate what you can:**
  - Welcome email → onboarding flow
  - Payment email → success + next steps
  - NPS feedback → auto-categorize + alert you

#### Sprint 6c: Metrics + Planning Next Sprint
- [ ] **Capture baseline:**
  - N trainers (target: 30)
  - M workouts created (target: 500)
  - Revenue (target: $300–500/mo if 10–15 paid)
  - Completion % (target: 60%+)
  - Churn % (target: <10%/week in early days)
- [ ] **Identify Phase 2 priorities:**
  - Pain points from feedback (assessment? community? API?)
  - Revenue opportunities (upsell?)
  - Engagement (what makes PTs come back?)
- [ ] **Plan Sprint 7+** (Phase 2 features)

**Deliverables:**
- Official launch announced
- 30+ trainers on app
- Payment flow generating revenue
- Metrics baseline + roadmap for Phase 2

---

## 🎯 Success Metrics (Track Weekly)

### Engagement (Product-Market Fit signals)
| Metric | Target | How to measure |
|--------|--------|----------------|
| **Trainers active/week** | 10 (W2) → 30 (W6) | `WHERE last_login >= NOW() - 7d` |
| **Workouts created/week** | 50 (W2) → 200+ (W6) | `COUNT(workouts) WHERE created_at >= NOW() - 7d` |
| **Student completion %** | 40% (W2) → 60% (W6) | `SUM(workout_completions) / SUM(workouts_assigned)` |
| **NPS score** | 40 (W2) → 60+ (W6) | Weekly survey ("How likely to recommend?") |

### Revenue
| Metric | Target | How to measure |
|--------|--------|----------------|
| **Monthly Recurring Revenue (MRR)** | $0 (W1) → $300–500 (W6) | `SUM(subscription_amount) for active plans` |
| **Churn %** | <20%/mo (W2) → <10%/mo (W6) | Paid users canceled / total paid users |
| **Customer Lifetime Value (LTV) estimate** | >$200 (W4+) | Avg revenue × 12 months × (1 - churn) |

### Technical
| Metric | Target | How to measure |
|--------|--------|----------------|
| **API response time** | <500ms (avg) | `wrangler tail` + analytics |
| **Page load time (LCP)** | <2s | PageSpeed Insights or Lighthouse CI |
| **Error rate** | <0.1% | Sentry dashboard |
| **Uptime** | >99.5% | CF dashboard + external monitor |

---

## 📋 Deployment Strategy (6 weeks)

| Week | Version | Deploy | Notes |
|------|---------|--------|-------|
| **1–2** | 3.3.0 | Minor | UX ruthlessness, Studio hero |
| **2–3** | 3.4.0 | Minor | AI personalization loop |
| **3–4** | 3.5.0 | Minor | Landing page + go-to-market |
| **4–5** | 3.5.x (patches) | Patch | Beta iteration cycle (weekly fixes) |
| **5–6** | 3.6.0 | Minor | Polish + paid transition |
| **Week 6** | 3.6.x (patches) | Patch | Hot fixes post-launch |

**CI/CD:** Use `npm run cf:deploy patch/minor` with version bumps + CHANGELOG updates (already in scripts).

---

## 🛠️ Technical Debt to Clear (Parallel)

### Before Week 2 (blocking)
- [ ] CSP Trusted Types warnings (Turnstile) — marked non-blocking, can disable in code
- [ ] Remove dead pages from Next.js build (blog, assessment, community links)
- [ ] Test auth on production with real Asaas test account

### Before Week 4 (nice-to-have)
- [ ] Hyperdrive (currently bypassed) — if Neon performance degrades, reactivate
- [ ] D1 cold data (exercises) — ensure in-sync with latest library
- [ ] Rate limiting — increase quotas for beta period (spike expected)

### Phase 2 (after Week 6)
- [ ] Mobile app (React Native or PWA install)
- [ ] Assessment (body comp, test results)
- [ ] Community / social features
- [ ] Advanced analytics (trainer dashboard)

---

## 🎓 Decision Framework (When Unsure)

### Will it help MVP 10 PTs to success in 6 weeks?
- **YES** → Do it (ruthless focus)
- **NO** → Defer to Phase 2 (write down, move on)

### Example decisions (using framework)
- "Should we add community comments?" → No (6 weeks, MVP) → Phase 2 ✅
- "Should we improve AI prompt quality?" → Yes (differentiator) → Do it ✅
- "Should we add assessment?" → No (complex, Phase 2) → Defer ✅
- "Should we fix stripe payment?" → Yes (revenue blocker) → Do it ✅
- "Should we add badge creation UI?" → No (gamification is secondary) → Phase 2 ✅

---

## 🚀 Next Action (After This Plan)

### Pick ONE (highest impact)
1. **Week 1 starts NOW:** Schedule 1:1 onboarding calls with 5 PTs you know
2. **Week 1 starts NOW:** Redesign dashboard (follow Sprint 1a) to make "Create Workout" the hero
3. **This week:** Enhance AI prompts to feel more personalized (Sprint 2a prep)

### Weekly Rhythm (Lock This In)
- **Monday 9am:** Review metrics + feedback
- **Tuesday 10am:** Planning + start sprint
- **Friday 4pm:** Standup + next week prep + deploy

---

## 📞 Help Needed from You

1. **Can you commit 8–10 hours/week for 6 weeks?** (This plan requires it)
2. **Do you have 5 trainers you can invite to beta?** (Non-negotiable for validation)
3. **Pricing question:** Are you comfortable with $29/mo for trainers with 10–20 students? (Or lower to $19?)
4. **What's your timezone?** (For 1:1 beta calls)

---

## 📌 TL;DR: The Inflection Point

**From:** 48 pages, zero users, unclear value prop
**To:** 5 focus pages, 10–30 trainers, "$300–500/mo revenue" by Week 6

**The key:** Not more features. **Less is more.** Ruthless focus on "create workout + track = done."

**You have:**
- ✅ Tech (AI, payments, auth all built)
- ✅ Time (6 weeks = doable)
- ✅ Validation risk mitigated (beta with known PTs)

**You need:**
- ✅ Daily + weekly rhythm (Monday metrics, Friday deploy)
- ✅ 5+ beta trainers (to say "10 PTs are using this")
- ✅ Ruthlessness (kill 40+ pages, features, nice-to-haves)

---

**Status:** Ready to start Week 1.
**Dependencies:** Your 5 beta trainer intros + commitment to weekly rhythm.
**Owner:** You (with design + code support as needed).

**This is not a hope plan. It's a mission plan. Let's go. 🚀**
