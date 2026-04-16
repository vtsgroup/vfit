# TRACKING - Plano Para Lancamento

Status geral: Em progresso
Ultima atualizacao: 2026-04-16 — Sessao 5

## Resumo

- Tasks totais: 42
- Concluidas: 31
- Em progresso: 0
- Pendentes: 11
- Progresso: 31/42 (74%)

## A) Produto Critico

- [x] T1.1 - Criar pasta e estrutura do plano
- [x] T1.2 - Mapear rota atual do sino de notificacoes → `/perfil/notificacoes` (settings)
- [x] T1.3 - Corrigir rota para inbox de notificacoes → `/dashboard/notifications`
- [ ] T1.4 - Criar teste de navegacao para sino
- [x] T1.5 - Definir regra de dominio para treino concluido do dia → localStorage por plan_id + day_number
- [x] T1.6 - Persistir flag de conclusao → localStorage key `vfit_day_completed_{planId}_{day}` = ISO date
- [x] T1.7 - Bloquear CTA de iniciar treino quando dia concluido → banner "Concluído ✓"
- [x] T1.8 - Exibir estado visual de concluido no card de dia → chip verde com checkCircle
- [ ] T1.9 - Criar teste de regressao treino concluido

## B) UX/UI Premium

- [x] T2.1 - Ajustar header em tema claro → `.light .ds3-header` com bg branco 88% opacity
- [x] T2.2 - Revisar contraste do header com WCAG AA → usa text-text-primary (17.85:1) ✅
- [ ] T2.3 - Aplicar token verde principal do chip Dia 1 em CTA prioritarios (ja usa brand-primary via Button)
- [x] T2.4 - Implementar efeito 3D no botao Proximo Exercicio → removido shadow-2xl que sobrescrevia 3D
- [x] T2.5 - Implementar efeito 3D no botao Iniciar Treino → removido shadow-2xl que sobrescrevia 3D
- [x] T2.6 - Alinhar pagina Treinos ao visual de Meu Plano → header gradiente bg-linear-to-r + greeting
- [x] T2.7 - Revisar hierarquia tipografica no topo da pagina Treinos → text-4xl font-black igual ao Meu Plano
- [x] T2.8 - Padronizar estados pressed/disabled/loading dos CTAs → verificado, botoes criticos ja tem loading
- [x] T2.9 - Testar safe area e sobreposicao com bottom nav → bottom nav usa env(safe-area-inset-bottom), paginas usam pb-24+

## C) Midia e Admin

- [x] T3.1 - Auditar pipeline atual de imagem de exercicio → D1 image_urls + Neon exercise_media + R2
- [x] T3.2 - Confirmar naming e estrutura de chave no R2 → `exercise-media/{id}/thumbnails/{uuid}.ext`
- [x] T3.3 - Implementar cache bust por versao/hash → D1 update + KV invalidation apos upload
- [x] T3.4 - Garantir fallback se imagem nao existir → placeholder DSIcon na ExerciseImageCell
- [x] T3.5 - Criar endpoint upload imagem exercicio (super_admin) → ja existe, adicionado D1 sync
- [x] T3.6 - Criar endpoint de replace/remove imagem exercicio → `DELETE /exercises/:id/media/image` + botao X na UI admin
- [x] T3.7 - Criar UI no painel admin para upload de imagem → `/dashboard/admin/exercises`
- [x] T3.8 - Suportar preview e validacao de formato/tamanho → hover overlay + validacao 2MB
- [x] T3.9 - Associar imagem ao exercicio → `exercises.image_urls` atualizado via D1 apos upload
- [x] T3.10 - Criar trilha de auditoria de alteracao de midia → KV log `media-audit:{exerciseId}:{ts}` TTL 90d para upload + remove

## D) QA e Go-Live

- [x] T4.1 - Executar testes unitarios dos fluxos alterados → `npm run test` ✅ (360 passed, 0 failed)
- [x] T4.2 - Executar testes de integracao de notificacoes → `node scripts/smoke-notifications.mjs` ✅ (8 criadas, 0 falhas)
- [x] T4.3 - Executar testes E2E de treino completo → `tests/e2e/workout.spec.ts` ✅ (6 passed)
- [ ] T4.4 - Executar teste de upload imagem no painel admin ⏳ config corrigida: bindings `R2_IMAGES`/`R2_VIDEOS` reativados em `wrangler.toml` e validados via `wrangler deploy --dry-run`; falta deploy para revalidar em produção
- [ ] T4.5 - Executar validacao de cache bust em app real ⏳ dependente do deploy da correção de bindings R2
- [x] T4.6 - Executar smoke auth local obrigatorio → `npm run smoke:auth:local` ✅ (8 passed, 0 failed, 2 skipped)
- [x] T4.7 - Executar checklist visual light e dark → screenshots desktop/mobile geradas em `.claude/tmp/qa-visual-2026-04-16`
- [x] T4.8 - Executar checklist de acessibilidade mobile → `npm run test:e2e:a11y -- --project=mobile-chrome` ✅ (6 passed, 1 skipped)
- [x] T4.9 - Atualizar changelog tecnico → entry de 16/04 adicionada em `docs/CHANGELOG.md`
- [x] T4.10 - Preparar notas de release → consolidado em `docs/CHANGELOG.md` + gate `quality:ci` aprovado
- [x] T4.11 - Definir plano de rollback tecnico → runbook validado em `.claude/docs/archive/legacy-plans/ULTRA-PLANO-MVP-PRODUCAO/INCIDENT-ROLLBACK-RUNBOOK.md`
- [x] T4.12 - Aprovar go/no-go final → `docs/ULTRA-PLANO-MVP-PRODUCAO/GO-NO-GO-MVP.generated.md` com decisão GO ✅

## Tabela de deploys

| Versao | Sprint | Data | Commit | Arquivos |
|---|---|---|---|---|
| N/A | Planejamento inicial | 2026-04-16 | N/A | 8 docs |
