# Plano de Execução Geral — MVP → Produção

## Sequência oficial
1. Fundação técnica e segurança (Lotes 001–020)
2. Produto e retenção (Lotes 021–040)
3. IA realtime e operação inteligente (Lotes 041–060)
4. Escala, economia virtual e expansão global (Lotes 061–100)

## Regra de avanço
Um lote só avança para "done" quando:
- qualidade técnica passa (`lint`, `type-check`, `workers type-check`, `build`);
- smoke tests do escopo passam;
- métricas mínimas do lote batem meta;
- documentação e changelog são atualizados.

## Critérios de priorização
- P0: segurança, pagamentos, autenticação, disponibilidade.
- P1: retenção do aluno, produtividade do personal, notificações.
- P2: diferenciais premium (IA realtime, gamificação avançada).
- P3: expansão (wallet/web3 opcional e internacionalização).

## Cadência sugerida
- 2 a 3 lotes por sprint quinzenal.
- 1 checkpoint executivo por semana.
- 1 retro técnica por sprint.

## Entregáveis obrigatórios por lote
- Escopo funcional e técnico.
- Lista de arquivos/serviços impactados.
- Plano de rollout e rollback.
- Riscos e mitigação.
- Métricas de sucesso (produto + engenharia).

## Travas de governança
- Não alterar navbar atual.
- Não alterar botão do robô (copy link).
- Não publicar feature sem telemetria mínima.
- Não publicar sem plano de rollback testado.
