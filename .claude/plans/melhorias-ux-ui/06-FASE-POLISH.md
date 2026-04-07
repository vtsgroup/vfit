# 🎨 FASE 4 — POLISH & LAUNCH

**Fase:** 4/4 (Final)  
**Sprints:** 15-16  
**Duração:** 2 semanas (semanas 10-12 de projeto)  
**Horas:** 38h (dev) + 8h (QA)  
**Status:** ⏳ Bloqueado em Fase 3  
**Objetivo:** Polir UI/UX com animações, otimizar performance, atingir Lighthouse 90+, preparar v2.0.0 launch  

---

## 📅 Timeline

```
Semana 10   Semana 11   Semana 12
─────────   ─────────   ──────────
Sprint 15   Sprint 15   Sprint 16
(Animate)   (contd)     (Perfecto!)

8h anim     Anim       9h perf
framer      contd      5h qua
7h states   5h perf    1h docs

                        ✅ v2.0.0
                        🚀 LAUNCH
```

---

## 🎬 Sprint 15 — Animações & Transições (8h Dev + 4h QA)

**Objetivo:** Adicionar Framer Motion animations para dar vida à aplicação  
**Dependências:** Fase 3 (features modernas funcionando)  
**Acceptance:** Todas transições <300ms, smooth 60fps, nenhuma jank  

---

### Task 15.1: Transições de Onboarding (3h)

Integrar **Framer Motion v10** para animar as transições entre steps.

**O que fazer:**

1. **Instalar Framer Motion**
```bash
npm install framer-motion@^11.0.0
```

2. **Criar componente wrapper animado**
```typescript
// src/components/onboarding/animated-step.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedStepProps {
  children: ReactNode
  stepNumber: number
  direction?: 'forward' | 'backward'
}

const stepVariants = {
  initial: (direction?: string) => ({
    opacity: 0,
    x: direction === 'backward' ? 100 : -100,
    y: 20
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: (direction?: string) => ({
    opacity: 0,
    x: direction === 'backward' ? -100 : 100,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  })
}

export function AnimatedStep({
  children,
  stepNumber,
  direction = 'forward'
}: AnimatedStepProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={`step-${stepNumber}`}
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        custom={direction}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

3. **Integrar no onboarding**
```typescript
// src/app/onboarding/page.tsx
'use client'

import { AnimatedStep } from '@/components/onboarding/animated-step'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useState } from 'react'

export default function OnboardingPage() {
  const { currentStep, direction } = useOnboardingStore()
  const [key, setKey] = useState(0)

  return (
    <div className="min-h-screen bg-white dark:bg-bg-primary">
      <AnimatedStep 
        stepNumber={currentStep}
        direction={direction}
      >
        {currentStep === 1 && <Step1_Welcome />}
        {currentStep === 2 && <Step2_Photo />}
        {currentStep === 3 && <Step3_Bio />}
        {/* ... mais steps ... */}
      </AnimatedStep>
    </div>
  )
}
```

4. **Testes**
   - Chrome DevTools: 60fps em transição de step
   - Mobile: Sem lag em iPhone 12
   - Acessibilidade: `prefers-reduced-motion: reduce` respeitado

**Tempo:** 3h  
**QA:** 1h (verificar 60fps, sem jank)

---

### Task 15.2: Loading States & Skeletons (2h)

Animar loading states com skeleton screens suaves.

**O que fazer:**

1. **Componente Skeleton com Framer Motion**
```typescript
// src/components/ui/skeleton-loading.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SkeletonLoadingProps {
  children: ReactNode
  isLoading: boolean
}

