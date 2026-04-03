# Phase 1: TWA Smart Entry Point

**Duração:** 30 minutos  
**Bloqueadores:** Nenhum  
**Dependências:** Nenhuma

---

## Problema

`twa/twa-manifest.json` tem `"startUrl": "/dashboard"`. Quando instalado via Play Store por um novo usuário (sem auth), o TWA abre diretamente o dashboard, que redireciona para `/welcome`, causando flash de tela e potencial quebra de auth guard no Chrome Custom Tabs.

---

## Solução

Mudar `startUrl` para `/welcome`, que é o smart entry point:
- Se `isAuthenticated` → redireciona para `/dashboard`
- Se não autenticado → mostra quiz
- Se voltando (localStorage existe) → mostra login prompt

---

## Tasks

### 1.1 — Atualizar `twa/twa-manifest.json`

**File:** `twa/twa-manifest.json`

**Change:**
```json
// BEFORE
"startUrl": "/dashboard"

// AFTER
"startUrl": "/welcome"
```

**Why:** Welcome page é o smart router que decide o fluxo baseado em auth state.

---

### 1.2 — Atualizar `twa/config/twa-manifest.json` (reference)

**File:** `twa/config/twa-manifest.json`

**Change:** Mesma linha acima.

**Why:** Esta é a versão de referência sob version control; manter em sync.

---

### 1.3 — Adicionar Auth Check em Welcome Page

**File:** `src/app/(onboarding)/welcome/page.tsx`

**Current state:** A welcome page mostra hero + CTA "Começar" que vai para `/onboarding`.

**Change required:**

Adicionar efeito que redireciona se já autenticado:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function WelcomePage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useAuthStore()

  // NEW: Redirecionar se já logado
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isHydrated, isAuthenticated, router])

  // ... rest of component
}
```

**Why:** Se usuário volta para welcome (depois de logout), ou abre TWA já logado, vai direto ao dashboard.

---

## Teste Local

```bash
# 1. Limpar cache TWA (simular fresh install)
rm -rf node_modules/.cache
rm -f localStorage.json

# 2. Dev mode
npm run dev

# 3. Abrir http://localhost:3000/welcome (não autenticado)
# → Deve mostrar hero + quiz link

# 4. Mock auth store (dev tools)
# localStorage setItem 'auth-store' → isAuthenticated: true

# 5. Reload /welcome
# → Deve redirecionar para /dashboard

# 6. Para TWA real
npm run twa:build
# Verá "startUrl": "/welcome" no APK manifest
```

---

## Criterios de Sucesso

- [ ] `twa/twa-manifest.json` tem `"startUrl": "/welcome"`
- [ ] `twa/config/twa-manifest.json` tem `"startUrl": "/welcome"`
- [ ] `src/app/(onboarding)/welcome/page.tsx` tem useEffect que redireciona se autenticado
- [ ] `npm run dev` → abrir `/welcome` não autenticado → mostra hero
- [ ] `npm run dev` → mock auth → reload `/welcome` → redireciona para `/dashboard`
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa

---

## Rollback (se necessário)

```bash
git revert <commit-hash>
# ou
git checkout main -- twa/twa-manifest.json twa/config/twa-manifest.json src/app/(onboarding)/welcome/page.tsx
```

---

## Notes para Copilot

- Não precisa modificar nenhum outro arquivo
- Welcome page já existe e funciona
- Auth store já tem `isHydrated` e `isAuthenticated` flags
- Nenhum deploy necessário após isso (mudança local, não backend)
- TWA buildará automaticamente na próxima versão

---

## Estimativa

| Task | Tempo |
|------|-------|
| 1.1 | 1 min |
| 1.2 | 1 min |
| 1.3 | 10 min (código + teste) |
| Testing | 10 min |
| **Total** | **22 min** |
