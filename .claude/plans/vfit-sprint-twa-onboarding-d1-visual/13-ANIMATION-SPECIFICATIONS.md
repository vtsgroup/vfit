# 13. Animation Specifications — Exact Timings & Easing

**Versão:** v1.1.0 (Ultra-Modern Microinteractions)  
**Framework:** Framer Motion  
**Philosophy:** Spring physics for natural feel, 150-300ms for fast feedback

---

## Animation Framework

### Easing Functions (Framer Motion)

```typescript
// All animations use these standard easings:

const easings = {
  // Page transitions: smooth entrance
  pageEnter: { duration: 0.3, ease: 'easeInOut' },
  
  // Quick feedback (buttons, toggles)
  quickPress: { duration: 0.1, ease: 'easeOut' },
  
  // Natural motion (spring, scroll reveal)
  spring: { type: 'spring', damping: 20, stiffness: 300 },
  
  // Bounce/celebration (success states)
  bounce: { type: 'spring', damping: 10, stiffness: 200 },
  
  // Smooth list stagger
  stagger: { delayChildren: 0.05, staggerDirection: 1 },
  
  // Error shake
  shake: { type: 'spring', damping: 8, stiffness: 400 },
}
```

---

## Phase 1: TWA Welcome Entry

### 1.1 — Page Mount (Welcome Page)

**Trigger:** User opens app, not authenticated  
**Duration:** 300ms  
**Easing:** `easeInOut`

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
  className="min-h-dvh"
>
  {/* Hero section */}
</motion.div>
```

**Visual:**
- Content fades in + slides up slightly (20px)
- Creates sense of "arrival"

### 1.2 — Button Hover State

**Trigger:** User hovers over CTA button  
**Duration:** 150ms  
**Easing:** `easeOut`

```typescript
<motion.button
  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
>
  Começar Onboarding
</motion.button>
```

**Visual:**
- Scale up 2% (subtle, not aggressive)
- Shadow grows (glow effect)
- Tap scales down 2% (press feedback)

### 1.3 — Logo/Hero Orb Pulse

**Trigger:** Page loaded, continuous (idle state)  
**Duration:** 2s per cycle  
**Easing:** Custom oscillation

```typescript
<motion.div
  className="relative h-16 w-16"
  animate={{
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
  }}
  transition={{
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
>
  <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-xl" />
  <div className="relative h-full w-full rounded-full bg-brand-primary flex items-center justify-center">
    🏋️
  </div>
</motion.div>
```

**Visual:**
- Gentle breathing effect (±5% scale)
- Opacity oscillates for glow effect
- Infinite loop, no abrupt stops

---

## Phase 2: Onboarding Flow

### 2.1 — Quiz Question Entrance

**Trigger:** Each step renders (17 total)  
**Duration:** 250ms + stagger  
**Easing:** `easeOut`

```typescript
<motion.div
  key={currentStep}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
  className="space-y-4"
>
  <h2 className="text-2xl font-bold">{question.text}</h2>
  
  {/* Options with stagger */}
  <motion.div
    className="space-y-2"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
        },
      },
    }}
    initial="hidden"
    animate="show"
  >
    {question.options.map((option) => (
      <motion.button
        key={option.id}
        variants={{
          hidden: { opacity: 0, x: -10 },
          show: { opacity: 1, x: 0 },
        }}
        onClick={() => selectOption(option)}
      >
        {option.label}
      </motion.button>
    ))}
  </motion.div>
</motion.div>
```

**Visual:**
- Question slides in from right (20px) + fades in
- Options slide in staggered (8ms apart) creating "wave" effect
- Exit animation slides left (-20px) for next question

### 2.2 — Progress Bar Update

**Trigger:** After each step selection  
**Duration:** 400ms  
**Easing:** Spring

```typescript
<motion.div className="relative h-1 overflow-hidden rounded-full bg-bg-tertiary">
  <motion.div
    className="h-full bg-linear-to-r from-brand-primary to-brand-primary/60"
    animate={{ width: `${progress}%` }}
    transition={{
      type: 'spring',
      damping: 30,
      stiffness: 100,
      duration: 0.4,
    }}
  />
</motion.div>

