# VFIT Sprint Breakdown — Sprint 41-50 (10 Weeks)

**Version**: 1.0  
**Date**: 2026-04-01  
**Timeline**: Sprint 41 (Apr 1–18) → Sprint 50 (May 27–Jun 13)  
**Status**: Ready for Execution  

---

## Sprint Overview

| Sprint | Dates | Phase | Focus | Deliverables | Owner |
|--------|-------|-------|-------|--------------|-------|
| **41** | Apr 1–18 | Foundation | Design system, DB schema, onboarding redesign | Component library, onboarding screens, DB migrations | Dev |
| **42** | Apr 19–May 2 | Core Features (Part 1) | Treinos hub, active workout tracker, set logging | Workout library UI, set tracker, performance metrics | Dev |
| **43** | May 3–16 | Core Features (Part 2) | Nutrition module, meal planner, IA integration | Meal logger, macro calculator, IA context caching | Dev |
| **44** | May 17–30 | Marketplace & Premium | Trainer marketplace, evaluation bookings, Premium UX | Marketplace cards, booking flow, trainer ratings | Dev |
| **45** | May 31–Jun 13 | IA & Chat | Contextual IA assistant, chat interface, suggestions | IA chat UI, system prompts, context retrieval | Dev |
| **46** | Jun 14–27 | Advanced Features | Admin panel CRUD, analytics dashboards | Admin workouts, exercises, recipes management | Dev |
| **47** | Jun 28–Jul 11 | Animations & Polish | Premium animations, Lottie integration, micro-interactions | GIF placeholders, custom transitions, haptic feedback | Design/Dev |
| **48** | Jul 12–25 | Performance & Quality | Performance optimization, E2E testing, bug fixes | Lighthouse 90+, Core Web Vitals, test coverage 70%+ | QA/Dev |
| **49** | Jul 26–Aug 8 | App Store Prep | iOS/Android build, signing, store submission docs | iOS + Android binaries, privacy policy, terms | Dev/Ops |
| **50** | Aug 9–22 | Launch & Support | Final QA, soft launch (10k beta users), support | Monitoring setup, analytics tracking, user onboarding | Ops/Support |

---

## Sprint 41: Foundation (Apr 1–18)

**Goal**: Establish VFIT design system, database schema, and onboarding flow. No user-facing features yet.

### Tasks

#### Week 1 (Apr 1–7)

**Design System Codification**
- [ ] Create `src/lib/vfit-tokens.ts` with color, spacing, typography tokens
- [ ] Create `src/components/ui/vfit/` folder structure
- [ ] Implement base components: `Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`
  - All components use tokens from `vfit-tokens.ts`
  - Support both light props and dark mode (dark-only initially)
  - All have accessibility props (aria-label, aria-describedby)
- [ ] Create `src/components/ui/DSIcon.tsx` wrapper for Lucide icons (web) and custom icons (mobile)
- [ ] Write Storybook stories for all components (optional, document in Figma)
- [ ] Add tests: `src/components/ui/vfit/*.test.tsx` (unit tests, 20+ tests)
- **Owner**: Frontend Dev | **Time**: 3 days | **Blocker**: None

**Database Schema & Migrations**
- [ ] Read current Neon schema (verify existing trainer table structure)
- [ ] Create Neon branch: `neon branch create vfit-sprint-41` (staging)
- [ ] Write migrations: `migrations/001_vfit_initial_schema.sql` (all tables from schema doc)
- [ ] Create Zod schemas: `src/types/vfit-schemas.ts` (user, workout, meal, evaluation, trainer, booking)
- [ ] Seed D1 exercises: Run `scripts/seed-exercises-d1.ts` (100+ canonical exercises)
- [ ] Test schema in staging Neon branch; verify indexes, foreign keys
- [ ] Document migration steps in `.claude/database-migration-checklist.md`
- **Owner**: Backend Dev | **Time**: 2.5 days | **Blocker**: Neon access

