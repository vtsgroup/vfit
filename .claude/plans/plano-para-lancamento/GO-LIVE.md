# Go-Live - Plano Para Lancamento

## Objetivo

Executar lancamento com risco controlado, observabilidade e plano de rollback pronto.

## Checklist pre-go-live

- Tracking atualizado com status real
- QA final concluido com evidencias
- Smoke auth local aprovado
- Changelog atualizado
- Plano de rollback validado

## Sequencia recomendada

1. Congelar escopo
2. Rodar quality gate completo
3. Revisao final de produto
4. Deploy em janela definida
5. Monitoramento ativo pos deploy

## Monitoramento pos deploy

Primeira hora:
- Taxa de erro de navegacao
- Erros no fluxo de finalizar treino
- Erros de carregamento de imagem
- Integridade da contagem de notificacoes

Primeiras 24h:
- Conversao de inicio e conclusao de treino
- Taxa de reabertura indevida de treino concluido
- Eventos de upload/update de imagem no admin

## Plano de rollback

Triggers de rollback imediato:
- Fluxo de treino impede uso normal
- Notificacoes redirecionam incorretamente em massa
- Midia de exercicios fica indisponivel de forma ampla

Passos:
1. Comunicar incidente
2. Executar rollback de versao
3. Validar restauracao de fluxo core
4. Abrir post-mortem com causa raiz

## Aprovação de release

Go:
- Todos os criterios de aceite atendidos
- Produto, Engenharia e QA aprovam

No-Go:
- Qualquer P0 aberto
- P1 sem mitigacao documentada
