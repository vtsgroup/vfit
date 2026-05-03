# TRACKING — VFIT Consolidação Produção Lançamento

> **Plano:** `vfit-consolidacao-producao-lancamento`  
> **Criado:** 03/05/2026  
> **Última atualização:** 03/05/2026 — Login sem exploração grátis; funil auth focado em conversão; deploy bloqueado por smoke auth expirado  
> **Status geral:** Em progresso — aguardando tokens válidos de smoke auth antes de deploy

## Resumo

- Tasks totais: 54
- Concluídas: 38
- Em progresso: 1
- Pendentes: 17
- Progresso: 38/54 (70%)

## S0 — Plano Operacional e Baseline

- [x] **T0.1** Criar pasta do plano em `.claude/plans/vfit-consolidacao-producao-lancamento/`
- [x] **T0.2** Criar `PLAN.md` com CEO/Eng/Design review
- [x] **T0.3** Criar `TRACKING.md` como fonte da verdade
- [x] **T0.4** Criar `VISUAL-AUDIT.md` com baseline dos prints
- [x] **T0.5** Criar estrutura `SCREENSHOTS/` para evidências antes/depois
- [x] **T0.6** Mapear planos antigos e pendências reaproveitáveis

## S1 — Quebras Reais e Higiene Técnica

- [x] **T1.1** Corrigir diagnostic em `src/app/(app)/avaliacoes/page.tsx`
- [x] **T1.2** Corrigir diagnostics em `src/components/progresso/streak-calendar.tsx`
- [x] **T1.3** Corrigir diagnostic em `src/components/dashboard/stats-card.tsx`
- [x] **T1.4** Corrigir diagnostic em `src/components/progresso/chart-skeleton.tsx`
- [x] **T1.5** Corrigir diagnostic em `src/app/(app)/progresso/corporal/page.tsx`
- [x] **T1.6** Rodar editor diagnostics novamente — código corrigido e grep sem padrões antigos; cache do VS Code ainda exibe mensagens antigas
- [x] **T1.7** Rodar grep Tailwind v4 (`bg-gradient-to-`, `-[var(--`, brackets indevidos) — zero para gradiente legado/var/brackets corrigidos; hex em public/auth fica para S6
- [ ] **T1.8** Verificar CTAs nativos e imports diretos de ícones

## S2 — Aluno Light-Only

- [x] **T2.1** Aplicar override light para rotas B2C em `ThemeProvider`
- [x] **T2.2** Ajustar meta/theme-color para rotas B2C claras
- [x] **T2.3** Ajustar `StudentHeader` — restaurado visual premium navy/azul solicitado, preservando app B2C em light no conteúdo
- [x] **T2.4** Validar `BottomNavigation` — restaurada navegação premium navy/azul solicitada, com rotas B2C em light no conteúdo
- [x] **T2.5** Ajustar `StudentFabMenu` para overlay/light UX
- [x] **T2.6** Atualizar página de tema do perfil para nova regra light-only

## S3 — Componentes Base Light Mode

- [x] **T3.1** Completar tokens light em `globals.css` — bottom nav + glass/card light corrigidos
- [x] **T3.2** Completar variants light em `GlassCard`
- [x] **T3.3** Revisar variantes do `Button` em light mode — secondary ficou neutro premium no app aluno
- [ ] **T3.4** Validar KPIs em fundo claro
- [ ] **T3.5** Validar `AvatarWithPlanBadge` em header claro

## S4 — Página Treinos e Scroll Excessivo

- [x] **T4.1** Trocar header escuro hardcoded por light compacto
- [ ] **T4.2** Consolidar duplicidade de treino do dia
- [x] **T4.3** Tornar convite de personal secundário/colapsável
- [x] **T4.4** Reorganizar hierarquia de cards acima da dobra — personal/gamificação viraram seções colapsáveis
- [ ] **T4.5** Reduzir `pb-24`/scroll vazio com safe-area tokens
- [ ] **T4.6** Remover inline styles escuros sem token

## S5 — Menus e Navegação

- [ ] **T5.1** Revisar `src/lib/navigation.ts` como fonte única
- [ ] **T5.2** Planejar bottom nav config-driven
- [ ] **T5.3** Reduzir ações FAB ao MVP
- [x] **T5.4** Adicionar/validar Escape e tap-outside no FAB
- [ ] **T5.5** Validar rotas imersivas sem header/nav