**Onboarding Flow Design**
- [ ] Create wireframes for 8-10 onboarding steps (Figma or text description)
  - Step 1: Welcome (app value prop)
  - Step 2: Goal selection (weight loss, muscle gain, strength, etc.)
  - Step 3: Experience level (beginner, intermediate, advanced)
  - Step 4: Training days per week (2-6)
  - Step 5: Training locations (home, gym, outdoor — multi-select)
  - Step 6: Body metrics (current weight, target, height)
  - Step 7: Dietary restrictions (multi-select or skip)
  - Step 8: Equipment available (multi-select or skip)
  - Step 9: Subscription plan choice (free, premium, premium_plus)
  - Step 10: IA context confirmation ("Your profile is ready!")
- [ ] Each step: visual card layout (NOT just form inputs)
- [ ] Validation rules per step (Zod schema + frontend feedback)
- [ ] Progressive disclosure: optional fields can be skipped/filled later
- **Owner**: Design | **Time**: 1.5 days | **Blocker**: None

#### Week 2 (Apr 8–14)

**Onboarding Implementation**
- [ ] Create `src/app/(app)/onboarding/` folder with step-by-step pages
- [ ] Implement StepIndicator component (visual progress, 1-10)
- [ ] Create form state management: `src/stores/onboarding-store.ts` (Zustand)
- [ ] Build Step 1-10 components with Button, Card, Input, Modal components
- [ ] Add navigation: Next/Back buttons, skip option for optional fields
- [ ] Integration: Save data to `users` table on Step 10 completion
- [ ] Add loading state + success feedback (confetti animation optional)
- [ ] Write tests: `src/app/(app)/onboarding/*.test.tsx` (15+ tests for flows)
- [ ] E2E test: Playwright flow from Step 1 → completion
- **Owner**: Frontend Dev | **Time**: 3 days | **Blocker**: Design System (done), DB Schema (done)

**Bottom Navigation Setup**
- [ ] Create `src/components/ui/vfit/BottomNav.tsx` (5 tabs: Treinos, Nutrição, Avaliações, IA, Perfil)
- [ ] Icons: Use DSIcon for each tab (custom design system icons)
- [ ] Active state: Color, underline indicator, animation (150ms)
- [ ] Mobile layout: Fixed bottom, safe area padding (notch/gesture bar aware)
- [ ] Navigation context: Route highlighting based on current page
- [ ] Write tests: `src/components/ui/vfit/BottomNav.test.tsx`
- **Owner**: Frontend Dev | **Time**: 1.5 days | **Blocker**: Design System

**Backend Setup**
- [ ] Create worker endpoint: `workers/api/users.ts` (POST /users to save onboarding, GET /users/:id for profile)
- [ ] Middleware: Apply `requireAuth` to protected routes
- [ ] Add rate limiting: 10 requests/minute per user (Cloudflare rate-limit middleware)
- [ ] Test endpoints with Vitest + supertest
- [ ] Document API in `.claude/vfit-api-endpoints.md`
- **Owner**: Backend Dev | **Time**: 2 days | **Blocker**: DB Schema (migrations must pass)

#### Week 3 (Apr 15–18)

**Integration & QA**
- [ ] Connect frontend onboarding → backend `/users` endpoint
- [ ] Test full flow: onboarding submit → DB save → session creation
- [ ] Verify design system tokens applied consistently (colors, spacing, typography)
- [ ] Accessibility audit: WCAG 2.1 AA compliance on onboarding screens
  - Color contrast 4.5:1 on all text
  - Focus states visible on all inputs
  - Keyboard navigation (Tab through all steps)
  - Screen reader labels (aria-label, aria-describedby)
