# TRACKING — VFIT ULTRA

> **Fonte de verdade da execução** (obrigatório por RULES.md §20).
> **Última atualização:** 2026-06-21 · **Versão do app:** v4.8.3 · **Status do plano:** 🟡 Aguardando aprovação (CEO + Eng review)
> Legenda: `[ ]` pendente · `[x]` concluído · 🔄 em progresso · ❌ bloqueado · ⏩ adiado

**Progresso geral: 3/84 (4%)** — CEO/Eng/Design review concluídos; nova tela de loading entregue. Execução do restante inicia após resolução das decisões 2/3/4.

**Já entregue nesta sessão (branch `feat/vfit-ultra-redesign`):**
- [x] LOAD.1 `BrandLoader` (componente leve reutilizável) + barrel export
- [x] LOAD.2 `splash-screen.tsx` reescrito leve (sem hardcode, sem 30 partículas, reduced-motion) — mesma API
- [x] REV.1 CEO + Eng + Design reviews (ver REVIEW-REPORTS.md)

---

## S1 — Trial & Paywall
- [ ] T1.1 Migration trial unificado (+rollback)
- [x] T1.2 `lib/entitlements.ts` (fonte única) ✅ criado (pure, app+workers tsc OK)
- [~] T1.3 Signup: trial **30d** (auth.ts via `TRIAL_DAYS`) ✅ staged (deploya com R2); aluno sem Asaas = pendente backend
- [ ] T1.4 `/auth/me` retorna entitlements (corrige bug check `false`)
- [ ] T1.5 Middleware gating premium
- [ ] T1.6 Cron expiração + reminders D-5/D-2/D-0
- [ ] T1.7 Frontend: banner trial, widget dias, paywall reposicionado
- [ ] T1.8 Anti-abuso (1 trial/CPF/device + risk flag)
- [ ] T1.9 `/perfil/assinatura` mostra ciclo real

## S2 — Onboarding & Login instantâneos
- [ ] T2.1 Quiz 16→12 (remover motivacional/prova social; agrupar dados)
- [ ] T2.2 Motor rule-based de plano instantâneo
- [ ] T2.3 Banco de templates curados (D1)
- [ ] T2.4 Refino IA em background (update in-place)
- [ ] T2.5 Cadastro aluno adiado (quiz sem conta → 1-tap)
- [ ] T2.6 Cadastro personal mínimo + complete-profile checklist
- [ ] T2.7 Login: passkey/OAuth primário + Turnstile invisível
- [ ] T2.8 Instrumentar funil (eventos de ativação)

## S3 — Backend Hardening
- [ ] T3.1 Wrapper transacional pagamentos + idempotência/retry
- [ ] T3.2 Soft-delete avaliações
- [ ] T3.3 Reconciliação cross-DB (PG↔D1 órfãos)
- [ ] T3.4 Paginação universal (todos os list)
- [ ] T3.5 Corrigir N+1 chat
- [ ] T3.6 PDF de avaliação → queue
- [ ] T3.7 TTL cache + índices JSONB
- [ ] T3.8 Validações (due_date/body_fat/reps/email)
- [ ] T3.9 Proteção prompt injection (IA)
- [ ] T3.10 File size + cleanup R2 (GC mídia órfã)
- [ ] T3.11 Padronizar shape/erros/paginação + rate headers
- [ ] T3.12 Resolver módulos vazios (b2c-exercise-media, platform)
- [ ] T3.13 Templates CRUD admin
- [ ] T3.14 Affiliates commission cron
- [ ] T3.15 Novos endpoints do plano (doc 06 §8)
- [ ] T3.16 Testes de crons (incl. novo trial cron)

