# 02. Performance & Bundle Optimization

> **Sprint:** S18 (6 dias)  
> **Impacto:** Reduzir bundle 35% (280KB → 180KB), LCP -40% (3.2s → 2.0s)  
> **Data:** 08-13/04/2026

---

## Executive Summary

VFIT atual: **280KB initial JS** (heavy recharts, charts, xlsx, pdf-lib).

**Objetivo S18:**
- Code split charts (100KB reduction)
- Image optimization WebP (60KB reduction)
- Service Worker cache-first (50KB virtual reduction)
- **Target: 120KB initial JS + LCP 2.0s**

---

## Phase 18a: Bundle Analysis & Code Splitting

### T18a.1: Bundle Measurement

**Current state:**
```bash
npm run build

# Output expected:
# Next.js optimized build complete:
# - Server: 450 pages → 2.5MB
# - Client: 280KB initial JS
# - CSS: 45KB (minified)
```

**Analyze with:**
```bash
npx @next/bundle-analyzer --outdir=.next/analyze

# Generate report showing:
# - recharts: 150KB (charts)
# - chart.js: 50KB (if used)
# - xlsx: 40KB (export)
# - pdf-lib: 35KB (reports)
# - rest: 5KB
```

**Deliverable:** `BUILD_ANALYSIS_BASELINE.md`
```markdown
# Bundle Analysis — v1.6.0 Baseline

## Initial JavaScript

| Package | Size | % | Importers |
|---------|------|---|-----------|
| recharts | 150KB | 54% | `/dashboard/charts/*` |
| pdf-lib | 35KB | 13% | `/dashboard/payments/`, `/financeiro/` |
| xlsx | 40KB | 14% | `/students/import`, `/export-buttons` |
| chart.js | 0KB | 0% | Not detected (removed?) |
| ... rest | 55KB | 19% | Core app |
| **TOTAL** | **280KB** | **100%** | |

## Opportunities

1. ❌ recharts: NEVER dynamically imported
2. ❌ pdf-lib: NEVER dynamically imported  
3. ❌ xlsx: Already dynamic (verify)
4. ✅ Core app: Solid, cannot reduce further

## Action Items
- [ ] T18a.3: Code split recharts
- [ ] T18a.4: Code split pdf-lib
- [ ] T18a.5: Verify xlsx is dynamic
```

**Critério:** Report file created and reviewed.

---

### T18a.2: Identify Heavy Libraries

```typescript
// Current usage pattern (WRONG — all loaded upfront)

import RevenueAreaChart from '@/components/dashboard/charts/revenue-area-chart'
import StudentsPieChart from '@/components/dashboard/charts/students-pie-chart'
import WorkoutsBarChart from '@/components/dashboard/charts/workouts-bar-chart'

export default function DashboardPage() {
  return (
    <>
      {/* All 3 charts loaded immediately, even if not visible */}
      <RevenueAreaChart ... />
      <StudentsPieChart ... />
      <WorkoutsBarChart ... />
    </>
  )
}
```

**Problems:**
- Heavy charts loaded on initial page (not above-fold)
- User sees spinner 3.2s before seeing header stats
- All charts parsed/compiled on main thread

**Verification checklist:**
- [ ] Find all imports of recharts in codebase
- [ ] Find all imports of xlsx
- [ ] Find all imports of pdf-lib
- [ ] Document in BUNDLE_AUDIT.md

---

### T18a.3: Code Split Recharts

**Current (src/app/dashboard/page.tsx):**
```typescript
import dynamic from 'next/dynamic'

// ❌ WRONG: still loading recharts on page load
const RevenueAreaChart = dynamic(
  () => import('@/components/dashboard/charts/revenue-area-chart'),
  // Missing key config!
)

// ✅ CORRECT: explicit dynamic config
const RevenueAreaChart = dynamic(
  () => import('@/components/dashboard/charts/revenue-area-chart').then(m => m.RevenueAreaChart),
  {
    loading: () => <div className="h-80 animate-pulse rounded-2xl bg-white/5" />,
    ssr: false,  // Don't render on server (recharts uses canvas)
  }
)