<motion.span
  className="text-xs text-text-muted"
  key={currentStep}
  animate={{ opacity: 1, scale: 1 }}
  initial={{ opacity: 0.7, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Step {currentStep + 1}/{totalSteps}
</motion.span>
```

**Visual:**
- Progress bar smoothly grows with spring physics
- Step counter scales + fades when updated (micro-feedback)

### 2.3 — Loading Screen (Generating Plan)

**Trigger:** User clicks "Gerar Plano" on final screen  
**Duration:** While generating (20-30s)  
**Easing:** Continuous loop

```typescript
<motion.div className="flex flex-col items-center justify-center min-h-dvh">
  {/* Orbiting particles */}
  <motion.div
    className="relative h-32 w-32"
    animate={{ rotate: 360 }}
    transition={{
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    }}
  >
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-primary border-r-brand-primary/50"
      style={{ borderTopLeftRadius: '50%' }}
    />
  </motion.div>

  {/* Emoji phase transitions */}
  <motion.div
    className="mt-8 text-5xl"
    key={phase.emoji}
    animate={{ scale: [0.8, 1, 0.8], y: [0, -5, 0] }}
    transition={{
      duration: 1.5,
      ease: 'easeInOut',
    }}
  >
    {phase.emoji}
  </motion.div>

  {/* Phase label with layout animation */}
  <motion.h2
    className="mt-6 text-lg font-semibold text-text-primary"
    layoutId="phase-label"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {phase.label}
  </motion.h2>

  {/* Loading text pulse */}
  <motion.p
    className="mt-4 text-sm text-text-muted"
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    }}
  >
    Gerando seu plano personalizado...
  </motion.p>
</motion.div>
```

**Visual:**
- Rotating border (3s/rotation, linear)
- Emoji bounces + scales (breathing effect, 1.5s cycle)
- Text pulses opacity (fades in/out smoothly)
- Phase label transitions with layout animations

### 2.4 — Result Cards Entrance

**Trigger:** Plan generation completes, transitions to Result page  
**Duration:** 300ms initial + 100ms stagger per card  
**Easing:** Spring for cards, easeInOut for page

```typescript
<motion.div
  className="min-h-dvh bg-bg-primary"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  {/* Hero gradient background */}
  <motion.div
    className="absolute inset-0 h-96 bg-linear-to-b from-brand-primary/5 via-transparent to-transparent"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4, delay: 0.1 }}
  />

  {/* Stat cards grid */}
  <motion.div
    className="grid grid-cols-2 gap-3 pt-4"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    }}
    initial="hidden"
    animate="show"
  >
    {stats.map((stat, i) => (
      <motion.div
        key={i}
        variants={{
          hidden: { opacity: 0, scale: 0.9, y: 10 },
          show: { opacity: 1, scale: 1, y: 0 },
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-brand-primary/30"
        whileHover={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.5)',
        }}
      >
        {/* Content */}
      </motion.div>
    ))}
  </motion.div>

  {/* Workout days list */}
  <motion.div
    className="space-y-3 px-6 py-8"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.4,
        },
      },
    }}
    initial="hidden"
    animate="show"
  >
    {plan.days.map((day, idx) => (
      <motion.div
        key={day.id}
        variants={{
          hidden: { opacity: 0, x: -20 },
          show: { opacity: 1, x: 0 },
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        whileHover={{ x: 4 }}
        className="group rounded-2xl border border-white/8 bg-white/3 p-4"
      >
        {/* Day content */}
      </motion.div>
    ))}
  </motion.div>
</motion.div>
```

**Visual:**
- Page fades in from bottom (y: 30px)
- Stat cards spring in with stagger (100ms between)
- Workout day cards spring in after cards (400ms total delay)
- Hover state: subtle slide right (4px) + color transition

---

## Phase 3: D1 Sync & Offline

### 3.1 — Sync Status Indicator

**Trigger:** Data syncing in background  
**Duration:** Continuous until synced  
**Easing:** Linear rotation

```typescript
<motion.div
  className={cn(
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
    syncState === 'synced'
      ? 'bg-green-500/10 text-green-600'
      : syncState === 'syncing'
      ? 'bg-blue-500/10 text-blue-600'
      : 'bg-amber-500/10 text-amber-600'
  )}
>
  <motion.div
    animate={{ rotate: syncState === 'syncing' ? 360 : 0 }}
    transition={{
      duration: 1,
      ease: 'linear',
      repeat: syncState === 'syncing' ? Infinity : 0,
    }}
  >
    {syncState === 'synced' && <CheckCircle size={16} />}
    {syncState === 'syncing' && <RefreshCw size={16} />}
    {syncState === 'offline' && <WifiOff size={16} />}
  </motion.div>

  <span>
    {syncState === 'synced' && 'Sincronizado'}
    {syncState === 'syncing' && 'Sincronizando...'}
    {syncState === 'offline' && 'Offline'}
  </span>
</motion.div>
```

**Visual:**
- Syncing state: rotating icon (1s/rotation)
- Synced state: static checkmark + fade in
- Offline state: warning icon + amber color

---

## Phase 4: Dashboard & Components

### 4.1 — Button Press (All Buttons)

**Trigger:** User clicks any button  
**Duration:** 150ms total (press + release)  
**Easing:** `easeOut`

```typescript
<motion.button
  whileTap={{
    scale: 0.95,
  }}
  transition={{
    duration: 0.1,
    ease: 'easeOut',
  }}
  className="h-10 px-4 rounded-lg bg-brand-primary text-white"
>
  Action
</motion.button>
```

**Visual:**
- Press: scale down 5% (0.95x) instantly
- Release: scale back up with easing

### 4.2 — Sidebar Navigation Hover

**Trigger:** Hover over nav item  
**Duration:** 200ms  
**Easing:** Spring

```typescript
<motion.div
  whileHover={{ x: 4 }}
  transition={{
    type: 'spring',
    damping: 20,
    stiffness: 300,
    duration: 0.2,
  }}
>
  <Link
    href={item.href}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
      isActive
        ? 'bg-brand-primary/20 text-brand-primary'
        : 'text-text-secondary hover:bg-white/5'
    )}
  >
    {/* Nav content */}
  </Link>