- [ ] Performance: Lighthouse score ≥85 on onboarding pages
- [ ] E2E tests: 3+ complete onboarding flows (different paths)
- [ ] Bug fixes & refinement
- [ ] Update `.claude/session-state.md` with Sprint 41 completion status
- **Owner**: QA/Dev | **Time**: 2 days | **Blocker**: Implementation (done)

### Sprint 41 Deliverables

✅ Design system component library (Button, Card, Input, Modal, BottomNav, DSIcon)  
✅ Onboarding flow (8-10 progressive steps, visual cards, form validation)  
✅ Database schema (all tables, migrations, seeded exercises in D1)  
✅ User profile endpoint (save onboarding data → users table)  
✅ Tests (unit: 20+ components, E2E: 3+ onboarding flows)  
✅ Documentation (API endpoints, design system, DB migrations)

---

## Sprint 42: Core Features Part 1 (Apr 19–May 2)

**Goal**: Build Treinos (workout) hub and active workout tracker with set logging.

### Key Features

1. **Workout Library Screen**
   - [ ] Show 20 library workouts (primary muscle filter)
   - [ ] Cards: name, primary muscle highlight, difficulty badge, duration
   - [ ] Call to action: "Start Workout" button
   - [ ] Search + filter by difficulty, muscle, duration

2. **Active Workout Tracker**
   - [ ] Start workout → show exercises in sequence
   - [ ] Set logger: reps, weight, RPE (1-10) per set
   - [ ] Visual feedback: green checkmark on set completion
   - [ ] Timer: auto-start rest period (e.g., 90s) with countdown
   - [ ] Next/Previous exercise navigation
   - [ ] Complete workout: save session → history
   - [ ] Optional: music player integration, form video cues

3. **Workout History**
   - [ ] List past 20 sessions with date, workout name, duration, RPE
   - [ ] Trend graph: volume per week (stacked bar chart)
   - [ ] Personal records: strength PRs (max weight per exercise)

### Tasks (Detailed)

- [ ] Create `src/app/(app)/treinos/` pages: index (library), [id] (active), history
- [ ] Implement `WorkoutCard.tsx` component (library list)
- [ ] Implement `SetLogger.tsx` component (weight, reps, RPE inputs)
- [ ] Implement `Timer.tsx` component (countdown for rest periods)
- [ ] Implement `VolumeChart.tsx` (weekly trend, bar chart)
- [ ] Create hooks: `useWorkouts()`, `useActiveSession()`, `useSetLogger()` (TanStack Query)
- [ ] Create worker endpoints:
  - `GET /workers/api/workouts` (list library workouts)
  - `GET /workers/api/workouts/:id` (single workout + exercise details from D1)
  - `POST /workers/api/sessions` (start new session)
  - `POST /workers/api/sets` (log set data)
  - `PUT /workers/api/sessions/:id` (complete session, calculate totals)
  - `GET /workers/api/sessions` (history)
- [ ] Write tests: Unit (10+), E2E (2+)
- [ ] Accessibility: All interactive elements keyboard-accessible, screen reader labels
- [ ] Performance: Lazy load history images, virtualize long lists

**Owner**: Frontend + Backend | **Time**: 2 weeks

---

## Sprint 43: Core Features Part 2 (May 3–16)

**Goal**: Build Nutrição (nutrition) module with meal planner and IA context caching.

### Key Features

1. **Meal Planner**
   - [ ] Show macro targets based on goal (user profile from onboarding)
   - [ ] Search food database: 500+ foods with macros
   - [ ] Log meals: breakfast, lunch, snack, dinner
   - [ ] Manual food entry: name + quantity → calculate macros
   - [ ] Daily summary: total calories, protein, carbs, fat vs targets

2. **IA Context Cache**
   - [ ] Background job: Daily update of `user_ai_profiles` table
     - Recent 4 weeks of workouts
     - Recent 7 days of meals
     - Weight trend
     - Strength PRs
   - [ ] Cache in Cloudflare KV for fast IA lookups

### Tasks (Detailed)