const StudentsPieChart = dynamic(
  () => import('@/components/dashboard/charts/students-pie-chart').then(m => m.StudentsPieChart),
  { loading: () => <ChartSkeleton />, ssr: false }
)

const WorkoutsBarChart = dynamic(
  () => import('@/components/dashboard/charts/workouts-bar-chart').then(m => m.WorkoutsBarChart),
  { loading: () => <ChartSkeleton />, ssr: false }
)
```

**Verify in src/app/dashboard/page.tsx:**
```bash
grep -n "import.*Chart" src/app/dashboard/page.tsx
# Should show: 3 dynamic imports with { loading, ssr: false }
```

**Deliverable:** Verify file shows 3 dynamic chart imports at lines ~48-51.

**Metrics:**
- Before: 280KB initial JS (recharts 150KB included)
- After: 180KB initial JS (recharts deferred to lazy load)
- LCP improvement: 3.2s → 2.4s (28% faster)

---

### T18a.4: Verify PDF & XLSX Dynamic

**pdf-lib usage:**
```typescript
// src/components/dashboard/export-buttons.tsx
// Should be:
const PDFExporter = dynamic(
  () => import('pdf-lib').then(m => m.PDFDocument),
  { ssr: false }
)

// OR (better):
const generatePDF = async () => {
  const { PDFDocument } = await import('pdf-lib')
  // use it
}
```

**xlsx usage:**
```typescript
// src/app/dashboard/students/import/page.tsx
// Should be:
const XLSX = await import('xlsx')
// Already dynamic? ✅ Verify
```

**Checklist:**
- [ ] Find pdf-lib imports (should be 0 in initial JS)
- [ ] Find xlsx imports (should be 0 in initial JS)
- [ ] Verify both are awaited dynamically

---

### T18a.5: Remove Unused CSS

```bash
# Install purgecss (optional check)
npm install -D @fullhuman/postcss-purgecss

# Or use Tailwind built-in analysis
npx tailwindcss-cli --content 'src/**/*.{js,jsx,ts,tsx}' --output css-analysis.log

# Expected: Tailwind already removes unused classes
# Just verify no redundancy
```

**Tailwind v4 already treeshakes unused classes**, but verify:
- [ ] No duplicate CSS vars
- [ ] No unused @apply rules
- [ ] No hardcoded inline styles

**Target:** CSS size stays ≤45KB.

---

### T18a.6: Measure Final Bundle

**After S18a changes:**
```bash
npm run build

# Expected output:
# - Initial JS: ~180KB (from 280KB) ✅
# - CSS: ~45KB (unchanged)
# - Images: Will optimize in Phase 18b

# Check LCP with Lighthouse:
npx lighthouse https://localhost:3000/dashboard --view
# Target: LCP 2.5s (currently 3.2s)
```

**Deliverable:** `BUNDLE_ANALYSIS_AFTER_S18a.md`

---

## Phase 18b: Image Optimization

### T18b.1: Image Audit

```bash
find public -type f \( -name "*.png" -o -name "*.jpg" \) -exec ls -lh {} \;

# Expected output:
# public/icons/icon-48.png        6.2K
# public/icons/icon-72.png        8.4K
# public/icons/icon-96.png        12K
# public/icons/icon-128.png       18K
# ... more
# TOTAL: ~500KB of PNGs
```

**CSV Output (IMAGE_AUDIT.csv):**
```
File,Size,Type,Candidates,Savings
public/icons/icon-48.png,6.2K,PNG,WebP,40%
public/icons/icon-72.png,8.4K,PNG,WebP,40%
...
TOTAL,500K,—,WebP,40-60%
```

---

### T18b.2: Convert PNG → WebP/AVIF

```bash
# Install sharp
npm install -D sharp

# Create script: scripts/optimize-images.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const imageDir = path.join(__dirname, '../public')