## S4 — Design System Unificação
- [ ] T4.1 Card: 5→1 (deprecar MD3Card/FormCard)
- [ ] T4.2 Button: 13→6 (+atualizar RULES §14)
- [ ] T4.3 Tokens: eliminar 10 cores hardcoded + lint rule
- [ ] T4.4 Hierarquia tipográfica + reduzir uppercase
- [ ] T4.5 Espaçamento mobile + input sizing + safe-area
- [ ] T4.6 Componentes novos (PageTransition/ErrorRecovery/FormProgress/LoadingOverlay)
- [ ] T4.7 Ilustrações de empty state (8-12 SVG)

## S5 — Painel do Aluno
- [ ] T5.1 Corrigir `/treinos/novo` (custom workout API)
- [ ] T5.2 `/perfil/editar` toast erro + estados
- [ ] T5.3 Assinatura/entitlements reais
- [ ] T5.4 IA `/ia/dieta` real
- [ ] T5.5 IA `/ia/macros` real
- [ ] T5.6 IA `/ia/recuperacao` real
- [ ] T5.7 IA `/ia/treino-adaptado` real
- [ ] T5.8 Social v1 OU remover do nav (DECISÃO 5)
- [ ] T5.9 Desafios + gamificação consistentes
- [ ] T5.10 Unificar rotas de exercício (`[id]` vs `detalhe`)
- [ ] T5.11 4 estados em 100% das telas do aluno

## S6 — Painel do Personal
- [ ] T6.1 Wizard criação de treino + auto-save
- [ ] T6.2 Calendar agendamento real + lembretes
- [ ] T6.3 Nutricionista compartilha plano com aluno
- [ ] T6.4 Afiliados fluxo completo
- [ ] T6.5 IA do personal (gerar treino/conteúdo/progressão)
- [ ] T6.6 Marketplace: completar OU ocultar (DECISÃO 6)
- [ ] T6.7 Widget trial + read-only pós-trial
- [ ] T6.8 Paginação consistente nas listas
- [ ] T6.9 4 estados em 100% das telas do personal

## S7 — Admin & Super-Admin
- [ ] T7.1 Paginação em todos os list admin
- [ ] T7.2 Config CRUD + audit trail
- [ ] T7.3 Suspender/banir na UI
- [ ] T7.4 Painel Trial/Conversão
- [ ] T7.5 Cohort/funnel analytics
- [ ] T7.6 Audit trail viewer
- [ ] T7.7 Feature flags UI (DECISÃO 7)
- [ ] T7.8 Risk assessment ligado (anti-abuso)
- [ ] T7.9 UIs para telas API-only (avaliações, roster, ops infra)
- [ ] T7.10 4 estados em 100% das telas admin

## S8 — Ultramodernização & QA total
- [ ] T8.1 Micro-interações/motion em ações-chave
- [ ] T8.2 Dark mode premium
- [ ] T8.3 Acessibilidade (aria/teclado/leitor de tela)
- [ ] T8.4 Varredura final 4 estados (100% telas)
- [ ] T8.5 QA fim-a-fim de todos os fluxos
- [ ] T8.6 Docs (DESIGN-SYSTEM/BACKEND/RULES/CHANGELOG) + sync-ai-docs

## S-WA — WhatsApp como canal de produto (E1, novo escopo) — provider: Unipile API
- [ ] WA.1 Conectar conta WhatsApp na Unipile + `lib/unipile-whatsapp.ts`
- [ ] WA.2 `workers/api/whatsapp.ts` (envio + webhook via Unipile)
- [ ] WA.3 Opt-in/opt-out + consentimento LGPD
- [ ] WA.4 Lembrete de treino (cron + template)
- [ ] WA.5 Check-in do aluno (resposta → adesão)
- [ ] WA.6 Cobrança via WhatsApp (link Asaas + webhook)
- [ ] WA.7 Painel admin WhatsApp (logs/opt-in/métricas)

## S1+ — Loop viral no trial (E2, integra S1)
- [ ] V.1 Link de indicação por usuário
- [ ] V.2 `POST /referrals/redeem` concede +30d (com cap)
- [ ] V.3 Antifraude + cap de dias acumulados
- [ ] V.4 UI "indique e ganhe" (compartilha via WhatsApp E1)
- [ ] V.5 Métricas de viralidade (k-factor) no admin

