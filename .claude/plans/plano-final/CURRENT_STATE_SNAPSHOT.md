# VFIT — Estado Atual (Snapshot 02/07/2026)

## 📊 Versão & Deployment

```
Current Build:      v5.4.0 (build 470832)
Last Release:       ccfdb7a2 (release: v5.4.0)
Git Branch:         feat/auth-broadcast-unify
Uncommitted:        8 files modified, 4 new CLAUDE.md
Environment:        vfit.app.br (production)
```

### Últimos 5 Deploys
1. v5.4.0 — Release com onboarding etapa 15 + login dark BROADCAST
2. v5.3.9 — Release com pickers nativos + fix OAuth
3. v5.3.8 — Release com identidade verde da marca
4. v5.3.7 — Welcome redesign BROADCAST (placar de arena)
5. v5.3.6 — Welcome redesign (tilt 3D + perf)

---

## ✅ O Que Funciona (Pronto para MVP)

### Frontend
- ✅ Landing page (pública)
- ✅ Onboarding completo (15 etapas)
- ✅ Autenticação (OAuth + JWT)
- ✅ Login dark BROADCAST
- ✅ Forgot Password flow
- ✅ Design System BROADCAST (cores, tipografia, componentes)
- ✅ Responsividade mobile (375px+)
- ✅ PWA (service worker, manifest)
- ✅ Rate limiting (429 handling)

### Backend / Infra
- ✅ Cloudflare Workers (endpoints)
- ✅ D1 Database (SQLite)
- ✅ R2 Storage (imagens/media)
- ✅ OAuth flows (Google, GitHub, Apple)
- ✅ Email (transactional)
- ✅ WhatsApp Gateway (pronto para notificações)
- ✅ Asaas API (pronto para pagamentos)
- ✅ Banco de dados schema (26 tabelas PostgreSQL, 5 D1)

### Database (Existente)
- users, sessions, profiles (auth)
- student_profiles, personal_profiles (roles)
- assessments (avaliações físicas — duplicação bug aqui)
- notifications (notificações — duplicação bug aqui)
- products (marketplace — existe, precisa listagem)
- subscriptions (planos)
- payments (histórico de transações)
- **FALTA:** workouts, student_workouts, workout_executions (treinos)

---

## ❌ O Que Não Funciona (Bugs Críticos)

### High-Impact Blockers

| Bug | Status | Afeta | Fix ETA |
|---|---|---|---|
| Roteamento `/desafios`, `/comunidade` | 🔴 CRÍTICA | Rotas internas | HOJE (2-3h) |
| `/treinos` travado em "Carregando..." | 🔴 CRÍTICA | Core feature | HOJE (2-3h) |
| Avaliação física duplicada no POST | 🔴 CRÍTICA | Data integrity | HOJE (1-2h) |
| XP valor diferente por rota | 🟡 ALTA | Gamificação trust | Semana 1 (2h) |
| Streak sempre = 0 | 🟡 ALTA | Gamificação | Semana 1 (3h) |
| Notificação duplicada (16s apart) | 🟠 MÉDIA | UX ruído | Semana 1 (1h) |
| Meta de proteína divergente | 🟠 MÉDIA | Data consistency | Semana 2 (1h) |
| Textos não interpolados | 🟢 BAIXA | Visual | Polish (1h) |

---

## 🏗️ Arquitetura Atual

```
┌─────────────────────────────────────────────────────┐
│ Frontend (Next.js 14 + React + TypeScript)          │
│ ├─ Pages: auth, dashboard, settings                 │
│ ├─ Components: Button, Card, Form, Modal            │
│ ├─ State: Zustand stores (auth, onboarding)         │
│ └─ Styling: Tailwind v4 + CSS variables             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Backend (Cloudflare Workers)                        │
│ ├─ /api/auth/* (OAuth, login, session)              │
│ ├─ /api/user/* (profile, settings)                  │
│ ├─ /api/assessments/* (avaliações)                  │
│ ├─ /api/notifications/* (notificações)              │
│ ├─ /api/products/* (marketplace)                    │
│ └─ /api/webhooks/* (eventos externos)               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Database (D1 SQLite + PostgreSQL)                   │
│ ├─ users, sessions, oauth_tokens                    │
│ ├─ student_profiles, personal_profiles              │
│ ├─ assessments, notifications, products             │
│ └─ subscriptions, payments                          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ External Services                                   │
│ ├─ Asaas (pagamentos)                               │
│ ├─ WhatsApp Gateway (notificações)                  │
│ ├─ R2 (armazenamento de media)                      │
│ └─ Google OAuth, GitHub OAuth, Apple OAuth         │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Stack Técnico

| Layer | Tech | Version |
|---|---|---|
| **Frontend** | Next.js | 14 |
| **Runtime** | Node.js + React | 18+ |
| **Styling** | Tailwind CSS | v4 |
| **State** | Zustand | - |
| **Backend** | Cloudflare Workers | - |
| **Database** | D1 (SQLite) | - |
| **Storage** | R2 | - |
| **Auth** | OAuth 2.0 + JWT | - |
| **Payments** | Asaas | - |
| **Notifications** | WhatsApp API | - |

---

## 🚀 Deployment Pipeline

```bash
git push origin feat/auth-broadcast-unify
    ↓
