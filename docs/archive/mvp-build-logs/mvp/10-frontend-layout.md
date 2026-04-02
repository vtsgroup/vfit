# LOTE 10 — Frontend Layout

> **Status:** ✅ CONCLUÍDO
> **Commit:** `bdc447b`
> **Frontend:** 1/10 lotes concluídos

---

## Resumo

Setup completo do frontend: stores Zustand v5, TanStack Query v5, providers, sistema de temas dark/light/system, dashboard layout responsivo (sidebar desktop, bottom nav mobile, drawer overlay), 7 componentes UI base, API client com auto-refresh JWT, hooks utilitários.

---

## Dependências Adicionadas

| Pacote | Versão | Uso |
|--------|--------|-----|
| lucide-react | ^0.x | Ícones SVG |
| clsx | ^2.x | Merge classnames |
| tailwind-merge | ^2.x | Resolve Tailwind conflicts |

---

## Arquivos Criados

### Lib
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/utils.ts` | `cn()`, `formatCurrency`, `formatDate`, `formatRelativeTime`, `getInitials`, `truncate`, `sleep` |
| `src/lib/api-client.ts` | Fetch wrapper: auto-refresh JWT, upload multipart, error handling (`ApiClientError`), `api.get/post/patch/put/delete/upload` |
| `src/lib/navigation.ts` | Config de navegação: `personalNavigation` (4 seções, 12 items), `studentNavigation` (2 seções, 6 items), mobile bottom nav (5 items cada) |

### Stores (Zustand v5)
| Arquivo | Estado | Persist |
|---------|--------|---------|
| `src/stores/auth-store.ts` | user, tokens, profiles, isAuthenticated, login/logout, computed helpers (isPersonal, isTokenExpired) | localStorage `personal-ia-auth` |
| `src/stores/app-store.ts` | sidebar, theme, toasts, globalLoading, commandPalette + toast helpers | localStorage `personal-ia-app` (theme + sidebar only) |

### Providers
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/components/providers/query-provider.tsx` | TanStack Query v5 client (staleTime 30s, smart retry, refetch on focus) |
| `src/components/providers/theme-provider.tsx` | Aplica class `dark`/`light` no `<html>`, ouve mudanças do sistema |
| `src/components/providers/auth-provider.tsx` | Hydration guard — mostra spinner até Zustand rehidratar do localStorage |
| `src/components/providers/index.tsx` | Composição: Query → Theme → Auth → children |

### Layout (Dashboard)
| Arquivo | Descrição |
|---------|-----------|
| `sidebar.tsx` | Desktop sidebar: collapsible (260px ↔ 72px), seções animadas, logo, user footer, logout |
| `header.tsx` | Top bar: hamburger menu (mobile), page title, search (⌘K), theme toggle (3 opções), notifications bell, avatar |
| `mobile-nav.tsx` | Bottom tab bar (5 items) + drawer overlay (full nav, animação spring) |
| `toast-container.tsx` | Container de toasts: 4 tipos (success/error/warning/info), auto-remove, animação framer-motion |
| `dashboard-layout.tsx` | Composição: Sidebar + MobileDrawer + Header + main content (max-w-7xl) + MobileBottomNav + ToastContainer |

### Componentes UI Base
| Componente | Variantes/Features |
|------------|-------------------|
| `Button` | 5 variants (primary/secondary/outline/ghost/danger), 4 sizes (sm/md/lg/icon), loading spinner |
| `Input` | label, error highlight, hint text, auto-id |
| `Card` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Badge` | 6 variants (default/success/warning/error/info/outline) |
| `Avatar` | Image com fallback para iniciais, 4 sizes |
| `Spinner` | 3 sizes + PageLoader (centered) + Skeleton (pulse) |
| `EmptyState` | Icon, title, description, action button |

### Hooks
| Hook | Descrição |
|------|-----------|
| `useMediaQuery(query)` | Watch media query matches |
| `useIsMobile()` | `max-width: 1023px` |
| `useIsDesktop()` | `min-width: 1024px` |
| `useDebounce(value, delay)` | Debounce any value (default 300ms) |

### Pages
| Rota | Tipo |
|------|------|
| `/dashboard` | Dashboard home (placeholder com stats grid) |
| `/dashboard/layout.tsx` | Wrapper com DashboardLayout |

---

## Modificações

| Arquivo | Mudança |
|---------|---------|
| `globals.css` | Class-based dark mode (`.dark`/`.light`) + system fallback |
| `layout.tsx` | `<html className="dark">` + `<Providers>` wrapper |
| `package.json` | +3 deps (lucide-react, clsx, tailwind-merge) |

---

## Tema

| Modo | Ativação | Persistência |
|------|----------|-------------|
| Dark | Classe `.dark` no `<html>` | Zustand → localStorage |
| Light | Classe `.light` no `<html>` | Zustand → localStorage |
| System | Ouve `prefers-color-scheme` | Zustand → localStorage |

---

## Progresso Geral

| Categoria | Lotes | Status |
|-----------|-------|--------|
| Backend | 9/9 | ✅ 100% |
| Frontend | 1/10 | 🟡 10% |
| **Total** | **10/21** | **48%** |
