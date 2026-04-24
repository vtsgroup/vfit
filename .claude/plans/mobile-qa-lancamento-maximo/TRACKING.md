# TRACKING - Mobile QA Lancamento Maximo

Status geral: Em progresso
Ultima atualizacao: 2026-04-24 — Sessao 3

## Resumo

- Tasks totais: 75
- Concluidas: 4
- Em progresso: 0
- Pendentes: 71
- Progresso: 4/75 (5%)


## A) Governanca e Setup

- [ ] T1.1 - Definir branch de execucao do plano (sem tocar main)
- [ ] T1.2 - Criar baseline de qualidade atual (health check inicial)
- [ ] T1.3 - Criar baseline de performance mobile (CWV + Lighthouse)
- [ ] T1.4 - Definir matriz de severidade de bugs (P0/P1/P2/P3)
- [ ] T1.5 - Definir Definition of Done de QA para go-live
- [ ] T1.6 - Definir donos por frente (UI, dados, QA, release)
- [ ] T1.7 - Congelar escopo da release (must-have x nice-to-have)
- [ ] T1.8 - Definir checklist final de aprovacao
- [x] T1.9 - Publicar documentação R2 (24/04/2026)

## B) QA Mobile 100% com Playwright

- [ ] T2.1 - Levantar mapa de rotas mobile (B2B dashboard + B2C student)
- [ ] T2.2 - Criar smoke spec de navegacao primaria mobile
- [ ] T2.3 - Criar spec de auth mobile (login, refresh, logout)
- [ ] T2.4 - Criar spec de resiliencia (offline/intermitencia/retry)
- [ ] T2.5 - Criar spec de notificacoes e mensagens
- [ ] T2.6 - Criar spec de acessibilidade mobile (focus, contraste, labels)
- [ ] T2.7 - Criar spec visual (snapshot) para headers/heroes
- [ ] T2.8 - Criar spec para fluxo Avaliacoes Fisicas ponta a ponta
- [ ] T2.9 - Criar spec para fluxo Nutricao ponta a ponta
- [ ] T2.10 - Criar spec para fluxo Treinos ponta a ponta
- [ ] T2.11 - Criar spec para fluxo Perfil/Plano ponta a ponta
- [ ] T2.12 - Criar spec para estados vazios, loading e erro
- [ ] T2.13 - Criar spec para safe-area iOS e Android
- [ ] T2.14 - Criar spec para regressao de botao voltar
- [ ] T2.15 - Executar rodada Quick QA (P0/P1)
- [ ] T2.16 - Corrigir P0/P1 e revalidar
- [ ] T2.17 - Executar rodada Standard QA (inclui P2)
- [ ] T2.18 - Corrigir P2 e revalidar
- [ ] T2.19 - Executar rodada Exhaustive QA (inclui cosmeticos)
- [ ] T2.20 - Consolidar relatorio final de bugs + evidencias

## C) Padronizacao Hero/Header (pedido principal)

- [ ] T3.1 - Definir componente padrao HeroMobileDashboard (contrato unico)
- [ ] T3.2 - Incluir botao voltar padrao em todos os heroes de dashboard
- [ ] T3.3 - Padronizar CTA primario no hero (Button DS, tamanho e copy)
- [x] T3.4 - Ajustar Avaliacoes Fisicas para remover borda inferior no header
- [ ] T3.5 - Padronizar Nutricao no mesmo estilo do hero de Avaliacoes
- [x] T3.6 - Adicionar CTA de acao em Nutricao (ex: + Adicionar)
- [ ] T3.7 - Garantir consistencia de espacos/tipografia entre paginas
- [ ] T3.8 - Garantir estados de scroll sem regressao visual
- [ ] T3.9 - Atualizar snapshots de regressao visual dos heroes

## D) Nutrição - Cadastro Massivo de Alimentos