export function SkeletonLoading({
  children,
  isLoading
}: SkeletonLoadingProps) {
  if (!isLoading) return <>{children}</>

  const shimmer = {
    initial: { backgroundPosition: '200% 0' },
    animate: {
      backgroundPosition: '-200% 0',
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className="h-full rounded-xl bg-linear-to-r from-gray-200 via-white to-gray-200 dark:from-surface-2 dark:via-surface-1 dark:to-surface-2"
      style={{ backgroundSize: '200% 100%' }}
    />
  )
}
```

2. **Aplicar em cards de exercício**
```typescript
// src/app/treinos/exercise-card.tsx
export function ExerciseCard({ exercise, isLoading }: Props) {
  return (
    <SkeletonLoading isLoading={isLoading}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl bg-white dark:bg-surface-1 p-4 shadow-md"
      >
        <img src={exercise.gif} alt={exercise.name} />
        <h3>{exercise.name}</h3>
        <p>{exercise.targetMuscle}</p>
      </motion.div>
    </SkeletonLoading>
  )
}
```

3. **Testes**
   - Shimmer animation: smooth 2s loop
   - Mobile: não drena bateria rapidamente
   - Accessibility: semântica preservada

**Tempo:** 2h  
**QA:** 0.5h

---

### Task 15.3: Hover & Focus States (1.5h)

Adicionar hover e focus animations com Framer Motion.

**O que fazer:**

1. **Button hover/focus animations**
```typescript
// src/components/ui/button.tsx (update)
import { motion } from 'framer-motion'

export function Button({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.95 }}
      whileFocus={{ outline: '2px solid var(--color-brand-primary)' }}
      transition={{ duration: 0.15 }}
      className={cn(buttonClasses)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

2. **Card hover effects**
```typescript
<motion.div
  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
  transition={{ duration: 0.2 }}
  className="rounded-xl bg-white dark:bg-surface-1 cursor-pointer"
>
  {/* card content */}
</motion.div>
```

3. **Menu item animations**
```typescript
<motion.div
  whileHover={{ x: 4 }}
  className="px-4 py-2 cursor-pointer"
>
  {/* menu item */}
</motion.div>
```

4. **Testes**
   - Desktop: hover smooth e responsivo
   - Mobile: tap states funcionam
   - Keyboard: focus ring visível

**Tempo:** 1.5h  
**QA:** 0.5h

---

### Task 15.4: Page Transitions (1.5h)

Animar transições entre páginas.

**O que fazer:**

1. **Criar layout wrapper com AnimatePresence**
```typescript
// src/app/layout.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html>
      <body>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </body>
    </html>
  )
}
```

2. **Testes**
  - Navegação: transição <200ms
  - Back button: reverse animation
  - Mobile: não causa layout shift

**Tempo:** 1.5h  
**QA:** 1h

---

### Sprint 15 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| Step transitions | 3h | 1h | **4h** |
| Loading states | 2h | 0.5h | **2.5h** |
| Hover/focus | 1.5h | 0.5h | **2h** |
| Page transitions | 1.5h | 1h | **2.5h** |
| **Sprint 15 Total** | **8h** | **3h** | **11h** |

**Acceptance:**
- ✅ Todas animações <300ms
- ✅ 60fps em todas transições
- ✅ Nenhuma jank em mobile
- ✅ Acessibilidade respeitada
- ✅ Type-check: 0 errors
- ✅ Deploy test: staging completo

---

## ⚡ Sprint 16 — Performance & Launch (9h Dev + 5h QA)

**Objetivo:** Otimizar performance para Lighthouse 90+, fazer QA final, lançar v2.0.0  
**Dependências:** Sprint 15 (animações completas)  
**Acceptance:** Lighthouse 90+, zero P0 bugs, docs completas  

---

### Task 16.1: Lighthouse Audit & Otimizações (3h)

Fazer full Lighthouse audit e otimizar para 90+ score.

**O que fazer:**

1. **Rodar Lighthouse (baseline)**
```bash
npm run lighthouse:mobile
npm run lighthouse:desktop
```

**Esperado baseline pós Fase 3:**
- Lighthouse mobile: 75-80
- Lighthouse desktop: 82-85
- LCP: 2.8-3.2s
- FID: <100ms
- CLS: <0.1

2. **Otimizações comuns**

```typescript
// Otimização 1: Image optimization
// src/app/treinos/page.tsx
import Image from 'next/image'

export function ExerciseImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={320}
      height={320}
      quality={80}
      priority={false}
      loading="lazy"
      className="rounded-xl"
    />
  )
}
```

```typescript
// Otimização 2: Dynamic imports para reduzir bundle
// src/app/dashboard/page.tsx
import dynamic from 'next/dynamic'

const ChartsSection = dynamic(
  () => import('@/components/charts-section'),
  { loading: () => <SkeletonLoading /> }
)

export default function DashboardPage() {
  return (
    <>
      <Header />
      <ChartsSection /> {/* carrega quando necessário */}
    </>
  )
}
```

```typescript
// Otimização 3: Font preload
// next.config.ts
module.exports = {
  experimental: {
    optimizeFonts: true,
    optimizePackageImports: ['framer-motion', 'zustand']
  }
}
```

3. **Bundle analysis**
```bash
npm run bundle-analyzer
# Esperado: <200KB gzip (vs. 245KB baseline)
```

4. **Cache headers**
```
# public/_headers (Cloudflare)
/*
  Cache-Control: public, max-age=0, must-revalidate

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

**Tempo:** 3h  
**QA:** 1.5h

---

### Task 16.2: Core Web Vitals Tuning (2h)

Otimizar Core Web Vitals para score perfeito.

**O que fazer:**

1. **Reduzir LCP (target <2.5s)**

```typescript
// Preload critical resources
// src/app/layout.tsx
<head>
  {/* Preload critical image */}
  <link
    rel="preload"
    as="image"
    href="/logo.svg"
    imagesrcset="/logo-sm.svg 320w, /logo-md.svg 640w, /logo.svg 1280w"
  />
  
  {/* Preload critical font */}
  <link
    rel="preload"
    as="font"
    href="/fonts/inter-var.woff2"
    type="font/woff2"
    crossOrigin="anonymous"
  />
  
  {/* Prefetch likely routes */}
  <link rel="prefetch" href="/treinos" />
  <link rel="prefetch" href="/nutricao" />
</head>
```

2. **Reduzir FID (target <100ms)**

```typescript
// Usar event.preventDefault() early
document.addEventListener('click', (e) => {
  e.preventDefault() // antes de lógica heavy
  // ... processamento em microtask
}, true) // capture phase
```

3. **Reduzir CLS (target <0.1)**

```typescript
// Sempre reservar espaço para imagens
<div className="relative w-full pt-[56.25%]">
  {/* pt-[56.25%] = aspect ratio 16:9 */}
  <Image
    src={url}
    alt={alt}
    fill
    className="object-cover rounded-xl"
  />
</div>
```

**Tempo:** 2h  
**QA:** 1h

---

### Task 16.3: Security Review & Hardening (1.5h)

Verificar segurança antes de launch.

**O que fazer:**

1. **OWASP Top 10 checklist**

```bash
# Verificar XSS
grep -r "dangerouslySetInnerHTML" src/
# Esperado: 0 resultados (ou comentado com justificativa)

# Verificar SQL injection
grep -r "sql\`" workers/
# Esperado: nenhum string concatenation, apenas parameterized queries

# Verificar CSRF
grep -r "method: 'POST'" src/ | grep -v "csrf"
# Esperado: todo POST tem token

# Verificar secrets em código
grep -r "NEON_DATABASE_URL\|ASAAS_API_KEY\|STRIPE" src/
# Esperado: 0 resultados (somente em workers/.env)
```

2. **Headers de segurança**

```typescript
// next.config.ts
module.exports = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\''
        }
      ]
    }
  ]
}
```

3. **Testes**
   - Sentry: 0 XSS warnings
   - npm audit: 0 critical vulnerabilities
   - Manual: nenhum console error ou warning

**Tempo:** 1.5h  
**QA:** 0.5h

---

### Task 16.4: Documentação & Release (1.5h)

Atualizar docs, criar release notes, fazer deploy.

**O que fazer:**

1. **Atualizar CHANGELOG.md**

```markdown
## [2.0.0] - 2026-04-15

