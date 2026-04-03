# Governança e Checkpoints por Lote

## Status padrão
- `planned`
- `in-progress`
- `blocked`
- `validation`
- `done`

## Modelo de controle por lote
- **Owner técnico:** responsável da implementação
- **Owner produto:** responsável da regra de negócio
- **Data alvo:** início/fim
- **Dependências:** lotes anteriores necessários
- **Risco:** baixo/médio/alto
- **Resultado:** aprovado/reprovado no Go/No-Go

## Checkpoints obrigatórios
1. **Design Check**: escopo + arquitetura aprovados
2. **Build Check**: lint/type/build sem regressão
3. **Security Check**: secrets, auth, rate-limit, logs
4. **Product Check**: UX e regra de negócio aprovadas
5. **Ops Check**: observabilidade e rollback prontos

## Go/No-Go
- Go se todos os checks críticos estiverem verdes.
- No-Go se houver:
  - risco de segurança não mitigado;
  - regressão em pagamentos/auth;
  - ausência de rollback testado.

## Métricas mínimas por categoria
- Engenharia: erro de deploy, taxa de falha, latência.
- Produto: ativação, retenção 7/30 dias, engajamento.
- Suporte: volume de tickets por funcionalidade.
- Financeiro: conversão de plano, inadimplência, churn.