- [ ] T4.1 - Auditar modelo de dados atual de alimentos
- [ ] T4.2 - Definir estrategia de ingestao em lote (seed/import)
- [ ] T4.3 - Definir taxonomia de categorias alimentares
- [ ] T4.4 - Criar pipeline de importacao validada (dedupe)
- [ ] T4.5 - Incluir campos minimos de macro/micro nutrientes
- [ ] T4.6 - Criar validacao de qualidade dos dados de alimentos
- [ ] T4.7 - Popular base inicial com volume alvo acordado
- [ ] T4.8 - Criar busca/filtro de alta performance para alimentos
- [ ] T4.9 - Testar fluxo adicionar alimento no mobile
- [ ] T4.10 - Definir governanca de manutencao da base de alimentos

## E) Exercicios - Cobertura de Grupos e Subgrupos

- [ ] T5.1 - Auditar estrutura atual de grupos musculares/subgrupos
- [ ] T5.2 - Levantar lacunas de cobertura por modalidade
- [ ] T5.3 - Definir taxonomia oficial de grupos/subgrupos
- [ ] T5.4 - Revisar consistencia de tags em exercicios existentes
- [ ] T5.5 - Criar lote de normalizacao dos exercicios inconsistentes
- [ ] T5.6 - Adicionar exercicios faltantes por grupo/subgrupo
- [ ] T5.7 - Validar qualidade dos metadados (equipamento, nivel, plano)
- [ ] T5.8 - Testar descoberta no app (filtros e biblioteca)
- [ ] T5.9 - Criar checklist de manutencao continua da base

## F) Performance, UX e Hardening

- [ ] T6.1 - Rodar auditoria cloudflare-web-perf nas rotas criticas
- [ ] T6.2 - Eliminar gargalos de LCP/CLS em mobile
- [ ] T6.3 - Revisar feedback de loading e estados transicionais
- [ ] T6.4 - Revisar acessibilidade e interacao touch em telas criticas
- [ ] T6.5 - Revisar erros de runtime via logs e monitoramento
- [ ] T6.6 - Corrigir regressao de UX identificada no QA

## G) Go/No-Go e Lancamento

- [ ] T7.1 - Rodar quality gate completo (lint, type-check, testes)
- [ ] T7.2 - Rodar smoke auth obrigatorio (gate de deploy)
- [ ] T7.3 - Executar checklist de release mobile final
- [ ] T7.4 - Atualizar CHANGELOG com entregas da release
- [ ] T7.5 - Atualizar docs tecnicos (backend/design/system/rules)
- [ ] T7.6 - Gerar relatorio go/no-go com riscos residuais
- [ ] T7.7 - Aprovar janela de deploy com criterio objetivo
- [ ] T7.8 - Executar deploy oficial com monitoramento pos-release
- [ ] T7.9 - Executar canary de pos-deploy e confirmar saude

## H) Light Theme + Design System Overhaul

- [ ] T8.12 - Documentar setup dos buckets R2 (images, videos) — ver `R2-SETUP.md`

## I) R2 Buckets — Imagens e Vídeos

- [x] R2 buckets criados (images, videos)
- [x] Domínios custom ativados (images.vfit.app.br, videos.vfit.app.br)
- [x] Bindings e vars no wrangler.toml
- [x] CORS configurado
- [ ] Documentação publicada (`R2-SETUP.md`)
- [ ] Testes Playwright de entrega pública

- [ ] T8.1 - Auditar contraste completo do tema claro em telas criticas
- [ ] T8.2 - Revisar hierarchy de cores semanticas (texto, borda, superficie)
- [x] T8.3 - Padronizar header claro em dashboard e app student
- [x] T8.4 - Padronizar action buttons do header no tema claro
- [ ] T8.5 - Revisar estados de botoes (hover/pressed/disabled/loading) no claro
- [ ] T8.6 - Revisar inputs/selects/textareas no claro (legibilidade e foco)
- [ ] T8.7 - Revisar cards/listas no claro (profundidade e separacao visual)
- [ ] T8.8 - Revisar empty states e feedback visual no claro
- [ ] T8.9 - Criar checklist visual de regressao light x dark por modulo
- [ ] T8.10 - Executar polimento final do DS com snapshots atualizados
- [ ] T8.11 - Atualizar tokens e documentacao do Design System

## Tabela de deploys

| Versao | Sprint | Data | Commit | Arquivos |
|---|---|---|---|---|
| N/A | Planejamento inicial | 2026-04-24 | N/A | 2 docs |