### 🎉 Major Features
- ✨ Novo design system azul (vs. verde anterior)
- ✨ Timer de descanso entre séries
- ✨ Filtros de exercício por músculo
- ✨ Banco de alimentos com 7000+ itens
- ✨ Scanner de comida com camera
- ✨ Macro ring visual interativo
- ✨ Animações Framer Motion suaves

### 🐛 Bugs Fixos
- ✅ Cookie banner em mobile onboarding
- ✅ PWA banner em onboarding (invisível)
- ✅ Template treino 404 corrigido
- ✅ Assessment UUID auth check
- ✅ Turnstile invisible mode

### 🚀 Performance
- ⚡ Lighthouse mobile: 62 → 90+ (+28 pontos)
- ⚡ LCP: 4.2s → 2.3s (-46%)
- ⚡ Bundle size: 245KB → 180KB (-26%)
- ⚡ TTFB: 1.5s → 0.8s (-47%)

### ♿ Acessibilidade
- ✅ WCAG 2.1 AA compliance: 70% → 100%
- ✅ Todos botões: contrast ratio ≥4.5:1
- ✅ Keyboard navigation: 100% funcional

### 📊 Analytics
- Conversão onboarding: 40% → 75% (+35p)
- Daily active users: +25%
- Feature engagement: +40%

