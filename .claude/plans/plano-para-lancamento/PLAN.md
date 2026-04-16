# PLAN - Plano Para Lancamento

Status: Em planejamento
Data base: 2026-04-16

## 1) North Star

Entregar uma versao pronta para producao que corrija falhas de fluxo principal (treino e notificacoes), aumente consistencia visual entre telas chave e elimine gargalos de atualizacao de imagens de exercicio.

## 2) Fases de execucao

### Fase A - Correcoes criticas de produto

1. Corrigir rota do sino para abrir lista de notificacoes existentes
2. Ajustar regra de finalizacao de treino para bloquear repeticao no mesmo dia
3. Garantir estado concluido persistido entre app restart e sincronizacao backend

### Fase B - UX/UI para padrao premium

1. Header em tema claro com superficie e contraste corretos
2. Home Treinos alinhada visualmente com Meu Plano
3. Botoes de CTA com efeito 3D consistente (Proximo Exercicio e Iniciar Treino)
4. Unificacao do verde de destaque (token do Dia 1 como referencia)

### Fase C - Midia de exercicios e painel admin

1. Corrigir pipeline de atualizacao de imagem (R2 + cache bust + invalidacao)
2. Expor upload/edicao de imagens de exercicios no painel super admin
3. Cobrir casos de fallback, erro de upload e rollback de ativo

### Fase D - QA, hardening e go-live

1. Rodar testes funcionais, visuais e regressao
2. Executar smoke auth e smoke de fluxos criticos
3. Fechar checklist de producao e plano de rollback

## 3) Dependencias

- Dependencia 1: confirmacao de fonte de verdade para status treino concluido
- Dependencia 2: validacao de politica de cache para assets R2
- Dependencia 3: definicao do schema de metadados de imagem por exercicio
- Dependencia 4: definicao de permissao super_admin para upload/replace/delete

## 4) Riscos e mitigacao

- Risco: mudar regra de treino e quebrar historico
- Mitigacao: migration segura de estado e teste de regressao de historico

- Risco: cache agressivo manter imagem antiga
- Mitigacao: versionamento por hash e query param de versao

- Risco: regressao de navegacao ao corrigir sino
- Mitigacao: teste de deep link e de back stack em Android/iOS

## 5) Definicao de pronto

- Notificacoes: sino abre inbox de notificacoes, nao configuracoes
- Treino: concluido no dia bloqueia nova execucao do mesmo dia
- UI: headers, CTA e cores com padrao visual aprovado
- Midia: upload no admin propaga em app com cache bust previsivel
- QA: checklist completo com evidencias e sem bug bloqueador
