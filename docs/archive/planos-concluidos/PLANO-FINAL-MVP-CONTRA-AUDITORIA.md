# 🎯 PLANO FINAL MVP — CONTRA-AUDITORIA COMPLETA

> **VFIT v4.7.3** · 08/03/2026 · Documento para validação total do estado do produto
> 
> Este documento consolida TUDO que temos hoje: funcionalidades, infraestrutura,
> problemas conhecidos, pendências e próximos passos. Use para contra-auditoria
> antes de criar o plano definitivo no Claude.ai.

---

## 📊 NÚMEROS REAIS DO PROJETO (08/03/2026)

| Métrica | Valor |
|---------|-------|
| **Versão** | v4.7.3 |
| **Total de arquivos TS/TSX** | 365 |
| **Total de linhas de código** | ~95.000 |
| **Endpoints API** | ~229 rotas únicas (24 sub-routers) |
| **Páginas Next.js** | 69 pages + 9 layouts |
| **Componentes React** | 137 componentes |
| **Hooks React Query** | 29 hooks `use-*` |
| **Stores Zustand** | 2 (auth-store, demo-store) |
| **Schemas Zod** | 11 arquivos |
| **Tabelas PostgreSQL (Neon)** | 43 tabelas |
| **Migrations SQL** | 25 arquivos |
| **Lib/utils backend** | 23 módulos |
| **Testes** | 18 test files (Vitest) |
| **Deploys realizados** | 70+ (v1.0.0 → v4.7.3) |
| **Commits** | 130+ |

---

## 🏗️ STACK COMPLETA

### Frontend
| Tech | Versão | Uso |
|------|--------|-----|
| Next.js | 15 (App Router) | Framework, static export |
| React | 19 | UI |
| Tailwind CSS | v4 | Styling (sintaxe canônica v4) |
| Zustand | 5 | State management |
| TanStack Query | 5 | Server state + cache |
| Framer Motion | — | Animações |
| Recharts | — | Gráficos KPI |

### Backend
| Tech | Versão | Uso |
|------|--------|-----|
| Hono.js | v4 | API Router no CF Workers |
| Zod | — | Validação de schemas |
| bcryptjs | — | Hash de senhas (cost 12) |
| Web Crypto | — | JWT HMAC-SHA256 |

### Infraestrutura
| Serviço | Uso |
|---------|-----|
| Cloudflare Workers | API backend |
| Cloudflare Pages | Frontend hosting |
| Neon PostgreSQL 17 | DB principal (43 tabelas) |
| Cloudflare D1 | Cold data (SQLite) |
| Cloudflare R2 | Storage (vídeos ≤10MB, imagens, PDFs) |
| Cloudflare KV | Cache, sessions, rate-limit |
| Cloudflare Stream | Vídeos exercícios >30s (HLS adaptive) |
| CF Image Resizing | Resize on-the-fly |

### Integrações
| Serviço | Uso |
|---------|-----|
| Asaas | Pagamentos (PIX/boleto/cartão) — **PRODUÇÃO ATIVA** |
| Stripe | Pagamentos internacionais (configurado) |
| OneSignal | Push notifications |
| Replicate API | IA generativa (treinos) |
| Turnstile | CAPTCHA/bot protection |
| GA4 | Analytics (`G-XGXZ4R6JXH`) |
| CF Analytics Engine | Métricas server-side |

### Distribuição
| Canal | Status |
|-------|--------|
| **Web (PWA)** | ✅ Produção — `iapersonal.app.br` |
| **Google Play (TWA)** | ⚠️ Pendente (ícones com alpha — corrigido) |
| **Apple App Store** | 🔲 Não iniciado (exige dev account $99/ano) |

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 🔐 Autenticação & Segurança
- [x] Login email/senha com bcrypt cost 12
- [x] JWT access token (1h) + refresh token (30d)
- [x] Sessions via KV com rotação
- [x] Passkeys (WebAuthn) — login biométrico
- [x] Turnstile CAPTCHA em todos os forms
- [x] OAuth Google + Apple sign-in
- [x] Forgot/reset password com email
- [x] Email verification flow
- [x] Rate limiting por IP + userId
- [x] CORS + secure headers (CSP, HSTS, etc.)
- [x] Demo mode com auto-recovery

