# Plano Para Lancamento - VFIT

Status: Planejamento completo para execucao
Data: 2026-04-16
Owner: Produto + Engenharia + Design + QA

## Objetivo

Consolidar um plano de lancamento para levar o app ao nivel de producao com foco em:

- Correcoes de fluxo critico de treino e notificacoes
- Padronizacao visual (tema claro/escuro, verde de marca, botoes 3D)
- Confiabilidade de midia de exercicios (R2, cache, upload admin)
- Validacao completa de qualidade, regressao e readiness operacional

## Escopo de problemas reportados

- Header no tema claro com contraste incorreto
- Clique em notificacoes abre configuracoes em vez da lista de notificacoes
- Treino do dia permite repetir apos finalizar (deve bloquear)
- Botao Proximo Exercicio sem linguagem visual 3D
- Home Treinos deve herdar linguagem de Meu Plano com verde principal
- Botao Iniciar Treino deve ter efeito 3D como chip de Dia 1
- Imagem de Peito nao atualiza apos upload no R2
- Falta fluxo robusto para upload de imagens de exercicios via painel super admin

## Estrutura dos arquivos

- PLAN.md: estrategia, fases, prioridades e dependencias
- TRACKING.md: checklist operacional com IDs e progresso
- UX-UI.md: especificacao de interface e design system
- NOTIFICATIONS-ROUTING.md: arquitetura e correcao de rotas de notificacoes
- WORKOUT-ENGINE.md: regras de conclusao de treino e bloqueio de repeticao
- MEDIA-R2-ADMIN-UPLOAD.md: pipeline de imagem, cache bust, painel admin
- QA-TESTES.md: plano completo de testes e evidencias
- GO-LIVE.md: gate final, rollout, monitoramento e rollback

## Prioridade

Seguranca > Correcao > UX > Performance > DX

## Resultado esperado

Ao concluir as tasks deste plano, o app deve estar apto para go-live com comportamento previsivel, UX premium consistente e fluxo de conteudo de exercicios governado por painel admin.