GitHub Actions / CI (type check, tests, linting)
    ↓
Preview deployment (Cloudflare)
    ↓
Manual approval → npm run cf:deploy
    ↓
Production v5.4.0 (live)
```

---

## 💾 Git Status (Uncommitted)

```
 M lib/version.ts                                 # Version bump (v5.4.0)
 M package.json                                   # Dependencies
 M public/manifest.json                           # PWA manifest
 M src/app/(auth)/forgot-password/page.tsx        # BROADCAST theme
 M src/app/(auth)/layout-client.tsx               # Dark theme layout
 M src/app/(auth)/register/page.tsx               # Multi-role signup
 M src/app/globals.css                            # Light CSS classes removed
 ? src/app/(auth)/forgot-password/CLAUDE.md       # New
 ? src/app/(auth)/register/personal/CLAUDE.md     # New
 ? src/app/(auth)/reset-password/CLAUDE.md        # New
 ? src/app/(auth)/verify-email/CLAUDE.md          # New
```

**Action:** Commit quando estiver pronto para PR (após fixes de bugs).

---

## 🎯 Dependências de MVP

### Must Have (Bloqueiam Revenue)
- ✅ Treinos CRUD (novo — semana 1)
- ✅ Treino assignment (novo — semana 1)
- ✅ Execution tracking (novo — semana 1)
- ✅ Gamificação funciona (fix — semana 1)
- ✅ Pagamentos (Asaas integration — semana 2)
- ✅ Checkout (novo — semana 2)

### Nice to Have (Semana 3+)
- Comunidade
- Desafios
- Analytics
- Mobile app

---

## 🔑 Critical Files

| File | Purpose | State |
|---|---|---|
| `.claude/docs/RULES.md` | 19 critical rules | ✅ Existe |
| `.claude/docs/BACKEND.md` | 150+ endpoints | ✅ Existe |
| `.claude/docs/STACK.md` | URLs, credentials, infra | ✅ Existe |
| `.claude/docs/WHATSAPP-GATEWAY.md` | WhatsApp integration | ✅ Existe |
| `src/app/globals.css` | Design tokens + orphaned light CSS | ✅ Cleaned (1147) |
| `src/app/(auth)/layout-client.tsx` | Auth pages layout | ✅ BROADCAST dark |
| `lib/version.ts` | Current version | ✅ v5.4.0 |

---

## 💡 Key Insights

1. **Infra é forte** — Cloudflare + D1 pronto, não precisa reescrever
2. **Auth funciona** — OAuth + onboarding = usuários já podem se registrar
3. **Design funciona** — BROADCAST dark theme pronto, apenas espaçamento mobile ajustar
4. **Dados inconsistentes** — XP, streak, notificações bugadas mas fixáveis rápido
5. **Treinos faltam** — Core feature ausente, precisa ser built este mês
6. **Marketplace existe** — Table pronta, só precisa UI + checkout

---

## 🎬 Próximos Passos (Imediato)

```
AGORA (2-3h):
├─ Fix roteamento interno (/desafios, /comunidade, etc)
├─ Fix páginas travadas (/treinos, /nutricao)
├─ Fix avaliação duplicada
└─ Deploy v5.4.1

SEMANA 1 (36h human):
├─ Treinos backend (CRUD + assignment)
├─ Gamificação (XP + streak)
├─ Marketplace listagem
├─ Notificações WhatsApp triggers
└─ Dashboard pessoal

SEMANA 2 (9h human):
├─ Asaas integration
├─ Checkout flow
└─ 🎉 FIRST REVENUE
```

---

## 📈 Métricas Iniciais (Goal para Week 4)

- Usuários cadastrados: 50+
- Treinos criados: 10+
- Treinos completados: 50+
- Revenue (real): $100+ (qualquer coisa)
- DAU: 20+

---

## ⚠️ Não Fazer Agora

- ❌ Refatorar design system (está funcionando)
- ❌ Otimizar performance (depois de funcionar)
- ❌ Teste E2E completo (MVP depois)
- ❌ Mobile app nativa (use TWA/PWA first)
- ❌ Analytics (depois de ter usuários)

