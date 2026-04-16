# QA e Testes - Plano Para Lancamento

## Objetivo

Garantir confiabilidade de fluxos criticos antes de producao, com evidencias objetivas e criterios claros de bloqueio.

## Matriz de teste

### Bloco A - Funcional core

1. Navegacao do sino abre inbox de notificacoes
2. Configuracoes de notificacoes acessiveis apenas por acao secundaria
3. Finalizacao de treino marca dia como concluido
4. Dia concluido nao permite reinicio no mesmo ciclo

### Bloco B - UI e experiencia

1. Header light com texto escuro e contraste AA
2. Botao Proximo Exercicio com efeito 3D coerente
3. Botao Iniciar Treino com efeito 3D coerente
4. Home Treinos alinhada visualmente com Meu Plano
5. Verde principal padronizado nos CTAs

### Bloco C - Midia

1. Upload de imagem no admin atualiza em app
2. Replace de imagem invalida cache antiga
3. Fallback aparece quando imagem nao carregou

## Tipos de execucao

- Teste unitario para regras de dominio de treino
- Teste de integracao para roteamento e persistencia
- Teste E2E para fluxo completo de treino
- Teste manual guiado para visual e acessibilidade

## Ambientes

- Local dev
- Staging com dados realistas
- Validacao final em pre-producao

## Evidencias obrigatorias

- Capturas de tela antes/depois
- Logs de rotas e estados de treino
- Evidencia de smoke auth local
- Relatorio final de bugs com severidade

## Criticidade de defeitos

- P0 bloqueia release: fluxo de treino quebrado, notificacoes erradas, crash
- P1 bloqueia release: upload midia inconsistente, CTA critico sem acao
- P2 nao bloqueia: ajustes cosmeticos sem impacto funcional

## Gate final

- Zero P0
- Zero P1 aberto sem mitigacao aprovada
- Smoke auth aprovado
- Fluxos core aprovados por QA + Produto
