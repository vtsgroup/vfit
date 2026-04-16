# Notificacoes - Roteamento e UX de Inbox

## Problema atual

Ao tocar no icone de notificacoes, o app abre a tela de configuracoes de notificacoes em vez da inbox com notificacoes existentes.

## Comportamento esperado

Fluxo correto:

1. Usuario toca no sino no header
2. App abre Inbox de Notificacoes (lista cronologica)
3. Usuario pode abrir detalhe, marcar como lida e navegar para origem
4. Configuracoes de notificacoes ficam em acao secundaria dentro da inbox

## Regras de roteamento

- Rota primaria do sino: inbox
- Rota de configuracoes: apenas via botao dedicado na inbox
- Badge de nao lidas limpa parcialmente por visita e totalmente por leitura
- Back deve retornar para tela de origem sem reset inesperado

## Casos de teste

- Caso 1: clicar sino na home deve abrir inbox
- Caso 2: clicar configuracoes dentro da inbox deve abrir preferencias
- Caso 3: voltar de preferencias deve retornar para inbox
- Caso 4: abrir notificacao deve navegar para destino correto

## Criterios de aceite

- Nao existe mais caminho direto sino -> configuracoes
- Back stack consistente em Android e iOS
- Badge atualizado sem inconsistencias de contagem