### 👤 Gestão de Usuários
- [x] 3 roles: `personal`, `student`, `admin`
- [x] Super admin powers (gestão completa)
- [x] Perfil completo (foto, bio, CREF, especialidades)
- [x] Settings por personal (notificações, tema, privacy)
- [x] Busca por CPF (integração receita)
- [x] Complete profile flow (onboarding)

### 🏋️ Treinos
- [x] CRUD completo de treinos
- [x] Templates de treino (biblioteca)
- [x] Exercícios com mídia (vídeo/imagem)
- [x] Workout sessions (tracking em tempo real)
- [x] Workout logs (histórico de execução)
- [x] IA generativa para criação de treinos (Replicate)
- [x] Exercícios com séries/reps/carga configuráveis

### 📊 Avaliações Físicas
- [x] CRUD completo de assessments
- [x] 7+ fórmulas de composição corporal
- [x] Gráficos de evolução (peso, gordura, massa magra)
- [x] PDF export de avaliação
- [x] Assessment evolution tracking

### 💰 Pagamentos & Financeiro
- [x] Asaas integration (PIX, boleto, cartão)
- [x] Planos de assinatura (3 tiers)
- [x] Checkout completo
- [x] Webhook de confirmação
- [x] Dashboard financeiro (receitas, despesas, comissões)
- [x] PIX transfers (saques)
- [x] net_amount calculado via Asaas netValue
- [x] Stripe setup (internacional)

### 💬 Chat & Comunicação
- [x] Chat em tempo real (personal ↔ aluno)
- [x] Conversas e mensagens
- [x] Push notifications (OneSignal)
- [x] Notification preferences configuráveis
- [x] WhatsApp gateway (Unipile)

### 🎮 Gamificação (XP Economy)
- [x] Sistema de XP com eventos configuráveis
- [x] Streaks (sequências) com milestones
- [x] Badges (conquistas)
- [x] Daily goals + limites anti-abuse
- [x] Leaderboard
- [x] XP deduplication
- [x] Audit log completo
- [x] Dashboard XP para aluno

### 📱 PWA & Mobile
- [x] Service Worker com offline support
- [x] Manifest.json completo (15 ícones + maskable + monochrome)
- [x] Screenshots (mobile + desktop)
- [x] Shortcuts (Dashboard, Alunos, Treinos)
- [x] Install prompt
- [x] Background sync
- [x] TWA para Google Play (Bubblewrap)

### 🌐 SEO & Marketing
- [x] Landing page completa (10 seções)
- [x] Blog com 3+ artigos (HTML pré-renderizado)
- [x] JSON-LD (BlogPosting, Organization, WebSite, BreadcrumbList)
- [x] Open Graph + Twitter Cards
- [x] Canonical URLs
- [x] Sitemap XML (14 URLs) + Blog sitemap (4 URLs)
- [x] robots.txt otimizado (GPTBot, ClaudeBot inclusos)
- [x] Meta tags por página
- [x] Página de pricing dedicada

### 📋 Admin & Operações
- [x] Admin dashboard (super powers)
- [x] App logs viewer
- [x] User management
- [x] Payment management
- [x] Feedback system
- [x] Debug endpoints
- [x] Deploy script automatizado (cf-deploy.js)
- [x] Smoke tests (auth gate)