fs.readdirSync(imageDir).forEach(file => {
  if (file.endsWith('.png')) {
    sharp(path.join(imageDir, file))
      .webp({ quality: 80 })
      .toFile(path.join(imageDir, file.replace('.png', '.webp')))
      
    sharp(path.join(imageDir, file))
      .avif({ quality: 70 })
      .toFile(path.join(imageDir, file.replace('.png', '.avif')))
  }
})
```

**Run:**
```bash
node scripts/optimize-images.js

# Result:
# public/icons/icon-48.png    → .webp (3.8K, -39%)
# public/icons/icon-48.avif   → .avif (3.2K, -48%)
```

**Keep PNGs as fallback** for old browsers.

---

### T18b.3: Update img Tags

**Current (wrong):**
```html
<img src="/icons/icon-48.png" alt="App icon" />
```

**Correct pattern:**
```html
<picture>
  <source srcset="/icons/icon-48.avif" type="image/avif" />
  <source srcset="/icons/icon-48.webp" type="image/webp" />
  <img src="/icons/icon-48.png" alt="App icon" />
</picture>
```

**Or in Next.js Image component:**
```typescript
import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      src="/icons/icon-48.webp"
      alt="App icon"
      width={48}
      height={48}
      quality={80}
    />
  )
}
// Next.js automatically serves WebP to modern browsers
```

**Audit usage:**
```bash
grep -r "<img src=" src/  # Find all <img> tags
grep -r "Image src=" src/ # Find all <Image> tags

# Convert 20+ img tags → picture or <Image>
```

---

### T18b.4: Test Image Fallbacks

```typescript
// Test old browser (PNG fallback):
// In DevTools, disable WebP support:
// Settings → Disable → WebP

// Should see PNG being served ✅

// In modern browser (Chrome, Edge):
// Should see WebP being served ✅
```

---

## Phase 18c: Service Worker & Offline

### T18c.1: Audit Current Service Worker

**Check:** `public/service-worker.js`

```javascript
// Current strategy analysis:
// 1. What routes are cached?
// 2. What's the cache strategy (cache-first, network-first, stale-while-revalidate)?
// 3. What API calls are cached?

// Expected findings:
// - Shell (/, /dashboard, /treinos) NOT cached → users see loading
// - API calls NOT cached → offline breaks everything
// - Images NOT cached → offline shows broken images
```

**Deliverable:** `SERVICE_WORKER_AUDIT.md`
```markdown
# Service Worker Analysis — v1.6.0

## Current Caching Strategy

### Cached Routes
- None (strategy not implemented)

### Cached API
- None

### Cached Assets (CSS/fonts)
- Basic: only manifest, icons

### Problems
1. App shell not cached → can't load offline
2. API calls not cached → no offline data
3. No stale-while-revalidate for backgrounds sync

### Recommendations
1. Cache app shell (/)
2. Cache API responses with TTL
3. Implement sync for pending requests
```

---

### T18c.2: Implement Cache-First Shell

```javascript
// public/service-worker.js

const CACHE_V1 = 'vfit-v1-2026'
const SHELL_URLS = [
  '/',
  '/dashboard',
  '/treinos',
  '/treino-ativo',
  '/perfil',
]

// On install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_V1).then((cache) => {
      return cache.addAll(SHELL_URLS)
    })
  )
  self.skipWaiting()
})

// On fetch: cache-first for shell, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Shell: cache-first
  if (SHELL_URLS.some(shell => url.pathname.startsWith(shell))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          caches.open(CACHE_V1).then((cache) => {
            cache.put(request, response.clone())
          })
          return response
        })
      })
    )
  }
  // API: network-first with fallback
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE_V1).then((cache) => {
            cache.put(request, response.clone())
          })
          return response
        })
        .catch(() => {
          return caches.match(request) || new Response('Offline', { status: 503 })
        })
    )
  }
})
```

---

### T18c.3: Implement Stale-While-Revalidate

```javascript
// For non-critical data (workout history, stats):
// Serve cached immediately, update in background