- [ ] Create `src/app/(app)/nutricao/` pages: planner (today), logger, history
- [ ] Implement `FoodSearch.tsx` (search 500+ foods, autocomplete)
- [ ] Implement `MacroCard.tsx` (protein/carbs/fat summary with pie chart)
- [ ] Implement `MealEntry.tsx` (food + quantity input)
- [ ] Create hooks: `useFoods()`, `useUserMeals()`, `useMacroTargets()`
- [ ] Create worker endpoints:
  - `GET /workers/api/foods?search=...` (search + autocomplete)
  - `POST /workers/api/meals` (log meal)
  - `GET /workers/api/meals?date=...` (daily summary)
  - `GET /workers/api/users/:id/ai-context` (retrieve cached context)
- [ ] Implement background job: `workers/scheduled/update-ai-context.ts` (cron, daily)
- [ ] Tests: Unit (10+), E2E (2+)
- [ ] Accessibility: All form labels, ARIA live regions for macro updates

**Owner**: Frontend + Backend | **Time**: 2 weeks

---

## Sprint 44: Marketplace & Premium (May 17–30)

**Goal**: Build trainer marketplace with evaluation bookings and Premium UX.

### Key Features

1. **Trainer Marketplace**
   - [ ] List trainers with rating, specialty, price per evaluation
   - [ ] Trainer card: avatar, bio, certifications, available slots, pricing
   - [ ] Filter by specialty, price range, availability
   - [ ] Trainer detail page: full bio, ratings, reviews, booking CTA

2. **Evaluation Booking Flow**
   - [ ] Select date/time from trainer's available slots
   - [ ] Choose evaluation type (body composition, strength, flexibility)
   - [ ] Review total price
   - [ ] Submit booking
   - [ ] Asaas payment integration (PIX QR code or link)
   - [ ] Confirmation: awaiting trainer confirmation

3. **Premium Features**
   - [ ] Free: 1 evaluation per month
   - [ ] Premium: 4 evaluations per month, IA meal planner
   - [ ] Premium+: unlimited evaluations, nutritionist chat

### Tasks (Detailed)