## S6 — Público e Auth Azul Premium

- [x] **T6.1** Migrar navbar pública de verde para azul
- [ ] **T6.2** Migrar hero pública para azul/teal
- [ ] **T6.3** Ajustar features/pricing/footer
- [ ] **T6.4** Consolidar seções duplicadas dos prints
- [x] **T6.5** Migrar auth split-screen para azul premium
- [x] **T6.6** Corrigir login/auth em modo azul premium — escopo dark isolado, CTA azul, campos dark, Turnstile sem bloco branco em localhost

## S7 — Remover Desnecessário e Backlog

- [ ] **T7.1** Identificar menus incompletos/coming soon
- [x] **T7.2** Esconder bypass de visitante no login — removido “Explorar sem conta” para priorizar cadastro/venda
- [ ] **T7.3** Mover fase 2 para backlog documentado
- [ ] **T7.4** Revisar copy pública e nomes legados

## S8 — QA Visual e Produção

- [ ] **T8.1** Capturar screenshots baseline desktop/tablet/mobile
- [x] **T8.2** Capturar screenshot after do login mobile/local — sem CSS quebrado, sem bloco Turnstile, CTA azul
- [x] **T8.3** Rodar `npm run lint` — 0 erros, 75 warnings preexistentes
- [x] **T8.4** Rodar `npm run type-check` — executado novamente após bloco light-only
- [x] **T8.5** Rodar `npm run type-check:workers`
- [x] **T8.6** Rodar `npm test` — 23 arquivos / 360 testes aprovados
- [ ] **T8.7** Rodar `npm run test:e2e:a11y`
- [x] **T8.8** Rodar core flows Chromium — 6 passed / 10 skipped por tokens auth ausentes/expirados
- [x] **T8.9** Rodar `npm run build` — produção compilou e exportou 144 páginas
- [ ] **T8.10** Rodar `npm run smoke:auth:local` — bloqueado: `SMOKE_*` expirados e `.env.local` com linhas inválidas; não inspecionar/editar secrets sem rotação segura
- [ ] **T8.11** Rodar `npm run ops:release:gate`
- [x] **T8.12** Atualizar tracking/go-no-go — deploy bloqueado até smoke auth válido

## Observações de QA/deploy — 03/05/2026

- Hotfix visual auth: `.auth-dark-scope` força tokens dark/azul mesmo quando `html.light` fica ativo após navegação de aluno.
- Funil de venda: login não exibe mais “Explorar sem conta”; usuário novo recebe CTA único para cadastro grátis com prova de segurança.
- Turnstile local: localhost/127.0.0.1 agora usa bypass visual seguro para QA local; produção mantém widget real em domínios reais.
- Login local validado no browser: sem service worker/cache antigo, sem bloco branco do Turnstile, CTA azul e campos dark coerentes.
- `npm run type-check`: aprovado após hotfix auth.
- `npm run lint`: aprovado com 71 warnings preexistentes, 0 erros após hotfix auth.
- `npm run build`: aprovado após hotfix auth; export estático gerou 143 páginas e postbuild inline CSS concluiu.
- Playwright focado: `tests/e2e/auth.spec.ts` + `tests/e2e/smoke-public.spec.ts` Chromium — 9 passed / 1 skipped.
- `npm run smoke:auth:local`: bloqueado — `.env.local` contém linhas inválidas e tokens `SMOKE_*` estão expirados/ausentes no relatório gerado.
- `npm run type-check`: aprovado.
- `npm run lint`: aprovado com 71 warnings preexistentes, 0 erros.
- `npm run build`: aprovado; export estático gerou 143 páginas e postbuild inline CSS concluiu.
- Core flows Chromium: 6 passed / 10 skipped por ausência de tokens autenticados válidos.
- Produção online: `/`, `/login`, `/pricing`, `/blog` e API `/health` retornaram HTTP 200.
- Deploy **não executado**: branch atual é feature branch e o smoke autenticado está bloqueado por tokens expirados.

## Tabela de deploys

| Versão | Sprint | Data | Commit | Arquivos |
|---|---|---|---|---|
| N/A | Início do plano | 2026-05-03 | N/A | PLAN/TRACKING/VISUAL-AUDIT |