## S-REDESIGN — Login + Páginas Públicas (doc 10) ✅ entregue (2026-06-22)
- [x] R.1 Tokens no login + telas irmãs ✅ (3 `bg-[#]`→token; shadows rgba→aliases; grep zero; auth intacto)
- [x] R.2 Split-screen premium no login + prova social ✅ (já premium em layout-client.tsx — verificado)
- [x] R.3 oauth-buttons: hardcode → tokens ✅ (`bg-[#0d0d0f]`→`bg-bg-primary` + shadows→elevation aliases + SVGs aria-hidden)
- [~] R.4 Landing hero + seções ✅ tipografia (uppercase removido), contraste, trial copy, a11y; bento/Card único = adiado (refactor maior)
- [~] R.5 Pricing alinhado ao trial 30d ✅ landing pricing 30d + a11y toggle; `/pricing` modelo student-first mantido (decisão de produto adiada); 4 reviews fabricadas removidas
- [x] R.6 Demais públicas: tipografia + estados + a11y ✅ (PageHero natural-case → 13 páginas; faq-inline aria; tabelas scope/caption; contraste)
- [~] R.7 Performance ✅ reduced-motion (motion-safe); Hero RSC extraction + numbers SSR-counters = adiado
- [x] R.8 A11y (aria/foco/teclado) ✅ (aria-label/hidden/expanded/current/live, role=switch/dialog, focus-visible, remoção tabIndex=-1)

## S-CONTENT — Pipeline de conteúdo (doc 12)
- [ ] C.1 Habilitar CF Image Resizing + URLs otimizadas
- [ ] C.2 Bulk upload admin (vídeos + imagens)
- [ ] C.3 Queue `video-encoder`
- [ ] C.4 CRUD completo de exercício no admin
- [ ] C.5 Imagens M/F de todos os grupos musculares + ligar nas telas
- [ ] C.6 Validação de upload + GC de órfãos
- [ ] C.7 Invalidação de cache por tag

## LOAD — Nova tela de loading (doc 11) ✅ parcialmente entregue
- [x] LOAD.1 `BrandLoader` + barrel
- [x] LOAD.2 splash reescrito leve
- [ ] LOAD.3 Trocar `return null`/spinners por `BrandLoader` nas rotas de maior tráfego
- [ ] LOAD.4 Variante skeleton + loader para listas

---

## Tabela de Deploys
| Versão | Sprint | Data | Commit | Arquivos | Notas |
|--------|--------|------|--------|----------|-------|
| v4.8.4 | LOAD/REV | 2026-06-21 | f0ab6c9b | loading screen + plano (16 docs) | ✅ Pages (frontend) LIVE · ❌ Worker bloqueado (R2 não habilitado na conta, code 10136/10042) · API segue v anterior, health 200 · WhatsApp notify off (Unipile a configurar) |
| v4.8.5 | S-REDESIGN | 2026-06-21 | (release) | hero + login redesign | ✅ Pages LIVE (290 arquivos) — novo hero "Seu personal trainer com IA, no seu bolso" + posicionamento 30d sem cartão; confirmado em prod (curl). Worker pulado (R2). WhatsApp off. |
| v4.8.6 | S1/S-REDESIGN | 2026-06-21 | (release) | entitlements + trial 30d + CTA/welcome 30d | ✅ Pages LIVE (289 arquivos) — `lib/entitlements.ts`, trial 14→30d (auth.ts staged), CTA/welcome com 30d sem cartão; confirmado em prod (curl). Worker pulado (R2). |

---

## Decisões pendentes (bloqueiam S1)
Ver tabela consolidada em [`08-ROADMAP-SPRINTS.md`](./08-ROADMAP-SPRINTS.md#consolidação-das-decisões-pendentes-para-ceoeng-review). Status: 🟡 aguardando CEO + Eng review.