- [ ] Create `src/app/(app)/avaliacoes/` pages: marketplace, [trainer_id], booking, history
- [ ] Implement `TrainerCard.tsx` (marketplace list)
- [ ] Implement `BookingModal.tsx` (date/time picker, evaluation type, price confirmation)
- [ ] Implement `RatingStars.tsx` + `ReviewList.tsx` (trainer ratings)
- [ ] Create hooks: `useTrainers()`, `useAvailableSlots()`, `useBooking()`
- [ ] Create worker endpoints:
  - `GET /workers/api/trainers` (list marketplace, filters)
  - `GET /workers/api/trainers/:id` (detail + ratings)
  - `GET /workers/api/trainers/:id/available-slots` (availability)
  - `POST /workers/api/bookings` (create booking)
  - `GET /workers/api/bookings` (user's history)
  - `POST /workers/api/payments/asaas-webhook` (handle PIX completion)
- [ ] Premium gate: Check `subscription_plan` before allowing features
- [ ] Tests: Unit (10+), E2E (2+)
- [ ] Accessibility: Keyboard-accessible date picker, screen reader labels

**Owner**: Frontend + Backend | **Time**: 2 weeks

---

## Sprint 45: IA & Chat (May 31–Jun 13)

**Goal**: Build contextual IA assistant using Workers AI (Llama).

### Key Features

1. **IA Chat Interface**
   - [ ] Chat bubble UI (user left, assistant right)
   - [ ] Typing indicator while IA responds
   - [ ] Quick suggestions: "Suggest workout", "Meal ideas", "Progress tips"
   - [ ] History: Save chat threads

2. **Contextual Suggestions**
   - [ ] IA has access to user's:
     - Goal, experience level, training location
     - Recent workouts (last 4 weeks)
     - Recent meals (last 7 days)
     - Weight trend
     - Strength PRs
   - [ ] Llama generates personalized suggestions based on context
   - [ ] Use `user_ai_profiles` cache for fast context retrieval

### Tasks (Detailed)

- [ ] Create `src/app/(app)/ia/` page (chat interface)
- [ ] Implement `ChatBubble.tsx`, `ChatInput.tsx`, `TypingIndicator.tsx`
- [ ] Create hook: `useChatMessages()` (TanStack Query with infinite scroll)
- [ ] Create worker endpoint:
  - `POST /workers/api/ia/chat` (send message, return response from Llama)
  - `GET /workers/api/ia/context` (retrieve user's cached context)
- [ ] Implement Llama call:
  - Use Cloudflare Workers AI API (`@cloudflare/ai`)
  - Model: Llama 2 or Mistral (check available models in Workers)
  - System prompt: "You are VFIT's personal fitness IA assistant. User context: {context_json}"
  - Temperature: 0.7 (balanced creativity)
  - Max tokens: 500
- [ ] Chat message storage: `ia_chat_messages` table
- [ ] Tests: Mock Llama responses, test context injection
- [ ] Accessibility: ARIA live regions for chat updates, keyboard-accessible input

**Owner**: Frontend + Backend | **Time**: 2 weeks

---

## Sprint 46: Advanced Features (Jun 14–27)

**Goal**: Build admin panel for content management (no-code CRUD).

### Key Features

1. **Admin Panel (Next.js dashboard)**
   - [ ] Authentication: Admin role check (`user_type = 'admin'`)
   - [ ] Workout CRUD: Create, edit, delete workouts
   - [ ] Exercise CRUD: Create, edit, delete exercises (D1)
   - [ ] Recipe CRUD: Manage food database
   - [ ] GIF uploads: Placeholder management for exercise demos
   - [ ] Analytics: User signup trends, engagement metrics
   - [ ] Bulk actions: Import workouts from CSV

2. **Admin Workflows**
   - [ ] Create new workout: Select exercises, set reps/weight targets, upload cover image
   - [ ] Edit existing: Adjust exercises, order, duration
   - [ ] Bulk import: CSV → exercises table
   - [ ] View analytics: DAU, active sessions, top exercises, IA chat volume

### Tasks (Detailed)

- [ ] Create `src/app/dashboard/admin/` pages: workouts, exercises, recipes, analytics
- [ ] Implement data tables: `DataTable.tsx` (sortable, filterable, pagination)
- [ ] Implement forms: `WorkoutForm.tsx`, `ExerciseForm.tsx`, `RecipeForm.tsx` (React Hook Form + Zod)
- [ ] Implement file uploader: `ImageUploader.tsx` (Cloudflare R2 integration)
- [ ] Implement charts: `UserSignupChart.tsx`, `EngagementChart.tsx` (Recharts)
- [ ] Create worker endpoints:
  - `GET /workers/api/admin/analytics` (user stats, engagement)
  - `POST /workers/api/admin/workouts/bulk-import` (CSV import)
- [ ] Tests: Unit (15+), E2E (2+)
- [ ] Accessibility: All tables keyboard-navigable, form labels clear

**Owner**: Frontend + Backend | **Time**: 2 weeks

---

## Sprint 47: Animations & Polish (Jun 28–Jul 11)

**Goal**: Add premium animations and micro-interactions.

### Features

1. **Custom Animations**
   - [ ] GIF placeholders: Loading skeleton → GIF play
   - [ ] Workout set completion: Scale + fadeout transition (200ms)
   - [ ] Meal macro pie chart: Staggered segment entry (400ms)
   - [ ] IA chat: Message bubbles fade-in + slide-up (200ms)
   - [ ] Bottom nav: Tab transition with color + scale (150ms)

2. **Lottie Integration** (if time permits)
   - [ ] Exercise form video: Lottie animations vs static GIFs
   - [ ] Loading states: Custom Lottie spinners
   - [ ] Success confirmations: Checkmark animation

### Tasks (Detailed)

- [ ] Define animation tokens in `vfit-tokens.ts` (durations, easing)
- [ ] Implement transitions in Framer Motion (web) + Reanimated (mobile)
- [ ] Create `<AnimatedValue>` component for numbers (count-up effect)
- [ ] Add `prefers-reduced-motion` support globally
- [ ] Performance: Profile animations for 60fps (React DevTools Profiler)
- [ ] E2E: Test animations don't break functionality
- [ ] Accessibility: Ensure `prefers-reduced-motion: reduce` disables animations

**Owner**: Design + Frontend | **Time**: 2 weeks

---

## Sprint 48: Performance & Quality (Jul 12–25)

**Goal**: Achieve Lighthouse 90+, full test coverage, production-ready.

### Quality Gates

- [ ] Lighthouse score ≥90 (all pages)
- [ ] Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Test coverage ≥70% (unit + E2E)
- [ ] Zero TypeScript errors
- [ ] ESLint: 0 warnings (allow 0 errors only)
- [ ] Security audit: No vulnerabilities (npm audit)

### Tasks (Detailed)

- [ ] Performance optimization:
  - Code splitting by route (Next.js dynamic import)
  - Image optimization (WebP, responsive srcset, lazy loading)
  - Defer non-critical CSS
  - Minify/gzip all assets
  - Cache headers (1 year for assets, 24h for HTML)
- [ ] Testing:
  - Write missing unit tests (aim for 70%+ coverage)
  - Add E2E tests for critical flows (onboarding, checkout, workout)
  - Load testing: Simulate 1000 concurrent users
- [ ] Documentation:
  - API endpoint documentation (OpenAPI/Swagger)
  - README for onboarding developers
  - Runbook for common issues
- [ ] Bug fixes: Triage and fix all known issues

**Owner**: DevOps + QA + Dev | **Time**: 2 weeks

---

## Sprint 49: App Store Prep (Jul 26–Aug 8)

**Goal**: Build iOS/Android binaries and prepare for app store submission.

### Features

- [ ] React Native build: iOS + Android binaries
- [ ] App signing: iOS certificates, Android keystore
- [ ] Privacy policy, terms of service
- [ ] App store screenshots + metadata
- [ ] Beta testing: TestFlight (iOS) + Google Play Beta (Android)

### Tasks (Detailed)

- [ ] iOS:
  - Build with `eas build --platform ios`
  - Sign with Apple Developer certificate
  - Create TestFlight build
  - Submit to App Store (review process 24–48h)
- [ ] Android:
  - Build with `eas build --platform android`
  - Sign with Android keystore
  - Create Google Play beta
  - Submit to Play Store (review process 2–4h)
- [ ] Legal:
  - Privacy policy: Data collection, storage, GDPR/LGPD compliance
  - Terms of service: Liability, subscription cancellation
  - Accessibility statement: WCAG 2.1 AA compliance
- [ ] Beta testing:
  - Invite 100+ users to TestFlight + Google Play Beta
  - Collect feedback via in-app surveys
  - Monitor crash logs, analytics

**Owner**: DevOps + Marketing | **Time**: 2 weeks

---

## Sprint 50: Launch & Support (Aug 9–22)

**Goal**: Soft launch (10k beta users) → public launch.

### Features

- [ ] Analytics setup: User acquisition, retention, engagement
- [ ] Support system: In-app help chat, FAQ, email support
- [ ] Onboarding refinement: User feedback → UX improvements
- [ ] Server monitoring: Error tracking, performance alerts

### Tasks (Detailed)

- [ ] Analytics:
  - Segment integration: Track user events
  - Amplitude/Mixpanel: Cohort analysis, retention curves
  - Hotjar: Session replay, heatmaps
- [ ] Support:
  - Intercom or similar: In-app chat + email
  - Zendesk: Support ticket management
  - FAQ page on web
- [ ] Monitoring:
  - Sentry: Error tracking + alerts
  - Datadog/New Relic: Performance monitoring
  - Cloudflare Analytics: Request logs, bottlenecks
- [ ] Soft launch:
  - Beta cohort: 10k users (iOS TestFlight + Android beta)
  - Feedback loop: Weekly surveys, bug reports
  - Metrics: Monitor DAU, retention (day 1, 7, 30), subscription conversion
- [ ] Public launch (Week 2 of Sprint 50):
  - Press release
  - Social media campaign
  - Influencer partnerships
  - Full App Store + Google Play release

**Owner**: Ops + Marketing + Support | **Time**: 2 weeks

---

## Critical Path & Dependencies

```
Sprint 41 (Foundation)
  ├─→ Design System → Sprint 42-50 all screens
  ├─→ DB Schema → Sprint 42-50 all APIs
  └─→ Onboarding → Sprint 42 home screen

Sprint 42 (Treinos)
  ├─→ Workout library → Sprint 43 (IA suggestions use workouts)
  └─→ Session tracking → Sprint 43 (IA context uses sessions)

Sprint 43 (Nutrição)
  ├─→ Meal logging → Sprint 45 (IA context uses meals)
  └─→ IA context cache → Sprint 45 (IA needs cached context)

Sprint 44 (Marketplace)
  ├─→ Trainer data → Sprint 43 (bookings reference trainers)
  └─→ Asaas integration → Sprint 45+ (IA suggests trainers)

Sprint 45 (IA)
  └─→ All modules (Treinos, Nutrição, Avaliações) must be complete

Sprint 46 (Admin)
  └─→ Works independently; used to manage content for above

Sprint 47-50 (Optimization, Testing, Launch)
  └─→ All features must be complete in Sprint 46
```

**Critical**: Do not start Sprint 44 until Sprint 42 & 43 complete (IA context required for smart suggestions).

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Llama API rate-limited | Medium | High | Implement request queuing + fallback to cached responses |
| D1 exercises incomplete | Low | Medium | Seed 100+ exercises early; allow bulk import from CSV |
| Asaas integration delays | Low | High | Use Asaas sandbox for testing; have payment fallback (manual review) |
| Trainer data schema mismatch | Medium | Medium | Verify existing trainer table early (Sprint 41 Week 1) |
| Performance regressions | High | Medium | Profile weekly with Lighthouse; set budget < 2.5s LCP |
| App Store approval delays | Low | High | Submit 2 weeks before public launch; have fallback web version |

---

## Continuity Prompt for Opus

> **Next Session Start Instruction**: If continuing Sprint 41 in Opus:
> 1. Read `.claude/vfit-sprint-breakdown.md` (this file) to understand full roadmap
> 2. Verify current status:
>    - [ ] Design system components created? (vfit-tokens.ts, Button, Card, Input, Modal)
>    - [ ] DB schema migrated to staging Neon branch?
>    - [ ] Onboarding wireframes done?
> 3. If Sprint 41 in progress:
>    - Check current week (Week 1/2/3) and blocked tasks
>    - Resume implementation from latest task in `.claude/session-state.md`
>    - If blocked, escalate blocker to user
> 4. If Sprint 41 complete:
>    - Move to Sprint 42: Create `src/app/(app)/treinos/` pages
>    - Start with WorkoutCard and WorkoutLibrary screen
> 5. Daily: Update `.claude/session-state.md` with progress, blockers, % complete
> **Blockers to watch**: Neon branch creation, D1 exercise seeding, Figma access
> **Estimated total time (all 10 sprints)**: 10 weeks (1 per sprint) @ ~80 hours/sprint = 800 dev hours
> **Team size recommendation**: 1 full-stack + 1 QA/DevOps