</motion.div>
```

**Visual:**
- Hover: slide right (4px) with spring bounce
- Spring creates natural "springy" feel (damping:20, stiffness:300)

### 4.3 — Modal Entrance

**Trigger:** User opens any modal/bottom sheet  
**Duration:** 300ms  
**Easing:** Spring (modal), easeInOut (overlay)

```typescript
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />

      {/* Bottom sheet modal */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-bg-primary p-6"
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      >
        {/* Content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Visual:**
- Overlay fades in (200ms)
- Modal slides up from bottom (spring, ~300ms)
- Exit reverses animations

### 4.4 — Error Toast

**Trigger:** Validation error or API error  
**Duration:** 300ms entrance + 2.5s display + 200ms exit  
**Easing:** Spring entrance, easeInOut exit

```typescript
<AnimatePresence>
  {error && (
    <motion.div
      className="fixed bottom-6 right-6 max-w-sm"
      initial={{ opacity: 0, x: 100, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: 20 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
    >
      <div className="flex items-start gap-3 rounded-lg bg-error/10 p-4 border border-error/30">
        <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-error">{error.title}</p>
          <p className="text-sm text-error/80 mt-1">{error.message}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-error/60 hover:text-error ml-2"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

**Visual:**
- Spring in from right (100px) + scale up (0.95 → 1)
- Display for 2.5s
- Spring out with same direction

### 4.5 — Success Celebration (Plan Created)

**Trigger:** Plan successfully created and saved  
**Duration:** 600ms  
**Easing:** Bounce

```typescript
<motion.div
  className="flex items-center justify-center gap-2"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    type: 'spring',
    damping: 10,
    stiffness: 200,
  }}
>
  <Sparkles className="text-brand-primary" />
  <span className="font-semibold text-brand-primary">Plano criado com sucesso!</span>
</motion.div>
```

**Visual:**
- Pop in with bounce (scale: 0.8 → 1.1 → 1)
- Spring physics create "excited" feeling

### 4.6 — Skeleton Shimmer (Loading State)

**Trigger:** Data loading  
**Duration:** 1s per cycle (infinite until loaded)  
**Easing:** Linear

```typescript
<motion.div
  className="h-4 rounded bg-linear-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary"
  animate={{
    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
  }}
  transition={{
    duration: 1,
    ease: 'linear',
    repeat: Infinity,
  }}
  style={{
    backgroundSize: '200% 100%',
  }}
/>
```

**Visual:**
- Shimmer effect (gradient slides left to right continuously)
- 1s per cycle, linear motion for smooth loop

---

## General Animation Principles

### Timing Hierarchy

```
User feedback (click):      100-150ms  (immediate)
Micro interactions (hover): 150-200ms  (quick response)
Transitions (page):         250-300ms  (noticeable but fast)
Entrance animations:        300-400ms  (spring physics)
Loading states:             1-3s       (continuous loop)
Celebrations:               500-600ms  (spring bounce)
```

### When to Use Spring vs Easing

**Use Spring for:**
- Natural motion (buttons, cards, modals)
- Celebratory moments (success)
- Interactive feedback (hover, drag)

**Use Easing for:**
- Page transitions (consistent timing)
- Programmatic changes (not user-triggered)
- Continuous loops (loading, pulse)

### Performance Notes

- Always use `will-change: transform` on animated elements
- Limit simultaneous animations to <5 on mobile
- Use `GPU-accelerated` transforms only (avoid `width`, `height`)
- Profile on real devices (not Chrome dev tools)

---

## Animation Checklist for Implementation

- [ ] Phase 1: Welcome page entrance + button hovers
- [ ] Phase 1: Logo pulse (idle state)
- [ ] Phase 2: Quiz questions stagger + progress bar spring
- [ ] Phase 2: Loading screen (rotating icon + emoji bounce)
- [ ] Phase 2: Result page cards spring in with stagger
- [ ] Phase 3: Sync indicator rotation + state changes
- [ ] Phase 4: Button tap scale + spring
- [ ] Phase 4: Sidebar nav hover spring
- [ ] Phase 4: Modal entrance + overlay fade
- [ ] Phase 4: Error toast spring in
- [ ] Phase 4: Success celebration bounce
- [ ] Phase 4: Skeleton shimmer loop
- [ ] All: Verify `prefers-reduced-motion` support
- [ ] All: Test on mobile (real device performance)
- [ ] All: Profile with Chrome DevTools Performance tab

---

**Animation should feel natural, responsive, and delightful—never jarring or slow!**