const staleWhileRevalidate = async (request) => {
  const cached = await caches.match(request)
  
  const fetched = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_V1)
        cache.then((c) => c.put(request, response.clone()))
      }
      return response
    })
    .catch(() => null)

  return cached || fetched || new Response('Offline', { status: 503 })
}
```

---

### T18c.4: Sync API Pending Requests

```javascript
// When user is offline, queue requests for sync

class SyncQueue {
  async add(request) {
    const db = await openDB()
    await db.add('sync-queue', {
      url: request.url,
      method: request.method,
      body: await request.text(),
      timestamp: Date.now(),
    })
  }

  async processQueue() {
    const db = await openDB()
    const items = await db.getAll('sync-queue')
    
    for (const item of items) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          body: item.body,
        })
        if (response.ok) {
          await db.delete('sync-queue', item.id)
        }
      } catch (e) {
        console.warn('Sync failed, will retry', e)
      }
    }
  }
}

// Register sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(new SyncQueue().processQueue())
  }
})
```

---

### T18c.5: Test Offline Flow

**Manual test steps:**
```typescript
// 1. Open app
// 2. Create a workout (POST)
// 3. Devtools → Network → Offline
// 4. Try to complete workout → should queue locally
// 5. Devtools → Network → Online
// 6. Auto-sync should trigger
// 7. Verify POST successful
```

**Automated Playwright test:**
```typescript
// tests/e2e/offline.spec.ts
import { test, expect } from '@playwright/test'

test('offline sync', async ({ page, context }) => {
  // 1. Load app
  await page.goto('/treinos')
  
  // 2. Go offline
  await context.setOffline(true)
  
  // 3. Create workout (queued)
  await page.click('button:has-text("Treino")')
  await page.fill('input[name="name"]', 'Offline Workout')
  await page.click('button:has-text("Save")')
  
  // 4. Should show "Saved locally"
  await expect(page.locator('text=Saved locally')).toBeVisible()
  
  // 5. Go online
  await context.setOffline(false)
  
  // 6. Should auto-sync
  await page.waitForTimeout(1000)
  await expect(page.locator('text=Synced')).toBeVisible()
})
```

---

### T18c.6: Offline Indicator UI

```typescript
// src/components/offline-indicator.tsx
'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center gap-2">
      <DSIcon name="wifiOff" size={16} className="text-amber-500" />
      <span className="text-xs font-semibold text-amber-500">
        Offline — suas mudanças serão sincronizadas
      </span>
    </div>
  )
}
```

**Add to layout:**
```typescript
import { OfflineIndicator } from '@/components/offline-indicator'

export default function AppLayout() {
  return (
    <>
      <OfflineIndicator />
      {/* rest of layout */}
    </>
  )
}
```

---

## Summary: S18 Deliverables

| Task | Deliverable | Owner | Days |
|---|---|---|---|
| T18a.1-6 | Bundle reduced 280KB → 180KB | Dev | 2 |
| T18b.1-4 | Images WebP/AVIF (500KB → 200KB) | Dev | 1 |
| T18c.1-6 | Service Worker + offline sync | Dev | 3 |
| **Total** | **S18 Complete** | **1 Dev** | **6** |

## Metrics

| Métrica | Before | After | Improvement |
|---|---|---|---|
| Initial JS | 280KB | 180KB | **-36%** ✅ |
| LCP | 3.2s | 2.0s | **-37%** ✅ |
| FCP | 2.1s | 1.4s | **-33%** ✅ |
| Bundle Size (total) | 780KB | 520KB | **-33%** ✅ |
| Offline Support | ❌ | ✅ | **100%** ✅ |

---

## Acceptance Criteria

- [ ] Bundle analysis documented (BEFORE & AFTER)
- [ ] recharts/pdf-lib/xlsx dynamically imported
- [ ] All images converted to WebP with PNG fallback
- [ ] Service Worker caching implemented (shell + API)
- [ ] Offline sync working (manual + automated tests)
- [ ] Offline indicator visible on client
- [ ] npm run build succeeds
- [ ] Lighthouse score ≥90 (Performance)

---

**Next:** Sprint S19 kickoff → Engagement Layer