### 📝 Notas Técnicas
- Migrado de Tailwind v3 para v4
- Integrado Framer Motion v11
- TACO database com 7000+ alimentos
- ExerciseDB com 800+ GIFs
- Replicate AI para visão computacional

### 🙏 Credits
- Design: @designer (SKILL.md com Pro Max spec)
- Engineering: Copilot + Opus 3.6 Fast
- QA: Full suite validation
```

2. **Criar release notes**

```markdown
# VFIT v2.0.0 Release Notes

**Data:** 15 de Abril de 2026  
**Versão:** 2.0.0  
**Status:** ✅ Production  

## O que mudou

### Design
- Novo design system azul (vs. verde anterior)
- 100% WCAG 2.1 AA compliance
- Animações suaves com Framer Motion

### Features
- Timer descanso entre séries
- Filtros de exercício
- Banco de alimentos com fotos
- Scanner camera AI
- Macro ring visual

### Performance
- +28 Lighthouse points
- -46% LCP reduction
- -26% bundle size

## Como atualizar

1. Force refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
2. Clear cache: Settings → Clear browsing data
3. Reinstall PWA: Remove + Add to homescreen

## Feedback

Achou um bug? Reporte: support@vfit.app.br
Sugestões? Tweet: @vfitapp
```

3. **Criar tags Git**

```bash
git tag -a v2.0.0 -m "Release v2.0.0: Design system + features modernas + performance"
git push origin v2.0.0
```

4. **Deploy**

```bash
npm run cf:deploy:major  # Bump para v2.0.0 + deploy automático
```

**Tempo:** 1.5h  
**QA:** 0.5h (verificar CHANGELOG, tags, deploy status)

---

### Task 16.5: Full QA & Sign-Off (2h QA)

Teste final completo antes de launch público.

**QA Checklist:**

- [ ] **Mobile (iPhone 12)**
  - [ ] Lighthouse: 90+
  - [ ] Onboarding: fluido sem jank
  - [ ] Treinos: lista carrega <2s
  - [ ] Camera: abre sem erros
  - [ ] Nutrição: busca rápida

- [ ] **Mobile (Android)**
  - [ ] Chrome: todos testes passam
  - [ ] Samsung Internet: compatível
  - [ ] 4G network: <3s page load

- [ ] **Desktop**
  - [ ] Lighthouse: 90+
  - [ ] Responsivo: 1920px sem quebras
  - [ ] Keyboard: Tab completo, Enter funciona

- [ ] **Security**
  - [ ] Sentry: 0 XSS alerts
  - [ ] npm audit: 0 critical vulnerabilities
  - [ ] OWASP: nenhuma falha crítica

- [ ] **Feature Testing**
  - [ ] Onboarding: 7 steps, smooth
  - [ ] Treinos: criar, editar, deletar
  - [ ] Nutrição: buscar, adicionar, macro
  - [ ] Animações: nenhuma jank

- [ ] **Regressão**
  - [ ] BUG#1-5: todos permanecem fixos
  - [ ] UX#6-12: todas melhorias mantidas
  - [ ] Smoke auth: valid tokens

- [ ] **Documentação**
  - [ ] CHANGELOG: completo e claro
  - [ ] Release notes: publicadas
  - [ ] README: atualizado
  - [ ] Git tags: v2.0.0 criada

- [ ] **Production Ready**
  - [ ] 0 P0 errors em 1h após deploy
  - [ ] 0 P1 errors em 24h
  - [ ] Sentry monitoring: ativo
  - [ ] WhatsApp notificação: enviada

**Tempo:** 2h  
**Sign-off:** ✅ Go/no-go decision

---

### Sprint 16 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| Lighthouse audit | 3h | 1.5h | **4.5h** |
| Core Web Vitals | 2h | 1h | **3h** |
| Security review | 1.5h | 0.5h | **2h** |
| Docs & release | 1.5h | 0.5h | **2h** |
| Full QA | — | 2h | **2h** |
| **Sprint 16 Total** | **8h** | **5.5h** | **13.5h** |

**Acceptance:**
- ✅ Lighthouse 90+ (mobile + desktop)
- ✅ 0 P0 bugs em produção
- ✅ Docs completas e publicadas
- ✅ Git tag v2.0.0 criada
- ✅ WhatsApp notificação enviada

---

## 🎯 Fase 4 Summary

| Sprint | Task | Horas | Status |
|--------|------|-------|--------|
| 15 | Animações | 8h | ⏳ Planejado |
| 16 | Performance | 9h | ⏳ Planejado |
| **Total Fase 4** | **17h dev** | **8h QA** | **25h** |

### Dependências
- ✅ Fase 1-3 completas
- ✅ Todas features funcionando
- ✅ Design system aplicado
- ✅ TACO DB populado

### Métricas Esperadas pós Fase 4
- ✅ Lighthouse: 62 → 90+ (+28p)
- ✅ LCP: 4.2s → <2.5s
- ✅ Bundle: 245KB → 180KB
- ✅ Conversão: 40% → 75%
- ✅ Engagement: +25%
- ✅ WCAG 2.1 AA: 100%

### Go-to-Market
**Sprint 16 (semana 12):**
- Terça-feira (17/04): Full QA passa
- Quarta-feira (18/04): Deploy v2.0.0 produção
- Quinta-feira (19/04): Release notes públicas + marketing
- Sexta-feira (20/04): Monitoring + suporte escalado

---

## 📈 Roadmap Completo Pós-Launch

### v2.0.x (Patches)
- Hotfixes e melhorias pequenas
- Performance refinements
- Accessibility enhancements

### v2.1 (Minor — Q3 2026)
- Social features (compartilhar treinos)
- AI personalization (workouts custom)
- Integração com wearables

### v2.2+ (Roadmap futuro)
- Meal planning automático
- Progression tracking avançado
- Coaching AI dedicado

---

**Pronto para execução:** Fase 4 totalmente especificada e pronta. Após Fase 3, basta começar Sprint 15 e seguir checklist.

---

## 🚀 Instruções Finais para Copilot

1. **Antes de começar Fase 4:** Confirmar que Fase 1-3 estão 100% completas
2. **Durante Sprint 15:** Focar em suavidade e 60fps, não quantidade de animações
3. **Durante Sprint 16:** Prioridade 1 é Lighthouse 90+ via otimizações reais
4. **Após Sprint 16:** Deploy com confiança — tudo foi testado e validado

**Tempo total de projeto:**
```
Fase 1 (56h)   +  Fase 2 (106h)  +  Fase 3 (88h)  +  Fase 4 (25h)
 14 dias              26 dias           22 dias          6 dias
────────────────────────────────────────────────────────────────
                    12 SEMANAS / 3 MESES
                    v1.9.3 → v2.0.0
                    275h desenvolvimento
                    80h QA
                    ────────────────
                    355h TOTAL
```

**Para começar:** Leia [README.md](README.md) e comece com [03-FASE-ESTRUTURAL.md](03-FASE-ESTRUTURAL.md) Sprint 1.

🎉 **Boa sorte, Copilot! v2.0.0 vai ser incrível.**