### ♿ Acessibilidade
- [x] aria-labels em todas as seções
- [x] aria-expanded nos accordions
- [x] Skip-to-content
- [x] Semântica HTML completa (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [x] prefers-reduced-motion
- [x] Focus management

### ⚖️ Legal & Compliance
- [x] Página de Termos de Uso
- [x] Política de Privacidade
- [x] Página de Exclusão de Conta (obrigatória Google Play)
- [x] LGPD checklist completo

---

## ⚠️ PROBLEMAS CONHECIDOS & PENDÊNCIAS

### 🔴 CRÍTICOS (Bloqueiam Google Play)

| # | Problema | Status | Detalhe |
|:-:|---------|:------:|---------|
| 1 | **Ícones TWA com canal alpha** | ✅ CORRIGIDO (08/03) | `twa/store_icon.png` e todos os gerados tinham transparência. Regenerados como RGB. |
| 2 | **Cores theme mismatch** | ✅ CORRIGIDO (08/03) | `manifest.json` tinha `#050526`, TWA esperava `#09090B`. Sincronizado. |
| 3 | **Feature graphic** | ⚠️ VERIFICAR | `1024x500` gerado por crop — pode não ficar visualmente bom. Criar manualmente. |
| 4 | **AAB precisa rebuild** | 🔲 PENDENTE | Após fixes de ícones, rebuild do AAB com `bubblewrap build`. |
| 5 | **versionCode increment** | 🔲 PENDENTE | Play Store rejeita mesmo versionCode. Incrementar para 7+. |

### 🟡 IMPORTANTES (Qualidade do produto)

| # | Problema | Área | Detalhe |
|:-:|---------|:----:|---------|
| 6 | Testes insuficientes | QA | Apenas 18 test files. Cobertura estimada <20%. |
| 7 | Blog com poucos artigos | SEO | Apenas 3 artigos. Plano SEO prevê 90. |
| 8 | LPs específicas não criadas | SEO | Nenhuma das 15 LPs planejadas foi criada ainda. |
| 9 | Comparativos não criados | SEO | Nenhum dos 13 comparativos foi criado. |
| 10 | Analytics real não configurado | Métricas | GA4 tag existe mas events customizados não implementados. |
| 11 | Email templates básicos | UX | Emails transacionais são plain text, sem design. |
| 12 | Onboarding flow incompleto | UX | Complete profile existe mas falta tour/wizard guiado. |

### 🟢 MELHORIAS FUTURAS

| # | Feature | Impacto | Esforço |
|:-:|---------|:-------:|:-------:|
| 13 | Dark/Light mode toggle | Médio | Médio |
| 14 | Exportação de dados (LGPD) | Compliance | Médio |
| 15 | Stripe checkout completo | Revenue | Alto |
| 16 | App Store (iOS via PWA wrapper) | Alcance | Alto |
| 17 | Multilanguage (i18n) | Escala | Alto |
| 18 | Video call integration | Diferencial | Alto |
| 19 | Marketplace de treinos | Revenue | Alto |
| 20 | White-label para academias | Enterprise | Muito Alto |

---

## 📁 ESTADO DA DOCUMENTAÇÃO (PÓS-LIMPEZA)

### docs/ (15 documentos ativos)
| Arquivo | Propósito | Última atualização |
|---------|-----------|:------------------:|
| ASAAS-INTEGRATION.md | API Asaas completa, webhooks | Fev/2026 |
| BACKEND.md | ~229 endpoints, tabelas de rotas | Fev/2026 |
| CF-OPERATIONS.md | Deploy, backup, manutenção CF | Fev/2026 |
| **CHANGELOG.md** | Histórico completo v1.0→v4.7.3 | **08/03/2026** |
| DESIGN-SYSTEM-LP.md | Design system da Landing Page | Mar/2026 |
| INFRAESTRUTURA-CF.md | Bindings, secrets, IDs CF | Fev/2026 |
| MEDIA-STRATEGY.md | R2 vs Stream vs Images vs Pages | Fev/2026 |
| PLANO-CONTINUIDADE.md | Schema DB, fases, próximos passos | Fev/2026 |
| PLANO-PAGINAS-SEO-COMPLETO.md | 14 sprints SEO/AEO/GEO | Mar/2026 |
| PWA-MEGA-PLAN.md | Service Worker, manifest, offline | Fev/2026 |
| SECURE-SHARING-WITH-COPILOT.md | Governança de segurança | Fev/2026 |
| SPRINT-VISUAL-POLISH-TRACKER.md | Tracker de uniformização visual | Mar/2026 |
| TWA-DOCUMENTATION.md | TWA completo: build, Play Store | Mar/2026 |
| WHATSAPP-GATEWAY.md | Worker WhatsApp (Unipile) | Fev/2026 |
| XP-GOVERNANCE.md | Sistema XP Economy completo | Fev/2026 |

### docs/ULTRA-PLANO-MVP-PRODUCAO/ (24 docs ativos + 28 arquivados)
| Tipo | Qtd | Conteúdo |
|------|:---:|---------|
| Roadmap futuro | 3 | Lotes 61-100, PLANO-FINAL-MASTER S61-S120, plano SEO |
| Quality gates | 1 | Definição de gates 0-18+ |
| Runbooks | 4 | Rollback, backup Neon, rotation secrets |
| Compliance | 2 | LGPD checklist, secrets map |
| Evidências `.generated` | 8 | Auth smoke, GO-NO-GO, load test, security audit, etc. |
| Observability | 1 | Checklist R2 S97 |
| SEO content | 1 pasta | 90 briefs artigos + 13 comparativos + 15 LPs |
| Execução | 1 pasta | 10 dezenas de lotes (EXECUCAO-LOTES/) |

### docs/archive/ (documentos históricos)
| Pasta | Qtd | Conteúdo |
|-------|:---:|---------|
| planos-concluidos/ | 9 | Planos superseded, docs antigos |
| operacoes-pontuais/ | 2 | Cleanup CF, migration inventory |
| mvp-build-logs/ | vazia* | (mvp/ movida mas sem conteúdo nested) |
| ULTRA-PLANO/_archive/ | 28 | Sprints concluídos, relatórios, prompts |

### docs/redesign-final/ (8 docs de design — KEEP)
Design tokens, assets guide, performance, component guide, mapa de telas.

### docs/twa/ (1 doc — KEEP)
TWA-MEGA-PLAN.md — plano complementar ao TWA-DOCUMENTATION.md.

---

## 🎮 GAMIFICAÇÃO — ESTADO ATUAL

### XP Economy (Implementado)
```
Eventos configuráveis:
- WORKOUT_COMPLETE → +50 XP
- ASSESSMENT_COMPLETE → +30 XP
- STREAK_MILESTONE → +100 XP (7d), +250 XP (30d), +500 XP (90d)
- DAILY_LOGIN → +5 XP
- PROFILE_COMPLETE → +20 XP (one-time)

Limites anti-abuse:
- 500 XP/dia por tipo de evento
- Deduplication por hash (evento + userId + timestamp)
- Audit log completo

Cache:
- KV com TTL por tipo de dado
- Invalidação em write

Schema: 8 tabelas
- xp_balances, xp_transactions, xp_streaks, xp_streak_milestones
- xp_daily_limits, xp_deduplication, xp_event_config, xp_audit_log
```

### Badges (Implementado)
```
Tipos definidos em constants.ts:
- FIRST_WORKOUT, FIRST_ASSESSMENT
- STREAK_7, STREAK_30, STREAK_90
- XP_100, XP_500, XP_1000, XP_5000
- LEVEL_5, LEVEL_10, LEVEL_25
- PERFECT_WEEK, EARLY_BIRD, NIGHT_OWL
```

### O que falta na gamificação:
- [ ] UI de badges no perfil do aluno (visual showcase)
- [ ] Animações de levelup/badge earned
- [ ] Notificações push de conquistas
- [ ] Social sharing de conquistas
- [ ] Leaderboard visual no dashboard
- [ ] Challenges/desafios semanais
- [ ] Recompensas reais (descontos por XP)

---

## 🔧 CORREÇÕES TWA REALIZADAS (08/03/2026)

### ✅ Canal Alpha Removido
- `twa/icons/source/icon-1024.png`: `P (palette com alpha)` → `RGB`
- `twa/store_icon.png`: `RGBA` → `RGB`
- Todos os 9 ícones em `twa/icons/generated/`: regenerados como `RGB`
- Fundo: `#09090B` (cor do brand/dark mode)

### ✅ Cores Sincronizadas
- `manifest.json`: `theme_color` e `background_color` alterados de `#050526` para `#09090B`
- Match perfeito com `twa-manifest.json`, `globals.css` e `layout.tsx`

### 🔲 Próximos Passos TWA (para submissão)
1. **Criar feature graphic manualmente** — 1024x500, design com logo e tagline
2. **Rebuild AAB**: `cd twa && npx @nicolo-ribaudo/bubblewrap build`
3. **Incrementar versionCode** para 7+ no `twa-manifest.json`
4. **Testar APK** no dispositivo real antes de enviar AAB
5. **Screenshots atualizados** — 2 mobile (1080x1920) + 1 tablet (7") se necessário
6. **Submeter para revisão** no Google Play Console

---

## 📈 MÉTRICAS DE QUALIDADE

### Performance (Lighthouse)
- **LCP**: Hero com `fetchpriority="high"` e preconnect
- **CLS**: Layout estável com dimensões fixas em imagens
- **FID/INP**: Event handlers otimizados
- **Static export**: Zero server-side rendering em produção

### Segurança
- **Web Security Audit**: GO ✅ (gerado 27/02)
- **Sensitive References Audit**: 0 P0, 2 P1 (aceitável)
- **Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate limiting**: IP + userId por endpoint

### SEO
- **14 páginas públicas** indexáveis com robots `index, follow`
- **JSON-LD** em todas as páginas
- **Open Graph + Twitter Cards** completos
- **Sitemap**: 14 URLs + 4 blog URLs
- **robots.txt**: otimizado para IA crawlers (GPTBot, ClaudeBot, PerplexityBot)

---

## 🗺️ ROADMAP RESUMIDO

### Imediato (esta semana)
1. ~~Limpeza documental~~ ✅
2. ~~Fix ícones TWA alpha~~ ✅
3. ~~Fix cores manifest mismatch~~ ✅
4. Rebuild AAB e submeter Google Play
5. Feature graphic profissional
6. Screenshots atualizados

### Curto prazo (2-4 semanas)
- SEO Sprint 1: Meta tags + structured data refinement
- Blog: 5-10 artigos prioritários
- Email templates HTML
- Analytics events customizados
- Onboarding wizard
- Testes E2E (Playwright)

### Médio prazo (1-3 meses)
- 30+ artigos de blog
- 5+ landing pages específicas
- Stripe checkout completo
- Dark/Light mode
- Performance audit completo
- Social features (compartilhamento)

### Longo prazo (3-6 meses)
- 90 artigos + 13 comparativos + 15 LPs (plano SEO completo)
- Marketplace de treinos
- White-label
- App Store iOS
- Multilanguage
- Video call

---

## 📎 REFERÊNCIAS CRUZADAS

| Para saber sobre... | Veja |
|---------------------|------|
| Endpoints API detalhados | `docs/BACKEND.md` |
| Schema DB completo (43 tabelas) | `docs/PLANO-CONTINUIDADE.md` |
| Deploy e operações | `docs/CF-OPERATIONS.md` |
| Integração Asaas | `docs/ASAAS-INTEGRATION.md` |
| Sistema XP/gamificação | `docs/XP-GOVERNANCE.md` |
| TWA/Google Play | `docs/TWA-DOCUMENTATION.md` |
| PWA/Service Worker | `docs/PWA-MEGA-PLAN.md` |
| Plano SEO completo | `docs/PLANO-PAGINAS-SEO-COMPLETO.md` |
| Roadmap S61-S120 | `docs/ULTRA-PLANO-MVP-PRODUCAO/PLANO-FINAL-MASTER-S61-S120-2026-02-26.md` |
| Design system LP | `docs/DESIGN-SYSTEM-LP.md` |
| Regras do Copilot | `.github/copilot-instructions.md` |
| Histórico de deploys | `docs/CHANGELOG.md` |

---

> **Última atualização**: 08/03/2026 — v4.7.3
> **Autor**: Gerado por auditoria automatizada + revisão manual
