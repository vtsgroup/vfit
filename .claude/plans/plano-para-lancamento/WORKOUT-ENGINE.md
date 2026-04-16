# Workout Engine - Regras de Conclusao do Dia

## Problema atual

Usuario finaliza treino do dia, mas consegue iniciar novamente o mesmo dia como se ainda estivesse pendente.

## Regra de negocio desejada

- Quando treino do dia for finalizado com sucesso, o dia deve ficar marcado como concluido.
- O mesmo dia nao pode ser reiniciado no mesmo ciclo diario.
- UI deve refletir estado concluido de forma imediata e persistente.

## Modelo de estado recomendado

Entidade logica:
- workout_day_status

Campos minimos:
- user_id
- plan_id
- day_id
- status (pending | in_progress | completed)
- completed_at
- completion_source (manual | auto)
- revision

## Fluxo funcional

1. Usuario inicia treino
2. Status passa para in_progress
3. Usuario finaliza treino
4. Backend persiste completed
5. Frontend invalida cache e atualiza UI
6. CTA de iniciar fica desabilitado para o dia concluido

## Comportamento de UI

- Chip do dia concluido recebe estado visual de done
- CTA principal vira Concluido hoje ou texto equivalente
- Acoes secundarias permitidas: ver resumo, iniciar proximo dia (se politica permitir)

## Validacoes

- Nao permitir start se status ja for completed
- Em caso de corrida de requisicao, backend decide pelo estado final canonical
- Reabrir treino concluido so com permissao explicita de regra futura

## Casos de teste obrigatorios

- Finaliza treino e fecha app; ao abrir novamente continua como concluido
- Finaliza treino offline e sincroniza depois
- Duplo clique em Finalizar nao cria estado duplicado
- Usuario nao consegue reiniciar o mesmo dia apos concluido

## Criterios de aceite

- Persistencia confiavel de status completed
- Bloqueio real de repeticao no mesmo dia
- Sem regressao no historico de treinos anteriores
